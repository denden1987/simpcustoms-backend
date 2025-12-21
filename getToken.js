require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "apitest@simpcustoms.com",
    password: "Test1234!"
  });

  if (error) {
    console.error("Login failed:", error.message);
    return;
  }

  console.log("\n✅ ACCESS TOKEN (copy this):\n");
  console.log(data.session.access_token);
})();
