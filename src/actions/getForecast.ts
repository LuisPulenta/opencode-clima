import type { Ajustes } from "../types/Settings.ts";
import { obtenerPronostico } from "../api/weather.ts";
import {
  mostrarError,
  mostrarPronostico,
} from "../presentation/output.ts";
import { listarCiudades } from "./listCities.ts";

export async function mostrarPronosticoCiudad(
  ajustes: Ajustes,
): Promise<void> {
  const indice = await listarCiudades(ajustes);
  if (indice === null) {
    return;
  }
  const ciudad = ajustes.cities[indice];
  if (ciudad === undefined) {
    return;
  }
  const datos = await obtenerPronostico(ciudad, ajustes.unit);
  if (datos.daily === undefined) {
    mostrarError("\n  No se pudo obtener el pronóstico.");
    return;
  }
  mostrarPronostico(ciudad, datos.daily, ajustes.unit);
}
