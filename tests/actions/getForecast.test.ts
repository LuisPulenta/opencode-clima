import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import { climaDiario, crearAjustes, crearCiudad, espiaConsoleLog } from "../helpers.ts";

let respuestaIndice: number | null = null;
let llamadasEleccion = 0;
let respuestas: unknown[] = [];
let indiceRespuesta = 0;
let urlsFetch: URL[] = [];

mock.module("../../src/presentation/input.ts", () => ({
  preguntar: async () => "",
  elegirIndice: async () => {
    llamadasEleccion++;
    return respuestaIndice;
  },
  pausar: async () => {},
  cerrarEntrada: () => {},
}));

const { mostrarPronosticoCiudad } = await import(
  "../../src/actions/getForecast.ts"
);

const cordoba = crearCiudad("Córdoba");

const fetchOriginal = globalThis.fetch;
let espia!: ReturnType<typeof espiaConsoleLog>;

beforeEach(() => {
  respuestaIndice = null;
  llamadasEleccion = 0;
  respuestas = [];
  indiceRespuesta = 0;
  urlsFetch = [];
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

describe("mostrarPronosticoCiudad", () => {
  test("con la lista vacía informa el error sin llamar a la API", async () => {
    await mostrarPronosticoCiudad(crearAjustes());
    expect(espia.mensajes()).toContain("No hay ciudades registradas.");
    expect(llamadasEleccion).toBe(0);
    expect(urlsFetch).toHaveLength(0);
  });

  test("cancelar la selección no llama a la API", async () => {
    respuestaIndice = null;
    await mostrarPronosticoCiudad(crearAjustes([cordoba], cordoba));
    expect(llamadasEleccion).toBe(1);
    expect(urlsFetch).toHaveLength(0);
  });

  test("muestra la tabla de 7 días", async () => {
    respuestas = [{ daily: climaDiario }];
    respuestaIndice = 0;
    await mostrarPronosticoCiudad(crearAjustes([cordoba], cordoba));
    expect(espia.mensajes()).toContain("Pronóstico 7 días — Córdoba");
    expect(espia.mensajes()).toContain("20/10");
    expect(urlsFetch).toHaveLength(1);
    expect(urlsFetch[0]?.searchParams.get("forecast_days")).toBe("7");
  });

  test("sin datos daily informa que no se pudo obtener", async () => {
    respuestaIndice = 0;
    await mostrarPronosticoCiudad(crearAjustes([cordoba], cordoba));
    expect(espia.mensajes()).toContain("No se pudo obtener el pronóstico.");
    expect(espia.mensajes()).not.toContain("Pronóstico 7 días");
  });
});
