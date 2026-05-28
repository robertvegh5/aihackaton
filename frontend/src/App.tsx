import { useState } from "react";
import { SupplierUpload } from "./components/SupplierUpload";
import { SupplierForm } from "./components/SupplierForm";
import { AIProcessing } from "./components/AIProcessing";
import { AIDraftReview } from "./components/AIDraftReview";
import { ValidationIssues } from "./components/ValidationIssues";
import { InternalReview } from "./components/InternalReview";

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

  const nav = (nextScreen: Screen) => setScreen(nextScreen);

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
              {pair.screens.map((pairScreen) => (
                <button
                  key={pairScreen.id}
                  onClick={() => nav(pairScreen.id)}
                  className="rounded-md px-3 py-1.5 transition-all"
                  style={{
                    background: screen === pairScreen.id ? "rgba(255,255,255,0.18)" : "transparent",
                    color: screen === pairScreen.id ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: "12px",
                    fontWeight: screen === pairScreen.id ? 600 : 400,
                    border:
                      screen === pairScreen.id
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "1px solid transparent",
                  }}
                >
                  {pairScreen.label}
                </button>
              ))}
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
          return (
            <button
              key={pair.id}
              onClick={() => nav(pair.screens[0].id)}
              className="flex items-center gap-2 transition-all"
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
        {screen === "supplier-upload" && <SupplierUpload onNext={() => nav("supplier-form")} />}
        {screen === "supplier-form" && (
          <SupplierForm onNext={() => nav("ai-processing")} onBack={() => nav("supplier-upload")} />
        )}
        {screen === "ai-processing" && (
          <AIProcessing onNext={() => nav("ai-draft")} onBack={() => nav("supplier-form")} />
        )}
        {screen === "ai-draft" && (
          <AIDraftReview onNext={() => nav("validation")} onBack={() => nav("ai-processing")} />
        )}
        {screen === "validation" && (
          <ValidationIssues onNext={() => nav("internal-review")} onBack={() => nav("ai-draft")} />
        )}
        {screen === "internal-review" && <InternalReview onBack={() => nav("validation")} />}
      </main>
    </div>
  );
}
