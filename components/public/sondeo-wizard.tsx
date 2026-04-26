"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AGE_RANGES,
  CONSENT_TEXT,
  GENDERS,
} from "@/lib/constants";
import {
  DEPARTMENTS,
  DEPARTMENT_REGION,
  MUNICIPALITIES_BY_DEPARTMENT,
} from "@/lib/colombia-geo";
import {
  submitSurveyAndRegisterAction,
  type SubmitState,
} from "@/app/(public)/participar/actions";

export interface SurveyOption {
  id: string;
  option_text: string;
  option_value: string;
  candidate_id: string | null;
}

export interface SurveyQuestion {
  id: string;
  question_text: string;
  question_type: "single_choice" | "multiple_choice" | "text" | "scale";
  is_sensitive: boolean;
  required: boolean;
  options: SurveyOption[];
}

interface Props {
  questions: SurveyQuestion[];
  refCode: string | null;
}

type Step =
  | { kind: "intro" }
  | { kind: "question"; index: number }
  | { kind: "register" };

export function SondeoWizard({ questions, refCode }: Props) {
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Datos del registro (solo nombre + WhatsApp obligatorios)
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [department, setDepartment] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [consentPersonal, setConsentPersonal] = useState(false);
  const [consentPolitical, setConsentPolitical] = useState(false);
  const [consentWA, setConsentWA] = useState(false);

  const totalQuestions = questions.length;
  const progressPct = useMemo(() => {
    if (step.kind === "intro") return 0;
    if (step.kind === "register") return 100;
    return ((step.index + 1) / (totalQuestions + 1)) * 100;
  }, [step, totalQuestions]);

  const municipalities = department
    ? MUNICIPALITIES_BY_DEPARTMENT[department] ?? []
    : [];

  const onSelectOption = (questionId: string, optionId: string, multi: boolean) => {
    setAnswers((prev) => {
      if (multi) {
        const arr = (prev[questionId] as string[]) ?? [];
        return {
          ...prev,
          [questionId]: arr.includes(optionId)
            ? arr.filter((x) => x !== optionId)
            : [...arr, optionId],
        };
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const goToNextQuestion = () => {
    if (step.kind === "intro") {
      setStep({ kind: "question", index: 0 });
      return;
    }
    if (step.kind === "question") {
      if (step.index < totalQuestions - 1) {
        setStep({ kind: "question", index: step.index + 1 });
      } else {
        setStep({ kind: "register" });
      }
    }
  };

  const goBack = () => {
    if (step.kind === "register") {
      setStep({ kind: "question", index: totalQuestions - 1 });
      return;
    }
    if (step.kind === "question") {
      if (step.index === 0) setStep({ kind: "intro" });
      else setStep({ kind: "question", index: step.index - 1 });
    }
  };

  const submit = () => {
    setFormError(null);
    setErrors({});
    const payload = questions.flatMap((q) => {
      const v = answers[q.id];
      if (!v) return [];
      if (Array.isArray(v))
        return v.map((option_id) => ({ question_id: q.id, option_id }));
      return [{ question_id: q.id, option_id: v }];
    });
    startTransition(async () => {
      const result: SubmitState = await submitSurveyAndRegisterAction({
        participant: {
          full_name: fullName,
          whatsapp,
          department,
          municipality,
          region: department ? DEPARTMENT_REGION[department] ?? "" : "",
          age_range: ageRange,
          gender,
          occupation,
          consent_personal_data: consentPersonal,
          consent_sensitive_political_data: consentPolitical,
          consent_whatsapp: consentWA,
          referral_code: refCode ?? "",
        },
        answers: payload,
      });
      if (!result.ok) {
        setFormError(result.formError ?? null);
        if (result.errors) setErrors(result.errors);
      }
    });
  };

  return (
    <div className="space-y-6">
      <ProgressBar value={progressPct} step={step} total={totalQuestions} />

      {step.kind === "intro" ? (
        <IntroCard onContinue={goToNextQuestion} refCode={refCode} />
      ) : null}

      {step.kind === "question" ? (
        <QuestionCard
          question={questions[step.index]}
          value={answers[questions[step.index].id]}
          onSelect={(optId) =>
            onSelectOption(
              questions[step.index].id,
              optId,
              questions[step.index].question_type === "multiple_choice",
            )
          }
        />
      ) : null}

      {step.kind === "register" ? (
        <RegisterCard
          fullName={fullName}
          setFullName={setFullName}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
          department={department}
          setDepartment={(d) => {
            setDepartment(d);
            setMunicipality("");
          }}
          municipality={municipality}
          setMunicipality={setMunicipality}
          municipalities={municipalities}
          ageRange={ageRange}
          setAgeRange={setAgeRange}
          gender={gender}
          setGender={setGender}
          occupation={occupation}
          setOccupation={setOccupation}
          consentPersonal={consentPersonal}
          setConsentPersonal={setConsentPersonal}
          consentPolitical={consentPolitical}
          setConsentPolitical={setConsentPolitical}
          consentWA={consentWA}
          setConsentWA={setConsentWA}
          errors={errors}
        />
      ) : null}

      {formError ? (
        <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <span>{formError}</span>
        </div>
      ) : null}

      <NavButtons
        step={step}
        canAdvance={canAdvance(step, questions, answers, {
          fullName,
          whatsapp,
          consentPersonal,
        })}
        isPending={isPending}
        onBack={goBack}
        onNext={
          step.kind === "register"
            ? submit
            : goToNextQuestion
        }
      />
    </div>
  );
}

function ProgressBar({
  value,
  step,
  total,
}: {
  value: number;
  step: Step;
  total: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-brand-muted">
        <span>
          {step.kind === "intro"
            ? "Paso 1 · Bienvenida"
            : step.kind === "question"
              ? `Pregunta ${step.index + 1} de ${total}`
              : `Paso final · Tus datos`}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function IntroCard({
  onContinue,
  refCode,
}: {
  onContinue: () => void;
  refCode: string | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-deep/20 bg-brand-bg px-3 py-1 text-xs font-mono uppercase tracking-widest text-brand-deep">
        <ShieldCheck className="h-3.5 w-3.5" />
        Sondeo ciudadano · 2026
      </span>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-brand-deep md:text-4xl">
        Tu opinión sobre la primera vuelta presidencial
      </h2>
      <p className="pretty mt-3 text-sm text-brand-muted md:text-base">
        Vas a responder <strong>6 preguntas cortas</strong>. Toma menos de dos
        minutos. Al final te pediremos tu nombre y WhatsApp para registrar tu
        participación.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <InfoPill label="Tiempo" value="~ 2 min" />
        <InfoPill label="Preguntas" value="6" />
        <InfoPill label="Privacidad" value="Agregada" />
      </div>
      <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <strong>Transparencia:</strong> tus respuestas no se guardan en nuestros
        servidores hasta que completes el registro al final y autorices el
        tratamiento de datos. Si cierras esta página antes, no queda nada
        almacenado.
      </div>
      {refCode ? (
        <p className="mt-4 text-xs font-mono text-brand-muted">
          Código de referido: <strong>{refCode}</strong>
        </p>
      ) : null}
      <div className="mt-6">
        <Button onClick={onContinue} size="xl" className="w-full sm:w-auto">
          Comenzar sondeo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-brand-bg px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">
        {label}
      </p>
      <p className="text-base font-semibold text-brand-text">{value}</p>
    </div>
  );
}

function QuestionCard({
  question,
  value,
  onSelect,
}: {
  question: SurveyQuestion;
  value: string | string[] | undefined;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-deep">
          {question.question_type === "multiple_choice" ? "Múltiple" : "Única"}
        </span>
        {question.is_sensitive ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-amber-800">
            Opinión política · sensible
          </span>
        ) : null}
      </div>
      <h2 className="mt-3 text-balance text-xl font-semibold leading-snug text-brand-text md:text-2xl">
        {question.question_text}
      </h2>
      <div className="mt-6 grid gap-2">
        {question.options.map((opt) => {
          const selected = Array.isArray(value)
            ? value.includes(opt.id)
            : value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={cn(
                "group flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep",
                selected
                  ? "border-brand-deep bg-brand-deep/5 ring-1 ring-brand-deep"
                  : "border-slate-200 bg-white hover:border-brand-deep/40 hover:bg-slate-50",
              )}
            >
              <span className="text-base font-medium text-brand-text">
                {opt.option_text}
              </span>
              <span
                className={cn(
                  "h-5 w-5 rounded-full border-2",
                  selected
                    ? "border-brand-deep bg-brand-deep"
                    : "border-slate-300 bg-white group-hover:border-brand-deep",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RegisterCard(props: {
  fullName: string;
  setFullName: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  department: string;
  setDepartment: (v: string) => void;
  municipality: string;
  setMunicipality: (v: string) => void;
  municipalities: string[];
  ageRange: string;
  setAgeRange: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  occupation: string;
  setOccupation: (v: string) => void;
  consentPersonal: boolean;
  setConsentPersonal: (v: boolean) => void;
  consentPolitical: boolean;
  setConsentPolitical: (v: boolean) => void;
  consentWA: boolean;
  setConsentWA: (v: boolean) => void;
  errors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-deep">
          Último paso
        </p>
        <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-brand-deep md:text-3xl">
          ¿Quién eres?
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Solo tu nombre y WhatsApp son obligatorios. Lo demás es opcional y nos
          ayuda a que los resultados agregados sean más representativos.
        </p>

        <div className="mt-6 space-y-4">
          <Field
            label="Nombre completo"
            id="full_name"
            error={props.errors.full_name?.[0]}
            required
          >
            <Input
              id="full_name"
              autoComplete="name"
              value={props.fullName}
              onChange={(e) => props.setFullName(e.target.value)}
            />
          </Field>

          <Field
            label="WhatsApp"
            id="whatsapp"
            error={props.errors.whatsapp?.[0]}
            hint="10 dígitos colombianos (ej. 3001234567) o +57XXXXXXXXXX"
            required
          >
            <Input
              id="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+57 300 123 4567"
              value={props.whatsapp}
              onChange={(e) => props.setWhatsapp(e.target.value)}
            />
          </Field>

          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-brand-text">
                Datos demográficos
              </p>
              <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                Opcional
              </span>
            </div>
            <p className="-mt-3 mb-4 text-xs text-brand-muted">
              No son obligatorios. Si los completas, los resultados por región y
              departamento se enriquecen.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Departamento" id="department" optional>
                <Select
                  value={props.department}
                  onValueChange={props.setDepartment}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Municipio" id="municipality" optional>
                {props.municipalities.length > 0 ? (
                  <Select
                    value={props.municipality}
                    onValueChange={props.setMunicipality}
                  >
                    <SelectTrigger id="municipality">
                      <SelectValue placeholder="Selecciona municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {props.municipalities.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="municipality"
                    placeholder={
                      props.department
                        ? "Escribe tu municipio"
                        : "Elige departamento primero"
                    }
                    disabled={!props.department}
                    value={props.municipality}
                    onChange={(e) => props.setMunicipality(e.target.value)}
                  />
                )}
              </Field>

              <Field label="Edad" id="age" optional>
                <Select value={props.ageRange} onValueChange={props.setAgeRange}>
                  <SelectTrigger id="age">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Género" id="gender" optional>
                <Select value={props.gender} onValueChange={props.setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Ocupación" id="occupation" optional>
                  <Input
                    id="occupation"
                    value={props.occupation}
                    onChange={(e) => props.setOccupation(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-brand-text">
              Consentimientos
            </h3>
            <p className="mt-1 text-xs text-brand-muted">
              El primero es obligatorio. Los demás son opcionales pero
              recomendados para mejorar el sondeo.
            </p>
          </div>
          <AcceptAllButton
            allChecked={
              props.consentPersonal && props.consentPolitical && props.consentWA
            }
            onAcceptAll={() => {
              props.setConsentPersonal(true);
              props.setConsentPolitical(true);
              props.setConsentWA(true);
            }}
          />
        </div>

        <div className="mt-4 space-y-3">
          <ConsentRow
            checked={props.consentPersonal}
            onChange={props.setConsentPersonal}
            required
            label={CONSENT_TEXT}
            error={props.errors.consent_personal_data?.[0]}
          />
          <ConsentRow
            checked={props.consentPolitical}
            onChange={props.setConsentPolitical}
            label="Autorizo el tratamiento de mis respuestas de opinión política como dato sensible para análisis agregado y segmentación transparente."
            help="Si no autorizas este punto, tu participación cuenta pero las respuestas marcadas como sensibles no se asocian a tu contacto."
          />
          <ConsentRow
            checked={props.consentWA}
            onChange={props.setConsentWA}
            label="Autorizo recibir información por WhatsApp relacionada con este sondeo y contenidos de participación ciudadana."
          />
          <p className="text-xs text-brand-muted">
            <Link href="/privacidad" className="underline hover:text-brand-deep">
              Leer la política de tratamiento de datos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  hint,
  required,
  optional,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label} {required ? <span className="text-brand-red">*</span> : null}
        </Label>
        {optional ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">
            Opcional
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-brand-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function AcceptAllButton({
  allChecked,
  onAcceptAll,
}: {
  allChecked: boolean;
  onAcceptAll: () => void;
}) {
  if (allChecked)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Todos aceptados
      </span>
    );
  return (
    <button
      type="button"
      onClick={onAcceptAll}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-accent px-3 py-1.5 text-xs font-semibold text-brand-ink shadow-accent transition hover:brightness-95"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-ink" />
      Aceptar todo
    </button>
  );
}

function ConsentRow({
  checked,
  onChange,
  label,
  help,
  required,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  help?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <div className="space-y-1">
        <p className="text-sm leading-snug text-brand-text">
          {label}
          {required ? <span className="ml-1 text-brand-red">*</span> : null}
        </p>
        {help ? <p className="text-xs text-brand-muted">{help}</p> : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function NavButtons({
  step,
  canAdvance,
  isPending,
  onBack,
  onNext,
}: {
  step: Step;
  canAdvance: boolean;
  isPending: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={step.kind === "intro" || isPending}
      >
        <ArrowLeft className="h-4 w-4" />
        Atrás
      </Button>
      <Button
        type="button"
        size="lg"
        onClick={onNext}
        disabled={!canAdvance || isPending}
        className="font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : step.kind === "intro" ? (
          <>
            Comenzar
            <ArrowRight className="h-4 w-4" />
          </>
        ) : step.kind === "register" ? (
          "Enviar respuestas"
        ) : (
          <>
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function canAdvance(
  step: Step,
  questions: SurveyQuestion[],
  answers: Record<string, string | string[]>,
  reg: { fullName: string; whatsapp: string; consentPersonal: boolean },
): boolean {
  if (step.kind === "intro") return true;
  if (step.kind === "question") {
    const q = questions[step.index];
    if (!q.required) return true;
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }
  return (
    reg.fullName.trim().length >= 3 &&
    reg.whatsapp.trim().length >= 7 &&
    reg.consentPersonal
  );
}
