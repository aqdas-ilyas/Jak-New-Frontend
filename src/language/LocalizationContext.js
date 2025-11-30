import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import LocalizedStrings from './LocalizedString';

const APP_LANGUAGE = 'appLanguage';
const DEFAULT_LANGUAGE = "ar"

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
    // Initialize with null, will be set after reading from AsyncStorage
    const [appLanguage, setAppLanguage] = useState(null);
    const [isRTL, setIsRTL] = useState(false);
    const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);

    const setLanguage = (language, skipStorage = false) => {
        LocalizedStrings.setLanguage(language);
        setAppLanguage(language);
        setIsRTL(language === 'ar');
        if (!skipStorage) {
            AsyncStorage.setItem(APP_LANGUAGE, language);
        }
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
        try {
            const currentLanguage = await AsyncStorage.getItem(APP_LANGUAGE);

            if (!currentLanguage) {
                // Set Arabic as default language if no language is stored
                setLanguage(DEFAULT_LANGUAGE, true);
            } else {
                // Use stored language preference - set without saving to storage again
                setLanguage(currentLanguage, true);
            }
            setIsLanguageInitialized(true);
        } catch (error) {
            console.log('Error initializing language:', error);
            // Fallback to Arabic if there's an error
            setLanguage(DEFAULT_LANGUAGE, true);
            setIsLanguageInitialized(true);
        }
    };

    useEffect(() => {
        initializeAppLanguage()
    }, [])

    // Don't render children until language is initialized to prevent flash
    if (!isLanguageInitialized || appLanguage === null) {
        return null;
    }

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