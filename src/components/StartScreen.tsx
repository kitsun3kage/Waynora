import { ArrowRight, Navigation } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({
  onStart,
}: StartScreenProps) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-blue-600/20 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 animate-[float_4s_ease-in-out_infinite] items-center justify-center rounded-[30px] bg-gradient-to-br from-violet-500 to-blue-600 shadow-2xl shadow-violet-900/40">
            <Navigation
              size={44}
              strokeWidth={2.2}
              className="rotate-[-20deg]"
            />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
            Nawigacja nowej generacji
          </p>

          <h1 className="text-6xl font-black tracking-[-0.06em]">
            Waynora
          </h1>

          <p className="mx-auto mt-6 max-w-sm text-lg leading-8 text-slate-400">
            Znajdź drogę. Ruszaj pewnie. Docieraj tam,
            gdzie chcesz.
          </p>

          <button
            type="button"
            onClick={onStart}
            className="group mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-950 shadow-xl transition hover:scale-[1.02] hover:bg-slate-100 active:scale-[0.98]"
          >
            Rozpocznij

            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

          <p className="mt-5 text-xs text-slate-600">
            Waynora korzysta z OpenStreetMap i publicznych
            usług mapowych.
          </p>
        </div>
      </div>
    </main>
  );
}