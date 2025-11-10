import React, { useEffect, useState, useContext } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert, BackHandler, Platform } from 'react-native'
import { colors, hp, fontFamily, wp, routes } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import SocialButton from '../../../components/socialButton'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useRTL } from '../../../language/useRTL';
import ToggleSwitch from 'toggle-switch-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { googleLoginData } from '../../../services/helpingMethods'
import { useDispatch, useSelector } from 'react-redux'
import { saveLoginRemember, setToken, updateUser, saveCredentials } from '../../../store/reducers/userDataSlice'
import routs from '../../../api/routs'
import { callApi, Method } from '../../../api/apiCaller'
import { getDeviceId } from 'react-native-device-info'
import { Loader } from '../../../components/loader/Loader'
import { showMessage } from 'react-native-flash-message'
import { useFocusEffect } from '@react-navigation/native'
import appleAuth from '@invertase/react-native-apple-authentication'
import { decodeJWT } from '../../../common/HelpingFunc'
import { resolveMessage } from '../../../language/helpers';

const Welcome = (props) => {
    const dispatch = useDispatch()
    const biometricEnabled = useSelector(state => state?.user?.biometricEnabled || false);
    const { appLanguage, LocalizedStrings, setAppLanguage } = useContext(LocalizationContext);
    const { rtlStyles, isRTL } = useRTL();
    const [isLoading, setIsLoading] = useState(false)

    // Language Change
    const [language, setLanguage] = useState(appLanguage === 'ar');
    useEffect(() => {
        setLanguage(appLanguage === 'ar');
    }, [appLanguage]);
    const onChangeLng = async lng => {
        setLanguage(lng === 'ar');
        setAppLanguage(lng);
    };

    useFocusEffect(() => {
        const backAction = () => {
            Alert.alert("Jak App!", "Are you sure you want to exit the app?", [
                {
                    text: "Cancel",
                    onPress: () => null,
                    style: "cancel"
                },
                { text: "YES", onPress: () => BackHandler.exitApp() }
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '773361963603-cv2gjtb7ni4or5i5vpudlmao8b90k1do.apps.googleusercontent.com',
            offlineAccess: true,
        })
    }, [])

    const googleLoginClicked = async () => {
        let info = await googleLoginData();
        if (info.Error === undefined) {
            console.log("Google info => ", info?.Data?.userInfo?.user)
            handleSociallogin(info?.Data?.userInfo?.user)
        } else {
            console.log(JSON.stringify(info.Error));
        }
    };

    const handleSociallogin = (user) => {
        const onSuccess = response => {
            setIsLoading(false)
            console.log('res while handleSociallogin====>', response);
            showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: "success" });
            dispatch(updateUser(response?.data))
            dispatch(setToken({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
            }))
            // dispatch(saveLoginRemember(true))

            // Save credentials for biometric login if biometric is enabled
            if (biometricEnabled) {
                dispatch(saveCredentials({
                    loginType: 'google',
                    phoneNumber: null,
                    countryCode: null,
                    password: null,
                    email: null,
                    googleEmail: user?.email,
                    appleEmail: null,
                }));
            }

            if (response?.act === 'login-granted') {
                props.navigation.navigate(routes.tab, { screen: routes.home })
            } else if (response?.act === 'email-unverified') {
                props.navigation.navigate(routes.otp, { email: user?.email.toLowerCase(), key: 'auth' })
            } else if (response?.act === 'incomplete-profile') {
                props?.navigation?.navigate(routes.createProfile, { email: user?.email.toLowerCase() });
            } else {
                props.navigation.navigate(routes.tab, { screen: routes.home })
            }
            // else if (response?.act === 'incomplete-preferences') {
            //     if (!response?.data?.user?.isPreferencesSkipped) {
            //         props?.navigation?.navigate(routes.preferences);
            //     } else {
            //         if (response?.act == 'admin-pending') {
            //             props.navigation.navigate(routes.tab, { screen: routes.home })

            //             // props?.navigation?.navigate(routes.preferences);
            //             // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
            //         } else if (response?.act == 'incomplete-subscription') {
            //             props?.navigation?.navigate(routes.subscription);
            //             showMessage({ message: 'You are not subscribed yet!', type: 'danger' })
            //         }
            //     }
            // } else if (response?.act == 'admin-pending') {
            //     props.navigation.navigate(routes.tab, { screen: routes.home })

            //     // props?.navigation?.navigate(routes.preferences);
            //     // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
            // } else if (response?.act == 'incomplete-subscription') {
            //     props?.navigation?.navigate(routes.subscription);
            //     showMessage({ message: 'You are not subscribed yet!', type: 'danger' })
            // }
        };

        const onError = error => {
            setIsLoading(false)
            console.log('error while handleSociallogin====>', error);
            showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: "danger" });

            if (error?.errorType == 'email-not-verify') {
                props.navigation.navigate(routes.otp, { email: user?.email.toLowerCase(), key: 'auth' })
            }
        };

        const endPoint = routs.socialLogin
        const method = Method.POST;
        const bodyParams = {
            email: user?.email.toLowerCase(),
            device: { id: getDeviceId(), deviceToken: "fcmToken" }
        }

        setIsLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    const onAppleButtonPress = async () => {
        try {
            // Perform the login request
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            // Get credential state for the user
            const credentialState = await appleAuth.getCredentialStateForUser(
                appleAuthRequestResponse.user
            );

            const iOSMajorVersion = parseInt(Platform.Version, 10);

            if (credentialState === appleAuth.State.AUTHORIZED || iOSMajorVersion === 18) {

                // Decode identity token
                const decodedToken = await decodeJWT(appleAuthRequestResponse?.identityToken);

                console.log('Decoded Token: ', decodedToken);

                const { email, email_verified, sub } = decodedToken;

                console.log('Email:', email);
                console.log('Email Verified:', email_verified);
                console.log('Sub:', sub);

                if (email) {
                    // Save credentials for biometric login if biometric is enabled
                    if (biometricEnabled) {
                        dispatch(saveCredentials({
                            loginType: 'apple',
                            phoneNumber: null,
                            countryCode: null,
                            password: null,
                            email: null,
                            googleEmail: null,
                            appleEmail: email,
                        }));
                    }
                    // Handle successful login and save user data
                    handleSociallogin({ email: email, userFirstName: appleAuthRequestResponse?.fullName?.givenName, userLastName: appleAuthRequestResponse?.fullName?.familyName })
                }
                // e.g., call your backend with the token or user info
            } else {
                console.log('User not authorized');
            }
        } catch (error) {
            console.error('Apple Sign-In Error: ', error);
        }
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, rtlStyles.writingDirection, { flex: 1, justifyContent: 'space-between' }]}>
            <Loader loading={isLoading} />
            <StatusBar translucent backgroundColor="transparent" barStyle={'dark-content'} />

            <View style={styles.topSection}>
                <Image source={appIcons.appLogo} style={styles.imageLogo} />
                <View>
                    <Text style={styles.mainTitle}>{LocalizedStrings["Let's Get Started!"]}</Text>
                    <Text style={styles.mainDes}>{LocalizedStrings["Let's dive into your account."]}</Text>
                </View>

                <View style={[appStyles.ph20, appStyles.mb5]}>
                    <SocialButton onPress={googleLoginClicked} imgSrc={appIcons.google}>{LocalizedStrings['Continue with Google']}</SocialButton>
                </View>

                {
                    Platform.OS === 'android' ? null : (
                        <View style={[appStyles.ph20, appStyles.mb5]}>
                            <SocialButton onPress={onAppleButtonPress} imgSrc={appIcons.apple}>{LocalizedStrings['Continue with Apple']}</SocialButton>
                        </View>

                    )
                }
                {/*  <View style={[appStyles.ph20, appStyles.mb5]}>
                    <SocialButton imgSrc={appIcons.facebook}>{LocalizedStrings['Continue with Facebook']}</SocialButton>
                </View> */}

                <View style={[appStyles.ph20, appStyles.mb5]}>
                    <Button onPress={() => props.navigation.navigate(routes.login)}>{LocalizedStrings['Login with Email']}</Button>
                </View>
                <View style={[appStyles.ph20, appStyles.mb20]}>
                    <Button skip onPress={() => props.navigation.navigate(routes.register)}>{LocalizedStrings['Sign Up']}</Button>
                </View>
                <View style={[styles.linkRow, rtlStyles.row]}>
                    <Text onPress={() => props.navigation.navigate(routes.privacyPolicy)} style={[styles.bottomText, rtlStyles.writingDirection]}>{LocalizedStrings['Privacy Policy']}</Text>
                    <View style={[{ backgroundColor: colors.descriptionColor, borderRadius: 50, padding: wp(0.5), marginHorizontal: wp(2) }]} />
                    <Text onPress={() => props.navigation.navigate(routes.termsConditions)} style={[styles.bottomText, rtlStyles.writingDirection]}>{LocalizedStrings['Terms of Service']}</Text>
                </View>
            </View>

            <View style={styles.bottomSection}>


                {/* Language Toggle - Bottom */}
                <View style={styles.languageContainer}>
                    <View style={styles.languageContent}>
                        <View style={styles.languageOptions}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => onChangeLng('en')}
                                style={styles.languageOption}
                            >
                                <Text style={[
                                    styles.languageOptionText,
                                    appLanguage === 'en' && styles.languageOptionTextActive
                                ]}>
                                    En
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.languageDivider} />
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => onChangeLng('ar')}
                                style={styles.languageOption}
                            >
                                <Text style={[
                                    styles.languageOptionText,
                                    appLanguage === 'ar' && styles.languageOptionTextActive
                                ]}>
                                    Ar
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <ToggleSwitch
                            isOn={language}
                            onColor={colors.primaryColor}
                            offColor={colors.borderColor}
                            labelStyle={{ display: 'none' }}
                            size="small"
                            onToggle={e => onChangeLng(e ? 'ar' : 'en')}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Welcome

const styles = StyleSheet.create({
    topSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSection: {
        width: '100%',
        paddingBottom: wp(3),
    },
    linkRow: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageLogo: {
        width: wp(60),
        height: hp(20),
        alignSelf: 'center'
    },
    mainTitle: {
        fontSize: hp(3.2),
        fontFamily: fontFamily.UrbanistBold,
        color: '#1D191C',
        textAlign: "center"
    },
    mainDes: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        textAlign: "center",
        marginVertical: wp(5)
    },
    bottomText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
        textAlign: "center",
        textDecorationLine: 'underline',
    },
    languageContainer: {
        marginTop: wp(4),
        marginBottom: wp(3),
        paddingHorizontal: wp(5),
        alignItems: 'center',
    },
    languageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: wp(60),
        backgroundColor: colors.grayColor + '15',
        paddingHorizontal: wp(4),
        paddingVertical: wp(3),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    languageOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageOption: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(1),
    },
    languageOptionText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
    },
    languageOptionTextActive: {
        fontFamily: fontFamily.UrbanistBold,
        color: colors.primaryColor,
    },
    languageDivider: {
        width: 1,
        height: hp(2),
        backgroundColor: colors.borderColor,
        marginHorizontal: wp(2),
    },
})