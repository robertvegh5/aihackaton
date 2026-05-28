import { useState } from "react";
import { SupplierUpload } from "./components/SupplierUpload";
import { SupplierForm } from "./components/SupplierForm";
import { AIProcessing } from "./components/AIProcessing";
import { AIDraftReview } from "./components/AIDraftReview";
import { ValidationIssues } from "./components/ValidationIssues";
import { InternalReview } from "./components/InternalReview";

export type UploadMode = "upload" | "manual";

export type UploadedFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
};

export type ArticleDraft = {
  supplierSubmissionId: string;
  scenarioId: string;
  status: string;
  sourceFiles: Array<{
    id: string;
    type: string;
    name: string;
    path: string;
  }>;
  displayImages: Array<{
    id: string;
    type: string;
    name: string;
    path: string;
  }>;
  product: {
    productName: string;
    brand: string;
    packageSize: string;
  };
  ingredients: {
    text: string;
  };
  allergens: {
    declared: string[];
  };
  nutrition: {
    energyKj: number | null;
    fat: number | null;
    carbohydrates: number | null;
    protein: number | null;
    salt: number | null;
  };
  generatedCopy: {
    shortDescription: string;
  };
  confidence: {
    product: number;
    ingredients: number;
    allergens: number;
    nutrition: number;
  };
  missingFields: string[];
  extractedMetadata?: {
    articleNumber?: string;
    category?: string;
    ean?: string;
    countryOfOrigin?: string;
    packaging?: string;
    netWeight?: string;
    storage?: string;
  };
};

type Screen =
  | "supplier-upload"
  | "supplier-form"
  | "ai-processing"
  | "ai-draft"
  | "validation"
  | "internal-review";

const PAIRS = [
  {
    id: "pair1",
    label: "Par 1",
    sublabel: "Leverantorsflode",
    screens: [
      { id: "supplier-upload" as Screen, label: "1A · Uppladdning" },
      { id: "supplier-form" as Screen, label: "1B · Artikelformular" },
    ],
  },
  {
    id: "pair2",
    label: "Par 2",
    sublabel: "AI-extraktion",
    screens: [
      { id: "ai-processing" as Screen, label: "2A · Bearbetning" },
      { id: "ai-draft" as Screen, label: "2B · Utkastgranskning" },
    ],
  },
  {
    id: "pair3",
    label: "Par 3",
    sublabel: "Validering och granskning",
    screens: [
      { id: "validation" as Screen, label: "3A · Valideringsproblem" },
      { id: "internal-review" as Screen, label: "3B · Intern granskning" },
    ],
  },
];

export function App() {
  const [screen, setScreen] = useState<Screen>("supplier-upload");
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [articleDraft, setArticleDraft] = useState<ArticleDraft | null>(null);
  const [formFocusTarget, setFormFocusTarget] = useState<string | null>(null);
  const [step2Available, setStep2Available] = useState(false);
  const [step3Available, setStep3Available] = useState(false);

  const screenEnabled: Record<Screen, boolean> = {
    "supplier-upload": true,
    "supplier-form": step2Available,
    "ai-processing": uploadMode === "upload" && uploadedFiles.length > 0,
    "ai-draft": step2Available,
    validation: step3Available,
    "internal-review": step3Available,
  };

  const nav = (nextScreen: Screen) => {
    if (!screenEnabled[nextScreen]) {
      return;
    }

    setScreen(nextScreen);
  };

  const openDraftAtField = (field: string) => {
    setFormFocusTarget(ISSUE_FIELD_TO_FORM_TARGET[field] ?? field);
    nav("supplier-form");
  };

  const handleStartFlow = () => {
    if (uploadMode === "manual") {
      setArticleDraft(null);
      setUploadError(null);
      setStep2Available(true);
      setScreen("supplier-form");
      return;
    }

    if (uploadedFiles.length === 0) {
      return;
    }

    setUploadError(null);
    setScreen("ai-processing");
  };

  const handleProcessUpload = async () => {
    setIsExtracting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("mode", uploadMode);
      formData.append("scenarioId", "scenario-b");
      uploadedFiles.forEach((uploadedFile) => {
        formData.append("files", uploadedFile.file, uploadedFile.name);
      });

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { articleDraft: ArticleDraft };
      setArticleDraft(data.articleDraft);
      setStep2Available(true);
      return true;
    } catch (error) {
      setUploadError(error instanceof Error ? `Kunde inte starta extraktion: ${error.message}` : "Kunde inte starta extraktion.");
      return false;
    } finally {
      setIsExtracting(false);
    }
  };

  const handleValidationStart = () => {
    setStep3Available(true);
    setScreen("validation");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: "var(--background)" }}>
      <header
        className="flex h-[52px] flex-shrink-0 items-center justify-between border-b border-border px-6"
        style={{ background: "var(--ms-green)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded"
              style={{ background: "var(--ms-amber)" }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "-0.04em",
                }}
              >
                M
              </span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#fff", letterSpacing: "-0.01em" }}>
              Martin &amp; Servera
            </span>
          </div>
          <div className="h-5 w-px opacity-30" style={{ background: "#fff" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            Artikelportal - Leverantor
          </span>
        </div>

        <div className="flex items-center gap-1">
          {PAIRS.map((pair) => (
            <div key={pair.id} className="flex items-center gap-0.5">
              {pair.screens.map((pairScreen) => {
                const enabled = screenEnabled[pairScreen.id];

                return (
                  <button
                    key={pairScreen.id}
                    onClick={() => nav(pairScreen.id)}
                    disabled={!enabled}
                    className="rounded-md px-3 py-1.5 transition-all"
                    style={{
                      background: screen === pairScreen.id ? "rgba(255,255,255,0.18)" : "transparent",
                      color:
                        screen === pairScreen.id
                          ? "#fff"
                          : enabled
                            ? "rgba(255,255,255,0.6)"
                            : "rgba(255,255,255,0.3)",
                      fontSize: "12px",
                      fontWeight: screen === pairScreen.id ? 600 : 400,
                      border:
                        screen === pairScreen.id
                          ? "1px solid rgba(255,255,255,0.2)"
                          : "1px solid transparent",
                      cursor: enabled ? "pointer" : "not-allowed",
                    }}
                  >
                    {pairScreen.label}
                  </button>
                );
              })}
              <div className="mx-1 h-4 w-px opacity-20" style={{ background: "#fff" }} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>EL</span>
          </div>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
            Erik Lindqvist · Oatly AB
          </span>
        </div>
      </header>

      <div className="flex flex-shrink-0 items-center gap-6 border-b border-border px-8 py-2" style={{ background: "var(--card)" }}>
        {PAIRS.map((pair) => {
          const active = pair.screens.some((pairScreen) => pairScreen.id === screen);
          const enabled = pair.screens.some((pairScreen) => screenEnabled[pairScreen.id]);

          return (
            <button
              key={pair.id}
              onClick={() => nav(pair.screens[0].id)}
              disabled={!enabled}
              className="flex items-center gap-2 transition-all"
              style={{ opacity: enabled ? 1 : 0.5, cursor: enabled ? "pointer" : "not-allowed" }}
            >
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "var(--ms-amber)" : "var(--border)" }} />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--ms-green)" : "var(--muted-foreground)",
                }}
              >
                {pair.label}: {pair.sublabel}
              </span>
            </button>
          );
        })}
        <div className="flex-1" />
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1"
          style={{ background: "rgba(200,151,62,0.1)", border: "1px solid rgba(200,151,62,0.2)" }}
        >
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ms-amber)" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--ms-amber)" }}>
            Proof of Concept - Martin &amp; Servera
          </span>
        </div>
      </div>

      <main className="flex-1 overflow-hidden">
        {screen === "supplier-upload" && (
          <SupplierUpload
            mode={uploadMode}
            files={uploadedFiles}
            error={uploadError}
            isSubmitting={isExtracting}
            onModeChange={setUploadMode}
            onFilesChange={setUploadedFiles}
            onNext={handleStartFlow}
          />
        )}
        {screen === "supplier-form" && (
          <SupplierForm
            articleDraft={articleDraft}
            uploadedFiles={uploadedFiles}
            uploadMode={uploadMode}
            focusTarget={formFocusTarget}
            onFocusTargetHandled={() => setFormFocusTarget(null)}
            onNext={handleValidationStart}
            onBack={() => nav("supplier-upload")}
          />
        )}
        {screen === "ai-processing" && (
          <AIProcessing
            files={uploadedFiles}
            articleDraft={articleDraft}
            onProcess={handleProcessUpload}
            processingError={uploadError}
            onComplete={() => setScreen("ai-draft")}
            onBack={() => nav("supplier-upload")}
          />
        )}
        {screen === "ai-draft" && (
          <AIDraftReview articleDraft={articleDraft} onNext={handleValidationStart} onBack={() => nav("ai-processing")} />
        )}
        {screen === "validation" && (
          <ValidationIssues onSelectIssue={openDraftAtField} onNext={() => nav("internal-review")} onBack={() => nav("ai-draft")} />
        )}
        {screen === "internal-review" && <InternalReview onBack={() => nav("validation")} />}
      </main>
    </div>
  );
}

const ISSUE_FIELD_TO_FORM_TARGET: Record<string, string> = {
  "EAN-13": "ean",
  "Kalcium (mg)": "calcium",
  "GLN (leverantor)": "supplierGln",
  "Innehaller soja": "section:allergens",
  Produktkategori: "category",
  "Kolli per forpackning": "casesPerPackage",
  Produktbild: "section:media",
  Ursprungsland: "countryOfOrigin",
};
