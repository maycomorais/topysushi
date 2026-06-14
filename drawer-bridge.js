/**
 * drawer-bridge.js — Ponte local para Gaveta DC-335 via Ethernet
 *
 * DISTRIBUIÇÃO: este arquivo é compilado em um .exe standalone pelo build.bat.
 * O cliente final NUNCA precisa instalar Node.js.
 *
 * O IP da gaveta é configurado pela UI web (http://127.0.0.1:9091/config)
 * e persiste em %APPDATA%\GavetaBridge\config.json — sem necessidade de
 * editar código ou recompilar para cada instalação.
 */

/**
 * drawer-bridge.js — Ponte local para Gaveta via Impressora USB Compartilhada
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");
const os   = require("os");

const CONFIG_DIR  = path.join(os.homedir(), "AppData", "Roaming", "GavetaBridge");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

function lerConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE))
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch (_) {}
  return { ip: "192.168.1.200", port: 9100 }; // Mantido por compatibilidade interna
}

function salvarConfig(cfg) {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
  } catch (_) {}
}

let cfg = lerConfig();

// Comando ESC/POS bruto de abertura de gaveta (pino RJ11)
const CMD_OPEN_DRAWER = Buffer.from([0x1b, 0x70, 0x00, 0x32, 0xff]);

function enviarComandoGaveta() {
  return new Promise((resolve, reject) => {
    // Caminho do compartilhamento local da impressora USB no Windows
    const caminhoImpressora = "\\\\127.0.0.1\\caixa";

    fs.writeFile(caminhoImpressora, CMD_OPEN_DRAWER, (err) => {
      if (err) {
        console.error("Erro físico na porta USB:", err);
        return reject(new Error("Falha ao acessar impressora USB em 'caixa'. Verifique o compartilhamento."));
      }
      resolve("ok");
    });
  });
}

// Página de configuração simplificada
const HTML_CONFIG = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Gaveta Bridge — USB</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:420px;margin:60px auto;padding:0 20px;background:#f5f5f5;text-align:center}
  h2{color:#1a6e8a}
  p{color:#666;font-size:.9rem}
  button{margin-top:20px;width:100%;padding:12px;background:#1a6e8a;color:#fff;border:none;border-radius:6px;font-size:1rem;cursor:pointer}
  button:hover{background:#155e75}
  .msg{margin-top:12px;padding:10px;border-radius:6px;display:none}
  .ok{background:#d1fae5;color:#065f46}.er{background:#fee2e2;color:#991b1b}
</style>
</head>
<body>
<h2>🗄️ Gaveta Bridge (Modo USB)</h2>
<p>A impressora USB deve estar compartilhada no Windows com o nome: <b>caixa</b></p>
<button onclick="testar()">🔓 Testar abertura agora</button>
<div class="msg" id="msg"></div>
<script>
  function msg(txt,ok){const el=document.getElementById('msg');el.textContent=txt;el.className='msg '+(ok?'ok':'er');el.style.display='block';}
  function testar(){
    msg('⏳ Solicitando abertura...','ok');
    fetch('/abrir',{method:'POST'}).then(r=>r.json())
      .then(d=>msg(d.ok?'✅ Gaveta aberta!':'❌ '+d.erro,d.ok))
      .catch(e=>msg('❌ '+e.message,false));
  }
</script>
</body>
</html>`;

const BRIDGE_PORT = 9091;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML_CONFIG);
    return;
  }

  if (req.method === "POST" && req.url === "/abrir") {
    res.setHeader("Content-Type", "application/json");
    try {
      await enviarComandoGaveta();
      res.writeHead(200); res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500); res.end(JSON.stringify({ ok: false, erro: err.message }));
    }
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(BRIDGE_PORT, "127.0.0.1", () => {
  console.log("─────────────────────────────────────────────────");
  console.log(" 🗄️  Gaveta Bridge — USB ATIVO");
  console.log(" Mantenha esta janela aberta para o PDV operar.");
  console.log(" ─────────────────────────────────────────────────");
});