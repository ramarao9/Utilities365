import * as actionTypes from './actions';

const initialState =
{
    tokenData: {},
    crmUsers: []
};


const reducer = (state = initialState, action) => {

    switch (action.type) {
        case actionTypes.GET_ACCESS_TOKEN: return {
            ...state,
            tokenData: {
                ...action.token
            }
        };

        case actionTypes.REFRESH_ACCESS_TOKEN: return {

        };


        case actionTypes.GET_CRM_USERS: return {
            ...state,
            crmUsers: [...action.crmUsers]
        };

        default:
            return state;
    }

};


export default reducer;