import { cva, type VariantProps } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        custom: 'relative z-[1] border border-primary-green bg-transparent bg-gradient-to-t from-[rgba(0,255,204,0.5)] to-[rgba(0,255,204,0.1)] *:relative *:z-[3] before:absolute before:inset-0 before:z-[2] before:bg-gradient-to-t before:from-[rgba(0,255,204,0.5)] before:to-[rgba(0,255,204,0.5)] before:opacity-0 before:transition-opacity hover:before:opacity-100',
      },
      size: {
        default: 'h-9 px-4 py-2',
        xs: 'h-7 rounded px-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
        custom: 'h-[60px] w-full max-w-[180px]',
        footerBar: 'h-10 w-full max-w-[114px] px-6 py-2',
      },
      rounded: {
        default: 'rounded-md',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'none',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
