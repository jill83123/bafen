export const workCategories = ['public', 'commercial', 'residential'] as const;

export type WorkCategory = (typeof workCategories)[number];

export const workCategoryLabels: Record<WorkCategory, string> = {
  public: '公共空間',
  commercial: '商業空間',
  residential: '居家空間',
};

export const workCategoryOptions = workCategories.map((value) => ({
  label: workCategoryLabels[value],
  value,
}));
