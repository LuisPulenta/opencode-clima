import type {
  Ciudad,
  RespuestaClima,
  RespuestaGeocoding,
  ResultadoGeocoding,
  Unidad,
} from "./tipos.ts";

const URL_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";
const URL_CLIMA = "https://api.open-meteo.com/v1/forecast";

async function pedirJson<T>(url: URL): Promise<T> {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`La API respondió con estado ${respuesta.status}`);
  }
  return (await respuesta.json()) as T;
}

export async function buscarCiudades(consulta: string): Promise<Ciudad[]> {
  const url = new URL(URL_GEOCODING);
  url.searchParams.set("name", consulta);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const datos = await pedirJson<RespuestaGeocoding>(url);
  return (datos.results ?? []).map((resultado: ResultadoGeocoding) => ({
    name: resultado.name,
    admin1: resultado.admin1,
    country: resultado.country,
    country_code: resultado.country_code,
    latitude: resultado.latitude,
    longitude: resultado.longitude,
  }));
}

function aplicarUnidades(url: URL, unidad: Unidad): void {
  if (unidad === "imperial") {
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("precipitation_unit", "inch");
  }
}

export async function obtenerClimaActual(
  ciudad: Ciudad,
  unidad: Unidad,
): Promise<RespuestaClima> {
  const url = new URL(URL_CLIMA);
  url.searchParams.set("latitude", String(ciudad.latitude));
  url.searchParams.set("longitude", String(ciudad.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
  );
  url.searchParams.set("timezone", "auto");
  aplicarUnidades(url, unidad);
  return pedirJson<RespuestaClima>(url);
}

export async function obtenerPronostico(
  ciudad: Ciudad,
  unidad: Unidad,
): Promise<RespuestaClima> {
  const url = new URL(URL_CLIMA);
  url.searchParams.set("latitude", String(ciudad.latitude));
  url.searchParams.set("longitude", String(ciudad.longitude));
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");
  aplicarUnidades(url, unidad);
  return pedirJson<RespuestaClima>(url);
}
