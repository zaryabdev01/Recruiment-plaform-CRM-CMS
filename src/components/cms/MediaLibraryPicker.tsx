import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Trash2, ImageOff } from "lucide-react";
import { cmsAdminApi, type CmsImage } from "@/lib/cms-api";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  onSelect: (image: CmsImage) => void;
  onClose: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png"];

export function MediaLibraryPicker({ onSelect, onClose }: Props) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-images"],
    queryFn: () => cmsAdminApi.listImages({ page_size: 100 }).then((r) => r.data),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => cmsAdminApi.uploadImage(file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["cms-images"] });
      toast.success("Image uploaded");
      onSelect(res.data);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => cmsAdminApi.deleteImage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms-images"] }); toast.success("Image deleted"); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only JPEG and PNG images are accepted");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }
    uploadMut.mutate(file);
  };

  const images = data?.items ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Media library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 border-b border-gray-100">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm cursor-pointer transition-colors ${
              dragOver ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400"
            }`}
          >
            <Upload className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">
              {uploadMut.isPending ? "Uploading…" : "Click or drag a JPEG/PNG here (max 5 MB)"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 py-12 gap-2">
              <ImageOff className="h-8 w-8" />
              <p className="text-sm">No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <button
                    onClick={() => onSelect(img)}
                    className="block w-full aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-brand-500 transition-shadow"
                    title={img.filename}
                  >
                    <img src={img.url} alt={img.alt_text ?? img.filename} className="w-full h-full object-cover" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${img.filename}"?`)) deleteMut.mutate(img.id); }}
                    className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-red-600 shadow hover:bg-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
