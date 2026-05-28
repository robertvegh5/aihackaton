import { useEffect } from "react";
import { motion } from "motion/react";
import { FileText, FileSpreadsheet, Cpu, CheckCircle2, ArrowRight } from "lucide-react";
import type { ArticleDraft, UploadedFile } from "../App";

interface AIProcessingProps {
  onNext: () => void;
  onBack: () => void;
  uploadedFiles: UploadedFile[];
  articleDraft: ArticleDraft | null;
}

const STEPS = [
  { id: 1, label: "Laser in dokument", detail: "Oatly_Produktblad_2024.pdf", duration: 1200 },
  { id: 2, label: "OCR och textextraktion", detail: "Identifierar strukturerade falt", duration: 1800 },
  { id: 3, label: "Extraherar grunduppgifter", detail: "Artikelnamn, EAN, varumarke, kategori...", duration: 1400 },
  { id: 4, label: "Extraherar naringsvarden", detail: "Energi, fett, kolhydrater, protein, salt...", duration: 1600 },
  { id: 5, label: "Identifierar allergener", detail: "Genomsoker ingredienslista och markning", duration: 1000 },
  { id: 6, label: "Kartlagger logistikdata", detail: "Hallbarhet, ursprung, forpackningsmatt", duration: 1200 },
  { id: 7, label: "Validerar extraherade falt", detail: "Kontrollerar format och tackning", duration: 900 },
  { id: 8, label: "Genererar artikelutkast", detail: "Satter samman komplett artikelprofil", duration: 800 },
];

export function AIProcessing({ onNext, onBack, uploadedFiles, articleDraft }: AIProcessingProps) {
  const currentStep = articleDraft ? STEPS.length : Math.max(1, STEPS.length - 2);
  const done = Boolean(articleDraft);

  useEffect(() => {
    if (articleDraft) {
      return;
    }
  }, []);

  const progress = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-6">
        <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}
          >
            PAR 2 - AI-EXTRAKTION
          </span>
        </div>
        <h1 style={{ color: "var(--ms-green)" }}>AI extraherar artikeldata</h1>
        <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
          Automatisk extraktion av strukturerad produktdata fran uppladdade dokument.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-start gap-8 overflow-y-auto px-8 py-8">
        <div className="w-full max-w-xl overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
          <div className="flex items-center gap-4 border-b border-border p-5">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(192,57,43,0.1)" }}>
                <FileText size={18} style={{ color: "#c0392b" }} />
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>{uploadedFiles[0]?.name ?? "Inga dokument valda"}</p>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{uploadedFiles[0] ? `${Math.round(uploadedFiles[0].size / 1024)} KB` : "Kor steg 1 for att ladda upp filer"}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(27,58,45,0.1)" }}>
                <FileSpreadsheet size={18} style={{ color: "var(--ms-green)" }} />
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>article-draft.json</p>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{articleDraft ? articleDraft.status : "Vantar pa extraktion"}</p>
              </div>
            </div>
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: done ? "rgba(45,106,79,0.1)" : "rgba(27,58,45,0.06)" }}
            >
              <Cpu size={18} style={{ color: done ? "var(--ms-status-ok)" : "var(--ms-green)" }} />
            </div>
          </div>

          <div className="px-5 pt-4 pb-2">
            <div className="mb-2 flex items-center justify-between">
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>
                {done ? "Extraktion klar" : "Extraktion redan kord i steg 1"}
              </span>
              <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--ms-green)", fontWeight: 500 }}>
                {progress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--muted)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: done ? "var(--ms-status-ok)" : "var(--ms-green)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 px-5 py-3">
            {STEPS.map((step, index) => {
              const status = index < currentStep ? "done" : index === currentStep ? "active" : "pending";

              return (
                <div key={step.id} className="flex items-center gap-3 py-1.5">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {status === "done" ? (
                      <CheckCircle2 size={14} style={{ color: "var(--ms-status-ok)" }} />
                    ) : status === "active" ? (
                      <motion.div
                        className="h-3 w-3 rounded-full"
                        style={{ background: "var(--ms-amber)" }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    ) : (
                      <div className="h-3 w-3 rounded-full" style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: status === "active" ? 600 : 400,
                        color: status === "pending" ? "var(--muted-foreground)" : "var(--foreground)",
                      }}
                    >
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

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid w-full max-w-xl grid-cols-4 gap-3"
          >
            {[
              {
                label: "Falt extraherade",
                value: articleDraft ? String(Math.max(0, 11 - articleDraft.missingFields.length)) : "-",
                sub: "i article-draft",
              },
              {
                label: "AI-konfidenspoang",
                value: articleDraft
                  ? `${Math.round(((articleDraft.confidence.product + articleDraft.confidence.ingredients + articleDraft.confidence.allergens + articleDraft.confidence.nutrition) / 4) * 100)}%`
                  : "-",
                sub: "genomsnitt",
              },
              {
                label: "Saknade falt",
                value: articleDraft ? String(articleDraft.missingFields.length) : "-",
                sub: "kraver granskning",
              },
              {
                label: "Allergenmarkeringar",
                value: articleDraft ? String(articleDraft.allergens.declared.length) : "-",
                sub: "identifierade",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--ms-green)", letterSpacing: "-0.02em" }}>{stat.value}</p>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--foreground)", marginTop: "2px" }}>{stat.label}</p>
                <p style={{ fontSize: "10px", color: "var(--muted-foreground)", marginTop: "1px" }}>{stat.sub}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-5" style={{ background: "var(--card)" }}>
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-2 transition-all hover:bg-muted"
          style={{ fontSize: "14px", color: "var(--muted-foreground)" }}
        >
          Tillbaka
        </button>
        <button
          onClick={onNext}
          disabled={!done || !articleDraft}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all"
          style={{
            background: done && articleDraft ? "var(--ms-green)" : "var(--muted)",
            color: done && articleDraft ? "#fff" : "var(--muted-foreground)",
            fontWeight: 600,
            fontSize: "14px",
            cursor: done && articleDraft ? "pointer" : "not-allowed",
            opacity: done && articleDraft ? 1 : 0.7,
          }}
        >
          Granska AI-utkast <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
