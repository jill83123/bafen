export const tw = (strings: TemplateStringsArray, ...values: unknown[]): string => {
  return String.raw({ raw: strings }, ...values);
};
