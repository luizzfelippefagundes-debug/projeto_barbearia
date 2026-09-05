import { SignUp } from '@clerk/nextjs'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'
import { CLERK_APPEARANCE_CLARO } from '../../../../components/theme/ThemedClerkProvider'

export default function CadastroClientePage() {
  return (
    <AuthDoorShell titulo="Área do cliente" descricao="Crie sua conta pra agendar horários.">
      <SignUp
        path="/cadastro/cliente"
        routing="path"
        signInUrl="/entrar/cliente"
        fallbackRedirectUrl="/cliente"
        appearance={CLERK_APPEARANCE_CLARO}
      />
    </AuthDoorShell>
  )
}
