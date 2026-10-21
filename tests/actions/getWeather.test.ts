import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { climaActual, crearAjustes, crearCiudad, espiaConsoleLog } from "../helpers.ts";

const cordoba = crearCiudad("Córdoba");
const madrid = crearCiudad("Madrid", { latitude: 40.4165, longitude: -3.70256 });

const fetchOriginal = globalThis.fetch;
let respuestas: unknown[] = [];
let indiceRespuesta = 0;
let urlsFetch: URL[] = [];
let espia!: ReturnType<typeof espiaConsoleLog>;

const { mostrarClimaDefault, mostrarClimaTodasLasCiudades } = await import(
  "../../src/actions/getWeather.ts"
);

beforeEach(() => {
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

describe("mostrarClimaDefault", () => {
  test("sin ciudad default informa el error sin llamar a la API", async () => {
    await mostrarClimaDefault(crearAjustes());
    expect(espia.mensajes()).toContain("No hay una ciudad default establecida.");
    expect(urlsFetch).toHaveLength(0);
  });

  test("muestra el clima de la ciudad default", async () => {
    respuestas = [{ current: climaActual }];
    await mostrarClimaDefault(crearAjustes([cordoba], cordoba));
    expect(espia.mensajes()).toContain("Clima en Córdoba");
    expect(espia.mensajes()).toContain("18.5 °C");
    expect(urlsFetch).toHaveLength(1);
    expect(urlsFetch[0]?.searchParams.get("latitude")).toBe("-31.40648");
  });

  test("en imperial se piden unidades imperiales", async () => {
    respuestas = [{ current: climaActual }];
    await mostrarClimaDefault(crearAjustes([cordoba], cordoba, "imperial"));
    expect(urlsFetch[0]?.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });

  test("sin datos current informa que no se pudo obtener", async () => {
    await mostrarClimaDefault(crearAjustes([cordoba], cordoba));
    expect(espia.mensajes()).toContain("No se pudo obtener el clima actual.");
    expect(espia.mensajes()).not.toContain("Clima en");
  });
});

describe("mostrarClimaTodasLasCiudades", () => {
  test("con la lista vacía informa el error sin llamar a la API", async () => {
    await mostrarClimaTodasLasCiudades(crearAjustes());
    expect(espia.mensajes()).toContain("No hay ciudades registradas.");
    expect(urlsFetch).toHaveLength(0);
  });

  test("muestra el clima de cada ciudad registrada", async () => {
    respuestas = [{ current: climaActual }, { current: climaActual }];
    await mostrarClimaTodasLasCiudades(crearAjustes([cordoba, madrid]));
    const texto = espia.mensajes();
    expect(texto.split("Clima en").length - 1).toBe(2);
    expect(texto).toContain("Clima en Córdoba");
    expect(texto).toContain("Clima en Madrid");
    expect(urlsFetch).toHaveLength(2);
  });

  test("omite las ciudades sin datos current", async () => {
    respuestas = [{ current: climaActual }, {}];
    await mostrarClimaTodasLasCiudades(crearAjustes([cordoba, madrid]));
    const texto = espia.mensajes();
    expect(texto.split("Clima en").length - 1).toBe(1);
    expect(texto).toContain("Clima en Córdoba");
    expect(urlsFetch).toHaveLength(2);
  });
});
