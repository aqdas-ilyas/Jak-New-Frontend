import React, { useState } from 'react';
import { Text, StyleSheet, View, TextInput, Image, TouchableOpacity, ScrollView, Pressable, Platform } from 'react-native';
import { useRTL } from '../../language/useRTL';
import { appIcons, appImages, colors, fontFamily, heightPixel, hp, widthPixel, wp } from '../../services';
import appStyles from '../../services/utilities/appStyles';
import CheckBox from '@react-native-community/checkbox';

export const Input = props => {
    const { isRTL, rtlStyles } = useRTL();
    const [borderColor, setBorderColor] = useState(false)

    const onFocus = () => {
        setBorderColor(true)
    }
    const onBlur = () => {
        setBorderColor(false)
    }

    const getMultipleText = () => {
        return (
            props.dropdownArray.filter(item => item.checked).map((item, index) => item.name).join(', ')
        )
    }

    return (
        <View style={[styles.formInput, props.WholeContainer]}>
            {
                props.children && (
                    <View style={[appStyles.rowBtw, rtlStyles.rowBetween]}>
                        <View style={[appStyles.row, rtlStyles.row]}>
                            <Text style={[styles.titleStyle]}>{props.children}</Text>
                            {props.star &&
                                <Text style={{ color: 'red' }}>*</Text>
                            }
                        </View>
                        <Text onPress={props.onrightTextPress} style={[styles.rightTitleStyle, rtlStyles.textAlign]}>{props.rghtText}</Text>
                    </View>
                )
            }

            {
                !props?.hideInput && (
                    <TouchableOpacity
                        disabled={props.touchable ? false : true}
                        activeOpacity={0.5}
                        onPress={() => props.onPressIcon()}
                        style={[styles.input, rtlStyles.rowBetween, props.shadow && styles.shadow, props.containerStyle]}
                    >
                        {props.leftIcon && <Image source={props.leftIcon} style={[styles.icon, props.leftIconStyle]} />}
                        {
                            props.checkBoxes
                                ? (
                                    <Text style={[styles.inputTextStyle, rtlStyles.oppositeTextAlign]}>
                                        {getMultipleText().length > 50 ? `${getMultipleText().slice(0, 50)}...` : getMultipleText()}
                                    </Text>
                                )
                                : (
                                    <TextInput
                                        style={[
                                            styles.inputTextStyle,
                                            props.inputStyle,
                                            rtlStyles.textAlign,
                                            rtlStyles.writingDirection,
                                            { marginHorizontal: wp(2) }
                                        ]}
                                        selectionColor={colors.grey}
                                        value={props.value}
                                        onFocus={onFocus}
                                        placeholder={props.placeholder}
                                        placeholderTextColor={colors.placeholderColor}
                                        secureTextEntry={props.secureTextEntry}
                                        keyboardType={props.keyboardType}
                                        onBlur={onBlur}
                                        editable={props.editable}
                                        onChangeText={props.onChangeText}
                                        multiline={props.multiline}
                                        maxLength={props.maxLength}
                                    />
                                )
                        }

                        {props.eye &&
                            <TouchableOpacity onPress={props.onPressEye}>
                                <Image source={props.secureTextEntry ? appIcons.hide : appIcons.show} style={[styles.icon]} />
                            </TouchableOpacity>
                        }

                        {props.rightIcon &&
                            <TouchableOpacity onPress={props.onPressIcon}>
                                <Image source={props.eyeValue} style={[styles.icon, { tintColor: props.rightIconColor ? props.rightIconColor : colors.BlackSecondary }]} />
                            </TouchableOpacity>
                        }
                    </TouchableOpacity>
                )
            }

            {props.dropDownShow && (
                <View style={styles.dropContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {props.dropdownArray.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        marginVertical: wp(2),
                                        borderBottomWidth: 0.5,
                                        borderBlockColor: colors.borderColor,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginHorizontal: wp(1)
                                    }}
                                    onPress={() => {
                                        if (props.checkBoxes) {
                                            props.onPressValue(item._id)
                                        } else {
                                            props.onPressValue(item)
                                        }
                                    }}
                                >
                                    <Text style={{
                                        paddingBottom: 10,
                                        fontSize: hp(1.6),
                                        color: colors.BlackSecondary,
                                        fontFamily: fontFamily.UrbanistRegular
                                    }}>
                                        {item.name}
                                    </Text>
                                    {
                                        props.checkBoxes
                                            ? (
                                                <CheckBox
                                                    disabled={false}
                                                    onFillColor={colors.primaryColor}
                                                    onCheckColor='white'
                                                    value={item.checked}
                                                    onValueChange={() => Platform.OS == 'android' ? props.onPressValue(item._id) : console.log('Ok IOS hai yeh! Double Click hota hai is liyai')}
                                                    boxType='square'
                                                    onTintColor={colors.primaryColor}
                                                    style={styles.checbox}
                                                    hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }}
                                                    tintColors={{ true: colors.primaryColor, false: colors.placeholderColor }} // Change tint colors if needed
                                                />
                                            )
                                            : (
                                                <Pressable onPress={() => props.onPressValue(item)} style={[styles.dotComponentActiveStyle, { borderWidth: 1 }]}>
                                                    <View style={[styles.dotComponentStyle, { backgroundColor: props.value == item.name ? colors.primaryColor : 'transparent' }]} />
                                                </Pressable>
                                            )
                                    }

                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
            <View>
                {props.errorText && props.errorText ? (
                    <View style={appStyles.pt5}>
                        <Text style={[styles.errorText, rtlStyles.textAlign]} >{props.errorText}</Text>
                    </View>
                ) : null}
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    dotComponentActiveStyle: {
        width: wp(4.5),
        height: wp(4.5),
        borderRadius: 10,
        backgroundColor: colors.fullWhite,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.primaryColor,
    },
    dotComponentStyle: {
        width: wp(3),
        height: wp(3),
        borderRadius: 50,
    },
    dropContainer: {
        width: '100%',
        height: hp(15),
        backgroundColor: colors.fullWhite,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: colors.BlackSecondary,
        shadowOpacity: 0.2,
        elevation: 2,
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(10),
        marginTop: heightPixel(2),
        borderRadius: 10
    },
    inputTextStyle: {
        flex: 1,
        fontFamily: fontFamily.UrbanistMedium,
        fontSize: hp(1.6),
        color: colors.BlackSecondary,
        backgroundColor: '#FAFAFA',
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain'
    },
    sendIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain'
    },
    formInput: {
        width: '100%',
        paddingTop: 15
    },
    titleStyle: {
        paddingVertical: wp(2),
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
    },
    rightTitleStyle: {
        paddingVertical: wp(2),
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.descriptionColor,
        textDecorationLine: 'underline'
    },
    errorText: {
        color: colors.errorColor,
        fontSize: 12,
        fontFamily: fontFamily.appTextRegular,
        paddingLeft: wp(4)
    },
    input: {
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        height: wp(12),
        paddingLeft: 10,
        paddingRight: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bankIconStyle: {
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    fileIconStyle: {
        width: wp(4),
        height: hp(4),
        resizeMode: 'contain',
    },
    checbox: {
        height: Platform.OS == 'ios' ? heightPixel(15) : heightPixel(20),
        width: Platform.OS == 'ios' ? widthPixel(15) : widthPixel(30),
    },
})