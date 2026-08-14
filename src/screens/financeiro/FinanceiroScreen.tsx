import { SectionHeading } from '../../components/ui'
import { FinanceiroKpiRow } from './FinanceiroKpiRow'
import { ClientesSumindoAlert } from './ClientesSumindoAlert'
import { RevenueForecastChart } from './RevenueForecastChart'
import { PriceSimulator } from './PriceSimulator'
import { CashClosingSummary } from './CashClosingSummary'

export function FinanceiroScreen() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading>Financeiro</SectionHeading>
        <FinanceiroKpiRow />
      </div>
      <ClientesSumindoAlert />
      <RevenueForecastChart />
      <PriceSimulator />
      <CashClosingSummary />
    </div>
  )
}
