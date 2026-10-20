import type { Ajustes } from "../types/Settings.ts";
import { buscarCiudades } from "../api/geocoding.ts";
import { elegirIndice, preguntar } from "../presentation/input.ts";
import {
  mostrarAviso,
  mostrarError,
  mostrarExito,
  mostrarListado,
} from "../presentation/output.ts";
import { contieneCiudad, registrarCiudad } from "../storage/citiesStorage.ts";
import { guardarAjustes } from "../storage/settingsStorage.ts";
import { etiquetaCiudad } from "../utils/format.ts";

export async function agregarCiudad(ajustes: Ajustes): Promise<void> {
  const consulta = await preguntar("\n  Nombre de la ciudad: ");
  if (consulta === "") {
    mostrarAviso("  Búsqueda cancelada.");
    return;
  }
  const resultados = await buscarCiudades(consulta);
  if (resultados.length === 0) {
    mostrarError(`  No se encontraron ciudades para "${consulta}".`);
    return;
  }
  mostrarListado(resultados.map((ciudad) => etiquetaCiudad(ciudad)));
  const seleccion = await elegirIndice(resultados.length);
  if (seleccion === null) {
    return;
  }
  const ciudad = resultados[seleccion];
  if (ciudad === undefined) {
    return;
  }
  if (contieneCiudad(ajustes, ciudad)) {
    mostrarError(`  ${etiquetaCiudad(ciudad)} ya está registrada.`);
    return;
  }
  const esNuevoDefault = registrarCiudad(ajustes, ciudad);
  if (esNuevoDefault) {
    mostrarExito(
      `  Ciudad agregada: ${etiquetaCiudad(ciudad)} (establecida como default).`,
    );
  } else {
    mostrarExito(`  Ciudad agregada: ${etiquetaCiudad(ciudad)}.`);
  }
  await guardarAjustes(ajustes);
}
