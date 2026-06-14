-- ============================================================
-- PATCH: Mini Market Brasil — Correções de Schema
-- Gerado em: 2026-06-12
-- Executar em: Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Coluna preco_kg em produtos
--    Necessária para produtos vendidos por peso (balança).
--    O admin.js lê/escreve produto.preco_kg mas a coluna
--    não existia na tabela, causando perda silenciosa do dado.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS preco_kg INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.produtos.preco_kg IS
  'Preço por kg em guaranis (inteiro). Preenchido quando unidade_venda = ''kg''.';


-- ────────────────────────────────────────────────────────────
-- 2. Coluna cashback_valor em pedidos
--    Registra quanto do cashback foi usado no pedido,
--    necessário para o cálculo correto do total_geral na
--    Edge Function validar-pedido.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS cashback_valor INTEGER DEFAULT 0;

COMMENT ON COLUMN public.pedidos.cashback_valor IS
  'Valor em guaranis descontado via cashback neste pedido.';


-- ────────────────────────────────────────────────────────────
-- 3. Garantir que sessoes_caixa não tenha trigger de fechamento
--    automático (confirma que não existe nenhum trigger que
--    escreva fechado_em sem ação manual).
--    Se existir um trigger antigo, este bloco o remove.
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Remove qualquer trigger de auto-fechamento se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_table = 'sessoes_caixa'
      AND trigger_name ILIKE '%auto%fecha%'
  ) THEN
    EXECUTE (
      SELECT 'DROP TRIGGER ' || trigger_name || ' ON public.sessoes_caixa;'
      FROM information_schema.triggers
      WHERE event_object_table = 'sessoes_caixa'
        AND trigger_name ILIKE '%auto%fecha%'
      LIMIT 1
    );
    RAISE NOTICE 'Trigger de auto-fechamento de caixa removido.';
  ELSE
    RAISE NOTICE 'Nenhum trigger de auto-fechamento encontrado em sessoes_caixa. OK.';
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 4. RLS — sessoes_caixa
--    Garante que apenas usuários autenticados leem/escrevem
--    suas próprias sessões. adminMaster e dono veem tudo.
--    (Remove policy duplicada se existir antes de recriar)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.sessoes_caixa ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas para recriar limpas
DROP POLICY IF EXISTS "sessoes_caixa_select"  ON public.sessoes_caixa;
DROP POLICY IF EXISTS "sessoes_caixa_insert"  ON public.sessoes_caixa;
DROP POLICY IF EXISTS "sessoes_caixa_update"  ON public.sessoes_caixa;
DROP POLICY IF EXISTS "gestor_ve_tudo"         ON public.sessoes_caixa;

-- SELECT: usuário vê as próprias sessões; dono/adminMaster veem todas
CREATE POLICY "sessoes_caixa_select" ON public.sessoes_caixa
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      usuario_email = auth.email()
      OR EXISTS (
        SELECT 1 FROM public.perfis_acesso
        WHERE id = auth.uid()
          AND cargo IN ('adminMaster', 'dono', 'gerente')
      )
    )
  );

-- INSERT: qualquer funcionário autenticado pode abrir caixa
CREATE POLICY "sessoes_caixa_insert" ON public.sessoes_caixa
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND usuario_email = auth.email()
  );

-- UPDATE: só o próprio usuário ou gestor pode fechar/editar
CREATE POLICY "sessoes_caixa_update" ON public.sessoes_caixa
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      usuario_email = auth.email()
      OR EXISTS (
        SELECT 1 FROM public.perfis_acesso
        WHERE id = auth.uid()
          AND cargo IN ('adminMaster', 'dono', 'gerente')
      )
    )
  );


-- ────────────────────────────────────────────────────────────
-- 5. Índice para acelerar busca de sessão aberta por usuário
--    (evita full scan em sessoes_caixa ao abrir o PDV)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessoes_caixa_aberta
  ON public.sessoes_caixa (usuario_email)
  WHERE fechado_em IS NULL;


-- ────────────────────────────────────────────────────────────
-- 6. Confirmação final
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Patch aplicado com sucesso.';
  RAISE NOTICE '   - produtos.preco_kg adicionado';
  RAISE NOTICE '   - pedidos.cashback_valor adicionado';
  RAISE NOTICE '   - RLS de sessoes_caixa reconfigurada';
  RAISE NOTICE '   - Índice idx_sessoes_caixa_aberta criado';
END $$;
