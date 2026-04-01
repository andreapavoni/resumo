import { t } from "../i18n.js";
import type { ValidationError } from "../types.js";

export function val(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

export function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export function update<T>(items: T[], index: number, patch: Partial<T>): T[] {
  return items.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

export function fieldError(errors: ValidationError[], field: string): string | undefined {
  const err = errors.find((e) => e.field === field);
  return err ? t(`error.${err.code}`) : undefined;
}

export function hasItemErrors(errors: ValidationError[], prefix: string): boolean {
  return errors.some((e) => e.field.startsWith(prefix));
}
