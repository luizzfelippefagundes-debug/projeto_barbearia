import { SignIn } from '@clerk/nextjs'
import { CalendarDays } from 'lucide-react'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'

export default function EntrarClientePage() {
  return (
    <AuthDoorShell icon={CalendarDays} titulo="Área do cliente" descricao="Entre pra agendar seu horário.">
      <SignIn
        path="/entrar/cliente"
        routing="path"
        signUpUrl="/cadastro/cliente"
        fallbackRedirectUrl="/cliente"
      />
    </AuthDoorShell>
  )
}
