import { Injectable } from '@nestjs/common';
import { getAlpacaInstance } from '../utils/AlpacaInstance';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { ishareETFs } from 'src/utils/etfdata';
import { etfShareData } from 'src/utils/etfShareData';
import { etfShareDetails } from 'src/utils/etfShareDetails';
import { PortfolioValue } from './schemas/portfolioValue.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AlpacaService {
  constructor(
    @InjectModel(PortfolioValue.name)
    private readonly portfolioValueModel: Model<PortfolioValue>,
  ) {}
  private readonly AlpacaInstance = getAlpacaInstance();
  private readonly alphaVantageUrl = 'https://www.alphavantage.co/query';
  private readonly finnhubURL = 'https://finnhub.io/api/v1/stock/profile2';

  accountRequestBuilder(obj: any) {
    const country = String('USA').toUpperCase();

    const defaultData = {
      contact: {
        email_address: obj.email_address,
        phone_number: obj.phone_number,
        street_address: [
          obj.physical_address.street_line_1 +
            obj.physical_address.street_line_2,
        ],
        city: obj.physical_address.city,
        state: obj.physical_address.state,
        postal_code: obj.physical_address.postal_code,
      },
      identity: {
        given_name: obj.first_name,
        family_name: obj.last_name,
        date_of_birth: obj.date_of_birth,
        // tax_id: faker.phone.number('###-##-####'),
        tax_id: obj.phone_number,
        tax_id_type: 'USA_SSN',
        country_of_citizenship: country,
        country_of_birth: country,
        country_of_tax_residence: country,
        // funding_source: obj['funding_source'],
        funding_source: ['employment_income'],
      },
      disclosures: {
        is_control_person: false,
        is_affiliated_exchange_or_finra: false,
        is_politically_exposed: false,
        immediate_family_exposed: false,
      },
      agreements: [
        {
          agreement: 'customer_agreement',
          signed_at: new Date(),
          ip_address: obj.ip ?? faker.internet.ipv4(),
        },
      ],
      documents: [
        {
          document_type: 'identity_verification',
          document_sub_type: 'passport',
          content: '/9j/Cg==',
          mime_type: 'image/jpeg',
        },
      ],
      trusted_contact: {
        given_name: obj.first_name,
        family_name: obj.last_name,
        email_address: obj.email_address,
      },
      //   enabled_assets: ['us_equity'],
      enabled_assets: null,
    };
    return defaultData;
  }

  async createClientAccount(accountData: any) {
    const finalData = this.accountRequestBuilder({ ...accountData });
    const { data } = await this.AlpacaInstance.post('/v1/accounts', finalData);
    // console.log(data);
    return data;
  }

  // private async getUserByEmail(email: string) {
  //   const { data } = await this.AlpacaInstance.get(`/v1/accounts`);
  //   const duplicateUser = data.find((user: any) => user.email === email);
  //   return data;
  // }

  async createAchRelationship({ accountId, bankAccountData }) {
    //   const dbUser = await getUserByEmail(email);
    //   if (!dbUser?.email) {
    //     throw new Error(`User doesn't exist.`);
    //   }

    //   if (dbUser?.ach) {
    //     throw new Error(`Only one relationship allowed.`);
    //   }

    const alpacaUser: any = await this.getClientById(accountId);
    const {
      identity: { given_name, family_name },
    } = alpacaUser;

    const fullName = given_name + ' ' + family_name;
    const bankObject = {
      account_owner_name: fullName,
      bank_account_type: 'CHECKING',
      bank_routing_number: bankAccountData.routingNo || '123103716',
      bank_account_number: bankAccountData.accountNo || '32131231abc',
      nickname: bankAccountData.bank_name || 'Bank of America Checking',
    };

    const routeToHit = `/v1/accounts/${accountId}/ach_relationships`;
    const { data } = await this.AlpacaInstance.post(
      routeToHit,
      JSON.stringify(bankObject),
    );

    //   const result = await updateAch(email, data.id);

    return data;
  }

  async addFundToAccount({ accountId, relationId, amount }) {
    const fundTransfer = {
      transfer_type: 'ach',
      relationship_id: relationId,
      amount: amount,
      direction: 'INCOMING',
    };

    const { data } = await this.AlpacaInstance.post(
      `/v1/accounts/${accountId}/transfers`,
      JSON.stringify(fundTransfer),
    );
    return data;
  }

  async createOrder({ accountId, orderForm }) {
    let orderObj = null;
    if (orderForm?.type === 'market') {
      orderObj = this.toMarketOrder(orderForm);
    } else if (orderForm?.type === 'limit') {
      orderObj = this.toLimitOrder(orderForm);
    }
    if (orderObj) {
      const { data } = await this.AlpacaInstance.post(
        `/v1/trading/accounts/${accountId}/orders`,
        orderObj,
      );
      return data;
    }
  }

  private toLimitOrder(orderForm: any) {
    //what does this function do
    const orderObj = {
      side: 'buy',
      type: 'limit',
      time_in_force: 'day',
      qty: orderForm?.quantity ?? 1,
      symbol: orderForm?.symbol ?? 'AAPL',
      limit_price: orderForm?.limitPrice ?? '1',
    };
    return orderObj;
  }

  private toMarketOrder(orderForm: any) {
    const orderObj = {
      side: 'buy',
      type: 'market',
      time_in_force: 'day',
      qty: orderForm?.quantity ?? 1,
      symbol: orderForm?.symbol ?? 'AAPL',
    };
    return orderObj;
  }

  async getTradingAccountbyId(accountId: string): Promise<any> {
    const { data } = await this.AlpacaInstance.get(
      `/v1/trading/accounts/${accountId}/account`,
    );
    return data;
  }

  //for getting position (shares)
  async getTradingPositionbyId(accountId: string): Promise<any> {
    const { data } = await this.AlpacaInstance.get(
      `/v1/trading/accounts/${accountId}/positions`,
    );
    return data;
  }

  //for getting orders (shares)
  async getTradingOrdersbyId(accountId: string): Promise<any> {
    const { data } = await this.AlpacaInstance.get(
      `/v1/trading/accounts/${accountId}/orders`,
    );
    return data;
  }

  //for getting position (shares) by accId and symbol
  async getTradingPositionbySymbol(
    accountId: string,
    symbol: string,
  ): Promise<any> {
    const { data } = await this.AlpacaInstance.get(
      `/v1/trading/accounts/${accountId}/positions/${symbol}`,
    );
    return data;
  }

  // **************************************************************

  async getAccFundTransferHistory(accountId: string) {
    const { data } = await this.AlpacaInstance.get(
      `/v1/accounts/${accountId}/transfers`,
    );
    return data;
  }

  //gets all accounts under the broker account
  async getAllAlpacaAccount() {
    const { data } = await this.AlpacaInstance.get('/v1/accounts');
    return data;
  }

  //RETURNS DETAILS OF A SINGLE ACCOUNT
  async getSingleAccount(accountId: string) {
    const { data } = await this.AlpacaInstance.get(`/v1/accounts/${accountId}`);
    return data;
  }

  // async getAllAssets() {
  //   const { data } = await this.AlpacaInstance.get('/v1/assets');
  //   const finalData = data.map(
  //     ({ symbol, name, maintenance_margin_requirement }) => ({
  //       symbol,
  //       name,
  //       maintenance_margin_requirement,
  //     }),
  //   );
  //   return finalData;
  // }

  async getAllAssets(page = 1, limit = 20) {
    try {
      const { data } = await this.AlpacaInstance.get('/v1/assets');

      // Calculate start and end indices based on page and limit
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      // Slice the data array based on calculated indices
      const paginatedData = data.slice(startIndex, endIndex);

      const finalData = paginatedData.map(
        ({ symbol, name, maintenance_margin_requirement }) => ({
          symbol,
          name,
          maintenance_margin_requirement,
        }),
      );

      return finalData;
    } catch (error) {
      // Handle errors, e.g., log or throw an exception
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  async getUserAchRelationship(id: string) {
    const { data } = await this.AlpacaInstance.get(
      `/v1/accounts/${id}/ach_relationships`,
    );
    return data;
  }

  async removeAchRelation(accountId: string) {
    const achList: any[] = await this.getUserAchRelationship(accountId);
    if (!achList.length) {
      throw Error('No ACH relationship exists.');
    }

    const ach = achList.find((v) => v.account_id == accountId);
    if (!ach) {
      return null;
    }

    const { data } = await this.AlpacaInstance.delete(
      `/v1/accounts/${accountId}/ach_relationships/${ach?.id}`,
    );
    return data;
  }

  async getClientById(id: string) {
    if (!id) {
      return null;
    }
    const { data } = await this.AlpacaInstance.get(`/v1/accounts/${id}`);
    return data;
  }

  async getOrderList(accountId: string) {
    const { data } = await this.AlpacaInstance.get(
      `/v1/trading/accounts/${accountId}/orders?status=all`,
    );
    return data;
  }

  async getSingleOrderDetails(accountId: string, orderId: string) {
    const { data } = await this.AlpacaInstance.get(
      `/v1/trading/accounts/${accountId}/orders/${orderId}`,
    );
    return data;
  }

  async createSellOrder({ accountId, orderForm }) {
    let orderObj = null;
    if (orderForm?.type === 'market') {
      orderObj = this.toMarketSellOrder(orderForm);
    } else if (orderForm?.type === 'limit') {
      orderObj = this.toLimitSellOrder(orderForm);
    }
    if (orderObj) {
      const { data } = await this.AlpacaInstance.post(
        `/v1/trading/accounts/${accountId}/orders`,
        orderObj,
      );
      return data;
    }
  }

  private toLimitSellOrder(orderForm: any) {
    const orderObj = {
      side: 'sell',
      type: 'limit',
      time_in_force: 'day',
      qty: orderForm?.quantity ?? 1,
      symbol: orderForm?.symbol ?? 'AAPL',
      limit_price: orderForm?.limitPrice ?? '1',
    };
    return orderObj;
  }

  private toMarketSellOrder(orderForm: any) {
    const orderObj = {
      side: 'sell',
      type: 'market',
      time_in_force: 'day',
      qty: orderForm?.quantity ?? 1,
      symbol: orderForm?.symbol ?? 'AAPL',
    };
    return orderObj;
  }

  async getHistoricalData(
    symbol: string,
    startdate: string,
    dateFrom: string,
  ): Promise<any> {
    try {
      // Define the API request configuration
      const config = {
        params: {
          access_key: process.env.MARKETSTACK_API_KEY,
          symbols: symbol,
          date_from: dateFrom,
          date_to: startdate,
        },
      };

      // Send the API request using NestJS HttpService
      const response = await axios.get(
        'http://api.marketstack.com/v1/eod',
        config,
      );

      // Return the API response data
      return response.data;
    } catch (error) {
      // Handle errors
      console.error('API Error:', error);

      //throw a custom exception or handle the error differently
      throw new Error(
        error instanceof Error ? error.message : 'Internal Server Error',
      );
    }
  }

  async getAlphaVantageMoversData(size: number): Promise<any> {
    const { data } = await axios.get(
      `${this.alphaVantageUrl}?function=TOP_GAINERS_LOSERS&apikey=demo`,
    );

    // `${this.alphaVantageUrl}?function=TOP_GAINERS_LOSERS&apikey=${process.env.ALPHA_VINTAGE_KEY}`
    return data;
  }

  // private convertRawToDesired(rawData: any, size: number): any {
  //   const gainers = (rawData.top_gainers || [])
  //     .map((gainer: any) => ({
  //       symbol: gainer.ticker,
  //       percent_change: parseFloat(gainer.change_percentage.replace('%', '')),
  //       change: parseFloat(gainer.change_amount),
  //       price: parseFloat(gainer.price),
  //     }))
  //     .slice(0, size);

  //   const losers = (rawData.top_losers || [])
  //     .map((loser: any) => ({
  //       symbol: loser.ticker,
  //       percent_change: parseFloat(loser.change_percentage.replace('%', '')),
  //       change: parseFloat(loser.change_amount),
  //       price: parseFloat(loser.price),
  //     }))
  //     .slice(0, size);

  //   return {
  //     gainers,
  //     losers,
  //   };
  // }

  // async getMoversData(limit: string): Promise<any> {
  //   const alpacaTradeInstance = getAlpacaTradeInstance();

  //   const {
  //     data: { is_open },
  //   } = await this.AlpacaInstance.get('v1/clock');

  //   if (is_open) {
  //     const { data } = await alpacaTradeInstance.get(`/v1beta1/screener/stocks/movers?top=${limit}`);
  //     return data;
  //   } else {
  //     const cachedData: any = __topMoversCache__.get('top');
  //     let finalData = { ...cachedData };

  //     if (!cachedData) {
  //       const alphaVantageData = await this.getAlphaVantageMoversData(Number(limit) || 10);
  //       __topMoversCache__.set('top', alphaVantageData);
  //       finalData = alphaVantageData;
  //     }

  //     if (finalData?.top_gainers?.length) {
  //       const desiredData = this.convertRawToDesired(finalData, Number(limit) || 10);
  //       return desiredData;
  //     } else {
  //       const alphaVantageData = await this.getAlphaVantageMoversData(Number(limit) || 10);
  //       __topMoversCache__.set('top', alphaVantageData);
  //       const desiredData = this.convertRawToDesired(alphaVantageData, Number(limit) || 10);
  //       return desiredData;
  //     }
  //   }
  // }

  async getGlobalQuote(symbol: string): Promise<any> {
    try {
      const finnhubResponse = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
      );

      const finnhubData = finnhubResponse.data;

      return {
        currentPrice: finnhubData.c,
        change: finnhubData.d,
        percentChange: finnhubData.dp,
        high: finnhubData.h,
        low: finnhubData.l,
        open: finnhubData.o,
        previousClose: finnhubData.pc,
      };
    } catch (error) {
      // Handle errors or log them
      console.error('Error fetching global quote:', error.message);
      throw error;
    }
  }

  async getCompanyDetails(symbol: string): Promise<any> {
    const { data } = await axios.get(
      `${this.alphaVantageUrl}?function=OVERVIEW&symbol=${symbol}&apikey=${process.env.ALPHA_VINTAGE_KEY}`,
    );

    return data;
  }

  getIshareEtfsbyGoals(investment_type: string, specific_goal: string): any {
    const data = ishareETFs[`${investment_type}`][`${specific_goal}`];

    return data;
  }

  getIshareEtfs(): any {
    const data = ishareETFs;
    return data;
  }

  getIshareEtfData(symbol: string): any {
    const data = etfShareData[symbol];
    return data;
  }

  getIshareEtfDetails(symbol: string): any {
    const data = etfShareDetails[symbol];
    return data;
  }

  async getStockLogo(symbol: string): Promise<any> {
    const finnhuburl = `${this.finnhubURL}?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
    const { data } = await axios.get(finnhuburl);
    return data;
  }

  async updatePortfolioValue(
    traderAccId: string,
    value: { date: Date; value: number }[],
  ) {
    // Assuming you want to update the entire portfolioVals array
    return this.portfolioValueModel
      .updateOne({ traderAccId }, { portfolioVals: value })
      .exec();
  }

  async getPastPortfolioVals(traderAccId: string) {
    let pcv: any = await this.portfolioValueModel
      .findOne({ traderAccId })
      .exec();
    if (!pcv) {
      pcv = { traderAccId, portfolioVals: [] };
      await this.portfolioValueModel.create(pcv);
    }
    return pcv;
  }

  async getPortfolioChartValue(traderAccId: string) {
    let pcv: any = await this.getPastPortfolioVals(traderAccId);
    const traderAccount = await this.getTradingAccountbyId(traderAccId);
    const recentPflVal = await traderAccount['position_market_value'];
    const pastPflVals = pcv.portfolioVals.map((x) => x.value);
    if (!pastPflVals.includes(recentPflVal)) {
      pcv.portfolioVals.push({ date: new Date(), value: recentPflVal });
      await this.updatePortfolioValue(traderAccId, pcv.portfolioVals);
    }
    return pcv;
  }
}
