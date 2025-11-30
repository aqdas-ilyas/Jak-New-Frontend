import React, { useState, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { View, Image, StyleSheet, Text } from 'react-native';
import { appIcons, colors, fontFamily, hp, wp } from '../../services';
import PhoneInput from "react-native-phone-number-input";
import { LocalizationContext } from '../../language/LocalizationContext';
import { useRTL } from '../../language/useRTL';
import appStyles from '../../services/utilities/appStyles';

const CountryInput = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const { isRTL, rtlStyles, layoutDirection } = useRTL();
    const phoneInput = useRef(null);

    // useEffect(() => {
    // it's ugly, but it works
    phoneInput.current?.setState({
        countryCode: props.countryAbbreviationCode ? props.countryAbbreviationCode : '',
        code: props.countryCode.toString(),
        number: props.phoneNumber,
    });
    // }, [props.countryCode])

    return (
        <View style={{ marginVertical: hp(1) }}>
            <View style={[appStyles.rowBtw, rtlStyles.rowBetween]}>
                <Text style={[styles.titleStyle, rtlStyles.textAlign, rtlStyles.writingDirection]}>{LocalizedStrings.phone_Number}</Text>
                <Text onPress={props.onrightTextPress} style={[styles.rightTitleStyle, rtlStyles.textAlign]}>{props.rghtText}</Text>
            </View>
            <PhoneInput
                containerStyle={[styles.inputBox, rtlStyles.rowBetween, { width: '100%' }]}
                textInputStyle={{
                    height: hp(6),
                    fontFamily: fontFamily.UrbanistMedium,
                    fontSize: hp(1.6),
                    color: colors.BlackSecondary,
                    backgroundColor: props.disabled ? '#E0E0E0' : '#FAFAFA',
                    textAlign: layoutDirection.textAlign,
                    writingDirection: layoutDirection.writingDirection,
                }}
                codeTextStyle={{
                    fontFamily: fontFamily.UrbanistMedium,
                    fontSize: hp(1.6),
                    color: colors.BlackSecondary,
                    backgroundColor: props.disabled ? '#E0E0E0' : '#FAFAFA',
                }}
                countryPickerButtonStyle={{
                    width: wp(25),
                    height: hp(6),
                    backgroundColor: props.disabled ? '#E0E0E0' : '#FAFAFA',
                    borderRadius: 10,
                }}
                textContainerStyle={{
                    flex: 2,
                    backgroundColor: props.disabled ? '#E0E0E0' : '#FAFAFA',
                    height: hp(6),
                    marginStart: wp(3),
                    borderRadius: 10,
                }}
                renderDropdownImage={
                    props.disabled ? null : <Image source={appIcons.arrowDown} style={{ height: hp(3), width: wp(3), resizeMode: "cover", tintColor: colors.fullBlack }} />
                }
                ref={phoneInput}
                defaultCode={'SA'} // Set default country code
                value={''} // Set current phone number value
                layout={props.layout}
                placeholder={LocalizedStrings['Number']}
                disabled={props.disabled}
                textInputProps={{
                    placeholderTextColor: colors.placeholderColor,
                    editable: !props.disabled
                }}
                onChangeText={(text) => {
                    if (!props.disabled) {
                        console.log("onChangeText: ", text)
                        props.setValue(`${text}`)
                    }
                }}
                onChangeFormattedText={(text) => {
                    console.log("onChangeFormattedText: ", text)
                }}
                onChangeCountry={(text) => {
                    if (!props.disabled) {
                        console.log("onChangeCountry: ", `+${text?.callingCode}`)
                        props.setSelectedCode(`${text?.callingCode}`)
                    }
                }}
            // withDarkTheme
            // withShadow
            // autoFocus
            />
        </View>
    );
};

export default CountryInput;

const styles = StyleSheet.create({
    rightTitleStyle: {
        paddingVertical: wp(2),
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.descriptionColor,
        textDecorationLine: 'underline'
    },
    titleStyle: {
        paddingVertical: wp(2),
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: 'left'
    },
    inputBox: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    input: {
        flex: 2,
        marginLeft: wp(2),
        fontFamily: fontFamily.appTextSatoshiRegular,
        color: colors.black
    },
    codeBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: hp(1.5),
        alignItems: "center",
        // borderRightWidth: 1,
        // borderColor: colors.black,
        width: wp(15),
    },
    codeText: {
        color: colors.black,
        fontFamily: fontFamily.appTextSatoshiRegular,
        fontSize: 13,
    },
    codeIcon: {
        height: 18,
        width: 18,
        resizeMode: "contain",
        marginHorizontal: wp(1.5)
    },
    codeListBox: {
        position: 'absolute',
        top: Platform.OS === 'android' ? hp(8.5) : hp(7),
        left: 0,
        zIndex: 1,
        width: '18%',
        padding: wp(1),
        paddingHorizontal: wp(2),
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.black,
        backgroundColor: colors.white,
        borderRadius: 10,
    },
    codeList: {
        color: colors.black,
        fontFamily: fontFamily.appTextSatoshiMedium,
        textDecorationLine: "underline",
        marginVertical: hp(.5),
        fontSize: 14,
    },
});
