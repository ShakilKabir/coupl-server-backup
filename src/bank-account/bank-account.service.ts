//bank-account.service.ts

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { UserDocument } from 'src/auth/schema/user.schema';

@Injectable()
export class BankAccountService {
  constructor(private httpService: HttpService) {}

  async openBankAccount(
    primaryUser: UserDocument,
    secondaryUser: UserDocument,
  ): Promise<any> {
    try {
      const accountData = {
        person_applications: [
          {
            id: primaryUser.person_application_id,
            roles: ['owner', 'signer'],
          },
          {
            id: secondaryUser.person_application_id,
            roles: ['owner', 'signer'],
          },
        ],
        primary_person_application_id: primaryUser.person_application_id,
        account_product_id: 'apt_11jp5twnqtdbt9', // This should be the correct product ID for your application
      };

      const auth = {
        username: process.env.TREASURY_PRIME_API_KEY_ID,
        password: process.env.TREASURY_PRIME_API_SECRET_KEY,
      };

      const config = {
        auth: auth,
        headers: {
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
      return response.data;
    } catch (error) {
      console.error('Error in openBankAccount:', error);
      throw error;
    }
  }

  async createPersonApplication(user: UserDocument): Promise<any> {
    try {
      const personData = this.mapUserToPersonData(user);

      const auth = {
        username: process.env.TREASURY_PRIME_API_KEY_ID,
        password: process.env.TREASURY_PRIME_API_SECRET_KEY,
      };

      const config = {
        auth: auth,
        headers: {
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

      return response.data;
    } catch (error) {
      console.error('Error in creatingPersonApplication:', error);
      throw error;
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
}
