import { useState } from "react";
import { SupplierUpload } from "./components/SupplierUpload";
import { SupplierForm, type SupplierFormSubmission } from "./components/SupplierForm";
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

export type Step3Issue = {
  id: string;
  severity: "blocking" | "warning" | "info";
  code: string;
  title: string;
  detail: string;
  field: string;
  section: string;
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

const HEADER_NAV_ITEMS: Array<{ id: Screen; label: string }> = [
  { id: "supplier-upload", label: "Uppladdning" },
  { id: "ai-processing", label: "Bearbetning" },
  { id: "supplier-form", label: "Artikelformular" },
  { id: "validation", label: "Valideringsproblem" },
  { id: "internal-review", label: "Intern granskning" },
];

export function App() {
  const [screen, setScreen] = useState<Screen>("supplier-upload");
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [articleDraft, setArticleDraft] = useState<ArticleDraft | null>(null);
  const [formSubmission, setFormSubmission] = useState<SupplierFormSubmission | null>(null);
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

  const step3Issues = formSubmission ? buildStep3Issues(formSubmission, articleDraft) : [];
  const blockingIssues = step3Issues.filter((issue) => issue.severity === "blocking");
  const warningIssues = step3Issues.filter((issue) => issue.severity === "warning");

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
      setFormSubmission(null);
      setUploadError(null);
      setStep2Available(true);
      setStep3Available(false);
      setScreen("supplier-form");
      return;
    }

    if (uploadedFiles.length === 0) {
      return;
    }

    setUploadError(null);
    setFormSubmission(null);
    setStep3Available(false);
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

  const handleFormSubmit = (submission: SupplierFormSubmission) => {
    setFormSubmission(submission);
    setStep3Available(true);
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
          {HEADER_NAV_ITEMS.map((item) => {
            const enabled = screenEnabled[item.id];

            return (
              <button
                key={item.id}
                onClick={() => nav(item.id)}
                disabled={!enabled}
                className="rounded-md px-3 py-1.5 transition-all"
                style={{
                  background: screen === item.id ? "rgba(255,255,255,0.18)" : "transparent",
                  color: screen === item.id ? "#fff" : enabled ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                  fontSize: "12px",
                  fontWeight: screen === item.id ? 600 : 400,
                  border: screen === item.id ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                  cursor: enabled ? "pointer" : "not-allowed",
                }}
              >
                {item.label}
              </button>
            );
          })}
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
            initialSubmission={formSubmission}
            onFocusTargetHandled={() => setFormFocusTarget(null)}
            onSubmit={handleFormSubmit}
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
            onComplete={() => setScreen("supplier-form")}
            onBack={() => nav("supplier-upload")}
          />
        )}
        {screen === "ai-draft" && (
          <AIDraftReview articleDraft={articleDraft} onNext={handleValidationStart} onBack={() => nav("ai-processing")} />
        )}
        {screen === "validation" && (
          <ValidationIssues
            issues={step3Issues}
            blockingCount={blockingIssues.length}
            warningCount={warningIssues.length}
            onSelectIssue={openDraftAtField}
            onNext={() => nav("internal-review")}
            onBack={() => nav("supplier-form")}
          />
        )}
        {screen === "internal-review" && (
          <InternalReview
            submission={formSubmission}
            blockingCount={blockingIssues.length}
            warningCount={warningIssues.length}
            onBack={() => nav("validation")}
          />
        )}
      </main>
    </div>
  );
}

const ISSUE_FIELD_TO_FORM_TARGET: Record<string, string> = {
  "EAN-13": "ean",
  "GLN (leverantor)": "supplierGln",
  "Innehaller soja": "section:allergens",
  Produktkategori: "category",
  "Kolli per forpackning": "casesPerPackage",
  Produktbild: "section:media",
  Ursprungsland: "countryOfOrigin",
};

function buildStep3Issues(submission: SupplierFormSubmission, articleDraft: ArticleDraft | null): Step3Issue[] {
  const issues: Step3Issue[] = [];
  const eanDigits = submission.values.ean.replace(/\D/g, "");
  const energyKj = submission.values.energyKj.trim();
  const fat = submission.values.fat.trim();
  const carbohydrates = submission.values.carbohydrates.trim();
  const protein = submission.values.protein.trim();
  const salt = submission.values.salt.trim();
  const shortDescription = submission.values.shortDescription.trim();
  const hasDisplayImage = Boolean(articleDraft?.displayImages.length);

  if (eanDigits.length !== 13) {
    issues.push({
      id: "v1",
      severity: "blocking",
      code: "VAL-101",
      title: "EAN maste innehalla 13 siffror",
      detail: "Skriv in ett EAN-nummer med exakt 13 siffror i fältet EAN-13.",
      field: "EAN-13",
      section: "Grunduppgifter",
    });
  }

  if (!submission.values.productName.trim()) {
    issues.push({
      id: "v2",
      severity: "blocking",
      code: "VAL-102",
      title: "Artikelnamn saknas",
      detail: "Fyll i ett tydligt artikelnamn i fältet Artikelnamn.",
      field: "productName",
      section: "Grunduppgifter",
    });
  }

  if (!submission.values.brand.trim()) {
    issues.push({
      id: "v3",
      severity: "blocking",
      code: "VAL-103",
      title: "Varumarke saknas",
      detail: "Fyll i varumärke i fältet Varumärke.",
      field: "brand",
      section: "Grunduppgifter",
    });
  }

  if (!submission.values.category.trim()) {
    issues.push({
      id: "v4",
      severity: "blocking",
      code: "VAL-104",
      title: "Produktkategori saknas",
      detail: "Välj eller skriv in en produktkategori i fältet Produktkategori.",
      field: "category",
      section: "Grunduppgifter",
    });
  }

  if (!energyKj || !fat || !carbohydrates || !protein || !salt) {
    issues.push({
      id: "v5",
      severity: "blocking",
      code: "VAL-204",
      title: "Naringsvarden ar inte kompletta",
      detail: "Fyll i Energi, Fett, Kolhydrater, Protein och Salt under Näringsvärden.",
      field: "section:nutrition",
      section: "Naringsvarden",
    });
  }

  if (!submission.values.supplierGln.trim()) {
    issues.push({
      id: "v6",
      severity: "blocking",
      code: "VAL-301",
      title: "GLN-nummer kravs",
      detail: "Fyll i leverantörens GLN i fältet GLN (leverantör).",
      field: "GLN (leverantor)",
      section: "Logistik",
    });
  }

  if (!submission.values.casesPerPackage.trim()) {
    issues.push({
      id: "v7",
      severity: "blocking",
      code: "VAL-302",
      title: "Kolli per forpackning saknas",
      detail: "Fyll i Kolli per förpackning under Förpackning och mått.",
      field: "Kolli per forpackning",
      section: "Forpackning och matt",
    });
  }

  if (!submission.values.caseWeight.trim()) {
    issues.push({
      id: "v8",
      severity: "blocking",
      code: "VAL-303",
      title: "Vikt per kolli saknas",
      detail: "Fyll i Vikt per kolli (kg) under Förpackning och mått.",
      field: "caseWeight",
      section: "Forpackning och matt",
    });
  }

  if (!shortDescription || shortDescription.length < 20) {
    issues.push({
      id: "v9",
      severity: "warning",
      code: "VAL-401",
      title: "Kortbeskrivningen ar kort",
      detail: "Beskrivningen blir tydligare om du skriver minst 20 tecken i Kortbeskrivning.",
      field: "shortDescription",
      section: "Grunduppgifter",
    });
  }

  if (submission.allergens.includes("Soja")) {
    issues.push({
      id: "v10",
      severity: "warning",
      code: "VAL-402",
      title: "Kontrollera allergenmarkeringen for soja",
      detail: "Säkerställ att soja är markerad rätt i allergenlistan och i produkttexten.",
      field: "Innehaller soja",
      section: "Allergener",
    });
  }

  if (!hasDisplayImage) {
    issues.push({
      id: "v11",
      severity: "info",
      code: "VAL-701",
      title: "Bilder saknas",
      detail: "Lägg gärna till en produktbild i Bilder och media för en bättre artikelpresentation.",
      field: "Produktbild",
      section: "Bilder och media",
    });
  }

  if (submission.values.countryOfOrigin.trim()) {
    issues.push({
      id: "v12",
      severity: "info",
      code: "VAL-702",
      title: "Ursprungsland ar ifyllt",
      detail: "Kontrollera att ursprungslandet är skrivet på det sätt ni vill visa det internt och externt.",
      field: "Ursprungsland",
      section: "Logistik",
    });
  }

  return issues;
}
