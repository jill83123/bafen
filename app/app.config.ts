import { tw } from './utils/tailwind';

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'base',
    },

    alert: {
      slots: {
        root: 'gap-2',
      },
    },

    button: {
      slots: {
        base: tw`group font-normal`,
        trailingIcon: tw`transition-transform group-hover:rotate-45 group-disabled:rotate-0`,
      },
      variants: {
        size: {
          md: {
            base: tw`gap-1 text-base`,
          },
          lg: {
            base: tw`gap-1 text-base tracking-wider`,
          },
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: tw`hover:bg-brand-hover active:bg-brand-hover`,
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: tw`hover:bg-brand-main active:bg-brand-main`,
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: tw`hover:bg-ink ring-ink hover:text-inverted active:bg-ink active:text-inverted disabled:text-disabled disabled:ring-disabled`,
        },
        {
          size: 'md',
          square: false,
          class: tw`px-3 py-2`,
        },
        {
          size: 'lg',
          square: false,
          class: tw`px-12 py-3.5`,
        },
      ],
      defaultVariants: {
        color: 'primary',
        variant: 'solid',
        size: 'lg',
      },
    },

    checkbox: {
      slots: {
        root: tw`items-center`,
        label: tw`text-base font-normal`,
      },
      defaultVariants: {
        size: 'md',
        color: 'neutral',
      },
    },

    formField: {
      slots: {
        label: tw`font-normal`,
      },
      variants: {
        size: {
          md: {
            label: tw`text-base`,
          },
        },
      },
    },

    input: {
      slots: {
        base: tw`placeholder:text-sub disabled:bg-canvas read-only:focus-visible:ring-line-light`,
      },
      variants: {
        size: {
          md: {
            base: tw`px-4 py-3 text-base!`,
          },
        },
      },
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'outline',
          class: tw`focus-visible:ring-1`,
        },
      ],
      defaultVariants: {
        size: 'md',
        color: 'neutral',
        variant: 'outline',
      },
    },

    select: {
      slots: {
        trailingIcon: tw`text-ink`,
        content: tw`ring-ink shadow-none`,
        group: tw`p-0`,
        item: tw`cursor-pointer`,
        itemTrailingIcon: tw`text-ink`,
      },
      variants: {
        size: {
          md: {
            base: tw`px-4 py-3 text-base!`,
            trailingIcon: tw`size-5`,
            item: tw`px-4 py-3 text-base`,
            itemTrailingIcon: tw`size-5`,
          },
        },
      },
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'outline',
          class: tw`ring-ink`,
        },
      ],
      defaultVariants: {
        color: 'neutral',
        variant: 'outline',
        size: 'md',
      },
    },

    textarea: {
      slots: {
        base: tw`placeholder:text-sub disabled:bg-canvas read-only:focus-visible:ring-line-light`,
      },
      variants: {
        size: {
          md: {
            base: tw`px-4 py-3 text-base!`,
          },
        },
      },
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'outline',
          class: tw`focus-visible:ring-1`,
        },
      ],
      defaultVariants: {
        size: 'md',
        color: 'neutral',
        variant: 'outline',
      },
    },

    navigationMenu: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'pill',
          class: {
            link: tw`hover:before:bg-canvas gap-2 p-6 text-base leading-none`,
          },
        },
        {
          color: 'primary',
          variant: 'pill',
          active: false,
          class: {
            link: tw`text-ink font-normal`,
            linkLeadingIcon: tw`text-ink`,
          },
        },
        {
          color: 'primary',
          variant: 'pill',
          active: true,
          class: {
            link: tw`hover:before:bg-canvas font-medium before:bg-transparent`,
          },
        },
      ],
    },

    pagination: {
      slots: {
        first: tw`h-10 w-10 justify-center`,
        prev: tw`h-10 w-10 justify-center`,
        item: tw`h-10 w-10 justify-center`,
        next: tw`h-10 w-10 justify-center`,
        last: tw`h-10 w-10 justify-center`,
      },
    },

    modal: {
      variants: {
        fullscreen: {
          false: {
            content: tw`shadow-none`,
          },
        },
      },
    },

    tooltip: {
      slots: {
        content: tw`text-sm`,
      },
    },
  },
});
