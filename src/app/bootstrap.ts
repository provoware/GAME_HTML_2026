export type BootstrapOptions = {
  readonly document: Document;
  readonly rootSelector?: string;
};

const DEFAULT_ROOT_SELECTOR = '#app';

export function bootstrapApp({
  document,
  rootSelector = DEFAULT_ROOT_SELECTOR,
}: BootstrapOptions): HTMLElement {
  const app = document.querySelector<HTMLElement>(rootSelector);

  if (app === null) {
    throw new Error(`App-Container ${rootSelector} wurde nicht gefunden.`);
  }

  app.replaceChildren(createStartScreen(document));

  return app;
}

function createStartScreen(document: Document): HTMLElement {
  const main = document.createElement('main');
  main.className = 'shell';
  main.id = 'main-content';
  main.tabIndex = -1;

  const title = document.createElement('h1');
  title.textContent = 'PPPoppi 1986 — Euronen, Ehre, Untergrund';

  main.append(title);

  return main;
}
