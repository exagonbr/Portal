import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-blue-500",
        destructive:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-red-500",
        outline:
          "border-2 border-blue-600 bg-white text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-blue-500",
        secondary:
          "bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-green-500",
        ghost: 
          "text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-500",
        link: 
          "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus-visible:ring-blue-500",
        success: 
          "bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-green-500",
        warning: 
          "bg-orange-600 text-white shadow-md hover:bg-orange-700 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-orange-500",
        info: 
          "bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-blue-500",
        danger:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-red-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2",
      className
    )}
    {...props}
  />
));
ButtonGroup.displayName = "ButtonGroup";

const FAB = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
        className
      )}
      {...props}
    />
  )
);
FAB.displayName = "FAB";

export { Button, buttonVariants, ButtonGroup, FAB };
