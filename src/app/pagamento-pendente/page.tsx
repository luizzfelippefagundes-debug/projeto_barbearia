export default function PagamentoPendentePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-text-primary">Pagamento pendente</h1>
        <p className="mt-3 text-text-secondary">
          A mensalidade do sistema está em atraso. O acesso ao painel fica temporariamente
          bloqueado até a confirmação do pagamento.
        </p>
        <p className="mt-6 text-sm text-text-secondary">
          Já pagou? Pode levar alguns minutos até confirmar automaticamente. Se o problema
          persistir, entre em contato pelo WhatsApp de suporte.
        </p>
      </div>
    </div>
  )
}
