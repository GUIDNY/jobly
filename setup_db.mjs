import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tfyodjqusfwqmbjgwikf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeW9kanF1c2Z3cW1iamd3aWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzODcwMSwiZXhwIjoyMDg5NjE0NzAxfQ.5oTpxM7cc8LdiFMsJmVvoqzKY1uAenZUW14yT7PQE94'
);

const PAT = 'sbp_b06d9099322deca1f901848c13d2b3b903df8f47';
const PROJECT_REF = 'tfyodjqusfwqmbjgwikf';

async function runSQL(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (data.message && data.message.includes('ERROR')) {
    console.error('SQL Error:', data.message);
  } else {
    console.log('OK:', query.slice(0, 60));
  }
  return data;
}

async function main() {
  // Create cards table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS cards (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      slug text UNIQUE NOT NULL,
      business_name text NOT NULL DEFAULT '',
      description text DEFAULT '',
      phone text DEFAULT '',
      avatar_url text DEFAULT '',
      whatsapp_message text DEFAULT 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור',
      instagram text DEFAULT '',
      facebook text DEFAULT '',
      tiktok text DEFAULT '',
      location_url text DEFAULT '',
      booking_url text DEFAULT '',
      template integer DEFAULT 1,
      primary_color text DEFAULT '#4F46E5',
      is_published boolean DEFAULT false,
      views_count integer DEFAULT 0,
      clicks_count integer DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `);

  // Create card_services table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS card_services (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
      title text NOT NULL DEFAULT '',
      description text DEFAULT '',
      image_url text DEFAULT '',
      order_index integer DEFAULT 0
    )
  `);

  // Enable RLS
  await runSQL(`ALTER TABLE cards ENABLE ROW LEVEL SECURITY`);
  await runSQL(`ALTER TABLE card_services ENABLE ROW LEVEL SECURITY`);

  // Cards RLS policies
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "cards_public_view" ON cards FOR SELECT USING (is_published = true);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "cards_owner_view" ON cards FOR SELECT USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "cards_owner_insert" ON cards FOR INSERT WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "cards_owner_update" ON cards FOR UPDATE USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "cards_owner_delete" ON cards FOR DELETE USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);

  // Card services RLS policies
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "services_public_view" ON card_services FOR SELECT USING (
        EXISTS (SELECT 1 FROM cards WHERE id = card_services.card_id AND is_published = true)
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "services_owner_view" ON card_services FOR SELECT USING (
        EXISTS (SELECT 1 FROM cards WHERE id = card_services.card_id AND user_id = auth.uid())
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "services_owner_insert" ON card_services FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM cards WHERE id = card_services.card_id AND user_id = auth.uid())
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "services_owner_update" ON card_services FOR UPDATE USING (
        EXISTS (SELECT 1 FROM cards WHERE id = card_services.card_id AND user_id = auth.uid())
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await runSQL(`
    DO $$ BEGIN
      CREATE POLICY "services_owner_delete" ON card_services FOR DELETE USING (
        EXISTS (SELECT 1 FROM cards WHERE id = card_services.card_id AND user_id = auth.uid())
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);

  // Create storage bucket for card images
  const { error: bucketError } = await supabase.storage.createBucket('card-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Bucket error:', bucketError.message);
  } else {
    console.log('OK: card-images bucket ready');
  }

  console.log('\nDatabase setup complete!');
}

main().catch(console.error);
