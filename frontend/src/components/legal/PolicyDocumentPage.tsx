import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { Badge } from '@/design-system/shadcn/components/badge';
import { POLICY_METADATA, type PolicyKey } from '@/config/legal';

interface PolicyDocumentPageProps {
  policy: PolicyKey;
}

// Simple markdown-like renderer for bold text
function renderContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function PolicyDocumentPage({ policy }: PolicyDocumentPageProps) {
  const metadata = POLICY_METADATA[policy];
  const { content } = metadata;

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <Link
            to="/"
            className="inline-flex w-max items-center gap-2 text-sm font-medium text-primary-300 transition hover:text-primary-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to RestaurantIQ
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary-400" />
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                {metadata.title}
              </h1>
            </div>
            <p className="max-w-3xl text-base text-slate-300">{metadata.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <Badge variant="outline" className="border-white/10 text-primary-300">
                Version {metadata.version}
              </Badge>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Effective: {content.effectiveDate}
              </span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Contents
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {content.sections.map((section, index) => (
              <li key={index}>
                <a
                  href={`#section-${index}`}
                  className="text-sm text-primary-300 hover:text-primary-100 transition-colors"
                >
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content Sections */}
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <section
              key={index}
              id={`section-${index}`}
              className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 scroll-mt-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/20 text-primary-300 text-sm font-bold">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                {renderContent(section.content)}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-800">
          <p>Last updated: {content.effectiveDate}</p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="mailto:legal@restaurantiq.io" className="text-primary-300 hover:text-primary-100">
              legal@restaurantiq.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
