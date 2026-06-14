// ══════════════════════════════════════════════════════════════
//  FICHA TÉCNICA — Calculadora de Custo de Produtos
// ══════════════════════════════════════════════════════════════

let _ft_insumos  = [];
let _ft_fichas   = [];
let _ft_itensTemp = [];   // itens em edição na modal

// ──────────────────────────────────────────────────────────────
//  INSUMOS
// ──────────────────────────────────────────────────────────────
async function ftCarregarInsumos() {
  try {
    const { data, error } = await supa.from('insumos').select('*').order('nome');
    if (error) { console.warn('ftCarregarInsumos:', error.message); return; }
    _ft_insumos = data || [];
    ftRenderInsumos();
    ftPopularSelectInsumo();
  } catch(e) { console.warn('ftCarregarInsumos:', e.message); }
}

function ftRenderInsumos() {
  const tbody = document.getElementById('ft-lista-insumos');
  if (!tbody) return;

  if (!_ft_insumos.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="ft-empty">${t('ft.nenhum_insumo', 'Ningún insumo registrado aún.')}</td></tr>`;
    return;
  }

  tbody.innerHTML = _ft_insumos.map(i => `
    <tr>
      <td><b>${i.nome}</b></td>
      <td style="text-align:center;color:#555">${i.unidade}</td>
      <td style="text-align:right;font-weight:700;color:#1a7a2e">Gs ${parseFloat(i.preco_custo).toLocaleString('es-PY')}</td>
      <td style="text-align:center;white-space:nowrap">
        <button onclick="ftAbrirModalInsumo(${i.id})"
          style="background:#3498db;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem;margin-right:4px">✏️</button>
        <button onclick="ftExcluirInsumo(${i.id})"
          style="background:#e74c3c;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.8rem">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function ftPopularSelectInsumo() {
  const sel = document.getElementById('ft-sel-insumo');
  if (!sel) return;
  sel.innerHTML = `<option value="">${t('ft.selecione_insumo', '— Seleccione el insumo —')}</option>` +
    _ft_insumos.map(i =>
      `<option value="${i.id}" data-preco="${i.preco_custo}" data-unidade="${i.unidade}">${i.nome} (${i.unidade})</option>`
    ).join('');
}

function ftAbrirModalInsumo(id = null) {
  const ins = id ? _ft_insumos.find(i => i.id === id) : null;
  document.getElementById('ft-insumo-id').value      = ins?.id || '';
  document.getElementById('ft-insumo-nome').value    = ins?.nome || '';
  document.getElementById('ft-insumo-unidade').value = ins?.unidade || 'un';
  document.getElementById('ft-insumo-preco').value   = ins?.preco_custo || '';
  document.getElementById('modal-ft-insumo').style.display = 'flex';
  document.getElementById('ft-insumo-nome').focus();
}

async function ftSalvarInsumo() {
  const id    = document.getElementById('ft-insumo-id').value;
  const nome  = document.getElementById('ft-insumo-nome').value.trim();
  const unid  = document.getElementById('ft-insumo-unidade').value;
  const preco = parseFloat(document.getElementById('ft-insumo-preco').value) || 0;

  if (!nome)    { alert(t('ft.alerta_nome_insumo', 'Ingrese el nombre del insumo.')); return; }
  if (preco <= 0) { alert(t('ft.alerta_preco_maior_zero', 'El precio de costo debe ser mayor a cero.')); return; }

  const payload = { nome, unidade: unid, preco_custo: preco };
  const { error } = id
    ? await supa.from('insumos').update(payload).eq('id', id)
    : await supa.from('insumos').insert([payload]);

  if (error) { alert(t('ft.erro_salvar', 'Error al guardar: ') + error.message); return; }
  fecharModal('modal-ft-insumo');
  ftCarregarInsumos();
}

async function ftExcluirInsumo(id) {
  if (!confirm(t('ft.confirm_excluir_insumo', '¿Eliminar este insumo? Se eliminará de todas las fichas que lo utilicen.'))) return;
  const { error } = await supa.from('insumos').delete().eq('id', id);
  if (error) { alert(t('ft.erro', 'Error: ') + error.message); return; }
  ftCarregarInsumos();
}

// ──────────────────────────────────────────────────────────────
//  FICHAS TÉCNICAS
// ──────────────────────────────────────────────────────────────
async function ftCarregarFichas() {
  try {
    const { data, error } = await supa
      .from('fichas_tecnicas')
      .select('*, ficha_itens(id, insumo_id, insumo_nome, unidade_insumo, quantidade, insumos(preco_custo, unidade))')
      .order('produto_nome');
    if (error) { console.warn('ftCarregarFichas:', error.message); return; }
    _ft_fichas = data || [];
    ftRenderFichas();
  } catch(e) { console.warn('ftCarregarFichas:', e.message); }
}

function ftCustoFicha(ficha) {
  return (ficha.ficha_itens || []).reduce((sum, fi) => {
    const custo = fi.insumos?.preco_custo || 0;
    return sum + fi.quantidade * custo;
  }, 0);
}

function ftRenderFichas() {
  const cont = document.getElementById('ft-lista-fichas');
  if (!cont) return;

  if (!_ft_fichas.length) {
    cont.innerHTML = `<p style="text-align:center;color:#aaa;padding:30px">${t('ft.nenhuma_ficha', 'Ninguna ficha técnica registrada.')}</p>`;
    return;
  }

  cont.innerHTML = _ft_fichas.map(f => {
    const custo  = ftCustoFicha(f);
    const markup = f.markup_percent || 300;
    const precoSug = custo > 0 ? Math.round(custo * (1 + markup / 100)) : 0;
    const lucro    = precoSug - custo;

    const itensHtml = (f.ficha_itens || []).length
      ? (f.ficha_itens || []).map(fi => {
          const un = fi.unidade_insumo || fi.insumos?.unidade || 'un';
          const subtotal = fi.quantidade * (fi.insumos?.preco_custo || 0);
          return `<li style="font-size:0.82rem;color:#555;line-height:1.7">
            ${fi.insumo_nome}: <b>${fi.quantidade} ${un}</b> → Gs ${Math.round(subtotal).toLocaleString('es-PY')}
          </li>`;
        }).join('')
      : `<li style="color:#aaa;font-size:0.82rem">${t('ft.sem_insumos', 'Sin insumos vinculados')}</li>`;

    return `
      <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:1rem;margin-bottom:6px">🍽️ ${f.produto_nome}</div>
            <ul style="margin:0 0 0 18px;padding:0">${itensHtml}</ul>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:0.72rem;color:#888;margin-bottom:2px">${t('ft.tabela_custo_total', 'Costo total')}</div>
            <div style="font-weight:700;color:#e74c3c;font-size:1rem">Gs ${Math.round(custo).toLocaleString('es-PY')}</div>
            <div style="font-size:0.72rem;color:#888;margin-top:8px;margin-bottom:2px">Markup ${markup}%</div>
            <div style="font-weight:700;color:#1a7a2e;font-size:1rem">Gs ${precoSug.toLocaleString('es-PY')}</div>
            <div style="font-size:0.72rem;color:#2980b9;margin-top:4px">${t('ft.lucro_bruto', 'Ganancia bruta')}: Gs ${Math.round(lucro).toLocaleString('es-PY')}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:12px">
          <button onclick="ftAbrirModalFicha(${f.id})"
            style="flex:1;padding:7px;background:#3498db;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.83rem;font-weight:600">
            ✏️ ${t('prod.editar', 'Editar')}
          </button>
          <button onclick="ftExcluirFicha(${f.id})"
            style="flex:1;padding:7px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.83rem;font-weight:600">
            🗑️ ${t('prod.excluir', 'Eliminar')}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function ftAbrirModalFicha(id = null) {
  const f = id ? _ft_fichas.find(f => f.id === id) : null;
  _ft_itensTemp = f ? JSON.parse(JSON.stringify(f.ficha_itens || [])) : [];

  document.getElementById('ft-ficha-id').value      = f?.id || '';
  document.getElementById('ft-ficha-produto').value = f?.produto_nome || '';
  document.getElementById('ft-ficha-markup').value  = f?.markup_percent ?? 300;

  // Carrega produtos direto do banco (não depende de _todosProdutos do admin.js)
  const selProd = document.getElementById('ft-ficha-prod-sel');
  if (selProd) {
    selProd.innerHTML = `<option value="">⏳ ${t('ft.carregando', 'Cargando...')}</option>`;
    try {
      let prods = [];
      // Tenta usar _todosProdutos se já estiver carregado
      if (typeof _todosProdutos !== 'undefined' && Array.isArray(_todosProdutos) && _todosProdutos.length > 0) {
        prods = _todosProdutos;
      } else {
        const { data } = await supa.from('produtos').select('id, nome, categoria_slug').order('nome');
        prods = data || [];
      }
      selProd.innerHTML = `<option value="">${t('geral.selecione_cardapio', '— Seleccione del menú —')}</option>` +
        prods.map(p => `<option value="${p.nome}">${p.nome}${p.categoria_slug ? ' · ' + p.categoria_slug : ''}</option>`).join('');
    } catch(e) {
      selProd.innerHTML = `<option value="">${t('geral.erro_carregar', '— Error al cargar —')}</option>`;
    }
    selProd.onchange = () => {
      if (selProd.value) document.getElementById('ft-ficha-produto').value = selProd.value;
    };
  }

  ftRenderItensTemp();
  ftAtualizarCustoModal();
  document.getElementById('modal-ft-ficha').style.display = 'flex';
}

async function ftExcluirFicha(id) {
  if (!confirm(t('ft.confirm_excluir_ficha', '¿Eliminar esta ficha técnica?'))) return;
  const { error } = await supa.from('fichas_tecnicas').delete().eq('id', id);
  if (error) { alert(t('ft.erro', 'Error: ') + error.message); return; }
  ftCarregarFichas();
}

// ── Composição ─────────────────────────────────────────────────
function ftAdicionarInsumo() {
  const sel = document.getElementById('ft-sel-insumo');
  const qtd = parseFloat(document.getElementById('ft-qtd-insumo').value) || 0;
  if (!sel.value) { alert(t('ft.alerta_selecione_insumo', 'Seleccione un insumo.')); return; }
  if (qtd <= 0)   { alert(t('ft.alerta_qtd_valida', 'Ingrese una cantidad válida.')); return; }

  const insumo = _ft_insumos.find(i => i.id == sel.value);
  if (!insumo) return;

  _ft_itensTemp.push({
    insumo_id:     insumo.id,
    insumo_nome:   insumo.nome,
    quantidade:    qtd,
    unidade_insumo: insumo.unidade,
    insumos:       { preco_custo: insumo.preco_custo, unidade: insumo.unidade },
  });

  sel.value = '';
  document.getElementById('ft-qtd-insumo').value = '';
  ftRenderItensTemp();
  ftAtualizarCustoModal();
}

function ftRemoverItemTemp(idx) {
  _ft_itensTemp.splice(idx, 1);
  ftRenderItensTemp();
  ftAtualizarCustoModal();
}

function ftRenderItensTemp() {
  const cont = document.getElementById('ft-composicao-lista');
  if (!cont) return;

  if (!_ft_itensTemp.length) {
    cont.innerHTML = `<p style="color:#aaa;font-size:0.83rem;text-align:center;padding:12px">${t('ft.nenhum_insumo_agregado', 'Ningún insumo agregado')}</p>`;
    return;
  }

  cont.innerHTML = _ft_itensTemp.map((fi, idx) => {
    const preco    = fi.insumos?.preco_custo || 0;
    const subtotal = Math.round(fi.quantidade * preco);
    const un       = fi.unidade_insumo || fi.insumos?.unidade || 'un';
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;
                  background:#f9fafb;border-radius:9px;margin-bottom:6px;font-size:0.83rem">
        <div>
          <b>${fi.insumo_nome}</b><br>
          <span style="color:#777">${fi.quantidade} ${un}
            × Gs ${parseFloat(preco).toLocaleString('es-PY')}
            = <b>Gs ${subtotal.toLocaleString('es-PY')}</b>
          </span>
        </div>
        <button onclick="ftRemoverItemTemp(${idx})"
          style="background:#fee2e2;color:#e74c3c;border:none;border-radius:6px;
                 padding:4px 10px;cursor:pointer;font-size:0.85rem;flex-shrink:0">✕</button>
      </div>
    `;
  }).join('');
}

function ftAtualizarCustoModal() {
  const custo  = _ft_itensTemp.reduce((s, fi) => s + fi.quantidade * (fi.insumos?.preco_custo || 0), 0);
  const markup = parseFloat(document.getElementById('ft-ficha-markup')?.value) || 300;
  const preco  = custo * (1 + markup / 100);

  const elC = document.getElementById('ft-custo-calculado');
  const elP = document.getElementById('ft-preco-sugerido');
  const elL = document.getElementById('ft-lucro-calculado');
  if (elC) elC.textContent = 'Gs ' + Math.round(custo).toLocaleString('es-PY');
  if (elP) elP.textContent = 'Gs ' + Math.round(preco).toLocaleString('es-PY');
  if (elL) elL.textContent = 'Gs ' + Math.round(preco - custo).toLocaleString('es-PY');
}

async function ftSalvarFicha() {
  const id           = document.getElementById('ft-ficha-id').value;
  const produto_nome = document.getElementById('ft-ficha-produto').value.trim();
  const markup_percent = parseFloat(document.getElementById('ft-ficha-markup').value) || 300;

  if (!produto_nome) { alert(t('ft.alerta_nome_produto', 'Ingrese el nombre del producto.')); return; }

  let fichaId = id ? parseInt(id) : null;

  if (fichaId) {
    const { error } = await supa.from('fichas_tecnicas')
      .update({ produto_nome, markup_percent }).eq('id', fichaId);
    if (error) { alert(t('ft.erro', 'Error: ') + error.message); return; }
    await supa.from('ficha_itens').delete().eq('ficha_id', fichaId);
  } else {
    const { data, error } = await supa.from('fichas_tecnicas')
      .insert([{ produto_nome, markup_percent }]).select('id').single();
    if (error) { alert(t('ft.erro', 'Error: ') + error.message); return; }
    fichaId = data.id;
  }

  if (_ft_itensTemp.length) {
    const { error } = await supa.from('ficha_itens').insert(
      _ft_itensTemp.map(fi => ({
        ficha_id:      fichaId,
        insumo_id:     fi.insumo_id,
        insumo_nome:   fi.insumo_nome,
        unidade_insumo: fi.unidade_insumo || fi.insumos?.unidade || 'un',
        quantidade:    fi.quantidade,
      }))
    );
    if (error) { alert(t('ft.erro_salvar_itens', 'Error al guardar los ítems: ') + error.message); return; }
  }

  fecharModal('modal-ft-ficha');
  ftCarregarFichas();
}

// ──────────────────────────────────────────────────────────────
//  INIT — chamado por showTab('ficha-tecnica')
// ──────────────────────────────────────────────────────────────
function initFichaTecnica() {
  ftCarregarInsumos();
  ftCarregarFichas();
}