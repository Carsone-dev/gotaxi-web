import { useState } from "react";
import { FileText, Eye, X, ExternalLink, Download } from "lucide-react";
import { getMediaUrl } from "@/lib/format";

interface KycDoc {
  label: string;
  rawUrl: string | null;
}

interface Props {
  cin_url: string | null;
  permis_url: string | null;
  casier_url: string | null;
}

function isPdf(url: string): boolean {
  return url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("pdf");
}

export function KycDocumentViewer({ cin_url, permis_url, casier_url }: Props) {
  const [lightbox, setLightbox] = useState<{ url: string; label: string; pdf: boolean } | null>(null);

  const docs: KycDoc[] = [
    { label: "Pièce d'identité (CIN)", rawUrl: cin_url },
    { label: "Permis de conduire",     rawUrl: permis_url },
    { label: "Casier judiciaire",      rawUrl: casier_url },
  ];

  const openLightbox = (raw: string, label: string) => {
    const url = getMediaUrl(raw)!;
    setLightbox({ url, label, pdf: isPdf(url) });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {docs.map((doc) => {
          const fullUrl = getMediaUrl(doc.rawUrl);
          return (
            <div key={doc.label} className="flex flex-col gap-1.5">
              <p className="truncate text-xs font-medium text-muted-foreground" title={doc.label}>
                {doc.label}
              </p>

              {fullUrl ? (
                <button
                  type="button"
                  onClick={() => openLightbox(doc.rawUrl!, doc.label)}
                  className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary"
                >
                  {isPdf(fullUrl) ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-red-50">
                      <FileText className="size-7 text-red-400" />
                      <span className="text-[10px] font-medium text-red-500 uppercase tracking-wide">PDF</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={fullUrl}
                        alt={doc.label}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.nextElementSibling as HTMLElement | null)?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden h-full w-full items-center justify-center">
                        <FileText className="size-6 text-muted-foreground/50" />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35">
                    <Eye className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface">
                  <div className="flex flex-col items-center gap-1.5">
                    <FileText className="size-5 text-muted-foreground/30" />
                    <p className="text-[10px] text-muted-foreground">Non fourni</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex max-h-[95vh] max-w-[95vw] flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barre supérieure */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white">{lightbox.label}</p>
              <div className="flex gap-2">
                <a
                  href={lightbox.url}
                  download
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  title="Télécharger"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="size-4 text-white" />
                </a>
                <a
                  href={lightbox.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  title="Ouvrir dans un nouvel onglet"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="size-4 text-white" />
                </a>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  onClick={() => setLightbox(null)}
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            {lightbox.pdf ? (
              <iframe
                src={lightbox.url}
                title={lightbox.label}
                className="h-[80vh] w-[80vw] rounded-xl bg-white shadow-2xl"
              />
            ) : (
              <img
                src={lightbox.url}
                alt={lightbox.label}
                className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "";
                  (e.currentTarget as HTMLImageElement).alt = "Impossible de charger l'image";
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
