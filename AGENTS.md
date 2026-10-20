# AGENTS.md — Weather CLI App

App de consola (Bun + TypeScript) que consulta el clima por ciudad con Open-Meteo, según el menú y la apariencia definidos en `README.md`.

## Estructura

- `src/index.ts` — punto de entrada: bucle del menú con un `Map<OpcionMenu, AccionMenu>` (sin `switch`), pausa entre acciones y manejo de EOF.
- `src/actions/` — una acción por archivo: `getWeather.ts` (clima default y todas las ciudades), `addCity.ts`, `removeCity.ts`, `setDefaultCity.ts`, `listCities.ts` (listar y elegir de la lista), `getForecast.ts`, `toggleUnits.ts`. Mutan `ajustes` y persisten vía `settingsStorage`.
- `src/presentation/` — `menu.ts` (banner idéntico al README, sin opción 7), `input.ts` (interfaz `node:readline/promises`: `preguntar`, `pausar`, `elegirIndice`, `cerrarEntrada`), `output.ts` (tablas de clima/pronóstico y `mostrarError/Exito/Aviso/Listado`).
- `src/storage/` — `settingsStorage.ts` dueño del I/O de `data.json` (raíz, `.gitignore`; si no existe se recrea vacío); `citiesStorage.ts` con operaciones de dominio (`mismaCiudad`, `contieneCiudad`, `registrarCiudad`, `borrarCiudad`) que no persisten por sí mismas.
- `src/api/` — `geocoding.ts` (`count=5`), `weather.ts` (actual + 7 días, `timezone=auto`), `http.ts` (`pedirJson` compartido).
- `src/types/` — `City.ts` (`Ciudad`), `Settings.ts` (`Unidad`, `Ajustes`), `Weather.ts`, `Geocoding.ts`, `MenuOption.ts` (`OpcionMenu` + `AccionMenu`).
- `src/utils/` — `format.ts` (etiqueta de ciudad, símbolos de unidades, fechas), `constants.ts` (URLs, `ARCHIVO_DATOS`, `LINEA`), `colors.ts` (ANSI con soporte `NO_COLOR`), `wmo.ts` (códigos WMO a descripciones en español).

## Comandos

- Runtime y gestor de paquetes: **Bun**. Usar `bun` / `bunx`, NO `npm` ni `node` (hay `bun.lock`, no `package-lock.json`).
- `bun run dev` (o `bun run src/index.ts`) — ejecutar la app.
- `bun run typecheck` (`bunx tsc --noEmit`) — verificar.
- `bun run build` — compila a binario ejecutable en `out/weather-cli.exe` (objetivo final del proyecto). No hay lint ni tests; no inventar comandos.

## Trampas

- `tsconfig.json` es estricto: `verbatimModuleSyntax` exige `import type` para tipos; `noUncheckedIndexedAccess` obliga a manejar accesos a índice como posiblemente `undefined`; `moduleResolution: bundler` y `allowImportingTsExtensions` permiten importar con extensión `.ts`.
- `bun-types` (vía `@types/bun`) declara las globales `console`, `fetch`, `process` y `Bun`; no hace falta `declare` manual. `tsconfig.json` fija `"types": ["bun"]` explícitamente para que el TS server del editor las vea también — si algún editor las pinta en rojo, reiniciar el TS server (`TypeScript: Restart TS Server`).
- **Input por pipe**: con `readline`, las líneas que llegan sin un `question` pendiente se descartan (y un EOF produce `ERR_USE_AFTER_CLOSE`, manejado al final de `src/index.ts`). Por eso un test automatizado que envíe stdin debe esperar a ver cada prompt antes de responder cada línea.
- La ciudad default se guarda como referencia a una ciudad registrada (coordenadas incluidas); al eliminar la default se promueve la primera restante.
- Idioma del proyecto: español. Docs, comentarios nuevos y mensajes al usuario en español; mantener en inglés identificadores, nombres de APIs y keywords.

## Flujo de la API (sin API key)

1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<ciudad>&count=5&language=es&format=json` → `latitude`/`longitude`.
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7&timezone=auto` (+ `temperature_unit`, `wind_speed_unit`, `precipitation_unit` según ajustes).
