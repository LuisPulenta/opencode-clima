import type { Ajustes } from "../types/Settings.ts";
import { listarCiudades } from "./listCities.ts";
import { mostrarExito } from "../presentation/output.ts";
import { borrarCiudad } from "../storage/citiesStorage.ts";
import { guardarAjustes } from "../storage/settingsStorage.ts";
import { etiquetaCiudad } from "../utils/format.ts";

export async function eliminarCiudad(ajustes: Ajustes): Promise<void> {
  const indice = await listarCiudades(ajustes);
  if (indice === null) {
    return;
  }
  const eliminada = borrarCiudad(ajustes, indice);
  if (eliminada === null) {
    return;
  }
  await guardarAjustes(ajustes);
  mostrarExito(`  Ciudad eliminada: ${etiquetaCiudad(eliminada)}.`);
  if (ajustes.defaultCity !== null) {
    mostrarExito(
      `  Nueva ciudad default: ${etiquetaCiudad(ajustes.defaultCity)}.`,
    );
  }
}
