import LegalDisclaimer from '@/components/layout/LegalDisclaimer';

export const metadata = { title: 'Termos de Uso — IR Facilitador' };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Termos de Uso</h1>

      <section className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Ao usar o IR Facilitador, você concorda com os termos descritos abaixo. Leia com atenção
          antes de prosseguir.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Finalidade do aplicativo</h2>
        <p>
          O IR Facilitador é uma ferramenta de <strong>orientação educacional</strong> para ajudar
          pessoas físicas a organizar documentos e entender o processo de declaração do Imposto de
          Renda Pessoa Física (DIRPF) no Brasil. O aplicativo:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Não transmite declarações à Receita Federal.</li>
          <li>Não calcula imposto a pagar ou restituição.</li>
          <li>Não substitui serviços de contabilidade ou assessoria tributária.</li>
          <li>Não garante ausência de malha fina, autuações ou penalidades.</li>
          <li>Não promete restituição maior nem economia tributária.</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Responsabilidade do usuário</h2>
        <p>
          A responsabilidade pela exatidão das informações declaradas à Receita Federal é{' '}
          <strong>exclusivamente do contribuinte</strong>. O IR Facilitador fornece orientação
          baseada nas respostas fornecidas, mas não verifica, audita nem valida os dados informados.
        </p>
        <p>
          Para situações tributárias complexas — como venda de ativos, criptoativos, bens no
          exterior, renda autônoma ou pensão alimentícia — recomendamos fortemente a consulta a um
          contador ou advogado tributarista antes do envio da declaração.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Limitações das informações</h2>
        <p>
          As regras tributárias brasileiras mudam periodicamente. O conteúdo dos guias e alertas
          disponíveis no aplicativo é baseado na legislação vigente à época de sua publicação e pode
          não refletir mudanças posteriores. O usuário é responsável por verificar a atualidade das
          informações com fontes oficiais (Receita Federal, Diário Oficial).
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Propriedade intelectual</h2>
        <p>
          O conteúdo dos guias, alertas e textos do IR Facilitador é protegido por direitos autorais.
          O uso é permitido para fins pessoais. É vedada a reprodução comercial sem autorização.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Alterações nos termos</h2>
        <p>
          Estes termos podem ser atualizados sem aviso prévio. O uso continuado do aplicativo após
          alterações implica aceitação dos novos termos.
        </p>
      </section>

      <LegalDisclaimer />
    </div>
  );
}
