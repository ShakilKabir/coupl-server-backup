// merchant.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from './schema/merchant.schema';

@Injectable()
export class MerchantService {
  constructor(@InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>) {}

  async findAll(): Promise<Merchant[]> {
    return this.merchantModel.find().exec();
  }

  async create(merchant: Merchant): Promise<Merchant> {
    const newMerchant = new this.merchantModel(merchant);
    return newMerchant.save();
  }

  async seedMerchants(): Promise<void> {
    const merchants = [
      { name: 'Pacific Light & Power Co', accountId: 'acct_11jpx9cmr2344b', accountNumber: '137047242282', category: 'Utilities', discounts: '5%' },
      { name: 'Clearwater Utilities Inc', accountId: 'acct_11jpx9cfr23428', accountNumber: '137047242272', category: 'Utilities', discounts: '5%' },
      { name: 'Denver Cable Co', accountId: 'acct_11jpx9cbr2340c', accountNumber: '137047242265', category: 'Cable Services', discounts: '10%' },
      { name: 'Eco Waste Solutions LLC', accountId: 'acct_11jpx9c4r233y4', accountNumber: '137047242251', category: 'Waste Management', discounts: '8%' },
      { name: 'Southwest Airlines', accountId: 'acct_11jpx8sfr232rw', accountNumber: '137047242246', category: 'Airline', discounts: '12%' },
      { name: '24 Hour Fitness', accountId: 'acct_11jpx8sar232n4', accountNumber: '137047242239', category: 'Fitness', discounts: '15%' },
      { name: 'Amazon Prime', accountId: 'acct_11jpx8s3r232j0', accountNumber: '137047242220', category: 'Retail', discounts: '5%' },
      { name: 'Spotify', accountId: 'acct_11jpx8rzr232f3', accountNumber: '137047242201', category: 'Music Streaming', discounts: '10%' },
      { name: 'Netflix', accountId: 'acct_11jpx8rrr232bs', accountNumber: '137047242190', category: 'Video Streaming', discounts: '10%' },
      { name: 'Atlantic Mobile Networks', accountId: 'acct_11jpx8rmr2328g', accountNumber: '137047242176', category: 'Telecommunications', discounts: '7%' }
    ];
  
    for (const merchant of merchants) {
      const existingMerchant = await this.merchantModel.findOne({ accountId: merchant.accountId }).exec();
      if (!existingMerchant) {
        await this.create(merchant);
      }
    }
  }

  async getOrSeedMerchants(): Promise<Merchant[]> {
    const existingMerchants = await this.findAll();
    if (existingMerchants.length === 0) {
      await this.seedMerchants();
      return this.findAll();
    }
    return existingMerchants;
  }
}
