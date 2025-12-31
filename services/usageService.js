const { supabase } = require("../supabaseClient");

exports.recordHsLookup = async (ipAddress) => {
  try {
    await supabase.from("hs_code_usage").insert([
      {
        ip_address: ipAddress,
        endpoint: "hs_classify",
      },
    ]);
  } catch (err) {
    // IMPORTANT: never block the user because of usage logging
    console.error("Failed to record HS usage:", err.message);
  }
};
