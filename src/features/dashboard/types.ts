export interface DashboardFilters {
  startDate?: string
  endDate?: string
  regionId?: number
}

export interface ConversionDashboard {
  startDate: string
  endDate: string
  regionId?: number
  quotes: number
  bills: number
  convertedQuotes: number
  conversionPercent: number
}

export interface SalesBucket {
  count: number
  subtotal: number
  value: number
}

export interface SalesSeriesPoint {
  date: string
  sales: SalesBucket
  quotes: SalesBucket
}

export interface SalesDashboard {
  startDate: string
  endDate: string
  regionId?: number
  metric?: string
  totals: {
    salesCount: number
    salesSubtotal: number
    quotesCount: number
    quotesSubtotal: number
  }
  series: SalesSeriesPoint[]
}

export interface TeamLeaderboardItem {
  ejecutivoId: number
  nombre: string
  apellido: string
  ejecutivo: string
  regionId: number
  region: string
  assignedBases: number
  bills: number
  salesSubtotal: number
  quotes: number
  quotesSubtotal: number
  convertedQuotes: number
  conversionPercent: number
}

export interface EquipoDashboard {
  startDate: string
  endDate: string
  regionId?: number
  leaderboard: TeamLeaderboardItem[]
}
