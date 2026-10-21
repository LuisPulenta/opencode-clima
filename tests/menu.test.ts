import { describe, expect, test } from "bun:test";
import { construirMenu } from "../src/presentation/menu.ts";
import { crearAjustes, crearCiudad } from "./helpers.ts";

describe("construirMenu", () => {
  test("muestra el banner y todas las opciones del README", () => {
    const salida = construirMenu(
      crearAjustes([crearCiudad("A"), crearCiudad("B"), crearCiudad("C")]),
    );
    expect(salida).toContain("WEATHER CLI");
    expect(salida).toContain("═".repeat(40));
    expect(salida).toContain(". Clima de ciudad default");
    expect(salida).toContain(". Clima de todas las ciudades (3)");
    expect(salida).toContain(". Buscar y agregar ciudad");
    expect(salida).toContain(". Eliminar ciudad");
    expect(salida).toContain(". Establecer ciudad default");
    expect(salida).toContain(". Pronóstico 7 días");
    expect(salida).toContain(". Ajustes (°C)");
    expect(salida).toContain(". Salir");
    expect(salida).toContain("Selecciona una opción:");
    expect(salida).not.toContain("7.");
  });

  test("muestra °F cuando las unidades son imperiales", () => {
    const salida = construirMenu(crearAjustes([], null, "imperial"));
    expect(salida).toContain(". Ajustes (°F)");
  });

  test("el contador de ciudades empieza en 0", () => {
    expect(construirMenu(crearAjustes())).toContain("(0)");
  });
});
