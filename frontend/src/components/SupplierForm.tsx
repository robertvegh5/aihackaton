import { useState, type ReactNode } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ArrowLeft } from "lucide-react";

interface SupplierFormProps {
  onNext: () => void;
  onBack: () => void;
}

const SECTIONS = [
  { id: "basic", label: "Grunduppgifter", required: true },
  { id: "packaging", label: "Forpackning och matt", required: true },
  { id: "nutrition", label: "Naringsvarden", required: true },
  { id: "allergens", label: "Allergener", required: true },
  { id: "logistics", label: "Logistik", required: false },
  { id: "media", label: "Bilder och media", required: false },
];

const ALLERGENS = [
  "Gluten",
  "Kraftdjur",
  "Agg",
  "Fisk",
  "Jordnotter",
  "Soja",
  "Mjolk",
  "Notter",
  "Selleri",
  "Senap",
  "Sesamfron",
  "Svaveldioxid",
  "Lupin",
  "Blotdjur",
];

export function SupplierForm({ onNext, onBack }: SupplierFormProps) {
  const [openSection, setOpenSection] = useState("basic");
  const [allergens, setAllergens] = useState<string[]>(["Mjolk", "Soja"]);
  const [completedSections] = useState(new Set(["basic", "allergens"]));

  const toggleAllergen = (allergen: string) => {
    setAllergens((current) =>
      current.includes(allergen) ? current.filter((item) => item !== allergen) : [...current, allergen],
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-6">
        <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}
          >
            STEG 2 AV 4
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ color: "var(--ms-green)" }}>Granska och komplettera</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
              AI:n har forifyllt falten nedan. Kontrollera, korrigera och fyll i det som saknas.
            </p>
          </div>
          <div
            className="flex flex-shrink-0 items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: "rgba(200,151,62,0.12)", border: "1px solid rgba(200,151,62,0.25)" }}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: "var(--ms-amber)" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ms-amber)" }}>3 falt saknas</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setOpenSection(section.id)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-all"
              style={{
                background:
                  openSection === section.id
                    ? "var(--ms-green)"
                    : completedSections.has(section.id)
                      ? "rgba(45,106,79,0.1)"
                      : "var(--muted)",
                color:
                  openSection === section.id
                    ? "#fff"
                    : completedSections.has(section.id)
                      ? "var(--ms-status-ok)"
                      : "var(--muted-foreground)",
                fontSize: "12px",
                fontWeight: 500,
                border: `1px solid ${
                  openSection === section.id
                    ? "transparent"
                    : completedSections.has(section.id)
                      ? "rgba(45,106,79,0.2)"
                      : "var(--border)"
                }`,
              }}
            >
              {completedSections.has(section.id) && openSection !== section.id && <CheckCircle2 size={11} />}
              {section.label}
              {section.required && !completedSections.has(section.id) && openSection !== section.id && (
                <span style={{ color: "var(--destructive)", fontSize: "10px" }}>*</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-8 py-6">
        <FormSection
          label="Grunduppgifter"
          open={openSection === "basic"}
          onToggle={() => setOpenSection(openSection === "basic" ? "" : "basic")}
          complete
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Artikelnamn" value="Oatly Havredryck Ekologisk 1 L" aiExtracted />
            <Field label="EAN-13" value="7394376615808" aiExtracted />
            <Field label="Artikelnummer (leverantor)" value="OAT-HAVR-EKO-001" aiExtracted />
            <Field label="Varumarke" value="Oatly" aiExtracted />
            <Field label="Produktkategori" value="Vaxtbaserade drycker" aiExtracted />
            <Field label="Kortbeskrivning" value="Ekologisk havredryck" aiExtracted full />
          </div>
        </FormSection>

        <FormSection
          label="Forpackning och matt"
          open={openSection === "packaging"}
          onToggle={() => setOpenSection(openSection === "packaging" ? "" : "packaging")}
        >
          <div className="grid grid-cols-3 gap-4">
            <Field label="Nettovikt (g)" value="1000" aiExtracted />
            <Field label="Volym (ml)" value="1000" aiExtracted />
            <Field label="Forpackningstyp" value="Tetrapack" aiExtracted />
            <Field label="Hojd (mm)" value="190" aiExtracted />
            <Field label="Bredd (mm)" value="70" aiExtracted />
            <Field label="Djup (mm)" value="70" aiExtracted />
            <Field label="Kolli per forpackning" value="" missing />
            <Field label="Vikt per kolli (kg)" value="" missing />
          </div>
        </FormSection>

        <FormSection
          label="Naringsvarden per 100 ml"
          open={openSection === "nutrition"}
          onToggle={() => setOpenSection(openSection === "nutrition" ? "" : "nutrition")}
        >
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Energi (kJ)", value: "192" },
              { label: "Energi (kcal)", value: "46" },
              { label: "Fett (g)", value: "1.5" },
              { label: "varav mattat fett (g)", value: "0.2" },
              { label: "Kolhydrater (g)", value: "6.7" },
              { label: "varav sockerarter (g)", value: "4.0" },
              { label: "Kostfiber (g)", value: "0.8" },
              { label: "Protein (g)", value: "1.0" },
              { label: "Salt (g)", value: "0.1" },
              { label: "Kalcium (mg)", value: "" },
            ].map((field) => (
              <Field key={field.label} label={field.label} value={field.value} aiExtracted={Boolean(field.value)} missing={!field.value} />
            ))}
          </div>
        </FormSection>

        <FormSection
          label="Allergener"
          open={openSection === "allergens"}
          onToggle={() => setOpenSection(openSection === "allergens" ? "" : "allergens")}
          complete
        >
          <div>
            <p className="mb-3" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              Valj alla amnen som forekommer i produkten, inklusive spar.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => toggleAllergen(allergen)}
                  className="rounded-lg px-3 py-1.5 transition-all"
                  style={{
                    background: allergens.includes(allergen) ? "var(--ms-green)" : "var(--muted)",
                    color: allergens.includes(allergen) ? "#fff" : "var(--foreground)",
                    fontSize: "13px",
                    fontWeight: allergens.includes(allergen) ? 500 : 400,
                    border: `1px solid ${allergens.includes(allergen) ? "transparent" : "var(--border)"}`,
                  }}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection
          label="Logistik"
          open={openSection === "logistics"}
          onToggle={() => setOpenSection(openSection === "logistics" ? "" : "logistics")}
        >
          <div className="grid grid-cols-3 gap-4">
            <Field label="Hallbarhet (dagar)" value="365" aiExtracted />
            <Field label="Lagringstemperatur" value="Rumstemperatur" aiExtracted />
            <Field label="Oppnad hallbarhet (dagar)" value="5" aiExtracted />
            <Field label="Ursprungsland" value="Sverige" aiExtracted />
            <Field label="GLN (leverantor)" value="" missing />
          </div>
        </FormSection>
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
          Skicka for validering <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function FormSection({
  label,
  open,
  onToggle,
  children,
  complete,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  complete?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
      <button onClick={onToggle} className="flex w-full items-center justify-between px-5 py-4 transition-all hover:bg-muted/40">
        <div className="flex items-center gap-3">
          {complete ? (
            <CheckCircle2 size={16} style={{ color: "var(--ms-status-ok)" }} />
          ) : (
            <div className="h-4 w-4 rounded-full" style={{ border: "2px solid var(--border)" }} />
          )}
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--foreground)" }}>{label}</span>
        </div>
        {open ? (
          <ChevronUp size={16} style={{ color: "var(--muted-foreground)" }} />
        ) : (
          <ChevronDown size={16} style={{ color: "var(--muted-foreground)" }} />
        )}
      </button>
      {open && <div className="border-t border-border px-5 pt-1 pb-5">{children}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  aiExtracted,
  missing,
  full,
}: {
  label: string;
  value: string;
  aiExtracted?: boolean;
  missing?: boolean;
  full?: boolean;
}) {
  const [currentValue, setCurrentValue] = useState(value);

  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--muted-foreground)" }}>{label}</label>
        {aiExtracted && (
          <span
            className="rounded px-1.5 py-0.5"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              background: "rgba(27,58,45,0.08)",
              color: "var(--ms-green)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            AI
          </span>
        )}
        {missing && (
          <span
            className="rounded px-1.5 py-0.5"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              background: "rgba(192,57,43,0.08)",
              color: "var(--ms-status-error)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            SAKNAS
          </span>
        )}
      </div>
      <input
        value={currentValue}
        onChange={(event) => setCurrentValue(event.target.value)}
        placeholder={missing ? "Fyll i..." : ""}
        className="w-full rounded-lg px-3 py-2 outline-none transition-all focus:ring-2"
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
