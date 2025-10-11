import React from 'react'
import { View, Text, Image, StyleSheet, Pressable, Modal, TouchableOpacity } from 'react-native'
import { appIcons, appImages, colors, fontFamily, fontPixel, heightPixel, hp, widthPixel, wp } from '../../services'

export default function CallModal({ 
    warningImage, 
    modalShow, 
    setModalShow, 
    title, 
    subTitle, 
    showButtons = false,
    confirmText = 'Yes',
    cancelText = 'No',
    onConfirm,
    onCancel
}) {
    return (
        <Modal style={{ flex: 1 }} animationType="slide" transparent={true} visible={modalShow} onRequestClose={() => setModalShow(false)}>
            <Pressable style={styles.container} onPress={showButtons ? null : () => setModalShow(false)}>
                <View style={[styles.doneWrapper]}>
                    <Image source={warningImage ? warningImage : appImages.tick} style={{ resizeMode: "contain", alignSelf: "center", width: widthPixel(80), height: heightPixel(80) }} />
                    <Text style={{ color: colors.BlackSecondary, fontFamily: fontFamily.UrbanistBold, fontSize: hp(2.6), textAlign: "center", marginVertical: wp(5) }}>{title}</Text>
                    <Text style={{ color: colors.descriptionColor, fontFamily: fontFamily.UrbanistLight, fontSize: hp(1.6), textAlign: "center", marginBottom: wp(4) }}>{subTitle}</Text>
                    
                    {showButtons && (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.confirmButton]} 
                                onPress={onConfirm}
                            >
                                <Text style={styles.confirmButtonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
        width: wp(80),
        borderRadius: 20,
        paddingVertical: wp(8),
        paddingHorizontal: wp(4),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: wp(4),
        gap: wp(3),
    },
    button: {
        flex: 1,
        paddingVertical: wp(3.5),
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.borderColor,
    },
    confirmButton: {
        backgroundColor: colors.primaryColor,
    },
    cancelButtonText: {
        color: colors.BlackSecondary,
        fontFamily: fontFamily.UrbanistSemiBold,
        fontSize: hp(1.8),
    },
    confirmButtonText: {
        color: colors.fullWhite,
        fontFamily: fontFamily.UrbanistBold,
        fontSize: hp(1.8),
    },
})
