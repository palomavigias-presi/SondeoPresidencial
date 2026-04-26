import { CandidateForm } from "@/components/admin/candidate-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewCandidatePage() {
  await requireAdmin("campaign_manager");
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-brand-deep">Nuevo candidato</h1>
      <CandidateForm />
    </div>
  );
}
