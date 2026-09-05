import { SignIn } from '@clerk/nextjs'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'
import { CLERK_APPEARANCE_CLARO } from '../../../../components/theme/ThemedClerkProvider'

export default function EntrarDonoPage() {
  return (
    <AuthDoorShell titulo="Painel do dono" descricao="Acesse a gestão completa da barbearia.">
      <SignIn
        path="/entrar/dono"
        routing="path"
        signUpUrl="/cadastro/dono"
        fallbackRedirectUrl="/admin"
        appearance={CLERK_APPEARANCE_CLARO}
      />
    </AuthDoorShell>
  )
}
