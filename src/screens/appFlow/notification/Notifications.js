import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { heightPixel, hp, routes, wp } from "../../../services/constants";
import { appIcons, appImages } from "../../../services/utilities/assets";
import Header from "../../../components/header";
import appStyles from "../../../services/utilities/appStyles";
import { colors, fontFamily } from "../../../services";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LocalizationContext } from "../../../language/LocalizationContext";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { Loader } from "../../../components/loader/Loader";

export default Notification = (props) => {
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const [isLoading, setIsLoading] = useState(false)
    const [notificationArray, setNotificationsArray] = useState(false)

    const NotificationList = [
        {
            id: 1,
            date: '',
            list: [
                { key: 1, imgSRC: appIcons.ShieldDone, title: LocalizedStrings['Account Security Alert'], desc: LocalizedStrings.d1 },
                { key: 2, imgSRC: appIcons.InfoCircle, title: LocalizedStrings['System Update Available'], desc: LocalizedStrings.d2 },
            ]
        },
        {
            id: 2,
            date: LocalizedStrings['Yesterday'],
            list: [
                { key: 1, imgSRC: appIcons.LockNotify, title: LocalizedStrings['Password Reset Successful'], desc: LocalizedStrings.d3 },
                { key: 2, imgSRC: appIcons.LockNotify, title: LocalizedStrings['Exciting New Feature'], desc: LocalizedStrings.d4 },
                { key: 3, imgSRC: appIcons.LockNotify, title: LocalizedStrings['Password Reset Successful'], desc: LocalizedStrings.d5 },
            ]
        },
    ]

    const getNotification = () => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('response getNotification===', response?.data?.pageData);
            setNotificationsArray(response?.data?.pageData)
        };

        const onError = error => {
            console.log('Error getNotification===', error);
            setIsLoading(false);
        };

        const endPoint = routs.getNotification + '?page=1&limit=10'
        const method = Method.GET;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    useEffect(() => {
        getNotification()
    }, [])

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.Notification} />

            <FlatList
                data={notificationArray}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginVertical: wp(10) }}>
                        <Image source={appImages.NotFound} style={{ width: wp(60), height: wp(60), marginVertical: wp(5) }} />
                    </View>
                }
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    return (
                        <View key={index}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: index > 0 ? wp(3) : 0 }}>
                                <Text style={styles.shortDes}>{item.date}</Text>
                                {item.date != '' && <View style={styles.line} />}
                            </View>

                            <FlatList
                                data={item.list}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item.key}
                                renderItem={({ item, index }) => {
                                    return (
                                        <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: wp(5) }}>
                                            <View style={styles.ImageCircle}>
                                                <Image source={item.imgSRC} style={styles.ImageStyle} />
                                            </View>
                                            <View style={{ marginLeft: wp(3), width: wp(75) }}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: wp(72), marginBottom: wp(2) }}>
                                                    <Text style={styles.mainTitle}>{item.title}</Text>
                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                        {index < 1 && <Text style={{ fontSize: Platform.OS == 'android' ? hp(1.4) : hp(1), color: colors.primaryColor, marginRight: wp(5) }}>{"\u2B24"}</Text>}
                                                        <AntDesign name={appLanguage == 'en' ? 'right' : 'left'} color={colors.BlackSecondary} size={wp(4)} />
                                                    </View>
                                                </View>
                                                <Text style={styles.shortDes}>{item.desc}</Text>
                                                <Text style={styles.timeText}>09:41 AM</Text>
                                            </View>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                    )
                }}
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    mainTitle: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        lineHeight: 28,
        textAlign: 'left'
    },
    shortDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        textAlign: 'left'
    },
    timeText: {
        fontSize: hp(1.2),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 20,
        textAlign: 'left'
    },
    line: {
        borderColor: colors.borderColor,
        borderWidth: 0.5,
        width: wp(80),
        marginLeft: wp(2)
    },
    ImageCircle: {
        borderColor: colors.borderColor,
        borderWidth: 1,
        padding: wp(3),
        borderRadius: 50
    },
    ImageStyle: {
        width: wp(8),
        height: wp(8)
    },
});