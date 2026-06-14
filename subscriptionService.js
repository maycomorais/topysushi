// subscriptionService.js
// Todas as queries Supabase relacionadas à assinatura.
// Depende de: window.supa (cliente Supabase já inicializado)

'use strict';

const SubscriptionService = (() => {

  // ─────────────────────────────────────────────────────────────
  // LEITURA
  // ─────────────────────────────────────────────────────────────

  /**
   * Busca a assinatura ativa (id = 1 por padrão).
   * @returns {Promise<object|null>}
   */
  async function getAssinatura() {
    const { data, error } = await supa
      .from('assinaturas')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) { console.error('[Assinatura] getAssinatura:', error.message); return null; }
    return data;
  }

  /**
   * Busca o histórico de pagamentos confirmados.
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async function getHistoricoPagamentos(limit = 12) {
    const { data, error } = await supa
      .from('assinatura_pagamentos')
      .select('*')
      .eq('assinatura_id', 1)
      .order('competencia', { ascending: false })
      .limit(limit);
    if (error) { console.error('[Assinatura] getHistorico:', error.message); return []; }
    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  // ESCRITA (adminMaster)
  // ─────────────────────────────────────────────────────────────

  /**
   * Salva as configurações de vencimento e carência.
   * @param {object} cfg  — { tipo_vencimento, dia_vencimento, dias_carencia, tenant_nome, tenant_email_contato, obs }
   * @returns {Promise<{ok:boolean, error?:string}>}
   */
  async function salvarConfigAssinatura(cfg) {
    const { error } = await supa
      .from('assinaturas')
      .update({
        tipo_vencimento:      cfg.tipo_vencimento,
        dia_vencimento:       Number(cfg.dia_vencimento),
        dias_carencia:        Number(cfg.dias_carencia),
        tenant_nome:          cfg.tenant_nome,
        tenant_email_contato: cfg.tenant_email_contato || null,
        obs:                  cfg.obs || null,
      })
      .eq('id', 1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  /**
   * Registra pagamento confirmado para uma competência (mês/ano).
   * Atualiza ultimo_pagamento_em e zera bloqueio.
   * @param {string} competencia  — 'YYYY-MM'
   * @param {string} confirmadoPor — email do adminMaster
   * @param {string} obs
   * @returns {Promise<{ok:boolean, error?:string}>}
   */
  async function confirmarPagamento(competencia, confirmadoPor, obs = '') {
    // 1. Upsert no histórico
    const { error: errHist } = await supa
      .from('assinatura_pagamentos')
      .upsert({
        assinatura_id:  1,
        competencia,
        confirmado_em:  new Date().toISOString(),
        confirmado_por: confirmadoPor,
        obs:            obs || null,
      }, { onConflict: 'assinatura_id,competencia' });

    if (errHist) return { ok: false, error: errHist.message };

    // 2. Atualiza ultimo_pagamento_em e desbloqueia
    const hoje = competencia + '-01'; // data base da competência
    const { error: errAssin } = await supa
      .from('assinaturas')
      .update({
        ultimo_pagamento_em:   hoje,
        bloqueado:             false,
        desbloqueado_em:       new Date().toISOString(),
        desbloqueado_por:      confirmadoPor,
      })
      .eq('id', 1);

    if (errAssin) return { ok: false, error: errAssin.message };
    return { ok: true };
  }

  /**
   * Bloqueia ou desbloqueia manualmente.
   * @param {boolean} bloquear
   * @param {string}  por  — email do adminMaster
   */
  async function alternarBloqueio(bloquear, por) {
    const campos = bloquear
      ? { bloqueado: true,  bloqueado_em:      new Date().toISOString() }
      : { bloqueado: false, desbloqueado_em:   new Date().toISOString(),
                            desbloqueado_por:  por };
    const { error } = await supa.from('assinaturas').update(campos).eq('id', 1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  // ─────────────────────────────────────────────────────────────
  // REALTIME (listener para propagar bloqueio em tempo real)
  // ─────────────────────────────────────────────────────────────

  /**
   * Subscreve mudanças na assinatura e chama callback quando houver update.
   * @param {function} onUpdate  — recebe o novo registro
   * @returns {object} canal do Supabase (para dar .unsubscribe() depois)
   */
  function assinarMudancas(onUpdate) {
    return supa
      .channel('assinatura-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'assinaturas', filter: 'id=eq.1' },
        (payload) => onUpdate(payload.new)
      )
      .subscribe();
  }

  return {
    getAssinatura,
    getHistoricoPagamentos,
    salvarConfigAssinatura,
    confirmarPagamento,
    alternarBloqueio,
    assinarMudancas,
  };
})();

if (typeof window !== 'undefined') {
  window.SubscriptionService = SubscriptionService;
}
