import { SignUp } from '@clerk/nextjs'
import { MailWarning, Scissors } from 'lucide-react'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'
import { Card } from '../../../../components/ui'

export default async function CadastroBarbeiroPage({
  searchParams,
}: {
  searchParams: Promise<{ __clerk_ticket?: string }>
}) {
  const { __clerk_ticket: temConvite } = await searchParams

  return (
    <AuthDoorShell
      icon={Scissors}
      titulo="Área do barbeiro"
      descricao="Esse cadastro não é aberto — só entra quem recebe um convite do dono."
    >
      {temConvite ? (
        <SignUp
          path="/cadastro/barbeiro"
          routing="path"
          signInUrl="/entrar/barbeiro"
          fallbackRedirectUrl="/barbeiro"
        />
      ) : (
        <Card className="flex max-w-sm flex-col items-center gap-2 p-6 text-center">
          <MailWarning size={24} className="text-status-amber" aria-hidden="true" />
          <p className="text-sm text-text-primary">Convite necessário</p>
          <p className="text-xs text-text-secondary">
            Peça pro dono te cadastrar em Barbeiros — você vai receber um e-mail com o link de
            convite pra criar sua conta.
          </p>
        </Card>
      )}
    </AuthDoorShell>
  )
}
