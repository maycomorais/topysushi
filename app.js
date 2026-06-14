// ==========================================
// 1. CONFIGURAÇÕES & DADOS GERAIS
// ==========================================
const FONE_LOJA = "";
const COORD_LOJA = { lat: 0, lng: 0 }; // populado do banco em verificarHorario()
let COTACAO_REAL = 1100;
let TAXA_DEBITO_BR = 1.99; // populado do banco em verificarHorario()
let TAXA_CREDITO_BR = 4.98; // populado do banco em verificarHorario()
let _cartaoBRTipo = "debito"; // toggle débito/crédito no checkout
let NOME_RESTAURANTE_APP = ""; // populado do banco em verificarHorario()
let autoConfirmTimer = null;

// DADOS DE PAGAMENTO — populados do banco em verificarHorario()
let CHAVE_PIX = "";
let NOME_PIX = "";
let DADOS_ALIAS = "";
let ALIAS_PY = "";
let QR_ALIAS_URL = ""; // URL da imagem do QR code Alias PY (carregado do banco)
let QR_PY_URL = ""; // URL opcional da imagem QR para QrPy (Tigo/Personal/Bancard)
let WHATSAPP_LOJA_APP = "";

// ── Toast notifications ────────────────────────────────────────────────────
function mostrarToast(msg, tipo = "info", duracao = 3000) {
  const cores = {
    success: "#27ae60",
    warning: "#e67e22",
    error: "#e74c3c",
    info: "#2980b9",
  };
  const t = document.createElement("div");
  t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    background:${cores[tipo] || cores.info};color:#fff;padding:10px 20px;border-radius:10px;
    font-size:0.9rem;font-weight:600;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,0.25);
    max-width:90vw;text-align:center;animation:fadeInUp .25s ease`;
  t.textContent = msg;
  if (!document.getElementById("toast-style")) {
    const s = document.createElement("style");
    s.id = "toast-style";
    s.textContent =
      "@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}";
    document.head.appendChild(s);
  }
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transition = "opacity .3s";
    setTimeout(() => t.remove(), 300);
  }, duracao);
}

function iniciarTimerAutoConfirmacao(pedidoId) {
  // 4 horas em milissegundos
  const QUATRO_HORAS = 4 * 60 * 60 * 1000;

  // Cancela timer anterior se existir
  if (autoConfirmTimer) {
    clearTimeout(autoConfirmTimer);
  }

  // Inicia novo timer
  autoConfirmTimer = setTimeout(async () => {
    console.log("⏰ 4 horas passadas, confirmando entrega automaticamente...");
    await confirmarEntregaAutomatica(pedidoId);
  }, QUATRO_HORAS);

  // Salva timestamp no localStorage para persistir entre reloads
  const agora = new Date().getTime();
  const tempoExpiracao = agora + QUATRO_HORAS;
  localStorage.setItem("autoConfirmExpiry_" + pedidoId, tempoExpiracao);

  console.log("⏰ Timer de auto-confirmação iniciado para 4 horas");
}

// ===== FUNÇÃO PARA RESTAURAR TIMER APÓS RELOAD =====
function restaurarTimerSeNecessario() {
  const pedidoId = localStorage.getItem("app_pedido_id");
  if (!pedidoId) return;

  const tempoExpiracao = localStorage.getItem("autoConfirmExpiry_" + pedidoId);
  if (!tempoExpiracao) return;

  const agora = new Date().getTime();
  const tempoRestante = parseInt(tempoExpiracao) - agora;

  if (tempoRestante > 0) {
    // Ainda há tempo restante
    console.log("⏰ Restaurando timer de auto-confirmação...");
    autoConfirmTimer = setTimeout(async () => {
      await confirmarEntregaAutomatica(pedidoId);
    }, tempoRestante);
  } else {
    // Tempo já expirou, confirmar agora
    console.log("⏰ Tempo expirado, confirmando agora...");
    confirmarEntregaAutomatica(parseInt(pedidoId));
  }
}

// ===== CONFIRMAÇÃO AUTOMÁTICA (4 HORAS) =====
async function confirmarEntregaAutomatica(pedidoId) {
  try {
    const { error } = await supa
      .from("pedidos")
      .update({
        status: "entregue",
        tempo_entregue: new Date().toISOString(),
      })
      .eq("id", parseInt(pedidoId)); // parseInt garante que não é string

    if (error) throw error;

    console.log("✅ Entrega confirmada automaticamente após 4 horas");

    // Limpa dados locais
    localStorage.removeItem("autoConfirmExpiry_" + pedidoId);
    fecharTracker();

    // Mostra notificação
    if (Notification.permission === "granted") {
      new Notification("Pedido Entregue ✅", {
        body: "Sua entrega foi confirmada automaticamente. Obrigado!",
      });
    }
  } catch (err) {
    console.error("Erro ao confirmar entrega automática:", err);
  }
}

// ===== CONFIRMAÇÃO MANUAL (CLIENTE) =====
async function confirmarEntregaCliente() {
  const pedidoId = localStorage.getItem("app_pedido_id");
  if (!pedidoId) {
    alert("Erro: Pedido não encontrado");
    return;
  }

  if (!confirm("Confirmar que você recebeu o pedido?")) {
    return;
  }

  try {
    const { error } = await supa
      .from("pedidos")
      .update({
        status: "entregue",
        tempo_entregue: new Date().toISOString(),
      })
      .eq("id", parseInt(pedidoId)); // parseInt garante tipo correto

    if (error) throw error;

    console.log("✅ Entrega confirmada pelo cliente");

    // Cancela timer automático
    if (autoConfirmTimer) {
      clearTimeout(autoConfirmTimer);
    }
    localStorage.removeItem("autoConfirmExpiry_" + pedidoId);

    // Atualiza UI
    mostrarMensagemEntregaConfirmada();

    // Fecha tracker após 3 segundos
    setTimeout(() => {
      fecharTracker();
    }, 3000);
  } catch (err) {
    console.error("Erro ao confirmar entrega:", err);
    alert("Erro ao confirmar entrega. Tente novamente.");
  }
}

// ===== MOSTRAR MENSAGEM DE CONFIRMAÇÃO =====
function mostrarMensagemEntregaConfirmada() {
  const tracker = document.getElementById("pedido-tracker");
  if (!tracker) return;

  // Atualiza conteúdo do tracker
  tracker.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <div style="font-size:3rem; margin-bottom:10px;">✅</div>
            <div style="font-weight:700; font-size:1.2rem; color:#27ae60; margin-bottom:5px;">
                Entrega Confirmada!
            </div>
            <div style="font-size:0.9rem; color:#666;">
                Obrigado pela preferência!
            </div>
        </div>
    `;
}

// ===== ATUALIZAR FUNÇÃO mostrarTracker() EXISTENTE =====
// SUBSTITUA a função mostrarTracker() por esta versão atualizada:

function mostrarTracker(status, uidPedido, motoboy = null) {
  // Usa o novo sistema de tracking (track-order-card)
  atualizarTrackingVisual(status, motoboy);

  const card = document.getElementById("track-order-card");
  if (card) card.style.display = "block";

  const tn = document.getElementById("track-numero");
  if (tn) tn.textContent = uidPedido;

  const tf = document.getElementById("track-form");
  const tr = document.getElementById("track-result");
  if (tf) tf.style.display = "none";
  if (tr) tr.style.display = "block";

  // Botão confirmar entrega se saiu para entrega
  const pedidoId = localStorage.getItem("app_pedido_id");
  if (status === "saiu_entrega" && pedidoId) {
    const tr2 = document.getElementById("track-result");
    if (tr2 && !document.getElementById("btn-confirmar-entrega")) {
      tr2.insertAdjacentHTML(
        "beforeend",
        `
                <button id="btn-confirmar-entrega" onclick="confirmarEntregaCliente()" 
                        style="width:100%; margin-top:12px; padding:12px; background:#27ae60; color:white; 
                               border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:1rem;">
                    ✅ Confirmar Recebimento
                </button>
            `,
      );
    }
    const tempoExpiracao = localStorage.getItem(
      "autoConfirmExpiry_" + pedidoId,
    );
    if (!tempoExpiracao) iniciarTimerAutoConfirmacao(pedidoId);
  }

  if (status === "entregue") {
    mostrarMensagemEntregaConfirmada();
    if (autoConfirmTimer) clearTimeout(autoConfirmTimer);
    localStorage.removeItem("autoConfirmExpiry_" + pedidoId);
  }
}

// Validação de segurança do Supabase
if (typeof supa === "undefined") {
  console.error(
    "ERRO: O arquivo supabaseClient.js não foi carregado antes do app.js",
  );
  // Não bloqueamos o app, mas avisamos no console
}

// ==========================================
// 2. ESTADO DA APLICAÇÃO (Variáveis Globais)
// ==========================================
let carrinho = [];
let freteCalculado = 0;
let freteMotoboy = 0; // Valor pago ao motoboy (da tabela de frete)
let localCliente = null;
let modoEntrega = "delivery";
let prodAtual = null,
  optAtual = null,
  qtd = 1;
let itensMontagem = {};
let cupomAplicado = null;
let EXTRAS_GLOBAIS = []; // Adicionais que aparecem em TODOS os produtos
let TABELA_FRETE = null; // Tabela de frete por faixa de km (carregada do banco)
let LIMITE_DISTANCIA_KM = null; // populado do banco em verificarHorario()

// ==========================================
// VARIÁVEIS DE CONTROLE DE HORÁRIO
// ==========================================
let LOJA_CONFIG = null; // Configurações da loja
let EXTENSAO_HORARIO_TEMP = 0; // Extensão temporária do horário (em minutos) - só para hoje
let ALERTA_15MIN_MOSTRADO = false; // Controle para não mostrar o alerta múltiplas vezes
let PROXIMO_FECHAMENTO = null; // Próximo horário de fechamento
let MODO_AGENDAMENTO = false; // Se o pedido é agendado para outra hora
let DATA_AGENDAMENTO = null; // Data/hora do agendamento

// Variável Global de Menu (Preenchida via Banco)
let MENU = {
  promocoes_do_dia: [],
  sushis_e_rolls: [],
  temakis: [],
  pratos_quentes: [],
  pokes: [],
  bebidas: [],
  upsell: [],
};

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  const overlay = document.getElementById("loading-overlay");

  // Filtro de telefone Genérico (LATAM)
  const cliTelInput = document.getElementById("cli-tel");
  if (cliTelInput) {
    cliTelInput.addEventListener("input", (e) => {
      // Remove letras e caracteres estranhos, mantendo números, espaços e traços
      e.target.value = e.target.value.replace(/[^\d\s-]/g, "");
    });
  }

  try {
    // 1. Carrega dados salvos (Nome, Tel, Último Pedido)
    carregarDadosLocal();

    // 2. Renderiza o Menu vindo do Banco de Dados
    await renderMenu();

    // 3. Verifica Horário de Funcionamento e Banner
    await verificarHorario();

    // 3b. Atualiza última compra com disponibilidade real do menu carregado
    _atualizarUltimaCompra();

    // 4. Restaura tracking se houver pedido ativo
    restaurarTrackingSeExistir();

    // Restaura timer se página foi recarregada durante entrega
    restaurarTimerSeNecessario();

    // 5. Carrega extras globais
    await carregarExtrasGlobais();
  } catch (e) {
    console.error("Erro ao inicializar app:", e);
  } finally {
    // SEMPRE oculta o overlay — independente de erros ou banco não configurado
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
      }, 300);
    }
  }
});

// Carrega os extras globais da tabela configuracoes
// (coluna extras_globais pode não existir ainda — SQL: ALTER TABLE configuracoes ADD COLUMN extras_globais JSONB DEFAULT '[]')
async function carregarExtrasGlobais() {
  try {
    const { data, error } = await supa
      .from("configuracoes")
      .select("extras_globais")
      .maybeSingle(); // nunca lança erro se não houver linha
    if (error) {
      EXTRAS_GLOBAIS = [];
      return;
    }
    EXTRAS_GLOBAIS =
      data?.extras_globais && Array.isArray(data.extras_globais)
        ? data.extras_globais
        : [];
  } catch (e) {
    EXTRAS_GLOBAIS = [];
  }
}

// ==========================================
// 4. FUNÇÕES DE BANCO DE DADOS E MENU
// ==========================================

// Verifica Horário e Atualiza Banner
async function verificarHorario() {
  const { data } = await supa.from("configuracoes").select("*").maybeSingle();
  if (!data) return;

  if (data.cotacao_real) COTACAO_REAL = data.cotacao_real;
  if (data.tabela_frete && Array.isArray(data.tabela_frete))
    TABELA_FRETE = data.tabela_frete;
  if (data.limite_distancia_km != null)
    LIMITE_DISTANCIA_KM = parseFloat(data.limite_distancia_km) || null;
  // Aplica visibilidade das formas de pagamento conforme configuração
  _aplicarFormasPagamentoCliente(data.features_ativas);
  if (data.taxa_debito != null) TAXA_DEBITO_BR = Number(data.taxa_debito);
  if (data.taxa_credito != null) TAXA_CREDITO_BR = Number(data.taxa_credito);

  // ── Dados de pagamento do banco ────────────────────────────────
  if (data.chave_pix) CHAVE_PIX = data.chave_pix;
  if (data.nome_pix) NOME_PIX = data.nome_pix;
  if (data.dados_alias) DADOS_ALIAS = data.dados_alias;
  if (data.nome_alias) ALIAS_PY = data.nome_alias;
  if (data.alias_qr_url) QR_ALIAS_URL = data.alias_qr_url;
  if (data.qr_py_url) QR_PY_URL = data.qr_py_url;
  if (data.whatsapp_loja) WHATSAPP_LOJA_APP = data.whatsapp_loja;

  const agora = new Date();
  const horaAtual = agora.getHours() * 60 + agora.getMinutes();
  // 0=Dom,1=Seg...6=Sab → mapeia para as chaves do objeto
  const diaKeys = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const diaKey = diaKeys[agora.getDay()];

  function horaParaMin(str) {
    if (!str) return null;
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }

  function turnoAtivo(turno) {
    const abre = horaParaMin(turno.abre);
    const fecha = horaParaMin(turno.fecha);
    if (abre === null || fecha === null) return false;
    // Suporte a virada de meia-noite (ex: 18:30 às 01:00)
    if (fecha < abre) return horaAtual >= abre || horaAtual < fecha;
    return horaAtual >= abre && horaAtual < fecha;
  }

  // Lógica de Aberto/Fechado usando grade semanal
  let estaAberto = false;
  if (data.loja_aberta) {
    const hs = data.horarios_semanais;
    if (hs && hs[diaKey]) {
      const diaConfig = hs[diaKey];

      // Dia explicitamente fechado na grade
      if (diaConfig.fechado) {
        estaAberto = false;
      } else {
        // Filtra turnos válidos (exclui {abre:"", fecha:""})
        const turnosValidos = (diaConfig.turnos || []).filter(
          (t) => t.abre && t.fecha,
        );

        if (turnosValidos.length > 0) {
          // Há turnos configurados → segue o horário
          estaAberto = turnosValidos.some(turnoAtivo);
        } else {
          // Dia não está fechado mas não tem horário definido → considera aberto
          estaAberto = true;
        }
      }
    } else if (hs && Object.keys(hs).length > 0) {
      // Grade existe mas não tem entrada para hoje → aberto
      estaAberto = true;
    } else {
      // Sem grade configurada → loja_aberta=true é suficiente para abrir
      estaAberto = true;
    }
  }

  const badge = document.querySelector(".badge-status");
  if (badge) {
    // Obtém o idioma atual para traduzir Aberto/Fechado
    const lang = localStorage.getItem("language") || "es";
    const textos = {
      es: { aberto: "Abierto", fechado: "Cerrado" },
      pt: { aberto: "Aberto", fechado: "Fechado" },
      en: { aberto: "Open", fechado: "Closed" },
      de: { aberto: "Geöffnet", fechado: "Geschlossen" },
    };
    const t = textos[lang] || textos.es;

    if (estaAberto) {
      badge.innerText = t.aberto;
      badge.classList.remove("closed");
      badge.classList.add("open");
    } else {
      badge.innerText = t.fechado;
      badge.classList.remove("open");
      badge.classList.add("closed");
    }
  }

  // Atualiza Banners Promocionais (banner 1 e banner 2)
  const bannerImgs = [
    document.getElementById("banner1-img") ||
      document.querySelectorAll(".banner-track img")[0],
    document.getElementById("banner2-img") ||
      document.querySelectorAll(".banner-track img")[1],
  ];

  // Banner 1
  if (data.banner_imagem && data.banner_produto_id && bannerImgs[0]) {
    bannerImgs[0].src = data.banner_imagem;
    bannerImgs[0].style.display = "block";
    bannerImgs[0].style.cursor = "pointer";
    bannerImgs[0].onclick = function () {
      clicarBanner(data.banner_produto_id);
    };
  } else if (bannerImgs[0] && !data.banner_imagem) {
    bannerImgs[0].style.display = "none";
  }

  // Banner 2
  if (data.banner2_imagem && data.banner2_produto_id && bannerImgs[1]) {
    bannerImgs[1].src = data.banner2_imagem;
    bannerImgs[1].style.display = "block";
    bannerImgs[1].style.cursor = "pointer";
    bannerImgs[1].onclick = function () {
      clicarBanner(data.banner2_produto_id);
    };
  } else if (bannerImgs[1] && !data.banner2_imagem) {
    bannerImgs[1].style.display = "none";
  }

  // Atualiza nome da loja no header
  const nomeVal = data.nome_restaurante || data.nome_loja || "";
  NOME_RESTAURANTE_APP = nomeVal; // ← torna disponível para mensagem WhatsApp
  const nomeEl = document.getElementById("nome-loja-app");
  if (nomeEl && nomeVal) {
    nomeEl.textContent = nomeVal;
    document.title = nomeVal + " — Delivery";
  }

  // Coordenadas da loja (para cálculo de frete)
  if (data.coord_lat && data.coord_lng) {
    COORD_LOJA.lat = parseFloat(data.coord_lat) || 0;
    COORD_LOJA.lng = parseFloat(data.coord_lng) || 0;
  }

  // Logo
  const logoEl = document.getElementById("logo-app");
  const logoUrl = data.logo_url || data.icone_url || "";
  if (logoEl && logoUrl) {
    logoEl.src = logoUrl;
    logoEl.style.display = "block";
    logoEl.style.objectFit = "contain";
    logoEl.style.width = "44px";
    logoEl.style.height = "44px";
    logoEl.style.borderRadius = "50%";
    logoEl.style.filter = "none";
    logoEl.style.webkitFilter = "none";
  }

  if (data.cor_primaria) {
    document.documentElement.style.setProperty("--primary", data.cor_primaria);
  }
}

// ── Auto-scroll do modal ao revelar nova seção ───────────────────────────────
// Rola a área de scroll do modal até deixar `el` visível com espaço no topo.
function _scrollModalParaElemento(el, delay = 0) {
  if (!el) return;
  const area = document.querySelector(".modal-scroll-area");
  if (!area) return;
  // Double rAF: 1º aguarda render, 2º aguarda layout/repaint completo
  const doScroll = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const areaRect = area.getBoundingClientRect();
        const elRect   = el.getBoundingClientRect();
        const offset   = elRect.top - areaRect.top + area.scrollTop - 16;
        area.scrollTo({ top: offset, behavior: "smooth" });
      });
    });
  };
  delay > 0 ? setTimeout(doScroll, delay) : doScroll();
}

// ── Filtra opções de pagamento no checkout conforme features_ativas.pagamentos ──
function _aplicarFormasPagamentoCliente(features) {
  const pags = features?.pagamentos;
  if (!pags) return; // sem config = tudo visível
  const select = document.getElementById("forma-pag");
  if (!select) return;
  Array.from(select.options).forEach((opt) => {
    if (!opt.value) return; // placeholder
    // CartaoBR é nova feature — oculta se explicitamente false
    if (opt.value === "CartaoBR") {
      opt.style.display = pags["CartaoBR"] === false ? "none" : "";
    } else if (pags[opt.value] === false) {
      opt.style.display = "none";
    } else {
      opt.style.display = "";
    }
  });
}

// Renderiza o Menu (Categories + Produtos com subcategorias)

// ── Verifica se a loja está aberta para receber pedidos agora ─────────────
// Retorna { aberto: true/false, proximoDia: string|null }
function verificarLojaAbertaParaPedido() {
  const badge = document.querySelector(".badge-status");
  const estaAberto = badge && badge.classList.contains("open");
  // Se não conseguiu determinar pelo badge, assume aberto (evita bloquear por engano)
  if (!badge) return { aberto: true, proximoDia: null };
  return { aberto: estaAberto, proximoDia: null };
}

// ── Mostra alerta quando a loja está fechada ──────────────────────────────
function mostrarAlertaLojaFechada(proximoDia) {
  const lang = localStorage.getItem("language") || "es";
  const msgs = {
    es: "El local está cerrado en este momento. Por favor intente más tarde.",
    pt: "A loja está fechada no momento. Por favor tente mais tarde.",
    en: "The store is currently closed. Please try again later.",
    de: "Das Geschäft ist derzeit geschlossen. Bitte versuchen Sie es später.",
  };
  alert(msgs[lang] || msgs.es);
}

// ── Mostra badge de agendamento no checkout ───────────────────────────────
function mostrarIndicadorAgendamento() {
  let indicador = document.getElementById("indicador-agendamento");
  if (indicador) return; // Já existe

  indicador = document.createElement("div");
  indicador.id = "indicador-agendamento";
  indicador.style.cssText = [
    "background:#fff3cd;border:1.5px solid #f0a500;border-radius:8px",
    "padding:10px 14px;font-size:0.85rem;font-weight:600;color:#856404",
    "margin-bottom:10px;display:flex;align-items:center;gap:8px",
  ].join(";");
  indicador.innerHTML = `📅 Pedido agendado${DATA_AGENDAMENTO ? ` para ${DATA_AGENDAMENTO}` : ""}`;

  const lista = document.getElementById("carrinho-lista");
  if (lista && lista.parentElement) {
    lista.parentElement.insertBefore(indicador, lista);
  }
}

async function renderMenu() {
  const nav = document.getElementById("category-nav");
  const content = document.getElementById("menu-content");

  if (!nav || !content) return;

  nav.innerHTML = "";
  content.innerHTML = "";

  // Busca Categorias, Subcategorias e Produtos ativos
  const { data: categsDb } = await supa
    .from("categorias")
    .select("*")
    .order("ordem");
  let subcatsDb = [];
  try {
    const { data: _subs } = await supa
      .from("subcategorias")
      .select("*")
      .order("categoria_slug,ordem");
    subcatsDb = _subs || [];
  } catch (_) {
    subcatsDb = [];
  }
  const { data: produtos } = await supa
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .or("somente_balcao.is.null,somente_balcao.eq.false");

  if (!produtos || !categsDb) {
    console.error(
      "Erro ao carregar menu do banco — verifique se as tabelas categorias e produtos existem.",
    );
    return;
  }

  const subcats = subcatsDb || [];

  // Monta mapa: categoria_slug -> lista de subcategorias
  const subcatPorCat = {};
  subcats.forEach((s) => {
    if (!subcatPorCat[s.categoria_slug]) subcatPorCat[s.categoria_slug] = [];
    subcatPorCat[s.categoria_slug].push(s);
  });

  // Monta mapa: subcategoria_slug -> produtos
  // Monta mapa: categoria_slug -> produtos SEM subcategoria
  const prodPorSubcat = {};
  const prodSemSubcat = {};

  produtos.forEach((p) => {
    const cat = p.categoria_slug;
    const sub = p.subcategoria_slug;
    const item = {
      id: p.id,
      nome: p.nome,
      desc: p.descricao,
      preco: p.preco,
      img: p.imagem_url,
      montagem: p.montagem_config,
      e_montavel: p.e_montavel,
      categoria_slug: cat || null, // ← necessário para filtro de bebidas no motoboy
      subcategoria_slug: sub || null,
      es_bebida: p.es_bebida || false,
    };

    if (sub) {
      if (!prodPorSubcat[sub]) prodPorSubcat[sub] = [];
      prodPorSubcat[sub].push(item);
    } else {
      if (!prodSemSubcat[cat]) prodSemSubcat[cat] = [];
      prodSemSubcat[cat].push(item);
    }

    // Mantém MENU global para compatibilidade com outros lugares do código
    if (!MENU[cat]) MENU[cat] = [];
    MENU[cat].push(item);
  });

  // Filtro de horário
  const agora = new Date();
  const minAgora = agora.getHours() * 60 + agora.getMinutes();

  function categoriaVisivel(cat) {
    if (!cat.hora_inicio || !cat.hora_fim) return true;
    const [hI, mI] = cat.hora_inicio.split(":").map(Number);
    const [hF, mF] = cat.hora_fim.split(":").map(Number);
    const inicio = hI * 60 + mI;
    const fim = hF * 60 + mF;
    if (fim < inicio) return minAgora >= inicio || minAgora <= fim;
    return minAgora >= inicio && minAgora <= fim;
  }

  function renderProdutoDiv(item) {
    const img =
      item.img || "https://cdn-icons-png.flaticon.com/512/2252/2252075.png";
    const cfg = item.montagem;
    let tipo = "padrao";
    if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
      if (cfg.__tipo) tipo = cfg.__tipo;
      else if (cfg.pizza) tipo = "pizza";
      else if (cfg.almoco) tipo = "almoco";
      else if (cfg.variacoes) tipo = "variacoes";
    }
    if (tipo === "padrao" && item.e_montavel) tipo = "montavel";
    if (tipo === "padrao" && Array.isArray(cfg) && cfg.length > 0)
      tipo = "montavel";

    let precoLabel = `Gs ${item.preco.toLocaleString("es-PY")}`;
    if (
      tipo === "variacoes" &&
      cfg &&
      cfg.variacoes &&
      cfg.variacoes.length > 0
    ) {
      const precos = cfg.variacoes
        .map((v) => v.preco || 0)
        .filter((p) => p > 0);
      if (precos.length > 0) {
        const min = Math.min(...precos);
        precoLabel = `<span style="font-size:0.72rem;font-weight:500;opacity:0.7">A partir de</span> Gs ${min.toLocaleString("es-PY")}`;
      }
    }
    if (
      tipo === "pizza" &&
      cfg &&
      (cfg.tamanhos || cfg.pizza?.tamanhos) &&
      (cfg.tamanhos || cfg.pizza?.tamanhos).length > 0
    ) {
      const tamanhos = cfg.tamanhos || cfg.pizza?.tamanhos || [];
      const precos = tamanhos.map((t) => t.preco || 0).filter((p) => p > 0);
      if (precos.length > 0) {
        const min = Math.min(...precos);
        precoLabel = `<span style="font-size:0.72rem;font-weight:500;opacity:0.7">A partir de</span> Gs ${min.toLocaleString("es-PY")}`;
      }
    }

    const div = document.createElement("div");
    div.className = "product-item";
    div.onclick = function () {
      abrirModal(item);
    };
    div.innerHTML = `
        <div class="prod-info">
            <div class="prod-title">${item.nome}</div>
            <div class="prod-desc">${item.desc || ""}</div>
            <div class="prod-price">${precoLabel}</div>
        </div>
        <img src="${img}" class="prod-img">
    `;
    return div;
  }

  // Constrói o HTML por categoria
  categsDb.forEach((cat) => {
    if (!categoriaVisivel(cat)) return;
    const key = cat.slug;
    const todosOsProdutos = MENU[key];
    if (!todosOsProdutos || todosOsProdutos.length === 0) return;

    // Pill de navegação
    const pill = document.createElement("button");
    pill.className = "cat-pill";
    pill.innerText = cat.nome_exibicao;
    pill.onclick = () => {
      document
        .querySelectorAll(".cat-pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      document
        .getElementById(key)
        .scrollIntoView({ behavior: "smooth", block: "start" });
    };
    nav.appendChild(pill);

    // Seção da categoria
    const section = document.createElement("section");
    section.id = key;
    section.innerHTML = `<h2 class="section-title">${cat.nome_exibicao}</h2>`;

    const subcatsDessaCat = subcatPorCat[key] || [];
    const temSubcats = subcatsDessaCat.length > 0;

    if (!temSubcats) {
      // Sem subcategorias: renderiza tudo direto
      (prodSemSubcat[key] || [])
        .concat(
          Object.keys(prodPorSubcat)
            .filter((k) =>
              subcats.find((s) => s.slug === k && s.categoria_slug === key),
            )
            .flatMap((k) => prodPorSubcat[k] || []),
        )
        .forEach((item) => section.appendChild(renderProdutoDiv(item)));
    } else {
      // Produtos sem subcategoria (aparecem primeiro, sem título de grupo)
      const semSub = prodSemSubcat[key] || [];
      semSub.forEach((item) => section.appendChild(renderProdutoDiv(item)));

      // Grupos por subcategoria
      subcatsDessaCat.forEach((subcat) => {
        const itensSub = prodPorSubcat[subcat.slug] || [];
        if (itensSub.length === 0) return; // Oculta subcategoria vazia

        const subtitulo = document.createElement("div");
        subtitulo.className = "subcat-title";
        subtitulo.innerText = subcat.nome_exibicao;
        section.appendChild(subtitulo);

        itensSub.forEach((item) => section.appendChild(renderProdutoDiv(item)));
      });
    }

    content.appendChild(section);
  });
}

// ==========================================
// 5. MODAL DE PRODUTO (multi-builder)
// ==========================================

// Variáveis de estado do modal
let _pizzaConfig = {
  tamanhoSelecionado: null,
  bordaSelecionada: false,
  tipoSelecionado: null,
  sabores: [],
};

// ─── Estado dos builders de shake / sorvete / açaí / suco ────
let _shakeConfig  = { tamanho: null, sabor: null };
let _sorveteConfig = { tamanho: null, sabores: [], etapasSel: {} };
let _acaiConfig   = { tamanho: null, etapasSel: {}, variacao: null };
let _sucoConfig   = { tamanho: null, etapasSel: {} };
let _comboFechadoConfig = {
  limite: 0,       // limite_total do montagem_config
  sabores: [],     // array de { id, nome }
  selecao: {},     // { [id]: quantidade }
};

function abrirModal(item) {
  prodAtual = item;
  qtd = 1;
  itensMontagem = {};
  _pizzaConfig = {
    p: null,
    tamanhoSelecionado: null,
    numSabores: null,
    sabores: [],
    bordaConfig: null,
  };
  _shakeConfig   = { tamanho: null, sabor: null };
  _sorveteConfig = { tamanho: null, sabores: [], etapasSel: {} };
  _acaiConfig    = { tamanho: null, etapasSel: {}, variacao: null };
  _sucoConfig    = { tamanho: null, etapasSel: {} };
  _comboFechadoConfig = { limite: 0, sabores: [], selecao: {} };

  document.getElementById("modal-title").innerText = item.nome;
  document.getElementById("modal-desc").innerText = item.desc || "";
  document.getElementById("modal-obs").value = "";
  document.getElementById("modal-qty").innerText = qtd;

  const divOptions = document.getElementById("modal-options");
  const divMontagem = document.getElementById("modal-montagem");
  divOptions.innerHTML = "";
  divMontagem.innerHTML = "";
  divMontagem.style.display = "none";

  // Detecta tipo do produto
  const cfg = item.montagem; // montagem_config do banco
  let tipo = "padrao";
  if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
    if (cfg.__tipo) tipo = cfg.__tipo;
    else if (cfg.pizza) tipo = "pizza";
    else if (cfg.almoco) tipo = "almoco";
    else if (cfg.variacoes) tipo = "variacoes";
  }
  if (tipo === "padrao" && item.e_montavel) tipo = "montavel";
  if (tipo === "padrao" && Array.isArray(cfg) && cfg.length > 0)
    tipo = "montavel";

  if (tipo === "montavel") {
    _renderMontavel(item, cfg, divOptions);
  } else if (tipo === "pizza") {
    _renderPizza(cfg, divOptions);
  } else if (tipo === "almoco") {
    _renderAlmoco(cfg, divOptions);
  } else if (tipo === "variacoes") {
    _renderVariacoes(item, cfg, divOptions);
  } else if (tipo === "shake") {
    _renderShake(cfg, divOptions);
  } else if (tipo === "sorvete") {
    _renderSorvete(cfg, divOptions);
  } else if (tipo === "acai") {
    _renderAcai(cfg, divOptions);
  } else if (tipo === "suco") {
    _renderSuco(cfg, divOptions);
  } else if (tipo === "combo_fechado") {
    _renderComboFechado(cfg, divOptions);
  }


  // Extras do produto específico
  const extras = cfg && cfg.extras ? cfg.extras : null;
  if (extras && extras.length > 0) {
    _renderExtras(extras, divOptions);
  }

  // Opções de preparo (ex: "Batata Frita / Mandioca", "Cru / Flambado")
  const preparoOpcoes = cfg && cfg.preparo_opcoes ? cfg.preparo_opcoes : [];
  if (preparoOpcoes.length > 0) {
    _renderPreparo(preparoOpcoes, divOptions);
  }

  // Extras globais (adicionais disponíveis para TODOS os produtos)
  if (EXTRAS_GLOBAIS.length > 0) {
    _renderExtrasGlobais(EXTRAS_GLOBAIS, divOptions);
  }

  // Atualiza preço inicial
  _atualizarPrecoPizza();
  document.getElementById("product-modal").classList.add("active");
}

function _renderMontavel(item, cfg, container) {
  const etapas = Array.isArray(cfg) ? cfg : cfg && cfg.etapas ? cfg.etapas : [];
  etapas.forEach((etapa, idxEtapa) => {
    const h4 = document.createElement("h4");
    h4.innerText = `${etapa.titulo} (Máx: ${etapa.max})`;
    h4.style.cssText = "margin-top:10px; font-size:0.95rem; color:#555;";
    container.appendChild(h4);

    etapa.itens.forEach((ingrediente) => {
      const label = document.createElement("label");
      label.style.cssText =
        "display:block; padding:7px 10px; margin-bottom:3px; border:1px solid #eee; border-radius:8px; cursor:pointer;";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = ingrediente;
      input.style.marginRight = "8px";
      input.onchange = () => {
        if (!itensMontagem[idxEtapa]) itensMontagem[idxEtapa] = [];
        if (input.checked) {
          if (itensMontagem[idxEtapa].length < etapa.max) {
            itensMontagem[idxEtapa].push(ingrediente);
          } else {
            alert(`Máximo: ${etapa.max} itens para "${etapa.titulo}"`);
            input.checked = false;
          }
        } else {
          const idx = itensMontagem[idxEtapa].indexOf(ingrediente);
          if (idx > -1) itensMontagem[idxEtapa].splice(idx, 1);
        }
      };
      label.appendChild(input);
      label.appendChild(document.createTextNode(ingrediente));
      container.appendChild(label);
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  🍕 PIZZA BUILDER — UX completo (passo a passo)
//  Estado global da pizza:
//  _pizzaConfig = {
//    p:                 cfg.pizza (referência),
//    tamanhoSelecionado: { nome, fatias, cm, preco },
//    numSabores:        1|2|3|4 (escolhido pelo cliente),
//    sabores:           [{ nome, preco }],   // array com sabores escolhidos
//    bordaConfig:       null | { nome, preco }
//  }
// ═══════════════════════════════════════════════════════════

function _renderPizza(cfg, container) {
  if (!cfg) return;
  // Suporta ambos: cfg.pizza (estrutura nova) ou cfg direto (estrutura antigos do BD)
  const p = cfg.pizza || cfg;
  if (!p.tamanhos) return; // Valida que tem tamanhos
  _pizzaConfig.p = p;

  /* ── PASSO 1: Tamanho ─────────────────────────────── */
  const secTam = document.createElement("section");
  secTam.className = "pizza-step";
  secTam.innerHTML = `
    <div class="pizza-step-header">
      <span class="pizza-step-num">1</span>
      <span>Escolha o tamanho</span>
    </div>
    <div class="pizza-size-grid" id="pizza-size-grid"></div>`;
  container.appendChild(secTam);

  const sizeGrid = secTam.querySelector("#pizza-size-grid");
  (p.tamanhos || []).forEach((tam) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "pizza-size-card";
    card.dataset.nome = tam.nome;
    card.innerHTML = `
      <div class="pizza-size-name">${tam.nome}</div>
      <div class="pizza-size-info">${tam.fatias} fatias</div>
      <div class="pizza-size-info">⌀ ${tam.cm}cm</div>
      <div class="pizza-size-price">Gs ${(tam.preco || 0).toLocaleString("es-PY")}</div>`;
    card.onclick = () => {
      sizeGrid
        .querySelectorAll(".pizza-size-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      _pizzaConfig.tamanhoSelecionado = tam;
      _revelarPasso2(p, container);
      _atualizarPrecoPizza();
    };
    sizeGrid.appendChild(card);
  });

  /* ── Passos 2, 3, 4 aparecerão progressivamente ─── */
  const passo2 = document.createElement("div");
  passo2.id = "pizza-passo2";
  passo2.style.display = "none";
  container.appendChild(passo2);

  const passo3 = document.createElement("div");
  passo3.id = "pizza-passo3";
  passo3.style.display = "none";
  container.appendChild(passo3);

  const passo4 = document.createElement("div");
  passo4.id = "pizza-passo4";
  passo4.style.display = "none";
  container.appendChild(passo4);
}

/* Passo 2: Quantos sabores? */
function _revelarPasso2(p, container) {
  const passo2 =
    container.querySelector("#pizza-passo2") ||
    document.getElementById("pizza-passo2");
  if (!passo2) return;
  _pizzaConfig.numSabores = null;
  _pizzaConfig.sabores = [];

  const maxLoja = _pizzaConfig.tamanhoSelecionado?.max_sabores || p.max_sabores || 1;
  const opcoes = Array.from({ length: maxLoja }, (_, i) => i + 1);
  const labels = {
    1: "Inteira",
    2: "Meia a Meia",
    3: "3 Sabores",
    4: "4 Sabores",
  };

  passo2.innerHTML = `
    <section class="pizza-step">
      <div class="pizza-step-header">
        <span class="pizza-step-num">2</span>
        <span>Quantos sabores?</span>
      </div>
      <div class="pizza-divisao-grid">
        ${opcoes
          .map(
            (n) => `
          <button type="button" class="pizza-divisao-btn" data-n="${n}" onclick="_selecionarDivisao(${n})">
            <div class="pizza-divisao-icone">${_iconePizza(n)}</div>
            <div class="pizza-divisao-nome">${labels[n] || n + " Sabores"}</div>
          </button>`,
          )
          .join("")}
      </div>
    </section>`;
  passo2.style.display = "block";
  _scrollModalParaElemento(passo2);
  // Esconde passos seguintes ao reeditar
  const p3 =
    container.querySelector("#pizza-passo3") ||
    document.getElementById("pizza-passo3");
  const p4 =
    container.querySelector("#pizza-passo4") ||
    document.getElementById("pizza-passo4");
  if (p3) {
    p3.innerHTML = "";
    p3.style.display = "none";
  }
  if (p4) {
    p4.innerHTML = "";
    p4.style.display = "none";
  }
}

function _iconePizza(n) {
  const icons = { 1: "🍕", 2: "🍕🍕", 3: "🍕🍕🍕", 4: "🍕🍕🍕🍕" };
  return icons[n] || "🍕";
}

/* Passo 3: Escolher sabores */
function _selecionarDivisao(n) {
  _pizzaConfig.numSabores = n;
  _pizzaConfig.sabores = new Array(n).fill(null);

  // Destaca botão selecionado
  document.querySelectorAll(".pizza-divisao-btn").forEach((b) => {
    b.classList.toggle("selected", parseInt(b.dataset.n) === n);
  });

  const p3 = document.getElementById("pizza-passo3");
  if (!p3) return;
  const p = _pizzaConfig.p;

  // Filtra sabores pelo tipo (Salgada/Doce) se definido
  const saboresFiltrados = (p.sabores || []).filter(
    (s) => !s.tipo || !p.tipos || p.tipos.length <= 1,
  );

  // Gera HTML para escolha de cada slot de sabor
  let html = `<section class="pizza-step">
    <div class="pizza-step-header">
      <span class="pizza-step-num">3</span>
      <span>Escolha ${n === 1 ? "o sabor" : `os ${n} sabores`}</span>
    </div>
    <p class="pizza-step-hint">
      ${n > 1 ? `Selecione ${n} sabores — um por slot.` : ""}
    </p>`;

  for (let slot = 0; slot < n; slot++) {
    const fracLabel = n === 1 ? '' : `<span class="pizza-fracao-badge">${slot + 1}/${n}</span>`;
    html += `
    <div class="pizza-slot-header">
      ${fracLabel}
      <span class="pizza-slot-label">${n === 1 ? 'Sabor' : `${slot + 1}º sabor`}</span>
    </div>
    <div class="pizza-sabores-lista" id="pizza-slot-${slot}">
      ${saboresFiltrados.map((s) => {
        const sfEsc = (s.nome || '').replace(/'/g, "\\'");
        const tipoEsc = (s.tipo || '').replace(/'/g, "\\'");

        // ── Badge de tipo (igual referência) ──────────────────────
        const tipoLower = (s.tipo || '').toLowerCase().replace(/\s+/g, '-');
        const tipoBadgeMap = {
          'especial':      '⭐ Especial',
          'premium':       '💎 Premium',
          'doce-premium':  '🎂 Doce Premium',
          'doce':          '🍫 Doce',
          'vegano':        '🌱 Vegano',
          'picante':       '🌶️ Picante',
        };
        const tipoBadgeClass = tipoLower
          ? `tipo-${tipoLower.replace(/\s/g,'-').replace(/[^a-z-]/g,'')}`
          : '';
        const tipoBadgeLabel = tipoBadgeMap[tipoLower] || (s.tipo || '');
        const tipoBadge = s.tipo
          ? `<span class="pizza-sabor-tipo-badge ${tipoBadgeClass}">${tipoBadgeLabel}</span>`
          : '';

        // ── Preço diferencial vs. o tipo mais barato do tamanho ──
        // Mostra "+Gs X.XXX" só quando há diferença de preço entre tipos
        const tamAtual = _pizzaConfig.tamanhoSelecionado;
        const precoEste  = tamAtual ? _precoPizzaPorTipo(tamAtual, s.tipo) : 0;
        const precoBase  = tamAtual ? _precoBasePorTipo(tamAtual) : 0;
        const precoDiff  = precoEste - precoBase;
        const precoLabel = precoDiff > 0
          ? `<div class="pizza-sabor-preco">+ Gs ${precoDiff.toLocaleString('es-PY')}</div>`
          : '';

        // ── Descrição ─────────────────────────────────────────────
        const descHtml = s.desc ? `<div class="pizza-sabor-desc">${s.desc}</div>` : '';

        return `<button type="button" class="pizza-sabor-item"
            data-slot="${slot}" data-nome="${s.nome}" data-tipo="${tipoEsc}"
            onclick="_selecionarSaborSlot(${slot}, '${sfEsc}', 0, this, '${tipoEsc}')">
          ${s.img
            ? `<img src="${s.img}" class="pizza-sabor-img" alt="${s.nome}" onerror="this.style.display='none'" loading="lazy">`
            : `<div class="pizza-sabor-emoji">🍕</div>`}
          <div class="pizza-sabor-info">
            <div class="pizza-sabor-nome">${s.nome}</div>
            ${descHtml}
            ${precoLabel}
          </div>
          ${tipoBadge}
        </button>`;
      }).join('')}
    </div>`;
  }
  html += `</section>`;

  p3.innerHTML = html;
  p3.style.display = "block";
  _scrollModalParaElemento(p3);

  // Borda aparece depois
  const p4 = document.getElementById("pizza-passo4");
  if (p4) {
    p4.innerHTML = "";
    p4.style.display = "none";
  }
  _atualizarPrecoPizza();
}

function _selecionarSaborSlot(slot, nome, preco, el, tipo) {
  tipo = tipo || el?.dataset?.tipo || '';
  // Desmarca outros no mesmo slot
  const lista = document.getElementById(`pizza-slot-${slot}`);
  if (lista) lista.querySelectorAll('.pizza-sabor-item').forEach((b) => {
    b.classList.remove('selected');
    b.querySelector('.pizza-fracao-tag')?.remove();
  });

  el.classList.add('selected');
  const n = _pizzaConfig.numSabores || 1;
  const tag = document.createElement('span');
  tag.className = 'pizza-fracao-tag';
  tag.textContent = n > 1 ? `${slot + 1}/${n}` : '✓';
  el.appendChild(tag);

  // Salva tipo para cálculo correto de preço por tipo
  _pizzaConfig.sabores[slot] = { nome, preco: 0, tipo };

  const cheios = _pizzaConfig.sabores.filter(Boolean).length;
  if (cheios >= n) {
    _revelarPasso4Borda();
    // Scroll para a borda após ela ser inserida no DOM
    setTimeout(() => {
      const p4 = document.getElementById("pizza-passo4");
      if (p4) _scrollModalParaElemento(p4);
    }, 60);
  } else {
    // Scroll para o próximo slot com pequeno delay para o layout estabilizar
    setTimeout(() => {
      const header = document.querySelector(`#pizza-slot-${slot + 1}`)
                              ?.closest(".pizza-sabores-lista")
                              ?.previousElementSibling; // .pizza-slot-header
      const alvo = header || document.getElementById(`pizza-slot-${slot + 1}`);
      if (alvo) _scrollModalParaElemento(alvo);
    }, 60);
  }
  _atualizarPrecoPizza();
  _atualizarResumo();
}

/* Passo 4: Borda */
function _revelarPasso4Borda() {
  const p = _pizzaConfig.p;
  const p4 = document.getElementById("pizza-passo4");
  if (!p4) return;

  // Monta opções de borda
  const bordasOpcoes =
    p.bordas && p.bordas.length > 0
      ? p.bordas
      : p.tem_borda
        ? [{ nome: "Borda Recheada", preco: p.borda_preco || 0 }]
        : [];

  p4.innerHTML = `<section class="pizza-step">
    <div class="pizza-step-header">
      <span class="pizza-step-num">4</span>
      <span>Borda recheada?</span>
    </div>
    <div class="pizza-opt-row">
      <button type="button" class="pizza-opt-chip selected" id="borda-nao" onclick="_pizzaSelecionarBorda(null)">
        Sem borda
      </button>
      ${bordasOpcoes
        .map(
          (b) => `
        <button type="button" class="pizza-opt-chip" onclick="_pizzaSelecionarBorda('${b.nome.replace(/'/g, "\\'")}', ${b.preco || 0}, this)">
          🧀 ${b.nome} <span style="font-size:0.75rem;opacity:0.85">+Gs ${(b.preco || 0).toLocaleString("es-PY")}</span>
        </button>`,
        )
        .join("")}
    </div>
  </section>`;
  p4.style.display = "block";
  _scrollModalParaElemento(p4);
}

function _pizzaSelecionarBorda(nome, preco, el) {
  document
    .querySelectorAll("#pizza-passo4 .pizza-opt-chip")
    .forEach((c) => c.classList.remove("selected"));
  if (el) el.classList.add("selected");
  else document.getElementById("borda-nao")?.classList.add("selected");
  _pizzaConfig.bordaConfig = nome ? { nome, preco } : null;
  _atualizarPrecoPizza();
  _atualizarResumo();
}

// compatibilidade
function _selecionarBorda(com) {
  _pizzaSelecionarBorda(
    com ? "Borda Recheada" : null,
    _pizzaConfig.p?.borda_preco || 0,
    null,
  );
}

/* Resumo em tempo real */
function _atualizarResumo() {
  const el = document.getElementById("pizza-resumo");
  if (!el) return;
  const saboresOk = (_pizzaConfig.sabores || []).filter(Boolean);
  if (saboresOk.length === 0) { el.style.display = "none"; return; }

  const tipoIcons = {
    "tradicional": "🍕", "salgada": "🍕", "especial": "⭐",
    "premium": "💎", "doce premium": "🎂", "doce": "🍫",
    "vegano": "🌱", "picante": "🌶️",
  };
  const n          = _pizzaConfig.numSabores || 1;
  const tam        = _pizzaConfig.tamanhoSelecionado;
  const precoBase  = _calcularBasePizza(tam, saboresOk);
  const precoBorda = _pizzaConfig.bordaConfig?.preco || 0;

  const linhasSabores = saboresOk.map((s, i) => {
    const tl   = (s.tipo || "").toLowerCase();
    const icon = tipoIcons[tl] || "🍕";
    const tipoTag = s.tipo
      ? ` <span style="font-size:.75em;opacity:.65">(${s.tipo})</span>`
      : "";
    return `<div class="pizza-resumo-linha">
      <span>${n > 1 ? `${i+1}/${n} Sabor` : "Sabor"}</span>
      <span>${icon} ${s.nome}${tipoTag}</span>
    </div>`;
  }).join("");

  const notaPreco = n > 1 && saboresOk.some(s => s.tipo)
    ? `<div style="font-size:.68rem;color:#888;padding:4px 14px;background:#fffbf0">
         ★ Prevalece o preço do tipo mais caro
       </div>`
    : "";

  el.style.display = "block";
  el.innerHTML = `
    <div class="pizza-resumo-header">🍕 Resumo da sua pizza</div>
    ${tam ? `<div class="pizza-resumo-linha"><span>Tamanho</span><span>${tam.nome}${tam.fatias ? ` (${tam.fatias} fatias · ⌀${tam.cm}cm)` : ""}</span></div>` : ""}
    ${linhasSabores}
    ${_pizzaConfig.bordaConfig ? `<div class="pizza-resumo-linha"><span>Borda</span><span>${_pizzaConfig.bordaConfig.nome}</span></div>` : ""}
    ${notaPreco}
    <div class="pizza-resumo-total"><span>Total</span><span>Gs ${((precoBase + precoBorda) * (qtd || 1)).toLocaleString("es-PY")}</span></div>`;
}

// ══════════════════════════════════════════════════════════
//  Pizza: preço por tipo de sabor
//  Schema do projeto: tam.precos = { "Tradicional": 50000, "Especial": 60000, ... }
//  Fallback: tam.preco (mínimo calculado no save)
// ══════════════════════════════════════════════════════════
function _precoPizzaPorTipo(tam, tipo) {
  if (!tam) return 0;
  // tam.precos é o mapa tipo→preço salvo pelo admin
  const precos = tam.precos || {};
  // Tenta exato primeiro, depois case-insensitive
  if (tipo && precos[tipo] > 0) return precos[tipo];
  if (tipo) {
    const chave = Object.keys(precos).find(k => k.toLowerCase() === tipo.toLowerCase());
    if (chave && precos[chave] > 0) return precos[chave];
  }
  // Fallback: preco mínimo do tamanho
  return tam.preco || 0;
}

// Retorna o preço base da pizza = máximo entre os tipos dos sabores selecionados
// (regra do sabor mais caro prevalecer na pizza dividida)
function _calcularBasePizza(tam, saboresOk) {
  if (!tam || saboresOk.length === 0) return tam ? (tam.preco || 0) : 0;
  return Math.max(...saboresOk.map(s => _precoPizzaPorTipo(tam, s.tipo)));
}

// Preço mais barato entre todos os tipos disponíveis neste tamanho
// (usado para calcular diferencial a exibir no card de cada sabor)
function _precoBasePorTipo(tam) {
  if (!tam) return 0;
  const precos = tam.precos || {};
  const vals = Object.values(precos).filter(v => v > 0);
  return vals.length ? Math.min(...vals) : (tam.preco || 0);
}

function _renderComboFechado(cfg, container) {
  if (!cfg || cfg.__tipo !== "combo_fechado") return;
 
  const limite = cfg.limite_total || 0;
  const sabores = cfg.sabores || [];
 
  // Inicializa estado global
  _comboFechadoConfig.limite  = limite;
  _comboFechadoConfig.sabores = sabores;
  _comboFechadoConfig.selecao = {};
  sabores.forEach((s) => (_comboFechadoConfig.selecao[s.id] = 0));
 
  // ── Wrapper principal ──────────────────────────────────────
  const wrap = document.createElement("div");
  wrap.style.cssText = "padding:4px 0";
 
  // Instrução
  const instrucao = document.createElement("p");
  instrucao.style.cssText =
    "font-size:0.85rem;color:#64748b;margin:0 0 12px;line-height:1.45";
  instrucao.textContent = `Distribua ${limite} ${limite === 1 ? "item" : "itens"} entre os sabores disponíveis.`;
  wrap.appendChild(instrucao);
 
  // ── Contador global ────────────────────────────────────────
  const contador = document.createElement("div");
  contador.id = "combo-contador";
  contador.style.cssText =
    "font-size:0.85rem;font-weight:600;color:#475569;text-align:center;" +
    "padding:8px 12px;background:#f8fafc;border:1.5px solid #e2e8f0;" +
    "border-radius:8px;margin-bottom:12px;transition:background .2s,color .2s,border-color .2s";
  contador.textContent = `0 / ${limite} selecionados`;
  wrap.appendChild(contador);
 
  // ── Lista de sabores ───────────────────────────────────────
  const lista = document.createElement("div");
  lista.style.cssText =
    "border:1px solid #f1f5f9;border-radius:10px;overflow:hidden";
 
  sabores.forEach((sabor) => {
    const row = document.createElement("div");
    row.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;" +
      "gap:12px;padding:11px 14px;border-bottom:1px solid #f1f5f9;background:#fff";
 
    // Nome do sabor
    const nome = document.createElement("span");
    nome.textContent = sabor.nome;
    nome.style.cssText = "flex:1;font-size:0.95rem;color:#1e293b;font-weight:500";
 
    // Stepper
    const stepper = document.createElement("div");
    stepper.style.cssText =
      "display:flex;align-items:center;gap:0;border:1.5px solid #e5e7eb;" +
      "border-radius:8px;overflow:hidden;flex-shrink:0";
 
    const btnDec = document.createElement("button");
    btnDec.type    = "button";
    btnDec.dataset.btnDec = sabor.id;
    btnDec.textContent = "−";
    btnDec.style.cssText =
      "width:34px;height:34px;background:#f8fafc;border:none;font-size:1.1rem;" +
      "font-weight:700;cursor:pointer;color:#374151;line-height:1";
    btnDec.disabled = true;
    btnDec.onclick  = () => _cfDecrementar(sabor.id);
 
    const qty = document.createElement("span");
    qty.id = "cf-qty-" + sabor.id;
    qty.textContent = "0";
    qty.style.cssText =
      "min-width:36px;text-align:center;font-size:0.95rem;font-weight:700;" +
      "color:#1e293b;padding:0 4px;background:#fff;" +
      "border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;line-height:34px";
 
    const btnInc = document.createElement("button");
    btnInc.type    = "button";
    btnInc.dataset.btnInc = sabor.id;
    btnInc.textContent = "+";
    btnInc.style.cssText =
      "width:34px;height:34px;background:#f8fafc;border:none;font-size:1.1rem;" +
      "font-weight:700;cursor:pointer;color:#374151;line-height:1";
    btnInc.onclick = () => _cfIncrementar(sabor.id);
 
    stepper.appendChild(btnDec);
    stepper.appendChild(qty);
    stepper.appendChild(btnInc);
 
    row.appendChild(nome);
    row.appendChild(stepper);
    lista.appendChild(row);
  });
 
  // Remove borda inferior do último item
  const lastRow = lista.lastElementChild;
  if (lastRow) lastRow.style.borderBottom = "none";
 
  wrap.appendChild(lista);
  container.appendChild(wrap);
 
  // Desabilita o botão "Adicionar" do modal até completar a seleção
  _cfAtualizarUI();
}

/* Incrementa a quantidade de um sabor */
function _cfIncrementar(id) {
  const sel   = _comboFechadoConfig.selecao;
  const total = Object.values(sel).reduce((a, b) => a + b, 0);
  if (total >= _comboFechadoConfig.limite) return;
  if (!(id in sel)) return;
  sel[id]++;
  _cfAtualizarUI();
}

/* Decrementa a quantidade de um sabor */
function _cfDecrementar(id) {
  const sel = _comboFechadoConfig.selecao;
  if (!(id in sel) || sel[id] <= 0) return;
  sel[id]--;
  _cfAtualizarUI();
}

/* Sincroniza toda a UI do combo fechado */
function _cfAtualizarUI() {
  const sel    = _comboFechadoConfig.selecao;
  const limite = _comboFechadoConfig.limite;
  const total  = Object.values(sel).reduce((a, b) => a + b, 0);
  const cheio  = total >= limite;
  const exato  = total === limite;

  Object.entries(sel).forEach(([id, qty]) => {
    const el = document.getElementById("cf-qty-" + id);
    if (el) el.textContent = qty;
  });

  const contador = document.getElementById("combo-contador");
  if (contador) {
    contador.textContent = `${total} / ${limite} selecionados`;
    if (exato) {
      contador.style.background  = "#f0fdf4";
      contador.style.borderColor = "#86efac";
      contador.style.color       = "#166534";
    } else {
      contador.style.background  = "#f8fafc";
      contador.style.borderColor = "#e2e8f0";
      contador.style.color       = "#475569";
    }
  }

  document.querySelectorAll("[data-btn-inc]").forEach((btn) => {
    btn.disabled = cheio;
    btn.style.color  = cheio ? "#cbd5e1" : "#374151";
    btn.style.cursor = cheio ? "not-allowed" : "pointer";
  });

  document.querySelectorAll("[data-btn-dec]").forEach((btn) => {
    const id  = btn.dataset.btnDec;
    const qty = sel[id] || 0;
    btn.disabled = qty <= 0;
    btn.style.color  = qty <= 0 ? "#cbd5e1" : "#374151";
    btn.style.cursor = qty <= 0 ? "not-allowed" : "pointer";
  });

  const btnAdd = document.querySelector(".btn-add");
  if (btnAdd) {
    btnAdd.disabled      = !exato;
    btnAdd.style.opacity = exato ? "1" : "0.45";
    btnAdd.style.cursor  = exato ? "pointer" : "not-allowed";
  }
}

function _atualizarPrecoPizza() {
  const cfg = prodAtual?.montagem;

  // Sempre soma extras (válido para qualquer tipo de produto)
  let extrasTotal = 0;
  document.querySelectorAll(".extra-check-input:checked").forEach((cb) => {
    extrasTotal += parseInt(cb.dataset.preco || 0);
  });

  // Tipo variações: preço controlado pelo click na variação
  const tipo = cfg && !Array.isArray(cfg) && cfg.__tipo ? cfg.__tipo : "padrao";
  if (tipo === "variacoes") {
    const base = _variacaoSelecionada
      ? _variacaoSelecionada.preco || 0
      : prodAtual?.preco || 0;
    const total = (base + extrasTotal) * qtd;
    document.getElementById("modal-price").innerText =
      `Gs ${total.toLocaleString("es-PY")}`;
    _atualizarResumo();
    return;
  }

  // Tipos com builder próprio: shake / sorvete / açaí / suco
  if (tipo === "shake") {
    const base = (_shakeConfig.tamanho?.preco || prodAtual?.preco || 0)
               + (_shakeConfig.sabor?.preco || 0);
    document.getElementById("modal-price").innerText =
      `Gs ${((base + extrasTotal) * qtd).toLocaleString("es-PY")}`;
    return;
  }
  if (tipo === "sorvete") {
    const base = _sorveteConfig.tamanho?.preco || prodAtual?.preco || 0;
    document.getElementById("modal-price").innerText =
      `Gs ${((base + extrasTotal) * qtd).toLocaleString("es-PY")}`;
    return;
  }
  if (tipo === "acai") {
    const base = _acaiConfig.tamanho?.preco || prodAtual?.preco || 0;
    document.getElementById("modal-price").innerText =
      `Gs ${((base + extrasTotal) * qtd).toLocaleString("es-PY")}`;
    return;
  }
  if (tipo === "suco") {
    const base = _sucoConfig.tamanho?.preco || prodAtual?.preco || 0;
    document.getElementById("modal-price").innerText =
      `Gs ${((base + extrasTotal) * qtd).toLocaleString("es-PY")}`;
    return;
  }

  // Suporta ambos: cfg.pizza (novo) ou cfg direto (antigo)
  const p = _pizzaConfig.p;
  if (!p || !p.tamanhos) {
    const base = prodAtual?.preco || 0;
    const total = (base + extrasTotal) * qtd;
    document.getElementById("modal-price").innerText =
      `Gs ${total.toLocaleString("es-PY")}`;
    _atualizarResumo();
    return;
  }
  const saboresOk = (_pizzaConfig.sabores || []).filter(Boolean);
  const tam       = _pizzaConfig.tamanhoSelecionado;
  const precoBase  = _calcularBasePizza(tam, saboresOk.length ? saboresOk : []) || prodAtual?.preco || 0;
  const precoBorda = _pizzaConfig.bordaConfig?.preco || 0;
  const total = (precoBase + precoBorda + extrasTotal) * qtd;
  document.getElementById("modal-price").innerText =
    `Gs ${total.toLocaleString("es-PY")}`;
  _atualizarResumo();
}

// ─── VARIAÇÕES DE SABOR ───────────────────────────────────
let _variacaoSelecionada = null; // { nome, preco, img }

function _renderVariacoes(item, cfg, container) {
  _variacaoSelecionada = null;
  const variacoes = cfg && cfg.variacoes ? cfg.variacoes : [];

  const sec = document.createElement("div");
  sec.className = "var-section";
  sec.innerHTML = `<div class="var-label">Escolha o sabor</div><div class="var-grid" id="var-grid"></div>`;
  container.appendChild(sec);

  if (variacoes.length === 0) {
    const empty = document.createElement("div");
    empty.style.cssText =
      "padding:14px 12px; color:#666; font-size:0.95rem; border:1px dashed #ddd; border-radius:10px; margin-top:10px; background:#fafafa;";
    empty.innerText = "Nenhuma variação disponível para este produto.";
    container.appendChild(empty);
    return;
  }

  const grid = sec.querySelector("#var-grid");
  variacoes.forEach((v) => {
    const card = document.createElement("div");
    card.className = "var-card";
    const imgSrc =
      v.img ||
      item.img ||
      "https://cdn-icons-png.flaticon.com/512/2252/2252075.png";
    card.innerHTML = `
      <img src="${imgSrc}" class="var-card-img" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2252/2252075.png'">
      <div class="var-card-body">
        <div class="var-card-nome">${v.nome}</div>
        <div class="var-card-preco">Gs ${(v.preco || 0).toLocaleString("es-PY")}</div>
      </div>
      <div class="var-card-check">✓</div>
    `;
    card.dataset.preco = v.preco || 0;
    card.onclick = () => {
      grid
        .querySelectorAll(".var-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      _variacaoSelecionada = v;
      // Atualiza preço e imagem do modal
      document.getElementById("modal-price").innerText =
        `Gs ${((v.preco || 0) * qtd).toLocaleString("es-PY")}`;
      // Atualiza imagem do modal se a variação tiver foto própria
      const modalImg =
        document.querySelector(".modal-img") ||
        document.getElementById("modal-img");
      if (modalImg && v.img) modalImg.src = v.img;
    };
    grid.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════
//  🥤 SHAKE BUILDER
// ═══════════════════════════════════════════════════════════
function _renderShake(cfg, container) {
  const shake   = cfg.shake || cfg;
  const tamanhos = shake.tamanhos || [];
  const sabores  = shake.sabores  || [];

  let stepNum = 1;

  // Passo 1: Tamanho
  const sec1 = document.createElement("section");
  sec1.className = "pizza-step";
  sec1.innerHTML = `
    <div class="pizza-step-header">
      <span class="pizza-step-num">${stepNum++}</span>
      <span>Escolha o tamanho</span>
    </div>
    <div class="pizza-size-grid" id="shake-tam-grid"></div>`;
  container.appendChild(sec1);

  const passo2El = document.createElement("div");
  passo2El.id = "shake-passo2";
  passo2El.style.display = "none";
  container.appendChild(passo2El);

  const tamGrid = sec1.querySelector("#shake-tam-grid");
  tamanhos.forEach(tam => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pizza-size-card";
    btn.innerHTML = `
      <div class="pizza-size-name">${tam.nome}</div>
      ${tam.ml ? `<div class="pizza-size-info">${tam.ml} ml</div>` : ""}
      <div class="pizza-size-price">Gs ${(tam.preco || 0).toLocaleString("es-PY")}</div>`;
    btn.onclick = () => {
      tamGrid.querySelectorAll(".pizza-size-card").forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      _shakeConfig.tamanho = tam;
      _atualizarPrecoPizza();
      if (sabores.length > 0) {
        passo2El.style.display = "block";
        _scrollModalParaElemento(passo2El);
      }
    };
    tamGrid.appendChild(btn);
  });

  // Passo 2: Sabor (só se houver sabores)
  if (sabores.length > 0) {
    const sec2 = document.createElement("section");
    sec2.className = "pizza-step";
    sec2.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span>Escolha o sabor</span>
      </div>
      <div class="var-grid" id="shake-sabor-grid"></div>`;
    passo2El.appendChild(sec2);

    const sGrid = sec2.querySelector("#shake-sabor-grid");
    sabores.forEach(sab => {
      const card = document.createElement("div");
      card.className = "var-card";
      const imgSrc = sab.img || "";
      card.innerHTML = `
        ${imgSrc ? `<img src="${imgSrc}" class="var-card-img" loading="lazy" onerror="this.style.display='none'">` : ""}
        <div class="var-card-body">
          <div class="var-card-nome">${sab.nome}</div>
          ${(sab.preco || 0) > 0 ? `<div class="var-card-preco">+Gs ${sab.preco.toLocaleString("es-PY")}</div>` : ""}
        </div>
        <div class="var-card-check">✓</div>`;
      card.onclick = () => {
        sGrid.querySelectorAll(".var-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        _shakeConfig.sabor = sab;
        _atualizarPrecoPizza();
      };
      sGrid.appendChild(card);
    });

    // Se não há tamanhos, exibe sabores imediatamente
    if (tamanhos.length === 0) passo2El.style.display = "block";
  }
}

// ═══════════════════════════════════════════════════════════
//  🍦 SORVETE BUILDER
// ═══════════════════════════════════════════════════════════
function _renderSorvete(cfg, container) {
  const tamanhos = cfg.tamanhos  || [];
  const sabores  = cfg.sabores   || [];
  const etapas   = cfg.etapas    || [];
  const variacoes = cfg.variacoes || [];

  let stepNum = 1;

  // Passo 1: Tamanho
  const sec1 = document.createElement("section");
  sec1.className = "pizza-step";
  sec1.innerHTML = `
    <div class="pizza-step-header">
      <span class="pizza-step-num">${stepNum++}</span>
      <span>Escolha o tamanho</span>
    </div>
    <div class="pizza-size-grid" id="sorv-tam-grid"></div>`;
  container.appendChild(sec1);

  const passo2El = document.createElement("div");
  passo2El.id = "sorv-passo2";
  passo2El.style.display = "none";
  container.appendChild(passo2El);

  const tamGrid = sec1.querySelector("#sorv-tam-grid");
  tamanhos.forEach(tam => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pizza-size-card";
    const bolasTxt = tam.qtd_bolas
      ? `${tam.qtd_bolas} ${tam.qtd_bolas === 1 ? "bola" : "bolas"}`
      : "";
    btn.innerHTML = `
      <div class="pizza-size-name">${tam.nome}</div>
      ${bolasTxt ? `<div class="pizza-size-info">🍦 ${bolasTxt}</div>` : ""}
      <div class="pizza-size-price">Gs ${(tam.preco || 0).toLocaleString("es-PY")}</div>`;
    btn.onclick = () => {
      tamGrid.querySelectorAll(".pizza-size-card").forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      _sorveteConfig.tamanho = tam;
      _sorveteConfig.sabores = [];
      // Atualiza label de quantos sabores
      const maxB = tam.qtd_bolas || 1;
      const lbl = container.querySelector("#sorv-sabor-count");
      if (lbl) lbl.textContent = `Escolha até ${maxB} ${maxB === 1 ? "sabor" : "sabores"}`;
      // Desmarca todos
      container.querySelectorAll("#sorv-sabor-grid .var-card").forEach(c => c.classList.remove("selected"));
      _atualizarPrecoPizza();
      if (sabores.length > 0) {
        passo2El.style.display = "block";
        _scrollModalParaElemento(passo2El);
      }
    };
    tamGrid.appendChild(btn);
  });

  // Passo 2: Sabores
  if (sabores.length > 0) {
    const sec2 = document.createElement("section");
    sec2.className = "pizza-step";
    sec2.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span id="sorv-sabor-count">Escolha o sabor</span>
      </div>
      <div class="var-grid" id="sorv-sabor-grid"></div>`;
    passo2El.appendChild(sec2);

    const sGrid = sec2.querySelector("#sorv-sabor-grid");
    sabores.forEach(sab => {
      const card = document.createElement("div");
      card.className = "var-card";
      const imgSrc = sab.img || "";
      card.innerHTML = `
        ${imgSrc ? `<img src="${imgSrc}" class="var-card-img" loading="lazy" onerror="this.style.display='none'">` : ""}
        <div class="var-card-body">
          <div class="var-card-nome">${sab.nome}</div>
          ${(sab.preco || 0) > 0 ? `<div class="var-card-preco">+Gs ${sab.preco.toLocaleString("es-PY")}</div>` : ""}
        </div>
        <div class="var-card-check">✓</div>`;
      card.onclick = () => {
        const maxB = _sorveteConfig.tamanho?.qtd_bolas || 1;
        const idx  = (_sorveteConfig.sabores || []).findIndex(s => s.nome === sab.nome);
        if (idx > -1) {
          _sorveteConfig.sabores.splice(idx, 1);
          card.classList.remove("selected");
        } else if ((_sorveteConfig.sabores || []).length < maxB) {
          _sorveteConfig.sabores.push(sab);
          card.classList.add("selected");
        } else {
          mostrarToast(`Máximo de ${maxB} ${maxB === 1 ? "sabor" : "sabores"} para este tamanho`, "warning");
        }
        _atualizarPrecoPizza();
      };
      sGrid.appendChild(card);
    });

    if (tamanhos.length === 0) passo2El.style.display = "block";
  }

  // Etapas (acompanhamentos com limite)
  etapas.forEach((etapa, idx) => {
    const sec = document.createElement("section");
    sec.className = "pizza-step";
    sec.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span>${etapa.titulo} <small style="color:#888;font-size:0.72rem">(máx. ${etapa.max})</small></span>
      </div>`;
    (etapa.itens || []).forEach(item => {
      const lbl = document.createElement("label");
      lbl.className = "extra-check-row";
      const inp = document.createElement("input");
      inp.type = "checkbox";
      inp.className = "extra-check-input sorv-etapa-check";
      inp.dataset.etapa = idx;
      inp.dataset.max   = etapa.max;
      inp.dataset.nome  = item;
      inp.dataset.preco = 0;
      inp.addEventListener("change", function() {
        const max     = parseInt(this.dataset.max);
        const etIdx   = this.dataset.etapa;
        const checked = container.querySelectorAll(`.sorv-etapa-check[data-etapa="${etIdx}"]:checked`);
        if (this.checked && checked.length > max) {
          this.checked = false;
          mostrarToast(`Máximo de ${max} itens`, "warning");
        } else {
          if (!_sorveteConfig.etapasSel[etIdx]) _sorveteConfig.etapasSel[etIdx] = [];
          _sorveteConfig.etapasSel[etIdx] = Array.from(
            container.querySelectorAll(`.sorv-etapa-check[data-etapa="${etIdx}"]:checked`)
          ).map(c => c.dataset.nome);
        }
      });
      lbl.appendChild(inp);
      const span = document.createElement("span");
      span.className = "extra-check-label";
      span.textContent = item;
      lbl.appendChild(span);
      sec.appendChild(lbl);
    });
    container.appendChild(sec);
  });

  // Variacoes extras (opcional)
  if (variacoes.length > 0) {
    const sec = document.createElement("section");
    sec.className = "pizza-step";
    sec.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span>Opcionais</span>
      </div>`;
    variacoes.forEach(v => {
      const lbl = document.createElement("label");
      lbl.className = "extra-check-row";
      lbl.innerHTML = `
        <input type="checkbox" class="extra-check-input" data-preco="${v.preco || 0}" onchange="_atualizarPrecoPizza()">
        <span class="extra-check-label">${v.nome}</span>
        ${(v.preco || 0) > 0 ? `<span class="extra-check-price">+Gs ${(v.preco).toLocaleString("es-PY")}</span>` : ""}`;
      sec.appendChild(lbl);
    });
    container.appendChild(sec);
  }
}

// ═══════════════════════════════════════════════════════════
//  🍇 AÇAÍ BUILDER
// ═══════════════════════════════════════════════════════════
function _renderAcai(cfg, container) {
  const tamanhos       = cfg.tamanhos       || [];
  const acompanhamentos = cfg.acompanhamentos || [];
  const etapas         = cfg.etapas         || [];
  const variacoes      = cfg.variacoes      || [];

  let stepNum = 1;

  // Passo 1: Tamanho
  const sec1 = document.createElement("section");
  sec1.className = "pizza-step";
  sec1.innerHTML = `
    <div class="pizza-step-header">
      <span class="pizza-step-num">${stepNum++}</span>
      <span>Escolha o tamanho</span>
    </div>
    <div class="var-grid" id="acai-tam-grid"></div>`;
  container.appendChild(sec1);

  const tamGrid = sec1.querySelector("#acai-tam-grid");
  tamanhos.forEach(tam => {
    const card = document.createElement("div");
    card.className = "var-card";
    card.innerHTML = `
      ${tam.img ? `<img src="${tam.img}" class="var-card-img" loading="lazy" onerror="this.style.display='none'">` : ""}
      <div class="var-card-body">
        <div class="var-card-nome">${tam.nome}</div>
        <div class="var-card-preco">Gs ${(tam.preco || 0).toLocaleString("es-PY")}</div>
      </div>
      <div class="var-card-check">✓</div>`;
    card.onclick = () => {
      tamGrid.querySelectorAll(".var-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      _acaiConfig.tamanho = tam;
      _atualizarPrecoPizza();
      // Scroll para as etapas/acompanhamentos que ficam abaixo do tamanho
      const _proxSec = btn.closest("section")?.nextElementSibling;
      if (_proxSec) _scrollModalParaElemento(_proxSec);
    };
    tamGrid.appendChild(card);
  });

  // Acompanhamentos (multi-select livre)
  if (acompanhamentos.length > 0) {
    const sec = document.createElement("section");
    sec.className = "pizza-step";
    sec.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span>Acompanhamentos</span>
      </div>
      <div class="var-grid" id="acai-acomp-grid"></div>`;
    container.appendChild(sec);

    const aGrid = sec.querySelector("#acai-acomp-grid");
    acompanhamentos.forEach(ac => {
      const card = document.createElement("div");
      card.className = "var-card";
      card.innerHTML = `
        ${ac.img ? `<img src="${ac.img}" class="var-card-img" loading="lazy" onerror="this.style.display='none'">` : ""}
        <div class="var-card-body">
          <div class="var-card-nome">${ac.nome}</div>
          ${(ac.preco || 0) > 0
            ? `<div class="var-card-preco">+Gs ${ac.preco.toLocaleString("es-PY")}</div>`
            : `<div class="var-card-preco" style="color:#27ae60">Grátis</div>`}
        </div>
        <div class="var-card-check">✓</div>`;
      let sel = false;
      if (!_acaiConfig.etapasSel["acomp"]) _acaiConfig.etapasSel["acomp"] = [];
      card.onclick = () => {
        sel = !sel;
        card.classList.toggle("selected", sel);
        if (sel) {
          _acaiConfig.etapasSel["acomp"].push(ac.nome);
        } else {
          _acaiConfig.etapasSel["acomp"] = _acaiConfig.etapasSel["acomp"].filter(n => n !== ac.nome);
        }
        _atualizarPrecoPizza();
      };
      aGrid.appendChild(card);
    });
  }

  // Etapas personalizadas
  etapas.forEach((etapa, idx) => {
    const sec = document.createElement("section");
    sec.className = "pizza-step";
    sec.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span>${etapa.titulo} <small style="color:#888;font-size:0.72rem">(máx. ${etapa.max})</small></span>
      </div>`;
    (etapa.itens || []).forEach(item => {
      const lbl = document.createElement("label");
      lbl.className = "extra-check-row";
      const inp = document.createElement("input");
      inp.type = "checkbox";
      inp.className = "extra-check-input acai-etapa-check";
      inp.dataset.etapa = idx;
      inp.dataset.max   = etapa.max;
      inp.dataset.nome  = item;
      inp.dataset.preco = 0;
      inp.addEventListener("change", function() {
        const max     = parseInt(this.dataset.max);
        const etIdx   = this.dataset.etapa;
        const checked = container.querySelectorAll(`.acai-etapa-check[data-etapa="${etIdx}"]:checked`);
        if (this.checked && checked.length > max) {
          this.checked = false;
          mostrarToast(`Máximo de ${max} itens`, "warning");
        } else {
          _acaiConfig.etapasSel[etIdx] = Array.from(
            container.querySelectorAll(`.acai-etapa-check[data-etapa="${etIdx}"]:checked`)
          ).map(c => c.dataset.nome);
        }
      });
      lbl.appendChild(inp);
      const span = document.createElement("span");
      span.className = "extra-check-label";
      span.textContent = item;
      lbl.appendChild(span);
      sec.appendChild(lbl);
    });
    container.appendChild(sec);
  });

  // Variacoes extras
  if (variacoes.length > 0) {
    const sec = document.createElement("section");
    sec.className = "pizza-step";
    sec.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span>Opcionais extras</span>
      </div>`;
    variacoes.forEach(v => {
      const lbl = document.createElement("label");
      lbl.className = "extra-check-row";
      lbl.innerHTML = `
        <input type="checkbox" class="extra-check-input" data-preco="${v.preco || 0}" onchange="_atualizarPrecoPizza()">
        <span class="extra-check-label">${v.nome}</span>
        ${(v.preco || 0) > 0 ? `<span class="extra-check-price">+Gs ${(v.preco).toLocaleString("es-PY")}</span>` : ""}`;
      sec.appendChild(lbl);
    });
    container.appendChild(sec);
  }
}

// ═══════════════════════════════════════════════════════════
//  🍊 SUCO BUILDER
// ═══════════════════════════════════════════════════════════
function _renderSuco(cfg, container) {
  const tamanhos = cfg.tamanhos || [];
  const etapas   = cfg.etapas   || [];

  let stepNum = 1;

  // Passo 1: Tamanho
  const sec1 = document.createElement("section");
  sec1.className = "pizza-step";
  sec1.innerHTML = `
    <div class="pizza-step-header">
      <span class="pizza-step-num">${stepNum++}</span>
      <span>Escolha o tamanho</span>
    </div>
    <div class="pizza-size-grid" id="suco-tam-grid"></div>`;
  container.appendChild(sec1);

  const tamGrid = sec1.querySelector("#suco-tam-grid");
  tamanhos.forEach(tam => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pizza-size-card";
    btn.innerHTML = `
      <div class="pizza-size-name">${tam.nome}</div>
      <div class="pizza-size-price">Gs ${(tam.preco || 0).toLocaleString("es-PY")}</div>`;
    btn.onclick = () => {
      tamGrid.querySelectorAll(".pizza-size-card").forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      _sucoConfig.tamanho = tam;
      _atualizarPrecoPizza();
      const _proxSecS = btn.closest("section")?.nextElementSibling;
      if (_proxSecS) _scrollModalParaElemento(_proxSecS);
    };
    tamGrid.appendChild(btn);
  });

  // Etapas
  etapas.forEach((etapa, idx) => {
    const sec = document.createElement("section");
    sec.className = "pizza-step";
    sec.innerHTML = `
      <div class="pizza-step-header">
        <span class="pizza-step-num">${stepNum++}</span>
        <span>${etapa.titulo} <small style="color:#888;font-size:0.72rem">(máx. ${etapa.max})</small></span>
      </div>`;
    (etapa.itens || []).forEach(item => {
      const lbl = document.createElement("label");
      lbl.className = "extra-check-row";
      const inp = document.createElement("input");
      inp.type = "checkbox";
      inp.className = "extra-check-input suco-etapa-check";
      inp.dataset.etapa = idx;
      inp.dataset.max   = etapa.max;
      inp.dataset.nome  = item;
      inp.dataset.preco = 0;
      inp.addEventListener("change", function() {
        const max     = parseInt(this.dataset.max);
        const etIdx   = this.dataset.etapa;
        const checked = container.querySelectorAll(`.suco-etapa-check[data-etapa="${etIdx}"]:checked`);
        if (this.checked && checked.length > max) {
          this.checked = false;
          mostrarToast(`Máximo de ${max} itens`, "warning");
        } else {
          _sucoConfig.etapasSel[etIdx] = Array.from(
            container.querySelectorAll(`.suco-etapa-check[data-etapa="${etIdx}"]:checked`)
          ).map(c => c.dataset.nome);
        }
      });
      lbl.appendChild(inp);
      const span = document.createElement("span");
      span.className = "extra-check-label";
      span.textContent = item;
      lbl.appendChild(span);
      sec.appendChild(lbl);
    });
    container.appendChild(sec);
  });
}

function _renderAlmoco(cfg, container) {
  if (!cfg || !cfg.almoco || !cfg.almoco.pratos) return;
  const pratos = cfg.almoco.pratos;

  const sec = document.createElement("div");
  sec.innerHTML = `<div class="sabor-slot-label">Escolha o prato</div><div class="almoco-pratos-grid" id="almoco-pratos-grid"></div>`;
  container.appendChild(sec);

  const grid = sec.querySelector("#almoco-pratos-grid");
  pratos.forEach((prato) => {
    const card = document.createElement("div");
    card.className = "almoco-prato-option";
    card.innerHTML = `
      <img src="${prato.img || "https://via.placeholder.com/160x110?text=Prato"}" alt="${prato.nome}">
      <div class="prato-info">
        <div class="prato-nome">${prato.nome}</div>
        <div class="prato-desc">${prato.desc || ""}</div>
        <div class="prato-preco">Gs ${(prato.preco || 0).toLocaleString("es-PY")}</div>
      </div>`;
    card.onclick = () => {
      grid
        .querySelectorAll(".almoco-prato-option")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      prodAtual._pratoselecionado = prato;
      // Atualiza preço
      const preco = prato.preco || prodAtual.preco || 0;
      document.getElementById("modal-price").innerText =
        `Gs ${(preco * qtd).toLocaleString("es-PY")}`;
    };
    grid.appendChild(card);
  });
}

function _renderExtras(extras, container) {
  const sec = document.createElement("div");
  sec.className = "extras-section";
  sec.innerHTML = `<h5>➕ Adicionais (opcional)</h5>`;
  extras.forEach((ex) => {
    const row = document.createElement("label");
    row.className = "extra-check-row";
    row.innerHTML = `
      <input type="checkbox" class="extra-check-input" data-preco="${ex.preco}" onchange="_atualizarPrecoPizza()">
      <span class="extra-check-label">${ex.nome}</span>
      <span class="extra-check-price">+Gs ${(ex.preco || 0).toLocaleString("es-PY")}</span>`;
    sec.appendChild(row);
  });
  container.appendChild(sec);
}

// Renderiza opções de PREPARO (radio buttons — o cliente escolhe uma opção)
function _renderPreparo(opcoes, container) {
  const sec = document.createElement("div");
  sec.className = "extras-section preparo-section";
  sec.innerHTML = `<h5 style="color:#2980b9">🍳 Como deseja o preparo?</h5>`;

  opcoes.forEach((op, idx) => {
    const label = document.createElement("label");
    label.className = "extra-check-row preparo-row";
    label.style.cssText = "cursor:pointer;";
    label.innerHTML = `
      <input type="radio" class="preparo-radio-input" name="preparo-opcao" value="${op}" style="accent-color:#2980b9;width:18px;height:18px;margin-right:8px;">
      <span class="extra-check-label">${op}</span>`;
    sec.appendChild(label);
  });
  container.appendChild(sec);
}

// Renderiza EXTRAS GLOBAIS (adicionais disponíveis para qualquer produto)
function _renderExtrasGlobais(extras, container) {
  if (!extras || extras.length === 0) return;
  const sec = document.createElement("div");
  sec.className = "extras-section extras-globais-section";
  sec.innerHTML = `<h5 style="color:#8e44ad">⭐ Adicionais extras</h5>`;
  extras.forEach((ex) => {
    const row = document.createElement("label");
    row.className = "extra-check-row";
    row.innerHTML = `
      <input type="checkbox" class="extra-check-input" data-preco="${ex.preco || 0}" onchange="_atualizarPrecoPizza()">
      <span class="extra-check-label">${ex.nome}</span>
      ${ex.preco > 0 ? `<span class="extra-check-price">+Gs ${ex.preco.toLocaleString("es-PY")}</span>` : '<span class="extra-check-price" style="color:#27ae60">Grátis</span>'}`;
    sec.appendChild(row);
  });
  container.appendChild(sec);
}

function fecharModalProduto() {
  document.getElementById("product-modal").classList.remove("active");
}

function mudarQtd(delta) {
  qtd = Math.max(1, qtd + delta);
  document.getElementById("modal-qty").innerText = qtd;
  _atualizarPrecoPizza();
}

function adicionarDoModal() {
  if (!prodAtual) return;

  const cfg = prodAtual.montagem;
  let tipo = "padrao";
  if (cfg && !Array.isArray(cfg) && cfg.__tipo) tipo = cfg.__tipo;
  else if (
    prodAtual.e_montavel ||
    (cfg && Array.isArray(cfg) && cfg.length > 0)
  )
    tipo = "montavel";

  // Validações por tipo
  if (tipo === "pizza") {
    if (!_pizzaConfig.tamanhoSelecionado) {
      alert("Selecione o tamanho da pizza!");
      return;
    }
    const saboresOk = (_pizzaConfig.sabores || []).filter(Boolean);
    if (saboresOk.length === 0) {
      alert("Selecione ao menos 1 sabor!");
      return;
    }
    if (_pizzaConfig.numSabores && saboresOk.length < _pizzaConfig.numSabores) {
      alert(
        `Você escolheu ${_pizzaConfig.numSabores} sabores mas selecionou apenas ${saboresOk.length}. Complete a seleção!`,
      );
      return;
    }
  }
  if (tipo === "almoco" && !prodAtual._pratoselecionado) {
    alert("Selecione o prato!");
    return;
  }
  if (tipo === "variacoes" && !_variacaoSelecionada) {
    alert("Escolha o sabor antes de adicionar!");
    return;
  }
  if (tipo === "shake") {
    if (!_shakeConfig.tamanho) { alert("Selecione o tamanho do shake!"); return; }
    const temSaboresShake = (cfg?.shake?.sabores || cfg?.sabores || []).length > 0;
    if (temSaboresShake && !_shakeConfig.sabor) { alert("Selecione o sabor do shake!"); return; }
  }
  if (tipo === "sorvete" && !_sorveteConfig.tamanho) { alert("Selecione o tamanho!"); return; }
  if (tipo === "acai"    && !_acaiConfig.tamanho)    { alert("Selecione o tamanho!"); return; }
  if (tipo === "suco"    && !_sucoConfig.tamanho)    { alert("Selecione o tamanho!"); return; }
  if (tipo === "combo_fechado") {
    const total = Object.values(_comboFechadoConfig.selecao).reduce((a, b) => a + b, 0);
    if (total !== _comboFechadoConfig.limite) {
      alert(`Selecione exatamente ${_comboFechadoConfig.limite} itens para continuar.`);
      return;
    }
  }

  // Monta descrição para o carrinho
  let montagem = [];
  let variacao = "";
  let precoFinal = prodAtual.preco;

  if (tipo === "combo_fechado") {
    const partes = _comboFechadoConfig.sabores
      .filter((s) => (_comboFechadoConfig.selecao[s.id] || 0) > 0)
      .map((s) => `${s.nome} ×${_comboFechadoConfig.selecao[s.id]}`);
    montagem.push(partes.join(", "));
  }

  if (tipo === "montavel") {
    const cfgEtapas = Array.isArray(cfg)
      ? cfg
      : cfg && cfg.etapas
        ? cfg.etapas
        : [];
    for (let k in itensMontagem) {
      if (itensMontagem[k] && itensMontagem[k].length > 0) {
        const titulo = cfgEtapas[k]
          ? cfgEtapas[k].titulo
          : `Etapa ${parseInt(k) + 1}`;
        montagem.push(`${titulo}: ${itensMontagem[k].join(", ")}`);
      }
    }
  }

  if (tipo === "pizza") {
    // ─────────────────────────────────────────────────────────────
    // PREÇO PIZZA:
    //   Base    = tamanho selecionado (sempre — é o preço principal)
    //   Extra   = maior preco individual dos sabores (0 se não há premium)
    //   Borda   = preco da borda escolhida (0 se sem borda)
    //   Total   = (Base + Extra) * qtd + Borda * qtd
    // ─────────────────────────────────────────────────────────────
    const saboresOk = (_pizzaConfig.sabores || []).filter(Boolean);
    const _tam       = _pizzaConfig.tamanhoSelecionado;
    const precoBorda = _pizzaConfig.bordaConfig?.preco || 0;
    precoFinal = _calcularBasePizza(_tam, saboresOk) + precoBorda;

    variacao = _pizzaConfig.tamanhoSelecionado?.nome || "";
    const numSab = _pizzaConfig.numSabores || 1;
    const saboresStr = saboresOk
      .map((s, i) => (numSab > 1 ? `${i + 1}/${numSab} ${s.nome}` : s.nome))
      .join(" | ");

    // montagem: string legível para exibição no carrinho/cozinha
    montagem = [saboresStr].filter(Boolean);
    if (_pizzaConfig.bordaConfig)
      montagem.push(`Borda: ${_pizzaConfig.bordaConfig.nome}`);
  }

  if (tipo === "almoco" && prodAtual._pratoselecionado) {
    const prato = prodAtual._pratoselecionado;
    variacao = prato.nome;
    precoFinal = prato.preco || prodAtual.preco;
    montagem = [prato.desc || ""];
  }

  if (tipo === "variacoes" && _variacaoSelecionada) {
    variacao = _variacaoSelecionada.nome;
    precoFinal = _variacaoSelecionada.preco || prodAtual.preco;
    // Usa imagem da variação se disponível
    if (_variacaoSelecionada.img)
      prodAtual._variacaoImg = _variacaoSelecionada.img;
  }

  // ── shake ────────────────────────────────────────────────────
  if (tipo === "shake") {
    precoFinal = (_shakeConfig.tamanho?.preco || 0) + (_shakeConfig.sabor?.preco || 0);
    variacao   = _shakeConfig.tamanho?.nome || "";
    if (_shakeConfig.sabor) montagem = [_shakeConfig.sabor.nome];
  }

  // ── sorvete ──────────────────────────────────────────────────
  if (tipo === "sorvete") {
    precoFinal = _sorveteConfig.tamanho?.preco || prodAtual.preco;
    variacao   = _sorveteConfig.tamanho?.nome || "";
    const saboresStr = (_sorveteConfig.sabores || []).map(s => s.nome).join(" + ");
    if (saboresStr) montagem.push(saboresStr);
    Object.values(_sorveteConfig.etapasSel).forEach(itens => {
      if (itens && itens.length) montagem.push(itens.join(", "));
    });
  }

  // ── açaí ─────────────────────────────────────────────────────
  if (tipo === "acai") {
    precoFinal = _acaiConfig.tamanho?.preco || prodAtual.preco;
    variacao   = _acaiConfig.tamanho?.nome || "";
    Object.values(_acaiConfig.etapasSel).forEach(itens => {
      if (itens && itens.length) montagem.push(itens.join(", "));
    });
  }

  // ── suco ─────────────────────────────────────────────────────
  if (tipo === "suco") {
    precoFinal = _sucoConfig.tamanho?.preco || prodAtual.preco;
    variacao   = _sucoConfig.tamanho?.nome || "";
    Object.values(_sucoConfig.etapasSel).forEach(itens => {
      if (itens && itens.length) montagem.push(itens.join(", "));
    });
  }

  // Extras selecionados
  const extrasEscolhidos = [];
  document.querySelectorAll(".extra-check-input:checked").forEach((cb) => {
    const nome = cb
      .closest(".extra-check-row")
      .querySelector(".extra-check-label").textContent;
    const preco = parseInt(cb.dataset.preco || 0);
    extrasEscolhidos.push({ nome, preco });
    precoFinal += preco;
  });
  if (extrasEscolhidos.length > 0) {
    montagem.push("Extras: " + extrasEscolhidos.map((e) => e.nome).join(", "));
  }

  // Captura metadados da pizza ANTES de resetar _pizzaConfig
  const pizzaMeta =
    tipo === "pizza"
      ? {
          tamanho: _pizzaConfig.tamanhoSelecionado?.nome || "",
          sabores: (_pizzaConfig.sabores || [])
            .filter(Boolean)
            .map((s) => s.nome),
          borda: _pizzaConfig.bordaConfig?.nome || null,
        }
      : null;

  // Captura preparo selecionado
  const preparoSel = document.querySelector(".preparo-radio-input:checked");
  const preparoEscolhido = preparoSel ? preparoSel.value : "";

  carrinho.push({
    id: Date.now(),
    produto_id: prodAtual.id || null, // ID real do banco — necessário para desconto de estoque
    nome: prodAtual.nome,
    variacao: variacao || "",
    preparo: preparoEscolhido,
    preco: precoFinal,
    qtd: qtd,
    montagem: montagem.filter(Boolean),
    obs: document.getElementById("modal-obs").value,
    img: prodAtual._variacaoImg || prodAtual.img,
    categoria_slug: prodAtual.categoria_slug || "", // para filtro bebidas no motoboy
    es_bebida: prodAtual.es_bebida || false,
    ...(pizzaMeta ? { pizzaMeta } : {}),
  });

  // Limpa estado após push
  _pizzaConfig = {
    p: null,
    tamanhoSelecionado: null,
    numSabores: null,
    sabores: [],
    bordaConfig: null,
  };
  _variacaoSelecionada = null;
  _comboFechadoConfig = { limite: 0, sabores: [], selecao: {} };
  if (prodAtual) prodAtual._variacaoImg = null;

  updateUI();
  fecharModalProduto();
}

// ==========================================
// 6. ATUALIZAÇÃO DA UI (Carrinho)
// ==========================================
function updateUI() {
  const cartBar = document.getElementById("cart-bar");
  const count = document.getElementById("cart-count");
  const total = document.getElementById("cart-total");

  const totalItens = carrinho.reduce((a, i) => a + i.qtd, 0);
  const totalDinheiro = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);

  count.innerText = totalItens;
  total.innerText = `Gs ${totalDinheiro.toLocaleString("es-PY")}`;
  cartBar.classList.toggle("show", totalItens > 0);

  // ── Atualiza sidebar desktop ──────────────────────────────
  const desktopItems = document.getElementById("desktop-cart-items");
  const desktopEmpty = document.getElementById("desktop-cart-empty");
  const desktopTotalRow = document.getElementById("desktop-cart-total-row");
  const desktopTotalVal = document.getElementById("desktop-cart-total-val");
  const desktopBtn = document.getElementById("desktop-cart-btn");

  if (desktopItems) {
    desktopItems.innerHTML = "";
    if (carrinho.length === 0) {
      if (desktopEmpty) desktopEmpty.style.display = "block";
      if (desktopTotalRow) desktopTotalRow.style.display = "none";
      if (desktopBtn) desktopBtn.disabled = true;
    } else {
      if (desktopEmpty) desktopEmpty.style.display = "none";
      if (desktopTotalRow) desktopTotalRow.style.display = "flex";
      if (desktopBtn) desktopBtn.disabled = false;

      carrinho.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "desktop-cart-item";
        div.innerHTML = `
          <span class="desktop-cart-item-name">${item.qtd}x ${item.nome}</span>
          <span class="desktop-cart-item-price">Gs ${(item.preco * item.qtd).toLocaleString("es-PY")}</span>`;
        desktopItems.appendChild(div);
      });

      if (desktopTotalVal)
        desktopTotalVal.innerText = `Gs ${totalDinheiro.toLocaleString("es-PY")}`;
    }
  }

  // Atualiza lista no checkout se estiver aberto
  const modalCheckout = document.getElementById("checkout-modal");
  if (modalCheckout && modalCheckout.classList.contains("active")) {
    renderCarrinho();
  }
}

function limparCarrinho() {
  if (confirm("Deseja limpar o carrinho?")) {
    carrinho = [];
    cupomAplicado = null;
    freteCalculado = 0;
    freteMotoboy = 0;
    localCliente = null;
    updateUI();
  }
}

// ==========================================
// VALIDAÇÃO DE FORMULÁRIOS
// ==========================================
function validarCampo(campoId, regras = {}) {
  const campo = document.getElementById(campoId);
  if (!campo) return { valido: false, mensagem: "Campo não encontrado" };

  const valor = campo.value.trim();

  if (regras.obrigatorio && !valor) {
    marcarErro(campo, "Este campo é obrigatório");
    return { valido: false, mensagem: "Campo obrigatório" };
  }

  if (regras.minimo && valor.length < regras.minimo) {
    marcarErro(campo, `Mínimo de ${regras.minimo} caracteres`);
    return { valido: false, mensagem: `Mínimo de ${regras.minimo} caracteres` };
  }

  if (regras.telefone && valor) {
    const telefoneLimpo = valor.replace(/\D/g, "");
    if (telefoneLimpo.length < 8) {
      marcarErro(campo, "Telefone inválido");
      return { valido: false, mensagem: "Telefone inválido" };
    }
  }

  removerErro(campo);
  return { valido: true, valor: valor };
}

function marcarErro(campo, mensagem) {
  campo.classList.add("erro-validacao");
  campo.style.borderColor = "#e74c3c";

  // Procura ou cria mensagem de erro
  let msgEl = campo.parentElement.querySelector(".msg-erro");
  if (!msgEl) {
    msgEl = document.createElement("span");
    msgEl.className = "msg-erro";
    msgEl.style.cssText =
      "color: #e74c3c; font-size: 0.8rem; margin-top: 4px; display: block;";
    campo.parentElement.appendChild(msgEl);
  }
  msgEl.textContent = mensagem;
}

function removerErro(campo) {
  campo.classList.remove("erro-validacao");
  campo.style.borderColor = "";
  const msgEl = campo.parentElement.querySelector(".msg-erro");
  if (msgEl) msgEl.remove();
}

function limparTodosErros() {
  document.querySelectorAll(".erro-validacao").forEach((campo) => {
    removerErro(campo);
  });
}

// ==========================================
// ==========================================
// 7. CHECKOUT E VALIDAÇÃO
// ==========================================
function abrirCheckout() {
  if (carrinho.length === 0) return alert("Carrinho vazio!");

  // Verifica se a loja está aberta (se não estiver em modo agendamento)
  if (!MODO_AGENDAMENTO) {
    const statusLoja = verificarLojaAbertaParaPedido();
    if (!statusLoja.aberto) {
      mostrarAlertaLojaFechada(statusLoja.proximoDia);
      return;
    }
  }

  renderCarrinho();
  renderUpsell();

  // Mostra indicador de agendamento se ativo
  if (MODO_AGENDAMENTO) {
    mostrarIndicadorAgendamento();
  }

  document.getElementById("checkout-modal").classList.add("active");
}

function fecharCheckout() {
  document.getElementById("checkout-modal").classList.remove("active");
  // Reseta frete para não vazar entre sessões
  if (carrinho.length === 0) {
    freteCalculado = 0;
    freteMotoboy = 0;
    localCliente = null;
  }
}

function renderCarrinho() {
  const lista = document.getElementById("carrinho-lista");
  lista.innerHTML = "";

  carrinho.forEach((item, idx) => {
    const totalItem = item.preco * item.qtd;
    let detalhes = "";
    if (item.pizzaMeta) {
      const m = item.pizzaMeta;
      const partes = [];
      if (m.tamanho) partes.push(`📐 ${m.tamanho}`);
      if (m.sabores && m.sabores.length > 0)
        partes.push(`🍕 ${m.sabores.join(" / ")}`);
      if (m.borda) partes.push(`🧀 ${m.borda}`);
      detalhes = `<br><small style="color:#888">${partes.join(" · ")}</small>`;
    } else {
      // Variação (ex: "Combo Grande") — aparece como badge separado, não duplica o nome
      if (item.variacao) {
        detalhes += `<br><small style="color:var(--primary,#e74c3c);font-weight:600">▸ ${item.variacao}</small>`;
      }
      // Preparo (ex: "Flambado", "Batata Frita")
      if (item.preparo) {
        detalhes += `<br><small style="color:#2980b9;font-weight:600">🍳 ${item.preparo}</small>`;
      }
      if (item.montagem && item.montagem.length > 0) {
        detalhes += `<br><small style="color:#888">${item.montagem.join(", ")}</small>`;
      }
    }
    const obs = item.obs
      ? `<br><small style="color:#666"><strong>Obs:</strong> ${item.obs}</small>`
      : "";

    lista.innerHTML += `
      <div class="cart-item-row">
        ${item.img ? `<img src="${item.img}" class="cart-thumb">` : ""}
        <div class="cart-details">
          <div class="cart-title">${item.nome}</div>
          ${detalhes}
          ${obs}
          <div class="cart-item-price">Gs ${totalItem.toLocaleString("es-PY")}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div class="qty-mini">
            <button onclick="mudarQtdCarrinho(${idx}, -1)">−</button>
            <span>${item.qtd}</span>
            <button onclick="mudarQtdCarrinho(${idx}, 1)">+</button>
          </div>
          <button onclick="removerItemCarrinho(${idx})" title="Remover item"
            style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:1.1rem;padding:2px 6px;">🗑️</button>
        </div>
      </div>
    `;
  });

  atualizarTotalCheckout();
}

function mudarQtdCarrinho(idx, delta) {
  if (idx < 0 || idx >= carrinho.length) return;
  carrinho[idx].qtd = Math.max(1, carrinho[idx].qtd + delta);
  renderCarrinho();
  updateUI();
}

function removerItemCarrinho(idx) {
  if (idx < 0 || idx >= carrinho.length) return;
  carrinho.splice(idx, 1);
  renderCarrinho();
  updateUI();
}

function renderUpsell() {
  const upsellDiv = document.getElementById("lista-upsell");
  if (!upsellDiv) return;

  upsellDiv.innerHTML = "";
  const upsellItems = MENU["bebidas"] || [];

  upsellItems.slice(0, 5).forEach((item) => {
    const img = item.img || "https://via.placeholder.com/80?text=🥤";
    upsellDiv.innerHTML += `
      <div class="upsell-item" style="min-width:100px;text-align:center;cursor:pointer;" onclick='adicionarUpsell(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
        <img src="${img}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin-bottom:5px;">
        <div style="font-size:0.75rem;font-weight:600">${item.nome}</div>
        <div style="font-size:0.7rem;color:var(--primary)">Gs ${item.preco.toLocaleString("es-PY")}</div>
      </div>
    `;
  });
}

function adicionarUpsell(item) {
  carrinho.push({ ...item, qtd: 1, montagem: [], obs: "" });
  renderCarrinho();
  updateUI();
}

// ==========================================
// CUPOM DE DESCONTO — implementação via banco em async function aplicarCupom() abaixo
// ==========================================

function atualizarTotalCheckout() {
  const totalItens = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
  let desconto = 0;
  let freteAplicado = Math.max(0, freteCalculado); // guard: -1 = a combinar => 0

  if (cupomAplicado) {
    if (cupomAplicado.tipo === "percentual") {
      desconto = Math.round(totalItens * (cupomAplicado.valor / 100));
    } else if (cupomAplicado.tipo === "frete") {
      freteAplicado = 0;
    }
  }

  const totalGeral =
    totalItens - desconto + (modoEntrega === "delivery" ? freteAplicado : 0);

  let html = `
    <div style="display:flex;justify-content:space-between;margin:5px 0;font-size:0.9rem">
      <span>Subtotal:</span>
      <span>Gs ${totalItens.toLocaleString("es-PY")}</span>
    </div>
  `;

  if (desconto > 0) {
    html += `
      <div style="display:flex;justify-content:space-between;margin:5px 0;font-size:0.9rem;color:#27ae60">
        <span>Desconto (${cupomAplicado.codigo}):</span>
        <span>- Gs ${desconto.toLocaleString("es-PY")}</span>
      </div>
    `;
  }

  if (modoEntrega === "delivery") {
    html += `
      <div style="display:flex;justify-content:space-between;margin:5px 0;font-size:0.9rem">
        <span>Frete:</span>
        <span>Gs ${freteAplicado.toLocaleString("es-PY")}</span>
      </div>
    `;
  }

  const totalEl = document.getElementById("total-final-checkout");
  if (totalEl) {
    totalEl.innerHTML = `
      <div style="border-top:2px solid #eee;padding-top:10px;margin-top:10px">
        ${html}
        <div style="display:flex;justify-content:space-between;font-size:1.2rem;font-weight:bold;margin-top:10px">
          <span>Total:</span>
          <span>Gs ${totalGeral.toLocaleString("es-PY")}</span>
        </div>
      </div>
    `;
  }
}

function mudarModoEntrega(modo) {
  modoEntrega = modo;
  document
    .getElementById("btn-delivery")
    .classList.toggle("active", modo === "delivery");
  document
    .getElementById("btn-retirada")
    .classList.toggle("active", modo === "retirada");
  const btnLocal = document.getElementById("btn-local");
  if (btnLocal) btnLocal.classList.toggle("active", modo === "local");
  document.getElementById("box-endereco").style.display =
    modo === "delivery" ? "block" : "none";
  atualizarTotalCheckout();
}

function toggleFactura() {
  const checked = document.getElementById("check-factura").checked;
  document.getElementById("box-ruc").classList.toggle("hidden", !checked);
}

function verificarPagamento() {
  const pag = document.getElementById("forma-pag").value;
  const pagFinal =
    pag === "CartaoBR"
      ? _cartaoBRTipo === "debito"
        ? "Cartão BR - Débito"
        : "Cartão BR - Crédito"
      : pag;
  const infoDiv = document.getElementById("info-pagamento-extra");
  const boxTroco = document.getElementById("box-troco");
  const boxMulti = document.getElementById("box-multipagamento");
  const selectPag = document.getElementById("forma-pag");

  infoDiv.style.display = "none";
  boxTroco.classList.add("hidden");
  if (boxMulti) boxMulti.style.display = "none";

  if (pag === "Efetivo") {
    boxTroco.classList.remove("hidden");
  } else if (pag === "CartaoBR") {
    infoDiv.style.display = "block";

    const _calcTotalGs = () => {
      const totalItens = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
      let frete = modoEntrega === "delivery" ? Math.max(0, freteCalculado) : 0;
      let desconto = 0;
      if (cupomAplicado) {
        if (cupomAplicado.tipo === "percentual")
          desconto = Math.round(totalItens * (cupomAplicado.valor / 100));
        else if (cupomAplicado.tipo === "frete") frete = 0;
      }
      return totalItens - desconto + frete;
    };

    const _renderCartaoBR = () => {
      const totalGs = _calcTotalGs();
      const taxa =
        _cartaoBRTipo === "debito" ? TAXA_DEBITO_BR : TAXA_CREDITO_BR;
      const brl =
        COTACAO_REAL > 0 && totalGs > 0
          ? ((totalGs / COTACAO_REAL) * (1 + taxa / 100)).toFixed(2)
          : "---";
      const el = document.getElementById("info-pagamento-extra");
      if (!el) return;
      el.style.display = "block";
      el.innerHTML = `
        <div style="font-weight:700;margin-bottom:8px;font-size:0.9rem">💳🇧🇷 Cartão Brasileiro</div>
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <button type="button" onclick="window._setBRTipo('debito')"
            style="flex:1;padding:9px 6px;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.83rem;
                   border:2px solid ${_cartaoBRTipo === "debito" ? "#1a7a2e" : "#ccc"};
                   background:${_cartaoBRTipo === "debito" ? "#eafaf1" : "#f8f9fa"};
                   color:${_cartaoBRTipo === "debito" ? "#1a7a2e" : "#555"}">
            💳 Débito<br><small style="font-weight:400">${TAXA_DEBITO_BR.toFixed(2).replace(".", ",")}%</small>
          </button>
          <button type="button" onclick="window._setBRTipo('credito')"
            style="flex:1;padding:9px 6px;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.83rem;
                   border:2px solid ${_cartaoBRTipo === "credito" ? "#1a7a2e" : "#ccc"};
                   background:${_cartaoBRTipo === "credito" ? "#eafaf1" : "#f8f9fa"};
                   color:${_cartaoBRTipo === "credito" ? "#1a7a2e" : "#555"}">
            💳 Crédito<br><small style="font-weight:400">${TAXA_CREDITO_BR.toFixed(2).replace(".", ",")}%</small>
          </button>
        </div>
        <div style="background:#fff;border:1.5px solid #1a7a2e;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:0.78rem;color:#666;margin-bottom:2px">Valor a cobrar (com taxa)</div>
          <div style="font-size:1.3rem;font-weight:900;color:#1a7a2e">
            ${brl === "---" ? '<span style="font-size:0.9rem;color:#999">Adicione itens ao carrinho</span>' : "R$ " + brl}
          </div>
        </div>`;
    };

    window._renderCartaoBR = _renderCartaoBR;
    window._setBRTipo = (tipo) => {
      _cartaoBRTipo = tipo;
      window._renderCartaoBR();
    };
    _renderCartaoBR();
  } else if (pag === "Pix") {
    infoDiv.style.display = "block";
    const totalItens = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
    let freteAplicado =
      modoEntrega === "delivery" ? Math.max(0, freteCalculado) : 0;
    let desconto = 0;
    if (cupomAplicado) {
      if (cupomAplicado.tipo === "percentual")
        desconto = Math.round(totalItens * (cupomAplicado.valor / 100));
      else if (cupomAplicado.tipo === "frete") freteAplicado = 0;
    }
    const totalGs = totalItens - desconto + freteAplicado;
    const totalBrl =
      COTACAO_REAL > 0 ? (totalGs / COTACAO_REAL).toFixed(2) : "---";
    infoDiv.innerHTML = `<strong>💳 Chave Pix:</strong><br>${CHAVE_PIX}<br><small>Titular: ${NOME_PIX}</small><br><strong style="color:#27ae60;font-size:1rem">💰 Valor: R$ ${totalBrl}</strong>`;
  } else if (pag === "Transferencia") {
    infoDiv.style.display = "block";
    const qrHtml = QR_ALIAS_URL
      ? `<br><img src="${QR_ALIAS_URL}" alt="QR Alias" style="width:160px;height:160px;margin-top:8px;border-radius:8px;border:2px solid #e0e0e0">`
      : "";
    infoDiv.innerHTML = `<strong>🏦 Transferencia / Alias:</strong><br>${DADOS_ALIAS}<br>${ALIAS_PY}${qrHtml}`;
  } else if (pag === "QrPy") {
    infoDiv.style.display = "block";
    const qrPyHtml = QR_PY_URL
      ? `<br><img src="${QR_PY_URL}" alt="QR Paraguay" style="width:160px;height:160px;margin-top:8px;border-radius:8px;border:2px solid #e0e0e0">`
      : "";
    infoDiv.innerHTML = `<strong>📱 QR Paraguay:</strong><br><small>Tigo Money · Personal Pay · Bancard</small>${qrPyHtml}<br><small style="color:#888">Escaneie e envie o comprovante</small>`;
  } else if (pag === "Multipagamento") {
    if (boxMulti) {
      boxMulti.style.display = "block";
      // Esconde o select enquanto está no modo multi
      selectPag.style.display = "none";
      // Inicializa com 2 formas se ainda não há nenhuma
      const partes = document.getElementById("multi-partes");
      if (partes && partes.children.length === 0) {
        adicionarPartePagamento(); // 1ª forma
        adicionarPartePagamento(); // 2ª forma
      }
      atualizarRestanteMulti();
    }
    return; // Não chama atualizarRestanteMulti de novo
  }

  // Garante que o select volte a aparecer se não for Multipagamento
  if (selectPag) selectPag.style.display = "";
}

// ==========================================
// MULTIPAGAMENTO
// ==========================================
let _multiContador = 0;

const METODOS_PAG = [
  { value: "Efetivo", label: "💵 Efectivo" },
  { value: "Cartao", label: "💳 Tarjeta" },
  { value: "CartaoBR", label: "💳🇧🇷 Cartão BR" },
  { value: "Pix", label: "🟢 Pix (BR)" },
  { value: "Transferencia", label: "🏦 Alias/Transferencia" },
  { value: "QrPy", label: "📱 QR Paraguay" },
];

function _getTotalPedidoAtual() {
  const totalItens = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
  let freteAplicado =
    modoEntrega === "delivery" ? Math.max(0, freteCalculado) : 0;
  let desconto = 0;
  if (cupomAplicado) {
    if (cupomAplicado.tipo === "percentual")
      desconto = Math.round(totalItens * (cupomAplicado.valor / 100));
    else if (cupomAplicado.tipo === "frete") freteAplicado = 0;
  }
  return totalItens - desconto + freteAplicado;
}

function voltarPagamentoUnico() {
  // Reseta o select para "nada selecionado" e esconde o painel multi
  document.getElementById("forma-pag").value = "";
  document.getElementById("box-multipagamento").style.display = "none";
  // Limpa as partes
  document.getElementById("multi-partes").innerHTML = "";
  _multiContador = 0;
  verificarPagamento();
}

function adicionarPartePagamento() {
  const container = document.getElementById("multi-partes");
  if (!container) return;
  _multiContador++;
  const id = _multiContador;
  const ordinal = ["1ª", "2ª", "3ª", "4ª", "5ª"][id - 1] || `${id}ª`;

  const metodoOptions = METODOS_PAG.map(
    (m) => `<option value="${m.value}">${m.label}</option>`,
  ).join("");

  const card = document.createElement("div");
  card.id = `multi-parte-${id}`;
  card.style.cssText = `
    background: white;
    border: 1.5px solid #e0e0e0;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 10px;
    position: relative;
  `;
  card.innerHTML = `
    <div style="font-size:0.78rem; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">
      ${ordinal} FORMA
    </div>
    <div style="display:flex; gap:10px; align-items:flex-start;">
      <select id="multi-metodo-${id}" onchange="verificarPartePix(${id})"
          style="flex:1.5; padding:10px; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.9rem; background:white; font-weight:600;">
        <option value="">Selecionar forma...</option>
        ${metodoOptions}
      </select>
      <div style="flex:1; position:relative;">
        <span style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#888; font-size:0.85rem; pointer-events:none;">Gs</span>
        <input type="number" id="multi-valor-${id}" placeholder="0" min="0" step="1000"
            oninput="atualizarRestanteMulti()"
            style="width:100%; padding:10px 10px 10px 30px; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.95rem; font-weight:700; box-sizing:border-box;">
      </div>
      ${
        id > 2
          ? `<button type="button" onclick="removerPartePagamento(${id})"
          style="background:#ffeaea; color:#e74c3c; border:none; padding:10px 12px; border-radius:8px; cursor:pointer; font-size:0.9rem; flex-shrink:0;">✕</button>`
          : ""
      }
    </div>
    <!-- Info Efetivo (troco) -->
    <div id="multi-troco-${id}" style="display:none; margin-top:8px;">
      <input type="number" id="multi-troco-val-${id}" placeholder="Troco para (Gs)" min="0" step="1000"
          style="width:100%; padding:9px; border:1.5px solid #f0a500; border-radius:8px; font-size:0.87rem; box-sizing:border-box;">
    </div>
    <!-- Info Pix -->
    <div id="multi-pix-info-${id}" style="display:none; margin-top:8px; font-size:0.83rem; color:#27ae60; font-weight:600; text-align:right;"></div>
  `;
  container.appendChild(card);
  atualizarRestanteMulti();
}

// Chamado quando muda o SELECT de método — mostra/esconde troco e info Pix
// NÃO chama atualizarRestanteMulti (evita loop infinito)
function verificarPartePix(id) {
  const metodo = document.getElementById(`multi-metodo-${id}`)?.value;
  const trocoBox = document.getElementById(`multi-troco-${id}`);
  if (trocoBox)
    trocoBox.style.display = metodo === "Efetivo" ? "block" : "none";
  // Atualiza info pix sem recursar
  _atualizarPixInfo(id, metodo);
  // Só chama atualizar ao mudar método, sem recursão
  atualizarRestanteMulti(false);
}

// Atualiza o bloco de info Pix para um card específico (sem chamar atualizarRestanteMulti)
function _atualizarPixInfo(id, metodo) {
  const pixInfo = document.getElementById(`multi-pix-info-${id}`);
  if (!pixInfo) return;
  if (metodo === "Pix") {
    const valor =
      parseFloat(document.getElementById(`multi-valor-${id}`)?.value) || 0;
    if (valor > 0 && COTACAO_REAL > 0) {
      const brl = (valor / COTACAO_REAL).toFixed(2);
      pixInfo.style.display = "block";
      pixInfo.innerHTML = `💠 Pix: <strong>R$ ${brl}</strong> &nbsp;·&nbsp; Chave: ${CHAVE_PIX}`;
    } else {
      pixInfo.style.display = "none";
    }
  } else {
    pixInfo.style.display = "none";
  }
}

function removerPartePagamento(id) {
  const el = document.getElementById(`multi-parte-${id}`);
  if (el) el.remove();
  atualizarRestanteMulti(false);
}

// skipPixUpdate evita recursão: quando chamado DE verificarPartePix, passa false
function atualizarRestanteMulti(atualizarPix = true) {
  const total = _getTotalPedidoAtual();
  const inputs = [...document.querySelectorAll('[id^="multi-valor-"]')];
  let soma = 0;
  inputs.forEach((inp) => {
    soma += parseFloat(inp.value) || 0;
  });

  const restante = total - soma;
  const bar = document.getElementById("multi-status-bar");
  const el = document.getElementById("multi-restante");

  // ── AUTO-FILL: se há exatamente 1 input vazio e ainda sobra valor, preenche ──
  const inputsVazios = inputs.filter(
    (inp) => !inp.value || parseFloat(inp.value) === 0,
  );
  if (inputsVazios.length === 1 && restante > 0) {
    inputsVazios[0].value = restante;
    // Recalcula com o novo valor preenchido
    soma = total;
  }

  if (!el || !bar) return;
  bar.style.display = "block";

  const diff = total - soma;
  if (Math.abs(diff) < 1) {
    bar.style.background = "#eafaf1";
    bar.style.borderColor = "#27ae60";
    el.innerHTML = `<span style="color:#27ae60">✅ Total coberto: Gs ${total.toLocaleString("es-PY")}</span>`;
  } else if (diff > 0) {
    bar.style.background = "#fff8e6";
    bar.style.borderColor = "#f0a500";
    el.innerHTML = `<span style="color:#e67e22">⚠️ Faltam: Gs ${diff.toLocaleString("es-PY")}</span>`;
  } else {
    bar.style.background = "#fdf3f3";
    bar.style.borderColor = "#e74c3c";
    el.innerHTML = `<span style="color:#e74c3c">❌ Excede: Gs ${Math.abs(diff).toLocaleString("es-PY")}</span>`;
  }

  // Atualiza info de Pix — SEM chamar verificarPartePix (que chamaria atualizarRestanteMulti de volta)
  if (atualizarPix) {
    inputs.forEach((inp) => {
      const idNum = inp.id.replace("multi-valor-", "");
      const metodo = document.getElementById(`multi-metodo-${idNum}`)?.value;
      _atualizarPixInfo(idNum, metodo || "");
    });
  }
}

function _coletarMultiPagamento() {
  const partes = [];
  document.querySelectorAll('[id^="multi-parte-"]').forEach((div) => {
    const idStr = div.id.replace("multi-parte-", "");
    const metodo =
      document.getElementById(`multi-metodo-${idStr}`)?.value || "";
    const valor =
      parseFloat(document.getElementById(`multi-valor-${idStr}`)?.value) || 0;
    const troco =
      document.getElementById(`multi-troco-val-${idStr}`)?.value || "";
    if (metodo && valor > 0)
      partes.push({ metodo, valor, troco: troco || null });
  });
  return partes;
}

async function calcularFrete() {
  const btn = document.getElementById("btn-gps");
  const msg = document.getElementById("frete-msg");
  const boxErro = document.getElementById("box-erro-gps");

  btn.innerText = "Localizando...";
  btn.disabled = true;

  if (!navigator.geolocation) {
    msg.innerHTML =
      '<span style="color:#e74c3c">GPS não disponível neste dispositivo</span>';
    boxErro.style.display = "block";
    btn.innerText = "📍 Calcular Frete";
    btn.disabled = false;
    return;
  }

  // Verifica se a permissão já foi bloqueada antes de chamar getCurrentPosition
  if (navigator.permissions) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "denied") {
          // Permissão bloqueada permanentemente no browser — instrui o usuário
          msg.innerHTML =
            '<span style="color:#e74c3c">⚠️ GPS bloqueado no navegador.</span>';
          boxErro.innerHTML = `
          <p><strong><i class="fas fa-lock"></i> Permissão de localização bloqueada</strong></p>
          <p style="margin-top:6px;font-size:0.85rem">Para habilitar: clique no ícone de cadeado/info na barra de endereço do navegador → <strong>Localização</strong> → <strong>Permitir</strong> → recarregue a página.</p>
          <label style="display:flex;align-items:center;gap:10px;margin-top:10px;cursor:pointer;">
            <input type="checkbox" id="check-sem-gps" style="width:20px;height:20px;">
            <span data-lang-key="gps-erro-check">Enviaré mi ubicación por WhatsApp</span>
          </label>`;
          boxErro.style.display = "block";
          btn.innerText = "📍 Tentar Novamente";
          btn.disabled = false;
          return;
        }
        // Permissão OK ou ainda não decidida — chama normalmente
        _executarGetPosition(btn, msg, boxErro);
      })
      .catch(() => {
        // API permissions não suportada — tenta diretamente
        _executarGetPosition(btn, msg, boxErro);
      });
  } else {
    _executarGetPosition(btn, msg, boxErro);
  }
}

function _executarGetPosition(btn, msg, boxErro) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      localCliente = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const dist = calcularDistancia(
        COORD_LOJA.lat,
        COORD_LOJA.lng,
        localCliente.lat,
        localCliente.lng,
      );

      // === TABELA DE FRETE DINÂMICA (configurada no admin) ===
      // ATENÇÃO: deve ser IDÊNTICO ao index.ts (Edge Function) e admin.js calcularFretePDV
      // Faixas: [0-1], [1.1-2], ..., [19.1-20], >20 = a combinar
      const LIMITES_KM = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ];
      let freteIndex = -1;
      for (let i = 0; i < LIMITES_KM.length; i++) {
        if (dist <= LIMITES_KM[i]) {
          freteIndex = i;
          break;
        }
      }

      if (freteIndex === -1) {
        // Acima de 20km
        freteCalculado = -1; // sentinela: a combinar
        msg.innerHTML = `<span style="color:#e67e22">⚠️ Distância: ${dist.toFixed(1)}km — Frete <strong>a combinar</strong> pelo WhatsApp.</span>`;
        msg.style.color = "#e67e22";
        boxErro.style.display = "none";
        btn.innerText = "✅ Localização OK";
        btn.disabled = false;
        atualizarTotalCheckout();
        return;
      }

      if (TABELA_FRETE && TABELA_FRETE[freteIndex] !== undefined) {
        // Verifica se a faixa está marcada como "a combinar" no admin
        if (TABELA_FRETE[freteIndex].acombinar === true) {
          freteCalculado = -1; // sentinela: a combinar
          msg.innerHTML = `<span style="color:#e67e22">⚠️ Distância: ${dist.toFixed(1)}km — Frete <strong>a combinar</strong> pelo WhatsApp.</span>`;
          msg.style.color = "#e67e22";
          boxErro.style.display = "none";
          btn.innerText = "✅ Localização OK";
          btn.disabled = false;
          atualizarTotalCheckout();
          return;
        }
        freteCalculado = TABELA_FRETE[freteIndex].loja || 0;
        freteMotoboy = TABELA_FRETE[freteIndex].motoboy || 0;
      } else {
        // Fallback se tabela não configurada: faixas padrão antigas
        if (dist <= 3.3) freteCalculado = 6000;
        else if (dist <= 4.2) freteCalculado = 12000;
        else if (dist <= 5.2) freteCalculado = 18000;
        else if (dist <= 6.2) freteCalculado = 24000;
        else {
          const kmExtra = Math.ceil(dist - 6.2);
          freteCalculado = 24000 + kmExtra * 3000;
        }
        freteMotoboy = freteCalculado; // sem tabela, assume igual ao loja
      }

      msg.innerHTML = `<span style="color:#27ae60">✅ Distância: ${dist.toFixed(1)}km - Frete: Gs ${freteCalculado.toLocaleString("es-PY")}</span>`;
      msg.style.color = "#27ae60";
      boxErro.style.display = "none";

      btn.innerText = "✅ Localização OK";
      btn.disabled = true;
      atualizarTotalCheckout();
    },
    (err) => {
      let errMsg = "Não foi possível obter sua localização.";
      let instrucao = "";
      if (err.code === 1) {
        // PERMISSION_DENIED
        errMsg = "⚠️ Permissão de GPS negada.";
        instrucao =
          '<p style="margin-top:6px;font-size:0.85rem">Para habilitar: clique no ícone de cadeado/info na barra de endereço → <strong>Localização</strong> → <strong>Permitir</strong> → recarregue a página.</p>';
      } else if (err.code === 2) {
        // POSITION_UNAVAILABLE
        errMsg = "⚠️ Localização indisponível. Verifique se o GPS está ativo.";
      } else if (err.code === 3) {
        // TIMEOUT
        errMsg = "⚠️ Tempo esgotado ao obter localização. Tente novamente.";
      }
      msg.innerHTML = `<span style="color:#e74c3c">${errMsg}</span>`;
      boxErro.innerHTML = `
        <p><strong><i class="fas fa-info-circle"></i> GPS não funcionou?</strong></p>
        ${instrucao}
        <p style="margin-top:6px">Marque a opção abaixo para combinar o frete pelo WhatsApp.</p>
        <label style="display:flex;align-items:center;gap:10px;margin-top:8px;cursor:pointer;">
          <input type="checkbox" id="check-sem-gps" style="width:20px;height:20px;">
          <span data-lang-key="gps-erro-check">Enviaré mi ubicación por WhatsApp</span>
        </label>`;
      boxErro.style.display = "block";
      btn.innerText = "📍 Tentar Novamente";
      btn.disabled = false;
    },
    { timeout: 12000, maximumAge: 60000, enableHighAccuracy: true },
  );
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==========================================
// 8. ENVIO DO PEDIDO
// ==========================================
// ── Trava global anti-duplo-clique ──────────────────────────────
let _enviandoPedido = false;

async function enviarZap() {
  // Bloqueia se já está processando
  if (_enviandoPedido) return;
  _enviandoPedido = true;

  // Desabilita e sinaliza o botão visualmente
  const _btnEnviar = document.querySelector("[onclick=\"enviarZap()\"]")
                  || document.querySelector("[onclick='enviarZap()']");
  const _textoOriginal = _btnEnviar ? _btnEnviar.innerHTML : "";
  if (_btnEnviar) {
    _btnEnviar.disabled     = true;
    _btnEnviar.style.opacity = "0.6";
    _btnEnviar.innerHTML    = "⏳ Processando...";
  }

  // Libera automaticamente após 60 s (garante que não trava para sempre)
  const _liberarBotao = () => {
    _enviandoPedido = false;
    if (_btnEnviar) {
      _btnEnviar.disabled     = false;
      _btnEnviar.style.opacity = "1";
      _btnEnviar.innerHTML    = _textoOriginal;
    }
  };
  const _timerLiberar = setTimeout(_liberarBotao, 60000);

  try {

  const nome = document.getElementById("cli-nome").value.trim();
  const ddi = document.getElementById("cli-ddi").value;
  const tel = document.getElementById("cli-tel").value.trim();
  const pag = document.getElementById("forma-pag").value;
  const nasc = document.getElementById("cli-nasc")
    ? document.getElementById("cli-nasc").value
    : null;

  // Resolve o nome final do método de pagamento (CartaoBR tem sub-tipos)
  const pagFinal =
    pag === "CartaoBR"
      ? _cartaoBRTipo === "debito"
        ? "Cartão BR - Débito"
        : "Cartão BR - Crédito"
      : pag;

  if (!nome || !tel || !pag)
    return alert("Preencha todos os campos obrigatórios!");

  // Troco obrigatório quando pagamento em Efetivo
  if (pag === "Efetivo") {
    const trocoVal = document.getElementById("troco-valor").value.trim();
    if (!trocoVal || parseFloat(trocoVal.replace(/[^\d]/g, "")) <= 0) {
      document.getElementById("troco-valor").focus();
      document.getElementById("troco-valor").style.borderColor = "#e74c3c";
      return alert("⚠️ Informe o valor em dinheiro para cálculo do troco!");
    }
    document.getElementById("troco-valor").style.borderColor = "";
  }

  // Promoções do dia: bloquear pagamento com Cartão
  const temPromoItem = carrinho.some((item) => {
    // Verifica se algum item do carrinho pertence a categoria promocoes_do_dia
    for (const key in MENU) {
      if (key === "promocoes_do_dia") {
        const found = MENU[key].find(
          (m) => m.id === item.id || m.nome === item.nome,
        );
        if (found) return true;
      }
    }
    return false;
  });
  if (temPromoItem && pag === "Cartao") {
    return alert(
      '⚠️ Produtos da "Promoção do Dia" não aceitam pagamento com Cartão.',
    );
  }

  // Pedido duplo: bloqueia se mesmo carrinho enviado no último 1h
  const _agora = Date.now();
  const _ultimoHash = localStorage.getItem("app_last_hash");
  const _ultimoTs = parseInt(localStorage.getItem("app_last_ts") || "0");
  const _hashAtual = carrinho
    .map((i) => i.nome + i.qtd)
    .sort()
    .join("|");
  if (_ultimoHash === _hashAtual && _agora - _ultimoTs < 3600000) {
    return alert(
      "🚫 Seu pedido anterior foi computado, estamos bloqueando esta segunda tentativa.",
    );
  }

  // Valida multipagamento
  if (pag === "Multipagamento") {
    const partes = _coletarMultiPagamento();
    if (partes.length < 2)
      return alert(
        "Adicione pelo menos 2 formas de pagamento para o multipagamento.",
      );
    const somaPartes = partes.reduce((s, p) => s + p.valor, 0);
    const totalCheck =
      carrinho.reduce((a, i) => a + i.preco * i.qtd, 0) -
      (cupomAplicado?.tipo === "percentual"
        ? Math.round(
            carrinho.reduce((a, i) => a + i.preco * i.qtd, 0) *
              (cupomAplicado.valor / 100),
          )
        : 0) +
      (modoEntrega === "delivery"
        ? cupomAplicado?.tipo === "frete"
          ? 0
          : freteCalculado
        : 0);
    if (Math.abs(somaPartes - totalCheck) > 1) {
      return alert(
        `A soma dos pagamentos (Gs ${somaPartes.toLocaleString("es-PY")}) não confere com o total do pedido (Gs ${totalCheck.toLocaleString("es-PY")}). Ajuste os valores.`,
      );
    }
  }

  if (
    modoEntrega === "delivery" &&
    !localCliente &&
    !document.getElementById("check-sem-gps")?.checked
  ) {
    alert(
      "Por favor, calcule o frete ou marque a opção de enviar localização pelo WhatsApp",
    );
    return;
  }

  const usouPlanoB = document.getElementById("check-sem-gps")?.checked;
  const ref = document.getElementById("cli-ref").value || "";
  const telCompleto = ddi + tel;

  const totalItens = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
  let desconto = 0;
  let freteAplicado = Math.max(0, freteCalculado); // guard: -1 = a combinar => 0

  if (cupomAplicado) {
    if (cupomAplicado.tipo === "percentual") {
      desconto = Math.round(totalItens * (cupomAplicado.valor / 100));
    } else if (cupomAplicado.tipo === "frete") {
      freteAplicado = 0;
    }
  }

  const totalGeral =
    totalItens - desconto + (modoEntrega === "delivery" ? freteAplicado : 0);

  // 1. Salva no Banco PRIMEIRO para pegar o ID real
  let pedidoDbId = null;
  let numeroPedido = null;

  if (typeof supa !== "undefined") {
    const pedidoDb = {
      status: "pendente",
      tipo_entrega: modoEntrega,
      subtotal: totalItens,
      frete_cobrado_cliente: modoEntrega === "delivery" ? freteAplicado : 0,
      frete_motoboy: modoEntrega === "delivery" ? freteMotoboy : 0,
      desconto_cupom: desconto,
      total_geral: totalGeral,
      forma_pagamento: pagFinal,
      obs_pagamento:
        pag === "Efetivo"
          ? document.getElementById("troco-valor").value
          : pag === "Multipagamento"
            ? JSON.stringify(_coletarMultiPagamento())
            : "",
      itens: carrinho.map((i) => ({
        n: i.nome,
        nome: i.nome, // alias legível para admin/motoboy
        p: i.preco,
        q: i.qtd,
        qtd: i.qtd, // alias legível
        produto_id: i.produto_id || null, // ID real — desconto de estoque
        t: i.variacao || "",
        pr: i.preparo || "",
        m: i.montagem,
        o: i.obs,
        categoria_slug: i.categoria_slug || i.cat || "", // para filtro de bebidas no motoboy
        es_bebida: i.es_bebida || false,
      })),
      endereco_entrega: ref,
      geo_lat: localCliente ? localCliente.lat.toString() : null,
      geo_lng: localCliente ? localCliente.lng.toString() : null,
      cliente_nome: nome,
      cliente_telefone: telCompleto,
      dados_factura: document.getElementById("check-factura")?.checked
        ? {
            ruc: document.getElementById("cli-ruc")?.value || "",
            razao: document.getElementById("cli-zao")?.value || "",
          }
        : null,
    };

    // Tenta INSERT; se falhar por coluna inexistente (dados_factura), faz fallback sem ela
    let payloadFinal = { ...pedidoDb };
    let { data: pedidoSalvo, error } = await supa
      .from("pedidos")
      .insert([payloadFinal])
      .select()
      .single();

    if (error) {
      console.error(
        "Erro ao salvar pedido — código:",
        error.code,
        "| msg:",
        error.message,
        "| hint:",
        error.hint,
      );

      // Fallback: coluna dados_factura pode não existir ainda no banco
      // SQL para criar: ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS dados_factura JSONB;
      if (
        (error.code === "42703" || error.message?.includes("dados_factura")) &&
        payloadFinal.dados_factura !== undefined
      ) {
        console.warn(
          "[pedido] Coluna dados_factura ausente — tentando sem ela...",
        );
        delete payloadFinal.dados_factura;
        const res2 = await supa
          .from("pedidos")
          .insert([payloadFinal])
          .select()
          .single();
        if (res2.error) {
          console.error("Erro no insert de fallback:", res2.error);
          alert(
            `⚠️ Erro ao salvar pedido.\n\nDetalhe: ${res2.error.message}\n\nMostre este erro ao suporte.`,
          );
          return;
        }
        pedidoSalvo = res2.data;
      } else {
        alert(
          `⚠️ Erro ao salvar pedido no sistema.\n\nDetalhe: ${error.message}\n\nTente novamente ou contate o suporte.`,
        );
        return;
      }
    }

    if (pedidoSalvo) {
      pedidoDbId = pedidoSalvo.id;
      numeroPedido = pedidoSalvo.id; // USA O ID DO BANCO
      console.log("✅ Pedido salvo com ID:", pedidoDbId);

      // Cadastra ou atualiza o cliente automaticamente pelo frontend
      if (typeof supa !== "undefined" && nasc) {
        try {
          const telClean = telCompleto.replace(/\D/g, "");
          let { data: clienteEx } = await supa
            .from("clientes")
            .select("id")
            .or(`telefone.eq.${telCompleto},telefone.eq.${telClean}`)
            .maybeSingle();

          if (!clienteEx) {
            await supa.from("clientes").insert([
              {
                nome: nome,
                telefone: telCompleto,
                data_nascimento: nasc,
                saldo_cashback: 0,
                total_gasto: totalGeral,
              },
            ]);
            console.log(
              "✅ Novo cliente criado automaticamente com data de nascimento!",
            );
          } else {
            // Atualiza apenas se a data de nascimento estiver vazia
            await supa
              .from("clientes")
              .update({ data_nascimento: nasc })
              .eq("id", clienteEx.id)
              .is("data_nascimento", null);
          }
        } catch (e) {
          console.error("Erro ao salvar cliente automaticamente:", e);
        }
      }

      // Gera cashback para o cliente (lógica local — crm.js não é carregado no app)
      try {
        const telCashback = telCompleto;
        if (telCashback && totalGeral > 0) {
          // Busca configuração de cashback
          const { data: cfgCash } = await supa
            .from('configuracoes')
            .select('cashback_percentual, cashback_validade_dias')
            .maybeSingle();
          const pctCash  = cfgCash?.cashback_percentual   ?? 10;
          const valDias  = cfgCash?.cashback_validade_dias ?? 30;
          const valorCash = Math.round(totalGeral * pctCash / 100);
          if (valorCash > 0) {
            // Busca cliente pelo telefone
            const telCleanCash = telCashback.replace(/\D/g, '');
            let { data: cliCash } = await supa
              .from('clientes')
              .select('id, saldo_cashback, total_gasto')
              .or(`telefone.eq.${telCashback},telefone.eq.${telCleanCash}`)
              .maybeSingle();
            if (cliCash) {
              const expiraCash = new Date();
              expiraCash.setDate(expiraCash.getDate() + valDias);
              await supa.from('cashback_transacoes').insert([{
                cliente_id:       cliCash.id,
                cliente_telefone: telCashback,
                pedido_id:        pedidoDbId,
                tipo:             'credito',
                valor:            valorCash,
                validade_dias:    valDias,
                expira_em:        expiraCash.toISOString(),
                usado:            false,
              }]);
              await supa.from('clientes')
                .update({
                  saldo_cashback: (cliCash.saldo_cashback || 0) + valorCash,
                  total_gasto:    (cliCash.total_gasto    || 0) + totalGeral,
                })
                .eq('id', cliCash.id);
              console.log(`✅ Cashback gerado: Gs ${valorCash} para ${telCashback}`);
            }
          }
        }
      } catch (eCash) {
        console.warn('Cashback não gerado (não crítico):', eCash.message);
      }

      // Incrementa contador de usos do cupom com UPDATE atômico (evita race condition)
      if (cupomAplicado?.id) {
        await supa
          .rpc("incrementar_uso_cupom", { cupom_id: cupomAplicado.id })
          .then(({ error }) => {
            if (error) {
              // Fallback: update simples se RPC não existir
              const novosUsos = (cupomAplicado.usos_realizados || 0) + 1;
              return supa
                .from("cupons")
                .update({ usos_realizados: novosUsos })
                .eq("id", cupomAplicado.id);
            }
          })
          .catch(() => {});
      }
    }
  }

  // Salva localmente para "Repetir Pedido"
  localStorage.setItem("app_last", JSON.stringify(carrinho));
  localStorage.setItem("app_user", JSON.stringify({ nome, tel, nasc }));

  // 2. Usa o número real do pedido na mensagem
  const idDisplay = numeroPedido || "TEMP";

  // 3. Monta Mensagem WhatsApp
  const _nomeRestaurante = NOME_RESTAURANTE_APP || "Restaurante";
  let msg = `🛒 PEDIDO #${idDisplay} — ${_nomeRestaurante.toUpperCase()}\n`;
  msg += `--------------------------\n`;
  msg += `👤 Cliente: ${nome}\n`;
  msg += `📱 Tel: ${telCompleto}\n`;
  msg += `🛵 Tipo: ${modoEntrega === "delivery" ? "DELIVERY" : modoEntrega === "local" ? "COMER NO LOCAL 🍽️" : "RETIRADA"}\n`;

  if (modoEntrega === "delivery") {
    if (localCliente) {
      msg += `📍 Maps: https://maps.google.com/?q=${localCliente.lat},${localCliente.lng}\n`;
      // Frete real (distância) sempre mostrado para motoboy, mesmo se cliente ganhou grátis
      const _freteReal = freteCalculado;
      const _fretePago = freteAplicado;
      if (_freteReal > 0 && _fretePago === 0) {
        msg += `🛵 Delivery: FRETE GRÁTIS (valor: Gs ${_freteReal.toLocaleString("es-PY")})\n`;
      } else if (_freteReal > 0) {
        msg += `🛵 Delivery: Gs ${_fretePago.toLocaleString("es-PY")}\n`;
      }
    } else if (usouPlanoB) {
      msg += `📍 *Localização:* Enviarei aqui no WhatsApp 📎\n`;
      msg += `🛵 *Delivery:* A COMBINAR\n`;
    }
    msg += `🏠 Ref: ${ref}\n`;
  }

  msg += `--------------------------\n`;
  carrinho.forEach((item) => {
    msg += `${item.qtd}x ${item.nome}`;
    if (item.variacao) msg += ` — ${item.variacao}`;
    if (item.preparo) msg += ` [${item.preparo}]`;
    msg += `\n`;
    if (item.montagem && item.montagem.length > 0)
      msg += `   + ${item.montagem.join(", ")}\n`;
    if (item.obs) msg += `   Obs: ${item.obs}\n`;
  });

  msg += `--------------------------\n`;
  msg += `Subtotal: Gs ${totalItens.toLocaleString("es-PY")}\n`;

  if (desconto > 0) {
    msg += `Desconto (${cupomAplicado.codigo}): -Gs ${desconto.toLocaleString("es-PY")}\n`;
  }

  if (modoEntrega === "delivery" && !usouPlanoB) {
    msg += `Delivery: Gs ${freteAplicado.toLocaleString("es-PY")}\n`;
  }
  msg += `TOTAL: Gs ${totalGeral.toLocaleString("es-PY")}\n`;
  msg += `--------------------------\n`;

  // Pagamento e Troco
  if (pag === "Efetivo") {
    const trocoVal = document.getElementById("troco-valor").value;
    msg += `💰 Pagamento: Efetivo (Troco p/: ${trocoVal})\n`;
  } else if (pag === "Multipagamento") {
    const partes = _coletarMultiPagamento();
    msg += `💰 Pagamento dividido (${partes.length} formas):\n`;
    partes.forEach((p, i) => {
      msg += `   ${i + 1}. ${p.metodo}: Gs ${p.valor.toLocaleString("es-PY")}`;
      if (p.troco)
        msg += ` (Troco p/ Gs ${parseFloat(p.troco).toLocaleString("es-PY")})`;
      msg += "\n";
    });
  } else {
    msg += `💰 Pagamento: ${pag}\n`;
  }

  // Avisos de Pix/Alias (Bilíngue)
  if (pag === "Pix" || pag === "Transferencia" || pag === "QrPy") {
    if (pag === "Pix") {
      const totalBrl =
        COTACAO_REAL > 0 ? (totalGeral / COTACAO_REAL).toFixed(2) : "---";
      msg += `\n💠 Chave Pix: ${CHAVE_PIX}\n`;
      msg += `💰 Valor em Reais: R$ ${totalBrl}\n`;
    }
    if (pag === "Transferencia") msg += `\n📎 Alias: ${ALIAS_PY}\n`;
    if (pag === "QrPy")
      msg += `\n📱 Pago por QR Paraguay (Tigo / Personal / Bancard)\n`;
    msg += `\n⚠️ *Envie o comprovante após o pagamento!*\n`;
  }

  // Para multipagamento: avisar sobre Pix ou Transferencia se incluídos
  if (pag === "Multipagamento") {
    const partes = _coletarMultiPagamento();
    partes.forEach((p, idx) => {
      if (p.metodo === "Pix") {
        const valBrl =
          COTACAO_REAL > 0 ? (p.valor / COTACAO_REAL).toFixed(2) : "---";
        msg += `\n💠 Pix (forma ${idx + 1}): Chave ${CHAVE_PIX} — R$ ${valBrl}\n`;
      }
      if (p.metodo === "Transferencia") {
        msg += `\n📎 Alias (forma ${idx + 1}): ${ALIAS_PY}\n`;
      }
      if (p.metodo === "QrPy") {
        msg += `\n📱 QR Paraguay (forma ${idx + 1}): Tigo / Personal / Bancard\n`;
      }
    });
    const temDigital = partes.some(
      (p) =>
        p.metodo === "Pix" ||
        p.metodo === "Transferencia" ||
        p.metodo === "QrPy",
    );
    if (temDigital)
      msg += `\n⚠️ *Envie o(s) comprovante(s) após o pagamento!*\n`;
  }

  // Factura
  if (document.getElementById("check-factura").checked) {
    msg += `\n📄 RUC: ${document.getElementById("cli-ruc").value}\nRazão: ${document.getElementById("cli-zao").value}\n`;
  }

  // Hash anti-duplicata salvo APENAS na abertura do WhatsApp (em _abrirZapEFechar)
  // Modal de confirmação 5s antes de abrir WhatsApp
  await _mostrarModalEnvio(msg, numeroPedido);

  } catch (err) {
    console.error("[enviarZap] Erro inesperado:", err);
    alert("Ocorreu um erro ao processar o pedido. Tente novamente.");
  } finally {
    clearTimeout(_timerLiberar);
    _liberarBotao();
  }
}

// Modal: "Seu pedido será validado somente após enviar no WhatsApp"
function _mostrarModalEnvio(msg, numeroPedido) {
  return new Promise((resolve) => {
    const _old = document.getElementById("modal-envio-zap");
    if (_old) _old.remove();

    // Injeta animação de pulsar (só uma vez)
    if (!document.getElementById("zap-pulse-style")) {
      const st = document.createElement("style");
      st.id = "zap-pulse-style";
      st.textContent = `
        @keyframes zapPulse {
          0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.7); transform: scale(1); }
          50%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); transform: scale(1.03); }
          100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); transform: scale(1); }
        }
        #btn-abrir-zap { animation: zapPulse 1.2s ease-in-out infinite; }
      `;
      document.head.appendChild(st);
    }

    const modal = document.createElement("div");
    modal.id = "modal-envio-zap";
    modal.style.cssText = [
      "position:fixed;inset:0;z-index:99999",
      "background:rgba(0,0,0,0.75)",
      "display:flex;align-items:center;justify-content:center",
      "padding:20px;box-sizing:border-box",
    ].join(";");
    modal.innerHTML = `
      <div style="background:white;border-radius:20px;padding:30px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4)">
        <div style="font-size:3.5rem;margin-bottom:10px">📱</div>
        <h3 style="margin:0 0 8px;font-size:1.2rem;color:#1a1a2e">Pedido registrado! ✅</h3>
        <p style="margin:0 0 20px;font-size:0.93rem;color:#555;line-height:1.55">
          Para <strong>confirmar seu pedido</strong>, toque no botão abaixo e envie a mensagem no WhatsApp.
          <br><span style="color:#e74c3c;font-weight:700">Sem o envio, o pedido não será aceito.</span>
        </p>
        <button id="btn-abrir-zap"
          style="width:100%;padding:18px;background:#25D366;color:white;border:none;border-radius:14px;font-size:1.1rem;font-weight:800;cursor:pointer;letter-spacing:0.3px;">
          <i class="fab fa-whatsapp"></i> &nbsp;Enviar mensagem no WhatsApp
        </button>
        <p style="margin:14px 0 0;font-size:0.75rem;color:#aaa;">Este aviso não fecha sozinho. Envie a mensagem para continuar.</p>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById("btn-abrir-zap").onclick = () => {
      _abrirZapEFechar(msg, numeroPedido, modal, resolve);
    };
  });
}

function _abrirZapEFechar(msg, numeroPedido, modal, resolve) {
  window.open(
    `https://wa.me/${WHATSAPP_LOJA_APP || FONE_LOJA}?text=${encodeURIComponent(msg)}`,
    "_blank",
  );
  if (modal) modal.remove();

  // Salva hash anti-duplicata apenas após WhatsApp abrir
  try {
    const _hashFinal = (typeof carrinho !== "undefined" ? carrinho : [])
      .map((i) => i.nome + i.qtd)
      .sort()
      .join("|");
    localStorage.setItem("app_last_hash", _hashFinal);
    localStorage.setItem("app_last_ts", Date.now().toString());
  } catch (e) {}

  // Limpa carrinho e fecha checkout
  carrinho = [];
  cupomAplicado = null;
  MODO_AGENDAMENTO = false;
  DATA_AGENDAMENTO = null;
  const indicador = document.getElementById("indicador-agendamento");
  if (indicador) indicador.remove();

  // Limpa backup imediatamente para não restaurar na próxima visita
  try {
    localStorage.removeItem("app_carrinho_backup");
    localStorage.removeItem("app_carrinho_backup_time");
  } catch (e) {}

  updateUI();
  fecharCheckout();

  // Card de tracking + persistir ID para timer/confirmação/cancelamento
  if (numeroPedido) {
    mostrarCardTracking(numeroPedido);
    iniciarTracking(numeroPedido, numeroPedido);
  }

  resolve();
}

// ==========================================
// 9. DADOS LOCAIS & REPETIR PEDIDO (Funções Restauradas)
// ==========================================
// ═══════════════════════════════════════════════════════════
//  ÚLTIMA COMPRA — validação contra menu atual
// ═══════════════════════════════════════════════════════════

// Verifica se um item do carrinho salvo ainda existe no menu ativo
function _menuContemProduto(item) {
  for (const key of Object.keys(MENU)) {
    const found = (MENU[key] || []).find(p =>
      (item.produto_id && p.id === item.produto_id) ||
      (p.nome || "").toLowerCase() === (item.nome || "").toLowerCase()
    );
    if (found) return true;
  }
  return false;
}

// Chamada APÓS renderMenu() para enriquecer o box com disponibilidade real
function _atualizarUltimaCompra() {
  const last = (() => {
    try { return JSON.parse(localStorage.getItem("app_last")); } catch { return null; }
  })();
  const box = document.getElementById("buy-again-container");
  if (!last || !Array.isArray(last) || last.length === 0) {
    if (box) box.style.display = "none";
    return;
  }

  const comDisp = last.map(i => ({ ...i, _disponivel: _menuContemProduto(i) }));
  const algumDisp = comDisp.some(i => i._disponivel);

  if (!box) return;
  box.style.display = "block";

  const ul = document.getElementById("last-order-list");
  if (ul) {
    ul.innerHTML = "";
    comDisp.forEach(i => {
      const li = document.createElement("li");
      li.style.cssText = "border-bottom:1px dashed #eee;padding:6px 0;display:flex;align-items:center;gap:6px;font-size:0.9rem;";
      if (i._disponivel) {
        li.innerHTML = `<b>${i.qtd}x</b> <span style="color:#333">${i.nome}</span>`;
      } else {
        li.innerHTML = `
          <b style="color:#bbb">${i.qtd}x</b>
          <span style="color:#bbb;text-decoration:line-through">${i.nome}</span>
          <span style="font-size:0.7rem;background:#fee2e2;color:#e74c3c;
                       font-weight:700;padding:1px 6px;border-radius:10px;white-space:nowrap">
            Indisponível
          </span>`;
      }
      ul.appendChild(li);
    });
  }

  // Bloqueia botão se não há nada disponível
  const btnRep = box.querySelector("[onclick='repetirPedido()']");
  if (btnRep) {
    btnRep.disabled = !algumDisp;
    btnRep.style.opacity = algumDisp ? "1" : "0.45";
    btnRep.style.cursor  = algumDisp ? "pointer" : "not-allowed";
    btnRep.title = algumDisp ? "" : "Nenhum item disponível no menu atual";
  }
}

function carregarDadosLocal() {
  const user = JSON.parse(localStorage.getItem("app_user"));
  if (user) {
    if (document.getElementById("cli-nome"))
      document.getElementById("cli-nome").value = user.nome;
    if (document.getElementById("cli-tel"))
      document.getElementById("cli-tel").value = user.tel;
    if (document.getElementById("cli-nasc") && user.nasc)
      document.getElementById("cli-nasc").value = user.nasc;
  }

  const last = JSON.parse(localStorage.getItem("app_last"));
  const box = document.getElementById("buy-again-container");

  if (last && Array.isArray(last) && last.length > 0) {
    if (box) {
      box.style.display = "block";
      const ul = document.getElementById("last-order-list");
      if (ul) {
        ul.innerHTML = "";
        last.forEach((i) => {
          ul.innerHTML += `<li style="border-bottom: 1px dashed #eee; padding: 5px 0;"><b>${i.qtd}x</b> ${i.nome}</li>`;
        });
      }
    }
  } else {
    if (box) box.style.display = "none";
  }
}

function repetirPedido() {
  const last = (() => {
    try { return JSON.parse(localStorage.getItem("app_last")); } catch { return null; }
  })();
  if (!last || !Array.isArray(last) || last.length === 0) return;

  const disponiveis   = last.filter(i => _menuContemProduto(i));
  const indisponiveis = last.length - disponiveis.length;

  if (disponiveis.length === 0) {
    mostrarToast("Nenhum item do pedido anterior está disponível no menu atual.", "warning", 4000);
    return;
  }
  if (indisponiveis > 0) {
    mostrarToast(
      `${indisponiveis} item(s) indisponível(is) não foram adicionados.`,
      "warning", 4000
    );
  }

  carrinho = disponiveis;
  updateUI();
  abrirCheckout();
}

function clicarBanner(idProduto) {
  let produtoEncontrado = null;
  for (const key in MENU) {
    const item = MENU[key].find((i) => i.id == idProduto);
    if (item) {
      produtoEncontrado = item;
      break;
    }
  }

  if (produtoEncontrado) {
    abrirModal(produtoEncontrado);
  } else {
    console.error("Produto do banner não encontrado no menu carregado.");
    // Não damos alert para não incomodar caso o menu ainda esteja carregando
  }
}
// ==========================================
// 10. TRACKING DE PEDIDO — POLLING GARANTIDO
// ==========================================
// ARQUITETURA: polling a cada 5s como BASE (funciona sempre).
// Realtime como BÔNUS (mais rápido, mas fecha no plano free).
// O erro "CLOSED" no console é normal — o polling cobre.
let _trackingChannel = null; // canal Realtime (bônus)
let _pollingTracker = null; // setInterval de 5s (garantia)
let _lastMotoboyId = null; // motoboy_id do último polling
let _lastTrackedSt = ""; // evita re-render sem mudança
let _trackedId = null; // id do pedido em tracking

const TRACKER_STEPS = {
  pendente: {
    step: 1,
    icon: "📥",
    msg: "Pedido recebido! Aguardando confirmação...",
  },
  em_preparo: { step: 2, icon: "🔥", msg: "Seu pedido está sendo preparado!" },
  pronto_entrega: { step: 3, icon: "📦", msg: "Pronto! Aguardando motoboy..." },
  saiu_entrega: { step: 3, icon: "🛵", msg: "Seu pedido saiu para entrega!" },
  entregue: { step: 4, icon: "✅", msg: "Pedido entregue! Bom apetite! 🎉" },
  cancelado: {
    step: 0,
    icon: "❌",
    msg: "Pedido cancelado. Entre em contato conosco.",
  },
};

function iniciarTracking(pedidoDbId, uidTemporal) {
  if (!pedidoDbId) return;
  _trackedId = pedidoDbId;
  const uid = uidTemporal || pedidoDbId;

  try {
    localStorage.setItem("app_pedido_id", pedidoDbId);
    localStorage.setItem("app_pedido_uid", uid);
  } catch (e) {}

  _lastTrackedSt = "pendente";
  mostrarTracker("pendente", uid);

  _iniciarPollingTracking(pedidoDbId, uid); // GARANTIA (sempre funciona)
  _tentarCanalRealtime(pedidoDbId, uid); // BÔNUS (mais rápido quando disponível)

  // Solicita permissão via toast amigável (não o popup nativo diretamente)
  _solicitarPermissaoNotificacao(pedidoDbId);
}

// ==========================================
// PUSH NOTIFICATIONS — WEB PUSH API
// ==========================================

// Chave pública VAPID — gerada para este projeto.
// Para regenerar: supabase functions deploy + npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY =
  "BKxxLpv-sVS8bM23IzYXHHFyU8Qg60sVtTp-yfESunVSHfgKa0kl-MSERetCPNizCUvY3AofcgD0orH6DnB5SCU";

function _urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function _solicitarPermissaoNotificacao(pedidoId) {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  )
    return;
  if (Notification.permission === "granted") {
    _registrarPushSubscription(pedidoId);
    return;
  }
  if (Notification.permission === "denied") return;

  const toast = document.createElement("div");
  toast.id = "toast-push-permission";
  toast.style.cssText = [
    "position:fixed;bottom:90px;left:50%;transform:translateX(-50%)",
    "background:#1a1a2e;color:#fff;padding:14px 18px;border-radius:14px",
    "font-size:0.88rem;font-weight:500;z-index:99999",
    "box-shadow:0 8px 24px rgba(0,0,0,0.35);max-width:92vw;width:340px",
    "display:flex;flex-direction:column;gap:10px",
    "animation:fadeInUp .3s ease",
  ].join(";");
  toast.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:10px">
            <span style="font-size:1.4rem;flex-shrink:0">\uD83D\uDD14</span>
            <div>
                <div style="font-weight:700;margin-bottom:3px">Acompanhe seu pedido</div>
                <div style="font-size:0.81rem;opacity:0.85;line-height:1.45">
                    Autorize as notificações para receber atualizações mesmo com o app fechado.
                </div>
            </div>
        </div>
        <div style="display:flex;gap:8px">
            <button id="btn-push-sim" style="flex:1;padding:9px;background:#27ae60;color:#fff;border:none;border-radius:9px;font-weight:700;font-size:0.85rem;cursor:pointer">
                Autorizar 🔔
            </button>
            <button id="btn-push-nao" style="padding:9px 14px;background:rgba(255,255,255,0.12);color:#fff;border:none;border-radius:9px;font-size:0.82rem;cursor:pointer">
                Agora não
            </button>
        </div>
    `;
  document.body.appendChild(toast);

  document.getElementById("btn-push-sim").onclick = async () => {
    toast.remove();
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      _registrarPushSubscription(pedidoId);
      mostrarToast("\u2705 Notificações ativadas!", "success");
    }
  };
  document.getElementById("btn-push-nao").onclick = () => toast.remove();
  setTimeout(() => {
    const t = document.getElementById("toast-push-permission");
    if (t) t.remove();
  }, 12000);
}

async function _registrarPushSubscription(pedidoId) {
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    if (pedidoId && typeof supa !== "undefined") {
      await supa
        .from("pedidos")
        .update({ push_subscription: sub.toJSON() })
        .eq("id", parseInt(pedidoId));
      console.log("\u2705 Push subscription salva no pedido", pedidoId);
    }
  } catch (e) {
    console.warn(
      "Push subscription falhou (normal em HTTP ou iOS antigo):",
      e.message,
    );
  }
}

// ── POLLING: consulta o banco a cada 5s ──
function _iniciarPollingTracking(pedidoId, uid) {
  if (_pollingTracker) {
    clearInterval(_pollingTracker);
    _pollingTracker = null;
  }

  _pollingTracker = setInterval(async () => {
    try {
      const { data } = await supa
        .from("pedidos")
        .select("status, motoboy_id")
        .eq("id", pedidoId)
        .single();

      if (!data) return;

      const statusMudou = data.status !== _lastTrackedSt;

      // Atualiza o motoboy SEMPRE que estiver em saiu_entrega ou entregue
      // (garante que o motoboy aparece mesmo que o status não tenha mudado nesta rodada)
      if (typeof atualizarTrackingVisual === "function") {
        let motoboy = null;
        if (
          data.motoboy_id &&
          (data.status === "saiu_entrega" || data.status === "entregue")
        ) {
          const { data: m } = await supa
            .from("motoboys")
            .select("nome, telefone")
            .eq("id", data.motoboy_id)
            .single();
          motoboy = m;
        }
        // Atualiza visual se status OU motoboy_id mudaram
        const motoboyMudou =
          String(data.motoboy_id || "") !== String(_lastMotoboyId || "");
        if (statusMudou || motoboyMudou) {
          atualizarTrackingVisual(data.status, motoboy);
          _lastMotoboyId = data.motoboy_id;
        }
      }

      if (!statusMudou) return; // sem mudança de status — só motoboy pode ter mudado
      _lastTrackedSt = data.status;

      mostrarTracker(data.status, uid, motoboy);

      // Notificação push
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        TRACKER_STEPS[data.status]
      ) {
        new Notification(NOME_RESTAURANTE_APP || "Pedido", {
          body: TRACKER_STEPS[data.status].msg,
          icon: "/img/icon-192.png",
        });
      }

      if (data.status === "entregue" || data.status === "cancelado") {
        clearInterval(_pollingTracker);
        _pollingTracker = null;
        if (_trackingChannel) {
          _trackingChannel.unsubscribe();
          _trackingChannel = null;
        }
        setTimeout(() => {
          try {
            localStorage.removeItem("app_pedido_id");
            localStorage.removeItem("app_pedido_uid");
          } catch (e) {}
        }, 10000);
      }
    } catch (e) {
      /* falha silenciosa de rede */
    }
  }, 5000);
}

// ── REALTIME: bônus quando disponível ──
function _tentarCanalRealtime(pedidoId, uid) {
  try {
    if (_trackingChannel) {
      _trackingChannel.unsubscribe();
      _trackingChannel = null;
    }
    _trackingChannel = supa
      .channel(`app-track-${pedidoId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pedidos",
          filter: `id=eq.${pedidoId}`,
        },
        async (payload) => {
          const ns = payload.new?.status;
          if (!ns || ns === _lastTrackedSt) return;
          _lastTrackedSt = ns;

          // Busca motoboy do payload se disponível (evita esperar o próximo polling)
          let motoboy = null;
          const mbId = payload.new?.motoboy_id;
          if (mbId && (ns === "saiu_entrega" || ns === "entregue")) {
            try {
              const { data: m } = await supa
                .from("motoboys")
                .select("nome, telefone")
                .eq("id", mbId)
                .single();
              motoboy = m;
              _lastMotoboyId = mbId;
            } catch (_) {}
          }
          atualizarTrackingVisual(ns, motoboy);
          mostrarTracker(ns, uid, motoboy);
        },
      )
      .subscribe((st) => {
        // CLOSED é normal no plano free — polling já cobre
        if (st === "CLOSED" || st === "CHANNEL_ERROR") {
          _trackingChannel = null;
        }
      });
  } catch (e) {
    /* Realtime indisponível */
  }
}

// [Sistema legado mostrarTracker removido — usando versão track-order-card em L161]

function fecharTracker() {
  // Fecha tanto o tracker antigo quanto o novo card
  const tracker = document.getElementById("pedido-tracker");
  if (tracker) tracker.style.display = "none";
  const card = document.getElementById("track-order-card");
  if (card) card.style.display = "none";
  if (_trackingChannel) {
    _trackingChannel.unsubscribe();
    _trackingChannel = null;
  }
  if (_pollingTracker) {
    clearInterval(_pollingTracker);
    _pollingTracker = null;
  }
}

// Alias para o botão × do card de tracking no index.html
function fecharCardTracking() {
  fecharTracker();
}

// Restaura tracking ao recarregar a página
function restaurarTrackingSeExistir() {
  // Card de rastreio oculto por padrão - só aparece se houver pedido ativo
  const card = document.getElementById("track-order-card");
  if (card) card.style.display = "none";

  const savedId = localStorage.getItem("app_pedido_id");
  const savedUid = localStorage.getItem("app_pedido_uid");
  if (!savedId) return;

  console.log("🔄 Restaurando tracking para pedido:", savedId);
  if (typeof supa === "undefined") return;

  supa
    .from("pedidos")
    .select("status, motoboy_id, created_at")
    .eq("id", savedId)
    .single()
    .then(async ({ data, error }) => {
      if (error || !data) return;
      // Se já foi entregue ou cancelado, limpa e não mostra tracker
      if (data.status === "entregue" || data.status === "cancelado") {
        try {
          localStorage.removeItem("app_pedido_id");
          localStorage.removeItem("app_pedido_uid");
        } catch (e) {}
        return;
      }

      // REGRA 6H: tracker só aparece se o pedido tem menos de 6 horas
      if (data.created_at) {
        const diffHoras =
          (Date.now() - new Date(data.created_at).getTime()) / 3600000;
        if (diffHoras > 6) {
          try {
            localStorage.removeItem("app_pedido_id");
            localStorage.removeItem("app_pedido_uid");
          } catch (e) {}
          return;
        }
      }

      // Só mostra o card se houver pedido ativo
      if (card) card.style.display = "block";

      // Preenche input e abre resultado direto
      const input = document.getElementById("track-pedido-input");
      if (input) input.value = savedId;
      const tf = document.getElementById("track-form");
      if (tf) tf.style.display = "none";
      const tr = document.getElementById("track-result");
      if (tr) tr.style.display = "block";
      const tn = document.getElementById("track-numero");
      if (tn) tn.textContent = savedId;

      let motoboy = null;
      if (data.motoboy_id) {
        const { data: m } = await supa
          .from("motoboys")
          .select("nome, telefone")
          .eq("id", data.motoboy_id)
          .single();
        motoboy = m;
      }

      atualizarTrackingVisual(data.status, motoboy);
      _lastTrackedSt = data.status;
      _trackedId = savedId;

      _iniciarPollingTracking(savedId, savedUid);
      _tentarCanalRealtime(savedId, savedUid);
    });
}

async function aplicarCupom() {
  const codigo = document
    .getElementById("cupom-codigo")
    ?.value?.trim()
    .toUpperCase();
  const msgBox = document.getElementById("cupom-msg");

  if (!codigo) {
    msgBox.innerHTML = '<span style="color:#e74c3c">Digite um código</span>';
    msgBox.style.display = "block";
    return;
  }

  // Busca no banco
  const { data: cupom, error } = await supa
    .from("cupons")
    .select("*")
    .eq("codigo", codigo)
    .eq("ativo", true)
    .single();

  if (error || !cupom) {
    msgBox.innerHTML =
      '<span style="color:#e74c3c">❌ Cupom inválido ou inativo</span>';
    msgBox.style.display = "block";
    cupomAplicado = null;
    atualizarTotalCheckout();
    return;
  }

  // Verifica validade
  if (cupom.validade) {
    const vDate = new Date(cupom.validade + "T23:59:59");
    if (vDate < new Date()) {
      msgBox.innerHTML = '<span style="color:#e74c3c">❌ Cupom expirado</span>';
      msgBox.style.display = "block";
      cupomAplicado = null;
      atualizarTotalCheckout();
      return;
    }
  }

  // Verifica limite de usos
  if (cupom.limite_uso && cupom.limite_uso > 0) {
    const usados = cupom.usos_realizados || 0;
    if (usados >= cupom.limite_uso) {
      msgBox.innerHTML = `<span style="color:#e74c3c">❌ Este cupom atingiu o limite de ${cupom.limite_uso} usos</span>`;
      msgBox.style.display = "block";
      cupomAplicado = null;
      atualizarTotalCheckout();
      return;
    }
  }

  const subtotal = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
  if (subtotal < cupom.minimo) {
    msgBox.innerHTML = `<span style="color:#e74c3c">Valor mínimo: Gs ${cupom.minimo.toLocaleString("es-PY")}</span>`;
    msgBox.style.display = "block";
    cupomAplicado = null;
  } else {
    cupomAplicado = cupom;
    const restante = cupom.limite_uso
      ? ` (${cupom.limite_uso - (cupom.usos_realizados || 0)} restantes)`
      : "";
    msgBox.innerHTML = `<span style="color:#27ae60">✅ Cupom aplicado!${restante}</span>`;
    msgBox.style.display = "block";
  }

  atualizarTotalCheckout();
}
// =============================================
// NOVO SISTEMA DE TRACKING - CARD FIXO
// =============================================

// Mostrar card de tracking automaticamente após enviar pedido
function mostrarCardTracking(numeroPedido) {
  const card = document.getElementById("track-order-card");
  const input = document.getElementById("track-pedido-input");

  if (card && input) {
    card.style.display = "block";
    input.value = numeroPedido;
    buscarPedido(); // Busca automaticamente

    // Scroll suave até o card
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Voltar para busca
function voltarBusca() {
  document.getElementById("track-form").style.display = "block";
  document.getElementById("track-result").style.display = "none";
  document.getElementById("track-pedido-input").value = "";
}

// Buscar pedido por número
async function buscarPedido() {
  const input = document.getElementById("track-pedido-input");
  const numeroPedido = input ? input.value.trim() : "";

  if (!numeroPedido) {
    alert("Por favor, digite o número do pedido");
    return;
  }

  // Esconde form, mostra resultado
  document.getElementById("track-form").style.display = "none";
  document.getElementById("track-result").style.display = "block";
  document.getElementById("track-numero").textContent = numeroPedido;
  document.getElementById("track-status-msg").textContent = "Buscando...";

  try {
    // Busca no Supabase
    const { data: pedido, error } = await supa
      .from("pedidos")
      .select("*, motoboys(nome, telefone)")
      .eq("id", parseInt(numeroPedido))
      .single();

    if (error || !pedido) {
      document.getElementById("track-status-msg").textContent =
        "Pedido não encontrado";
      document.getElementById("track-icon").textContent = "❌";
      return;
    }

    // Atualiza status visual
    atualizarTrackingVisual(pedido.status, pedido.motoboys);

    // Inscreve no Realtime para atualizações
    iniciarTrackingRealtime(pedido.id);
  } catch (err) {
    console.error("Erro ao buscar pedido:", err);
    document.getElementById("track-status-msg").textContent =
      "Erro ao buscar pedido";
  }
}

// Atualizar visual do tracking
function atualizarTrackingVisual(status, motoboy) {
  const statusMap = {
    pendente: { msg: "Aguardando confirmação...", icon: "⏳", step: 1 },
    em_preparo: { msg: "🔥 Preparando seu pedido!", icon: "🔥", step: 2 },
    pronto_entrega: {
      msg: "📦 Pronto! Aguardando motoboy...",
      icon: "📦",
      step: 3,
    },
    saiu_entrega: {
      msg: "🛵 Seu pedido saiu para entrega!",
      icon: "🛵",
      step: 3,
    },
    entregue: { msg: "✅ Pedido entregue! Bom apetite!", icon: "✅", step: 4 },
    cancelado: {
      msg: "❌ Pedido cancelado. Fale conosco.",
      icon: "❌",
      step: 0,
    },
  };

  const info = statusMap[status] || statusMap["pendente"];

  document.getElementById("track-status-msg").textContent = info.msg;
  document.getElementById("track-icon").textContent = info.icon;

  // Ativa steps
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`track-step-${i}`);
    if (step) {
      if (i <= info.step) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    }
  }

  // Mostra info do motoboy se saiu para entrega
  const motoInfo = document.getElementById("track-motoboy-info");
  if (motoInfo) {
    if ((status === "saiu_entrega" || status === "entregue") && motoboy) {
      motoInfo.style.display = "block";
      document.getElementById("track-motoboy-nome").textContent =
        motoboy.nome || "Não informado";
      const telLink = document.getElementById("track-motoboy-tel");
      if (telLink && motoboy.telefone) {
        telLink.textContent = motoboy.telefone;
        telLink.href = `https://wa.me/${motoboy.telefone.replace(/\D/g, "")}`;
      }
    } else {
      motoInfo.style.display = "none";
    }
  }

  // Limpa botões dinâmicos anteriores
  const _trackResult = document.getElementById("track-result");
  ["btn-confirmar-entrega", "btn-editar-pedido", "btn-cancelar-pedido"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    },
  );

  if (status === "saiu_entrega") {
    // Botão confirmar recebimento
    if (_trackResult) {
      const _btn = document.createElement("button");
      _btn.id = "btn-confirmar-entrega";
      _btn.onclick = confirmarEntregaCliente;
      _btn.style.cssText =
        "width:100%;margin-top:14px;padding:14px 0;background:linear-gradient(135deg,#27ae60,#2ecc71);color:white;border:none;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(39,174,96,0.35)";
      _btn.innerHTML = "✅ Confirmar Recebimento do Pedido";
      _trackResult.appendChild(_btn);
    }
    // Inicia timer auto-confirm se ainda não iniciado
    const _pedidoLocal = localStorage.getItem("app_pedido_id");
    if (_pedidoLocal && typeof iniciarTimerAutoConfirmacao === "function") {
      if (!localStorage.getItem("autoConfirmExpiry_" + _pedidoLocal)) {
        iniciarTimerAutoConfirmacao(_pedidoLocal);
      }
    }
  } else if (status === "pendente") {
    // Botão editar pedido (só enquanto pendente)
    if (_trackResult) {
      const _btnEdit = document.createElement("button");
      _btnEdit.id = "btn-editar-pedido";
      _btnEdit.onclick = abrirEdicaoPedido;
      _btnEdit.style.cssText =
        "width:100%;margin-top:10px;padding:12px 0;background:linear-gradient(135deg,#f39c12,#e67e22);color:white;border:none;border-radius:12px;font-weight:700;font-size:0.95rem;cursor:pointer;box-shadow:0 4px 12px rgba(243,156,18,0.35)";
      _btnEdit.innerHTML = "✏️ Editar Pedido";
      _trackResult.appendChild(_btnEdit);
    }
  }

  // Botão cancelar — disponível em pendente e em_preparo
  if (["pendente", "em_preparo"].includes(status) && _trackResult) {
    const _btnCancel = document.createElement("button");
    _btnCancel.id = "btn-cancelar-pedido";
    _btnCancel.onclick = solicitarCancelamentoCliente;
    _btnCancel.style.cssText =
      "width:100%;margin-top:8px;padding:10px 0;background:transparent;color:#e74c3c;border:1.5px solid #e74c3c;border-radius:12px;font-weight:600;font-size:0.85rem;cursor:pointer;";
    _btnCancel.innerHTML = "🚫 Solicitar Cancelamento";
    _trackResult.appendChild(_btnCancel);
  }
}

// ── EDIÇÃO DE PEDIDO PELO CLIENTE ────────────────────────────────
function abrirEdicaoPedido() {
  const pedidoId = localStorage.getItem("app_pedido_id");
  if (!pedidoId) return;

  // Fecha tracking e abre carrinho com itens atuais
  const modal = document.createElement("div");
  modal.id = "modal-edicao-pedido";
  modal.style.cssText =
    "position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";
  modal.innerHTML = `
      <div style="background:white;border-radius:20px;padding:28px 22px;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4)">
        <div style="font-size:2.5rem;margin-bottom:12px">✏️</div>
        <h3 style="margin:0 0 10px;font-size:1.1rem;color:#1a1a2e">Editar Pedido</h3>
        <p style="margin:0 0 16px;font-size:0.88rem;color:#555;line-height:1.5">
          Seu pedido ainda não foi aceito. Você pode:<br>
          <strong>• Adicionar ou remover itens</strong><br>
          <strong>• Alterar observações</strong>
        </p>
        <div style="background:#fff8e6;border:1.5px solid #f0a500;border-radius:10px;padding:12px;margin-bottom:18px;font-size:0.82rem;color:#855;text-align:left">
          ⚠️ Ao editar, a nova versão do pedido será enviada via WhatsApp para confirmação da loja. O pedido atual permanece registrado até a loja confirmar a alteração.
        </div>
        <button onclick="iniciarEdicaoCarrinho(${pedidoId})" style="width:100%;padding:13px;background:linear-gradient(135deg,#f39c12,#e67e22);color:white;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-size:0.95rem;margin-bottom:10px">
          ✏️ Editar meu pedido
        </button>
        <button onclick="document.getElementById('modal-edicao-pedido').remove()" style="width:100%;padding:10px;background:transparent;color:#999;border:1.5px solid #ddd;border-radius:12px;cursor:pointer;font-size:0.85rem">
          Cancelar
        </button>
      </div>`;
  document.body.appendChild(modal);
}

async function iniciarEdicaoCarrinho(pedidoId) {
  document.getElementById("modal-edicao-pedido")?.remove();

  // Busca o pedido atual para pré-carregar itens
  const { data: p } = await supa
    .from("pedidos")
    .select("itens,obs_geral")
    .eq("id", pedidoId)
    .single();

  if (!p) return alert("Pedido não encontrado.");

  // Pré-carrega itens no carrinho atual
  if (p.itens && Array.isArray(p.itens)) {
    carrinho = p.itens.map((i) => ({
      nome: i.nome || i.n,
      preco: i.preco || i.p || 0,
      qtd: i.qtd || i.q || 1,
      variacao: i.variacao || i.t || "",
      preparo: i.preparo || i.pr || "",
      montagem: i.montagem || i.m || [],
      obs: i.obs || i.o || "",
      img: i.img || "",
      categoria_slug: i.categoria_slug || "",
      es_bebida: i.es_bebida || false,
    }));
    updateUI();
  }

  // Abre o checkout com nota de edição
  abrirCheckout();

  // Adiciona banner de aviso no topo do checkout
  setTimeout(() => {
    const checkout =
      document.getElementById("checkout-panel") ||
      document.querySelector(".checkout-container");
    if (checkout) {
      const banner = document.createElement("div");
      banner.id = "banner-edicao";
      banner.style.cssText =
        "background:#fff3cd;border:1.5px solid #f0a500;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:0.82rem;color:#7a5100;font-weight:600";
      banner.innerHTML =
        "✏️ <strong>Modo Edição</strong> — Modifique seus itens e clique em Enviar Pedido. A loja receberá a versão atualizada.";
      checkout.insertBefore(banner, checkout.firstChild);
    }
  }, 100);
}

// ── SOLICITAR CANCELAMENTO PELO CLIENTE (via tracking) ──────────
async function solicitarCancelamentoCliente() {
  const pedidoId = localStorage.getItem("app_pedido_id");
  if (!pedidoId) return;

  const motivo = prompt("Motivo do cancelamento (obrigatório):");
  if (!motivo || !motivo.trim()) return;

  const { error } = await supa
    .from("pedidos")
    .update({
      cancelamento_solicitado: true,
      cancelamento_motivo: motivo.trim(),
      cancelamento_solicitado_por: "cliente",
      cancelamento_solicitado_em: new Date().toISOString(),
    })
    .eq("id", parseInt(pedidoId));

  if (error) {
    alert("Erro ao solicitar cancelamento. Contate a loja pelo WhatsApp.");
  } else {
    alert("✅ Solicitação enviada! A loja irá avaliar e responder em breve.");
  }
}

// iniciarTrackingRealtime — usado pelo card de busca do index
// Delega para o sistema central (polling + realtime bônus)
function iniciarTrackingRealtime(pedidoId) {
  _trackedId = pedidoId;
  _lastTrackedSt = ""; // força re-render na primeira leitura do polling
  localStorage.setItem("app_pedido_id", pedidoId);
  localStorage.setItem("app_pedido_uid", pedidoId);
  _iniciarPollingTracking(pedidoId, pedidoId);
  _tentarCanalRealtime(pedidoId, pedidoId);
}

let saboresSelecionados = []; // Array global para guardar a pizza atual

// Função auxiliar para calcular preço da pizza
function calcularTotalPizza() {
  if (saboresSelecionados.length === 0) return 0;

  // 1. Encontra o sabor mais caro (REGRA DE OURO)
  let maiorPreco = 0;
  saboresSelecionados.forEach((sabor) => {
    if (sabor.preco > maiorPreco) maiorPreco = sabor.preco;
  });

  // 2. Verifica se tem borda
  const bordaPreco = produtoAtual.bordaSelecionada
    ? produtoAtual.bordaSelecionada.preco
    : 0;

  // 3. Atualiza botão
  const total = maiorPreco + bordaPreco;
  document.getElementById("btn-add-carrinho").innerText =
    `Adicionar Gs ${total.toLocaleString("es-PY")}`;

  return total;
}

// Função para adicionar sabor (deve ser ligada aos checkboxes/cards da UI)
function toggleSaborPizza(saborObj, maxSabores) {
  const index = saboresSelecionados.findIndex((s) => s.id === saborObj.id);

  if (index > -1) {
    // Se já tá, remove
    saboresSelecionados.splice(index, 1);
  } else {
    // Se não tá, verifica limite (1/2, 1/3, 1/4)
    if (saboresSelecionados.length < maxSabores) {
      saboresSelecionados.push(saborObj);
    } else {
      alert(
        `Você escolheu uma pizza de ${maxSabores} sabores. Remova um para trocar.`,
      );
      return;
    }
  }

  // Recalcula visual
  renderizarSaboresSelecionados(); // Função que pinta a pizza
  calcularTotalPizza();
}

// ==========================================
// DETECÇÃO DE CONEXÃO
// ==========================================
function initDeteccaoConexao() {
  // Mostra alerta quando fica offline
  window.addEventListener("offline", () => {
    mostrarToast(
      "⚠️ Sem conexão com a internet. Algumas funcionalidades podem não funcionar.",
      "warning",
      5000,
    );
  });

  // Mostra alerta quando volta online
  window.addEventListener("online", () => {
    mostrarToast("✅ Conexão restaurada!", "success", 3000);
    // Recarrega dados
    verificarHorario();
  });
}

// Inicializa detecção de conexão
initDeteccaoConexao();

// ==========================================

// ==========================================
// AUTO-SALVAMENTO DO CARRINHO
// ==========================================
function salvarCarrinhoLocal() {
  try {
    if (carrinho && carrinho.length > 0) {
      localStorage.setItem("app_carrinho_backup", JSON.stringify(carrinho));
      localStorage.setItem(
        "app_carrinho_backup_time",
        new Date().toISOString(),
      );
    } else {
      localStorage.removeItem("app_carrinho_backup");
      localStorage.removeItem("app_carrinho_backup_time");
    }
  } catch (e) {
    console.warn("Não foi possível salvar backup do carrinho:", e);
  }
}

function restaurarCarrinhoBackup() {
  try {
    const backup = localStorage.getItem("app_carrinho_backup");
    const backupTime = localStorage.getItem("app_carrinho_backup_time");

    if (backup && backupTime) {
      const tempoBackup = new Date(backupTime);
      const agora = new Date();
      const diffHoras = (agora - tempoBackup) / (1000 * 60 * 60);

      // Só restaura se o backup tiver menos de 24 horas
      if (diffHoras < 24) {
        const carrinhoSalvo = JSON.parse(backup);
        if (carrinhoSalvo && carrinhoSalvo.length > 0) {
          const pedidoAtivo = localStorage.getItem("app_pedido_id");
          if (
            !pedidoAtivo &&
            confirm(
              "Você tem itens no carrinho de uma sessão anterior. Deseja restaurá-los?",
            )
          ) {
            carrinho = carrinhoSalvo;
            updateUI();
            mostrarToast("✅ Carrinho restaurado!", "success");
          }
          // Se há pedido ativo, não oferece restaurar
        }
      }
    }
  } catch (e) {
    console.warn("Não foi possível restaurar backup do carrinho:", e);
  }
}

// Salva carrinho a cada mudança
setInterval(salvarCarrinhoLocal, 5000); // A cada 5 segundos

// Tenta restaurar carrinho ao carregar
setTimeout(restaurarCarrinhoBackup, 1000);

// ==========================================