import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import {
  cargarAjustes,
  guardarAjustes,
} from "../src/storage/settingsStorage.ts";
import { borrarDatos, crearAjustes, crearCiudad, entrarDirTemporal } from "./helpers.ts";

const cordoba = crearCiudad("Córdoba");
const madrid = crearCiudad("Madrid", {
  latitude: 40.4165,
  longitude: -3.70256,
});

let salirDeTemp!: () => void;

beforeAll(() => {
  salirDeTemp = entrarDirTemporal();
});

afterAll(() => {
  salirDeTemp();
});

beforeEach(() => {
  borrarDatos();
});

describe("cargarAjustes", () => {
  test("sin archivo devuelve los ajustes por defecto", async () => {
    expect(await cargarAjustes()).toEqual(crearAjustes());
  });

  test("JSON corrupto devuelve los ajustes por defecto", async () => {
    writeFileSync("data.json", "{{{ esto no es json");
    expect(await cargarAjustes()).toEqual(crearAjustes());
  });

  test("normaliza unidades inválidas y ciudades no-array", async () => {
    writeFileSync(
      "data.json",
      JSON.stringify({ cities: "no soy array", unit: "celsius" }),
    );
    expect(await cargarAjustes()).toEqual(crearAjustes());
  });

  test("respeta un archivo válido", async () => {
    const ajustes = crearAjustes([madrid], madrid, "imperial");
    writeFileSync("data.json", JSON.stringify(ajustes));
    expect(await cargarAjustes()).toEqual(ajustes);
  });
});

describe("guardarAjustes", () => {
  test("el roundtrip guardar y cargar conserva todo", async () => {
    const ajustes = crearAjustes([cordoba], cordoba, "imperial");
    await guardarAjustes(ajustes);
    expect(await cargarAjustes()).toEqual(ajustes);
  });

  test("escribe JSON con formato de 2 espacios", async () => {
    const ajustes = crearAjustes([cordoba], cordoba);
    await guardarAjustes(ajustes);
    expect(readFileSync("data.json", "utf8")).toBe(
      JSON.stringify(ajustes, null, 2),
    );
  });
});
