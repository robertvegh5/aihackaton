import { useEffect, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import type { ArticleDraft, UploadedFile, UploadMode } from "../App";

export interface SupplierFormSubmission {
  values: FormValues;
  allergens: string[];
}

interface SupplierFormProps {
  articleDraft: ArticleDraft | null;
  uploadedFiles: UploadedFile[];
  uploadMode: UploadMode;
  focusTarget?: string | null;
  initialSubmission?: SupplierFormSubmission | null;
  onFocusTargetHandled?: () => void;
  onSubmit: (submission: SupplierFormSubmission) => void;
  onNext: () => void;
  onBack: () => void;
}

type SectionId = "basic" | "packaging" | "nutrition" | "allergens" | "logistics" | "media";

export type FormValues = {
  productName: string;
  ean: string;
  articleNumber: string;
  brand: string;
  category: string;
  shortDescription: string;
  netWeight: string;
  volume: string;
  packagingType: string;
  height: string;
  width: string;
  depth: string;
  casesPerPackage: string;
  caseWeight: string;
  energyKj: string;
  energyKcal: string;
  fat: string;
  saturatedFat: string;
  carbohydrates: string;
  sugars: string;
  fiber: string;
  protein: string;
  salt: string;
  calcium: string;
  shelfLife: string;
  storageTemperature: string;
  openedShelfLife: string;
  countryOfOrigin: string;
  supplierGln: string;
};

const SECTION_ORDER: Array<{ id: SectionId; label: string; required: boolean }> = [
  { id: "basic", label: "Grunduppgifter", required: true },
  { id: "packaging", label: "Forpackning och matt", required: true },
  { id: "nutrition", label: "Naringsvarden", required: true },
  { id: "allergens", label: "Allergener", required: true },
  { id: "logistics", label: "Logistik", required: false },
  { id: "media", label: "Bilder och media", required: false },
];

const ALLERGENS = [
  "Gluten",
  "Kräftdjur",
  "Ägg",
  "Fisk",
  "Jordnötter",
  "Soja",
  "Mjölk",
  "Nötter",
  "Selleri",
  "Senap",
  "Sesamfrön",
  "Svaveldioxid",
  "Lupin",
  "Blötdjur",
];

export function SupplierForm({ articleDraft, uploadedFiles, uploadMode, focusTarget = null, initialSubmission = null, onFocusTargetHandled, onSubmit, onNext, onBack }: SupplierFormProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("basic");
  const [formValues, setFormValues] = useState<FormValues>(() => (initialSubmission ?? buildInitialSubmission(articleDraft, uploadedFiles)).values);
  const [allergens, setAllergens] = useState<string[]>(() => (initialSubmission ?? buildInitialSubmission(articleDraft, uploadedFiles)).allergens);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const nextSubmission = initialSubmission ?? buildInitialSubmission(articleDraft, uploadedFiles);
    setFormValues(nextSubmission.values);
    setAllergens(nextSubmission.allergens);
  }, [articleDraft, uploadedFiles, initialSubmission]);

  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    if (focusTarget.startsWith("section:")) {
      setActiveSection(focusTarget.replace("section:", "") as SectionId);
      onFocusTargetHandled?.();
      return;
    }

    const targetSection = getSectionForField(focusTarget);
    if (targetSection) {
      setActiveSection(targetSection);
    }

    window.setTimeout(() => {
      const element = fieldRefs.current[focusTarget];
      if (!element) {
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus();
      element.select();
      onFocusTargetHandled?.();
    }, 0);
  }, [focusTarget, onFocusTargetHandled]);

  const missingCount = countMissing(formValues, articleDraft);

  const completedSections = new Set<SectionId>([
    "basic",
    ...(allergens.length > 0 ? (["allergens"] as SectionId[]) : []),
  ]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-6">
        <div className="mx-auto w-full max-w-[1360px]">
          <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>
              STEG 2
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 max-[960px]:flex-col max-[960px]:items-stretch">
            <div>
              <h1 style={{ color: "var(--ms-green)" }}>Granska och komplettera</h1>
              <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
                AI:n har forifyllt falten nedan. Kontrollera, korrigera och fyll i det som saknas.
              </p>
            </div>

            <div
              className="flex w-fit flex-shrink-0 items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: "rgba(200,151,62,0.12)", border: "1px solid rgba(200,151,62,0.25)" }}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: "var(--ms-amber)" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ms-amber)" }}>{missingCount} falt saknas</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {SECTION_ORDER.map((section) => {
              const isActive = activeSection === section.id;
              const isComplete = completedSections.has(section.id);

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-all"
                  style={{
                    background: isActive ? "var(--ms-green)" : isComplete ? "rgba(45,106,79,0.08)" : "var(--card)",
                    color: isActive ? "#fff" : isComplete ? "var(--ms-status-ok)" : "var(--foreground)",
                    border: `1px solid ${isActive ? "transparent" : isComplete ? "rgba(45,106,79,0.18)" : "var(--border)"}`,
                    boxShadow: isActive ? "0 10px 20px rgba(27,58,45,0.12)" : "none",
                  }}
                >
                  {isComplete && !isActive ? <CheckCircle2 size={12} /> : null}
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>{section.label}</span>
                  {section.required && !isComplete && !isActive ? <span style={{ color: "var(--destructive)", fontSize: "10px" }}>*</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-5">
          <section className="rounded-2xl bg-card px-6 py-5 shadow-sm" style={{ border: "1px solid var(--border)" }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(45,106,79,0.08)", color: "var(--ms-status-ok)" }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>Underlag från steg 1</p>
                <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Leverantörens källmaterial som följer med in i artikelutkastet.</p>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              {uploadMode === "manual"
                ? "Manuellt inmatningslage valdes i steg 1. Inga filer ar kopplade till artikeln."
                : `${uploadedFiles.length} uppladdade filer foljer med in i artikelutkastet.`}
            </p>

            {uploadMode === "upload" && uploadedFiles.length > 0 ? (
              <div className="mt-4 flex flex-col gap-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--input-background)", border: "1px solid var(--border)" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>{file.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                        {formatFileSize(file.size)} · {file.type.toUpperCase() || "FILE"}
                      </p>
                    </div>
                    <CheckCircle2 size={16} style={{ color: "var(--ms-status-ok)" }} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl bg-card px-6 py-6 shadow-sm" style={{ border: "1px solid var(--border)" }}>
            <div className="mb-5 flex items-center justify-between gap-4 max-[960px]:flex-col max-[960px]:items-start">
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--ms-green)" }}>STEG 2</p>
                <h1 style={{ color: "var(--ms-green)", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "6px" }}>Verifiera och komplettera</h1>
                <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "4px" }}>{getSectionDescription(activeSection)}</p>
              </div>
            </div>

            {renderSectionContent(activeSection, formValues, allergens, setAllergens, articleDraft, handleValueChange, fieldRefs)}
          </section>
        </div>
      </div>

      <div className="border-t border-border px-8 py-5" style={{ background: "var(--card)" }}>
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:bg-muted" style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
            <ArrowLeft size={16} /> Tillbaka
          </button>

          <button
            type="button"
            onClick={() => {
              onSubmit({ values: formValues, allergens });
              onNext();
            }}
            className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all hover:opacity-90"
            style={{ background: "var(--ms-green)", color: "#fff", fontWeight: 600, fontSize: "14px", boxShadow: "0 12px 24px rgba(27,58,45,0.18)" }}
          >
            Kor validering <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  function handleValueChange(field: keyof FormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }
}

export function buildInitialSubmission(articleDraft: ArticleDraft | null, uploadedFiles: UploadedFile[]): SupplierFormSubmission {
  return {
    values: buildFormValues(articleDraft, uploadedFiles),
    allergens: articleDraft?.allergens.declared ?? ["Mjölk", "Soja"],
  };
}

function buildFormValues(articleDraft: ArticleDraft | null, uploadedFiles: UploadedFile[]): FormValues {
  const metadata = articleDraft?.extractedMetadata;

  return {
    productName: articleDraft?.product.productName || "",
    ean: metadata?.ean || "",
    articleNumber: metadata?.articleNumber || "",
    brand: articleDraft?.product.brand || "",
    category: metadata?.category || "",
    shortDescription: articleDraft?.generatedCopy.shortDescription || "",
    netWeight: metadata?.netWeight || articleDraft?.product.packageSize.replace(/[^0-9]/g, "") || "",
    volume: articleDraft?.product.packageSize.includes("ml") ? articleDraft.product.packageSize.replace(/[^0-9]/g, "") : "",
    packagingType: metadata?.packaging || (uploadedFiles.some((file) => file.type === "pdf") ? "Konsumentforpackning" : ""),
    height: "",
    width: "",
    depth: "",
    casesPerPackage: "",
    caseWeight: "",
    energyKj: articleDraft?.nutrition.energyKj == null ? "" : String(articleDraft.nutrition.energyKj),
    energyKcal: articleDraft?.nutrition.energyKj == null ? "" : String(Math.round(articleDraft.nutrition.energyKj / 4.184)),
    fat: articleDraft?.nutrition.fat == null ? "" : String(articleDraft.nutrition.fat),
    saturatedFat: "",
    carbohydrates: articleDraft?.nutrition.carbohydrates == null ? "" : String(articleDraft.nutrition.carbohydrates),
    sugars: "",
    fiber: "",
    protein: articleDraft?.nutrition.protein == null ? "" : String(articleDraft.nutrition.protein),
    salt: articleDraft?.nutrition.salt == null ? "" : String(articleDraft.nutrition.salt),
    calcium: "",
    shelfLife: "365",
    storageTemperature: metadata?.storage || "Rumstemperatur",
    openedShelfLife: "5",
    countryOfOrigin: metadata?.countryOfOrigin || "",
    supplierGln: "",
  };
}

function countMissing(formValues: FormValues, articleDraft: ArticleDraft | null) {
  const requiredFields: Array<keyof FormValues> = ["casesPerPackage", "caseWeight", "calcium"];
  const emptyCount = requiredFields.filter((field) => !formValues[field]).length;
  return articleDraft?.missingFields.length ? Math.max(articleDraft.missingFields.length, emptyCount) : emptyCount;
}

function getSectionTitle(section: SectionId) {
  switch (section) {
    case "basic":
      return "Grunduppgifter";
    case "packaging":
      return "Forpackning och matt";
    case "nutrition":
      return "Naringsvarden per 100 ml";
    case "allergens":
      return "Allergener";
    case "logistics":
      return "Logistik";
    case "media":
      return "Bilder och media";
  }
}

function getSectionDescription(section: SectionId) {
  switch (section) {
    case "basic":
      return "Kontrollera artikelns identitet, varumarke och kortbeskrivning.";
    case "packaging":
      return "Komplettera dimensioner, kolliuppgifter och forpackningsdata.";
    case "nutrition":
      return "Verifiera AI-extraherade naringsvarden och fyll i det som saknas.";
    case "allergens":
      return "Markera alla allergener och spar som forekommer i produkten.";
    case "logistics":
      return "Fyll i logistikfalten som behovs for vidare behandling internt.";
    case "media":
      return "Se om displaybilder finns eller om media maste kompletteras senare.";
  }
}

function renderSectionContent(
  section: SectionId,
  formValues: FormValues,
  allergens: string[],
  setAllergens: Dispatch<SetStateAction<string[]>>,
  articleDraft: ArticleDraft | null,
  onChange: (field: keyof FormValues, value: string) => void,
  fieldRefs: MutableRefObject<Record<string, HTMLInputElement | null>>,
) {
  if (section === "basic") {
    return (
      <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
        <Field label="Artikelnamn" fieldId="productName" inputRef={(element) => assignFieldRef(fieldRefs, "productName", element)} value={formValues.productName} aiExtracted onChange={(value) => onChange("productName", value)} />
        <Field label="EAN-13" fieldId="ean" inputRef={(element) => assignFieldRef(fieldRefs, "ean", element)} value={formValues.ean} aiExtracted onChange={(value) => onChange("ean", value)} />
        <Field label="Artikelnummer (leverantor)" fieldId="articleNumber" inputRef={(element) => assignFieldRef(fieldRefs, "articleNumber", element)} value={formValues.articleNumber} aiExtracted onChange={(value) => onChange("articleNumber", value)} />
        <Field label="Varumarke" fieldId="brand" inputRef={(element) => assignFieldRef(fieldRefs, "brand", element)} value={formValues.brand} aiExtracted onChange={(value) => onChange("brand", value)} />
        <Field label="Produktkategori" fieldId="category" inputRef={(element) => assignFieldRef(fieldRefs, "category", element)} value={formValues.category} aiExtracted onChange={(value) => onChange("category", value)} />
        <Field label="Kortbeskrivning" fieldId="shortDescription" inputRef={(element) => assignFieldRef(fieldRefs, "shortDescription", element)} value={formValues.shortDescription} aiExtracted full onChange={(value) => onChange("shortDescription", value)} />
      </div>
    );
  }

  if (section === "packaging") {
    return (
      <div className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-2 max-[980px]:grid-cols-1">
        <Field label="Nettovikt (g)" fieldId="netWeight" inputRef={(element) => assignFieldRef(fieldRefs, "netWeight", element)} value={formValues.netWeight} aiExtracted={Boolean(formValues.netWeight)} onChange={(value) => onChange("netWeight", value)} />
        <Field label="Volym (ml)" fieldId="volume" inputRef={(element) => assignFieldRef(fieldRefs, "volume", element)} value={formValues.volume} aiExtracted={Boolean(formValues.volume)} onChange={(value) => onChange("volume", value)} />
        <Field label="Forpackningstyp" fieldId="packagingType" inputRef={(element) => assignFieldRef(fieldRefs, "packagingType", element)} value={formValues.packagingType} aiExtracted={Boolean(formValues.packagingType)} onChange={(value) => onChange("packagingType", value)} />
        <Field label="Hojd (mm)" fieldId="height" inputRef={(element) => assignFieldRef(fieldRefs, "height", element)} value={formValues.height} onChange={(value) => onChange("height", value)} />
        <Field label="Bredd (mm)" fieldId="width" inputRef={(element) => assignFieldRef(fieldRefs, "width", element)} value={formValues.width} onChange={(value) => onChange("width", value)} />
        <Field label="Djup (mm)" fieldId="depth" inputRef={(element) => assignFieldRef(fieldRefs, "depth", element)} value={formValues.depth} onChange={(value) => onChange("depth", value)} />
        <Field label="Kolli per forpackning" fieldId="casesPerPackage" inputRef={(element) => assignFieldRef(fieldRefs, "casesPerPackage", element)} value={formValues.casesPerPackage} missing={!formValues.casesPerPackage} onChange={(value) => onChange("casesPerPackage", value)} />
        <Field label="Vikt per kolli (kg)" fieldId="caseWeight" inputRef={(element) => assignFieldRef(fieldRefs, "caseWeight", element)} value={formValues.caseWeight} missing={!formValues.caseWeight} onChange={(value) => onChange("caseWeight", value)} />
      </div>
    );
  }

  if (section === "nutrition") {
    const nutritionFields: Array<{ label: string; key: keyof FormValues }> = [
      { label: "Energi (kJ)", key: "energyKj" },
      { label: "Energi (kcal)", key: "energyKcal" },
      { label: "Fett (g)", key: "fat" },
      { label: "varav mattat fett (g)", key: "saturatedFat" },
      { label: "Kolhydrater (g)", key: "carbohydrates" },
      { label: "varav sockerarter (g)", key: "sugars" },
      { label: "Kostfiber (g)", key: "fiber" },
      { label: "Protein (g)", key: "protein" },
      { label: "Salt (g)", key: "salt" },
      { label: "Kalcium (mg)", key: "calcium" },
    ];

    return (
      <div className="grid grid-cols-4 gap-4 max-[1320px]:grid-cols-3 max-[1180px]:grid-cols-2 max-[980px]:grid-cols-1">
        {nutritionFields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            fieldId={field.key}
            inputRef={(element) => assignFieldRef(fieldRefs, field.key, element)}
            value={formValues[field.key]}
            aiExtracted={Boolean(formValues[field.key])}
            missing={!formValues[field.key]}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    );
  }

  if (section === "allergens") {
    return (
      <div>
        <p className="mb-3" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          Valj alla amnen som forekommer i produkten, inklusive spar.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((allergen) => (
            <button
              key={allergen}
              type="button"
              onClick={() =>
                setAllergens((current) =>
                  current.includes(allergen) ? current.filter((item) => item !== allergen) : [...current, allergen],
                )
              }
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
    );
  }

  if (section === "logistics") {
    return (
      <div className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-2 max-[980px]:grid-cols-1">
        <Field label="Hallbarhet (dagar)" fieldId="shelfLife" inputRef={(element) => assignFieldRef(fieldRefs, "shelfLife", element)} value={formValues.shelfLife} aiExtracted onChange={(value) => onChange("shelfLife", value)} />
        <Field label="Lagringstemperatur" fieldId="storageTemperature" inputRef={(element) => assignFieldRef(fieldRefs, "storageTemperature", element)} value={formValues.storageTemperature} aiExtracted onChange={(value) => onChange("storageTemperature", value)} />
        <Field label="Oppnad hallbarhet (dagar)" fieldId="openedShelfLife" inputRef={(element) => assignFieldRef(fieldRefs, "openedShelfLife", element)} value={formValues.openedShelfLife} aiExtracted onChange={(value) => onChange("openedShelfLife", value)} />
        <Field label="Ursprungsland" fieldId="countryOfOrigin" inputRef={(element) => assignFieldRef(fieldRefs, "countryOfOrigin", element)} value={formValues.countryOfOrigin} aiExtracted onChange={(value) => onChange("countryOfOrigin", value)} />
        <Field label="GLN (leverantor)" fieldId="supplierGln" inputRef={(element) => assignFieldRef(fieldRefs, "supplierGln", element)} value={formValues.supplierGln} missing={!formValues.supplierGln} onChange={(value) => onChange("supplierGln", value)} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="rounded-xl p-4" style={{ background: "var(--input-background)", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>Displaybilder</p>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "6px", lineHeight: 1.6 }}>
          {articleDraft?.displayImages.length
            ? `${articleDraft.displayImages.length} bild(er) ar kopplade till utkastet.`
            : "Inga displaybilder hittades i underlaget. Leverantoren kan komplettera senare i flodet."}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  fieldId,
  value,
  onChange,
  aiExtracted,
  missing,
  full,
  inputRef,
}: {
  label: string;
  fieldId?: string;
  value: string;
  onChange: (value: string) => void;
  aiExtracted?: boolean;
  missing?: boolean;
  full?: boolean;
  inputRef?: (element: HTMLInputElement | null) => void;
}) {
  return (
    <div className={full ? "col-span-full" : ""}>
      <div
        className="rounded-xl p-4"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,247,244,1) 100%)",
          border: `1px solid ${missing ? "rgba(192,57,43,0.28)" : "rgba(26,26,24,0.11)"}`,
        }}
      >
        <div className="mb-2 flex items-center gap-1.5">
          <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--muted-foreground)" }}>{label}</label>
          {aiExtracted ? (
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
          ) : null}
          {missing ? (
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
          ) : null}
        </div>

        <input
          id={fieldId}
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={missing ? "Fyll i..." : ""}
          className="block w-full rounded-lg px-3 py-3 outline-none transition-all focus:ring-2"
          style={{
            minHeight: "48px",
            background: missing ? "rgba(192,57,43,0.04)" : "var(--input-background)",
            border: `1px solid ${missing ? "rgba(192,57,43,0.3)" : "var(--border)"}`,
            fontSize: "14px",
            color: "var(--foreground)",
          }}
        />
      </div>
    </div>
  );
}

function assignFieldRef(
  refs: MutableRefObject<Record<string, HTMLInputElement | null>>,
  key: string,
  element: HTMLInputElement | null,
) {
  refs.current[key] = element;
}

function getSectionForField(field: string): SectionId | null {
  const sectionMap: Record<string, SectionId> = {
    productName: "basic",
    ean: "basic",
    articleNumber: "basic",
    brand: "basic",
    category: "basic",
    shortDescription: "basic",
    netWeight: "packaging",
    volume: "packaging",
    packagingType: "packaging",
    height: "packaging",
    width: "packaging",
    depth: "packaging",
    casesPerPackage: "packaging",
    caseWeight: "packaging",
    energyKj: "nutrition",
    energyKcal: "nutrition",
    fat: "nutrition",
    saturatedFat: "nutrition",
    carbohydrates: "nutrition",
    sugars: "nutrition",
    fiber: "nutrition",
    protein: "nutrition",
    salt: "nutrition",
    calcium: "nutrition",
    countryOfOrigin: "logistics",
    supplierGln: "logistics",
  };

  return sectionMap[field] ?? null;
}

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes >= 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (sizeInBytes >= 1024) {
    return `${Math.round(sizeInBytes / 1024)} KB`;
  }

  return `${sizeInBytes} B`;
}
