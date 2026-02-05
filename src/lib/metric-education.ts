/**
 * Metric education dictionary.
 * Provides educational content, thresholds, and grading for all backtest metrics.
 */

export type MetricGrade = 'excellent' | 'good' | 'average' | 'poor'

export interface MetricEducation {
  key: string
  label: string
  shortDescription: string
  fullDescription: string
  whyItMatters: string
  goodThreshold: number
  excellentThreshold: number
  badThreshold: number
  isHigherBetter: boolean
  unit: string
  proTip: string
  sp500Typical: string
}

/**
 * Dictionary of all supported backtest metrics with educational content.
 */
export const METRIC_EDUCATION: Record<string, MetricEducation> = {
  totalReturn: {
    key: 'totalReturn',
    label: 'Total Return',
    shortDescription: 'Percentage gain or loss over the entire backtest period.',
    fullDescription:
      'Total return measures the overall percentage change in your portfolio from start to finish. It includes all realized gains and losses from closed trades, plus any unrealized gains from open positions at the end.',
    whyItMatters:
      'This is the bottom line — did your strategy make or lose money? Compare it to what a simple buy-and-hold of the S&P 500 would have earned over the same period.',
    goodThreshold: 10,
    excellentThreshold: 25,
    badThreshold: 0,
    isHigherBetter: true,
    unit: '%',
    proTip: 'A high return with high drawdown may not be worth the risk. Always pair this with Sharpe Ratio and Max Drawdown.',
    sp500Typical: '~10% annualized historically',
  },
  annualizedReturn: {
    key: 'annualizedReturn',
    label: 'Annualized Return',
    shortDescription: 'Return normalized to a yearly rate for fair comparison.',
    fullDescription:
      'Annualized return converts your total return into an equivalent yearly rate, making it easier to compare strategies that ran for different time periods. A 6-month backtest returning 8% annualizes to roughly 16%.',
    whyItMatters:
      'Without annualization, you can\'t fairly compare a 3-month backtest to a 2-year one. This metric levels the playing field.',
    goodThreshold: 12,
    excellentThreshold: 25,
    badThreshold: 0,
    isHigherBetter: true,
    unit: '%',
    proTip: 'Be cautious with very short backtests — a lucky week can produce misleading annualized figures.',
    sp500Typical: '~10% annualized (long-term average)',
  },
  sharpeRatio: {
    key: 'sharpeRatio',
    label: 'Sharpe Ratio',
    shortDescription: 'Risk-adjusted return — how much return per unit of risk.',
    fullDescription:
      'The Sharpe Ratio measures excess return per unit of volatility (risk). It divides the strategy\'s return above the risk-free rate by the standard deviation of returns. Higher is better — it means you\'re getting more return for each unit of risk taken.',
    whyItMatters:
      'Two strategies can both return 20%, but the one with a higher Sharpe did it with less volatility — meaning fewer sleepless nights. This is the gold standard for risk-adjusted performance.',
    goodThreshold: 1.0,
    excellentThreshold: 2.0,
    badThreshold: 0,
    isHigherBetter: true,
    unit: '',
    proTip: 'A Sharpe above 1.0 is generally considered good. Above 2.0 is excellent. Below 0 means you\'d be better off in T-bills.',
    sp500Typical: '~0.5-0.8 historically',
  },
  maxDrawdown: {
    key: 'maxDrawdown',
    label: 'Max Drawdown',
    shortDescription: 'Largest peak-to-trough decline during the backtest.',
    fullDescription:
      'Maximum drawdown measures the biggest percentage drop from a portfolio peak to a subsequent trough. It represents the worst-case loss you would have experienced if you entered at the peak and exited at the trough.',
    whyItMatters:
      'Drawdown is the most visceral risk metric. A -40% drawdown means you need +67% just to break even. Most traders abandon strategies long before the drawdown recovers.',
    goodThreshold: -10,
    excellentThreshold: -5,
    badThreshold: -25,
    isHigherBetter: true, // Less negative is better (closer to 0)
    unit: '%',
    proTip: 'Multiply your max drawdown by 1.5x to estimate what you might face in live trading — backtests are often optimistic.',
    sp500Typical: '-34% (2020 COVID), -57% (2008 Financial Crisis)',
  },
  winRate: {
    key: 'winRate',
    label: 'Win Rate',
    shortDescription: 'Percentage of trades that were profitable.',
    fullDescription:
      'Win rate is simply the number of winning trades divided by total trades, expressed as a percentage. A 60% win rate means 6 out of every 10 trades are profitable.',
    whyItMatters:
      'A high win rate feels good psychologically, but it\'s not the whole story. Some of the best strategies have win rates below 50% but make up for it with large winners (high reward-to-risk).',
    goodThreshold: 55,
    excellentThreshold: 65,
    badThreshold: 40,
    isHigherBetter: true,
    unit: '%',
    proTip: 'Win rate and profit factor work together. A 40% win rate can be very profitable if average wins are 3x average losses.',
    sp500Typical: 'N/A (buy-and-hold has no individual trades)',
  },
  profitFactor: {
    key: 'profitFactor',
    label: 'Profit Factor',
    shortDescription: 'Ratio of gross profits to gross losses.',
    fullDescription:
      'Profit factor divides the total dollar amount won on winning trades by the total dollar amount lost on losing trades. A profit factor of 2.0 means you made $2 for every $1 you lost.',
    whyItMatters:
      'Profit factor combines win rate and win/loss size into one number. It tells you if your strategy has a genuine edge. Below 1.0 means you\'re losing money overall.',
    goodThreshold: 1.5,
    excellentThreshold: 2.5,
    badThreshold: 1.0,
    isHigherBetter: true,
    unit: '',
    proTip: 'Professional traders target a profit factor of 1.5+. If your profit factor is near 1.0, trading costs could wipe out your edge.',
    sp500Typical: 'N/A (buy-and-hold)',
  },
  totalTrades: {
    key: 'totalTrades',
    label: 'Total Trades',
    shortDescription: 'Number of completed round-trip trades.',
    fullDescription:
      'Total trades counts every completed buy-and-sell cycle during the backtest. More trades provide more data points for statistical significance, but also means more exposure to transaction costs.',
    whyItMatters:
      'Too few trades (under 20) makes any performance metric unreliable. Too many trades might mean over-trading, which racks up fees and slippage in real markets.',
    goodThreshold: 30,
    excellentThreshold: 50,
    badThreshold: 10,
    isHigherBetter: true,
    unit: '',
    proTip: 'Aim for at least 30 trades for your metrics to be statistically meaningful. Under 10 trades is essentially noise.',
    sp500Typical: 'N/A',
  },
  avgWinPercent: {
    key: 'avgWinPercent',
    label: 'Avg Win',
    shortDescription: 'Average percentage gain on winning trades.',
    fullDescription:
      'The average win percentage is the mean return across all profitable trades. Combined with average loss, it tells you the reward-to-risk profile of your strategy.',
    whyItMatters:
      'If your average win is smaller than your average loss, you need a high win rate to be profitable. Ideally, average wins are at least 1.5x average losses.',
    goodThreshold: 5,
    excellentThreshold: 10,
    badThreshold: 2,
    isHigherBetter: true,
    unit: '%',
    proTip: 'Compare average win to average loss. The ratio (win/loss) is called the reward-to-risk ratio — aim for at least 1.5:1.',
    sp500Typical: 'N/A',
  },
  avgLossPercent: {
    key: 'avgLossPercent',
    label: 'Avg Loss',
    shortDescription: 'Average percentage loss on losing trades.',
    fullDescription:
      'The average loss percentage is the mean return across all losing trades (expressed as a negative number). Smaller losses relative to wins indicate good risk management.',
    whyItMatters:
      'Controlling losses is the #1 job of risk management. Large average losses suggest stop-losses are too wide or nonexistent.',
    goodThreshold: -3,
    excellentThreshold: -2,
    badThreshold: -8,
    isHigherBetter: true, // Less negative is better
    unit: '%',
    proTip: 'If average losses are larger than average wins, your stop-loss levels may need tightening.',
    sp500Typical: 'N/A',
  },
  bestTrade: {
    key: 'bestTrade',
    label: 'Best Trade',
    shortDescription: 'Highest percentage return from a single trade.',
    fullDescription:
      'The best trade shows the peak performance from any single round-trip trade. While encouraging, be wary if a large portion of your total return came from this one trade.',
    whyItMatters:
      'If your best trade accounts for most of your total return, the strategy may be relying on luck rather than a consistent edge.',
    goodThreshold: 10,
    excellentThreshold: 20,
    badThreshold: 3,
    isHigherBetter: true,
    unit: '%',
    proTip: 'Remove your best trade and recalculate total return. If the strategy goes negative, it may lack a consistent edge.',
    sp500Typical: 'N/A',
  },
  worstTrade: {
    key: 'worstTrade',
    label: 'Worst Trade',
    shortDescription: 'Largest percentage loss from a single trade.',
    fullDescription:
      'The worst trade shows the largest single-trade loss. This reflects how much damage one bad trade can do and how well your stop-loss rules are working.',
    whyItMatters:
      'A single catastrophic trade can undo months of profits. Effective stop-losses should prevent worst-trade losses from exceeding your risk tolerance.',
    goodThreshold: -5,
    excellentThreshold: -3,
    badThreshold: -15,
    isHigherBetter: true, // Less negative is better
    unit: '%',
    proTip: 'Your worst trade should ideally be capped near your stop-loss percentage. If it\'s much worse, check for gap-down scenarios.',
    sp500Typical: 'N/A',
  },
  avgHoldingDays: {
    key: 'avgHoldingDays',
    label: 'Avg Holding',
    shortDescription: 'Average number of days a position is held.',
    fullDescription:
      'Average holding period shows how long your strategy typically keeps a position open. Short holding periods indicate a more active/trading-oriented strategy, while longer periods suggest a swing or position trading approach.',
    whyItMatters:
      'Holding period affects transaction costs and tax treatment. Very short holding periods rack up commissions and trigger short-term capital gains taxes.',
    goodThreshold: 5,
    excellentThreshold: 10,
    badThreshold: 1,
    isHigherBetter: true,
    unit: ' days',
    proTip: 'Consider whether your holding period matches your intended strategy style. Day-trading metrics look very different from swing-trading metrics.',
    sp500Typical: 'N/A (buy-and-hold is infinite)',
  },
  initialCapital: {
    key: 'initialCapital',
    label: 'Initial Capital',
    shortDescription: 'Starting portfolio value for the backtest.',
    fullDescription:
      'The initial capital is the amount of money the strategy started with. All return calculations are based on this starting value.',
    whyItMatters:
      'Position sizing and number of simultaneous positions depend heavily on starting capital. Results from a $100K backtest may not scale linearly to $10K.',
    goodThreshold: 0,
    excellentThreshold: 0,
    badThreshold: 0,
    isHigherBetter: true,
    unit: '$',
    proTip: 'Run backtests with your actual intended capital to get realistic position sizes.',
    sp500Typical: 'N/A',
  },
  finalCapital: {
    key: 'finalCapital',
    label: 'Final Capital',
    shortDescription: 'Ending portfolio value after the backtest.',
    fullDescription:
      'The final capital is the total portfolio value at the end of the backtest period, including cash and any open positions valued at market price.',
    whyItMatters:
      'This is the dollar-amount bottom line. Final capital minus initial capital equals your total dollar profit or loss.',
    goodThreshold: 0,
    excellentThreshold: 0,
    badThreshold: 0,
    isHigherBetter: true,
    unit: '$',
    proTip: 'Final capital includes unrealized gains from open positions, which may change once those positions are closed.',
    sp500Typical: 'N/A',
  },
}

/**
 * Grade a metric value using piecewise thresholds.
 */
export function getMetricGrade(key: string, value: number): MetricGrade {
  const ed = METRIC_EDUCATION[key]
  if (!ed) return 'average'

  // For metrics without meaningful thresholds (initialCapital, finalCapital)
  if (ed.goodThreshold === 0 && ed.excellentThreshold === 0 && ed.badThreshold === 0) {
    return 'average'
  }

  if (ed.isHigherBetter) {
    if (value >= ed.excellentThreshold) return 'excellent'
    if (value >= ed.goodThreshold) return 'good'
    if (value >= ed.badThreshold) return 'average'
    return 'poor'
  } else {
    // Lower is better (currently unused but included for completeness)
    if (value <= ed.excellentThreshold) return 'excellent'
    if (value <= ed.goodThreshold) return 'good'
    if (value <= ed.badThreshold) return 'average'
    return 'poor'
  }
}

/**
 * Map from BacktestMetrics field names to metric education keys.
 * The keys in BacktestResultPage's MetricCard grid.
 */
export const RESULT_PAGE_METRICS = [
  'totalReturn',
  'sharpeRatio',
  'maxDrawdown',
  'winRate',
  'profitFactor',
  'totalTrades',
  'avgWinPercent',
  'avgLossPercent',
] as const

export const GRADE_COLORS: Record<MetricGrade, string> = {
  excellent: 'text-emerald-600 dark:text-emerald-400',
  good: 'text-sky-600 dark:text-sky-400',
  average: 'text-amber-600 dark:text-amber-400',
  poor: 'text-red-600 dark:text-red-400',
}

export const GRADE_BG_COLORS: Record<MetricGrade, string> = {
  excellent: 'bg-emerald-500',
  good: 'bg-sky-500',
  average: 'bg-amber-500',
  poor: 'bg-red-500',
}

export const GRADE_LABELS: Record<MetricGrade, string> = {
  excellent: 'Excellent',
  good: 'Good',
  average: 'Average',
  poor: 'Poor',
}
