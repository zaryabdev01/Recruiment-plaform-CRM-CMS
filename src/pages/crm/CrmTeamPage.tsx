import { TeamManager } from "@/components/crm/TeamManager";

export function CrmTeamPage() {
  return (
    <TeamManager
      scope="crm"
      heading="CRM team"
      intro="Our own support team. They can log into the CRM only — not the recruiter portal or the candidate site. Send an invite link; once registered they get a CRM profile."
      roles={["CRM Support Agent", "CRM Support Lead", "CRM Manager"]}
    />
  );
}
