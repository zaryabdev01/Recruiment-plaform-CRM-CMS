import { TeamManager } from "@/components/crm/TeamManager";

export function RecruiterTeamPage() {
  return (
    <TeamManager
      scope="recruiter"
      heading="Team"
      intro="Invite new team members with a magic link. When they open it they fill out their profile — the same profile we ask candidates to complete — and are then connected as an employee in your recruiter team."
      roles={["Trainee Consultant", "Resourcer", "Consultant", "Senior Consultant", "Team Lead"]}
    />
  );
}
