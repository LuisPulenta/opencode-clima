# AGENTS.md — Weather CLI App

App de consola (Bun + TypeScript) que consulta el clima por ciudad con Open-Meteo, según el menú y la apariencia definidos en `README.md`.

## Estructura

- `index.ts` — bucle del menú, `node:readline/promises` para input y las 8 acciones (clima default, todas las ciudades, buscar/agregar, eliminar, set default, pronóstico 7 días, ajustes de unidades, salir).
- `src/api.ts` — geocoding (`count=5`) y forecast (actual + 7 días, `timezone=auto`).
- `src/storage.ts` — `data.json` en la raíz (ciudades, ciudad default, unidades). Está en `.gitignore`; si no existe se recrea vacío.
- `src/ui.ts` — banner del menú (idéntico al README, sin opción 7) y tablas de clima/pronóstico.
- `src/wmo.ts` — mapa de códigos WMO a descripciones en español.
- `src/tipos.ts` — tipos compartidos.

## Comandos

- Runtime y gestor de paquetes: **Bun**. Usar `bun` / `bunx`, NO `npm` ni `node` (hay `bun.lock`, no `package-lock.json`).
- `bun run dev` (o `bun run index.ts`) — ejecutar la app.
- `bun run typecheck` (`bunx tsc --noEmit`) — verificar.
- `bun run build` — compila a binario ejecutable en `out/weather-cli.exe` (objetivo final del proyecto). No hay lint ni tests; no inventar comandos.

## Trampas

- `tsconfig.json` es estricto: `verbatimModuleSyntax` exige `import type` para tipos; `noUncheckedIndexedAccess` obliga a manejar accesos a índice como posiblemente `undefined`; `moduleResolution: bundler` y `allowImportingTsExtensions` permiten importar con extensión `.ts`.
- `bun-types` ya declara las globales `console`, `fetch` y `process`; no hace falta `declare` manual.
- **Input por pipe**: con `readline`, las líneas que llegan sin un `question` pendiente se descartan (y un EOF produce `ERR_USE_AFTER_CLOSE`, manejado al final de `index.ts`). Por eso un test automatizado que envíe stdin debe esperar a ver cada prompt antes de responder cada línea.
- La ciudad default se guarda como referencia a una ciudad registrada (coordenadas incluidas); al eliminar la default se promueve la primera restante.
- Idioma del proyecto: español. Docs, comentarios nuevos y mensajes al usuario en español; mantener en inglés identificadores, nombres de APIs y keywords.

## Flujo de la API (sin API key)

1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<ciudad>&count=5&language=es&format=json` → `latitude`/`longitude`.
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7&timezone=auto` (+ `temperature_unit`, `wind_speed_unit`, `precipitation_unit` según ajustes).
