import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidateDTO implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metadata.metatype) {
      return value;
    }

    const object: object = plainToInstance(metadata.metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      const validationError = this.errormsg(errors);

      throw new BadRequestException({ validationError });
    }
    return value;
  }

  private errormsg(errors: ValidationError[]) {
    const extractedErrors = errors.map((error) => {
      const { property, constraints } = error;
      const message = constraints
        ? Object.values(constraints)[0]
        : 'Invalid value';
      return { property, error: `${message}` };
    });
    return extractedErrors;
  }
}
