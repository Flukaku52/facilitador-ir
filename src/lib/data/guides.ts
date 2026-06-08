import { Guide } from '@/types/guide';

export const GUIDES: Guide[] = [
  {
    slug: 'clt-informe-rendimentos',
    title: 'Trabalho com carteira assinada (CLT)',
    shortDescription: 'Como declarar salário, férias, 13º e usar o informe de rendimentos da empresa.',
    category: 'income',
    appliesTo: ['income.hasCltIncome'],
    plainLanguageExplanation:
      'Se você trabalhou com carteira assinada, sua empresa é obrigada a te entregar um documento chamado "Informe de Rendimentos". Esse papel tem tudo que você recebeu no ano — salário, férias, 13º — e quanto foi descontado de IRRF e INSS. Você vai copiar esses valores direto para a declaração.',
    documentsNeeded: [
      'Informe de rendimentos fornecido pela empresa (disponível no RH ou pelo portal do funcionário)',
      'Se tiver mais de um emprego no ano, informe de cada empregador',
    ],
    whereToDeclare:
      'Rendimentos Tributáveis Recebidos de Pessoa Jurídica (na ficha de rendimentos da declaração).',
    howToFill: [
      'Copie exatamente os valores do informe: rendimentos tributáveis, IRRF retido e INSS descontado.',
      'Se trabalhou em mais de uma empresa no ano, lance cada informe separadamente.',
      'Férias e 13º já estão incluídos no informe — não precisa lançar separado.',
      'Se recebeu rescisão, verifique se há valor de indenização isenta no informe e lance na ficha correta.',
    ],
    commonMistakes: [
      'Não lançar o IRRF retido, perdendo a restituição.',
      'Lançar o valor líquido (já descontado o INSS) em vez do bruto.',
      'Esquecer de declarar segundo emprego ou trabalho temporário.',
      'Não incluir informe de emprego anterior caso tenha mudado de empresa no ano.',
    ],
    whenToCallAccountant: [
      'Rescisão com valores contestados ou pendentes na Justiça do Trabalho.',
      'Participação nos lucros (PLR) com valores expressivos.',
      'Emprego no exterior ou para empresa estrangeira.',
    ],
  },
  {
    slug: 'aposentadoria-pensao',
    title: 'Aposentadoria, pensão e benefícios do INSS',
    shortDescription: 'Como declarar valores recebidos do INSS e outras fontes de previdência social.',
    category: 'income',
    appliesTo: ['income.hasPensionOrRetirement'],
    plainLanguageExplanation:
      'Quem recebe aposentadoria, pensão por morte, auxílio ou qualquer benefício do INSS precisa declarar. O INSS também envia um informe de rendimentos anual. Uma boa notícia: aposentados e pensionistas com mais de 65 anos têm parte dos rendimentos isenta de imposto.',
    documentsNeeded: [
      'Informe de rendimentos do INSS (disponível no Meu INSS — meu.inss.gov.br)',
      'Se receber pensão de outro fundo (como FUNPRESP, militares, etc.), informe desse fundo também',
    ],
    whereToDeclare:
      'Rendimentos Tributáveis Recebidos de Pessoa Jurídica. Se houver parcela isenta (maiores de 65 anos), parte vai para Rendimentos Isentos.',
    howToFill: [
      'Acesse o Meu INSS e baixe o informe de rendimentos do ano.',
      'Lance os valores tributáveis na ficha de rendimentos.',
      'Se tiver mais de 65 anos, parte dos rendimentos é isenta — o próprio informe já separa os valores.',
      'Verifique se houve IRRF retido e lance para não perder restituição.',
    ],
    commonMistakes: [
      'Não declarar por achar que aposentadoria é isenta — só parte é isenta para maiores de 65 anos.',
      'Esquecer de baixar o informe do Meu INSS.',
      'Não informar o IRRF retido.',
    ],
    whenToCallAccountant: [
      'Benefício concedido judicialmente com valores retroativos expressivos.',
      'Recebimento de atrasados do INSS (pode ter tributação específica).',
    ],
  },
  {
    slug: 'contas-bancarias',
    title: 'Contas bancárias',
    shortDescription: 'Como declarar saldos de contas correntes, poupanças, contas digitais e carteiras de pagamento — e como tratar os rendimentos de cada tipo.',
    category: 'bank',
    appliesTo: ['assets.hasBankAccounts'],
    plainLanguageExplanation:
      'Na declaração, o foco é o saldo em 31 de dezembro e os rendimentos informados pela instituição. Em geral, contas com saldo acima do limite mínimo da Receita Federal devem entrar em Bens e Direitos — consulte o informe para saber o que declarar. Isso pode incluir conta corrente, poupança, contas digitais (Nubank, Inter, C6 etc.) e contas de pagamento (Mercado Pago, PicPay etc.). O informe de rendimentos de cada instituição é o documento principal: ele mostra o saldo em 31/12 e já separa os rendimentos por tipo — isento, sujeito à tributação exclusiva na fonte ou sujeito à tabela progressiva. Use sempre os valores do informe, não de memória ou estimativa.',
    documentsNeeded: [
      'Informe de rendimentos de cada banco, conta digital ou carteira de pagamento onde você tinha saldo ou rendimentos no ano (disponível no app, internet banking ou agência)',
      'Extrato de dezembro de cada conta para confirmar o saldo exato em 31/12, caso o informe não liste o saldo',
    ],
    whereToDeclare:
      'Bens e Direitos, código correspondente ao tipo de conta (conta corrente, poupança etc.). Rendimentos vão nas fichas indicadas no próprio informe da instituição.',
    howToFill: [
      'Informe o nome da instituição, agência, número da conta e saldo em 31/12.',
      'Use o valor exato do informe ou extrato — não arredonde.',
      'Conta poupança: informe o saldo em 31/12 conforme o informe ou extrato da instituição. Os rendimentos da poupança são isentos e aparecem em Rendimentos Isentos.',
      'Contas remuneradas (conta corrente com rendimento automático, comum em bancos digitais): declare o saldo em Bens e Direitos e os rendimentos conforme o informe — costumam ser sujeitos a tributação exclusiva na fonte, com imposto já retido.',
      'Contas de pagamento (Mercado Pago, PicPay etc.): se tinha saldo em 31/12, declare em Bens e Direitos; se houve rendimentos, o informe da plataforma indicará a classificação correta.',
      'Se tiver conta conjunta, declare apenas a sua parte do saldo.',
    ],
    commonMistakes: [
      'Declarar o saldo do dia 1º de janeiro em vez de 31 de dezembro.',
      'Não declarar contas digitais (Nubank, Inter, C6 etc.) ou carteiras de pagamento (Mercado Pago, PicPay etc.) por achar que não precisam ser informadas.',
      'Ignorar contas que estavam na declaração anterior, foram encerradas no ano ou tiveram rendimentos informados pela instituição.',
      'Não declarar os rendimentos de contas remuneradas — o saldo vai em Bens e Direitos, mas os rendimentos têm ficha própria indicada no informe.',
    ],
    whenToCallAccountant: [
      'Conta em instituição estrangeira ou carteira digital com saldo em moeda estrangeira (Wise, Revolut, PayPal com saldo em dólar ou euro) — há obrigações declaratórias adicionais.',
      'Rendimentos de contas remuneradas com valores expressivos e dúvida sobre a classificação (isento, exclusivo na fonte ou tributável pela tabela).',
      'Conta conjunta com valores relevantes e divisão do saldo não óbvia entre os titulares.',
    ],
  },
  {
    slug: 'investimentos-renda-fixa',
    title: 'Investimentos de renda fixa',
    shortDescription: 'CDB, Tesouro Direto, LCI, LCA, fundos e outros investimentos com rendimento previsível.',
    category: 'investments',
    appliesTo: ['investments.hasFixedIncome'],
    plainLanguageExplanation:
      'Investimentos de renda fixa como CDB, Tesouro Direto, LCI e LCA precisam ser declarados. Alguns são tributados (CDB, Tesouro) e outros são isentos (LCI, LCA). Sua corretora ou banco envia um informe de rendimentos que já separa tudo isso para você.',
    documentsNeeded: [
      'Informe de rendimentos da corretora ou banco onde tem os investimentos',
      'Posição dos investimentos em 31/12',
    ],
    whereToDeclare:
      'Saldo/posição em 31/12: Bens e Direitos. Rendimentos tributados: Rendimentos Sujeitos à Tributação Exclusiva. Rendimentos isentos (LCI, LCA): Rendimentos Isentos.',
    howToFill: [
      'Use o informe da corretora — ele já separa o que é tributável, isento e o saldo.',
      'Declare o saldo de cada investimento em Bens e Direitos.',
      'Rendimentos de CDB, Tesouro: ficam em Rendimentos Sujeitos à Tributação Exclusiva.',
      'Rendimentos de LCI, LCA: ficam em Rendimentos Isentos.',
      'O imposto já foi retido na fonte — você não precisa pagar mais nada.',
    ],
    commonMistakes: [
      'Confundir onde lançar o saldo (Bens) com onde lançar os rendimentos (Rendimentos).',
      'Não declarar investimentos pequenos ou esquecidos.',
      'Colocar LCI/LCA em tributável em vez de isento.',
    ],
    whenToCallAccountant: [
      'Fundos com come-cotas ou regras especiais de tributação.',
      'Resgate antecipado com IOF.',
    ],
  },
  {
    slug: 'corretora-investimentos',
    title: 'Conta em corretora',
    shortDescription: 'Como organizar e declarar sua conta em corretora de valores.',
    category: 'investments',
    appliesTo: ['assets.hasInvestments'],
    plainLanguageExplanation:
      'Ter conta em corretora significa que você precisa declarar o saldo disponível e todos os ativos que tinha em 31/12. Sua corretora emite um informe de rendimentos anual que é o documento central para isso. Guarde também os documentos de custódia e as notas de corretagem se tiver feito operações.',
    documentsNeeded: [
      'Informe de rendimentos da corretora (emitido até fevereiro)',
      'Notas de corretagem das operações realizadas no ano',
      'Posição de custódia em 31/12',
    ],
    whereToDeclare:
      'Cada ativo em Bens e Direitos. Rendimentos conforme o tipo de ativo.',
    howToFill: [
      'Use o informe da corretora como guia principal.',
      'Declare cada ativo separadamente em Bens e Direitos (ações, FIIs, ETFs, etc.).',
      'O saldo em conta corrente da corretora também é um bem a declarar.',
      'Siga os guias específicos para ações, FIIs e renda fixa.',
    ],
    commonMistakes: [
      'Não declarar o saldo em conta na corretora.',
      'Juntar todos os ativos em um único campo.',
    ],
  },
  {
    slug: 'despesas-medicas',
    title: 'Despesas médicas e plano de saúde',
    shortDescription: 'Médicos, dentistas, psicólogos, fisioterapeutas, hospitais e plano de saúde são dedutíveis.',
    category: 'deductions',
    appliesTo: ['deductions.hasMedicalExpenses'],
    plainLanguageExplanation:
      'Despesas médicas são totalmente dedutíveis — não têm limite de valor. Isso inclui consultas, exames, internações, plano de saúde, dentista, psicólogo e fisioterapeuta. O ponto crítico é que você precisa ter comprovante de tudo: recibo do profissional, nota fiscal ou informe do plano.',
    documentsNeeded: [
      'Recibos ou notas fiscais de cada consulta, exame ou procedimento',
      'Informe de pagamentos do plano de saúde (emitido pela operadora)',
      'Receitas e laudos médicos para embasar as despesas em caso de fiscalização',
    ],
    whereToDeclare:
      'Ficha de Pagamentos Efetuados — Despesas Médicas.',
    howToFill: [
      'Lance cada despesa com nome do profissional, CPF/CNPJ e valor pago.',
      'Para plano de saúde, use o informe da operadora com o total anual.',
      'Despesas pagas por dependentes também são dedutíveis — lance no mesmo campo.',
      'Despesas reembolsadas pelo plano não devem ser declaradas (já foram ressarcidas).',
    ],
    commonMistakes: [
      'Lançar despesas sem ter comprovante — alto risco de malha fina.',
      'Incluir despesas reembolsadas pelo plano de saúde.',
      'Esquecer de incluir despesas dos dependentes.',
      'Não incluir o CPF/CNPJ do prestador.',
    ],
    whenToCallAccountant: [
      'Despesas muito altas que possam chamar atenção.',
      'Procedimentos no exterior.',
      'Despesas de saúde para parentes que não são dependentes na declaração.',
    ],
  },
  {
    slug: 'despesas-educacao',
    title: 'Despesas com educação',
    shortDescription: 'Ensino formal é dedutível até um limite anual por pessoa. Cursos livres, idiomas, material escolar e transporte não entram como dedução.',
    category: 'deductions',
    appliesTo: ['deductions.hasEducationExpenses'],
    plainLanguageExplanation:
      'Educação tem regras mais restritas do que despesas médicas: só parte dos gastos é dedutível e existe um limite anual por pessoa (o valor do limite é divulgado pela Receita Federal a cada ano). O ponto mais importante é saber o que entra e o que não entra. Apenas ensino formal é dedutível — educação infantil, ensino fundamental, médio, técnico ou profissionalizante e superior. Se você teve gastos formais e informais juntos, precisa separar os comprovantes antes de declarar.',
    documentsNeeded: [
      'Informe de pagamentos emitido pela escola, faculdade ou curso técnico',
      'Comprovantes de pagamento das mensalidades do ano',
      'Comprovantes de despesas educacionais dos dependentes, se houver',
    ],
    whereToDeclare:
      'Ficha de Pagamentos Efetuados — Instrução.',
    howToFill: [
      'Separe antes quais despesas são de ensino formal e quais são de cursos livres, idiomas ou aulas particulares — apenas as formais entram na dedução.',
      'Lance somente o total das despesas de ensino formal, respeitando o limite anual por pessoa vigente para o ano-base da declaração.',
      'Inclua o CNPJ da instituição de ensino em cada lançamento.',
      'Despesas educacionais dos dependentes também são dedutíveis — declare cada um separadamente, dentro do limite por pessoa.',
      'Em caso de dúvida sobre a dedutibilidade de um curso, prefira não declarar a arriscar cair em malha fina.',
    ],
    commonMistakes: [
      'Incluir curso livre, idioma, cursinho preparatório, aula particular, material escolar, uniforme ou transporte — nenhum desses é dedutível.',
      'Lançar o valor total gasto sem respeitar o limite anual por pessoa.',
      'Não ter o informe da instituição de ensino — a Receita cruza os dados com as escolas e faculdades.',
      'Esquecer de declarar despesas educacionais dos dependentes.',
    ],
    whenToCallAccountant: [
      'Pós-graduação, especialização, mestrado e doutorado podem ser dedutíveis quando a instituição é autorizada pelo Poder Público — verifique se tem o informe correto de pagamentos antes de declarar.',
      'MBA — o enquadramento depende da instituição e do tipo de curso; consulte um contador para confirmar se é dedutível no seu caso.',
      'Mistura de despesas formais e informais sem comprovantes separados.',
      'Despesas educacionais elevadas, próximas ou acima do limite anual.',
    ],
  },
  {
    slug: 'dependentes',
    title: 'Dependentes',
    shortDescription: 'Filhos, cônjuge, pais e outros dependentes geram dedução e precisam ser declarados.',
    category: 'deductions',
    appliesTo: ['deductions.hasDependents'],
    plainLanguageExplanation:
      'Dependentes reduzem a base de cálculo do imposto e você pode lançar as despesas médicas e educacionais deles. Mas atenção: dependente que teve renda no ano precisa ter essa renda declarada junto — é obrigatório. E filho acima de certa idade deixa de ser dependente automaticamente.',
    documentsNeeded: [
      'CPF dos dependentes (obrigatório para todos, inclusive crianças)',
      'Comprovante de dependência (certidão de nascimento, certidão de casamento, etc.)',
      'Informes de rendimento do dependente, se tiver renda',
    ],
    whereToDeclare:
      'Ficha de Dependentes — incluir cada um com CPF, nome, data de nascimento e grau de parentesco.',
    howToFill: [
      'Inclua cada dependente na ficha específica com todos os dados.',
      'Lance as despesas médicas e educacionais de cada dependente nas fichas de deduções.',
      'Se o dependente tiver renda (estágio, trabalho, aluguel), essa renda deve ser incluída na declaração.',
      'Filho que atingiu a maioridade e não estuda mais geralmente não pode mais ser dependente.',
    ],
    commonMistakes: [
      'Não informar a renda do dependente quando ele tem renda.',
      'Incluir dependente sem ter CPF dele.',
      'Tentar declarar a mesma pessoa como dependente em duas declarações diferentes.',
    ],
    whenToCallAccountant: [
      'Guarda compartilhada — quem pode declarar a criança como dependente?',
      'Dependente com renda expressiva.',
      'Pai ou mãe idoso sendo sustentado financeiramente.',
    ],
  },
  {
    slug: 'imovel-proprio',
    title: 'Imóvel próprio',
    shortDescription: 'Como declarar casa, apartamento, terreno ou sala comercial.',
    category: 'assets',
    appliesTo: ['assets.hasProperty'],
    plainLanguageExplanation:
      'Imóvel precisa ser declarado em Bens e Direitos. O valor informado é o custo de aquisição — não o valor de mercado atual, não o valor do IPTU, não a avaliação do corretor. Uma vez que o imóvel está na sua declaração, o valor não muda enquanto ele estiver lá (a menos que você faça benfeitorias comprovadas).',
    documentsNeeded: [
      'Escritura ou contrato de compra e venda',
      'Comprovante do valor pago (transferência, cheque, boleto)',
      'ITBI e cartório, se comprou no ano',
      'Documentos de benfeitorias, se realizou reformas',
    ],
    whereToDeclare:
      'Bens e Direitos — Grupo 01 (Imóveis), código correspondente ao tipo de imóvel.',
    howToFill: [
      'Descreva o imóvel: endereço completo, matrícula no cartório, inscrição municipal (IPTU).',
      'Informe o valor de aquisição (o que você pagou, não o valor atual).',
      'Inclua ITBI e cartório no custo de aquisição, se aplicável.',
      'Se fez benfeitorias com nota fiscal, pode adicionar ao valor.',
      'Se comprou no ano, informe o valor pago até 31/12.',
    ],
    commonMistakes: [
      'Atualizar o valor do imóvel para o preço de mercado atual — isso é proibido sem tributação.',
      'Não incluir ITBI e cartório no custo de aquisição.',
      'Esquecer de declarar imóvel que está financiado — mesmo financiado, aparece em Bens.',
    ],
    whenToCallAccountant: [
      'Venda de imóvel no ano — há apuração de ganho de capital.',
      'Imóvel comprado em conjunto com outras pessoas.',
      'Imóvel recebido por herança ou doação.',
      'Reforma significativa sem nota fiscal.',
    ],
  },
  {
    slug: 'imovel-financiado',
    title: 'Imóvel financiado',
    shortDescription: 'Declare apenas o valor efetivamente pago até 31/12, não o valor total do imóvel.',
    category: 'assets',
    appliesTo: ['assets.hasFinancedProperty'],
    plainLanguageExplanation:
      'Quando o imóvel é financiado, o valor que vai na declaração acompanha o que você efetivamente pagou — não o preço total do imóvel. Se você pagou R$ 40.000 de entrada e parcelas durante o ano e o imóvel custa R$ 300.000, você declara os R$ 40.000 (ou o acumulado de todos os anos já pagos). Ano a ano, conforme paga, vai atualizando o valor.',
    documentsNeeded: [
      'Contrato de financiamento',
      'Comprovante de entrada paga',
      'Comprovantes das parcelas pagas no ano',
      'Informe do banco financiador (muitos bancos emitem esse documento)',
      'Comprovante de ITBI e cartório, se aplicável',
    ],
    whereToDeclare:
      'Bens e Direitos — Grupo 01 (Imóveis), código correspondente ao tipo de imóvel.',
    howToFill: [
      'Na descrição, informe que é financiado, o banco, o número do contrato e o prazo.',
      'No campo de valor: some o que você efetivamente pagou até 31/12 (entrada + parcelas + ITBI + cartório).',
      'A cada ano, atualize somando o que pagou de parcelas no novo ano.',
      'Não lance o saldo devedor em Dívidas e Ônus Reais quando o próprio imóvel já está em Bens.',
    ],
    commonMistakes: [
      'Declarar o valor total do imóvel logo no primeiro ano.',
      'Esquecer de incluir ITBI, cartório e entrada no custo.',
      'Lançar o saldo devedor separadamente em Dívidas sem necessidade.',
      'Não atualizar o valor do imóvel nos anos seguintes conforme paga as parcelas.',
    ],
    whenToCallAccountant: [
      'Compra com FGTS — tem regras específicas de registro.',
      'Imóvel comprado em conjunto com cônjuge ou terceiros.',
      'Financiamento com entrada via consórcio.',
      'Divergência de valores entre contrato, banco e cartório.',
    ],
  },
  {
    slug: 'veiculo',
    title: 'Veículo',
    shortDescription: 'Como declarar carro, moto, caminhão e outros veículos.',
    category: 'assets',
    appliesTo: ['assets.hasVehicle'],
    plainLanguageExplanation:
      'Veículos devem ser declarados pelo valor de aquisição — o que você pagou. Assim como imóveis, o valor não é atualizado para o preço de mercado. Se vendeu o veículo no ano, precisa tratar a venda corretamente.',
    documentsNeeded: [
      'Documento do veículo (CRLV ou DUT)',
      'Nota fiscal ou contrato de compra, se comprou no ano',
      'Contrato de venda, se vendeu no ano',
    ],
    whereToDeclare:
      'Bens e Direitos — Grupo 02 (Veículos Automotores), código correspondente.',
    howToFill: [
      'Informe marca, modelo, ano e placa do veículo.',
      'Declare pelo valor de aquisição, não pelo preço atual ou tabela FIPE.',
      'Se comprou no ano, use o valor da nota fiscal ou contrato.',
      'Se vendeu o veículo, retire dos Bens e trate a venda — se ganhou dinheiro, pode haver ganho de capital.',
    ],
    commonMistakes: [
      'Atualizar o valor para a tabela FIPE atual.',
      'Esquecer de declarar moto, caminhão ou veículo de lazer (barco, jet ski).',
      'Não tratar a venda corretamente quando o veículo saiu da posse no ano.',
    ],
    whenToCallAccountant: [
      'Venda com ganho de capital expressivo.',
      'Veículo usado para trabalho autônomo (pode ter tratamento diferente).',
    ],
  },
  {
    slug: 'previdencia-privada',
    title: 'Previdência privada (PGBL e VGBL)',
    shortDescription: 'PGBL é dedutível até 12% da renda tributável. VGBL vai em Bens e Direitos.',
    category: 'investments',
    appliesTo: ['deductions.hasPrivatePensionContributions'],
    plainLanguageExplanation:
      'Existem dois tipos de previdência privada e cada um tem tratamento diferente. O PGBL permite deduzir as contribuições do IR agora (até 12% da renda tributável), mas você paga IR quando resgatar. O VGBL não dá dedução agora, mas só paga IR sobre os rendimentos no resgate. É importante saber qual tipo você tem.',
    documentsNeeded: [
      'Informe de contribuições e saldo da seguradora ou banco (emitido até fevereiro)',
      'Tipo do plano (PGBL ou VGBL) — consta no contrato',
    ],
    whereToDeclare:
      'PGBL: contribuições em Pagamentos Efetuados (Previdência Complementar). Saldo de VGBL: em Bens e Direitos.',
    howToFill: [
      'Identifique se é PGBL ou VGBL.',
      'PGBL: lance o total contribuído no ano em Pagamentos Efetuados — respeite o limite de 12% da renda tributável.',
      'VGBL: declare o saldo acumulado em 31/12 em Bens e Direitos.',
      'Se resgatou valores no ano, declare o resgate como rendimento.',
    ],
    commonMistakes: [
      'Confundir PGBL com VGBL e lançar no lugar errado.',
      'Deduzir PGBL além do limite de 12% da renda tributável.',
      'Não declarar o saldo do VGBL em Bens.',
    ],
    whenToCallAccountant: [
      'Resgate antecipado com tributação regressiva ou progressiva.',
      'Portabilidade entre planos.',
      'Plano de previdência de benefício definido (servidores públicos).',
    ],
  },

  // ─── GUIAS DE ALERTA (CASOS COMPLEXOS) ───────────────────────────────────
  {
    slug: 'acoes-fiis-alerta',
    title: 'Ações e FIIs — requer atenção',
    shortDescription: 'Venda de ações e FIIs exige controle mensal, apuração de ganho/prejuízo e pode gerar DARF.',
    category: 'complex_cases',
    appliesTo: ['investments.hasStocks', 'investments.hasFiis', 'investments.soldVariableIncome'],
    isAlert: true,
    plainLanguageExplanation:
      'Declarar ações e FIIs corretamente é um dos pontos mais complexos do IR. Quando você vende ativos, precisa calcular se teve lucro ou prejuízo em cada mês, pagar DARF se teve lucro acima do limite de isenção, e compensar prejuízos de meses anteriores. Erros aqui são frequentes e a Receita cruza os dados com as corretoras.',
    documentsNeeded: [
      'Notas de corretagem de todas as compras e vendas do ano',
      'Informe de rendimentos da corretora (dividendos, JCP)',
      'Posição de custódia em 31/12',
      'DARFs pagos ao longo do ano (se houver)',
    ],
    whereToDeclare:
      'Bens e Direitos (posição em 31/12), Renda Variável (apuração de lucro/prejuízo), Rendimentos Isentos (dividendos de ações), Rendimentos Tributáveis (JCP).',
    howToFill: [
      'Use o informe da corretora como ponto de partida.',
      'Declare cada ativo separadamente em Bens e Direitos com o custo médio de aquisição.',
      'Dividendos de ações são isentos e vão em Rendimentos Isentos.',
      'JCP (Juros sobre Capital Próprio) é tributado na fonte e vai em Rendimentos Sujeitos à Tributação Exclusiva.',
      'Se vendeu ativos, use o módulo de Renda Variável para apurar ganho/prejuízo mês a mês.',
    ],
    commonMistakes: [
      'Não apurar ganho/prejuízo nas vendas realizadas.',
      'Esquecer de pagar DARF quando o lucro excedeu o limite de isenção mensal.',
      'Não compensar prejuízos acumulados de meses anteriores.',
      'Confundir dividendos (isentos) com JCP (tributável).',
    ],
    whenToCallAccountant: [
      'Qualquer operação de venda de renda variável com volume significativo.',
      'Prejuízos acumulados de anos anteriores a compensar.',
      'Operações day trade.',
      'ETFs e BDRs — regras específicas.',
    ],
  },
  {
    slug: 'cripto-alerta',
    title: 'Criptoativos — requer atenção',
    shortDescription: 'Bitcoin, Ethereum e outros criptoativos têm regras próprias de declaração e podem gerar obrigações mensais.',
    category: 'complex_cases',
    appliesTo: ['assets.hasCrypto'],
    isAlert: true,
    plainLanguageExplanation:
      'Criptoativos precisam ser declarados, e as regras são específicas. Você precisa declarar o saldo que tinha em 31/12. Se vendeu ou permutou criptoativos, pode ter ganho de capital tributável. A Receita Federal já recebe informações das exchanges brasileiras — e o cruzamento é feito.',
    documentsNeeded: [
      'Extrato de posição em 31/12 de cada exchange ou carteira',
      'Histórico de transações (compras, vendas, permutas) do ano',
      'Comprovante do custo de aquisição de cada ativo',
    ],
    whereToDeclare:
      'Bens e Direitos — código específico para criptoativos. Ganho de capital: em Ganhos de Capital.',
    howToFill: [
      'Declare cada tipo de criptoativo separadamente (Bitcoin separado de Ethereum, etc.).',
      'Use o custo de aquisição em reais, não o valor atual.',
      'Vendas com ganho podem gerar tributação — verifique os limites vigentes.',
      'Operações em exchanges estrangeiras têm obrigações declaratórias adicionais.',
    ],
    commonMistakes: [
      'Não declarar criptoativos por achar que a Receita não sabe.',
      'Não controlar o custo de aquisição de cada compra.',
      'Tratar permutas (trocar um cripto por outro) como se fossem operações isentas.',
    ],
    whenToCallAccountant: [
      'Qualquer operação de venda ou permuta com volume relevante.',
      'Uso de exchanges estrangeiras.',
      'DeFi, staking, yield farming — regras ainda em definição.',
      'Mineração de criptoativos.',
    ],
  },
  {
    slug: 'aluguel-recebido-alerta',
    title: 'Aluguel recebido — requer atenção',
    shortDescription: 'Aluguel recebido de pessoa física pode exigir carnê-leão mensal e tem tratamento especial.',
    category: 'complex_cases',
    appliesTo: ['income.hasRentIncome'],
    isAlert: true,
    plainLanguageExplanation:
      'Receber aluguel de pessoa física exige carnê-leão — você deve apurar e pagar imposto todo mês, não só na declaração anual. Se o aluguel é pago por empresa (pessoa jurídica), ela retém o IR na fonte. De qualquer forma, o aluguel recebido no ano precisa ser declarado.',
    documentsNeeded: [
      'Recibos de aluguel de todos os meses',
      'Contrato de locação',
      'Comprovantes de pagamento do carnê-leão, se aplicável',
      'Informe de rendimentos da empresa pagadora, se for PJ',
    ],
    whereToDeclare:
      'Rendimentos Tributáveis Recebidos de Pessoa Física (carnê-leão) ou de Pessoa Jurídica, conforme quem pagou o aluguel.',
    howToFill: [
      'Aluguel pago por pessoa física: declare na ficha de Rendimentos Tributáveis de PF/Exterior.',
      'Aluguel pago por empresa: use o informe da empresa como base.',
      'Verifique se há carnê-leão em atraso — pode gerar multa e juros.',
    ],
    commonMistakes: [
      'Não pagar o carnê-leão mensalmente quando o inquilino é pessoa física.',
      'Não declarar o imóvel alugado em Bens e Direitos.',
    ],
    whenToCallAccountant: [
      'Aluguel recebido de pessoa física sem carnê-leão em dia.',
      'Múltiplos imóveis alugados.',
      'Aluguel de imóvel em nome de empresa.',
    ],
  },
  {
    slug: 'exterior-alerta',
    title: 'Bens e rendimentos no exterior — requer atenção',
    shortDescription: 'Contas, imóveis, ações ou renda de fora do Brasil aumentam muito a complexidade da declaração.',
    category: 'complex_cases',
    appliesTo: ['assets.hasForeignAssets'],
    isAlert: true,
    plainLanguageExplanation:
      'Quem tem bens, contas ou investimentos no exterior tem obrigações adicionais. Dependendo do valor, pode ser obrigado a declarar ao Banco Central (CBE). Rendimentos recebidos de fontes no exterior também precisam ser declarados e tributados no Brasil.',
    documentsNeeded: [
      'Extrato de contas bancárias no exterior em 31/12',
      'Posição de investimentos no exterior em 31/12',
      'Comprovantes de renda recebida do exterior',
      'Documentos de imóveis no exterior, se houver',
    ],
    whereToDeclare:
      'Bens e Direitos (bens no exterior), Rendimentos Tributáveis de Pessoa Física/Exterior (rendimentos).',
    howToFill: [
      'Converta todos os valores para reais pela cotação do Banco Central em 31/12.',
      'Verifique a obrigatoriedade de declarar ao Banco Central (CBE) se os ativos somam acima do limite vigente.',
      'Rendimentos do exterior podem ter tributação diferenciada.',
    ],
    commonMistakes: [
      'Não converter para reais corretamente.',
      'Esquecer de verificar a obrigação de CBE.',
      'Não declarar conta no exterior por ser pequena.',
    ],
    whenToCallAccountant: [
      'Qualquer situação com bens ou renda no exterior — recomendação forte.',
    ],
  },
  {
    slug: 'autonomo-freelancer-alerta',
    title: 'Autônomo e freelancer — requer atenção',
    shortDescription: 'Renda de trabalho autônomo pode exigir carnê-leão e tem regras específicas de deduções.',
    category: 'complex_cases',
    appliesTo: ['income.hasSelfEmploymentIncome'],
    isAlert: true,
    plainLanguageExplanation:
      'Quem trabalha como autônomo ou freelancer e recebe de pessoas físicas precisa pagar carnê-leão todo mês sobre esses valores. Renda recebida de empresas costuma ter IR retido na fonte. Autônomos que prestam serviços podem deduzir alguns gastos relacionados à atividade, mas as regras são restritas.',
    documentsNeeded: [
      'Recibos emitidos por você de todos os serviços prestados',
      'Comprovantes de pagamento do carnê-leão, se aplicável',
      'Informes de rendimento das empresas para as quais prestou serviço',
      'Notas fiscais de serviço (RPS), se emitiu',
    ],
    whereToDeclare:
      'Rendimentos Tributáveis de Pessoa Física (carnê-leão) ou de Pessoa Jurídica, conforme quem pagou.',
    howToFill: [
      'Some todas as fontes de renda autônoma recebidas no ano.',
      'Verifique se há carnê-leão em atraso.',
      'Rendimentos recebidos de empresas: use os informes das empresas pagadoras.',
    ],
    commonMistakes: [
      'Não pagar carnê-leão sobre valores recebidos de pessoas físicas.',
      'Misturar renda CLT com renda autônoma sem separar corretamente.',
    ],
    whenToCallAccountant: [
      'Qualquer situação de renda autônoma relevante.',
      'MEI ou empresa aberta para receber os serviços.',
      'Gastos com escritório, equipamentos ou ajudantes a deduzir.',
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
