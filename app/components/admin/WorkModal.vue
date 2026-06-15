<template>
  <UModal
    v-model:open="isModalOpen"
    :title="modeLabel"
    scrollable
    :dismissible="false"
    :ui="{
      content: 'w-full max-w-4xl',
    }"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="WorkFormSchema"
        :state="formState"
        class="space-y-5"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-3">
          <UFormField name="title" label="作品名稱" required>
            <UInput v-model="formState.title" placeholder="請輸入作品名稱" />
          </UFormField>

          <UFormField name="slug" label="Slug" required>
            <UInput v-model="formState.slug" placeholder="example-slug-name" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UFormField name="category" label="分類" required>
            <USelect
              v-model="formState.category"
              placeholder="請選擇分類"
              :items="categorySelectItems"
              :class="{ 'ring-error!': (form?.getErrors('category')?.length ?? 0) > 0 }"
              :ui="{
                base: 'ring-default w-full',
                content: 'ring-default',
              }"
            />
          </UFormField>

          <UFormField name="tags" label="標籤">
            <UInputMenu
              v-model="formState.tags"
              v-model:search-term="tagsSearchTerm"
              placeholder="輸入後按 Enter"
              :items="props.tagsMenu"
              multiple
              create-item
              :ui="{
                base: 'ring-default w-full',
                content: 'ring-default',
              }"
              @create="onCreateTagItem"
            />
          </UFormField>
        </div>

        <UFormField name="coverId" label="封面圖片" required>
          <div class="grid grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-7">
            <div
              role="button"
              tabindex="0"
              class="flex aspect-square h-full w-full items-center justify-center transition-[background-color,opacity]"
              :class="{
                'border-default hover:bg-elevated border border-dashed': !selectedCover?.path,
                'hover:opacity-75': selectedCover?.path,
                'border-error!': (form?.getErrors('coverId')?.length ?? 0) > 0,
              }"
              @click="openImagePicker('cover')"
              @keyup.enter="openImagePicker('cover')"
            >
              <img
                v-if="selectedCover?.path"
                :src="selectedCover?.path"
                alt="封面圖片"
                class="bg-elevated h-full w-full object-cover"
              />

              <Icon v-else name="i-material-symbols-image-outline-sharp" class="text-sub" />
            </div>
          </div>
        </UFormField>

        <UFormField name="imageIds" label="內文圖片" required>
          <div class="text-sub mb-2 text-xs">可拖曳調整順序</div>
          <div
            ref="imagesSortableContainer"
            class="grid grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-7"
          >
            <div
              v-if="selectedImages.length === 0"
              role="button"
              tabindex="0"
              class="border-default hover:bg-elevated flex aspect-square items-center justify-center border border-dashed transition-colors"
              :class="{ 'border-error!': (form?.getErrors('imageIds')?.length ?? 0) > 0 }"
              @click="openImagePicker('images')"
              @keyup.enter="openImagePicker('images')"
            >
              <Icon name="i-material-symbols-image-outline-sharp" class="text-sub" />
            </div>

            <template v-if="selectedImages.length > 0">
              <div
                v-for="image in selectedImages"
                :key="image.id"
                role="button"
                tabindex="0"
                class="sortable-item group aspect-square cursor-grab transition-[scale,opacity] select-none hover:opacity-75"
                @click="handleImagesClick"
              >
                <img
                  :src="image.path"
                  alt="內文圖片"
                  class="bg-elevated h-full w-full object-cover"
                />
              </div>

              <div
                role="button"
                tabindex="0"
                class="border-default hover:bg-elevated flex aspect-square h-full w-full items-center justify-center border border-dashed transition-colors"
                @click="openImagePicker('images')"
                @keyup.enter="openImagePicker('images')"
              >
                <Icon name="i-material-symbols-add" class="text-sub" />
              </div>
            </template>
          </div>
        </UFormField>

        <UFormField name="isPublic" label="公開狀態">
          <USwitch v-model="formState.isPublic" />
        </UFormField>
      </UForm>

      <AdminImagePicker
        v-model:open="isImagePickerOpen"
        :mode="imagePickerMode"
        :selected-images="imagePickerSelection"
        @select="handleImageSelect"
      />
    </template>

    <template #footer>
      <div class="ml-auto flex gap-3">
        <UButton
          label="取消"
          color="neutral"
          variant="link"
          size="sm"
          @click="isModalOpen = false"
        />
        <UButton
          label="確認"
          color="primary"
          variant="solid"
          :loading="isSubmitting"
          size="sm"
          @click="form?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { categoryOptions } from '#shared/constants/work';
import type { WorkForm } from '#shared/schema';
import { WorkFormSchema } from '#shared/schema';
import type { ImageItem } from '@/types/work';
import type { SelectItem } from '@nuxt/ui';
import type { UseSortableOptions } from '@vueuse/integrations/useSortable';
import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable';
import type { SortableEvent } from 'sortablejs';

type ImagePickerTarget = 'cover' | 'images';

const props = withDefaults(
  defineProps<{
    mode?: 'add' | 'edit';
    tagsMenu?: string[];
  }>(),
  {
    mode: 'add',
    tagsMenu: () => [],
  },
);

const emit = defineEmits<{
  save: [];
}>();

const isModalOpen = defineModel<boolean>('open', { default: false });

const modeLabel = computed(() => {
  return props.mode === 'add' ? '新增' : '編輯';
});

watch(isModalOpen, (isOpen) => {
  if (isOpen) return;

  form.value?.clear(); // 清除錯誤訊息
  Object.assign(formState, createInitialFormState());

  selectedCover.value = null;
  selectedImages.value = [];
});

const toast = useAppToast();

// =============== 表單相關 ===============
const form = useTemplateRef('form');
const isSubmitting = ref(false);

const createInitialFormState = (): WorkForm => ({
  title: '',
  slug: '',
  category: '' as WorkForm['category'],
  tags: [],
  coverId: '',
  imageIds: [],
  isPublic: false,
});

const formState = reactive<WorkForm>(createInitialFormState());

const categorySelectItems = ref<SelectItem[]>([categoryOptions]);

// 建立新標籤
const tagsSearchTerm = ref('');

const onCreateTagItem = () => {
  formState.tags.push(tagsSearchTerm.value);
  tagsSearchTerm.value = '';
};

// 封面、內文圖片選擇
const selectedCover = ref<ImageItem | null>(null);
const selectedImages = ref<ImageItem[]>([]);

const isImagePickerOpen = ref(false);
const imagePickerMode = ref<'single' | 'multiple'>('single');
const imagePickerSelection = ref<ImageItem[]>([]);
let imagePickerTarget: ImagePickerTarget | null = null;

const openImagePicker = (target: ImagePickerTarget) => {
  if (target === 'cover') {
    imagePickerMode.value = 'single';
    imagePickerSelection.value = selectedCover.value ? [selectedCover.value] : [];
  }

  if (target === 'images') {
    imagePickerMode.value = 'multiple';
    imagePickerSelection.value = selectedImages.value;
  }

  imagePickerTarget = target;
  isImagePickerOpen.value = true;
};

const handleImageSelect = (images: ImageItem[]) => {
  if (imagePickerTarget === 'cover') {
    const [image] = images;
    formState.coverId = image?.id ?? '';
    selectedCover.value = image ?? null;
    return;
  }

  if (imagePickerTarget === 'images') {
    formState.imageIds = images.map((image) => image.id);
    selectedImages.value = images;
    return;
  }
};

// 內文圖片拖曳排序
const imagesSortableContainer = useTemplateRef('imagesSortableContainer');
let stopSortableImages: (() => void) | null = null;
let shouldIgnoreImagesClick = false;

watch(imagesSortableContainer, (el) => {
  stopSortableImages?.();
  stopSortableImages = null;

  if (!el) return;

  const { stop } = useSortable(imagesSortableContainer, selectedImages, {
    animation: 200,
    draggable: '.sortable-item',
    ghostClass: 'opacity-50',
    onStart: () => {
      shouldIgnoreImagesClick = true;
    },
    onEnd: async () => {
      await nextTick();
      shouldIgnoreImagesClick = false;
    },
    onUpdate: async (event: SortableEvent) => {
      const { oldIndex, newIndex } = event;
      if (oldIndex === undefined || newIndex === undefined) return;

      moveArrayElement(selectedImages, oldIndex, newIndex);
      await nextTick();
      formState.imageIds = selectedImages.value.map((image) => image.id);
    },
  } as UseSortableOptions);

  stopSortableImages = stop;
});

onUnmounted(() => {
  stopSortableImages?.();
});

const handleImagesClick = () => {
  if (shouldIgnoreImagesClick) return;
  openImagePicker('images');
};

// 表單送出
const onSubmit = async (event: { data: WorkForm }) => {
  isSubmitting.value = true;

  try {
    await $fetch('/api/admin/works', {
      method: 'POST',
      body: event.data,
    });
    emit('save');
    isModalOpen.value = false;
    toast.success(`作品${modeLabel.value}成功`);
  } catch (error) {
    toast.error(getErrorMessage(error, `作品${modeLabel.value}失敗`));
  } finally {
    isSubmitting.value = false;
  }
};
</script>
