import IsEmpty from "is-empty";
import {
  getEntityMetadata,
  getEntityAttributes
} from "../../CrmMetadataService";

export const handleCrmCreateActions = async cliData => {
  let cliResponse = null;

  await createRecord(cliData);

  return cliResponse;
};

const createRecord = async cliData => {
  let createRequest = await getCreateRequestBody(cliData);

let s=100;
};

const getCreateRequestBody = async cliData => {
  var createRequest = {};

  let targetEntityMetadata = await getEntityAttributes(cliData.target);

  cliData.actionParams.forEach(param => {
    if (param != null && param.name != null && param.value != null) {
      //createRequest[]
    }
  });

  return createRequest;
};

export default handleCrmCreateActions;
