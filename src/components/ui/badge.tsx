import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-[11px] leading-4 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        neutral: "border-border bg-muted text-muted-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground/80 bg-card",
        soft: "border-primary/15 bg-primary/8 text-primary dark:bg-primary/15",
        success: "border-emerald-600/15 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        warning: "border-amber-600/15 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
