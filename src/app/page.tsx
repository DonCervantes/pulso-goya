import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const REPO_URL = "https://github.com/arantxaamr/alerta-medica-esp32-stellar";

export default async function Landing() {
  const user = await getSession();
  if (user) {
    if (user.role === "admin") redirect("/admin");
    if (user.role === "family") redirect("/familiar");
    redirect("/inicio");
  }

  return (
    <>
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-soft)] bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2" aria-label="Pulso, inicio">
            <Image src="/pulso-mark.svg" alt="" width={36} height={36} priority className="h-9 w-9" />
            <span className="text-2xl font-extrabold text-[var(--color-primary)]">
              Pulso<span className="text-[var(--color-mint)]">.</span>
            </span>
          </Link>
          <nav aria-label="Secciones" className="mx-auto hidden gap-7 text-sm font-medium md:flex">
            <a href="#como-funciona" className="hover:text-[var(--color-primary)]">Cómo funciona</a>
            <a href="#familias" className="hover:text-[var(--color-primary)]">Para familias</a>
            <a href="#contexto" className="hover:text-[var(--color-primary)]">El contexto</a>
            <a href="#confianza" className="hover:text-[var(--color-primary)]">Confianza</a>
            <Link href="/login" className="hover:text-[var(--color-primary)]">Entrar a Pulso</Link>
          </nav>
          <Link
            href="/login"
            className="hidden rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white sm:inline-block"
          >
            Ver demostración ↗
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-mint)]" /> Piloto en Ciudad de México
            </p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] text-[var(--color-text)] sm:text-6xl">
              Más cerca cuando alguien <span className="accent text-[var(--color-primary)]">necesita ayuda.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-[var(--color-text-secondary)]">
              Dos pulsaciones del botón en casa iniciarán una solicitud de ayuda. Hoy puedes recorrer
              el mismo flujo desde el teléfono con tu red familiar.
            </p>
            <p className="mt-4 font-bold text-[var(--color-primary)]">Tu red de apoyo en dos toques.</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="rounded-xl bg-[var(--color-primary)] px-6 py-4 text-center text-lg font-semibold text-white">
                Ver demostración ↗
              </Link>
              <Link href="/login" className="rounded-xl border border-[var(--color-border)] px-6 py-4 text-center text-lg font-semibold text-[var(--color-text)]">
                Entrar al piloto ↗
              </Link>
            </div>
            <a href="#como-funciona" className="mt-6 inline-block font-semibold text-[var(--color-primary)]">
              Descubre cómo funciona ↓
            </a>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Vista previa interactiva. La demostración con ESP32 real se conectará al final.
            </p>
          </div>

          {/* Dispositivo real + notificación (apiladas, sin encimar) */}
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
            <div className="relative aspect-square w-full">
              <div className="absolute inset-0 rounded-full bg-[var(--color-mint-soft)]" />
              <div className="absolute inset-[10%] rounded-full border border-[var(--color-mint)]/70" />
              <div className="absolute inset-[22%] rounded-full border border-[var(--color-mint)]/40" />
              {/* Foto del collar Pulso (ESP32) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/collar-pulso.png"
                  alt="Collar Pulso: dispositivo con módulo ESP32, botón de ayuda y batería"
                  width={236}
                  height={413}
                  priority
                  className="h-[88%] w-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Tarjeta de notificación, debajo del dispositivo */}
            <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] p-4 shadow-xl ring-1 ring-[var(--color-border-soft)]">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-mint-soft)] text-[var(--color-primary)]">✦</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Ejemplo familiar</span>
              </div>
              <p className="mt-3 font-bold">Alguien necesita apoyo</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Así se vería el aviso a la red elegida</p>
              <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-border-soft)] pt-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2e6d8] text-sm font-bold text-[#8a6d4b]">M</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">María confirmó</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">La familia sabe quién responde</p>
                </div>
                <span className="text-[var(--color-success)]">✓</span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Vista conceptual · No representa una alerta enviada
            </p>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section id="como-funciona" className="border-t border-[var(--color-border-soft)] bg-[var(--color-surface)]">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <Eyebrow>Un flujo claro</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight">
              La tranquilidad empieza por saber <span className="accent text-[var(--color-primary)]">qué sigue.</span>
            </h2>
            <p className="mt-3 max-w-xl text-lg text-[var(--color-text-secondary)]">
              Dos pulsaciones deliberadas, una familia informada y una persona que asume la respuesta.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Step n="01" icon="◎" title="Presiona dos veces" text="Una pulsación aislada no inicia nada. El segundo toque, después de soltar el botón y dentro de tres segundos, inicia la solicitud." />
              <Step n="02" icon="↗" title="La red se entera" text="La versión operativa enviará el aviso a familiares elegidos y verificados, con el estado visible para la red." />
              <Step n="03" icon="✓" title="Alguien confirma" text="Un familiar podrá indicar que atenderá. Los demás sabrán quién asumió la respuesta." />
            </div>
            <p className="mt-8 text-sm text-[var(--color-text-secondary)]">
              El piloto web ya permite probar alertas, correos y confirmación familiar; la ESP32 se
              conectará en la última etapa.{" "}
              <Link href="/login" className="font-semibold text-[var(--color-primary)]">Explorar la vista previa pública →</Link>
            </p>
          </div>
        </section>

        {/* ── Para cada integrante ── */}
        <section id="familias" className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <Eyebrow>Hecho para cuidarnos</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight">
              Una experiencia que entiende a <span className="accent text-[var(--color-primary)]">toda la familia.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-[var(--color-text-secondary)]">
              Pulso se diseña alrededor de tres conversaciones: pedir ayuda, saber quién responde y
              preguntar cómo estuvo el día.
            </p>
            <Link href="/login" className="mt-5 inline-block font-semibold text-[var(--color-primary)]">
              Conoce el recorrido ↗
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <NumberedCard n="01" title="Para quien está en casa" text="Un botón sencillo y una pantalla con texto grande, contraste y estados claros." />
            <NumberedCard n="02" title="Para familiares" text="Un lugar para entender el aviso y saber quién se encargará de responder." />
            <NumberedCard n="03" title="Para personas cuidadoras" text="Un chequeo voluntario para abrir conversaciones cotidianas, sin dar diagnósticos." />
          </div>
        </section>

        {/* ── El contexto (verde petróleo) ── */}
        <section id="contexto" style={{ background: "var(--color-primary)" }} className="text-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-mint)]">El contexto importa</p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight">
              Empezamos en CDMX. <span className="accent text-[var(--color-mint)]">Pensamos en LATAM.</span>
            </h2>
            <p className="mt-3 max-w-xl text-lg text-white/80">
              Datos públicos para entender la escala; no son resultados ni usuarios de Pulso.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <StatDark value="9.2 M" label="personas vivían en Ciudad de México en 2020" href="https://www.inegi.org.mx/app/saladeprensa/noticia.html?id=6288" source="INEGI · Censo 2020" />
              <StatDark value="24/7" label="el 911 de CDMX atiende urgencias médicas" href="https://datos.cdmx.gob.mx/dataset/llamadas-numero-de-atencion-a-emergencias-911" source="C5 Ciudad de México" />
              <StatDark value="88.6 M" label="personas de 60 años o más vivían en LATAM y el Caribe en 2022" href="https://www.cepal.org/es/enfoques/panorama-envejecimiento-tendencias-demograficas-america-latina-caribe" source="CEPAL · 2022" />
            </div>
          </div>
        </section>

        {/* ── Más allá de una alerta (bienestar) ── */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid overflow-hidden rounded-3xl border border-[var(--color-border-soft)] md:grid-cols-2">
            <div className="relative flex items-center justify-center bg-[var(--color-mint-soft)] p-12">
              <span aria-hidden className="absolute left-8 top-10 text-2xl text-[var(--color-mint)]">✳</span>
              <span aria-hidden className="absolute bottom-10 right-10 text-2xl text-[var(--color-mint)]">✳</span>
              <div className="flex h-52 w-52 flex-col items-center justify-center gap-3 rounded-full bg-[var(--color-surface)] shadow-lg">
                <span className="text-5xl text-[var(--color-primary)]">♥</span>
                <span className="text-3xl tracking-widest text-[var(--color-mint)]">▁▃▅▂▄</span>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] p-12">
              <Eyebrow>Más allá de una alerta</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight">
                Cuidar también es <span className="accent text-[var(--color-primary)]">preguntar cómo estás.</span>
              </h2>
              <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
                El chequeo diario ayuda a conversar sobre cambios en el bienestar. Es voluntario y no
                reemplaza una valoración médica.
              </p>
              <Link href="/login" className="mt-6 inline-block rounded-xl border border-[var(--color-border)] px-6 py-3 font-semibold text-[var(--color-text)]">
                Entrar al chequeo ↗
              </Link>
            </div>
          </div>
        </section>

        {/* ── Confianza ── */}
        <section id="confianza" className="border-t border-[var(--color-border-soft)] bg-[var(--color-surface)]">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
            <div>
              <Eyebrow>Diseñado con responsabilidad</Eyebrow>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight">
                La confianza se construye con <span className="accent text-[var(--color-primary)]">límites claros.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-[var(--color-text-secondary)]">
              <p>
                Pulso está en desarrollo. La demostración pública no envía mensajes; el piloto
                autenticado puede enviar alertas de simulación únicamente a testers registrados. No
                tenemos convenio con autoridades ni conexión automática al 911.
              </p>
              <p>
                Stellar registra una prueba de integridad del incidente; los datos clínicos, correos,
                domicilios e IP quedan fuera de la cadena.
              </p>
              <a href="/pulso-white-paper.md" download className="font-semibold text-[var(--color-primary)]">
                Descargar el white paper (.md) ↗
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mx-auto w-full max-w-3xl px-6 py-20">
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <h2 className="mt-4 text-4xl font-extrabold">Lo esencial, sin dudas.</h2>
          <div className="mt-8 flex flex-col divide-y divide-[var(--color-border-soft)] border-y border-[var(--color-border-soft)]">
            <Faq q="¿Qué ocurre si presiono el botón solo una vez?" a="Una sola pulsación no inicia nada. Hace falta un segundo toque, tras soltar y dentro de tres segundos, para iniciar la solicitud. En la versión web equivale a mantener presionado el botón." />
            <Faq q="¿Pulso llama automáticamente al 911?" a="No. Pulso avisa a tu red familiar; un familiar decide llamar al 911 y registra esa llamada. No tenemos convenio con autoridades ni conexión automática." />
            <Faq q="¿La demostración ya utiliza el dispositivo real?" a="Hoy el flujo se recorre desde el teléfono con tu red. La conexión con la ESP32 real llegará en la última etapa del piloto." />
            <Faq q="¿Qué sucede si se va la luz o falla el Wi-Fi?" a="El dispositivo no puede enviar la alerta sin red. En ese caso hay que llamar al 911. La batería y el respaldo de conectividad son una fase futura." />
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="border-t border-[var(--color-border-soft)] bg-[var(--color-surface)]">
          <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
            <Eyebrow center>Conoce Pulso</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight">
              Una red preparada empieza <span className="accent text-[var(--color-primary)]">con una conversación.</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Explora cómo se vería una solicitud de ayuda y la confirmación familiar.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/login" className="rounded-xl bg-[var(--color-primary)] px-8 py-4 text-lg font-semibold text-white">
                Ver demostración ↗
              </Link>
            </div>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Vista previa interactiva. La conexión con la ESP32 real llegará en la última etapa.
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--color-text)" }} className="text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1.5fr]">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/pulso-mark.svg" alt="" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-extrabold">Pulso<span className="text-[var(--color-mint)]">.</span></span>
            </div>
            <p className="mt-3 text-white/70">Tu red de apoyo en dos toques.</p>
            <p className="mt-2 text-sm text-white/50">Prototipo en desarrollo · Piloto propuesto en CDMX</p>
          </div>
          <nav aria-label="Enlaces" className="flex flex-col gap-2 text-white/80">
            <Link href="/login" className="hover:text-white">Entrar a Pulso</Link>
            <Link href="/login" className="hover:text-white">Demostración</Link>
            <Link href="/login" className="hover:text-white">Chequeo diario</Link>
            <Link href="/login" className="hover:text-white">Red de contactos</Link>
            <a href="/pulso-white-paper.md" download className="hover:text-white">Descargar white paper (.md)</a>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">Repositorio ↗</a>
          </nav>
          <div className="rounded-2xl bg-white/5 p-5">
            <p className="font-semibold">¿Es una emergencia real?</p>
            <p className="mt-2 text-sm text-white/70">
              En México, llama al 911. Pulso puede avisar a tu red durante el piloto, pero no realiza
              esa llamada por ti.
            </p>
            <a href="tel:911" className="mt-4 inline-block rounded-lg border border-[var(--color-danger)] px-4 py-2 font-semibold text-[#ff9a90]">
              Llamar al 911 ↗
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p className={`text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)] ${center ? "text-center" : ""}`}>
      {children}
    </p>
  );
}

function Step({ n, icon, title, text }: { n: string; icon: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-background)] p-7">
      <p className="text-sm font-bold text-[var(--color-text-secondary)]">{n}</p>
      <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-mint-soft)] text-2xl text-[var(--color-primary)]">
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-[var(--color-text-secondary)]">{text}</p>
    </div>
  );
}

function NumberedCard({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-mint-soft)] text-sm font-bold text-[var(--color-primary)]">
        {n}
      </span>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-[var(--color-text-secondary)]">{text}</p>
      </div>
    </div>
  );
}

function StatDark({ value, label, href, source }: { value: string; label: string; href: string; source: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
      <p className="text-4xl font-extrabold text-[var(--color-mint)]">{value}</p>
      <p className="mt-3 text-white/80">{label}</p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-[var(--color-mint)] underline">
        {source} ↗
      </a>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
        {q}
        <span className="text-2xl text-[var(--color-primary)] transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-[var(--color-text-secondary)]">{a}</p>
    </details>
  );
}
