import { Importer } from "src/types/importer.enum";

export function getImporterId(importer: string): Importer {
  switch (importer.toLowerCase().trim().replace(/\s/g, '')) {
    case 'attus':
      return Importer.ATTUS;
    case 'attusbloom':
      return Importer.ATTUS_BLOOM;
    case 'attus_bloom':
      return Importer.ATTUS_BLOOM;
    case 'alphaynfinity':
      return Importer.ALPHA_YNFINITY;
    case 'alpha_ynfinity':
      return Importer.ALPHA_YNFINITY;
  }
  throw new Error('Importadora não encontrada');
}
