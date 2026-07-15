import { appConfig } from '../core/config/app-config';
import type { EventBus } from '../core/events/event-bus';
import { createAppEventBus } from '../core/events/event-bus';
import type { AppEventMap } from '../core/events/event-bus';
import { installErrorBoundary } from './error-boundary';

export type BootstrapOptions = {
  readonly document: Document;
  readonly rootSelector?: string;
  readonly eventBus?: EventBus<AppEventMap>;
  readonly window?: Pick<Window, 'addEventListener'>;
};

export function bootstrapApp({
  document,
  rootSelector = appConfig.defaultRootSelector,
  eventBus = createAppEventBus(),
  window,
}: BootstrapOptions): HTMLElement {
  installErrorBoundary({ document, eventBus, window });
  const app = document.querySelector<HTMLElement>(rootSelector);

  if (app === null) {
    throw new Error(`App-Container ${rootSelector} wurde nicht gefunden.`);
  }

  app.replaceChildren(createStartScreen(document));
  eventBus.emit('app:booted', { appName: appConfig.appName, version: appConfig.version });

  return app;
}

function createStartScreen(document: Document): HTMLElement {
  const main = document.createElement('main');
  main.className = 'shell';
  main.id = 'main-content';
  main.tabIndex = -1;

  const title = document.createElement('h1');
  title.textContent = appConfig.appName;

  const status = document.createElement('p');
  status.textContent = `Version ${appConfig.version} · ${appConfig.environment}`;

  main.append(title, status);

  return main;
}
