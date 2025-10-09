import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert, BackHandler } from 'react-native'
import { colors, hp, fontFamily, wp, routes } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import SocialButton from '../../../components/socialButton'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { googleLoginData } from '../../../services/helpingMethods'
import { useDispatch } from 'react-redux'
import { saveLoginRemember, setToken, updateUser } from '../../../store/reducers/userDataSlice'
import routs from '../../../api/routs'
import { callApi, Method } from '../../../api/apiCaller'
import { getDeviceId } from 'react-native-device-info'
import { Loader } from '../../../components/loader/Loader'
import { showMessage } from 'react-native-flash-message'
import { useFocusEffect } from '@react-navigation/native'

const Welcome = (props) => {
    const dispatch = useDispatch()
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const [isLoading, setIsLoading] = useState(false)

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
            webClientId: '1087826839433-i6m9ek0e4lqapqfqq347pkngutmjtnu7.apps.googleusercontent.com',
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
            showMessage({ message: response?.message, type: "success" });
            dispatch(updateUser(response?.data))
            dispatch(setToken({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
            }))
            dispatch(saveLoginRemember(true))

            if (response?.act === 'login-granted') {
                props.navigation.navigate(routes.tab, { screen: routes.home })
            } else if (response?.act === 'email-unverified') {
                props.navigation.navigate(routes.otp, { email: user?.email.toLowerCase(), key: 'auth' })
            } else if (response?.act === 'incomplete-profile') {
                props?.navigation?.navigate(routes.createProfile, { email: user?.email.toLowerCase() });
            } else if (response?.act === 'incomplete-preferences') {
                if (!response?.data?.user?.isPreferencesSkipped) {
                    props?.navigation?.navigate(routes.preferences);
                } else {
                    if (response?.act == 'admin-pending') {
                        props.navigation.navigate(routes.tab, { screen: routes.home })

                        // props?.navigation?.navigate(routes.preferences);
                        // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
                    } else if (response?.act == 'incomplete-subscription') {
                        props?.navigation?.navigate(routes.subscription);
                        showMessage({ message: 'You are not subscribed yet!', type: 'danger' })
                    }
                }
            } else if (response?.act == 'admin-pending') {
                props.navigation.navigate(routes.tab, { screen: routes.home })

                // props?.navigation?.navigate(routes.preferences);
                // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
            } else if (response?.act == 'incomplete-subscription') {
                props?.navigation?.navigate(routes.subscription);
                showMessage({ message: 'You are not subscribed yet!', type: 'danger' })
            }
        };

        const onError = error => {
            setIsLoading(false)
            console.log('error while handleSociallogin====>', error);
            showMessage({ message: error?.message, type: "danger" });

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

    return (
        <SafeAreaView style={[appStyles.safeContainer, { alignItems: "center", justifyContent: 'center' }]}>
            <Loader loading={isLoading} />
            <StatusBar translucent backgroundColor="transparent" barStyle={'dark-content'} />

            <Image source={appIcons.appLogo} style={styles.imageLogo} />
            <View>
                <Text style={styles.mainTitle}>{LocalizedStrings['Let’s Get Started!']}</Text>
                <Text style={styles.mainDes}>{LocalizedStrings['Let’s dive into your account.']}</Text>
            </View>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <SocialButton onPress={googleLoginClicked} imgSrc={appIcons.google}>{LocalizedStrings['Continue with Google']}</SocialButton>
            </View>

            {/* <View style={[appStyles.ph20, appStyles.mb5]}>
                <SocialButton imgSrc={appIcons.apple}>{LocalizedStrings['Continue with Apple']}</SocialButton>
            </View>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <SocialButton imgSrc={appIcons.facebook}>{LocalizedStrings['Continue with Facebook']}</SocialButton>
            </View> */}

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button onPress={() => props.navigation.navigate(routes.login)}>{LocalizedStrings['Login with Email']}</Button>
            </View>
            <View style={[appStyles.ph20, appStyles.mb20]}>
                <Button skip onPress={() => props.navigation.navigate(routes.register)}>{LocalizedStrings['Sign Up']}</Button>
            </View>

            <Text onPress={() => props.navigation.navigate(routes.terms)} style={styles.bottomText}>{LocalizedStrings['Privacy Policy']}  .  {LocalizedStrings['Terms of Service']}</Text>
        </SafeAreaView>
    )
}

export default Welcome

const styles = StyleSheet.create({
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
    }
})