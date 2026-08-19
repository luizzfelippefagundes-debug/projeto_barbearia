import { SignIn } from '@clerk/nextjs'
import { Crown } from 'lucide-react'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'

export default function EntrarDonoPage() {
  return (
    <AuthDoorShell icon={Crown} titulo="Painel do dono" descricao="Acesse a gestão completa da barbearia.">
      <SignIn
        path="/entrar/dono"
        routing="path"
        signUpUrl="/cadastro/dono"
        fallbackRedirectUrl="/admin"
      />
    </AuthDoorShell>
  )
}
