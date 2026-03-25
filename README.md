# Volunteer — Gestão de Voluntários

App para gerenciar voluntários e eventos da sua igreja.

## Stack
- **Frontend:** HTML/CSS/JS puro (single file)
- **Backend/Auth/DB:** Supabase
- **Deploy:** Vercel

---

## 1. Configurar o Supabase

No painel do Supabase, vá em **SQL Editor** e rode o script `supabase-schema.sql` incluído neste repositório.

Ele cria as tabelas:
- `profiles` — dados dos usuários logados
- `members` — voluntários cadastrados
- `events` — eventos com sessões e voluntários

### Habilitar autenticação por e-mail
1. Supabase Dashboard → **Authentication → Providers**
2. Certifique-se que **Email** está habilitado
3. Em **Authentication → Email Templates** você pode personalizar os e-mails
4. (Recomendado para testes) Em **Authentication → Settings** → desabilite "Confirm email" para não precisar confirmar e-mail

---

## 2. Deploy na Vercel

1. Faça push deste repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project**
3. Importe o repositório do GitHub
4. Clique em **Deploy** (sem configurações extras necessárias)

A Vercel detecta automaticamente o `index.html` e o `vercel.json`.

---

## 3. Usar o app

1. Acesse a URL gerada pela Vercel
2. Crie sua conta (primeiro usuário pode se cadastrar como **Líder**)
3. Configure suas áreas no Perfil
