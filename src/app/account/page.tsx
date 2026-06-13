import { redirect } from "next/navigation";
import { ImportProgressCard } from "@/components/auth/import-progress-card";
import { logoutAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?message=Inicia+sesión+para+ver+tu+cuenta.");
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-black uppercase tracking-wide text-ember">Mi cuenta</p>
        <h1 className="mt-2 text-3xl font-black">{user.displayName}</h1>
        <p className="mt-2 text-slate-600">{user.email}</p>
        {params.message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{params.message}</p> : null}
        <form action={logoutAction} className="mt-6">
          <button className="rounded-xl border border-line-soft px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
            Cerrar sesión
          </button>
        </form>
      </section>
      <ImportProgressCard />
    </div>
  );
}
