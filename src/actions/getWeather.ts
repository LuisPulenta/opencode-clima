import type { Ajustes } from "../types/Settings.ts";
import { obtenerClimaActual } from "../api/weather.ts";
import { mostrarClimaActual, mostrarError } from "../presentation/output.ts";

export async function mostrarClimaDefault(ajustes: Ajustes): Promise<void> {
  if (ajustes.defaultCity === null) {
    mostrarError("\n  No hay una ciudad default establecida.");
    return;
  }
  const datos = await obtenerClimaActual(ajustes.defaultCity, ajustes.unit);
  if (datos.current === undefined) {
    mostrarError("\n  No se pudo obtener el clima actual.");
    return;
  }
  mostrarClimaActual(ajustes.defaultCity, datos.current, ajustes.unit);
}

export async function mostrarClimaTodasLasCiudades(
  ajustes: Ajustes,
): Promise<void> {
  if (ajustes.cities.length === 0) {
    mostrarError("\n  No hay ciudades registradas.");
    return;
  }
  for (const ciudad of ajustes.cities) {
    const datos = await obtenerClimaActual(ciudad, ajustes.unit);
    if (datos.current !== undefined) {
      mostrarClimaActual(ciudad, datos.current, ajustes.unit);
    }
  }
}
