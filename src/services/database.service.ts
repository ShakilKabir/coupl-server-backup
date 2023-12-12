// database.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    if (this.connection.readyState === 1) {
      console.log('Database connected successfully (already connected)');
    } else {
      this.connection.on('connected', () => {
        console.log('Database connected successfully');
      });
    }

    this.connection.on('error', (error) => {
      console.error('Database connection error:', error);
    });
  }
}

