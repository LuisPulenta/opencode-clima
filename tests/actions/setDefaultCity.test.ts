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

const { establecerCiudadDefault } = await import(
  "../../src/actions/setDefaultCity.ts"
);

const cordoba = crearCiudad("Córdoba");
const madrid = crearCiudad("Madrid", { latitude: 40.4165, longitude: -3.70256 });

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

describe("establecerCiudadDefault", () => {
  test("con la lista vacía informa que no hay ciudades", async () => {
    const ajustes = crearAjustes();
    await establecerCiudadDefault(ajustes);
    expect(espia.mensajes()).toContain("No hay ciudades registradas.");
    expect(llamadasEleccion).toBe(0);
    expect(existsSync("data.json")).toBe(false);
  });

  test("cancelar la selección no cambia nada", async () => {
    const ajustes = crearAjustes([cordoba, madrid], cordoba);
    respuestaIndice = null;
    await establecerCiudadDefault(ajustes);
    expect(ajustes.defaultCity).toEqual(cordoba);
    expect(existsSync("data.json")).toBe(false);
  });

  test("cambia la default y lo persiste", async () => {
    const ajustes = crearAjustes([cordoba, madrid], cordoba);
    respuestaIndice = 1;
    await establecerCiudadDefault(ajustes);
    expect(ajustes.defaultCity).toEqual(madrid);
    expect(espia.mensajes()).toContain("Ciudad default: Madrid");
    const guardado = JSON.parse(readFileSync("data.json", "utf8"));
    expect(guardado.defaultCity).toEqual(madrid);
  });
});
