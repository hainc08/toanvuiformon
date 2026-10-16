"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/state";
import { slugify } from "@/lib/slug";
import { api } from "./api";

export type FieldDef =
  | { name: string; label: string; kind: "text" | "number"; required?: boolean; placeholder?: string; slugFrom?: string; full?: boolean }
  | { name: string; label: string; kind: "textarea"; rows?: number; full?: boolean; placeholder?: string }
  | { name: string; label: string; kind: "list"; full?: boolean; placeholder?: string }
  | { name: string; label: string; kind: "select"; options: { value: string; label: string }[]; required?: boolean; full?: boolean };

type Values = Record<string, string>;

function toBody(fields: FieldDef[], values: Values, hidden: Record<string, unknown>) {
  const body: Record<string, unknown> = { ...hidden };
  for (const f of fields) {
    const raw = values[f.name] ?? "";
    if (f.kind === "number") body[f.name] = raw === "" ? undefined : Number(raw);
    else if (f.kind === "list") body[f.name] = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    else body[f.name] = raw === "" && f.kind !== "select" ? null : raw;
  }
  return body;
}

/**
 * Small generic create/edit form for catalog entities (grades, chapters, topics).
 * Server-side Zod validation is the source of truth; errors are shown inline.
 */
export function CrudForm({
  fields,
  initial,
  hidden = {},
  endpoint,
  method,
  deleteEndpoint,
  submitLabel,
  onDoneHref,
}: {
  fields: FieldDef[];
  initial?: Values;
  hidden?: Record<string, unknown>;
  endpoint: string;
  method: "POST" | "PATCH";
  deleteEndpoint?: string;
  submitLabel: string;
  onDoneHref?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial ?? {});
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  function update(name: string, value: string) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      for (const f of fields) {
        if ((f.kind === "text") && f.slugFrom === name && method === "POST") next[f.name] = slugify(value);
      }
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setOk(false);
    const res = await api(endpoint, method, toBody(fields, values, hidden));
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk(true);
    if (method === "POST") setValues(initial ?? {});
    if (onDoneHref) router.push(onDoneHref);
    router.refresh();
  }

  async function onDelete() {
    if (!deleteEndpoint || !window.confirm("Xóa mục này? Thao tác không thể hoàn tác.")) return;
    setPending(true);
    const res = await api(deleteEndpoint, "DELETE");
    setPending(false);
    if (!res.ok) setError(res.error);
    else router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `${endpoint}-${f.name}`.replace(/[^a-z0-9-]/gi, "-");
        const value = values[f.name] ?? "";
        return (
          <div key={f.name} className={f.full || f.kind === "textarea" || f.kind === "list" ? "sm:col-span-2" : undefined}>
            <Label htmlFor={id}>{f.label}</Label>
            {f.kind === "textarea" || f.kind === "list" ? (
              <Textarea id={id} rows={f.kind === "textarea" ? (f.rows ?? 3) : 3} value={value} placeholder={f.placeholder} onChange={(e) => update(f.name, e.target.value)} />
            ) : f.kind === "select" ? (
              <Select id={id} value={value} onChange={(e) => update(f.name, e.target.value)} required={f.required}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            ) : (
              <Input id={id} type={f.kind} value={value} placeholder={f.placeholder} required={f.required} onChange={(e) => update(f.name, e.target.value)} />
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} {submitLabel}
        </Button>
        {deleteEndpoint ? (
          <Button type="button" size="sm" variant="ghost" className="text-danger" onClick={onDelete} disabled={pending}>
            <Trash2 /> Xóa
          </Button>
        ) : null}
        {ok ? <span className="text-sm text-success" role="status">Đã lưu</span> : null}
      </div>
      {error ? <div className="sm:col-span-2"><Alert>{error}</Alert></div> : null}
    </form>
  );
}
