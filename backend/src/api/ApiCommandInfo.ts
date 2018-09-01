import { ProcessedBody } from 'Utils/requesttools';

export default class ApiCommandInfo {
  components: string[] = [];
  method: string = '';
  body?: ProcessedBody;
}
