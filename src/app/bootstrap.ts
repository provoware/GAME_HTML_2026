import { appConfig } from '../core/config/app-config';
import type { EventBus } from '../core/events/event-bus';
import { createAppEventBus } from '../core/events/event-bus';
import type { AppEventMap } from '../core/events/event-bus';
import { installErrorBoundary } from './error-boundary';
import { resolveAppScreen } from './router';

export type BootstrapOptions = {
  readonly document: Document;
  readonly rootSelector?: string;
  readonly eventBus?: EventBus<AppEventMap>;
  readonly diagnosticsEnabled?: boolean;
  readonly window?: Pick<Window, 'addEventListener'>;
};

export function bootstrapApp({
  document,
  rootSelector = appConfig.defaultRootSelector,
  eventBus = createAppEventBus(),
  diagnosticsEnabled = appConfig.diagnosticsEnabled,
  window,
}: BootstrapOptions): HTMLElement {
  installErrorBoundary({ document, eventBus, window });
  const app = document.querySelector<HTMLElement>(rootSelector);

  if (app === null) {
    throw new Error(`App-Container ${rootSelector} wurde nicht gefunden.`);
  }

  app.replaceChildren(createStartScreen(document, diagnosticsEnabled));
  eventBus.emit('app:booted', { appName: appConfig.appName, version: appConfig.version });

  return app;
}

function createStartScreen(document: Document, diagnosticsEnabled: boolean): HTMLElement {
  const main = document.createElement('main');
  main.className = 'shell';
  main.id = 'main-content';
  main.tabIndex = -1;

  const screen = resolveAppScreen();

  const title = document.createElement('h1');
  title.textContent = appConfig.appName;

  const screenTitle = document.createElement('p');
  screenTitle.textContent = screen.title;

  const status = document.createElement('p');
  status.textContent = `Version ${appConfig.version} · ${appConfig.environment}`;

  main.append(title, screenTitle, status);

  if (diagnosticsEnabled) {
    main.append(createDiagnosticsPanel(document));
  }

  return main;
}

function createDiagnosticsPanel(document: Document): HTMLElement {
  const panel = document.createElement('aside');
  panel.setAttribute('aria-label', 'Diagnosemodus');
  panel.dataset.diagnosticsPanel = 'true';

  const headline = document.createElement('h2');
  headline.textContent = 'Diagnosemodus';

  const details = document.createElement('p');
  details.textContent = 'Aktiv: Entwicklungsumgebung, Laufzeitfehler werden sichtbar gemeldet.';

  panel.append(headline, details);

  return panel;
}
