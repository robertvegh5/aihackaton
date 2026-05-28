import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload, FileText, FileSpreadsheet, CheckCircle2, ArrowRight, Info, Trash2 } from "lucide-react";
import type { UploadedFile, UploadMode } from "../App";

interface SupplierUploadProps {
  mode: UploadMode;
  files: UploadedFile[];
  error: string | null;
  isSubmitting: boolean;
  onModeChange: (mode: UploadMode) => void;
  onFilesChange: (files: UploadedFile[]) => void;
  onNext: () => void;
}

const allowedFileTypes = [
  ".pdf",
  ".xlsx",
  ".csv",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const maxFileSizeBytes = 25 * 1024 * 1024;

export function SupplierUpload({ mode, files, error, isSubmitting, onModeChange, onFilesChange, onNext }: SupplierUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const nextFiles: UploadedFile[] = [];
    const rejectedFiles: string[] = [];

    Array.from(fileList).forEach((file) => {
      const extension = getFileExtension(file.name);
      const isAllowed = allowedFileTypes.includes(extension);
      const isSizeAllowed = file.size <= maxFileSizeBytes;

      if (!isAllowed || !isSizeAllowed) {
        rejectedFiles.push(file.name);
        return;
      }

      nextFiles.push({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        name: file.name,
        size: file.size,
        type: extension.replace(".", "") || file.type || "file",
      });
    });

    if (rejectedFiles.length > 0) {
      setUploadError(`Filerna kunde inte laddas upp: ${rejectedFiles.join(", ")}. Tillåtna filer är PDF, XLSX, CSV, DOCX och bilder upp till 25 MB.`);
    } else {
      setUploadError(null);
    }

    if (nextFiles.length === 0) {
      return;
    }

    const mergedFiles = [...files];
    nextFiles.forEach((nextFile) => {
      if (!mergedFiles.some((existingFile) => existingFile.id === nextFile.id)) {
        mergedFiles.push(nextFile);
      }
    });

    onFilesChange(mergedFiles);
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter((file) => file.id !== fileId));
    setUploadError(null);
  };

  const openFilePicker = () => inputRef.current?.click();
  const canContinue = mode === "manual" || files.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-6">
        <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}
          >
            STEG 1
          </span>
        </div>
        <h1 style={{ color: "var(--ms-green)" }}>Ladda upp artikelunderlag</h1>
        <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
          Ladda upp produktblad, specifikationer eller befintlig artikeldata. Du kan också hoppa över detta och fylla i uppgifterna manuellt.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mb-6 flex w-fit gap-1 rounded-lg p-1" style={{ background: "var(--muted)" }}>
          {(["upload", "manual"] as const).map((nextMode) => (
            <button
              key={nextMode}
              onClick={() => {
                onModeChange(nextMode);
                setUploadError(null);
              }}
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
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={allowedFileTypes.join(",")}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={openFilePicker}
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
                  <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "15px" }}>Dra och släpp filer här</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>eller klicka för att bläddra</p>
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>
                  PDF · XLSX · CSV · DOCX - max 25 MB per fil
                </p>
              </div>
            </div>

            {(uploadError || error) && (
              <div
                className="mb-4 rounded-lg px-4 py-3"
                style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", color: "var(--ms-status-error)" }}
              >
                <p style={{ fontSize: "13px", lineHeight: 1.5 }}>{uploadError || error}</p>
              </div>
            )}

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
                      <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{formatFileSize(file.size)}</p>
                    </div>
                    <CheckCircle2 size={16} style={{ color: "var(--ms-status-ok)" }} />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-muted"
                      aria-label={`Ta bort ${file.name}`}
                    >
                      <Trash2 size={15} style={{ color: "var(--muted-foreground)" }} />
                    </button>
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
                AI:n extraherar automatiskt artikelnamn, EAN, vikt, ingredienser, näringsvärden och allergener från dina uppladdade dokument.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl p-6 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>Manuellt inmatningsläge - inga filer krävs</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>
              Du fyller i all artikeldata direkt i formuläret i nästa steg.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-5" style={{ background: "var(--card)" }}>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          {mode === "manual"
            ? "Manuellt inmatningsläge valt"
            : files.length > 0
              ? `${files.length} filer redo för AI-extraktion`
              : "Ladda upp minst en fil för att fortsätta"}
        </p>
        <button
          onClick={onNext}
          disabled={!canContinue || isSubmitting}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all hover:opacity-90"
          style={{
            background: canContinue && !isSubmitting ? "var(--ms-green)" : "var(--muted)",
            color: canContinue && !isSubmitting ? "#fff" : "var(--muted-foreground)",
            fontWeight: 600,
            fontSize: "14px",
            cursor: canContinue && !isSubmitting ? "pointer" : "not-allowed",
            opacity: canContinue && !isSubmitting ? 1 : 0.7,
          }}
        >
          {isSubmitting ? "Bearbetar..." : mode === "manual" ? "Gå till steg 2" : "Analysera med AI"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function getFileExtension(fileName: string) {
  const extensionIndex = fileName.lastIndexOf(".");
  return extensionIndex >= 0 ? fileName.slice(extensionIndex).toLowerCase() : "";
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
