import { describe, expect, test } from "bun:test";
import { enAmarillo, enCyan, enRojo, enVerde } from "../src/utils/colors.ts";

const activosEnCarga =
  process.env["NO_COLOR"] === undefined && process.stdout.isTTY !== false;

describe("colores ANSI", () => {
  test("siempre conservan el texto original", () => {
    expect(enCyan("hola")).toContain("hola");
    expect(enRojo("fallo")).toContain("fallo");
    expect(enVerde("ok")).toContain("ok");
    expect(enAmarillo("20.5")).toContain("20.5");
  });

  test("respetan el entorno capturado al cargar el módulo", () => {
    const esperado = activosEnCarga ? "\x1b[36mhola\x1b[0m" : "hola";
    expect(enCyan("hola")).toBe(esperado);
  });

  test("con NO_COLOR un módulo recién cargado pinta texto plano", async () => {
    process.env["NO_COLOR"] = "1";
    try {
      const ruta = "../src/utils/colors.ts?sin-color";
      const colores = (await import(ruta)) as typeof import("../src/utils/colors.ts");
      expect(colores.enCyan("hola")).toBe("hola");
      expect(colores.enRojo("fallo")).toBe("fallo");
      expect(colores.enVerde("ok")).toBe("ok");
      expect(colores.enAmarillo("20.5")).toBe("20.5");
    } finally {
      delete process.env["NO_COLOR"];
    }
  });
});
