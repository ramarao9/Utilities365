import { handleCrmOpenActions } from "../CLI/Actions/OpenCliService";
import { handleCrmCreateActions, handleCrmUpdateActions } from "./Actions/WriteCliService";
import { handleCrmGetActions } from "../CLI/Actions/GetCliService";
import IsEmpty from "is-empty";

import { CliResponse } from "../../interfaces/CliResponse";

export const PerformCrmAction = async (cliData: any): Promise<CliResponse> => {
  let cliResponse: CliResponse = {
    type: "",
    message: "",
    success: false,
    response: null
  };

  if (IsEmpty(cliData) || IsEmpty(cliData.action)) return cliResponse;

  var action = cliData.action;

  switch (action.toLowerCase()) {
    case "open":
      cliResponse = await handleCrmOpenActions(cliData);
      break;


    case "create":
      cliResponse = await handleCrmCreateActions(cliData);
      break;

    case "update":
      cliResponse = await handleCrmUpdateActions(cliData);
      break;

    case "get":
      cliResponse = await handleCrmGetActions(cliData);
  }

  return cliResponse;
};
