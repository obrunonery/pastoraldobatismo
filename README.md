# Sistema de Gestão da Pastoral do Batismo

Este é o sistema centralizado de gestão da Pastoral do Batismo da Paróquia São João Paulo II. O objetivo é substituir a fragmentação de canais de comunicação e planilhas por uma plataforma robusca para acompanhamento de batismos, escalas, reuniões e controle financeiro.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React + Vite + TailwindCSS + Shadcn/UI
- **Backend**: Express + tRPC
- **Banco de Dados**: Turso (SQLite) + Drizzle ORM
- **Autenticação**: Clerk

## 🛠️ Como Iniciar o Projeto

### Pré-requisitos

- Node.js (v18 ou superior)
- pnpm

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Configure as variáveis de ambiente baseando-se no arquivo `.env.example`.

### Execução em Desenvolvimento

Para rodar o projeto localmente:
```bash
pnpm dev
```

### Build e Produção

Para gerar o build e rodar em produção:
```bash
pnpm build
pnpm start
```

## 📂 Estrutura do Projeto

- `client/`: Código fonte do frontend.
- `server/`: Código fonte do backend e API.
- `shared/`: Tipagens e esquemas compartilhados entre frontend e backend.
- `drizzle/`: Migrações e esquemas do banco de dados.

---
© 2026 Pastoral do Batismo - Paróquia São João Paulo II
