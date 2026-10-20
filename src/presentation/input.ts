import { createInterface } from "node:readline/promises";
import { enRojo } from "../utils/colors.ts";

const rl = createInterface({ input: process.stdin, output: process.stdout });

export async function preguntar(texto: string): Promise<string> {
  return (await rl.question(texto)).trim();
}

export async function pausar(): Promise<void> {
  await rl.question("\n  Presiona Enter para continuar...");
}

export async function elegirIndice(cantidad: number): Promise<number | null> {
  const entrada = await preguntar("  Elige un número (Enter para cancelar): ");
  if (entrada === "") {
    return null;
  }
  const indice = Number.parseInt(entrada, 10) - 1;
  if (Number.isNaN(indice) || indice < 0 || indice >= cantidad) {
    console.log(enRojo("  Selección inválida."));
    return null;
  }
  return indice;
}

export function cerrarEntrada(): void {
  rl.close();
}
