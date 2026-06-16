# Roteamento REST com Express e TypeScript

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vue.js](https://img.shields.io/badge/Vue.js-3-green?logo=vue.js)
![Pinia](https://img.shields.io/badge/Pinia-2-ffd859?logo=vue.js&logoColor=black)
![Vuelidate](https://img.shields.io/badge/Vuelidate-2-4DBA87?logo=vue.js&logoColor=white)
![PrimeVue](https://img.shields.io/badge/PrimeVue-4-00bcd4?logo=vue.js&logoColor=white)
![Vue Router](https://img.shields.io/badge/Vue_Router-4-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-4-black?logo=express&logoColor=white)
![REST](https://img.shields.io/badge/RESTful-API-blue?logo=rest)
![Status Code](https://img.shields.io/badge/Status_Code-200%2C404%2C500-green)
![Endpoint](https://img.shields.io/badge/Endpoint-REST-orange)
![Verb](https://img.shields.io/badge/HTTP_Verb-GET%2CPOST%2CPATCH%2CDELETE-yellow)
![Status](https://img.shields.io/badge/status-estudo-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Atividade Prática

Este projeto foi desenvolvido para aplicar os principais conceitos de desenvolvimento de APIs REST com Express e TypeScript. A aplicação realiza o gerenciamento de produtos e pedidos por meio de endpoints estruturados de acordo com as boas práticas da arquitetura REST, utilizando Query Strings para filtragem de resultados, Params para identificação de recursos específicos e Body para o recebimento de dados.

Além das operações de consulta, criação, atualização e cancelamento de recursos, a solução também utiliza middlewares para registro de logs das requisições e validação dos dados recebidos. As funcionalidades foram organizadas em routers independentes para Produtos e Pedidos, promovendo uma estrutura mais limpa, modular e de fácil manutenção.

### Objetivos principais

- Centralizar estado de autenticação em um store Pinia (`authStore`).
- Validar formulários de login e registro com Vuelidate.
- Implementar feedback visual com Toast do PrimeVue.
- Exibir loading state durante operações assíncronas.
- Proteger rotas com guards baseados em autenticação e papel do usuário.
- Criar layouts responsivos com Tailwind CSS.
- Implementar experiência de consumidor, perfil e administrativa com navegação segura.
- Consumir API de produtos e combinar com produtos locais.

## Descrição do projeto

A aplicação simula uma plataforma de e-commerce desenvolvida com Vue 3, TypeScript e Options API no frontend, integrada a um backend em Express e TypeScript por meio de uma API REST. O backend é disponibilizado através de funções serverless na Vercel, permitindo uma arquitetura leve e escalável para o gerenciamento de produtos e pedidos, seguindo boas práticas de desenvolvimento full stack e organização de aplicações web.

**O projeto inclui:**

- **Autenticação centralizada** em `frontend/src/stores/auth.ts`.
- **Validação segura** de login e cadastro com Vuelidate.
- **Feedback visual** com Toast do PrimeVue.
- **Roteamento protegido** por guards de autenticação e autorização.
- **Catálogo híbrido**: produtos de API mesclados com produtos locais em `localStorage`.
- **Backend serverless** em `api/`, com lógica de rota compartilhada em `src/`.
- **Área administrativa** com gestão de produtos locais e visualização de dados.
- **Layouts separados** para consumidor, admin e perfil.

## Centralização de autenticação com Pinia

O `authStore` (`frontend/src/stores/auth.ts`) é a fonte única de verdade para autenticação:

```ts
export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(authService.getCurrentUser());
  const token = ref<string | null>(null);
  const loading = ref(false);
  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  async function login(email: string, password: string) {
    loading.value = true;
    const res = authService.login(email, password);
    if (res.ok) {
      user.value = res.user;
      token.value = "fake-token";
    }
    loading.value = false;
    return res;
  }

  async function register(payload) {
    loading.value = true;
    const res = authService.register(payload);
    if (res.ok) {
      authService.login(payload.email, payload.password);
      user.value = res.user;
      token.value = "fake-token";
    }
    loading.value = false;
    return res;
  }

  function logout() {
    authService.logout();
    user.value = null;
    token.value = null;
  }

  return { user, token, loading, isAuthenticated, isAdmin, login, register, logout };
});
```

Todas as views acessam autenticação via `useAuthStore()`.

## Validação com Vuelidate

Formulários de login e registro validam campos em tempo real:

- **Email**: obrigatório e formato válido.
- **Senha**: obrigatório e mínimo de 6 caracteres.
- **Nome**: obrigatório no registro.
- Exibição de mensagens de erro abaixo de cada campo.
- Botão de submit desabilitado até a validação passar.

## Feedback visual com PrimeVue Toast

Operações de autenticação e cadastro exibem feedback em tempo real:

- **Sucesso**: login/cadastro bem-sucedido.
- **Erro**: credenciais inválidas ou campos obrigatórios ausentes.
- **Loading**: spinner durante a operação.

## Arquitetura de rotas

As rotas estão definidas em `frontend/src/router/index.ts`.

Rotas do consumidor:

- `/` -> `HomeView`
- `/products` -> `ProductsView`
- `/products/:category` -> `ProductsView`
- `/product/:id` -> `ProductDetailView`
- `/cart` -> `CartView`
- `/checkout` -> `CheckoutView`
- `/order-success` -> `OrderSuccessView`
- `/login` -> `LoginView`
- `/register` -> `RegisterView`
- `/profile/*` -> `ProfileLayout` e views de perfil

Rotas administrativas:

- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/users`
- `/admin/reports`
- `/admin/settings`

Rota de fallback:

- `/:pathMatch(.*)*` -> `NotFoundView`

## Navegação e layouts

A navegação é feita com `router-link` e componentes PrimeVue.

### Layout do consumidor

`ConsumerLayout.vue` mantém cabeçalho e carrinho visíveis entre páginas.

### Layout administrativo

`AdminLayout.vue` apresenta menu lateral e rotas filhas para organização.

## Guards e proteção de acesso

O `router.beforeEach` aplica proteção com base em `authStore`:

- `requiresAdmin` protege `/admin/*`.
- `requiresAuth` protege `/order-success` e `/profile/*`.
- `requiresCheckout` impede checkout com carrinho vazio.
- `guestOnly` redireciona usuários logados de `/login` e `/register`.

## Seção desafio: experiência administrativa

A área administrativa usa PrimeVue para gestão de dados:

- `DataTable` para listagens.
- `Breadcrumb` para navegação.
- Rotas filhas para separar funcionalidades.

### Exemplos implementados

- `AdminProductsView.vue` usa `DataTable`.
- `AdminCategoriesView.vue`, `AdminOrdersView.vue` e `AdminUsersView.vue` usam tabelas.
- `AppBreadcrumb.vue` exibe breadcrumbs dinâmicos.

## Backend REST API

A API é exposta como funções serverless em `api/`, usando `src/` para rotas, modelos e middlewares compartilhados.

- `api/products.ts` — função serverless de produtos.
- `api/orders.ts` — função serverless de pedidos.
- `src/routes/products.ts` — rota de produtos e filtros.
- `src/routes/orders.ts` — rota de pedidos.
- `src/middlewares/logger.ts` — middleware de log.
- `src/middlewares/validateBody.ts` — validação de body.

### Semântica REST e status code

A API usa verbos HTTP para descrever operações:

- `GET` para recuperar recursos.
- `POST` para criar pedidos.
- `PATCH` para atualizar pedidos parcialmente.
- `DELETE` para remover pedidos.

Os endpoints retornam status codes semânticos como:

- `200 OK` em requisições bem-sucedidas.
- `201 Created` em criação de recursos.
- `400 Bad Request` em dados inválidos.
- `404 Not Found` quando o recurso não existe.
- `500 Internal Server Error` em erros de servidor inesperados.

### Endpoints principais

- `GET /api/products`
- `GET /api/products/category/:slug`
- `GET /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `DELETE /api/orders/:id`

## Produto e catálogo

O `frontend/src/services/productService.ts` mapeia produtos da API e produtos locais:

- usa `title` ou `name` como nome do produto
- usa placeholder quando não há `thumbnail`
- retorna categorias locais via `categoryService`
- combina dados da API com produtos locais

## Estrutura do projeto

```
express-typescript-rest/
├── api/
│   ├── orders.ts
│   └── products.ts
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AppBreadcrumb.vue
│   │   │   ├── EmptyCart.vue
│   │   │   └── ProductCard.vue
│   │   ├── layouts/
│   │   │   ├── AdminLayout.vue
│   │   │   ├── ConsumerLayout.vue
│   │   │   └── ProfileLayout.vue
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── cartService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── favoritesService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── productService.ts
│   │   │   ├── storageKeys.ts
│   │   │   └── storeSettingsService.ts
│   │   ├── stores/
│   │   │   └── auth.ts
│   │   ├── utils/
│   │   │   ├── brValidation.ts
│   │   │   ├── csv.ts
│   │   │   ├── format.ts
│   │   │   ├── orderLabels.ts
│   │   │   └── whatsapp.ts
│   │   ├── views/
│   │   │   ├── AdminCategoriesView.vue
│   │   │   ├── AdminDashboardView.vue
│   │   │   ├── AdminOrdersView.vue
│   │   │   ├── AdminProductsView.vue
│   │   │   ├── AdminReportsView.vue
│   │   │   ├── AdminSettingsView.vue
│   │   │   ├── AdminUsersView.vue
│   │   │   ├── CartView.vue
│   │   │   ├── CheckoutView.vue
│   │   │   ├── HomeView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── NotFoundView.vue
│   │   │   ├── OrderSuccessView.vue
│   │   │   ├── ProductDetailView.vue
│   │   │   ├── ProductsView.vue
│   │   │   ├── ProfileDashboardView.vue
│   │   │   ├── ProfileEditView.vue
│   │   │   ├── ProfileFavoritesView.vue
│   │   │   ├── ProfileOrdersView.vue
│   │   │   ├── ProfileTrackingView.vue
│   │   │   └── RegisterView.vue
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── classes/
│   │   ├── Cart.ts
│   │   └── User.ts
│   ├── middlewares/
│   │   ├── logger.ts
│   │   └── validateBody.ts
│   ├── models/
│   │   ├── CartItem.ts
│   │   ├── Category.ts
│   │   ├── LocalCategory.ts
│   │   ├── Order.ts
│   │   ├── PaymentSettings.ts
│   │   ├── Product.ts
│   │   ├── StoreSettings.ts
│   │   └── UserRecord.ts
│   ├── routes/
│   │   ├── orders.ts
│   │   └── products.ts
│   ├── utils/
│   │   └── hashId.ts
│   └── index.ts
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

## Tecnologias utilizadas

- **Vue 3** com Options API
- **TypeScript**
- **Pinia**
- **Vuelidate**
- **PrimeVue**
- **Tailwind CSS**
- **Vue Router 4**
- **Vite**
- **Express**

## Como executar o projeto

### Clone o repositório

```bash
git clone https://github.com/isaias-oliveira-fullstack/express-typescript-rest.git
```

### Entre na pasta do projeto

```bash
cd express-typescript-rest
```

### Instale as dependências

```bash
npm install
cd frontend
npm install
```

### Execute o backend local

```bash
npm run build
npm start
```

### Execute o frontend

```bash
cd frontend
npm run dev
```

Abra no navegador o endereço informado pelo Vite.

### Build de produção

```bash
cd frontend
npm run build
npm run preview
```

Acesse a aplicação no navegador no endereço exibido pelo Vite.
(geralmente `http://localhost:5173`).

## Observações

O projeto entrega um backend REST com tratamento de status e validações, ao mesmo tempo em que o frontend atual usa autenticação segura, categorias locais e experiência administrativa.

## Contribuição

Se quiser contribuir com feedback ou sugestões, fique à vontade para abrir uma **[Issue](https://github.com/isaias-oliveira-fullstack/express-typescript-rest/issues)** ou **[enviar ideias](https://github.com/isaias-oliveira-fullstack/express-typescript-rest/pulls)**. 

## Deploy

O projeto está publicado e pode ser acessado diretamente pelo navegador.

**Acesse a aplicação:** https://express-typescript-rest.vercel.app

> Não é necessário instalação — basta abrir o link.

## Licença

Este projeto está licenciado sob a **Licença MIT**.

Veja o arquivo **[LICENSE](./LICENSE)** para mais detalhes.

## Autor

Projeto desenvolvido por **Isaias Oliveira**.  
Conecte-se comigo no **[in/isaias-oliveira-dev](https://www.linkedin.com/in/isaias-oliveira-dev/)**
