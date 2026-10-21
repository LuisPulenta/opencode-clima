import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  mostrarAviso,
  mostrarClimaActual,
  mostrarError,
  mostrarExito,
  mostrarListado,
  mostrarPronostico,
} from "../src/presentation/output.ts";
import {
  climaActual,
  climaDiario,
  crearCiudad,
  espiaConsoleLog,
} from "./helpers.ts";

let espia!: ReturnType<typeof espiaConsoleLog>;

beforeEach(() => {
  espia = espiaConsoleLog();
});

afterEach(() => {
  espia.restaurar();
});

describe("mensajes de usuario", () => {
  test("mostrarError escribe el mensaje", () => {
    mostrarError("\n  Opción no válida.");
    expect(espia.mensajes()).toContain("Opción no válida.");
  });

  test("mostrarExito escribe el mensaje", () => {
    mostrarExito("  Ciudad agregada: Madrid.");
    expect(espia.mensajes()).toContain("Ciudad agregada: Madrid.");
  });

  test("mostrarAviso escribe texto plano", () => {
    mostrarAviso("  Búsqueda cancelada.");
    expect(espia.lineas()).toEqual(["  Búsqueda cancelada."]);
  });
});

describe("mostrarListado", () => {
  test("numeración desde 1 con una línea vacía inicial", () => {
    mostrarListado(["Córdoba", "Madrid"]);
    expect(espia.lineas()).toEqual(["", "  1. Córdoba", "  2. Madrid"]);
  });
});

describe("mostrarClimaActual", () => {
  const cordoba = crearCiudad("Córdoba", {
    admin1: "Provincia de Córdoba",
    country: "Argentina",
  });

  test("muestra la tabla en unidades métricas", () => {
    mostrarClimaActual(cordoba, climaActual, "metric");
    const texto = espia.mensajes();
    expect(texto).toContain("Clima en Córdoba, Provincia de Córdoba, Argentina");
    expect(texto).toContain("Temperatura:");
    expect(texto).toContain("18.5 °C");
    expect(texto).toContain("Sensación:");
    expect(texto).toContain("16.8 °C");
    expect(texto).toContain("Condición:    Nublado");
    expect(texto).toContain("Viento:       11.9 km/h");
    expect(texto).toContain("Humedad:      59 %");
  });

  test("usa °F y mph en imperiales", () => {
    mostrarClimaActual(
      cordoba,
      { ...climaActual, temperature_2m: 95, wind_speed_10m: 42.5 },
      "imperial",
    );
    const texto = espia.mensajes();
    expect(texto).toContain("95.0 °F");
    expect(texto).toContain("42.5 mph");
  });
});

describe("mostrarPronostico", () => {
  const cordoba = crearCiudad("Córdoba", {
    admin1: "Provincia de Córdoba",
    country: "Argentina",
  });

  test("muestra fechas, temperaturas y condiciones", () => {
    mostrarPronostico(cordoba, climaDiario, "metric");
    const texto = espia.mensajes();
    expect(texto).toContain(
      "Pronóstico 7 días — Córdoba, Provincia de Córdoba, Argentina",
    );
    expect(texto).toContain("Fecha    Mín       Máx       Precip.    Condición");
    expect(texto).toContain("20/10");
    expect(texto).toContain("21/10");
    expect(texto).toContain("12.3 °C");
    expect(texto).toContain("25.4 °C");
    expect(texto).toContain("0.0 mm");
    expect(texto).toContain("4.2 mm");
    expect(texto).toContain("Cielo despejado");
    expect(texto).toContain("Lluvia ligera");
  });

  test("usa °F e in en imperiales", () => {
    mostrarPronostico(cordoba, climaDiario, "imperial");
    const texto = espia.mensajes();
    expect(texto).toContain("12.3 °F");
    expect(texto).toContain("0.0 in");
  });

  test("sin precipitación muestra un guion", () => {
    mostrarPronostico(cordoba, { ...climaDiario, precipitation_sum: [] }, "metric");
    expect(espia.mensajes()).toContain(" - ");
  });
});
