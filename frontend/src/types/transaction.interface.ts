export interface TransferenceConfirmation {
  id: number;
  sku: string;
  quantidadeEsperada: number;
  quantidadeVerificada?: number;
  localizacao?: string;
}