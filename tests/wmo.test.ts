import { describe, expect, test } from "bun:test";
import { describirClima } from "../src/utils/wmo.ts";

describe("describirClima", () => {
  test("describe los códigos WMO conocidos", () => {
    expect(describirClima(0)).toBe("Cielo despejado");
    expect(describirClima(3)).toBe("Nublado");
    expect(describirClima(45)).toBe("Niebla");
    expect(describirClima(61)).toBe("Lluvia ligera");
    expect(describirClima(95)).toBe("Tormenta eléctrica");
  });

  test("códigos desconocidos devuelven un texto genérico", () => {
    expect(describirClima(999)).toBe("Condición desconocida");
    expect(describirClima(-1)).toBe("Condición desconocida");
  });
});
