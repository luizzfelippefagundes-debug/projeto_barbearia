'use client'

import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button, IconButton, Input, Modal } from '../../components/ui'
import { atualizarPlano, criarPlano } from '../../actions/assinaturas.actions'
import type { PlanoAssinatura, Servico } from '../../types'

interface SelecaoServico {
  selecionado: boolean
  limiteMensal: string
}

function selecoesIniciais(plano?: PlanoAssinatura): Record<string, SelecaoServico> {
  if (!plano) return {}
  const iniciais: Record<string, SelecaoServico> = {}
  for (const inclusao of plano.servicosInclusos) {
    iniciais[inclusao.servicoId] = {
      selecionado: true,
      limiteMensal: inclusao.limiteMensal != null ? String(inclusao.limiteMensal) : '',
    }
  }
  return iniciais
}

export function PlanoFormModal({ plano, servicos }: { plano?: PlanoAssinatura; servicos: Servico[] }) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(plano?.nome ?? '')
  const [valorMensal, setValorMensal] = useState(plano?.valorMensal ?? 0)
  const [selecoes, setSelecoes] = useState<Record<string, SelecaoServico>>(() => selecoesIniciais(plano))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function fecharTudo() {
    setOpen(false)
    setErro(null)
    if (!plano) {
      setNome('')
      setValorMensal(0)
      setSelecoes({})
    }
  }

  function toggleServico(servicoId: string) {
    setSelecoes((prev) => ({
      ...prev,
      [servicoId]: {
        selecionado: !prev[servicoId]?.selecionado,
        limiteMensal: prev[servicoId]?.limiteMensal ?? '',
      },
    }))
  }

  function setLimite(servicoId: string, limiteMensal: string) {
    setSelecoes((prev) => ({
      ...prev,
      [servicoId]: { selecionado: prev[servicoId]?.selecionado ?? true, limiteMensal },
    }))
  }

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Digite o nome do plano.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const servicosInclusos = Object.entries(selecoes)
        .filter(([, s]) => s.selecionado)
        .map(([servicoId, s]) => ({
          servicoId,
          limiteMensal: s.limiteMensal.trim() === '' ? null : Number(s.limiteMensal),
        }))
      if (plano) {
        await atualizarPlano(plano.id, nome, valorMensal, servicosInclusos)
      } else {
        await criarPlano(nome, valorMensal, servicosInclusos)
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
      {plano ? (
        <IconButton icon={<Pencil size={14} aria-hidden="true" />} label="Editar plano" onClick={() => setOpen(true)} />
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Novo plano
        </Button>
      )}

      <Modal open={open} onClose={fecharTudo} title={plano ? `Editar ${plano.nome}` : 'Novo plano de assinatura'}>
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: VIP" />
          <Input
            label="Valor mensal (R$)"
            type="number"
            min={0}
            step="0.01"
            value={valorMensal}
            onChange={(e) => setValorMensal(Number(e.target.value))}
          />

          <div>
            <p className="mb-2 text-sm text-text-primary">Serviços inclusos</p>
            {servicos.length === 0 ? (
              <p className="text-xs text-text-secondary">Cadastre serviços primeiro, em "Serviços".</p>
            ) : (
              <div className="flex flex-col gap-2">
                {servicos.map((servico) => {
                  const selecao = selecoes[servico.id]
                  return (
                    <div key={servico.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                      <label className="flex flex-1 items-center gap-2 text-sm text-text-primary">
                        <input
                          type="checkbox"
                          checked={selecao?.selecionado ?? false}
                          onChange={() => toggleServico(servico.id)}
                          className="h-4 w-4 rounded border-border"
                        />
                        {servico.nome}
                      </label>
                      {selecao?.selecionado && (
                        <input
                          type="number"
                          min={1}
                          placeholder="Sem limite"
                          value={selecao.limiteMensal}
                          onChange={(e) => setLimite(servico.id, e.target.value)}
                          className="w-28 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-text-secondary"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <p className="mt-1.5 text-xs text-text-secondary">
              Deixe o limite vazio pra sem limite mensal (ex: cabelo/barba/pezinho). Preencha só nos que têm
              cota, tipo "4" pra barboterapia 4x/mês.
            </p>
          </div>

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
