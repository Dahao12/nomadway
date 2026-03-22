// Verificar se tabela partners existe
const SUPABASE_URL = "https://ymmdygfzzkpduxudsfls.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzIzMzMsImV4cCI6MjA4Njg0ODMzM30.ukQM-KDF8J4g5R9Kqhji-Fmxqv6-QMMXcHzDOD--hTw";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3MjMzMywiZXhwIjoyMDg2ODQ4MzMzfQ.UTXH90Uci9Fo8U9qKzGyd9UdGOcTvaF-daWpMWMoHe0";

async function checkTable() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/partners?select=*&limit=1`, {
      method: 'GET',
      headers: {
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    if (data.error || data.code) {
      console.log('❌ Tabela partners não existe');
      console.log('Erro:', JSON.stringify(data, null, 2));
      console.log('\nVocê precisa executar o SQL no Supabase Dashboard.');
      return false;
    }
    
    console.log('✅ Tabela partners existe!');
    console.log('Dados:', JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.log('Erro:', e.message);
    return false;
  }
}

checkTable();