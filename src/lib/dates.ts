// O servidor da Vercel roda em UTC. O dia do usuário é o de São Paulo (UTC-3, sem horário de verão desde 2019).
const TZ = "America/Sao_Paulo";

/** Data de hoje em São Paulo no formato YYYY-MM-DD */
export function saoPauloDay(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Intervalo [from, to) em ISO para um dia de São Paulo */
export function dayRange(ymd: string): { from: string; to: string } {
  const start = new Date(`${ymd}T00:00:00-03:00`);
  const end = new Date(start.getTime() + 24 * 3600 * 1000);
  return { from: start.toISOString(), to: end.toISOString() };
}

/** Dias anteriores (inclusive hoje) como lista de YYYY-MM-DD, do mais antigo ao mais recente */
export function lastDays(count: number): string[] {
  const days: string[] = [];
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    days.push(saoPauloDay(new Date(now - i * 24 * 3600 * 1000)));
  }
  return days;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

export function formatDayLabel(ymd: string): string {
  return new Date(`${ymd}T12:00:00-03:00`).toLocaleDateString("pt-BR", { weekday: "short", timeZone: TZ });
}
