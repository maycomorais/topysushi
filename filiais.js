// ════════════════════════════════════════════════════════════════
//  FILIAIS — Gestión de Sucursales
//  Archivo: filiais.js  |  Requiere: supabaseClient.js
//  Solo accesible para usuarios con role = 'adminMaster'
// ════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
//  Estado
// ──────────────────────────────────────────────────────────────
let _filiais_list        = [];
let _filiais_usuarios    = [];
let _perfil_atual        = null;

// ──────────────────────────────────────────────────────────────
//  INIT — llamado por showTab('filiais')
// ──────────────────────────────────────────────────────────────
async function initFiliais() {
  await Promise.all([
    carregarFiliais(),
    carregarPerfilAtual(),
    carregarUsuariosAdmin(),
  ]);
  verificarAcessoFiliais();
}

// ──────────────────────────────────────────────────────────────
//  Carga el perfil del usuario logado (para saber su role)
// ──────────────────────────────────────────────────────────────
async function carregarPerfilAtual() {
  try {
    const { data: { session } } = await supa.auth.getSession();
    if (!session) return;

    const { data } = await supa
      .from('perfis')
      .select('role, filial_id, nome')
      .eq('usuario_id', session.user.id)
      .maybeSingle();

    _perfil_atual = data;
  } catch (e) { console.warn('carregarPerfilAtual:', e.message); }
}

// ──────────────────────────────────────────────────────────────
//  Bloquea la UI si el usuario NO es adminMaster
// ──────────────────────────────────────────────────────────────
function verificarAcessoFiliais() {
  const cont = document.getElementById('filiais-container');
  if (!cont) return;

  if (!_perfil_atual || _perfil_atual.role !== 'adminMaster') {
    cont.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#9ca3af">
        <div style="font-size:3rem;margin-bottom:16px">🔒</div>
        <div style="font-size:1.1rem;font-weight:700;color:#4b5563;margin-bottom:8px">
          ${t('filiais.acesso_restrito', 'Acceso Restringido')}
        </div>
        <div style="font-size:0.88rem">
          ${t('filiais.admin_master_apenas', 'Solo el <b>adminMaster</b> puede gestionar las sucursales.')}
        </div>
      </div>`;
    return;
  }
}

// ──────────────────────────────────────────────────────────────
//  CRUD FILIAIS
// ──────────────────────────────────────────────────────────────
async function carregarFiliais() {
  try {
    const { data, error } = await supa
      .from('filiais')
      .select('*')
      .order('nome');

    if (error) { console.warn('carregarFiliais:', error.message); return; }
    _filiais_list = data || [];
    renderFiliais();
  } catch (e) { console.warn('carregarFiliais:', e.message); }
}

function renderFiliais() {
  const cont = document.getElementById('filiais-lista');
  if (!cont) return;

  if (!_filiais_list.length) {
    cont.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:#9ca3af;border:2px dashed #e5e7eb;border-radius:14px">
        <div style="font-size:2.5rem;margin-bottom:12px">🏪</div>
        <div style="font-size:1rem;font-weight:700;margin-bottom:6px;color:#6b7280">
          ${t('filiais.nenhuma_registrada', 'Ninguna sucursal registrada')}
        </div>
        <div style="font-size:0.85rem">${t('filiais.clique_nova', 'Haga clic en "Nueva Sucursal" para comenzar')}</div>
      </div>`;
    return;
  }

  const statusConfig = {
    ativa:       { label: t('filiais.status_ativa', 'Activa'),        bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    inativa:     { label: t('filiais.status_inativa', 'Inactiva'),      bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    manutencao:  { label: t('filiais.status_manutencao', 'Mantenimiento'), bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  };

  cont.innerHTML = _filiais_list.map(f => {
    const sc = statusConfig[f.status] || statusConfig.ativa;
    return `
      <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:18px 20px;
                  margin-bottom:12px;transition:box-shadow 0.2s"
           onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'"
           onmouseout="this.style.boxShadow='none'">

        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">

          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
              <span style="font-weight:700;font-size:1rem;color:#1f2937">🏪 ${f.nome}</span>
              <span style="font-size:0.73rem;padding:2px 10px;border-radius:99px;font-weight:600;
                           background:${sc.bg};color:${sc.color};display:inline-flex;align-items:center;gap:5px">
                <span style="width:6px;height:6px;background:${sc.dot};border-radius:50%;flex-shrink:0"></span>
                ${sc.label}
              </span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px">
              <div style="font-size:0.82rem;color:#6b7280">
                📍 <span style="color:#374151">${f.endereco || '—'}</span>
              </div>
              <div style="font-size:0.82rem;color:#6b7280">
                📱 <span style="color:#374151;font-weight:600">${f.whatsapp}</span>
              </div>
              <div style="font-size:0.82rem;color:#6b7280">
                🌐 <span style="font-family:monospace;color:#374151">${Number(f.coord_lat).toFixed(6)}, ${Number(f.coord_lng).toFixed(6)}</span>
              </div>
              <div style="font-size:0.82rem;color:#6b7280">
                🛵 ${t('filiais.radio', 'Radio')}: <span style="color:#374151;font-weight:600">${f.raio_entrega_km} km</span>
                ${f.taxa_entrega_base > 0 ? ` · ${t('filiais.base', 'Base')}: Gs ${Number(f.taxa_entrega_base).toLocaleString('es-PY')}` : ''}
              </div>
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap">
            <button onclick="abrirModalFilial('${f.id}')"
              style="padding:8px 16px;background:#3498db;color:#fff;border:none;border-radius:8px;
                     cursor:pointer;font-size:0.83rem;font-weight:600;white-space:nowrap">
              ✏️ ${t('prod.editar', 'Editar')}
            </button>
            <button onclick="excluirFilial('${f.id}','${f.nome.replace(/'/g,"\\'")}')"
              style="padding:8px 14px;background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;
                     border-radius:8px;cursor:pointer;font-size:0.83rem;font-weight:600">
              🗑️
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ──────────────────────────────────────────────────────────────
//  Modal: abrir (edición o creación)
// ──────────────────────────────────────────────────────────────
function abrirModalFilial(id = null) {
  const f = id ? _filiais_list.find(f => f.id === id) : null;

  const setVal = (elId, val) => {
    const el = document.getElementById(elId);
    if (el) el.value = val ?? '';
  };

  setVal('filial-id',        f?.id             || '');
  setVal('filial-nome',      f?.nome           || '');
  setVal('filial-endereco',  f?.endereco       || '');
  setVal('filial-lat',       f?.coord_lat      || '');
  setVal('filial-lng',       f?.coord_lng      || '');
  setVal('filial-whatsapp',  f?.whatsapp       || '');
  setVal('filial-raio',      f?.raio_entrega_km ?? 10);
  setVal('filial-taxa',      f?.taxa_entrega_base ?? 0);
  setVal('filial-status',    f?.status         || 'ativa');

  const titulo = document.getElementById('filial-modal-titulo');
  if (titulo) titulo.textContent = f ? t('filiais.editar_sucursal', 'Editar: ') + f.nome : t('filiais.nova_sucursal', 'Nueva Sucursal');

  const modal = document.getElementById('modal-filial');
  if (modal) modal.style.display = 'flex';
  document.getElementById('filial-nome')?.focus();
}

// ──────────────────────────────────────────────────────────────
//  Guardar filial (INSERT o UPDATE)
// ──────────────────────────────────────────────────────────────
async function salvarFilial() {
  const getVal = (id) => document.getElementById(id)?.value?.trim() || '';
  const getFlt  = (id, def = 0) => parseFloat(document.getElementById(id)?.value) || def;

  const id       = getVal('filial-id');
  const nome     = getVal('filial-nome');
  const endereco = getVal('filial-endereco');
  const whatsapp = getVal('filial-whatsapp').replace(/\s+/g, '');
  const lat      = getFlt('filial-lat');
  const lng      = getFlt('filial-lng');
  const raio     = getFlt('filial-raio', 10);
  const taxa     = getFlt('filial-taxa', 0);
  const status   = getVal('filial-status') || 'ativa';

  if (!nome)     { alert(t('filiais.alerta_nome', 'Informe el nombre de la sucursal.')); return; }
  if (!whatsapp) { alert(t('filiais.alerta_whatsapp', 'Informe el WhatsApp (solo dígitos, con código país).\nEj: 595971123456')); return; }
  if (!lat || !lng) { alert(t('filiais.alerta_coordenadas', 'Informe coordenadas válidas (lat y lng).')); return; }
  if (!/^\d{10,15}$/.test(whatsapp)) {
    if (!confirm(t('filiais.confirm_formato_whats', 'El número "{whatsapp}" parece tener un formato inusual.\n¿Continuar de todas formas?').replace('{whatsapp}', whatsapp))) return;
  }

  const payload = {
    nome, endereco, coord_lat: lat, coord_lng: lng,
    whatsapp, raio_entrega_km: raio, taxa_entrega_base: taxa, status,
  };

  const btnSalvar = document.getElementById('btn-salvar-filial');
  if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = t('filiais.guardando', 'Guardando...'); }

  try {
    const { error } = id
      ? await supa.from('filiais').update(payload).eq('id', id)
      : await supa.from('filiais').insert([payload]);

    if (error) { alert(t('filiais.erro_salvar', 'Error al guardar: ') + error.message); return; }

    fecharModal('modal-filial');
    await carregarFiliais();
  } catch (e) {
    alert(t('filiais.erro_inesperado', 'Error inesperado: ') + e.message);
  } finally {
    if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = t('prod.salvar', 'Guardar'); }
  }
}

// ──────────────────────────────────────────────────────────────
//  Excluir filial
// ──────────────────────────────────────────────────────────────
async function excluirFilial(id, nome) {
  const confirmado = confirm(
    t('filiais.confirm_excluir', `⚠️ Excluir la sucursal "{nome}"?\n\n• Los pedidos y usuarios vinculados quedarán sin filial asignada.\n• Esta acción NO se puede deshacer.\n\n¿Continuar?`).replace('{nome}', nome)
  );
  if (!confirmado) return;

  const { error } = await supa.from('filiais').delete().eq('id', id);
  if (error) { alert(t('filiais.erro_geral', 'Error: ') + error.message); return; }
  await carregarFiliais();
}

// ──────────────────────────────────────────────────────────────
//  GESTIÓN DE USUARIOS ADMIN
// ──────────────────────────────────────────────────────────────
async function carregarUsuariosAdmin() {
  try {
    const { data, error } = await supa
      .from('perfis')
      .select('id, usuario_id, email, nome, role, filial_id, ativo')
      .order('nome');

    if (error) { console.warn('carregarUsuariosAdmin:', error.message); return; }
    _filiais_usuarios = data || [];
    renderUsuariosAdmin();
  } catch (e) { console.warn('carregarUsuariosAdmin:', e.message); }
}

function renderUsuariosAdmin() {
  const tbody = document.getElementById('filiais-usuarios-body');
  if (!tbody) return;

  if (!_filiais_usuarios.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">' + t('filiais.nenhum_usuario', 'Ningún usuario registrado.') + '</td></tr>';
    return;
  }

  const roleBadge = {
    adminMaster: { label: t('filiais.role_master', 'Master'),      bg: '#1a7a2e', color: '#fff' },
    gerente:     { label: t('filiais.role_gerente', 'Gerente'),     bg: '#3b82f6', color: '#fff' },
    funcionario: { label: t('filiais.role_operador', 'Operador'),    bg: '#8b5cf6', color: '#fff' },
    motoboy:     { label: t('filiais.role_repartidor', 'Repartidor'),  bg: '#f59e0b', color: '#fff' },
  };

  tbody.innerHTML = _filiais_usuarios.map(u => {
    const rb     = roleBadge[u.role] || roleBadge.funcionario;
    const filial = _filiais_list.find(f => f.id === u.filial_id);

    return `
      <tr>
        <td style="font-weight:600">${u.nome || '—'}<br>
          <span style="font-size:0.75rem;color:#9ca3af;font-weight:400">${u.email || ''}</span>
        </td>
        <td>
          <span style="font-size:0.75rem;font-weight:700;padding:2px 9px;border-radius:99px;
                       background:${rb.bg};color:${rb.color}">${rb.label}</span>
        </td>
        <td style="font-size:0.85rem;color:#4b5563">${filial ? filial.nome : '<span style="color:#d1d5db">—</span>'}</td>
        <td style="text-align:center">
          <span style="font-size:0.72rem;padding:2px 8px;border-radius:99px;font-weight:600;
                       background:${u.ativo ? '#d1fae5' : '#fee2e2'};
                       color:${u.ativo ? '#065f46' : '#991b1b'}">
            ${u.ativo ? t('filiais.status_activo', 'Activo') : t('filiais.status_inactivo', 'Inactivo')}
          </span>
        </td>
        <td style="text-align:center">
          <button onclick="abrirModalUsuario('${u.id}')"
            style="background:#e0f2fe;color:#0284c7;border:1px solid #bae6fd;
                   border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;font-weight:600">
            ✏️ ${t('prod.editar', 'Editar')}
          </button>
        </td>
      </tr>`;
  }).join('');
}

// ──────────────────────────────────────────────────────────────
//  Modal de edición de usuario admin
// ──────────────────────────────────────────────────────────────
function abrirModalUsuario(perfilId) {
  const u = _filiais_usuarios.find(u => u.id === perfilId);
  if (!u) return;

  document.getElementById('ua-perfil-id').value  = u.id;
  document.getElementById('ua-nome').value        = u.nome || '';
  document.getElementById('ua-role').value        = u.role || 'funcionario';
  document.getElementById('ua-ativo').checked     = u.ativo !== false;

  const selFilial = document.getElementById('ua-filial');
  selFilial.innerHTML = '<option value="">' + t('filiais.sin_filial', '— Sin filial (global) —') + '</option>' +
    _filiais_list.map(f =>
      `<option value="${f.id}" ${u.filial_id === f.id ? 'selected' : ''}>${f.nome}</option>`
    ).join('');

  document.getElementById('ua-filial-row').style.display =
    (document.getElementById('ua-role').value === 'adminMaster') ? 'none' : 'block';

  document.getElementById('modal-filial-usuario').style.display = 'flex';
}

async function salvarUsuarioAdmin() {
  const perfilId = document.getElementById('ua-perfil-id').value;
  const nome     = document.getElementById('ua-nome').value.trim();
  const role     = document.getElementById('ua-role').value;
  const filialId = document.getElementById('ua-filial').value || null;
  const ativo    = document.getElementById('ua-ativo').checked;

  if (!nome) { alert(t('filiais.alerta_usuario_nome', 'Informe el nombre del usuario.')); return; }
  if (role !== 'adminMaster' && !filialId) {
    if (!confirm(t('filiais.confirm_role_sem_filial', 'El rol "{role}" normalmente requiere una filial asignada.\n¿Guardar sin filial?').replace('{role}', role))) return;
  }

  const { error } = await supa
    .from('perfis')
    .update({ nome, role, filial_id: filialId, ativo })
    .eq('id', perfilId);

  if (error) { alert(t('filiais.erro_geral', 'Error: ') + error.message); return; }
  fecharModal('modal-filial-usuario');
  await carregarUsuariosAdmin();
}

function onRoleChange() {
  const role = document.getElementById('ua-role').value;
  const row  = document.getElementById('ua-filial-row');
  if (row) row.style.display = role === 'adminMaster' ? 'none' : 'block';
}

// ──────────────────────────────────────────────────────────────
//  Helpers exportados para uso em outros módulos
// ──────────────────────────────────────────────────────────────
async function getFilialAtual() {
  if (_perfil_atual) return _perfil_atual.filial_id;
  await carregarPerfilAtual();
  return _perfil_atual?.filial_id || null;
}

function isAdminMaster() {
  return _perfil_atual?.role === 'adminMaster';
}
