export interface Ciudad {
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
}

export type Unidad = "metric" | "imperial";

export interface Ajustes {
  defaultCity: Ciudad | null;
  cities: Ciudad[];
  unit: Unidad;
}

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

export interface ClimaActual {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface ClimaDiario {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
}

export interface RespuestaClima {
  current?: ClimaActual;
  daily?: ClimaDiario;
}
