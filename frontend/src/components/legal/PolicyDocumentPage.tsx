import { Link } from 'react-router-dom';
import { ArrowLeft, FileDown, Loader2, ScrollText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/design-system/shadcn/components/badge';
import { cn } from '@/lib/utils';
import { POLICY_METADATA, type PolicyKey } from '@/config/legal';
import { usePolicyDocumentRenderer } from '@/hooks/usePolicyDocumentRenderer';

interface PolicyDocumentPageProps {
  policy: PolicyKey;
}

export function PolicyDocumentPage({ policy }: PolicyDocumentPageProps) {
  const metadata = POLICY_METADATA[policy];
  const { canvasContainerRef, pageCount, renderError, renderState } =
    usePolicyDocumentRenderer(metadata.file, true, { scale: 1.15 });

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-col gap-6">
          <Link
            to="/"
            className="inline-flex w-max items-center gap-2 text-sm font-medium text-emerald-300 transition hover:text-emerald-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to RestaurantIQ
          </Link>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {metadata.title}
            </h1>
            <p className="max-w-3xl text-base text-slate-300">{metadata.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                Version {metadata.version}
              </Badge>
              {pageCount > 0 && (
                <span className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-slate-500" />
                  {pageCount} page{pageCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
            <div className="text-sm text-slate-400">
              The document renders inline for convenience. You can also download the PDF.
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-200 hover:text-white"
              onClick={() => window.open(metadata.file, '_blank', 'noopener')}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-6 py-8">
            <div
              ref={canvasContainerRef}
              className={cn(
                'flex flex-col items-center',
                renderState === 'loading' && 'opacity-60',
              )}
            >
              {renderState === 'loading' && (
                <div className="flex flex-col items-center gap-3 py-20 text-slate-300">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  <p className="text-sm font-medium">
                    Preparing {metadata.title.toLowerCase()}…
                  </p>
                </div>
              )}
            </div>

            {renderError && (
              <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                {renderError}{' '}
                <a
                  href={metadata.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-50"
                >
                  Download the PDF instead.
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


