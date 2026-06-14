// ══════════════════════════════════════════════════════════════
//  MÓDULO CRM — Clientes + Cashback com Expiração
//  Arquivo: crm.js  |  Requer: supabaseClient.js
// ══════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
//  Estado
// ──────────────────────────────────────────────────────────────
let _crm_clientes   = [];
let _crm_cfg        = { cashback_percentual: 10, cashback_validade_dias: 30 };
let _crm_busca      = '';
let _crm_abaAtiva   = 'todos';   // 'todos' | 'aniversariantes'

// ──────────────────────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────────────────────
async function initCRM() {
  await _crmCarregarConfig();
  await crmCarregarClientes();
}

async function _crmCarregarConfig() {
  const { data } = await supa
    .from('configuracoes')
    .select('cashback_percentual, cashback_validade_dias')
    .maybeSingle();
  if (data) {
    _crm_cfg.cashback_percentual   = data.cashback_percentual   ?? 10;
    _crm_cfg.cashback_validade_dias = data.cashback_validade_dias ?? 30;
  }
  // Atualiza campos de config se visíveis
  const elPct = document.getElementById('crm-cfg-pct');
  const elVal = document.getElementById('crm-cfg-val');
  if (elPct) elPct.value = _crm_cfg.cashback_percentual;
  if (elVal) elVal.value = _crm_cfg.cashback_validade_dias;
}

// ──────────────────────────────────────────────────────────────
//  CLIENTES — CRUD
// ──────────────────────────────────────────────────────────────
async function crmCarregarClientes() {
  try {
    const { data, error } = await supa
      .from('clientes')
      .select('*')
      .order('nome');
    if (error) { console.warn('crmCarregarClientes (rode a migração SQL):', error.message); return; }
    _crm_clientes = data || [];
    _crmExpirarCashback();
    crmRenderClientes();
    crmRenderKPIs();
    crmRenderAniversariantes();
  } catch(e) { console.warn('crmCarregarClientes:', e.message); }
}

async function _crmExpirarCashback() {
  // Marca como usado os créditos vencidos — saldo já deve ser 0 nestes
  try {
    await supa
      .from('cashback_transacoes')
      .update({ usado: true })
      .eq('tipo', 'credito')
      .eq('usado', false)
      .lt('expira_em', new Date().toISOString());
  } catch(e) { /* silencioso */ }
}

function crmRenderKPIs() {
  const total       = _crm_clientes.length;
  const comSaldo    = _crm_clientes.filter(c => (c.saldo_cashback || 0) > 0).length;
  const totalCash   = _crm_clientes.reduce((s, c) => s + (c.saldo_cashback || 0), 0);

  _estSetKPI2('crm-kpi-total',    total);
  _estSetKPI2('crm-kpi-comSaldo', comSaldo);
  _estSetKPI2('crm-kpi-cashback', `Gs ${Math.round(totalCash).toLocaleString('es-PY')}`);
}

function _estSetKPI2(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function crmMudarAba(aba) {
  _crm_abaAtiva = aba;
  document.querySelectorAll('.crm-aba-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`crm-aba-${aba}`);
  if (btn) btn.classList.add('active');
  crmRenderClientes();
}

function crmRenderClientes() {
  const tbody = document.getElementById('crm-lista-clientes');
  if (!tbody) return;

  const hoje = new Date();
  const busca = _crm_busca.toLowerCase();

  let lista = _crm_clientes.filter(c => {
    if (busca && !c.nome.toLowerCase().includes(busca) && !(c.telefone || '').includes(busca)) return false;
    if (_crm_abaAtiva === 'aniversariantes') {
      const { ehHoje, ehSemana } = _crmAniversario(c.data_nascimento);
      return ehHoje || ehSemana;
    }
    return true;
  });

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px">
      ${_crm_abaAtiva === 'aniversariantes' ? t('crm.nenhum_aniversariante', '🎂 Ningún cumpleañero esta semana') : t('crm.nenhum_cliente', 'Ningún cliente encontrado')}
    </td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(c => {
    const { ehHoje, ehSemana, label } = _crmAniversario(c.data_nascimento);
    const badge = ehHoje
      ? `<span style="background:#ff9800;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:700">${t('geral.hoje_excl', '¡HOY!')}</span>`
      : ehSemana
        ? `<span style="background:#4caf50;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.72rem">${t('geral.esta_semana', 'Esta semana')}</span>`
        : '';

    const saldo = c.saldo_cashback || 0;
    const saldoColor = saldo > 0 ? '#1a7a2e' : '#aaa';

    return `<tr ${ehHoje ? 'style="background:#fff8e1"' : ''}>
      <td>
        <div style="font-weight:600">${c.nome}</div>
        ${badge}
      </td>
      <td style="color:#555">${c.telefone || '—'}</td>
      <td style="color:#888;font-size:0.82rem">${label}</td>
      <td style="font-weight:700;color:${saldoColor}">
        ${saldo > 0 ? `Gs ${Math.round(saldo).toLocaleString('es-PY')}` : '—'}
      </td>
      <td style="color:#888;font-size:0.82rem">
        Gs ${Math.round(c.total_gasto || 0).toLocaleString('es-PY')}
      </td>
      <td style="text-align:center;white-space:nowrap">
        <button onclick="crmAbrirModalCliente(${c.id})"
          style="background:#3498db;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem;margin-right:4px">
          ✏️
        </button>
        <button onclick="crmVerHistorico(${c.id})"
          style="background:#9b59b6;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem;margin-right:4px">
          📋
        </button>
        <button onclick="crmExcluirCliente(${c.id})"
          style="background:#e74c3c;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem">
          🗑️
        </button>
      </td>
    </tr>`;
  }).join('');
}

// Aniversário — retorna {ehHoje, ehSemana, label}
function _crmAniversario(dataNasc) {
  if (!dataNasc) return { ehHoje: false, ehSemana: false, label: '—' };
  const hoje    = new Date();
  const nasc    = new Date(dataNasc + 'T12:00:00'); // evita timezone flip
  const mesHoje = hoje.getMonth();
  const diaHoje = hoje.getDate();
  const mesDia  = nasc.getMonth();
  const dia     = nasc.getDate();

  const ehHoje  = mesHoje === mesDia && diaHoje === dia;

  // Verifica próximos 7 dias
  let ehSemana = false;
  for (let d = 0; d <= 7; d++) {
    const check = new Date(hoje);
    check.setDate(diaHoje + d);
    if (check.getMonth() === mesDia && check.getDate() === dia) { ehSemana = true; break; }
  }

  const label = nasc.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' });
  return { ehHoje, ehSemana, label };
}

function crmRenderAniversariantes() {
  const cont = document.getElementById('crm-widget-aniversariantes');
  if (!cont) return;
  const lista = _crm_clientes.filter(c => {
    const { ehHoje, ehSemana } = _crmAniversario(c.data_nascimento);
    return ehHoje || ehSemana;
  });
  if (!lista.length) {
    cont.innerHTML = `<p style="color:#aaa;font-size:0.83rem;text-align:center;padding:10px">${t('crm.nenhum_aniversariante_semana', 'Ningún cumpleañero esta semana 🎉')}</p>`;
    return;
  }
  cont.innerHTML = lista.map(c => {
    const { ehHoje } = _crmAniversario(c.data_nascimento);
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0">
      <div>
        <b>${ehHoje ? '🎂' : '🎁'} ${c.nome}</b>
        <div style="font-size:0.78rem;color:#888">${c.telefone || ''}</div>
      </div>
      ${ehHoje ? `<span style="background:#ff9800;color:#fff;padding:2px 7px;border-radius:8px;font-size:0.72rem;font-weight:700">${t('geral.hoje_excl', '¡HOY!')}</span>` : ''}
    </div>`;
  }).join('');
}

// ── Modal Novo/Editar Cliente ──────────────────────────────────
function crmAbrirModalCliente(id = null) {
  const c = id ? _crm_clientes.find(c => c.id === id) : null;
  document.getElementById('crm-cli-id').value    = c?.id || '';
  document.getElementById('crm-cli-nome').value  = c?.nome || '';
  document.getElementById('crm-cli-tel').value   = c?.telefone || '';
  document.getElementById('crm-cli-nasc').value  = c?.data_nascimento || '';
  document.getElementById('crm-cli-saldo').value = c?.saldo_cashback || 0;
  document.getElementById('modal-crm-cliente').style.display = 'flex';
  document.getElementById('crm-cli-nome').focus();
}

async function crmSalvarCliente() {
  const id    = document.getElementById('crm-cli-id').value;
  const nome  = document.getElementById('crm-cli-nome').value.trim();
  const tel   = document.getElementById('crm-cli-tel').value.trim();
  const nasc  = document.getElementById('crm-cli-nasc').value || null;
  const saldo = parseFloat(document.getElementById('crm-cli-saldo').value) || 0;

  if (!nome) { alert(t('crm.alerta_nome', 'Ingrese el nombre del cliente.')); return; }
  if (!tel)  { alert(t('crm.alerta_tel', 'Ingrese el teléfono/WhatsApp.')); return; }

  const payload = { nome, telefone: tel, data_nascimento: nasc, saldo_cashback: saldo };

  const { error } = id
    ? await supa.from('clientes').update(payload).eq('id', id)
    : await supa.from('clientes').insert([payload]);

  if (error) { alert(t('crm.erro_salvar', 'Error al guardar: ') + error.message); return; }
  fecharModal('modal-crm-cliente');
  crmCarregarClientes();
}

async function crmExcluirCliente(id) {
  if (!confirm(t('crm.confirm_excluir', '¿Eliminar este cliente y todo el historial de cashback?'))) return;
  const { error } = await supa.from('clientes').delete().eq('id', id);
  if (error) { alert(t('crm.erro_excluir', 'Error: ') + error.message); return; }
  crmCarregarClientes();
}

// ── Histórico de cashback ──────────────────────────────────────
async function crmVerHistorico(clienteId) {
  const cliente = _crm_clientes.find(c => c.id === clienteId);
  const { data } = await supa
    .from('cashback_transacoes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .limit(30);

  const linhas = (data || []).map(tx => {
    const corTipo  = tx.tipo === 'credito' ? '#1a7a2e' : '#e74c3c';
    const sinais   = tx.tipo === 'credito' ? '+' : '−';
    const exp      = tx.expira_em ? new Date(tx.expira_em).toLocaleDateString('es-PY') : '—';
    const vencido  = tx.expira_em && new Date(tx.expira_em) < new Date() && !tx.usado;
    return `<tr ${vencido ? 'style="opacity:0.5"' : ''}>
      <td style="font-size:0.8rem;color:#888">${new Date(tx.created_at).toLocaleDateString('es-PY')}</td>
      <td style="font-weight:700;color:${corTipo}">${sinais} Gs ${Math.round(tx.valor).toLocaleString('es-PY')}</td>
      <td style="font-size:0.8rem;color:#555">${exp}</td>
      <td>${tx.usado ? '<span style="color:#aaa">' + t('geral.usado', 'Usado') + '</span>' : vencido ? '<span style="color:#e74c3c">' + t('geral.expirado', 'Expirado') + '</span>' : '<span style="color:#27ae60">' + t('geral.ativo', 'Activo') + '</span>'}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="4" style="text-align:center;color:#aaa;padding:10px">${t('crm.sem_historico', 'Sin historial')}</td></tr>`;

  document.getElementById('hist-cli-nome').textContent  = cliente?.nome || '';
  document.getElementById('hist-cli-saldo').textContent = `Gs ${Math.round(cliente?.saldo_cashback || 0).toLocaleString('es-PY')}`;
  document.getElementById('hist-tbody').innerHTML = linhas;
  document.getElementById('modal-crm-hist').style.display = 'flex';
}

// ──────────────────────────────────────────────────────────────
//  CASHBACK — Geração ao salvar pedido
// ──────────────────────────────────────────────────────────────

/**
 * Chamado após salvar um pedido com telefone informado.
 * @param {string} telefone
 * @param {number} totalPedido
 * @param {number|null} pedidoId
 */
async function crmGerarCashback(telefone, totalPedido, pedidoId = null) {
  if (!telefone || !totalPedido) return;

  await _crmCarregarConfig();
  const pct       = _crm_cfg.cashback_percentual   || 10;
  const valDias   = _crm_cfg.cashback_validade_dias || 30;
  const valorCash = Math.round(totalPedido * pct / 100);
  if (valorCash <= 0) return;

  // Busca ou cria cliente
  let cliente = await _crmBuscarPorTelefone(telefone);

  if (!cliente) {
    const { data } = await supa.from('clientes').insert([{
      nome: 'Cliente PDV',
      telefone,
      saldo_cashback: 0,
      total_gasto: totalPedido,
    }]).select('*').single();
    cliente = data;
  } else {
    // Atualiza total gasto
    await supa.from('clientes')
      .update({ total_gasto: (cliente.total_gasto || 0) + totalPedido })
      .eq('id', cliente.id);
  }

  if (!cliente) return;

  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + valDias);

  await supa.from('cashback_transacoes').insert([{
    cliente_id:       cliente.id,
    cliente_telefone: telefone,
    pedido_id:        pedidoId,
    tipo:             'credito',
    valor:            valorCash,
    validade_dias:    valDias,
    expira_em:        expiraEm.toISOString(),
    usado:            false,
  }]);

  // Atualiza saldo
  await supa.from('clientes')
    .update({ saldo_cashback: (cliente.saldo_cashback || 0) + valorCash })
    .eq('id', cliente.id);

  console.log(`✅ Cashback gerado: Gs ${valorCash} para ${telefone} (vence em ${valDias}d)`);
}

/**
 * Usa saldo de cashback de um cliente. Retorna valor efetivamente debitado.
 */
async function crmUsarCashback(telefone, valorUsar) {
  const cliente = await _crmBuscarPorTelefone(telefone);
  if (!cliente)                        return 0;
  if ((cliente.saldo_cashback || 0) < 1) return 0;

  const valorEfetivo = Math.min(valorUsar, cliente.saldo_cashback);

  await supa.from('cashback_transacoes').insert([{
    cliente_id:       cliente.id,
    cliente_telefone: telefone,
    tipo:             'debito',
    valor:            valorEfetivo,
    usado:            true,
  }]);

  await supa.from('clientes')
    .update({ saldo_cashback: Math.max(0, cliente.saldo_cashback - valorEfetivo) })
    .eq('id', cliente.id);

  return valorEfetivo;
}

async function _crmBuscarPorTelefone(telefone) {
  const telClean = telefone.replace(/\D/g, '');
  // Tenta pelo número limpo e pelo original
  let { data } = await supa.from('clientes')
    .select('*')
    .or(`telefone.eq.${telefone},telefone.eq.${telClean}`)
    .maybeSingle();
  return data || null;
}

// ──────────────────────────────────────────────────────────────
//  LOOKUP NO PDV — exibe saldo ao digitar telefone
// ──────────────────────────────────────────────────────────────

let _pdvCashbackDebounce = null;
let _pdvCashbackDisponivel = 0;
let _pdvCashbackUsando    = false;

function pdvTelefoneInput(valor) {
  clearTimeout(_pdvCashbackDebounce);
  _pdvCashbackDebounce = setTimeout(() => buscarClientePDV(valor), 600);
}

async function buscarClientePDV(tel) {
  const box = document.getElementById('pdv-cashback-box');
  if (!box) return;

  if (!tel || tel.replace(/\D/g, '').length < 7) {
    box.style.display = 'none';
    _pdvCashbackDisponivel = 0;
    return;
  }

  const cliente = await _crmBuscarPorTelefone(tel);
  if (!cliente || (cliente.saldo_cashback || 0) < 1) {
    box.style.display = 'none';
    _pdvCashbackDisponivel = 0;
    return;
  }

  _pdvCashbackDisponivel = cliente.saldo_cashback;

  const elNome   = document.getElementById('pdv-cash-nome');
  const elSaldo  = document.getElementById('pdv-cash-saldo');
  if (elNome)  elNome.textContent  = cliente.nome;
  if (elSaldo) elSaldo.textContent = `Gs ${Math.round(cliente.saldo_cashback).toLocaleString('es-PY')}`;

  box.style.display = 'block';
  _pdvCashbackUsando = false;
  _pdvAtualizarBtnCash();
}

function pdvToggleCashback() {
  _pdvCashbackUsando = !_pdvCashbackUsando;
  _pdvAtualizarBtnCash();
  atualizarCarrinhoPDV();
}

function _pdvAtualizarBtnCash() {
  const btn = document.getElementById('pdv-btn-usar-cash');
  if (!btn) return;
  btn.textContent = _pdvCashbackUsando ? t('crm.cashback_aplicado', '✅ Cashback aplicado') : t('crm.usar_cashback', '💰 Usar Cashback');
  btn.style.background = _pdvCashbackUsando ? '#27ae60' : '#ff9800';
}

/**
 * Retorna o desconto de cashback a aplicar no total atual.
 * Chamada por atualizarCarrinhoPDV() do admin.js.
 */
function pdvGetCashbackDesconto(totalAtual) {
  if (!_pdvCashbackUsando || _pdvCashbackDisponivel <= 0) return 0;
  return Math.min(_pdvCashbackDisponivel, totalAtual);
}

// ──────────────────────────────────────────────────────────────
//  Config Cashback (salvar nas configurações)
// ──────────────────────────────────────────────────────────────
async function crmSalvarConfig() {
  const pct = parseFloat(document.getElementById('crm-cfg-pct')?.value) || 10;
  const val = parseInt(document.getElementById('crm-cfg-val')?.value)   || 30;

  const { error } = await supa.from('configuracoes')
    .update({ cashback_percentual: pct, cashback_validade_dias: val })
    .gt('id', 0);

  if (error) { alert(t('crm.erro_salvar', 'Error al guardar: ') + error.message); return; }
  _crm_cfg.cashback_percentual   = pct;
  _crm_cfg.cashback_validade_dias = val;
  alert(t('crm.config_salva', '✅ ¡Configuración de cashback guardada!'));
}

// Busca de clientes (filtro)
function crmFiltrarClientes(busca) {
  _crm_busca = busca;
  crmRenderClientes();
}