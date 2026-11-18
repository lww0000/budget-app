import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smstysgyxpcfhwatberf.supabase.co';
const supabaseKey = 'sb_publishable_yD0n3b2pl7X6b2bhwz-hRg_3Dt2HPa1';

export const supabase = createClient(supabaseUrl, supabaseKey);