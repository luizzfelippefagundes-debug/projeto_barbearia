'use client'

import { useState, useTransition, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'
import { Button, Input } from '../../components/ui'
import { pagarMinhaAssinaturaComCartao, type FormularioCartao } from '../../actions/assinar.actions'
import { formatBRL } from '../../lib/format'

const digitos = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max)

const mascaras = {
  numero: (v: string) => digitos(v, 19).replace(/(\d{4})(?=\d)/g, '$1 '),
  validade: (v: string) => digitos(v, 4).replace(/^(\d{2})(\d)/, '$1/$2'),
  cvv: (v: string) => digitos(v, 4),
  cpfTitular: (v: string) => digitos(v, 14),
  cep: (v: string) => digitos(v, 8).replace(/^(\d{5})(\d)/, '$1-$2'),
  telefone: (v: string) => digitos(v, 11),
} satisfies Partial<Record<keyof FormularioCartao, (v: string) => string>>

interface CartaoFormProps {
  assinaturaId: string
  valor: number
  cpfInicial?: string
  telefoneInicial?: string
  onVoltar: () => void
}

export function CartaoForm({ assinaturaId, valor, cpfInicial, telefoneInicial, onVoltar }: CartaoFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [pago, setPago] = useState(false)
  const [form, setForm] = useState<FormularioCartao>({
    nomeNoCartao: '',
    numero: '',
    validade: '',
    cvv: '',
    cpfTitular: digitos(cpfInicial ?? '', 14),
    cep: '',
    numeroEndereco: '',
    telefone: (telefoneInicial ?? '').replace(/\D/g, '').slice(-11),
  })

  function campo(nome: keyof FormularioCartao) {
    const mascara = mascaras[nome as keyof typeof mascaras]
    return {
      id: `cartao-${nome}`,
      value: form[nome],
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [nome]: mascara ? mascara(e.target.value) : e.target.value })),
    }
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    startTransition(async () => {
      const resultado = await pagarMinhaAssinaturaComCartao(assinaturaId, form)
      if ('error' in resultado) {
        setErro(resultado.error)
        return
      }
      setPago(true)
      router.refresh()
    })
  }

  if (pago) {
    return (
      <p className="text-sm text-text-secondary">
        Pagamento enviado! Assim que o cartão for aprovado sua assinatura fica ativa, e os próximos meses são
        cobrados automaticamente nesse cartão.
      </p>
    )
  }

  return (
    <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-3 text-left">
      <button
        type="button"
        onClick={onVoltar}
        className="flex items-center gap-1 self-start text-xs text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Voltar
      </button>

      <Input label="Nome impresso no cartão" autoComplete="cc-name" {...campo('nomeNoCartao')} />
      <Input label="Número do cartão" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" {...campo('numero')} />
      <div className="flex gap-3">
        <Input label="Validade" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" {...campo('validade')} />
        <Input label="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="123" {...campo('cvv')} />
      </div>
      <Input label="CPF do titular do cartão" inputMode="numeric" {...campo('cpfTitular')} />
      <div className="flex gap-3">
        <Input label="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" {...campo('cep')} />
        <Input label="Nº do endereço" {...campo('numeroEndereco')} />
      </div>
      <Input label="Telefone com DDD" inputMode="tel" autoComplete="tel-national" {...campo('telefone')} />

      {erro && <p className="text-xs text-status-red">{erro}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Processando...' : `Pagar ${formatBRL(valor)}`}
      </Button>

      <p className="flex items-center justify-center gap-1 text-center text-xs text-text-secondary">
        <Lock size={12} aria-hidden="true" />
        Pagamento processado pelo Asaas. Os próximos meses serão cobrados automaticamente neste cartão.
      </p>
    </form>
  )
}
