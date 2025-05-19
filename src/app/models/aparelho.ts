import { Ambiente } from './ambiente';
import { Estado } from './estado';
import { Bandeira } from './bandeira';

export interface Aparelho {
  id: number;
  nome: string;
  potencia_watts: number;
  tempo_uso_diario_horas: number;
  quantidade: number;
  data_cadastro: string; // ISO date string, ex: "2025-05-17"
  ambiente: Ambiente;
  estado: Estado;
  bandeira: Bandeira;
}
