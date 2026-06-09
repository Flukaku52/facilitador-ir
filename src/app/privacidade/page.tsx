import LegalDisclaimer from '@/components/layout/LegalDisclaimer';

export const metadata = { title: 'Política de Privacidade — IR Facilitador' };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Política de Privacidade</h1>

      <section className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          O IR Facilitador foi desenvolvido para ajudar pessoas físicas a organizar sua declaração de
          Imposto de Renda. Esta política explica como tratamos os dados que você fornece ao usar o
          aplicativo.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Dois modos de uso</h2>
        <p>
          O IR Facilitador pode ser usado de duas formas:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong>Modo convidado (sem conta):</strong> todas as informações ficam armazenadas
            exclusivamente no <em>localStorage</em> do seu próprio navegador. Nenhum dado é
            enviado a servidores externos.
          </li>
          <li>
            <strong>Modo com conta:</strong> ao criar uma conta e fazer login, seu perfil tributário
            e o estado do checklist são sincronizados com nossos servidores (Supabase) para que
            você possa acessá-los em qualquer dispositivo. Seu endereço de e-mail é armazenado
            para fins de autenticação.
          </li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">O que coletamos</h2>
        <p>
          O aplicativo coleta apenas as respostas do questionário de perfil tributário (ex.: se você
          tem imóvel, investimentos ou despesas médicas). <strong>Não coletamos nome, CPF, endereço,
          dados bancários ou valores monetários.</strong> Em modo com conta, coletamos o endereço de
          e-mail utilizado no cadastro.
        </p>
        <p>
          Notas pessoais adicionadas ao checklist ficam armazenadas somente no seu dispositivo e
          <strong> nunca são enviadas a nossos servidores</strong>, nem aparecem em links
          compartilhados ou no PDF gerado.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Como usamos os dados</h2>
        <p>
          As respostas do questionário são usadas exclusivamente para gerar seu checklist
          personalizado, identificar guias de preenchimento aplicáveis e exibir alertas de risco
          relevantes ao seu perfil. Não usamos seus dados para fins publicitários, não os
          compartilhamos com terceiros e não fazemos cruzamento com fontes externas.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Compartilhamento de relatório</h2>
        <p>
          Se você usar o botão &quot;Compartilhar link&quot;, as informações do seu perfil tributário e o
          estado do checklist (sem dados pessoais identificáveis) serão codificadas na URL.
          Qualquer pessoa com acesso ao link poderá visualizar o relatório. Notas pessoais
          <strong> não são incluídas no link</strong>. Compartilhe com cuidado.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Seus direitos (LGPD)</h2>
        <p>
          Você pode solicitar a exclusão dos seus dados a qualquer momento:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong>Dados locais:</strong> use o botão &quot;Limpar todos os dados&quot; no painel para apagar
            permanentemente perfil, checklist, notas e rascunho do seu navegador.
          </li>
          <li>
            <strong>Conta e dados na nuvem:</strong> acesse &quot;Minha conta&quot; e use a opção
            &quot;Excluir conta permanentemente&quot; para remover todos os seus dados dos nossos servidores.
          </li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Infraestrutura e segurança</h2>
        <p>
          A autenticação e o armazenamento em nuvem utilizam a plataforma{' '}
          <strong>Supabase</strong>, com servidores na AWS. Os dados em trânsito são protegidos
          por TLS. O acesso é restrito por autenticação e políticas de segurança em nível de linha
          (Row-Level Security), garantindo que cada usuário acesse apenas seus próprios dados.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Retenção de dados</h2>
        <p>
          Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir a conta, todos os
          dados associados são removidos permanentemente dos nossos servidores. Backups de
          infraestrutura podem reter cópias por até 30 dias após a exclusão.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Contato</h2>
        <p>
          Dúvidas sobre privacidade ou solicitações relacionadas à LGPD podem ser enviadas para
          o e-mail de contato do projeto ou via repositório público.
        </p>
      </section>

      <LegalDisclaimer />
    </div>
  );
}
