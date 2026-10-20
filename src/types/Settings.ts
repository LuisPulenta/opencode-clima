import type { Ciudad } from "./City.ts";

export type Unidad = "metric" | "imperial";

export interface Ajustes {
  defaultCity: Ciudad | null;
  cities: Ciudad[];
  unit: Unidad;
}
