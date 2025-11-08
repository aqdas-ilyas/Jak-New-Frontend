import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Platform, ScrollView } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import Header from '../../../components/header'
import { Input } from '../../../components/input'
import CallModal from '../../../components/modal'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect from React Navigation
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { Loader } from '../../../components/loader/Loader'
import { showMessage } from 'react-native-flash-message'
import { getDeviceId } from 'react-native-device-info'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../../../store/reducers/userDataSlice'
import CheckBox from '@react-native-community/checkbox';
import { resolveMessage } from '../../../language/helpers';

const Preferences = (props) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.user)
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const [employeeArray, setEmployeeArray] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalShow, setModalShow] = useState(false)
    const [pendingModalShow, setPendingModalShow] = useState(false)
    const [confimationModalShow, setConfimationModalShow] = useState(false)

    const [isLoading, setIsLoading] = useState(false);

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
    useEffect(() => {
        getCompany()
    }, [])

    const getCompany = async () => {
        const onSuccess = async (response) => {
            setIsLoading(false);
            console.log('res while getCompany====>', JSON.stringify(response, "", 2));
            setEmployeeArray(response?.data?.data)

            if (user?.employer.length > 0) {
                for (let index = 0; index < user?.employer.length; index++) {
                    setSelectedItems(prevState => {
                        if (prevState.includes(user?.employer[index])) {
                            // If the item is already selected, remove it from the selection
                            return prevState.filter(i => i !== user?.employer[index]);
                        } else {
                            // If the item is not selected, add it to the selection
                            return [...prevState, user?.employer[index]];
                        }
                    });
                }
            }
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
    }

    // Create Preference API
    const createPreference = (skip) => {
        const onSuccess = response => {
            setIsLoading(false)
            console.log('res while createPreference====>', response);
            const fallbackMessage = props?.route?.params?.key === 'settings'
                ? LocalizedStrings.preferences_updated
                : LocalizedStrings.preferences_created;

            showMessage({ message: resolveMessage(LocalizedStrings, response?.message, fallbackMessage), type: "success" })
            props?.route?.params?.key === 'settings' ? null : setModalShow(true)

            dispatch(updateUser(response?.data))

            setTimeout(() => {
                // if (!user.isAdminApproved) {
                //     if (props?.route?.params?.key === 'settings') {
                //         setPendingModalShow(false); // Show a pending modal
                //     } else {
                //         setPendingModalShow(true); // Show a pending modal
                //     }
                // } else {
                //     setModalShow(false)
                // }

                setModalShow(false)

                setTimeout(() => {
                    // if (response?.act == 'admin-pending') {
                    props?.route?.params?.key === 'settings' ? null : props?.navigation?.navigate(routes.subscription) // Navigate to login page if response indicates admin pending action
                    setPendingModalShow(false); // Show a pending modal
                    setModalShow(false); // Show a Profile Created modal
                    setConfimationModalShow(false); // Show a Profile Created modal
                    // }
                }, 2000); // Delay this inner action for 2000 milliseconds (2 seconds)
            }, 2000); // Delay the outer action for 2000 milliseconds (2 seconds)
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
                device: { id: getDeviceId(), deviceToken: "fcmToken" }
            }
        } else {
            bodyParams = {
                "employer": selectedItems,
                device: { id: getDeviceId(), deviceToken: "fcmToken" }
            }
        }

        setIsLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    const handleToggle = (item) => {
        setSelectedItems(prevState => {
            if (prevState.includes(item._id)) {
                // If the item is already selected, remove it from the selection
                return prevState.filter(i => i !== item._id);
            } else {
                // If the item is not selected, add it to the selection
                return [...prevState, item._id];
            }
        });
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedItems.includes(item._id);
        return (
            <View key={item._id}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleToggle(item)} style={styles.Item}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image source={{ uri: item.image }} style={styles.Icon} />
                        <Text style={[styles.mainDes]}>{item.name}</Text>
                    </View>
                    <CheckBox
                        value={isSelected}
                        // onValueChange={() => handleToggle(item)}
                        boxType='square'
                        onFillColor={colors.primaryColor}
                        onCheckColor='white'
                        onTintColor={colors.primaryColor}
                        style={styles.checbox}
                        tintColors={{ true: colors.primaryColor, false: colors.placeholderColor }}
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
                title={props?.route?.params?.key === 'settings' ? LocalizedStrings.preferences_title : LocalizedStrings.preferences_title}
            // rightTitle={props?.route?.params?.key === 'settings' ? '' : LocalizedStrings.skip} 
            // onPressRightTitle={() => createPreference('skip')}
            />

            <ScrollView style={{ flex: 1 }}>
                <Text style={styles.mainTitle}>{LocalizedStrings.PreferenceDes}</Text>
                <FlatList
                    data={employeeArray}
                    keyExtractor={(item) => item.name}
                    ListHeaderComponent={
                        <Text style={[styles.titleStyle, { marginBottom: wp(2) }]}>{LocalizedStrings.select_your_bank}</Text>
                    }
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: wp(5) }}
                />
            </ScrollView>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button onPress={() => createPreference()}>{props?.route?.params?.key === 'settings' ? LocalizedStrings.save_changes : LocalizedStrings.continue}</Button>
            </View>

            <CallModal
                warningImage={pendingModalShow ? appImages.warning : appImages.tick}
                modalShow={modalShow || pendingModalShow}
                // setModalShow={() => [setModalShow(!modalShow), setPendingModalShow(!pendingModalShow), setConfimationModalShow(!confimationModalShow)]}
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
        height: Platform.OS == 'ios' ? heightPixel(15) : heightPixel(20),
        width: Platform.OS == 'ios' ? widthPixel(15) : widthPixel(30),
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: wp(3)
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
    },
})