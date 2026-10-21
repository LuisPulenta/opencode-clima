import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";

const RAIZ_PROYECTO = join(import.meta.dir, "..");

function quitarAnsi(texto: string): string {
  return texto
    .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "")
    .replace(/\r/g, "");
}

describe("CLI end-to-end (offline)", () => {
  test(
    "menú completo: clima sin default, opción inválida y salir",
    async () => {
      const dir = mkdtempSync(join(tmpdir(), "weather-cli-e2e-"));
      let hijo: ChildProcess | undefined;
      let stdout = "";
      let stderr = "";

      try {
        hijo = spawn(process.execPath, [join(RAIZ_PROYECTO, "src", "index.ts")], {
          cwd: dir,
          stdio: ["pipe", "pipe", "pipe"],
        });

        hijo.stdout?.on("data", (trozo: Buffer) => {
          stdout += quitarAnsi(trozo.toString());
        });
        hijo.stderr?.on("data", (trozo: Buffer) => {
          stderr += quitarAnsi(trozo.toString());
        });
        hijo.stdin?.on("error", () => {});

        const esperar = (
          texto: string,
          marca: number,
          limiteMs = 30000,
        ): Promise<void> => {
          const inicio = Date.now();
          return new Promise((resolver, rechazar) => {
            const chequear = () => {
              const ocurrencias = stdout.split(texto).length - 1;
              if (ocurrencias >= marca) {
                resolver();
                return;
              }
              if (Date.now() - inicio > limiteMs) {
                rechazar(
                  new Error(
                    `Timeout esperando ${marca} apariciones de "${texto}" (hubo ${ocurrencias}). Salida acumulada:\n${stdout}`,
                  ),
                );
                return;
              }
              setTimeout(chequear, 50);
            };
            chequear();
          });
        };

        const enviar = (linea: string) => {
          hijo?.stdin?.write(`${linea}\n`);
        };

        await esperar("Selecciona una opción:", 1);

        // Opción 1: sin ciudad default todavía
        enviar("1");
        await esperar("No hay una ciudad default establecida.", 1);
        await esperar("Presiona Enter para continuar...", 1);
        enviar("");

        // De vuelta al menú, opción 7 no existe
        await esperar("Selecciona una opción:", 2);
        enviar("7");
        await esperar("Opción no válida.", 1);
        await esperar("Presiona Enter para continuar...", 2);
        enviar("");

        // Opción 9: salir
        await esperar("Selecciona una opción:", 3);
        enviar("9");
        await esperar("¡Hasta luego!", 1);

        const codigo = await new Promise<number | null>((resolver) => {
          const vale = hijo?.exitCode;
          if (vale !== null && vale !== undefined) {
            resolver(vale);
            return;
          }
          hijo?.once("exit", (c) => resolver(c));
        });

        expect(codigo).toBe(0);
        expect(stdout).toContain("WEATHER CLI");
        expect(stdout).toContain("Opción no válida.");
        expect(stderr).toBe("");
        expect(existsSync(join(dir, "data.json"))).toBe(false);
      } finally {
        hijo?.kill();
        await new Promise((r) => setTimeout(r, 200));
        rmSync(dir, { recursive: true, force: true });
      }
    },
    60000,
  );
});
