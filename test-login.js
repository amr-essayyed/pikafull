const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'password123'
  });
  console.log('Error:', error);
  console.log('User ID:', data?.user?.id);
  
  if (data?.user?.id) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    console.log('Profile:', profile, 'Profile Error:', profileError);
  }
}

test();
