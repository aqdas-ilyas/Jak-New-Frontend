import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Platform } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel } from '../../../services'
import { appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import Header from '../../../components/header'
import CallModal from '../../../components/modal'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useRTL } from '../../../language/useRTL';
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { Loader } from '../../../components/loader/Loader'
import { showMessage } from 'react-native-flash-message'
import { getDeviceId } from 'react-native-device-info'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../../../store/reducers/userDataSlice'
import CheckBox from '@react-native-community/checkbox';
import { resolveMessage } from '../../../language/helpers';
import { store } from '../../../store/store'

const MAX_SELECTED_BANKS = 3;

const resolveUserData = (candidate) => {
    if (!candidate) {
        return {};
    }

    if (
        candidate._id ||
        candidate.employer ||
        candidate.isComplete !== undefined ||
        candidate.isAdminApproved !== undefined
    ) {
        return candidate;
    }

    if (
        candidate.user &&
        (candidate.user._id ||
            candidate.user.employer ||
            candidate.user.isComplete !== undefined ||
            candidate.user.isAdminApproved !== undefined)
    ) {
        return candidate.user;
    }

    if (candidate.data?.user) {
        return candidate.data.user;
    }

    if (candidate.data) {
        return candidate.data;
    }

    return candidate;
};

const normalizeEmployerIds = (employers) => {
    if (!employers) {
        return [];
    }

    const employerList = Array.isArray(employers) ? employers : [employers];

    return employerList
        .map((item) => {
            if (typeof item === 'string') {
                return item;
            }

            if (item && typeof item === 'object') {
                return item._id || item.id || item.value || item.employerId || null;
            }

            return null;
        })
        .filter(Boolean);
};

const Preferences = (props) => {
    const dispatch = useDispatch()
    const rawUser = useSelector(state => state.user.user.user)
    const user = useMemo(() => resolveUserData(rawUser), [rawUser])
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const { isRTL } = useRTL();
    const isSettingsFlow = props?.route?.params?.key === 'settings';

    const [employeeArray, setEmployeeArray] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalShow, setModalShow] = useState(false)
    const [pendingModalShow, setPendingModalShow] = useState(false)

    const [isLoading, setIsLoading] = useState(false);
    const checkboxPlatformProps = Platform.OS === 'ios'
        ? {
            boxType: 'square',
            onFillColor: colors.primaryColor,
            onCheckColor: 'white',
            onTintColor: colors.primaryColor,
        }
        : {
            tintColors: {
                true: colors.primaryColor,
                false: colors.placeholderColor,
            },
        };

    // // Define the effect to be executed when the screen gains focus
    // useFocusEffect(
    //     React.useCallback(() => {
    //         // Your side effect code goes here
    //         console.log('Screen is focused, do something here', user.isPreferencesSet, user.isAdminApproved);
    //         // if (user.isPreferencesSet || user.isPreferencesSkipped) {
    //         //     if (!user.isAdminApproved) {
    //         //         setModalShow(true)
    //         //         setPendingModalShow(true)
    //         //     }
    //         // }

    //         // Return a cleanup function if necessary
    //         return () => {
    //             setModalShow(false)
    //             setPendingModalShow(false)
    //             // Cleanup code goes here (optional)
    //             props?.route?.params?.key === 'settings'
    //                 ? () => props.navigation.navigate(routes.settings)
    //                 : console.log('Screen is unfocused, clean up here if needed');
    //         };
    //     }, []) // Dependency array is empty to run the effect only once when the component mounts
    // );

    // Get API
    const getCompany = useCallback(async () => {
        const onSuccess = async (response) => {
            setIsLoading(false);
            const companies = Array.isArray(response?.data?.data) ? response.data.data : [];
            setEmployeeArray(companies)
        };

        const onError = error => {
            setIsLoading(false);
            console.log('error while getCompany====>', error.message);
        };

        const method = Method.GET;
        const endPoint = routs.getCompany
        const bodyParams = {}

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }, [])

    useEffect(() => {
        getCompany()
    }, [getCompany])

    useEffect(() => {
        setSelectedItems(normalizeEmployerIds(user?.employer));
    }, [user?.employer])

    // Create Preference API
    const createPreference = (skip) => {
        if (!skip && selectedItems.length > MAX_SELECTED_BANKS) {
            showMessage({
                message: `You can select up to ${MAX_SELECTED_BANKS} banks only.`,
                type: "danger"
            });
            return;
        }

        const onSuccess = response => {
            setIsLoading(false)
            console.log('res while createPreference====>', response);
            const fallbackMessage = isSettingsFlow
                ? LocalizedStrings.preferences_updated
                : LocalizedStrings.preferences_created;

            showMessage({ message: resolveMessage(LocalizedStrings, response?.message, fallbackMessage), type: "success" })

            dispatch(updateUser(response?.data))

            if (isSettingsFlow) {
                setModalShow(false)
                setPendingModalShow(false)
                props?.navigation?.navigate(routes.tab, {
                    screen: LocalizedStrings.home,
                    params: {
                        screen: routes.offer,
                        params: {
                            refreshKey: Date.now(),
                        },
                    },
                })
                return
            }

            setModalShow(true)

            setTimeout(() => {
                setModalShow(false)
                setPendingModalShow(false)
                props?.navigation?.navigate(routes.subscription)
            }, 2000)
        };

        const onError = error => {
            setIsLoading(false)
            console.log('error while createPreference====>', error);
            showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: "danger" });
        };

        const endPoint = routs.createPreferences
        const method = Method.POST;
        let bodyParams;

        if (skip) {
            bodyParams = {
                "isSkipping": "true",
                device: { id: getDeviceId(), deviceToken: store.getState()?.user?.fcmToken || 'fcmToken' }
            }
        } else {
            bodyParams = {
                "employer": selectedItems,
                device: { id: getDeviceId(), deviceToken: store.getState()?.user?.fcmToken || 'fcmToken' }
            }
        }

        setIsLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    const handleToggle = (item) => {
        const itemId = item?._id || item?.id || item?.value;

        if (!itemId) {
            return;
        }

        setSelectedItems(prevState => {
            const isSelected = prevState.includes(itemId);

            if (isSelected) {
                return prevState.filter(i => i !== itemId);
            }

            if (prevState.length >= MAX_SELECTED_BANKS) {
                showMessage({
                    message: `You can select up to ${MAX_SELECTED_BANKS} banks only.`,
                    type: "danger"
                });
                return prevState;
            }

            return [...prevState, itemId];
        });
    };

    const renderItem = ({ item }) => {
        const itemId = item?._id || item?.id || item?.value;
        const isSelected = selectedItems.includes(itemId);
        return (
            <View>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleToggle(item)} style={[styles.Item, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.itemContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Image source={{ uri: item.image }} style={[styles.Icon, { marginLeft: isRTL ? wp(2) : 0, marginRight: isRTL ? 0 : wp(2) }]} />
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[
                                styles.mainDes,
                                {
                                    marginLeft: isRTL ? 0 : wp(4),
                                    marginRight: isRTL ? wp(4) : 0,
                                    textAlign: isRTL ? 'right' : 'left'
                                }
                            ]}
                        >
                            {item.name}
                        </Text>
                    </View>
                    <CheckBox
                        value={isSelected}
                        style={styles.checbox}
                        {...checkboxPlatformProps}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
            <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
                <Loader loading={isLoading} />
                <Header
                    leftIcon
                    onleftIconPress={() => props.navigation.goBack()}
                    title={LocalizedStrings.preferences_title}
                />

            <View style={{ flex: 1 }}>
                <FlatList
                    data={employeeArray}
                    keyExtractor={(item) => String(item?._id || item?.id || item?.value || item?.name)}
                    ListHeaderComponent={
                        <View>
                            <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings.PreferenceDes}</Text>
                            <Text style={[styles.titleStyle, { marginBottom: wp(2), textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings.select_your_bank}</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    extraData={selectedItems}
                    contentContainerStyle={{ paddingBottom: wp(5) }}
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
                    windowSize={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                    style={{ flex: 1 }}
                />

                <View style={[appStyles.ph20, appStyles.mb5]}>
                    <Button onPress={() => createPreference()}>{isSettingsFlow ? LocalizedStrings.save_changes : LocalizedStrings.continue}</Button>
                </View>
            </View>

            <CallModal
                warningImage={pendingModalShow ? appImages.warning : appImages.tick}
                modalShow={modalShow || pendingModalShow}
                setModalShow={() => console.log('On Back Press')}
                title={pendingModalShow ? LocalizedStrings['Pending Approval From Admin!'] : modalShow ? LocalizedStrings.profile_created_successfully : LocalizedStrings['Congratulation Your Account has Approved!']}
                subTitle={LocalizedStrings.modalDes}
            />
        </SafeAreaView>
    )
}

export default Preferences

const styles = StyleSheet.create({
    checbox: {
        height: Platform.OS === 'ios' ? heightPixel(15) : heightPixel(20),
        width: Platform.OS === 'ios' ? widthPixel(15) : widthPixel(30),
    },
    mainTopDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginTop: wp(5),
        lineHeight: 24,
        textAlign: "left"
    },
    Item: {
        borderColor: colors.borderColor,
        borderWidth: 1,
        borderRadius: 10,
        marginTop: wp(5),
        alignItems: "center",
        justifyContent: "space-between",
        padding: wp(3)
    },
    itemContent: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
    },
    mainTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginVertical: wp(5),
        lineHeight: 24,
        textAlign: 'left'
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginLeft: wp(4),
        flex: 1,
        flexShrink: 1,
    },
    Icon: {
        width: hp(5),
        height: hp(5),
        borderRadius: 5
    },
    dotComponentActiveStyle: {
        width: wp(5),
        height: wp(5),
        borderRadius: 10,
        backgroundColor: colors.fullWhite,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.primaryColor,
    },
    dotComponentStyle: {
        width: wp(3.6),
        height: wp(3.6),
        borderRadius: 50,
    },
    titleStyle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: 'left'
    },
})
