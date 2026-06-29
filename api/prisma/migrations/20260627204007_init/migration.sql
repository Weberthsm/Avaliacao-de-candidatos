-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'AVALIADOR', 'AVALIADO');

-- CreateEnum
CREATE TYPE "TipoPergunta" AS ENUM ('ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "ModoAprovacao" AS ENUM ('AUTOMATICO', 'MANUAL', 'AMBOS');

-- CreateEnum
CREATE TYPE "StatusProcesso" AS ENUM ('RASCUNHO', 'ATIVO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "StatusTentativa" AS ENUM ('EM_ANDAMENTO', 'ENVIADA', 'CORRIGIDA');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('NOVO_ENVIO', 'RESULTADO_DISPONIVEL');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "telefone" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tentativas_falhas" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_ate" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perguntas" (
    "id" TEXT NOT NULL,
    "avaliador_id" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "tipo" "TipoPergunta" NOT NULL,
    "peso" INTEGER NOT NULL,
    "instrucoes" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternativas" (
    "id" TEXT NOT NULL,
    "pergunta_id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alternativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos" (
    "id" TEXT NOT NULL,
    "avaliador_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tempo_minutos" INTEGER NOT NULL,
    "nota_minima" DECIMAL(5,2) NOT NULL,
    "modo_aprovacao" "ModoAprovacao" NOT NULL,
    "exibir_gabarito" BOOLEAN NOT NULL DEFAULT false,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "status" "StatusProcesso" NOT NULL DEFAULT 'RASCUNHO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processo_perguntas" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "pergunta_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "processo_perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processo_candidatos" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "avaliado_id" TEXT NOT NULL,

    CONSTRAINT "processo_candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tentativas" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "avaliado_id" TEXT NOT NULL,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizado_em" TIMESTAMP(3),
    "tempo_extra_min" INTEGER NOT NULL DEFAULT 0,
    "score_parcial" DECIMAL(7,2),
    "score_total" DECIMAL(7,2),
    "status" "StatusTentativa" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "aprovado" BOOLEAN,
    "aprovado_manual" BOOLEAN NOT NULL DEFAULT false,
    "feedback_geral" TEXT,

    CONSTRAINT "tentativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas" (
    "id" TEXT NOT NULL,
    "tentativa_id" TEXT NOT NULL,
    "pergunta_id" TEXT NOT NULL,
    "texto_resposta" TEXT,
    "alternativa_id" TEXT,
    "pontos_obtidos" DECIMAL(7,2),
    "observacao_avaliador" TEXT,
    "salvo_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_aba_saidas" (
    "id" TEXT NOT NULL,
    "tentativa_id" TEXT NOT NULL,
    "ocorrido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aba_saidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "link" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "perguntas_avaliador_id_idx" ON "perguntas"("avaliador_id");

-- CreateIndex
CREATE INDEX "alternativas_pergunta_id_idx" ON "alternativas"("pergunta_id");

-- CreateIndex
CREATE INDEX "processos_avaliador_id_idx" ON "processos"("avaliador_id");

-- CreateIndex
CREATE INDEX "processo_perguntas_processo_id_idx" ON "processo_perguntas"("processo_id");

-- CreateIndex
CREATE UNIQUE INDEX "processo_perguntas_processo_id_pergunta_id_key" ON "processo_perguntas"("processo_id", "pergunta_id");

-- CreateIndex
CREATE INDEX "processo_candidatos_processo_id_idx" ON "processo_candidatos"("processo_id");

-- CreateIndex
CREATE UNIQUE INDEX "processo_candidatos_processo_id_avaliado_id_key" ON "processo_candidatos"("processo_id", "avaliado_id");

-- CreateIndex
CREATE INDEX "tentativas_avaliado_id_idx" ON "tentativas"("avaliado_id");

-- CreateIndex
CREATE UNIQUE INDEX "tentativas_processo_id_avaliado_id_key" ON "tentativas"("processo_id", "avaliado_id");

-- CreateIndex
CREATE INDEX "respostas_tentativa_id_idx" ON "respostas"("tentativa_id");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_tentativa_id_pergunta_id_key" ON "respostas"("tentativa_id", "pergunta_id");

-- CreateIndex
CREATE INDEX "log_aba_saidas_tentativa_id_idx" ON "log_aba_saidas"("tentativa_id");

-- CreateIndex
CREATE INDEX "notificacoes_usuario_id_idx" ON "notificacoes"("usuario_id");

-- AddForeignKey
ALTER TABLE "perguntas" ADD CONSTRAINT "perguntas_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternativas" ADD CONSTRAINT "alternativas_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos" ADD CONSTRAINT "processos_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_perguntas" ADD CONSTRAINT "processo_perguntas_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_perguntas" ADD CONSTRAINT "processo_perguntas_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_candidatos" ADD CONSTRAINT "processo_candidatos_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_candidatos" ADD CONSTRAINT "processo_candidatos_avaliado_id_fkey" FOREIGN KEY ("avaliado_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas" ADD CONSTRAINT "tentativas_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas" ADD CONSTRAINT "tentativas_avaliado_id_fkey" FOREIGN KEY ("avaliado_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_tentativa_id_fkey" FOREIGN KEY ("tentativa_id") REFERENCES "tentativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_alternativa_id_fkey" FOREIGN KEY ("alternativa_id") REFERENCES "alternativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aba_saidas" ADD CONSTRAINT "log_aba_saidas_tentativa_id_fkey" FOREIGN KEY ("tentativa_id") REFERENCES "tentativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
