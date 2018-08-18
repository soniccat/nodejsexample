// TODO: avoid optionals
export class LoadRequestsOption {
  fields?: string[];
  urlRegexp?: string;
  onlyNotNull?: boolean;

  static checkType(arg: any): arg is LoadRequestsOption {
    return Array.isArray(arg.fields)
    || typeof arg.onlyNotNull === `boolean`
    || typeof arg.urlRegexp === 'string';
  }
}