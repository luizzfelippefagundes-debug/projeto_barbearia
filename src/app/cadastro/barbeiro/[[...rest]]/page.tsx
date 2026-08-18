import { SignUp } from '@clerk/nextjs'
import { Scissors } from 'lucide-react'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'

export default function CadastroBarbeiroPage() {
  return (
    <AuthDoorShell
      icon={Scissors}
      titulo="Área do barbeiro"
      descricao="Use o mesmo e-mail que o dono cadastrou pra criar sua conta."
    >
      <SignUp
        path="/cadastro/barbeiro"
        routing="path"
        signInUrl="/entrar/barbeiro"
        fallbackRedirectUrl="/barbeiro"
      />
    </AuthDoorShell>
  )
}
