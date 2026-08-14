export default function Home() {
  return (
    <div className="min-h-screen bg-bg p-8 text-text-primary">
      <div className="card max-w-md space-y-3 p-6">
        <h1 className="text-2xl text-accent">Barbearia</h1>
        <p className="font-body text-text-secondary">
          Smoke test do Next.js — tokens visuais e fontes.
        </p>
        <p className="mono-value text-brass">R$ 129,90</p>
        <div className="flex gap-2">
          <span className="rounded border border-status-green bg-status-green-muted px-2 py-1 text-status-green">
            confirmado
          </span>
          <span className="rounded border border-status-amber bg-status-amber-muted px-2 py-1 text-status-amber">
            aguardando
          </span>
          <span className="rounded border border-status-red bg-status-red-muted px-2 py-1 text-status-red">
            atrasado
          </span>
        </div>
      </div>
    </div>
  );
}
