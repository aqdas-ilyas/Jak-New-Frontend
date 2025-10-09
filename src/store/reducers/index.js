// reducers/index.js
import { combineReducers } from "@reduxjs/toolkit";
import FavoruiteOffersSlice from "./FavoruiteOffersSlice";
import WalletSlice from "./WalletSlice";
import userSlice from "./userDataSlice";
import OfferSlice from "./OfferSlice";

const rootReducer = combineReducers({
  user: userSlice,
  favorite: FavoruiteOffersSlice,
  loyalty: WalletSlice,
  offer: OfferSlice,
});

export default rootReducer;
