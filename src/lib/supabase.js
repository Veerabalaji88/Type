import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://milcniifdarheqpkfrwa.supabase.co'
const supabaseAnonKey = 'sb_publishable_Kx0wbcj6UHg76rRErTVySQ_O3IyAdGu'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
