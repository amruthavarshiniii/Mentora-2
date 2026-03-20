/**
 * Run once to create the faculty_signup_requests table.
 * Usage: node create-tables.mjs <DB_PASSWORD>
 *   DB_PASSWORD = your Supabase project database password
 *   (Supabase Dashboard → Settings → Database → Database password)
 */
import pg from 'pg';
const { Client } = pg;

const password = process.argv[2];
if (!password) {
  console.error('❌  Please pass your Supabase DB password as the first argument.');
  console.error('   node create-tables.mjs YOUR_DB_PASSWORD');
  process.exit(1);
}

const client = new Client({
  host: 'db.kawxrchvrfajphvxhluv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
CREATE TABLE IF NOT EXISTS public.faculty_signup_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  department  text NOT NULL,
  password    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faculty_signup_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'faculty_signup_requests' AND policyname = 'insert_anon'
  ) THEN
    EXECUTE 'CREATE POLICY insert_anon ON public.faculty_signup_requests FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'faculty_signup_requests' AND policyname = 'select_anon'
  ) THEN
    EXECUTE 'CREATE POLICY select_anon ON public.faculty_signup_requests FOR SELECT USING (true)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'faculty_signup_requests' AND policyname = 'delete_anon'
  ) THEN
    EXECUTE 'CREATE POLICY delete_anon ON public.faculty_signup_requests FOR DELETE USING (true)';
  END IF;
END $$;
`;

try {
  await client.connect();
  console.log('✅  Connected to Supabase postgres');
  await client.query(SQL);
  console.log('✅  faculty_signup_requests table created successfully!');
  console.log('🎉  You can now use the faculty signup and admin approval flow.');
} catch (err) {
  console.error('❌  Error:', err.message);
} finally {
  await client.end();
}
