import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Keyboard } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, fontPixel } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import Header from '../../../components/header'
import { CodeField, Cursor } from "react-native-confirmation-code-field"
import BackgroundTimer from 'react-native-background-timer';
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useRTL } from '../../../language/useRTL';
import { showMessage } from 'react-native-flash-message'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { Loader } from '../../../components/loader/Loader'
import { getDeviceId } from 'react-native-device-info'
import { useDispatch } from 'react-redux'
import { updateUser, setToken } from '../../../store/reducers/userDataSlice'
import { resolveMessage } from '../../../language/helpers';

const SendOtp = (props) => {
    const { number, email, key } = props?.route?.params ?? {}
    const dispatch = useDispatch()
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const { isRTL } = useRTL();
    const [otpValue, setOtpValue] = useState('')
    const [seconds, setCountDown] = useState(60);
    const [isLoading, setIsLoading] = useState(false)

    // *********************** Timer Start ***********************
    React.useEffect(() => {
        const intervalId = BackgroundTimer.setInterval(() => {
            if (seconds > 0) {
                setCountDown(seconds - 1);
            }
        }, 1000);

        // Cancel the timer when you are done with it
        return () => BackgroundTimer.clearInterval(intervalId);
    }, [seconds]);

    // *********************** OTPVerify ***********************
    const verifyOTP = () => {
        if (otpValue.length < 4) {
            showMessage({ message: LocalizedStrings.invalid_otp, type: "danger" });
            return false;
        } else {
            const onSuccess = response => {
                console.log('res while verifyOTP====>', response);
                setIsLoading(false)
                if (key == 'auth') {
                    dispatch(updateUser(response?.data))
                    dispatch(setToken({
                        token: response?.data?.token,
                        refreshToken: response?.data?.refreshToken,
                    }))
                    if (number) {
                        props.navigation.navigate(routes.createProfile, { number: number })
                    } else {
                        props.navigation.navigate(routes.createProfile, { email: email })
                    }
                } else {
                    props.navigation.navigate(routes.resetPassword, { number: number, otp: otpValue })
                }
            };
            const onError = error => {
                console.log('error while verifyOTP====>', error.message);
                setIsLoading(false)
                showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: "danger", });
            };

            const method = Method.POST;
            const endPoint = key !== 'forget' ? routs.otpVerifyEmail : routs.verifyOTPResetPassword
            let bodyParams = {
                otp: parseFloat(otpValue),
            }

            if (email) {
                bodyParams = { ...bodyParams, email: email }
            }

            if (number) {
                bodyParams = { ...bodyParams, number: number }
            }

            if (key !== 'forget') {
                bodyParams = { ...bodyParams, device: { id: getDeviceId(), deviceToken: "fcmToken" } }
            }

            setIsLoading(true)
            callApi(method, endPoint, bodyParams, onSuccess, onError);
        }
    };

    // *********************** Resend-OTP ***********************
    const ResendOTP = () => {
        const onSuccess = response => {
            console.log('res while ResendOTP====>', response);
            setIsLoading(false)
            setCountDown(60);
            setOtpValue("")
            showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: "success", });
        };
        const onError = error => {
            setIsLoading(false)
            console.log('error while ResendOTP====>', error.message);
            showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: "danger" });
        };
        const method = Method.POST;
        const endPoint = key !== 'forget' ? routs.sendOTP : routs.forgetPassword
        let bodyParams = {};

        if (email) {
            bodyParams = { ...bodyParams, email: email };
        }

        if (number) {
            bodyParams = { ...bodyParams, number: number, language: appLanguage == 'en' ? 'english' : 'arabic', };
        }

        setIsLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={key === 'delete' ? LocalizedStrings.delete_account : ''} />
            <View style={{ flex: 1 }}>
                {key !== 'delete' && (
                    <Text style={[styles.mainTitle, isRTL ? styles.textRight : styles.textLeft]}>
                        {LocalizedStrings.enter_otp_code}
                    </Text>
                )}

                <Text style={[styles.mainDes, isRTL ? styles.textRight : styles.textLeft]}>
                    {LocalizedStrings.otp_des2}
                </Text>
                <View style={{ width: '100%', justifyContent: 'center', alignSelf: 'center', marginTop: hp(5) }}>
                    <CodeField
                        value={otpValue}
                        onChangeText={(txt) => {
                            if (txt.length == 4) {
                                Keyboard.dismiss()
                            }

                            setOtpValue(txt)
                        }}
                        cellCount={4}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                            <Text
                                key={index}
                                style={[styles.cell]}>
                                {symbol || (isFocused ? <Cursor /> : null)}
                            </Text>
                        )}
                    />
                </View>
                <Text style={styles.timerText}>
                    {LocalizedStrings.you_can_resend_the_code_in}{' '}
                    <Text style={styles.timerSecondText}>
                        {seconds !== 0 ? (seconds > 9 ? seconds : `0${seconds}`) : '0'}
                    </Text>
                    {' '}{LocalizedStrings.seconds}
                </Text>
                <Text
                    disabled={seconds != 0 ? true : false}
                    onPress={() => ResendOTP()}
                    style={styles.resendText}>
                    {LocalizedStrings.resend_code}
                </Text>
            </View>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button deleteButton={key === 'delete' ? true : false} onPress={() => { key === 'delete' ? props.navigation.navigate(routes.auth, { screen: routes.login }) : (key === 'auth' || key === 'forget') ? verifyOTP() : null }}>{key === 'delete' ? LocalizedStrings.delete_account : LocalizedStrings.verify}</Button>
            </View>
        </SafeAreaView>
    )
}

export default SendOtp

const styles = StyleSheet.create({
    mainTitle: {
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        color: '#1D191C',
        marginTop: wp(5),
    },
    mainDes: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginTop: wp(5),
    },
    cell: {
        width: wp(17),
        height: wp(13),
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: '#FAFAFA',
        color: colors.BlackSecondary,
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        textAlign: "center",
        lineHeight: wp(12)
    },
    timerText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginTop: wp(5),
        textAlign: "center"
    },
    timerSecondText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginTop: wp(5)
    },
    resendText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginTop: wp(5),
        textAlign: "center"
    },
    textLeft: {
        textAlign: 'left'
    },
    textRight: {
        textAlign: 'right'
    }
})