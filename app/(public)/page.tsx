import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/public/landing-hero";
import { TrustBadges } from "@/components/public/trust-badges";
import { HowItWorks } from "@/components/public/how-it-works";
import { TransparencyBlock } from "@/components/public/transparency-block";
import {
  CoverageMap,
  type RegionRow,
  type DepartmentRow,
} from "@/components/public/coverage-map";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const [summaryRes, regionsRes, deptsRes] = await Promise.all([
    supabase.from("v_public_summary").select("*").maybeSingle(),
    supabase.from("v_participation_by_region").select("region, total"),
    supabase.from("v_participation_by_department").select("department, total"),
  ]);
  const summary = summaryRes.data;
  const byRegion: RegionRow[] = (regionsRes.data ?? []).map((r) => ({
    region: r.region ?? "",
    total: Number(r.total ?? 0),
  }));
  const byDepartment: DepartmentRow[] = (deptsRes.data ?? []).map((d) => ({
    department: d.department ?? "",
    total: Number(d.total ?? 0),
  }));

  const startDate = formatDate(new Date()).split(",")[0];

  return (
    <>
      <LandingHero />
      <TrustBadges />
      <HowItWorks />
      <TransparencyBlock
        totalParticipants={summary?.total_participants ?? 0}
        totalResponses={summary?.total_responses_completed ?? 0}
        totalDepartments={summary?.total_departments ?? 0}
        startDate={startDate}
      />
      <CoverageMap
        byRegion={byRegion}
        byDepartment={byDepartment}
        totalParticipants={summary?.total_participants ?? 0}
      />
      <section className="relative overflow-hidden border-t border-white/5 bg-ink-gradient py-16 text-white">
        <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-50" />
        <div
          aria-hidden
          className="absolute -right-32 top-0 h-72 w-72 rounded-full bg-brand-accent/20 blur-3xl"
        />
        <div className="container-page relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-widest text-brand-accent">
              Empieza ahora
            </p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              Tu voz suma a la muestra
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Menos de dos minutos. Anónimo hasta el último paso. Compártelo si
              te parece bien.
            </p>
          </div>
          <Button asChild size="xl" variant="accent" className="shadow-accent">
            <Link href="/participar">Responder el sondeo</Link>
          </Button>
        </div>
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-1 flag-stripe" />
      </section>
    </>
  );
}
