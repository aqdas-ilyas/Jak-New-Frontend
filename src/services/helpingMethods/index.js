import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import ImageCropPicker from 'react-native-image-crop-picker';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default class NetworkUtils {
  static async isNetworkAvailable() {
    const response = await NetInfo.fetch();
    return response.isConnected;
  }
}

export const googleLoginData = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    if (userInfo !== "") {
      return { "Data": { userInfo } }
    }
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { "Error": { error } }
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { "Error": { error } }
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { "Error": { error } }
    } else {
      return { "Error": { error } }
    }
  }
}

export const storeDataToStorage = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const removeDataFromStorage = async key => {
  await AsyncStorage.removeItem(key);
};

export const getDataFromStorage = async value => {
  let data = await AsyncStorage.getItem(value);
  // let newData = JSON.parse(data);
  return data;
};

export const openImagePicker = async (
  height = 300,
  width = 300,
  cropping = false,
  multiple = false,
) => {
  let result = await ImageCropPicker.openPicker({
    width: width,
    height: height,
    cropping: cropping,
    multiple: multiple,
  })
    .then(image => {
      return image;
    })
    .catch(error => {
      console.log(error);
      return error.code;
    });
  return result;
};

export const openCameraPicker = (result) => {
  ImageCropPicker.openCamera({
    width: 130,
    height: 130,
    compressImageQuality: 0.5,
    writeTempFile: true,
    cropperCircleOverlay: true,
  }).then((image) => {
    let splittedName = image.path.split("/");
    const uriParts = image.path.split(".");
    var profileUri = {
      uri: image.path,
      name: `image${Math.floor(new Date().getTime())}.${splittedName[splittedName.length - 1]}`,
      type: uriParts[uriParts.length - 1],
    };
  })
    .catch((err) => {
      console.log("err => ", err)
      result('', false)

    })
}

const countryCodes = [
  { "id": "247", "country": "AC" },
  { "id": "376", "country": "AD" },
  { "id": "971", "country": "AE" },
  { "id": "93", "country": "AF" },
  { "id": "1268", "country": "AG" },
  { "id": "1264", "country": "AI" },
  { "id": "355", "country": "AL" },
  { "id": "374", "country": "AM" },
  { "id": "244", "country": "AO" },
  { "id": "54", "country": "AR" },
  { "id": "1684", "country": "AS" },
  { "id": "43", "country": "AT" },
  { "id": "61", "country": "AU" },
  { "id": "297", "country": "AW" },
  { "id": "358-18", "country": "AX" },
  { "id": "994", "country": "AZ" },
  { "id": "387", "country": "BA" },
  { "id": "1246", "country": "BB" },
  { "id": "880", "country": "BD" },
  { "id": "32", "country": "BE" },
  { "id": "226", "country": "BF" },
  { "id": "359", "country": "BG" },
  { "id": "973", "country": "BH" },
  { "id": "257", "country": "BI" },
  { "id": "229", "country": "BJ" },
  { "id": "590", "country": "BL" },
  { "id": "1441", "country": "BM" },
  { "id": "673", "country": "BN" },
  { "id": "591", "country": "BO" },
  { "id": "599", "country": "BQ" },
  { "id": "55", "country": "BR" },
  { "id": "1242", "country": "BS" },
  { "id": "975", "country": "BT" },
  { "id": "267", "country": "BW" },
  { "id": "375", "country": "BY" },
  { "id": "501", "country": "BZ" },
  { "id": "1", "country": "CA" },
  { "id": "61", "country": "CC" },
  { "id": "243", "country": "CD" },
  { "id": "236", "country": "CF" },
  { "id": "242", "country": "CG" },
  { "id": "41", "country": "CH" },
  { "id": "225", "country": "CI" },
  { "id": "682", "country": "CK" },
  { "id": "56", "country": "CL" },
  { "id": "237", "country": "CM" },
  { "id": "86", "country": "CN" },
  { "id": "57", "country": "CO" },
  { "id": "506", "country": "CR" },
  { "id": "53", "country": "CU" },
  { "id": "238", "country": "CV" },
  { "id": "599", "country": "CW" },
  { "id": "61", "country": "CX" },
  { "id": "357", "country": "CY" },
  { "id": "420", "country": "CZ" },
  { "id": "49", "country": "DE" },
  { "id": "253", "country": "DJ" },
  { "id": "45", "country": "DK" },
  { "id": "1767", "country": "DM" },
  { "id": "1809 and 1-829", "country": "DO" },
  { "id": "213", "country": "DZ" },
  { "id": "593", "country": "EC" },
  { "id": "372", "country": "EE" },
  { "id": "20", "country": "EG" },
  { "id": "212", "country": "EH" },
  { "id": "291", "country": "ER" },
  { "id": "34", "country": "ES" },
  { "id": "251", "country": "ET" },
  { "id": "358", "country": "FI" },
  { "id": "679", "country": "FJ" },
  { "id": "500", "country": "FK" },
  { "id": "691", "country": "FM" },
  { "id": "298", "country": "FO" },
  { "id": "33", "country": "FR" },
  { "id": "241", "country": "GA" },
  { "id": "44", "country": "GB" },
  { "id": "1473", "country": "GD" },
  { "id": "995", "country": "GE" },
  { "id": "594", "country": "GF" },
  { "id": "44", "country": "GG" },
  { "id": "233", "country": "GH" },
  { "id": "350", "country": "GI" },
  { "id": "299", "country": "GL" },
  { "id": "220", "country": "GM" },
  { "id": "224", "country": "GN" },
  { "id": "590", "country": "GP" },
  { "id": "240", "country": "GQ" },
  { "id": "30", "country": "GR" },
  { "id": "502", "country": "GT" },
  { "id": "1671", "country": "GU" },
  { "id": "245", "country": "GW" },
  { "id": "592", "country": "GY" },
  { "id": "852", "country": "HK" },
  { "id": "504", "country": "HN" },
  { "id": "385", "country": "HR" },
  { "id": "509", "country": "HT" },
  { "id": "36", "country": "HU" },
  { "id": "62", "country": "ID" },
  { "id": "353", "country": "IE" },
  { "id": "972", "country": "IL" },
  { "id": "441624", "country": "IM" },
  { "id": "91", "country": "IN" },
  { "id": "246", "country": "IO" },
  { "id": "964", "country": "IQ" },
  { "id": "98", "country": "IR" },
  { "id": "354", "country": "IS" },
  { "id": "39", "country": "IT" },
  { "id": "441534", "country": "JE" },
  { "id": "1876", "country": "JM" },
  { "id": "962", "country": "JO" },
  { "id": "81", "country": "JP" },
  { "id": "254", "country": "KE" },
  { "id": "996", "country": "KG" },
  { "id": "855", "country": "KH" },
  { "id": "686", "country": "KI" },
  { "id": "269", "country": "KM" },
  { "id": "1869", "country": "KN" },
  { "id": "850", "country": "KP" },
  { "id": "82", "country": "KR" },
  { "id": "965", "country": "KW" },
  { "id": "1345", "country": "KY" },
  { "id": "7", "country": "KZ" },
  { "id": "856", "country": "LA" },
  { "id": "961", "country": "LB" },
  { "id": "1758", "country": "LC" },
  { "id": "423", "country": "LI" },
  { "id": "94", "country": "LK" },
  { "id": "231", "country": "LR" },
  { "id": "266", "country": "LS" },
  { "id": "370", "country": "LT" },
  { "id": "352", "country": "LU" },
  { "id": "371", "country": "LV" },
  { "id": "218", "country": "LY" },
  { "id": "212", "country": "MA" },
  { "id": "377", "country": "MC" },
  { "id": "373", "country": "MD" },
  { "id": "382", "country": "ME" },
  { "id": "590", "country": "MF" },
  { "id": "261", "country": "MG" },
  { "id": "692", "country": "MH" },
  { "id": "389", "country": "MK" },
  { "id": "223", "country": "ML" },
  { "id": "95", "country": "MM" },
  { "id": "976", "country": "MN" },
  { "id": "853", "country": "MO" },
  { "id": "1670", "country": "MP" },
  { "id": "596", "country": "MQ" },
  { "id": "222", "country": "MR" },
  { "id": "1664", "country": "MS" },
  { "id": "356", "country": "MT" },
  { "id": "230", "country": "MU" },
  { "id": "960", "country": "MV" },
  { "id": "265", "country": "MW" },
  { "id": "52", "country": "MX" },
  { "id": "60", "country": "MY" },
  { "id": "258", "country": "MZ" },
  { "id": "264", "country": "NA" },
  { "id": "687", "country": "NC" },
  { "id": "227", "country": "NE" },
  { "id": "672", "country": "NF" },
  { "id": "234", "country": "NG" },
  { "id": "505", "country": "NI" },
  { "id": "31", "country": "NL" },
  { "id": "47", "country": "NO" },
  { "id": "977", "country": "NP" },
  { "id": "674", "country": "NR" },
  { "id": "683", "country": "NU" },
  { "id": "64", "country": "NZ" },
  { "id": "968", "country": "OM" },
  { "id": "507", "country": "PA" },
  { "id": "51", "country": "PE" },
  { "id": "689", "country": "PF" },
  { "id": "675", "country": "PG" },
  { "id": "63", "country": "PH" },
  { "id": "92", "country": "PK" },
  { "id": "48", "country": "PL" },
  { "id": "508", "country": "PM" },
  { "id": "1", "country": "PR" },
  { "id": "970", "country": "PS" },
  { "id": "351", "country": "PT" },
  { "id": "680", "country": "PW" },
  { "id": "595", "country": "PY" },
  { "id": "974", "country": "QA" },
  { "id": "262", "country": "RE" },
  { "id": "40", "country": "RO" },
  { "id": "381", "country": "RS" },
  { "id": "7", "country": "RU" },
  { "id": "250", "country": "RW" },
  { "id": "966", "country": "SA" },
  { "id": "677", "country": "SB" },
  { "id": "248", "country": "SC" },
  { "id": "249", "country": "SD" },
  { "id": "46", "country": "SE" },
  { "id": "65", "country": "SG" },
  { "id": "290", "country": "SH" },
  { "id": "386", "country": "SI" },
  { "id": "47", "country": "SJ" },
  { "id": "421", "country": "SK" },
  { "id": "232", "country": "SL" },
  { "id": "378", "country": "SM" },
  { "id": "221", "country": "SN" },
  { "id": "252", "country": "SO" },
  { "id": "597", "country": "SR" },
  { "id": "211", "country": "SS" },
  { "id": "239", "country": "ST" },
  { "id": "503", "country": "SV" },
  { "id": "1721", "country": "SX" },
  { "id": "963", "country": "SY" },
  { "id": "268", "country": "SZ" },
  { "id": "290", "country": "TA" },
  { "id": "1-649", "country": "TC" },
  { "id": "235", "country": "TD" },
  { "id": "228", "country": "TG" },
  { "id": "66", "country": "TH" },
  { "id": "992", "country": "TJ" },
  { "id": "690", "country": "TK" },
  { "id": "670", "country": "TL" },
  { "id": "993", "country": "TM" },
  { "id": "216", "country": "TN" },
  { "id": "676", "country": "TO" },
  { "id": "90", "country": "TR" },
  { "id": "1868", "country": "TT" },
  { "id": "688", "country": "TV" },
  { "id": "886", "country": "TW" },
  { "id": "255", "country": "TZ" },
  { "id": "380", "country": "UA" },
  { "id": "256", "country": "UG" },
  { "id": "1", "country": "US" },
  { "id": "598", "country": "UY" },
  { "id": "998", "country": "UZ" },
  { "id": "379", "country": "VA" },
  { "id": "1784", "country": "VC" },
  { "id": "58", "country": "VE" },
  { "id": "1284", "country": "VG" },
  { "id": "1340", "country": "VI" },
  { "id": "84", "country": "VN" },
  { "id": "678", "country": "VU" },
  { "id": "681", "country": "WF" },
  { "id": "685", "country": "WS" },
  { "id": "383", "country": "XK" },
  { "id": "967", "country": "YE" },
  { "id": "262", "country": "YT" },
  { "id": "27", "country": "ZA" },
  { "id": "260", "country": "ZM" },
  { "id": "263", "country": "ZW" }
]

export const _fetchCountryAbbrevicationCode = async (code) => {
  const resData = countryCodes.filter((item) => item.id === code);
  return resData.length > 0 ? resData[0].country : null;
};