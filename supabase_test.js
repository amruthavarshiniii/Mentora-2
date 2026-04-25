require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase
    .from('faculty_signup_requests')
    .select('*');

  if (error) {
    console.error("Error fetching faculty_signup_requests:", error);
  } else {
    console.log("Successfully fetched faculty_signup_requests:", data);
  }
}

testSupabase();
