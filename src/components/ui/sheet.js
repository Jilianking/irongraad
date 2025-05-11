import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from ".//utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef(({ className, side = "left", ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 bg-black/50 z-40" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-white text-black p-4 transition-all duration-300 ease-in-out shadow-xl",
        side === "left" ? "left-0 top-0 h-full w-64" : "",
        side === "right" ? "right-0 top-0 h-full w-64" : "",
        className
      )}
      {...props}
    />
  </SheetPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent, SheetClose };
