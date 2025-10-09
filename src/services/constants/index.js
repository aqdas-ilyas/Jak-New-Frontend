import {Dimensions, PixelRatio} from 'react-native';
const {width, height} = Dimensions.get('window');
const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

export const GOOGLE_API_KEY = 'AIzaSyCv3ww-4pSHJ0K9JXyQ6G64cf0uKfERgD8';

export const emailFormat =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// export const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{7,24}$/; // just one upper case alphabet/one lower case alpjhabet/number/special chars
// export const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,24}$/;
export const passwordFormat = /^.{3,}$/;

export const storageKey = {};

export const routes = {
  auth: 'auth',
  splash: 'splash',
  onboard: 'onboard',
  welcome: 'welcome',
  login: 'Login',
  register: 'register',
  forgotPassword: 'forgotPassword',
  resetPassword: 'resetPassword',
  otp: 'otp',
  createProfile: 'createProfile',
  preferences: 'preferences',
  subscription: 'subscription',
  payment: 'payment',
  card: 'card',

  tab: 'tab',
  home: 'home',
  storeList: 'storeList',
  storeDetail: 'storeDetail',
  notification: 'notification',
  favourite: 'favourite',
  offer: 'offer',
  search: 'search',
  settings: 'settings',
  subscriptionPlan: 'subscriptionPlan',
  cancelSubscription: 'cancelSubscription',
  changeLanguage: 'changeLanguage',
  changePassword: 'changePassword',
  aboutUs: 'aboutUs',
  contactUs: 'contactUs',
  terms: 'terms',
  privacyPolicy: 'privacyPolicy',
  deletAccount: 'deletAccount',
  editProfile: 'editProfile',
  wallet: 'wallet',
  loyaltyCard: 'loyaltyCard',
  loyaltyCardList: 'loyaltyCardList',
  airArabia: 'airArabia',
};

export const wp = p => width * (p / 100);
export const hp = p => height * (p / 100);

export {WINDOW_HEIGHT, WINDOW_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH};

const widthBaseScale = SCREEN_WIDTH / 430;
const heightBaseScale = SCREEN_HEIGHT / 932;

function normalize(size, based = 'width') {
  const newSize =
    based === 'height' ? size * heightBaseScale : size * widthBaseScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
const widthPixel = size => {
  return normalize(size, 'width');
};
const heightPixel = size => {
  return normalize(size, 'height');
};
const fontPixel = size => {
  return heightPixel(size);
};

export {widthPixel, heightPixel, fontPixel};
