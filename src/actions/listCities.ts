import type { Ajustes } from "../types/Settings.ts";
import { elegirIndice } from "../presentation/input.ts";
import { mostrarError, mostrarListado } from "../presentation/output.ts";
import { mismaCiudad } from "../storage/citiesStorage.ts";
import { etiquetaCiudad } from "../utils/format.ts";

export async function listarCiudades(ajustes: Ajustes): Promise<number | null> {
  if (ajustes.cities.length === 0) {
    mostrarError("\n  No hay ciudades registradas.");
    return null;
  }
  mostrarListado(
    ajustes.cities.map((ciudad) => {
      const esDefault =
        ajustes.defaultCity !== null && mismaCiudad(ciudad, ajustes.defaultCity);
      return `${etiquetaCiudad(ciudad)}${esDefault ? " (default)" : ""}`;
    }),
  );
  return elegirIndice(ajustes.cities.length);
}
