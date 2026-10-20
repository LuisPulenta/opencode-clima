import type { Ciudad } from "../types/City.ts";
import type { Unidad } from "../types/Settings.ts";

export function simboloTemperatura(unidad: Unidad): string {
  return unidad === "imperial" ? "°F" : "°C";
}

export function simboloViento(unidad: Unidad): string {
  return unidad === "imperial" ? "mph" : "km/h";
}

export function simboloPrecipitacion(unidad: Unidad): string {
  return unidad === "imperial" ? "in" : "mm";
}

export function etiquetaCiudad(ciudad: Ciudad): string {
  const partes = [ciudad.name, ciudad.admin1, ciudad.country].filter(
    (parte): parte is string => typeof parte === "string" && parte.length > 0,
  );
  return partes.join(", ");
}

export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-");
  if (anio === undefined || mes === undefined || dia === undefined) {
    return fecha;
  }
  return `${dia}/${mes}`;
}
