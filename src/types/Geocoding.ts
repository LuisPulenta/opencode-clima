export interface ResultadoGeocoding {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

export interface RespuestaGeocoding {
  results?: ResultadoGeocoding[];
}
