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
    shortDescription: 'Como declarar CDB, Tesouro Direto, LCI, LCA, CRI, CRA, debêntures, fundos e outros investimentos de renda fixa.',
    category: 'investments',
    appliesTo: ['investments.hasFixedIncome'],
    plainLanguageExplanation:
      'Investimentos de renda fixa — como CDB, Tesouro Direto, LCI, LCA, CRI, CRA, debêntures e fundos de renda fixa — podem precisar ser informados na declaração, conforme o informe da instituição e as regras aplicáveis. Cada produto pode ter tratamento diferente: alguns têm rendimentos tributáveis (com IR retido na fonte pelo banco ou corretora), outros podem ter rendimentos isentos ou com regras específicas conforme o tipo e as condições do produto. O informe de rendimentos emitido pela sua instituição financeira ou corretora é o documento principal — ele já traz os valores separados por tipo de rendimento e a posição em 31/12. Siga sempre o informe para saber o que declarar em cada ficha.',
    documentsNeeded: [
      'Informe de rendimentos de cada banco ou corretora onde tem investimentos, conforme disponibilizado pela instituição.',
      'Extrato ou posição dos investimentos em 31/12, se o informe não detalhar cada produto individualmente',
      'Comprovante de resgate antecipado ou encerramento, se vendeu ou resgatou algum produto antes do vencimento',
    ],
    whereToDeclare:
      'Posição em 31/12: Bens e Direitos (cada produto separado ou agrupado conforme orientação do informe). Rendimentos de aplicações financeiras tributados na fonte: Rendimentos Sujeitos à Tributação Exclusiva/Definitiva. Rendimentos isentos: Rendimentos Isentos e Não Tributáveis. Fundos: conforme a categoria indicada no informe.',
    howToFill: [
      'Baixe o informe de rendimentos de cada instituição onde tem investimentos — ele é a fonte oficial para o preenchimento.',
      'Declare a posição de cada investimento em 31/12 em Bens e Direitos, usando os valores e descrições do informe.',
      'Para rendimentos que o informe classificar como tributados na fonte, lance na ficha de Rendimentos Sujeitos à Tributação Exclusiva/Definitiva, conforme indicado no informe.',
      'Para rendimentos que o informe classificar como isentos (como alguns LCI, LCA, CRI, CRA ou debêntures incentivadas), lance em Rendimentos Isentos e Não Tributáveis.',
      'Para fundos de investimento, o informe indica a categoria do rendimento — siga as instruções do informe sem reclassificar por conta própria.',
      'Se o informe indicar imposto retido na fonte, transcreva os valores conforme o informe, sem tentar recalcular ou compensar por conta própria.',
      'Se resgatou ou venceu algum produto durante o ano, verifique se o valor e o rendimento aparecem no informe e declare conforme indicado.',
    ],
    commonMistakes: [
      'Declarar apenas a posição em Bens e Direitos sem informar os rendimentos — são fichas diferentes.',
      'Classificar rendimentos como isentos ou tributáveis por conta própria sem seguir o informe — o enquadramento correto depende do produto e das condições.',
      'Não declarar investimentos pequenos ou esquecidos em outras instituições.',
      'Ignorar rendimentos de fundos com come-cotas — o imposto é retido semestralmente pelo fundo, mas os valores precisam constar na declaração.',
      'Não consolidar todos os informes quando tem investimentos em mais de uma corretora ou banco.',
      'Declarar o saldo atual do investimento em vez da posição em 31/12 do ano-base.',
    ],
    whenToCallAccountant: [
      'Tem fundos com tributação especial (come-cotas, fundos fechados ou de previdência) e dificuldade de interpretar o informe.',
      'Resgatou produtos antes do vencimento e não sabe se há IOF, ajuste ou imposto adicional a considerar.',
      'Tem investimentos em mais de uma corretora e os informes apresentam divergências ou valores inconsistentes.',
      'Recebeu rendimentos de debêntures, CRI ou CRA e tem dúvida sobre o enquadramento fiscal correto.',
      'Migrou investimentos entre corretoras e não sabe como declarar o custo de aquisição.',
      'O informe de rendimentos está incompleto, desatualizado ou você não consegue obtê-lo.',
    ],
  },
  {
    slug: 'corretora-investimentos',
    title: 'Conta em corretora',
    shortDescription: 'Como organizar os informes de corretora e entender onde cada tipo de investimento aparece na declaração — ações, FIIs, ETFs, renda fixa e outros.',
    category: 'investments',
    appliesTo: ['assets.hasInvestments'],
    plainLanguageExplanation:
      'A corretora é a porta de entrada para vários tipos de investimento, mas cada ativo tem tratamento diferente na declaração. O informe anual de rendimentos é o documento central — ele traz a posição dos ativos em 31/12, os rendimentos do ano e os dados para preencher Bens e Direitos. Mas o informe não resolve tudo: se você vendeu ativos, pode precisar apurar ganho ou prejuízo e pagar DARF separadamente. Confira se tem informe de todas as corretoras que usou no ano, incluindo as que não usa mais.',
    documentsNeeded: [
      'Informe de rendimentos de cada corretora usada no ano (emitido geralmente até o final de fevereiro)',
      'Posição de custódia em 31/12 de cada corretora',
      'Notas de corretagem das operações de compra e venda realizadas no ano',
      'Comprovantes de DARF pagos ao longo do ano, se houve imposto a recolher sobre renda variável',
      'Extratos auxiliares ou relatório de operações, se o informe estiver incompleto ou não disponível',
    ],
    whereToDeclare:
      'Cada ativo separadamente em Bens e Direitos. Rendimentos declarados conforme o tipo de ativo — dividendos, JCP, rendimentos de renda fixa e ganhos de capital têm fichas próprias.',
    howToFill: [
      'Baixe o informe de rendimentos de cada corretora que usou durante o ano — inclusive de corretoras que não usa mais, se tinha ativos ou operou nelas.',
      'Confira a posição de custódia em 31/12: liste todos os ativos que você tinha e seus valores de aquisição.',
      'Separe os ativos por tipo: renda fixa, ações, FIIs, ETFs, fundos e outros — cada um pode ter tratamento diferente na declaração.',
      'Use os guias específicos para cada tipo de ativo: ações e FIIs têm apuração de ganho/prejuízo; renda fixa tem rendimentos tributáveis ou isentos; ETFs seguem regras próprias.',
      'Não declare tudo como "saldo em corretora" — cada ativo vai em um campo separado em Bens e Direitos.',
      'Se houve venda de qualquer ativo de renda variável durante o ano, verifique se há imposto a apurar e se os DARFs correspondentes foram pagos.',
    ],
    commonMistakes: [
      'Declarar apenas o saldo disponível na conta e esquecer os ativos (ações, FIIs, renda fixa etc.) que estavam na custódia.',
      'Juntar todos os ativos em um único campo em vez de declarar cada um separadamente.',
      'Esquecer corretoras que não usa mais, mas onde tinha ativos ou realizou operações durante o ano.',
      'Ignorar as notas de corretagem de vendas realizadas — são necessárias para apurar ganho ou prejuízo.',
      'Achar que o informe da corretora resolve sozinho as operações de venda — ele não calcula o imposto devido em renda variável.',
      'Esquecer DARFs pagos ao longo do ano ou prejuízos acumulados que podem ser compensados em períodos futuros.',
    ],
    whenToCallAccountant: [
      'Vendeu ações, FIIs, ETFs ou outros ativos de renda variável durante o ano — há apuração de ganho/prejuízo e possível DARF a verificar.',
      'Realizou operações de day trade.',
      'Tem prejuízos de anos anteriores a compensar.',
      'Pagou ou deveria ter pago DARF e tem dúvida sobre o valor ou prazo correto.',
      'Usou corretora estrangeira ou operou em bolsa no exterior.',
      'O informe da corretora está incompleto, com valores divergentes ou não foi emitido.',
      'Transferiu custódia de ativos entre corretoras durante o ano.',
      'Tem grande volume de operações ou muitos tipos de ativos diferentes.',
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
      'Quando o imóvel é financiado, o valor que vai na declaração acompanha o que você efetivamente pagou — não o preço total do imóvel. Declara-se o valor acumulado de entrada e parcelas pagas até 31/12 do ano-base. Ano a ano, conforme paga, vai atualizando o valor na declaração.',
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
    shortDescription: 'Como declarar veículos em Bens e Direitos — compra, posse, venda, financiamento e documentos necessários.',
    category: 'assets',
    appliesTo: ['assets.hasVehicle'],
    plainLanguageExplanation:
      'Carro, moto, caminhão e outros veículos entram em Bens e Direitos pelo valor de aquisição — o que você pagou, não o valor atual nem a tabela FIPE. A declaração deve contar a história do bem: se já era seu e permaneceu, se comprou no ano, se vendeu, se está financiado ou se quitou. Se vendeu o veículo por um valor maior do que o custo registrado, pode haver ganho de capital a avaliar — nesse caso, consulte um contador antes de declarar.',
    documentsNeeded: [
      'Documento do veículo (CRLV ou DUT)',
      'Nota fiscal, recibo ou contrato de compra, se adquiriu no ano',
      'Comprovantes de pagamento da compra (transferência, cheque, boleto)',
      'Contrato de financiamento e comprovantes das parcelas pagas, se houver',
      'Recibo ou contrato de venda e dados do comprador, se vendeu no ano',
      'Documentos de transferência (DETRAN), se aplicável',
      'Comprovante de indenização da seguradora, se o veículo foi sinistrado',
    ],
    whereToDeclare:
      'Bens e Direitos — Grupo 02 (Bens Móveis), tipo/código de veículo automotor, conforme o programa da Receita.',
    howToFill: [
      'Informe marca, modelo, ano de fabricação, placa e número do Renavam na descrição do bem.',
      'Use sempre o custo de aquisição — o valor efetivamente pago — não a tabela FIPE nem o valor de mercado atual.',
      'Se o veículo já estava na declaração do ano anterior, mantenha o mesmo valor histórico de aquisição sem atualizar.',
      'Se comprou no ano, registre a compra com o valor da nota fiscal, recibo ou contrato e informe a forma de pagamento.',
      'Se vendeu no ano, dê baixa no bem na declaração: descreva a venda, informe data, valor recebido e dados do comprador, e deixe a situação em 31/12 do ano atual zerada para esse bem.',
      'Se o veículo é financiado, declare apenas o valor efetivamente pago até 31/12 (entrada mais parcelas quitadas), não o valor total do bem.',
      'Se houve venda e o valor recebido foi maior que o custo registrado, avalie o possível ganho de capital com um contador antes de declarar.',
    ],
    commonMistakes: [
      'Atualizar o valor do veículo para a tabela FIPE atual — o valor declarado deve ser o custo de aquisição, não o preço de mercado.',
      'Esquecer de declarar moto, caminhão, trailer ou veículo de lazer (barco, jet ski).',
      'Não informar a venda quando o veículo saiu da posse no ano — o bem precisa ser baixado da declaração.',
      'Declarar veículo financiado pelo valor total do bem, como se tivesse sido comprado à vista.',
      'Não guardar nota fiscal, recibo ou contrato — sem documento, não é possível comprovar o custo de aquisição.',
      'Ignorar o possível ganho de capital quando o veículo foi vendido por valor acima do custo registrado.',
      'Confundir indenização de seguro por sinistro com venda comum — são situações com tratamentos diferentes.',
    ],
    whenToCallAccountant: [
      'Vendeu o veículo por valor maior do que o custo de aquisição registrado na declaração — pode haver ganho de capital.',
      'Fez troca de veículo com torna, permuta ou parte do pagamento em outro bem.',
      'Comprou com financiamento, quitou ou fez transferência de dívida e tem dúvida sobre o valor correto a declarar.',
      'O veículo está ou estava registrado em nome de outra pessoa (familiar, empresa ou sócio).',
      'Recebeu indenização de seguradora por sinistro total ou parcial.',
      'Não sabe ou não tem como comprovar o custo de aquisição do veículo.',
      'Há divergência entre o valor do contrato, do financiamento e os comprovantes de pagamento.',
      'O veículo é ou era usado em atividade profissional, autônoma ou empresarial.',
    ],
  },
  {
    slug: 'previdencia-privada',
    title: 'Previdência privada (PGBL e VGBL)',
    shortDescription: 'PGBL pode ser dedutível até o limite legal vigente. VGBL vai em Bens e Direitos.',
    category: 'investments',
    appliesTo: ['deductions.hasPrivatePensionContributions', 'investments.hasPrivatePension'],
    plainLanguageExplanation:
      'Existem dois tipos de previdência privada e cada um tem tratamento diferente. O PGBL pode permitir deduzir as contribuições do IR — até o limite legal vigente, conforme o tipo de plano e as regras aplicáveis —, mas você paga IR quando resgatar. O VGBL normalmente não dá dedução na contribuição; o tratamento no resgate depende do tipo de plano, regime escolhido e informe da instituição. É importante saber qual tipo você tem.',
    documentsNeeded: [
      'Informe de contribuições e saldo da seguradora ou banco, conforme disponibilizado pela instituição.',
      'Tipo do plano (PGBL ou VGBL) — consta no contrato',
    ],
    whereToDeclare:
      'PGBL: contribuições em Pagamentos Efetuados (Previdência Complementar). Saldo de VGBL: em Bens e Direitos.',
    howToFill: [
      'Identifique se é PGBL ou VGBL.',
      'PGBL: lance o total contribuído no ano em Pagamentos Efetuados — respeite o limite legal vigente, conforme o tipo de plano e as regras aplicáveis.',
      'VGBL: declare o saldo acumulado em 31/12 em Bens e Direitos.',
      'Se resgatou valores no ano, declare o resgate como rendimento.',
    ],
    commonMistakes: [
      'Confundir PGBL com VGBL e lançar no lugar errado.',
      'Deduzir PGBL além do limite legal vigente.',
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
      'Criptoativos podem precisar ser informados na declaração, conforme a obrigatoriedade de entrega, a posição em 31/12 e as regras aplicáveis. As regras são específicas e mais detalhadas do que muitos esperam. O saldo em 31/12 vai em Bens e Direitos — pelo custo de aquisição, não pelo valor de mercado atual. Se você vendeu ou trocou criptoativos durante o ano, pode ter apurado ganho de capital sujeito a tributação, dependendo dos valores envolvidos e das regras vigentes. A Receita Federal já recebe informações das exchanges brasileiras — o cruzamento é feito e omissões são detectadas. Operações em carteiras próprias (cold wallet) ou exchanges estrangeiras também devem ser avaliadas.',
    documentsNeeded: [
      'Extrato de posição em 31/12 de cada exchange ou carteira utilizada',
      'Histórico de transações do ano (compras, vendas, permutas, transferências entre carteiras)',
      'Comprovante do custo de aquisição de cada ativo (nota de compra, histórico da exchange)',
      'DARFs pagos ao longo do ano referentes a ganho de capital em cripto, se houver',
    ],
    whereToDeclare:
      'Bens e Direitos — código específico para criptoativos (verifique o código vigente no programa da Receita). Ganhos apurados com venda ou permuta: em Ganhos de Capital (programa GCAP ou integrado). Rendimentos de staking ou similares: avalie com um contador.',
    howToFill: [
      'Declare cada tipo de criptoativo separadamente — Bitcoin, Ethereum e demais ficam em linhas distintas.',
      'Informe o custo de aquisição em reais, não o valor de mercado em 31/12.',
      'Se vendeu criptoativos durante o ano, organize as operações mês a mês e avalie com cuidado se houve ganho sujeito à tributação, sem tentar recalcular de cabeça.',
      'Permutas (trocar um cripto por outro) podem ter tratamento fiscal semelhante a uma venda e devem ser avaliadas com cuidado, especialmente se houver valorização.',
      'Operações em exchanges estrangeiras podem ter obrigações declaratórias adicionais.',
    ],
    commonMistakes: [
      'Não declarar criptoativos por achar que a Receita não rastreia.',
      'Declarar o valor de mercado em vez do custo de aquisição.',
      'Não controlar o custo médio de cada compra ao longo do tempo.',
      'Tratar permutas (trocar um cripto por outro) como operações isentas.',
      'Esquecer de declarar ativos guardados em carteiras próprias (cold wallet).',
    ],
    whenToCallAccountant: [
      'Vendas ou permutas com volume relevante ao longo do ano.',
      'Uso de exchanges estrangeiras ou carteiras descentralizadas.',
      'Staking, yield farming, DeFi — tratamento fiscal ainda em consolidação.',
      'Mineração de criptoativos.',
      'Recebimento de criptoativos como pagamento por serviços.',
      'Qualquer dúvida sobre a apuração de ganho de capital em cripto.',
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
      'Receber aluguel envolve obrigações que vão além da declaração anual. Quando o inquilino é pessoa física, pode ser necessário apurar e recolher o imposto mensalmente pelo carnê-leão — antes de declarar. Quando o pagador é uma empresa (pessoa jurídica), pode haver informe de rendimentos e retenção na fonte, conforme o caso. O imóvel alugado também deve ser declarado em Bens e Direitos. A Receita Federal cruza os dados do proprietário com os do inquilino — omissões são detectadas.',
    documentsNeeded: [
      'Recibos de aluguel de todos os meses do ano',
      'Contrato de locação vigente',
      'Comprovantes de recolhimento do carnê-leão, se aplicável (DARF mensal)',
      'Informe de rendimentos da empresa pagadora, se for pessoa jurídica',
      'Documentação do imóvel (escritura, matrícula ou contrato de compra)',
    ],
    whereToDeclare:
      'Aluguel pago por pessoa física: Rendimentos Tributáveis Recebidos de Pessoa Física (ficha Carnê-Leão). Aluguel pago por empresa: Rendimentos Tributáveis Recebidos de Pessoa Jurídica. O imóvel em si: Bens e Direitos.',
    howToFill: [
      'Reúna os recibos mês a mês — o valor declarado deve corresponder ao efetivamente recebido.',
      'Aluguel pago por pessoa física: lance na ficha de Rendimentos de PF — os dados do carnê-leão já preenchem parte dessa ficha.',
      'Aluguel pago por empresa: use o informe de rendimentos da empresa como base.',
      'Declare o imóvel alugado em Bens e Direitos, mesmo que já estivesse na declaração anterior.',
      'Se há despesas dedutíveis do aluguel (como condomínio pago pelo locador, IPTU), verifique com um contador se e como podem ser abatidas.',
    ],
    commonMistakes: [
      'Não apurar o carnê-leão quando aplicável em aluguéis recebidos de pessoa física.',
      'Omitir meses de aluguel por achar que o valor é baixo.',
      'Não declarar o imóvel alugado em Bens e Direitos.',
      'Declarar o valor do aluguel em campo errado (PF × PJ).',
    ],
    whenToCallAccountant: [
      'Carnê-leão não foi recolhido em algum mês — há multa e juros a regularizar.',
      'Múltiplos imóveis alugados.',
      'Aluguel de imóvel registrado em nome de outra pessoa (cônjuge, herdeiros).',
      'Aluguel de imóvel comercial ou por temporada com regime diferente.',
      'Há despesas do imóvel que o locador quer abater da renda.',
    ],
  },
  {
    slug: 'exterior-alerta',
    title: 'Bens e rendimentos no exterior — requer atenção',
    shortDescription: 'Contas, imóveis, investimentos ou renda de fora do Brasil aumentam significativamente a complexidade da declaração.',
    category: 'complex_cases',
    appliesTo: ['assets.hasForeignAssets'],
    isAlert: true,
    plainLanguageExplanation:
      'Quem tem conta bancária, imóvel, investimentos, participação em empresa ou outros ativos fora do Brasil deve avaliar a declaração desses bens no IR, conforme as regras aplicáveis e a obrigatoriedade de entrega. Dependendo do total de bens no exterior, pode haver também obrigação de entrega de uma declaração separada ao Banco Central (Declaração de Capitais Brasileiros no Exterior — CBE) — com prazo e formulário próprios. Rendimentos recebidos de fontes estrangeiras — salário, aluguéis, dividendos, juros — devem ser avaliados conforme o tipo de renda, pois podem precisar ser declarados e tributados no Brasil. A conversão de valores em moeda estrangeira para reais deve seguir os critérios orientados pela Receita Federal. Imposto eventualmente pago no exterior pode ser compensado em alguns casos, dependendo do país e de acordos internacionais. Esta é uma das situações que mais justifica o acompanhamento de um contador.',
    documentsNeeded: [
      'Extratos de contas bancárias no exterior com saldo em 31/12',
      'Extratos ou relatórios de corretoras estrangeiras com posição dos investimentos em 31/12',
      'Documentos de imóveis no exterior: escritura, contrato de compra e venda e comprovante do valor pago',
      'Comprovantes de rendimentos recebidos do exterior (salário, aluguel, dividendo, juros) — extratos ou declarações do pagador',
      'Comprovante de imposto pago no exterior, se houver, para eventual compensação',
      'Documentos de origem dos recursos enviados ao exterior (transferências bancárias, câmbio contratado)',
    ],
    whereToDeclare:
      'Bens e Direitos: bens e contas no exterior (há código específico para cada tipo). Rendimentos do exterior: ficha de Rendimentos Tributáveis Recebidos de Pessoas Físicas/Exterior ou ficha específica conforme o tipo. Rendimentos isentos, quando aplicável: Rendimentos Isentos e Não Tributáveis.',
    howToFill: [
      'Liste os bens, contas e investimentos que você tinha no exterior em 31/12 e avalie a obrigação de declarar conforme as regras aplicáveis.',
      'Os valores em moeda estrangeira precisam ser convertidos para reais — siga a orientação da Receita Federal sobre a cotação a adotar (geralmente a taxa de câmbio de referência do Banco Central na data correspondente).',
      'Informe a origem dos recursos utilizados para adquirir ou manter os bens no exterior.',
      'Declare os rendimentos recebidos do exterior (salário, aluguel, juros, dividendos) na ficha correspondente ao tipo de renda.',
      'Se pagou imposto no exterior sobre esses rendimentos, guarde os comprovantes — pode haver possibilidade de compensação, dependendo do país e do tipo de renda.',
      'Verifique separadamente se você tem obrigação de entregar a CBE ao Banco Central — é uma declaração distinta da declaração de IR, com prazo e formulário próprios.',
    ],
    commonMistakes: [
      'Não declarar contas ou investimentos no exterior por achá-los pequenos ou por desconhecer a obrigação.',
      'Usar cotação de câmbio diferente da orientada pela Receita Federal para a data de referência.',
      'Confundir a declaração de IR com a CBE ao Banco Central — são obrigações distintas com prazos e formulários diferentes.',
      'Não declarar rendimentos recebidos do exterior por achar que o imposto já foi pago lá fora.',
      'Não guardar comprovantes de imposto pago no exterior, perdendo a possibilidade de compensação.',
      'Não informar a origem dos recursos enviados ao exterior.',
    ],
    whenToCallAccountant: [
      'Tem qualquer ativo, conta ou investimento no exterior — recomendação forte, independentemente do valor.',
      'Recebeu rendimentos de fontes estrangeiras ao longo do ano.',
      'Tem dúvida sobre a necessidade ou a forma de entregar a CBE ao Banco Central.',
      'Pagou imposto no exterior e quer saber se pode compensar no Brasil.',
      'Enviou ou recebeu transferências internacionais relevantes e não sabe como declarar a origem ou o destino dos recursos.',
      'Tem participação em empresa, fundo ou trust no exterior.',
      'Encerrou conta ou liquidou investimento no exterior durante o ano.',
      'Tem imóvel no exterior adquirido, vendido ou financiado no período.',
    ],
  },
  {
    slug: 'autonomo-freelancer-alerta',
    title: 'Autônomo e freelancer — requer atenção',
    shortDescription: 'Renda de trabalho autônomo pode exigir carnê-leão mensal e tem regras específicas de deduções e INSS.',
    category: 'complex_cases',
    appliesTo: ['income.hasSelfEmploymentIncome'],
    isAlert: true,
    plainLanguageExplanation:
      'Quem trabalha por conta própria — como autônomo, freelancer ou prestador de serviços — precisa organizar bem as fontes de renda antes de declarar. Pagamentos recebidos de pessoas físicas podem exigir apuração mensal pelo carnê-leão, conforme os valores recebidos e as regras aplicáveis. Pagamentos de empresas costumam ter IR retido na fonte, mas precisam constar da declaração com base nos informes das contratantes. Deduções de despesas da atividade são permitidas em alguns casos por meio do Livro Caixa, mas as regras são restritas e exigem documentação. O INSS como contribuinte individual pode ser dedutível. Não misture renda autônoma de pessoa física com receita de MEI.',
    documentsNeeded: [
      'Recibos de todos os serviços prestados a pessoas físicas no ano',
      'RPAs (Recibos de Pagamento Autônomo) emitidos pelas empresas contratantes, se disponível',
      'Informes de rendimentos de todas as empresas para as quais prestou serviço',
      'Comprovantes de recolhimento do carnê-leão (DARFs mensais), se aplicável',
      'Comprovantes de recolhimento do INSS como contribuinte individual, se aplicável',
      'Comprovantes de despesas dedutíveis da atividade, se mantiver Livro Caixa',
      'Notas fiscais de serviço (NFS-e) emitidas, se houver',
    ],
    whereToDeclare:
      'Rendimentos Tributáveis — Recebidos de Pessoa Física (carnê-leão) ou Recebidos de Pessoa Jurídica, conforme a fonte pagadora. Deduções do Livro Caixa: ficha Livro Caixa. INSS como contribuinte individual: deduções/contribuições previdenciárias, conforme orientação do programa e comprovantes.',
    howToFill: [
      'Relacione todas as fontes de renda do ano: empresas (PJ) e pessoas físicas (PF) — cada uma vai em fichas diferentes.',
      'Para rendimentos de empresas: use os informes de rendimentos de cada contratante e lance os valores recebidos e o IR retido.',
      'Para rendimentos de pessoas físicas: some os valores recebidos mês a mês e verifique se houve recolhimento do carnê-leão correspondente.',
      'Se mantiver Livro Caixa com despesas da atividade, declare as deduções permitidas — apenas com comprovação documental.',
      'Se contribuiu para o INSS como contribuinte individual, inclua os valores pagos nas deduções permitidas — confira o informe do INSS ou os comprovantes de pagamento (GPS).',
      'Não misture rendimentos de autônomo PF com receitas de MEI — são tratamentos separados.',
    ],
    commonMistakes: [
      'Não apurar o carnê-leão quando aplicável sobre rendimentos recebidos de pessoas físicas — valores em atraso podem gerar multa e juros.',
      'Deixar de declarar serviços prestados por esquecimento ou por não ter recibo — a Receita pode cruzar os dados com as contratantes.',
      'Misturar renda de autônomo pessoa física com receita de MEI na mesma ficha de rendimentos.',
      'Deduzir despesas sem Livro Caixa formalizado ou sem comprovação documental.',
      'Não incluir informes de rendimentos de contratantes que retiveram IR — o imposto retido só aparece corretamente quando o informe é declarado na ficha certa.',
      'Confundir carnê-leão (recolhimento mensal durante o ano) com o ajuste feito na declaração anual.',
    ],
    whenToCallAccountant: [
      'Há carnê-leão em atraso — o cálculo de multa, juros e a forma de regularização exigem orientação profissional.',
      'Recebeu de múltiplas fontes (várias empresas e pessoas físicas) e tem dificuldade de consolidar os valores.',
      'Quer deduzir despesas da atividade pelo Livro Caixa — as regras são restritas e a falta de controle correto pode gerar problemas.',
      'Tem dúvida sobre o INSS como contribuinte individual: valor correto, competências em atraso ou parcelamento.',
      'Recebeu renda de fontes no exterior como autônomo ou prestador de serviços.',
      'É ou foi MEI durante o ano e também teve renda como autônomo PF — as obrigações se misturam.',
      'Prestou serviços para empresas que não emitiram informe e o valor é relevante.',
      'Tem despesas com aluguel de espaço, equipamentos ou ajudantes que gostaria de deduzir.',
    ],
  },

  {
    slug: 'outras-rendas-alerta',
    title: 'Outras rendas recebidas no ano',
    shortDescription: 'Prêmios, heranças, doações e rendas eventuais têm tratamento fiscal específico.',
    category: 'complex_cases',
    appliesTo: ['income.hasOtherIncome'],
    isAlert: true,
    plainLanguageExplanation:
      'Rendas que não se encaixam nas categorias principais — como prêmios de loterias, heranças, doações em dinheiro, indenizações e rendimentos eventuais — podem ter tratamentos fiscais muito diferentes entre si. Alguns são isentos, outros são tributados na fonte, e outros precisam ser informados como rendimento tributável. Não deixe de declarar: a Receita Federal cruza dados de diversas fontes.',
    documentsNeeded: [
      'Comprovante da renda recebida (recibo, extrato, contrato, escritura)',
      'Documento que indique a natureza da renda (prêmio, herança, doação, indenização)',
      'Informe de retenção na fonte, se houver',
    ],
    whereToDeclare:
      'Depende do tipo de renda. Alguns valores podem ser informados como Rendimentos Isentos e Não Tributáveis; outros podem ser tributados na fonte ou exigir tratamento específico. Confirme a classificação com o informe, documento oficial ou contador.',
    howToFill: [
      'Identifique a natureza de cada renda recebida.',
      'Verifique se houve retenção de IR na fonte — o comprovante do pagador indicará isso.',
      'Rendas isentas vão em Rendimentos Isentos e Não Tributáveis, com a descrição adequada.',
      'Em caso de dúvida sobre a classificação, consulte um contador antes de lançar.',
    ],
    commonMistakes: [
      'Não declarar uma renda por achar que ela é isenta, sem confirmar.',
      'Lançar rendimento tributável como isento.',
      'Não guardar documentação de herança, doação ou indenização recebida.',
    ],
    whenToCallAccountant: [
      'Herança ou doação de valor significativo.',
      'Indenização trabalhista com componentes variados (verbas tributáveis e isentas).',
      'Prêmio de concurso, sorteio ou similar.',
      'Qualquer renda cuja classificação fiscal não seja evidente.',
    ],
  },

  {
    slug: 'pensao-alimenticia',
    title: 'Pensão alimentícia',
    shortDescription: 'Quem paga pensão judicial pode deduzir. Quem recebe informa conforme orientação vigente da Receita.',
    category: 'deductions',
    appliesTo: ['deductions.hasAlimony'],
    plainLanguageExplanation:
      'A pensão alimentícia tem tratamento diferente para quem paga e para quem recebe. Quem paga pensão fixada por decisão judicial pode deduzir o valor integral da base de cálculo do IR. Quem recebe pensão alimentícia deve informar os valores conforme a orientação vigente do programa da Receita, em geral em Rendimentos Isentos e Não Tributáveis. Quem paga deve observar se há decisão judicial, acordo homologado ou escritura pública que permita a dedução. Acordos extrajudiciais têm tratamento diferente; confirme com um contador.',
    documentsNeeded: [
      'Decisão judicial ou acordo homologado judicialmente que estabelece a pensão',
      'Comprovantes de pagamento ao longo do ano (transferências, recibos)',
      'CPF do alimentando (quem recebe)',
    ],
    whereToDeclare:
      'Quem paga: Pagamentos Efetuados, quando houver decisão judicial, acordo homologado ou escritura pública. Quem recebe: Rendimentos Isentos e Não Tributáveis, conforme orientação vigente do programa da Receita.',
    howToFill: [
      'Separe os comprovantes de todos os pagamentos realizados no ano.',
      'Informe o CPF do alimentando — é obrigatório para a dedução ser aceita.',
      'Lance apenas o valor efetivamente pago, não o valor fixado se houver atraso.',
      'Se há mais de um alimentando, lance cada um separadamente.',
    ],
    commonMistakes: [
      'Tentar deduzir pensão paga por acordo informal, sem homologação judicial.',
      'Não informar o CPF de quem recebe a pensão.',
      'Lançar valor fixado no acordo em vez do valor efetivamente pago no ano.',
    ],
    whenToCallAccountant: [
      'Há dúvida sobre se o acordo é judicialmente reconhecido para fins de dedução.',
      'A pensão inclui componentes além do valor mensal (imóvel cedido, plano de saúde etc.).',
      'Situação de atraso, pagamento parcelado ou acordo de quitação de débito.',
    ],
  },

  {
    slug: 'empresa-mei-dividendos-alerta',
    title: 'Empresa, MEI e dividendos — requer atenção',
    shortDescription: 'Sócio, empresário ou MEI tem regras próprias para declarar renda e dividendos recebidos.',
    category: 'complex_cases',
    appliesTo: ['income.hasBusinessIncome'],
    isAlert: true,
    plainLanguageExplanation:
      'Se você é sócio de empresa, MEI, empresário individual ou recebeu dividendos ou pró-labore, a declaração tem especificidades que vão além da renda CLT. É importante separar o que veio da empresa como distribuição de lucros, pró-labore ou retirada, e entender o tratamento fiscal indicado pela contabilidade para cada tipo de recebimento. Erros nessa área são frequentes e podem gerar questionamentos.',
    documentsNeeded: [
      'Informe de rendimentos da empresa ou contabilidade (pró-labore, distribuição de lucros)',
      'Declaração do MEI (DASN-SIMEI) se for MEI',
      'Comprovante de retiradas ou pró-labore recebidos no ano',
      'Documentação do contador responsável pela empresa',
    ],
    whereToDeclare:
      'Pró-labore e salário recebidos da empresa: Rendimentos Tributáveis. Distribuição de lucros e dividendos (quando isentos): Rendimentos Isentos e Não Tributáveis. Participe da empresa como sócio: declare a participação societária em Bens e Direitos.',
    howToFill: [
      'Solicite ao contador da empresa o informe de rendimentos com a separação de pró-labore e distribuição de lucros.',
      'Lance o pró-labore como rendimento tributável recebido de pessoa jurídica.',
      'Lucros e dividendos distribuídos podem ser isentos — verifique com o contador se a empresa está em conformidade.',
      'Declare sua participação na empresa em Bens e Direitos (código de participação societária).',
      'MEI: use as informações da DASN-SIMEI para orientar o preenchimento.',
    ],
    commonMistakes: [
      'Não declarar o pró-labore como rendimento tributável.',
      'Confundir distribuição de lucros com pró-labore e lançar no lugar errado.',
      'Não declarar a participação societária em Bens e Direitos.',
      'MEI que não separa renda pessoal da movimentação do CNPJ.',
    ],
    whenToCallAccountant: [
      'Qualquer dúvida sobre como declarar renda vinda de empresa própria.',
      'Se há mais de uma empresa ou participação em diferentes sociedades.',
      'Se houve distribuição de lucros sem escrituração, comprovação adequada ou orientação clara da contabilidade.',
      'Se o MEI teve faturamento próximo ou acima do limite do regime.',
      'Se há dívidas da empresa que afetam o patrimônio pessoal.',
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
