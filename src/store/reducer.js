import * as actionTypes from './actions';

const initialState =
{
    tokenData: {}
};


const reducer = (state = initialState, action) => {

    switch (action.type) {
        case actionTypes.GET_ACCESS_TOKEN: return {
            ...state,
            tokenData:{
                ...action.token
            }
        };

        case actionTypes.REFRESH_ACCESS_TOKEN: return {

        };

        default:
            return state;
    }

};


export default reducer;