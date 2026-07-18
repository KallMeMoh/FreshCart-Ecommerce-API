import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MatchesFieldType(
  field: string,
  expected_type: Record<string, string | number>,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'matchesField',
      target: object.constructor,
      propertyName,
      constraints: [field],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [siblingFieldName] = args.constraints as string[];
          const object = args.object as Record<string, unknown>;
          const siblingValue = object[siblingFieldName] as string | undefined;

          const expected = siblingValue
            ? expected_type[siblingValue]
            : undefined;
          if (!expected) return false;
          return typeof value === expected;
        },
        defaultMessage(args: ValidationArguments) {
          const [siblingFieldName] = args.constraints as string[];
          const object = args.object as Record<string, unknown>;
          const siblingValue = object[siblingFieldName] as string | undefined;

          return `${args.property} must be a ${
            (siblingValue && expected_type[siblingValue]) ?? 'valid'
          } for ${siblingFieldName} "${siblingValue}"`;
        },
      },
    });
  };
}
