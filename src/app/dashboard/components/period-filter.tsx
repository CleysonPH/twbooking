import { type PeriodFilter } from "@/lib/dashboard-types"

interface PeriodFilterProps {
  selectedPeriod: PeriodFilter
  onPeriodChange: (period: PeriodFilter) => void
}

export function PeriodFilter({ selectedPeriod, onPeriodChange }: PeriodFilterProps) {
  const periods: { value: PeriodFilter; label: string }[] = [
    { value: 7, label: "7 dias" },
    { value: 30, label: "30 dias" },
    { value: 60, label: "60 dias" }
  ]

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedPeriod === period.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
