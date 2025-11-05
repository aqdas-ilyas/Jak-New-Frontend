import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons, passwordFormat } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import Button from '../../../components/button'
import { Input } from '../../../components/input'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { showMessage } from 'react-native-flash-message'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { getDeviceId } from 'react-native-device-info'
import { Loader } from '../../../components/loader/Loader'

const ChangePassword = (props) => {
    const { appLanguage, LocalizedStrings, setAppLanguage } = React.useContext(LocalizationContext);
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(true)
    const [newPassword, setNewPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(true)
    const [newConfirmPassword, setNewConfirmPassword] = useState('')
    const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const passValue = passwordFormat.test(newPassword) || newPassword === ' ' ? true : false;

    const validate = () => {
        if (password.length < 4) {
            showMessage({ message: LocalizedStrings.please_enter_valid_current_password, type: "danger", });
            return false;
        }

        if (newPassword.length < 4) {
            showMessage({ message: LocalizedStrings.please_enter_strong_password, type: "danger", });
            return false;
        }

        // if (!passValue) {
        //     showMessage({ message: "Please enter a strong password (Containing A-Z + a-z + 0-9)", type: "danger", });
        //     return false;
        // }
        else if (newPassword != newConfirmPassword) {
            showMessage({ message: LocalizedStrings.passwords_do_not_match, type: "danger", });
            return false;
        }

        return true;
    }

    const changePassword = () => {
        if (validate()) {
            const onSuccess = response => {
                console.log('res while changePassword====>', response);
                setIsLoading(false)
                showMessage({ message: LocalizedStrings[response?.message] || response?.message, type: "success", });
            };

            const onError = error => {
                setIsLoading(false)
                console.log('error while changePassword====>', error);
                showMessage({ message: LocalizedStrings[error?.message] || error?.message, type: "danger", });
            };

            const method = Method.PATCH;
            const endPoint = routs.updateMyPassword
            const bodyParams = {
                "currentPassword": password,
                "password": newPassword,
                device: { id: getDeviceId(), deviceToken: "fcmToken" }
            }

            setIsLoading(true)
            callApi(method, endPoint, bodyParams, onSuccess, onError);
        }
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.change_password} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.mainDes, { marginVertical: wp(5) }]}>{LocalizedStrings.change_password_description}</Text>
                <View>
                    <Input
                        placeholder={LocalizedStrings.old_password}
                        secureTextEntry={showPassword}
                        onPressEye={() => setShowPassword(!showPassword)}
                        value={password}
                        onChangeText={(value) => setPassword(value)}
                        eye={true}
                        leftIcon={appIcons.lock}
                    >
                        {LocalizedStrings.old_password}
                    </Input>

                    <Input
                        placeholder={LocalizedStrings.new_password}
                        secureTextEntry={showNewPassword}
                        onPressEye={() => setShowNewPassword(!showNewPassword)}
                        value={newPassword}
                        onChangeText={(value) => setNewPassword(value)}
                        eye={true}
                        leftIcon={appIcons.lock}
                    >
                        {LocalizedStrings.new_password}
                    </Input>

                    <Input
                        placeholder={LocalizedStrings.confirm_new_password}
                        secureTextEntry={showNewConfirmPassword}
                        onPressEye={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                        value={newConfirmPassword}
                        onChangeText={(value) => setNewConfirmPassword(value)}
                        eye={true}
                        leftIcon={appIcons.lock}
                    >
                        {LocalizedStrings.confirm_new_password}
                    </Input>
                </View>

            </View>
            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button onPress={() => changePassword()}>{LocalizedStrings.save_changes}</Button>
            </View>
        </SafeAreaView>
    )
}

export default ChangePassword

const styles = StyleSheet.create({
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        textAlign: 'left'
    },
})