import React, { useContext } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { appIcons, colors, fontFamily, hp, screenHeight, wp } from '../../services'
import appStyles from '../../services/utilities/appStyles'
import { useRTL } from '../../language/useRTL';

const Button = props => {
    const { style, disable, containerStyle, onPress, borderWidth, skip, deleteButton } = props
    const { rtlStyles } = useRTL();

    return (
        <View style={[appStyles.mb15]}>
            <TouchableOpacity
                disabled={disable}
                style={
                    {
                        ...styles.container,
                        ...containerStyle,
                        borderWidth: borderWidth ? borderWidth : 0,
                        backgroundColor: disable ? colors.borderColor : skip ? colors.skipButton : deleteButton ? 'red' : colors.primaryColor
                    }}
                onPress={onPress}>
                <View style={[appStyles.rowCenter]}>
                    <Text style={{ ...styles.label, ...style, ...rtlStyles.writingDirection, textAlign: 'center', color: skip ? colors.primaryColor : colors.fullWhite }}>
                        {props.children}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: wp(90),
        borderRadius: 30,
        height: hp(6),
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    label: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistBold,
    },
})

export default Button
