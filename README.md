# FitneSAAS Web

Next.js 15 (App Router) + Supabase (Postgres, Auth, RLS) + Vercel.

## Passo a passo

### 1. Criar o projeto no Supabase
1. Em https://supabase.com, crie um projeto. **Região: South America (São Paulo)**.
2. Guarde a senha do banco em um gerenciador de senhas.
3. Em **Project Settings > API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (ou *publishable key*) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**secreta**: nunca no navegador nem no git)

### 2. Criar o banco
No painel, em **SQL Editor**:
1. Cole e rode `supabase/migrations/0001_init.sql`.
2. Cole e rode `supabase/seed.sql`.

Confirme em **Table Editor** que `profiles`, `foods` e `meals` existem, com RLS ativo (cadeado verde).

### 3. Configurar autenticação (**Authentication > Sign In / Providers**)
- **Email**: ativado. Mantenha **Confirm email** ligado.
- **Minimum password length**: 8.
- **Authentication > URL Configuration**:
  - *Site URL*: `https://SEU-DOMINIO.com.br` (em dev, `http://localhost:3000`).
  - *Redirect URLs*: adicione `https://SEU-DOMINIO.com.br/auth/callback` e `http://localhost:3000/auth/callback`, além da URL de preview do Vercel se usar (`https://*-SEU-USUARIO.vercel.app/auth/callback`).
- **Authentication > Email Templates**: traduza para português. Os links de confirmação e de redefinição de senha usam o callback acima.
- **Email (SMTP)**: o Supabase envia emails de teste com limite baixo. Para produção, configure SMTP próprio (Resend, por exemplo) em **Project Settings > Auth > SMTP** e verifique o domínio com SPF e DKIM.

### 4. Subir o código no GitHub
```bash
git init
git add .
git commit -m "FitneSAAS web: primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/fitnesaas-web.git
git push -u origin main
```
Confirme antes do push que `.env*` **não** aparece em `git status` (o `.gitignore` já cuida disso).

### 5. Subir no Vercel
1. Em https://vercel.com, **Add New > Project** e importe o repositório `fitnesaas-web`.
2. Framework: **Next.js** (detectado automaticamente).
3. Em **Environment Variables**, adicione para *Production* e *Preview*:

| Variável | Valor | Visível no navegador? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto | sim (ok) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | sim (ok, o RLS protege os dados) |
| `NEXT_PUBLIC_SITE_URL` | `https://SEU-DOMINIO.com.br` | sim (ok) |
| `SUPABASE_SERVICE_ROLE_KEY` | service role | **não**, só servidor |

4. Clique em **Deploy**. O `vercel.json` já define a região `gru1` (São Paulo).
5. Em **Settings > Domains**, adicione seu domínio. O HTTPS é automático.

### 6. Testar antes de divulgar
- Cadastro → email de confirmação → link abre o app já logado no onboarding.
- Login errado mostra mensagem genérica.
- "Esqueci minha senha" → link → nova senha → login com a nova senha.
- Registrar refeição, apagar refeição, ver histórico.
- Excluir conta (Configurações) → o usuário some do painel do Supabase em **Authentication > Users**.
- Abrir em outro navegador logado com outra conta e confirmar que não vê as refeições da primeira.

## Segurança: onde está cada proteção

| Requisito | Onde |
|---|---|
| Cada cliente só vê o próprio dado | RLS em `profiles` e `meals` (`user_id = auth.uid()`). Testado no banco |
| Cliente não altera o próprio plano | `GRANT` por coluna: `plan` não tem permissão de escrita para `authenticated` |
| Cliente não informa calorias | Trigger `meals_compute_nutrients` calcula a partir da base |
| Refeição no futuro | Trigger rejeita |
| Senha com hash | Supabase Auth (bcrypt) |
| Rate limit no login | Supabase Auth (limites por IP e por email). Ver painel *Authentication > Rate Limits* |
| Login sem enumeração | Mensagem genérica e "esqueci senha" com resposta igual |
| Link de reset de uso único | Supabase Auth |
| HTTPS | Vercel (automático) + HSTS em `next.config.mjs` |
| Cabeçalhos de segurança | `next.config.mjs` (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) |
| Chave de serviço fora do código | Só em variável de ambiente do servidor |
| Sessão renovada e validada | `src/middleware.ts` usa `getUser()` (valida no servidor do Supabase) |
| Excluir conta (LGPD) | Server action com service role. Cascata apaga perfil e refeições |

## Pendências (antes de lançar)

- **Backup**: o plano gratuito do Supabase **não tem backup automático**. Antes de ter usuários reais, use o plano Pro (backup diário com PITR) ou agende o `pg_dump` do projeto antigo (`scripts/backup.sh` da API).
- **Restore testado**: faça um restore em um projeto de teste e confira os dados.
- **Textos legais**: `/termos` e `/privacidade` são placeholders. Precisa de revisão jurídica e de LGPD (dados de saúde são sensíveis: consentimento específico).
- **Pagamento**: os botões de plano estão desativados. Entram com o gateway, webhook com validação de assinatura e atualização de `profiles.plan` por uma função de servidor (service role).
- **Monitoramento**: integrar Sentry e um monitor de uptime (ex: Better Stack).
- **Base de alimentos**: trocar `seed.sql` pela TACO completa.
- **Atualizar o Next.js** de tempos em tempos (`npm audit`) e ativar o Dependabot no GitHub.

## Rodar localmente

```bash
cp .env.example .env.local     # preencha os valores
npm install
npm run dev                    # http://localhost:3000
npm run build                  # validação de tipos e build de produção
```


