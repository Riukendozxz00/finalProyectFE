import { useQuery } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData } from '@/shared/api/response'
import type {
  ConversionDashboard,
  DashboardFilters,
  EquipoDashboard,
  SalesDashboard,
} from './types'

export function useDashboardConversion(filters: DashboardFilters) {
  return useQuery({
    queryKey: queryKeys.dashboard.conversion(filters),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.dashboard.conversion, {
        params: compactDashboardFilters(filters),
      })
      return parseApiData<ConversionDashboard>(response.data)
    },
  })
}

export function useDashboardSales(filters: DashboardFilters) {
  return useQuery({
    queryKey: queryKeys.dashboard.sales(filters),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.dashboard.sales, {
        params: compactDashboardFilters(filters),
      })
      return parseApiData<SalesDashboard>(response.data)
    },
  })
}

export function useDashboardEquipo(filters: DashboardFilters) {
  return useQuery({
    queryKey: queryKeys.dashboard.equipo(filters),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.dashboard.equipo, {
        params: compactDashboardFilters(filters),
      })
      return parseApiData<EquipoDashboard>(response.data)
    },
  })
}

function compactDashboardFilters(filters: DashboardFilters) {
  return {
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    regionId: filters.regionId,
  }
}
