import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPage }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
      <span>
        Showing <span className="font-medium text-gray-700">{from}</span>–<span className="font-medium text-gray-700">{to}</span> of{" "}
        <span className="font-medium text-gray-700">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-300">…</span>}
              <button
                onClick={() => onPage(p)}
                className={cn(
                  "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm",
                  p === page ? "border-brand-600 bg-brand-50 font-medium text-brand-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                )}
              >
                {p}
              </button>
            </span>
          ))}
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
