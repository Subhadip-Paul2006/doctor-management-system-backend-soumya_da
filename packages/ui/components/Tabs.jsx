"use client";

import { useId, useState } from "react";
import { cx } from "./_cx";

/**
 * @param {Object} props
 * @param {{value: string, label: React.ReactNode, content?: React.ReactNode}[]} props.tabs
 * @param {string} [props.defaultValue]
 * @param {string} [props.value]
 * @param {(v: string) => void} [props.onChange]
 * @param {string} [props.className]
 */
export function Tabs({ tabs, defaultValue, value, onChange, className = "" }) {
  const [internal, setInternal] = useState(defaultValue ?? tabs?.[0]?.value);
  const active = value !== undefined ? value : internal;
  const baseId = useId();

  function select(v) {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  }

  function onKeyDown(e) {
    const idx = tabs.findIndex((t) => t.value === active);
    if (e.key === "ArrowRight") {
      const next = tabs[(idx + 1) % tabs.length];
      select(next.value);
    } else if (e.key === "ArrowLeft") {
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      select(prev.value);
    }
  }

  const activeTab = tabs.find((t) => t.value === active);

  return (
    <div className={className}>
      <div role="tablist" aria-label="Tabs" onKeyDown={onKeyDown} className="flex gap-1 border-b border-navy-200">
        {tabs.map((t) => {
          const isActive = t.value === active;
          return (
            <button
              key={t.value}
              role="tab"
              id={`${baseId}-tab-${t.value}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${t.value}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(t.value)}
              className={cx(
                "relative -mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500",
                isActive
                  ? "border-medical-600 text-medical-700"
                  : "border-transparent text-navy-500 hover:text-navy-800"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {activeTab ? (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeTab.value}`}
          aria-labelledby={`${baseId}-tab-${activeTab.value}`}
          className="pt-4 text-sm text-navy-800"
        >
          {activeTab.content}
        </div>
      ) : null}
    </div>
  );
}
