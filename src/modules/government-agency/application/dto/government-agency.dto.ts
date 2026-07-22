export class GovernmentAgencyDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly status: string,
    public readonly foundedAt?: string,
    public readonly annualBudget?: string,
  ) {}
}
