import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f8f4ed] px-5 py-10 text-stone-950">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-stone-500">
          ICONARY
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">
          Admin Panel
        </h1>

        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
          Manage your mockup library tools from here.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/autofill"
            className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
              Auto Fill
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Auto Fill from Etsy
            </h2>

            <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
              Paste an Etsy product link, auto-fill fields, then add file number
              and Drive link.
            </p>

            <div className="mt-5 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white">
              Open Auto Fill
            </div>
          </Link>

          <Link
            href="/admin/manage"
            className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
              Manage
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Manage Mockups
            </h2>

            <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
              Add mockups manually, edit existing records, delete wrong entries
              and manage your library.
            </p>

            <div className="mt-5 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white">
              Open Manage
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
              Website
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              View Mockup Finder
            </h2>

            <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
              Go back to the customer-facing mockup finder page.
            </p>

            <div className="mt-5 inline-flex rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950">
              Open Website
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}