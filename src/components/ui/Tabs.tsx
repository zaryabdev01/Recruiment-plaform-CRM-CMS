import { cn } from "@/lib/utils";

interface TabsProps<T extends string> {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ tabs, value, onChange }: TabsProps<T>) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            t.value === value
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
