import { streamSse } from '@/lib/sse';

export type NanoBananaStreamEvent =
  | { type: 'status'; data: { status?: string; progress?: number; message?: string } }
  | { type: 'job_complete'; data: unknown }
  | { type: 'job_failed'; data: { error?: string; nano_job_id?: string } }
  | { type: 'queued'; data: { message?: string } }
  | { type: 'error'; data: { error?: string } }
  | { type: string; data: unknown };

export interface StreamHandlers {
  onEvent: (event: NanoBananaStreamEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

export function openNanoStream(jobId: string, handlers: StreamHandlers) {
  const connection = streamSse({
    url: `/api/v1/nano-banana/jobs/${jobId}/stream`,
    onEvent: (event) => {
      handlers.onEvent({
        type: event.event,
        data: event.data,
      });
    },
    onError: handlers.onError,
    onOpen: handlers.onOpen,
    onClose: handlers.onClose,
  });

  return connection;
}


