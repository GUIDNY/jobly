import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tfyodjqusfwqmbjgwikf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeW9kanF1c2Z3cW1iamd3aWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzODcwMSwiZXhwIjoyMDg5NjE0NzAxfQ.5oTpxM7cc8LdiFMsJmVvoqzKY1uAenZUW14yT7PQE94';
const ADMIN_EMAIL = 'bd12123@gmail.com';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('🚀 מתחיל הגדרת Supabase...\n');

  // 1. Set admin
  console.log('1. מגדיר admin...');
  const { data: adminData, error: adminError } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('email', ADMIN_EMAIL)
    .select('email, is_admin');
  if (adminError) console.error('   ❌', adminError.message);
  else console.log('   ✅ admin הוגדר:', adminData);

  // 2. Create storage bucket
  console.log('\n2. יוצר storage bucket...');
  const { error: bucketError } = await supabase.storage.createBucket('bot-images', {
    public: true,
    allowedMimeTypes: ['image/*'],
    fileSizeLimit: 5242880, // 5MB
  });
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('   ❌', bucketError.message);
  } else {
    console.log('   ✅ bucket bot-images קיים/נוצר');
  }

  // 3. Check tables
  console.log('\n3. בודק טבלאות...');
  const tables = ['profiles', 'bots', 'orders'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (error) console.error(`   ❌ ${table}: ${error.message}`);
    else console.log(`   ✅ ${table} קיים`);
  }

  // 4. Check bots - publish all
  console.log('\n4. מפרסם את כל הבוטים...');
  const { data: bots, error: botsError } = await supabase
    .from('bots')
    .update({ is_published: true })
    .eq('is_published', false)
    .select('name');
  if (botsError) console.error('   ❌', botsError.message);
  else if (bots?.length) console.log(`   ✅ פורסמו ${bots.length} בוטים`);
  else console.log('   ✅ כל הבוטים כבר מפורסמים');

  console.log('\n✅ סיום!');
}

run().catch(console.error);
