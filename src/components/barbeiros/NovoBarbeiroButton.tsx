'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Input, Modal } from '../../components/ui'
import { criarBarbeiro } from '../../actions/barbeiros.actions'

export function NovoBarbeiroButton() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [comissao, setComissao] = useState(40)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Digite o nome do barbeiro.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setErro('Digite um e-mail válido — é com ele que o barbeiro vai entrar.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await criarBarbeiro(nome, comissao, email)
      setNome('')
      setEmail('')
      setComissao(40)
      setOpen(false)
    } catch {
      setErro('Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" />
        Novo barbeiro
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo barbeiro">
        <div className="flex flex-col gap-4">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do barbeiro"
          />
          <Input
            label="E-mail (o barbeiro vai entrar com esse e-mail)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="barbeiro@email.com"
          />
          <Input
            label="Comissão inicial (%)"
            type="number"
            min={20}
            max={70}
            value={comissao}
            onChange={(e) => setComissao(Number(e.target.value))}
          />
          {erro && <p className="text-xs text-status-red">{erro}</p>}
          <p className="text-xs text-text-secondary">
            Depois de salvar, avise o barbeiro pra criar a conta em {typeof window !== 'undefined' ? window.location.origin : ''}
            /sign-up usando esse mesmo e-mail — o acesso é ligado automaticamente no primeiro login.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
