'use client'

import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button, IconButton, Input, Modal } from '../../components/ui'
import { atualizarServico, criarServico } from '../../actions/servicos.actions'
import type { Servico } from '../../types'

export function ServicoFormModal({ servico }: { servico?: Servico }) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(servico?.nome ?? '')
  const [duracaoMin, setDuracaoMin] = useState(servico?.duracaoMin ?? 30)
  const [preco, setPreco] = useState(servico?.precoAvulso ?? 0)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function fecharTudo() {
    setOpen(false)
    setErro(null)
    if (!servico) {
      setNome('')
      setDuracaoMin(30)
      setPreco(0)
    }
  }

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Digite o nome do serviço.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (servico) {
        await atualizarServico(servico.id, nome, duracaoMin, preco)
      } else {
        await criarServico(nome, duracaoMin, preco)
      }
      fecharTudo()
    } catch {
      setErro('Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      {servico ? (
        <IconButton icon={<Pencil size={14} aria-hidden="true" />} label="Editar serviço" onClick={() => setOpen(true)} />
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Novo serviço
        </Button>
      )}

      <Modal open={open} onClose={fecharTudo} title={servico ? 'Editar serviço' : 'Novo serviço'}>
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Cabelo" />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duração (min)"
              type="number"
              min={5}
              value={duracaoMin}
              onChange={(e) => setDuracaoMin(Number(e.target.value))}
            />
            <Input
              label="Preço avulso (R$)"
              type="number"
              min={0}
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(Number(e.target.value))}
            />
          </div>
          <p className="text-xs text-text-secondary">
            Pra incluir esse serviço em algum plano de assinatura (com ou sem limite mensal), vá em{' '}
            <span className="text-text-primary">Assinaturas</span>.
          </p>
          {erro && <p className="text-xs text-status-red">{erro}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={fecharTudo}>
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
