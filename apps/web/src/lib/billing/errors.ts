export class BillingError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "BillingError";
    this.code = code;
  }
}
