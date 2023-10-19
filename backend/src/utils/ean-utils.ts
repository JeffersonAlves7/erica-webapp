export class EanUtils {
  static isEan(ean: string): boolean {
    return /^\d{13}$/.test(ean);
  }
}
