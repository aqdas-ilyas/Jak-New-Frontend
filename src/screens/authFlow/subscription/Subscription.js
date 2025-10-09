import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { Loader } from '../../../components/loader/Loader'
import { getDeviceId } from 'react-native-device-info'
import { useDispatch, useSelector } from 'react-redux'
import { setToken, updateUser } from '../../../store/reducers/userDataSlice'
import CallModal from '../../../components/modal'

const Subscription = (props) => {
    const {appLanguage, LocalizedStrings } = React.useContext(LocalizationContext);
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.user)

    const [modalShow, setModalShow] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [SubscriptionArray, setSubscriptionArray] = useState([])

    const list = [
        { id: 1, desc: LocalizedStrings['Access the offers of 1 bank'] },
        { id: 2, desc: LocalizedStrings['Use the loyalty cards feature'] },
        { id: 3, desc: LocalizedStrings['Change the bank once every 6 months'] },
    ]
    const list1 = [
        { id: 1, desc: LocalizedStrings['Access the offers of 3 bank'] },
        { id: 2, desc: LocalizedStrings['Use the loyalty cards feature'] },
        { id: 3, desc: LocalizedStrings['Change the bank once every 8 months'] },
    ]
    const list2 = [
        { id: 1, desc: LocalizedStrings['Access the offers of 5 bank'] },
        { id: 2, desc: LocalizedStrings['Use the loyalty cards feature'] },
        { id: 3, desc: LocalizedStrings['Change the bank once every 6 months'] },
    ]

    useEffect(() => {
        getSubscriptions()
    }, [])

    const getSubscriptions = (obj) => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('res while getSubscriptions====>', response?.data);
            setSubscriptionArray(response?.data?.premium)
        };

        const onError = error => {
            setIsLoading(false);
            console.log('error while getSubscriptions====>', error.message);
        };

        const method = Method.GET;
        const endPoint = routs.getSubscriptions
        const bodyParams = {}

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    const CreateSubscriptions = (obj) => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('res while CreateSubscriptions====>', response?.data);
            dispatch(setToken({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
            }))
            dispatch(updateUser(response?.data))
            setModalShow(true)

            setTimeout(() => {
                props.navigation.navigate(routes.tab, { screen: routes.home })

                setModalShow(false)
            }, 2000);
        };

        const onError = error => {
            setIsLoading(false);
            console.log('error while CreateSubscriptions====>', error.message);
        };

        const method = Method.POST;
        const endPoint = routs.createSubscriptions + `${user._id}`
        const bodyParams = {
            "subscriptionId": obj._id,
            "type": obj.type,
            device: { id: getDeviceId(), deviceToken: "fcmToken" }
        }

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings['Select Subscription Plan']} />
            <View style={{ flex: 1 }}>
                <FlatList
                    data={SubscriptionArray}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        return (
                            <View key={index}>
                                <TouchableOpacity onPress={() => CreateSubscriptions(item)} style={styles.Item}>
                                    <Text style={[styles.mainDes, { marginTop: wp(5) }]}>{item.type == 'Jak Mobile App Free' ? LocalizedStrings['Free Version'] : item.type == 'Jak Mobile App Premium' ? LocalizedStrings['Plus Version'] : LocalizedStrings['Premium Version']}</Text>
                                    <Text style={styles.mainTitle}>{item.price == 0 ? LocalizedStrings['Free'] : `$${item?.price}`} {appLanguage === 'ar' ? 'ريال' : 'SAR'} {item.price > 0 && <Text style={styles.Duration}> / {item.duration}</Text>} </Text>
                                    <View style={styles.line} />
                                    <FlatList
                                        data={index == 0 ? list : index == 1 ? list1 : list2}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={item => item.id}
                                        renderItem={({ item, index }) => {
                                            return (
                                                <View key={index} style={{ flexDirection: "row", marginTop: wp(5), alignItems: "center", marginHorizontal: wp(5) }}>
                                                    <AntDesign name='check' size={wp(5)} color={colors.BlackSecondary} />
                                                    <Text style={[styles.mainDes, { marginHorizontal: wp(5) }]}>{item.desc}</Text>
                                                </View>
                                            )
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                />
            </View>

            <CallModal
                modalShow={modalShow}
                setModalShow={() => setModalShow(!modalShow)}
                title={LocalizedStrings['Subscription Purchased Successfully!']}
                subTitle={LocalizedStrings.modalDes}
            />
        </SafeAreaView>
    )
}

export default Subscription

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
        textAlign: "center"
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
    }
})