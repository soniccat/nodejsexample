import InputView from 'UI/common/InputView';
import { RefDictType } from 'Utils/RefTools';
import { JsonView } from 'UI/common/JsonView';
import { RequestRow } from 'UI/views/RequestRow';
import { StubGroupRow } from 'UI/views/StubGroupRow';

export type InputViewRef = React.RefObject<InputView>;
export type InputRefDictType = RefDictType<InputView>;
export type JsonViewRefDictType = RefDictType<JsonView>;
export type RequestRowRefDictType = RefDictType<RequestRow>;
export type StubGroupRowRefDictType = RefDictType<StubGroupRow>;
