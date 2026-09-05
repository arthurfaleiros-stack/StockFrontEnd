# React + Vite
# KeepStock — Plataforma Integrada de Gestão de Inventário

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.
Aplicação frontend corporativa desenvolvida em **React**, **Vite** e **TailwindCSS**, projetada com tema escuro (deep navy) e arquitetura modular de alta performance para consumir a **KStock-API**.

Currently, two official plugins are available:
---

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
## 🛠️ Tecnologias Utilizadas

## React Compiler
- **React 19** — Biblioteca base para interfaces de usuário reativas.
- **Vite 8** — Bundler moderno ultrarrápido com Hot Module Replacement (HMR).
- **TailwindCSS v4** — Framework utilitário de estilização configurado com tema dark profundo (deep navy `#080d1a`, cards `#0e162c`, bordas `#1e294b`).
- **React Router** — Roteamento declarativo com suporte a rotas protegidas e controle de acesso baseado em papéis (RBAC).
- **Axios** — Cliente HTTP centralizado com interceptores para injeção automática de JWT e tratamento de erros 401.
- **Lucide React** — Conjunto de ícones consistentes e modernos.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
---

## Expanding the Oxlint configuration
## 🚀 Como Executar o Projeto

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
### Pré-requisitos
- **Node.js**: v18+ (recomendado v20 ou v22)
- **npm**: v9+
- Backend **KStock-API** em execução (repositório: [StockApiRepositorio](https://github.com/arthurfaleiros-stack/StockApiRepositorio.git))

---

### 1. Clonar ou Acessar a Pasta do Frontend
Caso esteja no diretório raiz do projeto:
```bash
cd StockFrontEnd
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
*(No Windows PowerShell: `copy .env.example .env`)*

Abra o arquivo `.env` e configure o endereço em que a sua API KStock está rodando:
```env
# URL Base da API RESTful KStock-API
VITE_API_URL=http://localhost:8080
```
> [!NOTE]
> Se o seu backend estiver rodando em outra porta (ex: `http://localhost:3000` ou `http://localhost:5000`), altere o valor da variável `VITE_API_URL`.

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador a URL indicada no terminal (geralmente `http://localhost:5173`).

---

## 🔐 Módulos de Autenticação e Fluxos Implementados

### 1. Login (`/login`)
- Envio de e-mail e senha para `POST /api/v1/auth/login`.
- Ao obter sucesso:
  - Armazena o token JWT de forma segura no `localStorage`.
  - Busca os dados do perfil autenticado via `GET /api/v1/auth/me`.
  - Redireciona o usuário para o `/dashboard`.
- Exibe mensagens de erro em tempo real normalizadas a partir do padrão da API:
  `{ "error": { "code", "message", "details" } }`.
- Atalho direto para o fluxo de redefinição de senha.

### 2. Cadastro de Usuário (`/cadastro`)
- Campos: Nome completo, e-mail, senha e confirmação de senha.
- Consome `POST /api/v1/auth/register`.
- **Validações no Frontend**:
  - Formato de e-mail via regex.
  - Medidor de força de senha em tempo real com critérios (8+ caracteres, maiúsculas, minúsculas, números e símbolos).
  - Confirmação de senha coincidente.
- Tratamento de erros do servidor (como duplicidade de e-mail).
- Ao concluir com sucesso, redireciona para o login com banner de confirmação.

### 3. Fluxo de Redefinição de Senha (Wizard em 3 Etapas — `/esqueci-senha`)
Progresso visual em 3 passos com indicador gráfico de etapas conectadas:
- **Etapa 1 ("Esqueci minha senha")**:
  - Campo de e-mail com validação de formato.
  - Chama `POST /api/v1/auth/forgot-password`.
  - Exibe mensagem genérica informando que, se o e-mail existir, o código foi despachado (sem revelar existência prévia de contas por segurança).
  - Avança para a etapa 2.
- **Etapa 2 ("Verificar código")**:
  - Interface com 6 caixas de dígitos com foco inteligente e suporte a colagem rápida.
  - Chama `POST /api/v1/auth/verify-reset-code`.
  - Trata códigos inválidos ou expirados com mensagens diretas.
  - Botão de reenvio de código com **contador regressivo de 60 segundos** respeitando limites de taxa de envio.
  - Botão para alterar o e-mail e retornar à etapa 1.
- **Etapa 3 ("Definir nova senha")**:
  - Campos de nova senha e confirmação com medidor visual de força.
  - Chama `POST /api/v1/auth/reset-password` enviando `email`, `codigo` e `novaSenha`.
  - Ao sucesso, redireciona para `/login` com confirmação.
> [!IMPORTANT]
> O e-mail e o código validado são mantidos **estritamente em memória (React State)** entre as etapas, sem persistência em `localStorage`.

---

## 🛡️ Controle de Acesso por Papéis (RBAC)

A navegação da sidebar e a proteção de rotas no frontend são condicionais ao perfil (`perfil` / `role`) retornado por `GET /api/v1/auth/me`:

| Recurso / Rota | ADMIN | GERENTE | OPERADOR | Descrição |
| :--- | :---: | :---: | :---: | :--- |
| **Dashboard** (`/dashboard`) | ✅ | ✅ | ✅ | Visão geral de métricas, movimentações recentes e KPIs. |
| **Produtos** (`/produtos`) | ✅ | ✅ | ✅ | Catálogo completo com busca, filtros de categoria e status de estoque. |
| **Movimentações** (`/movimentacoes`) | ✅ | ✅ | ✅ | Registro e listagem de entradas e saídas de estoque. |
| **Categorias** (`/categorias`) | ✅ | ✅ | ❌ | Gestão de taxonomias do inventário. |
| **Fornecedores** (`/fornecedores`) | ✅ | ✅ | ❌ | Cadastro e contatos de fornecedores industriais. |
| **Histórico & Logs** (`/historico`) | ✅ | ✅ | ❌ | Trilha de auditoria cronológica das operações no sistema. |
| **Usuários** (`/usuarios`) | ✅ | ❌ | ❌ | Gestão de acessos, perfis e permissões da equipe. |

---

## 🌐 Cliente HTTP Central (`src/api/client.js`)

- **BaseURL**: Dinamicamente lida de `import.meta.env.VITE_API_URL` com fallback para `http://localhost:8080`.
- **Request Interceptor**: Anexa automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as requisições autenticadas.
- **Response Interceptor**:
  - Captura status `401 Unauthorized` de chamadas autenticadas, revoga a credencial local, emite aviso ao usuário e o redireciona ao login.
  - Ignora o redirect automático em tentativas falhas de login/recuperação para exibir os erros adequados na tela.
  - Normaliza payloads de erro no formato `{ error: { code, message, details } }`.

---

## 📁 Estrutura de Pastas do Projeto

```
src/
├── api/
│   ├── auth.js               # Endpoints /auth (login, register, forgot, verify, reset, me)
│   ├── client.js             # Instância Axios e interceptores globais
│   └── inventory.js          # Chamadas para produtos, movimentações, categorias, etc.
├── components/
│   ├── common/               # Button, Input, Card, Badge, Alert, StepProgress
│   ├── layout/               # AppLayout, Sidebar, Navbar
│   └── routing/              # ProtectedRoute, GuestRoute
├── context/
│   ├── AuthContext.jsx       # Provedor global de estado de autenticação e RBAC
│   ├── authContextDef.js     # Definição do contexto React
│   └── useAuth.js            # Hook de acesso ao contexto de autenticação
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ForgotPasswordWizard.jsx  # Wizard 3 etapas em memória
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── produtos/
│   │   └── ProdutosPage.jsx
│   ├── movimentacoes/
│   │   └── MovimentacoesPage.jsx
│   ├── categorias/
│   │   └── CategoriasPage.jsx
│   ├── fornecedores/
│   │   └── FornecedoresPage.jsx
│   ├── historico/
│   │   └── HistoricoPage.jsx
│   ├── usuarios/
│   │   └── UsuariosPage.jsx
│   └── NotFoundPage.jsx
├── utils/
│   ├── errorParser.js        # Parser dos erros padronizados da API
│   └── validators.js         # Validações de regex de e-mail e força de senha
├── App.jsx                   # Declaração do roteador e rotas protegidas
├── index.css                 # Tema escuro e importação do TailwindCSS v4
└── main.jsx
```

---

## 🧪 Comandos Disponíveis

```bash
# Iniciar servidor local de desenvolvimento
npm run dev

# Compilar para produção (geração da pasta dist)
npm run build

# Análise estática de código e linter
npm run lint

# Pré-visualizar build de produção
npm run preview
```
