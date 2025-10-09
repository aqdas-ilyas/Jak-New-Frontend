import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { heightPixel, hp, routes, wp } from "../../../services/constants";
import { appIcons, appImages } from "../../../services/utilities/assets";
import Header from "../../../components/header";
import appStyles from "../../../services/utilities/appStyles";
import { colors, fontFamily } from "../../../services";
import LogoHeader from "../../../components/logoHeader/LogoHeader";
import { LocalizationContext } from "../../../language/LocalizationContext";
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from "../../../store/reducers/userDataSlice";
import { callApi, Method } from "../../../api/apiCaller";
import routs from "../../../api/routs";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Loader } from "../../../components/loader/Loader";

export default Wallet = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const dispatch = useDispatch()
    const isFocused = useIsFocused()
    const user = useSelector(state => state.user.user.user)
    const [isLoading, setIsLoading] = useState(false)

    const getUserProfile = () => {
        const onSuccess = response => {
            setIsLoading(false)
            console.log('res while getUserProfile====>', response);
            dispatch(updateUser(response))
        };

        const onError = error => {
            setIsLoading(false)
            console.log('error while getUserProfile====>', error);
        };

        const method = Method.GET;
        const endPoint = routs.getUser
        const bodyParams = {}

        setIsLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    useFocusEffect(
        React.useCallback(() => {
            getUserProfile() // Get User profile To Get Wallet

            // Return a cleanup function if necessary
            return () => {
                console.log('Screen is unfocused, clean up here if needed');
            };
        }, []) // Dependency array is empty to run the effect only once when the component mounts
    );

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <LogoHeader />
            <View style={{ flex: 1 }}>
                <View style={{ marginTop: wp(5), padding: wp(5), flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.primaryColor, borderRadius: wp(5) }}>
                    <View style={{ justifyContent: "space-between", marginVertical: wp(4) }}>
                        <Text style={[styles.mainTitle, { fontSize: hp(2.2) }]}>{LocalizedStrings["My Wallet"]}</Text>
                        <View>
                            <Text style={[styles.mainTitle, { fontSize: hp(2.2) }]}>{LocalizedStrings.points}</Text>
                            <Text style={[styles.mainTitle, { fontSize: hp(3.4) }]}>{user?.points}</Text>
                        </View>
                    </View>
                    <Image source={appImages.wallet} style={styles.imageStyle} />
                </View>

                <Text style={[styles.titleText, { marginVertical: wp(5) }]}>{LocalizedStrings["Loyalty Cards"]}</Text>
                <View style={[styles.shadow]}>
                    <Image source={appImages.walletBox} style={styles.BoxImageStyles} />
                    <View style={{ marginLeft: wp(3), justifyContent: "space-between", width: wp(65) }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={[styles.boxTitle]}>{LocalizedStrings['Save Your Loyalty Cards']}</Text>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => props.navigation.navigate(routes.loyaltyCard)} style={{ backgroundColor: colors.primaryColor, paddingHorizontal: wp(4), borderRadius: 5 }}>
                                <Text style={[styles.addButton]}>{LocalizedStrings.Add}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.boxDes]}>{LocalizedStrings.walletDes}</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    imageStyle: {
        width: wp(50),
        height: wp(35),
        resizeMode: 'contain'
    },
    mainTitle: {
        fontFamily: fontFamily.UrbanistRegular,
        color: '#F5F5F5',
        textAlign: 'left'
    },
    titleText: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        lineHeight: 26,
        textAlign: 'left'
    },
    addButton: {
        fontSize: hp(1.2),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.fullWhite,
        lineHeight: 20
    },
    BoxImageStyles: {
        width: wp(15),
        height: wp(15),
        resizeMode: 'contain'
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        // alignItems: "center",
        backgroundColor: colors.fullWhite,
        borderRadius: wp(3),
        padding: wp(4)
    },
    boxTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        lineHeight: 24,
        textAlign: 'left'
    },
    boxDes: {
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 22,
        textAlign: 'left'
    }
})