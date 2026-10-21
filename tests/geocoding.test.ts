import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { buscarCiudades } from "../src/api/geocoding.ts";

const fetchOriginal = globalThis.fetch;

let cuerpo: unknown = {};
let urlCapturada: URL | null = null;

beforeEach(() => {
  cuerpo = {};
  urlCapturada = null;
  globalThis.fetch = (async (entrada: string | URL | Request) => {
    urlCapturada = new URL(String(entrada));
    return Response.json(cuerpo);
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

describe("buscarCiudades", () => {
  test("consulta la API de geocoding con los parámetros correctos", async () => {
    await buscarCiudades("Córdoba");
    expect(urlCapturada?.hostname).toBe("geocoding-api.open-meteo.com");
    expect(urlCapturada?.searchParams.get("name")).toBe("Córdoba");
    expect(urlCapturada?.searchParams.get("count")).toBe("5");
    expect(urlCapturada?.searchParams.get("language")).toBe("es");
    expect(urlCapturada?.searchParams.get("format")).toBe("json");
  });

  test("convierte los resultados en ciudades sin exponer el id", async () => {
    cuerpo = {
      results: [
        {
          id: 1,
          name: "Córdoba",
          latitude: -31.40648,
          longitude: -64.18853,
          country: "Argentina",
          country_code: "AR",
          admin1: "Provincia de Córdoba",
        },
      ],
    };
    const ciudades = await buscarCiudades("Córdoba");
    expect(ciudades).toEqual([
      {
        name: "Córdoba",
        admin1: "Provincia de Córdoba",
        country: "Argentina",
        country_code: "AR",
        latitude: -31.40648,
        longitude: -64.18853,
      },
    ]);
    expect("id" in (ciudades[0] ?? {})).toBe(false);
  });

  test("sin resultados devuelve una lista vacía", async () => {
    cuerpo = { results: [] };
    expect(await buscarCiudades("zzz")).toEqual([]);
    cuerpo = {};
    expect(await buscarCiudades("zzz")).toEqual([]);
  });

  test("tolera resultados sin campos opcionales", async () => {
    cuerpo = {
      results: [{ id: 9, name: "Madrid", latitude: 40.4165, longitude: -3.70256 }],
    };
    const ciudades = await buscarCiudades("Madrid");
    expect(ciudades).toEqual([
      {
        name: "Madrid",
        admin1: undefined,
        country: undefined,
        country_code: undefined,
        latitude: 40.4165,
        longitude: -3.70256,
      },
    ]);
  });
});
