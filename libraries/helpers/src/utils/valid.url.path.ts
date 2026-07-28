import {
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint({ name: 'checkValidExtension', async: false })
export class ValidUrlExtension implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return (
      !!text?.split?.('?')?.[0].endsWith('.png') ||
      !!text?.split?.('?')?.[0].endsWith('.jpg') ||
      !!text?.split?.('?')?.[0].endsWith('.jpeg') ||
      !!text?.split?.('?')?.[0].endsWith('.gif') ||
      !!text?.split?.('?')?.[0].endsWith('.webp') ||
      !!text?.split?.('?')?.[0].endsWith('.mp4') ||
      // Attachments are stored under a server-derived extension, so a .mov
      // here means the upload already byte-verified a QuickTime container.
      // Without this the composer refuses to save any post carrying one.
      !!text?.split?.('?')?.[0].endsWith('.mov')
    );
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return (
      'File must have a valid extension: .png, .jpg, .jpeg, .gif, .webp, .mp4, or .mov'
    );
  }
}

@ValidatorConstraint({ name: 'checkValidPath', async: false })
export class ValidUrlPath implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!process.env.RESTRICT_UPLOAD_DOMAINS) {
      return true;
    }

    return (
      (text || 'invalid url').indexOf(process.env.RESTRICT_UPLOAD_DOMAINS) > -1
    );
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return (
      'URL must contain the domain: ' + process.env.RESTRICT_UPLOAD_DOMAINS + ' Make sure you first use the upload API route.'
    );
  }
}
