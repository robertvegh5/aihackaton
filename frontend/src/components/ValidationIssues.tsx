import { AlertCircle, AlertTriangle, Info, ArrowRight, ArrowLeft } from "lucide-react";
import type { Step3Issue } from "../App";

interface ValidationIssuesProps {
  issues: Step3Issue[];
  blockingCount: number;
  warningCount: number;
  onSelectIssue: (field: string) => void;
  onNext: () => void;
  onBack: () => void;
}

type Severity = Step3Issue["severity"];

const SEVERITY_CONFIG = {
  blocking: { color: "var(--ms-status-error)", bg: "rgba(192,57,43,0.07)", border: "rgba(192,57,43,0.18)", label: "Blockerar", icon: AlertCircle },
  warning: { color: "var(--ms-amber)", bg: "rgba(200,151,62,0.07)", border: "rgba(200,151,62,0.2)", label: "Varning", icon: AlertTriangle },
  info: { color: "var(--ms-status-info)", bg: "rgba(46,107,170,0.06)", border: "rgba(46,107,170,0.15)", label: "Info", icon: Info },
};

export function ValidationIssues({ issues, blockingCount, warningCount, onSelectIssue, onNext, onBack }: ValidationIssuesProps) {
  const canSubmit = blockingCount === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-5">
        <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>
            PAR 3 - VALIDERING
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ color: "var(--ms-green)" }}>Valideringsresultat</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
              Har ser du vad som maste justeras innan artikeln kan skickas vidare.
            </p>
            <p className="mt-2" style={{ color: "var(--ms-green-mid)", fontSize: "12px", fontWeight: 600 }}>
              Klicka pa ett problem for att hoppa direkt till ratt falt i steg 2.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <StatusBadge
              count={blockingCount}
              label="blockerar"
              color="var(--ms-status-error)"
              bg="rgba(192,57,43,0.08)"
              border="rgba(192,57,43,0.2)"
            />
            <StatusBadge
              count={warningCount}
              label="varningar"
              color="var(--ms-amber)"
              bg="rgba(200,151,62,0.1)"
              border="rgba(200,151,62,0.25)"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}>
        <div className="flex flex-col gap-2 overflow-y-auto border-r border-border px-8 py-5">
          {(["blocking", "warning", "info"] as Severity[]).map((severity) => {
            const severityIssues = issues.filter((issue) => issue.severity === severity);
            if (!severityIssues.length) {
              return null;
            }

            const config = SEVERITY_CONFIG[severity];

            return (
              <div key={severity}>
                <div className="mt-2 mb-2 flex items-center gap-2">
                  <config.icon size={13} style={{ color: config.color }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: config.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {config.label}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>({severityIssues.length})</span>
                </div>
                {severityIssues.map((issue) => (
                  <IssueButton
                    key={issue.id}
                    issue={issue}
                    onClick={() => onSelectIssue(issue.field)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5" style={{ background: "var(--muted)" }}>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
            <div className="border-b border-border px-4 pt-4 pb-3">
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>Sammanfattning</p>
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-2">
                <InfoRow label="Blockerande problem" value={String(blockingCount)} valueColor="var(--ms-status-error)" />
                <InfoRow label="Varningar" value={String(warningCount)} />
                <InfoRow label="Mest kritisk sektion" value="Naringsvarden" />
                <InfoRow label="Nasta steg" value="Ratta i steg 2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-5" style={{ background: "var(--card)" }}>
        <button onClick={onBack} className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:bg-muted" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          <ArrowLeft size={16} /> Tillbaka
        </button>
        <div className="flex items-center gap-3">
          {!canSubmit && <p style={{ fontSize: "13px", color: "var(--ms-status-error)" }}>{blockingCount} saker maste andras innan du kan ga vidare</p>}
          <button
            onClick={onNext}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all"
            style={{
              background: canSubmit ? "var(--ms-green)" : "var(--muted)",
              color: canSubmit ? "#fff" : "var(--muted-foreground)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            Skicka till intern granskning <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueButton({
  issue,
  onClick,
}: {
  issue: Step3Issue;
  onClick: () => void;
}) {
  const config = SEVERITY_CONFIG[issue.severity];

  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex w-full cursor-pointer items-start gap-3 rounded-lg px-4 py-3 text-left transition-all hover:opacity-90"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <config.icon size={14} style={{ color: config.color, flexShrink: 0, marginTop: "2px" }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{issue.code}</span>
        </div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", marginTop: "1px" }}>{issue.title}</p>
        <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>{issue.section} · {issue.field}</p>
        <p style={{ fontSize: "12px", color: config.color, marginTop: "6px", fontWeight: 600 }}>Oppna i utkastet</p>
      </div>
    </button>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{label}</span>
      <span style={{ fontSize: "12px", fontWeight: 500, color: valueColor || "var(--foreground)" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ count, label, color, bg, border }: { count: number; label: string; color: string; bg: string; border: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: bg, border: `1px solid ${border}` }}>
      <span style={{ fontSize: "13px", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
      <span style={{ fontSize: "12px", color }}>{label}</span>
    </div>
  );
}
