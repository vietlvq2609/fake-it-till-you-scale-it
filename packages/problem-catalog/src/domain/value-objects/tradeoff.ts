import { ValidationError } from '../errors';

/**
 * Tradeoff value object representing a design decision with its pros and cons.
 * Immutable - all properties are required and non-empty.
 */
export interface Tradeoff {
  readonly decision: string;
  readonly advantage: string;
  readonly disadvantage: string;
}

/**
 * Creates a Tradeoff value object.
 * @throws ValidationError if any field is empty or whitespace-only
 */
export function createTradeoff(
  decision: string,
  advantage: string,
  disadvantage: string
): Tradeoff {
  const trimmedDecision = decision.trim();
  const trimmedAdvantage = advantage.trim();
  const trimmedDisadvantage = disadvantage.trim();

  if (!trimmedDecision) {
    throw new ValidationError('Tradeoff decision cannot be empty');
  }
  if (!trimmedAdvantage) {
    throw new ValidationError('Tradeoff advantage cannot be empty');
  }
  if (!trimmedDisadvantage) {
    throw new ValidationError('Tradeoff disadvantage cannot be empty');
  }

  return {
    decision: trimmedDecision,
    advantage: trimmedAdvantage,
    disadvantage: trimmedDisadvantage,
  };
}

/**
 * Checks if two Tradeoffs are equal (value equality).
 */
export function tradeoffEquals(a: Tradeoff, b: Tradeoff): boolean {
  return (
    a.decision === b.decision &&
    a.advantage === b.advantage &&
    a.disadvantage === b.disadvantage
  );
}