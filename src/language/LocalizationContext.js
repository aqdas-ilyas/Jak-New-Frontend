import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import LocalizedStrings from './LocalizedString';

const APP_LANGUAGE = 'appLanguage';
const DEFAULT_LANGUAGE = "en"

export const LocalizationContext = createContext({
    LocalizedStrings,
    setAppLanguage: () => { },
    appLanguage: DEFAULT_LANGUAGE,
    initializeAppLanguage: () => { },
});

export const LocalizationProvider = ({ children }) => {
    const [appLanguage, setAppLanguage] = useState(DEFAULT_LANGUAGE);

    const setLanguage = language => {
        LocalizedStrings.setLanguage(language);
        setAppLanguage(language);
        AsyncStorage.setItem(APP_LANGUAGE, language);
    };

    const initializeAppLanguage = async () => {
        const currentLanguage = await AsyncStorage.getItem(APP_LANGUAGE);

        if (!currentLanguage) {
            let localeCode = DEFAULT_LANGUAGE;
            // const supportedLocaleCodes = LocalizedStrings.getAvailableLanguages();
            // const phoneLocaleCodes = RNLocalize.getLocales().map(
            //     locale => locale.languageCode,
            // );
            // phoneLocaleCodes.some(code => {
            //     if (supportedLocaleCodes.includes(code)) {
            //         localeCode = code;
            //         return true;
            //     }
            // });
            setLanguage(localeCode);
        } else {
            setLanguage(currentLanguage);
        }
    };

    useEffect(() => {
        initializeAppLanguage()
    }, [])

    return (
        <LocalizationContext.Provider
            value={{
                LocalizedStrings,
                setAppLanguage: setLanguage,
                appLanguage,
                initializeAppLanguage,
            }}>
            {children}
        </LocalizationContext.Provider>
    );
};