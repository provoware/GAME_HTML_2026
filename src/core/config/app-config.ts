export type AppEnvironment = 'development' | 'production' | 'test';

export type AppConfig = {
  readonly appName: string;
  readonly version: string;
  readonly environment: AppEnvironment;
  readonly defaultRootSelector: string;
  readonly diagnosticsEnabled: boolean;
};

const APP_NAME = 'PPPoppi 1986 — Euronen, Ehre, Untergrund';
const APP_VERSION = '0.0.0';
const DEFAULT_ROOT_SELECTOR = '#app';

export const appConfig: AppConfig = Object.freeze({
  appName: APP_NAME,
  version: APP_VERSION,
  environment: readEnvironment(import.meta.env.MODE),
  defaultRootSelector: DEFAULT_ROOT_SELECTOR,
  diagnosticsEnabled: import.meta.env.DEV,
});

function readEnvironment(mode: string): AppEnvironment {
  if (mode === 'production' || mode === 'test') {
    return mode;
  }

  return 'development';
}
