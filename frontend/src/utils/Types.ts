import InputView from 'UI/common/InputView';
import { RefDictType } from 'Utils/RefTools';
import { JsonView } from 'UI/common/JsonView';

export type InputRefDictType = RefDictType<InputView>;
export type ChildRefDictType = RefDictType<JsonView>;
