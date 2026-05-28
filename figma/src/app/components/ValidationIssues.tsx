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
  resolved?: boolean;
}

const ISSUES: Issue[] = [
  { id: "v1", severity: "blocking", code: "VAL-101", title: "EAN saknar kontrollsiffra", detail: "Den angivna EAN-koden 7394376615808 har felaktig kontrollsiffra. Korrekt EAN bör sluta på 0.", field: "EAN-13", section: "Grunduppgifter" },
  { id: "v2", severity: "blocking", code: "VAL-203", title: "Kalciumvärde saknas", detail: "Kalcium per 100 ml är ett obligatoriskt näringsvärde för livsmedel i kategori 'Växtbaserade drycker'.", field: "Kalcium (mg)", section: "Näringsvärden" },
  { id: "v3", severity: "blocking", code: "VAL-301", title: "GLN-nummer krävs", detail: "Leverantörens GLN-nummer är obligatoriskt för EDI-hantering och artikelregistrering.", field: "GLN (leverantör)", section: "Logistik" },
  { id: "v4", severity: "warning", code: "VAL-412", title: "Allergentext kan vara ofullständig", detail: "Sojamärkning anges som 'kan innehålla spår'. Kontrollera om produkten innehåller soja som ingrediens, inte enbart spår.", field: "Innehåller soja", section: "Allergener" },
  { id: "v5", severity: "warning", code: "VAL-508", title: "Kategori har låg AI-konfidens", detail: "'Växtbaserade drycker' extraherades med 82% konfidens. Verifiera mot Martin & Serveras produktkatalog.", field: "Produktkategori", section: "Grunduppgifter" },
  { id: "v6", severity: "warning", code: "VAL-601", title: "Kolli per förpackning saknas", detail: "Logistikdata är ofullständig utan kolliantal. Krävs för orderhantering.", field: "Kolli per förpackning", section: "Logistik" },
  { id: "v7", severity: "info", code: "VAL-701", title: "Bilder saknas", detail: "Inga produktbilder är uppladdade. Bilder är ej obligatoriska men rekommenderas starkt för ecommerce.", field: "Produktbild", section: "Bilder & media" },
  { id: "v8", severity: "info", code: "VAL-702", title: "Ursprungsland rekommenderas på engelska", detail: "För exportartiklar rekommenderas att ursprungsland anges på engelska ('Sweden') i tillägg till svenska.", field: "Ursprungsland", section: "Logistik" },
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
    setResolved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const blocking = ISSUES.filter(i => i.severity === "blocking" && !resolved.has(i.id));
  const canSubmit = blocking.length === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-8 pb-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--ms-amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>PAR 3 — VALIDERING</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ color: "var(--ms-green)" }}>Valideringsresultat</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
              Åtgärda blockerande problem innan artikeln kan skickas för intern granskning.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <StatusBadge count={ISSUES.filter(i => i.severity === "blocking").length - [...resolved].filter(id => ISSUES.find(i => i.id === id)?.severity === "blocking").length} label="blockerar" color="var(--ms-status-error)" bg="rgba(192,57,43,0.08)" border="rgba(192,57,43,0.2)" />
            <StatusBadge count={ISSUES.filter(i => i.severity === "warning").length} label="varningar" color="var(--ms-amber)" bg="rgba(200,151,62,0.1)" border="rgba(200,151,62,0.25)" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}>
        {/* Issue list */}
        <div className="overflow-y-auto px-8 py-5 flex flex-col gap-2 border-r border-border">
          {(["blocking", "warning", "info"] as Severity[]).map((sev) => {
            const sevIssues = ISSUES.filter(i => i.severity === sev);
            if (!sevIssues.length) return null;
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <div key={sev}>
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <cfg.icon size={13} style={{ color: cfg.color }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: cfg.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{cfg.label}</span>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>({sevIssues.length})</span>
                </div>
                {sevIssues.map((issue) => (
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

        {/* Detail panel */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4" style={{ background: "var(--muted)" }}>
          {(() => {
            const issue = ISSUES.find(i => i.id === activeIssue);
            if (!issue) return null;
            const cfg = SEVERITY_CONFIG[issue.severity];
            return (
              <>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
                  <div className="px-4 pt-4 pb-3 border-b border-border" style={{ background: cfg.bg }}>
                    <div className="flex items-center gap-2 mb-1">
                      <cfg.icon size={14} style={{ color: cfg.color }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: cfg.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>{issue.code}</span>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>{issue.title}</p>
                  </div>
                  <div className="p-4">
                    <p style={{ fontSize: "13px", color: "var(--foreground)", lineHeight: "1.6", marginBottom: "12px" }}>{issue.detail}</p>
                    <div className="flex flex-col gap-2">
                      <InfoRow label="Fält" value={issue.field} />
                      <InfoRow label="Sektion" value={issue.section} />
                      <InfoRow label="Allvarlighetsgrad" value={cfg.label} valueColor={cfg.color} />
                    </div>
                  </div>
                </div>

                {/* Jump to field button */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:opacity-90"
                  style={{ background: "var(--ms-green)", color: "#fff" }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Gå till fält: {issue.field}</span>
                  <ExternalLink size={14} />
                </button>

                {/* Mark resolved */}
                <button
                  onClick={() => toggleResolved(issue.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: resolved.has(issue.id) ? "rgba(45,106,79,0.08)" : "var(--card)",
                    border: `1px solid ${resolved.has(issue.id) ? "rgba(45,106,79,0.25)" : "var(--border)"}`,
                    color: resolved.has(issue.id) ? "var(--ms-status-ok)" : "var(--foreground)",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>
                    {resolved.has(issue.id) ? "Markerad som åtgärdad ✓" : "Markera som åtgärdad"}
                  </span>
                  <CheckCircle2 size={14} style={{ color: resolved.has(issue.id) ? "var(--ms-status-ok)" : "var(--muted-foreground)" }} />
                </button>
              </>
            );
          })()}
        </div>
      </div>

      <div className="px-8 py-5 border-t border-border flex items-center justify-between" style={{ background: "var(--card)" }}>
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-all" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          <ArrowLeft size={16} /> Tillbaka
        </button>
        <div className="flex items-center gap-3">
          {!canSubmit && (
            <p style={{ fontSize: "13px", color: "var(--ms-status-error)" }}>
              {blocking.length} blockerande problem kvar
            </p>
          )}
          <button
            onClick={onNext}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
            style={{
              background: canSubmit ? "var(--ms-green)" : "var(--muted)",
              color: canSubmit ? "#fff" : "var(--muted-foreground)",
              fontWeight: 600, fontSize: "14px",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            Skicka för intern granskning <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueRow({ issue, active, resolved, onSelect, onResolve }: {
  issue: Issue; active: boolean; resolved: boolean; onSelect: () => void; onResolve: () => void;
}) {
  const cfg = SEVERITY_CONFIG[issue.severity];
  return (
    <div
      onClick={onSelect}
      className="flex items-start gap-3 px-4 py-3 rounded-lg mb-1 cursor-pointer transition-all"
      style={{
        background: active ? cfg.bg : resolved ? "rgba(45,106,79,0.04)" : "var(--card)",
        border: `1px solid ${active ? cfg.border : resolved ? "rgba(45,106,79,0.15)" : "var(--border)"}`,
        opacity: resolved ? 0.7 : 1,
      }}
    >
      <cfg.icon size={14} style={{ color: resolved ? "var(--ms-status-ok)" : cfg.color, flexShrink: 0, marginTop: "2px" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--muted-foreground)" }}>{issue.code}</span>
          {resolved && <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--ms-status-ok)", letterSpacing: "0.05em" }}>ÅTGÄRDAD</span>}
        </div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", marginTop: "1px" }}>{issue.title}</p>
        <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>{issue.section} › {issue.field}</p>
      </div>
      <ChevronRight size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: "3px" }} />
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{label}</span>
      <span style={{ fontSize: "12px", fontWeight: 500, color: valueColor || "var(--foreground)" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ count, label, color, bg, border }: { count: number; label: string; color: string; bg: string; border: string }) {
  return (
    <div className="px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: bg, border: `1px solid ${border}` }}>
      <span style={{ fontSize: "13px", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
      <span style={{ fontSize: "12px", color }}>{label}</span>
    </div>
  );
}
