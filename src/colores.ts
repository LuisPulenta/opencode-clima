const CYAN = "\x1b[36m";
const AMARILLO = "\x1b[33m";
const VERDE = "\x1b[32m";
const ROJO = "\x1b[31m";
const RESET = "\x1b[0m";

const coloresActivos =
  process.env["NO_COLOR"] === undefined && process.stdout.isTTY !== false;

function pintar(codigo: string, texto: string): string {
  if (!coloresActivos) {
    return texto;
  }
  return `${codigo}${texto}${RESET}`;
}

export function enCyan(texto: string): string {
  return pintar(CYAN, texto);
}

export function enAmarillo(texto: string): string {
  return pintar(AMARILLO, texto);
}

export function enVerde(texto: string): string {
  return pintar(VERDE, texto);
}

export function enRojo(texto: string): string {
  return pintar(ROJO, texto);
}
