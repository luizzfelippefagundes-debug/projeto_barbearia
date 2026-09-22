'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { Button, Card, Input } from '../../components/ui'
import { atualizarMeuTelefone } from '../../actions/perfil.actions'

export function CadastrarWhatsappCard({ titulo = 'Cadastre seu WhatsApp' }: { titulo?: string }) {
  const router = useRouter()
  const [telefone, setTelefone] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSalvar() {
    setSalvando(true)
    setErro(null)
    try {
      await atualizarMeuTelefone(telefone)
      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setSalvando(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent text-accent">
          <MessageCircle size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">{titulo}</p>
          <p className="text-xs text-text-secondary">
            Vamos te avisar dos seus horários marcados nesse número. Se você já agendou pelo WhatsApp antes, seu
            histórico é trazido pra cá.
          </p>
        </div>
      </div>

      <Input
        label="WhatsApp (com DDD)"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="(11) 99999-9999"
        inputMode="tel"
      />

      {erro && <p className="text-xs text-status-red">{erro}</p>}

      <Button onClick={handleSalvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar'}
      </Button>
    </Card>
  )
}
