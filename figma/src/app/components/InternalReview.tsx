import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, ChevronRight, Eye, MessageSquare, ThumbsUp, ThumbsDown, Filter, Search, ArrowUpRight } from "lucide-react";

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
  { id: "A001", name: "Oatly Havredryck Ekologisk 1 L", supplier: "Oatly AB", ean: "7394376615800", category: "Växtbaserade drycker", submitted: "2024-11-28", status: "pending_review", issues: 0, aiScore: 94 },
  { id: "A002", name: "Felix Tomatpuré 3x70g", supplier: "Orkla Foods Sverige AB", ean: "7310500027027", category: "Konserver & pålägg", submitted: "2024-11-27", status: "approved", issues: 0, aiScore: 98, reviewer: "Anna K." },
  { id: "A003", name: "Lurpak Smör & Rapsolja 400g", supplier: "Arla Foods AB", ean: "5740900420056", category: "Mejeriprodukter", submitted: "2024-11-27", status: "needs_info", issues: 2, aiScore: 76 },
  { id: "A004", name: "Santa Maria Tacokrydda Original 28g", supplier: "Santa Maria AB", ean: "7317390100013", category: "Kryddor & smaksättare", submitted: "2024-11-26", status: "rejected", issues: 5, aiScore: 58, reviewer: "Marcus L." },
  { id: "A005", name: "Kikkoman Soja Naturligt Bryggd 150ml", supplier: "Kikkoman Nordic AB", ean: "4100420148062", category: "Asiatiska produkter", submitted: "2024-11-25", status: "approved", issues: 0, aiScore: 97, reviewer: "Anna K." },
  { id: "A006", name: "Barilla Penne Rigate nr.73 500g", supplier: "Barilla Sverige AB", ean: "8076809513340", category: "Pasta & ris", submitted: "2024-11-25", status: "pending_review", issues: 1, aiScore: 88 },
];

const STATUS_CONFIG: Record<ArticleStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending_review: { label: "Väntar granskning", color: "var(--ms-amber)", bg: "rgba(200,151,62,0.1)", border: "rgba(200,151,62,0.25)", icon: Clock },
  approved: { label: "Godkänd", color: "var(--ms-status-ok)", bg: "rgba(45,106,79,0.08)", border: "rgba(45,106,79,0.2)", icon: CheckCircle2 },
  rejected: { label: "Avvisad", color: "var(--ms-status-error)", bg: "rgba(192,57,43,0.08)", border: "rgba(192,57,43,0.2)", icon: AlertCircle },
  needs_info: { label: "Behöver info", color: "var(--ms-status-info)", bg: "rgba(46,107,170,0.08)", border: "rgba(46,107,170,0.2)", icon: MessageSquare },
};

export function InternalReview({ onBack }: InternalReviewProps) {
  const [selected, setSelected] = useState<string>("A001");
  const [filter, setFilter] = useState<ArticleStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter(a =>
    (filter === "all" || a.status === filter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.supplier.toLowerCase().includes(search.toLowerCase()))
  );

  const article = ARTICLES.find(a => a.id === selected)!;
  const statusCfg = STATUS_CONFIG[article.status];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--ms-amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em" }}>PAR 3 — INTERN GRANSKNING</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: "var(--ms-green)" }}>Artikelgranskningskö</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>
              Artikelutkast inkomna från leverantörer. Godkänn, avvisa eller begär komplettering.
            </p>
          </div>
          {/* Summary pills */}
          <div className="flex gap-2">
            {(Object.entries(STATUS_CONFIG) as [ArticleStatus, typeof STATUS_CONFIG[ArticleStatus]][]).map(([k, cfg]) => {
              const count = ARTICLES.filter(a => a.status === k).length;
              return count > 0 ? (
                <button key={k} onClick={() => setFilter(filter === k ? "all" : k)}
                  className="px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                  style={{ background: filter === k ? cfg.bg : "var(--muted)", border: `1px solid ${filter === k ? cfg.border : "var(--border)"}` }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: filter === k ? cfg.color : "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
                  <span style={{ fontSize: "11px", color: filter === k ? cfg.color : "var(--muted-foreground)" }}>{cfg.label}</span>
                </button>
              ) : null;
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ display: "grid", gridTemplateColumns: "360px 1fr" }}>
        {/* Article list */}
        <div className="flex flex-col border-r border-border overflow-hidden">
          {/* Search */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Sök artikel eller leverantör…"
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "13px", color: "var(--foreground)" }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {filtered.map((a) => {
              const cfg = STATUS_CONFIG[a.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-border"
                  style={{ background: selected === a.id ? "rgba(27,58,45,0.05)" : "transparent" }}
                >
                  <StatusIcon size={14} style={{ color: cfg.color, flexShrink: 0, marginTop: "3px" }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "13px", fontWeight: selected === a.id ? 600 : 500, color: "var(--foreground)" }} className="truncate">{a.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>{a.supplier}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>AI {a.aiScore}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", flexShrink: 0 }}>{a.submitted.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Article detail */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Article header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{article.id}</span>
                  <span className="px-2 py-0.5 rounded-full flex items-center gap-1.5" style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: statusCfg.color }}>{statusCfg.label}</span>
                  </span>
                </div>
                <h2 style={{ color: "var(--ms-green)" }}>{article.name}</h2>
                <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginTop: "2px" }}>{article.supplier}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-all" style={{ border: "1px solid var(--border)", fontSize: "13px", color: "var(--foreground)" }}>
                  <Eye size={14} /> Förhandsgranska
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-all" style={{ border: "1px solid var(--border)", fontSize: "13px", color: "var(--foreground)" }}>
                  <MessageSquare size={14} /> Kommentar
                </button>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "AI-kvalitetspoäng", value: `${article.aiScore}%`, color: article.aiScore >= 90 ? "var(--ms-status-ok)" : article.aiScore >= 75 ? "var(--ms-amber)" : "var(--ms-status-error)" },
                { label: "Blockerande problem", value: article.issues.toString(), color: article.issues === 0 ? "var(--ms-status-ok)" : "var(--ms-status-error)" },
                { label: "Kategori", value: article.category, color: "var(--foreground)" },
                { label: "Inlämnad", value: article.submitted, color: "var(--foreground)" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginBottom: "4px" }}>{m.label}</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Key fields summary */}
            <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
              <div className="px-5 py-3 border-b border-border">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>Nyckeldata</p>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {[
                  { label: "EAN-13", value: article.ean },
                  { label: "Leverantör", value: article.supplier },
                  { label: "Kategori", value: article.category },
                  { label: "Produktkategori (M&S)", value: "Drycker > Växtbaserat" },
                  { label: "Ursprungsland", value: "Sverige" },
                  { label: "Hållbarhet", value: "365 dagar" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between px-5 py-2.5">
                    <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>{row.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviewer note */}
            {article.reviewer && (
              <div className="rounded-xl p-4" style={{ background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--ms-green)", marginBottom: "4px" }}>Granskad av {article.reviewer}</p>
                <p style={{ fontSize: "13px", color: "var(--ms-green-mid)" }}>Artikeln uppfyller Martin & Serveras krav. Godkänd för publiceringskö.</p>
              </div>
            )}
          </div>

          {/* Action bar */}
          {article.status === "pending_review" && (
            <div className="px-8 py-4 border-t border-border flex items-center gap-3" style={{ background: "var(--card)" }}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all hover:opacity-90" style={{ background: "var(--ms-status-error)", color: "#fff", fontWeight: 600, fontSize: "13px" }}>
                <ThumbsDown size={14} /> Avvisa
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", fontWeight: 600, fontSize: "13px" }}>
                <MessageSquare size={14} /> Begär komplettering
              </button>
              <div className="flex-1" />
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:opacity-90" style={{ background: "var(--ms-green)", color: "#fff", fontWeight: 600, fontSize: "13px" }}>
                <ThumbsUp size={14} /> Godkänn artikel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
