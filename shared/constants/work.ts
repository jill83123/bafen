export const categories = ['public', 'commercial', 'residential'] as const;

export const categoryLabels: Record<string, string> = {
  public: '公共空間',
  commercial: '商業空間',
  residential: '居家空間',
};

export const categoryOptions = categories.map((value) => ({
  label: categoryLabels[value],
  value,
}));
