import { describe, expect, test } from "bun:test";
import {
  borrarCiudad,
  contieneCiudad,
  mismaCiudad,
  registrarCiudad,
} from "../src/storage/citiesStorage.ts";
import { crearAjustes, crearCiudad } from "./helpers.ts";

const cordoba = crearCiudad("Córdoba");
const madrid = crearCiudad("Madrid", { latitude: 40.4165, longitude: -3.70256 });
const neuquen = crearCiudad("Neuquén", {
  latitude: -38.95078,
  longitude: -68.0592,
});

describe("mismaCiudad", () => {
  test("compara por coordenadas redondeadas a 4 decimales", () => {
    expect(mismaCiudad(cordoba, { ...cordoba })).toBe(true);
    expect(
      mismaCiudad(cordoba, { ...cordoba, latitude: cordoba.latitude + 0.00001 }),
    ).toBe(true);
    expect(
      mismaCiudad(cordoba, { ...cordoba, latitude: cordoba.latitude + 0.001 }),
    ).toBe(false);
    expect(
      mismaCiudad(cordoba, { ...cordoba, longitude: cordoba.longitude + 0.001 }),
    ).toBe(false);
  });

  test("el nombre no afecta la identidad de la ciudad", () => {
    expect(mismaCiudad(cordoba, { ...cordoba, name: "Otra" })).toBe(true);
  });
});

describe("contieneCiudad / registrarCiudad", () => {
  test("detecta ciudades ya registradas por coordenadas", () => {
    const ajustes = crearAjustes([cordoba], cordoba);
    expect(
      contieneCiudad(ajustes, { ...cordoba, name: "Córdoba Capital" }),
    ).toBe(true);
    expect(contieneCiudad(ajustes, madrid)).toBe(false);
  });

  test("la primera registrada se promueve a default", () => {
    const ajustes = crearAjustes();
    const esDefault = registrarCiudad(ajustes, cordoba);
    expect(esDefault).toBe(true);
    expect(ajustes.defaultCity).toEqual(cordoba);
    expect(ajustes.cities).toEqual([cordoba]);
  });

  test("las siguientes no tocan el default existente", () => {
    const ajustes = crearAjustes([cordoba], cordoba);
    const esDefault = registrarCiudad(ajustes, madrid);
    expect(esDefault).toBe(false);
    expect(ajustes.defaultCity).toEqual(cordoba);
    expect(ajustes.cities).toEqual([cordoba, madrid]);
  });
});

describe("borrarCiudad", () => {
  test("elimina la ciudad indicada sin tocar el default", () => {
    const ajustes = crearAjustes([cordoba, madrid, neuquen], cordoba);
    const borrada = borrarCiudad(ajustes, 1);
    expect(borrada).toEqual(madrid);
    expect(ajustes.cities).toEqual([cordoba, neuquen]);
    expect(ajustes.defaultCity).toEqual(cordoba);
  });

  test("al borrar la default se promueve la primera restante", () => {
    const ajustes = crearAjustes([cordoba, madrid, neuquen], madrid);
    const borrada = borrarCiudad(ajustes, 1);
    expect(borrada).toEqual(madrid);
    expect(ajustes.defaultCity).toEqual(cordoba);
    expect(ajustes.cities).toEqual([cordoba, neuquen]);
  });

  test("si no quedan ciudades el default queda en null", () => {
    const ajustes = crearAjustes([cordoba], cordoba);
    const borrada = borrarCiudad(ajustes, 0);
    expect(borrada).toEqual(cordoba);
    expect(ajustes.cities).toEqual([]);
    expect(ajustes.defaultCity).toBeNull();
  });

  test("un índice fuera de rango devuelve null sin modificar nada", () => {
    const ajustes = crearAjustes([cordoba, madrid], cordoba);
    expect(borrarCiudad(ajustes, 5)).toBeNull();
    expect(ajustes.cities).toEqual([cordoba, madrid]);
    expect(ajustes.defaultCity).toEqual(cordoba);
  });
});
