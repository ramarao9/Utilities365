import { ConditionOperatorType } from "../interfaces/ConditionOperatorType";
import { getAttValueFromAttQueryInfo, getConditionOperatorType, getConditionWhenQueryFunction, getFunctionDefinitionCaseInsensitive, getODataCondition, parseParamValueByType } from "./QueryHelper";

test('test getODataCondition for ne null ', () => {
    let attParamValue = "ne null";
    let attributeMetadata: any = { AttributeType: 'String', LogicalName: "firstname" };

    let expectedODataCondition = "firstname ne null";
    expect(getODataCondition(attParamValue, attributeMetadata)).toBe(expectedODataCondition);
});


test('test getODataCondition for startswith ', () => {
    let attQueryInfo = "startswith Rama";
    let attributeMetadata: any = { AttributeType: 'String', LogicalName: "firstname" };

    let expectedODataCondition = "startswith(firstname,'rama')";
    expect(getODataCondition(attQueryInfo, attributeMetadata)).toBe(expectedODataCondition);
});

test('test getODataCondition for not startswith ', () => {
    let attQueryInfo = "not startswith Rama";
    let attributeMetadata: any = { AttributeType: 'String', LogicalName: "firstname" };

    let expectedODataCondition = "not startswith(firstname,'rama')";
    expect(getODataCondition(attQueryInfo, attributeMetadata)).toBe(expectedODataCondition);
});


test('test getAttValueFromAttQueryInfo to return attribute value', () => {

    let attQueryInfo = "not contains Rama";

    let expectedAttValue = "Rama";
    expect(getAttValueFromAttQueryInfo(attQueryInfo)).toEqual(expectedAttValue.toLowerCase());
});

test('test getAttValueFromAttQueryInfo when no attribute value and only condition', () => {

    let attQueryInfo = "ne null";

    let expectedAttValue = "";
    expect(getAttValueFromAttQueryInfo(attQueryInfo)).toEqual(expectedAttValue.toLowerCase());
});


test('test getAttValueFromAttQueryInfo to return attribute value with spaces', () => {

    let attQueryInfo = "not contains Rama Rao";

    let expectedAttValue = "Rama Rao";
    expect(getAttValueFromAttQueryInfo(attQueryInfo)).toEqual(expectedAttValue.toLowerCase());
});


test('test getConditionOperatorType - Standard Query', () => {

    let conditionOperator = "not Contains";
    let expectedConditionOperatorType = ConditionOperatorType.StandardQueryFunction;

    expect(getConditionOperatorType(conditionOperator)).toEqual(expectedConditionOperatorType);

});


test('test getConditionOperatorType - Regular', () => {

    let conditionOperator = "Ne Null";
    let expectedConditionOperatorType = ConditionOperatorType.Regular;

    expect(getConditionOperatorType(conditionOperator)).toEqual(expectedConditionOperatorType);

});


test('test getConditionOperatorType - Query Function', () => {

    let conditionOperator = "LastXHours";
    let expectedConditionOperatorType = ConditionOperatorType.QueryFunction;

    expect(getConditionOperatorType(conditionOperator)).toEqual(expectedConditionOperatorType);
});


test('test getFunctionDefinitionCaseInsensitive - lastxhours', () => {

    let queryFunction = "lastxhours";
    let expectedFunctionDefinitionName = "LastXHours";

    expect(getFunctionDefinitionCaseInsensitive(queryFunction).Name).toEqual(expectedFunctionDefinitionName);
});


test('test parseParamValueByType - Collection(Edm.String)', () => {

    let paramType = "Collection(Edm.String)";
    let paramValue = `"John","Jill"`;

    let expectedParsedValue = "['John','Jill']";
    expect(parseParamValueByType(paramType, paramValue)).toEqual(expectedParsedValue);

});


test('test getConditionWhenQueryFunction - LastXHours',()=>{
    
    let attributeMetadata: any = { AttributeType: 'DateTime', LogicalName: "createdon" };

    let expectedCondition="Microsoft.Dynamics.CRM.LastXHours(PropertyName='createdon',PropertyValue=1)";
    expect(getConditionWhenQueryFunction(attributeMetadata,"lastxhours","1")).toEqual(expectedCondition);
});