import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
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

const { eliminarCiudad } = await import("../../src/actions/removeCity.ts");

const cordoba = crearCiudad("Córdoba");
const madrid = crearCiudad("Madrid", { latitude: 40.4165, longitude: -3.70256 });
const neuquen = crearCiudad("Neuquén", {
  latitude: -38.95078,
  longitude: -68.0592,
});

let salirDeTemp!: () => void;
let espia!: ReturnType<typeof espiaConsoleLog>;

beforeAll(() => {
  salirDeTemp = entrarDirTemporal();
});

afterAll(() => {
  salirDeTemp();
});

beforeEach(() => {
  respuestaIndice = null;
  llamadasEleccion = 0;
  borrarDatos();
  espia = espiaConsoleLog();
});

afterEach(() => {
  espia.restaurar();
});

describe("eliminarCiudad", () => {
  test("con la lista vacía informa que no hay ciudades", async () => {
    const ajustes = crearAjustes();
    await eliminarCiudad(ajustes);
    expect(espia.mensajes()).toContain("No hay ciudades registradas.");
    expect(llamadasEleccion).toBe(0);
    expect(existsSync("data.json")).toBe(false);
  });

  test("cancelar la selección no elimina nada", async () => {
    const ajustes = crearAjustes([cordoba, madrid], cordoba);
    respuestaIndice = null;
    await eliminarCiudad(ajustes);
    expect(ajustes.cities).toHaveLength(2);
    expect(existsSync("data.json")).toBe(false);
  });

  test("elimina una ciudad que no es la default", async () => {
    const ajustes = crearAjustes([cordoba, madrid, neuquen], cordoba);
    respuestaIndice = 1;
    await eliminarCiudad(ajustes);
    expect(ajustes.cities).toEqual([cordoba, neuquen]);
    expect(ajustes.defaultCity).toEqual(cordoba);
    expect(espia.mensajes()).toContain("Ciudad eliminada: Madrid");
    const guardado = JSON.parse(readFileSync("data.json", "utf8"));
    expect(guardado.cities).toHaveLength(2);
  });

  test("al eliminar la default se promueve la primera restante", async () => {
    const ajustes = crearAjustes([cordoba, madrid, neuquen], cordoba);
    respuestaIndice = 0;
    await eliminarCiudad(ajustes);
    expect(ajustes.cities).toEqual([madrid, neuquen]);
    expect(ajustes.defaultCity).toEqual(madrid);
    expect(espia.mensajes()).toContain("Ciudad eliminada: Córdoba");
    expect(espia.mensajes()).toContain("Nueva ciudad default: Madrid");
  });

  test("al eliminar la única ciudad el default queda en null", async () => {
    const ajustes = crearAjustes([cordoba], cordoba);
    respuestaIndice = 0;
    await eliminarCiudad(ajustes);
    expect(ajustes.cities).toEqual([]);
    expect(ajustes.defaultCity).toBeNull();
    expect(espia.mensajes()).toContain("Ciudad eliminada: Córdoba");
    expect(espia.mensajes()).not.toContain("Nueva ciudad default");
    const guardado = JSON.parse(readFileSync("data.json", "utf8"));
    expect(guardado.defaultCity).toBeNull();
  });
});
