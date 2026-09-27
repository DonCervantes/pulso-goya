"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALARM_QUESTION, QUESTIONS } from "@/lib/score";
import type { CheckinAnswer } from "@/lib/types";

type Step = "alarm" | "alarmHelp" | number | "contact" | "summary";

export default function CheckinFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("alarm");
  const [answers, setAnswers] = useState<Record<string, CheckinAnswer>>({});
  const [wantsContact, setWantsContact] = useState(false);
  const [alarmSignal, setAlarmSignal] = useState(false);
  const [saved, setSaved] = useState<{ score: number | null } | null>(null);
  const [busy, setBusy] = useState(false);

  function setAnswer(id: string, value: CheckinAnswer) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, wantsContact, alarmSignal }),
      });
      const data = (await res.json()) as { checkin: { score0to100: number | null } };
      setSaved({ score: data.checkin.score0to100 });
      setStep("summary");
    } finally {
      setBusy(false);
    }
  }

  // ── Señales de alarma (antes del puntaje) ──
  if (step === "alarm") {
    return (
      <Card>
        <h2 className="text-2xl font-bold">Antes de empezar</h2>
        <p className="mt-3 text-lg">{ALARM_QUESTION}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            className="rounded-xl bg-[var(--color-danger)] px-5 py-4 text-lg font-semibold text-white"
            onClick={() => {
              setAlarmSignal(true);
              setStep("alarmHelp");
            }}
          >
            Sí
          </button>
          <button
            className="rounded-xl border-2 border-[var(--color-danger)] px-5 py-4 text-lg font-semibold text-[var(--color-danger)]"
            onClick={() => {
              setAlarmSignal(true);
              setStep("alarmHelp");
            }}
          >
            No estoy seguro
          </button>
          <button
            className="rounded-xl border border-[var(--color-border)] px-5 py-4 text-lg"
            onClick={() => setStep(0)}
          >
            No
          </button>
        </div>
      </Card>
    );
  }

  if (step === "alarmHelp") {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-[var(--color-danger)]">Pide ayuda ahora</h2>
        <p className="mt-3 text-lg">
          Por lo que indicas, es mejor pedir ayuda de inmediato. No esperes al chequeo.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a href="tel:911" className="rounded-xl bg-[var(--color-danger)] px-5 py-4 text-center text-lg font-semibold text-white">
            📞 Llamar al 911
          </a>
          <button
            onClick={() => router.push("/inicio")}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white"
          >
            Ir a “Necesito ayuda” (avisar a mi familia)
          </button>
          <button onClick={() => setStep(0)} className="rounded-xl border border-[var(--color-border)] px-5 py-3">
            Continuar con el chequeo de todos modos
          </button>
        </div>
      </Card>
    );
  }

  // ── Preguntas S1..S5 ──
  if (typeof step === "number") {
    const q = QUESTIONS[step];
    return (
      <Card>
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Pregunta {step + 1} de {QUESTIONS.length}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{q.text}</h2>
        <div className="mt-6 flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => {
                setAnswer(q.id, i as CheckinAnswer);
                setStep(step + 1 < QUESTIONS.length ? step + 1 : "contact");
              }}
              className={`rounded-xl border px-5 py-4 text-left text-lg ${
                answers[q.id] === i
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              {opt}
            </button>
          ))}
          <button
            onClick={() => {
              setAnswer(q.id, null);
              setStep(step + 1 < QUESTIONS.length ? step + 1 : "contact");
            }}
            className="rounded-xl border border-dashed border-[var(--color-border)] px-5 py-3 text-[var(--color-text-secondary)]"
          >
            No sé / prefiero no responder
          </button>
        </div>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="mt-4 text-[var(--color-primary)] underline">
            ← Anterior
          </button>
        )}
      </Card>
    );
  }

  // ── Pregunta de contacto ──
  if (step === "contact") {
    return (
      <Card>
        <h2 className="text-2xl font-bold">¿Quieres que uno de tus contactos te llame hoy?</h2>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              setWantsContact(true);
              void save();
            }}
            disabled={busy}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white"
          >
            Sí, que me llamen
          </button>
          <button
            onClick={() => {
              setWantsContact(false);
              void save();
            }}
            disabled={busy}
            className="rounded-xl border border-[var(--color-border)] px-5 py-4 text-lg"
          >
            No, gracias
          </button>
        </div>
      </Card>
    );
  }

  // ── Resumen ──
  return (
    <Card>
      <h2 className="text-2xl font-bold text-[var(--color-success)]">Chequeo guardado ✓</h2>
      {saved?.score !== null ? (
        <>
          <p className="mt-4 text-lg">Tu bienestar reportado hoy:</p>
          <p className="my-2 text-5xl font-extrabold text-[var(--color-primary)]">{saved?.score}/100</p>
          <p className="text-[var(--color-text-secondary)]">
            Compáralo con tus propios días. Si te preocupa cómo te sientes, contacta a alguien de
            confianza o a un profesional. No es un diagnóstico.
          </p>
        </>
      ) : (
        <p className="mt-4 text-lg">
          Guardamos tus respuestas. <strong>Sin puntaje hoy</strong> porque faltó alguna respuesta.
        </p>
      )}
      {wantsContact && (
        <p className="mt-4 rounded-lg bg-[var(--color-warning-bg)] p-3 text-[var(--color-warning)]">
          Se creó una solicitud para que un contacto te llame.
        </p>
      )}
      <button
        onClick={() => router.push("/inicio")}
        className="mt-6 rounded-xl bg-[var(--color-primary)] px-5 py-4 text-lg font-semibold text-white"
      >
        Volver al inicio
      </button>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm">
      {children}
    </div>
  );
}
