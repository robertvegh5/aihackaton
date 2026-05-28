import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, FileSpreadsheet, Cpu, CheckCircle2, ArrowRight } from "lucide-react";

interface AIProcessingProps {
  onNext: () => void;
  onBack: () => void;
}

const STEPS = [
  { id: 1, label: "Läser in dokument", detail: "Oatly_Produktblad_2024.pdf", duration: 1200 },
  { id: 2, label: "OCR och textextraktion", detail: "Identifierar strukturerade fält", duration: 1800 },
  { id: 3, label: "Extraherar grunduppgifter", detail: "Artikelnamn, EAN, varumärke, kategori…", duration: 1400 },
  { id: 4, label: "Extraherar näringsvärden", detail: "Energi, fett, kolhydrater, protein, salt…", duration: 1600 },
  { id: 5, label: "Identifierar allergener", detail: "Genomsöker ingredienslista och märkning", duration: 1000 },
  { id: 6, label: "Kartlägger logistikdata", detail: "Hållbarhet, ursprung, förpackningsmått", duration: 1200 },
  { id: 7, label: "Validerar extraherade fält", detail: "Kontrollerar format och täckning", duration: 900 },
  { id: 8, label: "Genererar artikelutkast", detail: "Sätter samman komplett artikelprofil", duration: 800 },
];

export function AIProcessing({ onNext, onBack }: AIProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let total = 0;
    STEPS.forEach((step, i) => {
      total += step.duration;
      const t = setTimeout(() => {
        setCurrentStep(i + 1);
        if (i === STEPS.length - 1) {
          setTimeout(() => setDone(true), 400);
        }
      }, total);
      return () => clearTimeout(t);
    });
  }, []);

  const pct = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--ms-amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>PAR 2 — AI-EXTRAKTION</span>
        </div>
        <h1 style={{ color: "var(--ms-green)" }}>AI extraherar artikeldata</h1>
        <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
          Automatisk extraktion av strukturerad produktdata från dina uppladdade dokument.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-8 items-center justify-start">
        {/* Visual processing card */}
        <div className="w-full max-w-xl rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
          {/* Document feeds */}
          <div className="p-5 flex items-center gap-4 border-b border-border">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(192,57,43,0.1)" }}>
                <FileText size={18} style={{ color: "#C0392B" }} />
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Produktblad_Oatly_2024.pdf</p>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>2.4 MB · 8 sidor</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(27,58,45,0.1)" }}>
                <FileSpreadsheet size={18} style={{ color: "var(--ms-green)" }} />
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Artikeldata_Q4.xlsx</p>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>148 KB · 1 ark</p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: done ? "rgba(45,106,79,0.1)" : "rgba(27,58,45,0.06)" }}>
              <Cpu size={18} style={{ color: done ? "var(--ms-status-ok)" : "var(--ms-green)" }} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>
                {done ? "Extraktion klar" : "Bearbetar…"}
              </span>
              <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--ms-green)", fontWeight: 500 }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: done ? "var(--ms-status-ok)" : "var(--ms-green)" }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Steps list */}
          <div className="px-5 py-3 flex flex-col gap-1">
            {STEPS.map((step, i) => {
              const status = i < currentStep ? "done" : i === currentStep ? "active" : "pending";
              return (
                <div key={step.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {status === "done" ? (
                      <CheckCircle2 size={14} style={{ color: "var(--ms-status-ok)" }} />
                    ) : status === "active" ? (
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ background: "var(--ms-amber)" }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    ) : (
                      <div className="w-3 h-3 rounded-full" style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <span style={{
                      fontSize: "13px",
                      fontWeight: status === "active" ? 600 : 400,
                      color: status === "pending" ? "var(--muted-foreground)" : "var(--foreground)",
                    }}>
                      {step.label}
                    </span>
                    {status === "active" && (
                      <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "1px" }}>{step.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats preview — shown when done */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl grid grid-cols-4 gap-3"
          >
            {[
              { label: "Fält extraherade", value: "34", sub: "av 40 totalt" },
              { label: "AI-konfidenspoäng", value: "87%", sub: "genomsnitt" },
              { label: "Saknade fält", value: "6", sub: "kräver granskning" },
              { label: "Allergenmarkeringar", value: "2", sub: "identifierade" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--ms-green)", letterSpacing: "-0.02em" }}>{s.value}</p>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--foreground)", marginTop: "2px" }}>{s.label}</p>
                <p style={{ fontSize: "10px", color: "var(--muted-foreground)", marginTop: "1px" }}>{s.sub}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="px-8 py-5 border-t border-border flex items-center justify-between" style={{ background: "var(--card)" }}>
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-all" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          Tillbaka
        </button>
        <button
          onClick={onNext}
          disabled={!done}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
          style={{
            background: done ? "var(--ms-green)" : "var(--muted)",
            color: done ? "#fff" : "var(--muted-foreground)",
            fontWeight: 600,
            fontSize: "14px",
            cursor: done ? "pointer" : "not-allowed",
            opacity: done ? 1 : 0.7,
          }}
        >
          Granska AI-utkast <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
