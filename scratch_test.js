require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log("Testing faculty_login schema/data...");
  
  // 1. Fetch one row to see columns
  const { data: fetch1, error: err1 } = await supabase
    .from('faculty_login')
    .select('*')
    .limit(1);

  console.log("Fetch 1 row:", fetch1, err1);

  // 2. Fetch requests
  const { data: fetchReq, error: errReq } = await supabase
    .from('faculty_signup_requests')
    .select('*');

  console.log("Signup Requests:", fetchReq, errReq);
}

testSupabase();
