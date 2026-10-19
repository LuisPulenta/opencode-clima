import type { Ajustes, Ciudad, ClimaActual, ClimaDiario, Unidad } from "./tipos.ts";
import { describirClima } from "./wmo.ts";
import { enAmarillo, enCyan } from "./colores.ts";

declare const console: { log(...data: unknown[]): void };

const LINEA = "═".repeat(40);

export function simboloTemperatura(unidad: Unidad): string {
  return unidad === "imperial" ? "°F" : "°C";
}

export function simboloViento(unidad: Unidad): string {
  return unidad === "imperial" ? "mph" : "km/h";
}

export function simboloPrecipitacion(unidad: Unidad): string {
  return unidad === "imperial" ? "in" : "mm";
}

export function etiquetaCiudad(ciudad: Ciudad): string {
  const partes = [ciudad.name, ciudad.admin1, ciudad.country].filter(
    (parte): parte is string => typeof parte === "string" && parte.length > 0,
  );
  return partes.join(", ");
}

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

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-");
  if (anio === undefined || mes === undefined || dia === undefined) {
    return fecha;
  }
  return `${dia}/${mes}`;
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
