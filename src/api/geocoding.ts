import type { Ciudad } from "../types/City.ts";
import type {
  RespuestaGeocoding,
  ResultadoGeocoding,
} from "../types/Geocoding.ts";
import { URL_GEOCODING } from "../utils/constants.ts";
import { pedirJson } from "./http.ts";

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
