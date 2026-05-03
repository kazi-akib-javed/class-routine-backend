export class NatSciWeekNotFoundException extends Error {
  readonly cw: number;

  constructor(cw: number) {
    super(`NatSci schedule for CW${cw} not found.`);
    this.name = 'NatSciWeekNotFoundException';
    this.cw = cw;
    Object.setPrototypeOf(this, NatSciWeekNotFoundException.prototype);
  }
}
