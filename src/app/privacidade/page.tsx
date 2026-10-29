import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-[22px] font-bold">Política de privacidade</h1>
      <p className="text-text-2">
        POLÍTICA DE PRIVACIDADE - FITNESAAS
No FitneSAAS, valorizamos a sua privacidade e assumimos o compromisso de proteger os seus dados pessoais. Esta Política de Privacidade descreve como suas informações são coletadas, utilizadas, armazenadas e protegidas em nosso ecossistema.
1. INFORMAÇÕES QUE COLETAMOS
• Dados de Cadastro: Nome completo, endereço de e-mail e credenciais de autenticação gerenciadas via Supabase Auth.
• Dados de Perfil e Nutrição: Informações fornecidas voluntariamente para o rastreamento nutricional, metas e diários alimentares.
• Mídia de Perfil: Fotos de avatar enviadas pelo usuário, restritas aos formatos JPG, PNG ou WEBP com tamanho máximo de 2MB.
1. ARMAZENAMENTO SEGURO E ISOLAMENTO DE DADOS
Seus dados de perfil são protegidos por mecanismos rigorosos de isolamento conhecidos como Row Level Security (RLS) no nível do banco de dados PostgreSQL. Isso garante que apenas você, após autenticação válida, consiga acessar ou modificar seus registros.
As fotos de perfil enviadas são armazenadas em buckets privados no Supabase Storage. O acesso é segmentado por pastas baseadas no seu identificador único (UUID), impedindo estritamente o acesso ou visualização de arquivos por terceiros.
2. COMPARTILHAMENTO DE DADOS
O FitneSAAS não vende, aluga ou compartilha seus dados pessoais ou históricos nutricionais com terceiros para fins comerciais. O fluxo de informações acontece exclusivamente entre a interface da sua aplicação (Next.js), a infraestrutura de hospedagem (Vercel) e os serviços de backend (Supabase), sob criptografia de ponta a ponta (HTTPS).
3. SEUS DIREITOS (EXPORTAÇÃO E EXCLUSÃO)
Em total conformidade com as legislações vigentes de proteção de dados, você possui controle absoluto sobre suas informações através do seu painel de configurações:
• Exportar os Dados: Permite gerar e baixar um arquivo consolidado em formato CSV contendo todo o seu histórico.
• Deletar a Conta: Remove de forma permanente e imediata seu registro no banco de dados, excluindo também todos os arquivos vinculados a você localizados no bucket de armazenamento privado.
1. ALTERAÇÕES NESTA POLÍTICA
Esta política pode ser atualizada periodicamente para refletir melhorias no sistema ou mudanças regulatórias. Recomendamos a revisão desta página de forma regular para se manter informado.
Última atualização: 28 de outubro de 2026.
      </p>
    </main>
  );
}
