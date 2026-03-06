import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gujtnhlfxzsxqkhtasks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anRuaGxmeHpzeHFraHRhc2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5OTQzNSwiZXhwIjoyMDg4MDc1NDM1fQ.dj8J94NfHMnjM2S8HB3jdR1-QE5758UO6hxVfD0uySQ'
);

const { data, error } = await supabase.auth.admin.createUser({
  email: 'testauth@justiceai.com',
  password: 'Password123!',
  email_confirm: true,
});

console.log('Supabase Auth Test Result:');
console.log('Data:', data);
console.log('Error:', error);
