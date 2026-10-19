import type { Ajustes } from "./tipos.ts";

const ARCHIVO_DATOS = "data.json";

const AJUSTES_POR_DEFECTO: Ajustes = {
  defaultCity: null,
  cities: [],
  unit: "metric",
};

export async function cargarAjustes(): Promise<Ajustes> {
  const archivo = Bun.file(ARCHIVO_DATOS);
  if (!(await archivo.exists())) {
    return { ...AJUSTES_POR_DEFECTO, cities: [] };
  }
  try {
    const datos = (await archivo.json()) as Partial<Ajustes>;
    return {
      defaultCity: datos.defaultCity ?? null,
      cities: Array.isArray(datos.cities) ? datos.cities : [],
      unit: datos.unit === "imperial" ? "imperial" : "metric",
    };
  } catch {
    return { ...AJUSTES_POR_DEFECTO, cities: [] };
  }
}

export async function guardarAjustes(ajustes: Ajustes): Promise<void> {
  await Bun.write(ARCHIVO_DATOS, JSON.stringify(ajustes, null, 2));
}
