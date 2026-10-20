import type { Ajustes } from "./Settings.ts";

export type OpcionMenu = "1" | "2" | "3" | "4" | "5" | "6" | "8" | "9";

export type AccionMenu = (ajustes: Ajustes) => Promise<void>;
