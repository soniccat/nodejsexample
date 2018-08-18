import { RequestRow } from 'main/RequestTable';

export default class ApiRequestInfo {
  components: string[];
  method: string;
  body?: RequestRow;
}
