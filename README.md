# agendoor-frontend

Este é o repositório do front-end do projeto Agendoor, desenvolvido com React, Vite e Tailwind CSS.

## Configuração Local

Para configurar e rodar o projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd agendoor-frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Crie o arquivo de variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`:
    ```
    cp .env.example .env
    ```
    Edite o arquivo `.env` e configure a URL da API do backend. Por exemplo:
    ```
    VITE_API_URL=http://localhost:3000/api
    ```
    Se o backend estiver rodando em um domínio diferente, ajuste a URL conforme necessário.

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:5173` (ou outra porta disponível).

## Deploy no Vercel

Para fazer o deploy do `agendoor-frontend` no Vercel, siga estas instruções:

1.  **Pré-requisitos:**
    *   Uma conta Vercel.
    *   Vercel CLI instalado globalmente (`npm i -g vercel`).

2.  **Faça o login no Vercel CLI:**
    ```bash
    vercel login
    ```

3.  **Faça o deploy do projeto:**
    Navegue até a pasta `agendoor-frontend` e execute:
    ```bash
    vercel
    ```
    Siga as instruções para configurar o projeto. O Vercel detectará automaticamente que é um projeto Vite.

4.  **Configure as variáveis de ambiente no Vercel:**
    No painel do Vercel, vá para as configurações do seu projeto e adicione a variável de ambiente `VITE_API_URL` com a URL do seu backend (`agendoor-backend`). Por exemplo:
    ```
    VITE_API_URL=https://your-agendoor-backend.railway.app/api
    ```

5.  **Re-deploy:**
    Após configurar as variáveis de ambiente, o Vercel fará um novo deploy automaticamente ou você pode acionar um manualmente.
