<template>
  <NuxtImg v-if="!isFailed" :src="resolvedSrc" v-bind="$attrs" @error="onError" />
  <img v-else :src="resolvedSrc" v-bind="$attrs" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  src: string;
}>();

const runtimeConfig = useRuntimeConfig();
const { siteUrl } = runtimeConfig.public;

const resolvedSrc = computed(() => {
  if (props.src.startsWith('http')) return props.src;
  if (process.env.NODE_ENV !== 'production') return props.src;
  return siteUrl + props.src;
});

const isFailed = ref(false);
if (process.env.NODE_ENV !== 'production') isFailed.value = true;

const onError = () => {
  isFailed.value = true;
};
</script>

<style scoped></style>
