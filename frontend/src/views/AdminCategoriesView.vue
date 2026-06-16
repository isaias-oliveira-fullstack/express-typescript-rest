<script lang="ts">
import { defineComponent } from "vue";
import type { LocalCategory } from "@shared/models/LocalCategory";
import { categoryService } from "../services/categoryService";

export default defineComponent({
  name: "AdminCategoriesView",

  data() {
    return {
      rows: [] as LocalCategory[],
      loading: false,
      dialogVisible: false,
      editingId: null as number | null,
      form: {
        name: "",
        slug: "",
      },
    };
  },

  mounted() {
    this.reload();
  },

  methods: {
    reload(): void {
      this.loading = true;
      try {
        this.rows = categoryService.list();
      } finally {
        this.loading = false;
      }
    },
    openCreate(): void {
      this.editingId = null;
      this.form = { name: "", slug: "" };
      this.dialogVisible = true;
    },
    openEdit(c: LocalCategory): void {
      this.editingId = c.id;
      this.form = { name: c.name, slug: c.slug };
      this.dialogVisible = true;
    },
    save(): void {
      if (!this.form.name.trim()) {
        this.$toast.add({ severity: "warn", summary: "Nome obrigatório", life: 2500 });
        return;
      }
      if (this.editingId === null) {
        const res = categoryService.create(this.form.name);
        if (!res.ok) {
          this.$toast.add({ severity: "error", summary: "Categoria", detail: res.error, life: 4000 });
          return;
        }
        this.$toast.add({ severity: "success", summary: "Categoria criada", life: 2500 });
      } else {
        const res = categoryService.update(this.editingId, {
          name: this.form.name,
          slug: this.form.slug.trim() || undefined,
        });
        if (!res.ok) {
          this.$toast.add({ severity: "error", summary: "Categoria", detail: res.error, life: 4000 });
          return;
        }
        this.$toast.add({ severity: "success", summary: "Atualizada", life: 2500 });
      }
      this.dialogVisible = false;
      this.reload();
    },
    confirmDelete(c: LocalCategory): void {
      this.$confirm.require({
        message: `Excluir categoria "${c.name}"?`,
        header: "Confirmar",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          const res = categoryService.remove(c.id);
          if (!res.ok) {
            this.$toast.add({ severity: "error", summary: "Exclusão", detail: res.error, life: 4000 });
            return;
          }
          this.$toast.add({ severity: "success", summary: "Removida", life: 2500 });
          this.reload();
        },
      });
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold m-0">Categorias</h1>
        <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
          CRUD local. Produtos do admin devem usar estas categorias no select.
        </p>
      </div>
      <Button label="Nova categoria" icon="pi pi-plus" @click="openCreate" />
    </div>

    <DataTable :value="rows" :loading="loading" paginator :rows="10" responsive-layout="scroll">
      <Column field="id" header="ID" />
      <Column field="name" header="Nome" />
      <Column field="slug" header="Slug" />
      <Column header="Ações" :exportable="false">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded aria-label="Editar" @click="openEdit(data)" />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            aria-label="Excluir"
            @click="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editingId === null ? 'Nova categoria' : 'Editar categoria'"
      class="w-[min(100%,24rem)]"
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="cn">Nome</label>
          <InputText id="cn" v-model="form.name" class="w-full" />
        </div>
        <div v-if="editingId !== null" class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="cs">Slug (opcional)</label>
          <InputText id="cs" v-model="form.slug" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Salvar" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
