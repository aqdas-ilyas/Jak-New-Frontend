/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View, ActivityIndicator, StatusBar, Platform, Animated, Easing, Linking } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { fontFamily } from '../../../services'
import { hp, routes, wp, APP_STORE_LINK, PLAY_STORE_LINK } from '../../../services/constants'
import { appIcons, appImages } from '../../../services/utilities/assets'
import { colors } from '../../../services/utilities/colors'
import { logout, updateUser, migrateState } from '../../../store/reducers/userDataSlice'
import { saveMyOffer, saveMyOfferPageNo, saveTotalMyOfferPagesCount } from '../../../store/reducers/OfferSlice'
import ReactNativeBiometrics from 'react-native-biometrics'
import DeviceInfo from 'react-native-device-info'
import VersionCheck from 'react-native-version-check'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { notificationListeners, requestUserPermission } from '../../../services/pushNotification';
import { showMessage } from 'react-native-flash-message'
import { resolveMessage } from '../../../language/helpers'
import CallModal from '../../../components/modal'

const UPDATE_CHECK_TIMEOUT_MS = 10000;
const UPDATE_LOG_PREFIX = '[AppUpdate]';

const waitWithTimeout = (promise, timeoutMs = UPDATE_CHECK_TIMEOUT_MS) => {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Update check timed out')), timeoutMs);
    });

    return Promise.race([
        Promise.resolve(promise).finally(() => clearTimeout(timeoutId)),
        timeoutPromise,
    ]);
};

const normalizeVersion = (version) =>
    String(version || '')
        .split('.')
        .map(part => {
            const parsed = parseInt(part, 10);
            return Number.isNaN(parsed) ? 0 : parsed;
        });

const isVersionLower = (currentVersion, latestVersion) => {
    if (!currentVersion || !latestVersion) {
        return false;
    }

    const currentParts = normalizeVersion(currentVersion);
    const latestParts = normalizeVersion(latestVersion);
    const partsLength = Math.max(currentParts.length, latestParts.length);

    for (let index = 0; index < partsLength; index += 1) {
        const currentPart = currentParts[index] ?? 0;
        const latestPart = latestParts[index] ?? 0;

        if (currentPart < latestPart) {
            return true;
        }

        if (currentPart > latestPart) {
            return false;
        }
    }

    return false;
};

const logUpdate = (...args) => {
    console.log(UPDATE_LOG_PREFIX, ...args);
};

const getAppStoreId = () => {
    const match = APP_STORE_LINK.match(/id(\d+)/);
    return match?.[1] || '';
};

const getAppStoreCountry = () => {
    const match = APP_STORE_LINK.match(/apps\.apple\.com\/([a-z]{2})\//i);
    return (match?.[1] || 'sa').toLowerCase();
};

const getDirectAppStoreUrl = () => {
    return APP_STORE_LINK.replace(/^https:/, 'itms-apps:');
};

const getAndroidStoreUrl = () => {
    const packageName = VersionCheck.getPackageName?.();
    if (!packageName) {
        return PLAY_STORE_LINK;
    }

    return `market://details?id=${packageName}`;
};

const fetchAppStoreLookup = async ({ label, url }) => {
    logUpdate(`iOS lookup request (${label})`, url);

    const response = await waitWithTimeout(fetch(url));
    const json = await response.json();
    const result = json?.results?.[0];
    const latestVersion = result?.version?.trim() || '';

    logUpdate(`iOS lookup response (${label})`, {
        resultCount: json?.resultCount || 0,
        trackId: result?.trackId || null,
        trackName: result?.trackName || '',
        latestVersion,
    });

    if (!latestVersion) {
        return null;
    }

    return {
        latestVersion,
        trackId: result?.trackId || null,
        trackName: result?.trackName || '',
        source: label,
        url,
    };
};

// Android version gate uses react-native-version-check against Play Store.
const getAndroidUpdateInfo = async () => {
    const currentVersion = VersionCheck.getCurrentVersion?.() || '';
    const packageName = VersionCheck.getPackageName?.() || '';

    logUpdate('Android update check started', {
        currentVersion,
        packageName,
    });

    const result = await waitWithTimeout(
        VersionCheck.needUpdate({
            provider: 'playStore',
            ignoreErrors: false,
        })
    );

    if (!result) {
        logUpdate('Android update check returned no result, continuing without blocking');
        return null;
    }

    logUpdate('Android update check finished', {
        currentVersion: result.currentVersion || currentVersion,
        latestVersion: result.latestVersion || '',
        isNeeded: Boolean(result.isNeeded),
        storeUrl: getAndroidStoreUrl(),
    });

    return {
        isNeeded: Boolean(result.isNeeded),
        currentVersion: result.currentVersion || VersionCheck.getCurrentVersion?.() || '',
        latestVersion: result.latestVersion || '',
        storeUrl: getAndroidStoreUrl(),
        fallbackStoreUrl: result.storeUrl || PLAY_STORE_LINK,
    };
};

// iOS version gate uses react-native-device-info for installed version/build and App Store lookup for latest version.
const getIosUpdateInfo = async () => {
    const currentVersion = DeviceInfo.getVersion();
    const currentBuildNumber = DeviceInfo.getBuildNumber?.();
    const bundleId = DeviceInfo.getBundleId();
    const appStoreId = getAppStoreId();
    const appStoreCountry = getAppStoreCountry();

    logUpdate('iOS update check started', {
        currentVersion,
        currentBuildNumber,
        bundleId,
        appStoreId,
        appStoreCountry,
    });

    if (!appStoreId) {
        logUpdate('iOS update check skipped because App Store id could not be derived');
        return null;
    }

    const lookupAttempts = [
        {
            label: 'id-country',
            url: `https://itunes.apple.com/lookup?id=${appStoreId}&country=${appStoreCountry}`,
        },
    ];

    if (bundleId) {
        lookupAttempts.push({
            label: 'bundleId-country',
            url: `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}&country=${appStoreCountry}`,
        });
    }

    lookupAttempts.push({
        label: 'id-default-countryless',
        url: `https://itunes.apple.com/lookup?id=${appStoreId}`,
    });

    let lookupResult = null;
    for (const attempt of lookupAttempts) {
        try {
            lookupResult = await fetchAppStoreLookup(attempt);
            if (lookupResult?.latestVersion) {
                break;
            }
        } catch (error) {
            logUpdate(`iOS lookup failed (${attempt.label})`, error);
        }
    }

    if (!lookupResult?.latestVersion) {
        logUpdate('iOS latest version not found after all lookup attempts, allowing app to continue', {
            currentVersion,
            currentBuildNumber,
            bundleId,
            appStoreId,
            appStoreCountry,
        });
        return {
            isNeeded: false,
            currentVersion,
            latestVersion: '',
            storeUrl: getDirectAppStoreUrl(),
            fallbackStoreUrl: APP_STORE_LINK,
        };
    }

    const isNeeded = isVersionLower(currentVersion, lookupResult.latestVersion);

    logUpdate('iOS version comparison complete', {
        currentVersion,
        currentBuildNumber,
        latestVersion: lookupResult.latestVersion,
        isNeeded,
        lookupSource: lookupResult.source,
    });

    return {
        isNeeded,
        currentVersion,
        latestVersion: lookupResult.latestVersion,
        storeUrl: getDirectAppStoreUrl(),
        fallbackStoreUrl: APP_STORE_LINK,
    };
};

const checkForAppUpdate = async () => {
    logUpdate('Update gate invoked', {
        platform: Platform.OS,
    });

    if (Platform.OS === 'android') {
        return getAndroidUpdateInfo();
    }

    if (Platform.OS === 'ios') {
        return getIosUpdateInfo();
    }

    return null;
};

const openStoreUrl = async (primaryUrl, fallbackUrl) => {
    const urls = [primaryUrl, fallbackUrl].filter(Boolean);

    for (const url of urls) {
        try {
            logUpdate('Opening store url', url);
            await Linking.openURL(url);
            return true;
        } catch (error) {
            logUpdate('Failed to open store URL', url, error);
        }
    }

    return false;
};

export default function Splash(props) {
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets();

    const { LocalizedStrings, isRTL } = React.useContext(LocalizationContext);
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [apiCompleted, setApiCompleted] = useState(false);
    const [biometricChecked, setBiometricChecked] = useState(false);
    const [biometricInProgress, setBiometricInProgress] = useState(false);
    const [updateState, setUpdateState] = useState({
        visible: false,
        storeUrl: '',
        fallbackStoreUrl: '',
        currentVersion: '',
        latestVersion: '',
    });
    const bootStartedRef = useRef(false);
    const splashTimerRef = useRef(null);

    // Loading animation values
    const loadingOpacity = useRef(new Animated.Value(0)).current;
    const loadingTranslateY = useRef(new Animated.Value(-50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const dot1Opacity = useRef(new Animated.Value(0.3)).current;
    const dot2Opacity = useRef(new Animated.Value(0.3)).current;
    const dot3Opacity = useRef(new Animated.Value(0.3)).current;

    const islogin = useSelector(state => state?.user?.isRemember)
    const numberLogin = useSelector(state => state?.user?.numberLogin)
    const splash = useSelector(state => state?.user?.splash)
    const user = useSelector(state => state?.user?.user?.user)
    const biometricEnabled = useSelector(state => state?.user?.biometricEnabled || false)
    const isForceUpdateVisible = updateState.visible;
    const loadingText = isCheckingUpdate
        ? (LocalizedStrings.checking_for_updates || 'Checking for updates...')
        : (biometricInProgress || (!biometricChecked && biometricEnabled && islogin)
            ? (LocalizedStrings.biometric_app_open_prompt || 'Authenticate to open the app')
            : (LocalizedStrings.loading || 'Loading'));

    console.log("*********** Remember Me *************", islogin)
    console.log("*********** Checking User *************", user)

    // Check biometric authentication - MANDATORY for logged in users
    const checkBiometricAuth = async () => {
        // Prevent multiple simultaneous biometric checks
        if (biometricInProgress) {
            console.log('Biometric check already in progress, skipping...');
            return;
        }

        try {
            setBiometricInProgress(true);
            const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
            const { available } = await rnBiometrics.isSensorAvailable();

            if (available && biometricEnabled) {
                console.log('Starting MANDATORY biometric authentication...');

                // Keep prompting until success - NO CANCEL OPTION
                let biometricSuccess = false;
                while (!biometricSuccess) {
                    try {
                        const { success, error } = await rnBiometrics.simplePrompt({
                            promptMessage: LocalizedStrings.biometric_app_open_prompt || 'Authenticate to open the app',
                            cancelButtonText: LocalizedStrings.cancel || 'Cancel',
                        });

                        console.log('Biometric result - Success:', success, 'Error:', error);

                        if (success) {
                            console.log('Biometric authentication successful - allowing navigation');
                            biometricSuccess = true;
                            setBiometricChecked(true);
                        } else {
                            console.log('Biometric authentication failed - retrying...');
                            // Continue the loop to retry biometric authentication
                            // Don't break the loop - keep prompting until success
                        }
                    } catch (promptError) {
                        console.log('Biometric prompt error:', promptError);
                        // Continue the loop to retry biometric authentication
                    }
                }
            } else {
                console.log('Biometric not available or not enabled - allowing navigation');
                setBiometricChecked(true);
            }
        } catch (error) {
            console.log('Biometric check error:', error);

            if (islogin) {
                // If biometric check fails for logged in user, logout
                console.log('Biometric check error for logged in user - logging out');
                showMessage({
                    message: LocalizedStrings.biometric_login_error || 'Biometric authentication failed',
                    type: 'danger',
                });
                dispatch(logout());
                setBiometricChecked(false);
                props.navigation.replace(routes.login);
            } else {
                // If biometric check fails for non-logged in user, allow navigation
                console.log('Biometric check error for non-logged in user - allowing navigation');
                setBiometricChecked(true);
            }
        } finally {
            setBiometricInProgress(false);
        }
    };

    const getUserProfile = () => {
        const onSuccess = response => {
            console.log('res while getUserProfile====>', response);
            dispatch(updateUser(response))
            setApiCompleted(true);
        };

        const onError = error => {
            console.log('error while getUserProfile====>', error);
            if (
                error?.status === 401 ||
                error?.errorType === 'session-expired' ||
                error?.errorType === 'session-expired-device'
            ) {
                return;
            }

            showMessage({
                message: resolveMessage(LocalizedStrings, error?.message, LocalizedStrings.session_verification_failed),
                type: 'danger',
            });
            setApiCompleted(true);
        };

        const method = Method.GET;
        const endPoint = routs.getUser
        const bodyParams = {}

        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    const handleUpdatePress = async () => {
        logUpdate('Update button pressed', {
            currentVersion: updateState.currentVersion,
            latestVersion: updateState.latestVersion,
        });
        await openStoreUrl(updateState.storeUrl, updateState.fallbackStoreUrl);
    };

    const navigateBasedOnUserState = (currentUser) => {
        console.log("*********** Navigating based on user state *************", currentUser);

        if (islogin) {
            if (currentUser) {
                if (!currentUser.isBlocked) {
                    if (!currentUser.isComplete) {
                        // User profile not complete
                        if (numberLogin) {
                            props?.navigation?.replace(routes.createProfile, { number: 'number' });
                        } else {
                            props?.navigation?.replace(routes.createProfile, { email: 'email' });
                        }
                    }
                    // else if (!currentUser.isPreferencesSet) {
                    //     // User preferences not set
                    //     if (!currentUser.isPreferencesSkipped) {
                    //         props?.navigation?.replace(routes.preferences);
                    //     } else if (!currentUser.isAdminApproved) {
                    //         props?.navigation?.replace(routes.preferences);
                    //     } else if (currentUser.subscriptionPlan == "not-subscribed") {
                    //         props?.navigation?.replace(routes.subscription);
                    //     } else {
                    //         props.navigation.replace(routes.tab, { screen: routes.home })
                    //     }
                    // } 
                    // else if (!currentUser.isAdminApproved) {
                    //     // User not approved by admin
                    //     props?.navigation?.replace(routes.preferences);
                    // } 
                    // else if (currentUser.subscriptionPlan == "not-subscribed") {
                    //     // User not subscribed
                    //     props?.navigation?.replace(routes.subscription);
                    // } else {
                    //     // User is complete and approved - go to home
                    //     props.navigation.replace(routes.tab, { screen: routes.home })
                    // }
                    else {
                        // User is complete and approved - go to home
                        props.navigation.replace(routes.tab, { screen: routes.home })
                    }
                } else {
                    // User is blocked
                    props?.navigation?.replace(routes.login);
                }
            } else {
                // No user data - go to login
                props?.navigation?.replace(routes.login);
            }
        } else {
            // Not logged in
            if (splash) {
                props.navigation.replace(routes.welcome)
            } else {
                props.navigation.replace(routes.onboard)
            }
        }
    }

    // Loading animations
    useEffect(() => {
        if (isCheckingUpdate || isLoading || !apiCompleted || !biometricChecked || biometricInProgress) {
            // Slide down and fade in animation
            Animated.parallel([
                Animated.timing(loadingTranslateY, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(loadingOpacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();

            // Pulse animation for loader
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();

            // Dots animation (wave effect)
            const dotsAnimation = Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(dot1Opacity, {
                            toValue: 1,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot2Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot3Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(dot1Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot2Opacity, {
                            toValue: 1,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot3Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(dot1Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot2Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot3Opacity, {
                            toValue: 1,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(dot1Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot2Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot3Opacity, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            );
            dotsAnimation.start();

            return () => {
                pulseAnimation.stop();
                dotsAnimation.stop();
            };
        } else {
            // Fade out animation when loading completes
            Animated.parallel([
                Animated.timing(loadingOpacity, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(loadingTranslateY, {
                    toValue: -50,
                    duration: 300,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isCheckingUpdate, isLoading, apiCompleted, biometricChecked, biometricInProgress]);

    useEffect(() => {
        let isActive = true;

        const runUpdateCheck = async () => {
            try {
                const updateInfo = await checkForAppUpdate();
                if (!isActive) {
                    return;
                }

                if (updateInfo?.isNeeded) {
                    logUpdate('Update required, showing modal', {
                        currentVersion: updateInfo.currentVersion,
                        latestVersion: updateInfo.latestVersion,
                    });
                    setUpdateState({
                        visible: true,
                        storeUrl: updateInfo.storeUrl,
                        fallbackStoreUrl: updateInfo.fallbackStoreUrl,
                        currentVersion: updateInfo.currentVersion || '',
                        latestVersion: updateInfo.latestVersion || '',
                    });
                    return;
                }

                logUpdate('No update required, continuing to app');
                setIsCheckingUpdate(false);
            } catch (error) {
                logUpdate('Update check failed, allowing app to continue', error);
                if (isActive) {
                    setIsCheckingUpdate(false);
                }
            }
        };

        runUpdateCheck();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (isCheckingUpdate || isForceUpdateVisible || bootStartedRef.current) {
            return;
        }

        bootStartedRef.current = true;

        // Migrate state to ensure new properties exist
        dispatch(migrateState());

        dispatch(saveMyOffer(null));
        dispatch(saveTotalMyOfferPagesCount(1));
        dispatch(saveMyOfferPageNo(1));

        // Keep notification setup behind the update gate.
        requestUserPermission();
        notificationListeners();

        // If user is logged in, get fresh profile data
        if (islogin && user) {
            console.log("*********** Getting fresh user profile *************");
            getUserProfile();
        } else {
            setApiCompleted(true);
        }

        // Minimum splash time
        splashTimerRef.current = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }, [isCheckingUpdate, isForceUpdateVisible, islogin, user]);

    useEffect(() => {
        return () => {
            if (splashTimerRef.current) {
                clearTimeout(splashTimerRef.current);
                splashTimerRef.current = null;
            }
        };
    }, []);

    // Handle navigation after API completion and minimum splash time
    useEffect(() => {
        if (isCheckingUpdate || isForceUpdateVisible) {
            return;
        }

        if (!isLoading && apiCompleted && biometricChecked) {
            console.log("*********** Starting navigation *************");
            console.log("Navigation conditions - isLoading:", isLoading, "apiCompleted:", apiCompleted, "biometricChecked:", biometricChecked);

            // Small delay to ensure smooth transition and Redux state update
            setTimeout(() => {
                // Get fresh user data from Redux after API call
                const currentUser = user;
                console.log("*********** Current user for navigation *************", currentUser);
                navigateBasedOnUserState(currentUser);
            }, 500);
        } else {
            console.log("Navigation blocked - isLoading:", isLoading, "apiCompleted:", apiCompleted, "biometricChecked:", biometricChecked);
        }
    }, [isCheckingUpdate, isForceUpdateVisible, isLoading, apiCompleted, biometricChecked, user]);

    // Check biometric authentication - mandatory for logged in users, optional for logged out users
    useEffect(() => {
        if (isCheckingUpdate || isForceUpdateVisible) {
            return;
        }

        // Only run biometric check once when conditions are met and not already in progress
        if (islogin && biometricEnabled && apiCompleted && !biometricChecked && !biometricInProgress) {
            // User is logged in and biometric is enabled - MANDATORY biometric check
            console.log('Logged in user - MANDATORY biometric check');
            checkBiometricAuth();
        } else if (!islogin && biometricEnabled && !biometricChecked && !biometricInProgress) {
            // User is not logged in but biometric is enabled - OPTIONAL biometric check
            console.log('Not logged in user - OPTIONAL biometric check');
            checkBiometricAuth();
        } else if (!biometricEnabled) {
            // If biometric is disabled, skip biometric check
            console.log('Skipping biometric check - biometricEnabled:', biometricEnabled, 'islogin:', islogin);
            setBiometricChecked(true);
        }
    }, [isCheckingUpdate, isForceUpdateVisible, islogin, biometricEnabled, apiCompleted, biometricChecked, biometricInProgress]);

    useEffect(() => {
        requestUserPermission()
        notificationListeners()
    }, [])

    return (
        <>
            <StatusBar
                barStyle={'light-content'}
                backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
                translucent={Platform.OS === 'android'}
            />
            <ImageBackground source={appImages.splashBackground} style={styles.backgroundImage}>
                {/* Top Loading Section with Animations */}
                <Animated.View
                    style={[
                        styles.topLoadingContainer,
                        {
                            opacity: loadingOpacity,
                            transform: [{ translateY: loadingTranslateY }],
                        },
                    ]}
                    pointerEvents={(isCheckingUpdate || isLoading || !apiCompleted || !biometricChecked || biometricInProgress) ? 'auto' : 'none'}
                >
                    <View style={[styles.loadingContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <ActivityIndicator size="small" color={colors.primaryColor} />
                        </Animated.View>
                        <Text style={styles.loadingText}>{loadingText}</Text>
                        {/* Animated dots */}
                        <View style={styles.dotsContainer}>
                            <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
                            <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
                            <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
                        </View>
                    </View>
                </Animated.View>

                <Image source={appIcons.appLogo} style={styles.imageLogo} />

                <View style={[styles.bottomContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start', paddingBottom: insets.bottom > 0 ? insets.bottom : wp(5) }]}>
                    <Text style={[styles.welcomeText, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings['Welcome to']}</Text>
                    <Text style={[styles.logoText, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings['Jak App']}</Text>
                    <Text style={[styles.promotionText, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings['Your one stop app for your promotions.']}</Text>
                </View>

                <CallModal
                    modalShow={isForceUpdateVisible}
                    setModalShow={() => {}}
                    warningImage={appImages.warning}
                    title={LocalizedStrings.force_update_title || 'Update Required'}
                    subTitle={LocalizedStrings.force_update_message || 'A newer version of Jak is available. Please update the app to continue.'}
                    showButtons={true}
                    showCancelButton={false}
                    preventClose={true}
                    confirmText={LocalizedStrings.force_update_button || 'Update App'}
                    onConfirm={handleUpdatePress}
                />
            </ImageBackground>
        </>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    imageLogo: {
        width: wp(60),
        height: hp(20)
    },
    topLoadingContainer: {
        position: "absolute",
        top: Platform.OS === 'android' ? hp(6) : hp(4),
        left: wp(4),
        right: wp(4),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: wp(4),
        paddingVertical: wp(3.5),
        backgroundColor: 'rgba(98, 89, 132, 0.85)',
        borderRadius: wp(8),
        shadowColor: colors.fullBlack,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loadingContent: {
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.fullWhite,
        marginLeft: wp(3),
        marginRight: wp(2),
        textAlign: "center"
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(2),
    },
    dot: {
        width: wp(1.5),
        height: wp(1.5),
        borderRadius: wp(0.75),
        backgroundColor: colors.fullWhite,
        marginHorizontal: wp(1),
    },
    bottomContainer: {
        padding: wp(5),
        position: "absolute",
        bottom: wp(5),
        right: 0,
        left: 0,
    },
    welcomeText: {
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.fullWhite,
        textAlign: "left"
    },
    logoText: {
        fontSize: hp(4),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.primaryColor,
        paddingVertical: hp(2),
        textAlign: "left"
    },
    promotionText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.fullWhite,
        textAlign: "left"
    }
})
