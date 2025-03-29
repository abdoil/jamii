import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useHbarToKes } from "./hooks/use-hbar-to-kes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
