'use client'

import { SignOutButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'

export function SairButton({ redirectUrl }: { redirectUrl: string }) {
  return (
    <SignOutButton redirectUrl={redirectUrl}>
      <button
        type="button"
        title="Sair"
        aria-label="Sair"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-status-red hover:text-status-red"
      >
        <LogOut size={16} aria-hidden="true" />
      </button>
    </SignOutButton>
  )
}
