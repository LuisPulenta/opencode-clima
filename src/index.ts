import type { AccionMenu, OpcionMenu } from "./types/MenuOption.ts";
import {
  cerrarEntrada,
  pausar,
  preguntar,
} from "./presentation/input.ts";
import { construirMenu } from "./presentation/menu.ts";
import { mostrarError } from "./presentation/output.ts";
import { cargarAjustes } from "./storage/settingsStorage.ts";
import { agregarCiudad } from "./actions/addCity.ts";
import { mostrarPronosticoCiudad } from "./actions/getForecast.ts";
import { mostrarClimaDefault, mostrarClimaTodasLasCiudades } from "./actions/getWeather.ts";
import { eliminarCiudad } from "./actions/removeCity.ts";
import { establecerCiudadDefault } from "./actions/setDefaultCity.ts";
import { alternarUnidades } from "./actions/toggleUnits.ts";

const ACCIONES = new Map<OpcionMenu, AccionMenu>([
  ["1", mostrarClimaDefault],
  ["2", mostrarClimaTodasLasCiudades],
  ["3", agregarCiudad],
  ["4", eliminarCiudad],
  ["5", establecerCiudadDefault],
  ["6", mostrarPronosticoCiudad],
  ["8", alternarUnidades],
]);

async function principal(): Promise<void> {
  const ajustes = await cargarAjustes();

  while (true) {
    console.clear();
    const opcion = await preguntar(construirMenu(ajustes));

    if (opcion === "9") {
      console.log("\n  ¡Hasta luego!");
      cerrarEntrada();
      process.exit(0);
    }

    const accion = ACCIONES.get(opcion as OpcionMenu);
    if (accion === undefined) {
      mostrarError("\n  Opción no válida.");
    } else {
      try {
        await accion(ajustes);
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : String(error);
        mostrarError(`\n  Error: ${mensaje}`);
      }
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
