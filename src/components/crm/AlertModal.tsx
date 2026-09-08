import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { setAlert, type Target } from "@/lib/crm/store";
import { todayInput } from "@/lib/crm/format";

/**
 * "Set your own alert with date, time & reason" — available on organisations,
 * candidates and decision makers, for both CRM staff and recruiter team members.
 */
export function AlertModal({
  open,
  onClose,
  target,
  scope,
  setByName,
}: {
  open: boolean;
  onClose: () => void;
  target: Target;
  scope: "crm" | "recruiter";
  setByName: string;
}) {
  const [date, setDate] = useState(todayInput());
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");

  const save = () => {
    if (!reason.trim()) {
      toast.error("Add a reason for the alert");
      return;
    }
    setAlert({ scope, target, date, time, reason, setByName });
    toast.success("Alert set");
    setReason("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Set alert — ${target.name}`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            Set alert
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Call back about open vacancies"
          />
        </div>
        <p className="text-xs text-gray-400">
          Alerts you set appear in your dashboard "Alerts" box, ordered by the next one due.
        </p>
      </div>
    </Modal>
  );
}
