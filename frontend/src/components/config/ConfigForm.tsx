import { useState, useEffect } from "react";
import type { TemplateConfigField } from "@/lib/types";
import { Info } from "lucide-react";

interface ConfigFormProps {
  fields: TemplateConfigField[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function ConfigForm({ fields, values, onChange }: ConfigFormProps) {
  const [localValues, setLocalValues] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    for (const field of fields) {
      defaults[field.key] = values[field.key] ?? field.default ?? "";
    }
    return defaults;
  });

  useEffect(() => {
    const defaults: Record<string, unknown> = {};
    for (const field of fields) {
      defaults[field.key] = values[field.key] ?? field.default ?? "";
    }
    setLocalValues(defaults);
  }, [fields, values]);

  const handleChange = (key: string, value: unknown) => {
    const updated = { ...localValues, [key]: value };
    setLocalValues(updated);
    onChange(updated);
  };

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="text-sm font-medium text-zinc-700">{field.label}</label>
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
          {field.description && (
            <div className="flex items-start gap-1.5 mt-0.5 mb-1.5">
              <Info className="h-3 w-3 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400">{field.description}</p>
            </div>
          )}

          {field.type === "select" ? (
            <select
              value={String(localValues[field.key] ?? "")}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              {(field.options ?? []).map((opt) => (
                <option key={String(opt)} value={String(opt)}>
                  {String(opt)}
                </option>
              ))}
            </select>
          ) : field.type === "boolean" ? (
            <label className="mt-1 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(localValues[field.key])}
                onChange={(e) => handleChange(field.key, e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
              />
              <span className="text-sm text-zinc-600">
                {localValues[field.key] ? "Enabled" : "Disabled"}
              </span>
            </label>
          ) : field.type === "number" ? (
            <input
              type="number"
              value={String(localValues[field.key] ?? "")}
              onChange={(e) => handleChange(field.key, e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          ) : (
            <input
              type={isSecretKey(field.key) ? "password" : "text"}
              value={String(localValues[field.key] ?? "")}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={isSecretKey(field.key) ? "Enter your key..." : ""}
              className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** Detect if a config key holds a secret (API key, password, etc.) */
function isSecretKey(key: string): boolean {
  const secretPatterns = ["key", "secret", "password", "token", "api_key"];
  return secretPatterns.some((p) => key.toLowerCase().includes(p));
}
