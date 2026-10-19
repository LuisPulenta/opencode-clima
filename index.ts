import { createInterface } from "node:readline/promises";
import type { Ajustes, Ciudad } from "./src/tipos.ts";
import { cargarAjustes, guardarAjustes } from "./src/storage.ts";
import {
  buscarCiudades,
  obtenerClimaActual,
  obtenerPronostico,
} from "./src/api.ts";
import {
  construirMenu,
  etiquetaCiudad,
  mostrarClimaActual,
  mostrarPronostico,
  simboloTemperatura,
} from "./src/ui.ts";

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function pausar(): Promise<void> {
  await rl.question("\n  Presiona Enter para continuar...");
}

function mismaCiudad(a: Ciudad, b: Ciudad): boolean {
  return (
    a.latitude.toFixed(4) === b.latitude.toFixed(4) &&
    a.longitude.toFixed(4) === b.longitude.toFixed(4)
  );
}

async function elegirIndice(cantidad: number): Promise<number | null> {
  const entrada = (
    await rl.question("  Elige un número (Enter para cancelar): ")
  ).trim();
  if (entrada === "") {
    return null;
  }
  const indice = Number.parseInt(entrada, 10) - 1;
  if (Number.isNaN(indice) || indice < 0 || indice >= cantidad) {
    console.log("  Selección inválida.");
    return null;
  }
  return indice;
}

async function elegirCiudadDeLista(ajustes: Ajustes): Promise<number | null> {
  if (ajustes.cities.length === 0) {
    console.log("\n  No hay ciudades registradas.");
    return null;
  }
  console.log("");
  ajustes.cities.forEach((ciudad, i) => {
    const esDefault =
      ajustes.defaultCity !== null && mismaCiudad(ciudad, ajustes.defaultCity);
    console.log(`  ${i + 1}. ${etiquetaCiudad(ciudad)}${esDefault ? " (default)" : ""}`);
  });
  return elegirIndice(ajustes.cities.length);
}

async function accionClimaDefault(ajustes: Ajustes): Promise<void> {
  if (ajustes.defaultCity === null) {
    console.log("\n  No hay una ciudad default establecida.");
    return;
  }
  const datos = await obtenerClimaActual(ajustes.defaultCity, ajustes.unit);
  if (datos.current === undefined) {
    console.log("\n  No se pudo obtener el clima actual.");
    return;
  }
  mostrarClimaActual(ajustes.defaultCity, datos.current, ajustes.unit);
}

async function accionTodasLasCiudades(ajustes: Ajustes): Promise<void> {
  if (ajustes.cities.length === 0) {
    console.log("\n  No hay ciudades registradas.");
    return;
  }
  for (const ciudad of ajustes.cities) {
    const datos = await obtenerClimaActual(ciudad, ajustes.unit);
    if (datos.current !== undefined) {
      mostrarClimaActual(ciudad, datos.current, ajustes.unit);
    }
  }
}

async function accionBuscarAgregar(ajustes: Ajustes): Promise<void> {
  const consulta = (await rl.question("\n  Nombre de la ciudad: ")).trim();
  if (consulta === "") {
    console.log("  Búsqueda cancelada.");
    return;
  }
  const resultados = await buscarCiudades(consulta);
  if (resultados.length === 0) {
    console.log(`  No se encontraron ciudades para "${consulta}".`);
    return;
  }
  console.log("");
  resultados.forEach((ciudad, i) => {
    console.log(`  ${i + 1}. ${etiquetaCiudad(ciudad)}`);
  });
  const seleccion = await elegirIndice(resultados.length);
  if (seleccion === null) {
    return;
  }
  const ciudad = resultados[seleccion];
  if (ciudad === undefined) {
    return;
  }
  if (ajustes.cities.some((registrada) => mismaCiudad(registrada, ciudad))) {
    console.log(`  ${etiquetaCiudad(ciudad)} ya está registrada.`);
    return;
  }
  ajustes.cities.push(ciudad);
  if (ajustes.defaultCity === null) {
    ajustes.defaultCity = ciudad;
    console.log(
      `  Ciudad agregada: ${etiquetaCiudad(ciudad)} (establecida como default).`,
    );
  } else {
    console.log(`  Ciudad agregada: ${etiquetaCiudad(ciudad)}.`);
  }
  await guardarAjustes(ajustes);
}

async function accionEliminar(ajustes: Ajustes): Promise<void> {
  const indice = await elegirCiudadDeLista(ajustes);
  if (indice === null) {
    return;
  }
  const [eliminada] = ajustes.cities.splice(indice, 1);
  if (eliminada === undefined) {
    return;
  }
  if (ajustes.defaultCity !== null && mismaCiudad(ajustes.defaultCity, eliminada)) {
    ajustes.defaultCity = ajustes.cities[0] ?? null;
  }
  await guardarAjustes(ajustes);
  console.log(`  Ciudad eliminada: ${etiquetaCiudad(eliminada)}.`);
  if (ajustes.defaultCity !== null) {
    console.log(`  Nueva ciudad default: ${etiquetaCiudad(ajustes.defaultCity)}.`);
  }
}

async function accionEstablecerDefault(ajustes: Ajustes): Promise<void> {
  const indice = await elegirCiudadDeLista(ajustes);
  if (indice === null) {
    return;
  }
  const ciudad = ajustes.cities[indice];
  if (ciudad === undefined) {
    return;
  }
  ajustes.defaultCity = ciudad;
  await guardarAjustes(ajustes);
  console.log(`  Ciudad default: ${etiquetaCiudad(ciudad)}.`);
}

async function accionPronostico(ajustes: Ajustes): Promise<void> {
  const indice = await elegirCiudadDeLista(ajustes);
  if (indice === null) {
    return;
  }
  const ciudad = ajustes.cities[indice];
  if (ciudad === undefined) {
    return;
  }
  const datos = await obtenerPronostico(ciudad, ajustes.unit);
  if (datos.daily === undefined) {
    console.log("\n  No se pudo obtener el pronóstico.");
    return;
  }
  mostrarPronostico(ciudad, datos.daily, ajustes.unit);
}

async function accionAjustes(ajustes: Ajustes): Promise<void> {
  ajustes.unit = ajustes.unit === "metric" ? "imperial" : "metric";
  await guardarAjustes(ajustes);
  const detalle =
    ajustes.unit === "metric"
      ? "Celsius, km/h, mm"
      : "Fahrenheit, mph, in";
  console.log(`\n  Unidades cambiadas a ${detalle} (${simboloTemperatura(ajustes.unit)}).`);
}

async function principal(): Promise<void> {
  const ajustes = await cargarAjustes();

  while (true) {
    console.clear();
    const opcion = (await rl.question(construirMenu(ajustes))).trim();

    if (opcion === "9") {
      console.log("\n  ¡Hasta luego!");
      rl.close();
      process.exit(0);
    }

    try {
      switch (opcion) {
        case "1":
          await accionClimaDefault(ajustes);
          break;
        case "2":
          await accionTodasLasCiudades(ajustes);
          break;
        case "3":
          await accionBuscarAgregar(ajustes);
          break;
        case "4":
          await accionEliminar(ajustes);
          break;
        case "5":
          await accionEstablecerDefault(ajustes);
          break;
        case "6":
          await accionPronostico(ajustes);
          break;
        case "8":
          await accionAjustes(ajustes);
          break;
        default:
          console.log("\n  Opción no válida.");
          break;
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      console.log(`\n  Error: ${mensaje}`);
    }

    await pausar();
  }
}

principal().catch((error) => {
  const codigo = (error as { code?: string }).code;
  if (codigo === "ERR_USE_AFTER_CLOSE") {
    console.log("\n  Entrada cerrada. ¡Hasta luego!");
    process.exit(0);
  }
  console.error(error);
  process.exit(1);
});
