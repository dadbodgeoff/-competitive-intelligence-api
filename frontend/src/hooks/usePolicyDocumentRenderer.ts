import { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?worker&url';

export type PolicyRenderState = 'idle' | 'loading' | 'ready' | 'error';

if (typeof window !== 'undefined') {
  const currentWorkerSrc = (pdfjs.GlobalWorkerOptions.workerSrc ?? '') as string;
  if (!currentWorkerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  }
}

interface UsePolicyDocumentRendererOptions {
  /**
   * Scale multiplier applied to each page render. Defaults to 1.25.
   */
  scale?: number;
  /**
   * Optional element class names to apply to the rendered canvas instance.
   */
  canvasClassName?: string;
}

export function usePolicyDocumentRenderer(
  file: string,
  shouldRender: boolean,
  { scale = 1.25, canvasClassName }: UsePolicyDocumentRendererOptions = {},
) {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [renderState, setRenderState] = useState<PolicyRenderState>('idle');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const canvasClassNames = useMemo(
    () =>
      canvasClassName ??
      'mb-6 rounded-lg border border-slate-800 bg-slate-900 shadow-inner shadow-slate-950',
    [canvasClassName],
  );

  useEffect(() => {
    if (!shouldRender) {
      setRenderState('idle');
      setRenderError(null);
      setPageCount(0);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
      return;
    }

    let cancelled = false;

    async function renderDocument() {
      if (!canvasContainerRef.current) return;

      setRenderState('loading');
      setRenderError(null);
      setPageCount(0);
      canvasContainerRef.current.innerHTML = '';

      try {
        const loadingTask = pdfjs.getDocument({
          url: file,
          withCredentials: false,
        });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setPageCount(pdf.numPages);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNumber);
          if (cancelled) break;

          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            continue;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.className = canvasClassNames;

          canvasContainerRef.current?.appendChild(canvas);

          await page
            .render({
              canvasContext: context,
              viewport,
            })
            .promise;
        }

        if (!cancelled) {
          setRenderState('ready');
        }
      } catch (error) {
        console.error('Failed to render policy document', error);
        if (!cancelled) {
          setRenderState('error');
          setRenderError(
            'We could not display the document inline. Please download it using the link below.',
          );
        }
      }
    }

    renderDocument();

    return () => {
      cancelled = true;
    };
  }, [canvasClassNames, file, scale, shouldRender]);

  return {
    canvasContainerRef,
    renderState,
    renderError,
    pageCount,
    reset: () => {
      setRenderState('idle');
      setRenderError(null);
      setPageCount(0);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
    },
  };
}


