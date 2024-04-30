import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export enum DocType {
  Array = 'array',
  NULL = 'null',
}

export const ApiDocResponse = <TModel extends Type<any>>(
  model: TModel,
  type: string = DocType.NULL,
) => {
  let data = null;
  if (type === 'array') {
    data = {
      type: 'array',
      items: {
        $ref: getSchemaPath(model),
      },
    };
  } else {
    data = { $ref: getSchemaPath(model) };
  }
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data,
              statusCode: {
                type: 'number',
                default: 200,
              },
            },
          },
        ],
      },
    }),
  );
};
