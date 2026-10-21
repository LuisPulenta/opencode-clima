import { describe, expect, test } from "bun:test";
import {
  etiquetaCiudad,
  formatearFecha,
  simboloPrecipitacion,
  simboloTemperatura,
  simboloViento,
} from "../src/utils/format.ts";
import { crearCiudad } from "./helpers.ts";

describe("etiquetaCiudad", () => {
  test("une nombre, región y país", () => {
    const ciudad = crearCiudad("Córdoba", {
      admin1: "Provincia de Córdoba",
      country: "Argentina",
    });
    expect(etiquetaCiudad(ciudad)).toBe(
      "Córdoba, Provincia de Córdoba, Argentina",
    );
  });

  test("omite campos ausentes o vacíos", () => {
    expect(etiquetaCiudad(crearCiudad("Madrid"))).toBe("Madrid");
    expect(
      etiquetaCiudad(crearCiudad("París", { admin1: "", country: undefined })),
    ).toBe("París");
  });
});

describe("formatearFecha", () => {
  test("convierte YYYY-MM-DD en DD/MM", () => {
    expect(formatearFecha("2026-10-20")).toBe("20/10");
    expect(formatearFecha("2026-01-05")).toBe("05/01");
  });

  test("devuelve el original si el formato no es el esperado", () => {
    expect(formatearFecha("20/10/2026")).toBe("20/10/2026");
    expect(formatearFecha("2026-10")).toBe("2026-10");
  });
});

describe("símbolos de unidad", () => {
  test("métricas", () => {
    expect(simboloTemperatura("metric")).toBe("°C");
    expect(simboloViento("metric")).toBe("km/h");
    expect(simboloPrecipitacion("metric")).toBe("mm");
  });

  test("imperiales", () => {
    expect(simboloTemperatura("imperial")).toBe("°F");
    expect(simboloViento("imperial")).toBe("mph");
    expect(simboloPrecipitacion("imperial")).toBe("in");
  });
});
