<template>
  <div>
    <input type="file" accept="image/*" :disabled="isUploading" multiple @change="onFileSelect" />
    <p>{{ isUploading ? '上傳中...' : '' }}</p>
  </div>
</template>

<script lang="ts" setup>
import imageCompression from 'browser-image-compression';

const toast = useAppToast();

const isUploading = ref(false);

const onFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;

  try {
    const files = target.files;
    if (!files || files.length === 0) return;

    isUploading.value = true;

    const formData = new FormData();

    // 壓縮與轉格式
    const options = { maxSizeMB: 1, fileType: 'image/webp' };

    const compressionPromises = Array.from(files).map(async (file) => {
      const compressedBlob = await imageCompression(file, options);
      const webpFile = new File([compressedBlob], `${file.name.split('.')[0]}.webp`, {
        type: 'image/webp',
      });
      formData.append('images', webpFile);
    });

    await Promise.all(compressionPromises);

    const response = await $fetch('/api/admin/images/upload', {
      method: 'POST',
      body: formData,
    });
    toast.success(`已成功上傳 ${response.data.count} 張圖片`);
  } catch (error) {
    toast.error(getErrorMessage(error, '圖片上傳失敗'));
  } finally {
    target.value = '';
    isUploading.value = false;
  }
};
</script>

<style scoped></style>
