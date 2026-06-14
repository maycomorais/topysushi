// Fallback para t() caso admin-i18n.js não esteja carregado ainda
if (typeof t === "undefined") {
  window.t = function (key, fallback) {
    return fallback || key;
  };
}

// Intercepta e traduz alert/confirm/prompt caso idioma seja 'es'
(function() {
  const origAlert = window.alert;
  const origConfirm = window.confirm;
  const origPrompt = window.prompt;

  const translationDict = {
    // Alerts
    "Horário estendido em +": "¡Horario extendido en +",
    "minutos hoje!": "minutos hoy!",
    "Extensão removida.": "Extensión removida.",
    "Erro ao salvar nova ordem. Tente novamente.": "Error al guardar el nuevo orden. Inténtelo de nuevo.",
    "Preencha o slug e o nome!": "¡Complete el slug y el nombre!",
    "Erro ao salvar:": "Error al guardar:",
    "Erro ao deletar:": "Error al eliminar:",
    "Erro inesperado:": "Error inesperado:",
    "Produto reativado!": "¡Producto reactivado!",
    "Produto pausado!": "¡Producto pausado!",
    "Categoria deletada com sucesso!": "¡Categoría eliminada con éxito!",
    "Motoboy deletado com sucesso!": "¡Repartidor eliminado con éxito!",
    "Nome do motoboy é obrigatório!": "¡El nombre del repartidor es obligatorio!",
    "Máximo de 2 turnos por dia.": "Máximo de 2 turnos por día.",
    "Preencha os horários de abertura e fechamento.": "Complete los horarios de apertura y cierre.",
    "Informe o ID do produto para o banner.": "Ingrese el ID del producto para el banner.",
    "Falha no upload do banner:": "Fallo al subir el banner:",
    "O banner não foi salvo.": "El banner no fue guardado.",
    "Selecione uma foto ou informe a URL do banner.": "Seleccione una foto o ingrese la URL del banner.",
    "Banner ": "Banner ",
    "ativado!": "¡activado!",
    "Maquininhas salvas!": "¡Terminales de tarjeta guardadas!",
    "Falha no upload do ícone:": "Fallo al subir el ícono:",
    "A personalização não foi salva.": "La personalización no fue guardada.",
    "Erro ao enviar imagem:": "Error al enviar la imagen:",
    "Erro ao sair:": "Error al salir:",
    "Todas as variações estão pausadas.": "Todas las variaciones están pausadas.",
    "sabores": "sabores",
    "itens": "ítems",
    "Escolha pelo menos 1 sabor.": "Elija al menos 1 sabor.",
    "Adicione ao menos 1 novo item antes de lançar.": "Agregue al menos 1 nuevo ítem antes de lanzar.",
    "Adicione ao menos 1 forma de pagamento!": "¡Agregue al menos 1 forma de pago!",
    "Erro ao atualizar mesa:": "Error al actualizar mesa:",
    "item(s) enviado(s) para a cozinha!": "¡ítem(s) enviado(s) a la cocina!",
    "Erro ao buscar comanda.": "Error al buscar comanda.",
    "Erro ao baixar item:": "Error al cerrar ítem:",
    "Cargo alterado para ": "¡Cargo modificado a ",
    "Usuário excluído com sucesso!": "¡Usuario eliminado con éxito!",
    "Preencha email, nome e senha (mín. 6 caracteres).": "Complete correo, nombre y contraseña (mín. 6 caracteres).",
    "Auth criado mas erro no perfil:": "Auth creado pero con error en el perfil:",
    "Usuário excluído.": "Usuario eliminado.",
    "Email e senha (mín. 6 caracteres) são obrigatórios": "Correo y contraseña (mín. 6 caracteres) son obligatorios",
    "O nome de exibição é obrigatório": "El nombre de exhibición es obligatorio",
    "Apenas o Admin Master pode criar usuários com cargo Dono.": "Solo el Admin Master puede crear usuarios con el cargo de Dueño.",
    "Erro ao criar usuário:": "Error al crear usuario:",
    "Usuário criado. Aguardando confirmação de email para ativar.": "Usuario creado. Esperando confirmación de correo para activar.",
    "Digite um código para o cupom": "Ingrese un código para el cupón",
    "Cupom salvo com sucesso!": "¡Cupón guardado con éxito!",
    "Pedido não encontrado.": "Pedido no encontrado.",
    "Este pedido não tem número de telefone registrado.": "Este pedido no tiene número de teléfono registrado.",
    "Entrega confirmada com sucesso!": "¡Entrega confirmada con éxito!",
    "Erro ao confirmar entrega": "Error al confirmar entrega",
    "Nenhum pedido de Mesa/Retirada/Local em aberto.": "Ningún pedido de Mesa/Retiro/Local abierto.",
    "pedido(s) baixado(s)!": "¡pedido(s) cobrado(s)/cerrado(s)!",
    "Nenhum delivery para confirmar entrega.": "Ningún delivery para confirmar entrega.",
    "delivery(s) confirmado(s)!": "¡delivery(s) confirmado(s)!",
    "Erro ao carregar gráfico": "Error al cargar gráfico",
    "Informe o nome do item.": "Ingrese el nombre del ítem.",
    "Quantidade inválida.": "Cantidad inválida.",
    "Configuração inicial salva com sucesso!": "¡Configuración inicial guardada con éxito!",
    "Preencha o valor corretamente.": "Complete el valor correctamente.",
    "Descreva o tipo da despesa.": "Describa el tipo de gasto.",
    "Você precisa aceitar o contrato de serviços para continuar.": "Debe aceptar el contrato de servicios para continuar.",
    "Preencha seu nome completo e RUC/C.I. para assinar.": "Complete su nombre completo y RUC/C.I. para firmar.",
    "Erro ao registrar assinatura:": "Error al registrar la firma:",

    // Confirms
    "Remover a extensão de horário de hoje?": "¿Remover la extensión de horario de hoy?",
    "Deseja pausar este produto?": "¿Desea pausar este producto?",
    "Deseja reactivar este produto?": "¿Desea reactivar este producto?",
    "Deseja reativar este produto?": "¿Desea reactivar este producto?",
    "Remover esta etapa?": "¿Remover esta etapa?",
    "Deletar este cupom?": "¿Eliminar este cupón?",
    "Confirmar entrega e pagamento desta mesa?": "¿Confirmar entrega y pago de esta mesa?",
    "Excluir este item?": "¿Eliminar este ítem?",
    "Excluir esta despesa? Esta ação não pode ser desfeita.": "¿Eliminar este gasto? Esta acción no se puede deshacer.",
    "Alterar cargo para": "¿Alterar cargo a",
    "Confirmar que este pedido foi entregue ao cliente?": "¿Confirmar que este pedido fue entregado al cliente?",
    "Confirmar entrega de ": "¿Confirmar entrega de ",
    "Baixar ": "¿Cobrar/cerrar "
  };

  function translateText(str) {
    if (!str || typeof str !== 'string') return str;
    const lang = localStorage.getItem('admin_lang') || 'es';
    if (lang !== 'es') return str;

    // Check exact match
    let trimmed = str.trim();
    if (translationDict[trimmed]) {
      return str.replace(trimmed, translationDict[trimmed]);
    }

    // Partial search / replacement for dynamic strings
    let translated = str;
    for (const [key, val] of Object.entries(translationDict)) {
      if (translated.includes(key)) {
        translated = translated.replaceAll(key, val);
      }
    }
    return translated;
  }

  window.alert = function(msg) {
    return origAlert(translateText(msg));
  };
  window.confirm = function(msg) {
    return origConfirm(translateText(msg));
  };
  window.prompt = function(msg, defaultVal) {
    return origPrompt(translateText(msg), defaultVal);
  };
})();


// =========================================
// 1. CONSTANTES E INICIALIZAÇÃO
// =========================================
// ── Globals carregados do banco (configuracoes) ──────────────────
let TAXA_MOTOBOY = 0; // taxa_motoboy_base
let AJUDA_COMBUSTIVEL = 0; // ajuda_combustivel
let COORD_LOJA = { lat: 0, lng: 0 }; // coord_lat / coord_lng
let CHAVE_PIX_CFG = ""; // chave_pix
let NOME_PIX_CFG = ""; // nome_pix
let DADOS_ALIAS_CFG = ""; // dados_alias
let QR_PY_URL = ""; // URL do QR Paraguay
let NOME_ALIAS_CFG = ""; // nome_alias
let WHATSAPP_LOJA_CFG = ""; // whatsapp_loja (dígitos)
let NOME_RESTAURANTE = ""; // nome_restaurante
let FEATURES_ATIVAS = null; // features_ativas JSONB
let TABELA_FRETE_ADMIN = null; // tabela_frete (carregada do banco para calcularFretePDV)

let perfilUsuario = null;
let _perfilId = null; // UUID do usuário logado
let _perfilNome = null; // nome_display do usuário logado
let audioHabilitado = false; // Controle de permissão do navegador

const ADMIN_APP_VERSION = "2026-04-17-v1";
const ADMIN_APP_STORAGE_KEYS = [
  "app_lastTab",
  "app_lastSubTab",
  "app_pdv_aba",
  "app_sidebar_collapsed",
];

function resetAdminStorageOnVersionChange() {
  const storedVersion = localStorage.getItem("admin_app_version");
  if (storedVersion !== ADMIN_APP_VERSION) {
    ADMIN_APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem("admin_app_version", ADMIN_APP_VERSION);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  resetAdminStorageOnVersionChange();
  // Recupera a última aba — mas só restaura depois do auth carregar
  // Para não disparar alert('Acesso restrito') antes de perfilUsuario estar definido,
  // começa sempre no dashboard e restaura a aba real após o login
  let lastTab = localStorage.getItem("app_lastTab");
  const _restrictedTabs = [
    "inventario",
    "adminmaster",
    "estatisticas",
    "ficha-tecnica",
    "crm",
  ];
  if (
    !lastTab ||
    !document.getElementById(lastTab) ||
    _restrictedTabs.includes(lastTab)
  ) {
    lastTab = "dashboard";
  }
  showTab(lastTab);

  // Timeout de segurança: se o overlay travar por mais de 8s, remove forçado
  setTimeout(() => {
    const overlay = document.getElementById("auth-overlay");
    if (overlay) {
      console.warn("⏰ Timeout de auth — removendo overlay forçado");
      overlay.remove();
      // Se perfilUsuario ainda não carregou, define padrão para não travar o painel
      if (!perfilUsuario) perfilUsuario = "dono";
    }
  }, 8000);

  // Inicia Monitoramento Realtime
  iniciarRealtime();

  // === SISTEMA DE AUTO-REFRESH (10 SEGUNDOS) ===
  // Backup caso o Realtime falhe
  setInterval(() => {
    const abaAtual = localStorage.getItem("app_lastTab");
    // true = modo silencioso (sem recarregar som se já estiver tocando)
    if (abaAtual === "pedidos") carregarPedidos(true);
    if (abaAtual === "cozinha") carregarCozinha();
    if (abaAtual === "pdv") carregarMonitorMesas();
    // if (abaAtual === 'financeiro') calcularFinanceiro();
    if (abaAtual === "dashboard") carregarDashboard();
  }, 10000);

  // Verifica Login e Permissões
  if (typeof checkUser === "function") {
    let session;
    try {
      session = await checkUser();
    } catch (e) {
      window.location.href = "login.html";
      return;
    }
    if (!session) return; // checkUser já redirecionou

    // Verifica se o usuário aceitou o contrato de serviços
    await verificarContratoAdmin(session);

    // Remove overlay IMEDIATAMENTE após sessão confirmada
    const overlay = document.getElementById("auth-overlay");
    if (overlay) overlay.remove();

    const { data: perfil } = await supa
      .from("perfis_acesso")
      .select("cargo, nome_display")
      .eq("id", session.user.id)
      .single();

    _perfilId = session.user.id;
    _perfilNome = perfil?.nome_display || session.user.email || "Admin";
    perfilUsuario = perfil ? perfil.cargo : "dono";

    // Atualiza sidebar: nome, cargo e email
    const elNomeDisplay = document.getElementById("user-nome-display");
    const elCargo = document.getElementById("user-cargo");
    const elEmail = document.getElementById("user-email");
    if (elNomeDisplay) elNomeDisplay.textContent = _perfilNome;
    if (elEmail) elEmail.textContent = session.user.email;

    const cargoBadges = {
      adminMaster: "🎮 ADMIN MASTER",
      dono: "🔑 DONO",
      gerente: "👔 GERENTE",
      funcionario: "👷 FUNCIONÁRIO",
      garcom: "🍽️ GARÇOM",
    };
    if (elCargo)
      elCargo.textContent =
        cargoBadges[perfilUsuario] || perfilUsuario.toUpperCase();

    // Carrega features e aplica visibilidade das abas
    await _carregarFeaturesGlobais();

    // Atualiza brand com nome do restaurante (carregado em _carregarFeaturesGlobais)
    const elBrand = document.getElementById("brand-text");
    if (elBrand) elBrand.textContent = (NOME_RESTAURANTE || "ADMIN") + " ADMIN";

    _aplicarVisibilidadeAbas();

    if (perfilUsuario === "adminMaster") {
      // adminMaster vê tudo + aba exclusiva de administração
      document
        .querySelectorAll(".menu-item")
        .forEach((m) => (m.style.display = "flex"));
      const menuAM = document.getElementById("menu-adminmaster");
      if (menuAM) menuAM.style.display = "flex";
      const menuFil = document.getElementById("menu-filiais");
      if (menuFil) menuFil.style.display = "flex";
      // Exibe opção Dono no select de equipe
      const optDono = document.getElementById("opt-cargo-dono");
      if (optDono) optDono.style.display = "";
    }
    // A visibilidade do financeiro (e todas as abas) é controlada
    // inteiramente por _aplicarVisibilidadeAbas() via permissoes_cargo
    // ou features_ativas.tabs. O mini-painel de caixa no PDV
    // permite que funcionários abram o caixa sem acessar a aba financeiro.
    if (
      perfilUsuario === "dono" ||
      perfilUsuario === "gerente" ||
      perfilUsuario === "adminMaster"
    ) {
      const menuEst = document.getElementById("menu-inventario");
      if (menuEst) menuEst.style.display = "flex";
    }

    // ── Mostrar menus novos para dono/gerente/adminMaster ──
    if (
      perfilUsuario === "dono" ||
      perfilUsuario === "gerente" ||
      perfilUsuario === "adminMaster"
    ) {
      [
        "menu-estatisticas",
        "menu-ficha-tecnica",
        "menu-crm",
        "menu-mensalistas",
      ].forEach((id) => {
        const m = document.getElementById(id);
        if (m) m.style.display = "flex";
      });
    }

    carregarDashboard();
    carregarMotoboysSelect();
    // Re-aplica traduções após auth (perfilUsuario e features já carregados)
    if (typeof applyAdminI18n === "function") applyAdminI18n();

    // ── Controle de Assinatura (barra de aviso / bloqueio) ──
    if (typeof SubscriptionUI !== "undefined") {
      SubscriptionUI.inicializar({
        supabaseUrl:  typeof _SUPABASE_URL !== "undefined" ? _SUPABASE_URL : "",
        supabaseKey:  typeof _SUPABASE_KEY !== "undefined" ? _SUPABASE_KEY : "",
        contatoFone:  "595976771714",
        contatoNome:  "SuporteLinkPY",
        perfil:       perfilUsuario,
      });
    }

    // Exibe menu Assinatura somente para adminMaster
    const menuAssin = document.getElementById("menu-assinatura");
    if (menuAssin) menuAssin.style.display = perfilUsuario === "adminMaster" ? "flex" : "none";
  }

  let _lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth !== _lastWidth) {
      _lastWidth = window.innerWidth;
      if (document.getElementById("pdv")?.classList.contains("active")) {
        pdvIniciarTabs();
      }
    }
  });

  // === DESBLOQUEIO DE SOM — AudioContext (sem AbortError) ===
  // play().then(pause()) SEMPRE gera AbortError no Chrome. Usamos buffer silencioso.
  document.body.addEventListener(
    "click",
    () => {
      if (!audioHabilitado) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const buf = ctx.createBuffer(
            1,
            ctx.sampleRate * 0.001,
            ctx.sampleRate,
          );
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start(0);
          src.onended = () => {
            audioHabilitado = true;
            ctx.close();
          };
        } catch (e) {
          audioHabilitado = true;
        }
      }
    },
    { once: true },
  );
});

// selecionarTipo do Gemini removido — o sistema usa selecionarTipoBuilder() abaixo

// =========================================
// CLOUDINARY — UPLOAD UTILITÁRIO
// =========================================
const CLOUDINARY_CLOUD_NAME = "dsxwnbj0o";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";
const CLOUDINARY_ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Faz upload de um arquivo de imagem diretamente para o Cloudinary
 * usando um Unsigned Upload Preset público.
 *
 * @param {File} file - O objeto File selecionado pelo usuário.
 * @returns {Promise<string>} - A secure_url final da imagem no Cloudinary.
 * @throws {Error} - Lança um erro se o upload falhar, impedindo o salvamento no Supabase.
 */
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errMsg = errData?.error?.message || errMsg;
    } catch (_) {}
    throw new Error(`Cloudinary upload falhou: ${errMsg}`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Cloudinary não retornou uma URL válida.");
  }

  return data.secure_url;
}

// =========================================
// 2. CONTROLE DE ABAS
// =========================================
function showTab(tabId, event) {
  console.log("Tentando abrir aba:", tabId);
  console.log("Event:", event);

  // 1. O 'de-para' para garantir que IDs como 'categorias' ou 'motoboys'
  // abram a aba pai correta no seu novo HTML
  let realTabId = tabId;
  if (tabId === "categorias" || tabId === "motoboys") {
    realTabId = "produtos";
  }

  let target = document.getElementById(realTabId);
  if (!target) {
    console.log("Target not found for", realTabId);
    target = document.getElementById("pedidos");
    realTabId = "pedidos";
  } else {
    console.log("Target found:", target);
  }

  localStorage.setItem("app_lastTab", realTabId);

  // 2. Reset visual
  document.querySelectorAll(".tab-content").forEach((t) => {
    t.classList.remove("active");
    t.style.display = "none";
  });
  document
    .querySelectorAll(".menu-item")
    .forEach((m) => m.classList.remove("active"));

  // 3. Ativa a aba pai
  target.classList.add("active");
  target.style.display = "block";
  console.log("Added active class to", realTabId);

  // 4. Ativa o botão no menu lateral
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  } else {
    // Restaura highlight ao carregar página (sem evento de clique)
    document.querySelectorAll(".menu-item").forEach((m) => {
      const oc = m.getAttribute("onclick") || "";
      if (oc.includes(`'${realTabId}'`) || oc.includes(`'${tabId}'`)) {
        m.classList.add("active");
      }
    });
  }

  // 5. PULO DO GATO: Se a aba for produtos, categorias ou motoboys,
  // precisamos ativar a SUB-ABA correspondente
  if (realTabId === "produtos") {
    console.log("Calling showSubTab for produtos");
    if (tabId === "categorias") showSubTab("lista-categorias-wrapper");
    else if (tabId === "motoboys") showSubTab("lista-motos-wrapper");
    else {
      // Clique direto em "Produtos": sempre abre a lista de produtos,
      // ignorando qualquer sub-aba salva de navegação anterior (ex: Categorias).
      showSubTab("lista-produtos-wrapper");
    }
  }

  // 6. Carregamento de dados
  if (realTabId === "pedidos") {
    carregarPedidos();
    carregarStatusDelivery();
  }
  if (realTabId === "cozinha") carregarCozinha();
  if (realTabId === "financeiro") calcularFinanceiro();
  if (realTabId === "dashboard") carregarDashboard();
  if (realTabId === "pdv") {
    carregarPDV().then(() => { if (typeof applyAdminI18n === "function") applyAdminI18n(); });
  } else {
    // Re-aplica traduções após renderizar qualquer aba
    if (typeof applyAdminI18n === "function") setTimeout(applyAdminI18n, 30);
  }
  if (realTabId === "equipe") carregarEquipe();
  if (realTabId === "adminmaster") {
    amCarregarUsuarios();
    renderPainelFeatures();
  }
  if (realTabId === "assinatura") carregarPainelAssinatura();
  if (realTabId === "estatisticas") {
    initEstatisticas();
    _estPopularCategorias();
  }
  if (realTabId === "ficha-tecnica") {
    initFichaTecnica();
  }
  if (realTabId === "crm") {
    initCRM();
  }
  if (realTabId === "filiais") {
    initFiliais();
  }
  if (realTabId === "mensalistas") {
    initMensalistas();
  }
  if (realTabId === "configuracoes") {
    carregarConfiguracoes();
    if (perfilUsuario === "dono" || perfilUsuario === "gerente") {
      carregarCupons();
    }
  }
  if (realTabId === "inventario") {
    if (!perfilUsuario) return; // auth not loaded yet — wait
    // Permissão via permissoes_cargo ou fallback cargo
    const _podeInv = _feat("tabs", "inventario");
    if (_podeInv) {
      carregarInventario();
    } else {
      alert("Acesso restrito.");
      showTab("pedidos", null);
    }
  }
}

const SUBTABS_VALIDAS = [
  "lista-produtos-wrapper",
  "lista-categorias-wrapper",
  "lista-motos-wrapper",
];

function showSubTab(subId) {
  console.log("Alternando para sub-aba:", subId);

  if (!SUBTABS_VALIDAS.includes(subId)) {
    subId = "lista-produtos-wrapper";
  }

  localStorage.setItem("app_lastSubTab", subId);

  // 1. Seleciona todas as sub-abas e esconde TODAS
  const subtabs = document.querySelectorAll(".subtab-content");
  console.log("Hiding all subtabs, found:", subtabs.length);
  subtabs.forEach((tab) => {
    tab.style.display = "none";
  });

  // 2. Mostra apenas a que foi clicada
  const target = document.getElementById(subId);
  if (target) {
    console.log("Showing subtab:", subId);
    target.style.display = "block";
  } else {
    console.log("Subtab not found:", subId);
  }

  // 3. Carrega os dados específicos
  if (subId === "lista-produtos-wrapper") carregarProdutos();
  if (subId === "lista-categorias-wrapper") carregarCategorias();
  if (subId === "lista-motos-wrapper") carregarMotoboys();
}

// =========================================
// 3. REALTIME E ALARME (LOOP)
// =========================================
// ── Features globais (controladas pelo adminMaster) ────────────
async function _carregarFeaturesGlobais() {
  const { data } = await supa
    .from("configuracoes")
    .select(
      "features_ativas, nome_restaurante, whatsapp_loja, coord_lat, coord_lng, taxa_motoboy_base, ajuda_combustivel, chave_pix, nome_pix, dados_alias, nome_alias, tabela_frete",
    )
    .maybeSingle();
  if (!data) return;
  FEATURES_ATIVAS = data.features_ativas || null;
  // Globals operacionais
  if (data.nome_restaurante) NOME_RESTAURANTE = data.nome_restaurante;
  if (data.whatsapp_loja) WHATSAPP_LOJA_CFG = data.whatsapp_loja;
  if (data.coord_lat) COORD_LOJA.lat = parseFloat(data.coord_lat);
  if (data.coord_lng) COORD_LOJA.lng = parseFloat(data.coord_lng);
  if (data.taxa_motoboy_base != null) TAXA_MOTOBOY = data.taxa_motoboy_base;
  if (data.ajuda_combustivel != null)
    AJUDA_COMBUSTIVEL = data.ajuda_combustivel;
  if (data.chave_pix) CHAVE_PIX_CFG = data.chave_pix;
  if (data.nome_pix) NOME_PIX_CFG = data.nome_pix;
  if (data.dados_alias) DADOS_ALIAS_CFG = data.dados_alias;
  if (data.nome_alias) NOME_ALIAS_CFG = data.nome_alias;
  if (data.tabela_frete && Array.isArray(data.tabela_frete))
    TABELA_FRETE_ADMIN = data.tabela_frete;
}

// ── Filtra formas de pagamento em todos os selects conforme features_ativas.pagamentos ──
function _aplicarFormasPagamentoPDV(features) {
  const pags = features?.pagamentos;
  // Aplica nos selects do PDV e do filtro financeiro
  ["balcao-pag", "fin-tipo"].forEach((sid) => {
    const select = document.getElementById(sid);
    if (!select) return;
    Array.from(select.options).forEach((opt) => {
      if (!opt.value || opt.value === "todos") return; // "todos" nunca some
      if (!pags) { opt.style.display = ""; return; }
      if (pags[opt.value] === false) {
        opt.style.display = "none";
        if (select.value === opt.value)
          select.value = sid === "fin-tipo" ? "todos" : "Efetivo";
      } else {
        opt.style.display = "";
      }
    });
  });
}

function _feat(categoria, chave) {
  if (!FEATURES_ATIVAS) return true; // sem config = tudo ativo
  // Permissões granulares por cargo (permissoes_cargo) têm prioridade
  // sobre o controle global (tabs/funcionalidades)
  if (categoria === "tabs" && perfilUsuario) {
    const pCargo = FEATURES_ATIVAS?.permissoes_cargo?.[perfilUsuario];
    if (pCargo && Array.isArray(pCargo.tabs)) {
      return pCargo.tabs.includes(chave);
    }
  }
  const cat = FEATURES_ATIVAS[categoria];
  if (!cat) return true;
  return cat[chave] !== false;
}

/**
 * Retorna true se o usuário logado pode cancelar pedidos diretamente
 * (sem solicitar aprovação). Lê de features_ativas.permissoes_cargo
 * se disponível, cai back para a lógica antiga (dono/adminMaster).
 */
function _podeCancelarDireto() {
  const pCargo = FEATURES_ATIVAS?.permissoes_cargo?.[perfilUsuario];
  if (pCargo && "pode_cancelar_direto" in pCargo) {
    return pCargo.pode_cancelar_direto === true;
  }
  // fallback: lógica original
  return ["dono", "adminMaster"].includes(perfilUsuario);
}

function _aplicarVisibilidadeAbas() {
  const mapa = {
    "menu-pedidos":       "pedidos",
    "menu-cozinha":       "cozinha",
    "menu-pdv":           "pdv",
    "menu-financeiro":    "financeiro",
    "menu-inventario":    "inventario",
    "menu-equipe":        "equipe",
    "menu-configuracoes": "configuracoes",
    "menu-dashboard":     "dashboard",
    "menu-estatisticas":  "estatisticas",
    "menu-ficha-tecnica": "ficha-tecnica",
    "menu-crm":           "crm",
    "menu-turnos":        "turnos",
    "menu-produtos":      "produtos",
    "menu-mensalistas":   "mensalistas",
  };
  // adminMaster nunca sofre restrições — ele define as regras
  if (perfilUsuario === "adminMaster") return;

  Object.entries(mapa).forEach(([menuId, chave]) => {
    const el = document.getElementById(menuId);
    if (!el) return;
    const visivel = _feat("tabs", chave);
    el.style.display = visivel ? "flex" : "none";
  });
  _aplicarFuncionalidades();
}

/**
 * Aplica restrições de funcionalidades na UI conforme features_ativas.
 * Chamada após login e após salvar features (exceto para adminMaster).
 */
function _aplicarFuncionalidades() {
  const f = FEATURES_ATIVAS?.funcionalidades;
  if (!f) return; // sem config = tudo ativo

  // Tipos de entrega no PDV
  ["delivery", "retirada", "local", "balcao"].forEach((tipo) => {
    if (f[tipo] === false) {
      document.querySelectorAll(`.pdv-tipo-tab[data-tipo="${tipo}"]`)
        .forEach((el) => { el.style.display = "none"; });
    }
  });

  // Multipagamento: oculta a opção no select do PDV
  if (f.multipagamento === false) {
    const selPag = document.getElementById("balcao-pag");
    if (selPag) {
      Array.from(selPag.options).forEach((opt) => {
        if (opt.value === "Multipagamento") {
          opt.style.display = "none";
          if (selPag.value === "Multipagamento") selPag.value = "Efetivo";
        }
      });
    }
  }

  // Cupons: oculta card de cupons
  if (f.cupons === false) {
    const cupomCard = document.getElementById("card-cupons-cfg");
    if (cupomCard) cupomCard.style.display = "none";
    // Oculta botão de cupom no PDV também
    document.querySelectorAll('[onclick*="cupom"], [onclick*="Cupom"]')
      .forEach((el) => { el.style.display = "none"; });
  }

  // Factura: oculta campos de factura no checkout
  if (f.factura === false) {
    document.querySelectorAll('.box-factura, #box-factura, [data-feat-ui="factura"]')
      .forEach((el) => { el.style.display = "none"; });
  }
}

// Salva features (adminMaster only)
async function salvarFeatures() {
  if (perfilUsuario !== "adminMaster") return alert(t("alert.acesso_negado"));
  const tabs = {},
    tipos = {},
    funcs = {};
  document.querySelectorAll("[data-feat-tab]").forEach((el) => {
    tabs[el.dataset.featTab] = el.checked;
  });
  document.querySelectorAll("[data-feat-tipo]").forEach((el) => {
    tipos[el.dataset.featTipo] = el.checked;
  });
  document.querySelectorAll("[data-feat-func]").forEach((el) => {
    funcs[el.dataset.featFunc] = el.checked;
  });
  const pagamentos = {};
  document.querySelectorAll("[data-feat-pag]").forEach((el) => {
    pagamentos[el.dataset.featPag] = el.checked;
  });

  // ── Permissões granulares por cargo ─────────────────────────────
  const permissoes_cargo = {};
  const CARGOS_PERM = ["dono", "gerente", "funcionario", "garcom"];
  const ABAS_PERM = [
    "pedidos","cozinha","pdv","financeiro","inventario","produtos",
    "equipe","configuracoes","dashboard","estatisticas","ficha-tecnica",
    "crm","mensalistas","turnos",
  ];
  CARGOS_PERM.forEach(cargo => {
    const tabsPermitidas = ABAS_PERM.filter(aba => {
      const el = document.querySelector(`[data-perm-tab="${aba}"][data-perm-cargo="${cargo}"]`);
      return el ? el.checked : true; // default: permitido
    });
    const podeCancel = document.querySelector(`[data-perm-cancelar][data-perm-cargo="${cargo}"]`)?.checked ?? false;
    permissoes_cargo[cargo] = { tabs: tabsPermitidas, pode_cancelar_direto: podeCancel };
  });

  const features = {
    tabs,
    tipos_produto: tipos,
    funcionalidades: funcs,
    pagamentos,
    permissoes_cargo,
  };
  const { error } = await supa
    .from("configuracoes")
    .update({ features_ativas: features })
    .gt("id", 0);
  if (error) return alert("Erro: " + error.message);
  FEATURES_ATIVAS = features;

  // Re-aplica imediatamente (sem reload)
  _aplicarFormasPagamentoPDV(features);
  if (perfilUsuario !== "adminMaster") {
    _aplicarVisibilidadeAbas();
  }

  alert(t("alert.features_salvas"));
}

// Renderiza painel de features (adminMaster)
async function renderPainelFeatures() {
  const targets = ["painel-features", "painel-features-master"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!targets.length) return;
  await _carregarFeaturesGlobais();
  const f = FEATURES_ATIVAS || {};
  const tabs = f.tabs || {};
  const tipos = f.tipos_produto || {};
  const funcs = f.funcionalidades || {};

  // Helper: gera um checkbox estilizado com borda dinâmica
  const _chk = (attr, key, val, label, bg = "#f9f9f9") =>
    `<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;
        background:${bg};border-radius:8px;cursor:pointer;
        border:1.5px solid ${val !== false ? "#27ae60" : "#ddd"};transition:border .2s">
      <input type="checkbox" ${attr}="${key}" ${val !== false ? "checked" : ""}
        onchange="this.closest('label').style.borderColor=this.checked?'#27ae60':'#ddd'"
        style="width:17px;height:17px;accent-color:#27ae60;flex-shrink:0">
      <span style="font-size:0.85rem">${label}</span></label>`;

  // ── Abas (todas as 14 abas do sistema) ───────────────────────────
  const chkTabs = [
    ["pedidos",       "📋 Pedidos"],
    ["cozinha",       "👨‍🍳 Cozinha/KDS"],
    ["pdv",           "🖥️ PDV Balcão"],
    ["financeiro",    "💰 Financeiro"],
    ["inventario",    "📦 Inventário"],
    ["produtos",      "🍽️ Produtos"],
    ["equipe",        "👥 Equipe"],
    ["configuracoes", "⚙️ Configurações"],
    ["dashboard",     "📊 Dashboard"],
    ["estatisticas",  "📈 Estatísticas"],
    ["ficha-tecnica", "📝 Ficha Técnica"],
    ["crm",           "🤝 CRM Clientes"],
    ["mensalistas",   "🗓️ Mensalistas"],
    ["turnos",        "📺 Painel Turnos/TV"],
  ].map(([k, l]) => _chk("data-feat-tab", k, tabs[k], l, "#f0f9ff")).join("");

  // ── Tipos de produto (gastronomia + varejo) ───────────────────────
  const chkTipos = [
    ["padrao",     "📦 Simples"],
    ["bebida",     "🥤 Bebida"],
    ["lanche",     "🍔 Lanche"],
    ["pizza",      "🍕 Pizza"],
    ["acai",       "🍇 Açaí"],
    ["shake",      "🥤 Shake"],
    ["suco",       "🍊 Suco"],
    ["sorvete",    "🍦 Sorvete"],
    ["montavel",   "🥗 Montável"],
    ["combo",      "⭐ Combo"],
    ["variacoes",  "🎨 Multi-variação"],
    ["kg",         "⚖️ Venda por Kg"],
    ["roupa",      "👕 Roupa"],
    ["eletronico", "🔌 Eletrônico"],
    ["suplemento", "💪 Suplemento"],
    ["pod",        "☁️ Pod/Tabacaria"],
    ["mercado",    "🛒 Mercado"],
  ].map(([k, l]) => _chk("data-feat-tipo", k, tipos[k], l, "#fdf9ff")).join("");

  // ── Formas de pagamento ───────────────────────────────────────────
  const pags = f.pagamentos || {};
  const chkPags = [
    ["Efetivo",        "💵 Efectivo/Dinheiro"],
    ["Cartao",         "💳 Tarjeta PY"],
    ["CartaoBR",       "💳🇧🇷 Cartão BR (R$)"],
    ["Pix",            "🟢 Pix (BR)"],
    ["Transferencia",  "🏦 Alias/Transferência PY"],
    ["QrPy",           "📱 QR Paraguay"],
    ["Multipagamento", "🔀 Dividir Pagamento"],
  ].map(([k, l]) => _chk("data-feat-pag", k, pags[k], l, "#f0fff4")).join("");

  // ── Funcionalidades ───────────────────────────────────────────────
  const chkFuncs = [
    ["delivery",       "🛵 Delivery"],
    ["retirada",       "🏃 Retirada"],
    ["local",          "🍽️ Comer no Local"],
    ["balcao",         "🏪 Balcão/PDV"],
    ["cupons",         "🎟️ Cupons"],
    ["factura",        "🧾 Factura PY"],
    ["multipagamento", "🔀 Multipagamento"],
    ["agendamento",    "📅 Agendamento"],
  ].map(([k, l]) => _chk("data-feat-func", k, funcs[k], l, "#fffbf0")).join("");

  const _sec = (title, subtitle, grid, bg = "#fff") =>
    `<div style="background:${bg};border:1.5px solid #e8eaf6;border-radius:12px;padding:16px 18px">
      <h4 style="margin:0 0 4px;color:#2c3e50;font-size:0.93rem;font-weight:700">${title}</h4>
      ${subtitle ? `<p style="font-size:0.78rem;color:#999;margin:0 0 10px">${subtitle}</p>` : "<div style='height:10px'></div>"}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:7px">${grid}</div>
    </div>`;

  // ── Permissões por cargo ────────────────────────────────────────────
  const CARGOS_UI = [
    { key: "dono",        label: "🔑 Dono",        cor: "#f59e0b" },
    { key: "gerente",     label: "👔 Gerente",      cor: "#2980b9" },
    { key: "funcionario", label: "👷 Funcionário",  cor: "#7f8c8d" },
    { key: "garcom",      label: "🍽️ Garçom",      cor: "#27ae60" },
  ];
  const ABAS_UI = [
    ["pedidos","📋 Pedidos"],["cozinha","👨‍🍳 Cozinha"],["pdv","🖥️ PDV"],
    ["financeiro","💰 Financeiro"],["inventario","📦 Inventário"],["produtos","🍽️ Produtos"],
    ["equipe","👥 Equipe"],["configuracoes","⚙️ Config"],["dashboard","📊 Dashboard"],
    ["estatisticas","📈 Estatísticas"],["ficha-tecnica","📝 Ficha Técnica"],
    ["crm","🤝 CRM"],["mensalistas","🗓️ Mensalistas"],["turnos","📺 Turnos"],
  ];
  const pCargos = f.permissoes_cargo || {};

  const _chkPerm = (cargo, aba, label) => {
    const perm = pCargos[cargo];
    const isChecked = perm?.tabs ? perm.tabs.includes(aba) : true;
    const cor = CARGOS_UI.find(c => c.key === cargo)?.cor || "#888";
    return `<label style="display:flex;align-items:center;gap:5px;padding:5px 7px;
        border-radius:7px;cursor:pointer;font-size:0.78rem;
        background:${isChecked ? cor + "18" : "#f5f5f5"};
        border:1.5px solid ${isChecked ? cor : "#ddd"};transition:all .15s">
      <input type="checkbox" data-perm-tab="${aba}" data-perm-cargo="${cargo}"
        ${isChecked ? "checked" : ""}
        onchange="this.closest('label').style.background=this.checked?'${cor}18':'#f5f5f5';
                  this.closest('label').style.borderColor=this.checked?'${cor}':'#ddd'"
        style="width:14px;height:14px;accent-color:${cor};flex-shrink:0">
      ${label}
    </label>`;
  };

  const permSection = CARGOS_UI.map(({ key, label, cor }) => {
    const perm = pCargos[key] || {};
    const podeCancel = perm.pode_cancelar_direto === true;
    const abasChk = ABAS_UI.map(([k, l]) => _chkPerm(key, k, l)).join("");
    return `<div style="border:2px solid ${cor}44;border-radius:12px;padding:14px 16px;background:#fff">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <span style="font-weight:700;font-size:0.92rem;color:${cor}">${label}</span>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;
            font-size:0.8rem;font-weight:600;color:#c0392b;
            background:${podeCancel ? "#fdecea" : "#f5f5f5"};
            border:1.5px solid ${podeCancel ? "#e74c3c" : "#ddd"};
            border-radius:8px;padding:5px 10px;transition:all .15s">
          <input type="checkbox" data-perm-cancelar data-perm-cargo="${key}"
            ${podeCancel ? "checked" : ""}
            onchange="this.closest('label').style.background=this.checked?'#fdecea':'#f5f5f5';
                      this.closest('label').style.borderColor=this.checked?'#e74c3c':'#ddd'"
            style="width:14px;height:14px;accent-color:#e74c3c;flex-shrink:0">
          ❌ Pode cancelar diretamente
        </label>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">${abasChk}</div>
    </div>`;
  }).join("");

  const html = `
    <div style="display:grid;gap:14px">
      ${_sec("📂 Abas visíveis (global)", "Controla o menu para todos os cargos via regra global. As permissões por cargo abaixo têm prioridade.", chkTabs)}
      ${_sec("💳 Formas de Pagamento", "App do cliente <strong>e</strong> PDV balcão + filtro financeiro", chkPags)}
      ${_sec("🏷️ Tipos de Produto permitidos", "Quais tipos podem ser criados no cardápio", chkTipos)}
      ${_sec("⚙️ Funcionalidades", "Oculta recursos específicos da interface", chkFuncs)}
      <div style="border:2px solid #e74c3c55;border-radius:14px;padding:16px 18px;background:#fffafa">
        <h4 style="margin:0 0 4px;color:#c0392b;font-size:0.95rem;font-weight:800">
          🔐 Permissões Granulares por Cargo
        </h4>
        <p style="font-size:0.78rem;color:#999;margin:0 0 14px">
          Define quais abas cada cargo pode ver <strong>e</strong> se pode cancelar pedidos diretamente
          (sem solicitar aprovação). Tem prioridade sobre a seção "Abas visíveis" acima.
        </p>
        <div style="display:grid;gap:12px">${permSection}</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="salvarFeatures()" style="flex:1;min-width:160px">
          <i class="fas fa-save"></i> Salvar Configurações
        </button>
        <button class="btn" onclick="renderPainelFeatures()"
          style="background:#f0f4ff;color:#2c3e50;border:1.5px solid #c5cae9">
          <i class="fas fa-sync"></i> Recarregar
        </button>
      </div>
    </div>`;
  targets.forEach((el) => {
    el.innerHTML = html;
  });
}

function iniciarRealtime() {
  supa
    .channel("tabela-pedidos-admin")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pedidos" },
      (payload) => {
        // Som só para pedido NOVO pendente (nunca para cancelamento ou update)
        if (
          payload.eventType === "INSERT" &&
          payload.new.status === "pendente"
        ) {
          tocarAlarme();
        }
        // Atualiza tela — silencioso=true em updates para não re-tocar alarme
        const silencioso = payload.eventType === "UPDATE";
        const abaAtual = localStorage.getItem("app_lastTab");
        if (abaAtual === "pedidos") carregarPedidos(silencioso);
        if (abaAtual === "cozinha") carregarCozinha();
        if (abaAtual === "dashboard") carregarDashboard();
      },
    )
    .subscribe();
}

let loopAlarme = null;
let _alarmePlaying = false;

function tocarAlarme() {
  const audio = document.getElementById("som-campainha");
  if (!audio || loopAlarme) return; // já está tocando

  const _tocar = () => {
    if (!_alarmePlaying) {
      _alarmePlaying = true;
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          _alarmePlaying = false;
        })
        .catch(() => {
          _alarmePlaying = false;
        });
    }
  };

  _tocar();
  loopAlarme = setInterval(_tocar, 4000);
}

function pararAlarme() {
  if (loopAlarme) {
    clearInterval(loopAlarme);
    loopAlarme = null;
  }
  const audio = document.getElementById("som-campainha");
  if (audio && !audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
  _alarmePlaying = false;
}

// =========================================
// 4. GESTÃO DE PEDIDOS (COM IMPRESSÃO)
// =========================================
async function carregarPedidos(silencioso = false) {
  // === TRAVA DE SEGURANÇA (Para não limpar sua seleção) ===
  if (silencioso) {
    const selecionados = document.querySelectorAll(".check-pedido:checked");
    if (selecionados.length > 0) {
      console.log("Atualização pausada: Usuário está montando rota.");
      return;
    }
  }

  // 1. Som e Notificação
  const { count, error: countError } = await supa
    .from("pedidos")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente");

  if (countError) {
    console.warn("Erro ao contar pedidos pendentes:", countError.message);
  }

  if (count > 0) {
    if (!silencioso && typeof tocarAlarme === "function") tocarAlarme();
  } else {
    if (typeof pararAlarme === "function") pararAlarme();
  }

  // 2. Busca Dados - inclui cancelamento_solicitado para badge
  const { data: pedidos } = await supa
    .from("pedidos")
    .select("*")
    .or(
      "status.eq.pendente,status.eq.em_preparo,status.eq.pronto_entrega,status.eq.saiu_entrega",
    )
    .order("id", { ascending: false });

  const tbody = document.getElementById("lista-pedidos");
  if (!tbody) return;
  tbody.innerHTML = "";

  // Container de cards mobile
  const cardsDiv = document.getElementById("lista-pedidos-cards");
  if (cardsDiv) cardsDiv.innerHTML = "";

  // ── AUTO-CONFIRM: pedidos saiu_entrega há mais de 4h ──────────────────────
  const _QUATRO_HORAS_MS = 4 * 60 * 60 * 1000;
  const _agora = Date.now();
  const pedidosParaAutoConfirmar = (pedidos || []).filter(
    (p) =>
      p.status === "saiu_entrega" &&
      p.tempo_saiu_entrega &&
      _agora - new Date(p.tempo_saiu_entrega).getTime() > _QUATRO_HORAS_MS,
  );
  for (const p of pedidosParaAutoConfirmar) {
    console.log(
      `⏰ Auto-confirmando entrega do pedido #${p.id} (mais de 4h em saiu_entrega)`,
    );
    await supa
      .from("pedidos")
      .update({
        status: "entregue",
        tempo_entregue: new Date().toISOString(),
      })
      .eq("id", p.id);
  }
  // ───────────────────────────────────────────────────────────────────────────

  // Badge de cancelamento pendente para o dono / adminMaster
  const _podeCancel = _podeCancelarDireto();
  const badgeCancelPendente = _podeCancel
    ? `<span style="background:#e74c3c;color:white;font-size:0.7rem;padding:2px 7px;border-radius:10px;margin-left:6px;vertical-align:middle;">CANC. PENDENTE</span>`
    : "";

  if (pedidos && pedidos.length > 0) {
    pedidos.forEach((p) => {
      let acoes = "";
      let linhaCor = "";
      let checkbox = "";

      const btnPrint = `<button class="btn btn-sm btn-info" onclick="imprimirPedido(${p.id})" title="Imprimir"><i class="fas fa-print"></i></button>`;
      const temSolicitacaoCancelamento = p.cancelamento_solicitado;

      // Badge cancelamento (só dono vê)
      const badgeCancelRow =
        temSolicitacaoCancelamento && perfilUsuario === "dono"
          ? `<div style="background:#fff0f0;border:1px solid #e74c3c;border-radius:6px;padding:4px 8px;font-size:0.75rem;margin-top:4px;color:#c0392b">
                     🚫 <strong>Cancelamento solicitado:</strong> ${p.cancelamento_motivo || "-"}
                     <br><button class="btn btn-danger btn-sm" onclick="aprovarCancelamento(${p.id})" style="margin-top:4px;font-size:0.7rem">✅ Aprovar</button>
                     <button class="btn btn-secondary btn-sm" onclick="negarCancelamento(${p.id})" style="margin-top:4px;font-size:0.7rem">❌ Negar</button>
                   </div>`
          : "";

      // PENDENTE
      if (p.status === "pendente") {
        linhaCor = "background-color: #fff3cd;";
        acoes = `
                    ${btnPrint}
                    <button class="btn btn-success btn-sm" onclick="mudarStatus(${p.id}, 'em_preparo')"><i class="fas fa-fire"></i> Cozinha</button>
                    ${
                      _podeCancel
                        ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')"><i class="fas fa-times"></i></button>`
                        : `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i> Solicitar Cancelamento</button>`
                    }
                `;
      }

      // EM PREPARO (na cozinha — visível para acompanhamento)
      if (p.status === "em_preparo") {
        linhaCor = "background-color: #fff8e6;";
        const _btnCancelPreparo = _podeCancel
          ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')" title="Cancelar"><i class="fas fa-times"></i></button>`
          : !temSolicitacaoCancelamento
            ? `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i></button>`
            : `<span style="font-size:0.72rem;color:#e67e22;font-weight:600">⏳ Cancel. Pendente</span>`;
        acoes = `${btnPrint} <button class="btn btn-sm" style="background:#e67e22;color:#fff" onclick="mudarStatus(${p.id}, 'pronto_entrega')"><i class="fas fa-check"></i> Pronto</button> ${_btnCancelPreparo}`;
      }

      if (p.status === "saiu_entrega") {
        linhaCor = "background-color: #ddf0ff;";
        const _btnCancelSaiu = _podeCancel
          ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')" title="Cancelar"><i class="fas fa-times"></i></button>`
          : !temSolicitacaoCancelamento
            ? `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})" title="Solicitar cancelamento"><i class="fas fa-ban"></i> Cancelar</button>`
            : `<span style="font-size:0.72rem;color:#e67e22;font-weight:600">⏳ Cancel. Pendente</span>`;
        acoes = `${btnPrint} <button class="btn btn-success btn-sm" onclick="confirmarEntregaFuncionario(${p.id})"><i class="fas fa-check-circle"></i> Confirmar</button> ${_btnCancelSaiu}`;
      }
      // PRONTO
      else if (p.status === "pronto_entrega") {
        linhaCor = "background-color: #d4edda;";

        // Botão cancelamento para pronto_entrega
        const btnCancelar = _podeCancel
          ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')" title="Cancelar"><i class="fas fa-times"></i></button>`
          : !temSolicitacaoCancelamento
            ? `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i></button>`
            : "";

        if (p.tipo_entrega === "delivery") {
          const jsonSeguro = encodeURIComponent(JSON.stringify(p));
          checkbox = `<input type="checkbox" class="check-pedido" value="${jsonSeguro}" style="width:20px; height:20px;">`;
          acoes = `${btnPrint} ${btnCancelar} <button class="btn btn-sm" style="background:#25D366;color:#fff" onclick="avisarClientePronto(${p.id})" title="Avisar cliente via WhatsApp"><i class="fab fa-whatsapp"></i></button> <span style="color:#155724; font-weight:bold; font-size:0.9rem; margin-left:5px;"><i class="fas fa-motorcycle"></i> Aguardando Rota</span>`;
        } else {
          const icone =
            p.tipo_entrega === "balcao" ? "fa-store" : "fa-hand-holding";
          const tipo = p.tipo_entrega === "balcao" ? "BALCÃO" : "RETIRADA";
          checkbox = `<div style="text-align:center; color:#e67e22; font-size:1.2rem"><i class="fas ${icone}" title="${tipo}"></i></div>`;
          acoes = `${btnPrint} ${btnCancelar} <button class="btn btn-sm" style="background:#25D366;color:#fff" onclick="avisarClientePronto(${p.id})" title="Avisar cliente via WhatsApp"><i class="fab fa-whatsapp"></i></button> <button class="btn btn-success btn-sm" onclick="finalizarMesa(${p.id})">Baixar</button>`;
        }
      }

      // Linha da tabela (desktop)
      tbody.innerHTML += `
                <tr style="${linhaCor}">
                    <td style="text-align:center; vertical-align: middle;">${checkbox}</td>
                    <td><strong>#${p.uid_temporal || p.id}</strong></td>
                    <td>
                        <div style="font-weight:bold">${p.cliente_nome || "Cliente"}</div>
                        <div style="font-size:0.8rem; color:#666">${p.endereco_entrega || ""}</div>
                        ${badgeCancelRow}
                    </td>
                    <td><span class="status-badge st-${p.status}">${p.status.toUpperCase().replace("_", " ")}</span>
                    ${temSolicitacaoCancelamento && _podeCancel ? badgeCancelPendente : ""}</td>
                    <td>Gs ${(p.total_geral || 0).toLocaleString("es-PY")}</td>
                    <td class="actions-cell">${acoes}</td>
                </tr>`;

      // Card mobile
      if (cardsDiv) {
        const statusLabel =
          p.status === "pendente"
            ? "🔔 Novo"
            : p.status === "em_preparo"
              ? "🔥 Na Cozinha"
              : p.status === "pronto_entrega"
                ? "✅ Pronto"
                : p.status.replace("_", " ");
        const cardBg =
          p.status === "pendente"
            ? "#fff3cd"
            : p.status === "pronto_entrega"
              ? "#d4edda"
              : p.status === "saiu_entrega"
                ? "#ddf0ff"
                : "#fff";
        const jsonSeguro = encodeURIComponent(JSON.stringify(p));
        let cardAcoes = "";
        const cardBgSaiu = p.status === "saiu_entrega" ? "#ddf0ff" : "";
        if (p.status === "saiu_entrega") {
          const _btnCancelSaiuCard = _podeCancel
            ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')"><i class="fas fa-times"></i></button>`
            : !temSolicitacaoCancelamento
              ? `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i> Cancelar</button>`
              : `<span style="font-size:0.7rem;color:#e67e22;font-weight:600">⏳ Pendente</span>`;
          cardAcoes = `
                        <button class="btn btn-success btn-sm" onclick="confirmarEntregaFuncionario(${p.id})"><i class="fas fa-check-circle"></i> Confirmar</button>
                        <button class="btn btn-info btn-sm" onclick="imprimirPedido(${p.id})"><i class="fas fa-print"></i> Imprimir</button>
                        ${_btnCancelSaiuCard}`;
        } else if (p.status === "pendente") {
          cardAcoes = `
                        <button class="btn btn-success btn-sm" onclick="mudarStatus(${p.id}, 'em_preparo')"><i class="fas fa-fire"></i> Cozinha</button>
                        <button class="btn btn-info btn-sm" onclick="imprimirPedido(${p.id})"><i class="fas fa-print"></i> Imprimir</button>
                        ${
                          _podeCancel
                            ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')"><i class="fas fa-times"></i></button>`
                            : `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i> Cancelar</button>`
                        }`;
        } else if (p.status === "em_preparo") {
          const _btnCancelPreparoCard = _podeCancel
            ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')"><i class="fas fa-times"></i></button>`
            : !temSolicitacaoCancelamento
              ? `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i> Cancelar</button>`
              : `<span style="font-size:0.7rem;color:#e67e22;font-weight:600">⏳ Pendente</span>`;
          cardAcoes = `
                        <button class="btn btn-sm" style="background:#e67e22;color:#fff" onclick="mudarStatus(${p.id}, 'pronto_entrega')"><i class="fas fa-check"></i> Pronto</button>
                        <button class="btn btn-info btn-sm" onclick="imprimirPedido(${p.id})"><i class="fas fa-print"></i> Imprimir</button>
                        ${_btnCancelPreparoCard}`;
        } else if (
          p.status === "pronto_entrega" &&
          p.tipo_entrega === "balcao"
        ) {
          const _btnCancelBalcao = _podeCancel
            ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')"><i class="fas fa-times"></i></button>`
            : !temSolicitacaoCancelamento
              ? `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i> Cancelar</button>`
              : "";
          cardAcoes = `<button class="btn btn-success btn-sm" onclick="finalizarMesa(${p.id})"><i class="fas fa-check"></i> Entregar</button>
                        <button class="btn btn-sm" style="background:#25D366;color:#fff" onclick="avisarClientePronto(${p.id})"><i class="fab fa-whatsapp"></i></button>
                        <button class="btn btn-info btn-sm" onclick="imprimirPedido(${p.id})"><i class="fas fa-print"></i></button>
                        ${_btnCancelBalcao}`;
        } else if (p.status === "pronto_entrega") {
          const _btnCancelPronto = _podeCancel
            ? `<button class="btn btn-danger btn-sm" onclick="mudarStatus(${p.id}, 'cancelado')"><i class="fas fa-times"></i></button>`
            : !temSolicitacaoCancelamento
              ? `<button class="btn btn-warning btn-sm" onclick="solicitarCancelamento(${p.id})"><i class="fas fa-ban"></i></button>`
              : "";
          cardAcoes = `<label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:#155724;font-weight:600;">
                        <input type="checkbox" class="check-pedido" value="${jsonSeguro}" style="width:18px;height:18px;"> Incluir na Rota
                    </label>
                    <button class="btn btn-sm" style="background:#25D366;color:#fff" onclick="avisarClientePronto(${p.id})"><i class="fab fa-whatsapp"></i> Avisar</button>
                    <button class="btn btn-info btn-sm" onclick="imprimirPedido(${p.id})"><i class="fas fa-print"></i></button>
                    ${_btnCancelPronto}`;
        }

        const badgeCancelCard =
          temSolicitacaoCancelamento && _podeCancel
            ? `
                    <div style="background:#fff0f0;border:1px solid #e74c3c;border-radius:6px;padding:6px 8px;font-size:0.75rem;color:#c0392b;margin-top:6px">
                        🚫 Cancel. solicitado: ${p.cancelamento_motivo || "-"}
                        <br><button class="btn btn-danger btn-sm" onclick="aprovarCancelamento(${p.id})" style="font-size:0.7rem;margin-top:4px">✅ Aprovar</button>
                        <button class="btn btn-secondary btn-sm" onclick="negarCancelamento(${p.id})" style="font-size:0.7rem;margin-top:4px">❌ Negar</button>
                    </div>`
            : "";

        cardsDiv.innerHTML += `
                    <div style="background:${cardBg}; border-radius:10px; padding:14px 16px; box-shadow:0 2px 8px rgba(0,0,0,0.07); border-left:4px solid ${p.status === "pendente" ? "#f59e0b" : p.status === "pronto_entrega" ? "#22c55e" : p.status === "saiu_entrega" ? "#3498db" : "#94a3b8"};">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                            <div>
                                <div style="font-weight:700;font-size:1rem">#${p.uid_temporal || p.id} — ${p.cliente_nome || "Cliente"}</div>
                                <div style="font-size:0.78rem;color:#666;margin-top:2px">${p.endereco_entrega || (p.tipo_entrega === "balcao" ? "🏪 Balcão" : "")}</div>
                            </div>
                            <span class="status-badge st-${p.status}" style="font-size:0.7rem">${statusLabel}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                              <strong style="font-size:1rem;color:var(--dark)">Gs ${(p.total_geral || 0).toLocaleString("es-PY")}</strong>
                              ${p.frete_motoboy ? `<div style="font-size:0.72rem;color:#27ae60;margin-top:2px">🛵 Motoboy: Gs ${p.frete_motoboy.toLocaleString("es-PY")}</div>` : ""}
                            </div>
                            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${cardAcoes}</div>
                        </div>
                        ${badgeCancelCard}
                    </div>`;
      }
    });
  } else {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">Nenhum pedido ativo.</td></tr>';
    if (cardsDiv)
      cardsDiv.innerHTML =
        '<div style="text-align:center;padding:30px;color:#aaa;font-size:0.95rem">Nenhum pedido ativo no momento.</div>';
  }
}

// === CANCELAMENTO WORKFLOW ===
async function solicitarCancelamento(pedidoId) {
  const motivo = prompt(t("prompt.motivo_cancel"));
  if (!motivo || !motivo.trim()) return;

  const user = await supa.auth.getUser();
  const email = user?.data?.user?.email || "desconhecido";

  const { error } = await supa
    .from("pedidos")
    .update({
      cancelamento_solicitado: true,
      cancelamento_motivo: motivo.trim(),
      cancelamento_solicitado_por: email,
      cancelamento_solicitado_em: new Date().toISOString(),
    })
    .eq("id", pedidoId);

  if (error) {
    alert("❌ Erro: " + error.message);
    return;
  }

  // Registra na tabela de solicitações (falha silenciosa não bloqueia o fluxo)
  const { error: errSol } = await supa
    .from("solicitacoes_cancelamento")
    .insert([
      {
        pedido_id: pedidoId,
        motivo: motivo.trim(),
        solicitado_por: email,
      },
    ]);
  if (errSol) console.warn("solicitacoes_cancelamento insert:", errSol.message);

  alert(t("alert.cancel_enviado"));
  carregarPedidos();
}

async function aprovarCancelamento(pedidoId) {
  if (
    !confirm(
      "⚠️ Confirma o CANCELAMENTO deste pedido?\nEsta ação não pode ser desfeita.",
    )
  )
    return;

  const user = await supa.auth.getUser();
  const email = user?.data?.user?.email || "dono";

  const { error } = await supa
    .from("pedidos")
    .update({
      status: "cancelado",
      cancelamento_aprovado_por: email,
      cancelamento_aprovado_em: new Date().toISOString(),
    })
    .eq("id", pedidoId);

  if (error) {
    alert("❌ Erro: " + error.message);
    return;
  }

  // Bug #7 corrigido: repõe estoque ao aprovar cancelamento
  await _reporEstoqueCancelamento(pedidoId);

  // Bug #6 corrigido: estorna cashback ao aprovar cancelamento
  await _estornarCashbackCancelamento(pedidoId);

  // Marca como aprovada na tabela de solicitações
  await supa
    .from("solicitacoes_cancelamento")
    .update({
      aprovado: true,
      aprovado_por: email,
      aprovado_em: new Date().toISOString(),
    })
    .eq("pedido_id", pedidoId)
    .eq("aprovado", false);

  alert(t("alert.cancelado"));
  carregarPedidos();
}

async function negarCancelamento(pedidoId) {
  const obs = prompt(t("prompt.negar_cancel")) || "";
  const user = await supa.auth.getUser();
  const email = user?.data?.user?.email || "dono";

  await supa
    .from("pedidos")
    .update({
      cancelamento_solicitado: false,
      cancelamento_motivo: null,
    })
    .eq("id", pedidoId);

  await supa
    .from("solicitacoes_cancelamento")
    .update({
      negado: true,
      negado_por: email,
      negado_em: new Date().toISOString(),
      observacoes: obs,
    })
    .eq("pedido_id", pedidoId)
    .eq("aprovado", false);

  alert(t("alert.cancel_negado"));
  carregarPedidos();
}

async function mudarStatus(id, novoStatus) {
  // Registra o timestamp do novo status no campo correspondente
  const camposTimestamp = {
    em_preparo: ["tempo_confirmado", "tempo_preparo_iniciado"], // aceita E começa a preparar
    pronto_entrega: "tempo_pronto",
    saiu_entrega: "tempo_saiu_entrega",
    entregue: "tempo_entregue",
  };

  const updateData = { status: novoStatus };
  const campos = camposTimestamp[novoStatus];
  if (campos) {
    const agora = new Date().toISOString();
    if (Array.isArray(campos)) campos.forEach((c) => (updateData[c] = agora));
    else updateData[campos] = agora;
  }
  // Status 'cancelado' mantém os timestamps existentes

  const { error } = await supa.from("pedidos").update(updateData).eq("id", id);
  if (error) {
    console.error("Erro ao atualizar:", error);
    alert("Erro ao mudar status");
    return;
  }

  if (novoStatus === "em_preparo") await _descontarEstoqueVenda(id, null);

  // Bug #7 corrigido: repõe estoque ao cancelar
  if (novoStatus === "cancelado") await _reporEstoqueCancelamento(id);

  // Bug #6 corrigido: estorna cashback gerado ao cancelar
  if (novoStatus === "cancelado") await _estornarCashbackCancelamento(id);

  if (typeof pararAlarme === "function") pararAlarme();

  // Notifica o cliente via Web Push (ignora silenciosamente se falhar)
  _notificarClientePush(id, novoStatus);

  const abaAtual = localStorage.getItem("app_lastTab");
  if (abaAtual === "cozinha") carregarCozinha();
  else if (abaAtual === "pedidos") carregarPedidos();
  else if (abaAtual === "pdv") carregarMonitorMesas();
}

// Dispara a Edge Function notificar-cliente de forma fire-and-forget
async function _notificarClientePush(pedidoId, status) {
  try {
    const supaUrl =
      window._SUPABASE_URL ||
      (typeof _SUPABASE_URL !== "undefined" ? _SUPABASE_URL : "");
    if (!supaUrl) return;
    const fnUrl =
      supaUrl.replace("/rest/v1", "").replace(/\/+$/, "") +
      "/functions/v1/notificar-cliente";
    // Usa a chave anon — a Edge Function usa service role internamente
    const { data: session } = await supa.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return;
    fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pedido_id: pedidoId, status }),
    }).catch(() => {}); // fire-and-forget, nunca bloqueia
  } catch (_) {
    /* silencioso */
  }
}

// === FUNÇÃO DE IMPRESSÃO (RESTAURADA) ===
async function imprimirPedido(id) {
  const { data: p } = await supa
    .from("pedidos")
    .select("*")
    .eq("id", id)
    .single();
  if (!p) return;

  const dados = {
    id: p.id,
    cliente: { nome: p.cliente_nome, tel: p.cliente_telefone },
    entrega: { tipo: p.tipo_entrega, ref: p.endereco_entrega },
    // Imprime apenas itens pendentes (sem status ou status 'pendente')
    itens: (p.itens || [])
      .filter((i) => !i.status_item || i.status_item === "pendente")
      .map((i) => ({
        q: i.qtd || i.q || 1,
        n: i.nome || i.n,
        p: i.preco || i.p || 0,
        t: i.variacao || i.t || "",
        pr: i.preparo || i.pr || "",
        m: i.montagem || i.m,
        o: i.obs || i.o,
        // Kg — necessário para imprimir.html mostrar peso em vez de qtd
        _isKg: i._isKg || false,
        peso_gramas: i.peso_gramas || 0,
      })),
    valores: {
      sub: p.subtotal,
      frete: p.frete_cobrado_cliente,
      total: p.total_geral,
    },
    pagamento: { metodo: p.forma_pagamento, obs: p.obs_pagamento },
    factura: p.dados_factura,
    data: new Date(p.created_at || Date.now()).toLocaleString("pt-BR"),
  };

  const jsonStr = JSON.stringify(dados);
  // Base64 URL-safe: substitui +, / e = que quebram a URL
  const base64 = btoa(unescape(encodeURIComponent(jsonStr)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Abre a janela de impressão
  window.open(`imprimir.html?d=${base64}`, "Print", "width=420,height=700");
}

// =========================================
// 5. TELA COZINHA
// =========================================
async function carregarCozinha() {
  const { data: pedidos } = await supa
    .from("pedidos")
    .select("*")
    .eq("status", "em_preparo")
    .order("id", { ascending: true });

  const grid = document.getElementById("grid-cozinha");
  if (!grid) return;

  grid.innerHTML = "";

  if (!pedidos || pedidos.length === 0) {
    grid.innerHTML =
      '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#aaa; font-size:1.5rem;">👨‍🍳 Cozinha Livre!</div>';
    return;
  }

  pedidos.forEach((p) => {
    const dataOriginal = p.created_at || p.data_pedido || new Date();
    const horaPedido = new Date(dataOriginal).getTime();
    const agora = new Date().getTime();

    let minutos = 0;
    if (!isNaN(horaPedido)) {
      minutos = Math.floor((agora - horaPedido) / 60000);
    } else {
      console.warn(`Pedido ${p.id} com data inválida:`, dataOriginal);
    }

    let corTempo = "#2ecc71";
    if (minutos > 20) corTempo = "#f1c40f";
    if (minutos > 40) corTempo = "#e74c3c";

    // === Filtra apenas itens PENDENTES para a cozinha ===
    // Itens sem status_item são tratados como pendente (retrocompatibilidade)
    const itensPendentes = (p.itens || []).filter(
      (item) => !item.status_item || item.status_item === "pendente",
    );

    // Se não há nenhum item pendente neste pedido, pula o card
    if (itensPendentes.length === 0) return;

    let itensHtml = "";
    itensPendentes.forEach((item) => {
      const quantidade = item.qtd || item.q || 1;
      const nomeItem = item.nome || item.n || "Item";
      const variacaoItem = item.variacao || item.t || ""; // variação separada do nome
      const preparoItem = item.preparo || item.pr || ""; // preparo (cru/flambado etc)
      const observacao = item.obs || item.o || "";
      const montagemArray = item.montagem || item.m || [];

      const obs = observacao
        ? `<div style="color:#e74c3c; font-size:0.85rem">⚠️ ${observacao}</div>`
        : "";
      const listaMontagem = Array.isArray(montagemArray)
        ? montagemArray
            .map((linha) => {
              const idx = linha.indexOf(":");
              if (idx > 0) {
                return `<strong>${linha.slice(0, idx)}:</strong> ${linha.slice(idx + 1).trim()}`;
              }
              return linha;
            })
            .join("<br>")
        : "";
      const montagem = listaMontagem
        ? `<div style="font-size:0.8rem; color:#444; margin-left:10px; line-height:1.6;">${listaMontagem}</div>`
        : "";
      const variacaoHtml = variacaoItem
        ? `<span style="color:#FF441F; font-size:0.85rem; font-weight:600;"> ▸ ${variacaoItem}</span>`
        : "";
      const preparoHtml = preparoItem
        ? `<div style="color:#2980b9; font-size:0.82rem; margin-left:10px;">🍳 ${preparoItem}</div>`
        : "";

      itensHtml += `
                    <li style="border-bottom:1px dashed #444; padding:5px 0;">
                        <strong>${quantidade}x</strong> ${nomeItem}${variacaoHtml}
                        ${preparoHtml}
                        ${montagem}
                        ${obs}
                    </li>
                `;
    });

    // Info de garçom e local de entrega para o KDS
    const garcomHtml = p.garcom_nome
      ? `<div style="font-size:0.78rem;color:#fff;opacity:.85;margin-top:2px">🍽️ ${p.garcom_nome}</div>`
      : "";
    const localEntrega = p.endereco_entrega || "";
    const localHtml = localEntrega
      ? `<div style="font-size:0.82rem;background:rgba(255,255,255,.18);border-radius:5px;padding:2px 7px;font-weight:700">${localEntrega}</div>`
      : "";

    grid.innerHTML += `
            <div class="kds-card">
                <div class="kds-header" style="background:${corTempo}; color:#fff; padding:10px; border-radius:5px 5px 0 0; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <span style="font-weight:bold; font-size:1.1rem">#${p.uid_temporal || p.id}</span>
                      ${garcomHtml}
                    </div>
                    <div style="text-align:right">
                      <span>⏱️ ${minutos} min</span>
                      ${localHtml}
                    </div>
                </div>
                <div style="padding:10px;">
                    <div style="font-weight:bold; font-size:1.1rem; margin-bottom:10px; color:#2c3e50">
                        ${p.cliente_nome || "Cliente"}
                    </div>
                    <ul style="list-style:none; padding:0; margin:0; color:#333;">
                        ${itensHtml}
                    </ul>
                </div>
                <div style="padding:10px; margin-top:auto;">
                    <button class="btn btn-success" style="width:100%; padding:15px; font-size:1.1rem;" onclick="mudarStatus(${p.id}, 'pronto_entrega')">
                        ✅ PRONTO — ${p.garcom_nome ? `avisa ${p.garcom_nome.split(" ")[0]}` : "entregar"}
                    </button>
                </div>
            </div>
        `;
  });
}

// =========================================
// 6. FINANCEIRO
// =========================================
// Estado persistente do último cálculo financeiro
let _caixaState = {
  faturamento: 0,
  custoEntregas: 0,
  totalSaidas: 0,
  totalEntradas: 0,
  totalPix: 0,
  totalTransf: 0,
  totalCartao: 0,
  totalEfetivo: 0,
  totalQrPy: 0,
  totalCartaoBR: 0,
  totalMultiOutros: 0,
  qtdPedidos: 0,
};

// Sessão de caixa ativa (carregada ao abrir a aba financeiro)
let _sessaoCaixaAtiva = null;
// { id, usuario_email, aberto_em, fechado_em, valor_abertura }

// ─────────────────────────────────────────────────────────────
// GERENCIAMENTO DE SESSÃO DE CAIXA
// ─────────────────────────────────────────────────────────────

/**
 * Carrega a sessão de caixa ativa para o usuário corrente.
 * Gestores veem qualquer sessão aberta (ou a mais recente).
 * Funcionário vê apenas a sua própria.
 */
async function _carregarSessaoCaixa() {
  const ehGestor   = ["dono", "gerente", "adminMaster"].includes(perfilUsuario);
  const emailAtual = document.getElementById("user-email")?.innerText || "";

  let q = supa
    .from("sessoes_caixa")
    .select("*")
    .is("fechado_em", null)          // só sessões ABERTAS
    .order("aberto_em", { ascending: false })
    .limit(1);

  if (!ehGestor) q = q.eq("usuario_email", emailAtual);

  const { data } = await q;
  _sessaoCaixaAtiva = data?.[0] || null;

  // Atualiza o indicador visual de status do caixa (se existir no HTML)
  const elStatus = document.getElementById("status-sessao-caixa");
  if (elStatus) {
    if (_sessaoCaixaAtiva) {
      const dAbr = new Date(_sessaoCaixaAtiva.aberto_em).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
      elStatus.innerHTML = `<span style="color:#27ae60">🟢 Caixa aberto desde ${dAbr}</span>`;
    } else {
      elStatus.innerHTML = `<span style="color:#e74c3c">🔴 Nenhum caixa aberto</span>`;
    }
  }
}

/**
 * Exibe alerta de abertura de caixa e abre o modal para registro.
 */
function _exibirAlertaAberturaCaixa() {
  const ehGestor = ["dono", "gerente", "adminMaster"].includes(perfilUsuario);
  const msg = ehGestor
    ? "⚠️ Nenhuma sessão de caixa está aberta no momento.\n\nDeseja abrir o caixa agora?"
    : "⚠️ Você ainda não abriu o caixa hoje.\n\nÉ necessário registrar a abertura para contabilizar as vendas nesta sessão.\n\nDeseja abrir o caixa agora?";

  if (confirm(msg)) {
    abrirModalCaixa("abertura");
  }
}

/**
 * Abre nova sessão de caixa no Supabase e carrega em _sessaoCaixaAtiva.
 * Chamado ao salvar uma movimentação do tipo "abertura".
 */
async function _abrirSessaoCaixa(valorAbertura, descricao) {
  const emailAtual = document.getElementById("user-email")?.innerText || "";
  const nome       = document.getElementById("user-nome-display")?.innerText || emailAtual;

  const { data, error } = await supa
    .from("sessoes_caixa")
    .insert([{
      usuario_email:  emailAtual,
      usuario_nome:   nome,
      aberto_em:      new Date().toISOString(),
      valor_abertura: valorAbertura || 0,
      observacao:     descricao || null,
    }])
    .select()
    .single();

  if (error) throw error;
  _sessaoCaixaAtiva = data;
  return data;
}

async function calcularFinanceiro() {
  const abaFin = document.getElementById("financeiro");
  if (!abaFin || !abaFin.classList.contains("active")) return;

  const elInicio  = document.getElementById("fin-inicio");
  const elFim     = document.getElementById("fin-fim");
  const elTipo    = document.getElementById("fin-tipo");
  const elFactura = document.getElementById("fin-factura");
  if (!elInicio || !elFim || !elTipo) return;

  const ehGestor   = ["dono", "gerente", "adminMaster"].includes(perfilUsuario);
  const emailAtual = document.getElementById("user-email")?.innerText || "";

  // ── 1. Carrega sessão ativa (não bloqueia mais se não houver) ────
  await _carregarSessaoCaixa();

  // ── 2. Define intervalo de tempo ──────────────────────────────────
  // Gestores e adminMaster: usam o filtro de datas da tela (sem precisar de caixa aberto).
  // Funcionários sem sessão: mostram o dia atual como padrão.
  const _tz = 3 * 60 * 60 * 1000; // UTC-3 PY permanente desde 2024
  let utcI, utcF;

  if (ehGestor && elInicio.value && elFim.value) {
    // Gestor com filtro preenchido — usa o intervalo do filtro.
    // IMPORTANTE: interpretar a data como meia-noite em PY (UTC-3), não como hora local
    // do browser (que pode estar em qualquer fuso). "2026-05-13" em PY = 03:00 UTC do dia 13.
    utcI = new Date(elInicio.value + "T00:00:00-03:00").toISOString();
    utcF = new Date(elFim.value   + "T23:59:59-03:00").toISOString();
  } else if (_sessaoCaixaAtiva) {
    // Há sessão aberta — usa o intervalo da sessão como antes
    const sessaoInicio = _sessaoCaixaAtiva.aberto_em;
    const sessaoFim    = _sessaoCaixaAtiva.fechado_em || new Date().toISOString();
    utcI = sessaoInicio;
    utcF = sessaoFim;
    if (!elInicio.value || !elFim.value) {
      // Converte para data PY (UTC-3) antes de preencher os campos,
      // evitando que sessões que cruzam a meia-noite mostrem a data UTC errada.
      // Ex: fechado_em = "2026-05-14T04:40:00Z" → em PY ainda é "2026-05-13"
      const _tz = 3 * 60 * 60 * 1000;
      elInicio.value = new Date(new Date(sessaoInicio).getTime() - _tz).toISOString().split("T")[0];
      elFim.value    = new Date(new Date(sessaoFim).getTime()    - _tz).toISOString().split("T")[0];
    }
  } else {
    // Sem sessão e sem filtro — usa o dia de hoje (PY) como padrão
    const hojeISO = new Date(Date.now() - _tz).toISOString().split("T")[0];
    if (!elInicio.value) elInicio.value = hojeISO;
    if (!elFim.value)    elFim.value    = hojeISO;
    utcI = new Date(elInicio.value + "T00:00:00-03:00").toISOString();
    utcF = new Date(elFim.value   + "T23:59:59-03:00").toISOString();
  }

  const tipoFiltro    = elTipo.value;
  const facturaFiltro = elFactura ? elFactura.value : "todos";

  // ── Oculta/exibe elementos exclusivos de gestor na UI ─────────────
  const _elFiltrosGestor = document.getElementById("fin-filtros-gestor");
  if (_elFiltrosGestor) _elFiltrosGestor.style.display = ehGestor ? "" : "none";
  const _elSecDespesas = document.getElementById("secao-despesas-caixa");
  if (_elSecDespesas) _elSecDespesas.style.display = ehGestor ? "" : "none";
  const _elSecMotoboys = document.getElementById("secao-motoboys-financeiro");
  if (_elSecMotoboys) _elSecMotoboys.style.display = ehGestor ? "" : "none";

  // ── 4. Busca pedidos dentro da janela da sessão ───────────────────
  let query = supa
    .from("pedidos")
    .select("*, motoboys(nome)")
    .in("status", ["entregue", "em_preparo", "pronto_entrega", "saiu_entrega"])
    .gte("created_at", utcI)
    .lte("created_at", utcF);

  if (tipoFiltro !== "todos") query = query.eq("forma_pagamento", tipoFiltro);

  // Funcionário: filtra apenas pedidos do próprio caixa via garcom_id (= _perfilId)
  if (!ehGestor && _perfilId) query = query.eq("garcom_id", _perfilId);

  const { data: pedidos } = await query;
  let peds = pedidos || [];

  if (facturaFiltro === "com_factura")
    peds = peds.filter((p) => p.dados_factura?.ruc || p.dados_factura?.ci);
  else if (facturaFiltro === "sem_factura")
    peds = peds.filter((p) => !p.dados_factura?.ruc && !p.dados_factura?.ci);

  // ── 5. Movimentações de caixa da SESSÃO (opcional — só se houver sessão) ──
  let caixa = [];
  if (_sessaoCaixaAtiva) {
    let caixaQuery = supa
      .from("movimentacoes_caixa")
      .select("*")
      .eq("sessao_id", _sessaoCaixaAtiva.id);
    if (!ehGestor) caixaQuery = caixaQuery.eq("usuario_email", emailAtual);
    const { data: caixaData } = await caixaQuery;
    caixa = caixaData || [];
  } else if (ehGestor) {
    // Gestor sem sessão ativa: busca movimentações pelo intervalo de datas
    const { data: caixaData } = await supa
      .from("movimentacoes_caixa")
      .select("*")
      .gte("created_at", utcI)
      .lte("created_at", utcF);
    caixa = caixaData || [];
  }

  // Verifica bloqueio de caixa (apenas se há sessão ativa)
  if (_sessaoCaixaAtiva) _verificarBloqueioCaixa(emailAtual);

  // ── 6. Cálculos (inalterado) ──────────────────────────────────────
  const safeNum = (v) => {
    if (!v) return 0;
    if (typeof v === "number") return v;
    return parseFloat(v.toString().replace(/[^\d.,-]/g,"").replace(",",".")) || 0;
  };
  const fmt = (n) => "Gs " + n.toLocaleString("es-PY");

  let faturamento = 0, totalPix = 0, totalTransf = 0, totalCartao = 0, totalEfetivo = 0,
      totalQrPy = 0, totalCartaoBR = 0, totalMultiOutros = 0;
  let custoEntregas = 0, qtdPedidos = 0;
  const motoMap = {};

  peds.forEach((p) => {
    const val = safeNum(p.total_geral);
    faturamento += val;
    qtdPedidos++;
    const pag = (p.forma_pagamento || "").toLowerCase();
    const obsPag = p.obs_pagamento || "";

    // ── Multipagamento: distribui pelos métodos reais gravados em obs_pagamento ──
    if (pag === "multipagamento" && obsPag) {
      try {
        const partes = JSON.parse(obsPag); // [{ forma, valor }, ...]
        if (Array.isArray(partes)) {
          partes.forEach((parte) => {
            const pf = (parte.forma || "").toLowerCase();
            const pv = Math.round(Number(parte.valor) || 0);
            if (pf.includes("pix"))                                   totalPix      += pv;
            else if (pf.includes("transfer"))                         totalTransf   += pv;
            else if (pf.includes("qrpy") || pf.includes("qr"))       totalQrPy     += pv;
            else if (pf.includes("cartaobr") || pf.includes("br"))   totalCartaoBR += pv;
            else if (pf.includes("cartao") || pf.includes("cartão")) totalCartao   += pv;
            else                                                       totalEfetivo  += pv;
          });
        } else { totalMultiOutros += val; }
      } catch (_) { totalMultiOutros += val; }
    }
    // ── Pagamentos simples ──────────────────────────────────────────────────
    else if (pag.includes("pix"))                                    totalPix      += val;
    else if (pag.includes("transfer") || pag.includes("alias"))     totalTransf   += val;
    else if (pag === "qrpy")                                         totalQrPy     += val;
    else if (pag === "cartaobr")                                     totalCartaoBR += val;
    else if (pag.includes("cartao") || pag.includes("cartão"))      totalCartao   += val;
    else if (pag.includes("efetivo") || pag.includes("dinheiro"))   totalEfetivo  += val;
    else                                                             totalMultiOutros += val;
    if (p.tipo_entrega === "delivery") {
      const taxa = safeNum(p.frete_motoboy) || TAXA_MOTOBOY || 0;
      custoEntregas += taxa;
      const nm = p.motoboys?.nome || "Sem Motoboy";
      if (!motoMap[nm]) motoMap[nm] = { entregas: 0, frete_total: 0 };
      motoMap[nm].entregas++;
      motoMap[nm].frete_total += taxa;
    }
  });

  const qtdMotoboyUnicos = Object.keys(motoMap).filter(n => n !== "Sem Motoboy").length;
  custoEntregas += (AJUDA_COMBUSTIVEL || 0) * qtdMotoboyUnicos;

  let totalSaidas = 0, totalEntradas = 0, totalSangria = 0;
  (caixa || []).forEach((c) => {
    const v = safeNum(c.valor);
    if (c.tipo === "despesa")  totalSaidas  += v;
    if (c.tipo === "sangria")  { totalSaidas += v; totalSangria += v; }
    if (c.tipo === "suprimento" || c.tipo === "abertura") totalEntradas += v;
  });

  _caixaState = { faturamento, custoEntregas, totalSaidas, totalEntradas,
                  totalPix, totalTransf, totalCartao, totalEfetivo,
                  totalQrPy, totalCartaoBR, totalMultiOutros,
                  qtdPedidos, totalSangria };

  const lucro = faturamento + totalEntradas - custoEntregas - totalSaidas;
  const setV  = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };

  setV("card-faturamento",  fmt(faturamento));
  setV("card-custo-moto",   fmt(custoEntregas));
  setV("card-lucro",        fmt(lucro));
  setV("total-pix",         fmt(totalPix));
  setV("total-transf",      fmt(totalTransf));
  setV("total-cartao",      fmt(totalCartao));
  setV("total-efetivo",     fmt(totalEfetivo));
  setV("total-qrpy",        fmt(totalQrPy));
  setV("total-cartaobr",    fmt(totalCartaoBR));
  setV("total-multi-outros",fmt(totalMultiOutros));
  setV("card-qtd-pedidos",  qtdPedidos);
  setV("card-ticket-medio", fmt(qtdPedidos > 0 ? faturamento / qtdPedidos : 0));

  // Badge do operador / info da sessão
  const badgeCaixa = document.getElementById("badge-caixa-operador");
  if (badgeCaixa) {
    if (_sessaoCaixaAtiva) {
      const dAbr = new Date(_sessaoCaixaAtiva.aberto_em).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
      const dFch = _sessaoCaixaAtiva.fechado_em
        ? new Date(_sessaoCaixaAtiva.fechado_em).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })
        : "em aberto";
      badgeCaixa.textContent = ehGestor
        ? `📊 Visão geral — sessão ${_sessaoCaixaAtiva.id} (${_sessaoCaixaAtiva.usuario_email}) · ${dAbr} → ${dFch}`
        : `💼 Seu caixa — aberto ${dAbr} → ${dFch}`;
    } else {
      const d1 = elInicio.value || "—";
      const d2 = elFim.value    || "—";
      badgeCaixa.textContent = `📊 Período: ${d1} → ${d2} (sem sessão de caixa ativa)`;
    }
  }

  // Tabelas de despesas e motoboys (código original preservado)
  const tbD = document.getElementById("lista-despesas-caixa");
  if (tbD) {
    const despesas = (caixa || []).filter((c) => c.tipo === "despesa");
    const _DLABELS = {
      despesas_gerais:"📦 Despesas Gerais", contas_fixas:"🏠 Contas Fixas",
      pagamento_fornecedor:"🤝 Fornecedor",  pagamento_funcionario:"👷 Funcionário",
      pagamento_terceiros:"👥 Terceiros",    manutencao:"🔧 Manutenção",
      retirada:"💵 Retirada", motoboy:"🛵 Motoboy", outro:"✏️ Outro",
    };
    if (!despesas.length) {
      tbD.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:16px">Nenhuma despesa nesta sessão</td></tr>';
    } else {
      tbD.innerHTML = despesas.map((d) => {
        const dt = new Date(d.created_at).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
        const tipoLabel = _DLABELS[d.tipo_despesa] || d.tipo_despesa || "—";
        const descExtra = d.tipo_despesa === "outro" && d.descricao_outro ? ` (${d.descricao_outro})` : "";
        const obs = d.descricao || "";
        const enc = encodeURIComponent(JSON.stringify({ id:d.id, valor:d.valor, tipo_despesa:d.tipo_despesa||"despesas_gerais", descricao:d.descricao||"", descricao_outro:d.descricao_outro||"" }));
        return `<tr>
          <td style="white-space:nowrap;color:#666;font-size:0.82rem">${dt}</td>
          <td><span style="background:#fdecea;color:#a93226;padding:2px 7px;border-radius:10px;font-size:0.78rem">${tipoLabel}${descExtra}</span></td>
          <td style="color:#555;font-size:0.85rem">${obs}</td>
          <td style="text-align:right;font-weight:700;color:#c0392b;white-space:nowrap">${fmt(d.valor)}</td>
          <td style="text-align:center;white-space:nowrap">
            <button onclick="abrirEditarDespesa('${enc}')" style="background:#3498db;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem;margin-right:4px">✏️</button>
            <button onclick="excluirDespesa(${d.id})" style="background:#e74c3c;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem">🗑️</button>
          </td></tr>`;
      }).join("");
    }
  }

  const tbM = document.getElementById("lista-financeiro-motoboys");
  if (tbM) {
    tbM.innerHTML = "";
    if (!Object.keys(motoMap).length) {
      tbM.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999">Nenhuma entrega nesta sessão</td></tr>';
    } else {
      for (const [nome, d] of Object.entries(motoMap)) {
        const semNome = nome === "Sem Motoboy";
        const comb = semNome ? 0 : AJUDA_COMBUSTIVEL || 0;
        const tot  = d.frete_total + comb;
        const combLabel = semNome
          ? '<span style="color:#aaa;font-size:0.78rem">sem combustível</span>'
          : `+ comb. ${fmt(comb)}`;
        tbM.innerHTML += `<tr><td>${nome}</td><td>${d.entregas}</td>
          <td style="font-size:0.82rem">Frete: ${fmt(d.frete_total)} ${combLabel}</td>
          <td><strong>${fmt(tot)}</strong></td></tr>`;
      }
    }
  }
}

// ── Verifica bloqueio por sangria limite ───────────────────────────
async function _verificarBloqueioCaixa(emailAtual) {
  const { data: cfg } = await supa
    .from("configuracoes")
    .select("sangria_limite, caixa_status")
    .maybeSingle();
  if (!cfg?.sangria_limite) return;

  // UTC-3 PY (horario de verao permanente desde 2024)
  const _tz = 3 * 60 * 60 * 1000;
  const hoje = new Date();
  const dStr = new Date(hoje.getTime() - _tz).toISOString().split("T")[0]; // data em PY, não UTC
  const dIni = new Date(dStr + "T00:00:00-03:00").toISOString();
  const dFim = new Date(dStr + "T23:59:59-03:00").toISOString();
  const { data: movs } = await supa
    .from("movimentacoes_caixa")
    .select("tipo, valor")
    .eq("usuario_email", emailAtual)
    .gte("created_at", dIni)
    .lte("created_at", dFim);

  let efetivo = 0;
  (movs || []).forEach((m) => {
    const v = parseFloat(m.valor) || 0;
    if (
      m.tipo === "efetivo" ||
      m.tipo === "abertura" ||
      m.tipo === "suprimento"
    )
      efetivo += v;
    if (m.tipo === "sangria") efetivo -= v;
  });

  const status = cfg.caixa_status || {};
  const bloqueado = status[emailAtual]?.bloqueado;
  const banner = document.getElementById("banner-caixa-bloqueado");

  if (!bloqueado && efetivo >= cfg.sangria_limite) {
    // Bloqueia
    const novoStatus = {
      ...status,
      [emailAtual]: {
        bloqueado: true,
        bloqueado_em: new Date().toISOString(),
        autorizado_por: null,
      },
    };
    await supa
      .from("configuracoes")
      .update({ caixa_status: novoStatus })
      .gt("id", 0);
    if (banner) {
      banner.style.display = "block";
      banner.querySelector("#banner-sangria-msg").textContent =
        `Caixa bloqueado: efetivo atingiu o limite de sangria (Gs ${cfg.sangria_limite.toLocaleString("es-PY")}). Solicite autorização de um gestor.`;
    }
    return;
  }
  if (banner) banner.style.display = bloqueado ? "block" : "none";
}

async function autorizarReaberturaCaixa(emailAlvo) {
  if (!["dono", "gerente", "adminMaster"].includes(perfilUsuario)) {
    alert(t("alert.acesso_negado"));
    return;
  }
  if (!confirm(`Autorizar reabertura do caixa de ${emailAlvo}?`)) return;
  const { data: cfg } = await supa
    .from("configuracoes")
    .select("caixa_status")
    .maybeSingle();
  const status = { ...(cfg?.caixa_status || {}) };
  const emailGestor = document.getElementById("user-email")?.innerText || "";
  status[emailAlvo] = {
    bloqueado: false,
    autorizado_por: emailGestor,
    autorizado_em: new Date().toISOString(),
  };
  await supa.from("configuracoes").update({ caixa_status: status }).gt("id", 0);
  alert(t("alert.caixa_reaberto"));
  calcularFinanceiro();
}

async function exportarFinanceiro() {
  // 1. Pega os mesmos filtros da tela
  const elInicio = document.getElementById("fin-inicio");
  const elFim = document.getElementById("fin-fim");
  const elTipo = document.getElementById("fin-tipo");
  const elFactura = document.getElementById("fin-factura");

  const inicio = elInicio.value;
  const fim = elFim.value;
  const tipoFiltro = elTipo ? elTipo.value : "todos";
  const facturaFiltro = elFactura ? elFactura.value : "todos";

  // Define período
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  let dataInicio, dataFim;
  if (inicio && fim) {
    dataInicio = inicio + " 00:00:00";
    dataFim = fim + " 23:59:59";
  } else {
    dataInicio = `${ano}-${mes}-${dia} 00:00:00`;
    dataFim = `${ano}-${mes}-${dia} 23:59:59`;
  }

  // 2. Busca os dados
  let query = supa
    .from("pedidos")
    .select("*")
    .eq("status", "entregue")
    .gte("created_at", dataInicio)
    .lte("created_at", dataFim);

  if (tipoFiltro !== "todos") {
    query = query.eq("forma_pagamento", tipoFiltro);
  }

  const { data: pedidos, error } = await query;

  if (error) {
    alert("Erro ao buscar dados: " + error.message);
    return;
  }

  if (!pedidos || pedidos.length === 0) {
    alert("Nenhum pedido encontrado no período selecionado.");
    return;
  }

  // 3. Filtra por factura se necessário
  let pedidosFiltrados = pedidos;
  if (facturaFiltro === "com_factura") {
    pedidosFiltrados = pedidos.filter(
      (p) => p.dados_factura && (p.dados_factura.ruc || p.dados_factura.ci),
    );
  } else if (facturaFiltro === "sem_factura") {
    pedidosFiltrados = pedidos.filter(
      (p) => !p.dados_factura || (!p.dados_factura.ruc && !p.dados_factura.ci),
    );
  }

  // 4. Prepara dados para CSV
  let csv =
    "ID Pedido,Data/Hora,Cliente,Telefone,Tipo Entrega,Forma Pagamento,Subtotal,Frete,Total,RUC/CI,Razão Social\n";

  pedidosFiltrados.forEach((p) => {
    const data = new Date(p.created_at).toLocaleString("pt-BR");
    const cliente = (p.cliente_nome || "").replace(/,/g, " "); // Remove vírgulas
    const telefone = p.cliente_telefone || "";
    const tipo = p.tipo_entrega || "";
    const pagamento = p.forma_pagamento || "";
    const subtotal = p.subtotal || 0;
    const frete = p.frete_cobrado_cliente || 0;
    const total = p.total_geral || 0;
    const ruc = p.dados_factura?.ruc || p.dados_factura?.ci || "";
    const razao = (p.dados_factura?.razao || "").replace(/,/g, " ");

    csv += `${p.id},${data},${cliente},${telefone},${tipo},${pagamento},${subtotal},${frete},${total},${ruc},${razao}\n`;
  });

  // 5. Cria arquivo e faz download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Relatorio_Financeiro_${ano}-${mes}-${dia}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert(
    `✅ Relatório exportado com sucesso!\n\nTotal de pedidos: ${pedidosFiltrados.length}`,
  );
}

// =====================================================
// ALTERNATIVA: EXPORTAR PARA EXCEL REAL (XLSX)
// =====================================================
// Se quiser usar biblioteca SheetJS para Excel verdadeiro:

async function exportarFinanceiroXLSX() {
  // Aviso: Requer biblioteca SheetJS
  if (typeof XLSX === "undefined") {
    alert("Biblioteca XLSX não carregada. Usando CSV simples.");
    exportarFinanceiro();
    return;
  }

  // Busca os dados (mesmo código acima)
  // ... código de busca ...

  // Cria planilha
  const ws = XLSX.utils.json_to_sheet(
    pedidosFiltrados.map((p) => ({
      ID: p.id,
      Data: new Date(p.created_at).toLocaleString("pt-BR"),
      Cliente: p.cliente_nome,
      Telefone: p.cliente_telefone,
      Tipo: p.tipo_entrega,
      Pagamento: p.forma_pagamento,
      Subtotal: p.subtotal,
      Frete: p.frete_cobrado_cliente,
      Total: p.total_geral,
      "RUC/CI": p.dados_factura?.ruc || p.dados_factura?.ci || "",
      Razão: p.dados_factura?.razao || "",
    })),
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vendas");

  const hoje = new Date();
  XLSX.writeFile(
    wb,
    `Relatorio_${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}.xlsx`,
  );
}

// =====================================================
// RELATÓRIO DETALHADO DE PEDIDOS
// =====================================================
async function abrirRelatorio() {
  const modal = document.getElementById("modal-relatorio");
  if (modal) {
    modal.style.display = "flex";
    await carregarRelatorio();
  }
}

async function carregarRelatorio() {
  const filtroNum = document.getElementById("rel-filtro-numero")?.value?.trim();
  const filtroInicio = document.getElementById("rel-filtro-inicio")?.value;
  const filtroFim = document.getElementById("rel-filtro-fim")?.value;
  const hoje = new Date().toISOString().split("T")[0];
  let query = supa
    .from("pedidos")
    .select("*")
    .order("id", { ascending: false })
    .limit(100);
  if (filtroNum) {
    query = query.eq("id", parseInt(filtroNum));
  } else {
    const ini = filtroInicio || hoje;
    const fim = filtroFim || hoje;
    // Paraguai UTC-3 permanente desde Lei 7189/2024 (aboliu horário de verão)
    // Usando offset explícito "-03:00" para independer do fuso do browser
    const utcIni = new Date(ini + "T00:00:00-03:00").toISOString();
    const utcFim = new Date(fim + "T23:59:59-03:00").toISOString();
    query = query.gte("created_at", utcIni).lte("created_at", utcFim);
  }
  const { data: pedidos, error } = await query;
  if (error) {
    console.error(error);
    return;
  }
  const tbody = document.getElementById("rel-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const fmtDiff = (t1, t2) => {
    if (!t1 || !t2) return "-";
    const diff = Math.round((new Date(t2) - new Date(t1)) / 60000);
    if (diff < 60) return diff + " min";
    return Math.floor(diff / 60) + "h " + (diff % 60) + "m";
  };
  const fmtHora = (t) =>
    t
      ? new Date(t).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Asuncion",
        })
      : "-";
  const scMap = {
    pendente: { bg: "#fff3cd", color: "#856404", label: "⏳ Pendente" },
    em_preparo: { bg: "#ffe5d0", color: "#a63c06", label: "🔥 Em Preparo" },
    pronto_entrega: { bg: "#d1ecf1", color: "#0c5460", label: "📦 Pronto" },
    saiu_entrega: { bg: "#d4edda", color: "#155724", label: "🛵 Saiu" },
    entregue: { bg: "#d4edda", color: "#155724", label: "✅ Entregue" },
    cancelado: { bg: "#f8d7da", color: "#721c24", label: "❌ Cancelado" },
  };

  (pedidos || []).forEach((p) => {
    const sc = scMap[p.status] || {
      bg: "#f0f0f0",
      color: "#333",
      label: p.status,
    };
    const isPDV = p.tipo_entrega === "balcao";

    const itensList = (p.itens || [])
      .map((i) => {
        const qtd = i.qtd || i.q || 1;
        const nome = i.nome || i.n || "?";
        const variacao = i.variacao || i.t || "";
        const montagem = i.montagem || i.m || [];
        let lbl = `<strong>${qtd}x</strong> ${nome}`;
        if (variacao && variacao !== nome)
          lbl += ` <span style="color:#e67e22">▸ ${variacao}</span>`;
        if (montagem.length > 0) {
          const montagemHtml = montagem
            .map((linha) => {
              const idx = linha.indexOf(":");
              if (idx > 0)
                return `<strong>${linha.slice(0, idx)}:</strong> ${linha.slice(idx + 1).trim()}`;
              return linha;
            })
            .join(" · ");
          lbl += ` <span style="color:#555;font-size:0.78em">(${montagemHtml})</span>`;
        }
        return lbl;
      })
      .join("<br>");

    // Cancelamento info
    let cancelInfo = "";
    if (p.status === "cancelado") {
      const quem = p.cancelamento_solicitado_por || "admin";
      cancelInfo = `<div style="margin-top:5px;padding:5px 7px;background:#fde;border-radius:6px;font-size:0.72rem;color:#a00">
        🚫 <strong>Por:</strong> ${quem}${p.cancelamento_motivo ? "<br><em>" + p.cancelamento_motivo + "</em>" : ""}</div>`;
    } else if (p.cancelamento_solicitado) {
      cancelInfo = `<div style="margin-top:4px;font-size:0.7rem;color:#e74c3c">
        🚫 Solicitado por: ${p.cancelamento_solicitado_por || "?"}</div>`;
    }

    // Tipo badge
    const tipoBadges = {
      balcao:
        '<span style="background:#e8f4f8;color:#1a6e8a;border-radius:10px;padding:2px 7px;font-size:0.68rem;font-weight:700">🏪 PDV</span>',
      delivery:
        '<span style="background:#e8f7e8;color:#1a6e2e;border-radius:10px;padding:2px 7px;font-size:0.68rem;font-weight:700">🛵 Delivery</span>',
      retirada:
        '<span style="background:#f7f0e8;color:#6e4a1a;border-radius:10px;padding:2px 7px;font-size:0.68rem;font-weight:700">🚶 Retirada</span>',
    };
    const tipoBadge = tipoBadges[p.tipo_entrega] || "";

    // Timeline — PDV tem etapas diferentes
    const tl = isPDV
      ? [
          {
            icon: "🏪",
            label: "Abertura",
            val: fmtHora(p.tempo_recebido || p.created_at),
            diff: null,
          },
          {
            icon: "🔥",
            label: "Cozinha",
            val: fmtHora(p.tempo_preparo_iniciado),
            diff: null,
          },
          {
            icon: "📦",
            label: "Pronto",
            val: fmtHora(p.tempo_pronto),
            diff: fmtDiff(p.tempo_preparo_iniciado, p.tempo_pronto),
          },
          {
            icon: "✅",
            label: "Fechado",
            val: fmtHora(p.tempo_entregue),
            diff: fmtDiff(p.tempo_recebido || p.created_at, p.tempo_entregue),
          },
        ]
      : [
          {
            icon: "📥",
            label: "Recebido",
            val: fmtHora(p.tempo_recebido),
            diff: null,
          },
          {
            icon: "✅",
            label: "Aceite",
            val: fmtHora(p.tempo_confirmado),
            diff: fmtDiff(p.tempo_recebido, p.tempo_confirmado),
          },
          {
            icon: "🔥",
            label: "Cozinha",
            val: fmtHora(p.tempo_preparo_iniciado),
            diff: null,
          },
          {
            icon: "📦",
            label: "Pronto",
            val: fmtHora(p.tempo_pronto),
            diff: fmtDiff(p.tempo_preparo_iniciado, p.tempo_pronto),
          },
          {
            icon: "🛵",
            label: "Saiu",
            val: fmtHora(p.tempo_saiu_entrega),
            diff: null,
          },
          {
            icon: "🏠",
            label: "Entregue",
            val: fmtHora(p.tempo_entregue),
            diff: fmtDiff(p.tempo_saiu_entrega, p.tempo_entregue),
          },
        ];

    const tlHtml = tl
      .map((t) => {
        const vazio = t.val === "-";
        return `<div style="display:flex;align-items:baseline;gap:5px;padding:2px 0;border-bottom:1px solid #f5f5f5">
        <span style="min-width:18px;font-size:0.85em">${t.icon}</span>
        <span style="min-width:64px;font-size:0.72rem;color:#888">${t.label}:</span>
        <span style="font-size:0.78rem;font-weight:${vazio ? "400" : "600"};color:${vazio ? "#ccc" : "#222"}">${t.val}</span>
        ${t.diff && t.diff !== "-" ? `<span style="font-size:0.68rem;color:#999">(${t.diff})</span>` : ""}
      </div>`;
      })
      .join("");

    const totalTime = isPDV
      ? fmtDiff(p.tempo_recebido || p.created_at, p.tempo_entregue)
      : fmtDiff(p.tempo_recebido, p.tempo_entregue);

    const _tz = { timeZone: "America/Asuncion" };
    tbody.innerHTML += `<tr style="border-bottom:1px solid #eee;vertical-align:top">
      <td style="padding:10px 8px;white-space:nowrap">
        <div style="font-size:1rem;font-weight:700;color:#1a1a2e">#${p.id}</div>
        <div style="font-size:0.73rem;color:#aaa">${new Date(p.created_at).toLocaleDateString("pt-BR", _tz)}</div>
        <div style="font-size:0.78rem;color:#666">${new Date(p.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", ..._tz })}</div>
      </td>
      <td style="padding:10px 8px">
        <div style="font-weight:700;color:#1a1a2e">${p.cliente_nome || "-"}</div>
        <div style="font-size:0.73rem;color:#999">📞 ${p.cliente_telefone || "-"}</div>
        <div style="margin-top:4px">${tipoBadge}</div>
      </td>
      <td style="padding:10px 8px;font-size:0.82rem;max-width:260px;line-height:1.6">${itensList || "-"}</td>
      <td style="padding:10px 8px;white-space:nowrap">
        <span style="display:inline-block;padding:4px 10px;border-radius:20px;font-size:0.73rem;font-weight:700;background:${sc.bg};color:${sc.color}">${sc.label}</span>
        ${cancelInfo}
      </td>
      <td style="padding:10px 8px;white-space:nowrap;text-align:right">
        <div style="font-size:0.95rem;font-weight:700;color:#1a1a2e">Gs ${(p.total_geral || 0).toLocaleString("es-PY")}</div>
        <div style="font-size:0.7rem;color:#aaa;margin-top:2px">${p.forma_pagamento || ""}</div>
      </td>
      <td style="padding:10px 8px;min-width:175px">
        ${tlHtml}
        ${totalTime !== "-" ? `<div style="margin-top:5px;padding:3px 7px;background:#f0f4ff;border-radius:6px;font-size:0.75rem;font-weight:700;color:#3a4db7;text-align:center">⏱ ${totalTime}</div>` : ""}
      </td>
    </tr>`;
  });
  if (!pedidos || pedidos.length === 0)
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:40px;color:#aaa">Nenhum pedido encontrado.</td></tr>';
  const el = document.getElementById("rel-total-count");
  if (el) el.textContent = (pedidos || []).length + " pedidos encontrados";
}

function abrirModalCaixa(tipo) {
  document.getElementById("modal-caixa").style.display = "flex";
  document.getElementById("tipo-caixa").value = tipo;

  const titulos = {
    abertura: "🟢 Abrir Caixa",
    suprimento: "➕ Suprimento",
    sangria: "💸 Sangria",
    despesa: "🧾 Despesa",
  };
  document.getElementById("titulo-caixa").innerText =
    titulos[tipo] || "Operação";
  document.getElementById("valor-caixa").value = "";
  document.getElementById("desc-caixa").value = "";

  // Mostra/oculta seletor de tipo de despesa
  const despesaBox = document.getElementById("box-tipo-despesa");
  if (despesaBox)
    despesaBox.style.display = tipo === "despesa" ? "block" : "none";
  document.getElementById("valor-caixa").focus();
}

async function salvarMovimentacaoCaixa() {
  const tipo  = document.getElementById("tipo-caixa").value;
  const valor = parseFloat(document.getElementById("valor-caixa").value);
  const desc  = document.getElementById("desc-caixa").value.trim();

  if (!valor || valor <= 0) { alert("Digite um valor válido."); return; }

  const emailAtual = document.getElementById("user-email")?.innerText || "";

  // Bloquear se caixa bloqueado
  const { data: cfg } = await supa.from("configuracoes").select("caixa_status").maybeSingle();
  const status = cfg?.caixa_status || {};
  if (status[emailAtual]?.bloqueado && tipo !== "sangria") {
    alert("⛔ Caixa bloqueado por sangria. Solicite autorização de um gestor para reabrir.");
    return;
  }

  let tipoDespesa = null, descOutro = null;
  if (tipo === "despesa") {
    tipoDespesa = document.getElementById("tipo-despesa-sel")?.value || "despesas_gerais";
    if (tipoDespesa === "outro") {
      descOutro = document.getElementById("desc-outro-despesa")?.value?.trim() || "";
      if (!descOutro) { alert("Descreva o tipo da despesa."); return; }
    }
  }

  // ── Se for ABERTURA, cria a sessão primeiro ───────────────────────
  if (tipo === "abertura") {
    try {
      await _abrirSessaoCaixa(valor, desc);
      alert(`✅ Caixa aberto com fundo de Gs ${valor.toLocaleString("es-PY")}!`);
      fecharModal("modal-caixa");
      // Atualiza painel de caixa no PDV (caso o modal tenha sido aberto de lá)
      if (typeof pdvCarregarPainelCaixa === "function") pdvCarregarPainelCaixa();
      if (document.getElementById("financeiro")?.classList.contains("active")) {
        calcularFinanceiro();
      }
      return;
    } catch (e) {
      alert("Erro ao abrir caixa: " + e.message);
      return;
    }
  }

  // ── Para outros tipos, verifica se há sessão aberta ───────────────
  if (!_sessaoCaixaAtiva) {
    alert("⚠️ Nenhum caixa aberto. Abra o caixa antes de registrar movimentações.");
    return;
  }

  const insert = {
    tipo,
    valor,
    descricao:      desc,
    usuario_email:  emailAtual,
    tipo_despesa:   tipoDespesa,
    descricao_outro: descOutro,
    sessao_id:      _sessaoCaixaAtiva.id,  // ← vínculo com a sessão
  };

  const { error } = await supa.from("movimentacoes_caixa").insert([insert]);
  if (error) { alert("Erro: " + error.message); return; }

  alert(t("alert.operacao_registrada"));
  fecharModal("modal-caixa");
  calcularFinanceiro();
}

async function fecharCaixaResumo() {
  if (!_sessaoCaixaAtiva) {
    alert("Nenhum caixa aberto para fechar.");
    return;
  }

  if (!confirm("Fechar o caixa desta sessão?\nIsso encerra a sessão e registra o fechamento.")) return;

  await calcularFinanceiro(); // garante que _caixaState está atualizado
  const s   = _caixaState;
  const fmt = (n) => "Gs " + n.toLocaleString("es-PY");
  const lucro = s.faturamento + s.totalEntradas - s.custoEntregas - s.totalSaidas;

  try {
    // 1. Marca a sessão como fechada
    await supa
      .from("sessoes_caixa")
      .update({
        fechado_em:       new Date().toISOString(),
        valor_fechamento: lucro,
        observacao:       `Fat: ${fmt(s.faturamento)} | Res: ${fmt(lucro)}`,
      })
      .eq("id", _sessaoCaixaAtiva.id);

    // 2. Registra movimentação de fechamento vinculada à sessão
    await supa.from("movimentacoes_caixa").insert([{
      tipo:          "fechamento",
      valor:         lucro,
      descricao:     `Fechamento ${new Date().toLocaleDateString("pt-BR")} | Fat: ${fmt(s.faturamento)} | Res: ${fmt(lucro)}`,
      usuario_email: document.getElementById("user-email")?.innerText || "admin",
      sessao_id:     _sessaoCaixaAtiva.id,
    }]);
  } catch (e) {
    console.warn("Aviso fechamento:", e.message);
  }

  alert(`📊 FECHAMENTO DA SESSÃO #${_sessaoCaixaAtiva.id}
═══════════════════════════
Faturamento Total: ${fmt(s.faturamento)}

💰 Por Método:
  💵 Dinheiro:      ${fmt(s.totalEfetivo)}
  📱 Pix:           ${fmt(s.totalPix)}
  💳 Cartão PY:     ${fmt(s.totalCartao)}
  💳 Cartão BR:     ${fmt(s.totalCartaoBR)}
  🏦 Transferência: ${fmt(s.totalTransf)}
  📲 QR Paraguay:   ${fmt(s.totalQrPy)}
${s.totalMultiOutros > 0 ? `  🔀 Multi/Outros:  ${fmt(s.totalMultiOutros)}\n` : ""}\
📦 Pedidos: ${s.qtdPedidos}
🏍️ Custo Entregas: ${fmt(s.custoEntregas)}
💸 Saídas: ${fmt(s.totalSaidas)}
➕ Entradas: ${fmt(s.totalEntradas)}
═══════════════════════════
💵 RESULTADO: ${fmt(lucro)}
═══════════════════════════
✅ Dinheiro na gaveta: ${fmt(s.totalEfetivo)}
Sessão encerrada!`);

  // Limpa estado
  _sessaoCaixaAtiva = null;
  // Atualiza mini-painel do PDV
  if (typeof pdvCarregarPainelCaixa === "function") pdvCarregarPainelCaixa();
  ["card-faturamento","card-custo-moto","card-lucro","total-pix","total-transf",
   "total-cartao","total-efetivo","total-qrpy","total-cartaobr","total-multi-outros","card-ticket-medio"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = "Gs 0";
  });
  const qEl = document.getElementById("card-qtd-pedidos");
  if (qEl) qEl.innerText = "0";
  _caixaState = { faturamento:0, custoEntregas:0, totalSaidas:0, totalEntradas:0,
                  totalPix:0, totalTransf:0, totalCartao:0, totalEfetivo:0,
                  totalQrPy:0, totalCartaoBR:0, totalMultiOutros:0, qtdPedidos:0 };
}

// =========================================
// EXPORTAÇÕES: CSV (Power BI) e PDF
// =========================================

async function _buscarDadosRelatorio() {
  const elI = document.getElementById("fin-inicio");
  const elF = document.getElementById("fin-fim");
  const hoje = new Date().toISOString().split("T")[0];
  // UTC-3 PY (horario de verao permanente desde 2024)
  const _tz = 3 * 60 * 60 * 1000;
  const iniDate = elI?.value || hoje;
  const fimDate = elF?.value || hoje;
  const ini = new Date(iniDate + "T00:00:00-03:00").toISOString();
  const fim = new Date(fimDate + "T23:59:59-03:00").toISOString();
  const { data } = await supa
    .from("pedidos")
    .select("*")
    .in("status", ["entregue", "em_preparo", "pronto_entrega", "saiu_entrega"])
    .gte("created_at", ini)
    .lte("created_at", fim);
  return data || [];
}

// ── CSV rico para Power BI ────────────────────────────────
async function exportarCSVPowerBI() {
  const pedidos = await _buscarDadosRelatorio();
  if (!pedidos.length) {
    alert("Nenhum pedido no período.");
    return;
  }

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const cols = [
    "id",
    "uid_temporal",
    "status",
    "tipo_entrega",
    "created_at",
    "cliente_nome",
    "cliente_telefone",
    "endereco_entrega",
    "forma_pagamento",
    "obs_pagamento",
    "subtotal",
    "desconto_cupom",
    "frete_cobrado_cliente",
    "total_geral",
    "cupom_codigo",
    "frete_motoboy",
    "garcom_nome",
    "tempo_recebido",
    "tempo_confirmado",
    "tempo_preparo_iniciado",
    "tempo_pronto",
    "tempo_saiu_entrega",
    "tempo_entregue",
    "itens_qtd",
    "itens_nomes",
    "ruc_factura",
    "razao_factura",
  ];

  const rows = pedidos.map((p) => {
    const itens = Array.isArray(p.itens) ? p.itens : [];
    const itensQtd = itens.reduce((a, i) => a + (i.qtd || i.q || 1), 0);
    const itensNomes = itens
      .map((i) => `${i.qtd || i.q || 1}x ${i.nome || i.n}`)
      .join(" | ");
    const f = p.dados_factura || {};
    return [
      p.id,
      p.uid_temporal || "",
      p.status,
      p.tipo_entrega,
      p.created_at ? new Date(p.created_at).toLocaleString("pt-BR") : "",
      p.cliente_nome || "",
      p.cliente_telefone || "",
      p.endereco_entrega || "",
      p.forma_pagamento || "",
      p.obs_pagamento || "",
      p.subtotal || 0,
      p.desconto_cupom || 0,
      p.frete_cobrado_cliente || 0,
      p.total_geral || 0,
      p.cupom_codigo || "",
      p.frete_motoboy || 0,
      p.garcom_nome || "",
      p.tempo_recebido || "",
      p.tempo_confirmado || "",
      p.tempo_preparo_iniciado || "",
      p.tempo_pronto || "",
      p.tempo_saiu_entrega || "",
      p.tempo_entregue || "",
      itensQtd,
      itensNomes,
      f.ruc || f.ci || "",
      f.razao || "",
    ]
      .map(escape)
      .join(",");
  });

  const csv = "\uFEFF" + cols.join(",") + "\n" + rows.join("\n"); // BOM para Excel/PBI
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const hoje = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `relatorio_${hoje}_powerbi.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert(t("alert.csv_exportado") + ` (${pedidos.length} pedidos)`);
}

// ── PDF via janela de impressão ───────────────────────────
async function exportarPDF() {
  const pedidos = await _buscarDadosRelatorio();
  if (!pedidos.length) {
    alert("Nenhum pedido no período.");
    return;
  }

  const elI = document.getElementById("fin-inicio");
  const elF = document.getElementById("fin-fim");
  const hoje = new Date().toISOString().split("T")[0];
  const periodoLabel = `${elI?.value || hoje} a ${elF?.value || hoje}`;

  const fmt = (n) => "Gs " + (n || 0).toLocaleString("es-PY");
  const total = pedidos.reduce((a, p) => a + (p.total_geral || 0), 0);

  // Reutiliza a mesma lógica de classificação de calcularFinanceiro
  let totalPix = 0, totalEfet = 0, totalCard = 0, totalTransf = 0,
      totalQrPy = 0, totalCartaoBR = 0, totalMulti = 0;
  pedidos.forEach((p) => {
    const pag = (p.forma_pagamento || "").toLowerCase();
    const obsPag = p.obs_pagamento || "";
    const val = p.total_geral || 0;
    if (pag === "multipagamento" && obsPag) {
      try {
        const partes = JSON.parse(obsPag);
        if (Array.isArray(partes)) {
          partes.forEach((parte) => {
            const pf = (parte.forma || "").toLowerCase();
            const pv = Number(parte.valor) || 0;
            if (pf.includes("pix"))                                   totalPix      += pv;
            else if (pf.includes("transfer"))                         totalTransf   += pv;
            else if (pf.includes("qrpy") || pf.includes("qr"))       totalQrPy     += pv;
            else if (pf.includes("cartaobr") || pf.includes("br"))   totalCartaoBR += pv;
            else if (pf.includes("cartao") || pf.includes("cartão")) totalCard     += pv;
            else                                                       totalEfet     += pv;
          });
        } else { totalMulti += val; }
      } catch (_) { totalMulti += val; }
    } else if (pag.includes("pix"))                                   totalPix      += val;
    else if (pag.includes("transfer") || pag.includes("alias"))      totalTransf   += val;
    else if (pag === "qrpy")                                          totalQrPy     += val;
    else if (pag === "cartaobr")                                      totalCartaoBR += val;
    else if (pag.includes("cart"))                                    totalCard     += val;
    else if (pag.includes("efetivo") || pag.includes("dinheiro"))    totalEfet     += val;
    else                                                              totalMulti    += val;
  });

  const rows = pedidos
    .map((p) => {
      const tz = { timeZone: "America/Asuncion" };
      const hora = new Date(p.created_at).toLocaleString("pt-BR", tz);
      const itens = (Array.isArray(p.itens) ? p.itens : [])
        .map((i) => `${i.qtd || i.q || 1}x ${i.nome || i.n}`)
        .join(", ");
      return `<tr>
      <td>${p.uid_temporal || "#" + p.id}</td>
      <td>${hora}</td>
      <td>${p.cliente_nome || "-"}</td>
      <td>${itens || "-"}</td>
      <td>${p.forma_pagamento || "-"}</td>
      <td style="text-align:right">${fmt(p.total_geral)}</td>
    </tr>`;
    })
    .join("");

  const nomeRestaurante = NOME_RESTAURANTE || "Relatório";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Relatório ${periodoLabel}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:20px}
    h1{font-size:16px;margin-bottom:2px}
    .sub{font-size:11px;color:#666;margin-bottom:16px}
    .resumo{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
    .card{background:#f5f5f5;border-radius:6px;padding:10px 16px;min-width:130px}
    .card .lbl{font-size:10px;color:#888;margin-bottom:3px}
    .card .val{font-size:14px;font-weight:700}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#1a7a2e;color:#fff;padding:6px 8px;text-align:left}
    td{padding:5px 8px;border-bottom:1px solid #eee}
    tr:nth-child(even) td{background:#f9f9f9}
    td:last-child{text-align:right;font-weight:600}
    .footer{margin-top:16px;font-size:10px;color:#888;text-align:center}
    @media print{body{padding:6px}@page{margin:8mm}}
  </style>
  </head><body>
  <h1>${nomeRestaurante} — Relatório Financeiro</h1>
  <div class="sub">Período: ${periodoLabel} &nbsp;|&nbsp; Gerado em: ${new Date().toLocaleString("pt-BR")}</div>
  <div class="resumo">
    <div class="card"><div class="lbl">Total Faturado</div><div class="val">${fmt(total)}</div></div>
    <div class="card"><div class="lbl">Pedidos</div><div class="val">${pedidos.length}</div></div>
    <div class="card"><div class="lbl">Ticket Médio</div><div class="val">${fmt(pedidos.length ? Math.round(total / pedidos.length) : 0)}</div></div>
    <div class="card"><div class="lbl">Pix</div><div class="val">${fmt(totalPix)}</div></div>
    <div class="card"><div class="lbl">Dinheiro</div><div class="val">${fmt(totalEfet)}</div></div>
    <div class="card"><div class="lbl">Cartão PY</div><div class="val">${fmt(totalCard)}</div></div>
    <div class="card"><div class="lbl">Cartão BR</div><div class="val">${fmt(totalCartaoBR)}</div></div>
    <div class="card"><div class="lbl">Transferência</div><div class="val">${fmt(totalTransf)}</div></div>
    <div class="card"><div class="lbl">QR Paraguay</div><div class="val">${fmt(totalQrPy)}</div></div>
    ${totalMulti > 0 ? `<div class="card"><div class="lbl">Multi/Outros</div><div class="val">${fmt(totalMulti)}</div></div>` : ""}
  </div>
  <table>
    <thead><tr><th>#</th><th>Data/Hora</th><th>Cliente</th><th>Itens</th><th>Pagamento</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">${nomeRestaurante} &nbsp;·&nbsp; ${new Date().toLocaleDateString("pt-BR")} &nbsp;·&nbsp; ${pedidos.length} registros</div>
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`;

  const w = window.open("", "PDF", "width=900,height=700");
  w.document.write(html);
  w.document.close();
}

// =========================================
// 7. ZAP & ROTA
// =========================================
function enviarRotaZap() {
  const checks = document.querySelectorAll(".check-pedido:checked");
  const selMoto = document.getElementById("sel-motoboy");

  if (checks.length === 0 || !selMoto.value)
    return alert(t("alert.sel_pedidos_moto"));

  // Pega dados do motoboy selecionado
  const opt = selMoto.options[selMoto.selectedIndex];
  // Fallback: se não tiver dataset, tenta pegar do texto
  const nomeMoto = opt.dataset.nome || opt.text;
  const telMoto = opt.dataset.tel || ""; // Importante ter o telefone no value ou dataset

  let msg = `🛵 *ROTA - ${nomeMoto.toUpperCase()}*\n\n`;
  let coords = [];
  let taxaTotal = 0;

  checks.forEach((chk) => {
    try {
      // Agora 'p' tem o objeto COMPLETO do banco
      const p = JSON.parse(decodeURIComponent(chk.value));

      // Atualiza status no banco para "saiu_entrega" ou "entregue"
      supa
        .from("pedidos")
        .update({ status: "saiu_entrega", motoboy_id: selMoto.value })
        .eq("id", p.id)
        .then();

      msg += `📦 *PEDIDO #${p.uid_temporal || p.id}*\n`;
      msg += `👤 ${p.cliente_nome || "Cliente"} | 📞 ${p.cliente_telefone || ""}\n`;

      if (p.itens && Array.isArray(p.itens)) {
        // Separa bebidas (para levar imediatamente) do restante
        const _esBebida = (i) => {
          if (i.es_bebida) return true;
          const cat = (i.categoria_slug || i.cat || "").toLowerCase();
          const _SLUGS_BEBIDA = [
            "bebida",
            "bebidas",
            "drink",
            "drinks",
            "refrigerante",
            "refrigerantes",
            "gaseosa",
            "gaseosas",
            "suco",
            "sucos",
            "jugo",
            "jugos",
            "cerveja",
            "cervejas",
            "cerveza",
            "cervezas",
            "trago",
            "tragos",
            "licor",
            "licores",
            "agua",
            "aguas",
            "água",
            "águas",
            "vino",
            "vinos",
            "vinho",
            "vinhos",
          ];
          return _SLUGS_BEBIDA.some((s) => cat === s || cat.includes(s));
        };
        const bebidas = p.itens.filter(_esBebida);
        const naoFoodKds = p.itens.filter((i) => !_esBebida(i));

        // Helper: formata um item com variação + montagem
        const _fmtItem = (b) => {
          let txt = `${b.qtd || b.q || 1}x ${b.nome || b.n}`;
          const v = b.variacao || b.t || "";
          if (v) txt += ` (${v})`;
          const mont = b.montagem || b.m || [];
          if (Array.isArray(mont) && mont.length) {
            const itensStr = mont
              .map((x) => (typeof x === "object" ? x.nome || "" : x))
              .filter(Boolean)
              .join(", ");
            if (itensStr) txt += ` [${itensStr}]`;
          }
          if (b.obs || b.o) txt += ` ⚠ ${b.obs || b.o}`;
          return txt;
        };

        if (bebidas.length > 0) {
          const lista = bebidas.map(_fmtItem).join(", ");
          msg += `🥤 *LEVAR:* ${lista}\n`;
        }
        // Nota sobre outros itens (já ficam na cozinha, info útil para motoboy saber o que pegar)
        if (naoFoodKds.length > 0) {
          msg += `📦 *Itens:* ` + naoFoodKds.map(_fmtItem).join(" | ") + `\n`;
        }
      }

      // LÓGICA DE MAPA
      if (p.geo_lat && p.geo_lng) {
        const link = `https://www.google.com/maps/search/?api=1&query=${p.geo_lat},${p.geo_lng}`;
        msg += `📍 ${link}\n`;
        coords.push(`${p.geo_lat},${p.geo_lng}`);
      } else {
        msg += `🏠 ${p.endereco_entrega || "Retirada"}\n`;
      }

      // LÓGICA DE PAGAMENTO
      const forma = (p.forma_pagamento || "").toLowerCase();
      const totalGeral = p.total_geral || 0;
      const totalFmt = totalGeral.toLocaleString("es-PY");

      if (
        forma.includes("pix") ||
        forma.includes("transfer") ||
        forma.includes("alias")
      ) {
        msg += `✅ *PAGO (Pix/Transf)*\n`;
      } else if (
        forma.includes("cartao") ||
        forma.includes("credito") ||
        forma.includes("debito")
      ) {
        msg += `💳 *Cobrar Cartão: Gs ${totalFmt}*\n`;
      } else {
        msg += `💰 *COBRAR: Gs ${totalFmt}*\n`;

        const obsPag = p.obs_pagamento || "";
        const nums = obsPag.match(/\d+/g);
        if (nums) {
          let valorTroco = parseInt(nums.join(""));
          if (valorTroco < 1000) valorTroco *= 1000;
          if (valorTroco > totalGeral) {
            const devolver = valorTroco - totalGeral;
            msg += `🔄 Troco p/ ${valorTroco.toLocaleString()} (Levar Gs ${devolver.toLocaleString()})\n`;
          }
        }
        if (obsPag && !nums) msg += `⚠️ Obs: ${obsPag}\n`;
      }

      msg += `-----------------\n`;
      const _freteM = parseFloat(p.frete_motoboy);
      taxaTotal += isNaN(_freteM) ? TAXA_MOTOBOY || 0 : _freteM;
    } catch (e) {
      console.error("Erro ao processar pedido na rota:", e);
    }
  });

  // MAPA GERAL DA ROTA
  if (coords.length > 0) {
    // Usa coordenadas da loja se existirem, senão usa padrão
    const latLoja = typeof COORD_LOJA !== "undefined" ? COORD_LOJA.lat : "";
    const lngLoja = typeof COORD_LOJA !== "undefined" ? COORD_LOJA.lng : "";
    const rota = `https://www.google.com/maps/dir/${latLoja},${lngLoja}/${coords.join("/")}`;
    msg += `\n🗺️ *ROTA NO MAPA:*\n${rota}\n`;
  }

  msg += `\n🏍️ *Taxa Total: Gs ${taxaTotal.toLocaleString("es-PY")}*`;

  // Abre WhatsApp
  const foneDestino = telMoto || ""; // Se tiver numero no cadastro do motoboy
  window.open(
    `https://wa.me/${foneDestino}?text=${encodeURIComponent(msg)}`,
    "_blank",
  );

  // Recarrega a tela depois de um tempo para atualizar os status
  setTimeout(() => {
    if (typeof carregarPedidos === "function") carregarPedidos();
    if (typeof calcularFinanceiro === "function") calcularFinanceiro();
  }, 2000);
}

// =========================================
// 8. PRODUTOS E CRUD COMPLETO (RESTAURADO)
// =========================================
// Cache dos produtos para filtro local
let _todosProdutos = [];
let _produtosMap = {}; // mapa id→produto para onclick seguro sem JSON inline

// ════════════════════════════════════════════════════════════════
// EXPORT / IMPORT DE PRODUTOS
// ════════════════════════════════════════════════════════════════

/**
 * Exporta todos os produtos em JSON (backup completo) ou CSV (planilha).
 * @param {"json"|"csv"} formato
 */
async function exportarProdutos(formato = "json") {
  const btnEl = document.getElementById("btn-exportar-produtos");
  if (btnEl) { btnEl.disabled = true; btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...'; }

  try {
    const { data: prods, error } = await supa
      .from("produtos")
      .select("*")
      .order("nome");

    if (error) throw error;
    if (!prods?.length) { alert("Nenhum produto encontrado para exportar."); return; }

    const hoje = new Date();
    const stamp = `${hoje.getFullYear()}${String(hoje.getMonth()+1).padStart(2,"0")}${String(hoje.getDate()).padStart(2,"0")}`;

    if (formato === "json") {
      // JSON completo — preserva montagem_config, adicionais, tudo
      const payload = {
        exportado_em: hoje.toISOString(),
        total: prods.length,
        produtos: prods.map(({ id, created_at, updated_at, ...p }) => p), // remove PKs
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `produtos_backup_${stamp}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      alert(`✅ ${prods.length} produtos exportados em JSON.`);

    } else {
      // CSV simplificado — campos planos para editar em planilha
      const SEP = ";";
      const cols = [
        "nome","descricao","preco","categoria_slug","subcategoria_slug",
        "ativo","pausado","destaque","somente_balcao","es_bebida",
        "unidade_venda","promo_ativo","promo_tipo","promo_valor",
        "ordem","montagem_config","adicionais"
      ];
      const header = cols.join(SEP);
      const rows = prods.map(p =>
        cols.map(c => {
          let v = p[c];
          if (v === null || v === undefined) return "";
          if (typeof v === "object") v = JSON.stringify(v);
          v = String(v).replace(/"/g, '""');
          return v.includes(SEP) || v.includes('\n') || v.includes('"') ? `"${v}"` : v;
        }).join(SEP)
      );
      const csv = "\uFEFF" + header + "\n" + rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `produtos_${stamp}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      alert(`✅ ${prods.length} produtos exportados em CSV.\n\nDica: use o CSV para visualização/edição. Para restauração use o JSON.`);
    }
  } catch (e) {
    console.error("exportarProdutos:", e);
    alert("Erro ao exportar: " + (e.message || e));
  } finally {
    if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<i class="fas fa-file-export"></i> Exportar'; }
  }
}

/**
 * Abre seletor de arquivo JSON e importa produtos.
 * Modo: "inserir" (só novos) | "upsert" (atualiza pelo nome se já existir)
 */
function importarProdutos() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.style.display = "none";
  document.body.appendChild(input);

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    document.body.removeChild(input);
    if (!file) return;

    const btnEl = document.getElementById("btn-importar-produtos");
    if (btnEl) { btnEl.disabled = true; btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...'; }

    try {
      const texto = await file.text();
      let payload;
      try { payload = JSON.parse(texto); }
      catch { throw new Error("Arquivo inválido — não é um JSON válido."); }

      // Aceita tanto { produtos: [...] } quanto [...]
      const lista = Array.isArray(payload) ? payload : (payload.produtos || []);
      if (!lista.length) throw new Error("Nenhum produto encontrado no arquivo.");

      const confirmMsg =
        `📦 ${lista.length} produtos encontrados no arquivo.

` +
        `Escolha o modo de importação:
` +
        `• OK → Inserir apenas novos (não sobrescreve existentes)
` +
        `• Cancelar → Abortar importação`;

      if (!confirm(confirmMsg)) return;

      // Remove campos que não devem ser inseridos
      const CAMPOS_IGNORAR = ["id", "created_at", "updated_at"];
      const CAMPOS_VALIDOS = [
        "nome","descricao","preco","imagem_url","categoria_slug","subcategoria_slug",
        "ativo","pausado","somente_balcao","destaque","ordem","e_montavel","es_bebida",
        "unidade_venda","montagem_config","adicionais","inventario_id","estoque_qtd",
        "promo_ativo","promo_tipo","promo_valor"
      ];

      // Busca nomes existentes para evitar duplicatas
      const { data: existentes } = await supa.from("produtos").select("nome");
      const nomesExistentes = new Set((existentes || []).map(p => p.nome.toLowerCase().trim()));

      const paraInserir = lista
        .map(p => {
          const limpo = {};
          CAMPOS_VALIDOS.forEach(c => { if (p[c] !== undefined) limpo[c] = p[c]; });
          // Garante campos obrigatórios com fallback
          if (!limpo.nome) return null;
          limpo.preco = limpo.preco || 0;
          limpo.ativo = limpo.ativo !== false;
          return limpo;
        })
        .filter(p => p && !nomesExistentes.has(p.nome.toLowerCase().trim()));

      const ignorados = lista.length - paraInserir.length;

      if (!paraInserir.length) {
        alert(`⚠️ Todos os ${lista.length} produtos já existem (mesmo nome). Nada foi inserido.`);
        return;
      }

      // Insere em lotes de 50 para não estourar o payload do Supabase
      const LOTE = 50;
      let inseridos = 0;
      for (let i = 0; i < paraInserir.length; i += LOTE) {
        const lote = paraInserir.slice(i, i + LOTE);
        const { error } = await supa.from("produtos").insert(lote);
        if (error) throw error;
        inseridos += lote.length;
      }

      let msg = `✅ ${inseridos} produto(s) importado(s) com sucesso!`;
      if (ignorados > 0) msg += `
⏭️ ${ignorados} ignorado(s) por já existirem (mesmo nome).`;
      alert(msg);
      carregarProdutos();

    } catch (e) {
      console.error("importarProdutos:", e);
      alert("Erro na importação: " + (e.message || e));
    } finally {
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<i class="fas fa-file-import"></i> Importar'; }
    }
  });

  input.click();
}

async function carregarProdutos() {
  const { data } = await supa.from("produtos").select("*").order("nome");
  _todosProdutos = data || [];
  _produtosMap = {};
  _todosProdutos.forEach(p => { _produtosMap[p.id] = p; });
  renderizarCardsProdutos(_todosProdutos);
  // Só recarrega o select de categorias se o modal de produto estiver fechado
  const modalAberto =
    document.getElementById("modal-produto")?.style.display === "flex";
  if (!modalAberto) carregarSelectCategorias();
}

function filtrarProdutos(termo) {
  if (!termo.trim()) {
    renderizarCardsProdutos(_todosProdutos);
    return;
  }
  const t = termo.toLowerCase();
  const filtrados = _todosProdutos.filter(
    (p) =>
      p.nome.toLowerCase().includes(t) ||
      (p.categoria_slug || "").toLowerCase().includes(t),
  );
  renderizarCardsProdutos(filtrados);
}

function renderizarCardsProdutos(lista) {
  const grid = document.getElementById("lista-produtos-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!lista || lista.length === 0) {
    grid.innerHTML =
      '<p style="color:#bbb;font-size:0.9rem;padding:20px 0">Nenhum produto encontrado.</p>';
    return;
  }

  const _TIPO_ICONS = {
    padrao: "📦",
    bebida: "🥤",
    lanche: "🍔",
    pizza: "🍕",
    acai: "🍇",
    shake: "🥤",
    suco: "🍊",
    sorvete: "🍦",
    montavel: "🥗",
    almoco: "🍽️",
    combo: "⭐",
  };
  const _TIPO_NAMES = {
    padrao: "Simples",
    bebida: "Bebida",
    lanche: "Lanche",
    pizza: "Pizza",
    acai: "Açaí",
    shake: "Shake",
    suco: "Suco",
    sorvete: "Sorvete",
    montavel: "Montável",
    almoco: "Prato",
    combo: "Combo",
  };

  lista.forEach((p) => {
    const cfg = p.montagem_config;
    let tipoKey = "padrao";
    if (cfg && !Array.isArray(cfg) && cfg.__tipo) tipoKey = cfg.__tipo;
    else if (p.e_montavel || (cfg && Array.isArray(cfg) && cfg.length > 0))
      tipoKey = "montavel";

    const tipoIcon = _TIPO_ICONS[tipoKey] || "📦";
    const tipoName = _TIPO_NAMES[tipoKey] || tipoKey;
    const extrasQtd = cfg?.extras?.length || 0;

    const imgHtml = p.imagem_url
      ? `<img src="${p.imagem_url}" alt="${p.nome}" loading="lazy">`
      : `<div class="produto-card-img-placeholder">${tipoIcon}</div>`;

    const badgePausado = !p.ativo
      ? `<span class="badge-pausado">⏸ Pausado</span>`
      : "";
    const badgeBalcao = p.somente_balcao
      ? `<span class="badge-balcao">🏪 Balcão</span>`
      : "";
    const badgeExtras =
      extrasQtd > 0
        ? `<span title="${extrasQtd} adicionais" style="font-size:0.7rem;color:#3498db;font-weight:700">➕${extrasQtd}</span>`
        : "";

    // produto referenciado pelo id via _produtosMap (sem JSON inline no onclick)

    const card = document.createElement("div");
    card.className = `produto-card${!p.ativo ? " pausado" : ""}`;
    card.innerHTML = `
      <div class="produto-card-img-wrap">
        ${imgHtml}
        <div class="produto-card-badges">
          <span class="badge-tipo">${tipoIcon} ${tipoName}</span>
          ${badgePausado}
          ${badgeBalcao}
        </div>
      </div>
      <div class="produto-card-body">
        <div class="produto-card-nome">${p.nome} ${badgeExtras}</div>
        <div class="produto-card-meta">
          <span class="produto-card-cat">${p.categoria_slug || "—"}</span>
          <span class="produto-card-id">#${p.id}</span>
        </div>
        <div class="produto-card-preco">Gs ${(p.preco || 0).toLocaleString("es-PY")}</div>
      </div>
      <div class="produto-card-actions">
        <button class="btn btn-sm btn-primary" onclick="editarProdutoById(${p.id})">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn btn-sm btn-info" onclick="duplicarProduto(${p.id})" title="Duplicar produto">
          <i class="fas fa-copy"></i>
        </button>
        <button class="btn btn-sm ${p.ativo ? "btn-warning" : "btn-success"}"
          onclick="pausarProduto(${p.id}, ${p.ativo})"
          title="${p.ativo ? "Pausar produto" : "Reativar produto"}">
          <i class="fas fa-${p.ativo ? "pause" : "play"}"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deletarProduto(${p.id})" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function editarProdutoById(id) {
  const p = _produtosMap[id];
  if (p) editarProduto(p);
}

function editarProduto(p) {
  abrirModalProduto(p);
}

// (deletarProduto defined below alongside pausarProduto)

function previewUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("img-preview").src = e.target.result;
      document.getElementById("box-preview").style.display = "block";
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function salvarProduto() {
  const btn = event.target;
  btn.disabled = true;
  try {
    const id = document.getElementById("prod-id").value;
    const fileInput = document.getElementById("prod-img-file");
    let urlFinal = document.getElementById("prod-img").value;

    // ── Upload para o Cloudinary (substitui Supabase Storage) ──
    if (fileInput.files.length > 0) {
      btn.innerText = "Enviando imagem...";
      try {
        urlFinal = await uploadImageToCloudinary(fileInput.files[0]);
      } catch (uploadErr) {
        alert("❌ Falha no upload da imagem: " + uploadErr.message + "\nO produto não foi salvo.");
        return;
      }
    }

    btn.innerText = "Salvando...";

    const tipo = document.getElementById("prod-tipo-builder").value || "padrao";

    // Valida campos obrigatórios
    const _nomeVal = document.getElementById("prod-nome").value.trim();
    if (!_nomeVal) {
      alert("⚠️ O nome do produto é obrigatório.");
      return;
    }
    const _catVal = document.getElementById("prod-cat").value;
    if (!_catVal) {
      alert("⚠️ Selecione uma categoria para o produto.");
      return;
    }

    // Monta o config completo
    let configFinal = { __tipo: tipo };

    // ── MONTÁVEL GENÉRICO ─────────────────────────────────────────
    if (tipo === "montavel") {
      const etapas = [];
      document
        .querySelectorAll("#builder-montavel .etapa-item")
        .forEach((div) => {
          etapas.push({
            titulo: div.querySelector(".step-titulo").value,
            max: parseInt(div.querySelector(".step-max").value),
            itens: div
              .querySelector(".step-itens")
              .value.split(",")
              .map((s) => s.trim())
              .filter((s) => s),
          });
        });
      configFinal.etapas = etapas;
    }

    // ── SHAKE ─────────────────────────────────────────────────────
    if (tipo === "shake") {
      const tamanhos = [];
      document.querySelectorAll(".shake-tamanho-row").forEach((row) => {
        const nome = row.querySelector('[data-f="snome"]').value.trim();
        const ml = parseInt(row.querySelector('[data-f="sml"]').value) || 0;
        const preco =
          parseFloat(row.querySelector('[data-f="spreco"]').value) || 0;
        if (nome) tamanhos.push({ nome, ml, preco });
      });
      const sabores = [];
      document.querySelectorAll(".shake-sabor-row").forEach((row) => {
        const nome = row.querySelector('[data-f="snome"]').value.trim();
        const preco =
          parseFloat(row.querySelector('[data-f="spreco"]').value) || 0;
        const img = row.querySelector('[data-f="simg"]')?.value?.trim() || "";
        if (nome) sabores.push({ nome, preco, img });
      });
      configFinal.shake = { tamanhos, sabores };
      const precos = tamanhos.map((t) => t.preco).filter((p) => p > 0);
      if (precos.length > 0)
        document.getElementById("prod-preco").value = Math.min(...precos);
    }

    // ── PIZZA (NOVO: tipos dinâmicos) ─────────────────────────────
    if (tipo === "pizza") {
      // Tipos de pizza criados pelo usuário
      const tipos_pizza = [];
      document.querySelectorAll(".pizza-tipo-row").forEach((row) => {
        const nome = row.querySelector(".pizza-tipo-nome").value.trim();
        if (nome) tipos_pizza.push({ nome });
      });

      // Bordas (nome + preço único)
      const bordas = [];
      document.querySelectorAll(".pizza-borda-row").forEach((row) => {
        const nome = row.querySelector('[data-f="bnome"]').value.trim();
        const preco =
          parseFloat(row.querySelector('[data-f="bpreco"]')?.value) || 0;
        if (nome) bordas.push({ nome, preco });
      });

      // Tamanhos com preço dinâmico por tipo
      const tamanhos = [];
      document.querySelectorAll(".pizza-tamanho-row").forEach((row) => {
        const nome = row.querySelector('[data-f="nome"]').value.trim();
        if (!nome) return;
        const fatias =
          parseInt(row.querySelector('[data-f="fatias"]').value) || 0;
        const cm = parseInt(row.querySelector('[data-f="cm"]').value) || 0;
        const maxSab =
          parseInt(row.querySelector('[data-f="max_sabores"]').value) || 2;
        const precos = {};
        row.querySelectorAll('[data-f="preco_tipo"]').forEach((inp) => {
          if (inp.dataset.tipo)
            precos[inp.dataset.tipo] = parseFloat(inp.value) || 0;
        });
        const precoMin =
          Math.min(...Object.values(precos).filter((v) => v > 0)) || 0;
        tamanhos.push({
          nome,
          fatias,
          cm,
          max_sabores: maxSab,
          precos,
          preco: precoMin,
        });
      });

      // Sabores
      const sabores = [];
      document.querySelectorAll(".pizza-sabor-row").forEach((row) => {
        const nome = row.querySelector('[data-f="snome"]').value.trim();
        if (!nome) return;
        const toggleBtn = row.querySelector(".pizza-sabor-toggle-ativo");
        const ativo = !toggleBtn || toggleBtn.dataset.ativo !== "false";
        sabores.push({
          nome,
          desc:  row.querySelector('[data-f="sdesc"]')?.value?.trim() || "",
          tipo:  row.querySelector('[data-f="stipo"]').value,
          img:   row.querySelector('[data-f="simg"]')?.value || "",
          preco: 0,
          ativo,
        });
      });

      configFinal = {
        __tipo: "pizza",
        tipos_pizza,
        tamanhos,
        sabores,
        bordas,
        tem_borda: bordas.length > 0,
      };
      const todosPrecos = tamanhos
        .flatMap((t) => Object.values(t.precos))
        .filter((v) => v > 0);
      if (todosPrecos.length > 0)
        document.getElementById("prod-preco").value = Math.min(...todosPrecos);
    }

    // ── AÇAÍ ──────────────────────────────────────────────────────
    if (tipo === "acai") {
      const tamanhos = [];
      document.querySelectorAll(".acai-tamanho-row").forEach((row) => {
        const nome = row.querySelector('[data-f="nome"]').value.trim();
        const preco =
          parseFloat(row.querySelector('[data-f="preco"]').value) || 0;
        const img = row.querySelector('[data-f="img"]')?.value?.trim() || "";
        if (nome) tamanhos.push({ nome, preco, img });
      });
      const acompanhamentos = [];
      document.querySelectorAll(".acai-acomp-row").forEach((row) => {
        const nome = row.querySelector('[data-f="nome"]').value.trim();
        const preco =
          parseFloat(row.querySelector('[data-f="preco"]').value) || 0;
        const img = row.querySelector('[data-f="img"]')?.value?.trim() || "";
        if (nome) acompanhamentos.push({ nome, preco, img });
      });
      const etapas = [];
      document
        .querySelectorAll("#acai-etapas-container .etapa-item")
        .forEach((div) => {
          etapas.push({
            titulo: div.querySelector(".step-titulo").value,
            max: parseInt(div.querySelector(".step-max").value),
            itens: div
              .querySelector(".step-itens")
              .value.split(",")
              .map((s) => s.trim())
              .filter((s) => s),
          });
        });
      const variacoes = [];
      document
        .querySelectorAll("#acai-variacoes-lista .variacao-acai-row")
        .forEach((row) => {
          const nome = row.querySelector('[data-f="vnome"]').value.trim();
          const preco =
            parseFloat(row.querySelector('[data-f="vpreco"]').value) || 0;
          if (nome) variacoes.push({ nome, preco });
        });
      configFinal = {
        __tipo: "acai",
        tamanhos,
        acompanhamentos,
        etapas,
        variacoes,
      };
      const precoMin = tamanhos.map((t) => t.preco).filter((p) => p > 0);
      if (precoMin.length > 0)
        document.getElementById("prod-preco").value = Math.min(...precoMin);
    }

    // ── SUCO ──────────────────────────────────────────────────────
    if (tipo === "suco") {
      const tamanhos = [];
      document.querySelectorAll(".suco-tamanho-row").forEach((row) => {
        const nome = row.querySelector('[data-f="nome"]').value.trim();
        const preco =
          parseFloat(row.querySelector('[data-f="preco"]').value) || 0;
        if (nome) tamanhos.push({ nome, preco });
      });
      const etapas = [];
      document
        .querySelectorAll("#suco-etapas-container .etapa-item")
        .forEach((div) => {
          etapas.push({
            titulo: div.querySelector(".step-titulo").value,
            max: parseInt(div.querySelector(".step-max").value),
            itens: div
              .querySelector(".step-itens")
              .value.split(",")
              .map((s) => s.trim())
              .filter((s) => s),
          });
        });
      configFinal = { __tipo: "suco", tamanhos, etapas };
      const precoMin = tamanhos.map((t) => t.preco).filter((p) => p > 0);
      if (precoMin.length > 0)
        document.getElementById("prod-preco").value = Math.min(...precoMin);
    }

    // ── SORVETE ───────────────────────────────────────────────────
    if (tipo === "sorvete") {
      const tamanhos = [];
      document.querySelectorAll(".sorvete-tamanho-row").forEach((row) => {
        const nome = row.querySelector('[data-f="nome"]').value.trim();
        const qtd_bolas =
          parseInt(row.querySelector('[data-f="qtd_bolas"]')?.value) || null;
        const preco =
          parseFloat(row.querySelector('[data-f="preco"]').value) || 0;
        if (nome) tamanhos.push({ nome, qtd_bolas, preco });
      });
      const sabores = [];
      document.querySelectorAll(".sorvete-sabor-row").forEach((row) => {
        const nome = row.querySelector('[data-f="nome"]').value.trim();
        const img = row.querySelector('[data-f="img"]')?.value?.trim() || "";
        const preco =
          parseFloat(row.querySelector('[data-f="preco"]')?.value) || 0;
        if (nome) sabores.push({ nome, img, preco });
      });
      const etapas = [];
      document
        .querySelectorAll("#sorvete-etapas-container .etapa-item")
        .forEach((div) => {
          etapas.push({
            titulo: div.querySelector(".step-titulo").value,
            max: parseInt(div.querySelector(".step-max").value),
            itens: div
              .querySelector(".step-itens")
              .value.split(",")
              .map((s) => s.trim())
              .filter((s) => s),
          });
        });
      const variacoes = [];
      document
        .querySelectorAll("#sorvete-variacoes-lista .variacao-acai-row")
        .forEach((row) => {
          const nome = row.querySelector('[data-f="vnome"]').value.trim();
          const preco =
            parseFloat(row.querySelector('[data-f="vpreco"]').value) || 0;
          if (nome) variacoes.push({ nome, preco });
        });
      configFinal = { __tipo: "sorvete", tamanhos, sabores, etapas, variacoes };
      const precoMin = tamanhos.map((t) => t.preco).filter((p) => p > 0);
      if (precoMin.length > 0)
        document.getElementById("prod-preco").value = Math.min(...precoMin);
    }

    // ── COMBO ─────────────────────────────────────────────────────
    if (tipo === "combo") {
      const descricao_livre =
        document.getElementById("combo-descricao")?.value?.trim() || "";
      const itens_combo = [
        ...document.querySelectorAll(
          '#combo-produtos-selecionados input[type="checkbox"]:checked',
        ),
      ]
        .map((el) => parseInt(el.value))
        .filter(Boolean);
      configFinal = { __tipo: "combo", descricao_livre, itens_combo };
    }

    if (tipo === "combo_fechado") {
      const cfg = cfLerConfigBuilder();
      if (!cfg.limite_total || cfg.limite_total < 1) {
        alert("⚠️ Informe o limite total de itens do combo.");
        return;
      }
      if (cfg.sabores.length === 0) {
        alert("⚠️ Adicione ao menos 1 sabor ao Combo Fechado.");
        return;
      }
      configFinal = cfg;
    }

    // Extras por produto
    const temExtras = document.getElementById("prod-tem-extras").checked;
    if (temExtras) {
      const extras = [];
      document.querySelectorAll(".extra-row").forEach((row) => {
        const n = row.querySelector('[data-f="enome"]')?.value;
        const p =
          parseFloat(row.querySelector('[data-f="epreco"]')?.value) || 0;
        if (n) extras.push({ nome: n, preco: p });
      });
      configFinal.extras = extras;
    }

    // Opções de Preparo
    const temPreparo = document.getElementById("prod-tem-preparo")?.checked;
    if (temPreparo) {
      const preparoOpcoes = [];
      document.querySelectorAll(".preparo-opcao-input").forEach((inp) => {
        const v = inp.value.trim();
        if (v) preparoOpcoes.push(v);
      });
      if (preparoOpcoes.length > 0) configFinal.preparo_opcoes = preparoOpcoes;
    }

    // Variações de sabor (tipo variacoes puro)
    if (tipo === "variacoes") {
      const variacoes = [];
      document
        .querySelectorAll("#variacoes-lista .variacao-row")
        .forEach((row) => {
          const nome = row.querySelector('[data-f="vnome"]').value.trim();
          const preco =
            parseFloat(row.querySelector('[data-f="vpreco"]').value) || 0;
          const img = row.querySelector('[data-f="vimg"]').value.trim() || "";
          const ativoEl = row.querySelector('[data-f="vativo"]');
          const ativo = ativoEl ? ativoEl.checked : true;
          if (nome) variacoes.push({ nome, preco, img, ativo });
        });
      configFinal.variacoes = variacoes;
    }

    // Kg: apenas preco_kg, sem prod-preco
    if (tipo === "kg") {
      const precoKg =
        parseFloat(document.getElementById("prod-preco-kg")?.value) || 0;
      if (!precoKg) {
        alert("⚠️ Informe o preço por kg!");
        return;
      }
      configFinal = { __tipo: "kg", preco_kg: precoKg };
    }

    // Preço base calculado
    let precoBase =
      parseFloat(document.getElementById("prod-preco").value) || 0;
    if (
      tipo === "variacoes" &&
      configFinal.variacoes &&
      configFinal.variacoes.length > 0
    ) {
      const precos = configFinal.variacoes
        .map((v) => v.preco)
        .filter((p) => p > 0);
      if (precos.length > 0) precoBase = Math.min(...precos);
    }
    if (tipo === "kg")
      precoBase =
        parseFloat(document.getElementById("prod-preco-kg")?.value) || 0;

    // e_montavel: sinaliza que o produto tem etapas de montagem
    const tiposComMontagem = ["montavel", "acai", "suco", "sorvete"];
    const isM = tiposComMontagem.includes(tipo) || tipo === "shake";

    const temEstoque =
      document.getElementById("prod-tem-estoque")?.checked || false;
    const inventarioId = temEstoque
      ? parseInt(document.getElementById("prod-inventario-id")?.value) || null
      : null;
    const dados = {
      nome: document.getElementById("prod-nome").value,
      descricao: document.getElementById("prod-desc").value,
      preco: precoBase,
      categoria_slug: document.getElementById("prod-cat").value || null,
      subcategoria_slug: document.getElementById("prod-subcat")?.value || null,
      imagem_url: urlFinal,
      e_montavel: isM,
      montagem_config: configFinal,
      ativo: true,
      somente_balcao:
        document.getElementById("prod-somente-balcao")?.checked || false,
      es_bebida: document.getElementById("prod-es-bebida")?.checked || false,
      inventario_id: inventarioId,
    };

    if (id) await supa.from("produtos").update(dados).eq("id", id);
    else await supa.from("produtos").insert([dados]);

    fecharModal("modal-produto");
    carregarProdutos();
  } catch (e) {
    alert("Erro: " + e.message);
  } finally {
    btn.innerText = "Salvar";
    btn.disabled = false;
  }
}

// ── Seletor visual de tipo de produto filtrado pelas features do AM ──
function _renderSeletorTipoProduto(tipoAtual) {
  const container = document.getElementById("prod-tipo-selector");
  if (!container) return;

  const TODOS_TIPOS = [
    ["padrao",     "📦 Simples"],
    ["bebida",     "🥤 Bebida"],
    ["lanche",     "🍔 Lanche"],
    ["pizza",      "🍕 Pizza"],
    ["acai",       "🍇 Açaí"],
    ["shake",      "🥤 Shake"],
    ["suco",       "🍊 Suco"],
    ["sorvete",    "🍦 Sorvete"],
    ["montavel",   "🥗 Montável"],
    ["combo",      "⭐ Combo"],
    ["variacoes",  "🎨 Multi-variação"],
    ["kg",         "⚖️ Kg"],
    ["suplemento", "💪 Suplemento"],
    ["combo_fechado", "📦 Combo Fechado"],
  ];

  const cfg = FEATURES_ATIVAS?.tipos_produto;
  // Filtra bloqueados (sem config = tudo liberado)
  let permitidos = TODOS_TIPOS.filter(([k]) => !cfg || cfg[k] !== false);

  // Garante que o tipo atual (produto em edição) apareça mesmo se bloqueado
  const tipoEfetivo = tipoAtual || "padrao";
  if (!permitidos.some(([k]) => k === tipoEfetivo)) {
    const label = Object.fromEntries(TODOS_TIPOS)[tipoEfetivo] || tipoEfetivo;
    permitidos.unshift([tipoEfetivo, label + " ⚠️"]);
  }

  container.innerHTML = `
    <div style="margin-bottom:12px">
      <label style="font-size:0.8rem;font-weight:700;color:#666;display:block;margin-bottom:8px">
        🏷️ Tipo de Produto
      </label>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${permitidos.map(([k, l]) => `
          <button type="button"
            class="builder-type-btn${k === tipoEfetivo ? " active" : ""}"
            data-tipo="${k}"
            onclick="selecionarTipoBuilder('${k}')"
            style="padding:6px 13px;border-radius:20px;font-size:0.82rem;cursor:pointer;
              border:1.5px solid ${k === tipoEfetivo ? "#e74c3c" : "#ddd"};
              background:${k === tipoEfetivo ? "#fff5f5" : "#fafafa"};
              color:${k === tipoEfetivo ? "#c0392b" : "#555"};
              font-weight:${k === tipoEfetivo ? "700" : "400"};transition:all .15s">
            ${l}
          </button>`).join("")}
      </div>
    </div>`;
}

async function abrirModalProduto(produto = null, tipoInicial = null) {
  const modal = document.getElementById("modal-produto");

  // Reset completo
  document.getElementById("builder-steps").innerHTML = "";
  document.getElementById("prod-id").value = "";
  document.getElementById("prod-nome").value = "";
  document.getElementById("prod-desc").value = "";
  document.getElementById("prod-preco").value = "";
  document.getElementById("prod-img").value = "";
  document.getElementById("box-preview").style.display = "none";
  document.getElementById("prod-somente-balcao").checked = false;
  const _esBebidaEl = document.getElementById("prod-es-bebida");
  if (_esBebidaEl) _esBebidaEl.checked = false;
  document.getElementById("prod-tem-extras").checked = false;
  const _pkgEl = document.getElementById("prod-preco-kg");
  if (_pkgEl) _pkgEl.value = "";
  document.getElementById("extras-area").style.display = "none";
  const _te = document.getElementById("prod-tem-estoque");
  const _ea = document.getElementById("estoque-area");
  if (_te) _te.checked = false;
  if (_ea) _ea.style.display = "none";
  document.getElementById("extras-lista").innerHTML = "";
  document.getElementById("shake-tamanhos-lista") &&
    (document.getElementById("shake-tamanhos-lista").innerHTML = "");
  document.getElementById("shake-sabores-lista") &&
    (document.getElementById("shake-sabores-lista").innerHTML = "");
  document.getElementById("pizza-tamanhos-lista").innerHTML = "";
  document.getElementById("pizza-bordas-lista").innerHTML = "";
  document.getElementById("pizza-tipos-lista") &&
    (document.getElementById("pizza-tipos-lista").innerHTML = "");
  document.getElementById("pizza-borda-preco-box").style.display = "none";
  document.getElementById("pizza-tem-borda").checked = false;
  document.getElementById("pizza-sabores-lista").innerHTML =
    '<p style="color:#aaa;font-size:0.82rem;text-align:center;margin:10px 0">Clique em "+ Sabor" para adicionar</p>';
  // Reset açaí
  const _acaiT = document.getElementById("acai-tamanhos-lista");
  if (_acaiT) _acaiT.innerHTML = "";
  const _acaiA = document.getElementById("acai-acomp-lista");
  if (_acaiA) _acaiA.innerHTML = "";
  const _acaiE = document.getElementById("acai-etapas-container");
  if (_acaiE) _acaiE.innerHTML = "";
  const _acaiV = document.getElementById("acai-variacoes-lista");
  if (_acaiV) _acaiV.innerHTML = "";
  // Reset suco
  const _sucoT = document.getElementById("suco-tamanhos-lista");
  if (_sucoT) _sucoT.innerHTML = "";
  const _sucoE = document.getElementById("suco-etapas-container");
  if (_sucoE) _sucoE.innerHTML = "";
  // Reset sorvete
  const _sorvT = document.getElementById("sorvete-tamanhos-lista");
  if (_sorvT) _sorvT.innerHTML = "";
  const _sorvS = document.getElementById("sorvete-sabores-lista");
  if (_sorvS) _sorvS.innerHTML = "";
  const _sorvE = document.getElementById("sorvete-etapas-container");
  if (_sorvE) _sorvE.innerHTML = "";
  const _sorvV = document.getElementById("sorvete-variacoes-lista");
  if (_sorvV) _sorvV.innerHTML = "";
  // Reset combo
  const _combDesc = document.getElementById("combo-descricao");
  if (_combDesc) _combDesc.value = "";
  window._comboItensPresel = [];
  const variacoesLista = document.getElementById("variacoes-lista");
  if (variacoesLista) variacoesLista.innerHTML = "";
  // CORREÇÃO: Limpa o file input para não reutilizar imagem anterior
  const fileInputReset = document.getElementById("prod-img-file");
  if (fileInputReset) fileInputReset.value = "";
  const cfLista = document.getElementById("cf-sabores-lista");
  if (cfLista) cfLista.innerHTML = "";
  const cfLimite = document.getElementById("cf-limite");
  if (cfLimite) cfLimite.value = "";

  let tipo = "padrao";

  if (produto) {
    document.getElementById("prod-id").value = produto.id;
    document.getElementById("prod-nome").value = produto.nome;
    document.getElementById("prod-desc").value = produto.descricao || "";
    document.getElementById("prod-preco").value = produto.preco;
    document.getElementById("prod-img").value = produto.imagem_url || "";
    document.getElementById("prod-somente-balcao").checked =
      produto.somente_balcao || false;
    const _esBebidaLoad = document.getElementById("prod-es-bebida");
    if (_esBebidaLoad) _esBebidaLoad.checked = produto.es_bebida || false;
    if (produto.inventario_id) {
      const _te = document.getElementById("prod-tem-estoque");
      const _ea = document.getElementById("estoque-area");
      if (_te) _te.checked = true;
      if (_ea) _ea.style.display = "block";
      _carregarSelectInventario(produto.inventario_id);
    }
    if (produto.imagem_url) {
      document.getElementById("img-preview").src = produto.imagem_url;
      document.getElementById("box-preview").style.display = "block";
    }

    const cfg = produto.montagem_config;

    // Detecta tipo
    if (cfg && !Array.isArray(cfg) && cfg.__tipo) {
      tipo = cfg.__tipo;

      if (tipo === "montavel" && cfg.etapas) {
        cfg.etapas.forEach((e) => addBuilderStep(e.titulo, e.max, e.itens));
      }
      // ── PIZZA: novo formato (tipos_pizza dinâmico) ──
      if (tipo === "pizza") {
        const pizzaCfg = cfg.pizza || cfg; // suporta formato antigo (cfg.pizza) e novo (cfg direto)
        // Tipos
        const tiposPizza =
          cfg.tipos_pizza ||
          (cfg.pizza?.tipos || []).map((n) => ({ nome: n })) ||
          [];
        document.getElementById("pizza-tipos-lista").innerHTML = "";
        tiposPizza.forEach((t) => addPizzaTipo(t.nome));
        if (tiposPizza.length === 0) {
          // retrocompat: sem tipos definidos → cria Tradicional
          addPizzaTipo("Tradicional");
        }
        // Bordas (novo: nome+preco; antigo: nome+tipo)
        const bordas = (pizzaCfg.bordas || []).map((b) => ({
          nome: b.nome,
          preco: b.preco ?? pizzaCfg.borda_preco ?? 0,
        }));
        document.getElementById("pizza-tem-borda").checked = bordas.length > 0;
        document.getElementById("pizza-bordas-lista").innerHTML = "";
        toggleBordaPreco();
        bordas.forEach((b) => addPizzaBorda(b));
        // Tamanhos
        (pizzaCfg.tamanhos || []).forEach((t) => addPizzaTamanho(t));
        // Sabores
        if (pizzaCfg.sabores && pizzaCfg.sabores.length > 0) {
          document.getElementById("pizza-sabores-lista").innerHTML = "";
          pizzaCfg.sabores.forEach((s) => addPizzaSabor(s));
          // Drag já é vinculado dentro de addPizzaSabor
        }
      }
      // ── SHAKE ──
      if (tipo === "shake" && cfg.shake) {
        _popularShakeBuilder(cfg.shake);
      }
      // ── AÇAÍ ──
      if (tipo === "acai") {
        document.getElementById("acai-tamanhos-lista").innerHTML = "";
        document.getElementById("acai-acomp-lista").innerHTML = "";
        document.getElementById("acai-etapas-container").innerHTML = "";
        document.getElementById("acai-variacoes-lista").innerHTML = "";
        (cfg.tamanhos || []).forEach((t) => addAcaiTamanho(t));
        (cfg.acompanhamentos || []).forEach((a) => addAcaiAcompanhamento(a));
        (cfg.etapas || []).forEach((e) =>
          addAcaiEtapa(e.titulo, e.max, e.itens),
        );
        (cfg.variacoes || []).forEach((v) =>
          addVariacaoSimples(v, "acai-variacoes-lista"),
        );
      }
      // ── SUCO ──
      if (tipo === "suco") {
        document.getElementById("suco-tamanhos-lista").innerHTML = "";
        document.getElementById("suco-etapas-container").innerHTML = "";
        (cfg.tamanhos || []).forEach((t) => addSucoTamanho(t));
        (cfg.etapas || []).forEach((e) => {
          addSucoEtapa(e.titulo, e.max, e.itens);
        });
      }
      // ── SORVETE ──
      if (tipo === "sorvete") {
        document.getElementById("sorvete-tamanhos-lista").innerHTML = "";
        document.getElementById("sorvete-sabores-lista").innerHTML = "";
        document.getElementById("sorvete-etapas-container").innerHTML = "";
        document.getElementById("sorvete-variacoes-lista").innerHTML = "";
        (cfg.tamanhos || []).forEach((t) => addSorveteTamanho(t));
        (cfg.sabores || []).forEach((s) => addSorveteSabor(s));
        (cfg.etapas || []).forEach((e) =>
          addSorveteEtapa(e.titulo, e.max, e.itens),
        );
        (cfg.variacoes || []).forEach((v) =>
          addVariacaoSimples(v, "sorvete-variacoes-lista"),
        );
      }
      // ── COMBO ──
      if (tipo === "combo") {
        const comboDesc = document.getElementById("combo-descricao");
        if (comboDesc) comboDesc.value = cfg.descricao_livre || "";
        // os checkboxes de produtos são carregados async pelo _carregarComboSelect
        window._comboItensPresel = cfg.itens_combo || [];
      }
      if (tipo === "combo_fechado") {
        cfCarregarNoBuilder(cfg);
      }
      // Variações de sabor
      if (tipo === "variacoes" && cfg.variacoes) {
        document.getElementById("variacoes-lista").innerHTML = "";
        cfg.variacoes.forEach((v) => addVariacao(v));
      }
      // Venda por Kg
      if (tipo === "kg" && cfg.preco_kg) {
        const pkgEl = document.getElementById("prod-preco-kg");
        if (pkgEl) pkgEl.value = cfg.preco_kg;
      }
      // Extras
      if (cfg.extras && cfg.extras.length > 0) {
        document.getElementById("prod-tem-extras").checked = true;
        document.getElementById("extras-area").style.display = "block";
        cfg.extras.forEach((ex) => addExtra(ex));
      }
      // Opções de Preparo
      const prepEl = document.getElementById("prod-tem-preparo");
      const preparoArea = document.getElementById("preparo-area");
      const preparoLista = document.getElementById("preparo-lista");
      if (prepEl && cfg.preparo_opcoes && cfg.preparo_opcoes.length > 0) {
        prepEl.checked = true;
        if (preparoArea) preparoArea.style.display = "block";
        if (preparoLista) preparoLista.innerHTML = "";
        cfg.preparo_opcoes.forEach((op) => addOpcaoPreparo(op));
      }
    } else if (cfg && Array.isArray(cfg)) {
      // Compatibilidade: array antigo = montavel
      tipo = "montavel";
      cfg.forEach((e) => addBuilderStep(e.titulo, e.max, e.itens));
    } else if (produto.e_montavel) {
      tipo = "montavel";
    }
  }

  // Aplica tipo inicial (vindo do seletor externo ao modal)
  if (!produto && tipoInicial) {
    tipo = tipoInicial;
  }

  // Mostra botão "Alterar tipo" apenas ao editar produto existente
  const btnAlterar = document.getElementById("btn-alterar-tipo");
  if (btnAlterar) btnAlterar.style.display = produto ? "inline-flex" : "none";
  // Fecha o grid de tipos se estava aberto
  const gridWrapper = document.getElementById("builder-type-grid-wrapper");
  if (gridWrapper) gridWrapper.style.display = "none";

  selecionarTipoBuilder(tipo);

  // CORREÇÃO: Carrega categorias com a categoria atual do produto já selecionada
  const catAtual = produto ? produto.categoria_slug || "" : "";
  const subcatAtual = produto ? produto.subcategoria_slug || "" : "";
  await carregarSelectCategorias(catAtual);
  await carregarSelectSubcategorias(catAtual, subcatAtual);

  modal.style.display = "flex";

  // Seletor de tipo respeitando features do adminMaster
  const _tipoParaSeletor = produto?.montagem_config?.__tipo || tipoInicial || null;
  _renderSeletorTipoProduto(_tipoParaSeletor);
  if (_tipoParaSeletor) selecionarTipoBuilder(_tipoParaSeletor);
}

// Mapa: tipo semântico → qual builder exibir
const BUILDER_MAP = {
  padrao: "",
  bebida: "",
  lanche: "",
  combo: "builder-combo",
  sorvete: "builder-sorvete",
  pizza: "builder-pizza",
  montavel: "builder-montavel",
  acai: "builder-acai",
  shake: "builder-shake",
  suco: "builder-suco",
  variacoes: "builder-variacoes",
  kg: "builder-kg",
  combo_fechado: "builder-combo-fechado",
};
const BUILDER_HINTS = {
  shake: "🥤 Defina tamanhos (P/M/G) e sabores disponíveis.",
};

const _TIPO_BADGE_LABELS = {
  padrao: "📦 Simples",
  bebida: "🥤 Bebida",
  lanche: "🍔 Lanche",
  pizza: "🍕 Pizza",
  acai: "🍇 Açaí",
  shake: "🥤 Shake",
  suco: "🍊 Suco",
  sorvete: "🍦 Sorvete",
  montavel: "🥗 Montável",
  almoco: "🍽️ Prato",
  combo: "⭐ Combo",
  variacoes: "🎨 Variações",
  kg: "⚖️ Venda por Kg",
  combo_fechado: "📦 Combo Fechado",
};

function selecionarTipoBuilder(tipo) {
  document.getElementById("prod-tipo-builder").value = tipo;

  document.querySelectorAll(".builder-type-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tipo === tipo);
  });

  document
    .querySelectorAll(".builder-section")
    .forEach((s) => (s.style.display = "none"));

  const builderId = BUILDER_MAP[tipo];
  if (builderId) {
    const el = document.getElementById(builderId);
    if (el) el.style.display = "block";
  }

  // Para kg: o preço é definido no builder (prod-preco-kg), oculta o campo principal
  const precoBox = document.getElementById("box-prod-preco");
  if (precoBox) precoBox.style.display = tipo === "kg" ? "none" : "";

  // Atualiza badge de tipo no modal
  const badge = document.getElementById("modal-tipo-badge");
  if (badge) badge.textContent = _TIPO_BADGE_LABELS[tipo] || tipo;

  const hintEl = document.getElementById("builder-tipo-hint");
  if (hintEl) {
    const msg = BUILDER_HINTS[tipo] || "";
    hintEl.textContent = msg;
    hintEl.style.display = msg ? "block" : "none";
    if (msg) {
      hintEl.style.cssText =
        "background:#fff8e1;border-left:4px solid #f59e0b;border-radius:6px;padding:10px 14px;font-size:0.82rem;color:#78350f;margin-top:8px;";
    }
  }

  const lancheHint = document.getElementById("builder-lanche-hint");
  if (lancheHint) {
    lancheHint.style.display =
      tipo === "lanche" || tipo === "combo" ? "block" : "none";
  }

  // Para açaí/suco/sorvete: carrega lista de produtos no combo se necessário
  if (tipo === "combo") _carregarComboSelect();
}

// Abre modal com tipo pré-selecionado (vindo do seletor externo)
function criarNovoProduto(tipo) {
  // Esconde o seletor de tipos
  const panel = document.getElementById("novo-produto-tipos");
  if (panel) panel.style.display = "none";
  // O botão "alterar tipo" só é visível ao editar
  const btnAlterar = document.getElementById("btn-alterar-tipo");
  if (btnAlterar) btnAlterar.style.display = "none";
  abrirModalProduto(null, tipo);
}

// Toggle do painel de seleção de tipo (botão "+ Novo Produto")
function toggleNovosProdutosTipos() {
  const panel = document.getElementById("novo-produto-tipos");
  if (!panel) return;
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

// Toggle do grid de tipos DENTRO do modal (ao editar)
function toggleAlterarTipo() {
  const wrapper = document.getElementById("builder-type-grid-wrapper");
  if (!wrapper) return;
  wrapper.style.display = wrapper.style.display === "none" ? "block" : "none";
}

// Compatibilidade retroativa
function toggleBuilder() {
  const isM = document.getElementById("prod-montavel")?.checked;
  if (isM) selecionarTipoBuilder("montavel");
}

function addBuilderStep(t = "", m = 1, i = []) {
  const div = document.createElement("div");
  div.className = "etapa-item";
  div.innerHTML = `<div class="etapa-header"><input type="text" class="form-control step-titulo" value="${t}" placeholder="Título da etapa (ex: Escolha a base)"><input type="number" class="form-control step-max" value="${m}" style="width:70px" title="Máx. seleções"><button class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">X</button></div><textarea class="etapa-ingredientes step-itens" placeholder="Itens separados por vírgula. Ex: Arroz, Atum, Salmão, Tofu">${Array.isArray(i) ? i.join(", ") : i}</textarea>`;
  document.getElementById("builder-steps").appendChild(div);
}

// ─── VARIAÇÕES DE SABOR BUILDER ───────────────────────────────────
function addVariacao(dados = {}) {
  const lista = document.getElementById("variacoes-lista");
  const row = document.createElement("div");
  row.className = "variacao-row";
  const pausado = dados.ativo === false;
  row.style.cssText = `background:${pausado ? "#fff5f5" : "#fff"};border:1px solid ${pausado ? "#fca5a5" : "#e9d5ff"};border-radius:10px;padding:12px;display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;opacity:${pausado ? "0.7" : "1"}`;
  row.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px">
      <input data-f="vnome" class="form-control" value="${dados.nome || ""}" placeholder="Nome da variação (ex: Ex: Variação Premium)" style="font-weight:600">
      <div style="display:flex;gap:8px;align-items:center">
        <span style="font-size:0.8rem;color:#777;white-space:nowrap">Gs</span>
        <input data-f="vpreco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="Preço" style="max-width:140px">
      </div>
      <input data-f="vimg" class="form-control" value="${dados.img || ""}" placeholder="URL da foto (opcional — usa foto do produto por padrão)" style="font-size:0.8rem;color:#888">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.82rem;color:${pausado ? "#c0392b" : "#16a34a"}">
        <input data-f="vativo" type="checkbox" ${!pausado ? "checked" : ""} onchange="this.closest('.variacao-row').style.background=this.checked?'#fff':'#fff5f5';this.closest('.variacao-row').style.opacity=this.checked?'1':'0.7';this.closest('.variacao-row').style.borderColor=this.checked?'#e9d5ff':'#fca5a5';this.parentElement.style.color=this.checked?'#16a34a':'#c0392b';this.parentElement.lastChild.textContent=this.checked?' Disponível':' Pausado'">
        <span>${pausado ? " Pausado" : " Disponível"}</span>
      </label>
    </div>
    <div style="width:60px;height:60px;border-radius:8px;overflow:hidden;background:#f3f4f6;flex-shrink:0">
      ${dados.img ? `<img src="${dados.img}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:1.5rem">🖼</div>'}
    </div>
    <button class="btn btn-sm btn-danger" onclick="this.closest('.variacao-row').remove()" title="Remover" style="align-self:start">✕</button>
  `;
  lista.appendChild(row);
}

// ─── PIZZA BUILDER (tipos dinâmicos) ───────────────────────────

function toggleBordaPreco() {
  const tem = document.getElementById("pizza-tem-borda").checked;
  document.getElementById("pizza-borda-preco-box").style.display = tem
    ? "block"
    : "none";
}

// Adiciona um tipo de pizza (ex: Tradicional, Especial, Vegana...)
function addPizzaTipo(nome = "") {
  const lista = document.getElementById("pizza-tipos-lista");
  if (!lista) return;
  const row = document.createElement("div");
  row.className = "pizza-tipo-row";
  row.style.cssText =
    "display:flex;gap:8px;align-items:center;margin-bottom:6px";
  row.innerHTML = `
    <input class="form-control pizza-tipo-nome" value="${nome}" placeholder="Ex: Tradicional, Especial, Vegana"
      oninput="_pizzaRefreshTamanhoPrecos()" style="flex:1">
    <button class="btn btn-sm btn-danger" onclick="this.closest('.pizza-tipo-row').remove();_pizzaRefreshTamanhoPrecos()">✕</button>
  `;
  lista.appendChild(row);
  _pizzaRefreshTamanhoPrecos();
}

// Lê os tipos atuais da lista
function _pizzaTiposAtuais() {
  return [...document.querySelectorAll(".pizza-tipo-nome")]
    .map((i) => i.value.trim())
    .filter(Boolean);
}

// Reconstrói as colunas de preço em todos os tamanhos quando tipos mudam
function _pizzaRefreshTamanhoPrecos() {
  const tipos = _pizzaTiposAtuais();
  document.querySelectorAll(".pizza-tamanho-row").forEach((row) => {
    const box = row.querySelector(".pizza-tamanho-precos-dinamico");
    if (!box) return;
    // Preserva valores existentes
    const valoresExistentes = {};
    box.querySelectorAll('[data-f="preco_tipo"]').forEach((inp) => {
      if (inp.dataset.tipo) valoresExistentes[inp.dataset.tipo] = inp.value;
    });
    box.innerHTML = tipos
      .map(
        (t) => `
      <div>
        <label style="font-size:0.72rem;color:#555">💰 ${t} (Gs)</label>
        <input data-f="preco_tipo" data-tipo="${t}" type="number" class="form-control"
          value="${valoresExistentes[t] || ""}" placeholder="0" min="0" step="500">
      </div>`,
      )
      .join("");
  });
  // Atualiza select de tipo nos sabores
  document.querySelectorAll(".pizza-sabor-tipo").forEach((sel) => {
    const val = sel.value;
    sel.innerHTML =
      tipos
        .map(
          (t) =>
            `<option value="${t}" ${t === val ? "selected" : ""}>${t}</option>`,
        )
        .join("") || '<option value="">— Tipo —</option>';
  });
}

function addPizzaBorda(dados = {}) {
  const lista = document.getElementById("pizza-bordas-lista");
  const row = document.createElement("div");
  row.className = "pizza-borda-row";
  row.style.cssText =
    "display:flex;gap:8px;align-items:center;background:#fff;border:1px solid #eee;border-radius:8px;padding:8px 10px;margin-bottom:6px";
  row.innerHTML = `
    <div style="flex:3">
      <label style="font-size:0.72rem;color:#888">Nome da borda</label>
      <input data-f="bnome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: Cheddar, Catupiry, Chocolate">
    </div>
    <div style="flex:2">
      <label style="font-size:0.72rem;color:#888">Preço (Gs)</label>
      <input data-f="bpreco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="0" min="0" step="500">
    </div>
    <button class="btn btn-sm btn-danger" onclick="this.closest('.pizza-borda-row').remove()" style="align-self:flex-end;margin-bottom:2px">✕</button>
  `;
  lista.appendChild(row);
}

function addPizzaTamanho(dados = {}) {
  const lista = document.getElementById("pizza-tamanhos-lista");
  const row = document.createElement("div");
  row.className = "pizza-tamanho-row";
  const tipos = _pizzaTiposAtuais();

  // Preços existentes: novo formato (precos obj) ou antigo (preco_tradicional etc.)
  const precosExist = dados.precos || {
    Tradicional: dados.preco_tradicional || dados.preco || "",
    Especial: dados.preco_especial || "",
    Doce: dados.preco_doce || "",
  };

  row.innerHTML = `
    <div class="pizza-tamanho-header" style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:8px">
      <div style="flex:2;min-width:80px"><label style="font-size:0.72rem;color:#555">Nome</label><input data-f="nome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: P, M, G, GG"></div>
      <div style="flex:1;min-width:60px"><label style="font-size:0.72rem;color:#555">Fatias</label><input data-f="fatias" type="number" class="form-control" value="${dados.fatias || ""}" placeholder="8"></div>
      <div style="flex:1;min-width:60px"><label style="font-size:0.72rem;color:#555">Cm</label><input data-f="cm" type="number" class="form-control" value="${dados.cm || ""}" placeholder="35"></div>
      <div style="flex:1;min-width:70px"><label style="font-size:0.72rem;color:#555">Máx. sabores</label><input data-f="max_sabores" type="number" min="1" max="8" class="form-control" value="${dados.max_sabores || 2}"></div>
      <button class="btn btn-sm btn-danger" onclick="this.closest('.pizza-tamanho-row').remove()" style="margin-bottom:2px">✕</button>
    </div>
    <div class="pizza-tamanho-precos-dinamico" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">
      ${tipos
        .map(
          (t) => `
        <div>
          <label style="font-size:0.72rem;color:#555">💰 ${t} (Gs)</label>
          <input data-f="preco_tipo" data-tipo="${t}" type="number" class="form-control"
            value="${precosExist[t] || ""}" placeholder="0" min="0" step="500">
        </div>`,
        )
        .join("")}
    </div>
  `;
  lista.appendChild(row);
}

function addPizzaSabor(dados = {}) {
  const lista = document.getElementById("pizza-sabores-lista");
  const ph = lista.querySelector("p");
  if (ph) ph.remove();
  const tipos = _pizzaTiposAtuais();
  const row = document.createElement("div");
  row.className = "pizza-sabor-row";
  row.draggable = true;
  const imgSrc   = dados.img || "";
  const isAtivo  = dados.ativo !== false; // default true
  row.innerHTML = `
    <div class="pizza-sabor-main" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
      <span class="drag-handle" title="Arrastar para reordenar"
        style="cursor:grab;font-size:1.1rem;color:#aaa;padding:0 4px;user-select:none">⠿</span>
      <input data-f="snome" class="form-control" value="${dados.nome || ""}" placeholder="Nome do sabor" style="flex:2;min-width:120px">
      <select data-f="stipo" class="form-control pizza-sabor-tipo" style="flex:1;min-width:100px">
        ${
          tipos.length
            ? tipos.map(t =>
                `<option value="${t}" ${dados.tipo === t ? "selected" : ""}>${t}</option>`
              ).join("")
            : `<option value="${dados.tipo || ""}">${dados.tipo || "—"}</option>`
        }
      </select>
      <button type="button" class="btn btn-sm pizza-sabor-toggle-ativo"
        data-ativo="${isAtivo}"
        style="background:${isAtivo ? "#27ae60" : "#e74c3c"};color:#fff;border:none;
               border-radius:6px;padding:4px 9px;cursor:pointer;font-size:0.78rem;white-space:nowrap"
        onclick="pizzaSaborToggleAtivo(this)">
        ${isAtivo ? "✅ Ativo" : "⏸ Pausado"}
      </button>
      <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.pizza-sabor-row').remove()">✕</button>
    </div>
    <textarea data-f="sdesc" class="form-control" rows="1" placeholder="Descrição (opcional)" style="margin-bottom:6px">${dados.desc || ""}</textarea>
    <div style="display:flex;gap:8px;align-items:center">
      ${imgSrc ? `<img src="${imgSrc}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;flex-shrink:0">` : ""}
      <input data-f="simg" type="text" class="form-control" value="${imgSrc}" placeholder="URL da imagem (opcional)" style="flex:1;font-size:0.8rem">
      <label style="cursor:pointer;background:#e8f4fd;border:1px solid #3498db;border-radius:6px;padding:5px 8px;font-size:0.75rem;white-space:nowrap">
        📷 <input type="file" accept="image/*" style="display:none" onchange="uploadSaborImagem(this, this.closest('.pizza-sabor-row'))">
      </label>
    </div>
  `;
  _pizzaSaborDragBind(row);
  lista.appendChild(row);
}

function pizzaSaborToggleAtivo(btn) {
  const atual = btn.dataset.ativo === "true";
  const novo  = !atual;
  btn.dataset.ativo = String(novo);
  btn.style.background = novo ? "#27ae60" : "#e74c3c";
  btn.textContent = novo ? "✅ Ativo" : "⏸ Pausado";
}

// ── Drag & Drop nativo para reordenar sabores ──────────────────
let _dragSaborRow = null;

function _pizzaSaborDragBind(row) {
  row.addEventListener("dragstart", e => {
    _dragSaborRow = row;
    row.style.opacity = "0.4";
    e.dataTransfer.effectAllowed = "move";
  });
  row.addEventListener("dragend", () => {
    row.style.opacity = "";
    _dragSaborRow = null;
    // Remove indicadores visuais
    document.querySelectorAll(".pizza-sabor-row").forEach(r => r.classList.remove("drag-over"));
  });
  row.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (_dragSaborRow && _dragSaborRow !== row) {
      row.classList.add("drag-over");
    }
  });
  row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
  row.addEventListener("drop", e => {
    e.preventDefault();
    row.classList.remove("drag-over");
    if (!_dragSaborRow || _dragSaborRow === row) return;
    const lista = document.getElementById("pizza-sabores-lista");
    const rows  = [...lista.querySelectorAll(".pizza-sabor-row")];
    const fromIdx = rows.indexOf(_dragSaborRow);
    const toIdx   = rows.indexOf(row);
    if (fromIdx < toIdx) {
      lista.insertBefore(_dragSaborRow, row.nextSibling);
    } else {
      lista.insertBefore(_dragSaborRow, row);
    }
  });
}

// Inicializa drag em sabores existentes (chamado ao abrir modal de edição)
function _pizzaSaboresDragInit() {
  document.querySelectorAll("#pizza-sabores-lista .pizza-sabor-row").forEach(_pizzaSaborDragBind);
}

async function uploadSaborImagem(fileInput, row) {
  if (!fileInput.files.length) return;
  const file = fileInput.files[0];
  fileInput.disabled = true;

  // Feedback visual no botão/label pai
  const labelBtn = fileInput.closest("label");
  const originalLabel = labelBtn ? labelBtn.innerHTML : null;
  if (labelBtn) labelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  try {
    // ── Upload para o Cloudinary (substitui Supabase Storage) ──
    const url = await uploadImageToCloudinary(file);

    const inp =
      row.querySelector('[data-f="simg"]') ||
      row.querySelector('[data-f="img"]');
    if (inp) inp.value = url;
    const prev = row.querySelector("img.img-preview-mini");
    if (prev) {
      prev.src = url;
      prev.style.display = "block";
    }
  } catch (e) {
    alert("Erro ao enviar imagem: " + e.message);
  } finally {
    fileInput.disabled = false;
    if (labelBtn && originalLabel) labelBtn.innerHTML = originalLabel;
  }
}

// ─── AÇAÍ BUILDER ────────────────────────────────────────────────

function addAcaiTamanho(dados = {}) {
  const lista = document.getElementById("acai-tamanhos-lista");
  const row = document.createElement("div");
  row.className = "acai-tamanho-row builder-item-row";
  const img = dados.img || "";
  row.innerHTML = `
    <div class="bir-fields">
      <div><label class="bir-label">Nome</label><input data-f="nome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: 300ml, Médio, G"></div>
      <div><label class="bir-label">Preço (Gs)</label><input data-f="preco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="0" min="0" step="500"></div>
      <div style="position:relative">
        <label class="bir-label">Imagem</label>
        <div style="display:flex;gap:4px">
          <input data-f="img" type="text" class="form-control" value="${img}" placeholder="URL ou 📷">
          <label style="cursor:pointer;background:#e8f4fd;border:1px solid #3498db;border-radius:6px;padding:5px 8px;font-size:0.75rem;white-space:nowrap">
            📷<input type="file" accept="image/*" style="display:none" onchange="uploadSaborImagem(this,this.closest('.acai-tamanho-row'))">
          </label>
        </div>
        ${img ? `<img class="img-preview-mini" src="${img}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;margin-top:4px">` : '<img class="img-preview-mini" style="display:none;width:36px;height:36px;border-radius:6px;object-fit:cover;margin-top:4px">'}
      </div>
    </div>
    <button class="btn btn-sm btn-danger bir-remove" onclick="this.closest('.acai-tamanho-row').remove()">✕</button>`;
  lista.appendChild(row);
}

function addAcaiAcompanhamento(dados = {}) {
  const lista = document.getElementById("acai-acomp-lista");
  const row = document.createElement("div");
  row.className = "acai-acomp-row builder-item-row";
  const img = dados.img || "";
  row.innerHTML = `
    <div class="bir-fields">
      <div><label class="bir-label">Nome</label><input data-f="nome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: Granola, Leite Condensado"></div>
      <div><label class="bir-label">Preço extra (Gs)</label><input data-f="preco" type="number" class="form-control" value="${dados.preco || 0}" placeholder="0 = incluído" min="0" step="100"></div>
      <div>
        <label class="bir-label">Imagem</label>
        <div style="display:flex;gap:4px">
          <input data-f="img" type="text" class="form-control" value="${img}" placeholder="URL ou 📷">
          <label style="cursor:pointer;background:#e8f4fd;border:1px solid #3498db;border-radius:6px;padding:5px 8px;font-size:0.75rem;white-space:nowrap">
            📷<input type="file" accept="image/*" style="display:none" onchange="uploadSaborImagem(this,this.closest('.acai-acomp-row'))">
          </label>
        </div>
        ${img ? `<img class="img-preview-mini" src="${img}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;margin-top:4px">` : '<img class="img-preview-mini" style="display:none;width:36px;height:36px;border-radius:6px;object-fit:cover;margin-top:4px">'}
      </div>
    </div>
    <button class="btn btn-sm btn-danger bir-remove" onclick="this.closest('.acai-acomp-row').remove()">✕</button>`;
  lista.appendChild(row);
}

function addAcaiEtapa(titulo = "", max = 1, itens = []) {
  const container = document.getElementById("acai-etapas-container");
  const div = document.createElement("div");
  div.className = "etapa-item";
  const itensStr = Array.isArray(itens) ? itens.join(", ") : itens;
  div.innerHTML = `
    <div class="etapa-header">
      <input type="text" class="form-control step-titulo" value="${titulo}" placeholder="Título da etapa (ex: Frutas)">
      <input type="number" class="form-control step-max" value="${max}" style="width:70px" title="Máx. seleções">
      <button class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
    <textarea class="etapa-ingredientes step-itens" placeholder="Itens separados por vírgula. Ex: Morango, Banana, Uva">${itensStr}</textarea>`;
  container.appendChild(div);
}

// ─── SUCO BUILDER ────────────────────────────────────────────────

function addSucoTamanho(dados = {}) {
  const lista = document.getElementById("suco-tamanhos-lista");
  const row = document.createElement("div");
  row.className = "suco-tamanho-row builder-item-row";
  row.innerHTML = `
    <div class="bir-fields">
      <div><label class="bir-label">Nome</label><input data-f="nome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: 300ml, 500ml, Grande"></div>
      <div><label class="bir-label">Preço (Gs)</label><input data-f="preco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="0" min="0" step="500"></div>
    </div>
    <button class="btn btn-sm btn-danger bir-remove" onclick="this.closest('.suco-tamanho-row').remove()">✕</button>`;
  lista.appendChild(row);
}

function addSucoEtapa(titulo = "", max = 1, itens = []) {
  const container = document.getElementById("suco-etapas-container");
  const div = document.createElement("div");
  div.className = "etapa-item";
  const itensStr = Array.isArray(itens) ? itens.join(", ") : itens;
  div.innerHTML = `
    <div class="etapa-header">
      <input type="text" class="form-control step-titulo" value="${titulo}" placeholder="Título da etapa (ex: Fruta principal)">
      <input type="number" class="form-control step-max" value="${max}" style="width:70px" title="Máx. seleções">
      <button class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
    <textarea class="etapa-ingredientes step-itens" placeholder="Ex: Laranja, Limão, Maracujá">${itensStr}</textarea>`;
  container.appendChild(div);
}

// ─── SORVETE BUILDER ─────────────────────────────────────────────

function addSorveteTamanho(dados = {}) {
  const lista = document.getElementById("sorvete-tamanhos-lista");
  const row = document.createElement("div");
  row.className = "sorvete-tamanho-row builder-item-row";
  row.innerHTML = `
    <div class="bir-fields">
      <div><label class="bir-label">Nome</label><input data-f="nome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: 1 Bola, Duplo, 3 Bolas"></div>
      <div><label class="bir-label">Qtd. Bolas</label><input data-f="qtd_bolas" type="number" class="form-control" value="${dados.qtd_bolas || ""}" placeholder="1" min="1"></div>
      <div><label class="bir-label">Preço (Gs)</label><input data-f="preco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="0" min="0" step="500"></div>
    </div>
    <button class="btn btn-sm btn-danger bir-remove" onclick="this.closest('.sorvete-tamanho-row').remove()">✕</button>`;
  lista.appendChild(row);
}

function addSorveteSabor(dados = {}) {
  const lista = document.getElementById("sorvete-sabores-lista");
  const row = document.createElement("div");
  row.className = "sorvete-sabor-row builder-item-row";
  const img = dados.img || "";
  row.innerHTML = `
    <div class="bir-fields">
      <div><label class="bir-label">Sabor</label><input data-f="nome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: Chocolate, Morango, Baunilha"></div>
      <div><label class="bir-label">Preço extra (Gs)</label><input data-f="preco" type="number" class="form-control" value="${dados.preco || 0}" placeholder="0 = incluído" min="0" step="100"></div>
      <div>
        <label class="bir-label">Imagem</label>
        <div style="display:flex;gap:4px">
          <input data-f="img" type="text" class="form-control" value="${img}" placeholder="URL ou 📷">
          <label style="cursor:pointer;background:#e8f4fd;border:1px solid #3498db;border-radius:6px;padding:5px 8px;font-size:0.75rem">
            📷<input type="file" accept="image/*" style="display:none" onchange="uploadSaborImagem(this,this.closest('.sorvete-sabor-row'))">
          </label>
        </div>
        ${img ? `<img class="img-preview-mini" src="${img}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;margin-top:4px">` : '<img class="img-preview-mini" style="display:none;width:36px;height:36px;border-radius:6px;object-fit:cover;margin-top:4px">'}
      </div>
    </div>
    <button class="btn btn-sm btn-danger bir-remove" onclick="this.closest('.sorvete-sabor-row').remove()">✕</button>`;
  lista.appendChild(row);
}

function addSorveteEtapa(titulo = "", max = 1, itens = []) {
  const container = document.getElementById("sorvete-etapas-container");
  const div = document.createElement("div");
  div.className = "etapa-item";
  const itensStr = Array.isArray(itens) ? itens.join(", ") : itens;
  div.innerHTML = `
    <div class="etapa-header">
      <input type="text" class="form-control step-titulo" value="${titulo}" placeholder="Título da etapa (ex: Cobertura)">
      <input type="number" class="form-control step-max" value="${max}" style="width:70px" title="Máx. seleções">
      <button class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
    <textarea class="etapa-ingredientes step-itens" placeholder="Ex: Calda de Chocolate, Caramelo, Granulado">${itensStr}</textarea>`;
  container.appendChild(div);
}

// ─── VARIAÇÃO SIMPLES (para açaí / sorvete) ──────────────────────
// Igual a addVariacao mas sem foto, para listas secundárias
function addVariacaoSimples(dados = {}, listaId) {
  const lista = document.getElementById(listaId);
  if (!lista) return;
  const row = document.createElement("div");
  row.className = "variacao-acai-row builder-item-row";
  row.innerHTML = `
    <div class="bir-fields">
      <div><label class="bir-label">Nome</label><input data-f="vnome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: Tradicional, Premium"></div>
      <div><label class="bir-label">Preço extra (Gs)</label><input data-f="vpreco" type="number" class="form-control" value="${dados.preco || 0}" placeholder="0" min="0" step="100"></div>
    </div>
    <button class="btn btn-sm btn-danger bir-remove" onclick="this.closest('.variacao-acai-row').remove()">✕</button>`;
  lista.appendChild(row);
}

// ─── COMBO BUILDER ───────────────────────────────────────────────

async function _carregarComboSelect() {
  const container = document.getElementById("combo-produtos-selecionados");
  if (!container) return;
  container.innerHTML =
    '<div style="text-align:center;padding:10px;color:#aaa;font-size:0.82rem">Carregando produtos...</div>';
  const { data } = await supa
    .from("produtos")
    .select("id, nome, preco, categoria_slug")
    .eq("ativo", true)
    .order("nome");
  if (!data || !data.length) {
    container.innerHTML =
      '<div style="color:#aaa;font-size:0.82rem">Nenhum produto cadastrado.</div>';
    return;
  }
  const presel = window._comboItensPresel || [];
  container.innerHTML = data
    .map(
      (p) => `
    <label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;border:1px solid ${presel.includes(p.id) ? "#1a7a2e" : "#eee"};background:${presel.includes(p.id) ? "#f0fff4" : "#fff"};margin-bottom:4px;transition:all 0.15s"
      onmousedown="this.style.borderColor='#1a7a2e';this.style.background='#f0fff4'">
      <input type="checkbox" value="${p.id}" ${presel.includes(p.id) ? "checked" : ""} style="width:16px;height:16px"
        onchange="this.closest('label').style.borderColor=this.checked?'#1a7a2e':'#eee';this.closest('label').style.background=this.checked?'#f0fff4':'#fff'">
      <span style="flex:1;font-size:0.87rem;font-weight:600">${p.nome}</span>
      <span style="font-size:0.78rem;color:#888">${p.categoria_slug || ""}</span>
      <span style="font-size:0.8rem;color:#27ae60;font-weight:700;white-space:nowrap">Gs ${(p.preco || 0).toLocaleString("es-PY")}</span>
    </label>`,
    )
    .join("");
}

function cfAdicionarSabor(nome = "") {
  const lista = document.getElementById("cf-sabores-lista");
  if (!lista) return;
 
  const id = "cf-s-" + Date.now() + Math.random().toString(36).slice(2, 6);
  const row = document.createElement("div");
  row.className = "cf-sabor-row";
  row.dataset.cfId = id;
  row.innerHTML = `
    <input type="text" placeholder="Ex: Frango, Queijo, Carne…"
           value="${nome.replace(/"/g, "&quot;")}"
           oninput="cfAtualizarPreview()"
           style="flex:1;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:0.88rem;outline:none">
    <button type="button" class="cf-remove-sabor" title="Remover sabor"
            onclick="cfRemoverSabor('${id}')">×</button>
  `;
  lista.appendChild(row);
  row.querySelector("input").focus();
  cfAtualizarPreview();
}
 
/** Remove uma linha de sabor */
function cfRemoverSabor(id) {
  const el = document.querySelector(`[data-cf-id="${id}"]`);
  if (el) el.remove();
  cfAtualizarPreview();
}
 
/** Lê o estado atual do builder e atualiza o preview JSON */
function cfAtualizarPreview() {
  const preview = document.getElementById("cf-json-preview");
  if (!preview) return;
  const cfg = cfLerConfigBuilder();
  preview.textContent = JSON.stringify(cfg, null, 2);
}
 
/** Lê o formulário do builder e retorna o objeto de config */
function cfLerConfigBuilder() {
  const limite = parseInt(document.getElementById("cf-limite")?.value) || 0;
  const sabores = [];
 
  document.querySelectorAll("#cf-sabores-lista .cf-sabor-row").forEach((row) => {
    const nome = row.querySelector("input")?.value?.trim();
    if (nome) sabores.push({ id: row.dataset.cfId, nome });
  });
 
  return {
    __tipo: "combo_fechado",
    limite_total: limite,
    sabores,
  };
}
 
/** Popula o builder com uma config existente (modo edição) */
function cfCarregarNoBuilder(cfg) {
  if (!cfg || cfg.__tipo !== "combo_fechado") return;
 
  const limiteEl = document.getElementById("cf-limite");
  if (limiteEl) limiteEl.value = cfg.limite_total || "";
 
  const lista = document.getElementById("cf-sabores-lista");
  if (lista) lista.innerHTML = "";
 
  (cfg.sabores || []).forEach((s) => cfAdicionarSabor(s.nome));
  cfAtualizarPreview();
}

// ─── DUPLICAR PRODUTO ────────────────────────────────────────────

async function duplicarProduto(id) {
  if (
    !confirm(
      'Duplicar este produto? Uma cópia será criada com o nome "(Cópia) ..."',
    )
  )
    return;
  const { data: p, error } = await supa
    .from("produtos")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !p) {
    alert("Erro ao buscar produto.");
    return;
  }
  const copia = { ...p };
  delete copia.id;
  delete copia.created_at;
  delete copia.updated_at;
  copia.nome = `(Cópia) ${p.nome}`;
  copia.ativo = false; // entra como pausado para revisão
  const { error: errIns } = await supa.from("produtos").insert([copia]);
  if (errIns) {
    alert("Erro ao duplicar: " + errIns.message);
    return;
  }
  alert(t("alert.produto_duplicado"));
  carregarProdutos();
}

function toggleExtras() {
  const ativo = document.getElementById("prod-tem-extras").checked;
  document.getElementById("extras-area").style.display = ativo
    ? "block"
    : "none";
}

function addExtra(dados = {}) {
  const lista = document.getElementById("extras-lista");
  const row = document.createElement("div");
  row.className = "extra-row";
  row.innerHTML = `
    <input data-f="enome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: Wasabi, Ovo Frito">
    <input data-f="epreco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="Preço (Gs)">
    <button class="btn btn-sm btn-danger" onclick="this.closest('.extra-row').remove()" title="Remover">✕</button>
  `;
  lista.appendChild(row);
}

// ── PREPARO ──────────────────────────────────
function togglePreparo() {
  const ativo = document.getElementById("prod-tem-preparo").checked;
  document.getElementById("preparo-area").style.display = ativo
    ? "block"
    : "none";
}

function addOpcaoPreparo(valor = "") {
  const lista = document.getElementById("preparo-lista");
  const row = document.createElement("div");
  row.className = "extra-row preparo-row-admin";
  row.innerHTML = `
    <input class="form-control preparo-opcao-input" value="${valor}" placeholder="Ex: Salmão Flambado, Batata Frita">
    <button class="btn btn-sm btn-danger" onclick="this.closest('.preparo-row-admin').remove()" title="Remover">✕</button>
  `;
  lista.appendChild(row);
}

// ── ADICIONAIS GLOBAIS ────────────────────────
function addExtraGlobal(dados = {}) {
  const lista = document.getElementById("extras-globais-lista");
  const row = document.createElement("div");
  row.className = "extra-row";
  row.style.marginBottom = "8px";
  row.innerHTML = `
    <input data-f="gnome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: Ex: Adicional Extra">
    <input data-f="gpreco" type="number" class="form-control" value="${dados.preco || 0}" placeholder="Preço (0 = Grátis)">
    <button class="btn btn-sm btn-danger" onclick="this.closest('.extra-row').remove()" title="Remover">✕</button>
  `;
  lista.appendChild(row);
}

async function salvarExtrasGlobais() {
  const extras = [];
  document
    .querySelectorAll("#extras-globais-lista .extra-row")
    .forEach((row) => {
      const nome = row.querySelector('[data-f="gnome"]').value.trim();
      const preco =
        parseFloat(row.querySelector('[data-f="gpreco"]').value) || 0;
      if (nome) extras.push({ nome, preco });
    });

  // Categorias selecionadas (null = todas)
  const catChips = document.querySelectorAll(
    '#extras-globais-cats-lista input[type="checkbox"]:checked',
  );
  const catsArr = [...catChips].map((c) => c.value);
  const catsVal = catsArr.length === 0 ? null : catsArr;

  const { error } = await supa
    .from("configuracoes")
    .update({
      extras_globais: extras,
      extras_globais_categorias: catsVal,
    })
    .gt("id", 0);
  if (error) {
    alert("Erro ao salvar adicionais globais: " + error.message);
    return;
  }
  alert("✅ Adicionais globais salvos!");
}

async function carregarExtrasGlobaisAdmin() {
  const lista = document.getElementById("extras-globais-lista");
  if (!lista) return;
  lista.innerHTML = "";
  try {
    const { data, error } = await supa
      .from("configuracoes")
      .select("extras_globais, extras_globais_categorias")
      .single();
    if (error) {
      console.warn("Extras globais:", error.message);
      return;
    }
    if (data?.extras_globais && Array.isArray(data.extras_globais))
      data.extras_globais.forEach((ex) => addExtraGlobal(ex));

    // Carrega categorias para o seletor
    const { data: cats } = await supa
      .from("categorias")
      .select("slug, nome_exibicao")
      .eq("ativa", true)
      .order("ordem");
    const catsContainer = document.getElementById("extras-globais-cats-lista");
    if (catsContainer && cats) {
      const selCats = data?.extras_globais_categorias || null;
      catsContainer.innerHTML = cats
        .map(
          (c) => `
        <label style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--color-background-secondary);border-radius:6px;cursor:pointer;font-size:0.82rem">
          <input type="checkbox" value="${c.slug}" ${!selCats || selCats.includes(c.slug) ? "checked" : ""} style="width:15px;height:15px">
          ${c.nome_exibicao || c.slug}
        </label>`,
        )
        .join("");
    }
  } catch (e) {
    console.log("Extras globais:", e.message);
  }
}

// =========================================
// AVISAR ENCERRAMENTO DO DELIVERY
// =========================================

/**
 * Grava na tabela `configuracoes` um timestamp de encerramento
 * e um aviso visível para todos os clientes.
 *
 * Na tabela configuracoes precisam existir os campos:
 *   aviso_delivery  TEXT  (mensagem exibida no banner do site)
 *   delivery_aberto BOOLEAN (controla se o delivery está habilitado)
 */
async function avisarEncerramentoDelivery() {
  const modal = document.getElementById("modal-encerramento-delivery");
  if (modal) {
    modal.style.display = "flex";
    return;
  }

  // Cria o modal dinamicamente se não estiver no HTML
  const overlay = document.createElement("div");
  overlay.id = "modal-encerramento-delivery";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <h3 style="margin:0;font-size:1.1rem;color:#c0392b">🚫 Encerrar Delivery</h3>
        <button onclick="this.closest('#modal-encerramento-delivery').remove()" 
                style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#999">✕</button>
      </div>

      <p style="color:#555;font-size:0.9rem;margin-bottom:16px">
        Isso vai <strong>fechar o delivery imediatamente</strong> e exibir um aviso para os clientes no site.
      </p>

      <label style="font-weight:600;font-size:0.85rem;color:#333;display:block;margin-bottom:6px">
        Mensagem para os clientes (opcional):
      </label>
      <textarea id="aviso-encerramento-texto" rows="3"
        style="width:100%;padding:10px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.9rem;resize:vertical;box-sizing:border-box;margin-bottom:16px"
        placeholder="Ex: Delivery encerrado por hoje. Voltamos amanhã às 18h! 🍣"></textarea>

      <div style="display:flex;gap:10px">
        <button onclick="this.closest('#modal-encerramento-delivery').remove()"
                style="flex:1;padding:12px;background:#f5f5f5;color:#555;border:none;border-radius:8px;font-weight:600;cursor:pointer">
          Cancelar
        </button>
        <button onclick="_confirmarEncerramentoDelivery()"
                style="flex:1;padding:12px;background:#e74c3c;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer">
          🚫 Fechar Agora
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

async function _confirmarEncerramentoDelivery() {
  const texto =
    document.getElementById("aviso-encerramento-texto")?.value?.trim() ||
    "Delivery encerrado por hoje. Obrigado! 🍣";

  const { error } = await supa
    .from("configuracoes")
    .update({
      delivery_aberto: false,
      aviso_delivery: texto,
    })
    .gt("id", 0);

  if (error) {
    // Tenta com upsert se update falhou (configuracoes pode não ter a linha)
    const { error: e2 } = await supa.from("configuracoes").upsert({
      id: 1,
      delivery_aberto: false,
      aviso_delivery: texto,
    });
    if (e2) {
      alert(
        "Erro ao encerrar delivery: " +
          e2.message +
          "\n\n💡 Execute no Supabase:\nALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS delivery_aberto BOOLEAN DEFAULT true;\nALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS aviso_delivery TEXT DEFAULT '';",
      );
      return;
    }
  }

  document.getElementById("modal-encerramento-delivery")?.remove();
  alert(t("alert.delivery_encerrado"));

  // Atualiza badge no painel se existir
  const badge = document.getElementById("badge-delivery-status");
  if (badge) {
    badge.style.background = "#e74c3c";
    badge.textContent = "🔴 Delivery Fechado";
  }
}

async function reabrirDelivery() {
  if (!confirm("Reabrir o delivery para novos pedidos?")) return;

  const { error } = await supa
    .from("configuracoes")
    .update({
      delivery_aberto: true,
      aviso_delivery: "",
    })
    .gt("id", 0);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  alert(t("alert.delivery_reaberto"));

  const badge = document.getElementById("badge-delivery-status");
  if (badge) {
    badge.style.background = "#27ae60";
    badge.textContent = "🟢 Delivery Aberto";
  }
}

// =========================================
// ESTENDER HORÁRIO DE FUNCIONAMENTO
// =========================================

/**
 * Abre um modal para adicionar minutos extras ao horário de hoje.
 * Grava em configuracoes.horario_extra_hoje = { data: 'YYYY-MM-DD', minutos: N }
 * O app.js deve ler este campo para calcular o horário real de fechamento.
 *
 * Execute no Supabase:
 *   ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS horario_extra_hoje JSONB DEFAULT NULL;
 */
function abrirModalEstenderHorario() {
  const existente = document.getElementById("modal-estender-horario");
  if (existente) {
    existente.style.display = "flex";
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "modal-estender-horario";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <h3 style="margin:0;font-size:1.1rem;color:#2980b9">⏰ Estender Horário Hoje</h3>
        <button onclick="this.closest('#modal-estender-horario').remove()"
                style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#999">✕</button>
      </div>

      <p style="color:#555;font-size:0.88rem;margin-bottom:18px">
        Adicione minutos extras ao horário de hoje. O site aceitará pedidos por mais tempo.
      </p>

      <label style="font-weight:600;font-size:0.85rem;color:#333;display:block;margin-bottom:10px">
        Quantos minutos a mais?
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
        ${[15, 30, 45, 60, 90, 120]
          .map(
            (m) => `
          <button onclick="_selecionarMinutosExtra(${m}, this)"
                  data-min="${m}"
                  style="padding:10px 16px;border:2px solid #e0e0e0;border-radius:8px;background:#f8f9fa;font-weight:700;cursor:pointer;font-size:0.9rem;transition:all 0.15s">
            +${m}min
          </button>`,
          )
          .join("")}
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <label style="font-size:0.85rem;color:#666;white-space:nowrap">Ou digite:</label>
        <input type="number" id="input-minutos-extra" min="1" max="480" placeholder="ex: 45"
               oninput="document.querySelectorAll('[data-min]').forEach(b => b.style.background='#f8f9fa')"
               style="flex:1;padding:10px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.95rem;font-weight:700">
        <span style="color:#666;font-size:0.85rem">min</span>
      </div>

      <div style="display:flex;gap:10px">
        <button onclick="this.closest('#modal-estender-horario').remove()"
                style="flex:1;padding:12px;background:#f5f5f5;color:#555;border:none;border-radius:8px;font-weight:600;cursor:pointer">
          Cancelar
        </button>
        <button onclick="_confirmarEstenderHorario()"
                style="flex:1;padding:12px;background:#2980b9;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer">
          ⏰ Confirmar
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

function _selecionarMinutosExtra(min, btn) {
  // Destaca o botão selecionado e limpa o input
  document.querySelectorAll("[data-min]").forEach((b) => {
    b.style.background = "#f8f9fa";
    b.style.borderColor = "#e0e0e0";
    b.style.color = "#333";
  });
  btn.style.background = "#2980b9";
  btn.style.borderColor = "#2980b9";
  btn.style.color = "#fff";
  const inp = document.getElementById("input-minutos-extra");
  if (inp) inp.value = min;
}

async function _confirmarEstenderHorario() {
  const inp = document.getElementById("input-minutos-extra");
  const minutos = parseInt(inp?.value || "0");
  if (!minutos || minutos < 1) {
    alert("Escolha quantos minutos deseja adicionar.");
    return;
  }

  const hoje = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { error } = await supa
    .from("configuracoes")
    .update({
      horario_extra_hoje: { data: hoje, minutos },
    })
    .gt("id", 0);

  if (error) {
    const { error: e2 } = await supa.from("configuracoes").upsert({
      id: 1,
      horario_extra_hoje: { data: hoje, minutos },
    });
    if (e2) {
      alert(
        "Erro ao salvar: " +
          e2.message +
          "\n\n💡 Execute no Supabase:\nALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS horario_extra_hoje JSONB DEFAULT NULL;",
      );
      return;
    }
  }

  document.getElementById("modal-estender-horario")?.remove();
  alert(`✅ Horário estendido em +${minutos} minutos hoje!`);
}

async function removerExtensaoHorario() {
  if (!confirm("Remover a extensão de horário de hoje?")) return;
  await supa
    .from("configuracoes")
    .update({ horario_extra_hoje: null })
    .gt("id", 0);
  alert("✅ Extensão removida.");
}

// Carrega status do delivery no painel (chamado no DOMContentLoaded / showTab)
async function carregarStatusDelivery() {
  const badge = document.getElementById("badge-delivery-status");
  if (!badge) return;
  try {
    const { data } = await supa
      .from("configuracoes")
      .select("delivery_aberto, aviso_delivery, horario_extra_hoje")
      .gt("id", 0)
      .single();

    if (!data) return;

    if (data.delivery_aberto === false) {
      badge.style.background = "#e74c3c";
      badge.textContent = "🔴 Delivery Fechado";
    } else {
      badge.style.background = "#27ae60";
      badge.textContent = "🟢 Delivery Aberto";
    }

    // Mostra extensão de horário se ativa hoje
    const hoje = new Date().toISOString().split("T")[0];
    const ext = data.horario_extra_hoje;
    const badgeExt = document.getElementById("badge-horario-extra");
    if (badgeExt) {
      if (ext && ext.data === hoje && ext.minutos > 0) {
        badgeExt.style.display = "inline-block";
        badgeExt.textContent = `⏰ +${ext.minutos}min hoje`;
      } else {
        badgeExt.style.display = "none";
      }
    }
  } catch (e) {
    // Colunas ainda não existem — ignora silenciosamente
  }
}

// --- CATEGORIAS ---
async function carregarCategorias() {
  const { data, error } = await supa
    .from("categorias")
    .select("*")
    .order("ordem");

  const grid = document.getElementById("lista-categorias");
  if (!grid) return;

  if (error) {
    grid.innerHTML = `<p style="color:red;padding:20px">Erro ao carregar categorias: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    grid.innerHTML = `
      <div class="cat-empty">
        <i class="fas fa-tags" style="font-size:3rem;color:#ddd;margin-bottom:12px;display:block"></i>
        <p>Nenhuma categoria criada ainda.</p>
        <button class="btn btn-primary" onclick="abrirModalCategoria()"><i class="fas fa-plus"></i> Criar primeira categoria</button>
      </div>`;
    carregarSelectCategorias();
    return;
  }

  const paleta = [
    "#FF441F",
    "#3498db",
    "#2ecc71",
    "#9b59b6",
    "#e67e22",
    "#1abc9c",
    "#e74c3c",
    "#f39c12",
    "#34495e",
    "#00b894",
  ];

  grid.innerHTML = "";
  data.forEach((c, idx) => {
    const cor = paleta[idx % paleta.length];
    const cJson = JSON.stringify(c)
      .replace(/'/g, "&apos;")
      .replace(/"/g, "&quot;");
    const horarioBadge =
      c.hora_inicio && c.hora_fim
        ? `<span class="cat-badge cat-badge-horario">🕐 ${c.hora_inicio}–${c.hora_fim}${Array.isArray(c.dias_semana) && c.dias_semana.length ? " (" + c.dias_semana.join(",") + ")" : ""}</span>`
        : `<span class="cat-badge cat-badge-sempre">✅ Sempre visível</span>`;

    const card = document.createElement("div");
    card.className = "cat-card";
    card.style.borderTopColor = cor;
    card.setAttribute("draggable", "true");
    card.setAttribute("data-cat-slug", c.slug);
    card.setAttribute("data-cat-ordem", c.ordem);
    card.innerHTML = `
      <div class="cat-card-top">
        <div class="cat-drag-handle" title="Arraste para reordenar" style="cursor:grab; padding:0 8px 0 2px; color:#bbb; font-size:1.2rem; display:flex; align-items:center; user-select:none;">
          ⠿
        </div>
        <div class="cat-card-icon" style="background:${cor}20;color:${cor}">
          <i class="fas fa-tag"></i>
        </div>
        <div class="cat-card-info">
          <div class="cat-card-nome">${c.nome_exibicao}</div>
          <code class="cat-card-slug">${c.slug}</code>
        </div>
        <div class="cat-card-ordem" style="background:${cor}15;color:${cor}">#${c.ordem}</div>
      </div>
      <div class="cat-card-mid">${horarioBadge}</div>
      <div class="cat-card-actions">
        <button class="cat-btn cat-btn-sub" onclick="abrirPainelSubcategorias('${c.slug}')" title="Gerenciar Subcategorias">
          <i class="fas fa-layer-group"></i><span>Sub</span>
        </button>
        <button class="cat-btn cat-btn-edit" onclick='editarCategoria(${cJson})' title="Editar Categoria">
          <i class="fas fa-pen"></i><span>Editar</span>
        </button>
        <button class="cat-btn cat-btn-del" onclick="deletarCat('${c.slug}')" title="Excluir Categoria">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Inicializa drag & drop após renderizar
  iniciarDragDropCategorias(grid);

  carregarSelectCategorias();
}

// =========================================
// DRAG & DROP — REORDENAR CATEGORIAS
// =========================================
function iniciarDragDropCategorias(grid) {
  let draggingEl = null;
  let placeholder = null;

  // Cria o placeholder visual
  function criarPlaceholder() {
    const ph = document.createElement("div");
    ph.id = "cat-drag-placeholder";
    ph.style.cssText = `
      border: 2px dashed #FF441F;
      border-radius: 12px;
      background: rgba(255,68,31,0.05);
      min-height: 80px;
      transition: all 0.15s ease;
      opacity: 0.7;
    `;
    return ph;
  }

  grid.querySelectorAll(".cat-card").forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggingEl = card;
      placeholder = criarPlaceholder();
      // Visual do card sendo arrastado
      setTimeout(() => {
        card.style.opacity = "0.4";
        card.style.transform = "scale(0.97)";
      }, 0);
      e.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("dragend", async () => {
      if (draggingEl) {
        draggingEl.style.opacity = "1";
        draggingEl.style.transform = "";
      }
      if (placeholder && placeholder.parentNode) placeholder.remove();
      draggingEl = null;
      placeholder = null;

      // Salva nova ordem no banco
      await salvarOrdemCategorias(grid);
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!draggingEl || draggingEl === card) return;

      const rect = card.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (placeholder.parentNode) placeholder.remove();

      if (e.clientY < midY) {
        grid.insertBefore(placeholder, card);
      } else {
        grid.insertBefore(placeholder, card.nextSibling);
      }
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggingEl || draggingEl === card) return;
      if (placeholder && placeholder.parentNode) {
        grid.insertBefore(draggingEl, placeholder);
        placeholder.remove();
      }
    });
  });

  // Permite soltar no próprio grid (área vazia)
  grid.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  grid.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggingEl && placeholder?.parentNode) {
      grid.insertBefore(draggingEl, placeholder);
      placeholder.remove();
    }
  });
}

async function salvarOrdemCategorias(grid) {
  const cards = grid.querySelectorAll(".cat-card[data-cat-slug]");
  const updates = [];
  cards.forEach((card, idx) => {
    const slug = card.getAttribute("data-cat-slug");
    if (slug) updates.push({ slug, ordem: idx + 1 });
    // Atualiza badge visual imediatamente
    const badge = card.querySelector(".cat-card-ordem");
    if (badge) badge.textContent = `#${idx + 1}`;
  });

  if (updates.length === 0) return;

  try {
    // Atualiza todos em paralelo
    await Promise.all(
      updates.map(({ slug, ordem }) =>
        supa.from("categorias").update({ ordem }).eq("slug", slug),
      ),
    );
    console.log(
      "✅ Ordem das categorias salva:",
      updates.map((u) => `${u.slug}=${u.ordem}`).join(", "),
    );

    // Feedback visual sutil
    const toastId = "toast-ordem";
    let toast = document.getElementById(toastId);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = toastId;
      toast.style.cssText = `
        position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
        background:#27ae60; color:white; padding:10px 22px; border-radius:24px;
        font-size:0.9rem; font-weight:600; z-index:9999;
        box-shadow:0 4px 16px rgba(0,0,0,0.2);
        animation: fadeInUp 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = "✅ Ordem salva com sucesso!";
    toast.style.display = "block";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
  } catch (err) {
    console.error("Erro ao salvar ordem:", err);
    alert("Erro ao salvar nova ordem. Tente novamente.");
  }
}

// Carrega o Select no Modal de Produto
async function carregarSelectCategorias(valorAtual = null) {
  const { data } = await supa.from("categorias").select("*").order("ordem");
  const sel = document.getElementById("prod-cat");
  if (!sel) return;

  // Preserva seleção atual se não foi passado valorAtual
  const valorPreservar = valorAtual || sel.value;

  sel.innerHTML = '<option value="">— Sem categoria —</option>';
  if (data) {
    data.forEach(
      (c) =>
        (sel.innerHTML += `<option value="${c.slug}">${c.nome_exibicao}</option>`),
    );
  }

  // Restaura seleção
  if (valorPreservar) sel.value = valorPreservar;
}

// =========================================
// SISTEMA DE SUBCATEGORIAS
// =========================================

// Carrega subcategorias no select do modal de produto
async function carregarSelectSubcategorias(
  categoriaSlag = "",
  valorAtual = "",
) {
  const sel = document.getElementById("prod-subcat");
  const box = document.getElementById("box-subcategoria");
  if (!sel) return;

  sel.innerHTML = '<option value="">— Sem subcategoria —</option>';

  if (!categoriaSlag) {
    if (box) box.style.display = "none";
    return;
  }

  try {
    const { data, error } = await supa
      .from("subcategorias")
      .select("*")
      .eq("categoria_slug", categoriaSlag)
      .order("ordem");

    if (error) {
      console.warn("Subcategorias indisponíveis:", error.message);
      // Mostra o box mesmo assim (com só a opção "sem subcategoria")
      if (box) box.style.display = "block";
      return;
    }

    // Sempre mostra o campo quando uma categoria está selecionada
    if (box) box.style.display = "block";

    if (data && data.length > 0) {
      data.forEach(
        (s) =>
          (sel.innerHTML += `<option value="${s.slug}">${s.nome_exibicao}</option>`),
      );
      if (valorAtual) sel.value = valorAtual;
    }
  } catch (e) {
    console.warn("Erro ao buscar subcategorias:", e);
    // Mostra mesmo assim — melhor mostrar vazio do que esconder sem avisar
    if (box) box.style.display = "block";
  }
}

// Chamado quando o usuário muda a categoria no modal de produto
async function onCatChange() {
  const catSlug = document.getElementById("prod-cat").value;
  await carregarSelectSubcategorias(catSlug, "");
}

// --- CRUD DE SUBCATEGORIAS ---
let _catSlugAtualSubcat = "";

async function carregarSubcategorias(categoriaSlag) {
  _catSlugAtualSubcat = categoriaSlag;
  const wrapper = document.getElementById("lista-subcategorias-wrapper");
  if (!wrapper) return;

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <h4 style="margin:0">Subcategorias de: <strong>${categoriaSlag}</strong></h4>
      <button class="btn btn-primary btn-sm" onclick="abrirModalSubcat()">+ Nova Subcategoria</button>
    </div>`;

  try {
    const { data, error } = await supa
      .from("subcategorias")
      .select("*")
      .eq("categoria_slug", categoriaSlag)
      .order("ordem");

    if (error) throw error;

    if (!data || data.length === 0) {
      html +=
        '<p style="color:#aaa;padding:10px 0">Nenhuma subcategoria criada ainda.</p>';
    } else {
      html +=
        '<table class="table"><thead><tr><th>Slug</th><th>Nome</th><th>Ordem</th><th></th></tr></thead><tbody>';
      data.forEach((s) => {
        const sJson = JSON.stringify(s)
          .replace(/'/g, "&apos;")
          .replace(/"/g, "&quot;");
        html += `<tr>
          <td>${s.slug}</td>
          <td>${s.nome_exibicao}</td>
          <td>${s.ordem}</td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-info" onclick='editarSubcat(${sJson})'><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deletarSubcat('${s.slug}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
      });
      html += "</tbody></table>";
    }
  } catch (e) {
    html += `<div style="background:#fff3cd;padding:12px;border-radius:8px;color:#856404;font-size:0.85rem">
      ⚠️ A tabela <strong>subcategorias</strong> ainda não existe no banco.<br>
      Execute o SQL abaixo no Supabase para ativá-la:<br><br>
      <code style="background:#f8f9fa;padding:4px 8px;border-radius:4px;font-size:0.8rem;display:block;white-space:pre-wrap">
CREATE TABLE subcategorias (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nome_exibicao TEXT NOT NULL,
  categoria_slug TEXT REFERENCES categorias(slug) ON DELETE CASCADE,
  ordem INT DEFAULT 0
);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS subcategoria_slug TEXT REFERENCES subcategorias(slug) ON DELETE SET NULL;
      </code>
    </div>`;
  }

  wrapper.innerHTML = html;
}

function abrirModalSubcat(subcat = null) {
  const isEdit = !!subcat;
  const slugVal = subcat ? subcat.slug : "";
  const nomeVal = subcat ? subcat.nome_exibicao : "";
  const ordemVal = subcat ? subcat.ordem : "";

  const modalHtml = `
    <div id="modal-subcat" class="modal-overlay" style="display:flex">
      <div class="modal-content" style="max-width:400px">
        <h3>${isEdit ? "Editar Subcategoria" : "Nova Subcategoria"}</h3>
        <input type="hidden" id="subcat-modo" value="${isEdit ? "sim" : "nao"}">
        <input type="hidden" id="subcat-slug-original" value="${slugVal}">
        <div class="form-group">
          <label>Nome Exibição</label>
          <input type="text" id="subcat-nome" class="form-control" value="${nomeVal}" oninput="autoSlugFromSubcatNome()">
        </div>
        <div class="form-group">
          <label>Slug (ID único)</label>
          <input type="text" id="subcat-slug" class="form-control" value="${slugVal}">
          <small style="color:#888">Gerado automaticamente ou edite manualmente</small>
        </div>
        <div class="form-group">
          <label>Ordem</label>
          <input type="number" id="subcat-ordem" class="form-control" value="${ordemVal}">
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="salvarSubcat()">Salvar</button>
          <button class="btn btn-secondary" onclick="document.getElementById('modal-subcat').remove()">Cancelar</button>
        </div>
      </div>
    </div>`;

  // Remove modal anterior se existir
  document.getElementById("modal-subcat")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function editarSubcat(s) {
  abrirModalSubcat(s);
}

function autoSlugFromSubcatNome() {
  const nome = document.getElementById("subcat-nome").value;
  const slug = gerarSlug(nome);
  document.getElementById("subcat-slug").value = slug;
}

async function salvarSubcat() {
  const modo = document.getElementById("subcat-modo").value;
  const slugOriginal = document.getElementById("subcat-slug-original").value;
  const nome = document.getElementById("subcat-nome").value.trim();
  const slug = document.getElementById("subcat-slug").value.trim();
  const ordem = parseInt(document.getElementById("subcat-ordem").value) || 0;

  if (!slug || !nome) return alert("Preencha o slug e o nome!");

  const dados = {
    slug,
    nome_exibicao: nome,
    categoria_slug: _catSlugAtualSubcat,
    ordem,
  };

  let erro = null;
  if (modo === "sim") {
    const { error } = await supa
      .from("subcategorias")
      .update(dados)
      .eq("slug", slugOriginal);
    erro = error;
  } else {
    const { error } = await supa.from("subcategorias").insert([dados]);
    erro = error;
  }

  if (erro) {
    alert("Erro ao salvar: " + erro.message);
  } else {
    document.getElementById("modal-subcat")?.remove();
    carregarSubcategorias(_catSlugAtualSubcat);
  }
}

async function deletarSubcat(slug) {
  if (
    !confirm(
      `Deletar a subcategoria "${slug}"?\n\nOs produtos vinculados ficarão sem subcategoria.`,
    )
  )
    return;

  // Desvincula produtos
  await supa
    .from("produtos")
    .update({ subcategoria_slug: null })
    .eq("subcategoria_slug", slug);

  const { error } = await supa.from("subcategorias").delete().eq("slug", slug);
  if (error) alert("Erro: " + error.message);
  else carregarSubcategorias(_catSlugAtualSubcat);
}

// Utilitário: gera slug a partir de um texto
function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Abre Modal de Edição (Recebe o objeto c inteiro)
function editarCategoria(c) {
  document.getElementById("titulo-modal-cat").innerText = "Editar Categoria";
  document.getElementById("cat-modo-edicao").value = "sim";

  const slugInput = document.getElementById("cat-slug");
  slugInput.value = c.slug;
  slugInput.readOnly = false; // Permite editar o slug
  slugInput.dataset.slugOriginal = c.slug; // Guarda o original para comparar

  document.getElementById("cat-nome").value = c.nome_exibicao;
  document.getElementById("cat-ordem").value = c.ordem;
  document.getElementById("cat-hora-inicio").value = c.hora_inicio || "";
  document.getElementById("cat-hora-fim").value = c.hora_fim || "";
  const diasSalvos = Array.isArray(c.dias_semana) ? c.dias_semana : [];
  document.querySelectorAll(".cat-dia-check").forEach((cb) => {
    cb.checked = diasSalvos.includes(cb.value);
  });

  document.getElementById("modal-cat").style.display = "flex";
}

async function salvarCategoria() {
  const slugInput = document.getElementById("cat-slug");
  const slug = slugInput.value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_");
  const nome = document.getElementById("cat-nome").value.trim();
  let ordemVal = parseInt(document.getElementById("cat-ordem").value);
  const modo = document.getElementById("cat-modo-edicao").value;
  const slugOriginal = slugInput.dataset.slugOriginal || slug;

  if (!slug || !nome) return alert("Preencha o slug e o nome!");

  // Se ordem não foi preenchida ou ficou 0 em modo inserção, busca a próxima automaticamente
  if ((!ordemVal || ordemVal === 0) && modo !== "sim") {
    const { data: ult } = await supa
      .from("categorias")
      .select("ordem")
      .order("ordem", { ascending: false })
      .limit(1);
    ordemVal =
      ult && ult.length > 0 && ult[0].ordem != null ? ult[0].ordem + 1 : 1;
  }

  let erro = null;

  if (modo === "sim") {
    const slugMudou = slug !== slugOriginal;

    if (slugMudou) {
      // 1. Insere novo registro com o novo slug
      const horaIni = document.getElementById("cat-hora-inicio").value || null;
      const horaFim = document.getElementById("cat-hora-fim").value || null;
      const dias = Array.from(
        document.querySelectorAll(".cat-dia-check:checked"),
      ).map((cb) => cb.value);
      const { error: insErr } = await supa.from("categorias").insert([
        {
          slug,
          nome: nome,
          nome_exibicao: nome,
          ordem: ordemVal,
          hora_inicio: horaIni,
          hora_fim: horaFim,
          dias_semana: dias.length > 0 ? dias : null,
        },
      ]);
      if (insErr) {
        alert("Erro ao salvar: " + insErr.message);
        return;
      }

      // 2. Migra todos os produtos do slug antigo para o novo
      await supa
        .from("produtos")
        .update({ categoria_slug: slug })
        .eq("categoria_slug", slugOriginal);

      // 3. Migra subcategorias (se existirem)
      try {
        await supa
          .from("subcategorias")
          .update({ categoria_slug: slug })
          .eq("categoria_slug", slugOriginal);
      } catch (_) {}

      // 4. Deleta o registro antigo
      const { error: delErr } = await supa
        .from("categorias")
        .delete()
        .eq("slug", slugOriginal);
      erro = delErr;
    } else {
      const { error } = await supa
        .from("categorias")
        .update({
          nome: nome,
          nome_exibicao: nome,
          ordem: ordemVal,
          hora_inicio: document.getElementById("cat-hora-inicio").value || null,
          hora_fim: document.getElementById("cat-hora-fim").value || null,
          dias_semana: (() => {
            const d = Array.from(
              document.querySelectorAll(".cat-dia-check:checked"),
            ).map((cb) => cb.value);
            return d.length > 0 ? d : null;
          })(),
        })
        .eq("slug", slugOriginal);
      erro = error;
    }
  } else {
    const { error } = await supa.from("categorias").insert([
      {
        slug,
        nome: nome,
        nome_exibicao: nome,
        ordem: ordemVal,
        hora_inicio: document.getElementById("cat-hora-inicio").value || null,
        hora_fim: document.getElementById("cat-hora-fim").value || null,
        dias_semana: (() => {
          const d = Array.from(
            document.querySelectorAll(".cat-dia-check:checked"),
          ).map((cb) => cb.value);
          return d.length > 0 ? d : null;
        })(),
      },
    ]);
    erro = error;
  }

  if (erro) alert("Erro ao salvar: " + erro.message);
  else {
    fecharModal("modal-cat");
    carregarCategorias();
  }
}

async function abrirModalCategoria() {
  document.getElementById("titulo-modal-cat").innerText = "Nova Categoria";
  document.getElementById("cat-modo-edicao").value = "nao";
  const slugInput = document.getElementById("cat-slug");
  slugInput.value = "";
  slugInput.readOnly = false;
  slugInput.dataset.slugOriginal = "";
  document.getElementById("cat-nome").value = "";
  document.getElementById("cat-hora-inicio").value = "";
  document.getElementById("cat-hora-fim").value = "";
  document
    .querySelectorAll(".cat-dia-check")
    .forEach((cb) => (cb.checked = false));

  // Auto-preenche a ordem com o próximo número
  try {
    const { data } = await supa
      .from("categorias")
      .select("ordem")
      .order("ordem", { ascending: false })
      .limit(1);
    const proximaOrdem =
      data && data.length > 0 && data[0].ordem != null ? data[0].ordem + 1 : 1;
    document.getElementById("cat-ordem").value = proximaOrdem;
  } catch (e) {
    document.getElementById("cat-ordem").value = "";
  }

  document.getElementById("modal-cat").style.display = "flex";
}

async function deletarProduto(id) {
  const confirmar = confirm(
    "⚠️ ATENÇÃO: Deletar este produto?\n\nEsta ação não pode ser desfeita. O produto será removido permanentemente do sistema.",
  );
  if (!confirmar) return;

  try {
    const { error } = await supa.from("produtos").delete().eq("id", id);
    if (error) {
      alert("❌ Erro ao deletar: " + error.message);
    } else {
      alert(t("alert.produto_excluido"));
      carregarProdutos();
    }
  } catch (e) {
    alert("❌ Erro inesperado: " + e.message);
  }
}

async function pausarProduto(id, ativoAtual) {
  const novoStatus = !ativoAtual;
  const acao = novoStatus ? "reativar" : "pausar";
  if (!confirm(`Deseja ${acao} este produto?`)) return;

  const { error } = await supa
    .from("produtos")
    .update({ ativo: novoStatus })
    .eq("id", id);
  if (error) {
    alert("❌ Erro: " + error.message);
  } else {
    alert(novoStatus ? "✅ Produto reativado!" : "⏸️ Produto pausado!");
    carregarProdutos();
  }
}

async function deletarCat(slug) {
  // Verifica quantos produtos usam esta categoria
  const { count } = await supa
    .from("produtos")
    .select("*", { count: "exact", head: true })
    .eq("categoria_slug", slug);

  let msg = `⚠️ ATENÇÃO: Deletar a categoria "${slug}"?\n\nEsta ação não pode ser desfeita.`;
  if (count > 0) {
    msg += `\n\n⚠️ ${count} produto(s) usam esta categoria e ficarão sem categoria após a exclusão.`;
  }

  const confirmar = confirm(msg);
  if (!confirmar) return;

  try {
    // Primeiro: desvincula todos os produtos desta categoria
    if (count > 0) {
      await supa
        .from("produtos")
        .update({ categoria_slug: null, subcategoria_slug: null })
        .eq("categoria_slug", slug);
    }

    // Segundo: remove subcategorias vinculadas (se a tabela existir)
    try {
      await supa.from("subcategorias").delete().eq("categoria_slug", slug);
    } catch (_) {
      /* tabela pode não existir ainda */
    }

    // Terceiro: deleta a categoria
    const { error } = await supa.from("categorias").delete().eq("slug", slug);
    if (error) {
      alert("❌ Erro ao deletar: " + error.message);
    } else {
      alert("✅ Categoria deletada com sucesso!");
      carregarCategorias();
    }
  } catch (e) {
    alert("❌ Erro inesperado: " + e.message);
  }
}

// Abre o painel de subcategorias abaixo da tabela de categorias
function abrirPainelSubcategorias(categoriaSlug) {
  const painel = document.getElementById("lista-subcategorias-wrapper");
  if (!painel) return;
  painel.style.display = "block";
  painel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  carregarSubcategorias(categoriaSlug);
}

// Auto-gera o slug a partir do nome da categoria (modal de categoria)
function autoSlugFromNome() {
  const modo = document.getElementById("cat-modo-edicao")?.value;
  // Só auto-gera o slug se for criação (não edição)
  if (modo === "sim") return;
  const nome = document.getElementById("cat-nome").value;
  document.getElementById("cat-slug").value = gerarSlug(nome);
}

async function deletarMotoboy(id) {
  const confirmar = confirm(
    "⚠️ ATENÇÃO: Deletar este motoboy?\n\nEsta ação não pode ser desfeita.",
  );
  if (!confirmar) return;

  try {
    const { error } = await supa.from("motoboys").delete().eq("id", id);
    if (error) {
      if (
        error.code === "23503" ||
        (error.message && error.message.includes("foreign key"))
      ) {
        alert(
          "❌ Não é possível excluir este motoboy pois ele possui pedidos vinculados.\n\nDica: Você pode desativar o motoboy em vez de excluir.",
        );
      } else {
        alert("❌ Erro ao deletar: " + error.message);
      }
    } else {
      alert("✅ Motoboy deletado com sucesso!");
      carregarMotoboys();
      carregarMotoboysSelect();
    }
  } catch (e) {
    alert("❌ Erro inesperado: " + e.message);
  }
}
async function carregarMotoboys() {
  const { data, error } = await supa.from("motoboys").select("*").order("nome");

  // Log limpo: só mostra se houver erro real
  if (error) console.error("❌ carregarMotoboys error:", error);

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const wrapper = document.getElementById("lista-motos-wrapper");
    let container = document.getElementById("mobile-motos");

    if (!container) {
      container = document.createElement("div");
      container.className = "mobile-cards-container";
      container.id = "mobile-motos";
      const tableContainer = wrapper.querySelector(".table-container");
      if (tableContainer) {
        wrapper.insertBefore(container, tableContainer);
      }
    }

    container.innerHTML = "";

    if (!error && data && data.length > 0) {
      data.forEach((m) => {
        const card = document.createElement("div");
        card.className = "mobile-card";
        card.innerHTML = `
                    <div class="mobile-card-header">
                        <div class="mobile-card-title">
                            <i class="fas fa-motorcycle" style="color:var(--primary);margin-right:8px;"></i>
                            ${m.nome}
                        </div>
                    </div>
                    <div class="mobile-card-body">
                        <div class="mobile-card-row">
                            <span class="mobile-card-label">Telefone:</span>
                            <span class="mobile-card-value">${m.telefone || "-"}</span>
                        </div>
                    </div>
                    <div class="mobile-card-actions">
                        <button class="btn btn-info" onclick='editarMoto(${JSON.stringify(m).replace(/'/g, "&apos;").replace(/"/g, "&quot;")})'>
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger" onclick="deletarMotoboy(${m.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML =
        '<p style="text-align:center;padding:20px;color:#999">Nenhum motoboy cadastrado.</p>';
    }

    // Esconde tabela desktop no mobile
    const tableContainer = wrapper.querySelector(".table-container");
    if (tableContainer) tableContainer.style.display = "none";

    return;
  }

  // CÓDIGO DESKTOP
  const wrapper = document.getElementById("lista-motos-wrapper");
  const tableContainer = wrapper
    ? wrapper.querySelector(".table-container")
    : null;
  if (tableContainer) tableContainer.style.display = "block"; // Mostra tabela no desktop

  const tbody = document.getElementById("lista-motos");
  if (!tbody) {
    console.error("❌ Elemento lista-motos não encontrado!");
    return;
  }

  tbody.innerHTML = "";

  if (error) {
    console.error("❌ Erro ao carregar motoboys:", error);
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center;color:red">Erro ao carregar motoboys</td></tr>';
    return;
  }

  if (data && data.length > 0) {
    data.forEach((m) => {
      const mJson = JSON.stringify(m)
        .replace(/'/g, "'")
        .replace(/"/g, "&quot;");
      tbody.innerHTML += `
                <tr>
                    <td data-label="Nome">${m.nome}</td>
                    <td data-label="Telefone">${m.telefone || "-"}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm btn-info" onclick='editarMoto(${mJson})'>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletarMotoboy(${m.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
    });
  } else {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center">Nenhum motoboy cadastrado.</td></tr>';
  }
}

// Função chamada pelo botão editar
function editarMoto(m) {
  document.getElementById("moto-id").value = m.id;
  document.getElementById("moto-nome").value = m.nome;
  document.getElementById("moto-tel").value = m.telefone || "";
  document.getElementById("modal-moto").style.display = "flex";
}

function abrirModalMoto() {
  document.getElementById("moto-id").value = "";
  document.getElementById("moto-nome").value = "";
  document.getElementById("moto-tel").value = "";
  document.getElementById("modal-moto").style.display = "flex";
}

async function salvarMotoboy() {
  const dados = {
    nome: document.getElementById("moto-nome").value,
    telefone: document.getElementById("moto-tel").value,
  };
  const id = document.getElementById("moto-id").value;

  if (!dados.nome || !dados.nome.trim()) {
    alert("❌ Nome do motoboy é obrigatório!");
    return;
  }

  try {
    if (id) {
      const { error } = await supa.from("motoboys").update(dados).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supa.from("motoboys").insert([dados]);
      if (error) throw error;
    }

    alert(t("alert.moto_salvo"));
    fecharModal("modal-moto");
    carregarMotoboys();
    carregarMotoboysSelect(); // Atualiza o select da Rota
  } catch (e) {
    alert("❌ Erro ao salvar: " + e.message);
  }
}

async function carregarMotoboysSelect() {
  const { data } = await supa.from("motoboys").select("*");
  const sel = document.getElementById("sel-motoboy");
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione...</option>';
  if (data) {
    data.forEach((m) => {
      sel.innerHTML += `<option value="${m.id}" data-tel="${m.telefone}" data-nome="${m.nome}">${m.nome}</option>`;
    });
  }
}

// =========================================
// MOTOBOYS (CORRIGIDO)
// =========================================

// === CONFIGURAÇÕES (COMPLETO) ===

const DIAS_SEMANA = [
  { key: "seg", label: "Segunda-feira" },
  { key: "ter", label: "Terça-feira" },
  { key: "qua", label: "Quarta-feira" },
  { key: "qui", label: "Quinta-feira" },
  { key: "sex", label: "Sexta-feira" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

function _renderGradeSemanal(horariosSalvos = {}) {
  const container = document.getElementById("grade-semanal");
  if (!container) return;
  container.innerHTML = "";

  // Botão "Aplicar a todos"
  const applyBar = document.createElement("div");
  applyBar.style.cssText =
    "display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:10px 12px;background:var(--color-background-secondary);border-radius:10px;flex-wrap:wrap";
  applyBar.innerHTML = `
    <span style="font-size:0.82rem;font-weight:600;color:var(--color-text-secondary)">⚡ Aplicar horário a todos os dias:</span>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <input type="time" id="apply-all-abre" style="padding:5px 8px;border:1.5px solid var(--color-border-secondary);border-radius:6px;font-size:0.85rem">
      <span style="font-size:0.8rem;color:var(--color-text-secondary)">→</span>
      <input type="time" id="apply-all-fecha" style="padding:5px 8px;border:1.5px solid var(--color-border-secondary);border-radius:6px;font-size:0.85rem">
      <button onclick="_aplicarHorarioTodos()" class="btn btn-sm btn-primary">Aplicar a todos</button>
    </div>`;
  container.appendChild(applyBar);

  const ICONES_DIA = {
    seg: "☀️",
    ter: "☀️",
    qua: "☀️",
    qui: "☀️",
    sex: "🌟",
    sab: "🎉",
    dom: "🌙",
  };

  DIAS_SEMANA.forEach(({ key, label }) => {
    const dia = horariosSalvos[key] || {
      fechado: false,
      turnos: [{ abre: "", fecha: "" }],
    };
    const fechado = dia.fechado === true;
    const turnos =
      dia.turnos && dia.turnos.length > 0
        ? dia.turnos
        : [{ abre: "", fecha: "" }];

    const row = document.createElement("div");
    row.className = `gs-dia-card ${fechado ? "gs-fechado" : "gs-aberto"}`;
    row.dataset.dia = key;

    let turnosHtml = turnos
      .map(
        (t, i) => `
      <div class="gs-turno-row" data-idx="${i}">
        <span class="gs-turno-label">${i === 0 ? "🕐 Abertura" : "🕑 2º Turno"}</span>
        <div class="gs-turno-inputs">
          <div class="gs-time-group">
            <span class="gs-time-label">Das</span>
            <input type="time" class="gs-time-input turno-abre" value="${t.abre || ""}">
          </div>
          <span class="gs-time-sep">→</span>
          <div class="gs-time-group">
            <span class="gs-time-label">Até</span>
            <input type="time" class="gs-time-input turno-fecha" value="${t.fecha || ""}">
          </div>
          ${i > 0 ? `<button class="gs-btn-rm" onclick="removerTurno(this)" title="Remover turno">✕</button>` : '<div style="width:28px"></div>'}
        </div>
      </div>`,
      )
      .join("");

    row.innerHTML = `
      <div class="gs-dia-header">
        <div class="gs-dia-info">
          <span class="gs-dia-icone">${ICONES_DIA[key] || "📅"}</span>
          <span class="gs-dia-nome">${label}</span>
        </div>
        <div class="gs-dia-controls">
          <span class="gs-status-badge ${fechado ? "gs-badge-fechado" : "gs-badge-aberto"}">
            ${fechado ? "🔴 Fechado" : "🟢 Aberto"}
          </span>
          <label class="gs-toggle-wrap">
            <input type="checkbox" class="dia-fechado-check" ${fechado ? "checked" : ""} onchange="toggleDiaFechado(this)">
            <span class="gs-toggle-slider"></span>
          </label>
        </div>
      </div>
      <div class="gs-dia-turnos" style="${fechado ? "display:none" : ""}">
        <div class="gs-turnos-lista">${turnosHtml}</div>
        <button class="gs-btn-add-turno btn-add-turno" onclick="adicionarTurno(this)">
          <i class="fas fa-plus"></i> Adicionar 2º turno
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

function toggleDiaFechado(checkbox) {
  const row = checkbox.closest(".gs-dia-card");
  const turnos = row.querySelector(".gs-dia-turnos");
  const badge = row.querySelector(".gs-status-badge");
  if (checkbox.checked) {
    if (turnos) turnos.style.display = "none";
    row.classList.add("gs-fechado");
    row.classList.remove("gs-aberto");
    if (badge) {
      badge.textContent = "🔴 Fechado";
      badge.className = "gs-status-badge gs-badge-fechado";
    }
  } else {
    if (turnos) turnos.style.display = "";
    row.classList.add("gs-aberto");
    row.classList.remove("gs-fechado");
    if (badge) {
      badge.textContent = "🟢 Aberto";
      badge.className = "gs-status-badge gs-badge-aberto";
    }
  }
}

function adicionarTurno(btn) {
  const lista = btn.previousElementSibling;
  const idx = lista.querySelectorAll(".gs-turno-row").length;
  if (idx >= 2) {
    alert("Máximo de 2 turnos por dia.");
    return;
  }
  const div = document.createElement("div");
  div.className = "gs-turno-row";
  div.dataset.idx = idx;
  div.innerHTML = `
    <span class="gs-turno-label">🕑 2º Turno</span>
    <div class="gs-turno-inputs">
      <div class="gs-time-group">
        <span class="gs-time-label">Das</span>
        <input type="time" class="gs-time-input turno-abre">
      </div>
      <span class="gs-time-sep">→</span>
      <div class="gs-time-group">
        <span class="gs-time-label">Até</span>
        <input type="time" class="gs-time-input turno-fecha">
      </div>
      <button class="gs-btn-rm btn-rm-turno" onclick="removerTurno(this)" title="Remover turno">✕</button>
    </div>
  `;
  lista.appendChild(div);
}

function removerTurno(btn) {
  btn.closest(".gs-turno-row").remove();
}

function _aplicarHorarioTodos() {
  const abre = document.getElementById("apply-all-abre")?.value;
  const fecha = document.getElementById("apply-all-fecha")?.value;
  if (!abre || !fecha) {
    alert("Preencha os horários de abertura e fechamento.");
    return;
  }
  document.querySelectorAll(".gs-dia-card").forEach((row) => {
    // Desmarca "fechado"
    const check = row.querySelector(".dia-fechado-check");
    if (check && check.checked) {
      check.checked = false;
      toggleDiaFechado(check);
    }
    // Remove turnos extras
    row.querySelectorAll(".gs-turno-row").forEach((t, i) => {
      if (i > 0) t.remove();
    });
    // Define horário do 1º turno
    const turnoAbre = row.querySelector(".turno-abre");
    const turnoFecha = row.querySelector(".turno-fecha");
    if (turnoAbre) turnoAbre.value = abre;
    if (turnoFecha) turnoFecha.value = fecha;
  });
  alert(
    "✅ Horário aplicado a todos os dias. Clique em Salvar para confirmar.",
  );
}

/* ══════════════════════════════════════════════
   SHAKE BUILDER — Tamanhos + Sabores
   ══════════════════════════════════════════════ */
function addShakeTamanho(dados = {}) {
  const lista = document.getElementById("shake-tamanhos-lista");
  if (!lista) return;
  const row = document.createElement("div");
  row.className = "shake-tamanho-row";
  row.style.cssText =
    "display:flex;gap:8px;align-items:center;background:#fff;border:1px solid #dde;border-radius:8px;padding:8px 10px;";
  row.innerHTML = `
    <div style="flex:2">
      <label style="font-size:0.72rem;color:#888">Nome</label>
      <input data-f="snome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: P, M, G, 500ml">
    </div>
    <div style="flex:1">
      <label style="font-size:0.72rem;color:#888">Volume (ml)</label>
      <input data-f="sml" type="number" class="form-control" value="${dados.ml || ""}" placeholder="400">
    </div>
    <div style="flex:2">
      <label style="font-size:0.72rem;color:#888">Preço (Gs)</label>
      <input data-f="spreco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="15000">
    </div>
    <button onclick="this.closest('.shake-tamanho-row').remove()" style="background:none;border:none;color:#e74c3c;font-size:1.2rem;cursor:pointer;padding:0 4px;flex-shrink:0">✕</button>
  `;
  lista.appendChild(row);
}

function addShakeSabor(dados = {}) {
  const lista = document.getElementById("shake-sabores-lista");
  if (!lista) return;
  const row = document.createElement("div");
  row.className = "shake-sabor-row";
  row.style.cssText =
    "display:flex;gap:8px;align-items:center;background:#fff;border:1px solid #dde;border-radius:8px;padding:8px 10px;";
  row.innerHTML = `
    <div style="flex:3">
      <label style="font-size:0.72rem;color:#888">Sabor</label>
      <input data-f="snome" class="form-control" value="${dados.nome || ""}" placeholder="Ex: Morango, Chocolate">
    </div>
    <div style="flex:2">
      <label style="font-size:0.72rem;color:#888">Preço extra (Gs)</label>
      <input data-f="spreco" type="number" class="form-control" value="${dados.preco || ""}" placeholder="0">
    </div>
    <div style="flex:2">
      <label style="font-size:0.72rem;color:#888">URL Foto (opcional)</label>
      <input data-f="simg" class="form-control" value="${dados.img || ""}" placeholder="https://...">
    </div>
    <button onclick="this.closest('.shake-sabor-row').remove()" style="background:none;border:none;color:#e74c3c;font-size:1.2rem;cursor:pointer;padding:0 4px;flex-shrink:0">✕</button>
  `;
  lista.appendChild(row);
}

function _popularShakeBuilder(shakeConfig) {
  document.getElementById("shake-tamanhos-lista").innerHTML = "";
  document.getElementById("shake-sabores-lista").innerHTML = "";
  if (!shakeConfig) return;
  (shakeConfig.tamanhos || []).forEach((t) => addShakeTamanho(t));
  (shakeConfig.sabores || []).forEach((s) => addShakeSabor(s));
}

function _lerGradeSemanal() {
  const horarios = {};
  document.querySelectorAll(".gs-dia-card").forEach((row) => {
    const key = row.dataset.dia;
    const fechado = row.querySelector(".dia-fechado-check").checked;
    const turnos = [];
    row.querySelectorAll(".gs-turno-row").forEach((t) => {
      const abre = t.querySelector(".turno-abre").value;
      const fecha = t.querySelector(".turno-fecha").value;
      if (abre || fecha) turnos.push({ abre, fecha });
    });
    horarios[key] = {
      fechado,
      turnos: fechado ? [] : turnos.length ? turnos : [{ abre: "", fecha: "" }],
    };
  });
  return horarios;
}

async function carregarConfiguracoes() {
  // Gestão de cupons: apenas dono, gerente e adminMaster
  const _cardCupons = document.getElementById("card-cupons-cfg");
  if (_cardCupons)
    _cardCupons.style.display = ["dono", "gerente", "adminMaster"].includes(
      perfilUsuario,
    )
      ? ""
      : "none";

  // Painel adminMaster
  const _cardAM = document.getElementById("card-adminmaster-cfg");
  if (_cardAM) {
    _cardAM.style.display = perfilUsuario === "adminMaster" ? "" : "none";
    if (perfilUsuario === "adminMaster") renderPainelFeatures();
  }

  const { data } = await supa.from("configuracoes").select("*").maybeSingle();
  _renderGradeSemanal((data && data.horarios_semanais) || {});
  _renderTabelaFrete((data && data.tabela_frete) || null);
  if (!data) return;

  const s = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };
  // Operação
  s("cfg-aberta", data.loja_aberta ? "true" : "false");
  s("cfg-cotacao", data.cotacao_real);

  // Identidade da loja
  s("cfg-nome-restaurante", data.nome_restaurante);
  s("cfg-descricao-loja", data.descricao_loja);
  s("cfg-url-loja", data.url_loja);
  s("cfg-telefone-loja", data.telefone_loja);
  s("cfg-whatsapp-loja", data.whatsapp_loja);
  s("cfg-logo-url", data.logo_url || data.icone_url);

  // Pagamento
  s("cfg-chave-pix", data.chave_pix);
  s("cfg-nome-pix", data.nome_pix);
  s("cfg-dados-alias", data.dados_alias);
  s("cfg-nome-alias", data.nome_alias);

  // Localização
  s("cfg-coord-lat", data.coord_lat);
  s("cfg-coord-lng", data.coord_lng);

  // Banner 1
  s("cfg-banner-id", data.banner_produto_id || "");
  s("cfg-banner-img", data.banner_imagem || "");
  s("cfg-banner-desc-tipo", data.banner_desconto_tipo || "percentual");
  s("cfg-banner-desc-valor", data.banner_desconto_valor ?? "");
  if (data.banner_imagem) {
    const prev = document.getElementById("cfg-banner-preview");
    const box = document.getElementById("cfg-banner-preview-box");
    if (prev) prev.src = data.banner_imagem;
    if (box) box.style.display = "block";
  }
  // Banner 2
  s("cfg-banner2-id", data.banner2_produto_id || "");
  s("cfg-banner2-img", data.banner2_imagem || "");
  s("cfg-banner2-desc-tipo", data.banner2_desconto_tipo || "percentual");
  s("cfg-banner2-desc-valor", data.banner2_desconto_valor ?? "");
  if (data.banner2_imagem) {
    const prev2 = document.getElementById("cfg-banner2-preview");
    const box2 = document.getElementById("cfg-banner2-preview-box");
    if (prev2) prev2.src = data.banner2_imagem;
    if (box2) box2.style.display = "block";
  }

  // Visual
  const sc = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  };
  sc("cfg-nome-loja", data.nome_restaurante || data.nome_loja);
  sc("cfg-cor-primaria", data.cor_primaria);
  sc("cfg-cor-primaria-hex", data.cor_primaria);

  const corPicker = document.getElementById("cfg-cor-primaria");
  const corHex = document.getElementById("cfg-cor-primaria-hex");
  if (corPicker && corHex) {
    corPicker.addEventListener("input", (e) => {
      corHex.value = e.target.value;
    });
    corHex.addEventListener("input", (e) => {
      if (e.target.value.startsWith("#") && e.target.value.length === 7)
        corPicker.value = e.target.value;
    });
  }

  const iconeUrlInput = document.getElementById("cfg-icone-url");
  const iconePreview = document.getElementById("cfg-icone-preview");
  const logoVal = data.logo_url || data.icone_url || "";
  if (iconeUrlInput) iconeUrlInput.value = logoVal;
  if (iconePreview && logoVal) {
    iconePreview.src = logoVal;
    iconePreview.style.display = "block";
  }

  // Globals
  if (data.nome_restaurante) NOME_RESTAURANTE = data.nome_restaurante;
  if (data.whatsapp_loja) WHATSAPP_LOJA_CFG = data.whatsapp_loja;
  if (data.coord_lat) COORD_LOJA.lat = parseFloat(data.coord_lat);
  if (data.coord_lng) COORD_LOJA.lng = parseFloat(data.coord_lng);
  if (data.chave_pix) CHAVE_PIX_CFG = data.chave_pix;
  if (data.nome_pix) NOME_PIX_CFG = data.nome_pix;
  if (data.dados_alias) DADOS_ALIAS_CFG = data.dados_alias;
  if (data.nome_alias) NOME_ALIAS_CFG = data.nome_alias;

  await carregarExtrasGlobaisAdmin();
  await _carregarMaquininhas();

  // Limite de distância e maquininhas
  s("cfg-limite-distancia", data.limite_distancia_km ?? "");
  s("cfg-taxa-motoboy-base", data.taxa_motoboy_base ?? 0);
  TAXA_MOTOBOY = data.taxa_motoboy_base ?? 0;
  const combEl = document.getElementById("cfg-combustivel");
  if (combEl) {
    const saved = data.ajuda_combustivel ?? 0;
    combEl.value = saved;
    AJUDA_COMBUSTIVEL = saved;
  }
}

async function salvarConfiguracoes() {
  const g = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : null;
  };
  const dados = {
    loja_aberta: g("cfg-aberta") === "true",
    cotacao_real: parseFloat(g("cfg-cotacao")) || 1100,
    banner_produto_id: parseInt(g("cfg-banner-id")) || null,
    banner_imagem: g("cfg-banner-img") || "",
    banner_desconto_tipo: g("cfg-banner-desc-tipo") || null,
    banner_desconto_valor: parseFloat(g("cfg-banner-desc-valor")) || null,
    banner2_produto_id: parseInt(g("cfg-banner2-id")) || null,
    banner2_imagem: g("cfg-banner2-img") || "",
    banner2_desconto_tipo: g("cfg-banner2-desc-tipo") || null,
    banner2_desconto_valor: parseFloat(g("cfg-banner2-desc-valor")) || null,
    horarios_semanais: _lerGradeSemanal(),
    // Identidade
    nome_restaurante: g("cfg-nome-restaurante") || "",
    descricao_loja: g("cfg-descricao-loja") || "",
    url_loja: g("cfg-url-loja") || "",
    telefone_loja: g("cfg-telefone-loja") || "",
    whatsapp_loja: (g("cfg-whatsapp-loja") || "").replace(/\D/g, ""),
    logo_url: g("cfg-logo-url") || "",
    icone_url: g("cfg-logo-url") || "",
    // Pagamento
    chave_pix: g("cfg-chave-pix") || "",
    nome_pix: g("cfg-nome-pix") || "",
    dados_alias: g("cfg-dados-alias") || "",
    nome_alias: g("cfg-nome-alias") || "",
    // Localização
    coord_lat: parseFloat(g("cfg-coord-lat")) || 0,
    coord_lng: parseFloat(g("cfg-coord-lng")) || 0,
    // Motoboy
    taxa_motoboy_base: parseInt(g("cfg-taxa-motoboy-base")) || 0,
    // Visual
    cor_primaria: g("cfg-cor-primaria") || "#1a7a2e",
  };

  // Aplica globals imediatamente
  NOME_RESTAURANTE = dados.nome_restaurante;
  WHATSAPP_LOJA_CFG = dados.whatsapp_loja;
  COORD_LOJA.lat = dados.coord_lat;
  COORD_LOJA.lng = dados.coord_lng;
  TAXA_MOTOBOY = dados.taxa_motoboy_base;
  CHAVE_PIX_CFG = dados.chave_pix;
  NOME_PIX_CFG = dados.nome_pix;
  DADOS_ALIAS_CFG = dados.dados_alias;
  NOME_ALIAS_CFG = dados.nome_alias;

  const { error } = await supa.from("configuracoes").update(dados).gt("id", 0);
  if (error) alert("Erro: " + error.message);
  else alert(t("alert.cfg_salvas"));
}

function previewBanner(input, num = 1) {
  if (!input.files || !input.files[0]) return;
  const suf = num === 2 ? "2" : "";
  const reader = new FileReader();
  reader.onload = (e) => {
    const prev = document.getElementById(`cfg-banner${suf}-preview`);
    const box = document.getElementById(`cfg-banner${suf}-preview-box`);
    if (prev) prev.src = e.target.result;
    if (box) box.style.display = "block";
  };
  reader.readAsDataURL(input.files[0]);
}

async function salvarBanner(num = 1) {
  const suf = num === 2 ? "2" : "";
  const fileInput = document.getElementById(`cfg-banner${suf}-file`);
  const prodId = document.getElementById(`cfg-banner${suf}-id`)?.value?.trim();
  const descTipo =
    document.getElementById(`cfg-banner${suf}-desc-tipo`)?.value || null;
  const descValor =
    parseFloat(document.getElementById(`cfg-banner${suf}-desc-valor`)?.value) ||
    null;

  if (!prodId) {
    alert("Informe o ID do produto para o banner.");
    return;
  }

  const btn = event.target;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  btn.disabled = true;

  try {
    let urlFinal = document.getElementById(`cfg-banner${suf}-img`)?.value || "";

    if (fileInput?.files?.length) {
      const file = fileInput.files[0];
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando imagem...';
      // ── Upload para o Cloudinary (substitui Supabase Storage) ──
      try {
        urlFinal = await uploadImageToCloudinary(file);
      } catch (uploadErr) {
        alert("❌ Falha no upload do banner: " + uploadErr.message + "\nO banner não foi salvo.");
        return;
      }
    }

    if (!urlFinal) {
      alert("Selecione uma foto ou informe a URL do banner.");
      return;
    }

    const updateData = {};
    updateData[`banner${suf}_imagem`] = urlFinal;
    updateData[`banner${suf}_produto_id`] = parseInt(prodId) || null;
    updateData[`banner${suf}_desconto_tipo`] = descValor ? descTipo : null;
    updateData[`banner${suf}_desconto_valor`] = descValor || null;

    await supa.from("configuracoes").update(updateData).gt("id", 0);

    const imgEl = document.getElementById(`cfg-banner${suf}-img`);
    const prevEl = document.getElementById(`cfg-banner${suf}-preview`);
    const boxEl = document.getElementById(`cfg-banner${suf}-preview-box`);
    if (imgEl) imgEl.value = urlFinal;
    if (prevEl) prevEl.src = urlFinal;
    if (boxEl) boxEl.style.display = "block";

    alert(`✅ Banner ${num} ativado!`);
  } catch (e) {
    alert("Erro: " + e.message);
  } finally {
    btn.innerHTML = '<i class="fas fa-upload"></i> Salvar Banner';
    btn.disabled = false;
  }
}
function previewIcone(input) {
  const file = input.files?.[0];
  const prev = document.getElementById("cfg-icone-preview");
  const box = document.getElementById("cfg-icone-preview-box");
  if (!prev) return;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      prev.src = e.target.result;
      if (box) box.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    if (box) box.style.display = "none";
  }
}

// =========================================================
// TABELA DE FRETE
// =========================================================
const FRETE_FAIXAS = [
  { label: "0 – 1 km", max: 1.0 },
  { label: "1,1 – 2 km", max: 2.0 },
  { label: "2,1 – 3 km", max: 3.0 },
  { label: "3,1 – 4 km", max: 4.0 },
  { label: "4,1 – 5 km", max: 5.0 },
  { label: "5,1 – 6 km", max: 6.0 },
  { label: "6,1 – 7 km", max: 7.0 },
  { label: "7,1 – 8 km", max: 8.0 },
  { label: "8,1 – 9 km", max: 9.0 },
  { label: "9,1 – 10 km", max: 10.0 },
  { label: "10,1 – 11 km", max: 11.0 },
  { label: "11,1 – 12 km", max: 12.0 },
  { label: "12,1 – 13 km", max: 13.0 },
  { label: "13,1 – 14 km", max: 14.0 },
  { label: "14,1 – 15 km", max: 15.0 },
  { label: "15,1 – 16 km", max: 16.0 },
  { label: "16,1 – 17 km", max: 17.0 },
  { label: "17,1 – 18 km", max: 18.0 },
  { label: "18,1 – 19 km", max: 19.0 },
  { label: "19,1 – 20 km", max: 20.0 },
];

function _renderTabelaFrete(savedData) {
  const tbody = document.getElementById("tabela-frete-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  FRETE_FAIXAS.forEach((faixa, idx) => {
    const saved = (savedData && savedData[idx]) || {};
    const valLoja = saved.loja ?? "";
    const valMoto = saved.motoboy ?? "";
    const aCombinar = saved.acombinar === true;
    const bg =
      idx % 2 === 0
        ? "var(--color-background-primary)"
        : "var(--color-background-secondary)";
    const rowStyle = aCombinar ? "opacity:0.6" : "";
    tbody.innerHTML += `
      <tr style="background:${bg};${rowStyle}" id="frete-row-${idx}">
        <td style="padding:8px;font-weight:600;white-space:nowrap;font-size:0.85rem">${faixa.label}</td>
        <td style="padding:6px;text-align:center">
          <input type="number" class="form-control frete-loja" data-idx="${idx}"
                 value="${aCombinar ? "" : valLoja}" placeholder="0" min="0" step="1000"
                 ${aCombinar ? "disabled" : ""}
                 style="text-align:center;max-width:120px;margin:0 auto;border:1.5px solid #2980b9;${aCombinar ? "opacity:0.4" : ""}">
        </td>
        <td style="padding:6px;text-align:center">
          <input type="number" class="form-control frete-motoboy" data-idx="${idx}"
                 value="${aCombinar ? "" : valMoto}" placeholder="0" min="0" step="1000"
                 ${aCombinar ? "disabled" : ""}
                 style="text-align:center;max-width:120px;margin:0 auto;border:1.5px solid #27ae60;${aCombinar ? "opacity:0.4" : ""}">
        </td>
        <td style="padding:6px;text-align:center">
          <label style="display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;font-size:0.78rem;color:${aCombinar ? "#e67e22" : "#aaa"}">
            <input type="checkbox" class="frete-acombinar" data-idx="${idx}" ${aCombinar ? "checked" : ""}
              onchange="_toggleFreteRow(${idx}, this.checked)"
              style="width:15px;height:15px">
            Combinar
          </label>
        </td>
      </tr>`;
  });
}

function _toggleFreteRow(idx, acombinar) {
  const row = document.getElementById(`frete-row-${idx}`);
  if (!row) return;
  const lojaInp = row.querySelector(".frete-loja");
  const motoInp = row.querySelector(".frete-motoboy");
  const lbl = row.querySelector("label");
  row.style.opacity = acombinar ? "0.6" : "1";
  if (lojaInp) {
    lojaInp.disabled = acombinar;
    lojaInp.style.opacity = acombinar ? "0.4" : "1";
    if (acombinar) lojaInp.value = "";
  }
  if (motoInp) {
    motoInp.disabled = acombinar;
    motoInp.style.opacity = acombinar ? "0.4" : "1";
    if (acombinar) motoInp.value = "";
  }
  if (lbl) lbl.style.color = acombinar ? "#e67e22" : "#aaa";
}

async function salvarTabelaFrete() {
  const tabela = [];
  FRETE_FAIXAS.forEach((_, idx) => {
    const acombinar =
      document.querySelector(`.frete-acombinar[data-idx="${idx}"]`)?.checked ||
      false;
    const loja = acombinar
      ? 0
      : parseInt(
          document.querySelector(`.frete-loja[data-idx="${idx}"]`)?.value,
        ) || 0;
    const motoboy = acombinar
      ? 0
      : parseInt(
          document.querySelector(`.frete-motoboy[data-idx="${idx}"]`)?.value,
        ) || 0;
    tabela.push({ loja, motoboy, acombinar });
  });

  const novoCombus =
    parseInt(document.getElementById("cfg-combustivel")?.value) || 0;
  const novoMotoBase =
    parseInt(document.getElementById("cfg-taxa-motoboy-base")?.value) || 0;
  const limiteKm =
    parseFloat(document.getElementById("cfg-limite-distancia")?.value) || null;
  AJUDA_COMBUSTIVEL = novoCombus;
  TAXA_MOTOBOY = novoMotoBase;

  const updateData = {
    tabela_frete: tabela,
    ajuda_combustivel: novoCombus,
    taxa_motoboy_base: novoMotoBase,
  };
  if (limiteKm) updateData.limite_distancia_km = limiteKm;
  else updateData.limite_distancia_km = null;

  const { error } = await supa
    .from("configuracoes")
    .update(updateData)
    .gt("id", 0);
  if (error) {
    alert("Erro ao salvar: " + error.message);
    return;
  }
  TABELA_FRETE_ADMIN = tabela;
  alert(t("alert.frete_salvo"));
}

// ── MAQUININHAS DE CARTÃO ─────────────────────────────────────────
async function _carregarMaquininhas() {
  const container = document.getElementById("maquininhas-lista");
  if (!container) return;
  const { data } = await supa
    .from("configuracoes")
    .select("maquininhas_cartao")
    .maybeSingle();
  const lista = data?.maquininhas_cartao || [];
  container.innerHTML = "";
  if (!lista.length) {
    container.innerHTML =
      '<p style="color:var(--color-text-secondary);font-size:0.82rem;padding:8px 0">Nenhuma maquininha cadastrada.</p>';
    return;
  }
  lista.forEach((m, idx) => _renderMaquininha(m, idx, container));
}

function _renderMaquininha(m, idx, container) {
  const row = document.createElement("div");
  row.className = "maquininha-row";
  row.style.cssText =
    "background:var(--color-background-secondary);border:1px solid var(--color-border-tertiary);border-radius:10px;padding:12px;margin-bottom:8px";
  row.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-weight:700;font-size:0.9rem">${m.nome || "Maquininha " + (idx + 1)}</span>
      <button onclick="this.closest('.maquininha-row').remove()" style="background:none;border:none;color:#e74c3c;font-size:1rem;cursor:pointer">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;font-size:0.82rem">
      <div><label style="font-size:0.72rem;color:var(--color-text-secondary)">Nome/Operadora</label>
        <input class="form-control maq-nome" value="${m.nome || ""}" placeholder="Ex: Cielo, Rede, Sicredi"></div>
      <div><label style="font-size:0.72rem;color:var(--color-text-secondary)">Débito (%)</label>
        <input type="number" class="form-control maq-debito" value="${m.taxas?.debito ?? ""}" placeholder="1.5" min="0" step="0.01"></div>
      <div><label style="font-size:0.72rem;color:var(--color-text-secondary)">Crédito (%)</label>
        <input type="number" class="form-control maq-credito" value="${m.taxas?.credito ?? ""}" placeholder="2.5" min="0" step="0.01"></div>
      <div><label style="font-size:0.72rem;color:var(--color-text-secondary)">Parcelado (%)</label>
        <input type="number" class="form-control maq-parcelado" value="${m.taxas?.parcelado ?? ""}" placeholder="3.0" min="0" step="0.01"></div>
      <div><label style="font-size:0.72rem;color:var(--color-text-secondary)">PIX (%)</label>
        <input type="number" class="form-control maq-pix" value="${m.taxas?.pix ?? ""}" placeholder="0.99" min="0" step="0.01"></div>
    </div>`;
  container.appendChild(row);
}

function adicionarMaquininha() {
  const container = document.getElementById("maquininhas-lista");
  if (!container) return;
  const p = container.querySelector("p");
  if (p) p.remove();
  _renderMaquininha(
    {},
    container.querySelectorAll(".maquininha-row").length,
    container,
  );
}

async function salvarMaquininhas() {
  const maquininhas = [];
  document
    .querySelectorAll("#maquininhas-lista .maquininha-row")
    .forEach((row) => {
      const nome = row.querySelector(".maq-nome")?.value.trim() || "";
      if (!nome) return;
      maquininhas.push({
        nome,
        taxas: {
          debito: parseFloat(row.querySelector(".maq-debito")?.value) || 0,
          credito: parseFloat(row.querySelector(".maq-credito")?.value) || 0,
          parcelado:
            parseFloat(row.querySelector(".maq-parcelado")?.value) || 0,
          pix: parseFloat(row.querySelector(".maq-pix")?.value) || 0,
        },
      });
    });
  const { error } = await supa
    .from("configuracoes")
    .update({ maquininhas_cartao: maquininhas })
    .gt("id", 0);
  if (error) {
    alert("Erro: " + error.message);
    return;
  }
  alert("✅ Maquininhas salvas!");
}

async function salvarPersonalizacao() {
  const btn = event.target;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
  btn.disabled = true;

  try {
    const dados = {};
    const nomeLoja =
      document.getElementById("cfg-nome-restaurante")?.value?.trim() ||
      document.getElementById("cfg-nome-loja")?.value?.trim();
    const corHex =
      document.getElementById("cfg-cor-primaria-hex")?.value ||
      document.getElementById("cfg-cor-primaria")?.value;
    const logoUrl = document.getElementById("cfg-logo-url")?.value?.trim();

    if (nomeLoja) {
      dados.nome_restaurante = nomeLoja;
    }
    if (corHex && corHex.startsWith("#")) dados.cor_primaria = corHex;
    if (logoUrl) {
      dados.logo_url = logoUrl;
      dados.icone_url = logoUrl;
    }

    // Upload do ícone se houver arquivo selecionado
    const iconeFile = document.getElementById("cfg-icone-file")?.files?.[0];
    if (iconeFile) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando ícone...';
      // ── Upload para o Cloudinary (substitui Supabase Storage) ──
      let iconeUrl;
      try {
        iconeUrl = await uploadImageToCloudinary(iconeFile);
      } catch (uploadErr) {
        alert("❌ Falha no upload do ícone: " + uploadErr.message + "\nA personalização não foi salva.");
        return;
      }
      dados.icone_url = iconeUrl;
      dados.logo_url = iconeUrl;
      // Atualiza preview
      const prev = document.getElementById("cfg-icone-preview");
      const box = document.getElementById("cfg-icone-preview-box");
      if (prev) {
        prev.src = iconeUrl;
      }
      if (box) {
        box.style.display = "block";
      }
      // Preenche campo URL
      const urlInp = document.getElementById("cfg-logo-url");
      if (urlInp) urlInp.value = iconeUrl;
    }

    if (Object.keys(dados).length > 0) {
      const { error } = await supa
        .from("configuracoes")
        .update(dados)
        .gt("id", 0);
      if (error) throw error;
    }
    if (dados.nome_restaurante) NOME_RESTAURANTE = dados.nome_restaurante;
    alert(
      "✅ Personalização salva! Recarregue o cardápio para ver as mudanças.",
    );
  } catch (e) {
    alert("Erro: " + e.message);
  } finally {
    btn.innerHTML = '<i class="fas fa-paint-brush"></i> Salvar Personalização';
    btn.disabled = false;
  }
}

// ── Upload de logo direto da seção Identidade ────────────────────
async function _uploadLogoIdentidade(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const btn = input.closest("label");
  const originalHtml = btn ? btn.innerHTML : "";
  if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

  try {
    // ── Upload para o Cloudinary (substitui Supabase Storage) ──
    const url = await uploadImageToCloudinary(file);

    // Preenche o campo de URL de texto
    const urlInput = document.getElementById("cfg-logo-url");
    if (urlInput) urlInput.value = url;

    // Mostra preview
    const preview = document.getElementById("cfg-logo-preview-identidade");
    const img = document.getElementById("cfg-logo-img-identidade");
    if (img) img.src = url;
    if (preview) preview.style.display = "block";
  } catch (e) {
    alert("Erro ao enviar imagem: " + e.message);
  } finally {
    if (btn) btn.innerHTML = originalHtml;
  }
}

async function carregarDashboard() {
  // Saudação dinâmica
  const hora = new Date().getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const elGreet = document.getElementById("dash-greeting");
  if (elGreet) elGreet.textContent = saudacao + " 👋";

  const elDate = document.getElementById("dash-date");
  if (elDate)
    elDate.textContent = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const hoje = new Date().toISOString().split("T")[0];

  // Bug corrigido: filtrar só "entregue" excluía vendas de balcão e PDV.
  // KPI de vendas agora soma todos os pedidos não cancelados do dia.
  const { data: pedidos } = await supa
    .from("pedidos")
    .select("*")
    .gte("created_at", hoje)
    .not("status", "eq", "cancelado");
  const total = pedidos
    ? pedidos.reduce((a, b) => a + (b.total_geral || 0), 0)
    : 0;

  // Pedidos em preparo
  const { count: emPreparo } = await supa
    .from("pedidos")
    .select("*", { count: "exact", head: true })
    .eq("status", "em_preparo");

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.innerText = v;
  };
  setVal("kpi-vendas", `Gs ${total.toLocaleString("es-PY")}`);
  setVal("kpi-pedidos", pedidos ? pedidos.length : 0);

  // Bug #8 corrigido: soma frete_motoboy real de cada delivery.
  // Antes multiplicava TAXA_MOTOBOY × total de pedidos, incluindo balcão e retirada.
  const custoMotoReal = (pedidos || [])
    .filter((p) => p.tipo_entrega === "delivery")
    .reduce((acc, p) => acc + (Number(p.frete_motoboy) || TAXA_MOTOBOY || 0), 0);
  const qtdMotoboyUnicos = new Set(
    (pedidos || [])
      .filter((p) => p.tipo_entrega === "delivery" && p.motoboy_id)
      .map((p) => p.motoboy_id),
  ).size;
  const custoMotoTotal = custoMotoReal + (AJUDA_COMBUSTIVEL || 0) * (qtdMotoboyUnicos || 0);
  setVal("kpi-moto", `Gs ${custoMotoTotal.toLocaleString("es-PY")}`);
  setVal("kpi-em-preparo", emPreparo || 0);

  // === RANKING PRODUTOS ===
  await carregarRankingProdutos();

  // === RANKING CLIENTES ===
  await carregarRankingClientes();

  // (tabela legada removida)
}

// ══════════════════════════════════════════════════════════
// RANKING PRODUTOS com filtro de período
// ══════════════════════════════════════════════════════════
async function carregarRankingProdutos() {
  const sel = document.getElementById("rank-prod-periodo");
  const periodo = sel ? sel.value : "hoje";
  const customBox = document.getElementById("rank-prod-custom");
  if (customBox)
    customBox.style.display = periodo === "custom" ? "flex" : "none";
  const { inicio, fim } = _calcularIntervalo(
    periodo,
    "rank-prod-inicio",
    "rank-prod-fim",
  );

  // Bug #3 corrigido: inclui todos os pedidos não cancelados.
  // Filtrar só "entregue" excluía todas as vendas de balcão/PDV.
  let query = supa.from("pedidos").select("itens").not("status", "eq", "cancelado");
  if (inicio) query = query.gte("created_at", inicio);
  if (fim) query = query.lte("created_at", fim);
  const { data } = await query;

  const cnt = {};
  (data || []).forEach((ped) => {
    (Array.isArray(ped.itens) ? ped.itens : []).forEach((item) => {
      const n = item.nome || item.n || "Produto";
      const q = parseInt(item.qtd || item.q || 1);
      cnt[n] = (cnt[n] || 0) + q;
    });
  });
  const ranking = Object.entries(cnt)
    .map(([nome, v]) => ({ nome, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 8);

  const el = document.getElementById("ranking-produtos-list");
  if (!el) return;
  if (!ranking.length) {
    el.innerHTML = '<div class="rank-vazio">Nenhuma venda no período</div>';
    return;
  }
  el.innerHTML = "";
  const max = ranking[0].v;
  ranking.forEach((p, i) => {
    const pct = Math.round((p.v / max) * 100);
    el.innerHTML += `<div class="rank-item">
      <div class="rank-pos rank-pos-${i + 1}">${i + 1}</div>
      <div class="rank-info">
        <div class="rank-name">${p.nome}</div>
        <div class="rank-bar-wrap"><div class="rank-bar" style="width:${pct}%"></div></div>
      </div>
      <div class="rank-val">${p.v}</div>
    </div>`;
  });
}

// ══════════════════════════════════════════════════════════
// RANKING CLIENTES com filtro de período + limpeza de "MESA X -"
// ══════════════════════════════════════════════════════════
async function carregarRankingClientes() {
  const sel = document.getElementById("rank-cli-periodo");
  const periodo = sel ? sel.value : "tudo";
  const customBox = document.getElementById("rank-cli-custom");
  if (customBox)
    customBox.style.display = periodo === "custom" ? "flex" : "none";
  const { inicio, fim } = _calcularIntervalo(
    periodo,
    "rank-cli-inicio",
    "rank-cli-fim",
  );

  // Bug #4 corrigido: inclui todos os pedidos não cancelados.
  let query = supa
    .from("pedidos")
    .select("cliente_nome, cliente_telefone, total_geral")
    .not("status", "eq", "cancelado")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (inicio) query = query.gte("created_at", inicio);
  if (fim) query = query.lte("created_at", fim);
  const { data } = await query;

  const map = {};
  (data || []).forEach((p) => {
    const nomeLimpo =
      (p.cliente_nome || "").replace(/^MESA\s+\d+\s*-\s*/i, "").trim() ||
      "Cliente";
    const tel = (p.cliente_telefone || "").trim();
    if (nomeLimpo === "Cliente" && tel.length < 5) return;
    const key = tel.length > 5 ? tel : "nome:" + nomeLimpo;
    if (!map[key]) map[key] = { nome: nomeLimpo, tel, qtd: 0, total: 0 };
    else if (nomeLimpo !== "Cliente" && map[key].nome === "Cliente")
      map[key].nome = nomeLimpo;
    map[key].qtd++;
    map[key].total += p.total_geral || 0;
  });

  const top = Object.values(map)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 8);
  const el = document.getElementById("ranking-clientes-list");
  if (!el) return;
  if (!top.length) {
    el.innerHTML = '<div class="rank-vazio">Nenhum cliente no período</div>';
    return;
  }
  el.innerHTML = "";
  const max = top[0].qtd;
  top.forEach((c, i) => {
    const pct = Math.round((c.qtd / max) * 100);
    el.innerHTML += `<div class="rank-item">
      <div class="rank-pos rank-pos-${i + 1}">${i + 1}</div>
      <div class="rank-info">
        <div class="rank-name">${c.nome}</div>
        ${c.tel ? `<div class="rank-sub"><i class="fas fa-phone"></i> ${c.tel}</div>` : ""}
        <div class="rank-bar-wrap"><div class="rank-bar rank-bar-purple" style="width:${pct}%"></div></div>
      </div>
      <div class="rank-val">${c.qtd}x</div>
    </div>`;
  });
}

// Utilitário: datas para os rankings
function _calcularIntervalo(periodo, idI, idF) {
  const now    = new Date();
  const _tz    = 3 * 60 * 60 * 1000; // UTC-3 PY permanente desde Lei 7189/2024
  const hojeYMD = new Date(now.getTime() - _tz).toISOString().split("T")[0]; // data PY, não UTC
  let inicio = null, fim = null;

  if (periodo === "hoje") {
    inicio = hojeYMD + "T00:00:00-03:00";
  } else if (periodo === "7") {
    const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    inicio = new Date(d.getTime() - _tz).toISOString().split("T")[0] + "T00:00:00-03:00";
  } else if (periodo === "30") {
    const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    inicio = new Date(d.getTime() - _tz).toISOString().split("T")[0] + "T00:00:00-03:00";
  } else if (periodo === "mes") {
    const ymd = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
    inicio = ymd + "T00:00:00-03:00";
  } else if (periodo === "custom") {
    const elI = document.getElementById(idI);
    const elF = document.getElementById(idF);
    if (elI?.value) inicio = elI.value + "T00:00:00-03:00";
    if (elF?.value) fim    = elF.value + "T23:59:59-03:00";
  }
  return { inicio, fim };
}

// ══════════════════════════════════════════════════════════
// PDV MOBILE — Tabs de navegação
// ══════════════════════════════════════════════════════════
function pdvMudarAba(aba, btn) {
  localStorage.setItem("app_pdv_aba", aba);
  document
    .querySelectorAll(".pdv-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  // Hide all panels, show the selected one
  document
    .querySelectorAll(".pdv-tab-panel")
    .forEach((el) => el.classList.remove("pdv-tab-active"));

  if (aba === "produtos") {
    document
      .getElementById("pdv-panel-produtos")
      ?.classList.add("pdv-tab-active");
  } else if (aba === "carrinho") {
    document
      .getElementById("pdv-panel-carrinho")
      ?.classList.add("pdv-tab-active");
  } else if (aba === "monitor") {
    // On mobile: show the mesas panel instead
    const panelMesas = document.getElementById("pdv-panel-mesas");
    const panelVenda = document.getElementById("pdv-panel-venda");
    if (panelMesas && window.innerWidth <= 768) {
      panelVenda.style.display = "none";
      panelMesas.style.display = "";
    } else {
      document
        .getElementById("pdv-panel-monitor")
        ?.classList.add("pdv-tab-active");
    }
  }
}

function pdvMudarView(view) {
  const panelVenda = document.getElementById("pdv-panel-venda");
  const panelMesas = document.getElementById("pdv-panel-mesas");
  const btnVenda = document.getElementById("pdv-view-btn-venda");
  const btnMesas = document.getElementById("pdv-view-btn-mesas");
  if (view === "venda") {
    if (panelVenda) panelVenda.style.display = "block";
    if (panelMesas) panelMesas.style.display = "none";
    if (btnVenda) btnVenda.classList.add("active");
    if (btnMesas) btnMesas.classList.remove("active");
  } else {
    if (panelVenda) panelVenda.style.display = "none";
    if (panelMesas) panelMesas.style.display = "block";
    if (btnVenda) btnVenda.classList.remove("active");
    if (btnMesas) btnMesas.classList.add("active");
    carregarMonitorMesas();
  }
}

function pdvIniciarTabs() {
  const isMobile = window.innerWidth <= 768;
  const tabsEl = document.getElementById("pdv-tabs");
  const footer = document.getElementById("pdv-mobile-footer");
  const headerBar = document.querySelector(".pdv-header-bar .pdv-view-btns");

  if (isMobile) {
    if (tabsEl) tabsEl.style.display = "flex";
    if (footer) footer.style.display = "flex";
    if (headerBar) headerBar.style.display = "none";
    // Mobile começa mostrando o cardápio
    document
      .querySelectorAll(".pdv-tab-btn")
      .forEach((b) => b.classList.remove("active"));

    const savedPdvAba = localStorage.getItem("app_pdv_aba") || "produtos";
    let activeBtn = null;
    if (tabsEl) {
      if (savedPdvAba === "produtos")
        activeBtn = tabsEl.querySelector(".pdv-tab-btn:nth-child(1)");
      else if (savedPdvAba === "carrinho")
        activeBtn = tabsEl.querySelector(".pdv-tab-btn:nth-child(2)");
      else if (savedPdvAba === "mesas")
        activeBtn = tabsEl.querySelector(".pdv-tab-btn:nth-child(3)");
    }
    pdvMudarAba(savedPdvAba, activeBtn);
  } else {
    if (tabsEl) tabsEl.style.display = "none";
    if (footer) footer.style.display = "none";
    if (headerBar) headerBar.style.display = "flex";
    // Desktop: mostra produtos e carrinho sempre
    [".pdv-carrinho", ".pdv-produtos"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.classList.add("pdv-tab-active");
    });
    const panelVenda = document.getElementById("pdv-panel-venda");
    if (panelVenda) panelVenda.style.display = "block";
  }
}

async function logout() {
  const { error } = await supa.auth.signOut();
  if (error) alert("Erro ao sair: " + error.message);
  else window.location.href = "login.html";
}

// ─────────────────────────────────────────────────────────────
// ALTERAR SENHA
// ─────────────────────────────────────────────────────────────
function abrirModalAlterarSenha() {
  const html = `
    <div id="modal-alterar-senha" class="modal-overlay" style="display:flex;z-index:9999;backdrop-filter:blur(4px)">
      <div style="background:#fff;border-radius:20px;width:100%;max-width:420px;
        box-shadow:0 24px 60px rgba(0,0,0,0.18);overflow:hidden;font-family:inherit">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#1a7a2e 100%);
          padding:24px 24px 20px;position:relative">
          <button onclick="document.getElementById('modal-alterar-senha').remove()"
            style="position:absolute;top:14px;right:16px;background:rgba(255,255,255,0.12);
            border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:14px;
            cursor:pointer">✕</button>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="background:rgba(255,255,255,0.12);border-radius:12px;padding:10px;font-size:22px">🔐</div>
            <div>
              <div style="color:#fff;font-size:1.1rem;font-weight:700">Alterar Senha</div>
              <div style="color:rgba(255,255,255,0.55);font-size:0.78rem;margin-top:2px">Escolha uma senha forte</div>
            </div>
          </div>
        </div>
        <!-- Body -->
        <div style="padding:22px 24px 18px">
          <div style="margin-bottom:16px">
            <label style="font-size:0.75rem;font-weight:600;color:#64748b;text-transform:uppercase;
              letter-spacing:.4px;display:block;margin-bottom:6px">Nova senha</label>
            <div style="position:relative">
              <input type="password" id="wl-nova-senha" placeholder="Digite a nova senha"
                autocomplete="new-password" oninput="_wlAvaliarSenha(this.value)"
                style="width:100%;padding:10px 42px 10px 13px;border:2px solid #e2e8f0;
                border-radius:10px;font-size:0.9rem;outline:none;box-sizing:border-box"
                onfocus="this.style.borderColor='#1a7a2e'" onblur="this.style.borderColor='#e2e8f0'"/>
              <span onclick="_wlToggleSenha('wl-nova-senha','wl-eye1')" id="wl-eye1"
                style="position:absolute;right:11px;top:50%;transform:translateY(-50%);
                cursor:pointer;font-size:17px;user-select:none">👁</span>
            </div>
            <!-- Barra de força -->
            <div style="margin-top:7px">
              <div style="display:flex;gap:4px;height:5px;border-radius:4px;overflow:hidden">
                <div id="wl-b1" style="flex:1;background:#e2e8f0;border-radius:4px;transition:background .3s"></div>
                <div id="wl-b2" style="flex:1;background:#e2e8f0;border-radius:4px;transition:background .3s"></div>
                <div id="wl-b3" style="flex:1;background:#e2e8f0;border-radius:4px;transition:background .3s"></div>
                <div id="wl-b4" style="flex:1;background:#e2e8f0;border-radius:4px;transition:background .3s"></div>
              </div>
              <div id="wl-forca-lbl" style="font-size:0.72rem;color:#aaa;margin-top:4px;min-height:14px"></div>
            </div>
            <!-- Critérios -->
            <div style="margin-top:9px;display:grid;grid-template-columns:1fr 1fr;gap:3px 10px">
              <div id="wl-c1" style="font-size:.72rem;color:#bbb;transition:color .25s">✗ Mín. 8 caracteres</div>
              <div id="wl-c2" style="font-size:.72rem;color:#bbb;transition:color .25s">✗ Número</div>
              <div id="wl-c3" style="font-size:.72rem;color:#bbb;transition:color .25s">✗ Maiúscula</div>
              <div id="wl-c4" style="font-size:.72rem;color:#bbb;transition:color .25s">✗ Caractere especial</div>
            </div>
          </div>
          <div style="margin-bottom:6px">
            <label style="font-size:0.75rem;font-weight:600;color:#64748b;text-transform:uppercase;
              letter-spacing:.4px;display:block;margin-bottom:6px">Confirmar senha</label>
            <div style="position:relative">
              <input type="password" id="wl-conf-senha" placeholder="Repita a nova senha"
                autocomplete="new-password" oninput="_wlVerificarMatch()"
                style="width:100%;padding:10px 42px 10px 13px;border:2px solid #e2e8f0;
                border-radius:10px;font-size:0.9rem;outline:none;box-sizing:border-box"
                onfocus="this.style.borderColor='#1a7a2e'" onblur="this.style.borderColor='#e2e8f0'"/>
              <span onclick="_wlToggleSenha('wl-conf-senha','wl-eye2')" id="wl-eye2"
                style="position:absolute;right:11px;top:50%;transform:translateY(-50%);
                cursor:pointer;font-size:17px;user-select:none">👁</span>
            </div>
            <div id="wl-match-lbl" style="font-size:0.78rem;margin-top:5px;min-height:16px"></div>
          </div>
          <div id="wl-msg-senha" style="display:none;color:#e74c3c;font-size:0.82rem;
            background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px 12px;margin-top:10px"></div>
        </div>
        <!-- Footer -->
        <div style="padding:0 24px 22px;display:flex;gap:10px">
          <button onclick="document.getElementById('modal-alterar-senha').remove()"
            style="flex:1;padding:11px;background:#f5f5f5;color:#666;border:none;border-radius:10px;
            font-size:0.88rem;font-weight:600;cursor:pointer">Cancelar</button>
          <button id="wl-btn-salvar-senha" onclick="wlSalvarNovaSenha()"
            style="flex:2;padding:11px;background:linear-gradient(135deg,#1a7a2e,#145a22);
            color:#fff;border:none;border-radius:10px;font-size:0.88rem;font-weight:700;cursor:pointer">
            🔒 Salvar Nova Senha
          </button>
        </div>
      </div>
    </div>`;
  const old = document.getElementById("modal-alterar-senha");
  if (old) old.remove();
  document.body.insertAdjacentHTML("beforeend", html);
  setTimeout(() => document.getElementById("wl-nova-senha")?.focus(), 120);
}

function _wlToggleSenha(inputId, spanId) {
  const inp = document.getElementById(inputId);
  const sp  = document.getElementById(spanId);
  if (!inp) return;
  inp.type = inp.type === "password" ? "text" : "password";
  if (sp) sp.textContent = inp.type === "password" ? "👁" : "🙈";
}

function _wlAvaliarSenha(v) {
  const checks = [v.length >= 8, /\d/.test(v), /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)];
  const txts   = ["Mín. 8 caracteres","Número","Maiúscula","Caractere especial"];
  const cores  = ["#e2e8f0","#ef4444","#f97316","#eab308","#22c55e"];
  const labels = ["","Fraca 😬","Razoável 😐","Boa 👍","Forte 💪"];
  const score  = checks.filter(Boolean).length;

  checks.forEach((ok, i) => {
    const el = document.getElementById("wl-c" + (i + 1));
    if (!el) return;
    el.textContent = (ok ? "✓ " : "✗ ") + txts[i];
    el.style.color = ok ? "#22c55e" : "#bbb";
  });
  for (let i = 1; i <= 4; i++) {
    const b = document.getElementById("wl-b" + i);
    if (b) b.style.background = i <= score ? cores[score] : "#e2e8f0";
  }
  const fl = document.getElementById("wl-forca-lbl");
  if (fl) { fl.textContent = labels[score]; fl.style.color = cores[score]; }
  _wlVerificarMatch();
}

function _wlVerificarMatch() {
  const a   = document.getElementById("wl-nova-senha")?.value || "";
  const b   = document.getElementById("wl-conf-senha")?.value || "";
  const lbl = document.getElementById("wl-match-lbl");
  const inp = document.getElementById("wl-conf-senha");
  if (!lbl || !b) return;
  const ok = a === b && b.length > 0;
  lbl.textContent = ok ? "✓ Senhas coincidem" : "✗ Senhas não coincidem";
  lbl.style.color = ok ? "#22c55e" : "#ef4444";
  if (inp) inp.style.borderColor = b.length > 0 ? (ok ? "#22c55e" : "#ef4444") : "#e2e8f0";
}

async function wlSalvarNovaSenha() {
  const nova   = document.getElementById("wl-nova-senha")?.value || "";
  const conf   = document.getElementById("wl-conf-senha")?.value || "";
  const msgEl  = document.getElementById("wl-msg-senha");
  const showErr = (t) => { msgEl.textContent = t; msgEl.style.display = "block"; };
  msgEl.style.display = "none";

  if (nova.length < 6)  return showErr("A senha deve ter pelo menos 6 caracteres.");
  if (nova !== conf)    return showErr("As senhas não coincidem.");

  const btn = document.getElementById("wl-btn-salvar-senha");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Salvando..."; btn.style.opacity = ".7"; }

  const { error } = await supa.auth.updateUser({ password: nova });

  if (btn) { btn.disabled = false; btn.textContent = "🔒 Salvar Nova Senha"; btn.style.opacity = "1"; }

  if (error) {
    showErr("Erro: " + error.message);
  } else {
    document.getElementById("modal-alterar-senha").remove();
    const toast = document.createElement("div");
    toast.textContent = "✅ Senha alterada com sucesso!";
    toast.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);" +
      "background:#1a7a2e;color:#fff;padding:12px 24px;border-radius:12px;font-weight:600;" +
      "font-size:0.9rem;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.2)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }
}

// =========================================
// 9. VENDA BALCÃO (NOVA VERSÃO VISUAL)
// =========================================

// =========================================
// 9. VENDA BALCÃO (VISUAL / NOVO)
// =========================================
let carrinhoPDV = [];
let produtosCachePDV = [];
// Cotação carregada das configurações (fallback 1100)
let _cotacaoPDV = 1100;
let _taxaDebitoPDV = 1.99;
let _taxaCreditoPDV = 4.98;
let _cartaoBRTipoPDV = "debito";

async function carregarPDV() {
  // PDV carrega TODOS os produtos ativos (inclui pausado=null e pausado=false)
  // .neq("pausado", true) exclui NULLs no PostgREST — usar .or() para incluir
  const { data } = await supa
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .or("pausado.is.null,pausado.eq.false")
    .order("categoria_slug")
    .order("nome");
  produtosCachePDV = data || [];

  // Carrega categorias para exibir no PDV
  const { data: cats } = await supa
    .from("categorias")
    .select("*")
    .order("ordem");
  produtosCatsPDV = cats || [];

  // Carrega cotação atual das configurações
  const { data: cfg } = await supa
    .from("configuracoes")
    .select("cotacao_real, taxa_debito, taxa_credito")
    .maybeSingle();
  if (cfg?.cotacao_real) _cotacaoPDV = Number(cfg.cotacao_real);
  if (cfg?.taxa_debito != null) _taxaDebitoPDV = Number(cfg.taxa_debito);
  if (cfg?.taxa_credito != null) _taxaCreditoPDV = Number(cfg.taxa_credito);
  // Aplica visibilidade das formas de pagamento no PDV
  const { data: featCfg } = await supa
    .from("configuracoes")
    .select("features_ativas")
    .maybeSingle();
  _aplicarFormasPagamentoPDV(featCfg?.features_ativas);

  renderizarGridPDV();
  atualizarBarraMesasAtivas();
  pdvIniciarTabs();
  // Carrega mini-painel de caixa no PDV (funciona mesmo com aba financeiro bloqueada)
  await pdvCarregarPainelCaixa();
}

/**
 * Mini-painel de caixa na aba PDV.
 * Visível para todos os perfis (funcionario, gerente, dono, etc).
 * Permite abrir o caixa sem precisar acessar a aba financeiro.
 */
async function pdvCarregarPainelCaixa() {
  const container = document.getElementById("pdv-painel-caixa");
  if (!container) return;

  // Reutiliza _carregarSessaoCaixa se financeiro não foi aberto ainda
  const ehGestor = ["dono", "gerente", "adminMaster"].includes(perfilUsuario);
  const emailAtual = document.getElementById("user-email")?.innerText || "";

  let q = supa
    .from("sessoes_caixa")
    .select("*")
    .is("fechado_em", null)
    .order("aberto_em", { ascending: false })
    .limit(1);
  if (!ehGestor) q = q.eq("usuario_email", emailAtual);

  const { data } = await q;
  const sessao = data?.[0] || null;

  // Sincroniza com _sessaoCaixaAtiva para que salvarMovimentacaoCaixa funcione
  _sessaoCaixaAtiva = sessao;

  if (!sessao) {
    container.innerHTML = `
      <div style="background:#fff3cd;border:1.5px solid #f0a500;border-radius:12px;
        padding:14px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="font-weight:700;color:#7a5100;font-size:0.92rem">⚠️ Caixa não aberto</div>
          <div style="font-size:0.8rem;color:#9a6400;margin-top:2px">
            Abra o caixa para as vendas serem contabilizadas nesta sessão.
          </div>
        </div>
        <button onclick="abrirModalCaixa('abertura')"
          style="background:#27ae60;color:#fff;border:none;border-radius:9px;
            padding:10px 20px;font-weight:700;cursor:pointer;font-size:0.88rem;
            white-space:nowrap;box-shadow:0 2px 8px rgba(39,174,96,.3)">
          <i class="fas fa-door-open"></i> Abrir Caixa
        </button>
      </div>`;
  } else {
    const dAbr = new Date(sessao.aberto_em).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
    });
    const podeFechar = ehGestor;
    container.innerHTML = `
      <div style="background:#eafaf1;border:1.5px solid #27ae60;border-radius:12px;
        padding:12px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="font-weight:700;color:#1a6b3a;font-size:0.92rem">
            🟢 Caixa aberto desde ${dAbr}
          </div>
          <div style="font-size:0.8rem;color:#2e7d52;margin-top:2px">
            Operador: ${sessao.usuario_nome || sessao.usuario_email}
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button onclick="abrirModalCaixa('suprimento')"
            style="background:#2980b9;color:#fff;border:none;border-radius:8px;
              padding:8px 14px;font-weight:600;cursor:pointer;font-size:0.82rem">
            <i class="fas fa-plus-circle"></i> Suprimento
          </button>
          <button onclick="abrirModalCaixa('sangria')"
            style="background:#e67e22;color:#fff;border:none;border-radius:8px;
              padding:8px 14px;font-weight:600;cursor:pointer;font-size:0.82rem">
            <i class="fas fa-hand-holding-usd"></i> Sangria
          </button>
          ${podeFechar ? `
          <button onclick="fecharCaixaResumo()"
            style="background:#2c3e50;color:#fff;border:none;border-radius:8px;
              padding:8px 14px;font-weight:600;cursor:pointer;font-size:0.82rem">
            <i class="fas fa-calculator"></i> Fechar Dia
          </button>` : ""}
        </div>
      </div>`;
  }
}

let produtosCatsPDV = [];

let _pdvCatFiltro = "todos";

function pdvSelecionarTipo(tipo, btn) {
  const inp = document.getElementById("balcao-tipo-entrega");
  if (inp) inp.value = tipo;
  document
    .querySelectorAll(".pdv-tipo-tab")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const delivRow = document.getElementById("pdv-delivery-row");
  if (delivRow) delivRow.style.display = tipo === "delivery" ? "block" : "none";
  atualizarCarrinhoPDV();
}

function renderizarGridPDV(filtroNome = "") {
  const grid = document.getElementById("pdv-grid");
  if (!grid) return;
  grid.innerHTML = "";

  // Gera chips de categoria
  const filterBar = document.getElementById("pdv-cat-filter");
  if (filterBar) {
    filterBar.innerHTML = "";
    const allChip = document.createElement("button");
    allChip.className = `pdv-cat-chip${_pdvCatFiltro === "todos" ? " active" : ""}`;
    allChip.textContent = "TODOS";
    allChip.onclick = () => {
      _pdvCatFiltro = "todos";
      renderizarGridPDV(document.getElementById("pdv-busca")?.value || "");
    };
    filterBar.appendChild(allChip);

    const slugsUsados = [
      ...new Set(produtosCachePDV.map((p) => p.categoria_slug).filter(Boolean)),
    ];
    const ordemCats = produtosCatsPDV.map((c) => c.slug);
    slugsUsados.sort((a, b) => {
      const ia = ordemCats.indexOf(a),
        ib = ordemCats.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    slugsUsados.forEach((slug) => {
      const catInfo = produtosCatsPDV.find((c) => c.slug === slug);
      const chip = document.createElement("button");
      chip.className = `pdv-cat-chip${_pdvCatFiltro === slug ? " active" : ""}`;
      chip.textContent = (catInfo?.nome_exibicao || slug).toUpperCase();
      chip.onclick = () => {
        _pdvCatFiltro = slug;
        renderizarGridPDV(document.getElementById("pdv-busca")?.value || "");
      };
      filterBar.appendChild(chip);
    });
  }

  // Filtra produtos
  const query = filtroNome.toLowerCase().trim();
  let produtos = produtosCachePDV.filter((p) => {
    if (_pdvCatFiltro !== "todos" && p.categoria_slug !== _pdvCatFiltro)
      return false;
    if (query && !p.nome.toLowerCase().includes(query)) return false;
    return true;
  });

  if (_pdvCatFiltro !== "todos" || query) {
    // Flat grid sem cabeçalhos de categoria
    const row = document.createElement("div");
    row.className = "pdv-cat-row";
    produtos.forEach((p) => {
      row.appendChild(_criarCardPDV(p));
    });
    if (produtos.length === 0) {
      row.innerHTML = `<p style="color:#aaa;grid-column:1/-1;text-align:center;padding:20px">Nenhum produto encontrado</p>`;
    }
    grid.appendChild(row);
    return;
  }

  // Agrupa por categoria
  const porCategoria = {};
  produtosCachePDV.forEach((p) => {
    const cat = p.categoria_slug || "outros";
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(p);
  });

  const ordemCats = produtosCatsPDV.map((c) => c.slug);
  const slugsOrdenados = Object.keys(porCategoria).sort((a, b) => {
    const ia = ordemCats.indexOf(a),
      ib = ordemCats.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  slugsOrdenados.forEach((slug) => {
    const catInfo = produtosCatsPDV.find((c) => c.slug === slug);
    const catNome = catInfo ? catInfo.nome_exibicao : slug;

    const h = document.createElement("div");
    h.className = "pdv-cat-header";
    h.textContent = catNome;
    grid.appendChild(h);

    const row = document.createElement("div");
    row.className = "pdv-cat-row";
    porCategoria[slug].forEach((p) => row.appendChild(_criarCardPDV(p)));
    grid.appendChild(row);
  });
}

function _criarCardPDV(p) {
  const img = p.imagem_url || "";
  let cfg = p.montagem_config;
  if (typeof cfg === "string") {
    try {
      cfg = JSON.parse(cfg);
    } catch (_) {
      cfg = null;
    }
  }
  const isKg = cfg && !Array.isArray(cfg) && cfg.__tipo === "kg";
  const precoKg = isKg ? cfg.preco_kg || p.preco || 0 : 0;

  const card = document.createElement("div");
  card.className = "pdv-card" + (isKg ? " pdv-card-kg" : "");
  card.title = p.nome;
  card.onclick = () => adicionarItemPDV(p);

  const imgHtml = img
    ? `<div class="pdv-card-img" style="background-image:url('${img}')"></div>`
    : `<div class="pdv-card-img pdv-card-img-none"><i class="fas fa-utensils"></i></div>`;

  const priceStr = isKg
    ? `Gs ${precoKg.toLocaleString("es-PY")}<span class="pdv-card-unit">/kg</span>`
    : `Gs ${p.preco.toLocaleString("es-PY")}`;

  const badge = isKg ? `<span class="pdv-card-kg-badge">⚖️ Kg</span>` : "";

  card.innerHTML = `
    ${imgHtml}
    <div class="pdv-card-body">
      <div class="pdv-card-name">${p.nome} ${badge}</div>
      <div class="pdv-card-price">${priceStr}</div>
    </div>`;
  return card;
}

function filtrarPDV(valor) {
  renderizarGridPDV(valor);
}

// Categorias que NÃO recebem o upsell de extras globais
const _CATS_SEM_EXTRAS_GLOBAIS = [
  "bebidas",
  "bebida",
  "extras",
  "extra",
  "molhos",
  "adicionais",
];

// Extras globais configurados pelo admin
let _extrasGlobaisCache = null;
async function _getExtrasGlobais() {
  if (_extrasGlobaisCache !== null) return _extrasGlobaisCache;
  try {
    const { data } = await supa
      .from("configuracoes")
      .select("extras_globais")
      .maybeSingle();
    _extrasGlobaisCache =
      data &&
      Array.isArray(data.extras_globais) &&
      data.extras_globais.length > 0
        ? data.extras_globais
        : []; // sem fallback hardcoded — se não configurado, não mostra upsell
  } catch (_e) {
    _extrasGlobaisCache = [];
  }
  return _extrasGlobaisCache;
}

function _deveMostrarExtrasGlobais(produto) {
  const cat = (produto.categoria_slug || "").toLowerCase();
  return !_CATS_SEM_EXTRAS_GLOBAIS.some((c) => cat.includes(c));
}

function adicionarItemPDV(p) {
  // montagem_config pode chegar como string JSON de bancos antigos
  let cfg = p.montagem_config;
  if (typeof cfg === "string") {
    try {
      cfg = JSON.parse(cfg);
    } catch (_) {
      cfg = null;
    }
  }
  const tipo = cfg && !Array.isArray(cfg) && cfg.__tipo ? cfg.__tipo : null;

  // Kg → modal de peso/balança
  if (tipo === "kg") {
    _mostrarModalPesoPDV(p, cfg.preco_kg || p.preco || 0);
    return;
  }

  // Tipos com seleção obrigatória → abre modal de opções
  if (tipo === "variacoes" && cfg.variacoes?.length > 0) {
    const ativas = cfg.variacoes.filter((v) => v.ativo !== false);
    if (!ativas.length) {
      alert("⏸️ Todas as variações estão pausadas.");
      return;
    }
    _mostrarModalOpcoesPDV(p, "variacoes");
    return;
  }
  if (tipo === "pizza") {
    _mostrarModalOpcoesPDV(p, "pizza");
    return;
  }
  if (tipo === "acai") {
    _mostrarModalOpcoesPDV(p, "acai");
    return;
  }
  if (tipo === "shake") {
    _mostrarModalOpcoesPDV(p, "shake");
    return;
  }
  if (tipo === "suco") {
    _mostrarModalOpcoesPDV(p, "suco");
    return;
  }
  if (tipo === "sorvete") {
    _mostrarModalOpcoesPDV(p, "sorvete");
    return;
  }
  if (tipo === "montavel" && cfg.etapas?.length > 0) {
    _mostrarModalOpcoesPDV(p, "montavel");
    return;
  }
  if (tipo === "combo_fechado" && cfg.sabores?.length > 0) {
    _mostrarModalOpcoesPDV(p, "combo_fechado");
    return;
  }

  // Simples / Lanche / Bebida / Combo — adiciona direto
  const existe = carrinhoPDV.find((i) => i.id === p.id && !i.variacao);
  if (existe) existe.qtd++;
  else carrinhoPDV.push({ ...p, qtd: 1, montagem: [], obs: "" });
  atualizarCarrinhoPDV();

  if (_deveMostrarExtrasGlobais(p)) {
    _getExtrasGlobais().then((extras) => {
      if (extras?.length > 0) _mostrarUpsellExtrasPDV(p, extras);
    });
  }
}

// ── Modal unificado de opções para PDV ────────────────────────────
// Cobre: variacoes, pizza, acai, shake, suco, sorvete, montavel
function _mostrarModalOpcoesPDV(produto, tipo) {
  document.getElementById("pdv-opcoes-modal")?.remove();

  let cfg = produto.montagem_config || {};
  if (typeof cfg === "string") {
    try {
      cfg = JSON.parse(cfg);
    } catch (_) {
      cfg = {};
    }
  }
  const cacheKey = "pdv_" + (produto.id || Date.now());
  window._pdvProdCache[cacheKey] = produto;

  const overlay = document.createElement("div");
  overlay.id = "pdv-opcoes-modal";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:0";
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  const modal = document.createElement("div");
  modal.style.cssText =
    "background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;padding:20px 16px 32px;box-shadow:0 -8px 40px rgba(0,0,0,0.2)";

  // Header
  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div>
        <div style="font-weight:800;font-size:1rem;color:#1a1a1a">${produto.nome}</div>
        <div style="font-size:0.8rem;color:#888">Gs ${(produto.preco || 0).toLocaleString("es-PY")}</div>
      </div>
      <button onclick="document.getElementById('pdv-opcoes-modal').remove()"
        style="background:#f3f4f6;border:none;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;color:#666">✕</button>
    </div>
    <div id="_pdv-modal-corpo"></div>
    <div id="_pdv-obs-row" style="margin-top:12px">
      <label style="font-size:0.8rem;font-weight:600;color:#555">Observações</label>
      <input type="text" id="_pdv-obs-input" class="form-control" placeholder="Ex: sem cebola, bem passado..." style="margin-top:4px">
    </div>
    <button id="_pdv-modal-add" onclick="_pdvModalConfirmar('${cacheKey}')"
      style="width:100%;padding:14px;background:var(--primary,#1a7a2e);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;margin-top:16px">
      ✅ Adicionar ao Pedido
    </button>`;

  const corpo = () => modal.querySelector("#_pdv-modal-corpo");

  // ── VARIAÇÕES ────────────────────────────────────────────────
  if (tipo === "variacoes") {
    const ativas = (cfg.variacoes || []).filter((v) => v.ativo !== false);
    corpo().innerHTML = `<p style="font-size:0.82rem;color:#555;margin-bottom:10px;font-weight:600">Escolha a variação:</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${ativas
          .map(
            (v, i) => `
          <label style="display:flex;align-items:center;gap:12px;border:2px solid #e5e7eb;border-radius:10px;padding:10px 12px;cursor:pointer;transition:all .15s"
            onclick="this.closest('div').querySelectorAll('label').forEach(l=>l.style.borderColor='#e5e7eb');this.style.borderColor='var(--primary)';this.style.background='#f0fff4'">
            <input type="radio" name="_pdv_var" value="${i}" style="width:18px;height:18px" ${i === 0 ? "checked" : ""}>
            ${v.img || produto.imagem_url ? `<img src="${v.img || produto.imagem_url}" style="width:44px;height:44px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'">` : ""}
            <div style="flex:1"><div style="font-weight:700;font-size:0.9rem">${v.nome}</div></div>
            <div style="font-weight:700;color:var(--primary)">Gs ${(v.preco || produto.preco || 0).toLocaleString("es-PY")}</div>
          </label>`,
          )
          .join("")}
      </div>`;
  }

  // ── PIZZA ────────────────────────────────────────────────────
  else if (tipo === "pizza") {
    const tamanhos = cfg.tamanhos || [];
    const sabores = cfg.sabores || [];
    const bordas = cfg.bordas || [];

    // ── Helpers de preço (igual ao app.js) ──────────────────────
    // Retorna o preço do tamanho para um determinado tipo de sabor
    const _pdvPrecoTipo = (tam, tipo) => {
      if (!tam) return 0;
      const precos = tam.precos || {};
      if (tipo && precos[tipo] > 0) return precos[tipo];
      if (tipo) {
        const k = Object.keys(precos).find(k2 => k2.toLowerCase() === (tipo || "").toLowerCase());
        if (k && precos[k] > 0) return precos[k];
      }
      return tam.preco || 0;
    };
    // Retorna o menor preço disponível no tamanho (preço base)
    const _pdvPrecoMin = (tam) => {
      if (!tam) return 0;
      const vals = Object.values(tam.precos || {}).filter(v => v > 0);
      return vals.length ? Math.min(...vals) : (tam.preco || 0);
    };

    let html = "";

    // ── Passo 1: Tamanho (cards com fatias, cm e preço — igual ao app.js) ──
    if (tamanhos.length) {
      html += `<div style="margin-bottom:14px">
        <p style="font-size:0.82rem;font-weight:700;color:#e74c3c;margin-bottom:8px">📐 Tamanho:</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px" id="_pdv_pizza_tam_grid">
          ${tamanhos.map((t, i) => `
            <label style="border:2px solid ${i === 0 ? "#e74c3c" : "#e5e7eb"};background:${i === 0 ? "#fff5f5" : ""};border-radius:10px;padding:10px 12px;cursor:pointer;text-align:center;min-width:80px;transition:all .15s"
              onclick="this.closest('#_pdv_pizza_tam_grid').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#e74c3c';this.style.background='#fff5f5';_pdvPizzaAtualizarPreco()">
              <input type="radio" name="_pdv_pizza_tam" value="${i}" style="display:none" ${i === 0 ? "checked" : ""}>
              <div style="font-weight:700;font-size:0.9rem">${t.nome}</div>
              ${t.fatias ? `<div style="font-size:0.7rem;color:#888">${t.fatias} fatias</div>` : ""}
              ${t.cm ? `<div style="font-size:0.7rem;color:#888">⌀${t.cm}cm</div>` : ""}
              <div style="font-size:0.82rem;font-weight:800;color:#e74c3c;margin-top:3px">Gs ${(t.preco || 0).toLocaleString("es-PY")}</div>
            </label>`).join("")}
        </div>
      </div>`;
    }

    // ── Passo 2: Sabores — cada card mostra o preço do seu tipo (igual ao app.js) ──
    const maxSabDefault = tamanhos[0]?.max_sabores || 2;
    const tam0 = tamanhos[0];
    const precoMin0 = _pdvPrecoMin(tam0);
    html += `<div style="margin-bottom:14px">
      <p style="font-size:0.82rem;font-weight:700;color:#e74c3c;margin-bottom:8px">🍽️ Sabores <span id="_pdv_pizza_maxlabel" style="font-weight:400;color:#888">(até ${maxSabDefault})</span>:</p>
      <div id="_pdv_sabores_lista" style="display:flex;flex-direction:column;gap:6px">
        ${sabores.map(s => {
          const precoEste0 = _pdvPrecoTipo(tam0, s.tipo);
          const diff0 = precoEste0 - precoMin0;
          const precoLbl = diff0 > 0
            ? `<span id="_pdv_sp_${s.nome.replace(/[^a-zA-Z0-9]/g,'_')}" style="font-size:0.78rem;font-weight:700;color:#e74c3c;white-space:nowrap">+Gs ${diff0.toLocaleString("es-PY")}</span>`
            : `<span id="_pdv_sp_${s.nome.replace(/[^a-zA-Z0-9]/g,'_')}" style="font-size:0.78rem;font-weight:700;color:#e74c3c;white-space:nowrap"></span>`;
          const tipoBadge = s.tipo
            ? `<span style="font-size:0.68rem;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;margin-left:4px;font-weight:600">${s.tipo}</span>`
            : "";
          return `
            <label style="display:flex;align-items:center;gap:10px;border:1.5px solid #e5e7eb;border-radius:8px;padding:8px 10px;cursor:pointer;transition:all .15s"
              data-tipo-sabor="${s.tipo || ""}"
              onclick="(function(el){var cb=el.querySelector('input[type=checkbox]');if(!cb.checked){var t=parseInt(document.getElementById('_pdv_pizza_maxlabel').textContent.match(/\\d+/)?.[0]||2);var chk=document.querySelectorAll('#_pdv_sabores_lista input[type=checkbox]:checked').length;if(chk>=t){alert('Máx. '+t+' sabores');return;}cb.checked=true;el.style.borderColor='#e74c3c';el.style.background='#fff5f5';}else{cb.checked=false;el.style.borderColor='#e5e7eb';el.style.background='';}if(typeof _pdvPizzaAtualizarPreco==='function')_pdvPizzaAtualizarPreco();})(this)">
              <input type="checkbox" value="${s.nome}" style="display:none">
              ${s.img ? `<img src="${s.img}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">` : `<span style="font-size:1.4rem;flex-shrink:0">🍕</span>`}
              <div style="flex:1;min-width:0">
                <div style="font-size:0.88rem;font-weight:600">${s.nome}${tipoBadge}</div>
                ${s.desc ? `<div style="font-size:0.73rem;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.desc}</div>` : ""}
              </div>
              ${precoLbl}
            </label>`;
        }).join("")}
      </div>
    </div>`;

    // ── Passo 3: Borda (opcional) — com update de preço ──────────
    if (bordas.length) {
      html += `<div style="margin-bottom:14px">
        <p style="font-size:0.82rem;font-weight:700;color:#e74c3c;margin-bottom:8px">🧀 Borda (opcional):</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px" id="_pdv_pizza_borda_grid">
          <label style="border:2px solid #27ae60;background:#f0fff4;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:0.85rem;font-weight:600;transition:all .15s"
            onclick="this.closest('#_pdv_pizza_borda_grid').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#27ae60';this.style.background='#f0fff4';if(typeof _pdvPizzaAtualizarPreco==='function')_pdvPizzaAtualizarPreco()">
            <input type="radio" name="_pdv_pizza_borda" value="" style="display:none" checked> Sem borda
          </label>
          ${bordas.map(b => `
            <label style="border:2px solid #e5e7eb;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:0.85rem;font-weight:600;transition:all .15s"
              onclick="this.closest('#_pdv_pizza_borda_grid').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#27ae60';this.style.background='#f0fff4';if(typeof _pdvPizzaAtualizarPreco==='function')_pdvPizzaAtualizarPreco()">
              <input type="radio" name="_pdv_pizza_borda" value="${b.nome}" style="display:none">
              ${b.nome}${b.preco ? ` <span style="color:#e74c3c">+Gs ${b.preco.toLocaleString("es-PY")}</span>` : ""}
            </label>`).join("")}
        </div>
      </div>`;
    }

    html += `<div id="_pdv_pizza_preco_box" style="background:#fff5f5;border:1.5px solid #fca5a5;border-radius:10px;padding:10px 14px;text-align:center;margin-bottom:8px">
      <div style="font-size:0.78rem;color:#888;margin-bottom:2px">★ Prevalece o preço do tipo mais caro entre os sabores</div>
      <div style="font-size:0.8rem;color:#888">Total estimado:</div>
      <div id="_pdv_pizza_preco_val" style="font-size:1.4rem;font-weight:800;color:#e74c3c">Gs —</div>
    </div>`;

    corpo().innerHTML = html;

    // Expõe cfg para uso externo
    window._pdvPizzaCfg = cfg;

    // ── _pdvPizzaAtualizarPreco: igual ao app.js ─────────────────
    // Preço = max(tam.precos[tipo] para cada sabor selecionado) + borda
    window._pdvPizzaAtualizarPreco = function () {
      const tamIdx = parseInt(
        modal.querySelector('input[name="_pdv_pizza_tam"]:checked')?.value ?? 0,
      );
      const tam = cfg.tamanhos?.[tamIdx];
      if (!tam) return;

      // Atualiza label de max sabores
      const maxLbl = modal.querySelector("#_pdv_pizza_maxlabel");
      if (maxLbl) maxLbl.textContent = `(até ${tam.max_sabores || 2})`;

      // Atualiza preço diferencial em cada card de sabor
      const precoMin = _pdvPrecoMin(tam);
      modal.querySelectorAll("#_pdv_sabores_lista label").forEach(lbl => {
        const tipo = lbl.dataset.tipoSabor || "";
        const precoEste = _pdvPrecoTipo(tam, tipo);
        const diff = precoEste - precoMin;
        const nomeSabor = (lbl.querySelector("input[type=checkbox]")?.value || "").replace(/[^a-zA-Z0-9]/g, "_");
        const el = modal.querySelector(`#_pdv_sp_${nomeSabor}`);
        if (el) el.textContent = diff > 0 ? `+Gs ${diff.toLocaleString("es-PY")}` : "";
      });

      // Calcula preço: max dos tipos dos sabores selecionados (REGRA DE OURO — igual app.js)
      const saboresSel = [...modal.querySelectorAll("#_pdv_sabores_lista input[type=checkbox]:checked")]
        .map(c => c.closest("label")?.dataset.tipoSabor || "");

      let precoBase;
      if (saboresSel.length > 0) {
        precoBase = Math.max(...saboresSel.map(tipo => _pdvPrecoTipo(tam, tipo)));
      } else {
        precoBase = tam.preco || 0;
      }

      const bordaVal = modal.querySelector('input[name="_pdv_pizza_borda"]:checked')?.value || "";
      const bordaPreco = bordaVal
        ? cfg.bordas?.find(b => b.nome === bordaVal)?.preco || 0
        : 0;

      const el = modal.querySelector("#_pdv_pizza_preco_val");
      if (el) el.textContent = "Gs " + (precoBase + bordaPreco).toLocaleString("es-PY");
    };

    // Compatibilidade — mantém função de filtro mas delegando para update de preço
    window._pdvPizzaFiltrarSabores = function () {
      _pdvPizzaAtualizarPreco();
    };

    _pdvPizzaAtualizarPreco();
  }

  // ── AÇAÍ ────────────────────────────────────────────────────
  else if (tipo === "acai") {
    let html = "";
    if (cfg.tamanhos?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#7c3aed;margin-bottom:6px">🍇 Tamanho:</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
          ${cfg.tamanhos
            .map(
              (t, i) => `
            <label style="border:2px solid ${i === 0 ? "#7c3aed" : "#e5e7eb"};border-radius:10px;padding:8px 10px;cursor:pointer;text-align:center;min-width:70px;transition:all .15s"
              onclick="this.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#7c3aed';this.style.background='#f5f3ff'">
              <input type="radio" name="_pdv_acai_tam" value="${i}" style="display:none" ${i === 0 ? "checked" : ""}>
              ${t.img ? `<img src="${t.img}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;display:block;margin:0 auto 4px" onerror="this.style.display='none'">` : ""}
              <div style="font-weight:700;font-size:0.85rem">${t.nome}</div>
              <div style="font-size:0.75rem;color:#7c3aed;font-weight:600">Gs ${(t.preco || 0).toLocaleString("es-PY")}</div>
            </label>`,
            )
            .join("")}
        </div>`;
    }
    if (cfg.acompanhamentos?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#7c3aed;margin-bottom:6px">🥄 Acompanhamentos:</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
          ${cfg.acompanhamentos
            .map(
              (a) => `
            <label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:7px 10px;cursor:pointer;font-size:0.83rem;font-weight:600;display:flex;align-items:center;gap:6px;transition:all .15s"
              onclick="var cb=this.querySelector('input');cb.checked=!cb.checked;this.style.borderColor=cb.checked?'#7c3aed':'#e5e7eb';this.style.background=cb.checked?'#f5f3ff':''">
              <input type="checkbox" value="${a.nome}" style="display:none">
              ${a.img ? `<img src="${a.img}" style="width:28px;height:28px;border-radius:4px;object-fit:cover" onerror="this.style.display='none'">` : ""}
              ${a.nome} ${a.preco ? `(+Gs ${a.preco.toLocaleString("es-PY")})` : ""}
            </label>`,
            )
            .join("")}
        </div>`;
    }
    (cfg.etapas || []).forEach((et) => {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#7c3aed;margin-bottom:6px">${et.titulo} (até ${et.max}):</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          ${(et.itens || [])
            .map((it) => {
              const nome = it.nome || it;
              return `<label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:0.83rem;font-weight:600;transition:all .15s"
              onclick="var cb=this.querySelector('input');if(!cb.checked){var m=${et.max};var ch=this.closest('div').querySelectorAll('input:checked').length;if(ch>=m){alert('Máx. '+m+' itens');return;}cb.checked=true;this.style.borderColor='#7c3aed';this.style.background='#f5f3ff';}else{cb.checked=false;this.style.borderColor='#e5e7eb';this.style.background='';}">
              <input type="checkbox" value="${nome}" style="display:none">${nome}
            </label>`;
            })
            .join("")}
        </div>`;
    });
    corpo().innerHTML = html;
  }

  // ── SHAKE ────────────────────────────────────────────────────
  else if (tipo === "shake") {
    const sk = cfg.shake || {};
    let html = "";
    if (sk.tamanhos?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#2980b9;margin-bottom:6px">📐 Tamanho:</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
          ${sk.tamanhos
            .map(
              (t, i) => `
            <label style="border:2px solid ${i === 0 ? "#2980b9" : "#e5e7eb"};border-radius:10px;padding:8px 12px;cursor:pointer;font-size:0.88rem;font-weight:600;transition:all .15s"
              onclick="this.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#2980b9';this.style.background='#e8f4fd'">
              <input type="radio" name="_pdv_shake_tam" value="${i}" style="display:none" ${i === 0 ? "checked" : ""}>
              ${t.nome}${t.ml ? ` (${t.ml}ml)` : ""}<br><span style="font-size:0.75rem;color:#2980b9">Gs ${(t.preco || 0).toLocaleString("es-PY")}</span>
            </label>`,
            )
            .join("")}
        </div>`;
    }
    if (sk.sabores?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#2980b9;margin-bottom:6px">🍓 Sabor:</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-bottom:14px">
          ${sk.sabores
            .map(
              (s, i) => `
            <label style="border:2px solid ${i === 0 ? "#2980b9" : "#e5e7eb"};border-radius:10px;padding:8px;cursor:pointer;text-align:center;transition:all .15s"
              onclick="this.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#2980b9';this.style.background='#e8f4fd'">
              <input type="radio" name="_pdv_shake_sabor" value="${s.nome}" style="display:none" ${i === 0 ? "checked" : ""}>
              ${s.img ? `<img src="${s.img}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;display:block;margin:0 auto 4px" onerror="this.style.display='none'">` : ""}
              <div style="font-size:0.83rem;font-weight:600">${s.nome}</div>
              ${s.preco ? `<div style="font-size:0.72rem;color:#2980b9">+Gs ${s.preco.toLocaleString("es-PY")}</div>` : ""}
            </label>`,
            )
            .join("")}
        </div>`;
    }
    corpo().innerHTML = html;
  }

  // ── SUCO ────────────────────────────────────────────────────
  else if (tipo === "suco") {
    let html = "";
    if (cfg.tamanhos?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#f59e0b;margin-bottom:6px">📐 Tamanho:</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
          ${cfg.tamanhos
            .map(
              (t, i) => `
            <label style="border:2px solid ${i === 0 ? "#f59e0b" : "#e5e7eb"};border-radius:10px;padding:8px 12px;cursor:pointer;font-size:0.88rem;font-weight:600;transition:all .15s"
              onclick="this.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#f59e0b';this.style.background='#fffbeb'">
              <input type="radio" name="_pdv_suco_tam" value="${i}" style="display:none" ${i === 0 ? "checked" : ""}>
              ${t.nome}<br><span style="font-size:0.75rem;color:#f59e0b">Gs ${(t.preco || 0).toLocaleString("es-PY")}</span>
            </label>`,
            )
            .join("")}
        </div>`;
    }
    (cfg.etapas || []).forEach((et) => {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#f59e0b;margin-bottom:6px">${et.titulo} (até ${et.max}):</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          ${(et.itens || [])
            .map((it) => {
              const nome = it.nome || it;
              return `<label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:0.83rem;font-weight:600;transition:all .15s"
              onclick="var cb=this.querySelector('input');if(!cb.checked){var m=${et.max};var ch=this.closest('div').querySelectorAll('input:checked').length;if(ch>=m){alert('Máx. '+m+' itens');return;}cb.checked=true;this.style.borderColor='#f59e0b';this.style.background='#fffbeb';}else{cb.checked=false;this.style.borderColor='#e5e7eb';this.style.background='';}">
              <input type="checkbox" value="${nome}" style="display:none">${nome}
            </label>`;
            })
            .join("")}
        </div>`;
    });
    corpo().innerHTML = html;
  }

  // ── SORVETE ─────────────────────────────────────────────────
  else if (tipo === "sorvete") {
    let html = "";
    if (cfg.tamanhos?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#0ea5e9;margin-bottom:6px">🍦 Quantidade de Bolas:</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
          ${cfg.tamanhos
            .map(
              (t, i) => `
            <label style="border:2px solid ${i === 0 ? "#0ea5e9" : "#e5e7eb"};border-radius:10px;padding:8px 12px;cursor:pointer;font-size:0.88rem;font-weight:600;transition:all .15s"
              onclick="this.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#0ea5e9';this.style.background='#f0f9ff'">
              <input type="radio" name="_pdv_sorv_tam" value="${i}" style="display:none" ${i === 0 ? "checked" : ""}>
              ${t.nome}<br><span style="font-size:0.75rem;color:#0ea5e9">Gs ${(t.preco || 0).toLocaleString("es-PY")}</span>
            </label>`,
            )
            .join("")}
        </div>`;
    }
    if (cfg.sabores?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#0ea5e9;margin-bottom:6px">🎨 Sabores:</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin-bottom:14px">
          ${cfg.sabores
            .map(
              (s) => `
            <label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:7px;cursor:pointer;text-align:center;transition:all .15s"
              onclick="var cb=this.querySelector('input');cb.checked=!cb.checked;this.style.borderColor=cb.checked?'#0ea5e9':'#e5e7eb';this.style.background=cb.checked?'#f0f9ff':''">
              <input type="checkbox" value="${s.nome}" style="display:none">
              ${s.img ? `<img src="${s.img}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;display:block;margin:0 auto 4px" onerror="this.style.display='none'">` : ""}
              <div style="font-size:0.8rem;font-weight:600">${s.nome}</div>
              ${s.preco ? `<div style="font-size:0.7rem;color:#0ea5e9">+Gs ${s.preco.toLocaleString("es-PY")}</div>` : ""}
            </label>`,
            )
            .join("")}
        </div>`;
    }
    if (cfg.variacoes?.length) {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#0ea5e9;margin-bottom:6px">🍦 Servir em:</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          ${cfg.variacoes
            .map(
              (v, i) => `
            <label style="border:2px solid ${i === 0 ? "#0ea5e9" : "#e5e7eb"};border-radius:8px;padding:7px 12px;cursor:pointer;font-size:0.85rem;font-weight:600;transition:all .15s"
              onclick="this.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='#e5e7eb';l.style.background=''});this.style.borderColor='#0ea5e9';this.style.background='#f0f9ff'">
              <input type="radio" name="_pdv_sorv_var" value="${v.nome}" style="display:none" ${i === 0 ? "checked" : ""}>
              ${v.nome} ${v.preco ? `(+Gs ${v.preco.toLocaleString("es-PY")})` : ""}
            </label>`,
            )
            .join("")}
        </div>`;
    }
    (cfg.etapas || []).forEach((et) => {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#0ea5e9;margin-bottom:6px">${et.titulo} (até ${et.max}):</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          ${(et.itens || [])
            .map((it) => {
              const nome = it.nome || it;
              return `<label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:0.83rem;font-weight:600;transition:all .15s"
              onclick="var cb=this.querySelector('input');if(!cb.checked){var m=${et.max};var ch=this.closest('div').querySelectorAll('input:checked').length;if(ch>=m){alert('Máx. '+m+' itens');return;}cb.checked=true;this.style.borderColor='#0ea5e9';this.style.background='#f0f9ff';}else{cb.checked=false;this.style.borderColor='#e5e7eb';this.style.background='';}">
              <input type="checkbox" value="${nome}" style="display:none">${nome}
            </label>`;
            })
            .join("")}
        </div>`;
    });
    corpo().innerHTML = html;
  }

  // ── MONTÁVEL GENÉRICO ────────────────────────────────────────
  else if (tipo === "montavel") {
    let html = "";
    (cfg.etapas || []).forEach((et) => {
      html += `<p style="font-size:0.82rem;font-weight:700;color:#e67e22;margin-bottom:6px">${et.titulo} (até ${et.max}):</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          ${(et.itens || [])
            .map((it) => {
              const nome = it.nome || it;
              const preco = it.preco || 0;
              return `<label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:0.83rem;font-weight:600;transition:all .15s"
              onclick="var cb=this.querySelector('input');if(!cb.checked){var m=${et.max};var ch=this.closest('div').querySelectorAll('input:checked').length;if(ch>=m){alert('Máx. '+m+' itens');return;}cb.checked=true;this.style.borderColor='#e67e22';this.style.background='#fff8f0';}else{cb.checked=false;this.style.borderColor='#e5e7eb';this.style.background='';}">
              <input type="checkbox" value="${nome}" style="display:none">${nome}${preco ? ` (+Gs ${preco.toLocaleString("es-PY")})` : ""}
            </label>`;
            })
            .join("")}
        </div>`;
    });
    corpo().innerHTML =
      html ||
      '<p style="color:#aaa;font-size:0.85rem">Nenhuma etapa configurada.</p>';
  }

  // ── COMBO FECHADO ─────────────────────────────────────────────
  else if (tipo === "combo_fechado") {
    const limite = cfg.limite_total || 0;
    const sabores = cfg.sabores || [];

    // Contador global de itens selecionados
    window._pdvCfContadores = {};
    sabores.forEach((s) => { window._pdvCfContadores[s.id || s.nome] = 0; });

    const _cfTotal = () => Object.values(window._pdvCfContadores).reduce((a, b) => a + b, 0);

    const _cfAtualizarHeader = () => {
      const tot = _cfTotal();
      const headerEl = modal.querySelector("#_pdv_cf_header");
      if (headerEl) {
        headerEl.textContent = `${tot} / ${limite} selecionados`;
        headerEl.style.color = tot === limite ? "#1a7a2e" : "#555";
        headerEl.style.fontWeight = tot === limite ? "800" : "600";
      }
      // Botão Adicionar só habilita quando total === limite
      const btn = modal.querySelector("#_pdv-modal-add");
      if (btn) {
        btn.disabled = tot !== limite;
        btn.style.opacity = tot !== limite ? "0.45" : "1";
      }
    };

    let html = `
      <div id="_pdv_cf_header_wrap" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:10px 14px;text-align:center;margin-bottom:14px">
        <div id="_pdv_cf_header" style="font-size:1rem;font-weight:600;color:#555">0 / ${limite} selecionados</div>
      </div>
      <p style="font-size:0.82rem;font-weight:700;color:#1a7a2e;margin-bottom:10px">📦 Distribua ${limite} ${limite === 1 ? "item" : "itens"} entre os sabores:</p>
      <div style="display:flex;flex-direction:column;gap:8px" id="_pdv_cf_sabores">
        ${sabores.map((s) => {
          const key = s.id || s.nome;
          return `
          <div style="display:flex;align-items:center;justify-content:space-between;border:1.5px solid #e5e7eb;border-radius:10px;padding:10px 12px;background:#fff" data-cf-key="${key}">
            <div style="font-size:0.92rem;font-weight:600;color:#1a1a1a;flex:1">${s.nome}</div>
            <div style="display:flex;align-items:center;gap:8px">
              <button type="button"
                style="width:32px;height:32px;border-radius:50%;border:1.5px solid #d1d5db;background:#f3f4f6;font-size:1.1rem;font-weight:700;cursor:pointer;color:#374151;display:flex;align-items:center;justify-content:center;line-height:1"
                onclick="(function(btn){
                  var key='${key}';
                  var cur=window._pdvCfContadores[key]||0;
                  if(cur<=0)return;
                  window._pdvCfContadores[key]=cur-1;
                  btn.closest('[data-cf-key]').querySelector('.cf-qtd-val').textContent=window._pdvCfContadores[key];
                  var row=btn.closest('[data-cf-key]');
                  row.style.borderColor=window._pdvCfContadores[key]>0?'#1a7a2e':'#e5e7eb';
                  row.style.background=window._pdvCfContadores[key]>0?'#f0fdf4':'#fff';
                  if(typeof _pdvCfAtualizarHeader_${cacheKey}==='function')_pdvCfAtualizarHeader_${cacheKey}();
                })(this)">−</button>
              <span class="cf-qtd-val" style="font-size:1rem;font-weight:800;color:#1a1a1a;min-width:24px;text-align:center">0</span>
              <button type="button"
                style="width:32px;height:32px;border-radius:50%;border:1.5px solid #1a7a2e;background:#f0fdf4;font-size:1.1rem;font-weight:700;cursor:pointer;color:#1a7a2e;display:flex;align-items:center;justify-content:center;line-height:1"
                onclick="(function(btn){
                  var key='${key}';
                  var total=${limite};
                  var cur=window._pdvCfContadores[key]||0;
                  var tot=Object.values(window._pdvCfContadores).reduce(function(a,b){return a+b;},0);
                  if(tot>=total)return;
                  window._pdvCfContadores[key]=cur+1;
                  btn.closest('[data-cf-key]').querySelector('.cf-qtd-val').textContent=window._pdvCfContadores[key];
                  var row=btn.closest('[data-cf-key]');
                  row.style.borderColor='#1a7a2e';
                  row.style.background='#f0fdf4';
                  if(typeof _pdvCfAtualizarHeader_${cacheKey}==='function')_pdvCfAtualizarHeader_${cacheKey}();
                })(this)">+</button>
            </div>
          </div>`;
        }).join("")}
      </div>`;

    corpo().innerHTML = html;

    // Expõe o updater com chave única para ser chamado pelos onclick inline
    window[`_pdvCfAtualizarHeader_${cacheKey}`] = _cfAtualizarHeader;

    // Estado inicial do botão (desabilitado até completar)
    _cfAtualizarHeader();
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// ── Confirmar seleção do modal de opções PDV ─────────────────────
function _pdvModalConfirmar(cacheKey) {
  const modal = document.getElementById("pdv-opcoes-modal");
  if (!modal) return;
  const produto = window._pdvProdCache[cacheKey];
  if (!produto) return;
  const cfg = produto.montagem_config || {};
  const tipo = cfg.__tipo || "";
  const obs = modal.querySelector("#_pdv-obs-input")?.value?.trim() || "";

  let preco = produto.preco || 0;
  const montagem = [];
  let variacaoLabel = "";

  if (tipo === "variacoes") {
    const idx = parseInt(
      modal.querySelector('input[name="_pdv_var"]:checked')?.value ?? 0,
    );
    const v = (cfg.variacoes || [])[idx];
    if (v) {
      preco = v.preco || preco;
      variacaoLabel = v.nome;
    }
  } else if (tipo === "pizza") {
    const tamIdx = parseInt(
      modal.querySelector('input[name="_pdv_pizza_tam"]:checked')?.value ?? 0,
    );
    const tam = (cfg.tamanhos || [])[tamIdx];
    const borda =
      modal.querySelector('input[name="_pdv_pizza_borda"]:checked')?.value ||
      "";
    // Coleta sabores com seus tipos (igual ao app.js)
    const saboresSel = [
      ...modal.querySelectorAll("#_pdv_sabores_lista input[type=checkbox]:checked"),
    ].map(c => ({
      nome: c.value,
      tipo: c.closest("label")?.dataset.tipoSabor || "",
    }));

    if (!saboresSel.length) {
      alert("Escolha pelo menos 1 sabor.");
      return;
    }

    // Preço = max entre os tipos dos sabores selecionados — REGRA DE OURO (igual app.js)
    const _pdvPrecoPorTipo = (tamObj, tipo) => {
      if (!tamObj) return 0;
      const precos = tamObj.precos || {};
      if (tipo && precos[tipo] > 0) return precos[tipo];
      if (tipo) {
        const k = Object.keys(precos).find(k2 => k2.toLowerCase() === (tipo || "").toLowerCase());
        if (k && precos[k] > 0) return precos[k];
      }
      return tamObj.preco || 0;
    };
    const precostipos = saboresSel.map(s => _pdvPrecoPorTipo(tam, s.tipo));
    preco = precostipos.length > 0 ? Math.max(...precostipos) : (tam?.preco || preco);

    const bordaPreco = borda
      ? cfg.bordas?.find((b) => b.nome === borda)?.preco || 0
      : 0;
    preco += bordaPreco;

    variacaoLabel = tam?.nome || "";
    montagem.push("Sabores: " + saboresSel.map(s => s.nome).join(" / "));
    if (borda) montagem.push("Borda: " + borda);
  } else if (tipo === "shake") {
    const sk = cfg.shake || {};
    const tamIdx = parseInt(
      modal.querySelector('input[name="_pdv_shake_tam"]:checked')?.value ?? 0,
    );
    const tam = (sk.tamanhos || [])[tamIdx];
    const saborSel =
      modal.querySelector('input[name="_pdv_shake_sabor"]:checked')?.value ||
      "";
    const saborObj = sk.sabores?.find((s) => s.nome === saborSel);
    preco = (tam?.preco || preco) + (saborObj?.preco || 0);
    variacaoLabel = tam?.nome || "";
    if (saborSel) montagem.push(saborSel);
  } else if (tipo === "acai") {
    const tamIdx = parseInt(
      modal.querySelector('input[name="_pdv_acai_tam"]:checked')?.value ?? 0,
    );
    const tam = (cfg.tamanhos || [])[tamIdx];
    preco = tam?.preco || preco;
    variacaoLabel = tam?.nome || "";
    modal.querySelectorAll('input[type="checkbox"]:checked').forEach((c) => {
      const nome = c.value;
      const acomp = cfg.acompanhamentos?.find((a) => a.nome === nome);
      if (acomp?.preco) preco += acomp.preco;
      montagem.push(nome);
    });
  } else if (tipo === "suco") {
    const tamIdx = parseInt(
      modal.querySelector('input[name="_pdv_suco_tam"]:checked')?.value ?? 0,
    );
    const tam = (cfg.tamanhos || [])[tamIdx];
    preco = tam?.preco || preco;
    variacaoLabel = tam?.nome || "";
    modal
      .querySelectorAll('input[type="checkbox"]:checked')
      .forEach((c) => montagem.push(c.value));
  } else if (tipo === "sorvete") {
    const tamIdx = parseInt(
      modal.querySelector('input[name="_pdv_sorv_tam"]:checked')?.value ?? 0,
    );
    const tam = (cfg.tamanhos || [])[tamIdx];
    const varSel =
      modal.querySelector('input[name="_pdv_sorv_var"]:checked')?.value || "";
    const varObj = cfg.variacoes?.find((v) => v.nome === varSel);
    preco = (tam?.preco || preco) + (varObj?.preco || 0);
    variacaoLabel = tam?.nome
      ? `${tam.nome}${varSel ? " — " + varSel : ""}`
      : varSel;
    modal.querySelectorAll('input[type="checkbox"]:checked').forEach((c) => {
      const nome = c.value;
      const sabor = cfg.sabores?.find((s) => s.nome === nome);
      if (sabor?.preco) preco += sabor.preco;
      montagem.push(nome);
    });
  } else if (tipo === "montavel") {
    modal.querySelectorAll('input[type="checkbox"]:checked').forEach((c) => {
      const nome = c.value;
      const item = cfg.etapas
        ?.flatMap((e) => e.itens || [])
        .find((it) => (it.nome || it) === nome);
      if (item?.preco) preco += item.preco;
      montagem.push(nome);
    });
  } else if (tipo === "combo_fechado") {
    // Valida que o total bate com o limite
    const limite = cfg.limite_total || 0;
    const contadores = window._pdvCfContadores || {};
    const totalSel = Object.values(contadores).reduce((a, b) => a + b, 0);
    if (totalSel !== limite) {
      alert(`⚠️ Distribua exatamente ${limite} ${limite === 1 ? "item" : "itens"} entre os sabores.`);
      return;
    }
    // Monta a descrição: só sabores com qtd > 0
    (cfg.sabores || []).forEach((s) => {
      const key = s.id || s.nome;
      const qtd = contadores[key] || 0;
      if (qtd > 0) {
        montagem.push(qtd > 1 ? `${s.nome} (×${qtd})` : s.nome);
      }
    });
    // Usa o preço base do produto — sem acréscimo por sabor
    preco = produto.preco || 0;
  }

  carrinhoPDV.push({
    id: produto.id,
    nome: produto.nome,
    img: produto.imagem_url,
    categoria_slug: produto.categoria_slug || "",
    es_bebida: produto.es_bebida || false,
    preco,
    qtd: 1,
    variacao: variacaoLabel,
    montagem,
    obs,
  });
  atualizarCarrinhoPDV();
  modal.remove();

  if (_deveMostrarExtrasGlobais(produto)) {
    _getExtrasGlobais().then((extras) => {
      if (extras?.length > 0) _mostrarUpsellExtrasPDV(produto, extras);
    });
  }
}
let _toledoPort = null;          // Web Serial: porta da balança Toledo
let _toledoReader = null;        // Reader ativo (necessário para cancel() no fechamento)
let _toledoLeituraAtiva = false; // Flag: evita readers simultâneos na mesma porta

// ── GAVETA AUTOMÁTICA — DC-335 via Ethernet ──────────────────────────────────
const _GAVETA_BRIDGE_URL = "http://127.0.0.1:9091/abrir";

function _gavetaDeveAbrir(formaPagamento, obsPagamento = "") {
  if (!formaPagamento) return false;
  const fp = formaPagamento.toLowerCase();

  // Multipagamento: abre gaveta SOMENTE se ao menos um componente
  // for Efetivo/Dinheiro ou Cartão — ignora divisões só com PIX, etc.
  if (fp === "multipagamento") {
    try {
      const partes = JSON.parse(obsPagamento || "[]");
      return Array.isArray(partes) && partes.some((p) =>
        _gavetaDeveAbrir(p.metodo || "")
      );
    } catch (_) {
      return false;
    }
  }

  return (
    fp.includes("efetivo")  ||
    fp.includes("dinheiro") ||
    fp.includes("cart")     ||
    fp.includes("debito")   ||
    fp.includes("credito")  ||
    fp.includes("crédito")  ||
    fp.includes("débito")
  );
}

async function _abrirGavetaDC335(contexto = "") {
  try {
    const res = await fetch(_GAVETA_BRIDGE_URL, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`[Gaveta] ✅ Aberta${contexto ? " — " + contexto : ""}`);
  } catch (err) {
    console.warn(`[Gaveta] ⚠️ Bridge offline ou gaveta inacessível${contexto ? " (" + contexto + ")" : ""}: ${err.message}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  LEITURA CONTÍNUA — Toledo Prix 3 Fit (Prt1/Prt2)
//  Protocolo: stream contínuo a 4800 baud, sem disparo manual.
//  Formato de saída da balança: 5 dígitos ASCII = peso em gramas (ex: "01490" = 1490g).
//  A função é separada de _kgConectarBalanca para poder ser chamada tanto na
//  reconexão automática (modal já aberto + porta já conectada) quanto no fluxo
//  normal de conexão nova.
// ──────────────────────────────────────────────────────────────────────────────
async function _kgIniciarLeituraBalanca() {
  if (!_toledoPort) {
    console.warn("[Balança] _kgIniciarLeituraBalanca: _toledoPort é null");
    return;
  }
  if (_toledoLeituraAtiva) {
    console.log("[Balança] Leitura já ativa — ignorando chamada duplicada");
    return;
  }

  _toledoLeituraAtiva = true;
  console.log("[Balança] Iniciando leitura contínua...");

  const txtBal = document.getElementById("_kg-balanca-txt");
  const btnBal = document.getElementById("_kg-btn-balanca");

  // Adquire reader; se a readable stream já estiver locada (reader anterior não liberado),
  // aguarda 200ms e tenta uma vez mais antes de desistir
  try {
    _toledoReader = _toledoPort.readable.getReader();
  } catch (e) {
    console.warn("[Balança] Readable locked — aguardando 200ms e tentando novamente:", e.message);
    await new Promise(r => setTimeout(r, 200));
    try {
      _toledoReader = _toledoPort.readable.getReader();
    } catch (e2) {
      console.error("[Balança] Falha ao obter reader (porta em uso?):", e2.message);
      _toledoLeituraAtiva = false;
      if (txtBal) txtBal.textContent = "⚠️ Porta ocupada — reconecte a balança";
      return;
    }
  }

  // latin1 evita exceções com bytes > 127 que a Toledo pode enviar como delimitadores de frame
  const decoder = new TextDecoder("latin1");

  let buffer        = "";
  let ultimoGramas  = -1;
  let contEstavel   = 0;
  // Quantos chunks consecutivos com o mesmo valor são necessários para confirmar a leitura.
  // Valor 2 é suficiente para stream contínuo ~5 Hz; aumente se houver ruído.
  const ESTAVEL_MIN = 2;

  // ── Parser multi-formato Toledo Prix 3 Fit ──────────────────────────────────
  // Formato 1 (Prt1 contínuo): "01490\r\n" → 1490g
  // Formato 2 (com unidade):   "  1.490 kg\r\n" ou "1,490kg\r\n"
  // Formato 3 (prefixo ST):    "ST,GS,+  1.490kg\r\n"
  // Formato 4 (raw stream):    bytes consecutivos sem \r\n — ex: "014900149001490"
  // ────────────────────────────────────────────────────────────────────────────
  function _parsearGramas(texto) {
    // Formato 1 — "kg" explícito: "1.490 kg", "1,490kg", "ST,GS,+ 1.490kg"
    const mKg = texto.match(/([0-9]+[.,][0-9]{1,3})\s*kg/i);
    if (mKg) {
      const v = parseFloat(mKg[1].replace(",", "."));
      if (!isNaN(v) && v >= 0) return Math.round(v * 1000);
    }

    // Formato 2 — Toledo Prix 3 Fit Prt1 (stream contínuo sem unidade):
    // Frame: STX(0x02) + "NN.NNN" + CR(0x0D)
    // Exemplos reais: "00.124" = 124g | "01.490" = 1490g | "00.000" = 0g
    const mToledo = texto.match(/(\d{1,2}[.,]\d{3})/);
    if (mToledo) {
      const v = parseFloat(mToledo[1].replace(",", "."));
      if (!isNaN(v) && v >= 0) return Math.round(v * 1000);
    }

    // Formato 3 — inteiro 5-6 dígitos = gramas direto: "01490" = 1490g
    const mInt = texto.match(/(\d{5,6})/);
    if (mInt) {
      const v = parseInt(mInt[1], 10);
      if (!isNaN(v) && v >= 0) return v;
    }
    return null;
  }

  try {
    while (true) {
      const { value, done } = await _toledoReader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      buffer += chunk;

      // Log bruto nos primeiros 10 chunks para diagnóstico (desativa após)
      if (contEstavel === 0 && buffer.length <= 200) {
        const hex = Array.from(value).map(b => b.toString(16).padStart(2,"0")).join(" ");
        console.log(`[Balança] RAW HEX: ${hex}  |  TEXT: ${JSON.stringify(chunk)}`);
      }

      // Descarta dados antigos — janela deslizante de 128 chars
      if (buffer.length > 128) buffer = buffer.slice(-128);

      // Tenta extrair linhas completas primeiro (formato com \r\n)
      const linhas = buffer.split(/[\r\n]+/);
      // O último elemento pode ser fragmento incompleto — preserva
      buffer = linhas.pop() ?? "";

      let grama = null;

      // Processa linhas completas se houver
      for (const linha of linhas) {
        const candidato = _parsearGramas(linha.trim());
        if (candidato !== null) { grama = candidato; break; }
      }

      // Fallback: tenta extrair do buffer acumulado (stream sem \r\n)
      if (grama === null) {
        const candidato = _parsearGramas(buffer);
        if (candidato !== null) grama = candidato;
      }

      if (grama === null) continue;

      // Estabilidade: mesmo valor por ESTAVEL_MIN ciclos → confirma
      if (grama === ultimoGramas) {
        contEstavel++;
      } else {
        ultimoGramas = grama;
        contEstavel  = 1;
      }

      // Atualiza label em tempo real (antes de confirmar estabilidade)
      if (txtBal) {
        const kgFmt = (grama / 1000).toFixed(3).replace(".", ",");
        txtBal.textContent = grama > 0
          ? `🟢 Lendo: ${kgFmt} kg (${grama}g)${contEstavel < ESTAVEL_MIN ? " ⏳" : " ✔"}`
          : "🟢 Balança zerada — aguardando objeto...";
      }

      if (contEstavel < ESTAVEL_MIN) continue;

      // ── Peso estável → injeta no input ──────────────────────────────────────
      const inp = document.getElementById("_kg-input-g");
      if (inp && parseInt(inp.value || "0") !== grama) {
        console.log(`[Balança] Peso confirmado: ${grama}g`);
        inp.value = grama > 0 ? grama : "";
        window._kgAtualizarPreview?.();
        inp.style.borderColor = "#16a34a";
        inp.style.background  = "#f0fdf4";
        setTimeout(() => {
          if (inp) { inp.style.borderColor = "#0891b2"; inp.style.background = ""; }
        }, 800);
      }
    }
  } catch (e) {
    if (e.name !== "AbortError") {
      console.error("[Balança] Erro durante leitura:", e.name, e.message);
      if (txtBal) txtBal.textContent = "🔴 Balança desconectada — clique para reconectar";
      if (btnBal) {
        btnBal.style.background    = "#fff";
        btnBal.style.borderStyle   = "dashed";
        btnBal.style.borderColor   = "#0891b2";
        btnBal.style.color         = "#0891b2";
      }
      _toledoPort = null;
    } else {
      console.log("[Balança] Leitura encerrada (AbortError — desconexão intencional)");
    }
  } finally {
    try { _toledoReader.releaseLock(); } catch (_) {}
    _toledoReader       = null;
    _toledoLeituraAtiva = false;
    console.log("[Balança] Reader liberado.");
  }
}

function _mostrarModalPesoPDV(produto, precoKg) {
  document.getElementById("pdv-kg-modal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "pdv-kg-modal";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  const modal = document.createElement("div");
  modal.style.cssText =
    "background:#fff;border-radius:20px;padding:24px 20px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.35)";

  // Formata peso digitado: trata como gramas, exibe "300g" ou "1,230 kg"
  function formatarPeso(gramas) {
    if (!gramas || gramas <= 0) return "";
    if (gramas < 1000) return gramas + "g";
    const kg = (gramas / 1000).toFixed(3).replace(/\.?0+$/, "");
    return kg.replace(".", ",") + " kg";
  }

  function calcularPreco(gramas) {
    return Math.round((precoKg * gramas) / 1000);
  }

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div>
        <div style="font-size:1rem;font-weight:800;color:#0891b2">⚖️ ${produto.nome}</div>
        <div style="font-size:0.8rem;color:#888;margin-top:2px">Gs ${precoKg.toLocaleString("es-PY")} / kg</div>
      </div>
      <button id="_kg-close" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#999;line-height:1">✕</button>
    </div>

    <!-- Display de peso -->
    <div style="background:#f0fdfe;border:2px solid #a5f3fc;border-radius:14px;padding:16px;text-align:center;margin-bottom:14px">
      <div style="font-size:2.6rem;font-weight:800;color:#0891b2;letter-spacing:-1px;line-height:1" id="_kg-display-peso">—</div>
      <div style="font-size:0.78rem;color:#0e7490;margin-top:4px">Peso</div>
    </div>

    <!-- Input gramas -->
    <div style="margin-bottom:12px">
      <label style="font-size:0.8rem;font-weight:700;color:#555;display:block;margin-bottom:6px">
        Digite o peso em gramas:
      </label>
      <div style="display:flex;align-items:center;gap:8px">
        <input type="number" id="_kg-input-g" min="1" step="1" placeholder="Ex: 300"
          style="flex:1;font-size:1.5rem;font-weight:700;padding:10px 14px;border:2px solid #0891b2;border-radius:10px;text-align:center;color:#0891b2;outline:none"
          oninput="_kgAtualizarPreview()" onkeydown="if(event.key==='Enter')_kgConfirmar()">
        <span style="font-size:1rem;font-weight:700;color:#888;white-space:nowrap">g</span>
      </div>
      <div style="font-size:0.73rem;color:#888;margin-top:4px;text-align:center">
        Acima de 1000g é convertido automaticamente para kg
      </div>
    </div>

    <!-- Preview preço -->
    <div id="_kg-preview-preco" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:none">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:0.85rem;color:#166534">Total a cobrar:</span>
        <span id="_kg-preco-val" style="font-size:1.5rem;font-weight:800;color:#16a34a">Gs 0</span>
      </div>
      <div id="_kg-peso-formatado" style="font-size:0.75rem;color:#4ade80;text-align:right;margin-top:2px"></div>
    </div>

    <!-- Botão balança Toledo -->
    <button id="_kg-btn-balanca" onclick="_kgConectarBalanca()"
      style="width:100%;padding:10px;background:#fff;border:2px dashed #0891b2;border-radius:10px;color:#0891b2;font-weight:700;font-size:0.85rem;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px">
      🔌 <span id="_kg-balanca-txt">Conectar Balança (Toledo Prix 3)</span>
    </button>

    <!-- Confirmar -->
    <button id="_kg-btn-ok" onclick="_kgConfirmar()"
      disabled
      style="width:100%;padding:14px;background:#0891b2;color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;opacity:0.5;transition:all 0.2s">
      ✅ Adicionar ao Pedido
    </button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.querySelector("#_kg-close").onclick = () => overlay.remove();

  // Se balança já conectada → inicia leitura automática
  if (_toledoPort) {
    const btnBal = document.getElementById("_kg-btn-balanca");
    const txtBal = document.getElementById("_kg-balanca-txt");
    if (btnBal) {
      btnBal.style.borderStyle = "solid";
      btnBal.style.background = "#e0f7fa";
    }
    if (txtBal)
      txtBal.textContent = "🟢 Balança conectada — aguardando peso...";
    setTimeout(() => _kgIniciarLeituraBalanca(), 100);
  }

  // Funções locais expostas globalmente (escopo do modal)
  window._kgAtualizarPreview = function () {
    const g = parseInt(document.getElementById("_kg-input-g")?.value) || 0;
    const displayPeso = document.getElementById("_kg-display-peso");
    const previewBox = document.getElementById("_kg-preview-preco");
    const precoVal = document.getElementById("_kg-preco-val");
    const pesoFmt = document.getElementById("_kg-peso-formatado");
    const btnOk = document.getElementById("_kg-btn-ok");

    if (g > 0) {
      const fmt = formatarPeso(g);
      const preco = calcularPreco(g);
      if (displayPeso) displayPeso.textContent = fmt;
      if (precoVal)
        precoVal.textContent = `Gs ${preco.toLocaleString("es-PY")}`;
      if (pesoFmt)
        pesoFmt.textContent = `${g}g = ${fmt} × Gs ${precoKg.toLocaleString("es-PY")}/kg`;
      if (previewBox) previewBox.style.display = "block";
      if (btnOk) {
        btnOk.disabled = false;
        btnOk.style.opacity = "1";
      }
    } else {
      if (displayPeso) displayPeso.textContent = "—";
      if (previewBox) previewBox.style.display = "none";
      if (btnOk) {
        btnOk.disabled = true;
        btnOk.style.opacity = "0.5";
      }
    }
  };

  window._kgConfirmar = function () {
    const g = parseInt(document.getElementById("_kg-input-g")?.value) || 0;
    if (!g || g <= 0) {
      document.getElementById("_kg-input-g")?.focus();
      return;
    }
    const preco = calcularPreco(g);
    carrinhoPDV.push({
      id: produto.id + "_kg_" + Date.now(),
      nome: produto.nome,
      preco: preco,
      preco_kg: precoKg,
      peso_gramas: g,
      qtd: 1,
      _isKg: true,
      img: produto.imagem_url || "",
      categoria_slug: produto.categoria_slug || "",
      es_bebida: produto.es_bebida || false,
      montagem: [],
      obs: "",
    });
    atualizarCarrinhoPDV();
    overlay.remove();
  };

  window._kgConectarBalanca = async function () {
    const btn = document.getElementById("_kg-btn-balanca");
    const txt = document.getElementById("_kg-balanca-txt");

    // Web Serial API check
    if (!navigator.serial) {
      alert(
        "⚠️ Web Serial API não suportada neste navegador.\nUse Google Chrome ou Edge para conectar a balança.",
      );
      return;
    }

    // Se porta já conectada → desconectar (cancela reader antes de fechar a porta)
    if (_toledoPort) {
      try { if (_toledoReader) await _toledoReader.cancel(); } catch (_) {}
      try { await _toledoPort.close(); } catch (_) {}
      _toledoPort           = null;
      _toledoReader         = null;
      _toledoLeituraAtiva   = false;
      if (txt) txt.textContent = "Conectar Balança (Toledo Prix 3)";
      if (btn) {
        btn.style.background  = "#fff";
        btn.style.borderStyle = "dashed";
        btn.style.borderColor = "#0891b2";
        btn.style.color       = "#0891b2";
      }
      return;
    }

    try {
      if (txt) txt.textContent = "⏳ Aguardando seleção da porta...";
      const port = await navigator.serial.requestPort();

      // ── Parâmetros seriais da Toledo Prix 3 Fit ──
      // Confirme em Menu → C16: baud=4800, 8N1
      await port.open({
        baudRate: 4800,
        dataBits: 8,
        stopBits: 1,
        parity:   "none",
      });

      _toledoPort = port;

      if (txt) txt.textContent = "🟢 Balança conectada — aguardando peso...";
      if (btn) {
        btn.style.background  = "#ecfdf5";
        btn.style.borderStyle = "solid";
        btn.style.borderColor = "#16a34a";
        btn.style.color       = "#16a34a";
      }

      // Delega toda a leitura contínua para _kgIniciarLeituraBalanca
      _kgIniciarLeituraBalanca();

    } catch (e) {
      if (txt) txt.textContent = "Conectar Balança (Toledo Prix 3)";
      if (e.name !== "NotFoundError") {
        console.error("Erro balança:", e);
      }
    }
  };

  // Foca no input após render
  setTimeout(() => document.getElementById("_kg-input-g")?.focus(), 100);
}

window._pdvProdCache = {};

function _mostrarModalVariacaoPDV(produto, variacoes) {
  document.getElementById("pdv-var-modal")?.remove();

  // Guarda produto no cache por ID
  const cacheKey = "pdv_" + (produto.id || Date.now());
  window._pdvProdCache[cacheKey] = produto;

  const overlay = document.createElement("div");
  overlay.id = "pdv-var-modal";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  const modal = document.createElement("div");
  modal.style.cssText =
    "background:#fff;border-radius:16px;padding:20px;max-width:420px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)";

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;justify-content:space-between;align-items:center;margin-bottom:16px";
  header.innerHTML = `
    <h4 style="margin:0;font-size:1rem;color:#333">🎨 Escolha a variação</h4>
    <button id="_pdv-var-close" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#999">✕</button>`;
  modal.appendChild(header);
  modal.querySelector("#_pdv-var-close").onclick = () => overlay.remove();

  const nomeProd = document.createElement("p");
  nomeProd.style.cssText = "font-size:0.88rem;color:#666;margin-bottom:14px";
  nomeProd.textContent = produto.nome;
  modal.appendChild(nomeProd);

  const lista = document.createElement("div");
  lista.style.cssText = "display:flex;flex-direction:column;gap:10px";

  variacoes.forEach((v) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.style.cssText =
      "display:flex;align-items:center;gap:12px;background:#f9f9f9;border:2px solid #e5e7eb;border-radius:10px;padding:10px 14px;cursor:pointer;text-align:left;transition:border-color 0.15s;width:100%";
    btn.onmouseover = () => {
      btn.style.borderColor = "var(--primary)";
    };
    btn.onmouseout = () => {
      btn.style.borderColor = "#e5e7eb";
    };

    const imgSrc = v.img || produto.imagem_url;
    btn.innerHTML = `
      ${imgSrc ? `<img src="${imgSrc}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">` : ""}
      <div style="flex:1">
        <div style="font-weight:700;font-size:0.9rem;color:#333">${v.nome}</div>
        <div style="font-size:0.82rem;color:var(--primary);font-weight:600">Gs ${(v.preco || produto.preco || 0).toLocaleString("es-PY")}</div>
      </div>`;

    btn.onclick = () => {
      const p = window._pdvProdCache[cacheKey];
      if (!p) return;
      const existe = carrinhoPDV.find(
        (i) => i.id === p.id && i.variacao === v.nome,
      );
      if (existe) {
        existe.qtd++;
      } else {
        carrinhoPDV.push({
          id: p.id,
          nome: p.nome,
          img: p.imagem_url,
          categoria_slug: p.categoria_slug || "",
          es_bebida: p.es_bebida || false,
          preco: v.preco || p.preco || 0,
          qtd: 1,
          variacao: v.nome,
          montagem: [],
          obs: "",
        });
      }
      atualizarCarrinhoPDV();
      overlay.remove();
    };
    lista.appendChild(btn);
  });

  modal.appendChild(lista);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// ── Toast de upsell de extras globais ─────────────────────────────
function _mostrarUpsellExtrasPDV(produto, extras) {
  // Remove toast anterior se ainda estiver aberto
  document.getElementById("pdv-upsell-toast")?.remove();

  const toast = document.createElement("div");
  toast.id = "pdv-upsell-toast";
  toast.style.cssText = [
    "position:fixed;bottom:20px;right:16px;z-index:99998",
    "background:#fff;border-radius:14px",
    "box-shadow:0 8px 32px rgba(0,0,0,0.18)",
    "padding:0;max-width:300px;width:calc(100vw - 32px)",
    "border:1px solid #f0f0f0",
    "animation:_upsellIn 0.25s cubic-bezier(.4,0,.2,1)",
    "overflow:hidden",
  ].join(";");

  if (!document.getElementById("_upsell-style")) {
    const s = document.createElement("style");
    s.id = "_upsell-style";
    s.textContent = `
      @keyframes _upsellIn{from{transform:translateY(20px) scale(.96);opacity:0}to{transform:none;opacity:1}}
      #pdv-upsell-toast .ue-btn:hover{filter:brightness(0.92)}
    `;
    document.head.appendChild(s);
  }

  // Header
  const hdr = document.createElement("div");
  hdr.style.cssText =
    "display:flex;justify-content:space-between;align-items:center;padding:12px 14px 10px;border-bottom:1px solid #f5f5f5;background:var(--color-background-secondary)";

  // Pega o último item do carrinho que corresponde a este produto (para mostrar a variação)
  const ultimoItem = [...carrinhoPDV]
    .reverse()
    .find((i) => i.id === produto.id);
  const subtitleTxt = ultimoItem?.variacao
    ? `${produto.nome} — ${ultimoItem.variacao}`
    : produto.nome;

  hdr.innerHTML = `
    <div>
      <div style="font-weight:700;font-size:0.85rem;color:var(--color-text-primary)">➕ Adicionar ao pedido?</div>
      <div style="font-size:0.73rem;color:var(--color-text-secondary);margin-top:1px">${subtitleTxt}</div>
    </div>`;
  const btnX = document.createElement("button");
  btnX.textContent = "✕";
  btnX.style.cssText =
    "background:none;border:none;font-size:1rem;cursor:pointer;color:#bbb;padding:4px 6px;border-radius:6px;flex-shrink:0";
  btnX.addEventListener("click", () => toast.remove());
  hdr.appendChild(btnX);
  toast.appendChild(hdr);

  // Lista de extras
  const lista = document.createElement("div");
  lista.style.cssText = "padding:6px 0";
  extras.forEach((extra) => {
    if (!extra.nome) return;
    const row = document.createElement("div");
    row.style.cssText =
      "display:flex;justify-content:space-between;align-items:center;padding:7px 14px;transition:background .1s";
    row.onmouseenter = () => (row.style.background = "#fafafa");
    row.onmouseleave = () => (row.style.background = "");

    const info = document.createElement("div");
    info.innerHTML = `
      <div style="font-size:0.83rem;font-weight:600;color:#333">${extra.nome}</div>
      <div style="font-size:0.73rem;color:var(--primary,#FF441F);font-weight:700">+ Gs ${(extra.preco || 0).toLocaleString("es-PY")}</div>`;

    const btn = document.createElement("button");
    btn.className = "ue-btn";
    btn.style.cssText =
      "background:var(--primary,#FF441F);color:#fff;border:none;border-radius:8px;padding:5px 13px;font-size:0.78rem;cursor:pointer;font-weight:700;transition:all .15s;white-space:nowrap;flex-shrink:0";
    btn.textContent = "+ Add";
    btn.addEventListener("click", () => {
      const nomeExtra = extra.nome;
      const existe = carrinhoPDV.find(
        (i) => i._isExtra && i.nome === nomeExtra,
      );
      if (existe) {
        existe.qtd++;
      } else {
        carrinhoPDV.push({
          id: "ext_" + Date.now(),
          nome: nomeExtra,
          preco: extra.preco || 0,
          qtd: 1,
          _isExtra: true,
        });
      }
      atualizarCarrinhoPDV();
      btn.textContent = "✓";
      btn.style.background = "#27ae60";
      btn.disabled = true;
      row.style.opacity = "0.6";
    });

    row.appendChild(info);
    row.appendChild(btn);
    lista.appendChild(row);
  });
  toast.appendChild(lista);

  document.body.appendChild(toast);
  // Auto-fecha em 10 s
  setTimeout(() => {
    if (document.getElementById("pdv-upsell-toast") === toast) toast.remove();
  }, 10000);
}

// ── TROCO / VUELTA (Efetivo) ───────────────────────────────────────────
function pdvCalcTroco() {
  const totalEl = document.getElementById("balcao-total");
  const recebidoEl = document.getElementById("pdv-valor-recebido");
  const trocoRow = document.getElementById("pdv-troco-row");
  const trocoVal = document.getElementById("pdv-troco-val");
  if (!totalEl || !recebidoEl || !trocoRow || !trocoVal) return;

  const total = parseInt(totalEl.innerText.replace(/\D/g, "") || "0") || 0;
  const recebido = parseInt(recebidoEl.value || "0") || 0;

  if (recebido > 0 && total > 0) {
    const troco = recebido - total;
    trocoRow.style.display = "flex";
    trocoVal.textContent = Math.max(0, troco).toLocaleString("es-PY");
    trocoRow.style.background = troco >= 0 ? "#f0fdf4" : "#fff1f2";
    trocoRow.style.borderColor = troco >= 0 ? "#86efac" : "#fca5a5";
    trocoVal.style.color = troco >= 0 ? "#15803d" : "#dc2626";
    trocoVal.textContent = (troco >= 0 ? "" : "⚠️ Falta Gs ") + Math.abs(troco).toLocaleString("es-PY");
    trocoRow.querySelector("span:first-child").textContent = troco >= 0 ? "💵 Troco / Vuelta" : "💸 Valor insuficiente";
  } else {
    trocoRow.style.display = "none";
  }
}

function removerItemPDV(idx) {
  carrinhoPDV.splice(idx, 1);
  atualizarCarrinhoPDV();
}

// Edição inline de observação de item do carrinho PDV
function pdvEditarObs(idx) {
  const item = carrinhoPDV[idx];
  if (!item) return;
  // Modal leve inline — usa prompt nativo para não precisar de HTML extra
  const nova = prompt(`Observação para "${item.nome}":`, item.obs || "");
  if (nova === null) return; // cancelou
  carrinhoPDV[idx].obs = nova.trim();
  atualizarCarrinhoPDV();
}

// ── Limpa carrinho e reseta todos os campos do PDV ──────────────
function limparCarrinhoPDV() {
  if (carrinhoPDV.length > 0 && !confirm("Cancelar o pedido atual?")) return;

  carrinhoPDV = [];
  window._mesaAbertaId   = null;
  window._mesaAbertaTotal = 0;
  window._mesaAbertaPedido = null;

  // Campos do cliente
  const _set = (id, val = "") => { const el = document.getElementById(id); if (el) el.value = val; };
  _set("balcao-cliente"); _set("balcao-mesa"); _set("balcao-telefone");
  _set("balcao-endereco"); _set("balcao-geo-lat"); _set("balcao-geo-lng");
  _set("balcao-frete"); _set("pdv-desconto-val"); _set("balcao-gmaps-link");
  const _btnAbrirGmaps = document.getElementById("btn-abrir-gmaps");
  if (_btnAbrirGmaps) { _btnAbrirGmaps.style.display = "none"; _btnAbrirGmaps.href = "#"; }
  const descTipo = document.getElementById("pdv-desconto-tipo");
  if (descTipo) descTipo.value = "fixo";

  // Reset pagamento
  const selPag = document.getElementById("balcao-pag");
  if (selPag) { selPag.value = "Efetivo"; selPag.style.display = ""; }
  const boxMulti = document.getElementById("box-multi-pdv");
  if (boxMulti) boxMulti.style.display = "none";
  const multiPartes = document.getElementById("multi-partes-pdv");
  if (multiPartes) multiPartes.innerHTML = "";
  if (typeof _multiContadorPDV !== "undefined") _multiContadorPDV = 0;

  // Reset box efetivo / troco
  _set("pdv-valor-recebido");
  const trocoRow = document.getElementById("pdv-troco-row");
  if (trocoRow) trocoRow.style.display = "none";
  const efetivoBox = document.getElementById("pdv-efetivo-box");
  if (efetivoBox) efetivoBox.style.display = "none";

  // Reset delivery row
  const delivRow = document.getElementById("pdv-delivery-row");
  if (delivRow) delivRow.style.display = "none";
  const freteMsg = document.getElementById("frete-msg-pdv");
  if (freteMsg) freteMsg.innerHTML = "";

  // Reset tipo entrega visual
  document.querySelectorAll(".pdv-tipo-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tipo === "balcao");
  });
  const tipoHidden = document.getElementById("balcao-tipo-entrega");
  if (tipoHidden) tipoHidden.value = "balcao";

  // Atualiza UI do carrinho
  atualizarCarrinhoPDV();
  atualizarBarraMesasAtivas?.();
}

// ── Altera quantidade de item no carrinho PDV ────────────────────
function pdvAlterarQtd(idx, delta) {
  if (!carrinhoPDV[idx]) return;
  const novaQtd = carrinhoPDV[idx].qtd + delta;
  if (novaQtd <= 0) {
    if (!confirm("Remover este item do pedido?")) return;
    carrinhoPDV.splice(idx, 1);
  } else {
    carrinhoPDV[idx].qtd = novaQtd;
    // Recalcular preço a partir do unitário original
    if (carrinhoPDV[idx]._precoUnitario !== undefined) {
      carrinhoPDV[idx].preco = carrinhoPDV[idx]._precoUnitario * novaQtd;
    }
  }
  atualizarCarrinhoPDV();
}

function atualizarCarrinhoPDV() {
  const lista = document.getElementById("pdv-lista");
  const totalEl = document.getElementById("balcao-total");
  if (!lista) return;

  lista.innerHTML = "";
  let total = 0;

  const cashDesc = pdvGetCashbackDesconto(total);
  total = Math.max(0, total - cashDesc);
  const elCash = document.getElementById("pdv-row-cashback");
  if (elCash) {
    elCash.style.display = cashDesc > 0 ? "flex" : "none";
    const elCashVal = document.getElementById("balcao-cashback");
    if (elCashVal) elCashVal.textContent = cashDesc.toLocaleString("es-PY");
  }

  // ── Helper: cria card de item ────────────────────────────────
  const _fmtGs = (v) => "Gs " + v.toLocaleString("es-PY");
  const _fmtPeso = (g) =>
    g >= 1000 ? (g/1000).toFixed(3).replace(/\.?0+$/,"").replace(".",",")+" kg" : g+"g";

  const _criarCard = (nome, sub, precoUnit, precoTotal, acoes, extraClass="") => {
    const d = document.createElement("div");
    d.className = "pdv-card-item" + (extraClass ? " "+extraClass : "");
    d.innerHTML = `
      <div class="pdv-card-topo">
        <div class="pdv-card-nome">${nome}${sub ? `<span class="pdv-card-sub">${sub}</span>` : ""}</div>
        <div class="pdv-card-preco-total">${_fmtGs(precoTotal)}</div>
      </div>
      ${precoUnit !== null ? `<div class="pdv-card-unit">${_fmtGs(precoUnit)} / un.</div>` : ""}
      <div class="pdv-card-acoes">${acoes}</div>`;
    return d;
  };

  // ── Itens existentes da mesa (snapshot do DB) ──────────────────
  const itensExistentes = window._mesaAbertaPedido
    ? Array.isArray(window._mesaAbertaPedido.itens)
      ? window._mesaAbertaPedido.itens : []
    : [];

  if (itensExistentes.length > 0) {
    const sec = document.createElement("div");
    sec.className = "pdv-sec-title";
    sec.textContent = "Itens já lançados";
    lista.appendChild(sec);

    itensExistentes.forEach((item, idx) => {
      const entregue = item.status_item === "entregue";
      const qtd = item.qtd || item.q || 1;
      const nome = item.nome || item.n || "Item";
      const preco = item.preco || item.p || 0;
      total += preco * qtd;

      const acoes = entregue
        ? `<span class="pdv-badge-entregue">✓ Entregue</span>`
        : `<button class="pdv-card-btn pdv-card-btn-ok" onclick="baixarItemMesa(${window._mesaAbertaId},${idx})">
            <i class="fas fa-check"></i> Baixar</button>`;

      lista.appendChild(_criarCard(
        nome + (entregue ? ' <span class="pdv-badge-entregue">✓</span>' : ""),
        `${qtd}× un.`, preco, preco*qtd, acoes,
        "pdv-card-existente" + (entregue ? " pdv-card-entregue" : "")
      ));
    });
  }

  // ── Novos itens (carrinhoPDV) ──────────────────────────────────
  if (carrinhoPDV.length > 0) {
    const sec2 = document.createElement("div");
    sec2.className = "pdv-sec-title pdv-sec-novo";
    sec2.textContent = itensExistentes.length > 0 ? "+ Novos itens" : "Itens do pedido";
    lista.appendChild(sec2);

    carrinhoPDV.forEach((item, idx) => {
      total += item.preco * item.qtd;
      const obsHtml = item.obs ? `<span class="pdv-card-obs">📝 ${item.obs}</span>` : "";
      let sub, precoUnit, acoes;

      if (item._isKg) {
        sub = "⚖️ " + _fmtPeso(item.peso_gramas || 0);
        precoUnit = null;
        acoes = `<button class="pdv-card-btn pdv-card-btn-edit" onclick="pdvEditarObs(${idx})">✏️ Editar</button>
                 <button class="pdv-card-btn pdv-card-btn-del" onclick="removerItemPDV(${idx})">🗑️ Excluir</button>`;
      } else {
        sub = null;
        precoUnit = item._precoUnitario !== undefined ? item._precoUnitario : item.preco / item.qtd;
        acoes = `
          <div class="pdv-card-qtd-ctrl">
            <button class="pdv-card-qtd-btn" onclick="pdvAlterarQtd(${idx},-1)">−</button>
            <span class="pdv-card-qtd-val">${item.qtd}</span>
            <button class="pdv-card-qtd-btn" onclick="pdvAlterarQtd(${idx},+1)">+</button>
          </div>
          <button class="pdv-card-btn pdv-card-btn-edit" onclick="pdvEditarObs(${idx})">✏️ Editar</button>
          <button class="pdv-card-btn pdv-card-btn-del" onclick="removerItemPDV(${idx})">🗑️ Excluir</button>`;
      }

      lista.appendChild(_criarCard(item.nome + obsHtml, sub, precoUnit, item.preco * item.qtd, acoes));
    });
  }

  if (itensExistentes.length === 0 && carrinhoPDV.length === 0) {
    const vazio = document.createElement("div");
    vazio.className = "pdv-lista-vazio";
    vazio.textContent = "Nenhum item adicionado.";
    lista.appendChild(vazio);
  }

  if (totalEl) totalEl.innerText = total.toLocaleString("es-PY");

  // ── Desconto ──────────────────────────────────────────────────
  const descTipo =
    document.getElementById("pdv-desconto-tipo")?.value || "fixo";
  const descValRaw =
    parseFloat(document.getElementById("pdv-desconto-val")?.value || "0") || 0;
  let desconto = 0;
  if (descValRaw > 0) {
    desconto =
      descTipo === "percentual"
        ? Math.round((total * descValRaw) / 100)
        : Math.round(descValRaw);
    desconto = Math.min(desconto, total);
  }
  const totalComDesc = total - desconto;

  // Atualiza subtotal
  const subEl = document.getElementById("balcao-subtotal");
  if (subEl) subEl.innerText = total.toLocaleString("es-PY");

  // Linha de desconto
  const rowDesc = document.getElementById("pdv-row-desconto");
  const descEl = document.getElementById("balcao-desconto");
  if (rowDesc) rowDesc.style.display = desconto > 0 ? "flex" : "none";
  if (descEl) descEl.innerText = desconto.toLocaleString("es-PY");

  // Total final
  if (totalEl) totalEl.innerText = totalComDesc.toLocaleString("es-PY");

  // Frete (delivery)
  const frete =
    parseInt(document.getElementById("balcao-frete")?.value || "0") || 0;
  const tipoEntrega =
    document.getElementById("balcao-tipo-entrega")?.value || "balcao";
  const totalFinal = totalComDesc + (tipoEntrega === "delivery" ? frete : 0);
  if (totalEl) totalEl.innerText = totalFinal.toLocaleString("es-PY");

  // Atualiza barra inferior mobile
  const mobileQtd = document.getElementById("pdv-mobile-qtd");
  const mobileTot = document.getElementById("pdv-mobile-total-val");
  const qtdTotal = carrinhoPDV.reduce((a, i) => a + i.qtd, 0);
  if (mobileQtd)
    mobileQtd.textContent = qtdTotal + (qtdTotal === 1 ? " item" : " itens");
  if (mobileTot) mobileTot.textContent = totalFinal.toLocaleString("es-PY");

  atualizarInfoPagPDV(totalFinal);
}

function atualizarInfoPagPDV(total) {
  const pag = document.getElementById("balcao-pag")?.value;
  const infoBox = document.getElementById("balcao-pag-info");
  const boxMultiPDV = document.getElementById("box-multi-pdv");
  const selectPag = document.getElementById("balcao-pag");
  if (!infoBox) return;

  infoBox.style.display = "none";
  if (boxMultiPDV) boxMultiPDV.style.display = "none";
  if (selectPag) selectPag.style.display = "";

  // Mostrar/ocultar box Efetivo (valor recebido + troco)
  const efetivoBox = document.getElementById("pdv-efetivo-box");
  const recebidoInput = document.getElementById("pdv-valor-recebido");
  const trocoRow = document.getElementById("pdv-troco-row");
  if (efetivoBox) {
    if (pag === "Efetivo") {
      efetivoBox.style.display = "block";
      if (recebidoInput) recebidoInput.focus();
      pdvCalcTroco();
    } else {
      efetivoBox.style.display = "none";
      if (recebidoInput) recebidoInput.value = "";
      if (trocoRow) trocoRow.style.display = "none";
    }
  }

  if (pag === "CartaoBR" && total > 0) {
    infoBox.style.display = "block";
    const _renderCarBR = () => {
      const taxa =
        _cartaoBRTipoPDV === "debito" ? _taxaDebitoPDV : _taxaCreditoPDV;
      const brl =
        _cotacaoPDV > 0
          ? ((total / _cotacaoPDV) * (1 + taxa / 100)).toFixed(2)
          : "---";
      infoBox.innerHTML = `
        <div style="font-size:0.78rem;font-weight:700;margin-bottom:6px">💳🇧🇷 Cartão Brasileiro</div>
        <div style="display:flex;gap:6px;margin-bottom:8px">
          <button type="button" onclick="_setPDVBRTipo('debito')"
            style="flex:1;padding:6px 4px;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.75rem;
                   border:2px solid ${_cartaoBRTipoPDV === "debito" ? "#1a7a2e" : "#ccc"};
                   background:${_cartaoBRTipoPDV === "debito" ? "#eafaf1" : "#f8f9fa"};
                   color:${_cartaoBRTipoPDV === "debito" ? "#1a7a2e" : "#555"}">
            Débito<br><small>${_taxaDebitoPDV.toFixed(2)}%</small></button>
          <button type="button" onclick="_setPDVBRTipo('credito')"
            style="flex:1;padding:6px 4px;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.75rem;
                   border:2px solid ${_cartaoBRTipoPDV === "credito" ? "#1a7a2e" : "#ccc"};
                   background:${_cartaoBRTipoPDV === "credito" ? "#eafaf1" : "#f8f9fa"};
                   color:${_cartaoBRTipoPDV === "credito" ? "#1a7a2e" : "#555"}">
            Crédito<br><small>${_taxaCreditoPDV.toFixed(2)}%</small></button>
        </div>
        <div style="text-align:center;font-size:1rem;font-weight:900;color:#1a7a2e">R$ ${brl}</div>`;
    };
    window._setPDVBRTipo = (tipo) => {
      _cartaoBRTipoPDV = tipo;
      _renderCarBR();
    };
    window._renderCarBRPDV = _renderCarBR;
    _renderCarBR();
  } else if (pag === "Pix" && total > 0) {
    const valorReais = (total / _cotacaoPDV).toFixed(2);
    infoBox.style.display = "block";
    infoBox.innerHTML = `<i class="fas fa-qrcode"></i> <strong>Cobrar em Pix: R$ ${valorReais}</strong>`;
  } else if (pag === "Multipagamento") {
    if (selectPag) selectPag.style.display = "none";
    if (boxMultiPDV) {
      boxMultiPDV.style.display = "block";
      const partesEl = document.getElementById("multi-partes-pdv");
      if (partesEl && partesEl.children.length === 0) {
        adicionarPartePagamentoPDV();
        adicionarPartePagamentoPDV();
      }
      atualizarRestanteMultiPDV();
    }
  }
}

// ── MULTIPAGAMENTO PDV ─────────────────────────────────────────────
let _multiContadorPDV = 0;

function voltarPagamentoPDVUnico() {
  document.getElementById("balcao-pag").value = "Efetivo";
  document.getElementById("box-multi-pdv").style.display = "none";
  document.getElementById("multi-partes-pdv").innerHTML = "";
  document.getElementById("balcao-pag").style.display = "";
  _multiContadorPDV = 0;
  atualizarInfoPagPDV(
    parseInt(
      document.getElementById("balcao-total").innerText.replace(/\D/g, ""),
    ) || 0,
  );
}

function adicionarPartePagamentoPDV() {
  const container = document.getElementById("multi-partes-pdv");
  if (!container) return;
  _multiContadorPDV++;
  const id = _multiContadorPDV;
  const ordinal = ["1ª", "2ª", "3ª", "4ª", "5ª"][id - 1] || `${id}ª`;
  const opts = [
    { v: "Efetivo", l: "💵 Efectivo" },
    { v: "Cartao", l: "💳 Tarjeta" },
    { v: "CartaoBR", l: "💳🇧🇷 Cartão BR" },
    { v: "Pix", l: "🟢 Pix" },
    { v: "Transferencia", l: "🏦 Alias" },
    { v: "QrPy", l: "📱 QR Paraguay" },
  ]
    .map((m) => `<option value="${m.v}">${m.l}</option>`)
    .join("");

  const card = document.createElement("div");
  card.id = `multi-parte-pdv-${id}`;
  card.style.cssText =
    "background:white;border:1.5px solid #e0e0e0;border-radius:10px;padding:12px;margin-bottom:8px";
  card.innerHTML = `
    <div style="font-size:0.72rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">${ordinal} FORMA</div>
    <div style="display:flex;gap:8px;align-items:center">
      <select id="multi-metodo-pdv-${id}" onchange="atualizarRestanteMultiPDV()"
          style="flex:1.5;padding:8px;border:1.5px solid #e0e0e0;border-radius:7px;font-size:0.85rem;background:white;font-weight:600">
        <option value="">Selecionar...</option>${opts}
      </select>
      <div style="flex:1;position:relative">
        <span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);color:#888;font-size:0.8rem;pointer-events:none">Gs</span>
        <input type="number" id="multi-valor-pdv-${id}" placeholder="0" min="0" step="1000"
            data-touched="0"
            oninput="this.dataset.touched='1'; atualizarRestanteMultiPDV()"
            style="width:100%;padding:8px 8px 8px 28px;border:1.5px solid #e0e0e0;border-radius:7px;font-size:0.9rem;font-weight:700;box-sizing:border-box">
      </div>
      ${
        id > 2
          ? `<button type="button" onclick="removerPartePDV(${id})"
          style="background:#ffeaea;color:#e74c3c;border:none;padding:8px 10px;border-radius:7px;cursor:pointer;flex-shrink:0">✕</button>`
          : ""
      }
    </div>`;
  container.appendChild(card);
  atualizarRestanteMultiPDV();
}

function removerPartePDV(id) {
  document.getElementById(`multi-parte-pdv-${id}`)?.remove();
  atualizarRestanteMultiPDV();
}

function atualizarRestanteMultiPDV() {
  const total = parseInt(
    document.getElementById("balcao-total")?.innerText.replace(/\D/g, "") ||
      "0",
  );
  const inputs = [...document.querySelectorAll('[id^="multi-valor-pdv-"]')];
  let soma = 0;
  inputs.forEach((inp) => {
    soma += parseFloat(inp.value) || 0;
  });

  // Auto-fill: se exatamente 1 input vazio e sobra valor
  const vazios = inputs.filter(
    (inp) => !inp.value || parseFloat(inp.value) === 0,
  );
  if (vazios.length === 1 && total - soma > 0) {
    vazios[0].value = total - soma;
    soma = total;
  }

  const bar = document.getElementById("multi-status-pdv");
  const el = document.getElementById("multi-restante-pdv");
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
}

function _coletarMultiPagamentoPDV() {
  const partes = [];
  document.querySelectorAll('[id^="multi-parte-pdv-"]').forEach((div) => {
    const idStr = div.id.replace("multi-parte-pdv-", "");
    const metodo =
      document.getElementById(`multi-metodo-pdv-${idStr}`)?.value || "";
    const valor =
      parseFloat(document.getElementById(`multi-valor-pdv-${idStr}`)?.value) ||
      0;
    if (metodo && valor > 0) partes.push({ metodo, valor });
  });
  return partes;
}

async function salvarPedidoBalcao() {
  if (carrinhoPDV.length === 0 && !window._mesaAbertaId)
    return alert(t("alert.carrinho_vazio"));
  if (carrinhoPDV.length === 0 && window._mesaAbertaId)
    return alert("Adicione ao menos 1 novo item antes de lançar.");

  const _soKg = carrinhoPDV.length > 0 && carrinhoPDV.every((i) => i._isKg);

  const mesa = document.getElementById("balcao-mesa").value.trim();
  const cli =
    document.getElementById("balcao-cliente").value.trim() || "Cliente";
  const tel = document.getElementById("balcao-telefone").value.trim() || "";
  let pag = document.getElementById("balcao-pag").value;
  const pagFinalPDV =
    pag === "CartaoBR"
      ? _cartaoBRTipoPDV === "debito"
        ? "Cartão BR - Débito"
        : "Cartão BR - Crédito"
      : pag;

  const nomeFinal = mesa
    ? `MESA ${mesa} - ${cli}`
    : _soKg
      ? `BALCÃO KG - ${cli}`
      : `BALCÃO - ${cli}`;

  // ── Desconto manual ──────────────────────────────────────────
  const descTipo =
    document.getElementById("pdv-desconto-tipo")?.value || "fixo";
  const descValRaw =
    parseFloat(document.getElementById("pdv-desconto-val")?.value || "0") || 0;
  const subtotalBruto = carrinhoPDV.reduce(
    (a, i) => a + (i.preco || 0) * (i.qtd || 1),
    0,
  );
  let descontoAplicado = 0;
  if (descValRaw > 0) {
    descontoAplicado =
      descTipo === "percentual"
        ? Math.round((subtotalBruto * descValRaw) / 100)
        : Math.round(descValRaw);
    descontoAplicado = Math.min(descontoAplicado, subtotalBruto); // não pode ser maior que o total
  }

  // ── Tratamento Multipagamento ────────────────────────────────
  let obsPagPDV = "Pagamento no Balcão";
  if (pag === "Multipagamento") {
    const partesPDV = _coletarMultiPagamentoPDV();
    if (partesPDV.length === 0) {
      alert("Adicione ao menos 1 forma de pagamento!");
      return;
    }
    const totalPedido = parseInt(
      document.getElementById("balcao-total")?.innerText.replace(/\D/g, "") ||
        "0",
    );
    const somaPartes = partesPDV.reduce((a, p) => a + p.valor, 0);
    if (Math.abs(somaPartes - totalPedido) > 1) {
      alert(
        `⚠️ Total das formas (Gs ${somaPartes.toLocaleString("es-PY")}) não bate com o total do pedido (Gs ${totalPedido.toLocaleString("es-PY")}).`,
      );
      return;
    }
    obsPagPDV = JSON.stringify(partesPDV);
  }

  // ── Novos itens ganham status_item: 'pendente' ─────────────────
  const novosItens = carrinhoPDV.map((i) => ({
    id: i.id || Date.now() + Math.random(),
    nome: i.nome,
    preco: i.preco,
    qtd: i.qtd,
    variacao: i.variacao || "",
    montagem: i.montagem || [],
    obs: i.obs || "",
    categoria_slug: i.categoria_slug || "",
    es_bebida: i.es_bebida || false,
    ...(i._isKg
      ? { peso_gramas: i.peso_gramas, preco_kg: i.preco_kg, _isKg: true }
      : {}),
    status_item: "pendente", // ← campo de status por item
    lancado_em: new Date().toISOString(),
  }));

  if (window._mesaAbertaId) {
    // ── UPDATE: mantém itens existentes (com seus status_item atuais)
    //           e acrescenta apenas os novos itens pendentes ──────────
    const itensExistentes = Array.isArray(window._mesaAbertaPedido?.itens)
      ? window._mesaAbertaPedido.itens
      : [];

    const itensMerged = [...itensExistentes, ...novosItens];
    // Itens kg: preco já é o total pesado (preco_kg × peso), não multiplicar por qtd
    const novoTotal = itensMerged.reduce(
      (acc, i) =>
        acc + (i._isKg ? i.preco || 0 : (i.preco || 0) * (i.qtd || 1)),
      0,
    );

    const { error } = await supa
      .from("pedidos")
      .update({
        itens: itensMerged,
        total_geral: novoTotal,
        subtotal: novoTotal,
        forma_pagamento: pagFinalPDV,
        obs_pagamento: obsPagPDV,
        cliente_nome: nomeFinal,
        cliente_telefone: tel,
        status: "em_preparo",
      })
      .eq("id", window._mesaAbertaId);

    if (error) {
      alert("Erro ao atualizar mesa: " + error.message);
      return;
    }
    // Descontar estoque dos novos itens adicionados
    await _descontarEstoqueVendaItens(novosItens);

    // Reset
    window._mesaAbertaId = null;
    window._mesaAbertaTotal = 0;
    window._mesaAbertaPedido = null;
    carrinhoPDV = [];
    document.getElementById("balcao-cliente").value = "";
    document.getElementById("balcao-mesa").value = "";
    document.getElementById("balcao-telefone").value = "";
    document.querySelector(".pdv-mesa-aviso")?.remove();
    atualizarCarrinhoPDV();
    atualizarBarraMesasAtivas();
    carregarMonitorMesas();
    alert(`✅ ${novosItens.length} item(s) enviado(s) para a cozinha!`);
    return;
  }

  // ── INSERT: novo pedido de balcão ─────────────────────────────
  const tipoEntregaPDV =
    document.getElementById("balcao-tipo-entrega")?.value || "balcao";
  const fretePDV =
    tipoEntregaPDV === "delivery"
      ? parseInt(document.getElementById("balcao-frete")?.value || "0") || 0
      : 0;
  const enderecoPDV =
    tipoEntregaPDV === "delivery"
      ? document.getElementById("balcao-endereco")?.value.trim() || "Delivery"
      : mesa
        ? `Mesa ${mesa}`
        : _soKg
          ? "Balcão - Venda Kg"
          : "Balcão";

  const _geoLat = document.getElementById("balcao-geo-lat")?.value || null;
  const _geoLng = document.getElementById("balcao-geo-lng")?.value || null;

  const subtotalLiquido = subtotalBruto - descontoAplicado;
  const totalNovo = subtotalLiquido + fretePDV;
  const _agora = new Date().toISOString();
  const pedido = {
    uid_temporal: `BALC-${Math.floor(Math.random() * 1000)}`,
    status: _soKg
      ? "entregue"
      : _todosSemCozinha(carrinhoPDV)
        ? "pronto_entrega"
        : "em_preparo",
    tipo_entrega: tipoEntregaPDV,
    subtotal: subtotalBruto,
    desconto_pdv_valor: descontoAplicado,
    desconto_pdv_tipo: descontoAplicado > 0 ? descTipo : null,
    frete_cobrado_cliente: fretePDV,
    total_geral: totalNovo,
    forma_pagamento: pag,
    itens: novosItens,
    endereco_entrega: enderecoPDV,
    cliente_nome: nomeFinal,
    cliente_telefone: tel,
    obs_pagamento: obsPagPDV,
    garcom_id: _perfilId || null,
    garcom_nome: _perfilNome || null,
    ...(tipoEntregaPDV === "delivery" && _geoLat && _geoLng
      ? { geo_lat: _geoLat, geo_lng: _geoLng }
      : {}),
    tempo_recebido: _agora,
    tempo_confirmado: _agora,
    tempo_preparo_iniciado: _agora,
    ...(_soKg ? { tempo_pronto: _agora, tempo_entregue: _agora } : {}),
  };

  const { data: novoPedido, error } = await supa
    .from("pedidos")
    .insert([pedido])
    .select("id")
    .single();
  if (error) {
    alert("Erro: " + error.message);
    return;
  }
  // Descontar estoque imediatamente (PDV não passa por mudarStatus)
  if (novoPedido?.id) await _descontarEstoqueVenda(novoPedido.id, novosItens);

  // ── Gaveta automática ─────────────────────────────────────────────────────
  // Abre apenas no PDV, para Efetivo, Cartão (déb/créd) e Multipagamento
  // que contenha ao menos um desses meios. pix e similares não abrem gaveta.
  // Falha silenciosamente — venda NÃO é bloqueada se a gaveta não responder.
  if (_gavetaDeveAbrir(pag, obsPagPDV)) {
    _abrirGavetaDC335(`venda #${novoPedido?.id ?? "PDV"} — ${pag}`);
  }

  if (_pdvCashbackUsando && tel) {
    const descCash = pdvGetCashbackDesconto(totalNovo);
    if (descCash > 0) await crmUsarCashback(tel, descCash);
    _pdvCashbackUsando = false;
    _pdvCashbackDisponivel = 0;
    document.getElementById("pdv-cashback-box").style.display = "none";
  }

  // ── Cashback: gerar crédito pela nova compra ──────────────────
  if (tel) {
    await crmGerarCashback(tel, totalNovo, novoPedido?.id || null);
  }

  // ── Impressão automática ───────────────────────────────────────
  if (novoPedido?.id) {
    // Monta dados direto (sem segunda busca no banco)
    const dadosImpressao = {
      id: novoPedido.id,
      cliente: { nome: nomeFinal, tel: tel },
      entrega: { tipo: "balcao", ref: pedido.endereco_entrega },
      itens: novosItens.map((i) => ({
        q: i.qtd || 1,
        n: i.nome,
        p: i.preco,
        t: i.variacao || "",
        pr: i.preparo || "",
        m: i.montagem || [],
        o: i.obs || "",
        peso_gramas: i.peso_gramas,
        _isKg: i._isKg,
      })),
      valores: {
        sub: subtotalBruto,
        desconto: descontoAplicado,
        frete: fretePDV,
        total: totalNovo,
      },
      pagamento: { metodo: pag, obs: obsPagPDV },
      data: new Date().toLocaleString("pt-BR"),
    };
    const base64 = btoa(
      unescape(encodeURIComponent(JSON.stringify(dadosImpressao))),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    window.open(
      `imprimir.html?d=${base64}`,
      "PrintPDV",
      "width=400,height=600",
    );
  }

  carrinhoPDV = [];
  document.getElementById("balcao-cliente").value = "";
  document.getElementById("balcao-mesa").value = "";
  document.getElementById("balcao-telefone").value = "";
  // Reset tipo entrega e campos de delivery
  const tipoSelPDV = document.getElementById("balcao-tipo-entrega");
  if (tipoSelPDV) tipoSelPDV.value = "balcao";
  const endPDV = document.getElementById("balcao-endereco");
  if (endPDV) endPDV.value = "";
  const geoPDVLat = document.getElementById("balcao-geo-lat");
  if (geoPDVLat) geoPDVLat.value = "";
  const geoPDVLng = document.getElementById("balcao-geo-lng");
  if (geoPDVLng) geoPDVLng.value = "";
  const fretePDVInput = document.getElementById("balcao-frete");
  if (fretePDVInput) fretePDVInput.value = "";
  const freteMsgPDV = document.getElementById("frete-msg-pdv");
  if (freteMsgPDV) freteMsgPDV.innerHTML = "";
  const deliveryRowPDV = document.getElementById("pdv-delivery-row");
  if (deliveryRowPDV) deliveryRowPDV.style.display = "none";
  const descValEl = document.getElementById("pdv-desconto-val");
  if (descValEl) descValEl.value = "";
  const descTipoEl = document.getElementById("pdv-desconto-tipo");
  if (descTipoEl) descTipoEl.value = "fixo";
  // Reset multipagamento PDV
  const multiPartesPDV = document.getElementById("multi-partes-pdv");
  if (multiPartesPDV) multiPartesPDV.innerHTML = "";
  _multiContadorPDV = 0;
  document.getElementById("balcao-pag").value = "Efetivo";
  document.getElementById("balcao-pag").style.display = "";
  const boxMultiPDV = document.getElementById("box-multi-pdv");
  if (boxMultiPDV) boxMultiPDV.style.display = "none";
  // Reset box efetivo / troco
  const _recEl = document.getElementById("pdv-valor-recebido");
  const _trEl  = document.getElementById("pdv-troco-row");
  const _efEl  = document.getElementById("pdv-efetivo-box");
  if (_recEl) _recEl.value = "";
  if (_trEl)  _trEl.style.display = "none";
  if (_efEl)  _efEl.style.display = "none";
  atualizarCarrinhoPDV();
  atualizarBarraMesasAtivas();
  carregarMonitorMesas();
  // Toast não-bloqueante (alert segurava o popup de impressão)
  const _msgFinal = _soKg
    ? "✅ Venda registrada!"
    : _todosBebidas(novosItens)
      ? "✅ Só bebidas — direto ao balcão."
      : "✅ Enviado para a Cozinha!";
  _pdvToast(_msgFinal);
}

// ── Toast não-bloqueante do PDV ───────────────────────────────
function _pdvToast(msg, duracao = 3000) {
  document.getElementById("_pdv-toast")?.remove();
  const t = document.createElement("div");
  t.id = "_pdv-toast";
  t.style.cssText =
    "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a7a2e;color:#fff;padding:12px 28px;border-radius:30px;font-size:1rem;font-weight:700;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,0.25);pointer-events:none;animation:_toastIn 0.2s ease";
  t.textContent = msg;
  if (!document.getElementById("_pdv-toast-style")) {
    const s = document.createElement("style");
    s.id = "_pdv-toast-style";
    s.textContent =
      "@keyframes _toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}";
    document.head.appendChild(s);
  }
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duracao);
}

// ── Barra de Mesas Ativas no PDV ─────────────────────────────
async function atualizarBarraMesasAtivas() {
  const bar = document.getElementById("pdv-mesas-bar");
  const vazio = document.getElementById("pdv-mesas-vazio");
  if (!bar) return;

  const { data } = await supa
    .from("pedidos")
    .select("id, endereco_entrega, cliente_nome, total_geral, status, itens")
    .eq("tipo_entrega", "balcao")
    .neq("status", "entregue")
    .neq("status", "cancelado")
    .order("id", { ascending: true });

  // Limpar chips anteriores (manter apenas label e span vazio)
  bar.querySelectorAll(".mesa-chip").forEach((c) => c.remove());
  if (vazio) vazio.style.display = data && data.length > 0 ? "none" : "inline";

  if (!data || data.length === 0) return;

  data.forEach((p) => {
    const nrMesa = (p.endereco_entrega || "").replace("Mesa ", "") || p.id;
    const chip = document.createElement("button");
    chip.className =
      "mesa-chip" +
      (p.status === "pronto_entrega"
        ? " mesa-pronto"
        : p.status === "em_preparo"
          ? " mesa-em-preparo"
          : "");
    chip.title = `${p.cliente_nome || "Mesa " + nrMesa} — Gs ${(p.total_geral || 0).toLocaleString("es-PY")} — Clique para adicionar itens`;
    chip.innerHTML = `<span class="mesa-chip-num">${nrMesa}</span><span class="mesa-chip-status">${
      p.status === "pronto_entrega"
        ? "✓ Pronto"
        : p.status === "em_preparo"
          ? "🔥"
          : "●"
    }</span>`;
    chip.onclick = () => abrirMesaExistente(p);
    bar.appendChild(chip);
  });
}

// Abre uma mesa existente no carrinho PDV para adicionar mais itens
function abrirMesaExistente(pedido) {
  const nrMesa = (pedido.endereco_entrega || "").replace("Mesa ", "") || "";
  const nomeCli = (pedido.cliente_nome || "").replace(/^MESA \d+ - /i, "");

  // Preenche os campos
  const elMesa = document.getElementById("balcao-mesa");
  const elCli = document.getElementById("balcao-cliente");
  if (elMesa) elMesa.value = nrMesa;
  if (elCli) elCli.value = nomeCli === "Cliente" ? "" : nomeCli;

  // ──────────────────────────────────────────────────────────────────
  // MUDANÇA: carrinhoPDV fica VAZIO — só recebe os NOVOS itens.
  // Os itens existentes ficam em window._mesaAbertaPedido (snapshot do DB).
  // Na hora do save, fazemos merge: existentes (intactos) + novos (pendente).
  // ──────────────────────────────────────────────────────────────────
  carrinhoPDV = [];
  window._mesaAbertaId = pedido.id;
  window._mesaAbertaTotal = pedido.total_geral || 0;
  window._mesaAbertaPedido = pedido; // guarda snapshot completo

  atualizarCarrinhoPDV();

  // Scroll para o topo do PDV
  const pdv = document.getElementById("pdv");
  if (pdv) pdv.scrollIntoView({ behavior: "smooth", block: "start" });

  // Aviso visual
  const aviso = document.createElement("div");
  aviso.className = "pdv-mesa-aviso";
  aviso.innerHTML = `<i class="fas fa-edit"></i> Editando Mesa ${nrMesa} — adicione os NOVOS itens e clique em Lançar`;
  const existing = pdv?.querySelector(".pdv-mesa-aviso");
  if (existing) existing.remove();
  const h4 = pdv?.querySelector(".pdv-carrinho-titulo");
  if (h4) h4.after(aviso);
  setTimeout(() => aviso?.remove(), 8000);
}

async function carregarMonitorMesas() {
  // Atualiza barra de chips de mesas no PDV junto com o monitor
  atualizarBarraMesasAtivas();
  // Busca pedidos de Balcão que NÃO foram finalizados (entregues)
  const { data } = await supa
    .from("pedidos")
    .select("*")
    .eq("tipo_entrega", "balcao")
    .neq("status", "entregue") // Traz 'pendente', 'em_preparo' e 'pronto_entrega'
    .order("id", { ascending: false });

  const div = document.getElementById("lista-mesas-andamento");
  if (!div) return;

  div.innerHTML = "";

  if (!data || data.length === 0) {
    div.innerHTML = '<p class="mesa-monitor-vazio">Nenhum pedido ativo.</p>';
    return;
  }

  data.forEach((p) => {
    let statusHtml = "";
    let acaoHtml = "";
    let cardClass = "mesa-monitor-card";

    // Lógica Visual do Status — usa classes CSS
    if (p.status === "em_preparo") {
      cardClass += " mesa-preparo";
      statusHtml =
        '<span class="mesa-monitor-status-cozinha"><i class="fas fa-fire"></i> Na Cozinha</span>';
      acaoHtml =
        '<small class="mesa-monitor-status-cozinha">Aguardando cozinha...</small>';
    } else if (p.status === "pronto_entrega") {
      cardClass += " mesa-pronta";
      statusHtml =
        '<span class="mesa-monitor-status-pronto"><i class="fas fa-check-circle"></i> PRONTO!</span>';
      acaoHtml = `<button class="btn btn-sm btn-success btn-block-pdv" onclick="finalizarMesa(${p.id})">Entregar / Baixar</button>`;
    } else {
      statusHtml = `<span class="mesa-monitor-valor">${p.status}</span>`;
    }

    const nrMesa =
      (p.endereco_entrega || "").replace("Mesa ", "") || p.uid_temporal || p.id;

    // Lista de itens com status visual por item
    const itens = Array.isArray(p.itens) ? p.itens : [];
    const pendentes = itens.filter(
      (i) => !i.status_item || i.status_item === "pendente",
    );
    const entregues = itens.filter((i) => i.status_item === "entregue");

    let itensListHtml = itens
      .map((item, idx) => {
        const isEntregue = item.status_item === "entregue";
        const nome = item.nome || item.n || "Item";
        const qtd = item.qtd || item.q || 1;
        return `
        <div class="monitor-item-row ${isEntregue ? "monitor-item-entregue" : ""}">
          <span class="monitor-item-nome">${qtd}x ${nome}</span>
          ${
            isEntregue
              ? '<span class="monitor-item-badge-entregue">✓ Entregue</span>'
              : `<button class="btn btn-xs btn-outline-success monitor-btn-baixar"
                title="Marcar como entregue"
                onclick="baixarItemMesa(${p.id}, ${idx})">
                <i class="fas fa-check"></i>
               </button>`
          }
        </div>`;
      })
      .join("");

    // Contador de pendentes no cabeçalho
    const cntPendente =
      pendentes.length > 0
        ? `<span class="mesa-monitor-cnt-pendente">${pendentes.length} pendente${pendentes.length > 1 ? "s" : ""}</span>`
        : "";

    const card = document.createElement("div");
    card.className = cardClass;
    card.innerHTML = `
      <div class="mesa-monitor-titulo">Mesa ${nrMesa} ${cntPendente}</div>
      <div class="mesa-monitor-cliente">${p.cliente_nome || "-"}</div>
      <div class="mesa-monitor-itens-lista">${itensListHtml}</div>
      <div class="mesa-monitor-rodape">
        ${statusHtml}
        <span class="mesa-monitor-valor">Gs ${(p.total_geral || 0).toLocaleString("es-PY")}</span>
      </div>
      ${acaoHtml}
    `;
    div.appendChild(card);
  });
}

// ── Baixa parcial: marca 1 item como 'entregue' no banco ──────────
// idx = índice do item dentro do array p.itens no banco
async function baixarItemMesa(pedidoId, itemIdx) {
  // Busca snapshot mais recente do banco (evita conflito de estado stale)
  const { data: p, error: errFetch } = await supa
    .from("pedidos")
    .select("itens, total_geral")
    .eq("id", pedidoId)
    .single();
  if (errFetch || !p) {
    alert("Erro ao buscar comanda.");
    return;
  }

  const itens = Array.isArray(p.itens) ? [...p.itens] : [];
  if (!itens[itemIdx]) return;

  // Muda status do item específico
  itens[itemIdx] = { ...itens[itemIdx], status_item: "entregue" };

  const { error } = await supa
    .from("pedidos")
    .update({ itens })
    .eq("id", pedidoId);

  if (error) {
    alert("Erro ao baixar item: " + error.message);
    return;
  }

  // Atualiza o snapshot local e re-renderiza o carrinho PDV
  if (window._mesaAbertaPedido && window._mesaAbertaId === pedidoId) {
    window._mesaAbertaPedido = { ...window._mesaAbertaPedido, itens };
    atualizarCarrinhoPDV();
  }
  // Atualiza o monitor de mesas sem precisar recarregar tudo
  atualizarBarraMesasAtivas();
}

// Função para dar baixa na mesa (Muda status para 'entregue' e sai da lista)
async function finalizarMesa(id) {
  if (confirm("Confirmar entrega e pagamento desta mesa?")) {
    await supa
      .from("pedidos")
      .update({
        status: "entregue",
        tempo_entregue: new Date().toISOString(),
      })
      .eq("id", id);
    carregarMonitorMesas();
    if (typeof calcularFinanceiro === "function") calcularFinanceiro();
    // Gaveta: não abre no fechamento de mesa — apenas vendas PDV abrem a gaveta.
  }
}

// Utilitários de Modal e Checkbox
function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }
}

function toggleTodos(s) {
  document
    .querySelectorAll(".check-pedido")
    .forEach((c) => (c.checked = s.checked));
}

// Clique fora do modal fecha
window.onclick = function (event) {
  if (event.target.classList.contains("modal-overlay")) {
    event.target.classList.remove("active");
    event.target.style.display = "none";
  }
};

// ESC fecha modal
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    document
      .querySelectorAll('.modal-overlay.active, .modal-overlay[style*="flex"]')
      .forEach((modal) => {
        modal.classList.remove("active");
        modal.style.display = "none";
      });
  }
});

// =========================================
// 10. GESTÃO DE EQUIPE
// =========================================
async function carregarEquipe() {
  const { data } = await supa.from("perfis_acesso").select("*").order("cargo");

  const tbody = document.getElementById("lista-equipe");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (data) {
    data.forEach((u) => {
      const dataCriacao = u.created_at
        ? new Date(u.created_at).toLocaleDateString("pt-BR")
        : "-";
      const ehDono = u.cargo === "dono";
      const ehGerente = u.cargo === "gerente";
      const ehFuncionario = u.cargo === "funcionario";
      const ehGarcom = u.cargo === "garcom";
      const ehAM = u.cargo === "adminMaster";

      // Botão de promoção/rebaixamento
      let acaoCargo = "";
      if (
        !ehAM &&
        (perfilUsuario === "dono" || perfilUsuario === "adminMaster")
      ) {
        if (ehFuncionario || ehGarcom) {
          acaoCargo = `<button class="btn btn-sm btn-success" onclick="promoverUsuario('${u.id}', 'gerente')" title="Promover a Gerente"><i class="fas fa-arrow-up"></i> Gerente</button>`;
        } else if (ehGerente) {
          acaoCargo = `<button class="btn btn-sm btn-warning" onclick="promoverUsuario('${u.id}', 'funcionario')" title="Rebaixar a Funcionário"><i class="fas fa-arrow-down"></i> Funcionário</button>`;
        }
        if (perfilUsuario === "adminMaster" && !ehDono) {
          acaoCargo += ` <button class="btn btn-sm btn-primary" onclick="promoverUsuario('${u.id}', 'dono')" title="Tornar Dono"><i class="fas fa-crown"></i> Dono</button>`;
        }
        if (!ehDono) {
          acaoCargo += ` <button class="btn btn-sm btn-danger" onclick="excluirUsuario('${u.id}', '${u.email}')" title="Excluir"><i class="fas fa-trash"></i></button>`;
        }
      }

      const cargoBadge = ehAM
        ? "🎮 Admin Master"
        : ehDono
          ? "🔑 Dono"
          : ehGerente
            ? "👔 Gerente"
            : ehGarcom
              ? "🍽️ Garçom"
              : "👷 Funcionário";
      tbody.innerHTML += `<tr>
                <td><strong>${u.nome_display || "—"}</strong></td>
                <td>${u.email}</td>
                <td>${cargoBadge}</td>
                <td>${dataCriacao}</td>
                <td>${acaoCargo}</td>
            </tr>`;
    });
  }
}

async function promoverUsuario(id, novoCargo) {
  const msg =
    novoCargo === "gerente"
      ? "Promover este usuário a Gerente?"
      : "Rebaixar este usuário a Funcionário?";
  if (!confirm(msg)) return;

  const { error } = await supa
    .from("perfis_acesso")
    .update({ cargo: novoCargo })
    .eq("id", id);
  if (error) {
    alert("❌ Erro: " + error.message);
  } else {
    alert(`✅ Cargo alterado para ${novoCargo}!`);
    carregarEquipe();
  }
}

async function excluirUsuario(id, email) {
  if (
    !confirm(
      `⚠️ Excluir o usuário "${email}"?\n\nEsta ação remove apenas o perfil. O acesso de autenticação pode precisar ser revogado no Supabase Dashboard.`,
    )
  )
    return;

  const { error } = await supa.from("perfis_acesso").delete().eq("id", id);
  if (error) {
    alert("❌ Erro ao excluir: " + error.message);
  } else {
    alert("✅ Usuário excluído com sucesso!");
    carregarEquipe();
  }
}

// ═══════════════════════════════════════════════════════════════
// ADMIN MASTER — CRUD completo de usuários
// ═══════════════════════════════════════════════════════════════

async function amCriarUsuario() {
  if (perfilUsuario !== "adminMaster") return alert(t("alert.acesso_negado"));
  const email = document.getElementById("am-email")?.value?.trim();
  const nome = document.getElementById("am-nome")?.value?.trim();
  const senha = document.getElementById("am-senha")?.value;
  const cargo = document.getElementById("am-cargo")?.value || "dono";
  if (!email || !nome || !senha || senha.length < 6)
    return alert("Preencha email, nome e senha (mín. 6 caracteres).");
  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Criando...";
  }
  try {
    const { data, error } = await supa.auth.signUp({ email, password: senha });
    if (error) {
      alert("❌ Erro: " + error.message);
      return;
    }
    if (data.user) {
      const { error: ep } = await supa
        .from("perfis_acesso")
        .upsert([{ id: data.user.id, email, cargo, nome_display: nome }], {
          onConflict: "id",
        });
      if (ep) {
        alert("⚠️ Auth criado mas erro no perfil: " + ep.message);
        return;
      }
      const cargoBadge = {
        dono: "Dono",
        gerente: "Gerente",
        funcionario: "Funcionário",
        garcom: "Garçom",
      };
      alert(
        `✅ Usuário "${nome}" criado como ${cargoBadge[cargo] || cargo}!\nSolicite que confirme o email antes de fazer login.`,
      );
      document.getElementById("am-email").value = "";
      document.getElementById("am-nome").value = "";
      document.getElementById("am-senha").value = "";
      amCarregarUsuarios();
    }
  } catch (e) {
    alert("❌ Erro: " + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Criar Usuário';
    }
  }
}

// Compatibilidade com cadastrarDono (aba Configurações)
async function cadastrarDono() {
  const emailEl = document.getElementById("am-email");
  const cargoEl = document.getElementById("am-cargo");
  if (cargoEl) cargoEl.value = "dono";
  return amCriarUsuario();
}

async function amCarregarUsuarios() {
  if (perfilUsuario !== "adminMaster") return;
  const tbody = document.getElementById("am-lista-usuarios");
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="4" style="text-align:center;padding:16px"><i class="fas fa-spinner fa-spin"></i> Carregando...</td></tr>';

  const { data, error } = await supa
    .from("perfis_acesso")
    .select("*")
    .order("cargo");
  if (error) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:red;text-align:center">${error.message}</td></tr>`;
    return;
  }

  if (!data || !data.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center;color:#aaa">Nenhum usuário cadastrado</td></tr>';
    return;
  }

  const cargoBadges = {
    adminMaster:
      '<span style="background:#e74c3c;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.75rem">🎮 Admin Master</span>',
    dono: '<span style="background:#f39c12;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.75rem">🔑 Dono</span>',
    gerente:
      '<span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.75rem">👔 Gerente</span>',
    funcionario:
      '<span style="background:#7f8c8d;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.75rem">👷 Funcionário</span>',
    garcom:
      '<span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.75rem">🍽️ Garçom</span>',
  };

  tbody.innerHTML = data
    .map((u) => {
      const isMe = u.id === _perfilId;
      const isAM = u.cargo === "adminMaster";
      const opcoesCargo = ["dono", "gerente", "funcionario", "garcom"]
        .map(
          (c) =>
            `<option value="${c}" ${u.cargo === c ? "selected" : ""}>${c}</option>`,
        )
        .join("");
      const acoes =
        isMe || isAM
          ? '<span style="color:#aaa;font-size:0.78rem">—</span>'
          : `
      <select onchange="amAlterarCargo('${u.id}', this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:0.8rem;margin-right:6px">
        ${opcoesCargo}
      </select>
      <button onclick="amExcluirUsuario('${u.id}','${u.email}')"
        style="background:#e74c3c;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem">
        <i class="fas fa-trash"></i>
      </button>`;
      return `<tr>
      <td><strong>${u.nome_display || "—"}</strong>${isMe ? ' <span style="font-size:0.7rem;color:#27ae60">(você)</span>' : ""}</td>
      <td style="font-size:0.85rem">${u.email}</td>
      <td>${cargoBadges[u.cargo] || u.cargo}</td>
      <td>${acoes}</td>
    </tr>`;
    })
    .join("");
}

async function amAlterarCargo(id, novoCargo) {
  if (perfilUsuario !== "adminMaster") return;
  if (!confirm(`Alterar cargo para "${novoCargo}"?`)) {
    amCarregarUsuarios();
    return;
  }
  const { error } = await supa
    .from("perfis_acesso")
    .update({ cargo: novoCargo })
    .eq("id", id);
  if (error) alert("❌ Erro: " + error.message);
  else {
    amCarregarUsuarios();
    carregarEquipe();
  }
}

async function amExcluirUsuario(id, email) {
  if (perfilUsuario !== "adminMaster") return;
  if (
    !confirm(
      `⚠️ Excluir o usuário "${email}"?\n\nIsso remove o perfil do banco. O acesso de autenticação pode precisar ser revogado no Supabase Dashboard.`,
    )
  )
    return;
  const { error } = await supa.from("perfis_acesso").delete().eq("id", id);
  if (error) alert("❌ Erro: " + error.message);
  else {
    alert("✅ Usuário excluído.");
    amCarregarUsuarios();
    carregarEquipe();
  }
}

async function cadastrarUsuario() {
  const email = document.getElementById("novo-user-email")?.value?.trim();
  const nomeDisplay =
    document.getElementById("novo-user-nome")?.value?.trim() || "";
  const senha = document.getElementById("novo-user-senha")?.value;
  const cargo = document.getElementById("novo-user-cargo")?.value;

  if (!email || !senha || senha.length < 6)
    return alert("Email e senha (mín. 6 caracteres) são obrigatórios");
  if (!nomeDisplay) return alert("O nome de exibição é obrigatório");

  // Apenas adminMaster pode criar dono
  if (cargo === "dono" && perfilUsuario !== "adminMaster")
    return alert("Apenas o Admin Master pode criar usuários com cargo Dono.");

  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Criando...";
  }

  try {
    // 1. Cria usuário na Autenticação do Supabase
    const { data, error } = await supa.auth.signUp({ email, password: senha });

    if (error) {
      alert("❌ Erro ao criar usuário: " + error.message);
      return;
    }

    if (data.user) {
      // 2. Salva perfil no banco usando upsert para evitar duplicata de chave
      const { error: errPerfil } = await supa
        .from("perfis_acesso")
        .upsert(
          [{ id: data.user.id, email, cargo, nome_display: nomeDisplay }],
          { onConflict: "id" },
        );

      if (errPerfil) {
        alert(
          "⚠️ Usuário de autenticação criado, mas erro ao salvar perfil: " +
            errPerfil.message,
        );
      } else {
        alert(
          "✅ Usuário cadastrado com sucesso!\n\nO usuário receberá um email de confirmação.",
        );
        document.getElementById("novo-user-email").value = "";
        document.getElementById("novo-user-nome").value = "";
        document.getElementById("novo-user-senha").value = "";
        carregarEquipe();
      }
    } else {
      alert("⚠️ Usuário criado. Aguardando confirmação de email para ativar.");
    }
  } catch (e) {
    alert("❌ Erro inesperado: " + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Criar';
    }
  }
}

function adicionarItem(etapaIndex) {
  const lista = document.getElementById(`itens-list-${etapaIndex}`);
  const itemDiv = document.createElement("div");
  itemDiv.className = "item-row";
  itemDiv.innerHTML = `
        <input type="text" class="input-modern" placeholder="Nome do item">
        <button type="button" class="btn-remove-item" 
                onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
  lista.appendChild(itemDiv);
}

function removerEtapa(index) {
  if (confirm("Remover esta etapa?")) {
    const container = document.getElementById("builder-steps");
    container.children[index].remove();
  }
}

// CARREGAR CUPONS
async function carregarCupons() {
  const { data } = await supa
    .from("cupons")
    .select("*")
    .order("created_at", { ascending: false });
  const tbody = document.getElementById("lista-cupons");

  if (!tbody) return;
  tbody.innerHTML = "";

  (data || []).forEach((c) => {
    const tipoLabel = c.tipo === "percentual" ? `${c.valor}%` : "Frete Grátis";
    const statusBadge = c.ativo
      ? '<span class="badge badge-success">Ativo</span>'
      : '<span class="badge badge-danger">Inativo</span>';

    // Uso / limite
    const usosRealizados = c.usos_realizados || c.usos_atual || 0;
    let usoHtml;
    if (c.limite_uso && c.limite_uso > 0) {
      const restante = c.limite_uso - usosRealizados;
      const esgotado = restante <= 0;
      usoHtml = `
        <div style="font-size:0.82rem">
          <span style="font-weight:700;color:${esgotado ? "#e74c3c" : "#27ae60"}">${usosRealizados}/${c.limite_uso}</span>
          ${esgotado ? '<span class="badge badge-danger" style="font-size:0.65rem">Esgotado</span>' : `<span style="color:#888;font-size:0.72rem">(${restante} restantes)</span>`}
        </div>`;
    } else {
      usoHtml = `<span style="color:#aaa;font-size:0.82rem">${usosRealizados} usos / ∞</span>`;
    }

    // Validade
    let validadeHtml = '<span style="color:#ccc;font-size:0.8rem">—</span>';
    if (c.validade) {
      const vDate = new Date(c.validade + "T00:00:00");
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const expirado = vDate < hoje;
      validadeHtml = `<span style="font-size:0.8rem;color:${expirado ? "#e74c3c" : "#555"}">${vDate.toLocaleDateString("pt-BR")}${expirado ? " <em style='font-size:0.7rem'>(Expirado)</em>" : ""}</span>`;
    }

    tbody.innerHTML += `
            <tr>
                <td><strong>${c.codigo}</strong></td>
                <td>${c.tipo === "percentual" ? "Percentual" : "Frete Grátis"}</td>
                <td>${tipoLabel}</td>
                <td>Gs ${c.minimo.toLocaleString("es-PY")}</td>
                <td>${usoHtml}</td>
                <td>${validadeHtml}</td>
                <td>${statusBadge}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-primary" onclick='editarCupom(${JSON.stringify(c)})'>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletarCupom(${c.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });
}

// ABRIR MODAL CUPOM
function abrirModalCupom(cupom = null) {
  document.getElementById("cupom-id").value = cupom ? cupom.id : "";
  document.getElementById("cupom-codigo").value = cupom ? cupom.codigo : "";
  document.getElementById("cupom-tipo").value = cupom
    ? cupom.tipo
    : "percentual";
  document.getElementById("cupom-valor").value = cupom ? cupom.valor : "";
  document.getElementById("cupom-minimo").value = cupom ? cupom.minimo : "";
  document.getElementById("cupom-ativo").checked = cupom ? cupom.ativo : true;
  // Limite de usos e validade
  document.getElementById("cupom-limite").value = cupom?.limite_uso ?? "";
  document.getElementById("cupom-validade").value = cupom?.validade
    ? cupom.validade.split("T")[0]
    : "";

  alterarTipoCupom();

  const modal = document.getElementById("modal-cupom");
  modal.style.display = "flex";
  modal.classList.add("active");
}

function editarCupom(cupom) {
  abrirModalCupom(cupom);
}

function alterarTipoCupom() {
  const tipo = document.getElementById("cupom-tipo").value;
  const boxValor = document.getElementById("box-valor-cupom");
  boxValor.style.display = tipo === "percentual" ? "block" : "none";
}

// SALVAR CUPOM
async function salvarCupom() {
  const id = document.getElementById("cupom-id").value;
  const limiteRaw = parseInt(document.getElementById("cupom-limite").value);
  const validadeRaw = document.getElementById("cupom-validade").value;

  const dados = {
    codigo: document.getElementById("cupom-codigo").value.toUpperCase(),
    tipo: document.getElementById("cupom-tipo").value,
    valor: parseFloat(document.getElementById("cupom-valor").value) || 0,
    minimo: parseFloat(document.getElementById("cupom-minimo").value) || 0,
    ativo: document.getElementById("cupom-ativo").checked,
    limite_uso: !isNaN(limiteRaw) && limiteRaw > 0 ? limiteRaw : null,
    validade: validadeRaw || null,
  };

  if (!dados.codigo) {
    alert("Digite um código para o cupom");
    return;
  }

  let error;
  if (id) {
    ({ error } = await supa.from("cupons").update(dados).eq("id", id));
  } else {
    ({ error } = await supa.from("cupons").insert([dados]));
  }

  if (error) {
    alert("Erro: " + error.message);
  } else {
    alert("✅ Cupom salvo com sucesso!");
    document.getElementById("modal-cupom").classList.remove("active"); // Fecha o modal
    document.getElementById("modal-cupom").style.display = "none";
    carregarCupons();
  }
}

// DELETAR CUPOM
async function deletarCupom(id) {
  if (confirm("Deletar este cupom?")) {
    const { error } = await supa.from("cupons").delete().eq("id", id);
    if (error) alert("Erro: " + error.message);
    else carregarCupons();
  }
}

// ── Avisar cliente via WhatsApp que o pedido está pronto ──────────
async function avisarClientePronto(pedidoId) {
  const { data: p } = await supa
    .from("pedidos")
    .select("cliente_nome, cliente_telefone, uid_temporal")
    .eq("id", pedidoId)
    .single();
  if (!p) {
    alert("Pedido não encontrado.");
    return;
  }

  const tel = (p.cliente_telefone || "").replace(/\D/g, "");
  if (!tel) {
    alert("Este pedido não tem número de telefone registrado.");
    return;
  }

  // Carrega nome da loja
  const nomeRestaurante = NOME_RESTAURANTE || "Restaurante";
  const nomeCliente = p.cliente_nome || "Cliente";
  const numPedido = p.uid_temporal || pedidoId;

  // Mensagem em 3 idiomas
  const msgs = {
    pt: `Olá, ${nomeCliente}! 🎉\nSeu pedido #${numPedido} está pronto! 🍽️\n\nObrigado por escolher ${nomeRestaurante}!`,
    es: `¡Hola, ${nomeCliente}! 🎉\n¡Tu pedido #${numPedido} está listo! 🍽️\n\n¡Gracias por elegir ${nomeRestaurante}!`,
    gn: `Mba'éichapa, ${nomeCliente}! 🎉\nNde pedido #${numPedido} oĩma! 🍽️\n\nAguyje ${nomeRestaurante}-pe remomba'apo haguépe!`,
  };

  // Modal de seleção de idioma
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:20px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h4 style="margin:0;color:#25D366"><i class="fab fa-whatsapp"></i> Avisar Cliente</h4>
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#999">✕</button>
      </div>
      <p style="font-size:0.85rem;color:#555;margin-bottom:14px">Pedido <strong>#${numPedido}</strong> — <strong>${nomeCliente}</strong></p>
      <p style="font-size:0.8rem;font-weight:600;color:#333;margin-bottom:10px">Escolha o idioma da mensagem:</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${Object.entries({
          pt: "🇧🇷 Português",
          es: "🇵🇾 Español",
          gn: "🌿 Guarani",
        })
          .map(
            ([k, lbl]) => `
          <button onclick="window.open('https://wa.me/595${tel.replace(/^0/, "")}?text='+encodeURIComponent('${msgs[k].replace(/'/g, "\\'").replace(/\n/g, "%0A")}'),'_blank');this.closest('[style]').remove()"
            style="background:#f0fff4;border:2px solid #25D366;border-radius:10px;padding:11px 14px;cursor:pointer;text-align:left;font-size:0.88rem;font-weight:600;color:#155c24;transition:all .15s"
            onmouseover="this.style.background='#25D366';this.style.color='#fff'"
            onmouseout="this.style.background='#f0fff4';this.style.color='#155c24'">
            ${lbl}
          </button>`,
          )
          .join("")}
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

async function confirmarEntregaFuncionario(pedidoId) {
  if (!confirm("Confirmar que este pedido foi entregue ao cliente?")) {
    return;
  }

  try {
    const { error } = await supa
      .from("pedidos")
      .update({
        status: "entregue",
        entrega_confirmada_em: new Date().toISOString(),
        confirmacao_tipo: "funcionario",
      })
      .eq("id", pedidoId);

    if (error) throw error;

    alert("✅ Entrega confirmada com sucesso!");
    carregarPedidos();
  } catch (err) {
    console.error("Erro ao confirmar entrega:", err);
    alert("Erro ao confirmar entrega");
  }
}

async function fecharTodasMesas() {
  const { data, error } = await supa
    .from("pedidos")
    .select("id, cliente_nome, tipo_entrega, status")
    .in("status", ["pendente", "em_preparo", "pronto_entrega", "saiu_entrega"])
    .in("tipo_entrega", ["balcao", "retirada", "local"]);
  if (error || !data || data.length === 0) {
    alert("Nenhum pedido de Mesa/Retirada/Local em aberto.");
    return;
  }
  const lista = data
    .map((p) => `#${p.id} — ${p.cliente_nome || "Mesa"} (${p.tipo_entrega})`)
    .join("\n");
  if (
    !confirm(`Baixar ${data.length} pedido(s) Mesa/Retirada/Local?\n\n${lista}`)
  )
    return;
  const now = new Date().toISOString();
  const { error: err } = await supa
    .from("pedidos")
    .update({ status: "entregue", tempo_entregue: now })
    .in(
      "id",
      data.map((p) => p.id),
    );
  if (err) {
    alert("Erro: " + err.message);
    return;
  }
  alert(`✅ ${data.length} pedido(s) baixado(s)!`);
  carregarPedidos();
  carregarMonitorMesas();
  if (typeof calcularFinanceiro === "function") calcularFinanceiro();
}

async function baixarTodosNaoDelivery() {
  const { data, error } = await supa
    .from("pedidos")
    .select("id, cliente_nome, status")
    .in("status", ["saiu_entrega", "pronto_entrega"])
    .eq("tipo_entrega", "delivery");
  if (error || !data || data.length === 0) {
    alert("Nenhum delivery para confirmar entrega.");
    return;
  }
  const lista = data
    .map((p) => `#${p.id} — ${p.cliente_nome || "Cliente"}`)
    .join("\n");
  if (!confirm(`Confirmar entrega de ${data.length} delivery(s)?\n\n${lista}`))
    return;
  const now = new Date().toISOString();
  const { error: err } = await supa
    .from("pedidos")
    .update({
      status: "entregue",
      tempo_entregue: now,
      entrega_confirmada_em: now,
      confirmacao_tipo: "massa",
    })
    .in(
      "id",
      data.map((p) => p.id),
    );
  if (err) {
    alert("Erro: " + err.message);
    return;
  }
  alert(`✅ ${data.length} delivery(s) confirmado(s)!`);
  carregarPedidos();
  if (typeof calcularFinanceiro === "function") calcularFinanceiro();
}

let graficoInstance = null;

// ===== ABRIR MODAL DE GRÁFICOS =====
function abrirGraficos() {
  const modal = document.getElementById("modal-graficos");
  if (!modal) {
    console.error("Modal de gráficos não encontrado");
    return;
  }
  modal.style.display = "flex";

  // Carrega dados padrão de 7 dias
  carregarDadosGrafico("7");
}

// ===== CARREGAR DADOS DO GRÁFICO =====
async function carregarDadosGrafico(dias) {
  try {
    // Atualiza botões visuais
    document.querySelectorAll(".btn-periodo").forEach((btn) => {
      const btnDias = btn.getAttribute("data-dias");
      if (btnDias === dias) {
        btn.style.background = "#8e44ad";
        btn.style.color = "#fff";
      } else {
        btn.style.background = "#bdc3c7";
        btn.style.color = "#333";
      }
    });

    // Calcula data de início
    const dataFim = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(dias));

    // Busca pedidos no período
    const { data: pedidos, error } = await supa
      .from("pedidos")
      .select("*")
      .gte("created_at", dataInicio.toISOString())
      .lte("created_at", dataFim.toISOString())
      .neq("status", "cancelado");

    if (error) throw error;

    // Processa dados
    processarDadosGrafico(pedidos, dias);
  } catch (err) {
    console.error("Erro ao carregar dados do gráfico:", err);
    alert("Erro ao carregar gráfico");
  }
}

// ===== PROCESSAR E EXIBIR DADOS =====
function processarDadosGrafico(pedidos, dias) {
  // Agrupa vendas por dia
  const vendasPorDia = {};
  let totalPeriodo = 0;

  pedidos.forEach((p) => {
    const data = new Date(p.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const valor = p.total_geral || 0;
    vendasPorDia[data] = (vendasPorDia[data] || 0) + valor;
    totalPeriodo += valor;
  });

  // Ordena por data
  const datasOrdenadas = Object.keys(vendasPorDia).sort((a, b) => {
    const [diaA, mesA] = a.split("/");
    const [diaB, mesB] = b.split("/");
    return new Date(2024, mesA - 1, diaA) - new Date(2024, mesB - 1, diaB);
  });

  const valores = datasOrdenadas.map((d) => vendasPorDia[d]);

  // Calcula estatísticas
  const mediaPorDia = totalPeriodo / parseInt(dias);
  const melhorValor = Math.max(...valores);
  const piorValor = Math.min(...valores);
  const melhorDia = datasOrdenadas[valores.indexOf(melhorValor)];
  const piorDia = datasOrdenadas[valores.indexOf(piorValor)];

  // Atualiza cards
  document.getElementById("graf-total-periodo").textContent =
    `Gs ${totalPeriodo.toLocaleString("es-PY")}`;
  document.getElementById("graf-media-dia").textContent =
    `Gs ${Math.round(mediaPorDia).toLocaleString("es-PY")}`;
  document.getElementById("graf-melhor-dia").textContent =
    `${melhorDia} - Gs ${melhorValor.toLocaleString("es-PY")}`;
  document.getElementById("graf-pior-dia").textContent =
    `${piorDia} - Gs ${piorValor.toLocaleString("es-PY")}`;

  // Gera cores das barras
  const cores = valores.map((v) => {
    if (v === melhorValor) return "#27ae60"; // Verde para melhor
    if (v === piorValor) return "#e74c3c"; // Vermelho para pior
    return "#3498db"; // Azul para demais
  });

  // Renderiza gráfico
  renderizarGrafico(datasOrdenadas, valores, cores);
}

// ===== RENDERIZAR GRÁFICO COM CHART.JS =====
function renderizarGrafico(labels, data, cores) {
  const canvas = document.getElementById("canvas-grafico");
  if (!canvas) {
    console.error("Canvas do gráfico não encontrado");
    return;
  }

  const ctx = canvas.getContext("2d");

  // Destroi gráfico anterior se existir
  if (graficoInstance) {
    graficoInstance.destroy();
  }

  // Cria novo gráfico
  graficoInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Vendas (Gs)",
          data: data,
          backgroundColor: cores,
          borderWidth: 0,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "Gs " + context.parsed.y.toLocaleString("es-PY");
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "Gs " + (value / 1000).toFixed(0) + "k";
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

// ===== FECHAR MODAL (se não existir função genérica) =====
if (typeof fecharModal !== "function") {
  function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
    }
  }
}
/* ══════════════════════════════════════════════════════════════
   HELPERS ESTOQUE + PDV
   ══════════════════════════════════════════════════════════════ */

// Categorias/tipos que NÃO vão para a cozinha (servido imediatamente)
const _TIPOS_SEM_COZINHA = ["bebida", "acai", "shake", "suco", "sorvete"];

function _todosSemCozinha(itens) {
  if (!itens || !itens.length) return false;
  return itens.every((i) => {
    const cat = (i.categoria_slug || "").toLowerCase();
    const tipo = i._tipo || "";
    return _TIPOS_SEM_COZINHA.some(
      (t) =>
        cat.includes(t) ||
        tipo === t ||
        cat.includes("bebida") ||
        cat.includes("drink"),
    );
  });
}

// Alias mantido para compatibilidade com código existente
function _todosBebidas(itens) {
  return _todosSemCozinha(itens);
}

// Desconta estoque a partir de uma lista de itens (para UPDATE de mesa)
async function _descontarEstoqueVendaItens(itens) {
  try {
    if (!itens?.length) return;
    const prodIds = [
      ...new Set(itens.map((i) => i.id || i.produto_id).filter(Boolean)),
    ];
    if (!prodIds.length) return;
    const { data: prods } = await supa
      .from("produtos")
      .select("id, inventario_id")
      .in("id", prodIds)
      .not("inventario_id", "is", null);
    if (!prods?.length) return;
    const descontos = {};
    itens.forEach((item) => {
      const pid = item.id || item.produto_id;
      const prod = prods.find((p) => p.id == pid);
      if (!prod) return;
      descontos[prod.inventario_id] =
        (descontos[prod.inventario_id] || 0) + (item.qtd || 1);
    });
    const invIds = Object.keys(descontos).map(Number);
    const { data: estoques } = await supa
      .from("inventario")
      .select("id, quantidade")
      .in("id", invIds);
    if (!estoques?.length) return;
    for (const est of estoques) {
      const nova = Math.max(0, (est.quantidade ?? 0) - descontos[est.id]);
      await supa
        .from("inventario")
        .update({ quantidade: nova })
        .eq("id", est.id);
      await supa
        .from("inventario_movimentos")
        .insert([
          {
            inventario_id: est.id,
            tipo: "sub",
            quantidade: descontos[est.id],
            motivo: "Venda PDV (balcão)",
            usuario_email: "sistema",
          },
        ])
        .then(() => {})
        .catch(() => {});
    }
    console.log(`✅ Estoque descontado: ${estoques.length} item(s)`);
  } catch (e) {
    console.warn("Estoque desconto (itens):", e.message);
  }
}

// Desconta estoque a partir de pedidoId OU lista de itens
async function _descontarEstoqueVenda(pedidoId, itensDireto) {
  try {
    let itens = itensDireto;
    // Se não tiver itens diretos, busca do banco
    if (!itens) {
      const { data: pedido } = await supa
        .from("pedidos")
        .select("itens")
        .eq("id", pedidoId)
        .single();
      itens = pedido?.itens;
    }
    if (!itens?.length) return;
    // Busca produto_ids
    const prodIds = [
      ...new Set(itens.map((i) => i.produto_id || i.id).filter(Boolean)),
    ];
    if (!prodIds.length) return;
    const { data: prods } = await supa
      .from("produtos")
      .select("id, inventario_id")
      .in("id", prodIds)
      .not("inventario_id", "is", null);
    if (!prods?.length) return;
    const descontos = {};
    itens.forEach((item) => {
      const pid = item.produto_id || item.id;
      const prod = prods.find((p) => p.id == pid);
      if (!prod) return;
      descontos[prod.inventario_id] =
        (descontos[prod.inventario_id] || 0) + (item.qtd || item.q || 1);
    });
    const invIds = Object.keys(descontos).map(Number);
    const { data: estoques } = await supa
      .from("inventario")
      .select("id, quantidade")
      .in("id", invIds);
    if (!estoques?.length) return;
    for (const est of estoques) {
      const nova = Math.max(0, (est.quantidade ?? 0) - descontos[est.id]);
      await supa
        .from("inventario")
        .update({ quantidade: nova })
        .eq("id", est.id);
      await supa
        .from("inventario_movimentos")
        .insert([
          {
            inventario_id: est.id,
            tipo: "sub",
            quantidade: descontos[est.id],
            motivo: pedidoId ? `Venda — Pedido #${pedidoId}` : "Venda PDV",
            usuario_email: "sistema",
          },
        ])
        .then(() => {})
        .catch(() => {});
    }
    console.log(
      `✅ Estoque descontado: pedido ${pedidoId || "(PDV)"}, ${estoques.length} item(s)`,
    );
  } catch (e) {
    console.warn("Estoque desconto:", e.message);
  }
}

/* ══════════════════════════════════════════════════════════════
   BUG #7 CORRIGIDO — Repõe estoque quando um pedido é cancelado
   ══════════════════════════════════════════════════════════════ */
async function _reporEstoqueCancelamento(pedidoId) {
  try {
    const { data: pedido } = await supa
      .from("pedidos")
      .select("itens")
      .eq("id", pedidoId)
      .single();
    const itens = pedido?.itens;
    if (!itens?.length) return;

    const prodIds = [
      ...new Set(itens.map((i) => i.produto_id || i.id).filter(Boolean)),
    ];
    if (!prodIds.length) return;

    const { data: prods } = await supa
      .from("produtos")
      .select("id, inventario_id")
      .in("id", prodIds)
      .not("inventario_id", "is", null);
    if (!prods?.length) return;

    const reposicoes = {};
    itens.forEach((item) => {
      const pid = item.produto_id || item.id;
      const prod = prods.find((p) => p.id == pid);
      if (!prod) return;
      reposicoes[prod.inventario_id] =
        (reposicoes[prod.inventario_id] || 0) + (item.qtd || item.q || 1);
    });

    const invIds = Object.keys(reposicoes).map(Number);
    const { data: estoques } = await supa
      .from("inventario")
      .select("id, quantidade")
      .in("id", invIds);
    if (!estoques?.length) return;

    for (const est of estoques) {
      const nova = (est.quantidade ?? 0) + reposicoes[est.id];
      await supa.from("inventario").update({ quantidade: nova }).eq("id", est.id);
      await supa
        .from("inventario_movimentos")
        .insert([{
          inventario_id: est.id,
          tipo: "ajuste",
          quantidade: reposicoes[est.id],
          motivo: `Cancelamento — Pedido #${pedidoId}`,
          usuario_email: "sistema",
        }])
        .then(() => {})
        .catch(() => {});
    }
    console.log(`✅ Estoque reposto: pedido cancelado #${pedidoId}`);
  } catch (e) {
    console.warn("_reporEstoqueCancelamento:", e.message);
  }
}

/* ══════════════════════════════════════════════════════════════
   BUG #6 CORRIGIDO — Estorna cashback gerado ao cancelar pedido.
   Busca a transação de crédito vinculada ao pedido e:
   1. Insere um débito igual para zerar o saldo.
   2. Atualiza clientes.saldo_cashback subtraindo o valor.
   (Esta app usa saldo_cashback conforme schema)
   ══════════════════════════════════════════════════════════════ */
async function _estornarCashbackCancelamento(pedidoId) {
  try {
    const { data: txs } = await supa
      .from("cashback_transacoes")
      .select("id, cliente_id, cliente_telefone, valor")
      .eq("pedido_id", pedidoId)
      .eq("tipo", "credito")
      .eq("usado", false); // só estorna crédito ainda não utilizado

    if (!txs?.length) return;

    for (const tx of txs) {
      // Marca o crédito original como estornado
      await supa
        .from("cashback_transacoes")
        .update({ usado: true })
        .eq("id", tx.id);

      // Insere débito de estorno
      await supa.from("cashback_transacoes").insert([{
        cliente_id:       tx.cliente_id,
        cliente_telefone: tx.cliente_telefone,
        pedido_id:        pedidoId,
        tipo:             "debito",
        valor:            tx.valor,
        validade_dias:    0,
        usado:            true,
      }]);

      // Atualiza saldo do cliente (coluna saldo_cashback conforme schema desta app)
      if (tx.cliente_id) {
        const { data: cli } = await supa
          .from("clientes")
          .select("saldo_cashback")
          .eq("id", tx.cliente_id)
          .single();
        if (cli) {
          const novoSaldo = Math.max(0, (cli.saldo_cashback || 0) - tx.valor);
          await supa
            .from("clientes")
            .update({ saldo_cashback: novoSaldo })
            .eq("id", tx.cliente_id);
        }
      }
      console.log(`✅ Cashback estornado: Gs ${tx.valor} — pedido #${pedidoId}`);
    }
  } catch (e) {
    console.warn("_estornarCashbackCancelamento:", e.message);
  }
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR RETRÁTIL (desktop)
   ══════════════════════════════════════════════════════════════ */
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const main = document.querySelector(".main-content");
  const btn = document.getElementById("btn-toggle-sidebar");
  if (!sidebar) return;
  const collapsed = sidebar.classList.toggle("collapsed");
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  if (btn)
    btn.innerHTML = collapsed
      ? '<i class="fas fa-bars"></i>'
      : '<i class="fas fa-chevron-left"></i>';
  localStorage.setItem("app_sidebar_collapsed", collapsed ? "1" : "0");
}

// Restaura estado da sidebar ao carregar
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("app_sidebar_collapsed") === "1") {
    document.querySelector(".sidebar")?.classList.add("collapsed");
    document.body.classList.add("sidebar-collapsed");
    const btn = document.getElementById("btn-toggle-sidebar");
    if (btn) btn.innerHTML = '<i class="fas fa-bars"></i>';
  }
});

/* ══════════════════════════════════════════════════════════════
   MANIFEST DINÂMICO
   ══════════════════════════════════════════════════════════════ */
function _atualizarManifestDinamico(logoUrl) {
  try {
    const manifest = {
      name: NOME_RESTAURANTE || "Restaurante",
      short_name: NOME_RESTAURANTE || "App",
      description: "Sistema de pedidos online",
      start_url: "/index.html",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#ffffff",
      theme_color: "#1d1d1d",
      icons: [
        {
          src: logoUrl,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: logoUrl,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    };
    const blob = new Blob([JSON.stringify(manifest)], {
      type: "application/manifest+json",
    });
    let el = document.querySelector('link[rel="manifest"]');
    if (!el) {
      el = document.createElement("link");
      el.rel = "manifest";
      document.head.appendChild(el);
    }
    el.href = URL.createObjectURL(blob);
    console.log("✅ Manifest atualizado");
  } catch (e) {
    console.warn("Manifest:", e.message);
  }
}

/* ══════════════════════════════════════════════════════════════
   INVENTÁRIO — Card Layout
   ══════════════════════════════════════════════════════════════ */
let _inventarioItems = [];
let _tipoAjuste = "add";

async function carregarInventario() {
  if (
    perfilUsuario !== "dono" &&
    perfilUsuario !== "gerente" &&
    perfilUsuario !== "adminMaster"
  )
    return;
  const container = document.getElementById("inventario-lista");
  if (!container) return;
  container.innerHTML =
    '<div style="text-align:center;padding:30px;color:#aaa"><i class="fas fa-spinner fa-spin"></i></div>';
  const { data, error } = await supa
    .from("inventario")
    .select(
      "id, nome, quantidade, unidade, quantidade_minima, observacoes, produto_id, perecivel, data_validade, produtos!inventario_produto_id_fkey(nome)",
    )
    .order("nome");
  if (error) {
    const { data: d2 } = await supa
      .from("inventario")
      .select("*")
      .order("nome");
    _inventarioItems = (d2 || []).map((i) => ({ ...i, produtos: null }));
  } else {
    _inventarioItems = data || [];
  }
  _renderInventarioCards();
  _verificarAlertasEstoque();
}

function _renderInventarioCards() {
  const container = document.getElementById("inventario-lista");
  if (!container) return;
  if (!_inventarioItems.length) {
    container.innerHTML =
      '<div style="text-align:center;padding:40px;color:#aaa">Nenhum item. Clique em "+ Novo Item".</div>';
    return;
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  container.innerHTML = _inventarioItems
    .map((item) => {
      const qtd = item.quantidade ?? 0;
      const min = item.quantidade_minima ?? 0;
      let bg = "",
        badgeStyle = "",
        badgeText = "";
      if (qtd <= 0) {
        bg = "#fff5f5";
        badgeStyle = "background:#fee2e2;color:#dc2626";
        badgeText = "🔴 Zerado";
      } else if (min > 0 && qtd <= min) {
        bg = "#fffbeb";
        badgeStyle = "background:#fef3c7;color:#d97706";
        badgeText = "⚠️ Baixo";
      } else {
        badgeStyle = "background:#dcfce7;color:#16a34a";
        badgeText = "✅ OK";
      }
      let validadeHtml = "";
      if (item.perecivel && item.data_validade) {
        const val = new Date(item.data_validade);
        val.setHours(0, 0, 0, 0);
        const dias = Math.ceil((val - hoje) / 86400000);
        if (dias < 0) {
          validadeHtml = `<span style="font-size:0.72rem;color:#dc2626;font-weight:600">🚫 VENCIDO</span>`;
          bg = "#fff0f0";
        } else if (dias <= 7) {
          validadeHtml = `<span style="font-size:0.72rem;color:#d97706;font-weight:600">⏰ Vence em ${dias}d</span>`;
          if (!bg) bg = "#fffbeb";
        } else
          validadeHtml = `<span style="font-size:0.72rem;color:#888">📅 Val: ${new Date(item.data_validade).toLocaleDateString("pt-BR")}</span>`;
      }
      const prodNome = item.produtos
        ? `<span style="font-size:0.72rem;background:#e8f4fd;color:#1a6eb5;padding:2px 8px;border-radius:10px">${item.produtos.nome}</span>`
        : "";
      const nEsc = (item.nome || "").replace(/'/g, "\\'");
      const qtdColor =
        qtd <= 0 ? "#dc2626" : min > 0 && qtd <= min ? "#d97706" : "#16a34a";
      return `<div class="inv-card" style="background:${bg}" data-id="${item.id}" data-nome="${(item.nome || "").replace(/"/g, "&quot;")}" data-status="${qtd <= 0 ? "zerado" : min > 0 && qtd <= min ? "baixo" : "ok"}">
      <div class="inv-card-top">
        <div class="inv-card-nome">${item.nome || ""}${item.perecivel ? " 🥛" : ""}${validadeHtml ? "<br>" + validadeHtml : ""}${item.observacoes ? `<br><small style="color:#888;font-weight:400">${item.observacoes}</small>` : ""}</div>
        <span class="inv-card-status-badge" style="${badgeStyle}">${badgeText}</span>
      </div>
      <div class="inv-card-row">
        <div><div class="inv-card-info">Unid: <strong>${item.unidade || "un"}</strong>${min > 0 ? ` · Mín: ${min}` : ""}</div>${prodNome}</div>
        <div class="inv-qtd-controls">
          <button class="inv-qtd-btn minus" onclick="ajusteRapido(${item.id},'sub','${nEsc}',${qtd})">−</button>
          <span class="inv-qtd-val" style="color:${qtdColor}">${qtd}</span>
          <button class="inv-qtd-btn plus" onclick="ajusteRapido(${item.id},'add','${nEsc}',${qtd})">+</button>
        </div>
      </div>
      <div class="inv-card-actions">
        <button style="background:#f59e0b;color:#fff" onclick="abrirModalInventario(${item.id})">✏️ Editar</button>
        <button style="background:#fee2e2;color:#dc2626" onclick="excluirInventario(${item.id})">🗑️</button>
      </div>
    </div>`;
    })
    .join("");
}

function filtrarInventario() {
  const busca = (
    document.getElementById("inv-busca")?.value || ""
  ).toLowerCase();
  const status = document.getElementById("inv-filtro-status")?.value || "";
  document
    .querySelectorAll("#inventario-lista .inv-card[data-id]")
    .forEach((card) => {
      const m1 =
        !busca || (card.dataset.nome || "").toLowerCase().includes(busca);
      const m2 = !status || card.dataset.status === status;
      card.style.display = m1 && m2 ? "" : "none";
    });
}

function _verificarAlertasEstoque() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alertas = [];
  _inventarioItems.forEach((i) => {
    const q = i.quantidade ?? 0,
      m = i.quantidade_minima ?? 0;
    if (q <= 0) alertas.push(`${i.nome} (zerado)`);
    else if (m > 0 && q <= m)
      alertas.push(`${i.nome} (${q} ${i.unidade || "un"})`);
    if (i.perecivel && i.data_validade) {
      const val = new Date(i.data_validade);
      val.setHours(0, 0, 0, 0);
      const dias = Math.ceil((val - hoje) / 86400000);
      if (dias <= 7)
        alertas.push(
          `${i.nome} vence ${dias <= 0 ? "VENCIDO" : "em " + dias + "d"}`,
        );
    }
  });
  const el = document.getElementById("alerta-estoque-baixo");
  const li = document.getElementById("alerta-estoque-lista");
  if (!el) return;
  if (alertas.length) {
    el.style.display = "block";
    li.textContent = alertas.join(" • ");
  } else el.style.display = "none";
}

function ajusteRapido(id, tipo, nome, qtdAtual) {
  abrirModalAjuste(id, nome, qtdAtual);
  setTipoAjuste(tipo);
}

async function abrirModalInventario(id = null) {
  document.getElementById("inv-id").value = id || "";
  ["inv-nome", "inv-qtd", "inv-minimo", "inv-obs", "inv-validade"].forEach(
    (i) => {
      const el = document.getElementById(i);
      if (el) el.value = "";
    },
  );
  const per = document.getElementById("inv-perecivel");
  if (per) per.checked = false;
  const valA = document.getElementById("inv-validade-area");
  if (valA) valA.style.display = "none";
  document.getElementById("inv-unidade").value = "un";
  document.getElementById("inv-produto-id").innerHTML =
    '<option value="">— Sem vínculo —</option>';
  document.getElementById("modal-inv-titulo").textContent = id
    ? "✏️ Editar Item"
    : "📦 Novo Item de Estoque";
  const { data: prods } = await supa
    .from("produtos")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");
  if (prods) {
    const sel = document.getElementById("inv-produto-id");
    prods.forEach((p) => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.nome;
      sel.appendChild(o);
    });
  }
  if (id) {
    const item = _inventarioItems.find((i) => i.id === id);
    if (item) {
      document.getElementById("inv-nome").value = item.nome || "";
      document.getElementById("inv-qtd").value = item.quantidade ?? "";
      document.getElementById("inv-unidade").value = item.unidade || "un";
      document.getElementById("inv-minimo").value =
        item.quantidade_minima ?? "";
      document.getElementById("inv-obs").value = item.observacoes || "";
      if (item.produto_id)
        document.getElementById("inv-produto-id").value = item.produto_id;
      if (item.perecivel && per) {
        per.checked = true;
        if (valA) valA.style.display = "block";
        const vi = document.getElementById("inv-validade");
        if (vi && item.data_validade)
          vi.value = item.data_validade.split("T")[0];
      }
    }
  }
  document.getElementById("modal-inventario").style.display = "flex";
}

function togglePerecivel() {
  const c = document.getElementById("inv-perecivel")?.checked;
  const a = document.getElementById("inv-validade-area");
  if (a) a.style.display = c ? "block" : "none";
}

async function salvarInventario() {
  const id = document.getElementById("inv-id").value;
  const nome = document.getElementById("inv-nome").value.trim();
  if (!nome) {
    alert("Informe o nome do item.");
    return;
  }
  const perecivel = document.getElementById("inv-perecivel")?.checked || false;
  const dados = {
    nome,
    quantidade: parseFloat(document.getElementById("inv-qtd").value) || 0,
    unidade: document.getElementById("inv-unidade").value,
    quantidade_minima:
      parseFloat(document.getElementById("inv-minimo").value) || null,
    observacoes: document.getElementById("inv-obs").value.trim() || null,
    produto_id:
      parseInt(document.getElementById("inv-produto-id").value) || null,
    perecivel,
    data_validade:
      perecivel && document.getElementById("inv-validade").value
        ? document.getElementById("inv-validade").value
        : null,
  };
  const { error } = id
    ? await supa.from("inventario").update(dados).eq("id", id)
    : await supa.from("inventario").insert([dados]);
  if (error) {
    alert("Erro: " + error.message);
    return;
  }
  fecharModal("modal-inventario");
  carregarInventario();
}

async function excluirInventario(id) {
  if (!confirm("Excluir este item?")) return;
  await supa.from("inventario").delete().eq("id", id);
  carregarInventario();
}

function setTipoAjuste(tipo) {
  _tipoAjuste = tipo;
  ["add", "sub", "set"].forEach((t) => {
    const btn = document.getElementById(`btn-ajuste-${t}`);
    if (btn) btn.style.opacity = t === tipo ? "1" : "0.5";
  });
  const labels = {
    add: "Quantidade a adicionar",
    sub: "Quantidade a remover",
    set: "Nova quantidade total",
  };
  const el = document.getElementById("ajuste-qtd-label");
  if (el) el.textContent = labels[tipo];
}

function abrirModalAjuste(id, nome, qtdAtual) {
  _tipoAjuste = "add";
  document.getElementById("ajuste-inv-id").value = id;
  document.getElementById("ajuste-inv-nome").textContent =
    `${nome} — Atual: ${qtdAtual}`;
  document.getElementById("ajuste-qtd").value = "";
  document.getElementById("ajuste-motivo").value = "";
  setTipoAjuste("add");
  document.getElementById("modal-ajuste-estoque").style.display = "flex";
}

async function confirmarAjuste() {
  const id = document.getElementById("ajuste-inv-id").value;
  const qtd = parseFloat(document.getElementById("ajuste-qtd").value);
  if (isNaN(qtd) || qtd < 0) {
    alert("Quantidade inválida.");
    return;
  }
  const item = _inventarioItems.find((i) => i.id == id);
  const atual = item ? (item.quantidade ?? 0) : 0;
  const nova =
    _tipoAjuste === "add"
      ? atual + qtd
      : _tipoAjuste === "sub"
        ? Math.max(0, atual - qtd)
        : qtd;
  const { error } = await supa
    .from("inventario")
    .update({ quantidade: nova })
    .eq("id", id);
  if (error) {
    alert("Erro: " + error.message);
    return;
  }
  const motivo = document.getElementById("ajuste-motivo").value.trim();
  const userEmail = (await supa.auth.getUser()).data?.user?.email || "";
  await supa
    .from("inventario_movimentos")
    .insert([
      {
        inventario_id: parseInt(id),
        tipo: _tipoAjuste,
        quantidade: qtd,
        motivo: motivo || null,
        usuario_email: userEmail,
      },
    ])
    .then(() => {})
    .catch(() => {});
  fecharModal("modal-ajuste-estoque");
  carregarInventario();
}

async function _carregarSelectInventario(selectedId = null) {
  const sel = document.getElementById("prod-inventario-id");
  if (!sel) return;
  sel.innerHTML = '<option value="">— Selecione o item —</option>';
  const { data } = await supa
    .from("inventario")
    .select("id, nome, quantidade, unidade")
    .order("nome");
  if (data) {
    data.forEach((i) => {
      const opt = document.createElement("option");
      opt.value = i.id;
      opt.textContent = `${i.nome} (${i.quantidade ?? 0} ${i.unidade || "un"})`;
      if (selectedId && i.id == selectedId) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}

function toggleEstoqueProduto() {
  const checked = document.getElementById("prod-tem-estoque")?.checked;
  const area = document.getElementById("estoque-area");
  if (!area) return;
  area.style.display = checked ? "block" : "none";
  if (checked) _carregarSelectInventario();
}
// =========================================
// FRETE PDV — ROTA REAL (OSRM)
// =========================================

function toggleDeliveryRowPDV(tipo) {
  const row = document.getElementById("pdv-delivery-row");
  if (!row) return;
  row.style.display = tipo === "delivery" ? "block" : "none";
  if (tipo !== "delivery") {
    const freteInput = document.getElementById("balcao-frete");
    const msg = document.getElementById("frete-msg-pdv");
    const gmapsLink = document.getElementById("balcao-gmaps-link");
    const btnAbrir = document.getElementById("btn-abrir-gmaps");
    if (freteInput) freteInput.value = "";
    if (msg) msg.innerHTML = "";
    if (gmapsLink) gmapsLink.value = "";
    if (btnAbrir) { btnAbrir.style.display = "none"; btnAbrir.href = "#"; }
  }
  atualizarCarrinhoPDV();
}

// Consulta distância pela rota real (OSRM público). Retorna km ou null se falhar.
async function obterDistanciaPelaRota(latDestino, lngDestino) {
  const origem = `${COORD_LOJA.lng},${COORD_LOJA.lat}`;
  const destino = `${lngDestino},${latDestino}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${origem};${destino}?overview=false`;
  try {
    const r = await fetch(url);
    const d = await r.json();
    if (d.code === "Ok") return d.routes[0].distance / 1000;
    return null;
  } catch {
    return null;
  }
}

// ── Helper: extrai lat/lng de um link do Google Maps ─────────────────
function _extrairCoordsGmaps(linkStr) {
  if (!linkStr) return { lat: null, lng: null };
  const patterns = [
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /\/place\/[^/@]*\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /maps\?.*ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  ];
  for (const rx of patterns) {
    const m = linkStr.match(rx);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }
  return { lat: null, lng: null };
}

// ── Helper: chamado quando o usuario cola/digita no campo link gmaps ──
function pdvOnGmapsLinkInput(val) {
  const btnAbrir = document.getElementById("btn-abrir-gmaps");
  const v = (val || "").trim();
  if (!btnAbrir) return;
  if (v.startsWith("http")) {
    btnAbrir.href = v;
    btnAbrir.style.display = "inline-flex";
  } else {
    btnAbrir.style.display = "none";
  }
}

async function calcularFretePDV() {
  const btn = document.getElementById("btn-gps-pdv");
  const msg = document.getElementById("frete-msg-pdv");
  const freteInput = document.getElementById("balcao-frete");

  btn.disabled = true;
  btn.innerHTML = "⏳";
  msg.innerHTML = '<span style="color:#888">Localizando...</span>';

  // ── Tenta extrair coordenadas: primeiro do campo Google Maps Link,
  //    depois do campo endereço (retro-compatibilidade)
  const gmapsLinkVal = (
    document.getElementById("balcao-gmaps-link")?.value || ""
  ).trim();
  const endVal = (
    document.getElementById("balcao-endereco")?.value || ""
  ).trim();

  // Prioridade: campo gmaps-link → campo endereço (pode conter link tb)
  let { lat, lng } = _extrairCoordsGmaps(gmapsLinkVal);
  if (lat === null) {
    const fromEnd = _extrairCoordsGmaps(endVal);
    lat = fromEnd.lat;
    lng = fromEnd.lng;
  }

  // ── Se não extraiu do link, usa GPS do dispositivo ────────────────────
  if (lat === null || lng === null) {
    if (!navigator.geolocation) {
      msg.innerHTML =
        '<span style="color:#e74c3c">Cole um link do Google Maps no campo acima ou use um celular com GPS</span>';
      btn.disabled = false;
      btn.innerHTML = "📍 Calcular";
      return;
    }
    let position;
    try {
      position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        }),
      );
    } catch {
      msg.innerHTML =
        '<span style="color:#e74c3c">Cole um link do Google Maps no campo acima, ou permita o GPS</span>';
      btn.disabled = false;
      btn.innerHTML = "📍 Calcular";
      return;
    }
    lat = position.coords.latitude;
    lng = position.coords.longitude;
  }

  // ── Salva coords no campo oculto para usar no insert ─────────────────
  document.getElementById("balcao-geo-lat").value = lat;
  document.getElementById("balcao-geo-lng").value = lng;

  msg.innerHTML = '<span style="color:#888">⏳ Calculando rota...</span>';
  let dist = await obterDistanciaPelaRota(lat, lng);
  let usouRota = true;
  if (dist === null) {
    // Fallback linha reta
    const R = 6371,
      toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat - COORD_LOJA.lat);
    const dLon = toRad(lng - COORD_LOJA.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(COORD_LOJA.lat)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLon / 2) ** 2;
    dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    usouRota = false;
  }

  // LIMITES_KM deve ser idêntico ao index.ts (Edge Function) para evitar
  // divergência entre o frete calculado no front e o validado no servidor.
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

  const nota = usouRota ? "🛣️ rota" : "📏 linha reta*";

  if (
    freteIndex === -1 ||
    (TABELA_FRETE_ADMIN && TABELA_FRETE_ADMIN[freteIndex]?.acombinar)
  ) {
    msg.innerHTML = `<span style="color:#e67e22">⚠️ ${dist.toFixed(1)}km (${nota}) — combinar frete</span>`;
    freteInput.value = "";
    btn.disabled = false;
    btn.innerHTML = "📍 Calcular";
    atualizarCarrinhoPDV();
    return;
  }

  let frete = 0;
  if (TABELA_FRETE_ADMIN?.[freteIndex]) {
    frete = TABELA_FRETE_ADMIN[freteIndex].loja || 0;
  } else {
    if (dist <= 3.3) frete = 6000;
    else if (dist <= 4.2) frete = 12000;
    else if (dist <= 5.2) frete = 18000;
    else if (dist <= 6.2) frete = 24000;
    else frete = 24000 + Math.ceil(dist - 6.2) * 3000;
  }

  freteInput.value = frete;
  const aviso = usouRota ? "" : ' <em style="color:#e67e22">(estimativa)</em>';
  msg.innerHTML = `<span style="color:#27ae60">✅ ${dist.toFixed(1)}km ${nota} → Gs ${frete.toLocaleString("es-PY")}</span>${aviso}`;
  btn.disabled = false;
  btn.innerHTML = "📍 Calcular";
  atualizarCarrinhoPDV();
}

// ═══════════════════════════════════════════════════════════════
// ONBOARDING — Configuração inicial do restaurante
// ═══════════════════════════════════════════════════════════════

const _OB_STEPS = [
  {
    id: "identidade",
    titulo: "🏪 Identidade da Loja",
    descricao: "Como seu restaurante vai aparecer para os clientes.",
    campos: [
      {
        id: "ob-nome",
        label: "Nome do restaurante *",
        tipo: "text",
        placeholder: "Ex: Açaí do João",
        db: "nome_restaurante",
      },
      {
        id: "ob-descricao",
        label: "Descrição curta",
        tipo: "text",
        placeholder: "Ex: O melhor açaí da cidade",
        db: "descricao_loja",
      },
      {
        id: "ob-whatsapp",
        label: "WhatsApp (com DDI)",
        tipo: "text",
        placeholder: "Ex: 595981234567",
        db: "whatsapp_loja",
      },
      {
        id: "ob-logo",
        label: "URL do Logo",
        tipo: "url",
        placeholder: "https://...",
        db: "logo_url",
      },
    ],
  },
  {
    id: "visual",
    titulo: "🎨 Identidade Visual",
    descricao: "Cor principal que aparece no app do cliente.",
    campos: [
      {
        id: "ob-cor",
        label: "Cor primária",
        tipo: "color",
        placeholder: "#1a7a2e",
        db: "cor_primaria",
        extra: `<input type="text" id="ob-cor-hex" maxlength="7" placeholder="#1a7a2e"
                  style="padding:8px 12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.9rem;width:120px;margin-left:8px"
                  oninput="var v=this.value;if(v.startsWith('#')&&v.length===7){document.getElementById('ob-cor').value=v;document.documentElement.style.setProperty('--primary',v);}">
                <span style="font-size:0.8rem;color:#888;margin-left:8px">← ou digita o hex</span>`,
      },
    ],
  },
  {
    id: "localizacao",
    titulo: "📍 Localização da Loja",
    descricao: "Coordenadas usadas para calcular o frete de entrega.",
    campos: [
      {
        id: "ob-lat",
        label: "Latitude *",
        tipo: "text",
        placeholder: "Ex: -25.2866",
        db: "coord_lat",
      },
      {
        id: "ob-lng",
        label: "Longitude *",
        tipo: "text",
        placeholder: "Ex: -57.6470",
        db: "coord_lng",
      },
    ],
    dica: `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:12px;margin-top:12px;font-size:0.83rem">
      💡 <strong>Como pegar as coordenadas:</strong><br>
      Abra <a href="https://maps.google.com" target="_blank" style="color:#2980b9">Google Maps</a>,
      clique com o botão direito no seu endereço e copie os números que aparecem (Ex: -25.286, -57.647).
    </div>`,
  },
  {
    id: "pagamento",
    titulo: "💳 Formas de Pagamento",
    descricao: "Configure PIX e Alias/Transferência para receber pagamentos.",
    campos: [
      {
        id: "ob-pix",
        label: "Chave PIX",
        tipo: "text",
        placeholder: "CPF, CNPJ, e-mail ou telefone",
        db: "chave_pix",
      },
      {
        id: "ob-nome-pix",
        label: "Nome no PIX",
        tipo: "text",
        placeholder: "Nome que aparece no QR Code",
        db: "nome_pix",
      },
      {
        id: "ob-alias",
        label: "Alias / Cuenta",
        tipo: "text",
        placeholder: "banco@alias.com.py",
        db: "dados_alias",
      },
      {
        id: "ob-cotacao",
        label: "Cotação do Real (Gs)",
        tipo: "number",
        placeholder: "1100",
        db: "cotacao_real",
      },
    ],
  },
  {
    id: "horario",
    titulo: "🕐 Horário de Funcionamento",
    descricao:
      "Configure o horário padrão. Pode afinar por dia depois em Configurações.",
    campos: [],
    custom: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
        <div>
          <label style="font-size:0.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Abre às</label>
          <input type="time" id="ob-hora-abre" value="10:00"
            style="width:100%;padding:10px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:1rem">
        </div>
        <div>
          <label style="font-size:0.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Fecha às</label>
          <input type="time" id="ob-hora-fecha" value="23:00"
            style="width:100%;padding:10px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:1rem">
        </div>
      </div>
      <p style="font-size:0.78rem;color:#999;margin-top:8px">Este horário será aplicado a todos os dias da semana.</p>
    `,
  },
];

let _obStep = 0;
let _obData = {};

async function iniciarOnboarding() {
  // Só mostra se o banco não tiver nome configurado ainda
  try {
    const { data } = await supa
      .from("configuracoes")
      .select("nome_restaurante")
      .maybeSingle();
    if (data?.nome_restaurante) return; // já configurado
  } catch (_) {
    return;
  }

  _obStep = 0;
  _obData = {};
  _obRender();
  document.getElementById("modal-onboarding").style.display = "flex";
}

function _obRender() {
  const step = _OB_STEPS[_obStep];
  const total = _OB_STEPS.length;
  const isLast = _obStep === total - 1;
  const isFirst = _obStep === 0;

  // Dots
  const dots = document.getElementById("ob-dots");
  if (dots) {
    dots.innerHTML = _OB_STEPS
      .map(
        (s, i) => `
      <div style="height:6px;flex:1;border-radius:3px;background:${i <= _obStep ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)"}"></div>
    `,
      )
      .join("");
  }

  // Step label
  const lbl = document.getElementById("ob-step-label");
  if (lbl) lbl.textContent = `Passo ${_obStep + 1} de ${total}`;

  // Prev/Next buttons
  const prev = document.getElementById("ob-btn-prev");
  const next = document.getElementById("ob-btn-next");
  if (prev) prev.style.visibility = isFirst ? "hidden" : "visible";
  if (next) next.textContent = isLast ? "✅ Salvar & Concluir" : "Próximo →";

  // Body
  const body = document.getElementById("ob-body");
  if (!body) return;

  let html = `
    <h3 style="font-size:1.15rem;font-weight:800;color:#1a1a1a;margin-bottom:4px">${step.titulo}</h3>
    <p style="font-size:0.85rem;color:#666;margin-bottom:18px">${step.descricao}</p>
  `;

  // Campos padrão
  (step.campos || []).forEach((c) => {
    const savedVal = _obData[c.db] || "";
    if (c.tipo === "color") {
      html += `
        <div style="margin-bottom:14px">
          <label style="font-size:0.82rem;font-weight:600;color:#555;display:block;margin-bottom:6px">${c.label}</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="color" id="${c.id}" value="${savedVal || "#1a7a2e"}"
              style="width:52px;height:38px;border:none;border-radius:8px;cursor:pointer;padding:2px"
              oninput="document.getElementById('ob-cor-hex').value=this.value;document.documentElement.style.setProperty('--primary',this.value)">
            ${c.extra || ""}
          </div>
        </div>`;
    } else {
      html += `
        <div style="margin-bottom:14px">
          <label style="font-size:0.82rem;font-weight:600;color:#555;display:block;margin-bottom:6px">${c.label}</label>
          <input type="${c.tipo}" id="${c.id}" value="${savedVal}"
            placeholder="${c.placeholder}"
            style="width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.92rem;transition:border-color .2s"
            onfocus="this.style.borderColor='var(--primary,#1a7a2e)'" onblur="this.style.borderColor='#e0e0e0'">
        </div>`;
    }
  });

  // Custom HTML (horário)
  if (step.custom) html += step.custom;

  // Dica
  if (step.dica) html += step.dica;

  body.innerHTML = html;

  // Restaura valor cor hex se voltou ao passo
  if (step.id === "visual") {
    const corVal = _obData["cor_primaria"] || "#1a7a2e";
    const hexEl = document.getElementById("ob-cor-hex");
    if (hexEl) hexEl.value = corVal;
    document.documentElement.style.setProperty("--primary", corVal);
  }
}

function _obColetar() {
  const step = _OB_STEPS[_obStep];

  (step.campos || []).forEach((c) => {
    const el = document.getElementById(c.id);
    if (el) _obData[c.db] = el.value.trim();
  });

  // Horário: monta grade semanal simples
  if (step.id === "horario") {
    const abre = document.getElementById("ob-hora-abre")?.value || "10:00";
    const fecha = document.getElementById("ob-hora-fecha")?.value || "23:00";
    const dias = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
    const grade = {};
    dias.forEach((d) => {
      grade[d] = { fechado: false, turnos: [{ abre, fecha }] };
    });
    _obData["horarios_semanais"] = grade;
    _obData["loja_aberta"] = true;
  }
}

function _obNext() {
  _obColetar();
  if (_obStep < _OB_STEPS.length - 1) {
    _obStep++;
    _obRender();
  } else {
    _obSalvar();
  }
}

function _obPrev() {
  _obColetar();
  if (_obStep > 0) {
    _obStep--;
    _obRender();
  }
}

function _obSkip() {
  if (
    !confirm(
      "Pular a configuração inicial? Você pode configurar depois em Configurações.",
    )
  )
    return;
  document.getElementById("modal-onboarding").style.display = "none";
}

async function _obSalvar() {
  const btn = document.getElementById("ob-btn-next");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Salvando...";
  }

  try {
    // Prepara dados — filtra vazios
    const payload = {};
    Object.entries(_obData).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) payload[k] = v;
    });

    // Numérico
    if (payload.cotacao_real)
      payload.cotacao_real = parseFloat(payload.cotacao_real) || 1100;
    if (payload.coord_lat)
      payload.coord_lat = parseFloat(payload.coord_lat) || 0;
    if (payload.coord_lng)
      payload.coord_lng = parseFloat(payload.coord_lng) || 0;

    // Sincroniza logo_url e icone_url
    if (payload.logo_url) payload.icone_url = payload.logo_url;

    const { error } = await supa
      .from("configuracoes")
      .update(payload)
      .gt("id", 0);

    if (error) throw new Error(error.message);

    // Aplica cor imediatamente
    if (payload.cor_primaria)
      document.documentElement.style.setProperty(
        "--primary",
        payload.cor_primaria,
      );

    document.getElementById("modal-onboarding").style.display = "none";

    // Toast de sucesso
    _pdvToast?.("✅ Configuração salva! O app já reflete os dados.") ||
      alert("✅ Configuração inicial salva com sucesso!");

    // Recarrega a aba de configurações se estiver aberta
    if (
      document.getElementById("configuracoes")?.classList.contains("active")
    ) {
      carregarConfiguracoes();
    }

    // Atualiza brand
    if (payload.nome_restaurante) {
      const b = document.getElementById("brand-text");
      if (b) b.textContent = payload.nome_restaurante.toUpperCase() + " ADMIN";
      NOME_RESTAURANTE = payload.nome_restaurante;
    }
  } catch (e) {
    alert("Erro ao salvar: " + e.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✅ Salvar & Concluir";
    }
  }
}

// Chamado no DOMContentLoaded após auth — só mostra se banco não configurado
// (injeta no fluxo de inicialização existente)
document.addEventListener("DOMContentLoaded", () => {
  // Aguarda auth (1.5s) para não conflitar com o auth-overlay
  setTimeout(async () => {
    if (perfilUsuario && ["dono", "adminMaster"].includes(perfilUsuario)) {
      await iniciarOnboarding();
    }
  }, 1500);
});

function ftMostrarPanel(panel) {
  ["insumos", "fichas"].forEach((p) => {
    const el = document.getElementById(`ft-panel-${p}`);
    const btn = document.getElementById(`ft-nav-${p}`);
    if (el) el.style.display = p === panel ? "block" : "none";
    if (btn) {
      // ft-tab-ativo = fundo preenchido; sem ela = outline com texto/borda coloridos
      btn.classList.toggle("ft-tab-ativo", p === panel);
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  PATCH 7 — Editar/Excluir Despesas (porta da aplicação-modelo)
//  Se estas funções NÃO existirem no seu admin.js atual, adicione-as:
// ─────────────────────────────────────────────────────────────
function abrirEditarDespesa(dadosEncoded) {
  try {
    const d = JSON.parse(decodeURIComponent(dadosEncoded));
    document.getElementById("edit-despesa-id").value = d.id;
    document.getElementById("edit-despesa-valor").value = d.valor;
    document.getElementById("edit-despesa-desc").value = d.descricao;
    const tipoSel = document.getElementById("edit-despesa-tipo");
    if (tipoSel) tipoSel.value = d.tipo_despesa || "despesas_gerais";
    const outroBox = document.getElementById("edit-box-outro");
    const outroInput = document.getElementById("edit-despesa-outro");
    if (d.tipo_despesa === "outro") {
      if (outroBox) outroBox.style.display = "block";
      if (outroInput) outroInput.value = d.descricao_outro || "";
    } else {
      if (outroBox) outroBox.style.display = "none";
      if (outroInput) outroInput.value = "";
    }
    document.getElementById("modal-editar-despesa").style.display = "flex";
  } catch (e) {
    alert("Erro ao abrir edição: " + e.message);
  }
}

async function salvarEdicaoDespesa() {
  const id = document.getElementById("edit-despesa-id").value;
  const valor = parseFloat(document.getElementById("edit-despesa-valor").value);
  const desc = document.getElementById("edit-despesa-desc").value.trim();
  const tipo = document.getElementById("edit-despesa-tipo").value;

  if (!id || !valor || valor <= 0) {
    alert("Preencha o valor corretamente.");
    return;
  }

  let descOutro = null;
  if (tipo === "outro") {
    descOutro =
      document.getElementById("edit-despesa-outro")?.value?.trim() || "";
    if (!descOutro) {
      alert("Descreva o tipo da despesa.");
      return;
    }
  }

  const { error } = await supa
    .from("movimentacoes_caixa")
    .update({
      valor,
      descricao: desc,
      tipo_despesa: tipo,
      descricao_outro: descOutro,
    })
    .eq("id", id);

  if (error) {
    alert("Erro ao salvar: " + error.message);
    return;
  }
  fecharModal("modal-editar-despesa");
  calcularFinanceiro();
}

async function excluirDespesa(id) {
  if (!confirm("Excluir esta despesa? Esta ação não pode ser desfeita."))
    return;
  const { error } = await supa
    .from("movimentacoes_caixa")
    .delete()
    .eq("id", id);
  if (error) {
    alert("Erro ao excluir: " + error.message);
    return;
  }
  calcularFinanceiro();
}
// ══════════════════════════════════════════════════════════════
//  VERIFICAÇÃO DE CONTRATO
//  adminMaster: bypass total.
//  dono: exibe overlay bloqueante no admin.html até assinar.
//  outros cargos: bypass (não são parte do contrato).
// ══════════════════════════════════════════════════════════════
async function verificarContratoAdmin(session) {
  try {
    const { data: perfil } = await supa
      .from("perfis_acesso")
      .select("cargo")
      .eq("id", session.user.id)
      .maybeSingle();

    const cargo = perfil?.cargo || "dono";

    // adminMaster e outros cargos não precisam assinar
    if (cargo === "adminMaster") return;
    if (cargo !== "dono") return;

    // Verifica se o dono já aceitou
    const { data } = await supa
      .from("contratos_aceites")
      .select("id")
      .eq("usuario_id", session.user.id)
      .eq("aceito", true)
      .maybeSingle();

    if (!data) {
      // Ainda não assinou — exibe overlay bloqueante no próprio admin
      _admMostrarContratoOverlay(session);
    }
  } catch (e) {
    // Fail-open: se erro ao verificar, não bloqueia o admin
    console.warn("verificarContratoAdmin error:", e.message);
  }
}

function _admMostrarContratoOverlay(session) {
  const overlay = document.getElementById("contrato-admin-overlay");
  if (!overlay) {
    // Fallback se o HTML não foi atualizado
    alert("Você precisa aceitar o contrato de serviços para continuar.");
    supa.auth.signOut().then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  const hoje = new Date();
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const el = (id) => document.getElementById(id);
  if (el("adm-ct-dia")) el("adm-ct-dia").textContent = hoje.getDate();
  if (el("adm-ct-mes")) el("adm-ct-mes").textContent = meses[hoje.getMonth()];
  if (el("adm-ct-ano")) el("adm-ct-ano").textContent = hoje.getFullYear();

  window._admContratoSession = session;
  overlay.style.display = "flex";

  setTimeout(() => {
    const scrollArea = el("adm-contrato-scroll");
    if (scrollArea) scrollArea.scrollTop = 0;
  }, 100);
}

// ──────────────────────────────────────────────────────────────
//  FUNÇÕES DO OVERLAY DE CONTRATO (admin.html)
// ──────────────────────────────────────────────────────────────
let _admContratoScrollCompleto = false;

function admOnScrollContrato() {
  const area = document.getElementById("adm-contrato-scroll");
  const bar = document.getElementById("adm-contrato-bar");
  const hint = document.getElementById("adm-scroll-hint");
  if (!area) return;

  const pct = Math.min(
    100,
    Math.round(
      (area.scrollTop / (area.scrollHeight - area.clientHeight)) * 100,
    ),
  );
  if (bar) bar.style.width = pct + "%";

  if (pct >= 90 && !_admContratoScrollCompleto) {
    _admContratoScrollCompleto = true;
    const chk = document.getElementById("adm-chk-aceite");
    if (chk) chk.disabled = false;
    if (hint) hint.style.display = "none";
  }
}

function admAtualizarNome(val) {
  const el = document.getElementById("adm-ct-nombre");
  if (el) el.textContent = val || "[Nome do Cliente]";
}

function admAtualizarDoc(val) {
  const el = document.getElementById("adm-ct-doc");
  if (el) el.textContent = val || "[Documento]";
}

function admToggleBtnAceitar() {
  const chk = document.getElementById("adm-chk-aceite");
  const btn = document.getElementById("adm-btn-aceitar");
  const nome = document.getElementById("adm-c-nome")?.value?.trim();
  const doc = document.getElementById("adm-c-doc")?.value?.trim();
  const ok = chk?.checked && nome && doc;
  if (btn) {
    btn.disabled = !ok;
    btn.style.opacity = ok ? "1" : "0.45";
    btn.style.cursor = ok ? "pointer" : "not-allowed";
  }
}

async function admAceitarContrato() {
  const session = window._admContratoSession;
  if (!session) return;

  const nome = document.getElementById("adm-c-nome")?.value?.trim();
  const doc = document.getElementById("adm-c-doc")?.value?.trim();

  if (!nome || !doc) {
    alert("Preencha seu nome completo e RUC/C.I. para assinar.");
    return;
  }

  const btn = document.getElementById("adm-btn-aceitar");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Registrando assinatura...";
  }

  try {
    let ip = "";
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      ip = (await r.json()).ip || "";
    } catch (_) {}

    const { error } = await supa.from("contratos_aceites").insert([
      {
        usuario_id: session.user.id,
        aceito: true,
        nome_assinante: nome,
        doc_assinante: doc,
        ip_assinante: ip,
        user_agent: navigator.userAgent,
        aceito_em: new Date().toISOString(),
      },
    ]);

    if (error) {
      // Pode já existir — tenta update
      if (error.code === "23505" || error.message?.includes("duplicate")) {
        await supa
          .from("contratos_aceites")
          .update({
            aceito: true,
            nome_assinante: nome,
            doc_assinante: doc,
            aceito_em: new Date().toISOString(),
          })
          .eq("usuario_id", session.user.id);
      } else {
        throw error;
      }
    }

    const overlay = document.getElementById("contrato-admin-overlay");
    if (overlay) overlay.style.display = "none";
    console.log("✅ Contrato aceito com sucesso.");
  } catch (e) {
    alert("Erro ao registrar assinatura: " + e.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✍️ ASSINAR E CONTINUAR";
    }
  }
}