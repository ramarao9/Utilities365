

import AuthProvider from "../helpers/Auth/AuthHelper";
import { StoreState } from "../interfaces/Store/StoreState";
import * as actionTypes from "./actions";



const initialState: StoreState = {
  tokenData: {},
  currentConnection: {},
  currentMSALPublicClient: null,
  currentMSALConfidentialClient: null,
  crmUsers: [],
  currentUserId: null,
  entities: [],
  entitiesAttributeCollection: [],
  currentUser: null,
  authProvider: new AuthProvider(),
  apps: [],
  systemForms: []
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.SET_ACCESS_TOKEN:
      return {
        ...state,
        tokenData: {
          ...action.token
        }
      };
    case actionTypes.SET_CURRENT_CONNECTION:
      return {
        ...state,
        currentConnection: {
          ...action.currentConnection
        }
      };
    case actionTypes.SET_CURRENT_MSAL_PUBLIC_CLIENT:
      return {
        ...state,
        currentMSALPublicClient: {
          ...action.currentMSALPublicClient
        }
      };


    case actionTypes.SET_CURRENT_MSAL_CONFIDENTIAL_CLIENT:
      return {
        ...state,
        currentMSALConfidentialClient: {
          ...action.currentMSALConfidentialClient
        }
      };

    case actionTypes.SET_ENTITIES:
      return {
        ...state,
        entities: [...action.entities]
      };

    case actionTypes.SET_ENTITIES_ATTRIBUTE_COLLECTION:
      return {
        ...state,
        entitiesAttributeCollection: [...action.entitiesAttributeCollection]
      };

    case actionTypes.SET_ENTITIES_VIEW_DATA:
      return {
        ...state,
        entitiesViewData: [...action.entitiesViewData]
      };

    case actionTypes.GET_CRM_USERS:
      return {
        ...state,
        crmUsers: [...action.crmUsers]
      };

    case actionTypes.GET_CURRENT_USER_ID:
      return {
        ...state,
        currentUserId: action.currentUserId
      };

    case actionTypes.SIGNOUT_USER:
      return {
        ...state,
        tokenData: {},
        currentUserId: {},
        currentUser: {},
        crmUsers: [],
        currentConnection: {},
        currentMSALPublicClient: null,
        currentMSALConfidentialClient: null,
        entities: [],
        entitiesAttributeCollection: [],
        authProvider: new AuthProvider()
      };

    case actionTypes.SET_APPS:
      return {
        ...state,
        apps: [...action.apps]
      };


    case actionTypes.SET_SYSTEM_FORMS:
      return {
        ...state,
        systemForms: [...action.systemForms]
      };

    case actionTypes.SET_CURRENT_USER:
      return {
        ...state,
        currentUser: {
          ...action.userInfo
        }
      };
    default:
      return state;
  }
};

export default reducer;
