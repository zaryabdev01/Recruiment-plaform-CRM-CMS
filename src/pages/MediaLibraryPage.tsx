import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Copy } from "lucide-react";
import { cmsAdminApi } from "@/lib/cms-api";
import { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png"];

export function MediaLibraryPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-images"],
    queryFn: () => cmsAdminApi.listImages({ page_size: 100 }).then((r) => r.data),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => cmsAdminApi.uploadImage(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms-images"] }); toast.success("Image uploaded"); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => cmsAdminApi.deleteImage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms-images"] }); toast.success("Image deleted"); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { toast.error("Only JPEG and PNG images are accepted"); return; }
    if (file.size > MAX_BYTES) { toast.error("Image must be 5 MB or smaller"); return; }
    uploadMut.mutate(file);
  };

  const images = data?.items ?? [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media library</h1>
        <p className="text-sm text-gray-500 mt-1">Images available to insert into any page body via the rich-text editor.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-sm cursor-pointer transition-colors ${
          dragOver ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400 bg-white"
        }`}
      >
        <Upload className="h-6 w-6 text-gray-400" />
        <span className="text-gray-600">{uploadMut.isPending ? "Uploading…" : "Click or drag a JPEG/PNG here (max 5 MB)"}</span>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">No images uploaded yet</div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden">
              <img src={img.url} alt={img.alt_text ?? img.filename} className="w-full aspect-square object-cover" />
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={img.filename}>{img.filename}</p>
                <p className="text-[11px] text-gray-400">{(img.size_bytes / 1024).toFixed(0)} KB</p>
              </div>
              <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-1">
                <button
                  onClick={() => { navigator.clipboard.writeText(location.origin + img.url); toast.success("URL copied"); }}
                  className="flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-gray-600 shadow hover:bg-white"
                  title="Copy embed URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${img.filename}"?`)) deleteMut.mutate(img.id); }}
                  className="flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-red-600 shadow hover:bg-white"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
