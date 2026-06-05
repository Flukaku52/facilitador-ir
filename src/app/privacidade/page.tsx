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

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">O que coletamos</h2>
        <p>
          Na versão atual (MVP 0.1), <strong>nenhum dado é enviado a servidores externos</strong>.
          Todas as informações que você fornece ao responder o questionário — como presença de imóvel,
          investimentos ou despesas médicas — ficam armazenadas exclusivamente no <em>localStorage</em>{' '}
          do seu próprio navegador.
        </p>
        <p>
          Não coletamos nome, CPF, endereço, dados bancários, senhas ou qualquer informação
          pessoalmente identificável.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Como usamos os dados</h2>
        <p>
          As respostas do questionário são usadas exclusivamente para gerar seu checklist
          personalizado, identificar guias de preenchimento aplicáveis e exibir alertas de risco
          relevantes ao seu perfil. Nenhum processamento ocorre fora do seu dispositivo.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Compartilhamento de relatório</h2>
        <p>
          Se você usar o botão &quot;Compartilhar link&quot;, as informações do seu perfil tributário (sem dados
          pessoais identificáveis) serão codificadas na URL. Qualquer pessoa com acesso ao link poderá
          visualizar o relatório. Compartilhe com cuidado.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Seus direitos (LGPD)</h2>
        <p>
          Como os dados ficam apenas no seu navegador, você tem controle total sobre eles. Use o botão
          &quot;Limpar todos os dados&quot; no painel para apagar permanentemente todas as informações salvas.
          Limpar o cache/localStorage do navegador também remove todos os dados.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Versões futuras</h2>
        <p>
          Versões futuras do IR Facilitador poderão incluir autenticação e armazenamento em nuvem
          (Supabase). Nesse caso, esta política será atualizada e o consentimento explícito do usuário
          será solicitado antes de qualquer coleta de dados pessoais.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6">Contato</h2>
        <p>
          Dúvidas sobre privacidade podem ser enviadas para o repositório do projeto. Não coletamos
          e-mails nesta versão.
        </p>
      </section>

      <LegalDisclaimer />
    </div>
  );
}
