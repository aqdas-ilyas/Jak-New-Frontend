import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    favorite: null,
};
export const favoriteSlice = createSlice({
    name: 'favorite',
    initialState,
    reducers: {
        saveFavourite: (state, action) => {
            state.favorite = action.payload;
        },
    },
});
export const { saveFavourite } = favoriteSlice.actions;
export default favoriteSlice.reducer;
