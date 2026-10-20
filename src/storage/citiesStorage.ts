import type { Ciudad } from "../types/City.ts";
import type { Ajustes } from "../types/Settings.ts";

export function mismaCiudad(a: Ciudad, b: Ciudad): boolean {
  return (
    a.latitude.toFixed(4) === b.latitude.toFixed(4) &&
    a.longitude.toFixed(4) === b.longitude.toFixed(4)
  );
}

export function contieneCiudad(ajustes: Ajustes, ciudad: Ciudad): boolean {
  return ajustes.cities.some((registrada) => mismaCiudad(registrada, ciudad));
}

export function registrarCiudad(ajustes: Ajustes, ciudad: Ciudad): boolean {
  ajustes.cities.push(ciudad);
  if (ajustes.defaultCity === null) {
    ajustes.defaultCity = ciudad;
    return true;
  }
  return false;
}

export function borrarCiudad(ajustes: Ajustes, indice: number): Ciudad | null {
  const [eliminada] = ajustes.cities.splice(indice, 1);
  if (eliminada === undefined) {
    return null;
  }
  if (
    ajustes.defaultCity !== null &&
    mismaCiudad(ajustes.defaultCity, eliminada)
  ) {
    ajustes.defaultCity = ajustes.cities[0] ?? null;
  }
  return eliminada;
}
