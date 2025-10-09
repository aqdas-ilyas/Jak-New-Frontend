import React, { useContext } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { appIcons, colors, fontFamily, hp, wp } from '../../services'
import appStyles from '../../services/utilities/appStyles'

const SocialButton = props => {
    const { style, disable, containerStyle, onPress, imgSrc } = props

    return (
        <View style={[appStyles.mb15]}>
            <TouchableOpacity
                disabled={disable}
                style={
                    {
                        ...styles.container,
                        ...containerStyle,
                        borderWidth: 1,
                        borderColor: colors.borderColor
                    }}
                onPress={onPress}>
                <Image source={imgSrc} style={styles.Icon} />
                <View>
                    <Text style={{ ...styles.label, ...style, color: colors.BlackSecondary }}>
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
        fontFamily: fontFamily.UrbanistMedium,
    },
    Icon: {
        width: hp(3),
        height: hp(3),
        position: "absolute",
        left: wp(3)
    }
})

export default SocialButton
