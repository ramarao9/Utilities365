
import { ActionParam } from '../../../interfaces/CliData';
import { CLI_ACTION_PARAMS_GET_COMMON_CONDITIONS, CLI_ACTION_PARAMS_GET_STRING_CONDITIONS } from '../Definitions/ActionParams/Get';
import { getVerbsWhenAttributeOnGetRecords, isLastParamAttribute } from './GetIntelliSenseService'


test('last param is attribute test', () => {

    let lastParam: ActionParam = { name: "firstname", value: "test" };
    let attributes: any = [{ LogicalName: "firstname", EntityLogicalName: "contact" }];

    expect(isLastParamAttribute(lastParam, attributes)).toBe(true);
});


test('get condition operator groups using att type', () => {

    let lastParam: ActionParam = { name: "firstname", value: "test" };
    let attributes: any = [{ LogicalName: "firstname", EntityLogicalName: "contact", AttributeType: "String" }];


    let stringConditions = CLI_ACTION_PARAMS_GET_COMMON_CONDITIONS.concat(CLI_ACTION_PARAMS_GET_STRING_CONDITIONS);

    expect(getVerbsWhenAttributeOnGetRecords(lastParam, attributes)).toEqual(stringConditions);

});