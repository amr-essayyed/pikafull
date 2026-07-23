const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (error || !data.user) {
    console.log('Login failed, creating new user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    });
    if (signUpError) {
      console.error('Sign up failed:', signUpError);
      return;
    }
    data.user = signUpData.user;
    data.session = signUpData.session;
  }
  
  console.log('Logged in as:', data.user.id);
  
  // Try to insert a customer
  const { data: customer, error: insertError } = await supabase
    .from('customers')
    .insert({ profile_id: data.user.id })
    .select('id')
    .single();
    
  console.log('Customer Insert Result:', customer);
  console.log('Customer Insert Error:', insertError);
}

test();
