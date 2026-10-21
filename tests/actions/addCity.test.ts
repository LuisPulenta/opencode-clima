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

let respuestaPregunta = "";
let respuestaIndice: number | null = null;
let respuestas: unknown[] = [];
let indiceRespuesta = 0;
let urlsFetch: URL[] = [];

mock.module("../../src/presentation/input.ts", () => ({
  preguntar: async () => respuestaPregunta,
  elegirIndice: async () => respuestaIndice,
  pausar: async () => {},
  cerrarEntrada: () => {},
}));

const { agregarCiudad } = await import("../../src/actions/addCity.ts");

const cordoba = crearCiudad("Córdoba", {
  admin1: "Provincia de Córdoba",
  country: "Argentina",
});
const madrid = crearCiudad("Madrid", {
  latitude: 40.4165,
  longitude: -3.70256,
  admin1: "Comunidad Autónoma de Madrid",
  country: "España",
});

const fetchOriginal = globalThis.fetch;
let salirDeTemp!: () => void;
let espia!: ReturnType<typeof espiaConsoleLog>;

beforeAll(() => {
  salirDeTemp = entrarDirTemporal();
});

afterAll(() => {
  salirDeTemp();
});

beforeEach(() => {
  respuestaPregunta = "";
  respuestaIndice = null;
  respuestas = [];
  indiceRespuesta = 0;
  urlsFetch = [];
  borrarDatos();
  espia = espiaConsoleLog();
  globalThis.fetch = (async (entrada: string | URL | Request) => {
    urlsFetch.push(new URL(String(entrada)));
    return Response.json(respuestas[indiceRespuesta++] ?? {});
  }) as unknown as typeof fetch;
});

afterEach(() => {
  espia.restaurar();
  globalThis.fetch = fetchOriginal;
});

describe("agregarCiudad", () => {
  test("una consulta vacía cancela la búsqueda sin llamar a la API", async () => {
    const ajustes = crearAjustes();
    await agregarCiudad(ajustes);
    expect(espia.mensajes()).toContain("Búsqueda cancelada.");
    expect(urlsFetch).toHaveLength(0);
    expect(existsSync("data.json")).toBe(false);
  });

  test("sin resultados informa que no se encontraron ciudades", async () => {
    respuestaPregunta = "Zzzz";
    respuestas = [{ results: [] }];
    const ajustes = crearAjustes();
    await agregarCiudad(ajustes);
    expect(espia.mensajes()).toContain('No se encontraron ciudades para "Zzzz".');
    expect(ajustes.cities).toHaveLength(0);
    expect(existsSync("data.json")).toBe(false);
  });

  test("cancelar la selección no modifica nada", async () => {
    respuestaPregunta = "Madrid";
    respuestas = [
      { results: [{ id: 1, name: "Madrid", latitude: 40.4165, longitude: -3.70256 }] },
    ];
    respuestaIndice = null;
    const ajustes = crearAjustes();
    await agregarCiudad(ajustes);
    expect(ajustes.cities).toHaveLength(0);
    expect(ajustes.defaultCity).toBeNull();
    expect(existsSync("data.json")).toBe(false);
  });

  test("una ciudad duplicada no se registra ni se guarda", async () => {
    respuestaPregunta = "Córdoba";
    respuestas = [
      {
        results: [
          { id: 1, name: "Córdoba", latitude: cordoba.latitude, longitude: cordoba.longitude },
        ],
      },
    ];
    respuestaIndice = 0;
    const ajustes = crearAjustes([cordoba], cordoba);
    await agregarCiudad(ajustes);
    expect(espia.mensajes()).toContain("ya está registrada.");
    expect(ajustes.cities).toHaveLength(1);
    expect(existsSync("data.json")).toBe(false);
  });

  test("la primera ciudad registrada se promueve a default y se persiste", async () => {
    respuestaPregunta = "Córdoba";
    respuestas = [
      {
        results: [
          {
            id: 1,
            name: cordoba.name,
            latitude: cordoba.latitude,
            longitude: cordoba.longitude,
            admin1: cordoba.admin1,
            country: cordoba.country,
          },
        ],
      },
    ];
    respuestaIndice = 0;
    const ajustes = crearAjustes();
    await agregarCiudad(ajustes);
    expect(ajustes.defaultCity).toEqual(cordoba);
    expect(ajustes.cities).toEqual([cordoba]);
    expect(espia.mensajes()).toContain("(establecida como default)");
    const guardado = JSON.parse(readFileSync("data.json", "utf8"));
    expect(guardado.defaultCity).toEqual(cordoba);
    expect(guardado.cities).toEqual([cordoba]);
  });

  test("una ciudad nueva respeta el default existente", async () => {
    respuestaPregunta = "Madrid";
    respuestas = [
      {
        results: [
          {
            id: 2,
            name: madrid.name,
            latitude: madrid.latitude,
            longitude: madrid.longitude,
            admin1: madrid.admin1,
            country: madrid.country,
          },
        ],
      },
    ];
    respuestaIndice = 0;
    const ajustes = crearAjustes([cordoba], cordoba);
    await agregarCiudad(ajustes);
    expect(ajustes.defaultCity).toEqual(cordoba);
    expect(ajustes.cities).toEqual([cordoba, madrid]);
    expect(espia.mensajes()).toContain(
      "Ciudad agregada: Madrid, Comunidad Autónoma de Madrid, España.",
    );
    expect(espia.mensajes()).not.toContain("establecida como default");
    const guardado = JSON.parse(readFileSync("data.json", "utf8"));
    expect(guardado.cities).toHaveLength(2);
  });
});
