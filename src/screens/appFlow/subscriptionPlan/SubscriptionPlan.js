import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Button from '../../../components/button'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Loader } from '../../../components/loader/Loader'
import { setToken, updateUser } from '../../../store/reducers/userDataSlice'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { getDeviceId } from 'react-native-device-info'
import { showMessage } from 'react-native-flash-message'

const SubscriptionPlan = (props) => {
    const { subscribeArr } = props?.route?.params
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.user)
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const [isLoading, setIsLoading] = useState(false)

    // Get features based on subscription type
    const getSubscriptionFeatures = () => {
        const subscriptionType = subscribeArr[0]?.type;
        
        if (subscriptionType === 'Jak Mobile App Free') {
            return [
                { id: 1, desc: LocalizedStrings.free_feature_1 },
                { id: 2, desc: LocalizedStrings.free_feature_2 },
                { id: 3, desc: LocalizedStrings.free_feature_3 },
                { id: 4, desc: LocalizedStrings.free_feature_4 },
            ];
        } else if (subscriptionType === 'Jak Mobile App Plus') {
            return [
                { id: 1, desc: LocalizedStrings.plus_feature_1 },
                { id: 2, desc: LocalizedStrings.plus_feature_2 },
                { id: 3, desc: LocalizedStrings.plus_feature_3 },
                { id: 4, desc: LocalizedStrings.plus_feature_4 },
                { id: 5, desc: LocalizedStrings.plus_feature_5 },
                { id: 6, desc: LocalizedStrings.plus_feature_6 },
            ];
        } else if (subscriptionType === 'Jak Mobile App Premium') {
            return [
                { id: 1, desc: LocalizedStrings.premium_feature_1 },
                { id: 2, desc: LocalizedStrings.premium_feature_2 },
                { id: 3, desc: LocalizedStrings.premium_feature_3 },
                { id: 4, desc: LocalizedStrings.premium_feature_4 },
                { id: 5, desc: LocalizedStrings.premium_feature_5 },
                { id: 6, desc: LocalizedStrings.premium_feature_6 },
                { id: 7, desc: LocalizedStrings.premium_feature_7 },
                { id: 8, desc: LocalizedStrings.premium_feature_8 },
            ];
        }
        // Default to Plus features if type doesn't match
        return [
            { id: 1, desc: LocalizedStrings.plus_feature_1 },
            { id: 2, desc: LocalizedStrings.plus_feature_2 },
            { id: 3, desc: LocalizedStrings.plus_feature_3 },
            { id: 4, desc: LocalizedStrings.plus_feature_4 },
            { id: 5, desc: LocalizedStrings.plus_feature_5 },
            { id: 6, desc: LocalizedStrings.plus_feature_6 },
        ];
    };

    const SubscriptionArray = getSubscriptionFeatures();

    const CreateSubscriptions = () => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('res while CreateSubscriptions====>', response?.data);
            dispatch(setToken({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
            }))
            dispatch(updateUser(response?.data))
            showMessage({ message: 'Subsription Renewed!', type: "success", });
            props.navigation.navigate(routes.tab, { screen: routes.home })
        };

        const onError = error => {
            setIsLoading(false);
            console.log('error while CreateSubscriptions====>', error.message);
        };

        const method = Method.POST;
        const endPoint = routs.createSubscriptions + `${user._id}`
        const bodyParams = {
            "subscriptionId": subscribeArr[0]._id,
            "type": subscribeArr[0].type,
            device: { id: getDeviceId(), deviceToken: "fcmToken" }

        }

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.subscription_plan} rightTitle={LocalizedStrings.manage} onPressRightTitle={() => props.navigation.navigate(routes.subscription)} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.mainDes, { marginVertical: wp(5), color: colors.descriptionColor, textAlign: 'left' }]}>{LocalizedStrings.subscription_plan_description}</Text>

                <View style={styles.Item}>
                    <Text style={[styles.mainDes, { marginTop: wp(5) }]}>{subscribeArr[0]?.type == 'Jak Mobile App Free' ? LocalizedStrings['Free Version'] : subscribeArr[0]?.type == 'Jak Mobile App Premium' ? LocalizedStrings['Plus Version'] : LocalizedStrings['Premium Version']}</Text>
                    <Text style={styles.mainTitle}>{subscribeArr[0]?.price} {appLanguage === 'ar' ? 'ريال' : 'SAR'}<Text style={styles.Duration}> / {subscribeArr[0]?.duration}</Text></Text>
                    <View style={styles.line} />
                    <FlatList
                        bounces={false}
                        data={SubscriptionArray}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingTop: wp(2) }}
                        renderItem={({ item, index }) => {
                            return (
                                <View key={index} style={{ flexDirection: "row", marginTop: wp(3), paddingHorizontal: wp(5), alignItems: "flex-start" }}>
                                    <AntDesign name='check' size={wp(5)} color={colors.primaryColor} style={{ marginTop: wp(0.5) }} />
                                    <Text style={[styles.featureDesc, { marginLeft: wp(3), flex: 1 }]}>{item.desc}</Text>
                                </View>
                            )
                        }}
                    />
                    <View style={styles.line} />
                    <Text style={[styles.mainDes, { marginTop: wp(5), marginBottom: wp(3) }]}>{LocalizedStrings.Your_Current_Plan}</Text>
                </View>
                <Text style={[styles.mainDes, { marginVertical: wp(5), color: colors.descriptionColor }]}>{LocalizedStrings.cancel_subscription_desc1} {moment(user?.subscriptionEndAt).format('MMM DD, YYYY')}. {LocalizedStrings['Renew your subscription']} <Text disabled={!moment(user?.subscriptionEndAt).isBefore(new Date())} onPress={() => CreateSubscriptions()} style={{ color: !moment(user?.subscriptionEndAt).isBefore(new Date()) ? colors.borderColor : colors.primaryColor, fontFamily: fontFamily.UrbanistSemiBold }}>{LocalizedStrings.here}.</Text></Text>
            </View>

            {
                subscribeArr[0]?.type != 'Jak Mobile App Free' && (
                    <View style={[appStyles.ph20, appStyles.mb5]}>
                        <Button onPress={() => props.navigation.navigate(routes.cancelSubscription)}>{LocalizedStrings.cancel_subscription}</Button>
                    </View>
                )
            }
        </SafeAreaView>
    )
}

export default SubscriptionPlan

const styles = StyleSheet.create({
    Item: {
        backgroundColor: colors.offWhite,
        borderRadius: 10,
        marginTop: wp(5),
        paddingBottom: wp(5)
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.BlackSecondary,
        textAlign: "center",
        lineHeight: 24
    },
    mainTitle: {
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        marginTop: wp(5),
        textAlign: "center"
    },
    line: {
        borderColor: colors.borderColor,
        borderWidth: 0.5,
        width: wp(85),
        marginTop: wp(5),
        alignSelf: "center"
    },
    Duration: {
        fontSize: hp(1.2),
        fontFamily: fontFamily.UrbanistLight,
        color: colors.descriptionColor,
    },
    featureDesc: {
        fontSize: hp(1.5),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.BlackSecondary,
        textAlign: "left",
        lineHeight: 22
    }
})