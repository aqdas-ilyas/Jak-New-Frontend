import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  SafeAreaView,
  Image,
  ImageBackground,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import {
  heightPixel,
  hp,
  routes,
  widthPixel,
  wp,
} from '../../../services/constants';
import { appIcons, appImages } from '../../../services/utilities/assets';
import Header from '../../../components/header';
import appStyles from '../../../services/utilities/appStyles';
import { colors, fontFamily } from '../../../services';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LogoHeader from '../../../components/logoHeader/LogoHeader';
import ToggleSwitch from 'toggle-switch-react-native';
import { LocalizationContext } from '../../../language/LocalizationContext';
import RNRestart from 'react-native-restart'; // Import package from node modules
import { logout, updateUser } from '../../../store/reducers/userDataSlice';
import { useDispatch, useSelector } from 'react-redux';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { getDeviceId } from 'react-native-device-info';
import { Loader } from '../../../components/loader/Loader';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import { saveFavourite } from '../../../store/reducers/FavoruiteOffersSlice';
import CallModal from '../../../components/modal';
import {
  saveCategoryMyOfferPageNo,
  saveCategoryOffers,
  saveForAllOffers,
  saveMyOffer,
  saveMyOfferPageNo,
  saveSearchOfferArray,
  saveTotalCategoryMyOfferPagesCount,
  saveTotalMyOfferPagesCount,
} from '../../../store/reducers/OfferSlice';

export default Setting = props => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user.user);
  const { appLanguage, LocalizedStrings, setAppLanguage } =
    React.useContext(LocalizationContext);
  const [subscriptionObj, setSubscriptionObj] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toggle, setToggle] = useState(user?.isNotification);
  const [language, setLanguage] = useState(appLanguage === 'ar' ? true : false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const settingsArray = [
    // { id: 1, name: LocalizedStrings.complete_your_profile, onpress: () => props.navigation.navigate(routes.editProfile) },
    {
      id: 1,
      name: LocalizedStrings.edit_profile,
      onpress: () => props.navigation.navigate(routes.editProfile),
    },
    {
      id: 3,
      name: LocalizedStrings.my_preference,
      onpress: () =>
        props.navigation.navigate(routes.preferences, { key: 'settings' }),
    },
    { id: 4, name: LocalizedStrings.Notification },
    {
      id: 5,
      name: LocalizedStrings.change_language,
      //  onpress: () => props.navigation.navigate(routes.changeLanguage)
    },
    {
      id: 6,
      name: LocalizedStrings.change_password,
      onpress: () => props.navigation.navigate(routes.changePassword),
    },
    {
      id: 7,
      name: LocalizedStrings.terms_and_privacy,
      onpress: () => props.navigation.navigate(routes.terms),
    },
    {
      id: 8,
      name: LocalizedStrings.about_us,
      onpress: () => props.navigation.navigate(routes.aboutUs),
    },
    // { id: 9, name: LocalizedStrings.privacy, onpress: () => props.navigation.navigate(routes.privacyPolicy) },
    {
      id: 10,
      name: LocalizedStrings.contact_us,
      onpress: () => props.navigation.navigate(routes.contactUs),
    },
    { id: 11, name: LocalizedStrings.Logout, onpress: () => setLogoutModalVisible(true) },
    // { id: 12, name: LocalizedStrings.delete_account, onpress: () => props.navigation.navigate(routes.deletAccount) },
  ];

  // useFocusEffect(
  //     React.useCallback(() => {
  //         getSubscriptions() // Get User Subscription
  //         setToggle(user?.isNotification) // Get Notification is Enabled or Not?

  //         // Return a cleanup function if necessary
  //         return () => {
  //             console.log('Screen is unfocused, clean up here if needed');
  //         };
  //     }, []) // Dependency array is empty to run the effect only once when the component mounts
  // );

  useEffect(() => {
    getSubscriptions(); // Get User Subscription
    setToggle(user?.isNotification); // Get Notification is Enabled or Not?
  }, [user]);

  const getSubscriptions = () => {
    const onSuccess = response => {
      setIsLoading(false);
      console.log('res while getSubscriptions====>', response?.data);
      const dataArray = response?.data?.premium.filter(
        item => item.id == user?.subscriptionPlan,
      );
      setSubscriptionObj(dataArray);
    };

    const onError = error => {
      setIsLoading(false);
      console.log('error while getSubscriptions====>', error.message);
    };

    const method = Method.GET;
    const endPoint = routs.getSubscriptions;
    const bodyParams = {};

    setIsLoading(true);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  const handleLogoutConfirm = () => {
    setLogoutModalVisible(false);
    _logout();
  };

  const _logout = () => {
    const onSuccess = response => {
      setIsLoading(false);
      console.log('response _logout===', response);
      showMessage({ message: 'Logged Out Successfully!', type: 'danger' });

      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routes.auth, params: { screen: routes.login } }],
        })
      );

      setTimeout(() => {
        dispatch(logout());
        dispatch(saveFavourite(null));
        dispatch(saveMyOffer(null));
        dispatch(saveForAllOffers(null));
        dispatch(saveMyOfferPageNo(1));
        dispatch(saveTotalMyOfferPagesCount(1));
        dispatch(saveCategoryOffers(null));
        dispatch(saveSearchOfferArray(null));
        dispatch(saveTotalCategoryMyOfferPagesCount(1));
        dispatch(saveCategoryMyOfferPageNo(1));
      }, 1000);
    };

    const onError = error => {
      setIsLoading(false);
      console.log('Error _logout===', error);
      showMessage({ message: error?.message || 'Logout failed', type: 'danger' });
    };
    const endPoint = routs.logout;
    const method = Method.POST;
    const bodyParams = {
      device: { id: getDeviceId(), deviceToken: 'fcmToken' },
    };

    setIsLoading(true);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  const onChangeLng = async lng => {
    dispatch(saveFavourite(null));
    dispatch(saveMyOffer(null));
    dispatch(saveForAllOffers(null));
    dispatch(saveMyOfferPageNo(1));
    dispatch(saveTotalMyOfferPagesCount(1));
    dispatch(saveCategoryOffers(null));
    dispatch(saveSearchOfferArray(null));
    dispatch(saveTotalCategoryMyOfferPagesCount(1));
    dispatch(saveCategoryMyOfferPageNo(1));

    setLanguage(lng);
    if (lng === 'en') {
      I18nManager.forceRTL(false);
      setAppLanguage(lng);
      RNRestart.Restart();
      return;
    }
    if (lng === 'ar') {
      I18nManager.forceRTL(true);
      setAppLanguage(lng);
      RNRestart.Restart();
      return;
    }
  };

  const UpdateProfile = e => {
    const onSuccess = response => {
      console.log('Success while UpdateProfile====>', response);
      setIsLoading(false);
      dispatch(updateUser({ user: response?.data?.data }));
    };

    const onError = error => {
      setIsLoading(false);
      console.log('error while UpdateProfile====>', error);
    };

    const method = Method.PATCH;
    const endPoint = routs.updateProfile + `${user?._id}`;

    const body = {
      isNotification: e,
    };

    setIsLoading(true);
    callApi(method, endPoint, body, onSuccess, onError);
  };

  return (
    <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
      <Loader loading={isLoading} />
      <LogoHeader />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Image
          source={
            user && Object.values(user).length > 0 && user?.image
              ? { uri: user?.image }
              : appImages.profile1
          }
          style={[
            styles.imageStyle,
            { alignSelf: 'center', resizeMode: 'cover' },
          ]}
        />
        <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>
          {user && Object.values(user).length > 0 && user?.name}
        </Text>
        <Text style={styles.mainDes}>
          {user && Object.values(user).length > 0 && user?.email
            ? user?.email
            : `+${user?.number}`}
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            user.subscriptionPlan == 'not-subscribed'
              ? props.navigation.navigate(routes.subscription)
              : props.navigation.navigate(routes.subscriptionPlan, {
                subscribeArr: subscriptionObj,
              })
          }
          style={{
            borderColor: colors.borderColor,
            borderWidth: 1,
            padding: wp(4),
            marginTop: wp(4),
            marginBottom: wp(2),
            borderRadius: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={appImages.crown} style={styles.CrownImage} />
            {subscriptionObj.length > 0 ? (
              <View style={{ marginLeft: wp(3), alignItems: 'flex-start' }}>
                <Text style={[styles.packageText, { marginBottom: wp(2) }]}>
                  {subscriptionObj.length > 0 ? subscriptionObj[0]?.id : ''}
                </Text>
                <Text style={styles.mainTitle}>
                  {subscriptionObj.length > 0 ? subscriptionObj[0]?.price : ''}{' '}
                  {appLanguage === 'ar' ? 'ريال' : 'SAR'} /{' '}
                  {subscriptionObj.length > 0
                    ? subscriptionObj[0]?.duration
                    : ''}
                </Text>
              </View>
            ) : (
              <View style={{ marginLeft: wp(3), alignItems: 'flex-start' }}>
                <Text
                  style={[
                    {
                      fontSize: hp(2),
                      fontFamily: fontFamily.UrbanistSemiBold,
                      color: colors.BlackSecondary,
                      textAlign: 'left',
                    },
                  ]}>
                  Not Subscribed Yet!
                </Text>
              </View>
            )}
          </View>
          <AntDesign
            name={appLanguage == 'en' ? 'right' : 'left'}
            color={colors.BlackSecondary}
            size={wp(5)}
          />
        </TouchableOpacity>

        <View style={styles.line} />

        <FlatList
          data={settingsArray}
          keyExtractor={(item, index) => index}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.5}
                onPress={item.onpress}
                style={[
                  appStyles.rowBtw,
                  { marginTop: index > 0 ? wp(6) : wp(3) },
                ]}>
                <Text style={[styles.mainText]}>
                  {`${item.name}`}
                  {/* <Text style={{ fontFamily: fontFamily.UrbanistMedium, color: colors.descriptionColor }}>{index > 0 ? '' : `20% ${LocalizedStrings.Complete}`}</Text> */}
                  <Text
                    style={{
                      fontFamily:
                        appLanguage == 'en'
                          ? fontFamily.UrbanistBold
                          : fontFamily.UrbanistMedium,
                      color:
                        appLanguage == 'en'
                          ? colors.primaryColor
                          : colors.descriptionColor,
                    }}>
                    {item.name == LocalizedStrings.change_language ? '(En' : ''}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fontFamily.UrbanistMedium,
                      color: colors.descriptionColor,
                    }}>
                    {item.name == LocalizedStrings.change_language ? '/' : ''}
                  </Text>
                  <Text
                    style={{
                      fontFamily:
                        appLanguage == 'ar'
                          ? fontFamily.UrbanistBold
                          : fontFamily.UrbanistMedium,
                      color:
                        appLanguage == 'ar'
                          ? colors.primaryColor
                          : colors.descriptionColor,
                    }}>
                    {item.name == LocalizedStrings.change_language ? 'Ar)' : ''}
                  </Text>

                </Text>

                {item.name === LocalizedStrings.Notification ? (
                  <ToggleSwitch
                    isOn={toggle}
                    onColor={colors.primaryColor}
                    offColor={colors.borderColor}
                    labelStyle={{ display: 'none' }}
                    size="small"
                    onToggle={e => [setToggle(e), UpdateProfile(e)]}
                  />
                ) : item.name == LocalizedStrings.change_language ? (
                  <ToggleSwitch
                    isOn={language}
                    onColor={colors.primaryColor}
                    offColor={colors.borderColor}
                    labelStyle={{ display: 'none' }}
                    size="small"
                    onToggle={e => onChangeLng(e ? 'ar' : 'en')}
                  />
                ) : (
                  <AntDesign
                    name={appLanguage == 'en' ? 'right' : 'left'}
                    color={colors.BlackSecondary}
                    size={wp(4)}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </ScrollView>

      <CallModal
        modalShow={logoutModalVisible}
        setModalShow={() => setLogoutModalVisible(false)}
        warningImage={appImages.warning}
        title={LocalizedStrings.logout_confirmation || 'Logout Confirmation'}
        subTitle={LocalizedStrings.logout_confirmation_message || 'Are you sure you want to logout?'}
        showButtons={true}
        confirmText={LocalizedStrings.yes || 'Yes'}
        cancelText={LocalizedStrings.no || 'No'}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: hp(1.8),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.BlackSecondary,
    textAlign: 'center',
  },
  mainDes: {
    fontSize: hp(1.4),
    fontFamily: fontFamily.UrbanistRegular,
    color: colors.descriptionColor,
    textAlign: 'center',
  },
  mainText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.BlackSecondary,
    textAlign: 'left',
  },
  packageText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.descriptionColor,
    textAlign: 'left',
  },
  imageStyle: {
    width: wp(25),
    height: wp(25),
    resizeMode: 'contain',
    borderRadius: widthPixel(100),
    borderColor: '#cccccc',
    borderWidth: 2,
  },
  CrownImage: {
    width: wp(15),
    height: wp(15),
    resizeMode: 'contain',
    borderRadius: widthPixel(100),
  },
  line: {
    borderColor: colors.borderColor,
    borderWidth: 0.5,
    width: wp(90),
    marginVertical: wp(2),
  },
  languageText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.BlackSecondary,
    lineHeight: 24,
    textAlign: 'left',
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
    width: wp(3.5),
    height: wp(3.5),
    borderRadius: 50,
  },
});
