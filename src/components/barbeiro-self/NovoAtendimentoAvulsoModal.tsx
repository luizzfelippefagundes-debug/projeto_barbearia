'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Barbeiro, Cliente, FormaPagamento, Servico } from '../../types'
import { Button, Input, Modal, Select } from '../../components/ui'
import { criarAtendimentoAvulso } from '../../actions/barbeiroSelf.actions'
import { CaixaPicker } from '../agenda/CaixaPicker'
import { FormaPagamentoPicker } from '../agenda/FormaPagamentoPicker'
import { TIME_SLOTS } from '../../lib/dateUtils'

export function NovoAtendimentoAvulsoModal({
  clientes,
  servicos,
  barbeiros,
  horaSugerida,
}: {
  clientes: Cliente[]
  servicos: Servico[]
  barbeiros: Barbeiro[]
  horaSugerida: string
}) {
  const [open, setOpen] = useState(false)
  const [modoNovoCliente, setModoNovoCliente] = useState(clientes.length === 0)
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? '')
  const [nomeNovo, setNomeNovo] = useState('')
  const [telefoneNovo, setTelefoneNovo] = useState('')
  const [servicoIds, setServicoIds] = useState<string[]>(servicos[0] ? [servicos[0].id] : [])
  const [hora, setHora] = useState(horaSugerida)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix')
  const [caixaDestinoBarbeiroId, setCaixaDestinoBarbeiroId] = useState(barbeiros[0]?.id ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function toggleServico(servicoId: string) {
    setServicoIds((prev) =>
      prev.includes(servicoId) ? prev.filter((id) => id !== servicoId) : [...prev, servicoId],
    )
  }

  function fechar() {
    setOpen(false)
    setErro(null)
    setNomeNovo('')
    setTelefoneNovo('')
  }

  async function handleConfirmar() {
    if (servicoIds.length === 0) {
      setErro('Escolha pelo menos um serviço.')
      return
    }
    if (modoNovoCliente && !nomeNovo.trim()) {
      setErro('Digite o nome do cliente.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await criarAtendimentoAvulso({
        clienteId: modoNovoCliente ? undefined : clienteId,
        nomeNovoCliente: modoNovoCliente ? nomeNovo : undefined,
        telefoneNovoCliente: modoNovoCliente ? telefoneNovo : undefined,
        servicoIds,
        hora,
        formaPagamento,
        caixaDestinoBarbeiroId,
      })
      fechar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível registrar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" />
        Novo atendimento avulso
      </Button>

      <Modal open={open} onClose={fechar} title="Atendimento avulso">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm text-text-primary">Cliente</p>
            {!modoNovoCliente && clientes.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setModoNovoCliente(true)}
                  className="self-start text-xs text-accent hover:underline"
                >
                  Cliente novo, sem cadastro
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Input label="Nome" value={nomeNovo} onChange={(e) => setNomeNovo(e.target.value)} />
                <Input
                  label="Telefone (opcional)"
                  value={telefoneNovo}
                  onChange={(e) => setTelefoneNovo(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                {clientes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModoNovoCliente(false)}
                    className="self-start text-xs text-accent hover:underline"
                  >
                    Escolher cliente já cadastrado
                  </button>
                )}
              </div>
            )}
          </div>

          <Select label="Horário" value={hora} onChange={(e) => setHora(e.target.value)}>
            {TIME_SLOTS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>

          <div>
            <p className="mb-2 text-sm text-text-primary">Serviços</p>
            <div className="flex flex-col gap-2">
              {servicos.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 rounded-xl border border-border p-2.5 text-sm text-text-primary"
                >
                  <input
                    type="checkbox"
                    checked={servicoIds.includes(s.id)}
                    onChange={() => toggleServico(s.id)}
                    className="h-4 w-4 rounded border-border"
                  />
                  {s.nome}
                </label>
              ))}
            </div>
          </div>

          <FormaPagamentoPicker value={formaPagamento} onChange={setFormaPagamento} />
          <CaixaPicker barbeiros={barbeiros} value={caixaDestinoBarbeiroId} onChange={setCaixaDestinoBarbeiroId} />

          {erro && <p className="text-xs text-status-red">{erro}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={fechar}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Registrar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
