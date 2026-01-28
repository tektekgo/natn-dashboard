/**
 * Financial Modeling Prep (FMP) API client.
 * Fetches company profile and quarterly financials.
 */

import type { IFundamentalDataProvider } from '../types'
import type { FundamentalData } from '../../engine/types'
import type { FMPCompanyProfile, FMPKeyMetrics, FMPIncomeStatement } from '../../types/api'
import { FMP_BASE_URL } from '../../lib/constants'

export class FMPClient implements IFundamentalDataProvider {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_FMP_API_KEY || ''
  }

  async fetchProfile(symbol: string): Promise<FundamentalData | null> {
    const url = `${FMP_BASE_URL}/profile/${symbol}?apikey=${this.apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`FMP API error (${response.status}): ${errorText}`)
    }

    const data = await response.json() as FMPCompanyProfile[]
    if (!data || data.length === 0) return null

    const profile = data[0]
    return {
      symbol: profile.symbol,
      peRatio: null, // Profile doesn't include PE directly
      eps: null,
      epsGrowth: null,
      beta: profile.beta || null,
      dividendYield: profile.lastDiv ? profile.lastDiv / profile.price : null,
      marketCap: profile.mktCap || null,
      reportDate: new Date().toISOString().substring(0, 10),
    }
  }

  async fetchQuarterlyMetrics(symbol: string): Promise<FundamentalData[]> {
    // Fetch key metrics and income statements in parallel
    const [metricsData, incomeData] = await Promise.all([
      this.fetchKeyMetrics(symbol),
      this.fetchIncomeStatements(symbol),
    ])

    // Merge metrics with income statement data by period
    const incomeMap = new Map<string, FMPIncomeStatement>()
    for (const stmt of incomeData) {
      incomeMap.set(stmt.date, stmt)
    }

    const results: FundamentalData[] = []

    for (const metric of metricsData) {
      const income = incomeMap.get(metric.date)

      // Calculate EPS growth if we have consecutive quarters
      let epsGrowth: number | null = null
      const currentIdx = metricsData.indexOf(metric)
      if (currentIdx < metricsData.length - 1 && income) {
        const prevIncome = incomeMap.get(metricsData[currentIdx + 1].date)
        if (prevIncome && prevIncome.epsdiluted !== 0) {
          epsGrowth = (income.epsdiluted - prevIncome.epsdiluted) / Math.abs(prevIncome.epsdiluted)
        }
      }

      results.push({
        symbol,
        peRatio: metric.peRatio || null,
        eps: income?.epsdiluted ?? null,
        epsGrowth,
        beta: null, // Beta comes from profile
        dividendYield: metric.dividendYield || null,
        marketCap: null,
        reportDate: metric.date,
      })
    }

    // Sort by report date descending (most recent first)
    results.sort((a, b) => b.reportDate.localeCompare(a.reportDate))
    return results
  }

  private async fetchKeyMetrics(symbol: string): Promise<FMPKeyMetrics[]> {
    const url = `${FMP_BASE_URL}/key-metrics/${symbol}?period=quarter&limit=20&apikey=${this.apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      return []
    }

    return await response.json() as FMPKeyMetrics[]
  }

  private async fetchIncomeStatements(symbol: string): Promise<FMPIncomeStatement[]> {
    const url = `${FMP_BASE_URL}/income-statement/${symbol}?period=quarter&limit=20&apikey=${this.apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      return []
    }

    return await response.json() as FMPIncomeStatement[]
  }
}
