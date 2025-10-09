import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, passwordFormat } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import Header from '../../../components/header'
import { Input } from '../../../components/input'
import CallModal from '../../../components/modal'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { showMessage } from 'react-native-flash-message'
import { getDeviceId } from 'react-native-device-info'
import routs from '../../../api/routs'
import { callApi, Method } from '../../../api/apiCaller'
import { Loader } from '../../../components/loader/Loader'

const ResetPassword = (props) => {
    const { number, otp } = props?.route?.params ?? {}
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(true)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirmPassword, setShowConfirmPassword] = useState(true)
    const [modalShow, setModalShow] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const passValue = passwordFormat.test(password) || password === ' ' ? true : false;

    const validate = () => {
        if (password.length < 4) {
            showMessage({ message: "Please enter a strong password", type: "danger", });
            return false;
        }
        // if (!passValue) {
        //     showMessage({ message: "Please enter a strong password (Containing A-Z + a-z + 0-9)", type: "danger", });
        //     return false;
        // }
        else if (password != confirmPassword) {
            showMessage({ message: "Passwords do not match.", type: "danger", });
            return false;
        }

        return true;
    }

    const validateAndNavigate = () => {
        if (validate()) {
            const onSuccess = response => {
                console.log('res while login====>', response);
                setIsLoading(false)
                showMessage({ message: response?.message, type: "success", });
                setModalShow(true)

                setTimeout(() => {
                    setModalShow(false)
                    props.navigation.navigate(routes.login)
                }, 2000);
            };

            const onError = error => {
                setIsLoading(false)
                console.log('error while login====>', error.message);
                showMessage({ message: error?.message, type: "danger", });
            };

            const method = Method.PATCH;
            const endPoint = routs.resetPassword
            const bodyParams = {
                number: number,
                password: password,
                otp: otp,
                device: { id: getDeviceId(), deviceToken: "fcmToken" }
            }

            setIsLoading(true)
            callApi(method, endPoint, bodyParams, onSuccess, onError);
        }
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} />
            <View style={{ flex: 1 }}>
                <Text style={styles.mainTitle}>{LocalizedStrings['Secure Your Account']}</Text>
                <Text style={styles.mainDes}>{LocalizedStrings.resetDesc}</Text>
                <Input
                    placeholder={LocalizedStrings.password}
                    secureTextEntry={showPassword}
                    onPressEye={() => setShowPassword(!showPassword)}
                    value={password}
                    onChangeText={(value) => setPassword(value)}
                    eye={true}
                    leftIcon={appIcons.lock}
                >
                    {LocalizedStrings.password}
                </Input>

                <Input
                    placeholder={LocalizedStrings.password}
                    secureTextEntry={showConfirmPassword}
                    onPressEye={() => setShowConfirmPassword(!showConfirmPassword)}
                    value={confirmPassword}
                    onChangeText={(value) => setConfirmPassword(value)}
                    eye={true}
                    leftIcon={appIcons.lock}
                >
                    {LocalizedStrings['Re-Enter Password']}
                </Input>
            </View>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button onPress={() => validateAndNavigate()}>{LocalizedStrings['Save New Password']}</Button>
            </View>

            <CallModal
                modalShow={modalShow}
                setModalShow={() => setModalShow(!modalShow)}
                title={LocalizedStrings['Password Reset Successfully!']}
                subTitle={LocalizedStrings.modalDes}
            />
        </SafeAreaView>
    )
}

export default ResetPassword

const styles = StyleSheet.create({
    mainTitle: {
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        color: '#1D191C',
        marginTop: wp(5),
        textAlign: 'left'
    },
    mainDes: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginTop: wp(5),
        textAlign: 'left'
    },
})