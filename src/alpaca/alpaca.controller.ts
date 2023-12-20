// alpaca.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AlpacaService } from './alpaca.service';

@Controller('investments')
export class AlpacaController {
  constructor(private readonly alpacaService: AlpacaService) {}

  @Get('accounts')
  getAllAccounts() {
    return this.alpacaService.getAllAlpacaAccount();
  }

  @Get('accounts/:id')
  getAccountById(@Param('id') id: string) {
    return this.alpacaService.getSingleAccount(id);
  }

  @Get('accountIds')
  getTraderAccIds() {
    return this.alpacaService.getTraderAccIds();
  }

  @Post('accounts')
  createAccount(@Body() accountData: any) {
    return this.alpacaService.createClientAccount(accountData);
  }

  @Get('assets')
  getAllAssets(@Query('page', ParseIntPipe) page: number) {
    return this.alpacaService.getAllAssets(page);
  }

  @Get('ach-relationships/:id')
  getAchRelationship(@Param('id') id: string) {
    return this.alpacaService.getUserAchRelationship(id);
  }

  @Post('ach-relationships')
  createAchRelationship(
    @Body()
    accountData: {
      accountId: string;
      bankAccountData: {
        routingNo?: string;
        accountNo?: number;
        bank_name?: string;
      };
    },
  ) {
    return this.alpacaService.createAchRelationship(accountData);
  }

  @Post('addFunds')
  addFundToAccount(
    @Body()
    relationshipData: {
      accountId: string;
      relationId: string;
      amount: number;
    },
  ) {
    return this.alpacaService.addFundToAccount(relationshipData);
  }

  @Post('create-order')
  createOrder(
    @Body()
    orderData: {
      accountId: string;
      orderForm: {
        type?: string;
        quantity?: number;
        symbol?: string;
        limitPrice?: string;
      };
    },
  ) {
    return this.alpacaService.createOrder(orderData);
  }

  // Add trading functionalities endpoints
  @Get('historicaldata/:symbol/:startdate/:dateFrom')
  getHistoricalData(
    @Param('symbol') symbol: string,
    @Param('startdate') startdate: string,
    @Param('dateFrom') dateFrom: string,
  ) {
    return this.alpacaService.getHistoricalData(symbol, startdate, dateFrom);
  }

  @Get('top-movers')
  getTopMoversData() {
    return this.alpacaService.getAlphaVantageMoversData(5);
  }

  // getting single stock data (high,low,avg)
  @Get('global-quote/:symbol')
  getGlobalQuote(@Param('symbol') symbol: string) {
    return this.alpacaService.getGlobalQuote(symbol);
  }

  @Get('company-details/:symbol')
  getCompanyDetails(@Param('symbol') symbol: string) {
    return this.alpacaService.getCompanyDetails(symbol);
  }

  @Get('trading-data/:accountId')
  getTradingAccountbyId(@Param('accountId') accountId: string) {
    return this.alpacaService.getTradingAccountbyId(accountId);
  }

  @Get('trading-position/:accountId')
  getTradingPositionbyId(@Param('accountId') accountId: string) {
    return this.alpacaService.getTradingPositionbyId(accountId);
  }

  @Get('trading-orders/:accountId')
  getTradingOrdersbyId(@Param('accountId') accountId: string) {
    return this.alpacaService.getTradingOrdersbyId(accountId);
  }

  @Get('transfers/:accountId')
  getAccFundTransferHistory(@Param('accountId') accountId: string) {
    return this.alpacaService.getAccFundTransferHistory(accountId);
  }

  @Get('ishareEtfs')
  getIshareEtfs() {
    return this.alpacaService.getIshareEtfs();
  }

  //getIshareEtfData
  @Get('ishareEtfData/:symbol')
  getIshareEtfData(@Param('symbol') symbol: string) {
    return this.alpacaService.getIshareEtfData(symbol);
  }

  //getIshareEtfDetails
  @Get('ishareEtfDetails/:symbol')
  getIshareEtfDetails(@Param('symbol') symbol: string) {
    return this.alpacaService.getIshareEtfDetails(symbol);
  }

  @Get('ishareEtfs/:investmentType/:specificGoal')
  getIshareEtfsbyGoals(
    @Param('investmentType') investmentType: string,
    @Param('specificGoal') specificGoal: string,
  ) {
    return this.alpacaService.getIshareEtfsbyGoals(
      investmentType,
      specificGoal,
    );
  }

  @Post('create-sell-order')
  createSellOrder(
    @Body()
    orderData: {
      accountId: string;
      orderForm: {
        type?: string;
        quantity?: number;
        symbol?: string;
        limitPrice?: string;
      };
    },
  ) {
    return this.alpacaService.createSellOrder(orderData);
  }

  // getStockLogo
  @Get('company-logo/:symbol')
  getStockLogo(@Param('symbol') symbol: string) {
    return this.alpacaService.getStockLogo(symbol);
  }

  //getPortfolioChartValue
  @Get('portfolio-chart-values/:accountId')
  getPortfolioChartValue(@Param('accountId') accountId: string) {
    return this.alpacaService.getPortfolioChartValue(accountId);
  }

  //getPastPortfolioVals
  @Get('get-past-portfolio-vals/:accountId')
  getPastPortfolioVals(@Param('accountId') accountId: string) {
    return this.alpacaService.getPastPortfolioVals(accountId);
  }

  //sanitizeportvals
  @Get('sanitize')
  sanitizeportvals() {
    return this.alpacaService.sanitizeportvals();
  }
}
