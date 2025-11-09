import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import LocalizedStrings from './LocalizedString';

const APP_LANGUAGE = 'appLanguage';
const DEFAULT_LANGUAGE = "en"

export const LocalizationContext = createContext({
    LocalizedStrings,
    setAppLanguage: () => { },
    appLanguage: DEFAULT_LANGUAGE,
    isRTL: DEFAULT_LANGUAGE === 'ar',
    layoutDirection: {
        flexDirection: DEFAULT_LANGUAGE === 'ar' ? 'row-reverse' : 'row',
        reverseFlexDirection: DEFAULT_LANGUAGE === 'ar' ? 'row' : 'row-reverse',
        textAlign: DEFAULT_LANGUAGE === 'ar' ? 'right' : 'left',
        oppositeTextAlign: DEFAULT_LANGUAGE === 'ar' ? 'left' : 'right',
        alignStart: DEFAULT_LANGUAGE === 'ar' ? 'flex-end' : 'flex-start',
        alignEnd: DEFAULT_LANGUAGE === 'ar' ? 'flex-start' : 'flex-end',
        writingDirection: DEFAULT_LANGUAGE === 'ar' ? 'rtl' : 'ltr',
    },
    initializeAppLanguage: () => { },
});

export const LocalizationProvider = ({ children }) => {
    const [appLanguage, setAppLanguage] = useState(DEFAULT_LANGUAGE);
    const [isRTL, setIsRTL] = useState(DEFAULT_LANGUAGE === 'ar');

    const setLanguage = language => {
        LocalizedStrings.setLanguage(language);
        setAppLanguage(language);
        setIsRTL(language === 'ar');
        AsyncStorage.setItem(APP_LANGUAGE, language);
    };

    const layoutDirection = useMemo(() => ({
        flexDirection: isRTL ? 'row-reverse' : 'row',
        reverseFlexDirection: isRTL ? 'row' : 'row-reverse',
        textAlign: isRTL ? 'right' : 'left',
        oppositeTextAlign: isRTL ? 'left' : 'right',
        alignStart: isRTL ? 'flex-end' : 'flex-start',
        alignEnd: isRTL ? 'flex-start' : 'flex-end',
        writingDirection: isRTL ? 'rtl' : 'ltr',
    }), [isRTL]);

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
                isRTL,
                layoutDirection,
                initializeAppLanguage,
            }}>
            {children}
        </LocalizationContext.Provider>
    );
};