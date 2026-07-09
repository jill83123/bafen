<template>
  <UFileUpload
    v-slot="{ open: openFileUpload }"
    v-model="uploadFiles"
    variant="button"
    accept="image/*"
    multiple
    reset
  >
    <UButton
      :label="isUploading ? '上傳中' : '上傳圖片'"
      color="neutral"
      variant="outline"
      size="sm"
      :leading-icon="isUploading ? 'i-mdi-loading' : 'i-material-symbols-upload-sharp'"
      :disabled="isUploading"
      :ui="{
        leadingIcon: `${isUploading ? 'animate-spin' : ''}`,
      }"
      @click="openFileUpload()"
    />
  </UFileUpload>
</template>

<script lang="ts" setup>
import imageCompression from 'browser-image-compression';

const emit = defineEmits<{
  success: [];
}>();

const toast = useAppToast();

const uploadFiles = ref<File[] | null>(null);
const isUploading = ref(false);

watch(uploadFiles, async (files) => {
  if (!files || isUploading.value) return;

  const selectedFiles = Array.isArray(files) ? files : [files];
  if (selectedFiles.length === 0) return;

  try {
    isUploading.value = true;

    const formData = new FormData();

    // 壓縮與轉格式
    const options = { maxSizeMB: 1, fileType: 'image/webp' };

    const compressionPromises = selectedFiles.map(async (file) => {
      const compressedBlob = await imageCompression(file, options);

      const lastDotIndex = file.name.lastIndexOf('.');
      const baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;

      const webpFile = new File([compressedBlob], `${baseName}.webp`, {
        type: 'image/webp',
      });
      formData.append('images', webpFile);
    });

    await Promise.all(compressionPromises);

    const response = await $fetch('/api/admin/images/upload', {
      method: 'POST',
      body: formData,
    });

    toast.success(`成功上傳 ${response.count} 張圖片`);
    emit('success');
  } catch (error) {
    toast.error(getErrorMessage(error, '圖片上傳失敗，請稍後再試'));
  } finally {
    uploadFiles.value = null;
    isUploading.value = false;
  }
});
</script>

<style scoped></style>
