import type { ReactNode } from "react";

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-xs font-medium text-text-dim uppercase tracking-wide">
        {children}
      </label>
      {hint && <span className="text-xs text-text-faint">{hint}</span>}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#0e0e13] border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-text-faint mt-1">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span className="text-accent font-semibold text-sm">
          {formatValue ? formatValue(value) : value}
        </span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  leftLabel,
  rightLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="flex items-center bg-[#0e0e13] border border-border rounded-md p-1 text-sm">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-1.5 rounded transition-colors font-medium ${
          !checked ? "bg-accent text-white" : "text-text-dim hover:text-text"
        }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-1.5 rounded transition-colors font-medium ${
          checked ? "bg-accent text-white" : "text-text-dim hover:text-text"
        }`}
      >
        {rightLabel}
      </button>
    </div>
  );
}

export function SimpleToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between bg-[#0e0e13] border border-border rounded-md px-3 py-2"
    >
      <span className="text-sm text-text">{label}</span>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-border-light"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export function NumberInput({
  value,
  onChange,
  prefix,
  step = 0.01,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  step?: number;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-sm">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full bg-[#0e0e13] border border-border rounded-md py-2 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${
          prefix ? "pl-7 pr-3" : "px-3"
        }`}
      />
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl ${className}`}>{children}</div>
  );
}
