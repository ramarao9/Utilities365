import * as actionTypes from './actions';

const initialState =
{
    tokenData: {},
    crmUsers: [],
    currentUserId: null,
    entities:[],
    currentUser:null
};


const reducer = (state = initialState, action) => {

    switch (action.type) {
        case actionTypes.SET_ACCESS_TOKEN: return {
            ...state,
            tokenData: {
                ...action.token
            }
        };

        case actionTypes.REFRESH_ACCESS_TOKEN: return {

        };

        case actionTypes.SET_ENTITIES: return {
            ...state,
            entities: [...action.entities]
            
        };


        case actionTypes.GET_CRM_USERS: return {
            ...state,
            crmUsers: [...action.crmUsers]
        };


        case actionTypes.GET_CURRENT_USER_ID: return {
            ...state,
            currentUserId: action.currentUserId
        };

        case actionTypes.SIGNOUT_USER:return{
            ...state,
            currentUserId:null,
            currentUser:null,
            tokenData:{},
            crmUsers:[],
            entities:[]
        }

          case actionTypes.SET_CURRENT_USER: return {
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