import React from 'react'
import { View, Text, Image, StyleSheet, Pressable, Modal } from 'react-native'
import { appIcons, appImages, colors, fontFamily, fontPixel, heightPixel, hp, widthPixel, wp } from '../../services'

export default function CallModal({ warningImage, modalShow, setModalShow, title, subTitle }) {
    return (
        <Modal style={{ flex: 1 }} animationType="slide" transparent={true} visible={modalShow} onRequestClose={() => setModalShow(false)}>
            <Pressable style={styles.container} onPress={() => setModalShow(false)}>
                <View style={[styles.doneWrapper]}>
                    <Image source={warningImage ? warningImage : appImages.tick} style={{ resizeMode: "contain", alignSelf: "center", width: widthPixel(80), height: heightPixel(80) }} />
                    <Text style={{ color: colors.BlackSecondary, fontFamily: fontFamily.UrbanistBold, fontSize: hp(2.6), textAlign: "center", marginVertical: wp(5) }}>{title}</Text>
                    <Text style={{ color: colors.descriptionColor, fontFamily: fontFamily.UrbanistLight, fontSize: hp(1.6), textAlign: "center" }}>{subTitle}</Text>
                </View>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    doneWrapper: {
        backgroundColor: "#ffffff",
        width: wp(75),
        // height: hp(42),
        borderRadius: 20,
        paddingVertical: wp(8),
        paddingHorizontal: wp(4),
    },
})
