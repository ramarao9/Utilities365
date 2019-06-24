import { handleCrmOpenActions } from "../CLI/Actions/OpenCliService";
import { handleCrmCreateActions } from "../CLI/Actions/CreateCliService";
import { getErrorResponse, getTextResponse } from "./CliResponse";
import IsEmpty from "is-empty";

export const PerformCrmAction = async cliData => {
  let cliResponse = null;

  if (IsEmpty(cliData) || IsEmpty(cliData.action)) return;

  const target = cliData.target;

  if (IsEmpty(target)) {
    return getErrorResponse(
      `Unable to determine the target on which ${
        cliData.action
      } needs to be performed`
    );
  }


  var action = cliData.action;

  switch (action.toLowerCase()) {
    case "open":
      cliResponse = await handleCrmOpenActions(cliData);
      break;

    case "create":
      cliResponse = await handleCrmCreateActions(cliData);
      break;
  }

  return cliResponse;
};
