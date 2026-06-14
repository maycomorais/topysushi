
-- =================================================================
--  PLATAFORMA WHITE LABEL + CONTROLE DE ASSINATURA
--  SQL Consolidado e Unificado — Versão 4.0
--
--  ► PROJETO NOVO      → Execute este arquivo INTEIRO no SQL Editor
--  ► PROJETO EXISTENTE → Execute APENAS a Seção 11 (Migrations Incrementais)
--
--  Mudanças v4.0 vs v3.0:
--    + RLS de sessoes_caixa refeita com policies granulares por perfil
--      (INSERT só com próprio email; SELECT/UPDATE para gestor via perfis_acesso)
--    + RLS de movimentacoes_caixa idem — substitui policy genérica auth_all
--    + Timezone corrigido: UTC-3 permanente PY (lei 2024) — anotação no schema
--    + Seção 11.16: migration incremental com DROP das policies antigas de caixa
--      e recriação granular (idempotente para bancos existentes)
--    + planos_mensalistas.valor_restante adicionado na criação da tabela
--
--  Índice das seções:
--    1.  Extensões
--    2.  Função utilitária set_updated_at()
--    3.  Tabelas principais (em ordem de dependência)
--    4.  Índices
--    5.  Row Level Security (RLS)
--    6.  Storage (bucket "produtos")
--    7.  Realtime
--    8.  Funções auxiliares e RPCs
--    9.  Promover usuário para adminMaster
--   10.  Verificações úteis
--   11.  Migrations Incrementais (bancos existentes)
--       11.1–11.15  (inalteradas)
--       11.16       RLS granular sessoes_caixa + movimentacoes_caixa
-- =================================================================

-- CREATE OR REPLACE FUNCTION public.get_my_role()
-- RETURNS TEXT 
-- LANGUAGE plpgsql
-- SECURITY DEFINER -- Garante permissão para ler tabelas de autenticação
-- AS $$
-- DECLARE
--   v_role TEXT;
-- BEGIN
--   -- Busca o cargo diretamente da sua tabela tradicional de perfis de acesso
--   SELECT cargo INTO v_role
--   FROM public.perfis_acesso
--   WHERE id = auth.uid()
--   LIMIT 1;

--   -- Se não encontrar na tabela antiga, faz uma busca preventiva na tabela nova (multi-filial)
--   IF v_role IS NULL THEN
--     SELECT role INTO v_role
--     FROM public.perfis
--     WHERE usuario_id = auth.uid()
--     LIMIT 1;
--   END IF;

--   -- Se o usuário não possuir registro em nenhuma delas, define como funcionário por segurança
--   RETURN COALESCE(v_role, 'funcionario');
-- END;
-- $$;

-- CREATE OR REPLACE FUNCTION public.get_my_filial_id()
-- RETURNS UUID 
-- LANGUAGE plpgsql
-- SECURITY DEFINER -- Executa com permissões elevadas para poder ler a tabela perfis
-- AS $$
-- DECLARE
--   v_filial_id UUID;
-- BEGIN
--   -- Busca o ID da filial atribuído ao usuário logado na tabela nova de perfis
--   SELECT filial_id INTO v_filial_id
--   FROM public.perfis
--   WHERE usuario_id = auth.uid()
--   LIMIT 1;

--   RETURN v_filial_id;
-- END;
-- $$;

-- 1. Criação da função de Role (Cargo) unificada
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Tenta buscar primeiro na tabela antiga (perfis_acesso)
  SELECT cargo INTO v_role
  FROM public.perfis_acesso
  WHERE id = auth.uid()
  LIMIT 1;

  -- Se não achar, busca na tabela nova (perfis)
  IF v_role IS NULL THEN
    SELECT role INTO v_role
    FROM public.perfis
    WHERE usuario_id = auth.uid()
    LIMIT 1;
  END IF;

  RETURN COALESCE(v_role, 'funcionario');
END;
$$;

-- 2. Criação da função de Filial unificada
CREATE OR REPLACE FUNCTION public.get_my_filial_id()
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_filial_id UUID;
BEGIN
  SELECT filial_id INTO v_filial_id
  FROM public.perfis
  WHERE usuario_id = auth.uid()
  LIMIT 1;

  RETURN v_filial_id;
END;
$$;

-- INSERT INTO public.perfis_acesso (id, email, cargo)
-- VALUES ('UUID', 'maycomorais@gmail.com', 'adminMaster')
-- ON CONFLICT (id) 
-- DO UPDATE SET 
--   email = EXCLUDED.email,
--   cargo = 'adminMaster';


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 1 — EXTENSÕES
-- ═════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 2 — FUNÇÃO UTILITÁRIA set_updated_at()
-- Definida UMA VEZ aqui e reutilizada em todos os triggers.
-- (Versões anteriores tinham fn_set_updated_at() como duplicata.)
-- ═════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 3 — TABELAS PRINCIPAIS
-- ═════════════════════════════════════════════════════════════════

-- ── 3.1 perfis_acesso ─────────────────────────────────────────────
-- Vinculado ao Supabase Auth (auth.users).
-- Hierarquia: adminMaster > dono > gerente > funcionario > garcom
CREATE TABLE IF NOT EXISTS perfis_acesso (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  cargo         TEXT NOT NULL DEFAULT 'funcionario'
                CHECK (cargo IN ('adminMaster','dono','gerente','funcionario','garcom')),
  nome_display  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.2 configuracoes ─────────────────────────────────────────────
-- Linha única (id = 1). Todos os dados globais da loja ficam aqui.
CREATE TABLE IF NOT EXISTS configuracoes (
  id                          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),

  -- ── Identidade ──────────────────────────────────────────────────
  nome_restaurante            TEXT          DEFAULT '',
  descricao_loja              TEXT          DEFAULT '',
  url_loja                    TEXT          DEFAULT '',
  telefone_loja               TEXT          DEFAULT '',
  whatsapp_loja               TEXT          DEFAULT '',
  logo_url                    TEXT          DEFAULT '',
  icone_url                   TEXT          DEFAULT '',

  -- ── Pagamento ───────────────────────────────────────────────────
  chave_pix                   TEXT          DEFAULT '',
  nome_pix                    TEXT          DEFAULT '',
  dados_alias                 TEXT          DEFAULT '',
  nome_alias                  TEXT          DEFAULT '',
  alias_qr_url                TEXT          DEFAULT '',
  -- [{"nome":"Cielo","taxas":{"debito":1.5,"credito":2.5,"parcelado":3.0}}]
  maquininhas_cartao          JSONB         DEFAULT '[]'::JSONB,

  -- ── Localização e Delivery ──────────────────────────────────────
  coord_lat                   DOUBLE PRECISION DEFAULT 0,
  coord_lng                   DOUBLE PRECISION DEFAULT 0,
  -- [{"km_ate":2,"loja":6000,"motoboy":6000,"acombinar":false}, ...]
  tabela_frete                JSONB         DEFAULT NULL,
  limite_distancia_km         NUMERIC(5,1)  DEFAULT NULL,
  delivery_aberto             BOOLEAN       DEFAULT TRUE,
  aviso_delivery              TEXT          DEFAULT '',

  -- ── Operação ────────────────────────────────────────────────────
  loja_aberta                 BOOLEAN       DEFAULT TRUE,
  cotacao_real                NUMERIC(10,2) DEFAULT 1100,
  taxa_motoboy_base           INTEGER       DEFAULT 0,
  ajuda_combustivel           INTEGER       DEFAULT 0,

  -- ── Horários ────────────────────────────────────────────────────
  -- {"seg":[{"abre":"08:00","fecha":"22:00"}],"ter":[...],...}
  horarios_semanais           JSONB         DEFAULT NULL,
  horario_extra_hoje          JSONB         DEFAULT NULL,

  -- ── Banners / Promoções ─────────────────────────────────────────
  banner_imagem               TEXT          DEFAULT '',
  banner_produto_id           INTEGER       DEFAULT NULL,
  banner_desconto_tipo        TEXT          DEFAULT NULL,
  banner_desconto_valor       NUMERIC(10,2) DEFAULT NULL,
  banner2_imagem              TEXT          DEFAULT '',
  banner2_produto_id          INTEGER       DEFAULT NULL,
  banner2_desconto_tipo       TEXT          DEFAULT NULL,
  banner2_desconto_valor      NUMERIC(10,2) DEFAULT NULL,

  -- ── Visual ──────────────────────────────────────────────────────
  cor_primaria                TEXT          DEFAULT '#1a7a2e',
  cor_secundaria              TEXT          DEFAULT '#155c24',

  -- ── Adicionais globais ──────────────────────────────────────────
  extras_globais              JSONB         DEFAULT '[]'::JSONB,
  extras_globais_categorias   JSONB         DEFAULT NULL,

  -- ── Financeiro / Caixa ──────────────────────────────────────────
  sangria_limite              INTEGER       DEFAULT NULL,
  caixa_status                JSONB         DEFAULT '{}'::JSONB,

  -- ── Cashback ────────────────────────────────────────────────────
  cashback_percentual         NUMERIC       DEFAULT 10,
  cashback_validade_dias      INTEGER       DEFAULT 30,

  -- ── Features (controladas pelo adminMaster) ─────────────────────
  features_ativas             JSONB         DEFAULT '{
    "tabs": {
      "pedidos": true, "cozinha": true, "pdv": true,
      "financeiro": true, "inventario": true, "equipe": true,
      "configuracoes": true, "dashboard": true
    },
    "tipos_produto": {
      "padrao": true, "bebida": true, "lanche": true, "pizza": true,
      "acai": true, "shake": true, "suco": true, "sorvete": true,
      "montavel": true, "combo": true, "variacoes": true, "kg": true
    },
    "funcionalidades": {
      "delivery": true, "retirada": true, "local": true, "balcao": true,
      "cupons": true, "factura": true, "multipagamento": true, "agendamento": true
    }
  }'::JSONB
);

INSERT INTO configuracoes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- ── 3.3 categorias ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id                SERIAL PRIMARY KEY,
  slug              TEXT      NOT NULL UNIQUE,
  nome              TEXT      NOT NULL DEFAULT '',
  nome_exibicao     TEXT      NOT NULL DEFAULT '',
  descricao         TEXT      DEFAULT '',
  emoji             TEXT      DEFAULT '',
  cor               TEXT      DEFAULT '#1a7a2e',
  ordem             INTEGER   DEFAULT 0,
  ativa             BOOLEAN   DEFAULT TRUE,
  hora_inicio       TIME      DEFAULT NULL,
  hora_fim          TIME      DEFAULT NULL,
  dias_semana       TEXT[]    DEFAULT NULL,
  horarios_semanais JSONB     DEFAULT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: sincroniza nome ↔ nome_exibicao
CREATE OR REPLACE FUNCTION sync_cat_nome()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.nome IS NOT NULL AND NEW.nome != ''
     AND (NEW.nome_exibicao IS NULL OR NEW.nome_exibicao = '') THEN
    NEW.nome_exibicao := NEW.nome;
  END IF;
  IF NEW.nome_exibicao IS NOT NULL AND NEW.nome_exibicao != ''
     AND (NEW.nome IS NULL OR NEW.nome = '') THEN
    NEW.nome := NEW.nome_exibicao;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_cat_nome ON categorias;
CREATE TRIGGER trg_sync_cat_nome
  BEFORE INSERT OR UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION sync_cat_nome();


-- ── 3.4 subcategorias ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subcategorias (
  id              SERIAL PRIMARY KEY,
  slug            TEXT    NOT NULL UNIQUE,
  nome_exibicao   TEXT    NOT NULL,
  categoria_slug  TEXT    REFERENCES categorias(slug) ON DELETE CASCADE,
  ordem           INTEGER DEFAULT 0,
  ativa           BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.5 produtos ──────────────────────────────────────────────────
-- montagem_config JSONB — estrutura varia por tipo:
--   padrao:   { "__tipo": "padrao" }
--   variacoes:{ "__tipo": "variacoes", "variacoes": [...] }
--   pizza:    { "__tipo": "pizza", "tipos_pizza": [], "tamanhos": [], "sabores": [], "bordas": [] }
--   acai:     { "__tipo": "acai", "tamanhos": [], "acompanhamentos": [], "etapas": [], "variacoes": [] }
--   shake:    { "__tipo": "shake", "shake": { "tamanhos": [], "sabores": [] } }
--   suco:     { "__tipo": "suco", "tamanhos": [], "etapas": [] }
--   sorvete:  { "__tipo": "sorvete", "tamanhos": [], "sabores": [], "etapas": [], "variacoes": [] }
--   montavel: { "__tipo": "montavel", "etapas": [] }
--   combo:    { "__tipo": "combo", "descricao_livre": "", "itens_combo": [] }
--   kg:       { "__tipo": "kg", "preco_kg": 35000 }
CREATE TABLE IF NOT EXISTS produtos (
  id                 SERIAL PRIMARY KEY,
  nome               TEXT    NOT NULL,
  descricao          TEXT    DEFAULT '',
  preco              INTEGER DEFAULT 0,
  imagem_url         TEXT    DEFAULT '',
  categoria_slug     TEXT    REFERENCES categorias(slug) ON DELETE SET NULL,
  subcategoria_slug  TEXT    DEFAULT NULL,
  ativo              BOOLEAN DEFAULT TRUE,
  pausado            BOOLEAN DEFAULT FALSE,
  somente_balcao     BOOLEAN DEFAULT FALSE,
  destaque           BOOLEAN DEFAULT FALSE,
  ordem              INTEGER DEFAULT 0,
  e_montavel         BOOLEAN DEFAULT FALSE,
  es_bebida          BOOLEAN DEFAULT FALSE,
  -- Unidade de venda: 'un' (unidade) | 'kg' (peso)
  unidade_venda      TEXT    DEFAULT 'un',
  montagem_config    JSONB   DEFAULT NULL,
  adicionais         JSONB   DEFAULT '[]'::JSONB,
  inventario_id      INTEGER DEFAULT NULL,
  estoque_qtd        INTEGER DEFAULT NULL,
  -- Promoção temporária
  promo_ativo        BOOLEAN DEFAULT FALSE,
  promo_tipo         TEXT    DEFAULT NULL,  -- 'percent' | 'fixo'
  promo_valor        NUMERIC DEFAULT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- FK subcategoria (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_produtos_subcat' AND table_name = 'produtos'
  ) THEN
    ALTER TABLE produtos
      ADD CONSTRAINT fk_produtos_subcat
        FOREIGN KEY (subcategoria_slug)
        REFERENCES subcategorias(slug) ON DELETE SET NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_produtos_updated_at ON produtos;
CREATE TRIGGER trg_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 3.6 produto_variacoes ─────────────────────────────────────────
-- Variações de produto: tamanho, cor, sabor, voltagem etc.
-- Usada pelo gerenciador de variações do admin.js (varejo-admin).
-- preco_adicional: valor a somar ao preço base do produto.
-- preco_absoluto:  se TRUE, preco_adicional é o preço final (não adicional).
CREATE TABLE IF NOT EXISTS produto_variacoes (
  id                 BIGSERIAL PRIMARY KEY,
  produto_id         INTEGER   NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome               TEXT      NOT NULL,
  sku                TEXT      DEFAULT NULL,
  estoque_qtd        INTEGER   DEFAULT 0,
  controlar_estoque  BOOLEAN   DEFAULT TRUE,
  preco_adicional    NUMERIC   DEFAULT 0,
  preco_absoluto     BOOLEAN   DEFAULT FALSE,
  ativo              BOOLEAN   DEFAULT TRUE,
  ordem              INTEGER   DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.7 inventario ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventario (
  id                SERIAL PRIMARY KEY,
  nome              TEXT          NOT NULL,
  unidade           TEXT          DEFAULT 'un',
  quantidade        NUMERIC(10,3) DEFAULT 0,
  quantidade_minima NUMERIC(10,3) DEFAULT NULL,
  custo_unit        INTEGER       DEFAULT 0,
  produto_id        INTEGER       DEFAULT NULL,
  perecivel         BOOLEAN       DEFAULT FALSE,
  data_validade     DATE          DEFAULT NULL,
  observacoes       TEXT          DEFAULT NULL,
  created_at        TIMESTAMPTZ   DEFAULT NOW()
);


-- ── 3.8 inventario_movimentos ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventario_movimentos (
  id              SERIAL PRIMARY KEY,
  inventario_id   INTEGER REFERENCES inventario(id) ON DELETE CASCADE,
  tipo            TEXT    NOT NULL CHECK (tipo IN ('add','sub','ajuste','fechamento')),
  quantidade      NUMERIC(10,3) NOT NULL DEFAULT 0,
  motivo          TEXT    DEFAULT '',
  usuario_email   TEXT    DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.9 motoboys ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS motoboys (
  id         SERIAL PRIMARY KEY,
  nome       TEXT    NOT NULL,
  telefone   TEXT    DEFAULT '',
  ativo      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.10 cupons ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cupons (
  id              SERIAL PRIMARY KEY,
  codigo          TEXT          NOT NULL UNIQUE,
  tipo            TEXT          NOT NULL CHECK (tipo IN ('percentual','fixo','frete')),
  valor           NUMERIC(10,2) DEFAULT 0,
  minimo          NUMERIC(10,2) DEFAULT 0,
  limite_uso      INTEGER       DEFAULT NULL,
  usos_realizados INTEGER       DEFAULT 0,
  ativo           BOOLEAN       DEFAULT TRUE,
  validade        DATE          DEFAULT NULL,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);


-- ── 3.11 pedidos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id                            SERIAL PRIMARY KEY,
  uid_temporal                  TEXT    DEFAULT '',
  status                        TEXT    DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_preparo','pronto_entrega','saiu_entrega','entregue','cancelado')),
  tipo_entrega                  TEXT    DEFAULT 'delivery'
    CHECK (tipo_entrega IN ('delivery','retirada','local','balcao')),

  -- Itens
  itens                         JSONB   DEFAULT '[]'::JSONB,

  -- Valores
  subtotal                      INTEGER DEFAULT 0,
  desconto_cupom                INTEGER DEFAULT 0,
  desconto_pdv_valor            INTEGER DEFAULT 0,
  desconto_pdv_tipo             TEXT    DEFAULT NULL,
  frete_cobrado_cliente         INTEGER DEFAULT 0,
  frete_motoboy                 INTEGER DEFAULT 0,
  frete_a_combinar              BOOLEAN DEFAULT FALSE,
  total_geral                   INTEGER DEFAULT 0,

  -- Pagamento
  forma_pagamento               TEXT    DEFAULT '',
  obs_pagamento                 TEXT    DEFAULT '',

  -- Cliente
  cliente_nome                  TEXT    DEFAULT '',
  cliente_telefone              TEXT    DEFAULT '',
  endereco_entrega              TEXT    DEFAULT '',
  geo_lat                       TEXT    DEFAULT NULL,
  geo_lng                       TEXT    DEFAULT NULL,

  -- Faturação (factura PY)
  dados_factura                 JSONB   DEFAULT NULL,

  -- Operadores
  motoboy_id                    INTEGER REFERENCES motoboys(id) ON DELETE SET NULL,
  garcom_id                     UUID    REFERENCES perfis_acesso(id) ON DELETE SET NULL,
  garcom_nome                   TEXT    DEFAULT NULL,

  -- Cancelamento
  cancelamento_solicitado       BOOLEAN     DEFAULT FALSE,
  cancelamento_motivo           TEXT        DEFAULT NULL,
  cancelamento_solicitado_por   TEXT        DEFAULT NULL,
  cancelamento_solicitado_em    TIMESTAMPTZ DEFAULT NULL,
  cancelamento_aprovado_por     TEXT        DEFAULT NULL,
  cancelamento_aprovado_em      TIMESTAMPTZ DEFAULT NULL,
  motivo_cancelamento           TEXT        DEFAULT NULL,

  -- Extras
  confirmacao_tipo              TEXT    DEFAULT NULL,
  cupom_codigo                  TEXT    DEFAULT NULL,

  -- Web Push Notifications
  push_subscription             JSONB   DEFAULT NULL,

  -- Confirmação de entrega
  entrega_confirmada_em         TIMESTAMPTZ DEFAULT NULL,

  -- Timestamps do ciclo de vida
  tempo_recebido                TIMESTAMPTZ DEFAULT NOW(),
  tempo_confirmado              TIMESTAMPTZ DEFAULT NULL,
  tempo_preparo_iniciado        TIMESTAMPTZ DEFAULT NULL,
  tempo_pronto                  TIMESTAMPTZ DEFAULT NULL,
  tempo_saiu_entrega            TIMESTAMPTZ DEFAULT NULL,
  tempo_entregue                TIMESTAMPTZ DEFAULT NULL,

  -- Multi-filial
  filial_id                     UUID    DEFAULT NULL,

  created_at                    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.12 solicitacoes_cancelamento ────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitacoes_cancelamento (
  id              SERIAL PRIMARY KEY,
  pedido_id       INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  motivo          TEXT    DEFAULT '',
  solicitado_por  TEXT    DEFAULT '',
  aprovado        BOOLEAN DEFAULT FALSE,
  aprovado_por    TEXT    DEFAULT NULL,
  aprovado_em     TIMESTAMPTZ DEFAULT NULL,
  negado          BOOLEAN DEFAULT FALSE,
  negado_por      TEXT    DEFAULT NULL,
  negado_em       TIMESTAMPTZ DEFAULT NULL,
  observacoes     TEXT    DEFAULT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.13 movimentacoes_caixa ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS movimentacoes_caixa (
  id               SERIAL PRIMARY KEY,
  tipo             TEXT          NOT NULL,
  valor            NUMERIC(12,2) NOT NULL DEFAULT 0,
  descricao        TEXT          DEFAULT '',
  usuario_email    TEXT          DEFAULT '',
  tipo_despesa     TEXT          DEFAULT NULL,
  descricao_outro  TEXT          DEFAULT NULL,
  autorizado_por   TEXT          DEFAULT NULL,
  pedido_id        INTEGER       DEFAULT NULL,
  sessao_id        BIGINT        DEFAULT NULL,  -- vínculo com sessoes_caixa (FK adicionada abaixo)
  created_at       TIMESTAMPTZ   DEFAULT NOW()
);


-- ── 3.14 sessoes_caixa ────────────────────────────────────────────
-- ► Corrigido: CREATE TABLE IF NOT EXISTS + índices IF NOT EXISTS
CREATE TABLE IF NOT EXISTS sessoes_caixa (
  id               BIGSERIAL PRIMARY KEY,
  usuario_email    TEXT        NOT NULL,
  usuario_nome     TEXT,
  aberto_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fechado_em       TIMESTAMPTZ,
  valor_abertura   NUMERIC     DEFAULT 0,
  valor_fechamento NUMERIC,
  observacao       TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes_caixa (usuario_email);
CREATE INDEX IF NOT EXISTS idx_sessoes_aberto  ON sessoes_caixa (aberto_em);

-- FK de movimentacoes_caixa → sessoes_caixa (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_movcaixa_sessao' AND table_name = 'movimentacoes_caixa'
  ) THEN
    ALTER TABLE movimentacoes_caixa
      ADD CONSTRAINT fk_movcaixa_sessao
        FOREIGN KEY (sessao_id) REFERENCES sessoes_caixa(id);
  END IF;
END $$;


-- ── 3.15 insumos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insumos (
  id            BIGSERIAL PRIMARY KEY,
  nome          TEXT    NOT NULL,
  unidade       TEXT    NOT NULL DEFAULT 'un',  -- un | kg | g | l | ml | pct
  preco_custo   NUMERIC NOT NULL DEFAULT 0,
  estoque_atual NUMERIC DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.16 fichas_tecnicas ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fichas_tecnicas (
  id             BIGSERIAL PRIMARY KEY,
  produto_id     TEXT,
  produto_nome   TEXT    NOT NULL,
  markup_percent NUMERIC NOT NULL DEFAULT 300,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.17 ficha_itens ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ficha_itens (
  id              BIGSERIAL PRIMARY KEY,
  ficha_id        BIGINT REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
  insumo_id       BIGINT REFERENCES insumos(id) ON DELETE SET NULL,
  insumo_nome     TEXT,
  unidade_insumo  TEXT    DEFAULT 'un',
  quantidade      NUMERIC NOT NULL DEFAULT 1
);


-- ── 3.18 clientes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id               BIGSERIAL PRIMARY KEY,
  nome             TEXT    NOT NULL,
  telefone         TEXT    UNIQUE NOT NULL,
  data_nascimento  DATE,
  saldo_cashback   NUMERIC DEFAULT 0,
  total_gasto      NUMERIC DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.19 cashback_transacoes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS cashback_transacoes (
  id                BIGSERIAL PRIMARY KEY,
  cliente_id        BIGINT REFERENCES clientes(id) ON DELETE CASCADE,
  cliente_telefone  TEXT,
  pedido_id         BIGINT,
  tipo              TEXT    NOT NULL CHECK (tipo IN ('credito','debito')),
  valor             NUMERIC NOT NULL,
  validade_dias     INT     DEFAULT 30,
  expira_em         TIMESTAMPTZ,
  usado             BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.20 filiais ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS filiais (
  id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT             NOT NULL,
  endereco            TEXT,
  coord_lat           DOUBLE PRECISION NOT NULL,
  coord_lng           DOUBLE PRECISION NOT NULL,
  whatsapp            TEXT             NOT NULL,
  status              TEXT             NOT NULL DEFAULT 'ativa'
                                       CHECK (status IN ('ativa','inativa','manutencao')),
  raio_entrega_km     DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  taxa_entrega_base   NUMERIC(10,2)    DEFAULT 0,
  horario_abertura    TIME             DEFAULT '08:00',
  horario_fechamento  TIME             DEFAULT '22:00',
  created_at          TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ      NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_filiais_updated_at ON filiais;
CREATE TRIGGER trg_filiais_updated_at
  BEFORE UPDATE ON filiais
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 3.21 perfis (multi-filial) ────────────────────────────────────
-- Tabela separada de perfis_acesso, usada pelo módulo de filiais.
-- perfis_acesso.cargo  → controla acesso ao admin principal
-- perfis.role          → controla acesso por filial (motoboy, gerente etc.)
CREATE TABLE IF NOT EXISTS perfis (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  nome        TEXT,
  role        TEXT        NOT NULL DEFAULT 'funcionario'
                          CHECK (role IN ('adminMaster','gerente','funcionario','motoboy')),
  filial_id   UUID        REFERENCES filiais(id) ON DELETE SET NULL,
  ativo       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id)
);

-- FK de pedidos → filiais (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos' AND column_name = 'filial_id'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN filial_id UUID REFERENCES filiais(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ── 3.22 contratos_aceites ────────────────────────────────────────
-- Registro imutável de aceite de contrato (triggers bloqueiam UPDATE/DELETE).
CREATE TABLE IF NOT EXISTS contratos_aceites (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  email             TEXT        NOT NULL,
  nome_cliente      TEXT,
  documento_cliente TEXT,
  data_hora         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address        TEXT,
  user_agent        TEXT,
  aceito            BOOLEAN     NOT NULL DEFAULT TRUE,
  versao_contrato   TEXT        NOT NULL DEFAULT 'v1.0-2026',
  hash_contrato     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION fn_block_delete_contratos()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'OPERAÇÃO ILEGAL: Registros de contratos_aceites não podem ser excluídos.';
END; $$;

DROP TRIGGER IF EXISTS trg_block_delete_contratos ON contratos_aceites;
CREATE TRIGGER trg_block_delete_contratos
  BEFORE DELETE ON contratos_aceites
  FOR EACH ROW EXECUTE FUNCTION fn_block_delete_contratos();

CREATE OR REPLACE FUNCTION fn_block_update_contratos()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'OPERAÇÃO ILEGAL: Registros de contratos_aceites são imutáveis.';
END; $$;

DROP TRIGGER IF EXISTS trg_block_update_contratos ON contratos_aceites;
CREATE TRIGGER trg_block_update_contratos
  BEFORE UPDATE ON contratos_aceites
  FOR EACH ROW EXECUTE FUNCTION fn_block_update_contratos();


-- ── 3.23 planos_mensalistas ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS planos_mensalistas (
  id                  BIGSERIAL PRIMARY KEY,
  cliente_id          BIGINT REFERENCES clientes(id) ON DELETE CASCADE,
  produto_nome        TEXT    NOT NULL,
  quantidade_total    INT     NOT NULL DEFAULT 0,
  quantidade_restante INT     NOT NULL DEFAULT 0,
  valor_plano         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valor_restante      NUMERIC       DEFAULT 0,
  ativo               BOOLEAN NOT NULL DEFAULT TRUE,
  data_inicio         DATE,
  data_fim            DATE,
  obs                 TEXT    DEFAULT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.24 mensalista_entregas ──────────────────────────────────────
-- Registra consumo de saldo do plano (não entra no financeiro).
CREATE TABLE IF NOT EXISTS mensalista_entregas (
  id           BIGSERIAL PRIMARY KEY,
  plano_id     BIGINT REFERENCES planos_mensalistas(id) ON DELETE CASCADE,
  cliente_id   BIGINT REFERENCES clientes(id) ON DELETE SET NULL,
  produto_nome TEXT,
  quantidade   INT     NOT NULL DEFAULT 1,
  observacoes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3.25 assinaturas ──────────────────────────────────────────────
-- Controle SaaS: dados de cobrança mensal do tenant (id = 1).
-- Bloqueia o sistema automaticamente após vencimento + carência.
CREATE TABLE IF NOT EXISTS public.assinaturas (
  id                      BIGINT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Identificação do tenant (uma linha por instalação)
  tenant_nome             TEXT    NOT NULL DEFAULT 'Loja Principal',
  tenant_email_contato    TEXT,

  -- Regra de vencimento
  tipo_vencimento         TEXT    NOT NULL DEFAULT 'dia_fixo'
                                  CHECK (tipo_vencimento IN ('dia_fixo','dia_util')),
  dia_vencimento          INTEGER NOT NULL DEFAULT 5
                                  CHECK (dia_vencimento BETWEEN 1 AND 31),
  -- Para 'dia_util': dia_vencimento = N (ex: 5 = 5º dia útil do mês)

  -- Carência após vencimento
  dias_carencia           INTEGER NOT NULL DEFAULT 5 CHECK (dias_carencia >= 0),

  -- Controle de pagamento
  ultimo_pagamento_em     DATE,
  pagamento_confirmado_por TEXT,

  -- Bloqueio
  bloqueado               BOOLEAN NOT NULL DEFAULT FALSE,
  bloqueado_em            TIMESTAMPTZ,
  desbloqueado_em         TIMESTAMPTZ,
  desbloqueado_por        TEXT,

  -- Metadados
  obs                     TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_assinaturas_updated_at ON public.assinaturas;
CREATE TRIGGER trg_assinaturas_updated_at
  BEFORE UPDATE ON public.assinaturas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed: insere o tenant padrão se ainda não existir
INSERT INTO public.assinaturas (tenant_nome, tipo_vencimento, dia_vencimento, dias_carencia)
SELECT 'Loja Principal', 'dia_util', 5, 5
WHERE NOT EXISTS (SELECT 1 FROM public.assinaturas LIMIT 1);


-- ── 3.26 assinatura_pagamentos ────────────────────────────────────
-- Histórico de pagamentos confirmados por competência (mês/ano).
CREATE TABLE IF NOT EXISTS public.assinatura_pagamentos (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assinatura_id   BIGINT NOT NULL REFERENCES public.assinaturas(id) ON DELETE CASCADE,
  competencia     TEXT   NOT NULL,  -- 'YYYY-MM'
  confirmado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmado_por  TEXT,
  obs             TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pagamento_competencia
  ON public.assinatura_pagamentos (assinatura_id, competencia);


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 4 — ÍNDICES
-- ═════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_pedidos_status
  ON pedidos (status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at
  ON pedidos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_garcom
  ON pedidos (garcom_id) WHERE garcom_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pedidos_garcom_status
  ON pedidos (garcom_id, status) WHERE garcom_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pedidos_filial_id
  ON pedidos (filial_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_push_subscription
  ON pedidos ((push_subscription IS NOT NULL))
  WHERE push_subscription IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_produtos_cat
  ON produtos (categoria_slug);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo
  ON produtos (ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_subcat
  ON produtos (subcategoria_slug);

CREATE INDEX IF NOT EXISTS idx_prod_var_produto
  ON produto_variacoes (produto_id);
CREATE INDEX IF NOT EXISTS idx_prod_var_ativo
  ON produto_variacoes (ativo) WHERE ativo = TRUE;

CREATE INDEX IF NOT EXISTS idx_subcategorias_cat
  ON subcategorias (categoria_slug);

CREATE INDEX IF NOT EXISTS idx_sol_cancel_pedido
  ON solicitacoes_cancelamento (pedido_id);

CREATE INDEX IF NOT EXISTS idx_inv_mov_inv
  ON inventario_movimentos (inventario_id);

CREATE INDEX IF NOT EXISTS idx_caixa_created
  ON movimentacoes_caixa (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_caixa_operador
  ON movimentacoes_caixa (usuario_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cupons_codigo
  ON cupons (codigo);

CREATE INDEX IF NOT EXISTS idx_clientes_telefone
  ON clientes (telefone);
CREATE INDEX IF NOT EXISTS idx_cashback_cliente
  ON cashback_transacoes (cliente_id);

CREATE INDEX IF NOT EXISTS idx_filiais_status
  ON filiais (status);

CREATE INDEX IF NOT EXISTS idx_perfis_usuario_id ON perfis (usuario_id);
CREATE INDEX IF NOT EXISTS idx_perfis_filial_id  ON perfis (filial_id);
CREATE INDEX IF NOT EXISTS idx_perfis_role       ON perfis (role);

CREATE INDEX IF NOT EXISTS idx_planos_mensalistas_cliente
  ON planos_mensalistas (cliente_id);
CREATE INDEX IF NOT EXISTS idx_planos_mensalistas_ativo
  ON planos_mensalistas (ativo);
CREATE INDEX IF NOT EXISTS idx_mensalista_entregas_plano
  ON mensalista_entregas (plano_id);
CREATE INDEX IF NOT EXISTS idx_mensalista_entregas_data
  ON mensalista_entregas (created_at);

CREATE INDEX IF NOT EXISTS idx_contratos_usuario_id ON contratos_aceites (usuario_id);
CREATE INDEX IF NOT EXISTS idx_contratos_email       ON contratos_aceites (email);


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 5 — ROW LEVEL SECURITY (RLS)
-- Todas as políticas usam DO $$ para ser idempotentes.
-- ═════════════════════════════════════════════════════════════════

ALTER TABLE pedidos                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_variacoes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_acesso              ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoboys                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupons                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias              ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_cancelamento  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_movimentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_caixa        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_caixa              ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_itens                ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashback_transacoes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_mensalistas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensalista_entregas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas                ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinatura_pagamentos      ENABLE ROW LEVEL SECURITY;

-- ── Cardápio público: leitura anônima ────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='produtos'      AND policyname='anon_read_produtos')      THEN CREATE POLICY "anon_read_produtos"      ON produtos      FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categorias'    AND policyname='anon_read_categorias')    THEN CREATE POLICY "anon_read_categorias"    ON categorias    FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subcategorias' AND policyname='anon_read_subcats')       THEN CREATE POLICY "anon_read_subcats"       ON subcategorias FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='configuracoes' AND policyname='anon_read_config')        THEN CREATE POLICY "anon_read_config"        ON configuracoes FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cupons'        AND policyname='anon_read_cupons')        THEN CREATE POLICY "anon_read_cupons"        ON cupons        FOR SELECT USING (ativo = true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='produto_variacoes' AND policyname='anon_read_variacoes') THEN CREATE POLICY "anon_read_variacoes" ON produto_variacoes FOR SELECT USING (true); END IF;
END $$;

-- ── Pedidos ──────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Clientes podem inserir pedidos"    ON pedidos;
  DROP POLICY IF EXISTS "Allow insert for anon"             ON pedidos;
  DROP POLICY IF EXISTS "Enable insert for anon"            ON pedidos;
  DROP POLICY IF EXISTS "insert_pedidos"                    ON pedidos;
  DROP POLICY IF EXISTS "anon_insert_pedidos"               ON pedidos;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pedidos' AND policyname='pedidos_select_publico') THEN
    CREATE POLICY "pedidos_select_publico" ON pedidos FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pedidos' AND policyname='pedidos_update_publico') THEN
    CREATE POLICY "pedidos_update_publico" ON pedidos FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pedidos' AND policyname='auth_all_pedidos') THEN
    CREATE POLICY "auth_all_pedidos" ON pedidos FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ── Solicitações de cancelamento ─────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='solicitacoes_cancelamento' AND policyname='anon_insert_solicitacoes') THEN
    CREATE POLICY "anon_insert_solicitacoes" ON solicitacoes_cancelamento FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='solicitacoes_cancelamento' AND policyname='auth_all_solicitacoes') THEN
    CREATE POLICY "auth_all_solicitacoes" ON solicitacoes_cancelamento FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ── Demais tabelas: só autenticados ──────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='produtos'            AND policyname='auth_all_produtos')       THEN CREATE POLICY "auth_all_produtos"       ON produtos            FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='produto_variacoes'   AND policyname='auth_all_variacoes')      THEN CREATE POLICY "auth_all_variacoes"      ON produto_variacoes   FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categorias'          AND policyname='auth_all_categorias')     THEN CREATE POLICY "auth_all_categorias"     ON categorias          FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subcategorias'       AND policyname='auth_all_subcats')        THEN CREATE POLICY "auth_all_subcats"        ON subcategorias       FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='configuracoes'       AND policyname='auth_all_config')         THEN CREATE POLICY "auth_all_config"         ON configuracoes       FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='perfis_acesso'       AND policyname='auth_all_perfis')         THEN CREATE POLICY "auth_all_perfis"         ON perfis_acesso       FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='motoboys'            AND policyname='auth_all_motoboys')       THEN CREATE POLICY "auth_all_motoboys"       ON motoboys            FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cupons'              AND policyname='auth_all_cupons')         THEN CREATE POLICY "auth_all_cupons"         ON cupons              FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inventario'          AND policyname='auth_all_inventario')     THEN CREATE POLICY "auth_all_inventario"     ON inventario          FOR ALL USING (auth.role()='authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='inventario_movimentos'AND policyname='auth_all_inv_mov')       THEN CREATE POLICY "auth_all_inv_mov"        ON inventario_movimentos FOR ALL USING (auth.role()='authenticated'); END IF;
  -- sessoes_caixa: policies granulares por perfil (v4.0)
  -- INSERT restrito ao próprio email; SELECT/UPDATE liberado para gestor via perfis_acesso
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessoes_caixa' AND policyname='sessoes_caixa_insert') THEN
    CREATE POLICY "sessoes_caixa_insert" ON sessoes_caixa FOR INSERT TO authenticated
      WITH CHECK (usuario_email = auth.jwt() ->> 'email');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessoes_caixa' AND policyname='sessoes_caixa_select') THEN
    CREATE POLICY "sessoes_caixa_select" ON sessoes_caixa FOR SELECT TO authenticated
      USING (
        usuario_email = auth.jwt() ->> 'email'
        OR EXISTS (SELECT 1 FROM public.perfis_acesso WHERE id = auth.uid() AND cargo IN ('dono','gerente','adminMaster'))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessoes_caixa' AND policyname='sessoes_caixa_update') THEN
    CREATE POLICY "sessoes_caixa_update" ON sessoes_caixa FOR UPDATE TO authenticated
      USING (
        usuario_email = auth.jwt() ->> 'email'
        OR EXISTS (SELECT 1 FROM public.perfis_acesso WHERE id = auth.uid() AND cargo IN ('dono','gerente','adminMaster'))
      );
  END IF;
  -- movimentacoes_caixa: policies granulares por perfil (v4.0)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movimentacoes_caixa' AND policyname='movcaixa_insert') THEN
    CREATE POLICY "movcaixa_insert" ON movimentacoes_caixa FOR INSERT TO authenticated
      WITH CHECK (usuario_email = auth.jwt() ->> 'email');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movimentacoes_caixa' AND policyname='movcaixa_select') THEN
    CREATE POLICY "movcaixa_select" ON movimentacoes_caixa FOR SELECT TO authenticated
      USING (
        usuario_email = auth.jwt() ->> 'email'
        OR EXISTS (SELECT 1 FROM public.perfis_acesso WHERE id = auth.uid() AND cargo IN ('dono','gerente','adminMaster'))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movimentacoes_caixa' AND policyname='movcaixa_update') THEN
    CREATE POLICY "movcaixa_update" ON movimentacoes_caixa FOR UPDATE TO authenticated
      USING (
        usuario_email = auth.jwt() ->> 'email'
        OR EXISTS (SELECT 1 FROM public.perfis_acesso WHERE id = auth.uid() AND cargo IN ('dono','gerente','adminMaster'))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='insumos'             AND policyname='auth_all_access_insumos') THEN CREATE POLICY "auth_all_access_insumos" ON insumos             FOR ALL TO authenticated USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fichas_tecnicas'     AND policyname='auth_all_access_fichas')  THEN CREATE POLICY "auth_all_access_fichas"  ON fichas_tecnicas     FOR ALL TO authenticated USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ficha_itens'         AND policyname='auth_all_access_fi')      THEN CREATE POLICY "auth_all_access_fi"      ON ficha_itens         FOR ALL TO authenticated USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clientes'            AND policyname='auth_all_access_cli')     THEN CREATE POLICY "auth_all_access_cli"     ON clientes            FOR ALL TO authenticated USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cashback_transacoes' AND policyname='auth_all_access_cb')      THEN CREATE POLICY "auth_all_access_cb"      ON cashback_transacoes FOR ALL TO authenticated USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='planos_mensalistas'  AND policyname='auth_all_planos')         THEN CREATE POLICY "auth_all_planos"         ON planos_mensalistas  FOR ALL TO authenticated USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mensalista_entregas' AND policyname='auth_all_entregas')       THEN CREATE POLICY "auth_all_entregas"       ON mensalista_entregas FOR ALL TO authenticated USING (true) WITH CHECK (true); END IF;
END $$;

-- ── Assinaturas (SaaS) ───────────────────────────────────────────
-- Leitura: qualquer autenticado (necessário para o sistema verificar status).
-- Escrita: qualquer autenticado — segurança de adminMaster enforçada no JS.
-- Para maior segurança futura, substitua por: get_my_cargo() = 'adminMaster'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='assinaturas'           AND policyname='assinaturas_read')      THEN CREATE POLICY "assinaturas_read"      ON assinaturas           FOR SELECT USING (auth.role() = 'authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='assinaturas'           AND policyname='assinaturas_write')     THEN CREATE POLICY "assinaturas_write"     ON assinaturas           FOR ALL    USING (auth.role() = 'authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='assinatura_pagamentos' AND policyname='assin_pag_read')        THEN CREATE POLICY "assin_pag_read"        ON assinatura_pagamentos FOR SELECT USING (auth.role() = 'authenticated'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='assinatura_pagamentos' AND policyname='assin_pag_write')       THEN CREATE POLICY "assin_pag_write"       ON assinatura_pagamentos FOR ALL    USING (auth.role() = 'authenticated'); END IF;
END $$;

-- ── Filiais e perfis multi-filial ────────────────────────────────
ALTER TABLE filiais          ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_aceites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "filiais_select_auth"   ON filiais;
  DROP POLICY IF EXISTS "filiais_select_anon"   ON filiais;
  DROP POLICY IF EXISTS "filiais_insert_master" ON filiais;
  DROP POLICY IF EXISTS "filiais_update_master" ON filiais;
  DROP POLICY IF EXISTS "filiais_delete_master" ON filiais;
  CREATE POLICY "filiais_select_auth"   ON filiais FOR SELECT TO authenticated USING (TRUE);
  CREATE POLICY "filiais_select_anon"   ON filiais FOR SELECT TO anon USING (status = 'ativa');
  CREATE POLICY "filiais_insert_master" ON filiais FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'adminMaster');
  CREATE POLICY "filiais_update_master" ON filiais FOR UPDATE TO authenticated USING (get_my_role() = 'adminMaster');
  CREATE POLICY "filiais_delete_master" ON filiais FOR DELETE TO authenticated USING (get_my_role() = 'adminMaster');
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "perfis_select" ON perfis;
  DROP POLICY IF EXISTS "perfis_insert" ON perfis;
  DROP POLICY IF EXISTS "perfis_update" ON perfis;
  CREATE POLICY "perfis_select" ON perfis FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR get_my_role() = 'adminMaster' OR (get_my_role() = 'gerente' AND filial_id = get_my_filial_id()));
  CREATE POLICY "perfis_insert" ON perfis FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid() OR get_my_role() = 'adminMaster');
  CREATE POLICY "perfis_update" ON perfis FOR UPDATE TO authenticated USING (usuario_id = auth.uid() OR get_my_role() = 'adminMaster' OR (get_my_role() = 'gerente' AND filial_id = get_my_filial_id()));
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "contratos_select" ON contratos_aceites;
  DROP POLICY IF EXISTS "contratos_insert" ON contratos_aceites;
  CREATE POLICY "contratos_select" ON contratos_aceites FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR get_my_role() = 'adminMaster');
  CREATE POLICY "contratos_insert" ON contratos_aceites FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());
END $$;


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 6 — STORAGE: bucket "produtos"
-- ► Crie o bucket MANUALMENTE em:
--   Dashboard → Storage → New Bucket → Nome: produtos | Public: ON
-- Depois rode as policies abaixo:
-- ═════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='produtos_public_read')   THEN CREATE POLICY "produtos_public_read"   ON storage.objects FOR SELECT              USING  (bucket_id = 'produtos'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='produtos_auth_insert')   THEN CREATE POLICY "produtos_auth_insert"   ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'produtos'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='produtos_auth_update')   THEN CREATE POLICY "produtos_auth_update"   ON storage.objects FOR UPDATE TO authenticated USING  (bucket_id = 'produtos'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='produtos_auth_delete')   THEN CREATE POLICY "produtos_auth_delete"   ON storage.objects FOR DELETE TO authenticated USING  (bucket_id = 'produtos'); END IF;
END $$;


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 7 — REALTIME
-- ═════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'pedidos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'assinaturas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE assinaturas;
  END IF;
END $$;


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 8 — FUNÇÕES AUXILIARES E RPCs
-- ═════════════════════════════════════════════════════════════════

-- ── Funções multi-filial ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(role, 'funcionario') FROM perfis WHERE usuario_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_my_filial_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT filial_id FROM perfis WHERE usuario_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION usuario_tem_contrato(p_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM contratos_aceites WHERE usuario_id = p_uid AND aceito = TRUE);
$$;

-- ── Filial mais próxima (Haversine) ──────────────────────────────

CREATE OR REPLACE FUNCTION filial_mais_proxima(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS TABLE (
  filial_id        UUID,
  nome             TEXT,
  whatsapp         TEXT,
  endereco         TEXT,
  distancia_km     DOUBLE PRECISION,
  raio_entrega_km  DOUBLE PRECISION,
  dentro_do_raio   BOOLEAN
)
LANGUAGE sql STABLE AS $$
  SELECT id, nome, whatsapp, endereco,
    (6371.0 * acos(LEAST(1.0,
      cos(radians(p_lat)) * cos(radians(coord_lat))
      * cos(radians(coord_lng) - radians(p_lng))
      + sin(radians(p_lat)) * sin(radians(coord_lat))
    ))) AS distancia_km,
    raio_entrega_km,
    (6371.0 * acos(LEAST(1.0,
      cos(radians(p_lat)) * cos(radians(coord_lat))
      * cos(radians(coord_lng) - radians(p_lng))
      + sin(radians(p_lat)) * sin(radians(coord_lat))
    ))) <= raio_entrega_km AS dentro_do_raio
  FROM filiais
  WHERE status = 'ativa'
  ORDER BY distancia_km ASC
  LIMIT 1;
$$;

-- ── RPC atômica: incrementar uso de cupom (evita race condition) ─

CREATE OR REPLACE FUNCTION incrementar_uso_cupom(cupom_id INTEGER)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE cupons
  SET usos_realizados = COALESCE(usos_realizados, 0) + 1
  WHERE id = cupom_id;
$$;

GRANT EXECUTE ON FUNCTION incrementar_uso_cupom(INTEGER) TO anon, authenticated;


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 9 — PROMOVER USUÁRIO PARA adminMaster
-- ► Substitua 'seu@email.com' pelo email desejado e descomente
-- ═════════════════════════════════════════════════════════════════

-- Opção A — usuário já logou no admin ao menos uma vez:
-- UPDATE perfis_acesso SET cargo = 'adminMaster' WHERE email = 'seu@email.com';

-- Opção B — nunca logou (precisa do UUID):
-- 1. Descubra o UUID:
--    SELECT id FROM auth.users WHERE email = 'seu@email.com';
-- 2. Insira:
-- INSERT INTO perfis_acesso (id, email, cargo, nome_display)
-- VALUES ('UUID_AQUI', 'seu@email.com', 'adminMaster', 'Admin Master')
-- ON CONFLICT (id) DO UPDATE SET cargo = 'adminMaster';


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 10 — VERIFICAÇÕES ÚTEIS
-- ═════════════════════════════════════════════════════════════════

-- Verificar assinatura ativa:
-- SELECT id, tenant_nome, tipo_vencimento, dia_vencimento,
--        dias_carencia, ultimo_pagamento_em, bloqueado
-- FROM assinaturas;

-- Verificar policies ativas:
-- SELECT schemaname, tablename, policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname IN ('public','storage')
-- ORDER BY tablename, policyname;

-- Verificar colunas de produtos:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'produtos'
-- ORDER BY ordinal_position;

-- Verificar tabelas criadas:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;


-- ═════════════════════════════════════════════════════════════════
-- SEÇÃO 11 — MIGRATIONS INCREMENTAIS
-- ► Execute APENAS se já tem um banco existente.
-- ► Todas as instruções são idempotentes (ADD COLUMN IF NOT EXISTS).
-- ═════════════════════════════════════════════════════════════════

-- ── 11.1 configuracoes ───────────────────────────────────────────
ALTER TABLE public.configuracoes
  ADD COLUMN IF NOT EXISTS nome_restaurante          TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS descricao_loja            TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS url_loja                  TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS telefone_loja             TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_loja             TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_url                  TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS icone_url                 TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS chave_pix                 TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS nome_pix                  TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS dados_alias               TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS nome_alias                TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS alias_qr_url              TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS maquininhas_cartao         JSONB         DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS coord_lat                 DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coord_lng                 DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS limite_distancia_km       NUMERIC(5,1)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS delivery_aberto           BOOLEAN       DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS aviso_delivery            TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS loja_aberta               BOOLEAN       DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS cotacao_real              NUMERIC(10,2) DEFAULT 1100,
  ADD COLUMN IF NOT EXISTS taxa_motoboy_base         INTEGER       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ajuda_combustivel         INTEGER       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS horarios_semanais         JSONB         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS horario_extra_hoje        JSONB         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banner_imagem             TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner_produto_id         INTEGER       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banner_desconto_tipo      TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banner_desconto_valor     NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banner2_imagem            TEXT          DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner2_produto_id        INTEGER       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banner2_desconto_tipo     TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banner2_desconto_valor    NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cor_primaria              TEXT          DEFAULT '#1a7a2e',
  ADD COLUMN IF NOT EXISTS cor_secundaria            TEXT          DEFAULT '#155c24',
  ADD COLUMN IF NOT EXISTS extras_globais            JSONB         DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS extras_globais_categorias JSONB         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sangria_limite            INTEGER       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS caixa_status              JSONB         DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS cashback_percentual       NUMERIC       DEFAULT 10,
  ADD COLUMN IF NOT EXISTS cashback_validade_dias    INT           DEFAULT 30,
  ADD COLUMN IF NOT EXISTS features_ativas           JSONB         DEFAULT NULL;

UPDATE public.configuracoes SET loja_aberta = TRUE WHERE loja_aberta IS NULL;


-- ── 11.2 produtos ────────────────────────────────────────────────
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS e_montavel        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS es_bebida         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subcategoria_slug TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS somente_balcao    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS destaque          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS inventario_id     INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estoque_qtd       INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS unidade_venda     TEXT    DEFAULT 'un',
  ADD COLUMN IF NOT EXISTS promo_ativo       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS promo_tipo        TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS promo_valor       NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ DEFAULT NOW();


-- ── 11.3 produto_variacoes (nova tabela) ─────────────────────────
CREATE TABLE IF NOT EXISTS produto_variacoes (
  id                 BIGSERIAL PRIMARY KEY,
  produto_id         INTEGER   NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome               TEXT      NOT NULL,
  sku                TEXT      DEFAULT NULL,
  estoque_qtd        INTEGER   DEFAULT 0,
  controlar_estoque  BOOLEAN   DEFAULT TRUE,
  preco_adicional    NUMERIC   DEFAULT 0,
  preco_absoluto     BOOLEAN   DEFAULT FALSE,
  ativo              BOOLEAN   DEFAULT TRUE,
  ordem              INTEGER   DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_var_produto ON produto_variacoes (produto_id);
CREATE INDEX IF NOT EXISTS idx_prod_var_ativo   ON produto_variacoes (ativo) WHERE ativo = TRUE;

ALTER TABLE produto_variacoes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='produto_variacoes' AND policyname='anon_read_variacoes')  THEN CREATE POLICY "anon_read_variacoes"  ON produto_variacoes FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='produto_variacoes' AND policyname='auth_all_variacoes')   THEN CREATE POLICY "auth_all_variacoes"   ON produto_variacoes FOR ALL USING (auth.role()='authenticated'); END IF;
END $$;


-- ── 11.4 categorias ──────────────────────────────────────────────
ALTER TABLE public.categorias
  ADD COLUMN IF NOT EXISTS nome              TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS dias_semana       TEXT[]  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS horarios_semanais JSONB   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hora_inicio       TIME    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hora_fim          TIME    DEFAULT NULL;

UPDATE public.categorias
  SET nome = nome_exibicao
  WHERE (nome = '' OR nome IS NULL) AND nome_exibicao IS NOT NULL;


-- ── 11.5 subcategorias ───────────────────────────────────────────
ALTER TABLE public.subcategorias
  ADD COLUMN IF NOT EXISTS slug          TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS nome_exibicao TEXT DEFAULT NULL;

UPDATE public.subcategorias SET slug = 'subcat-' || id
  WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS subcategorias_slug_unique
  ON public.subcategorias (slug);


-- ── 11.6 pedidos ─────────────────────────────────────────────────
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS frete_a_combinar              BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS desconto_pdv_valor            INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_pdv_tipo             TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS garcom_nome                   TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelamento_solicitado       BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancelamento_motivo           TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelamento_solicitado_por   TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelamento_solicitado_em    TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelamento_aprovado_por     TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelamento_aprovado_em      TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento           TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmacao_tipo              TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cupom_codigo                  TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tempo_confirmado              TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tempo_preparo_iniciado        TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tempo_pronto                  TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tempo_saiu_entrega            TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tempo_entregue                TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS push_subscription             JSONB       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS entrega_confirmada_em         TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS filial_id                     UUID        DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_push_subscription
  ON public.pedidos ((push_subscription IS NOT NULL))
  WHERE push_subscription IS NOT NULL;


-- ── 11.7 inventario ──────────────────────────────────────────────
ALTER TABLE public.inventario
  ADD COLUMN IF NOT EXISTS quantidade_minima NUMERIC(10,3) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS produto_id        INTEGER       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS perecivel         BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS data_validade     DATE          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS observacoes       TEXT          DEFAULT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inventario' AND column_name = 'minimo'
  ) THEN
    UPDATE public.inventario
      SET quantidade_minima = minimo
      WHERE quantidade_minima IS NULL AND minimo IS NOT NULL AND minimo > 0;
  END IF;
END $$;


-- ── 11.8 cupons ──────────────────────────────────────────────────
ALTER TABLE public.cupons
  ADD COLUMN IF NOT EXISTS minimo     NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS limite_uso INTEGER       DEFAULT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cupons' AND column_name = 'uso_maximo'
  ) THEN
    UPDATE public.cupons SET limite_uso = uso_maximo
      WHERE limite_uso IS NULL AND uso_maximo IS NOT NULL;
  END IF;
END $$;


-- ── 11.9 movimentacoes_caixa ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.movimentacoes_caixa (
  id               SERIAL PRIMARY KEY,
  tipo             TEXT          NOT NULL DEFAULT 'entrada',
  valor            NUMERIC(12,2) NOT NULL DEFAULT 0,
  descricao        TEXT          DEFAULT '',
  usuario_email    TEXT          DEFAULT '',
  tipo_despesa     TEXT          DEFAULT NULL,
  descricao_outro  TEXT          DEFAULT NULL,
  autorizado_por   TEXT          DEFAULT NULL,
  pedido_id        INTEGER       DEFAULT NULL,
  sessao_id        BIGINT        DEFAULT NULL,
  created_at       TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE public.movimentacoes_caixa
  ADD COLUMN IF NOT EXISTS tipo_despesa    TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS descricao_outro TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS autorizado_por  TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pedido_id       INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sessao_id       BIGINT  DEFAULT NULL;

ALTER TABLE public.movimentacoes_caixa ENABLE ROW LEVEL SECURITY;
-- Policies granulares criadas na Seção 11.16 abaixo (v4.0).
-- A policy genérica "auth_all_caixa" foi substituída.


-- ── 11.10 sessoes_caixa ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessoes_caixa (
  id               BIGSERIAL PRIMARY KEY,
  usuario_email    TEXT        NOT NULL,
  usuario_nome     TEXT,
  aberto_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fechado_em       TIMESTAMPTZ,
  valor_abertura   NUMERIC     DEFAULT 0,
  valor_fechamento NUMERIC,
  observacao       TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON public.sessoes_caixa (usuario_email);
CREATE INDEX IF NOT EXISTS idx_sessoes_aberto  ON public.sessoes_caixa (aberto_em);

ALTER TABLE public.sessoes_caixa ENABLE ROW LEVEL SECURITY;
-- Policies granulares criadas na Seção 11.16 abaixo (v4.0).
-- A policy genérica "auth_all_sessoes" foi substituída.


-- ── 11.11 planos_mensalistas ─────────────────────────────────────
ALTER TABLE public.planos_mensalistas
  ADD COLUMN IF NOT EXISTS obs TEXT DEFAULT NULL;


-- ── 11.12 perfis_acesso — constraint de cargo ────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'perfis_acesso_cargo_check'
      AND table_name = 'perfis_acesso'
  ) THEN
    ALTER TABLE public.perfis_acesso DROP CONSTRAINT perfis_acesso_cargo_check;
  END IF;
  ALTER TABLE public.perfis_acesso
    ADD CONSTRAINT perfis_acesso_cargo_check
    CHECK (cargo IN ('adminMaster','dono','gerente','funcionario','garcom'));
END $$;


-- ── 11.13 filiais e perfis multi-filial ──────────────────────────
CREATE TABLE IF NOT EXISTS filiais (
  id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT             NOT NULL,
  endereco            TEXT,
  coord_lat           DOUBLE PRECISION NOT NULL,
  coord_lng           DOUBLE PRECISION NOT NULL,
  whatsapp            TEXT             NOT NULL,
  status              TEXT             NOT NULL DEFAULT 'ativa'
                                       CHECK (status IN ('ativa','inativa','manutencao')),
  raio_entrega_km     DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  taxa_entrega_base   NUMERIC(10,2)    DEFAULT 0,
  horario_abertura    TIME             DEFAULT '08:00',
  horario_fechamento  TIME             DEFAULT '22:00',
  created_at          TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS perfis (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  nome        TEXT,
  role        TEXT        NOT NULL DEFAULT 'funcionario'
                          CHECK (role IN ('adminMaster','gerente','funcionario','motoboy')),
  filial_id   UUID        REFERENCES filiais(id) ON DELETE SET NULL,
  ativo       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='role')      THEN ALTER TABLE perfis ADD COLUMN role     TEXT    NOT NULL DEFAULT 'funcionario' CHECK (role IN ('adminMaster','gerente','funcionario','motoboy')); END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='filial_id') THEN ALTER TABLE perfis ADD COLUMN filial_id UUID    REFERENCES filiais(id) ON DELETE SET NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='ativo')     THEN ALTER TABLE perfis ADD COLUMN ativo     BOOLEAN NOT NULL DEFAULT TRUE; END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_filiais_status    ON filiais (status);
CREATE INDEX IF NOT EXISTS idx_perfis_usuario_id ON perfis (usuario_id);
CREATE INDEX IF NOT EXISTS idx_perfis_filial_id  ON perfis (filial_id);
CREATE INDEX IF NOT EXISTS idx_perfis_role       ON perfis (role);


-- ── 11.14 assinaturas (se banco existente não tiver) ─────────────
CREATE TABLE IF NOT EXISTS public.assinaturas (
  id                      BIGINT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_nome             TEXT    NOT NULL DEFAULT 'Loja Principal',
  tenant_email_contato    TEXT,
  tipo_vencimento         TEXT    NOT NULL DEFAULT 'dia_fixo'
                                  CHECK (tipo_vencimento IN ('dia_fixo','dia_util')),
  dia_vencimento          INTEGER NOT NULL DEFAULT 5
                                  CHECK (dia_vencimento BETWEEN 1 AND 31),
  dias_carencia           INTEGER NOT NULL DEFAULT 5 CHECK (dias_carencia >= 0),
  ultimo_pagamento_em     DATE,
  pagamento_confirmado_por TEXT,
  bloqueado               BOOLEAN NOT NULL DEFAULT FALSE,
  bloqueado_em            TIMESTAMPTZ,
  desbloqueado_em         TIMESTAMPTZ,
  desbloqueado_por        TEXT,
  obs                     TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assinatura_pagamentos (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assinatura_id   BIGINT NOT NULL REFERENCES public.assinaturas(id) ON DELETE CASCADE,
  competencia     TEXT   NOT NULL,
  confirmado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmado_por  TEXT,
  obs             TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pagamento_competencia
  ON public.assinatura_pagamentos (assinatura_id, competencia);

INSERT INTO public.assinaturas (tenant_nome, tipo_vencimento, dia_vencimento, dias_carencia)
SELECT 'Loja Principal', 'dia_util', 5, 5
WHERE NOT EXISTS (SELECT 1 FROM public.assinaturas LIMIT 1);

-- ── 11.15 Realtime ───────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='pedidos')     THEN ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;     END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='assinaturas') THEN ALTER PUBLICATION supabase_realtime ADD TABLE assinaturas; END IF;
END $$;

-- =================================================================
-- FIM DA MIGRAÇÃO v3.0
-- Rode as queries da Seção 10 para validar.
-- =================================================================

ALTER TABLE public.planos_mensalistas
  ADD COLUMN IF NOT EXISTS valor_restante NUMERIC DEFAULT 0;

UPDATE public.planos_mensalistas
  SET valor_restante = ROUND((valor_plano::NUMERIC / quantidade_total) * quantidade_restante)
  WHERE quantidade_total > 0 AND valor_restante = 0;


-- ── 11.16 RLS granular sessoes_caixa + movimentacoes_caixa (v4.0) ──
-- Substitui as antigas policies genéricas "auth_all_sessoes" e
-- "auth_all_caixa" por policies que restringem INSERT ao próprio
-- usuário e liberam SELECT/UPDATE para gestores via perfis_acesso.
-- Fuso horário de referência: UTC-3 permanente (PY, lei 2024).
-- O código JS usa offset +3h para converter datas locais → UTC antes
-- de enviar ao Supabase (calcularFinanceiro, _buscarDadosRelatorio,
-- _verificarBloqueioCaixa).

-- ── sessoes_caixa ────────────────────────────────────────────────
ALTER TABLE public.sessoes_caixa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_sessoes"      ON public.sessoes_caixa;
DROP POLICY IF EXISTS "sessoes_caixa_insert"  ON public.sessoes_caixa;
DROP POLICY IF EXISTS "sessoes_caixa_select"  ON public.sessoes_caixa;
DROP POLICY IF EXISTS "sessoes_caixa_update"  ON public.sessoes_caixa;

CREATE POLICY "sessoes_caixa_insert"
ON public.sessoes_caixa FOR INSERT TO authenticated
WITH CHECK (usuario_email = auth.jwt() ->> 'email');

CREATE POLICY "sessoes_caixa_select"
ON public.sessoes_caixa FOR SELECT TO authenticated
USING (
  usuario_email = auth.jwt() ->> 'email'
  OR EXISTS (
    SELECT 1 FROM public.perfis_acesso
    WHERE id = auth.uid()
      AND cargo IN ('dono', 'gerente', 'adminMaster')
  )
);

CREATE POLICY "sessoes_caixa_update"
ON public.sessoes_caixa FOR UPDATE TO authenticated
USING (
  usuario_email = auth.jwt() ->> 'email'
  OR EXISTS (
    SELECT 1 FROM public.perfis_acesso
    WHERE id = auth.uid()
      AND cargo IN ('dono', 'gerente', 'adminMaster')
  )
);

-- ── movimentacoes_caixa ──────────────────────────────────────────
ALTER TABLE public.movimentacoes_caixa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_caixa"  ON public.movimentacoes_caixa;
DROP POLICY IF EXISTS "movcaixa_insert" ON public.movimentacoes_caixa;
DROP POLICY IF EXISTS "movcaixa_select" ON public.movimentacoes_caixa;
DROP POLICY IF EXISTS "movcaixa_update" ON public.movimentacoes_caixa;

CREATE POLICY "movcaixa_insert"
ON public.movimentacoes_caixa FOR INSERT TO authenticated
WITH CHECK (usuario_email = auth.jwt() ->> 'email');

CREATE POLICY "movcaixa_select"
ON public.movimentacoes_caixa FOR SELECT TO authenticated
USING (
  usuario_email = auth.jwt() ->> 'email'
  OR EXISTS (
    SELECT 1 FROM public.perfis_acesso
    WHERE id = auth.uid()
      AND cargo IN ('dono', 'gerente', 'adminMaster')
  )
);

CREATE POLICY "movcaixa_update"
ON public.movimentacoes_caixa FOR UPDATE TO authenticated
USING (
  usuario_email = auth.jwt() ->> 'email'
  OR EXISTS (
    SELECT 1 FROM public.perfis_acesso
    WHERE id = auth.uid()
      AND cargo IN ('dono', 'gerente', 'adminMaster')
  )
);

-- =================================================================
-- FIM DA MIGRAÇÃO v4.0
-- Rode as queries da Seção 10 para validar.
-- =================================================================

-- ═══════════════════════════════════════════════════════════════════════
-- MIGRATION: Correções de Bugs — App2
-- Gerado em: 2026-06
-- Idempotente: pode ser executado em projetos existentes sem risco.
-- ATENÇÃO: Esta migration é específica para este app.
--          A coluna de saldo do cliente é saldo_cashback (não cashback_saldo).
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- §1  GARANTIR COLUNAS NECESSÁRIAS
-- ─────────────────────────────────────────────────────────────────────

-- cashback_transacoes.usado (já existe no schema base; garantir aqui)
ALTER TABLE cashback_transacoes
  ADD COLUMN IF NOT EXISTS usado BOOLEAN DEFAULT FALSE;

-- inventario_movimentos.motivo — garantir que existe
ALTER TABLE inventario_movimentos
  ADD COLUMN IF NOT EXISTS motivo TEXT DEFAULT '';

-- ─────────────────────────────────────────────────────────────────────
-- §2  ÍNDICE PARA ACELERAR BUSCA DE CASHBACK POR PEDIDO
-- ─────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_cashback_pedido_tipo
  ON cashback_transacoes (pedido_id, tipo, usado);

-- ─────────────────────────────────────────────────────────────────────
-- §3  FUNÇÃO RPC: reverter_cashback_cancelamento
--     Usa saldo_cashback (coluna correta deste app)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reverter_cashback_cancelamento(p_pedido_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx         RECORD;
  v_estornados INT := 0;
BEGIN
  FOR v_tx IN
    SELECT id, cliente_id, cliente_telefone, valor
    FROM cashback_transacoes
    WHERE pedido_id = p_pedido_id
      AND tipo      = 'credito'
      AND usado     = FALSE
  LOOP
    UPDATE cashback_transacoes SET usado = TRUE WHERE id = v_tx.id;

    INSERT INTO cashback_transacoes
      (cliente_id, cliente_telefone, pedido_id, tipo, valor, validade_dias, usado)
    VALUES
      (v_tx.cliente_id, v_tx.cliente_telefone, p_pedido_id,
       'debito', v_tx.valor, 0, TRUE);

    IF v_tx.cliente_id IS NOT NULL THEN
      -- Esta app usa saldo_cashback (não cashback_saldo)
      UPDATE clientes
         SET saldo_cashback = GREATEST(0, COALESCE(saldo_cashback, 0) - v_tx.valor)
       WHERE id = v_tx.cliente_id;
    END IF;

    v_estornados := v_estornados + 1;
  END LOOP;

  RETURN jsonb_build_object('estornados', v_estornados, 'pedido_id', p_pedido_id);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- §4  FUNÇÃO RPC: repor_estoque_cancelamento (idempotente)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION repor_estoque_cancelamento(p_pedido_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_itens    JSONB;
  v_item     JSONB;
  v_prod_id  INT;
  v_inv_id   INT;
  v_qtd      NUMERIC;
  v_repostos INT := 0;
BEGIN
  IF EXISTS (
    SELECT 1 FROM inventario_movimentos
    WHERE motivo = 'Cancelamento — Pedido #' || p_pedido_id
      AND tipo   = 'ajuste'
  ) THEN
    RETURN jsonb_build_object('status', 'already_done', 'pedido_id', p_pedido_id);
  END IF;

  SELECT itens INTO v_itens FROM pedidos WHERE id = p_pedido_id;
  IF v_itens IS NULL OR jsonb_array_length(v_itens) = 0 THEN
    RETURN jsonb_build_object('status', 'no_items', 'pedido_id', p_pedido_id);
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_itens)
  LOOP
    v_prod_id := COALESCE((v_item->>'produto_id')::INT, (v_item->>'id')::INT);
    v_qtd     := COALESCE((v_item->>'qtd')::NUMERIC, (v_item->>'q')::NUMERIC, 1);

    SELECT inventario_id INTO v_inv_id
    FROM produtos WHERE id = v_prod_id AND inventario_id IS NOT NULL;

    IF v_inv_id IS NOT NULL THEN
      UPDATE inventario SET quantidade = quantidade + v_qtd WHERE id = v_inv_id;
      INSERT INTO inventario_movimentos (inventario_id, tipo, quantidade, motivo, usuario_email)
      VALUES (v_inv_id, 'ajuste', v_qtd, 'Cancelamento — Pedido #' || p_pedido_id, 'sistema');
      v_repostos := v_repostos + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('status', 'ok', 'repostos', v_repostos, 'pedido_id', p_pedido_id);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- §5  TRIGGER: ao mudar status para "cancelado", executa reversões
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION _trigger_cancelamento_reversoes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'cancelado' AND OLD.status IS DISTINCT FROM 'cancelado' THEN
    PERFORM reverter_cashback_cancelamento(NEW.id);
    PERFORM repor_estoque_cancelamento(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cancelamento_reversoes ON pedidos;
CREATE TRIGGER trg_cancelamento_reversoes
  AFTER UPDATE OF status ON pedidos
  FOR EACH ROW EXECUTE FUNCTION _trigger_cancelamento_reversoes();

-- ─────────────────────────────────────────────────────────────────────
-- §6  VIEW: v_financeiro_por_metodo (classifica QrPy, CartaoBR, Multipag)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_financeiro_por_metodo AS
WITH pedidos_simples AS (
  SELECT id, created_at, total_geral,
    CASE
      WHEN lower(forma_pagamento) LIKE '%pix%'                           THEN 'Pix'
      WHEN lower(forma_pagamento) LIKE '%transfer%'
        OR lower(forma_pagamento) LIKE '%alias%'                         THEN 'Transferencia'
      WHEN lower(forma_pagamento) = 'qrpy'                               THEN 'QrPy'
      WHEN lower(forma_pagamento) = 'cartaobr'                           THEN 'CartaoBR'
      WHEN lower(forma_pagamento) LIKE '%cartao%'
        OR lower(forma_pagamento) LIKE '%cartão%'                        THEN 'Cartao'
      WHEN lower(forma_pagamento) LIKE '%efetivo%'
        OR lower(forma_pagamento) LIKE '%dinheiro%'                      THEN 'Efetivo'
      ELSE 'Outros'
    END AS metodo,
    total_geral AS valor
  FROM pedidos
  WHERE status != 'cancelado'
    AND lower(COALESCE(forma_pagamento,'')) != 'multipagamento'
),
pedidos_multi AS (
  SELECT p.id, p.created_at, p.total_geral,
    CASE
      WHEN lower(parte->>'forma') LIKE '%pix%'         THEN 'Pix'
      WHEN lower(parte->>'forma') LIKE '%transfer%'
        OR lower(parte->>'forma') LIKE '%alias%'        THEN 'Transferencia'
      WHEN lower(parte->>'forma') LIKE '%qrpy%'
        OR lower(parte->>'forma') LIKE '%qr%'           THEN 'QrPy'
      WHEN lower(parte->>'forma') LIKE '%cartaobr%'
        OR lower(parte->>'forma') LIKE '%br%'           THEN 'CartaoBR'
      WHEN lower(parte->>'forma') LIKE '%cartao%'
        OR lower(parte->>'forma') LIKE '%cartão%'       THEN 'Cartao'
      ELSE 'Efetivo'
    END AS metodo,
    (parte->>'valor')::NUMERIC AS valor
  FROM pedidos p,
       jsonb_array_elements(
         CASE WHEN obs_pagamento ~ '^\[' THEN obs_pagamento::JSONB ELSE '[]'::JSONB END
       ) AS parte
  WHERE status != 'cancelado'
    AND lower(COALESCE(forma_pagamento,'')) = 'multipagamento'
)
SELECT metodo, SUM(valor) AS total
FROM (SELECT metodo, valor FROM pedidos_simples UNION ALL SELECT metodo, valor FROM pedidos_multi) t
GROUP BY metodo ORDER BY total DESC;

-- ─────────────────────────────────────────────────────────────────────
-- §7  VIEW: v_ranking_produtos (todos os status exceto cancelado)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_ranking_produtos AS
SELECT
  COALESCE(item->>'nome', item->>'n', 'Produto') AS produto,
  SUM(COALESCE((item->>'qtd')::INT, (item->>'q')::INT, 1)) AS quantidade
FROM pedidos, jsonb_array_elements(itens) AS item
WHERE status != 'cancelado'
GROUP BY 1 ORDER BY quantidade DESC;

-- ─────────────────────────────────────────────────────────────────────
-- §8  VIEW: v_ranking_clientes (todos os status exceto cancelado)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_ranking_clientes AS
SELECT
  cliente_telefone,
  MAX(cliente_nome) AS nome,
  COUNT(*)          AS pedidos,
  SUM(total_geral)  AS total_gasto
FROM pedidos
WHERE status != 'cancelado'
  AND cliente_telefone IS NOT NULL AND cliente_telefone != ''
GROUP BY cliente_telefone ORDER BY pedidos DESC;

-- ─────────────────────────────────────────────────────────────────────
-- §9  GRANTS
-- ─────────────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION reverter_cashback_cancelamento(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION repor_estoque_cancelamento(BIGINT)     TO authenticated;
GRANT SELECT ON v_financeiro_por_metodo TO authenticated;
GRANT SELECT ON v_ranking_produtos      TO authenticated;
GRANT SELECT ON v_ranking_clientes      TO authenticated;

COMMIT;