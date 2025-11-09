import React, { useContext, useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, emailFormat } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import Header from '../../../components/header'
import { Input } from '../../../components/input'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useRTL } from '../../../language/useRTL';
import { showMessage } from 'react-native-flash-message'
import { Loader } from '../../../components/loader/Loader'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { _fetchCountryAbbrevicationCode } from '../../../services/helpingMethods'
import CountryInput from '../../../components/countryPicker/CountryPicker'
import { isPossibleNumber } from 'libphonenumber-js'
import { resolveMessage } from '../../../language/helpers';

const ForgetPassword = (props) => {
    const { appLanguage, LocalizedStrings } = useContext(LocalizationContext);
    const { rtlStyles } = useRTL();
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('966');
    const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('SA');

    // Fetch and set the State's
    const fetchCountryAbbrivaition = async (code) => {
        try {
            const country = await _fetchCountryAbbrevicationCode(code);
            setCountryAbbrivaitionCode(country)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (countryCode != '') {
            fetchCountryAbbrivaition(countryCode)
        } else {
            fetchCountryAbbrivaition("SA")
        }
    }, [countryCode])

    const validateEmail = () => {
        const emailValue = emailFormat.test(email) || email === ' ' ? true : false;

        if (isPossibleNumber(`+${countryCode}` + phoneNumber)) {
            // if (emailValue) {
            const onSuccess = response => {
                console.log('res while validateEmail====>', response);
                setIsLoading(false)
                showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: "success" });

                props.navigation.navigate(routes.otp, { number: `${countryCode + phoneNumber}`, key: 'forget', })
            };
            const onError = error => {
                setIsLoading(false)
                console.log('error while validateEmail====>', error.message);
                showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: "danger" });
            };
            const method = Method.POST;
            const endPoint = routs.forgetPassword
            const bodyParams = {
                language: appLanguage == 'en' ? 'english' : 'arabic',
                number: `${countryCode + phoneNumber}`,
            }

            console.log('ForgotPasswordValidation:- ', bodyParams)

            setIsLoading(true)
            callApi(method, endPoint, bodyParams, onSuccess, onError);
        } else {
            showMessage({ message: LocalizedStrings.invalid_phone_number, type: "danger", });
            return false;
        }
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, rtlStyles.writingDirection, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.mainTitle, rtlStyles.textAlign, rtlStyles.writingDirection]}>{LocalizedStrings['Reset Your Password']}</Text>
                <Text style={[styles.mainDes, rtlStyles.textAlign, rtlStyles.writingDirection]}>{LocalizedStrings.forgetDesc}</Text>
                {/* <Input
                    placeholder={LocalizedStrings.email}
                    value={email}
                    onChangeText={(value) => setEmail(value)}
                    leftIcon={appIcons.message}
                >
                    {LocalizedStrings.email}
                </Input> */}

                <CountryInput
                    phoneNumber={phoneNumber}
                    countryCode={countryCode}
                    countryAbbreviationCode={countryAbbreviationCode}
                    setValue={setPhoneNumber}
                    setSelectedCode={setCountryCode}
                    layout={'second'}
                />

                <View style={[appStyles.ph20, appStyles.mt5]}>
                    <Button onPress={() => validateEmail()}>{LocalizedStrings['Send OTP']}</Button>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ForgetPassword

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
})