'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Input, Modal } from '../../components/ui'
import { criarPlano } from '../../actions/assinaturas.actions'

export function NovoPlanoButton() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [valorMensal, setValorMensal] = useState(0)
  const [cortesInclusos, setCortesInclusos] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Digite o nome do plano.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const cortes = cortesInclusos.trim() === '' ? null : Number(cortesInclusos)
      await criarPlano(nome, valorMensal, cortes)
      setNome('')
      setValorMensal(0)
      setCortesInclusos('')
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
        Novo plano
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo plano de assinatura">
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            label="Valor mensal (R$)"
            type="number"
            min={0}
            step="0.01"
            value={valorMensal}
            onChange={(e) => setValorMensal(Number(e.target.value))}
          />
          <Input
            label="Cortes inclusos (deixe vazio para ilimitado)"
            type="number"
            min={0}
            value={cortesInclusos}
            onChange={(e) => setCortesInclusos(e.target.value)}
          />
          {erro && <p className="text-xs text-status-red">{erro}</p>}
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
