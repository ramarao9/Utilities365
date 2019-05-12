import { handleCrmOpenActions } from "../CLI/Actions/OpenCliService";
import IsEmpty from "is-empty";

export const PerformCrmAction = async (cliData) => {
  let cliResponse = null;

  if (IsEmpty(cliData) || IsEmpty(cliData.action)) return;

  var action = cliData.action;

  switch (action.toLowerCase()) {
    case "open":
      cliResponse=await  handleCrmOpenActions(cliData);
      break;
  }

  return cliResponse;
};
