export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 pb-12 sm:px-6 lg:px-8 xl:px-10" aria-busy="true" aria-label="Memuat Darinol">
      <div className="mx-auto mt-4 h-14 w-full max-w-[1520px] rounded-2xl border border-darinol-border/60 bg-darinol-surface/60" />
      <section className="mx-auto grid w-full max-w-[1520px] gap-10 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
        <div className="space-y-5">
          <span className="skeleton block h-3 w-40 rounded-full" />
          <span className="skeleton block h-14 max-w-xl rounded-xl sm:h-20" />
          <span className="skeleton block h-4 max-w-md rounded-full" />
          <span className="skeleton block h-4 w-3/4 max-w-sm rounded-full" />
          <div className="flex gap-3 pt-2"><span className="skeleton h-12 w-36 rounded-xl" /><span className="skeleton h-12 w-28 rounded-xl" /></div>
        </div>
        <div className="rounded-3xl border border-darinol-border/60 bg-darinol-surface/40 p-5">
          <span className="skeleton block h-5 w-36 rounded" />
          <span className="skeleton mt-6 block h-40 rounded-2xl" />
          <div className="mt-6 space-y-4">{Array.from({ length: 3 }).map((_, index) => <span key={index} className="skeleton block h-10 rounded-xl" />)}</div>
        </div>
      </section>
      <div className="mx-auto grid w-full max-w-[1520px] gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-2xl border border-darinol-border/60 bg-darinol-surface/40 p-4">{Array.from({ length: 6 }).map((_, index) => <span key={index} className="skeleton block h-14 rounded-xl" />)}</div>
        <div className="skeleton min-h-80 rounded-2xl" />
      </div>
      <span className="sr-only" role="status">Memuat sinyal tren terbaru</span>
    </main>
  );
}