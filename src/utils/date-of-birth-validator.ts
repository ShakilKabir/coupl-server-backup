//date-of-birth-validator.ts

import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as moment from 'moment';

export function IsOlderThan(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsOlderThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return moment().diff(moment(value, 'YYYY-MM-DD'), 'years') < 130;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid date of birth: must be less than 130 years of age';
        }
      },
    });
  };
}
