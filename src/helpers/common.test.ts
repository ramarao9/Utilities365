import { isValidGuid } from "./common";

test('test valid guids',()=>{

    let guid1="27d123b6-3e63-eb11-a812-0022480855c2";
    let guid2="{3c8021b0-423d-475d-becf-63ed5ed34563}";
    let guid3="3C8021B0-423D-475D-BECF-63ED5ED34563";
    let invalidGuid="test";

    expect(isValidGuid(guid1)).toBeTruthy();
    expect(isValidGuid(guid2)).toBeTruthy();
    expect(isValidGuid(guid3)).toBeTruthy();
    expect(isValidGuid(invalidGuid)).toBeFalsy();
});