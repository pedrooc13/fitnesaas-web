// Versões e textos dos documentos legais.
// Ao mudar a versão, todos os usuários aceitam de novo no próximo acesso.
export const TERMS_VERSION = "2.4";
export const PRIVACY_VERSION = "1.0";
export const LEGAL_UPDATED = "28 de outubro de 2026";

// Dados do operador ainda não definidos: preencher antes de publicar.
export const OPERATOR = {
  dpoEmail: "[e-mail do encarregado de dados a definir]",
  company: "[razão social e CNPJ a definir]",
};

export interface LegalSection {
  title: string;
  crucial?: boolean;
  paragraphs: string[];
  bullets?: string[];
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Aceitação e elegibilidade",
    paragraphs: [
      "Estes termos regem o uso do software, painéis, ferramentas de acompanhamento nutricional e recursos de armazenamento fornecidos pelo FitneSAAS. O serviço é destinado a pessoas que buscam gerenciar suas rotinas alimentares e perfis nutricionais.",
      "Para usar a plataforma, você deve criar uma conta com dados verdadeiros e atualizados. A segurança da sua senha é de sua responsabilidade. As atividades realizadas na conta são atribuídas ao titular do perfil.",
    ],
  },
  {
    title: "Isenção de responsabilidade médica",
    crucial: true,
    paragraphs: [
      "Os dados, cálculos de macronutrientes, relatórios e ferramentas de rastreamento servem exclusivamente para fins informativos e de gerenciamento pessoal.",
      "O FitneSAAS não substitui, em hipótese alguma, o diagnóstico, a consulta ou o tratamento realizado por nutricionista ou outro profissional de saúde qualificado.",
    ],
  },
  {
    title: "Assinaturas e cobrança",
    paragraphs: [
      "Plano Free: gratuito, com as funções básicas.",
      "Plano Pro: R$ 15,00 por mês, com histórico ilimitado e relatórios.",
      "Plano Max: R$ 35,00 por mês, com recursos de análise por inteligência artificial.",
      "O plano anual tem 20% de desconto sobre o valor mensal. As assinaturas são renovadas automaticamente a cada período, e você pode cancelá-las a qualquer momento.",
      "Os pagamentos ainda não estão ativos nesta versão. As condições finais de cobrança serão publicadas quando o pagamento for habilitado.",
    ],
  },
  {
    title: "Uso permitido e propriedade intelectual",
    paragraphs: [
      "O usuário deve usar a plataforma de forma ética e legal. É proibido: tentar burlar o isolamento de dados (Row Level Security) ou acessar dados de terceiros; fazer engenharia reversa do software ou automatizar requisições sem autorização prévia; enviar arquivos maliciosos, corrompidos ou que violem os limites técnicos, como imagens acima de 2 MB.",
      "Todo o design da interface, o código (Next.js e estrutura do banco Supabase), os logotipos e os textos são de propriedade do FitneSAAS, protegidos pela legislação de direitos autorais e de propriedade intelectual.",
    ],
  },
  {
    title: "Alteração, suspensão e exclusão da conta",
    paragraphs: [
      "Podemos modificar, suspender ou encerrar funcionalidades a qualquer momento.",
      "Você pode encerrar sua conta e pedir a exclusão dos seus dados diretamente em Configurações, no botão Excluir conta. A exclusão remove seu perfil, seu histórico de refeições e sua foto.",
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "Informações que coletamos",
    paragraphs: [
      "Coletamos apenas o necessário para o funcionamento do serviço:",
    ],
    bullets: [
      "Dados de cadastro: nome, e-mail e credenciais de autenticação, gerenciadas pelo Supabase Auth.",
      "Dados de perfil e nutrição: informações fornecidas por você para o acompanhamento, como metas e diário alimentar.",
      "Mídia de perfil: foto enviada por você, nos formatos JPG, PNG ou WEBP, com tamanho máximo de 2 MB.",
      "Registro de consentimento: data e versão dos termos e desta política que você aceitou.",
    ],
  },
  {
    title: "Dados de saúde e consentimento",
    crucial: true,
    paragraphs: [
      "Dados de saúde e nutrição são dados sensíveis pela LGPD (art. 11). O tratamento deles depende do seu consentimento específico, que você dá no cadastro. Você pode retirá-lo a qualquer momento, excluindo sua conta.",
    ],
  },
  {
    title: "Armazenamento seguro e isolamento de dados",
    paragraphs: [
      "Seus dados de perfil são protegidos por Row Level Security (RLS) no banco de dados PostgreSQL. Isso garante que apenas você, após autenticação válida, consiga acessar ou modificar seus registros.",
      "As fotos de perfil ficam em um bucket privado do Supabase Storage. O acesso é separado por pasta, com o identificador único (UUID) de cada usuário, e nenhum outro usuário consegue ver ou alterar essas fotos.",
    ],
  },
  {
    title: "Compartilhamento de dados",
    paragraphs: [
      "O FitneSAAS não vende, não aluga e não compartilha seus dados pessoais ou históricos nutricionais com terceiros para fins comerciais.",
      "Para funcionar, seus dados são processados pela infraestrutura de hospedagem (Vercel) e pelo backend (Supabase). A comunicação entre o app, a hospedagem e o backend é protegida por HTTPS, que criptografa os dados em trânsito.",
    ],
  },
  {
    title: "Seus direitos: exportação e exclusão",
    paragraphs: [
      "Você tem controle sobre suas informações pelo painel de Configurações:",
    ],
    bullets: [
      "Exportar os dados: gera e baixa um arquivo CSV com todo o seu histórico de refeições.",
      "Excluir a conta: remove de forma permanente e imediata seu perfil, suas refeições e os arquivos de foto vinculados a você no armazenamento privado.",
    ],
  },
  {
    title: "Alterações nesta política",
    paragraphs: [
      "Esta política pode ser atualizada para refletir melhorias no sistema ou mudanças na legislação. Quando isso acontecer, você será convidado a ler e aceitar a nova versão.",
    ],
  },
];
