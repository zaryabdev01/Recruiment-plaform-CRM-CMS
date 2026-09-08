import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  /**
   * Optional list of places the thing being deleted is currently referenced.
   * Renders a "used in" block before the irreversible-action warning.
   */
  usedIn?: string[];
}

/**
 * Site-wide guard for irreversible actions. Per client feedback: nothing is
 * ever deleted on the first click — this dialog always appears first, and for
 * library items it lists where the item is still in use before allowing it.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Please confirm",
  message,
  confirmLabel = "Delete",
  usedIn,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {usedIn !== undefined && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-700">
              {usedIn.length === 0 ? "Not currently used anywhere." : `Currently used in ${usedIn.length} place${usedIn.length === 1 ? "" : "s"}:`}
            </p>
            {usedIn.length > 0 && (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-gray-600">
                {usedIn.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex gap-2.5 text-sm text-gray-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>
            {message} <span className="font-medium text-gray-800">This action is irreversible.</span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
