import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ECONOMY_STATE,
  ECONOMY_STATE_SCHEMA_VERSION,
  createDefaultEconomyState,
} from '../../src/game/economy/economy-state';

describe('economy state schema', () => {
  it('definiert integerbasierte Startwerte mit Schemaversion', () => {
    expect(DEFAULT_ECONOMY_STATE).toEqual({
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
    });
  });

  it('nutzt ganze Zahlen für Geldwerte und Zinssätze', () => {
    const moneyValues = [
      DEFAULT_ECONOMY_STATE.cash,
      DEFAULT_ECONOMY_STATE.savings,
      DEFAULT_ECONOMY_STATE.debt,
      DEFAULT_ECONOMY_STATE.fixedCosts,
      DEFAULT_ECONOMY_STATE.upkeep,
      DEFAULT_ECONOMY_STATE.monthlyWage,
      DEFAULT_ECONOMY_STATE.ledger.earned,
      DEFAULT_ECONOMY_STATE.ledger.spent,
    ];

    expect(moneyValues.every(Number.isInteger)).toBe(true);
    expect(Number.isInteger(DEFAULT_ECONOMY_STATE.savingsInterestRateBasisPoints)).toBe(true);
    expect(Number.isInteger(DEFAULT_ECONOMY_STATE.debtInterestRateBasisPoints)).toBe(true);
  });

  it('erzeugt unabhängige Wirtschaftszustände für neue Spielstände', () => {
    const firstEconomy = createDefaultEconomyState();
    const secondEconomy = createDefaultEconomyState();

    expect(firstEconomy).toEqual(secondEconomy);
    expect(firstEconomy).not.toBe(secondEconomy);
    expect(firstEconomy.ledger).not.toBe(secondEconomy.ledger);
  });
});
