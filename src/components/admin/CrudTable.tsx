"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { safeImageSrc } from "@/lib/utils";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select" | "url";
  options?: string[];
  required?: boolean;
  defaultChecked?: boolean;
};

export function CrudTable({
  resource,
  title,
  fields,
  columns
}: {
  resource: string; // e.g. "colleges"
  title: string;
  fields: Field[];
  columns: { key: string; label: string }[];
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/${resource}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load data");
      setItems(d.items || []);
    } catch (e: any) {
      setError(e?.message || "Could not load data");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [resource]);

  async function onSave(form: any) {
    const method = editing?.id ? "PUT" : "POST";
    const url = editing?.id ? `/api/admin/${resource}/${editing.id}` : `/api/admin/${resource}`;
    const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setOpen(false); setEditing(null); setError(null); load(); }
    else setError(d.error || "Save failed");
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    const response = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Delete failed");
      return;
    }
    setError(null);
    load();
  }

  return (
    <>
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <button className="btn-primary" onClick={() => { setEditing({}); setOpen(true); }}>
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      {error && <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}

      <GlassCard className="overflow-hidden p-0" hover={false}>
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full text-sm">
            <thead className="bg-[rgb(var(--bg-elev))]/60">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left font-semibold">{c.label}</th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-center text-[rgb(var(--fg-muted))]">Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-center text-[rgb(var(--fg-muted))]">No data yet.</td></tr>
              )}
              {items.map((it) => (
                <tr key={it.id} className="border-t border-[rgb(var(--border))] transition hover:bg-[rgb(var(--primary))]/5">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-top">
                      {isImageField(c.key) ? (
                        <ImagePreview src={it[c.key]} label={it.name || it.title || c.label} />
                      ) : (
                        String(it[c.key] ?? "—").slice(0, 80)
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button className="mr-2 inline-flex items-center gap-1 text-xs text-[rgb(var(--primary))]" onClick={() => { setEditing(it); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button className="inline-flex items-center gap-1 text-xs text-red-500" onClick={() => onDelete(it.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6 nice-scroll"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{editing?.id ? "Edit" : "Create"} {title}</h3>
                <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const obj: any = {};
                  fields.forEach((f) => {
                    const v = fd.get(f.name);
                    if (f.type === "number") obj[f.name] = v === "" || v === null ? null : Number(v);
                    else if (f.type === "checkbox") obj[f.name] = v === "on";
                    else obj[f.name] = v;
                  });
                  onSave(obj);
                }}
              >
                {fields.map((f) => (
                  <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block text-sm font-medium">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea name={f.name} required={f.required} defaultValue={editing?.[f.name] ?? ""} rows={4} className="input resize-none" />
                    ) : f.type === "select" ? (
                      <select name={f.name} defaultValue={editing?.[f.name] ?? ""} className="input">
                        {f.options?.map((o) => {
                          // Allow "id:label" syntax to display label but submit id
                          const [val, label] = o.includes(":") ? o.split(":") : [o, o];
                          return <option key={val} value={val}>{label || "—"}</option>;
                        })}
                      </select>
                    ) : f.type === "checkbox" ? (
                      <input type="checkbox" name={f.name} defaultChecked={editing?.id ? !!editing?.[f.name] : !!f.defaultChecked} className="h-5 w-5" />
                    ) : (
                      <input
                        name={f.name}
                        type={f.type === "number" ? "number" : "text"}
                        required={f.required}
                        defaultValue={editing?.[f.name] ?? ""}
                        className="input"
                        placeholder={f.type === "url" ? "https://... or /assets/..." : undefined}
                      />
                    )}
                    {isImageField(f.name) && editing?.[f.name] && (
                      <div className="mt-2">
                        <ImagePreview src={editing[f.name]} label={`${f.label} preview`} wide />
                      </div>
                    )}
                  </div>
                ))}
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
                  <button type="submit" className="btn-primary">Save</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function isImageField(key: string) {
  const normalized = key.toLowerCase();
  return normalized.includes("image") || normalized.includes("logo") || normalized.includes("cover");
}

function ImagePreview({ src, label, wide = false }: { src: unknown; label: string; wide?: boolean }) {
  const imageSrc = safeImageSrc(src, "");
  if (!imageSrc) return <span className="text-xs text-[rgb(var(--fg-muted))]">No image</span>;
  return (
    <span className={wide ? "block overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-white/70 p-2 dark:bg-[rgb(var(--bg-elev))]/70" : "inline-flex items-center gap-2"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={label}
        className={wide ? "h-28 w-full rounded-md object-cover" : "h-12 w-12 rounded-lg bg-white object-cover p-1 shadow-sm"}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
