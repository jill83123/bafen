import clsx from 'clsx';

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'base',
    },

    button: {
      slots: {
        base: clsx('group font-normal'),
        leadingIcon: clsx('-ml-0.5'),
        trailingIcon: clsx(
          '-mr-0.5 transition-transform group-hover:rotate-45 group-disabled:rotate-0',
        ),
      },
      variants: {
        size: {
          md: {
            base: clsx('gap-1 text-base'),
          },
          lg: {
            base: clsx('gap-1 text-base tracking-wider'),
          },
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: clsx('hover:bg-brand-hover active:bg-brand-hover'),
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: clsx('hover:bg-brand-main active:bg-brand-main'),
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: clsx(
            'hover:bg-ink ring-ink hover:text-inverted active:bg-ink active:text-inverted disabled:text-disabled disabled:ring-disabled',
          ),
        },
        {
          size: 'md',
          square: false,
          class: clsx('px-3 py-2'),
        },
        {
          size: 'lg',
          square: false,
          class: clsx('px-12 py-3.5'),
        },
      ],
      defaultVariants: {
        color: 'primary',
        variant: 'solid',
        size: 'lg',
      },
    },

    pagination: {
      slots: {
        first: clsx('h-10 w-10 justify-center'),
        prev: clsx('h-10 w-10 justify-center'),
        item: clsx('h-10 w-10 justify-center'),
        next: clsx('h-10 w-10 justify-center'),
        last: clsx('h-10 w-10 justify-center'),
      },
    },

    formField: {
      slots: {
        label: clsx('font-normal'),
      },
      variants: {
        size: {
          md: {
            label: clsx('text-base'),
          },
        },
      },
    },

    input: {
      slots: {
        base: clsx(
          'placeholder:text-sub disabled:bg-canvas read-only:focus-visible:ring-line-light',
        ),
      },
      variants: {
        size: {
          md: {
            base: clsx('px-4 py-3 !text-base'),
          },
        },
      },
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'outline',
          class: clsx('focus-visible:ring-1'),
        },
      ],
      defaultVariants: {
        size: 'md',
        color: 'neutral',
        variant: 'outline',
      },
    },

    textarea: {
      slots: {
        base: clsx(
          'placeholder:text-sub disabled:bg-canvas read-only:focus-visible:ring-line-light',
        ),
      },
      variants: {
        size: {
          md: {
            base: clsx('px-4 py-3 !text-base'),
          },
        },
      },
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'outline',
          class: clsx('focus-visible:ring-1'),
        },
      ],
      defaultVariants: {
        size: 'md',
        color: 'neutral',
        variant: 'outline',
      },
    },

    checkbox: {
      slots: {
        root: clsx('items-center'),
        label: clsx('text-base font-normal'),
      },
      defaultVariants: {
        size: 'md',
        color: 'neutral',
      },
    },

    select: {
      slots: {
        trailingIcon: clsx('text-ink'),
        content: clsx('ring-ink shadow-none'),
        group: clsx('p-0'),
        item: clsx('cursor-pointer'),
        itemTrailingIcon: clsx('text-ink'),
      },
      variants: {
        size: {
          md: {
            base: clsx('px-4 py-3 !text-base'),
            trailingIcon: clsx('size-5'),
            item: clsx('px-4 py-3 text-base'),
            itemTrailingIcon: clsx('size-5'),
          },
        },
      },
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'outline',
          class: clsx('ring-ink'),
        },
      ],
      defaultVariants: {
        color: 'neutral',
        variant: 'outline',
        size: 'md',
      },
    },

    modal: {
      variants: {
        fullscreen: {
          false: {
            content: clsx('shadow-none'),
          },
        },
      },
    },
  },
});
