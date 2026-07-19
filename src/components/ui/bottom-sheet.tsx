import * as React from "react";
import { useRef, useCallback } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function BottomSheet({ open, onOpenChange, children, title, description }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;

    const sheet = sheetRef.current;
    if (!sheet) return;
    

    const scrollable = target.closest(".sheet-scroll-content");
    if (scrollable && scrollable.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    currentY.current = 0;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY < 0) return;
    currentY.current = deltaY;
    sheetRef.current.style.transform = `translateY(${deltaY}px)`;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    if (currentY.current > 100) {
      onOpenChange(false);
    }
    sheetRef.current.style.transform = "";
    currentY.current = 0;
  }, [onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
          )}
        />
        <DialogPrimitive.Content
          ref={sheetRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-card rounded-t-2xl shadow-2xl",
            "max-h-[85vh] flex flex-col",
            "data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down",
            "focus:outline-none",
            "safe-bottom"
          )}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Optional title */}
          {title && (
            <div className="px-5 pb-3 shrink-0">
              <DialogPrimitive.Title className="text-lg font-semibold">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-muted-foreground mt-0.5">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}
          
          {/* If no title, still need accessible primitives */}
          {!title && (
            <>
              <DialogPrimitive.Title className="sr-only">Sheet</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Sheet content</DialogPrimitive.Description>
            </>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto scroll-momentum px-5 pb-5 sheet-scroll-content">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* --- Action Sheet Item --- */

interface ActionSheetItemProps {
  icon?: React.ReactNode;
  label: string;
  subtitle?: string;
  destructive?: boolean;
  onClick: () => void;
}

export function ActionSheetItem({ icon, label, subtitle, destructive, onClick }: ActionSheetItemProps) {
  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 w-full min-h-[48px] px-1 py-3 rounded-lg text-left transition-colors",
        "active:bg-secondary/80 active:scale-[0.99]",
        destructive ? "text-destructive" : "text-foreground"
      )}
    >
      {icon && (
        <span className={cn("shrink-0", destructive ? "text-destructive" : "text-muted-foreground")}>
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </button>
  );
}
