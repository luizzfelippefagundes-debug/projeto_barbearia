import Link from 'next/link'
import { UserX } from 'lucide-react'
import { Button, Card } from '../../components/ui'

export default function SemAcessoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="flex max-w-sm flex-col items-center gap-3 p-8 text-center">
        <UserX size={32} className="text-status-red" aria-hidden="true" />
        <h1 className="text-lg text-text-primary">Sem acesso ao painel</h1>
        <p className="text-sm text-text-secondary">
          Sua conta não está cadastrada como barbeiro ou dono desta barbearia. Fale com o dono
          para ser adicionado.
        </p>
        <Link href="/cliente">
          <Button variant="secondary">Ir para a área do cliente</Button>
        </Link>
      </Card>
    </div>
  )
}
