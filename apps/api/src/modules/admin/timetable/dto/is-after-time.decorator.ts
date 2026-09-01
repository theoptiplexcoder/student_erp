import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAfterTimeConstraint(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isAfterTime',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          
          if (!relatedValue) return true; // Skip validation if startTime is not present in the payload (for partial updates)
          
          if (typeof value === 'string' && typeof relatedValue === 'string') {
            const [vHours, vMinutes] = value.split(':').map(Number);
            const [rHours, rMinutes] = relatedValue.split(':').map(Number);
            const vTotal = vHours * 60 + vMinutes;
            const rTotal = rHours * 60 + rMinutes;
            return vTotal > rTotal;
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be after ${args.constraints[0]}`;
        },
      },
    });
  };
}
