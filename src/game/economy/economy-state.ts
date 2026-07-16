export const ECONOMY_STATE_SCHEMA_VERSION = 1;

export type MoneyAmount = number;

export type EconomyLedgerTotals = {
  readonly earned: MoneyAmount;
  readonly spent: MoneyAmount;
};

export type EconomyState = {
  readonly schemaVersion: typeof ECONOMY_STATE_SCHEMA_VERSION;
  readonly cash: MoneyAmount;
  readonly savings: MoneyAmount;
  readonly debt: MoneyAmount;
  readonly fixedCosts: MoneyAmount;
  readonly upkeep: MoneyAmount;
  readonly monthlyWage: MoneyAmount;
  readonly savingsInterestRateBasisPoints: number;
  readonly debtInterestRateBasisPoints: number;
  readonly ledger: EconomyLedgerTotals;
};

export const DEFAULT_ECONOMY_STATE: EconomyState = {
  schemaVersion: ECONOMY_STATE_SCHEMA_VERSION,
  cash: 120,
  savings: 0,
  debt: 0,
  fixedCosts: 35,
  upkeep: 20,
  monthlyWage: 90,
  savingsInterestRateBasisPoints: 25,
  debtInterestRateBasisPoints: 300,
  ledger: {
    earned: 0,
    spent: 0,
  },
};

export function createDefaultEconomyState(): EconomyState {
  return {
    ...DEFAULT_ECONOMY_STATE,
    ledger: { ...DEFAULT_ECONOMY_STATE.ledger },
  };
}
