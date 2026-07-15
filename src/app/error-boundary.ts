import type { EventBus } from '../core/events/event-bus';
import type { AppEventMap } from '../core/events/event-bus';

export type ErrorBoundaryOptions = {
  readonly document: Document;
  readonly eventBus: EventBus<AppEventMap>;
  readonly window?: Pick<Window, 'addEventListener'>;
};

const ERROR_MESSAGE = 'Ein technischer Fehler wurde abgefangen. Du kannst neu laden.';

export function installErrorBoundary({ document, eventBus, window }: ErrorBoundaryOptions): void {
  window?.addEventListener('error', (event) => {
    reportError(document, eventBus, readErrorMessage(event.error));
  });

  window?.addEventListener('unhandledrejection', (event) => {
    reportError(document, eventBus, readErrorMessage(event.reason));
  });
}

export function reportError(
  document: Document,
  eventBus: EventBus<AppEventMap>,
  technicalCause: string,
): HTMLElement {
  const message = ERROR_MESSAGE;
  const status = findOrCreateStatus(document);
  status.textContent = message;

  eventBus.emit('app:error', {
    message,
    cause: technicalCause,
    recoverable: true,
  });

  console.error(`${message} Ursache: ${technicalCause}`);

  return status;
}

function findOrCreateStatus(document: Document): HTMLElement {
  const existingStatus = document.querySelector<HTMLElement>('[data-app-error-status="true"]');

  if (existingStatus !== null) {
    return existingStatus;
  }

  const status = document.createElement('p');
  status.dataset.appErrorStatus = 'true';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  document.body.prepend(status);

  return status;
}

function readErrorMessage(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === 'string' && reason.length > 0) {
    return reason;
  }

  return 'Unbekannte Ursache';
}
