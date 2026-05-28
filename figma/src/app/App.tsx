import { useState } from "react";
import { SupplierUpload } from "./components/SupplierUpload";
import { SupplierForm } from "./components/SupplierForm";
import { AIProcessing } from "./components/AIProcessing";
import { AIDraftReview } from "./components/AIDraftReview";
import { ValidationIssues } from "./components/ValidationIssues";
import { InternalReview } from "./components/InternalReview";

{/* MARKER-MAKE-KIT-INVOKED */}

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
    sublabel: "Leverantörsflöde",
    screens: [
      { id: "supplier-upload" as Screen, label: "1A · Uppladdning" },
      { id: "supplier-form" as Screen, label: "1B · Artikelformulär" },
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
    sublabel: "Validering & granskning",
    screens: [
      { id: "validation" as Screen, label: "3A · Valideringsproblem" },
      { id: "internal-review" as Screen, label: "3B · Intern granskning" },
    ],
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("supplier-upload");

  const nav = (s: Screen) => setScreen(s);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Top nav bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 border-b border-border" style={{ height: "52px", background: "var(--ms-green)" }}>
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "var(--ms-amber)" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.04em" }}>M</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#fff", letterSpacing: "-0.01em" }}>Martin & Servera</span>
          </div>
          <div className="w-px h-5 opacity-30" style={{ background: "#fff" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Artikelportal — Leverantör</span>
        </div>

        {/* Pair navigation */}
        <div className="flex items-center gap-1">
          {PAIRS.map((pair) => {
            const active = pair.screens.some(s => s.id === screen);
            return (
              <div key={pair.id} className="flex items-center gap-0.5">
                {pair.screens.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => nav(s.id)}
                    className="px-3 py-1.5 rounded-md transition-all"
                    style={{
                      background: screen === s.id ? "rgba(255,255,255,0.18)" : "transparent",
                      color: screen === s.id ? "#fff" : "rgba(255,255,255,0.6)",
                      fontSize: "12px",
                      fontWeight: screen === s.id ? 600 : 400,
                      border: screen === s.id ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
                <div className="w-px h-4 mx-1 opacity-20" style={{ background: "#fff" }} />
              </div>
            );
          })}
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>EL</span>
          </div>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>Erik Lindqvist · Oatly AB</span>
        </div>
      </header>

      {/* Pair label strip */}
      <div className="flex-shrink-0 flex items-center gap-6 px-8 py-2 border-b border-border" style={{ background: "var(--card)" }}>
        {PAIRS.map((pair) => {
          const active = pair.screens.some(s => s.id === screen);
          return (
            <button
              key={pair.id}
              onClick={() => nav(pair.screens[0].id)}
              className="flex items-center gap-2 transition-all"
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: active ? "var(--ms-amber)" : "var(--border)" }}
              />
              <span style={{ fontSize: "12px", fontWeight: active ? 700 : 500, color: active ? "var(--ms-green)" : "var(--muted-foreground)" }}>
                {pair.label}: {pair.sublabel}
              </span>
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: "rgba(200,151,62,0.1)", border: "1px solid rgba(200,151,62,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ms-amber)" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--ms-amber)" }}>Proof of Concept — Martin & Servera</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {screen === "supplier-upload" && (
          <SupplierUpload onNext={() => nav("supplier-form")} />
        )}
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
        {screen === "internal-review" && (
          <InternalReview onBack={() => nav("validation")} />
        )}
      </main>
    </div>
  );
}
