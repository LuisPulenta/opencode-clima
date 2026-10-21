import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import { crearAjustes, crearCiudad, espiaConsoleLog } from "../helpers.ts";

let respuestaIndice: number | null = null;
let llamadasEleccion = 0;

mock.module("../../src/presentation/input.ts", () => ({
  preguntar: async () => "",
  elegirIndice: async () => {
    llamadasEleccion++;
    return respuestaIndice;
  },
  pausar: async () => {},
  cerrarEntrada: () => {},
}));

const { listarCiudades } = await import("../../src/actions/listCities.ts");

const cordoba = crearCiudad("Córdoba");
const madrid = crearCiudad("Madrid", { latitude: 40.4165, longitude: -3.70256 });
const neuquen = crearCiudad("Neuquén", {
  latitude: -38.95078,
  longitude: -68.0592,
});

let espia!: ReturnType<typeof espiaConsoleLog>;

beforeEach(() => {
  respuestaIndice = null;
  llamadasEleccion = 0;
  espia = espiaConsoleLog();
});

afterEach(() => {
  espia.restaurar();
});

describe("listarCiudades", () => {
  test("con la lista vacía devuelve null y no pregunta", async () => {
    const resultado = await listarCiudades(crearAjustes());
    expect(resultado).toBeNull();
    expect(espia.mensajes()).toContain("No hay ciudades registradas.");
    expect(llamadasEleccion).toBe(0);
  });

  test("lista numerada con la marca (default) en la correcta", async () => {
    const ajustes = crearAjustes([cordoba, madrid, neuquen], neuquen);
    respuestaIndice = 1;
    const resultado = await listarCiudades(ajustes);
    expect(resultado).toBe(1);
    expect(espia.lineas()).toEqual([
      "",
      "  1. Córdoba",
      "  2. Madrid",
      "  3. Neuquén (default)",
    ]);
    expect(llamadasEleccion).toBe(1);
  });

  test("sin default no muestra ninguna marca", async () => {
    const ajustes = crearAjustes([cordoba, madrid]);
    respuestaIndice = null;
    const resultado = await listarCiudades(ajustes);
    expect(resultado).toBeNull();
    expect(espia.mensajes()).not.toContain("(default)");
  });
});
