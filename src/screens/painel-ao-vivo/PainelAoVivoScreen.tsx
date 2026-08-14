import { Scissors } from 'lucide-react'
import { NOME_BARBEARIA } from '../../lib/constants'
import { formatDateDisplay, HOJE_ISO } from '../../lib/dateUtils'
import { BarbeiroRankingBoard } from './BarbeiroRankingBoard'
import { NextClientCallout } from './NextClientCallout'
import { RevenueGoalBar } from './RevenueGoalBar'

export function PainelAoVivoScreen() {
  return (
    <div className="min-h-screen bg-bg px-10 py-8">
      <header className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent text-accent">
            <Scissors size={24} aria-hidden="true" />
          </span>
          <span className="font-heading text-3xl tracking-wide text-text-primary uppercase">
            {NOME_BARBEARIA}
          </span>
        </div>
        <span className="font-heading text-lg tracking-wide text-text-secondary uppercase">
          {formatDateDisplay(HOJE_ISO)}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <BarbeiroRankingBoard />
        <div className="flex flex-col gap-6">
          <NextClientCallout />
          <RevenueGoalBar />
        </div>
      </div>
    </div>
  )
}
