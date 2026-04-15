# Organização de Estudos

Biblioteca pessoal e corporativa para organizar estudos acadêmicos e corporativos gerados com IA.

## Stack

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Banco de dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage
- **Roteamento**: React Router v6

---

## Setup

### 1. Instalar dependências

```bash
cd organizacao-estudos
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Configurar o Supabase

#### 3.1 Criar projeto

Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

#### 3.2 Executar o schema SQL

No **SQL Editor** do Supabase, copie e execute o conteúdo de `supabase/schema.sql`.

#### 3.3 Criar bucket de Storage

1. Vá em **Storage** no painel do Supabase
2. Clique em **New bucket**
3. Nome: `study-materials`
4. Marque **Public bucket**
5. Clique em **Create bucket**

#### 3.4 Configurar políticas de Storage

No **Storage > Policies**, adicione:

**Política de upload** (INSERT):
```sql
((bucket_id = 'study-materials') AND (auth.role() = 'authenticated'))
```

**Política de leitura pública** (SELECT):
```sql
(bucket_id = 'study-materials')
```

**Política de deleção** (DELETE):
```sql
((bucket_id = 'study-materials') AND (auth.role() = 'authenticated'))
```

### 4. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`

---

## Funcionalidades

- Autenticação com e-mail/senha (Supabase Auth)
- Dashboard com estatísticas e estudos recentes
- Cadastro de estudos com upload de materiais (docx, áudio, vídeo, infográfico, slides)
- Links externos para YouTube, Google Drive, etc.
- Player de áudio/vídeo embutido
- Visualizador de infográficos
- Categorias com cores personalizáveis
- Busca avançada com filtros por categoria, status e data
- Dark mode por padrão
- RLS (Row Level Security) — cada usuário vê apenas seus dados

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── layout/       # Sidebar, Header, Layout, ProtectedRoute
│   ├── ui/           # Button, Card, Badge, Modal, Input, Select...
│   └── studies/      # StudyCard, StudyForm, MaterialPlayer
├── hooks/
│   ├── useAuth.ts
│   ├── useStudies.ts
│   └── useCategories.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Studies.tsx
│   ├── StudyDetail.tsx
│   ├── NewStudy.tsx
│   ├── EditStudy.tsx
│   ├── Categories.tsx
│   └── SearchPage.tsx
└── types/
    └── index.ts
supabase/
└── schema.sql
```

---

## Build para produção

```bash
npm run build
```

Os arquivos ficam em `dist/` e podem ser servidos por qualquer host estático (Vercel, Netlify, etc.).
