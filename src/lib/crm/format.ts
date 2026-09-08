export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—";

export const fmtRelative = (iso: string) => {
  const diffMs = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const day = 86_400_000;
  const hr = 3_600_000;
  const past = diffMs < 0;
  let label: string;
  if (abs < hr) label = `${Math.round(abs / 60_000)}m`;
  else if (abs < day) label = `${Math.round(abs / hr)}h`;
  else label = `${Math.round(abs / day)}d`;
  return past ? `${label} ago` : `in ${label}`;
};

export const isOverdue = (iso: string) => new Date(iso).getTime() < Date.now();

export const todayInput = () => new Date().toISOString().slice(0, 10);
