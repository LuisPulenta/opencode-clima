import type { Ciudad } from "../types/City.ts";
import type { Unidad } from "../types/Settings.ts";
import type { RespuestaClima } from "../types/Weather.ts";
import { URL_CLIMA } from "../utils/constants.ts";
import { pedirJson } from "./http.ts";

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
