<template>
  <UModal
    :title="`刪除${props.itemTypeName}`"
    :ui="{
      body: 'flex flex-col gap-2 text-center',
    }"
  >
    <template #body>
      <Icon
        name="i-lucide-trash-2"
        size="44"
        mode="svg"
        class="text-error bg-error-100 mx-auto rounded-full p-2"
      />

      <div v-if="props.itemTitle" class="font-serif text-xl font-medium">
        {{ props.itemTitle }}
      </div>

      <div v-if="props.itemImage" class="ring-default order-3 p-1 ring">
        <img :src="props.itemImage" alt="要刪除的圖片" class="w-full object-cover" />
      </div>

      <p>確定要刪除嗎？此動作將<span class="text-error font-medium">無法復原</span>。</p>
    </template>

    <template #footer>
      <div class="ml-auto flex gap-3">
        <UButton
          label="取消"
          color="neutral"
          variant="link"
          size="sm"
          @click="emit('close', false)"
        />
        <UButton
          label="確定"
          color="error"
          variant="solid"
          size="sm"
          @click="emit('close', true)"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    itemTypeName?: string;
    itemTitle?: string;
    itemImage?: string;
  }>(),
  {
    itemTypeName: '',
    itemTitle: '',
    itemImage: '',
  },
);

const emit = defineEmits<{
  close: [confirmed: boolean];
}>();
</script>

<style scoped></style>
