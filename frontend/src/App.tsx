import { useCallback, useState } from "react";
import { ArrowRight, ClipboardList, ShieldCheck } from "lucide-react";
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
  | "supplier-complete"
  | "internal-review";

type PortalMode = "landing" | "supplier" | "internal";

const HEADER_NAV_ITEMS: Array<{ id: Screen; label: string }> = [
  { id: "supplier-upload", label: "Uppladdning" },
  { id: "supplier-form", label: "Artikelformulär" },
  { id: "validation", label: "Validering" },
  { id: "supplier-complete", label: "Klart" },
  { id: "internal-review", label: "Intern granskning" },
];

const PORTAL_CARDS = [
  {
    id: "supplier",
    badge: "Externt flöde",
    title: "Leverantör",
    subtitle: "Erik Lindqvist · Oatly AB",
    description: "Ladda upp artikelunderlag, granska AI-utkast och åtgärda valideringsproblem.",
    steps: [
      "Ladda upp dokument",
      "Granska AI-extraktion",
      "Åtgärda valideringsproblem",
      "Skicka för intern granskning",
    ],
    action: "Öppna",
    accent: "var(--ms-green)",
    badgeColor: "var(--ms-green)",
    badgeBackground: "rgba(27,58,45,0.08)",
    badgeBorder: "rgba(27,58,45,0.16)",
    icon: ClipboardList,
  },
  {
    id: "internal",
    badge: "Internt flöde",
    title: "Intern granskare",
    subtitle: "Anna Karlsson · Kategoriansvarig M&S",
    description: "Granska inkomna artikelutkast, kontrollera kvaliteten och fatta beslut om godkännande, avvisning eller komplettering.",
    steps: [
      "Öppna inkomna artikelutkast",
      "Kontrollera kvalitet och nyckeldata",
      "Godkänn, avvisa eller begär komplettering",
    ],
    action: "Öppna",
    accent: "var(--ms-amber)",
    badgeColor: "var(--ms-amber)",
    badgeBackground: "rgba(200,151,62,0.08)",
    badgeBorder: "rgba(200,151,62,0.18)",
    icon: ShieldCheck,
  },
] as const;

const INTERNAL_PORTAL_SUBMISSION: SupplierFormSubmission = {
  values: {
    productName: "Oatly Havredryck Ekologisk 1 L",
    ean: "7394376615800",
    articleNumber: "ART-45821",
    brand: "Oatly",
    category: "Vaxtbaserade drycker",
    shortDescription: "Ekologisk havredryck for kaffe, matlagning och servering i storhushall.",
    netWeight: "1000 g",
    volume: "1 l",
    packagingType: "Tetra Pak",
    height: "238",
    width: "70",
    depth: "70",
    casesPerPackage: "12",
    caseWeight: "12.8",
    energyKj: "251",
    energyKcal: "60",
    fat: "3.0",
    saturatedFat: "0.3",
    carbohydrates: "6.7",
    sugars: "4.0",
    fiber: "0.8",
    protein: "1.0",
    salt: "0.1",
    calcium: "120",
    shelfLife: "270",
    storageTemperature: "Rumstemperatur",
    openedShelfLife: "5",
    countryOfOrigin: "Sverige",
    supplierGln: "7300000001234",
  },
  allergens: ["Gluten"],
};

export function App() {
  const [portalMode, setPortalMode] = useState<PortalMode>("landing");
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

  const step3Issues = formSubmission ? buildStep3Issues(formSubmission, articleDraft) : [];
  const blockingIssues = step3Issues.filter((issue) => issue.severity === "blocking");
  const warningIssues = step3Issues.filter((issue) => issue.severity === "warning");

  const screenEnabled: Record<Screen, boolean> = {
    "supplier-upload": portalMode === "supplier",
    "supplier-form": portalMode === "supplier" && step2Available,
    "ai-processing": portalMode === "supplier" && uploadMode === "upload" && uploadedFiles.length > 0,
    "ai-draft": false,
    validation: portalMode === "supplier" && step3Available,
    "supplier-complete": portalMode === "supplier" && step3Available && blockingIssues.length === 0,
    "internal-review": portalMode === "internal",
  };

  const nav = (nextScreen: Screen) => {
    if (!screenEnabled[nextScreen]) {
      return;
    }

    setScreen(nextScreen);
  };

  const resetWorkflow = () => {
    setScreen("supplier-upload");
    setUploadMode("upload");
    setUploadedFiles([]);
    setUploadError(null);
    setIsExtracting(false);
    setArticleDraft(null);
    setFormSubmission(null);
    setFormFocusTarget(null);
    setStep2Available(false);
    setStep3Available(false);
  };

  const openSupplierPortal = () => {
    resetWorkflow();
    setPortalMode("supplier");
  };

  const openInternalPortal = () => {
    resetWorkflow();
    setFormSubmission(INTERNAL_PORTAL_SUBMISSION);
    setStep3Available(true);
    setScreen("internal-review");
    setPortalMode("internal");
  };

  const returnToLanding = () => {
    resetWorkflow();
    setPortalMode("landing");
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

  const handleProcessUpload = useCallback(async () => {
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
  }, [uploadMode, uploadedFiles]);

  const handleProcessingComplete = useCallback(() => {
    setScreen("supplier-form");
  }, []);

  const handleValidationStart = () => {
    setStep3Available(true);
    setScreen("validation");
  };

  const handleFormSubmit = (submission: SupplierFormSubmission) => {
    setFormSubmission(submission);
    setStep3Available(true);
  };

  const handleSupplierComplete = () => {
    setScreen("supplier-complete");
  };

  if (portalMode === "landing") {
    return <PortalLandingPage onOpenSupplier={openSupplierPortal} onOpenInternal={openInternalPortal} />;
  }

  const userInitials = portalMode === "internal" ? "AK" : "EL";
  const userLabel = portalMode === "internal" ? "Anna Karlsson · Kategoriansvarig M&S" : "Erik Lindqvist · Oatly AB";
  const portalLabel = portalMode === "internal" ? "Artikelportal - Intern" : "Artikelportal - Leverantör";
  const headerNavItems =
    portalMode === "internal"
      ? []
      : HEADER_NAV_ITEMS.filter((item) => item.id !== "internal-review");

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
            {portalLabel}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {headerNavItems.map((item) => {
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={returnToLanding}
            className="rounded-md px-3 py-1.5 transition-all hover:bg-white/10"
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.86)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Till startsidan
          </button>
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>{userInitials}</span>
          </div>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{userLabel}</span>
        </div>
      </header>

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
            onComplete={handleProcessingComplete}
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
            onNext={handleSupplierComplete}
            onBack={() => nav("supplier-form")}
          />
        )}
        {screen === "supplier-complete" && <SupplierCompletionPage onReturnToLanding={returnToLanding} />}
        {screen === "internal-review" && (
          <InternalReview
            submission={formSubmission}
            blockingCount={blockingIssues.length}
            warningCount={warningIssues.length}
            onBack={portalMode === "internal" ? returnToLanding : () => nav("validation")}
            backLabel={portalMode === "internal" ? "Till startsidan" : undefined}
          />
        )}
      </main>
    </div>
  );
}

function SupplierCompletionPage({ onReturnToLanding }: { onReturnToLanding: () => void }) {
  return (
    <div className="flex h-full items-center justify-center px-6 py-10">
      <div
        className="w-full max-w-[640px] rounded-[28px] bg-card p-10 text-center"
        style={{ border: "1px solid rgba(26,26,24,0.08)", boxShadow: "0 24px 70px rgba(27,58,45,0.08)" }}
      >
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "rgba(45,106,79,0.12)", color: "var(--ms-status-ok)", fontSize: "28px", fontWeight: 700 }}
        >
          ✓
        </div>
        <p
          className="mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--ms-amber)" }}
        >
          LEVERANTÖRSFLÖDE SLUTFÖRT
        </p>
        <h1 style={{ margin: 0, color: "var(--ms-green)", fontSize: "34px", lineHeight: 1.1, letterSpacing: "-0.04em" }}>
          Tack, artikeln är inskickad
        </h1>
        <p className="mt-4" style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--muted-foreground)" }}>
          Din artikel är nu klar i leverantörsflödet och inväntar intern granskning hos Martin &amp; Servera.
        </p>
        <p className="mt-3" style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--muted-foreground)" }}>
          Du behöver inte göra något mer just nu. Vi återkommer om kompletteringar behövs.
        </p>
        <button
          type="button"
          onClick={onReturnToLanding}
          className="mt-8 inline-flex items-center justify-center rounded-2xl px-5 py-3 transition-all hover:opacity-95"
          style={{ background: "var(--ms-green)", color: "#fff", fontSize: "15px", fontWeight: 700, boxShadow: "0 14px 26px rgba(27,58,45,0.18)" }}
        >
          Till startsidan
        </button>
      </div>
    </div>
  );
}

function PortalLandingPage({ onOpenSupplier, onOpenInternal }: { onOpenSupplier: () => void; onOpenInternal: () => void }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-10"
      style={{
        background:
          "radial-gradient(circle at top, rgba(200,151,62,0.08), transparent 28%), linear-gradient(180deg, #f7f5f0 0%, var(--background) 58%, #efede7 100%)",
      }}
    >
      <div className="w-full max-w-[1060px]">
        <div className="mb-14 flex flex-col items-center text-center">
          <div className="mb-5 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--ms-green)", boxShadow: "0 18px 30px rgba(27,58,45,0.16)" }}
            >
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.05em" }}>M</span>
            </div>
            <div className="text-left">
              <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--ms-green)", letterSpacing: "-0.03em" }}>
                Martin &amp; Servera
              </p>
              <p style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Artikelportal · POC</p>
            </div>
          </div>

          <div className="max-w-[620px]">
            <h1 style={{ color: "var(--ms-green)", fontSize: "42px", lineHeight: 1.05, letterSpacing: "-0.05em", margin: 0 }}>
              Välj ingång till artikelportalen
            </h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PORTAL_CARDS.map((card) => {
            const Icon = card.icon;
            const action = card.id === "supplier" ? onOpenSupplier : onOpenInternal;

            return (
              <section
                key={card.id}
                className="relative flex h-full flex-col overflow-hidden rounded-[30px] bg-card p-8"
                style={{
                  border: "1px solid rgba(26,26,24,0.08)",
                  boxShadow: "0 24px 70px rgba(27,58,45,0.08)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-8 top-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`, opacity: 0.28 }}
                />

                <div className="mb-8 flex items-start justify-between gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(27,58,45,0.06))" }}
                  >
                    <Icon size={28} style={{ color: card.accent }} />
                  </div>
                  <span
                    className="rounded-full px-4 py-2"
                    style={{
                      background: card.badgeBackground,
                      color: card.badgeColor,
                      border: `1px solid ${card.badgeBorder}`,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <div className="mb-8">
                  <h2 style={{ fontSize: "24px", lineHeight: 1.1, letterSpacing: "-0.04em", color: "var(--foreground)", margin: 0 }}>
                    {card.title}
                  </h2>
                  <p className="mt-2" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
                    {card.subtitle}
                  </p>
                  <p className="mt-6" style={{ fontSize: "16px", lineHeight: 1.65, color: "var(--muted-foreground)" }}>
                    {card.description}
                  </p>
                </div>

                <div className="mb-8 flex flex-col gap-3">
                  {card.steps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 600 }}
                      >
                        {index + 1}
                      </div>
                      <span style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--foreground)" }}>{step}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={action}
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 transition-all hover:opacity-95"
                  style={{
                    background: "var(--ms-green)",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 700,
                    boxShadow: "0 14px 26px rgba(27,58,45,0.18)",
                  }}
                >
                  {card.action}
                  <ArrowRight size={16} />
                </button>
              </section>
            );
          })}
        </div>

        <p className="mt-10 text-center" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          Proof of Concept - Martin &amp; Servera Artikelportal 2024
        </p>
      </div>
    </div>
  );
}

const ISSUE_FIELD_TO_FORM_TARGET: Record<string, string> = {
  "EAN-13": "ean",
  "GLN (leverantör)": "supplierGln",
  "Innehåller soja": "section:allergens",
  Produktkategori: "category",
  "Kolli per förpackning": "casesPerPackage",
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
      title: "EAN måste innehålla 13 siffror",
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
      title: "Varumärke saknas",
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
      title: "Näringsvärden är inte kompletta",
      detail: "Fyll i Energi, Fett, Kolhydrater, Protein och Salt under Näringsvärden.",
      field: "section:nutrition",
      section: "Näringsvärden",
    });
  }

  if (!submission.values.supplierGln.trim()) {
    issues.push({
      id: "v6",
      severity: "blocking",
      code: "VAL-301",
      title: "GLN-nummer krävs",
      detail: "Fyll i leverantörens GLN i fältet GLN (leverantör).",
      field: "GLN (leverantör)",
      section: "Logistik",
    });
  }

  if (!submission.values.casesPerPackage.trim()) {
    issues.push({
      id: "v7",
      severity: "blocking",
      code: "VAL-302",
      title: "Kolli per förpackning saknas",
      detail: "Fyll i Kolli per förpackning under Förpackning och mått.",
      field: "Kolli per förpackning",
      section: "Förpackning och mått",
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
      section: "Förpackning och mått",
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
      field: "Innehåller soja",
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
