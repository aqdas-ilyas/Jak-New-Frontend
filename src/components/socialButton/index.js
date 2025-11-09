import React from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { colors, fontFamily, hp, wp } from '../../services'
import appStyles from '../../services/utilities/appStyles'
import { useRTL } from '../../language/useRTL';

const SocialButton = props => {
    const { style, disable, containerStyle, onPress, imgSrc } = props
    const { rtlStyles, isRTL } = useRTL();

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
                <Image
                    source={imgSrc}
                    style={[
                        styles.Icon,
                        { [isRTL ? 'right' : 'left']: wp(3) }
                    ]}
                />
                <View>
                    <Text style={{ ...styles.label, ...style, ...rtlStyles.writingDirection, color: colors.BlackSecondary, textAlign: 'center' }}>
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
    }
})

export default SocialButton
