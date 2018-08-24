// TODO: avoid optionals
export class LoadRequestsOption {
  urlRegexp?: string;

  static checkType(arg: any): arg is LoadRequestsOption {
    return typeof arg.urlRegexp === 'string';
  }
}