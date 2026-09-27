import type { CheckinAnswer } from "./types";

export const SCORE_VERSION = "pulso_daily_v1";

export interface Question {
  id: "S1" | "S2" | "S3" | "S4" | "S5";
  text: string;
  // Opciones en orden de 0 a 4 puntos (menor → mayor bienestar)
  options: string[];
}

// Preguntas del chequeo diario (docs/PULSO_MASTER_SPEC.md §2.4 heredado del PDR)
export const QUESTIONS: Question[] = [
  {
    id: "S1",
    text: "¿Qué tan descansada o descansado despertaste hoy?",
    options: ["Nada", "Poco", "Regular", "Bien", "Muy bien"],
  },
  {
    id: "S2",
    text: "¿Cuánta energía has tenido hoy?",
    options: ["Nada", "Poca", "Regular", "Buena", "Mucha"],
  },
  {
    id: "S3",
    text: "¿Cuánto te limitaron hoy el dolor o las molestias físicas?",
    options: ["Muchísimo", "Bastante", "Algo", "Poco", "Nada"],
  },
  {
    id: "S4",
    text: "¿Cómo ha estado tu ánimo hoy?",
    options: ["Muy mal", "Mal", "Regular", "Bien", "Muy bien"],
  },
  {
    id: "S5",
    text: "¿Qué tan fácil fue hacer tus actividades habituales hoy?",
    options: ["No pude", "Muy difícil", "Con dificultad", "Casi normal", "Como siempre"],
  },
];

export const ALARM_QUESTION =
  "¿Tienes ahora dificultad para respirar, dolor o presión en el pecho que no cede, " +
  "confusión repentina, debilidad repentina de un lado del cuerpo o no puedes " +
  "mantenerte despierta o despierto?";

/**
 * Índice pulso_daily_v1: puntaje = 5 × (S1+S2+S3+S4+S5), entero 0–100.
 * Devuelve null si falta cualquier respuesta puntuable ("No sé" cuenta como faltante).
 * Un valor mayor = la persona reportó sentirse mejor ese día. NO es diagnóstico.
 */
export function computeScore(answers: {
  S1: CheckinAnswer;
  S2: CheckinAnswer;
  S3: CheckinAnswer;
  S4: CheckinAnswer;
  S5: CheckinAnswer;
}): number | null {
  const values = [answers.S1, answers.S2, answers.S3, answers.S4, answers.S5];
  if (values.some((v) => v === null || v === undefined)) return null;
  const sum = (values as number[]).reduce((a, b) => a + b, 0);
  return sum * 5;
}
