import { SignIn } from '@clerk/nextjs'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'
import { CLERK_APPEARANCE_CLARO } from '../../../../components/theme/ThemedClerkProvider'

export default function EntrarClientePage() {
  return (
    <AuthDoorShell titulo="Área do cliente" descricao="Entre pra agendar seu horário.">
      <SignIn
        path="/entrar/cliente"
        routing="path"
        signUpUrl="/cadastro/cliente"
        fallbackRedirectUrl="/cliente"
        appearance={CLERK_APPEARANCE_CLARO}
      />
    </AuthDoorShell>
  )
}
