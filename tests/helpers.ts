import { existsSync, mkdtempSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Ciudad } from "../src/types/City.ts";
import type { Ajustes, Unidad } from "../src/types/Settings.ts";
import type { ClimaActual, ClimaDiario } from "../src/types/Weather.ts";

export function crearCiudad(name: string, extras: Partial<Ciudad> = {}): Ciudad {
  return { name, latitude: -31.40648, longitude: -64.18853, ...extras };
}

export function crearAjustes(
  ciudades: Ciudad[] = [],
  defaultCity: Ciudad | null = null,
  unit: Unidad = "metric",
): Ajustes {
  return { cities: ciudades, defaultCity, unit };
}

export const climaActual: ClimaActual = {
  temperature_2m: 18.5,
  apparent_temperature: 16.8,
  relative_humidity_2m: 59,
  weather_code: 3,
  wind_speed_10m: 11.9,
};

export const climaDiario: ClimaDiario = {
  time: ["2026-10-20", "2026-10-21"],
  weather_code: [0, 61],
  temperature_2m_max: [25.4, 22.1],
  temperature_2m_min: [12.3, 11.8],
  precipitation_sum: [0, 4.2],
};

export function espiaConsoleLog() {
  const lineas: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => {
    lineas.push(args.map(String).join(" "));
  };
  return {
    lineas: () => [...lineas],
    mensajes: () => lineas.join("\n"),
    restaurar: () => {
      console.log = original;
    },
  };
}

export function entrarDirTemporal(): () => void {
  const original = process.cwd();
  const dir = mkdtempSync(join(tmpdir(), "weather-test-"));
  process.chdir(dir);
  return () => {
    process.chdir(original);
    rmSync(dir, { recursive: true, force: true });
  };
}

export function borrarDatos(): void {
  if (existsSync("data.json")) {
    unlinkSync("data.json");
  }
}
