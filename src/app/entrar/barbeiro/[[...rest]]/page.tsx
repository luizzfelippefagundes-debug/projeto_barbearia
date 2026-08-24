import { SignIn } from '@clerk/nextjs'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'

export default function EntrarBarbeiroPage() {
  return (
    <AuthDoorShell titulo="Área do barbeiro" descricao="Entre com o e-mail que o dono cadastrou pra você.">
      <SignIn
        path="/entrar/barbeiro"
        routing="path"
        signUpUrl="/cadastro/barbeiro"
        fallbackRedirectUrl="/barbeiro"
      />
    </AuthDoorShell>
  )
}
