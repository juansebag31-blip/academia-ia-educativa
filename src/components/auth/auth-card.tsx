import Link from "next/link";

export function AuthCard({
  title,
  description,
  children,
  footer,
  error,
  message,
  visitorHref = "/",
  courseContext,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  error?: string;
  message?: string;
  visitorHref?: string;
  courseContext?: {
    title: string;
    description: string;
    href: string;
  };
}) {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-line-soft bg-white p-6 shadow-card sm:p-8">
      <p className="text-sm font-black uppercase tracking-wide text-ember">Cuenta gratuita</p>
      <h1 className="mt-2 text-3xl font-black">{title}</h1>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
      {courseContext ? (
        <div className="mt-5 rounded-2xl border border-[#0f766e]/20 bg-[#e8f5f2] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
            Continuar en
          </p>
          <p className="mt-1 text-lg font-black text-[#0b1f33]">{courseContext.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{courseContext.description}</p>
          <Link
            href={courseContext.href}
            className="focus-ring mt-3 inline-flex rounded-lg text-sm font-black text-[#0f766e] hover:text-[#0b1f33]"
          >
            Volver a la portada de AI Engineering Aplicado
          </Link>
        </div>
      ) : null}
      {error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {message ? <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</p> : null}
      <div className="mt-6">{children}</div>
      <div className="mt-6 border-t border-line-soft pt-5 text-sm text-slate-600">{footer}</div>
      <Link href={visitorHref} className="mt-5 inline-flex text-sm font-bold text-ember hover:underline">
        Continuar como visitante
      </Link>
    </section>
  );
}

export function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-line-soft bg-slate-50 px-4 py-3 outline-none focus:border-tech-cyan focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full rounded-xl bg-ember px-5 py-3 font-black text-white hover:bg-ember-dark">
      {children}
    </button>
  );
}
