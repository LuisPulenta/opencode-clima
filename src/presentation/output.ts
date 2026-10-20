import type { Ciudad } from "../types/City.ts";
import type { Unidad } from "../types/Settings.ts";
import type { ClimaActual, ClimaDiario } from "../types/Weather.ts";
import { enAmarillo, enRojo, enVerde } from "../utils/colors.ts";
import {
  etiquetaCiudad,
  formatearFecha,
  simboloPrecipitacion,
  simboloTemperatura,
  simboloViento,
} from "../utils/format.ts";
import { describirClima } from "../utils/wmo.ts";

declare const console: { log(...data: unknown[]): void };

export function mostrarError(mensaje: string): void {
  console.log(enRojo(mensaje));
}

export function mostrarExito(mensaje: string): void {
  console.log(enVerde(mensaje));
}

export function mostrarAviso(mensaje: string): void {
  console.log(mensaje);
}

export function mostrarListado(items: string[]): void {
  console.log("");
  items.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item}`);
  });
}

export function mostrarClimaActual(
  ciudad: Ciudad,
  actual: ClimaActual,
  unidad: Unidad,
): void {
  const etiquetaTemp = simboloTemperatura(unidad);
  const etiquetaViento = simboloViento(unidad);
  console.log(`\n  Clima en ${etiquetaCiudad(ciudad)}`);
  console.log(`  ${"─".repeat(38)}`);
  console.log(
    `  Temperatura:  ${enAmarillo(`${actual.temperature_2m.toFixed(1)} ${etiquetaTemp}`)}`,
  );
  console.log(
    `  Sensación:    ${enAmarillo(`${actual.apparent_temperature.toFixed(1)} ${etiquetaTemp}`)}`,
  );
  console.log(`  Condición:    ${describirClima(actual.weather_code)}`);
  console.log(`  Viento:       ${actual.wind_speed_10m.toFixed(1)} ${etiquetaViento}`);
  console.log(`  Humedad:      ${actual.relative_humidity_2m} %`);
}

export function mostrarPronostico(
  ciudad: Ciudad,
  diario: ClimaDiario,
  unidad: Unidad,
): void {
  const etiquetaTemp = simboloTemperatura(unidad);
  const etiquetaPrecip = simboloPrecipitacion(unidad);
  console.log(`\n  Pronóstico 7 días — ${etiquetaCiudad(ciudad)}`);
  console.log(`  ${"─".repeat(38)}`);
  console.log(`  Fecha    Mín       Máx       Precip.    Condición`);

  for (let i = 0; i < diario.time.length; i++) {
    const fecha = diario.time[i];
    const minima = diario.temperature_2m_min[i];
    const maxima = diario.temperature_2m_max[i];
    const codigo = diario.weather_code[i];
    const precipitacion = diario.precipitation_sum[i];
    if (
      fecha === undefined ||
      minima === undefined ||
      maxima === undefined ||
      codigo === undefined
    ) {
      continue;
    }
    const fechaCorta = formatearFecha(fecha);
    const textoMin = `${minima.toFixed(1)} ${etiquetaTemp}`.padEnd(9);
    const textoMax = `${maxima.toFixed(1)} ${etiquetaTemp}`.padEnd(9);
    const textoPrecip = (
      precipitacion === undefined
        ? "-"
        : `${precipitacion.toFixed(1)} ${etiquetaPrecip}`
    ).padEnd(10);
    console.log(
      `  ${fechaCorta.padEnd(8)} ${enAmarillo(textoMin)} ${enAmarillo(textoMax)} ${textoPrecip} ${describirClima(codigo)}`,
    );
  }
}
