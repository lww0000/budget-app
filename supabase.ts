import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vumyshjbwdjtbxzfwuma.supabase.co';
const supabaseKey = 'sb_publishable_5bczyItbQVVAARGWBgzLNA_OjgHkHe8';

export const supabase = createClient(supabaseUrl, supabaseKey);