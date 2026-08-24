import { SignUp } from '@clerk/nextjs'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'

export default function CadastroDonoPage() {
  return (
    <AuthDoorShell titulo="Painel do dono" descricao="Crie sua conta de dono da barbearia.">
      <SignUp
        path="/cadastro/dono"
        routing="path"
        signInUrl="/entrar/dono"
        fallbackRedirectUrl="/admin"
      />
    </AuthDoorShell>
  )
}
