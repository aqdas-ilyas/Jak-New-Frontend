import React, { useEffect } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { fontFamily } from '../../../services'
import { hp, routes, wp } from '../../../services/constants'
import { appIcons, appImages } from '../../../services/utilities/assets'
import { colors } from '../../../services/utilities/colors'
import { saveLoginRemember, updateUser } from '../../../store/reducers/userDataSlice'
import { saveMyOffer, saveMyOfferPageNo, saveTotalMyOfferPagesCount } from '../../../store/reducers/OfferSlice'

export default function Splash(props) {
    const dispatch = useDispatch()
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const islogin = useSelector(state => state?.user?.isRemember)
    const numberLogin = useSelector(state => state?.user?.numberLogin)
    const splash = useSelector(state => state?.user?.splash)
    const user = useSelector(state => state?.user?.user?.user)

    console.log("*********** Remeber Me *************", islogin)
    console.log("*********** Checking User *************", user)

    const getUserProfile = () => {
        const onSuccess = response => {
            console.log('res while getUserProfile====>', response);
            dispatch(updateUser(response))
        };

        const onError = error => {
            console.log('error while getUserProfile====>', error);
        };

        const method = Method.GET;
        const endPoint = routs.getUser
        const bodyParams = {}

        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    useEffect(() => {
        dispatch(saveMyOffer(null));
        dispatch(saveTotalMyOfferPagesCount(1));
        dispatch(saveMyOfferPageNo(1));

        // dispatch(saveLoginRemember(false))
        // dispatch(updateUser({}))

        user && getUserProfile()

        setTimeout(() => {
            if (islogin) {
                if (user) {
                    if (!user.isBlocked) {
                        if (!user.isComplete) {
                            if (numberLogin) {
                                props?.navigation?.replace(routes.createProfile, { number: 'number' });
                            } else {
                                props?.navigation?.replace(routes.createProfile, { email: 'email' });
                            }
                        } else if (!user.isPreferencesSet) {
                            if (!user.isPreferencesSkipped) {
                                props?.navigation?.replace(routes.preferences);
                            } else if (!user.isAdminApproved) {
                                props?.navigation?.replace(routes.preferences);
                            } else if (user.subscriptionPlan == "not-subscribed") {
                                props?.navigation?.replace(routes.subscription);
                            } else {
                                props.navigation.replace(routes.tab, { screen: routes.home })
                            }
                        }
                        //  else if (!user.isAdminApproved) {
                        //     props?.navigation?.navigate(routes.preferences);
                        // } 
                        else if (user.subscriptionPlan == "not-subscribed") {
                            props?.navigation?.replace(routes.subscription);
                        } else {
                            props.navigation.replace(routes.tab, { screen: routes.home })
                        }
                    } else {
                        props?.navigation?.replace(routes.login);
                    }
                } else {
                    props?.navigation?.replace(routes.login);
                }
            } else {
                if (splash) {
                    props.navigation.replace(routes.welcome)
                } else {
                    props.navigation.replace(routes.onboard)
                }
            }
        }, 2000);
    }, [])

    return (
        <ImageBackground source={appImages.splashBackground} style={styles.backgroundImage}>
            <Image source={appIcons.appLogo} style={styles.imageLogo} />
            <View style={styles.bottomContainer}>
                <Text style={styles.welcomeText}>{LocalizedStrings['Welcome to']}</Text>
                <Text style={styles.logoText}>{LocalizedStrings['Jak App']}</Text>
                <Text style={styles.promotionText}>{LocalizedStrings['Your one stop app for your promotions.']}</Text>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    imageLogo: {
        width: wp(60),
        height: hp(20)
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