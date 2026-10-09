import { ValidationError } from '../errors';

export interface TradeoffProps {
  decision: string;
  advantage: string;
  disadvantage: string;
}

export class Tradeoff {
  readonly decision: string;
  readonly advantage: string;
  readonly disadvantage: string;

  private constructor(props: TradeoffProps) {
    this.decision = props.decision;
    this.advantage = props.advantage;
    this.disadvantage = props.disadvantage;
  }

  static create(decision: string, advantage: string, disadvantage: string): Tradeoff {
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

    return new Tradeoff({
      decision: trimmedDecision,
      advantage: trimmedAdvantage,
      disadvantage: trimmedDisadvantage,
    });
  }

  equals(other: Tradeoff): boolean {
    return (
      this.decision === other.decision &&
      this.advantage === other.advantage &&
      this.disadvantage === other.disadvantage
    );
  }
}