// TODO: avoid optionals
export class LoadRequestsOption {
  urlRegexp?: string;

  static checkType(arg: any): arg is LoadRequestsOption {
    return Array.isArray(arg.fields)
    || typeof arg.urlRegexp === 'string';
  }
}