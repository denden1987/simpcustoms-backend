require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

/* ----------------------------------
   GLOBAL MIDDLEWARE
---------------------------------- */

app.use(cors());

// ⚠️ Stripe webhook MUST receive raw body
app.use(
  "/api/billing/webhook",
  express.raw({ type: "application/json" })
);

// JSON parsing for ALL other routes
app.use(express.json());

/* ----------------------------------
   AUTH & PLAN MIDDLEWARE
---------------------------------- */

const { requireAuth } = require("./middleware/auth");
const { attachPlan } = require("./middleware/plan");

/* ----------------------------------
   ROUTE IMPORTS
---------------------------------- */

// AI / HS Code Classification
const classifyRoute = require("./routes/classify");

// Document Generators
const documentRoutes = require("./routes/documents");
const packingListRoutes = require("./routes/packingList");
const proFormaRoutes = require("./routes/proForma");
const creditNoteRoutes = require("./routes/creditNote");
const cooRoutes = require("./routes/certificateOfOrigin");

// Saved Profiles
const profileRoutes = require("./routes/profiles");

// Logo Upload
const logoRoutes = require("./routes/logo");

// ZIP Export
const exportRoutes = require("./routes/export");

// Stripe Billing
const billingRoutes = require("./routes/billing");

// Supabase Test Route (DEV ONLY)
const testDbRoute = require("./routes/testDbRoute");

/* ----------------------------------
   MOUNT ROUTES
---------------------------------- */

// AI (paid only)
app.use("/api/classify", classifyRoute);

// Documents
app.use("/api/documents", documentRoutes);
app.use("/api/documents", packingListRoutes);
app.use("/api/documents", proFormaRoutes);
app.use("/api/documents", creditNoteRoutes);
app.use("/api/documents", cooRoutes);

// Profiles (limited by plan)
app.use("/api/profiles", profileRoutes);

// Other features
app.use("/api/logo", logoRoutes);
app.use("/api/export", exportRoutes);

// Stripe billing
app.use("/api/billing", billingRoutes);

// DB test route (dev usage)
app.use("/api", testDbRoute);

/* ----------------------------------
   DEV-ONLY TEST ROUTES
   (HIDDEN IN PRODUCTION)
---------------------------------- */

if (process.env.NODE_ENV !== "production") {
  // 🔐 Auth test
  app.get("/api/me", requireAuth, (req, res) => {
    res.json({
      message: "Authenticated",
      user: req.user,
    });
  });

  // 💳 Plan + limits test
  app.get("/api/plan", requireAuth, attachPlan, (req, res) => {
    res.json({
      user_id: req.user.id,
      plan: req.plan,
      limits: req.limits,
      isPaid: req.isPaid,
    });
  });

  // 🧪 Generic test route
  app.post("/test", (req, res) => {
    res.json({ message: "POST received!", data: req.body });
  });
}

/* ----------------------------------
   BASIC HEALTH CHECK
---------------------------------- */

app.get("/", (req, res) => {
  res.send("SimpCustoms API is running");
});

/* ----------------------------------
   START SERVER
---------------------------------- */

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
