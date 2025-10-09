import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { appIcons, colors, fontFamily, hp, wp } from '../../services'
import { LocalizationContext } from '../../language/LocalizationContext';

export default function Header({ filter, leftIcon, cross, onleftIconPress, title, rightTitle, onPressRightTitle, rightIcon, onrightIconPress, addButton }) {
    const { appLanguage, LocalizedStrings } = React.useContext(LocalizationContext);

    return (
        <View style={{ paddingTop: Platform.OS == 'android' ? filter ? 0 : wp(10) : 0, flexDirection: "row", justifyContent: 'space-between', alignItems: "center" }}>
            {leftIcon ? <TouchableOpacity onPress={onleftIconPress}><Image source={cross ? appIcons.cross : appIcons.back} style={[styles.back, { transform: [{ rotate: appLanguage == 'en' ? '0deg' : '180deg' }] }]} /></TouchableOpacity> : <Text></Text>}
            {title && <Text style={styles.leftLabel}>{title}</Text>}
            {rightIcon
                ? <TouchableOpacity onPress={onrightIconPress}><Image source={rightIcon} style={styles.right} /></TouchableOpacity>
                : rightTitle
                    ? <Text onPress={onPressRightTitle} style={styles.rightLabel}>{rightTitle}</Text>
                    : addButton
                        ? <TouchableOpacity activeOpacity={0.8} onPress={onPressRightTitle} style={{ backgroundColor: colors.primaryColor, paddingHorizontal: wp(2), borderRadius: 5 }}>
                            <Text style={[styles.addButton]}>{LocalizedStrings['Add Card']}</Text>
                        </TouchableOpacity>
                        : <Text ></Text>
            }
        </View >
    )
}

const styles = StyleSheet.create({
    back: {
        width: wp(5),
        height: wp(5),
        tintColor: colors.BlackSecondary
    },
    right: {
        width: wp(5),
        height: wp(5),
        tintColor: colors.BlackSecondary
    },
    leftLabel: {
        fontFamily: fontFamily.UrbanistSemiBold,
        fontSize: hp(1.8),
        textAlign: "center",
        color: colors.BlackSecondary
    },
    rightLabel: {
        fontFamily: fontFamily.UrbanistSemiBold,
        fontSize: hp(1.8),
        textAlign: "center",
        color: colors.primaryColor
    },
    addButton: {
        fontSize: hp(1.2),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.fullWhite,
        lineHeight: 20
    },
})