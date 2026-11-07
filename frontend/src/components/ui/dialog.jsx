import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "cn";
import { Button } from "./button";

function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onOpenChange?.(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
        aria-hidden
      />
      {children}
    </div>,
    document.body
  );
}

function DialogContent({ className, children, onClose, ...props }) {
  return (
    <div
      data-slot="dialog-content"
      className={cn(
        "relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg",
        className
      )}
      {...props}
    >
      {onClose && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-3 top-3"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X className="size-4" />
        </Button>
      )}
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }) {
  return <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
