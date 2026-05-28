import { useState } from "react";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ArrowRight, ArrowLeft } from "lucide-react";

interface SupplierFormProps {
  onNext: () => void;
  onBack: () => void;
}

const SECTIONS = [
  { id: "basic", label: "Grunduppgifter", required: true },
  { id: "packaging", label: "Förpackning & mått", required: true },
  { id: "nutrition", label: "Näringsvärden", required: true },
  { id: "allergens", label: "Allergener", required: true },
  { id: "logistics", label: "Logistik", required: false },
  { id: "media", label: "Bilder & media", required: false },
];

const ALLERGENS = [
  "Gluten", "Kräftdjur", "Ägg", "Fisk", "Jordnötter",
  "Soja", "Mjölk", "Nötter", "Selleri", "Senap",
  "Sesamfrön", "Svaveldioxid", "Lupin", "Blötdjur",
];

export function SupplierForm({ onNext, onBack }: SupplierFormProps) {
  const [openSection, setOpenSection] = useState("basic");
  const [allergens, setAllergens] = useState<string[]>(["Mjölk", "Soja"]);
  const [completedSections] = useState(new Set(["basic", "allergens"]));

  const toggleAllergen = (a: string) => {
    setAllergens((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--ms-amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>STEG 2 AV 4</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ color: "var(--ms-green)" }}>Granska och komplettera</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
              AI:n har förifyllt fälten nedan. Kontrollera, korrigera och fyll i det som saknas.
            </p>
          </div>
          <div className="flex-shrink-0 px-3 py-1.5 rounded-full flex items-center gap-2" style={{ background: "rgba(200,151,62,0.12)", border: "1px solid rgba(200,151,62,0.25)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--ms-amber)" }}></div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ms-amber)" }}>3 fält saknas</span>
          </div>
        </div>

        {/* Section progress pills */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setOpenSection(s.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all"
              style={{
                background: openSection === s.id ? "var(--ms-green)" : completedSections.has(s.id) ? "rgba(45,106,79,0.1)" : "var(--muted)",
                color: openSection === s.id ? "#fff" : completedSections.has(s.id) ? "var(--ms-status-ok)" : "var(--muted-foreground)",
                fontSize: "12px",
                fontWeight: 500,
                border: `1px solid ${openSection === s.id ? "transparent" : completedSections.has(s.id) ? "rgba(45,106,79,0.2)" : "var(--border)"}`,
              }}
            >
              {completedSections.has(s.id) && openSection !== s.id && <CheckCircle2 size={11} />}
              {s.label}
              {s.required && !completedSections.has(s.id) && openSection !== s.id && <span style={{ color: "var(--destructive)", fontSize: "10px" }}>*</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-3">

        {/* Grunduppgifter */}
        <FormSection id="basic" label="Grunduppgifter" open={openSection === "basic"} onToggle={() => setOpenSection(openSection === "basic" ? "" : "basic")} complete>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Artikelnamn" value="Oatly Havredryck Ekologisk 1 L" aiExtracted />
            <Field label="EAN-13" value="7394376615808" aiExtracted />
            <Field label="Artikelnummer (leverantör)" value="OAT-HAVR-EKO-001" aiExtracted />
            <Field label="Varumärke" value="Oatly" aiExtracted />
            <Field label="Produktkategori" value="Växtbaserade drycker" aiExtracted />
            <Field label="Kortbeskrivning" value="Ekologisk havredryck" aiExtracted full />
          </div>
        </FormSection>

        {/* Förpackning */}
        <FormSection id="packaging" label="Förpackning & mått" open={openSection === "packaging"} onToggle={() => setOpenSection(openSection === "packaging" ? "" : "packaging")}>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Nettovikt (g)" value="1000" aiExtracted />
            <Field label="Volym (ml)" value="1000" aiExtracted />
            <Field label="Förpackningstyp" value="Tetrapack" aiExtracted />
            <Field label="Höjd (mm)" value="190" aiExtracted />
            <Field label="Bredd (mm)" value="70" aiExtracted />
            <Field label="Djup (mm)" value="70" aiExtracted />
            <Field label="Kolli per förpackning" value="" missing />
            <Field label="Vikt per kolli (kg)" value="" missing />
          </div>
        </FormSection>

        {/* Näring */}
        <FormSection id="nutrition" label="Näringsvärden per 100 ml" open={openSection === "nutrition"} onToggle={() => setOpenSection(openSection === "nutrition" ? "" : "nutrition")}>
          <div className="grid grid-cols-4 gap-4">
            {[
              { l: "Energi (kJ)", v: "192" }, { l: "Energi (kcal)", v: "46" },
              { l: "Fett (g)", v: "1.5" }, { l: "varav mättat fett (g)", v: "0.2" },
              { l: "Kolhydrater (g)", v: "6.7" }, { l: "varav sockerarter (g)", v: "4.0" },
              { l: "Kostfiber (g)", v: "0.8" }, { l: "Protein (g)", v: "1.0" },
              { l: "Salt (g)", v: "0.1" }, { l: "Kalcium (mg)", v: "" },
            ].map((f) => (
              <Field key={f.l} label={f.l} value={f.v} aiExtracted={!!f.v} missing={!f.v} />
            ))}
          </div>
        </FormSection>

        {/* Allergener */}
        <FormSection id="allergens" label="Allergener" open={openSection === "allergens"} onToggle={() => setOpenSection(openSection === "allergens" ? "" : "allergens")} complete>
          <div>
            <p className="mb-3" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Välj alla ämnen som förekommer i produkten (inkl. spår)</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: allergens.includes(a) ? "var(--ms-green)" : "var(--muted)",
                    color: allergens.includes(a) ? "#fff" : "var(--foreground)",
                    fontSize: "13px",
                    fontWeight: allergens.includes(a) ? 500 : 400,
                    border: "1px solid " + (allergens.includes(a) ? "transparent" : "var(--border)"),
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        {/* Logistik */}
        <FormSection id="logistics" label="Logistik" open={openSection === "logistics"} onToggle={() => setOpenSection(openSection === "logistics" ? "" : "logistics")}>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Hållbarhet (dagar)" value="365" aiExtracted />
            <Field label="Lagringstemperatur" value="Rumstemperatur" aiExtracted />
            <Field label="Öppnad hållbarhet (dagar)" value="5" aiExtracted />
            <Field label="Ursprungsland" value="Sverige" aiExtracted />
            <Field label="GLN (leverantör)" value="" missing />
          </div>
        </FormSection>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-border flex items-center justify-between" style={{ background: "var(--card)" }}>
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          <ArrowLeft size={16} /> Tillbaka
        </button>
        <button onClick={onNext} className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:opacity-90" style={{ background: "var(--ms-green)", color: "#fff", fontWeight: 600, fontSize: "14px" }}>
          Skicka för validering <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function FormSection({ id, label, open, onToggle, children, complete }: {
  id: string; label: string; open: boolean; onToggle: () => void; children: React.ReactNode; complete?: boolean;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-muted/40"
      >
        <div className="flex items-center gap-3">
          {complete ? (
            <CheckCircle2 size={16} style={{ color: "var(--ms-status-ok)" }} />
          ) : (
            <div className="w-4 h-4 rounded-full" style={{ border: "2px solid var(--border)" }} />
          )}
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--foreground)" }}>{label}</span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: "var(--muted-foreground)" }} /> : <ChevronDown size={16} style={{ color: "var(--muted-foreground)" }} />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, aiExtracted, missing, full }: {
  label: string; value: string; aiExtracted?: boolean; missing?: boolean; full?: boolean;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--muted-foreground)" }}>{label}</label>
        {aiExtracted && (
          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: "rgba(27,58,45,0.08)", color: "var(--ms-green)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>AI</span>
        )}
        {missing && (
          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: "rgba(192,57,43,0.08)", color: "var(--ms-status-error)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>SAKNAS</span>
        )}
      </div>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={missing ? "Fyll i…" : ""}
        className="w-full px-3 py-2 rounded-lg transition-all outline-none focus:ring-2"
        style={{
          background: missing ? "rgba(192,57,43,0.04)" : "var(--input-background)",
          border: `1px solid ${missing ? "rgba(192,57,43,0.3)" : "var(--border)"}`,
          fontSize: "14px",
          color: "var(--foreground)",
        }}
      />
    </div>
  );
}
