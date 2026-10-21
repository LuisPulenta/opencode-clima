import { afterEach, describe, expect, test } from "bun:test";
import { pedirJson } from "../src/api/http.ts";

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

describe("pedirJson", () => {
  test("devuelve el cuerpo JSON si la respuesta es exitosa", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ valor: 42 }), { status: 200 })) as unknown as typeof fetch;
    const datos = await pedirJson<{ valor: number }>(new URL("https://ejemplo.com/api"));
    expect(datos).toEqual({ valor: 42 });
  });

  test("lanza un error con el estado si la API falla", async () => {
    globalThis.fetch = (async () =>
      new Response("error interno", { status: 503 })) as unknown as typeof fetch;
    await expect(pedirJson(new URL("https://ejemplo.com/api"))).rejects.toThrow(
      "La API respondió con estado 503",
    );
  });

  test("propaga los errores de red", async () => {
    globalThis.fetch = (async () => {
      throw new Error("sin conexión");
    }) as unknown as typeof fetch;
    await expect(pedirJson(new URL("https://ejemplo.com/api"))).rejects.toThrow(
      "sin conexión",
    );
  });
});
