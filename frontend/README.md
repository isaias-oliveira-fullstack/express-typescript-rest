# Frontend - Roteamento REST com Express e TypeScript

O projeto frontend usa Vue 3, TypeScript, Pinia, Vuelidate, PrimeVue e Tailwind CSS para implementar:

- **Autenticação centralizada**: estado gerenciado por store Pinia (`authStore`)
- **Validação de formulários**: login e registro com Vuelidate
- **Feedback visual**: Toast do PrimeVue com loading state
- **Roteamento protegido**: guards baseados em autenticação e papel do usuário
- **Layout responsivo**: consumidor, perfil e administrativo com Tailwind CSS

## O que está incluído

- **Vue 3** com Options API
- **TypeScript** para tipagem estática
- **Pinia** para gerenciamento centralizado de estado
- **Vuelidate** para validação de formulários
- **PrimeVue** para componentes de interface
- **Tailwind CSS** para estilização responsiva
- **Vue Router 4** para navegação e proteção de rotas
- **Stores composables**: `authStore` como fonte única de verdade para autenticação

## Funcionalidades principais

- **Autenticação centralizada**: login e registro com validação Vuelidate
- **Feedback visual**: Toast para sucesso/erro e loading state durante operações
- **Store Pinia**: `authStore` como fonte única de estado de autenticação
- Página inicial com vitrine de produtos
- Detalhes do produto em rota dinâmica `/product/:id`
- Carrinho de compras e checkout com validação
- Rotas de autenticação: login e registro
- Área de perfil com rotas filhas (dashboard, edição, pedidos, favoritos, tracking)
- Área administrativa com dashboard, produtos, categorias, pedidos, usuários, relatórios e configurações
- Proteção de rotas usando `beforeEach` com guards
- Navegação com `router-link` e `Menubar` do PrimeVue
- Breadcrumbs dinâmicos para orientação do usuário

## Autenticação centralizada com Pinia

O `authStore` (`src/stores/auth.ts`) centraliza todo o estado de autenticação:

```typescript
export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(authService.getCurrentUser());
  const loading = ref(false);
  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  async function login(email: string, password: string) {
    loading.value = true;
    // retorna { ok: true, user } ou { ok: false, error }
  }

  async function register(payload) {
    loading.value = true;
    // valida dados e cria novo usuário
  }

  function logout() {
    user.value = null;
  }

  return { user, loading, isAuthenticated, isAdmin, login, register, logout };
});
```

Todas as views usam `useAuthStore()` como fonte única:

```typescript
const auth = useAuthStore();
if (auth.isAuthenticated) {
  // usuário autenticado
}
```

## Validação com Vuelidate

Formulários de login e registro incluem validação em tempo real:

- Email obrigatório e formato válido
- Senha obrigatória com mínimo 6 caracteres
- Nome obrigatório para registro
- Mensagens de erro específicas abaixo de cada campo
- Botão de submit desabilitado até validação passar

## Feedback visual com PrimeVue Toast

Operações de autenticação exibem feedback contextual:

- Mensagens de sucesso ao fazer login/registro
- Mensagens de erro para credenciais inválidas
- Loading state durante requisições assíncronas
- Redirecionamento automático após sucesso

## Arquitetura de rotas

As rotas estão definidas em `src/router/index.ts`.

### Rotas do consumidor

- `/` -> `HomeView`
- `/products` -> `ProductsView`
- `/products/:category` -> filtros por categoria
- `/product/:id` -> `ProductDetailView` (rota dinâmica)
- `/cart` -> `CartView`
- `/checkout` -> `CheckoutView`
- `/order-success` -> `OrderSuccessView`
- `/login` e `/register`
- `/profile/*` -> rotas filhas do perfil

### Rotas administrativas

- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/users`
- `/admin/reports`
- `/admin/settings`

### Rota de fallback

- `/:pathMatch(.*)*` -> `NotFoundView`

## Layouts

### Consumidor

O `ConsumerLayout.vue` mantém o cabeçalho e o acesso ao carrinho visíveis a cada troca de página.
Isso garante que o fluxo de compras seja contínuo e que o usuário tenha navegação rápida entre as seções.

### Administrador

O `AdminLayout.vue` apresenta estrutura de dashboard com menu lateral e rotas filhas para organização das páginas administrativas.
A separação visual ajuda a distinguir claramente a área de gestão da área de compra.

### Perfil

O `ProfileLayout.vue` agrupa as rotas do perfil do usuário em um layout comum, com navegação e breadcrumbs próprios.

## Segurança e guards

A validação de acesso é feita em `src/router/index.ts` usando `router.beforeEach` com o `authStore`:

- `requiresAdmin` garante que apenas usuários com perfil ADMIN acessem `/admin/*`.
- `requiresAuth` protege páginas que exigem login como `/profile/*` e `/order-success`.
- `requiresCheckout` valida o fluxo de checkout e impede acesso direto se o carrinho não estiver válido.
- `guestOnly` redireciona usuários autenticados de volta para home quando tentam acessar `/login` ou `/register`.

Os guards consultam `useAuthStore()` como fonte única de verdade:

```typescript
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: "login" });
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: "home" });
  } else {
    next();
  }
});
```

## Recursos PrimeVue usados

- `Menubar` para navegação principal
- `DataTable` para listagens administrativas
- `Breadcrumb` para exibir caminho das rotas
- `Button`, `Card`, `InputNumber` e outros componentes de formulários e listas

## Estrutura do frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── AppBreadcrumb.vue
│   │   ├── EmptyCart.vue
│   │   └── ProductCard.vue
│   ├── layouts/
│   │   ├── AdminLayout.vue
│   │   ├── ConsumerLayout.vue
│   │   └── ProfileLayout.vue
│   ├── stores/
│   │   └── auth.ts
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   └── storageKeys.ts
│   ├── views/
│   │   ├── AdminDashboardView.vue
│   │   ├── AdminProductsView.vue
│   │   ├── CartView.vue
│   │   ├── CheckoutView.vue
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── ProductDetailView.vue
│   │   └── RegisterView.vue
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── package.json
└── tsconfig.json
```
## Como executar

No diretório `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço exibido pelo Vite no navegador.

## Observação

Este frontend implementa a **Atividade Prática: Roteamento REST com Express e TypeScript**, com:

- ✅ **Pinia**: store centralizado (`authStore`) para estado de autenticação
- ✅ **Vuelidate**: validação de formulários de login e registro
- ✅ **PrimeVue**: componentes de UI, Toast e feedback visual
- ✅ **Tailwind CSS**: estilização responsiva
- ✅ **Vue Router**: guards baseados em autenticação e papel do usuário
- ✅ **Loading state**: indicadores visuais durante operações
- ✅ **Múltiplas áreas**: consumidor, perfil e administrativo com layouts separados
