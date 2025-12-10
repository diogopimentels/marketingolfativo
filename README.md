# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/49cb41a8-fb96-4377-9ad2-7f2a0099cd0b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/49cb41a8-fb96-4377-9ad2-7f2a0099cd0b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack moderna e robusta para garantir performance, escalabilidade e uma excelente experiência de desenvolvedor.

### **Frontend** (Client)
A interface do usuário é construída com **React** e **Vite**, focando em performance e interatividade.

*   **Core:**
    *   [React](https://react.dev/) - Biblioteca para construção de interfaces.
    *   [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript.
    *   [Vite](https://vitejs.dev/) - Build tool e dev server ultra-rápido.

*   **UI & Estilização:**
    *   [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first.
    *   [Shadcn/ui](https://ui.shadcn.com/) - Coleção de componentes reutilizáveis baseados em Radix UI.
    *   [Radix UI](https://www.radix-ui.com/) - Primitivos de UI acessíveis e sem estilo.
    *   [Framer Motion](https://www.framer.com/motion/) - Biblioteca de animações produção-ready.
    *   [Lucide React](https://lucide.dev/) - Biblioteca de ícones leve e consistente.

*   **Gerenciamento de Estado & Dados:**
    *   [TanStack Query (React Query)](https://tanstack.com/query/latest) - Gerenciamento de estado assíncrono e data fetching.
    *   [React Hook Form](https://react-hook-form.com/) - Gerenciamento de formulários performático.
    *   [Zod](https://zod.dev/) - Validação de schemas TypeScript-first (usado em conjunto com React Hook Form).

*   **Roteamento:**
    *   [React Router](https://reactrouter.com/) - Roteamento declarativo para aplicações React.

*   **Outras Bibliotecas Importantes:**
    *   **Sonner**: Componente de toast notifications.
    *   **Recharts**: Biblioteca de gráficos composável.
    *   **Vaul**: Componente de drawer (gaveta) para React.
    *   **Input OTP**: Componente para inputs de One Time Password.

### **Backend** (Server)
O servidor é uma API leve construída com **Node.js**, responsável por orquestrar integrações e lógica de negócio.

*   **Core:**
    *   [Node.js](https://nodejs.org/) - Runtime JavaScript.
    *   [Express](https://expressjs.com/) - Framework web minimalista para Node.js.

*   **Utilitários:**
    *   **Axios**: Cliente HTTP baseado em Promises para navegador e Node.js.
    *   **Cors**: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
    *   **Dotenv**: Carregamento de variáveis de ambiente do arquivo `.env`.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/49cb41a8-fb96-4377-9ad2-7f2a0099cd0b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
