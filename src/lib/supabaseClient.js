// Supabase Client Configuration
// Preencha com suas credenciais do painel: https://supabase.com/dashboard
// Settings → API → Project URL e anon/public key

const supabaseUrl = "COLE_SUA_URL_SUPABASE";       // ex: https://xyzxyz.supabase.co
const supabaseAnonKey = "COLE_SUA_ANON_KEY";        // ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Lazy initialization — só cria o client quando as credenciais forem preenchidas
let _supabase = null;

export function getSupabase() {
  if (supabaseUrl.includes("COLE_SUA") || supabaseAnonKey.includes("COLE_SUA")) {
    console.warn("⚠️ Supabase não configurado. Preencha supabaseUrl e supabaseAnonKey em lib/supabaseClient.js");
    return null;
  }
  if (!_supabase) {
    // Importação dinâmica para não quebrar se o pacote não estiver instalado
    throw new Error("Instale o pacote @supabase/supabase-js para usar o Supabase. Execute: npm install @supabase/supabase-js");
  }
  return _supabase;
}

export const isSupabaseConfigured = () =>
  !supabaseUrl.includes("COLE_SUA") && !supabaseAnonKey.includes("COLE_SUA");

// Quando você preencher as credenciais acima, descomente o código abaixo
// e comente/remova as funções acima:

/*
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
*/