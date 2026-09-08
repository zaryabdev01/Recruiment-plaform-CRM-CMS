import { useState, type ReactNode } from "react";
import { Mail, Phone, PhoneCall } from "lucide-react";
import type { Contact } from "@/lib/crm/types";

/**
 * Contact-details reveal. Per client feedback: the list only shows a compact
 * trigger; hovering (or focusing) it pops the email / mobile / landline.
 */
export function ContactHoverCard({ contact, trigger }: { contact: Contact; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      <span className="inline-flex cursor-default items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:border-brand-300 hover:text-brand-700">
        {trigger ?? (
          <>
            <Mail className="h-3.5 w-3.5" /> Contact
          </>
        )}
      </span>
      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 w-60 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-lg">
          <span className="flex items-center gap-2 text-gray-700">
            <Mail className="h-3.5 w-3.5 text-gray-400" /> {contact.email}
          </span>
          <span className="mt-1.5 flex items-center gap-2 text-gray-700">
            <Phone className="h-3.5 w-3.5 text-gray-400" /> {contact.mobile}
          </span>
          <span className="mt-1.5 flex items-center gap-2 text-gray-700">
            <PhoneCall className="h-3.5 w-3.5 text-gray-400" /> {contact.landline}
          </span>
        </span>
      )}
    </span>
  );
}
