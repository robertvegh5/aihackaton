import { useState, type ElementType } from "react";
import { CheckCircle2, Clock, AlertCircle, MessageSquare, ThumbsUp, ThumbsDown, Eye, Search } from "lucide-react";

interface InternalReviewProps {
  onBack: () => void;
}

type ArticleStatus = "pending_review" | "approved" | "rejected" | "needs_info";

interface Article {
  id: string;
  name: string;
  supplier: string;
  ean: string;
  category: string;
  submitted: string;
  status: ArticleStatus;
  issues: number;
  aiScore: number;
  reviewer?: string;
}

const ARTICLES: Article[] = [
  { id: "A001", name: "Oatly Havredryck Ekologisk 1 L", supplier: "Oatly AB", ean: "7394376615800", category: "Vaxtbaserade drycker", submitted: "2024-11-28", status: "pending_review", issues: 0, aiScore: 94 },
  { id: "A002", name: "Felix Tomatpure 3x70g", supplier: "Orkla Foods Sverige AB", ean: "7310500027027", category: "Konserver och palagg", submitted: "2024-11-27", status: "approved", issues: 0, aiScore: 98, reviewer: "Anna K." },
  { id: "A003", name: "Lurpak Smor och Rapsolja 400g", supplier: "Arla Foods AB", ean: "5740900420056", category: "Mejeriprodukter", submitted: "2024-11-27", status: "needs_info", issues: 2, aiScore: 76 },
  { id: "A004", name: "Santa Maria Tacokrydda Original 28g", supplier: "Santa Maria AB", ean: "7317390100013", category: "Kryddor och smaksattare", submitted: "2024-11-26", status: "rejected", issues: 5, aiScore: 58, reviewer: "Marcus L." },
  { id: "A005", name: "Kikkoman Soja Naturligt Bryggd 150ml", supplier: "Kikkoman Nordic AB", ean: "4100420148062", category: "Asiatiska produkter", submitted: "2024-11-25", status: "approved", issues: 0, aiScore: 97, reviewer: "Anna K." },
  { id: "A006", name: "Barilla Penne Rigate nr.73 500g", supplier: "Barilla Sverige AB", ean: "8076809513340", category: "Pasta och ris", submitted: "2024-11-25", status: "pending_review", issues: 1, aiScore: 88 },
];

const STATUS_CONFIG: Record<
  ArticleStatus,
  { label: string; color: string; bg: string; border: string; icon: ElementType }
> = {
  pending_review: { label: "Vantar granskning", color: "var(--ms-amber)", bg: "rgba(200,151,62,0.1)", border: "rgba(200,151,62,0.25)", icon: Clock },
  approved: { label: "Godkand", color: "var(--ms-status-ok)", bg: "rgba(45,106,79,0.08)", border: "rgba(45,106,79,0.2)", icon: CheckCircle2 },
  rejected: { label: "Avvisad", color: "var(--ms-status-error)", bg: "rgba(192,57,43,0.08)", border: "rgba(192,57,43,0.2)", icon: AlertCircle },
  needs_info: { label: "Behover info", color: "var(--ms-status-info)", bg: "rgba(46,107,170,0.08)", border: "rgba(46,107,170,0.2)", icon: MessageSquare },
};

export function InternalReview({ onBack }: InternalReviewProps) {
  const [selected, setSelected] = useState<string>("A001");
  const [filter, setFilter] = useState<ArticleStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter(
    (article) =>
      (filter === "all" || article.status === filter) &&
      (article.name.toLowerCase().includes(search.toLowerCase()) || article.supplier.toLowerCase().includes(search.toLowerCase())),
  );

  const article = ARTICLES.find((entry) => entry.id === selected) ?? ARTICLES[0];
  const statusConfig = STATUS_CONFIG[article.status];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 pt-8 pb-5">
        <div className="mb-1 flex items-center gap-2" style={{ color: "var(--ms-amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>
            PAR 3 - INTERN GRANSKNING
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: "var(--ms-green)" }}>Artikelgranskningsko</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
              Artikelutkast inkomna fran leverantorer. Godkann, avvisa eller begar komplettering.
            </p>
          </div>
          <div className="flex gap-2">
            {(Object.entries(STATUS_CONFIG) as [ArticleStatus, (typeof STATUS_CONFIG)[ArticleStatus]][]).map(([key, config]) => {
              const count = ARTICLES.filter((entry) => entry.status === key).length;
              if (count === 0) {
                return null;
              }

              return (
                <button
                  key={key}
                  onClick={() => setFilter(filter === key ? "all" : key)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all"
                  style={{
                    background: filter === key ? config.bg : "var(--muted)",
                    border: `1px solid ${filter === key ? config.border : "var(--border)"}`,
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 700, color: filter === key ? config.color : "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {count}
                  </span>
                  <span style={{ fontSize: "11px", color: filter === key ? config.color : "var(--muted-foreground)" }}>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ display: "grid", gridTemplateColumns: "360px 1fr" }}>
        <div className="flex flex-col overflow-hidden border-r border-border">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--input-background)", border: "1px solid var(--border)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Sok artikel eller leverantor..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "13px", color: "var(--foreground)" }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {filtered.map((entry) => {
              const config = STATUS_CONFIG[entry.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelected(entry.id)}
                  className="flex cursor-pointer items-start gap-3 border-b border-border px-4 py-3 transition-all"
                  style={{ background: selected === entry.id ? "rgba(27,58,45,0.05)" : "transparent" }}
                >
                  <StatusIcon size={14} style={{ color: config.color, flexShrink: 0, marginTop: "3px" }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate" style={{ fontSize: "13px", fontWeight: selected === entry.id ? 600 : 500, color: "var(--foreground)" }}>
                      {entry.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>{entry.supplier}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="rounded px-1.5 py-0.5" style={{ fontSize: "10px", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
                        {config.label}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>AI {entry.aiScore}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", flexShrink: 0 }}>{entry.submitted.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{article.id}</span>
                  <span className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: statusConfig.color }} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: statusConfig.color }}>{statusConfig.label}</span>
                  </span>
                </div>
                <h2 style={{ color: "var(--ms-green)" }}>{article.name}</h2>
                <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginTop: "2px" }}>{article.supplier}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all hover:bg-muted" style={{ border: "1px solid var(--border)", fontSize: "13px", color: "var(--foreground)" }}>
                  <Eye size={14} /> Forhandsgranska
                </button>
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all hover:bg-muted" style={{ border: "1px solid var(--border)", fontSize: "13px", color: "var(--foreground)" }}>
                  <MessageSquare size={14} /> Kommentar
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-3">
              {[
                { label: "AI-kvalitetspoang", value: `${article.aiScore}%`, color: article.aiScore >= 90 ? "var(--ms-status-ok)" : article.aiScore >= 75 ? "var(--ms-amber)" : "var(--ms-status-error)" },
                { label: "Blockerande problem", value: article.issues.toString(), color: article.issues === 0 ? "var(--ms-status-ok)" : "var(--ms-status-error)" },
                { label: "Kategori", value: article.category, color: "var(--foreground)" },
                { label: "Inlamnad", value: article.submitted, color: "var(--foreground)" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginBottom: "4px" }}>{metric.label}</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: metric.color }}>{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
              <div className="border-b border-border px-5 py-3">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>Nyckeldata</p>
              </div>
              <div>
                {[
                  { label: "EAN-13", value: article.ean },
                  { label: "Leverantor", value: article.supplier },
                  { label: "Kategori", value: article.category },
                  { label: "Produktkategori (M&S)", value: "Drycker > Vaxtbaserat" },
                  { label: "Ursprungsland", value: "Sverige" },
                  { label: "Hallbarhet", value: "365 dagar" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between px-5 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>{row.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {article.reviewer && (
              <div className="rounded-xl p-4" style={{ background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--ms-green)", marginBottom: "4px" }}>Granskad av {article.reviewer}</p>
                <p style={{ fontSize: "13px", color: "var(--ms-green-mid)" }}>Artikeln uppfyller Martin &amp; Serveras krav. Godkand for publiceringsko.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-border px-8 py-4" style={{ background: "var(--card)" }}>
            <button onClick={onBack} className="rounded-lg px-4 py-2 transition-all hover:bg-muted" style={{ fontSize: "13px", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
              Tillbaka till validering
            </button>
            {article.status === "pending_review" && (
              <>
                <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all hover:opacity-90" style={{ background: "var(--ms-status-error)", color: "#fff", fontWeight: 600, fontSize: "13px" }}>
                  <ThumbsDown size={14} /> Avvisa
                </button>
                <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", fontWeight: 600, fontSize: "13px" }}>
                  <MessageSquare size={14} /> Begar komplettering
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all hover:opacity-90" style={{ background: "var(--ms-green)", color: "#fff", fontWeight: 600, fontSize: "13px" }}>
                  <ThumbsUp size={14} /> Godkann artikel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
