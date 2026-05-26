"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Database, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export type LargeAdminField = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select";
  required?: boolean;
  readOnlyOnEdit?: boolean;
  options?: Array<{ value: string; label: string }>;
};

export type LargeAdminEntity = {
  key: string;
  label: string;
  description: string;
  columns: Array<{ key: string; label: string }>;
  fields: LargeAdminField[];
  allowEdit?: boolean;
  allowDelete?: boolean;
};

type ApiResult = {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
};

export function LargeDataAdmin({
  apiBase,
  entities
}: {
  apiBase: string;
  entities: LargeAdminEntity[];
}) {
  const [activeKey, setActiveKey] = useState(entities[0]?.key || "");
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const pageSize = 20;
  const active = useMemo(() => entities.find((entity) => entity.key === activeKey) || entities[0], [activeKey, entities]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canEdit = active.allowEdit !== false;
  const canDelete = active.allowDelete !== false;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(draftQuery);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draftQuery]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize)
        });
        if (query.trim()) params.set("q", query.trim());
        const response = await fetch(`${apiBase}/${active.key}?${params.toString()}`, { signal: controller.signal });
        const data = (await response.json()) as ApiResult;
        if (!response.ok) throw new Error(data.error || "Could not load records");
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        if (err?.name !== "AbortError") setError(err?.message || "Could not load records");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [active.key, apiBase, page, query]);

  function changeEntity(key: string) {
    setActiveKey(key);
    setPage(1);
    setQuery("");
    setDraftQuery("");
    setEditing(null);
    setFormOpen(false);
  }

  function openCreate() {
    setEditing({});
    setFormOpen(true);
  }

  function openEdit(item: any) {
    setEditing(item);
    setFormOpen(true);
  }

  async function reloadCurrentPage() {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (query.trim()) params.set("q", query.trim());
    const response = await fetch(`${apiBase}/${active.key}?${params.toString()}`);
    const data = (await response.json()) as ApiResult;
    if (!response.ok) throw new Error(data.error || "Could not reload records");
    setItems(data.items || []);
    setTotal(data.total || 0);
  }

  async function onDelete(item: any) {
    if (!confirm(`Delete this ${active.label.toLowerCase()}?`)) return;
    setError(null);
    const id = encodeURIComponent(item.__adminId || item.id);
    const response = await fetch(`${apiBase}/${active.key}/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    await reloadCurrentPage();
  }

  async function onSave(values: Record<string, any>) {
    setError(null);
    const isEdit = Boolean(editing?.__adminId || editing?.id);
    const id = encodeURIComponent(editing?.__adminId || editing?.id || "");
    const response = await fetch(isEdit ? `${apiBase}/${active.key}/${id}` : `${apiBase}/${active.key}`, {
      method: isEdit ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setFormOpen(false);
    setEditing(null);
    await reloadCurrentPage();
  }

  return (
    <div className="grid gap-5">
      <div className="reference-panel p-4">
        <div className="flex flex-wrap gap-2">
          {entities.map((entity) => (
            <button
              key={entity.key}
              type="button"
              onClick={() => changeEntity(entity.key)}
              className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
                active.key === entity.key
                  ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                  : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
              }`}
            >
              {entity.label}
            </button>
          ))}
        </div>
      </div>

      <GlassCard hover={false}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">
              <Database className="h-4 w-4" />
              {active.label}
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold">{formatNumber(total)} records</h2>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{active.description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--fg-muted))]" />
              <input
                value={draftQuery}
                onChange={(event) => {
                  setDraftQuery(event.target.value);
                }}
                placeholder={`Search ${active.label.toLowerCase()}`}
                className="input h-11 min-w-[260px] pl-10"
              />
            </label>
            <button type="button" onClick={openCreate} className="btn-primary h-11 px-4">
              <Plus className="h-4 w-4" />
              New
            </button>
          </div>
        </div>
      </GlassCard>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">{error}</p>
      ) : null}

      <GlassCard className="overflow-hidden p-0" hover={false}>
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-[rgb(var(--bg-elev))]/70">
              <tr>
                {active.columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left font-bold">{column.label}</th>
                ))}
                {(canEdit || canDelete) ? <th className="px-4 py-3 text-right font-bold">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={active.columns.length + (canEdit || canDelete ? 1 : 0)} className="px-4 py-8 text-center text-[rgb(var(--fg-muted))]">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item.__adminId || item.id} className="border-t border-[rgb(var(--border))] align-top transition hover:bg-[rgb(var(--primary))]/5">
                    {active.columns.map((column) => (
                      <td key={column.key} className="max-w-[280px] px-4 py-3">
                        <span className="line-clamp-2">{formatCell(item[column.key])}</span>
                      </td>
                    ))}
                    {(canEdit || canDelete) ? (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {canEdit ? (
                          <button type="button" onClick={() => openEdit(item)} className="mr-3 inline-flex items-center gap-1 text-xs font-bold text-[rgb(var(--primary))]">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button type="button" onClick={() => onDelete(item)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={active.columns.length + (canEdit || canDelete ? 1 : 0)} className="px-4 py-8 text-center text-[rgb(var(--fg-muted))]">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-[rgb(var(--border))] bg-white p-3 dark:bg-[rgb(var(--bg-elev))] sm:flex-row">
        <p className="text-sm font-semibold text-[rgb(var(--fg-muted))]">
          Page {formatNumber(page)} of {formatNumber(totalPages)}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="btn-ghost h-10 px-3 disabled:pointer-events-none disabled:opacity-45">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="btn-primary h-10 px-3 disabled:pointer-events-none disabled:opacity-45">
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {formOpen ? (
        <EditModal
          entity={active}
          item={editing || {}}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSave={onSave}
        />
      ) : null}
    </div>
  );
}

function EditModal({
  entity,
  item,
  onClose,
  onSave
}: {
  entity: LargeAdminEntity;
  item: any;
  onClose: () => void;
  onSave: (values: Record<string, any>) => Promise<void>;
}) {
  const isEdit = Boolean(item.__adminId || item.id);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="glass-strong max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg p-6 nice-scroll" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">{entity.label}</p>
            <h3 className="font-display text-xl font-bold">{isEdit ? "Edit" : "Create"} record</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-[rgb(var(--bg-elev))]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const values: Record<string, any> = {};
            entity.fields.forEach((field) => {
              const raw = form.get(field.name);
              if (field.type === "checkbox") values[field.name] = raw === "on";
              else if (field.type === "number") values[field.name] = raw === "" || raw === null ? null : Number(raw);
              else values[field.name] = raw === null ? "" : String(raw);
            });
            void onSave(values);
          }}
        >
          {entity.fields.map((field) => {
            const disabled = isEdit && field.readOnlyOnEdit;
            const value = item[field.name] ?? "";
            return (
              <label key={field.name} className={field.type === "textarea" ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
                <span className="text-xs font-bold text-[rgb(var(--fg-muted))]">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea name={field.name} required={field.required} defaultValue={value} rows={5} disabled={disabled} className="input resize-none disabled:opacity-60" />
                ) : field.type === "select" ? (
                  <select name={field.name} required={field.required} defaultValue={String(value)} disabled={disabled} className="input h-11 disabled:opacity-60">
                    <option value="">Select</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input name={field.name} type="checkbox" defaultChecked={Boolean(value)} disabled={disabled} className="h-5 w-5 rounded border-[rgb(var(--border))] disabled:opacity-60" />
                ) : (
                  <input name={field.name} type={field.type === "number" ? "number" : "text"} step={field.type === "number" ? "any" : undefined} required={field.required} defaultValue={value} disabled={disabled} className="input h-11 disabled:opacity-60" />
                )}
              </label>
            );
          })}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString("en-IN") : "-";
  return String(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}
