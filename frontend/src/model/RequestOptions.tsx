// TODO: use the same from backend (like contract)
// TODO: avoid optionals
export interface RequestOptions {
  fields?: string[];
  urlRegexp?: string;
  onlyNotNull?: boolean;
}