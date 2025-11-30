import LocalizationString from "react-native-localization";
import ar from "./ar";
import en from "./en";

let string = new LocalizationString({
    ar: ar,
    en: en
})

// Set Arabic as default language
string.setLanguage("ar");

export default string