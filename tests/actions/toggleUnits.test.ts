import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import {
  borrarDatos,
  crearAjustes,
  crearCiudad,
  entrarDirTemporal,
  espiaConsoleLog,
} from "../helpers.ts";

const cordoba = crearCiudad("Córdoba");

let salirDeTemp!: () => void;
let espia!: ReturnType<typeof espiaConsoleLog>;

const { alternarUnidades } = await import("../../src/actions/toggleUnits.ts");

beforeAll(() => {
  salirDeTemp = entrarDirTemporal();
});

afterAll(() => {
  salirDeTemp();
});

beforeEach(() => {
  borrarDatos();
  espia = espiaConsoleLog();
});

afterEach(() => {
  espia.restaurar();
});

describe("alternarUnidades", () => {
  test("alterna de metric a imperial y persiste", async () => {
    const ajustes = crearAjustes([cordoba], cordoba, "metric");
    await alternarUnidades(ajustes);
    expect(ajustes.unit).toBe("imperial");
    expect(espia.mensajes()).toContain("Fahrenheit, mph, in");
    expect(espia.mensajes()).toContain("°F");
    const guardado = JSON.parse(readFileSync("data.json", "utf8"));
    expect(guardado.unit).toBe("imperial");
  });

  test("alterna de imperial a metric y persiste", async () => {
    const ajustes = crearAjustes([cordoba], cordoba, "imperial");
    await alternarUnidades(ajustes);
    expect(ajustes.unit).toBe("metric");
    expect(espia.mensajes()).toContain("Celsius, km/h, mm");
    expect(espia.mensajes()).toContain("°C");
    const guardado = JSON.parse(readFileSync("data.json", "utf8"));
    expect(guardado.unit).toBe("metric");
  });

  test("se puede alternar dos veces de forma consecutiva", async () => {
    const ajustes = crearAjustes([], null, "metric");
    await alternarUnidades(ajustes);
    await alternarUnidades(ajustes);
    expect(ajustes.unit).toBe("metric");
    expect(existsSync("data.json")).toBe(true);
  });
});
