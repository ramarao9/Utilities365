export interface ActivityParty {
    "partyid@odata.bind": string;
    participationtypemask: number;
}


export enum ParticipationTypeMask {
    Sender = 1,
    ToRecipient,
    CCRecipient,
    BCCRecipient,
    RequiredAttendee,
    OptionalAttendee,
    Organizer,
    Regarding,
    Owner,
    Resource,
    Customer
  }