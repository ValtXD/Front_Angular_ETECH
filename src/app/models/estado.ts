export interface Estado {
  id: number;
  nome: string;
  tarifa: {
    valor_kwh: number;
  };
}
