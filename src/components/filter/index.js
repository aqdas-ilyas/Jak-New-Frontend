import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, Pressable, Modal, SafeAreaView, ScrollView, FlatList, ImageBackground } from 'react-native'
import { appIcons, appImages, colors, fontFamily, fontPixel, heightPixel, hp, widthPixel, wp } from '../../services'
import Button from '../button'
import Header from '../header'
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { LocalizationContext } from '../../language/LocalizationContext'

export default function FilterModal({ modalShow, setModalShow, title, subTitle }) {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const [selectCategory, setSelectCategory] = useState(0)

    return (
        <Modal style={{ flex: 1, backgroundColor: colors.fullWhite }} animationType="slide" transparent={true} visible={modalShow} onRequestClose={() => setModalShow(false)}>
            <SafeAreaView style={styles.container}>
                <ScrollView style={{ margin: wp(4) }} showsVerticalScrollIndicator={false}>
                    <Header filter leftIcon cross onleftIconPress={() => setModalShow(false)} title={LocalizedStrings.Filters} />
                    <FlatList
                        contentContainerStyle={{
                            marginTop: wp(5),
                            marginVertical: wp(3),
                            backgroundColor: colors.offWhite,
                            padding: wp(4),
                            borderRadius: 20
                        }}
                        data={[{ id: 1, name: LocalizedStrings.Dining }, { id: 2, name: LocalizedStrings.Entertainment }, { id: 3, name: LocalizedStrings.Travel }, { id: 4, name: LocalizedStrings.Health }, { id: 5, name: LocalizedStrings.Wellness }]}
                        ListHeaderComponent={
                            <Text style={[styles.titleText, { marginVertical: wp(4) }]}>{LocalizedStrings.Category}</Text>
                        }
                        keyExtractor={(item, index) => index}
                        renderItem={({ item, index }) => {
                            return (
                                <Pressable key={index} onPress={() => setSelectCategory(index)} style={{ flexDirection: "row", alignItems: "center", borderTopColor: colors.borderColor, borderTopWidth: 0.5, paddingVertical: wp(5) }}>
                                    <View style={[styles.dotComponentActiveStyle, { borderWidth: 1, marginRight: wp(3) }]}>
                                        <View style={[styles.dotComponentStyle, { backgroundColor: selectCategory == index ? colors.primaryColor : 'transparent' }]} />
                                    </View>
                                    <Text style={styles.mainDes}>{item.name}</Text>
                                </Pressable>
                            )
                        }}
                    />

                    <View style={styles.Box}>
                        <Text style={[styles.titleText, { marginVertical: wp(4) }]}>{LocalizedStrings.Discount}</Text>
                        <View style={{ borderTopColor: colors.borderColor, borderTopWidth: 0.5, paddingTop: wp(10) }}>
                            <MultiSlider
                                markerStyle={styles.sliderDot}
                                unselectedStyle={styles.sliderInActive}
                                selectedStyle={styles.sliderActive}
                                enableLabel
                                enabledTwo
                                customLabel={(sliderPosition) => {
                                    return (
                                        <View>
                                            <ImageBackground
                                                source={appIcons.sliderImage}
                                                style={{
                                                    height: wp(9),
                                                    width: wp(9),
                                                    position: 'absolute',
                                                    left: sliderPosition.oneMarkerLeftPosition - wp(5),
                                                    bottom: -wp(3)
                                                }}
                                            />
                                            <ImageBackground
                                                source={appIcons.sliderImage}
                                                style={{
                                                    height: wp(9),
                                                    width: wp(9),
                                                    position: 'absolute',
                                                    left: sliderPosition.twoMarkerLeftPosition - wp(5),
                                                    bottom: -wp(3)
                                                }}
                                            />
                                        </View>
                                    )
                                }}
                                isMarkersSeparated={true}
                                values={[10, 50]}
                                sliderLength={wp(85)}
                                onValuesChange={(data) => console.log(data)}
                                min={1}
                                max={100}
                                allowOverlap={false}
                                minMarkerOverlapDistance={10}
                            />
                        </View>
                    </View>

                    <View style={styles.Box}>
                        <Text style={[styles.titleText, { marginVertical: wp(4) }]}>{LocalizedStrings.Location}</Text>
                        <View style={{ borderTopColor: colors.borderColor, borderTopWidth: 0.5, paddingTop: wp(10) }}>
                            <MultiSlider
                                markerStyle={styles.sliderDot}
                                unselectedStyle={styles.sliderInActive}
                                selectedStyle={styles.sliderActive}
                                enableLabel
                                customLabel={(sliderPosition) => {
                                    return (
                                        <View>
                                            <Image
                                                source={appIcons.sliderImage}
                                                style={{
                                                    height: wp(9),
                                                    width: wp(9),
                                                    position: 'absolute',
                                                    left: sliderPosition.oneMarkerLeftPosition - wp(5),
                                                    bottom: -wp(3)
                                                }}
                                            />
                                            <Image
                                                source={appIcons.sliderImage}
                                                style={{
                                                    height: wp(9),
                                                    width: wp(9),
                                                    position: 'absolute',
                                                    left: sliderPosition.twoMarkerLeftPosition - wp(5),
                                                    bottom: -wp(3)
                                                }}
                                            />
                                        </View>
                                    )
                                }}
                                isMarkersSeparated={true}
                                values={[20, 80]}
                                sliderLength={wp(85)}
                                onValuesChange={(data) => console.log(data)}
                                min={1}
                                max={100}
                                allowOverlap={false}
                                minMarkerOverlapDistance={10}
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: wp(4) }}>
                        <Button skip containerStyle={{ width: wp(44) }}>
                            {LocalizedStrings.Reset}
                        </Button>
                        <Button containerStyle={{ width: wp(44) }}>
                            {LocalizedStrings.Apply}
                        </Button>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.fullWhite,
    },
    titleText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: 'left'
    },
    dotComponentActiveStyle: {
        width: wp(4),
        height: wp(4),
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
    Box: {
        marginVertical: wp(3),
        backgroundColor: colors.offWhite,
        padding: wp(4),
        borderRadius: 20
    },
    sliderDot: {
        backgroundColor: colors.fullWhite,
        borderColor: colors.primaryColor,
        borderWidth: 2,
        height: heightPixel(20),
        width: heightPixel(20)
    },
    sliderActive: {
        backgroundColor: colors.primaryColor,
        height: heightPixel(6),
        marginTop: -heightPixel(3),
        borderRadius: 50
    },
    sliderInActive: {
        backgroundColor: '#EDEDED',
        height: heightPixel(6),
        marginTop: -heightPixel(3)
    },
    sliderLabel: {
        fontSize: fontPixel(12),
        color: colors.primaryColorOpacity,
        fontFamily: fontFamily.MontserratRegular,
        textAlign: 'left'
    }
})
