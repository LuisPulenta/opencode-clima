import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { obtenerClimaActual, obtenerPronostico } from "../src/api/weather.ts";
import type { RespuestaClima } from "../src/types/Weather.ts";
import { climaDiario, crearCiudad } from "./helpers.ts";

const fetchOriginal = globalThis.fetch;

const cordoba = crearCiudad("Córdoba");
const madrid = crearCiudad("Madrid", { latitude: 40.4165, longitude: -3.70256 });

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

describe("obtenerClimaActual", () => {
  test("pide el clima actual con timezone automática", async () => {
    cuerpo = { current: { temperature_2m: 18.5 } };
    const datos = await obtenerClimaActual(cordoba, "metric");
    expect(urlCapturada?.hostname).toBe("api.open-meteo.com");
    expect(urlCapturada?.searchParams.get("latitude")).toBe("-31.40648");
    expect(urlCapturada?.searchParams.get("longitude")).toBe("-64.18853");
    expect(urlCapturada?.searchParams.get("current")).toBe(
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    );
    expect(urlCapturada?.searchParams.get("timezone")).toBe("auto");
    expect(urlCapturada?.searchParams.get("temperature_unit")).toBeNull();
    expect(datos).toEqual({
      current: { temperature_2m: 18.5 },
    } as unknown as RespuestaClima);
  });

  test("en imperial agrega las unidades imperiales", async () => {
    await obtenerClimaActual(madrid, "imperial");
    expect(urlCapturada?.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(urlCapturada?.searchParams.get("wind_speed_unit")).toBe("mph");
    expect(urlCapturada?.searchParams.get("precipitation_unit")).toBe("inch");
  });
});

describe("obtenerPronostico", () => {
  test("pide 7 días de pronóstico diario", async () => {
    cuerpo = { daily: climaDiario };
    const datos = await obtenerPronostico(cordoba, "metric");
    expect(urlCapturada?.searchParams.get("daily")).toBe(
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    );
    expect(urlCapturada?.searchParams.get("forecast_days")).toBe("7");
    expect(urlCapturada?.searchParams.get("timezone")).toBe("auto");
    expect(datos).toEqual({ daily: climaDiario });
  });

  test("en imperial usa Fahrenheit, mph e in", async () => {
    await obtenerPronostico(cordoba, "imperial");
    expect(urlCapturada?.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(urlCapturada?.searchParams.get("wind_speed_unit")).toBe("mph");
    expect(urlCapturada?.searchParams.get("precipitation_unit")).toBe("inch");
  });

  test("en métricas no agrega parámetros de unidad", async () => {
    await obtenerPronostico(cordoba, "metric");
    expect(urlCapturada?.searchParams.get("temperature_unit")).toBeNull();
    expect(urlCapturada?.searchParams.get("wind_speed_unit")).toBeNull();
    expect(urlCapturada?.searchParams.get("precipitation_unit")).toBeNull();
  });
});
