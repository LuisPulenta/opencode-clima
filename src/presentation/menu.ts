import type { Ajustes } from "../types/Settings.ts";
import { enCyan } from "../utils/colors.ts";
import { LINEA } from "../utils/constants.ts";
import { simboloTemperatura } from "../utils/format.ts";

export function construirMenu(ajustes: Ajustes): string {
  const cantidad = ajustes.cities.length;
  const unidad = simboloTemperatura(ajustes.unit);
  const linea = enCyan(LINEA);
  return [
    linea,
    enCyan("         WEATHER CLI"),
    linea,
    `  ${enCyan("1")}. Clima de ciudad default`,
    `  ${enCyan("2")}. Clima de todas las ciudades (${cantidad})`,
    `  ${enCyan("3")}. Buscar y agregar ciudad`,
    `  ${enCyan("4")}. Eliminar ciudad`,
    `  ${enCyan("5")}. Establecer ciudad default`,
    `  ${enCyan("6")}. Pronóstico 7 días`,
    `  ${enCyan("8")}. Ajustes (${unidad})`,
    `  ${enCyan("9")}. Salir`,
    linea,
    enCyan("  Selecciona una opción: "),
  ].join("\n");
}
