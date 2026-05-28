import { useState } from "react";
import { Upload, FileText, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowRight, Info } from "lucide-react";

interface SupplierUploadProps {
  onNext: () => void;
}

export function SupplierUpload({ onNext }: SupplierUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [mode, setMode] = useState<"upload" | "manual">("upload");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles([
      { name: "Produktblad_Oatly_Havredryck_2024.pdf", size: "2.4 MB", type: "pdf" },
      { name: "Artikeldata_Martin_Servera_Q4.xlsx", size: "148 KB", type: "xlsx" },
    ]);
  };

  const addSampleFile = () => {
    setFiles([
      { name: "Produktblad_Oatly_Havredryck_2024.pdf", size: "2.4 MB", type: "pdf" },
      { name: "Artikeldata_Martin_Servera_Q4.xlsx", size: "148 KB", type: "xlsx" },
    ]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--ms-amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>STEG 1 AV 4</span>
        </div>
        <h1 style={{ color: "var(--ms-green)" }}>Ladda upp artikelunderlag</h1>
        <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
          Ladda upp produktblad, specifikationer eller befintlig artikeldata. Vår AI extraherar och strukturerar informationen åt dig.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ background: "var(--muted)" }}>
          {(["upload", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-4 py-1.5 rounded-md transition-all"
              style={{
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "var(--ms-green)" : "var(--muted-foreground)",
                fontSize: "13px",
                fontWeight: mode === m ? 600 : 400,
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m === "upload" ? "Ladda upp dokument" : "Fyll i manuellt"}
            </button>
          ))}
        </div>

        {mode === "upload" ? (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={addSampleFile}
              className="relative rounded-xl cursor-pointer transition-all mb-4"
              style={{
                border: `2px dashed ${dragOver ? "var(--ms-green)" : "var(--border)"}`,
                background: dragOver ? "rgba(27,58,45,0.04)" : "var(--card)",
                padding: "48px 32px",
                textAlign: "center",
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--muted)" }}>
                  <Upload size={22} style={{ color: "var(--ms-green)" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "15px" }}>Dra och släpp filer här</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>eller klicka för att bläddra</p>
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>
                  PDF · XLSX · CSV · DOCX — max 25 MB per fil
                </p>
              </div>
            </div>

            {/* Uploaded files */}
            {files.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: f.type === "pdf" ? "rgba(192,57,43,0.1)" : "rgba(27,58,45,0.1)" }}>
                      {f.type === "pdf" ? <FileText size={16} style={{ color: "#C0392B" }} /> : <FileSpreadsheet size={16} style={{ color: "var(--ms-green)" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }} className="truncate">{f.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{f.size}</p>
                    </div>
                    <CheckCircle2 size={16} style={{ color: "var(--ms-status-ok)" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Info box */}
            <div className="flex gap-3 p-4 rounded-lg" style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.12)" }}>
              <Info size={16} style={{ color: "var(--ms-green)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "var(--ms-green-mid)" }}>
                AI:n extraherar automatiskt artikelnamn, EAN, vikt, ingredienser, näringsvärden och allergener från dina uppladdade dokument.
              </p>
            </div>
          </>
        ) : (
          <div className="p-6 rounded-xl text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>Manuellt inmatningsläge — inga filer krävs</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>Du fyller i all artikeldata direkt i formuläret i nästa steg.</p>
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="px-8 py-5 border-t border-border flex items-center justify-between" style={{ background: "var(--card)" }}>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          {files.length > 0 ? `${files.length} fil${files.length > 1 ? "er" : ""} redo för AI-extraktion` : "Inga filer uppladdade ännu"}
        </p>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
          style={{ background: "var(--ms-green)", color: "#fff", fontWeight: 600, fontSize: "14px" }}
        >
          {files.length > 0 ? "Starta AI-extraktion" : "Fortsätt manuellt"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
