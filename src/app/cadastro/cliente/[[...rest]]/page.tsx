import { SignUp } from '@clerk/nextjs'
import { CalendarDays } from 'lucide-react'
import { AuthDoorShell } from '../../../../components/auth/AuthDoorShell'

export default function CadastroClientePage() {
  return (
    <AuthDoorShell icon={CalendarDays} titulo="Área do cliente" descricao="Crie sua conta pra agendar horários.">
      <SignUp
        path="/cadastro/cliente"
        routing="path"
        signInUrl="/entrar/cliente"
        fallbackRedirectUrl="/cliente"
      />
    </AuthDoorShell>
  )
}
