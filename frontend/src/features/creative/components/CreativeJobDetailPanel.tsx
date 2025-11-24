import { Fragment } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { CreativeJobDetail } from '../api/types';

interface CreativeJobDetailPanelProps {
  job?: CreativeJobDetail;
  isLoading?: boolean;
  error?: string;
  onClose: () => void;
}

export function CreativeJobDetailPanel({
  job,
  isLoading,
  error,
  onClose,
}: CreativeJobDetailPanelProps) {
  if (!job && !isLoading && !error) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border border-white/10 bg-slate-950/95 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Loading job details…</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">Fetching the latest progress from Nano Banana.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-500/40 bg-red-500/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Unable to load job</CardTitle>
          <Button variant="ghost" className="text-white" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <Card className="border border-white/10 bg-slate-950/95 text-white">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg">
          Job Details • {job.template_slug}{' '}
          <Badge variant="outline" className="ml-2 uppercase">
            {job.status}
          </Badge>
        </CardTitle>
        <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1fr_320px]">
        <ScrollArea className="max-h-[60vh] space-y-6 pr-4">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
              Prompt Sections
            </h3>
            <div className="space-y-4 rounded-md border border-white/10 bg-black/40 p-4 text-sm text-slate-200">
              {Object.entries(job.prompt_sections).map(([section, body]) => (
                <div key={section} className="space-y-1">
                  <p className="font-semibold text-emerald-300">{section}</p>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-200">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
              Variation Summary
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.variation_summary?.style_notes?.map((note) => (
                <Badge key={note} variant="secondary" className="bg-white/10 text-slate-100">
                  {note}
                </Badge>
              ))}
              {job.variation_summary?.texture && (
                <Badge variant="outline" className="border-emerald-400 text-emerald-200">
                  {job.variation_summary.texture}
                </Badge>
              )}
            </div>
            {job.variation_summary?.style_suffix && (
              <p className="text-sm text-slate-300">{job.variation_summary.style_suffix}</p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
              Timeline
            </h3>
            <div className="space-y-3">
              {job.events.map((event, index) => (
                <Fragment key={event.id ?? `${event.event_type}-${index}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-100">
                        {event.event_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                      {Object.keys(event.payload ?? {}).length > 0 && (
                        <pre className="mt-1 rounded bg-white/5 p-2 text-xs text-slate-200">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                  {index < job.events.length - 1 && <Separator className="bg-white/5" />}
                </Fragment>
              ))}
            </div>
          </section>
        </ScrollArea>

        <aside className="space-y-4 rounded-lg border border-white/10 bg-black/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
            Assets
          </h3>
          <div className="space-y-3">
            {job.assets.map((asset) => (
              <div
                key={asset.id ?? asset.asset_url}
                className="rounded-md border border-white/10 bg-white/5 p-3 text-sm"
              >
                <p className="font-medium text-white">{asset.variant_label ?? 'Variant'}</p>
                <p className="text-xs text-slate-400">
                  {asset.width ?? '?'}×{asset.height ?? '?'} •{' '}
                  {asset.file_size_bytes ? `${(asset.file_size_bytes / 1024).toFixed(1)} KB` : '—'}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    onClick={(e) => {
                      // For data URLs, handle download client-side
                      if (asset.asset_url.startsWith('data:')) {
                        e.preventDefault();
                        const link = document.createElement('a');
                        link.href = asset.asset_url;
                        link.download = `${job.template_slug}_${asset.variant_label ?? 'image'}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                  >
                    <a
                      href={asset.asset_url}
                      download={`${job.template_slug}_${asset.variant_label ?? 'image'}.png`}
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </Button>
                  {asset.preview_url && asset.preview_url !== asset.asset_url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={asset.preview_url} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {job.assets.length === 0 && (
              <p className="text-sm text-slate-400">
                Assets will appear here once Nano Banana finishes rendering.
              </p>
            )}
          </div>
        </aside>
      </CardContent>
    </Card>
  );
}


