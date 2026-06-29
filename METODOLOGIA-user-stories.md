# Metodologia para Escrita de User Stories

> Guia prático para escrita de user stories orientadas ao negócio, baseadas em **INVEST**, com **Regras de Negócio numeradas** e **cenários Gherkin no estilo declarativo**.
> Use este documento como referência ao escrever ou revisar histórias de usuário em qualquer módulo do sistema.

---

## 1. Princípios INVEST

Toda user story deve atender aos seis atributos do acrônimo INVEST. Use-os como filtro de qualidade antes de considerar a história "pronta".

| Letra | Significa | O que verificar |
| --- | --- | --- |
| **I** — Independent | Independente | A história pode ser implementada e entregue sem depender de outra estar pronta antes? |
| **N** — Negotiable | Negociável | O texto descreve **o que** o sistema deve fazer e **por quê**, deixando espaço para o time discutir o **como**? |
| **V** — Valuable | Valiosa | Existe um benefício claro de negócio para um papel real (operador, cliente, gestor, etc.)? |
| **E** — Estimable | Estimável | O time consegue estimar esforço com confiança razoável? Se não, falta detalhe ou está grande demais. |
| **S** — Small | Pequena | Cabe num único sprint? Se sobrar dúvida, quebrar em histórias menores. |
| **T** — Testable | Testável | Existem critérios objetivos que permitem dizer "feito" ou "não feito"? |

---

## 2. Anatomia da User Story

Toda história tem quatro blocos obrigatórios, nesta ordem:

```
1. Cabeçalho   →  US-NN — Título curto e direto
2. Narrativa   →  Como / Quero / Para que
3. Regras      →  Lista numerada de Regras de Negócio (RN)
4. Cenários    →  Critérios de Aceitação em Gherkin
```

### 2.1 Narrativa

Use sempre a tríade **Como / Quero / Para que**:

```markdown
**Como** [papel de negócio]
**Quero** [capacidade ou ação que o papel precisa exercer]
**Para que** [valor de negócio resultante]
```

Boas práticas para a narrativa:

- O papel deve ser **um humano com responsabilidade no negócio** (operador, cliente, gestor financeiro, auditor). Evite "sistema", "API", "backend" como papel.
- O verbo do *Quero* descreve uma capacidade do negócio ("cadastrar", "consultar", "aprovar"), não uma ação técnica ("chamar endpoint", "gravar no banco").
- O *Para que* expressa o valor, não a mecânica. **Mau exemplo:** "para que o registro fique salvo no banco". **Bom exemplo:** "para que ela possa ser referenciada nos demais processos do negócio".

### 2.2 Regras de Negócio (RN)

As Regras de Negócio são afirmações curtas, numeradas e independentes que governam a história. Use o padrão `RN-NN.M`, onde `NN` é o número da story e `M` é o sequencial da regra.

Boas práticas para Regras de Negócio:

- Cada regra é **uma única afirmação verificável**. Se aparecer "e" ligando duas ideias diferentes, vire duas regras.
- Linguagem do **domínio**, não de banco/código. **Mau:** "Campo `is_active = false`". **Bom:** "O certificado deixa de ser usado em novas assinaturas".
- Não cite tipos, tamanhos, FKs, índices, regex, hashes ou nomes de tabela. Esses detalhes pertencem ao desenho técnico, não à história.
- Quando a regra envolver tempo, números ou limites, **cite o valor de negócio**, não a unidade técnica. **Mau:** "Token expira em 1800s". **Bom:** "A sessão expira após 30 minutos de inatividade".
- Cada RN deve poder virar pelo menos um cenário de teste.

---

## 3. Cenários Gherkin — Estilo Declarativo

Gherkin é a linguagem em que escrevemos os critérios de aceitação. **Sempre use o estilo declarativo**: descreva *o que* o usuário do negócio percebe, não *como* a UI ou API se comporta.

### 3.1 Estrutura básica

```gherkin
Cenário: <título descritivo do comportamento>
  Dado que <pré-condição ou estado inicial>
  Quando <ação de negócio executada>
  Então <resultado observável>
  E <resultado adicional, se houver>
```

Regras de redação:

- **Um único `Quando` por cenário.** Se aparecem dois, normalmente é um cenário disfarçado de outro.
- O `Então` descreve **resultado visível para o usuário do negócio**, não estado interno do sistema.
- Mensagens entre aspas (ex.: `"Documento inválido"`) viram parte do contrato com UX. Discuta o texto na refinement com o time.
- Gherkin **não substitui** a Regra de Negócio — ele a exemplifica em um caso concreto.

### 3.2 Os três estilos (e por que escolhemos o declarativo)

Compare três versões do mesmo cenário:

**Declarativo (recomendado):**

```gherkin
Cenário: Cadastro com CPF inválido
  Quando cadastro uma pessoa informando um CPF inválido
  Então o cadastro é rejeitado
  E vejo a mensagem "Documento inválido"
```

**Imperativo (frágil, atrelado à UI):**

```gherkin
Cenário: Cadastro com CPF inválido
  Dado que estou na tela "Nova Pessoa"
  Quando preencho o campo "Nome" com "João"
  E preencho o campo "CPF" com "111.111.111-11"
  E clico no botão "Salvar"
  Então um popup vermelho aparece no topo
```

**Técnico (acoplado ao backend):**

```gherkin
Cenário: Cadastro com CPF inválido
  Quando faço POST em /api/v1/persons com payload {"document":"11111111111"}
  Então recebo HTTP 422
  E o body contém {"error":"INVALID_DOCUMENT"}
```

O estilo declarativo é o único que sobrevive a redesign de UI, troca de framework e versionamento de API. Ele serve como fonte única, e cada camada técnica (backend, frontend E2E) implementa os step definitions à sua maneira.

### 3.3 Frontend × Backend

A user story descreve comportamento de negócio, **não pertence a uma camada**. O mesmo cenário declarativo é executado em camadas diferentes:

- O time de **backend** automatiza o cenário disparando chamadas contra a API e validando regras.
- O time de **frontend (E2E)** automatiza o mesmo cenário navegando pela UI.
- O cenário em texto é **um só**; o que muda é o binding técnico.

### 3.4 Cobertura mínima por story

Toda história deve ter pelo menos:

- **1 happy path** (caminho principal de sucesso).
- **1 cenário de exceção por Regra de Negócio relevante** (validação, duplicidade, ausência de campo obrigatório, regras de estado, etc.).
- **1 cenário de borda** quando aplicável (limites de tamanho, datas, expiração, etc.).

---

## 4. Esquema do Cenário (Scenario Outline)

Quando o **mesmo comportamento** se repete com **dados diferentes**, use **Esquema do Cenário** com tabela de exemplos. Isso evita 8 cenários quase idênticos.

### 4.1 Quando usar

Use Esquema do Cenário sempre que houver:

- Validações por país, moeda, idioma, tipo de documento, etc.
- Cobertura de uma enumeração inteira (plataformas iOS/Android/Web/Windows/macOS, finalidades de endereço, canais de mensageria).
- Combinações de tipos × valores × resultados.

### 4.2 Quando NÃO usar

- Quando o comportamento muda entre os casos (não é a mesma regra).
- Quando há apenas 2 casos — um cenário declarativo individual lê melhor.
- Quando a tabela ficaria com mais de 10 colunas — sinal de que há regras misturadas.

### 4.3 Exemplo

```gherkin
Esquema do Cenário: Validação de documento por país
  Quando cadastro uma pessoa do tipo <tipo_pessoa> com documento "<tipo_doc>" e número "<numero>"
  Então o cadastro <resultado>

  Exemplos:
    | tipo_pessoa | tipo_doc | numero              | resultado                                       |
    | física      | CPF      | 529.982.247-25      | é aceito                                        |
    | física      | CPF      | 111.111.111-11      | é rejeitado com a mensagem "Documento inválido" |
    | jurídica    | CNPJ     | 11.222.333/0001-81  | é aceito                                        |
    | física      | DNI      | 12.345.678          | é aceito                                        |
    | física      | PASSPORT | AB1234567           | é aceito                                        |
```

### 4.4 Boa prática híbrida

**Mantenha o cenário narrativo principal antes do Esquema.** A narrativa serve como ilustração legível para PO e UX; o Esquema cobre a matriz completa para QA. Esse é o padrão recomendado pelo Cucumber e pelas comunidades de BDD.

---

## 5. Anti-patterns (o que evitar)

### 5.1 Vocabulário proibido na user story

Estas palavras quase sempre indicam contaminação técnica e devem ser revisadas:

| Termo | Por que evitar | Substituir por |
| --- | --- | --- |
| `endpoint`, `API`, `payload`, `JSON`, `HTTP 4xx/5xx` | Detalhe de protocolo | "operação", "informação", "rejeitado", "aceito" |
| `tabela`, `coluna`, `schema`, `FK`, `UNIQUE`, `NOT NULL` | Detalhe de banco | reescrever em termos de regra de negócio |
| `regex`, `checksum`, `hash`, `SHA-256`, `varchar(N)` | Detalhe de implementação | "formato válido", "número válido", "documento íntegro" |
| `is_active`, `is_blocked`, `is_primary` | Nome de campo | "ativo", "bloqueado", "principal" (em prosa) |
| `clico`, `preencho`, `popup`, `modal`, `toast` | Detalhe de UI | "informo", "cadastro", "vejo a mensagem" |
| `enum`, `flag` | Detalhe de tipo | "tipo", "indicador" |

### 5.2 Erros comuns de redação

- **Cenário gigante** com 10+ passos: divida em cenários menores.
- **Múltiplos `Quando`** no mesmo cenário: o segundo é uma pré-condição (`Dado`) ou um cenário separado.
- **Regras de Negócio sem número** ou repetidas: numeração serve para rastrear cenários ↔ regras.
- **`Então` que descreve estado interno** ("o registro fica com flag X"): substitua por efeito observável pelo usuário.
- **Story sem `Para que`**: significa que o valor não foi explicitado.
- **Story dependente de outra para começar**: revise a quebra; talvez seja uma só, ou a divisão está errada.

---

## 6. Checklist de Revisão

Antes de considerar uma user story pronta, percorra esta lista:

**Estrutura**

- [ ] Cabeçalho com identificador (`US-NN`) e título curto
- [ ] Narrativa Como / Quero / Para que
- [ ] Bloco de Regras de Negócio numeradas (`RN-NN.M`)
- [ ] Bloco de Critérios de Aceitação em Gherkin

**INVEST**

- [ ] É independente o suficiente para ser entregue sozinha
- [ ] Está em linguagem de negócio (negociável no "como")
- [ ] Tem valor de negócio claro (papel + benefício)
- [ ] Cabe num sprint
- [ ] Tem critérios objetivos para considerar pronta

**Linguagem**

- [ ] Não há nomes de tabela, coluna, FK, índice, regex, hash
- [ ] Não há `clico`, `preencho`, `endpoint`, `payload`
- [ ] Mensagens de erro entre aspas alinhadas com UX
- [ ] Termos do domínio (linguagem ubíqua) e não jargão técnico

**Cobertura**

- [ ] Pelo menos um cenário de happy path
- [ ] Pelo menos um cenário de exceção por Regra de Negócio relevante
- [ ] Esquema do Cenário aplicado quando há repetição com dados variáveis
- [ ] Cada Regra de Negócio é exemplificada em pelo menos um cenário

---

## 7. Template Pronto

Copie e preencha:

```markdown
### US-NN — <Título curto>

**Como** <papel de negócio>
**Quero** <capacidade ou ação>
**Para que** <valor de negócio>

**Regras de Negócio:**

- RN-NN.1 — <regra única e verificável>
- RN-NN.2 — <regra única e verificável>
- RN-NN.3 — <regra única e verificável>

**Critérios de Aceitação (Gherkin):**

​```gherkin
Cenário: <happy path>
  Dado que <pré-condição>
  Quando <ação de negócio>
  Então <resultado observável>

Cenário: <exceção 1 — ligada a RN-NN.X>
  Quando <ação que viola a regra>
  Então <rejeição ou desvio>
  E vejo a mensagem "<mensagem visível>"

Cenário: <exceção 2 — ligada a RN-NN.Y>
  ...

Esquema do Cenário: <quando há matriz de combinações>
  Quando <ação parametrizada>
  Então <resultado parametrizado>

  Exemplos:
    | parametro_1 | parametro_2 | resultado |
    | ...         | ...         | ...       |
​```

---
```

---

## 8. Glossário rápido

| Termo | Significado |
| --- | --- |
| **User Story** | Descrição curta de uma capacidade do sistema sob a ótica de um papel de negócio. |
| **INVEST** | Acrônimo dos seis atributos de qualidade de uma boa story. |
| **Regra de Negócio (RN)** | Afirmação verificável que governa o comportamento da história. |
| **Gherkin** | Linguagem natural estruturada para descrever cenários (Dado/Quando/Então). |
| **Cenário** | Exemplo concreto de comportamento, geralmente ligado a uma RN. |
| **Esquema do Cenário** | Cenário parametrizado com tabela de exemplos. |
| **Estilo declarativo** | Foco no comportamento de negócio, sem detalhes de UI ou técnicos. |
| **Linguagem ubíqua** | Vocabulário compartilhado entre negócio e técnico (DDD). |
| **Happy path** | Caminho principal de sucesso da história. |
| **Three Amigos** | PO + Dev + QA refinando a story juntos. |
| **Living Documentation** | Documentação executável que vive junto ao código (cenários Gherkin automatizados). |
