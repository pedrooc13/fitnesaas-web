import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-[22px] font-bold">Termos de uso</h1>
      <p className="text-text-2">TERMOS DE DOS - FITNESAAS
Seja bem-vindo ao FitneSAAS. Ao acessar ou utilizar nossos serviços, você concorda em cumprir e vincular-se aos seguintes Termos de Uso. Caso não concorde com qualquer parte destes termos, você não deverá utilizar a plataforma.
1. ACEITAÇÃO DOS TERMOS
Estes termos regem o uso do software, painéis, ferramentas de acompanhamento nutricional e recursos de armazenamento fornecidos pela plataforma FitneSAAS. A utilização do serviço é destinada a indivíduos que buscam o gerenciamento de suas rotinas alimentares e perfis nutricionais.
2. CADASTRO E SEGURANÇA DA CONTA
Para utilizar os recursos da plataforma, o usuário deve realizar um cadastro fornecendo dados verdadeiros e atualizados. A segurança da senha de acesso é de inteira responsabilidade do usuário. Atividades realizadas na conta serão atribuídas exclusivamente ao proprietário do perfil.
3. USO PERMITIDO E RESTRIÇÕES
O usuário concorda em utilizar a plataforma de forma ética e legal. É estritamente proibido:
• Tentar burlar os sistemas de isolamento de dados (Row Level Security) ou acessar dados de terceiros.
• Realizar engenharia reversa no software ou automatizar requisições sem autorização prévia.
• Enviar arquivos maliciosos, corrompidos ou que violem os limites técnicos do sistema (como uploads de imagem que superem o limite estrito de 2MB estabelecido pela plataforma).
1. ISENÇÃO DE RESPONSABILIDADE MÉDICA
Os dados, cálculos de macronutrientes, relatórios e ferramentas de rastreamento contidos no FitneSAAS servem exclusivamente para fins informativos e de gerenciamento pessoal. O software não substitui, em hipótese alguma, o diagnóstico, a consulta ou o tratamento realizado por um nutricionista ou profissional de saúde qualificado.
2. PROPRIEDADE INTELECTUAL
Todo o design da interface, códigos de programação (estruturas Next.js e banco de dados Supabase), logotipos e textos são de propriedade exclusiva do FitneSAAS, protegidos por leis de direitos autorais e propriedade intelectual.
3. ALTERAÇÃO E RESCISÃO DOS SERVIÇOS
Reservamo-nos o direito de modificar, suspendendo ou encerrando funcionalidades da plataforma a qualquer momento. O usuário possui o direito de encerrar sua conta e solicitar a exclusão de seus dados diretamente através do painel de configurações do sistema.
Última atualização: 28 de outubro de 2026.</p>
    </main>
  );
}
