'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink, QrCode } from 'lucide-react'
import { Button, Card, Input } from '../ui'
import { PixPaymentCard } from '../assinar/PixPaymentCard'
import { formatBRL } from '../../lib/format'
import {
  buscarLinkCartaoDaMensalidade,
  buscarPixDaMensalidade,
  iniciarPagamentoPlataforma,
} from '../../actions/cobrancaPlataforma.actions'

const VALOR_MENSALIDADE = 250

export function PagamentoPlataformaCard({
  cobrancaJaIniciada,
  cpfAtual,
}: {
  cobrancaJaIniciada: boolean
  cpfAtual: string
}) {
  const [etapa, setEtapa] = useState<'cpf' | 'escolher'>(cobrancaJaIniciada ? 'escolher' : 'cpf')
  const [cpf, setCpf] = useState(cpfAtual)
  const [carregando, setCarregando] = useState<'iniciar' | 'pix' | 'cartao' | null>(null)
  const [pix, setPix] = useState<{ encodedImage: string; payload: string } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function confirmarCpf() {
    setCarregando('iniciar')
    setErro(null)
    try {
      const resultado = await iniciarPagamentoPlataforma(cpf)
      if (resultado.error) {
        setErro(resultado.error)
        return
      }
      setEtapa('escolher')
    } catch {
      setErro('Não foi possível iniciar a cobrança.')
    } finally {
      setCarregando(null)
    }
  }

  async function pagarComPix() {
    setCarregando('pix')
    setErro(null)
    try {
      const dados = await buscarPixDaMensalidade()
      if ('error' in dados) {
        setErro(dados.error)
        return
      }
      setPix({ encodedImage: dados.encodedImage, payload: dados.payload })
    } catch {
      setErro('Não foi possível gerar o Pix agora.')
    } finally {
      setCarregando(null)
    }
  }

  async function pagarComCartao() {
    setCarregando('cartao')
    setErro(null)
    try {
      const resultado = await buscarLinkCartaoDaMensalidade()
      if ('error' in resultado) {
        setErro(resultado.error)
        setCarregando(null)
        return
      }
      window.location.href = resultado.invoiceUrl
    } catch {
      setErro('Não foi possível preparar o pagamento com cartão agora.')
      setCarregando(null)
    }
  }

  if (pix) return <PixPaymentCard encodedImage={pix.encodedImage} payload={pix.payload} />

  if (etapa === 'cpf') {
    return (
      <Card className="flex flex-col gap-4 p-6">
        <div>
          <p className="text-xs text-text-secondary">Mensalidade</p>
          <p className="mono-value text-2xl text-accent">{formatBRL(VALOR_MENSALIDADE)}/mês</p>
        </div>
        <Input
          label="CPF ou CNPJ da barbearia"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="000.000.000-00"
          inputMode="numeric"
        />
        {erro && <p className="text-xs text-status-red">{erro}</p>}
        <Button onClick={confirmarCpf} disabled={carregando !== null}>
          {carregando === 'iniciar' ? 'Gerando cobrança...' : 'Continuar'}
        </Button>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <div>
        <p className="text-xs text-text-secondary">Valor a pagar</p>
        <p className="mono-value text-2xl text-accent">{formatBRL(VALOR_MENSALIDADE)}</p>
      </div>

      <p className="text-sm text-text-secondary">Como você quer pagar?</p>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button onClick={pagarComPix} disabled={carregando !== null}>
          <QrCode size={16} aria-hidden="true" />
          {carregando === 'pix' ? 'Gerando Pix...' : 'Pagar com Pix'}
        </Button>
        <Button variant="secondary" onClick={pagarComCartao} disabled={carregando !== null}>
          <CreditCard size={16} aria-hidden="true" />
          {carregando === 'cartao' ? 'Preparando...' : 'Pagar com cartão'}
          <ExternalLink size={14} aria-hidden="true" />
        </Button>
      </div>

      {erro && <p className="text-xs text-status-red">{erro}</p>}

      <p className="text-xs text-text-secondary">
        Assim que o pagamento for confirmado, o acesso libera automaticamente.
      </p>
    </Card>
  )
}
