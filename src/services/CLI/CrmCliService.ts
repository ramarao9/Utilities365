import { handleCrmOpenActions } from "../CLI/Actions/OpenCliService";
import IsEmpty from "is-empty";

import { CliResponse } from "../../interfaces/CliResponse";

export const PerformCrmAction = async (cliData: any): Promise<CliResponse> => {
  let cliResponse: CliResponse = {
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
  }

  return cliResponse;
};
