import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kawxrchvrfajphvxhluv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthd3hyY2h2cmZhanBodnhobHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDc3NjMsImV4cCI6MjA4OTIyMzc2M30.SQsXKm-YT0VMEslCflplP7eUA4qrPngT6v58Uh-VMvg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log("Testing faculty_login schema/data...");
  
  // 1. Fetch one row to see columns
  const { data: fetch1, error: err1 } = await supabase
    .from('faculty_login')
    .select('*')
    .limit(1);

  console.log("Fetch 1 row:");
  console.dir(fetch1, {depth: null});
  console.error("Fetch 1 error:");
  console.dir(err1, {depth: null});

  // 2. Fetch requests
  const { data: fetchReq, error: errReq } = await supabase
    .from('faculty_signup_requests')
    .select('*');

  console.log("Signup Requests:", fetchReq)
  console.error("Requests Error:", errReq);
}

testSupabase();
