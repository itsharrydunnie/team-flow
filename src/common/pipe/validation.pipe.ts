import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidateDTO implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToInstance(metadata.metatype!, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      const validationError = this.errormsg(errors);

      throw new BadRequestException({ validationError });
    }
    return value;
  }

  private errormsg(errors: Array<any>) {
    const extractedErrors = errors.map((error) => {
      const { property, constraints } = error;
      return { property: property, error: `${Object.values(constraints)[0]}` };
    });
    return extractedErrors;
  }
}
