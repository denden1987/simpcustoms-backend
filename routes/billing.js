const express = require("express");
const Stripe = require("stripe");
const { supabase } = require("../utils/supabaseClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ----------------------------------
   CREATE CHECKOUT SESSION (PROTECTED)
---------------------------------- */

router.post(
  "/create-checkout-session",
  requireAuth,
  async (req, res) => {
    try {
      const { priceId, planKey } = req.body;

      if (!priceId || !planKey) {
        return res.status(400).json({ error: "Missing priceId or planKey" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",

        // 🔑 AUTH → STRIPE LINK
        metadata: {
          user_id: req.user.id,
          plan_key: planKey.toLowerCase().trim(),
        },
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("❌ Checkout error:", err);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  }
);

/* ----------------------------------
   STRIPE WEBHOOK (HARDENED)
---------------------------------- */

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ SAFETY GUARD ADDED HERE
    if (
      event.type === "checkout.session.completed" &&
      event.data.object.mode === "subscription"
    ) {
      const session = event.data.object;

      const userId = session.metadata?.user_id;
      let planKey = session.metadata?.plan_key;

      if (planKey) planKey = planKey.toLowerCase().trim();

      const allowedPlans = ["starter", "business", "professional"];

      if (!userId || !allowedPlans.includes(planKey)) {
        console.warn("⚠️ Invalid metadata:", session.metadata);
        return res.json({ received: true });
      }

      const { error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan_key: planKey,
            status: "active",
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("❌ Supabase insert error:", error);
      } else {
        console.log("✅ Subscription row written");
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
