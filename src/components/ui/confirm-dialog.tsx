"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** Use destructive styling for irreversible actions. */
  variant?: "default" | "danger";
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default",
  loading = false,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="!border-white/15 !bg-white/5 !text-gray-200 hover:!bg-white/10"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === "danger" ? "primary" : "primary"}
          className={
            variant === "danger"
              ? "!bg-rose-600 hover:!bg-rose-700 focus-visible:!outline-rose-600"
              : ""
          }
          loading={loading}
          onClick={() => onConfirm()}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
