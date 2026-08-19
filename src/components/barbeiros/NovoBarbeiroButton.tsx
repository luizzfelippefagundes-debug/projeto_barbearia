'use client'

import { useState } from 'react'
import { Camera, CheckCircle2, Plus } from 'lucide-react'
import { Avatar, Button, Input, Modal } from '../../components/ui'
import { criarBarbeiro } from '../../actions/barbeiros.actions'

export function NovoBarbeiroButton() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [comissao, setComissao] = useState(45)
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | undefined>(undefined)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<{ nome: string; conviteEnviado: boolean } | null>(null)

  function fecharTudo() {
    setOpen(false)
    setNome('')
    setEmail('')
    setComissao(45)
    setFoto(null)
    setFotoPreviewUrl(undefined)
    setSucesso(null)
    setErro(null)
  }

  function handleEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setFoto(arquivo)
    setFotoPreviewUrl(URL.createObjectURL(arquivo))
  }

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
      const resultado = await criarBarbeiro(nome, comissao, email, foto ?? undefined)
      setSucesso({ nome: resultado.nome, conviteEnviado: resultado.conviteEnviado })
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

      <Modal open={open} onClose={fecharTudo} title="Novo barbeiro">
        {sucesso ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 size={32} className="text-status-green" aria-hidden="true" />
            <div>
              <p className="text-sm text-text-primary">{sucesso.nome} foi cadastrado.</p>
              <p className="mt-1 text-xs text-text-secondary">
                {sucesso.conviteEnviado
                  ? 'Um e-mail de convite foi enviado — ele só consegue criar a conta pelo link desse e-mail.'
                  : 'Não deu pra enviar o e-mail agora (talvez esse e-mail já tenha conta). O acesso continua ligado automaticamente no primeiro login dele.'}
              </p>
            </div>
            <Button size="sm" onClick={fecharTudo}>
              Entendi
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3">
              <span className="relative">
                <Avatar nome={nome || '?'} src={fotoPreviewUrl} size="lg" />
                <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-secondary">
                  <Camera size={12} aria-hidden="true" />
                </span>
              </span>
              <span className="text-xs text-text-secondary">
                {fotoPreviewUrl ? 'Trocar foto' : 'Adicionar foto (opcional)'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleEscolherFoto} />
            </label>
            <Input
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do barbeiro"
            />
            <Input
              label="E-mail (vamos convidar por aqui)"
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
              O cadastro de barbeiro não é aberto — só entra quem recebe o convite por e-mail.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={fecharTudo}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Enviando convite...' : 'Cadastrar e convidar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
