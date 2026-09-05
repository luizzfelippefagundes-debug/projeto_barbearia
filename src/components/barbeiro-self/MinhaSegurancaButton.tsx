'use client'

import { useClerk } from '@clerk/nextjs'
import { Lock } from 'lucide-react'
import { Button } from '../../components/ui'

/** Abre a tela nativa do Clerk pra trocar senha/segurança — evita
 * reimplementar esse fluxo (validação de senha atual, força da senha
 * nova etc.), que o Clerk já resolve com segurança. */
export function MinhaSegurancaButton() {
  const { openUserProfile } = useClerk()

  return (
    <Button variant="secondary" size="sm" onClick={() => openUserProfile()}>
      <Lock size={14} aria-hidden="true" />
      Alterar senha / segurança
    </Button>
  )
}
