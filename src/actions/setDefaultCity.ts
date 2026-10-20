import type { Ajustes } from "../types/Settings.ts";
import { listarCiudades } from "./listCities.ts";
import { mostrarExito } from "../presentation/output.ts";
import { guardarAjustes } from "../storage/settingsStorage.ts";
import { etiquetaCiudad } from "../utils/format.ts";

export async function establecerCiudadDefault(
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
  ajustes.defaultCity = ciudad;
  await guardarAjustes(ajustes);
  mostrarExito(`  Ciudad default: ${etiquetaCiudad(ciudad)}.`);
}
