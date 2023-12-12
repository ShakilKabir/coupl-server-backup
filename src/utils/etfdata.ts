export const ishareETFs = {
  prepare_for_retirement: {
    description:
      'Simplify retirement planning and take finding a mix of stocks and bonds off my to-do list',
    invest_for_retirement: {
      description:
        'Simplify retirement investing with a professionally managed portfolio of ETFs designed to stay on track for a target retirement date',
      recommended_etfs: [
        {
          name: 'iShares® LifePath®  Target Date 2035 ETF',
          symbol: 'ITDC',
          status: 'ACTIVE',
          type: 'Multi Asset',
        },
        {
          name: 'iShares® LifePath® Target Date 2040 ETF ',
          symbol: 'ITDD',
          status: 'ACTIVE',
          type: 'Multi Asset',
        },
        {
          name: 'iShares® LifePath® Target Date 2045 ETF ',
          symbol: 'ITDE',
          status: 'ACTIVE',
          type: 'Multi Asset',
        },
      ],
    },
    income_in_retirement: {
      description:
        'Aims to manage risk and inflation, while seeking to provide steady income for retirees',
      recommended_etfs: [
        {
          name: 'iShares® LifePath® Retirement ETF ',
          symbol: 'IRTR',
          status: 'ACTIVE',
          type: 'Multi Asset',
        },
      ],
    },
  },
  step_up_from_idle_cash: {
    description:
      'Use a short-term investment strategy to pursue income while maintaining liquidity',
    step_up_from_idle_cash: {
      description:
        'Use a short-term investment strategy to pursue income while maintaining liquidity',
      recommended_etfs: [
        {
          name: 'BlackRock Ultra Short-Term Bond ETF ',
          symbol: 'ICSH',
          status: 'ACTIVE',
          type: 'Multi Sectors',
        },
        {
          name: 'BlackRock Short Duration Bond ETF ',
          symbol: 'NEAR',
          status: 'ACTIVE',
          type: 'Multi Sectors',
        },
        {
          name: 'BlackRock Short Maturity Municipal Bond ETF ',
          symbol: 'MEAR',
          status: 'ACTIVE',
          type: 'Municipals',
        },
      ],
    },
  },
  focus_on_income: {
    description:
      'Seek dividend and interest payments from stocks and bonds or through covered call options strategies',
    dividend_focused_stocks: {
      description: 'Companies with a history of paying or growing dividendse',
      recommended_etfs: [
        {
          name: 'iShares Core High Dividend ETF ',
          symbol: 'HDV',
          status: '',
          type: 'All Cap',
        },
        {
          name: 'iShares Select Dividend ETF ',
          symbol: 'DVY',
          status: '',
          type: 'All Cap',
        },
        {
          name: 'iShares Core Dividend Growth ETF ',
          symbol: 'DGRO',
          status: '',
          type: 'All Cap',
        },
      ],
    },
    bonds_with_yield_potential: {
      description:
        'Target higher-risk bonds with greater yield potential than U.S. government debt',
      recommended_etfs: [
        {
          name: 'iShares Broad USD High Yield Corporate Bond ETF ',
          symbol: 'USHY',
          status: '',
          type: 'High Yield',
        },
        {
          name: 'iShares 20+ Year Treasury Bond BuyWrite Strategy ETF ',
          symbol: 'TLTW',
          status: '',
          type: 'Government',
        },
      ],
    },
    target_outcomes_with_enhanced_income_potential: {
      description:
        'Target higher-risk bonds with greater yield potential than U.S. government debt',
      recommended_etfs: [
        {
          name: 'BlackRock Advantage Large Cap Income ETF ',
          symbol: 'BALI',
          status: 'ACTIVE',
          type: 'Large Cap',
        },
        {
          name: 'iShares 20+ Year Treasury Bond BuyWrite Strategy ETF ',
          symbol: 'TLTW',
          status: '',
          type: 'Government',
        },
      ],
    },
  },
  navigate_risk: {
    description:
      'Hedge against potential market pitfalls, seek to minimize volatility',
    aim_to_reduce_stock_risk: {
      description: 'Seek to minimize sensitivity to market swings',
      recommended_etfs: [
        {
          name: 'iShares MSCI USA Min Vol Factor ETF ',
          symbol: 'USMV',
          status: '',
          type: 'Large/Mid Cap',
        },
        {
          name: 'iShares MSCI EAFE Min Vol Factor ETF ',
          symbol: 'EFAV',
          status: '',
          type: 'Large/Mid Cap',
        },
        {
          name: 'iShares MSCI Emerging Markets Min Vol Factor ETF ',
          symbol: 'EEMV',
          status: '',
          type: 'Large/Mid Cap',
        },
      ],
    },
    target_outcomes_with_downside_protection: {
      description:
        'Aim to mitigate downside losses with capped upside market participation',
      recommended_etfs: [
        {
          name: 'iShares Large Cap Moderate Buffer ETF ',
          symbol: 'IVVM',
          status: 'ACTIVE',
          type: 'Large Cap',
        },
        {
          name: 'iShares Large Cap Deep Buffer ETF ',
          symbol: 'IVVB',
          status: 'ACTIVE',
          type: 'Large Cap',
        },
      ],
    },
    help_manage_inflation_risk: {
      description: 'Hedge against rising consumer prices',
      recommended_etfs: [
        {
          name: 'iShares TIPS Bond ETF ',
          symbol: 'TIP',
          status: '',
          type: 'Inflation',
        },
        {
          name: 'iShares 0-5 Year TIPS Bond ETF ',
          symbol: 'STIP',
          status: '',
          type: 'Inflation',
        },
      ],
    },
    reposition_for_rising_rates: {
      description: 'Reduce interest rate sensitivity with different strategies',
      recommended_etfs: [
        {
          name: 'BlackRock Floating Rate Loan ETF ',
          symbol: 'BRLN',
          status: 'ACTIVE',
          type: 'ETF',
        },
        {
          name: 'BlackRock Ultra Short-Term Bond ETF ',
          symbol: 'ICSH',
          status: 'ACTIVE',
          type: 'Multi Sectors',
        },
        {
          name: 'BlackRock Short Duration Bond ETF ',
          symbol: 'NEAR',
          status: 'ACTIVE',
          type: 'Multi Sectors',
        },
        {
          name: 'BlackRock Short Maturity Municipal Bond ETF ',
          symbol: 'MEAR',
          status: 'ACTIVE',
          type: 'Municipals',
        },
      ],
    },
  },
  aim_to_maximize_growth: {
    description: 'Pursue long-term opportunities in the stock market',
    track_the_market: {
      description:
        'Take advantage of built-in diversification within the U.S and international markets',
      recommended_etfs: [
        {
          name: 'iShares Core S&P Total U.S. Stock Market ETF ',
          symbol: 'ITOT',
          status: '',
          type: 'All Cap',
        },
        {
          name: 'iShares Core S&P 500 ETF ',
          symbol: 'IVV',
          status: '',
          type: 'Large Cap',
        },
        {
          name: 'iShares Core S&P Mid-Cap ETF ',
          symbol: 'IJH',
          status: '',
          type: 'Mid Cap',
        },
      ],
    },
    harness_megatrends: {
      description:
        'Tap into powerful, transformative forces within the global economy',
      recommended_etfs: [
        {
          name: 'iShares Exponential Technologies ETF ',
          symbol: 'XT',
          status: '',
          type: 'Global',
        },
        {
          name: 'iShares Cybersecurity and Tech ETF ',
          symbol: 'IHAK',
          status: '',
          type: 'Global',
        },
        {
          name: 'iShares Genomics Immunology and Healthcare ETF ',
          symbol: 'IDNA',
          status: '',
          type: 'Global',
        },
      ],
    },
    mobilize_factors: {
      description:
        'Employ the power of historical drivers of return, including value and quality',
      recommended_etfs: [
        {
          name: 'iShares U.S. Equity Factor ETF ',
          symbol: 'LRGF',
          status: '',
          type: 'Large/Mid Cap',
        },
        {
          name: 'iShares MSCI USA Momentum Factor ETF ',
          symbol: 'MTUM',
          status: '',
          type: 'Large/Mid Cap',
        },
        {
          name: 'iShares MSCI USA Quality Factor ETF ',
          symbol: 'QUAL',
          status: '',
          type: 'Large/Mid Cap',
        },
      ],
    },
  },
};
