import { EntityReference } from "../../../interfaces/EntityReference";
import { ParseLookupStringIntoEntityReference } from "./WriteCliService";


test('test ParseLookupStringIntoEntityReference when valid', () => {

    let id="5c55c25d-2f51-eb11-a813-000d3a3ae707";
    let logicalName="account";
    let lookupString: string = `${logicalName}_${id}`;


    let lookup: EntityReference| undefined=ParseLookupStringIntoEntityReference(lookupString);
    expect(lookup!=null).toBe(true);
    expect(lookup?.id).toEqual(id);
    expect(lookup?.logicalname).toEqual(logicalName);
});


