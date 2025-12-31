const { supabase } = require("../supabaseClient");

async function logHSCodeUsage({ userId, ipAddress }) {
  const { error } = await supabase
    .from("hs_code_usage")
    .insert([
      {
        user_id: userId || null,
        ip_address: ipAddress,
        created_at: new Date()
      }
    ]);

  if (error) {
    console.error("Failed to log HS usage:", error);
  }
}

module.exports = { logHSCodeUsage };
