export const usePageTitle = () => {
  const site = useSiteConfig();

  return {
    getPageTitle: (chunk: string | undefined) => (chunk ? `${chunk}｜${site.name}` : site.name),
  };
};
