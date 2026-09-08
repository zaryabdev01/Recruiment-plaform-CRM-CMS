import { useState } from "react";
import toast from "react-hot-toast";
import { FileText, Eye, Download, Trash2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCrmStore, setLibraryReviewDate, deleteLibraryItem } from "@/lib/crm/store";
import { fmtDate, isOverdue } from "@/lib/crm/format";
import type { LibraryItem } from "@/lib/crm/types";

export function RecruiterLibraryPage() {
  const store = useCrmStore();
  const [preview, setPreview] = useState<LibraryItem | null>(null);
  const [toDelete, setToDelete] = useState<LibraryItem | null>(null);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          Shared documents. Every item can be viewed on screen or downloaded, and carries a review date. Deleting shows
          you where it's used first.
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        Nothing is deleted on the first click anywhere on the platform — an irreversible-action confirmation always
        appears first.
      </div>

      <div className="space-y-3">
        {store.libraryItems.map((it) => (
          <div key={it.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-gray-900">{it.name}</h3>
                  <Badge>{it.kind}</Badge>
                  <span className="text-xs text-gray-400">{(it.sizeKb / 1024).toFixed(it.sizeKb > 1024 ? 1 : 2)} MB</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Uploaded by {it.uploadedBy} · {fmtDate(it.uploadedAt)} · used in {it.usedIn.length} place
                  {it.usedIn.length === 1 ? "" : "s"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPreview(it)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => toast.success(`Downloading "${it.name}" (prototype)`)}
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <label className="ml-1 inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarClock className="h-4 w-4 text-gray-400" />
                    Review date
                    <input
                      type="date"
                      value={it.reviewDate ? it.reviewDate.slice(0, 10) : ""}
                      onChange={(e) => setLibraryReviewDate(it.id, e.target.value ? new Date(e.target.value).toISOString() : null)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </label>
                  {it.reviewDate && isOverdue(it.reviewDate) && <Badge variant="danger">Review overdue</Badge>}
                  <button
                    onClick={() => setToDelete(it)}
                    className="ml-auto inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {store.libraryItems.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-400">Library is empty</div>
        )}
      </div>

      <Modal open={preview !== null} onClose={() => setPreview(null)} title={preview?.name ?? ""} size="lg">
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            On-screen preview of <span className="font-medium text-gray-700">{preview?.name}</span>
          </p>
          <p className="text-xs text-gray-400">(Prototype placeholder — the real viewer renders the document inline.)</p>
          <Button
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() => preview && toast.success(`Downloading "${preview.name}" (prototype)`)}
          >
            <Download className="h-4 w-4" /> Download instead
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteLibraryItem(toDelete.id);
            toast.success("Item deleted");
          }
        }}
        title={`Delete "${toDelete?.name ?? ""}"?`}
        message="Anywhere this item is attached will lose it."
        confirmLabel="Delete item"
        usedIn={toDelete?.usedIn ?? []}
      />
    </div>
  );
}
