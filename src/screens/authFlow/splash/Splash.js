import React, { useEffect, useState, useRef } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View, ActivityIndicator, StatusBar, Platform, Animated, Easing } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { fontFamily } from '../../../services'
import { hp, routes, wp } from '../../../services/constants'
import { appIcons, appImages } from '../../../services/utilities/assets'
import { colors } from '../../../services/utilities/colors'
import { logout, updateUser, migrateState } from '../../../store/reducers/userDataSlice'
import { saveMyOffer, saveMyOfferPageNo, saveTotalMyOfferPagesCount } from '../../../store/reducers/OfferSlice'
import ReactNativeBiometrics from 'react-native-biometrics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Splash(props) {
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets();

    const { LocalizedStrings, isRTL } = React.useContext(LocalizationContext);
    const [isLoading, setIsLoading] = useState(true);
    const [apiCompleted, setApiCompleted] = useState(false);
    const [biometricChecked, setBiometricChecked] = useState(false);
    const [biometricInProgress, setBiometricInProgress] = useState(false);

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
            dispatch(logout())
            setApiCompleted(true);
        };

        const method = Method.GET;
        const endPoint = routs.getUser
        const bodyParams = {}

        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

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
        if (isLoading || !apiCompleted || !biometricChecked || biometricInProgress) {
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
    }, [isLoading, apiCompleted, biometricChecked, biometricInProgress]);

    useEffect(() => {
        // Migrate state to ensure new properties exist
        dispatch(migrateState());

        dispatch(saveMyOffer(null));
        dispatch(saveTotalMyOfferPagesCount(1));
        dispatch(saveMyOfferPageNo(1));

        // If user is logged in, get fresh profile data
        if (islogin && user) {
            console.log("*********** Getting fresh user profile *************");
            getUserProfile();
        } else {
            setApiCompleted(true);
        }

        // Minimum splash time
        const minSplashTime = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(minSplashTime);
    }, [])

    // Handle navigation after API completion and minimum splash time
    useEffect(() => {
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
    }, [isLoading, apiCompleted, biometricChecked, user]);

    // Check biometric authentication - mandatory for logged in users, optional for logged out users
    useEffect(() => {
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
    }, [islogin, biometricEnabled, apiCompleted, biometricChecked, biometricInProgress]);

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
                    pointerEvents={(isLoading || !apiCompleted || !biometricChecked || biometricInProgress) ? 'auto' : 'none'}
                >
                    <View style={styles.loadingContent}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <ActivityIndicator size="small" color={colors.primaryColor} />
                        </Animated.View>
                        <Text style={styles.loadingText}>
                            {biometricInProgress || (!biometricChecked && biometricEnabled && islogin)
                                ? (LocalizedStrings.biometric_app_open_prompt || 'Authenticate to open the app')
                                : (LocalizedStrings.loading || 'Loading...')
                            }
                        </Text>
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
        flexDirection: 'row',
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