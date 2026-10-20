import type { Ajustes } from "../types/Settings.ts";
import { mostrarExito } from "../presentation/output.ts";
import { guardarAjustes } from "../storage/settingsStorage.ts";
import { simboloTemperatura } from "../utils/format.ts";

export async function alternarUnidades(ajustes: Ajustes): Promise<void> {
  ajustes.unit = ajustes.unit === "metric" ? "imperial" : "metric";
  await guardarAjustes(ajustes);
  const detalle =
    ajustes.unit === "metric"
      ? "Celsius, km/h, mm"
      : "Fahrenheit, mph, in";
  mostrarExito(
    `\n  Unidades cambiadas a ${detalle} (${simboloTemperatura(ajustes.unit)}).`,
  );
}
