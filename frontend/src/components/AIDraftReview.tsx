import { useState } from "react";
import { Edit3, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface AIDraftReviewProps {
  onNext: () => void;
  onBack: () => void;
}

interface DraftField {
  label: string;
  value: string;
  confidence: number;
  source: string;
  warning?: string;
  missing?: boolean;
}

interface DraftSection {
  section: string;
  fields: DraftField[];
}

const DRAFT_FIELDS: DraftSection[] = [
  {
    section: "Grunduppgifter",
    fields: [
      { label: "Artikelnamn", value: "Oatly Havredryck Ekologisk 1 L", confidence: 98, source: "Produktblad s.1" },
      { label: "EAN-13", value: "7394376615808", confidence: 99, source: "Streckkod s.1" },
      { label: "Varumarke", value: "Oatly", confidence: 99, source: "Produktblad s.1" },
      { label: "Kategori", value: "Vaxtbaserade drycker", confidence: 82, source: "Produktblad s.2", warning: "Lag konfidens - verifiera" },
      { label: "Artikelnummer", value: "OAT-HAVR-EKO-001", confidence: 94, source: "Artikeldata.xlsx A3" },
    ],
  },
  {
    section: "Naringsvarden (per 100 ml)",
    fields: [
      { label: "Energi (kJ)", value: "192", confidence: 96, source: "Naringstabell s.4" },
      { label: "Fett (g)", value: "1.5", confidence: 96, source: "Naringstabell s.4" },
      { label: "Kolhydrater (g)", value: "6.7", confidence: 95, source: "Naringstabell s.4" },
      { label: "varav sockerarter (g)", value: "4.0", confidence: 93, source: "Naringstabell s.4" },
      { label: "Protein (g)", value: "1.0", confidence: 96, source: "Naringstabell s.4" },
      { label: "Kalcium (mg)", value: "-", confidence: 0, source: "Ej hittad", missing: true },
    ],
  },
  {
    section: "Allergener",
    fields: [
      { label: "Innehaller mjolk", value: "Nej", confidence: 91, source: "Ingredienslista s.3" },
      { label: "Innehaller soja", value: "Nej - kan innehalla spar", confidence: 88, source: "Allergentext s.3", warning: "Dubbelkolla sparmarkning" },
      { label: "Innehaller gluten", value: "Nej", confidence: 95, source: "Ingredienslista s.3" },
    ],
  },
  {
    section: "Logistik",
    fields: [
      { label: "Hallbarhet (dagar)", value: "365", confidence: 90, source: "Produktblad s.6" },
      { label: "Ursprungsland", value: "Sverige", confidence: 97, source: "Produktblad s.1" },
      { label: "Kolli per forpackning", value: "-", confidence: 0, source: "Ej hittad", missing: true },
      { label: "GLN (leverantor)", value: "-", confidence: 0, source: "Ej hittad", missing: true },
    ],
  },
];

export function AIDraftReview({ onNext, onBack }: AIDraftReviewProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const allFields = DRAFT_FIELDS.flatMap((section) => section.fields);
  const missingCount = allFields.filter((field) => field.missing).length;
  const warningCount = allFields.filter((field) => field.warning).length;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-5">
        <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}
          >
            PAR 2 - AI-UTKAST
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ color: "var(--ms-green)" }}>Granska AI-utkast</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
              Verifiera extraherade falt. Klicka pa ett varde for att redigera. Kallhanvisning visas per falt.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Pill color="var(--ms-status-error)" bg="rgba(192,57,43,0.08)" border="rgba(192,57,43,0.2)" label={`${missingCount} saknas`} />
            <Pill color="var(--ms-amber)" bg="rgba(200,151,62,0.1)" border="rgba(200,151,62,0.25)" label={`${warningCount} varningar`} />
            <Pill
              color="var(--ms-status-ok)"
              bg="rgba(45,106,79,0.08)"
              border="rgba(45,106,79,0.2)"
              label={`${allFields.length - missingCount - warningCount} ok`}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ display: "grid", gridTemplateColumns: "1fr 280px" }}>
        <div className="flex flex-col gap-5 overflow-y-auto border-r border-border px-8 py-6">
          {DRAFT_FIELDS.map((section) => (
            <div key={section.section}>
              <p className="mb-2" style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                {section.section}
              </p>
              <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
                {section.fields.map((field, index) => (
                  <div
                    key={field.label}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-all hover:bg-muted/40"
                    style={{
                      borderBottom: index < section.fields.length - 1 ? "1px solid var(--border)" : "none",
                      background: editingField === field.label ? "rgba(27,58,45,0.04)" : "var(--card)",
                    }}
                    onClick={() => setEditingField(editingField === field.label ? null : field.label)}
                  >
                    <div className="w-5 flex-shrink-0">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: field.missing
                            ? "var(--ms-status-error)"
                            : field.warning
                              ? "var(--ms-amber)"
                              : "var(--ms-status-ok)",
                        }}
                      />
                    </div>

                    <p className="w-44 flex-shrink-0" style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 500 }}>
                      {field.label}
                    </p>

                    <div className="flex-1">
                      {editingField === field.label ? (
                        <input
                          defaultValue={field.missing ? "" : field.value}
                          autoFocus
                          className="w-full rounded px-2 py-1 outline-none focus:ring-2"
                          style={{ background: "var(--input-background)", border: "1px solid var(--ms-green)", fontSize: "13px", color: "var(--foreground)" }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: field.missing ? 400 : 500,
                            color: field.missing ? "var(--muted-foreground)" : "var(--foreground)",
                            fontStyle: field.missing ? "italic" : "normal",
                          }}
                        >
                          {field.missing ? "Saknas - fyll i manuellt" : field.value}
                        </span>
                      )}
                      {field.warning && editingField !== field.label && (
                        <p style={{ fontSize: "11px", color: "var(--ms-amber)", marginTop: "2px" }}>{field.warning}</p>
                      )}
                    </div>

                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                      {field.source}
                    </span>

                    {field.confidence > 0 && (
                      <div className="ml-2 flex flex-shrink-0 items-center gap-1.5">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: "var(--muted)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${field.confidence}%`,
                              background:
                                field.confidence >= 90
                                  ? "var(--ms-status-ok)"
                                  : field.confidence >= 75
                                    ? "var(--ms-amber)"
                                    : "var(--ms-status-error)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "var(--muted-foreground)", width: "28px", textAlign: "right" }}>
                          {field.confidence}%
                        </span>
                      </div>
                    )}
                    <Edit3 size={13} style={{ color: "var(--muted-foreground)", opacity: 0.5, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 p-5" style={{ background: "var(--muted)" }}>
          <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={14} style={{ color: "var(--ms-amber)" }} />
              <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)" }}>AI-konfidens</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Hog (>=90%)", count: 11, color: "var(--ms-status-ok)" },
                { label: "Medium (75-89%)", count: 4, color: "var(--ms-amber)" },
                { label: "Lag (<75%)", count: 2, color: "var(--ms-status-error)" },
                { label: "Saknas", count: 3, color: "var(--border)" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: row.color }} />
                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)", flex: 1 }}>{row.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)", marginBottom: "10px" }}>Kalldokument</p>
            {[
              { name: "Produktblad s.1-6", count: 24 },
              { name: "Artikeldata.xlsx", count: 8 },
              { name: "Infererad", count: 2 },
            ].map((source) => (
              <div key={source.name} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{source.name}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "var(--foreground)" }}>
                  {source.count} falt
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.12)" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--ms-green)", marginBottom: "6px" }}>Nasta steg</p>
            <p style={{ fontSize: "12px", color: "var(--ms-green-mid)", lineHeight: "1.6" }}>
              Fyll i de 3 saknade falten. Granska varningarna. Skicka sedan for fullstandig regelvalidering.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-5" style={{ background: "var(--card)" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:bg-muted"
          style={{ fontSize: "14px", color: "var(--muted-foreground)" }}
        >
          <ArrowLeft size={16} /> Tillbaka
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all hover:opacity-90"
          style={{ background: "var(--ms-green)", color: "#fff", fontWeight: 600, fontSize: "14px" }}
        >
          Kor validering <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Pill({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      <span style={{ fontSize: "12px", fontWeight: 600, color }}>{label}</span>
    </div>
  );
}
