import { SignUp } from '@clerk/nextjs'
import { Crown } from 'lucide-react'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'

export default function CadastroDonoPage() {
  return (
    <AuthDoorShell icon={Crown} titulo="Painel do dono" descricao="Crie sua conta de dono da barbearia.">
      <SignUp
        path="/cadastro/dono"
        routing="path"
        signInUrl="/entrar/dono"
        fallbackRedirectUrl="/admin"
      />
    </AuthDoorShell>
  )
}
