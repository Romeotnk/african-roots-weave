import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  pending?: boolean;
  onConfirm: (reason?: string) => void;
};

/** Reusable confirmation modal for destructive/irreversible admin actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  requireReason = false,
  reasonLabel = "Motif",
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#151529] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          {description && <DialogDescription className="text-slate-400">{description}</DialogDescription>}
        </DialogHeader>
        {requireReason && (
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={reasonLabel}
            className="min-h-24 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none"
          />
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white/80"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending || (requireReason && reason.trim().length === 0)}
            onClick={() => onConfirm(requireReason ? reason.trim() : undefined)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold disabled:opacity-50 ${
              danger ? "bg-red-500 text-white" : "bg-emerald-400 text-[#111827]"
            }`}
          >
            {pending ? "..." : confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
