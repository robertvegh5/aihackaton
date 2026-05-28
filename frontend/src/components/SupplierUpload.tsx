import { useState, type DragEvent } from "react";
import { Upload, FileText, FileSpreadsheet, CheckCircle2, ArrowRight, Info } from "lucide-react";

interface SupplierUploadProps {
  onNext: () => void;
}

export function SupplierUpload({ onNext }: SupplierUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [mode, setMode] = useState<"upload" | "manual">("upload");

  const sampleFiles = [
    { name: "Produktblad_Oatly_Havredryck_2024.pdf", size: "2.4 MB", type: "pdf" },
    { name: "Artikeldata_Martin_Servera_Q4.xlsx", size: "148 KB", type: "xlsx" },
  ];

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    setFiles(sampleFiles);
  };

  const addSampleFile = () => setFiles(sampleFiles);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-6">
        <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}
          >
            STEG 1 AV 4
          </span>
        </div>
        <h1 style={{ color: "var(--ms-green)" }}>Ladda upp artikelunderlag</h1>
        <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
          Ladda upp produktblad, specifikationer eller befintlig artikeldata. Var AI extraherar och strukturerar informationen at dig.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mb-6 flex w-fit gap-1 rounded-lg p-1" style={{ background: "var(--muted)" }}>
          {(["upload", "manual"] as const).map((nextMode) => (
            <button
              key={nextMode}
              onClick={() => setMode(nextMode)}
              className="rounded-md px-4 py-1.5 transition-all"
              style={{
                background: mode === nextMode ? "#fff" : "transparent",
                color: mode === nextMode ? "var(--ms-green)" : "var(--muted-foreground)",
                fontSize: "13px",
                fontWeight: mode === nextMode ? 600 : 400,
                boxShadow: mode === nextMode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {nextMode === "upload" ? "Ladda upp dokument" : "Fyll i manuellt"}
            </button>
          ))}
        </div>

        {mode === "upload" ? (
          <>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={addSampleFile}
              className="relative mb-4 cursor-pointer rounded-xl transition-all"
              style={{
                border: `2px dashed ${dragOver ? "var(--ms-green)" : "var(--border)"}`,
                background: dragOver ? "rgba(27,58,45,0.04)" : "var(--card)",
                padding: "48px 32px",
                textAlign: "center",
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--muted)" }}>
                  <Upload size={22} style={{ color: "var(--ms-green)" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "15px" }}>Dra och slapp filer har</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>eller klicka for att bladdra</p>
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>
                  PDF · XLSX · CSV · DOCX - max 25 MB per fil
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 rounded-lg px-4 py-3"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                      style={{ background: file.type === "pdf" ? "rgba(192,57,43,0.1)" : "rgba(27,58,45,0.1)" }}
                    >
                      {file.type === "pdf" ? (
                        <FileText size={16} style={{ color: "#c0392b" }} />
                      ) : (
                        <FileSpreadsheet size={16} style={{ color: "var(--ms-green)" }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate" style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{file.size}</p>
                    </div>
                    <CheckCircle2 size={16} style={{ color: "var(--ms-status-ok)" }} />
                  </div>
                ))}
              </div>
            )}

            <div
              className="flex gap-3 rounded-lg p-4"
              style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.12)" }}
            >
              <Info size={16} style={{ color: "var(--ms-green)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "var(--ms-green-mid)" }}>
                AI:n extraherar automatiskt artikelnamn, EAN, vikt, ingredienser, naringsvarden och allergener fran dina uppladdade dokument.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl p-6 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>Manuellt inmatningslage - inga filer kravs</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>
              Du fyller i all artikeldata direkt i formularet i nasta steg.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-5" style={{ background: "var(--card)" }}>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          {files.length > 0 ? `${files.length} filer redo for AI-extraktion` : "Inga filer uppladdade annu"}
        </p>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all hover:opacity-90"
          style={{ background: "var(--ms-green)", color: "#fff", fontWeight: 600, fontSize: "14px" }}
        >
          {files.length > 0 ? "Starta AI-extraktion" : "Fortsatt manuellt"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
