import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    forAllOffers: null,
    myOffer: null,
    myOfferPageNo: 1,
    totalMyOfferPagesCount: 1,
    CategoriesOffers: null,
    searchOfferArray: null,
    categoryMyOfferPageNo: 1,
    totalCategoryMyOfferPagesCount: 1
};
export const offerSlice = createSlice({
    name: 'offer',
    initialState,
    reducers: {
        saveForAllOffers: (state, action) => {
            state.forAllOffers = action.payload;
        },
        saveMyOffer: (state, action) => {
            state.myOffer = action.payload;
        },
        saveMyOfferPageNo: (state, action) => {
            state.myOfferPageNo = action.payload;
        },
        saveTotalMyOfferPagesCount: (state, action) => {
            state.totalMyOfferPagesCount = action.payload;
        },
        saveCategoryOffers: (state, action) => {
            state.CategoriesOffers = action.payload;
        },
        saveSearchOfferArray: (state, action) => {
            state.searchOfferArray = action.payload;
        },
        saveTotalCategoryMyOfferPagesCount: (state, action) => {
            state.totalCategoryMyOfferPagesCount = action.payload;
        },
        saveCategoryMyOfferPageNo: (state, action) => {
            state.categoryMyOfferPageNo = action.payload;
        },
    },
});
export const { saveForAllOffers, saveMyOffer, saveMyOfferPageNo, saveTotalMyOfferPagesCount, saveCategoryOffers, saveSearchOfferArray, saveTotalCategoryMyOfferPagesCount, saveCategoryMyOfferPageNo } = offerSlice.actions;
export default offerSlice.reducer;
