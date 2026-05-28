import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronRight, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";

interface ValidationIssuesProps {
  onNext: () => void;
  onBack: () => void;
}

type Severity = "blocking" | "warning" | "info";

interface Issue {
  id: string;
  severity: Severity;
  code: string;
  title: string;
  detail: string;
  field: string;
  section: string;
}

const ISSUES: Issue[] = [
  { id: "v1", severity: "blocking", code: "VAL-101", title: "EAN saknar kontrollsiffra", detail: "Den angivna EAN-koden 7394376615808 har felaktig kontrollsiffra. Korrekt EAN bor sluta pa 0.", field: "EAN-13", section: "Grunduppgifter" },
  { id: "v2", severity: "blocking", code: "VAL-203", title: "Kalciumvarde saknas", detail: "Kalcium per 100 ml ar ett obligatoriskt naringsvarde for livsmedel i kategori 'Vaxtbaserade drycker'.", field: "Kalcium (mg)", section: "Naringsvarden" },
  { id: "v3", severity: "blocking", code: "VAL-301", title: "GLN-nummer kravs", detail: "Leverantorens GLN-nummer ar obligatoriskt for EDI-hantering och artikelregistrering.", field: "GLN (leverantor)", section: "Logistik" },
  { id: "v4", severity: "warning", code: "VAL-412", title: "Allergentext kan vara ofullstandig", detail: "Sojamarkning anges som 'kan innehalla spar'. Kontrollera om produkten innehaller soja som ingrediens, inte enbart spar.", field: "Innehaller soja", section: "Allergener" },
  { id: "v5", severity: "warning", code: "VAL-508", title: "Kategori har lag AI-konfidens", detail: "'Vaxtbaserade drycker' extraherades med 82% konfidens. Verifiera mot Martin & Serveras produktkatalog.", field: "Produktkategori", section: "Grunduppgifter" },
  { id: "v6", severity: "warning", code: "VAL-601", title: "Kolli per forpackning saknas", detail: "Logistikdata ar ofullstandig utan kolliantal. Kravs for orderhantering.", field: "Kolli per forpackning", section: "Logistik" },
  { id: "v7", severity: "info", code: "VAL-701", title: "Bilder saknas", detail: "Inga produktbilder ar uppladdade. Bilder ar ej obligatoriska men rekommenderas starkt for ecommerce.", field: "Produktbild", section: "Bilder och media" },
  { id: "v8", severity: "info", code: "VAL-702", title: "Ursprungsland rekommenderas pa engelska", detail: "For exportartiklar rekommenderas att ursprungsland anges pa engelska ('Sweden') i tillagg till svenska.", field: "Ursprungsland", section: "Logistik" },
];

const SEVERITY_CONFIG = {
  blocking: { color: "var(--ms-status-error)", bg: "rgba(192,57,43,0.07)", border: "rgba(192,57,43,0.18)", label: "Blockerar", icon: AlertCircle },
  warning: { color: "var(--ms-amber)", bg: "rgba(200,151,62,0.07)", border: "rgba(200,151,62,0.2)", label: "Varning", icon: AlertTriangle },
  info: { color: "var(--ms-status-info)", bg: "rgba(46,107,170,0.06)", border: "rgba(46,107,170,0.15)", label: "Info", icon: Info },
};

export function ValidationIssues({ onNext, onBack }: ValidationIssuesProps) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [activeIssue, setActiveIssue] = useState<string>("v1");

  const toggleResolved = (id: string) => {
    setResolved((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const blocking = ISSUES.filter((issue) => issue.severity === "blocking" && !resolved.has(issue.id));
  const canSubmit = blocking.length === 0;

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
              Atgarda blockerande problem innan artikeln kan skickas for intern granskning.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <StatusBadge
              count={ISSUES.filter((issue) => issue.severity === "blocking").length - [...resolved].filter((id) => ISSUES.find((issue) => issue.id === id)?.severity === "blocking").length}
              label="blockerar"
              color="var(--ms-status-error)"
              bg="rgba(192,57,43,0.08)"
              border="rgba(192,57,43,0.2)"
            />
            <StatusBadge
              count={ISSUES.filter((issue) => issue.severity === "warning").length}
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
            const severityIssues = ISSUES.filter((issue) => issue.severity === severity);
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
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    active={activeIssue === issue.id}
                    resolved={resolved.has(issue.id)}
                    onSelect={() => setActiveIssue(issue.id)}
                    onResolve={() => toggleResolved(issue.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5" style={{ background: "var(--muted)" }}>
          {(() => {
            const issue = ISSUES.find((entry) => entry.id === activeIssue);
            if (!issue) {
              return null;
            }

            const config = SEVERITY_CONFIG[issue.severity];

            return (
              <>
                <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
                  <div className="border-b border-border px-4 pt-4 pb-3" style={{ background: config.bg }}>
                    <div className="mb-1 flex items-center gap-2">
                      <config.icon size={14} style={{ color: config.color }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: config.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
                        {issue.code}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>{issue.title}</p>
                  </div>
                  <div className="p-4">
                    <p style={{ fontSize: "13px", color: "var(--foreground)", lineHeight: "1.6", marginBottom: "12px" }}>{issue.detail}</p>
                    <div className="flex flex-col gap-2">
                      <InfoRow label="Falt" value={issue.field} />
                      <InfoRow label="Sektion" value={issue.section} />
                      <InfoRow label="Allvarlighetsgrad" value={config.label} valueColor={config.color} />
                    </div>
                  </div>
                </div>

                <button className="flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all hover:opacity-90" style={{ background: "var(--ms-green)", color: "#fff" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Ga till falt: {issue.field}</span>
                  <ExternalLink size={14} />
                </button>

                <button
                  onClick={() => toggleResolved(issue.id)}
                  className="flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all"
                  style={{
                    background: resolved.has(issue.id) ? "rgba(45,106,79,0.08)" : "var(--card)",
                    border: `1px solid ${resolved.has(issue.id) ? "rgba(45,106,79,0.25)" : "var(--border)"}`,
                    color: resolved.has(issue.id) ? "var(--ms-status-ok)" : "var(--foreground)",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>
                    {resolved.has(issue.id) ? "Markerad som atgardad" : "Markera som atgardad"}
                  </span>
                  <CheckCircle2 size={14} style={{ color: resolved.has(issue.id) ? "var(--ms-status-ok)" : "var(--muted-foreground)" }} />
                </button>
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-5" style={{ background: "var(--card)" }}>
        <button onClick={onBack} className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:bg-muted" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          <ArrowLeft size={16} /> Tillbaka
        </button>
        <div className="flex items-center gap-3">
          {!canSubmit && <p style={{ fontSize: "13px", color: "var(--ms-status-error)" }}>{blocking.length} blockerande problem kvar</p>}
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
            Skicka for intern granskning <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueRow({
  issue,
  active,
  resolved,
  onSelect,
  onResolve,
}: {
  issue: Issue;
  active: boolean;
  resolved: boolean;
  onSelect: () => void;
  onResolve: () => void;
}) {
  const config = SEVERITY_CONFIG[issue.severity];

  return (
    <div
      onClick={onSelect}
      className="mb-1 flex cursor-pointer items-start gap-3 rounded-lg px-4 py-3 transition-all"
      style={{
        background: active ? config.bg : resolved ? "rgba(45,106,79,0.04)" : "var(--card)",
        border: `1px solid ${active ? config.border : resolved ? "rgba(45,106,79,0.15)" : "var(--border)"}`,
        opacity: resolved ? 0.7 : 1,
      }}
    >
      <config.icon size={14} style={{ color: resolved ? "var(--ms-status-ok)" : config.color, flexShrink: 0, marginTop: "2px" }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--muted-foreground)" }}>{issue.code}</span>
          {resolved && <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--ms-status-ok)", letterSpacing: "0.05em" }}>ATGARDAD</span>}
        </div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", marginTop: "1px" }}>{issue.title}</p>
        <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>{issue.section} › {issue.field}</p>
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onResolve();
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <ChevronRight size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: "3px" }} />
    </div>
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
