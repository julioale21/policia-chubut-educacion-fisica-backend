import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ParseUuidPipe implements PipeTransform {
  transform(value: any) {
    if (!isUUID(value))
      throw new BadRequestException(`El valor ${value} no es un UUID válido`);

    return value;
  }
}
