import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, MessageSquare } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { logComms, type Target } from "@/lib/crm/store";
import { cn } from "@/lib/utils";

/**
 * The "Comms" cell action from the client feedback: click opens this pop-out to
 * fire a quick email or quick text, which is then logged to the record's
 * communication history.
 */
export function CommsPopout({
  open,
  onClose,
  target,
  actorName = "You",
}: {
  open: boolean;
  onClose: () => void;
  target: Target;
  actorName?: string;
}) {
  const [channel, setChannel] = useState<"email" | "text">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const reset = () => {
    setChannel("email");
    setSubject("");
    setBody("");
  };

  const send = () => {
    if (!body.trim()) {
      toast.error("Write a message first");
      return;
    }
    logComms({ target, channel, subject, body, byName: actorName });
    toast.success(channel === "email" ? "Email sent & logged" : "Text sent & logged");
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={`Quick message — ${target.name}`}
      description="Prototype: nothing actually sends. It's added to the comms history."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={send}>
            Send {channel === "email" ? "email" : "text"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["email", "text"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm",
                channel === c ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              )}
            >
              {c === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              {c === "email" ? "Quick email" : "Quick text"}
            </button>
          ))}
        </div>
        {channel === "email" && (
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder={channel === "email" ? "Type your email…" : "Type your text message…"}
          />
        </div>
      </div>
    </Modal>
  );
}
