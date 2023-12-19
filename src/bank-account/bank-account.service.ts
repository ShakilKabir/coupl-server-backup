//bank-account.service.ts

import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/auth/schema/user.schema';
import { BankAccount, BankAccountDocument } from './schema/bank-account.schema';
import { createBasicAuth } from '../utils/basic-auth-provider';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectModel(BankAccount.name)
    private bankAccountModel: Model<BankAccountDocument>,
    private httpService: HttpService,
  ) {}

  async openBankAccount(
    primaryUser: UserDocument,
    secondaryUser: UserDocument,
  ): Promise<any> {
    try {
      const primaryBankAccount = await this.bankAccountModel.findOne({
        userId: primaryUser._id,
      });
      const secondaryBankAccount = await this.bankAccountModel.findOne({
        userId: secondaryUser._id,
      });

      if (!primaryBankAccount || !secondaryBankAccount) {
        throw new Error('Bank account details not found for one or both users');
      }

      const accountData = {
        person_applications: [
          {
            id: primaryBankAccount.person_application_id,
            roles: ['owner', 'signer'],
          },
          {
            id: secondaryBankAccount.person_application_id,
            roles: ['owner', 'signer'],
          },
        ],
        primary_person_application_id: primaryBankAccount.person_application_id,
        account_product_id: 'apt_11jp5twnqtdbt9',
      };

      const config = {
        headers: {
          ...createBasicAuth(),
          'Content-Type': 'application/json',
        },
      };

      const response = await this.httpService
        .post(
          `${process.env.TREASURY_PRIME_API}/apply/account_application`,
          accountData,
          config,
        )
        .toPromise();

      return response.data.id;
    } catch (error) {
      console.error('Error in openBankAccount:', error);
      throw new InternalServerErrorException('Error opening bank account')
    }
  }

  async createPersonApplication(user: UserDocument): Promise<any> {
    try {
      const personData = this.mapUserToPersonData(user);

      const config = {
        headers: {
          ...createBasicAuth(),
          'Content-Type': 'application/json',
        },
      };

      const response = await this.httpService
        .post(
          `${process.env.TREASURY_PRIME_API}/apply/person_application`,
          personData,
          config,
        )
        .toPromise();

      await this.createOrUpdateBankAccount(user._id, {
        person_application_id: response.data.id,
      });

      return response.data;
    } catch (error) {
      console.error('Error in creatingPersonApplication:', error);
      throw new InternalServerErrorException('Error creating person application')
    }
  }

  private mapUserToPersonData(user: UserDocument): any {
    return {
      citizenship: user.citizenship,
      date_of_birth: user.date_of_birth,
      email_address: user.email_address,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      physical_address: user.physical_address,
    };
  }
  async checkAndStoreAccountNumber(
    accountApplicationId: any,
  ): Promise<{ account_number: string; account_id: string }> {
    try {
      await this.delay(10000);

      const config = {
        headers: {
          ...createBasicAuth(),
          'Content-Type': 'application/json',
        },
      };

      const response = await this.httpService
        .get(
          `${process.env.TREASURY_PRIME_API}/apply/account_application/${accountApplicationId}`,
          config,
        )
        .toPromise();

      const accountData = response.data;
      if (accountData && accountData.account_number) {
        return {
          account_number: accountData.account_number,
          account_id: accountData.account_id,
        };
      } else {
        throw new NotFoundException('Account number not available yet');
      }
    } catch (error) {
      console.error('Error in checkAndStoreAccountNumber:', error);
      throw new InternalServerErrorException('Error creating person application')
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async processAccountUpdate(webhookData: any): Promise<void> {
    // logic will be added here to handle the account update
  }

  async createOrUpdateBankAccount(
    userId: Types.ObjectId,
    accountDetails: any,
  ): Promise<BankAccountDocument> {
    let account = await this.bankAccountModel.findOne({ userId });
    if (!account) {
      account = new this.bankAccountModel({ userId, ...accountDetails });
    } else {
      account.set(accountDetails);
    }
    return account.save();
  }

  async getAccountBalance(
    userId: Types.ObjectId,
  ): Promise<{ balance: number }> {
    const data = await this.getBankAccountDetails(userId);
    const account = await this.bankAccountModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    const config = {
      headers: {
        ...createBasicAuth(),
        'Content-Type': 'application/json',
      },
    };

    const response = await this.httpService
      .get(
        `${process.env.TREASURY_PRIME_API}/account/${account.bank_account_id}`,
        config,
      )
      .toPromise();
    return { balance: data.available_balance };
  }

  async getBankAccountDetails(
    userId: Types.ObjectId,
  ): Promise<any> {
    const account = await this.bankAccountModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    const config = {
      headers: {
        ...createBasicAuth(),
        'Content-Type': 'application/json',
      },
    };

    const response = await this.httpService
      .get(
        `${process.env.TREASURY_PRIME_API}/account/${account.bank_account_id}`,
        config,
      )
      .toPromise();
      const { account_type, bank_id, available_balance, name, currency, routing_number, status, account_number } = response.data;
      return { account_type, bank_id, available_balance, name, currency, routing_number, status, account_number };
  }
}
