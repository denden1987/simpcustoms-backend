const express = require("express");
const router = express.Router();

const { supabase } = require("../utils/supabaseClient");

// TEST SUPABASE CONNECTION
router.get("/test-db", async (req, res) => {
  try {
    // Insert test row
    const { error: insertError } = await supabase
      .from("test_connection")
      .insert([{ message: "Hello from Supabase!" }]);

    if (insertError) throw insertError;

    // Select rows
    const { data, error: selectError } = await supabase
      .from("test_connection")
      .select("*")
      .order("created_at", { ascending: false });

    if (selectError) throw selectError;

    res.json({ success: true, data });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
