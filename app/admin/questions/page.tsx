import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  upsertQuestionAction,
  upsertOptionAction,
  deleteOptionAction,
  deleteQuestionAction,
} from "./actions";

export default async function QuestionsAdminPage() {
  const admin = await requireAdmin("viewer");
  const supabase = await createSupabaseServerClient();
  const { data: questions } = await supabase
    .from("survey_questions")
    .select("id, question_text, question_type, is_sensitive, required, active, display_order")
    .order("display_order");
  const { data: options } = await supabase
    .from("survey_options")
    .select("id, question_id, option_text, option_value, candidate_id, display_order, active")
    .order("display_order");
  const { data: candidates } = await supabase
    .from("candidates")
    .select("id, name")
    .eq("active", true)
    .order("display_order");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Preguntas del sondeo</h1>
          <p className="text-sm text-brand-muted">
            Edita el flujo de preguntas y opciones. Los cambios afectan al sondeo público en vivo.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva pregunta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertQuestionAction} className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-3">
              <Label htmlFor="question_text">Texto de la pregunta</Label>
              <Input id="question_text" name="question_text" required />
            </div>
            <div>
              <Label htmlFor="question_type">Tipo</Label>
              <select
                id="question_type"
                name="question_type"
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3"
              >
                <option value="single_choice">Única opción</option>
                <option value="multiple_choice">Múltiple</option>
                <option value="text">Texto</option>
                <option value="scale">Escala</option>
              </select>
            </div>
            <div>
              <Label htmlFor="display_order">Orden</Label>
              <Input id="display_order" name="display_order" type="number" defaultValue={1} />
            </div>
            <div className="flex items-end gap-2">
              <Checkbox id="is_sensitive" name="is_sensitive" />
              <Label htmlFor="is_sensitive" className="text-xs">Sensible</Label>
              <Checkbox id="required" name="required" defaultChecked />
              <Label htmlFor="required" className="text-xs">Requerida</Label>
              <Checkbox id="active" name="active" defaultChecked />
              <Label htmlFor="active" className="text-xs">Activa</Label>
            </div>
            <div className="md:col-span-6">
              <Button type="submit">+ Agregar pregunta</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {(questions ?? []).map((q) => {
          const opts = (options ?? []).filter((o) => o.question_id === q.id);
          return (
            <Card key={q.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {q.display_order}. {q.question_text}
                  </CardTitle>
                  <div className="mt-1 flex flex-wrap gap-1 text-xs">
                    <Badge variant="outline">{q.question_type}</Badge>
                    {q.is_sensitive ? <Badge variant="destructive">Sensible</Badge> : null}
                    {q.active ? <Badge variant="success">Activa</Badge> : <Badge variant="muted">Inactiva</Badge>}
                  </div>
                </div>
                {admin.role === "super_admin" ? (
                  <form
                    action={async () => {
                      "use server";
                      await deleteQuestionAction(q.id);
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm">Eliminar</Button>
                  </form>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 text-sm">
                  {opts.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5"
                    >
                      <span>
                        <span className="font-medium">{o.option_text}</span>{" "}
                        <span className="text-xs text-brand-muted">({o.option_value})</span>
                      </span>
                      <form action={async () => {
                        "use server";
                        await deleteOptionAction(o.id);
                      }}>
                        <button className="text-xs text-red-600 hover:underline">Eliminar</button>
                      </form>
                    </li>
                  ))}
                </ul>
                <form action={upsertOptionAction} className="grid items-end gap-2 md:grid-cols-5">
                  <input type="hidden" name="question_id" value={q.id} />
                  <div className="md:col-span-2">
                    <Label htmlFor={`text-${q.id}`}>Nueva opción</Label>
                    <Input id={`text-${q.id}`} name="option_text" required />
                  </div>
                  <div>
                    <Label>Candidato (opcional)</Label>
                    <select
                      name="candidate_id"
                      className="h-11 w-full rounded-md border border-slate-300 bg-white px-3"
                    >
                      <option value="">—</option>
                      {(candidates ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Orden</Label>
                    <Input
                      name="display_order"
                      type="number"
                      defaultValue={opts.length + 1}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Checkbox name="active" defaultChecked id={`active-${q.id}`} />
                    <Label className="text-xs" htmlFor={`active-${q.id}`}>Activa</Label>
                    <Button type="submit">+</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
