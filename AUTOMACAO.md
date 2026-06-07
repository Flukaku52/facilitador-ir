# Automação de Dados — IR Facilitador
## Funcionalidade: "Declaração com Poucos Cliques"

**Versão do documento:** 1.0  
**Status:** Proposta técnica para v0.3  
**Autor:** IR Facilitador — Produto & Engenharia

---

## 1. Visão Geral e Limites Técnicos

### O que é possível fazer

| Capacidade | Possível? | Como |
|---|---|---|
| Importar dados de bancos e corretoras automaticamente | ✅ Sim | Open Finance Brasil (API Banco Central) |
| Ler informes de rendimentos em PDF via IA | ✅ Sim | Claude API + upload de arquivo |
| Pré-preencher o perfil tributário sem o usuário digitar nada | ✅ Sim | Combinação das duas acima |
| Calcular imposto a pagar/restituir | ⚠️ Parcialmente | Regras são públicas, mas a responsabilidade é do contribuinte |
| Enviar a declaração diretamente à Receita Federal | ❌ Não | A Receita não tem API pública para terceiros |
| Acessar dados da declaração pré-preenchida do gov.br via API | ❌ Não | Disponível apenas no portal oficial |

### O que o usuário vai experienciar

**Antes desta funcionalidade:**
1. Responder 26 perguntas manualmente
2. Buscar cada documento por conta própria
3. Copiar e preencher no programa da Receita

**Depois desta funcionalidade:**
1. Conectar bancos e corretoras (um clique por instituição)
2. Fazer upload dos PDFs que recebeu por e-mail (arrastar e soltar)
3. Revisar os dados que o app coletou automaticamente
4. Clicar em "Ir para a Declaração Pré-Preenchida" no gov.br e confirmar

**Resultado:** o usuário passa de horas de trabalho para 10–15 minutos de revisão.

---

## 2. Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────────┐
│                        FONTES DE DADOS                          │
│                                                                 │
│  ┌──────────────────┐   ┌──────────────────┐                   │
│  │  Open Finance    │   │  Upload de PDFs  │                   │
│  │  (Banco Central) │   │  (Informes, NFs) │                   │
│  └────────┬─────────┘   └────────┬─────────┘                   │
└───────────┼──────────────────────┼─────────────────────────────┘
            │                      │
            ▼                      ▼
┌───────────────────────────────────────────────────────────────┐
│                    CAMADA DE PROCESSAMENTO                    │
│                                                               │
│  ┌──────────────────────┐   ┌─────────────────────────────┐  │
│  │  Open Finance        │   │  AI Document Processor       │  │
│  │  Adapter             │   │  (Claude API)                │  │
│  │  · extrato bancário  │   │  · OCR + extração estruturada│  │
│  │  · rendimentos       │   │  · validação de valores       │  │
│  │  · investimentos     │   │  · identificação de tipo      │  │
│  └──────────┬───────────┘   └──────────────┬────────────────┘  │
└─────────────┼────────────────────────────────┼─────────────────┘
              │                                │
              ▼                                ▼
┌──────────────────────────────────────────────────────────────┐
│                    MOTOR DE NORMALIZAÇÃO                     │
│                                                              │
│  DataNormalizer: dados brutos → TaxProfile (tipo existente)  │
│  · Mapeamento de campos por fonte                            │
│  · Deduplicação de informes                                  │
│  · Resolução de conflitos (dado mais recente vence)          │
│  · Geração de log de origem por campo                        │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESULTADO FINAL                           │
│                                                             │
│  TaxProfile preenchido automaticamente                      │
│  → Checklist gerado                                         │
│  → Alertas gerados                                          │
│  → Dashboard atualizado                                     │
│  → Link para Declaração Pré-Preenchida no gov.br            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Pilar 1 — Open Finance Brasil

### O que é

O Open Finance Brasil é um sistema regulamentado pelo Banco Central que permite que qualquer aplicativo acesse dados financeiros de qualquer banco ou corretora do Brasil, **com autorização explícita do usuário**. O usuário autoriza dentro do app, e os dados chegam via API padronizada.

Os maiores bancos brasileiros (Itaú, Bradesco, Santander, Caixa, BB, Nubank, Inter, XP, etc.) são **participantes obrigatórios**.

### Dados disponíveis para o IR Facilitador

| Categoria | Dados obtidos | Campo do TaxProfile |
|---|---|---|
| Conta bancária | Saldo, rendimentos de conta, CDB | `investments.hasFixedIncome`, `banks.hasBankAccount` |
| Investimentos | Renda fixa, ações, FIIs, fundos | `investments.*` |
| Previdência privada | PGBL/VGBL, contribuições, saldo | `investments.hasPrivatePension` |
| Seguros | Apólices vigentes | (futuro) |
| Crédito | Não necessário para IR | — |

### Opções de implementação

#### Opção A — Via intermediário (recomendado para MVP)

Usar um agregador Open Finance já homologado pelo Banco Central. O IR Facilitador não precisa se credenciar como participante — o intermediário faz isso.

**Fornecedores disponíveis no Brasil:**

| Fornecedor | Modelo | Contato |
|---|---|---|
| **TecnoSpeed** | API REST, modelo por requisição | tecnospeed.com.br |
| **Belvo** | API REST, modelo SaaS | belvo.com |
| **Pluggy** | API REST, foco em fintechs | pluggy.ai |
| **Openi** | API REST, foco em contabilidade | openi.com.br |

> **Recomendação para começo:** Pluggy ou Belvo. Têm sandbox gratuito e documentação em português.

#### Opção B — Credenciamento direto no Banco Central

Mais controle e menor custo por requisição em escala, mas exige:
- Processo formal de credenciamento (meses)
- Certificado digital ICP-Brasil
- Infraestrutura de segurança certificada

Adequado para a versão escalonada do produto (v1.0+).

### Fluxo de autorização (OAuth 2.0)

```
Usuário clica "Conectar meu banco"
         │
         ▼
App exibe lista de instituições participantes
         │
         ▼
Usuário seleciona instituição e é redirecionado para o banco
         │
         ▼
Banco autentica o usuário (login + biometria/token)
         │
         ▼
Banco exibe tela de consentimento com dados solicitados
         │
         ▼
Usuário aprova → banco retorna access_token para o app
         │
         ▼
App usa access_token para buscar dados (validade: definida pelo usuário, máx. 12 meses)
         │
         ▼
Dados chegam no app → DataNormalizer → TaxProfile
```

### Exemplo de código (via Pluggy)

```typescript
// src/lib/open-finance/pluggy-client.ts

import { PluggyClient } from 'pluggy-sdk';

const client = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
});

// Criar link de conexão para o usuário
export async function createConnectToken(userId: string): Promise<string> {
  const connectToken = await client.createConnectToken(userId);
  return connectToken.accessToken;
}

// Buscar investimentos após conexão autorizada
export async function fetchInvestments(itemId: string) {
  const investments = await client.fetchInvestments(itemId);
  return investments.results;
}

// Buscar rendimentos de conta
export async function fetchTransactions(accountId: string, from: Date, to: Date) {
  const transactions = await client.fetchTransactions(accountId, {
    from: from.toISOString(),
    to: to.toISOString(),
  });
  return transactions.results;
}
```

```typescript
// src/lib/open-finance/normalize-open-finance.ts
import type { TaxProfile } from '@/types/tax-profile';

interface PluggyInvestment {
  type: string;
  subtype: string;
  balance: number;
  annualRate?: number;
}

export function normalizeOpenFinanceData(
  investments: PluggyInvestment[],
  profile: TaxProfile
): Partial<TaxProfile> {
  const patch: Partial<TaxProfile> = {};

  const hasFixedIncome = investments.some(
    (i) => ['CDB', 'LCI', 'LCA', 'TESOURO_DIRETO', 'POUPANCA'].includes(i.subtype)
  );
  const hasStocks = investments.some((i) => i.type === 'EQUITY');
  const hasFiis = investments.some((i) => i.subtype === 'FII');
  const hasPension = investments.some((i) => i.type === 'PRIVATE_PENSION');

  if (hasFixedIncome) patch.investments = { ...profile.investments, hasFixedIncome: true };
  if (hasStocks) patch.investments = { ...patch.investments, hasStocks: true };
  if (hasFiis) patch.investments = { ...patch.investments, hasFiis: true };
  if (hasPension) patch.investments = { ...patch.investments, hasPrivatePension: true };

  return patch;
}
```

### Variáveis de ambiente necessárias

```bash
# .env.local
PLUGGY_CLIENT_ID=seu_client_id
PLUGGY_CLIENT_SECRET=seu_client_secret
NEXT_PUBLIC_PLUGGY_ENV=sandbox # ou production
```

---

## 4. Pilar 2 — Leitura de Documentos com IA (Claude API)

### O que é

O usuário arrasta e solta os PDFs que recebe dos empregadores, bancos e INSS. O app usa a Claude API para ler o documento, identificar o tipo e extrair os campos relevantes de forma estruturada.

### Documentos suportados

| Documento | Campos extraídos | Mapeamento no TaxProfile |
|---|---|---|
| Informe de rendimentos (empresa CLT) | CNPJ, rendimentos tributáveis, IRRF, INSS | `income.hasCltIncome = true` + valores |
| Informe de rendimentos (INSS) | Benefício, rendimentos, IRRF | `income.hasPensionOrRetirement = true` |
| Informe bancário | Rendimentos de conta, CDB, poupança | `investments.hasFixedIncome = true` |
| Informe de corretora | Ações, FIIs, rendimentos, IR retido | `investments.hasStocks`, `hasFiis` |
| Informe de previdência | PGBL/VGBL, contribuições, resgates | `investments.hasPrivatePension = true` |
| Recibos médicos / NF saúde | Valor, CNPJ do prestador, tipo de serviço | `deductions.hasMedicalExpenses = true` |
| Recibos de educação | Valor, CNPJ da instituição | `deductions.hasEducationExpenses = true` |
| Comprovante de aluguel recebido | Valor mensal, CPF/CNPJ do locatário | `income.hasRentIncome = true` |

### Estrutura da integração

```typescript
// src/lib/ai/document-processor.ts

interface ExtractedDocumentData {
  documentType: DocumentType;
  confidence: number; // 0 a 1
  extractedFields: Record<string, string | number | boolean>;
  rawText: string;
  warnings: string[]; // ex: "campo CNPJ ilegível"
}

type DocumentType =
  | 'clt_informe'
  | 'inss_informe'
  | 'bank_informe'
  | 'broker_informe'
  | 'pension_informe'
  | 'medical_receipt'
  | 'education_receipt'
  | 'rent_receipt'
  | 'unknown';

export async function processDocument(
  fileBase64: string,
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png'
): Promise<ExtractedDocumentData> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: fileBase64,
              },
            },
            {
              type: 'text',
              text: 'Extraia as informações deste documento fiscal brasileiro conforme as instruções do sistema. Retorne apenas JSON válido, sem texto adicional.',
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content.map((b: { type: string; text?: string }) => b.text || '').join('');

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as ExtractedDocumentData;
  } catch {
    return {
      documentType: 'unknown',
      confidence: 0,
      extractedFields: {},
      rawText: text,
      warnings: ['Falha ao parsear resposta da IA'],
    };
  }
}
```

### System Prompt para extração de documentos

```typescript
// src/lib/ai/prompts/document-extraction.ts

export const DOCUMENT_EXTRACTION_SYSTEM_PROMPT = `
Você é um especialista em documentos fiscais brasileiros para declaração do Imposto de Renda Pessoa Física (DIRPF).

Sua tarefa é ler o documento fornecido e retornar APENAS um objeto JSON com a seguinte estrutura:

{
  "documentType": "<tipo conforme lista abaixo>",
  "confidence": <número de 0 a 1 indicando sua confiança na extração>,
  "extractedFields": {
    "<nome_do_campo>": "<valor extraído>"
  },
  "rawText": "<primeiros 500 caracteres do texto do documento>",
  "warnings": ["<aviso 1>", "<aviso 2>"]
}

TIPOS DE DOCUMENTOS E CAMPOS ESPERADOS:

"clt_informe" — Informe de Rendimentos de empresa para empregado CLT
  Campos: cnpj_fonte, razao_social_fonte, cpf_beneficiario, nome_beneficiario,
          rendimentos_tributaveis, deducoes_inss, irrf_retido, decimo_terceiro,
          ferias_indenizadas, rendimentos_isentos, ano_base

"inss_informe" — Informe de Rendimentos do INSS (aposentadoria, pensão)
  Campos: nb_beneficio, tipo_beneficio, cpf_beneficiario, nome_beneficiario,
          rendimentos_tributaveis, rendimentos_isentos, irrf_retido, ano_base

"bank_informe" — Informe de Rendimentos bancário (banco, fintech)
  Campos: cnpj_instituicao, nome_instituicao, cpf_titular, agencia, conta,
          rendimentos_cdb, rendimentos_poupanca, rendimentos_lci_lca,
          ir_retido_fonte, saldo_31_12, ano_base

"broker_informe" — Informe de Rendimentos de corretora
  Campos: cnpj_corretora, nome_corretora, cpf_titular,
          dividendos_acoes, rendimentos_fiis, jcp, ir_retido_fonte,
          posicao_acoes_31_12, posicao_fiis_31_12, vendas_realizadas, ano_base

"pension_informe" — Informe de previdência privada (PGBL/VGBL)
  Campos: cnpj_seguradora, nome_seguradora, cpf_titular, tipo_plano,
          contribuicoes_ano, resgates_ano, saldo_31_12, ir_retido, ano_base

"medical_receipt" — Recibo ou nota fiscal de serviço médico/saúde
  Campos: cnpj_prestador, nome_prestador, cpf_paciente, nome_paciente,
          valor_total, tipo_servico, data_servico, numero_documento

"education_receipt" — Recibo ou nota fiscal de educação
  Campos: cnpj_instituicao, nome_instituicao, cpf_aluno, nome_aluno,
          valor_total, tipo_ensino, ano_referencia

"rent_receipt" — Comprovante de recebimento de aluguel
  Campos: cpf_cnpj_locatario, nome_locatario, cpf_locador,
          endereco_imovel, valor_mensal, mes_referencia

"unknown" — Documento não identificado ou não relacionado ao IR

REGRAS IMPORTANTES:
- Retorne SOMENTE o JSON, sem texto antes ou depois, sem markdown
- Se um campo não estiver visível ou legível, omita-o do objeto extractedFields
- Valores monetários devem ser números (ex: 15234.50), sem R$ ou vírgulas
- Datas no formato ISO (YYYY-MM-DD)
- Se o documento parecer ser de um tipo mas estiver ilegível, use confidence abaixo de 0.5
- Adicione warnings para campos importantes que não puderam ser lidos
`;
```

### Componente de upload no frontend

```typescript
// src/components/features/DocumentUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { processDocument } from '@/lib/ai/document-processor';
import { applyDocumentToProfile } from '@/lib/ai/document-to-profile';
import type { TaxProfile } from '@/types/tax-profile';

interface Props {
  profile: TaxProfile;
  onProfileUpdated: (updated: TaxProfile) => void;
}

interface UploadedDoc {
  fileName: string;
  status: 'processing' | 'success' | 'error';
  documentType?: string;
  fieldsFound?: number;
  errorMessage?: string;
}

export function DocumentUploader({ profile, onProfileUpdated }: Props) {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        // Validação básica
        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
          setUploadedDocs((prev) => [
            ...prev,
            { fileName: file.name, status: 'error', errorMessage: 'Formato não suportado. Use PDF, JPG ou PNG.' },
          ]);
          continue;
        }

        setUploadedDocs((prev) => [...prev, { fileName: file.name, status: 'processing' }]);

        try {
          // Converter para base64
          const base64 = await fileToBase64(file);

          // Processar com Claude API
          const extracted = await processDocument(base64, file.type as 'application/pdf' | 'image/jpeg' | 'image/png');

          // Aplicar ao perfil
          const updatedProfile = applyDocumentToProfile(extracted, profile);
          onProfileUpdated(updatedProfile);

          setUploadedDocs((prev) =>
            prev.map((d) =>
              d.fileName === file.name
                ? {
                    ...d,
                    status: 'success',
                    documentType: extracted.documentType,
                    fieldsFound: Object.keys(extracted.extractedFields).length,
                  }
                : d
            )
          );
        } catch (err) {
          setUploadedDocs((prev) =>
            prev.map((d) =>
              d.fileName === file.name
                ? { ...d, status: 'error', errorMessage: 'Erro ao processar documento.' }
                : d
            )
          );
        }
      }
    },
    [profile, onProfileUpdated]
  );

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <label
        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <span className="text-4xl mb-2">📄</span>
        <p className="text-indigo-700 font-medium">Solte seus informes aqui</p>
        <p className="text-gray-500 text-sm">ou clique para selecionar</p>
        <p className="text-gray-400 text-xs mt-1">PDF, JPG ou PNG</p>
        <input
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </label>

      {/* Lista de documentos processados */}
      {uploadedDocs.map((doc, i) => (
        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
          doc.status === 'success' ? 'border-green-200 bg-green-50' :
          doc.status === 'error' ? 'border-red-200 bg-red-50' :
          'border-gray-200 bg-gray-50'
        }`}>
          <span>{doc.status === 'processing' ? '⏳' : doc.status === 'success' ? '✅' : '❌'}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{doc.fileName}</p>
            {doc.status === 'success' && (
              <p className="text-xs text-green-700">
                {DOCUMENT_TYPE_LABELS[doc.documentType ?? 'unknown']} · {doc.fieldsFound} campos identificados
              </p>
            )}
            {doc.status === 'error' && (
              <p className="text-xs text-red-700">{doc.errorMessage}</p>
            )}
            {doc.status === 'processing' && (
              <p className="text-xs text-gray-500">Lendo documento com IA...</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  clt_informe: 'Informe CLT',
  inss_informe: 'Informe INSS',
  bank_informe: 'Informe Bancário',
  broker_informe: 'Informe de Corretora',
  pension_informe: 'Informe de Previdência',
  medical_receipt: 'Recibo Médico',
  education_receipt: 'Recibo de Educação',
  rent_receipt: 'Comprovante de Aluguel',
  unknown: 'Documento não identificado',
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## 5. Normalização: Dados Brutos → TaxProfile

```typescript
// src/lib/ai/document-to-profile.ts

import type { TaxProfile } from '@/types/tax-profile';
import type { ExtractedDocumentData } from './document-processor';

export function applyDocumentToProfile(
  extracted: ExtractedDocumentData,
  currentProfile: TaxProfile
): TaxProfile {
  // Confiança mínima para aplicar automaticamente
  if (extracted.confidence < 0.6) return currentProfile;

  const f = extracted.extractedFields;
  const updated = structuredClone(currentProfile);

  switch (extracted.documentType) {
    case 'clt_informe':
      updated.income.hasCltIncome = true;
      if (f.rendimentos_tributaveis) updated.income.cltGrossIncome = Number(f.rendimentos_tributaveis);
      if (f.irrf_retido) updated.income.cltIrrfRetained = Number(f.irrf_retido);
      break;

    case 'inss_informe':
      updated.income.hasPensionOrRetirement = true;
      break;

    case 'bank_informe':
      updated.investments.hasFixedIncome =
        updated.investments.hasFixedIncome ||
        Number(f.rendimentos_cdb ?? 0) > 0 ||
        Number(f.rendimentos_poupanca ?? 0) > 0;
      break;

    case 'broker_informe':
      if (Number(f.posicao_acoes_31_12 ?? 0) > 0) updated.investments.hasStocks = true;
      if (Number(f.posicao_fiis_31_12 ?? 0) > 0) updated.investments.hasFiis = true;
      if (Number(f.vendas_realizadas ?? 0) > 0) updated.investments.soldVariableIncome = true;
      break;

    case 'pension_informe':
      updated.investments.hasPrivatePension = true;
      updated.investments.hasPrivatePensionContributions =
        Number(f.contribuicoes_ano ?? 0) > 0;
      break;

    case 'medical_receipt':
      updated.deductions.hasMedicalExpenses = true;
      break;

    case 'education_receipt':
      updated.deductions.hasEducationExpenses = true;
      break;

    case 'rent_receipt':
      updated.income.hasRentIncome = true;
      break;
  }

  // Registrar origem dos dados (para rastreabilidade)
  updated.dataSources = [
    ...(updated.dataSources ?? []),
    {
      type: 'document_upload',
      documentType: extracted.documentType,
      processedAt: new Date().toISOString(),
    },
  ];

  return updated;
}
```

---

## 6. Pilar 3 — Ponte para a Declaração Pré-Preenchida do Gov.br

### Por que esta é a abordagem correta

A Receita Federal não tem API pública para envio de declarações por terceiros. Mas tem a **Declaração Pré-Preenchida** no portal gov.br, que já importa automaticamente dados de informes enviados por empresas, bancos e corretoras.

A estratégia é: o IR Facilitador faz o trabalho de organização e validação, e quando o usuário estiver pronto, o app abre o gov.br já direcionado para a pré-preenchida.

### Fluxo de entrega

```
Usuário clica "Estou pronto para declarar"
         │
         ▼
App exibe checklist final de revisão:
  ✅ Dados coletados automaticamente
  ⚠️ Campos que precisam de atenção manual
  ℹ️ O que verificar na declaração pré-preenchida
         │
         ▼
App abre: https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda
         │
         ▼
Usuário faz login com conta gov.br (prata ou ouro)
         │
         ▼
Receita carrega a declaração pré-preenchida com dados que ela já tem
         │
         ▼
Usuário usa o relatório do IR Facilitador para preencher o que faltou
         │
         ▼
Usuário revisa e envia
```

### Componente de entrega final

```typescript
// src/components/features/DeclarationReadyPanel.tsx
'use client';

import type { TaxProfile } from '@/types/tax-profile';
import { generateAlerts } from '@/lib/rules/tax-rules';

interface Props {
  profile: TaxProfile;
}

const GOV_BR_URL = 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda';

export function DeclarationReadyPanel({ profile }: Props) {
  const alerts = generateAlerts(profile);
  const dangerAlerts = alerts.filter((a) => a.severity === 'danger');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  const isReadyToSend = dangerAlerts.length === 0;

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border-2 ${isReadyToSend ? 'border-green-400 bg-green-50' : 'border-yellow-400 bg-yellow-50'}`}>
        <h2 className="text-lg font-bold">
          {isReadyToSend ? '✅ Você está pronto para declarar!' : '⚠️ Revise antes de declarar'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isReadyToSend
            ? 'Seus dados foram organizados. Acesse o gov.br para revisar e enviar sua declaração pré-preenchida.'
            : `Encontramos ${dangerAlerts.length} ponto(s) que precisam de atenção antes de enviar.`}
        </p>
      </div>

      {/* Alertas críticos */}
      {dangerAlerts.map((alert) => (
        <div key={alert.id} className="p-4 rounded-lg border border-red-300 bg-red-50">
          <p className="font-semibold text-red-800">🚨 {alert.title}</p>
          <p className="text-sm text-red-700 mt-1">{alert.message}</p>
        </div>
      ))}

      {/* O que verificar na pré-preenchida */}
      <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50">
        <h3 className="font-semibold text-indigo-800 mb-2">O que conferir no gov.br:</h3>
        <ul className="space-y-1 text-sm text-indigo-700">
          {warningAlerts.map((a) => (
            <li key={a.id}>⚠️ {a.title}</li>
          ))}
          <li>📋 Compare os valores com os informes de rendimentos</li>
          <li>🏦 Confirme o saldo das contas bancárias em 31/12</li>
          <li>👶 Verifique dados e CPF dos dependentes</li>
        </ul>
      </div>

      {/* Botão principal */}
      <a
        href={GOV_BR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-colors"
      >
        Ir para a Declaração Pré-Preenchida →
      </a>

      <p className="text-xs text-gray-500 text-center">
        Você será redirecionado para o portal oficial da Receita Federal (gov.br).
        É necessário ter conta gov.br nível prata ou ouro.
      </p>
    </div>
  );
}
```

---

## 7. Nova Página — `/importar`

### Objetivo

Centralizar as duas formas de importação automática de dados em um único lugar, com experiência simples.

### Estrutura da página

```
/importar
│
├── Seção 1: Conectar bancos e corretoras (Open Finance)
│   ├── Lista de bancos conectados (com ícone e status)
│   ├── Botão "+ Conectar banco"
│   └── Botão "+ Conectar corretora"
│
├── Seção 2: Enviar informes e documentos
│   ├── Zona de drag-and-drop
│   ├── Lista de documentos processados (com status)
│   └── Botão "Processar documentos"
│
├── Seção 3: Resumo do que foi encontrado
│   ├── Campos preenchidos automaticamente
│   ├── Campos que precisam de revisão
│   └── Campos que precisam ser preenchidos manualmente
│
└── CTA: "Revisar meu perfil completo →" → /dashboard
```

### Fluxo completo do usuário

```
/               → Landing page
    ↓ clica em "Começar"
/importar       → Conectar bancos + enviar PDFs
    ↓ dados coletados automaticamente
/dashboard      → Revisar perfil, complexidade, alertas
    ↓
/checklist      → Confirmar documentos que ainda faltam
    ↓
/relatorio      → Ver resumo + ir para gov.br
    ↓
gov.br          → Revisar declaração pré-preenchida + enviar
```

---

## 8. Alterações no TaxProfile

Para suportar a automação, o tipo `TaxProfile` precisa de novos campos:

```typescript
// src/types/tax-profile.ts — adições

interface TaxProfile {
  // ... campos existentes ...

  // NOVO: Valores numéricos capturados automaticamente
  income: {
    // ... campos existentes ...
    cltGrossIncome?: number;         // R$ rendimentos tributáveis CLT
    cltIrrfRetained?: number;        // R$ IRRF retido na fonte CLT
    inssDeduction?: number;          // R$ dedução INSS
    rentIncomeMonthly?: number;      // R$ aluguel recebido por mês
    selfEmploymentIncome?: number;   // R$ renda autônoma total
  };

  investments: {
    // ... campos existentes ...
    hasPrivatePension?: boolean;     // campo que faltava
    fixedIncomeBalance?: number;     // R$ saldo renda fixa em 31/12
    stocksBalance?: number;          // R$ posição em ações em 31/12
    fiisBalance?: number;            // R$ posição em FIIs em 31/12
  };

  // NOVO: Rastreabilidade das fontes de dados
  dataSources?: Array<{
    type: 'manual' | 'open_finance' | 'document_upload';
    documentType?: string;
    institutionName?: string;
    processedAt: string; // ISO date
  }>;

  // NOVO: Campos com dados de origem automática
  autoFilledFields?: string[]; // dot-notation, ex: ["income.hasCltIncome", "investments.hasStocks"]
}
```

---

## 9. Considerações de Segurança e Privacidade

### Dados via Open Finance

- O app nunca armazena tokens de acesso bancário em `localStorage` — apenas no banco de dados do servidor (Supabase, criptografado)
- Tokens têm validade definida pelo usuário (máximo 12 meses, podendo revogar a qualquer momento)
- O IR Facilitador só solicita permissões de **leitura** — nunca movimentação financeira
- Apresentar tela clara de consentimento antes de iniciar o fluxo OAuth

### Dados de documentos

- PDFs enviados para a Claude API não são armazenados pela Anthropic após o processamento (zero data retention disponível para clientes API)
- Não armazenar os PDFs originais no servidor — apenas os campos extraídos
- Exibir aviso claro: "Seus documentos são processados e descartados. Apenas as informações relevantes são salvas."

### LGPD

- Adicionar tela de consentimento explícito antes de conectar Open Finance ou enviar documentos
- Implementar endpoint de exclusão de dados: `DELETE /api/user/data`
- Documentar no `/privacidade` quais dados são coletados por cada fonte

---

## 10. Roadmap de Implementação

### Fase 1 — Leitura de Documentos (2–3 semanas)

| Tarefa | Dependência |
|---|---|
| Integrar Claude API no backend (API Route Next.js) | Chave API Anthropic |
| Criar system prompt de extração e testar com ~20 documentos reais | — |
| Implementar componente DocumentUploader | — |
| Implementar `applyDocumentToProfile` | — |
| Criar página `/importar` (seção de upload) | — |
| Testes: cada tipo de documento com amostras reais | — |

### Fase 2 — Open Finance (3–4 semanas)

| Tarefa | Dependência |
|---|---|
| Criar conta sandbox no Pluggy (ou Belvo) | — |
| Implementar fluxo OAuth de conexão de conta | Conta sandbox |
| Implementar `fetchInvestments` e `normalizeOpenFinanceData` | — |
| Adicionar seção de bancos conectados na página `/importar` | — |
| Testes com contas sandbox de Itaú, Nubank, XP | Conta sandbox |
| Migrar para produção (requer KYC no fornecedor) | Documentos da empresa |

### Fase 3 — Ponte gov.br e refinamentos (1–2 semanas)

| Tarefa | Dependência |
|---|---|
| Implementar `DeclarationReadyPanel` | Fases 1 e 2 |
| Atualizar relatório com seção "Como usar no gov.br" | — |
| Adicionar rastreabilidade de campos auto-preenchidos na UI | — |
| Telas de consentimento LGPD para cada fonte | — |
| Política de privacidade atualizada em `/privacidade` | — |

---

## 11. Variáveis de Ambiente (versão completa)

```bash
# .env.local

# Anthropic — Leitura de documentos
ANTHROPIC_API_KEY=sk-ant-...

# Open Finance — escolha um provedor
PLUGGY_CLIENT_ID=...
PLUGGY_CLIENT_SECRET=...

# Supabase — persistência na nuvem (da melhoria 3.4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Configurações da aplicação
NEXT_PUBLIC_TAX_YEAR=2025
NEXT_PUBLIC_GOV_BR_IR_URL=https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda
```

---

## Aviso Legal

Esta funcionalidade usa inteligência artificial para ler documentos e APIs regulamentadas para importar dados financeiros. Os dados extraídos são sugestões automáticas que **devem ser revisados pelo contribuinte** antes do envio à Receita Federal. O IR Facilitador não se responsabiliza por erros na extração de documentos ou por divergências entre os dados importados e os documentos originais. A declaração do IRPF é de responsabilidade exclusiva do contribuinte.
