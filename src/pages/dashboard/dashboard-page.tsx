import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Hash,
  Percent,
  ReceiptText,
  RefreshCcw,
  Search,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import {
  useDashboardConversion,
  useDashboardEquipo,
  useDashboardSales,
} from '@/features/dashboard/api'
import type {
  DashboardFilters,
  SalesSeriesPoint,
  TeamLeaderboardItem,
} from '@/features/dashboard/types'
import { getMessageFromUnknown } from '@/shared/api/response'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/utils/cn'

type UiFilters = {
  startDate: string
  endDate: string
  regionId: string
}

type SalesScope = 'both' | 'quotes' | 'sales'
type SalesMetric = 'count' | 'subtotal'

interface ChartPoint {
  date: string
  value: number
}

interface ChartSeries {
  key: string
  label: string
  color: string
  values: ChartPoint[]
}

const regions = [
  { value: '', label: 'Todas' },
  { value: '1', label: 'Norte' },
  { value: '2', label: 'Sur' },
  { value: '3', label: 'Centro' },
]

const numberFormatter = new Intl.NumberFormat('es-MX')
const percentFormatter = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})
const compactNumberFormatter = new Intl.NumberFormat('es-MX', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const compactCurrencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const shortDateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
})

export function DashboardPage() {
  const conversionFilters = useDashboardSectionFilters()
  const salesFilters = useDashboardSectionFilters()
  const equipoFilters = useDashboardSectionFilters()
  const [salesScope, setSalesScope] = useState<SalesScope>('both')
  const [salesMetric, setSalesMetric] = useState<SalesMetric>('subtotal')

  const conversionApiFilters = useMemo(
    () => toApiFilters(conversionFilters.applied),
    [conversionFilters.applied],
  )
  const salesApiFilters = useMemo(
    () => toApiFilters(salesFilters.applied),
    [salesFilters.applied],
  )
  const equipoApiFilters = useMemo(
    () => toApiFilters(equipoFilters.applied),
    [equipoFilters.applied],
  )

  const conversion = useDashboardConversion(conversionApiFilters)
  const sales = useDashboardSales(salesApiFilters)
  const equipo = useDashboardEquipo(equipoApiFilters)

  const salesChartSeries = useMemo(
    () => buildChartSeries(sales.data?.series ?? [], salesScope, salesMetric),
    [sales.data?.series, salesScope, salesMetric],
  )

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Rendimiento comercial por conversión, ventas y equipo."
      />

      <DashboardSection
        title="Conversión"
        icon={<Percent className="h-5 w-5" />}
        rangeLabel={getRangeLabel(
          conversion.data?.startDate ?? conversionFilters.applied.startDate,
          conversion.data?.endDate ?? conversionFilters.applied.endDate,
        )}
        regionLabel={getRegionLabel(
          conversion.data?.regionId ?? conversionFilters.applied.regionId,
        )}
        isFetching={conversion.isFetching}
        accent="#03369d"
      >
        <FiltersPanel
          value={conversionFilters.draft}
          onChange={conversionFilters.setDraft}
          onApply={conversionFilters.apply}
          onReset={conversionFilters.reset}
          isFetching={conversion.isFetching}
        />

        {conversion.isError ? (
          <ErrorNotice
            error={conversion.error}
            onRetry={() => {
              void conversion.refetch()
            }}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {conversion.isLoading ? (
            <MetricSkeleton count={4} />
          ) : conversion.data ? (
            <>
              <MetricCard
                label="Total cotizaciones"
                value={formatNumber(conversion.data.quotes)}
                detail="Cotizaciones creadas"
                icon={<FileText className="h-5 w-5" />}
                tone="blue"
              />
              <MetricCard
                label="Total facturas"
                value={formatNumber(conversion.data.bills)}
                detail="Facturas generadas"
                icon={<ReceiptText className="h-5 w-5" />}
                tone="teal"
              />
              <MetricCard
                label="Tasa cierre"
                value={formatPercent(conversion.data.conversionPercent)}
                detail="Porcentaje de cierre"
                icon={<Percent className="h-5 w-5" />}
                tone="amber"
              />
              <MetricCard
                label="Cotizaciones cerradas"
                value={formatNumber(conversion.data.convertedQuotes)}
                detail="Cotizaciones convertidas"
                icon={<CheckCircle2 className="h-5 w-5" />}
                tone="green"
              />
            </>
          ) : (
            <div className="sm:col-span-2 xl:col-span-4">
              <EmptyState title="Sin datos de conversión" />
            </div>
          )}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Ventas"
        icon={<BarChart3 className="h-5 w-5" />}
        rangeLabel={getRangeLabel(
          sales.data?.startDate ?? salesFilters.applied.startDate,
          sales.data?.endDate ?? salesFilters.applied.endDate,
        )}
        regionLabel={getRegionLabel(sales.data?.regionId ?? salesFilters.applied.regionId)}
        isFetching={sales.isFetching}
        accent="#0f766e"
      >
        <FiltersPanel
          value={salesFilters.draft}
          onChange={salesFilters.setDraft}
          onApply={salesFilters.apply}
          onReset={salesFilters.reset}
          isFetching={sales.isFetching}
        />

        {sales.isError ? (
          <ErrorNotice
            error={sales.error}
            onRetry={() => {
              void sales.refetch()
            }}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sales.isLoading ? (
            <MetricSkeleton count={4} />
          ) : sales.data ? (
            <>
              <MetricCard
                label="Total cotizaciones"
                value={formatNumber(sales.data.totals.quotesCount)}
                detail="Cantidad"
                icon={<FileText className="h-5 w-5" />}
                tone="blue"
              />
              <MetricCard
                label="Subtotal cotizaciones"
                value={formatCurrency(sales.data.totals.quotesSubtotal)}
                detail="Monto cotizado"
                icon={<CircleDollarSign className="h-5 w-5" />}
                tone="teal"
              />
              <MetricCard
                label="Total facturas"
                value={formatNumber(sales.data.totals.salesCount)}
                detail="Cantidad"
                icon={<ReceiptText className="h-5 w-5" />}
                tone="amber"
              />
              <MetricCard
                label="Subtotal facturas"
                value={formatCurrency(sales.data.totals.salesSubtotal)}
                detail="Monto vendido"
                icon={<CircleDollarSign className="h-5 w-5" />}
                tone="green"
              />
            </>
          ) : (
            <div className="sm:col-span-2 xl:col-span-4">
              <EmptyState title="Sin datos de ventas" />
            </div>
          )}
        </div>

        <Card className="overflow-hidden p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-base font-bold text-kleep-ink">
                Ventas y cotizaciones por día
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {salesMetric === 'subtotal' ? '$Monto' : 'Cantidad'} diario
              </p>
            </div>
            <SalesControls
              scope={salesScope}
              metric={salesMetric}
              onScopeChange={setSalesScope}
              onMetricChange={setSalesMetric}
            />
          </div>

          {sales.isLoading ? (
            <Skeleton className="mt-5 h-[360px] w-full" />
          ) : (
            <SalesLineChart series={salesChartSeries} metric={salesMetric} />
          )}
        </Card>
      </DashboardSection>

      <DashboardSection
        title="Equipo"
        icon={<UsersRound className="h-5 w-5" />}
        rangeLabel={getRangeLabel(
          equipo.data?.startDate ?? equipoFilters.applied.startDate,
          equipo.data?.endDate ?? equipoFilters.applied.endDate,
        )}
        regionLabel={getRegionLabel(equipo.data?.regionId ?? equipoFilters.applied.regionId)}
        isFetching={equipo.isFetching}
        accent="#b45309"
      >
        <FiltersPanel
          value={equipoFilters.draft}
          onChange={equipoFilters.setDraft}
          onApply={equipoFilters.apply}
          onReset={equipoFilters.reset}
          isFetching={equipo.isFetching}
        />

        {equipo.isError ? (
          <ErrorNotice
            error={equipo.error}
            onRetry={() => {
              void equipo.refetch()
            }}
          />
        ) : null}

        <TeamLeaderboard
          data={equipo.data?.leaderboard ?? []}
          isLoading={equipo.isLoading}
        />
      </DashboardSection>
    </>
  )
}

function useDashboardSectionFilters() {
  const initialFilters = useMemo(() => getMonthToDateFilters(), [])
  const [draft, setDraft] = useState<UiFilters>(initialFilters)
  const [applied, setApplied] = useState<UiFilters>(initialFilters)

  return {
    draft,
    applied,
    setDraft,
    apply: () => setApplied({ ...draft }),
    reset: () => {
      setDraft(initialFilters)
      setApplied(initialFilters)
    },
  }
}

function DashboardSection({
  title,
  icon,
  rangeLabel,
  regionLabel,
  isFetching,
  accent,
  children,
}: {
  title: string
  icon: ReactNode
  rangeLabel: string
  regionLabel: string
  isFetching?: boolean
  accent: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-4">
      <div className="sticky top-20 z-10 -mx-4 border-y border-black/5 bg-[#f6f8ff]/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-white shadow-sm"
              style={{ backgroundColor: accent }}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-kleep-ink">{title}</h2>
              <p className="truncate text-sm text-slate-500">{rangeLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md border border-black/5 bg-white px-3 py-2 font-semibold text-kleep-ink shadow-sm">
              Región: {regionLabel}
            </span>
            {isFetching ? (
              <span className="rounded-md border border-kleep-blue/15 bg-kleep-soft px-3 py-2 font-semibold text-kleep-blue">
                Actualizando
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {children}
    </section>
  )
}

function FiltersPanel({
  value,
  onChange,
  onApply,
  onReset,
  isFetching,
}: {
  value: UiFilters
  onChange: (next: UiFilters) => void
  onApply: () => void
  onReset: () => void
  isFetching?: boolean
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply()
  }

  function updateField(field: keyof UiFilters, fieldValue: string) {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <Card className="p-4">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
            <CalendarDays className="h-4 w-4" />
          </span>
          <h3 className="text-base font-bold text-kleep-ink">Filtros</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Input
            label="Fecha inicio"
            type="date"
            value={value.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
          />
          <Input
            label="Fecha fin"
            type="date"
            value={value.endDate}
            onChange={(event) => updateField('endDate', event.target.value)}
          />
          <Select
            label="Región"
            value={value.regionId}
            onChange={(event) => updateField('regionId', event.target.value)}
          >
            {regions.map((region) => (
              <option key={region.value || 'all'} value={region.value}>
                {region.label}
              </option>
            ))}
          </Select>
          <div className="flex items-end justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onReset}>
              <RefreshCcw className="h-4 w-4" />
              Limpiar
            </Button>
            <Button type="submit" disabled={isFetching}>
              <Search className="h-4 w-4" />
              Aplicar
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string
  value: string
  detail: string
  icon: ReactNode
  tone: 'blue' | 'teal' | 'amber' | 'green'
}) {
  const toneClasses = {
    blue: 'bg-kleep-soft text-kleep-blue',
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 break-words text-2xl font-black text-kleep-ink">{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-500">{detail}</p>
        </div>
        <span
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-md',
            toneClasses[tone],
          )}
        >
          {icon}
        </span>
      </div>
    </Card>
  )
}

function MetricSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </>
  )
}

function SalesControls({
  scope,
  metric,
  onScopeChange,
  onMetricChange,
}: {
  scope: SalesScope
  metric: SalesMetric
  onScopeChange: (scope: SalesScope) => void
  onMetricChange: (metric: SalesMetric) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-xs font-semibold text-slate-500">Serie</p>
        <div className="inline-flex rounded-md border border-black/10 bg-white p-1">
          <SegmentButton
            active={scope === 'both'}
            onClick={() => onScopeChange('both')}
          >
            <BarChart3 className="h-4 w-4" />
            Ambas
          </SegmentButton>
          <SegmentButton
            active={scope === 'quotes'}
            onClick={() => onScopeChange('quotes')}
          >
            <FileText className="h-4 w-4" />
            Cotizaciones
          </SegmentButton>
          <SegmentButton
            active={scope === 'sales'}
            onClick={() => onScopeChange('sales')}
          >
            <ReceiptText className="h-4 w-4" />
            Facturas
          </SegmentButton>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-slate-500">Medida</p>
        <div className="inline-flex rounded-md border border-black/10 bg-white p-1">
          <SegmentButton
            active={metric === 'count'}
            onClick={() => onMetricChange('count')}
          >
            <Hash className="h-4 w-4" />
            Cantidad
          </SegmentButton>
          <SegmentButton
            active={metric === 'subtotal'}
            onClick={() => onMetricChange('subtotal')}
          >
            <CircleDollarSign className="h-4 w-4" />
            $Monto
          </SegmentButton>
        </div>
      </div>
    </div>
  )
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition',
        active
          ? 'bg-kleep-ink text-white shadow-sm'
          : 'text-slate-600 hover:bg-kleep-soft hover:text-kleep-ink',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function SalesLineChart({
  series,
  metric,
}: {
  series: ChartSeries[]
  metric: SalesMetric
}) {
  const pointCount = series[0]?.values.length ?? 0

  if (!pointCount) {
    return (
      <div className="mt-5 grid min-h-72 place-items-center rounded-md border border-dashed border-kleep-blue/25 bg-[#f7f9ff] p-6 text-center">
        <p className="font-semibold text-kleep-ink">Sin datos para la gráfica</p>
      </div>
    )
  }

  const width = 920
  const height = 360
  const padding = { top: 28, right: 28, bottom: 56, left: 92 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(
    ...series.flatMap((item) => item.values.map((point) => point.value)),
    0,
  )
  const yMax = getNiceMax(maxValue)
  const xTicks = getTickIndices(pointCount, 5)
  const yTicks = Array.from({ length: 5 }).map(
    (_, index) => yMax - (yMax / 4) * index,
  )

  function xFor(index: number) {
    if (pointCount === 1) return padding.left + innerWidth / 2
    return padding.left + (index / (pointCount - 1)) * innerWidth
  }

  function yFor(value: number) {
    return padding.top + innerHeight - (value / yMax) * innerHeight
  }

  function pathFor(values: ChartPoint[]) {
    return values
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L'
        return `${command} ${xFor(index).toFixed(2)} ${yFor(point.value).toFixed(2)}`
      })
      .join(' ')
  }

  return (
    <div className="mt-5">
      <svg
        className="h-[360px] w-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Gráfica diaria de ventas y cotizaciones"
      >
        {yTicks.map((tick) => {
          const y = yFor(tick)
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={tick === 0 ? undefined : '4 6'}
              />
              <text
                x={padding.left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                {metric === 'subtotal'
                  ? formatCompactCurrency(tick)
                  : formatCompactNumber(tick)}
              </text>
            </g>
          )
        })}

        {xTicks.map((index) => {
          const point = series[0]?.values[index]
          if (!point) return null
          const x = xFor(index)
          return (
            <g key={`${point.date}-${index}`}>
              <line
                x1={x}
                x2={x}
                y1={padding.top}
                y2={padding.top + innerHeight}
                stroke="#eef2ff"
              />
              <text
                x={x}
                y={height - 20}
                textAnchor="middle"
                fontSize="12"
                fill="#64748b"
              >
                {formatShortDate(point.date)}
              </text>
            </g>
          )
        })}

        {series.map((item) => {
          const latestPoint = item.values.at(-1)
          return (
            <g key={item.key}>
              <path
                d={pathFor(item.values)}
                fill="none"
                stroke={item.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              {latestPoint ? (
                <circle
                  cx={xFor(item.values.length - 1)}
                  cy={yFor(latestPoint.value)}
                  r="5"
                  fill="white"
                  stroke={item.color}
                  strokeWidth="3"
                />
              ) : null}
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap gap-3">
        {series.map((item) => {
          const latestValue = item.values.at(-1)?.value ?? 0
          return (
            <span
              key={item.key}
              className="inline-flex items-center gap-2 rounded-md border border-black/5 bg-[#f7f9ff] px-3 py-2 text-sm text-slate-600"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
              <strong className="font-bold text-kleep-ink">
                {metric === 'subtotal'
                  ? formatCurrency(latestValue)
                  : formatNumber(latestValue)}
              </strong>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function TeamLeaderboard({
  data,
  isLoading,
}: {
  data: TeamLeaderboardItem[]
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return <EmptyState title="Sin datos de equipo" />
  }

  return (
    <div className="grid gap-3">
      {data.map((item, index) => {
        const conversion = clamp(item.conversionPercent, 0, 100)
        const ejecutivo = item.ejecutivo || `${item.nombre} ${item.apellido}`.trim()

        return (
          <article
            key={item.ejecutivoId}
            className="grid gap-4 rounded-lg border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(19,20,21,0.05)] lg:grid-cols-[88px_minmax(220px,1.2fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(190px,0.9fr)] lg:items-center"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-md text-sm font-black',
                  index === 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-kleep-soft text-kleep-blue',
                )}
              >
                {index === 0 ? <Trophy className="h-5 w-5" /> : `#${index + 1}`}
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-kleep-ink">
                {ejecutivo}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {capitalize(item.region)} · {formatNumber(item.assignedBases)} bases
              </p>
            </div>

            <LeaderboardMetric
              label="Facturas"
              value={formatNumber(item.bills)}
              detail={formatCurrency(item.salesSubtotal)}
            />
            <LeaderboardMetric
              label="Cotizaciones"
              value={formatNumber(item.quotes)}
              detail={formatCurrency(item.quotesSubtotal)}
            />

            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-500">Cierre</span>
                <span className="text-sm font-black text-kleep-ink">
                  {formatPercent(item.conversionPercent)}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-kleep-soft">
                <span
                  className="block h-full rounded-full bg-kleep-blue"
                  style={{ width: `${conversion}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                {formatNumber(item.convertedQuotes)} cerradas
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function LeaderboardMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-kleep-ink">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
    </div>
  )
}

function ErrorNotice({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-red-700">
        {getMessageFromUnknown(error, 'No se pudo cargar esta sección')}
      </p>
      <Button type="button" variant="secondary" onClick={onRetry}>
        <RefreshCcw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  )
}

function buildChartSeries(
  points: SalesSeriesPoint[],
  scope: SalesScope,
  metric: SalesMetric,
): ChartSeries[] {
  const series: ChartSeries[] = []

  if (scope === 'both' || scope === 'quotes') {
    series.push({
      key: 'quotes',
      label: metric === 'subtotal' ? 'Cotizaciones $Monto' : 'Cotizaciones',
      color: '#0f766e',
      values: points.map((point) => ({
        date: point.date,
        value: point.quotes?.[metric] ?? 0,
      })),
    })
  }

  if (scope === 'both' || scope === 'sales') {
    series.push({
      key: 'sales',
      label: metric === 'subtotal' ? 'Facturas $Monto' : 'Facturas',
      color: '#03369d',
      values: points.map((point) => ({
        date: point.date,
        value: point.sales?.[metric] ?? 0,
      })),
    })
  }

  return series
}

function getMonthToDateFilters(): UiFilters {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    startDate: formatInputDate(firstDay),
    endDate: formatInputDate(today),
    regionId: '',
  }
}

function toApiFilters(filters: UiFilters): DashboardFilters {
  return {
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    regionId: filters.regionId ? Number(filters.regionId) : undefined,
  }
}

function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRangeLabel(startDate?: string, endDate?: string) {
  return `${formatShortDate(startDate)} al ${formatShortDate(endDate)}`
}

function getRegionLabel(regionId?: number | string) {
  const value = String(regionId ?? '')
  return regions.find((region) => region.value === value)?.label ?? 'Todas'
}

function formatShortDate(value?: string) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return shortDateFormatter.format(date)
}

function formatNumber(value?: number) {
  return numberFormatter.format(value ?? 0)
}

function formatCompactNumber(value: number) {
  return compactNumberFormatter.format(value)
}

function formatCurrency(value?: number) {
  return currencyFormatter.format(value ?? 0)
}

function formatCompactCurrency(value: number) {
  return compactCurrencyFormatter.format(value)
}

function formatPercent(value?: number) {
  return `${percentFormatter.format(value ?? 0)}%`
}

function getNiceMax(value: number) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const niceNormalized =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return niceNormalized * magnitude
}

function getTickIndices(count: number, target: number) {
  if (count <= 1) return [0]
  const lastIndex = count - 1
  const ticks = new Set<number>()
  for (let index = 0; index < target; index += 1) {
    ticks.add(Math.round((lastIndex * index) / (target - 1)))
  }
  return Array.from(ticks).sort((a, b) => a - b)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function capitalize(value?: string) {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1)
}
