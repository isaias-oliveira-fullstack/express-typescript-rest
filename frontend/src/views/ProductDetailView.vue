<script lang="ts">
import { defineComponent } from "vue";
import { Product } from "@shared/models/Product";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { useAuthStore } from "../stores/auth";
import { favoritesService } from "../services/favoritesService";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "ProductDetailView",

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      product: null as Product | null,
      loading: true,
      error: "" as string,
      qty: 1,
      favTick: 0,

      home: { label: "Início", to: "/" },
      items: [] as Array<{ label: string; to?: string }>,
    };
  },

  computed: {
    heroImage(): string {
      if (!this.product) return "";
        return (
          this.product.mainImage ||
          this.product.thumbnail ||
          "https://via.placeholder.com/800x600?text=Sem+imagem"
        );
    },
    isFavorite(): boolean {
      this.favTick;
      const auth = useAuthStore();
      const u = auth.user;
      if (!u || !this.product) return false;
      return favoritesService.has(u.id, this.product.id);
    },
  },

  watch: {
    id: {
      immediate: true,
      handler() {
        void this.load();
      },
    },
  },

  methods: {
    formatBRL,
    async load(): Promise<void> {
      this.loading = true;
      this.error = "";
      const numId = Number(this.id);
      if (Number.isNaN(numId)) {
        this.error = "Produto inválido.";
        this.product = null;
        this.loading = false;
        return;
      }
      try {
        this.product = await productService.getById(numId);
        this.items = [
        { label: "Produtos", to: "/products" },
        { label: this.product?.name ?? "Produto", to: `/product/${this.product?.id}` },
      ];
        if (!this.product) this.error = "Produto não encontrado.";
      } catch {
        this.error = "Erro ao carregar o produto.";
      } finally {
        this.loading = false;
      }
    },
    addToCart(): void {
      if (!this.product) return;
      cartService.addItem(this.product, Math.max(1, this.qty));
      this.$toast.add({
        severity: "success",
        summary: "Adicionado ao carrinho",
        detail: this.product.name,
        life: 3000,
        closable: false,
      });
    },
    toggleFavorite(): void {
      const auth = useAuthStore();
      const u = auth.user;
      if (!u) {
        this.$router.push({ name: "login", query: { redirect: this.$route.fullPath } });
        return;
      }
      if (!this.product) return;
      const was = favoritesService.has(u.id, this.product.id);
      favoritesService.toggle(u.id, this.product.id);
      this.favTick += 1;
      this.$toast.add({
        severity: "success",
        summary: was ? "Removido dos favoritos" : "Salvo nos favoritos",
        life: 2000,
      });
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <AppBreadcrumb :home="home" :items="items" />
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton height="20rem" class="rounded-lg" />
      <div class="space-y-3">
        <Skeleton width="70%" height="2rem" />
        <Skeleton width="40%" height="1.5rem" />
        <Skeleton height="6rem" />
      </div>
    </div>

    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="space-y-3">
        <div class="rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40 p-4">
          <img
            v-if="heroImage"
            :src="heroImage"
            :alt="product.name"
            class="w-full max-h-96 object-contain"
          />
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            <i class="pi pi-image text-4xl" aria-hidden="true" />
          </div>
        </div>
        <div v-if="product.galleryImages?.length" class="grid grid-cols-4 gap-2">
          <img
            v-for="(g, idx) in product.galleryImages"
            :key="idx"
            :src="g"
            alt=""
            class="h-16 w-full object-cover rounded border border-gray-200 dark:border-gray-600"
          />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 m-0">{{ product.category.title }}</p>
            <h1 class="text-2xl font-bold m-0 mt-1">{{ product.name }}</h1>
            <p v-if="product.brand" class="m-0 mt-2 text-sm text-gray-600 dark:text-gray-400">
              Marca: {{ product.brand }}
            </p>
          </div>
          <Button
            :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
            :severity="isFavorite ? 'danger' : 'secondary'"
            outlined
            rounded
            aria-label="Favoritar"
            @click="toggleFavorite"
          />
        </div>

        <p class="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 m-0">
          {{ formatBRL(product.price) }}
        </p>

        <div v-if="product.colors?.length" class="text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-300">Cores: </span>
          <span class="text-gray-600 dark:text-gray-400">{{ product.colors.join(", ") }}</span>
        </div>
        <div v-if="product.sizes?.length" class="text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-300">Tamanhos: </span>
          <span class="text-gray-600 dark:text-gray-400">{{ product.sizes.join(", ") }}</span>
        </div>
        <div v-if="product.extraAttributes?.length" class="text-sm text-gray-600 dark:text-gray-400">
          <span v-for="(a, i) in product.extraAttributes" :key="i" class="block">• {{ a }}</span>
        </div>

        <p v-if="product.description" class="text-gray-700 dark:text-gray-300 leading-relaxed m-0">
          {{ product.description }}
        </p>

        <div v-if="product.stock !== undefined" class="text-sm text-gray-600 dark:text-gray-400">
          Estoque (referência): {{ product.stock }}
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <label class="text-sm font-medium" for="qty">Quantidade</label>
          <InputNumber 
            id="qty" 
            v-model="qty" 
            :min="1" 
            show-buttons 
            class="
              [&_.p-inputnumber-button]:w-5!
              [&_.p-inputnumber-button]:pt-[0.2rem]!  
              [&_.p-inputnumber-button]:bg-transparent! 
              [&_.p-inputnumber-button]:border-0!
              [&_.p-inputnumber-button]:shadow-none!
              [&_.pi]:text-[0.75rem]!"
            buttons-class="bg-transparent! w-4!"
            increment-button-icon="pi pi-plus"
            decrement-button-icon="pi pi-minus"
            :input-class="`
              ${qty >= 100 ? 'w-14!' : qty >= 10 ? 'w-13!' : 'w-12!'}
              bg-transparent!
              text-sm
              text-gray-700!
              dark:text-gray-400!
              py-[0.20rem]! 
              p-2!
              pointer-events-none
              border-[0.12rem]!
              border-gray-300!
              dark:border-gray-600!
            `"
           />
        </div>

        <div class="flex flex-wrap gap-2">
          <Button label="Adicionar ao carrinho" icon="pi pi-cart-plus" @click="addToCart" />
          <RouterLink v-slot="{ navigate }" to="/cart" custom>
            <Button label="Ver carrinho" severity="secondary" outlined @click="navigate" />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
