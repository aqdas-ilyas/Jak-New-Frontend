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
  ActivityIndicator,
  StatusBar,
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
import { useRTL } from '../../../language/useRTL';
import { logout, updateUser, saveBiometricEnabled, saveLoginRemember } from '../../../store/reducers/userDataSlice';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useDispatch, useSelector } from 'react-redux';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { getDeviceId } from 'react-native-device-info';
import { Loader } from '../../../components/loader/Loader';
import { showMessage } from 'react-native-flash-message';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { resolveMessage } from '../../../language/helpers';

export default Setting = props => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user.user);
  const biometricEnabled = useSelector(state => state?.user?.biometricEnabled || false);
  const { appLanguage, LocalizedStrings, setAppLanguage } =
    React.useContext(LocalizationContext);
  const { isRTL, rtlStyles } = useRTL();
  const [subscriptionObj, setSubscriptionObj] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [toggle, setToggle] = useState(user?.isNotification);
  const [language, setLanguage] = useState(isRTL);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const settingsArray = [
    // { id: 1, name: LocalizedStrings.complete_your_profile, onpress: () => props.navigation.navigate(routes.editProfile) },
    {
      id: 1,
      name: LocalizedStrings.edit_profile,
      onpress: () => props.navigation.navigate(routes.editProfile),
    },
    // {
    //   id: 3,
    //   name: LocalizedStrings.my_preference,
    //   onpress: () =>
    //     props.navigation.navigate(routes.preferences, { key: 'settings' }),
    // },
    // { id: 4, name: LocalizedStrings.Notification },
    {
      id: 5,
      name: LocalizedStrings.change_language,
      onpress: () => onChangeLng(appLanguage == 'en' ? 'ar' : 'en')
      //  onpress: () => props.navigation.navigate(routes.changeLanguage)
    },
    {
      id: 6,
      name: LocalizedStrings.change_password,
      onpress: () => props.navigation.navigate(routes.changePassword),
    },
    {
      id: 7,
      name: LocalizedStrings.terms,
      onpress: () => props.navigation.navigate(routes.termsConditions),
    },
    {
      id: 8,
      name: LocalizedStrings.privacy,
      onpress: () => props.navigation.navigate(routes.privacyPolicy),
    },
    {
      id: 9,
      name: LocalizedStrings.about_us,
      onpress: () => props.navigation.navigate(routes.aboutUs),
    },
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
    checkBiometricAvailability(); // Check biometric availability
  }, [user]);

  // Check biometric availability
  const checkBiometricAvailability = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      console.log('Biometric available:', available, 'Type:', biometryType);
      setBiometricAvailable(available);
    } catch (error) {
      console.log('Biometric check error:', error);
      setBiometricAvailable(false);
    }
  };

  // Handle biometric toggle
  const handleBiometricToggle = async (value) => {
    if (value) {
      // Enable biometric authentication
      try {
        const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

        // Check if biometric is available first
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        console.log('Biometric check - Available:', available, 'Type:', biometryType);

        if (!available) {
          showMessage({
            message: 'Biometric authentication is not available on this device',
            type: 'danger',
          });
          return;
        }

        console.log('Starting biometric authentication for settings...');
        const { success, error } = await rnBiometrics.simplePrompt({
          promptMessage: LocalizedStrings.biometric_prompt_message || 'Authenticate to enable biometric login',
          cancelButtonText: LocalizedStrings.cancel || 'Cancel',
        });

        console.log('Biometric result - Success:', success, 'Error:', error);

        if (success) {
          dispatch(saveLoginRemember(true));
          dispatch(saveBiometricEnabled(true));
          updateBiometricSetting(true);
          showMessage({
            message: LocalizedStrings.biometric_enabled || 'Biometric authentication enabled',
            type: 'success',
          });
        } else {
          // Handle different failure scenarios
          if (error && error.includes('UserCancel')) {
            showMessage({
              message: 'Biometric authentication was cancelled',
              type: 'info',
            });
          } else if (error && error.includes('BiometryNotAvailable')) {
            showMessage({
              message: 'Biometric authentication is not available',
              type: 'danger',
            });
          } else if (error && error.includes('BiometryNotEnrolled')) {
            showMessage({
              message: 'No biometric data enrolled. Please set up biometric authentication in device settings.',
              type: 'danger',
            });
          } else {
            showMessage({
              message: 'Biometric authentication failed. Please try again.',
              type: 'danger',
            });
          }
        }
      } catch (error) {
        console.log('Biometric authentication catch error:', error);

        // Handle specific error types
        if (error.message && error.message.includes('UserCancel')) {
          showMessage({
            message: 'Biometric authentication was cancelled',
            type: 'info',
          });
        } else if (error.message && error.message.includes('BiometryNotAvailable')) {
          showMessage({
            message: 'Biometric authentication is not available on this device',
            type: 'danger',
          });
        } else if (error.message && error.message.includes('BiometryNotEnrolled')) {
          showMessage({
            message: 'No biometric data enrolled. Please set up biometric authentication in device settings.',
            type: 'danger',
          });
        } else {
          showMessage({
            message: LocalizedStrings.biometric_error || 'Failed to enable biometric authentication',
            type: 'danger',
          });
        }
      }
    } else {
      // Disable biometric authentication
      dispatch(saveBiometricEnabled(false));
      updateBiometricSetting(false);
      showMessage({
        message: LocalizedStrings.biometric_disabled || 'Biometric authentication disabled',
        type: 'info',
      });
    }
  };

  // Update biometric setting in backend
  const updateBiometricSetting = (enabled) => {
    const onSuccess = response => {
      console.log('Biometric setting updated:', response);
    };

    const onError = error => {
      console.log('Error updating biometric setting:', error);
    };

    const endPoint = routs.updateProfile;
    const method = Method.PATCH;
    const bodyParams = {
      biometricEnabled: enabled,
    };

    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

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
      showMessage({ message: resolveMessage(LocalizedStrings, response?.message, LocalizedStrings.logged_out_successfully), type: 'success' });

      setTimeout(async () => {
        props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routes.auth, params: { screen: routes.welcome } }],
          })
        );

        setTimeout(async () => {
          dispatch(logout());
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
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
      }, 1000);
    };

    const onError = error => {
      setIsLoading(false);
      console.log('Error _logout===', error);
      showMessage({ message: resolveMessage(LocalizedStrings, error?.message, LocalizedStrings.logout_failed), type: 'danger' });
    };
    const endPoint = routs.logout;
    const method = Method.POST;
    const bodyParams = {
      device: { id: getDeviceId(), deviceToken: 'fcmToken' },
    };

    // setIsLoading(true);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  useEffect(() => {
    setLanguage(isRTL);
  }, [isRTL]);

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

    setLanguage(lng === 'ar');
    setAppLanguage(lng);
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
    <>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={Platform.OS === 'android' ? '#fff' : undefined}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView style={[appStyles.safeContainer, { marginHorizontal: wp(4) }]}>
        <Loader loading={isLoading} />
        <LogoHeader />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
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
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.imageLoaderContainer}>
                <ActivityIndicator
                  size="small"
                  color={colors.primaryColor}
                />
              </View>
            )}
          </View>
          <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>
            {user && Object.values(user).length > 0 && user?.name}
          </Text>
          <Text style={[styles.mainDes]}>
            {user && Object.values(user).length > 0 && user?.email
              ? user?.email
              : `+${user?.number}`}
          </Text>

          {/* <TouchableOpacity
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
                  {appLanguage === 'ar' ? 'ريال' : 'SAR'}
                </Text>
              </View>
            ) : (
              <View style={{ marginLeft: wp(3), alignItems: 'flex-start' }}>
                <Text
                  style={{
                    fontSize: hp(2),
                    fontFamily: fontFamily.UrbanistSemiBold,
                    color: colors.BlackSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                  }}>
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
        </TouchableOpacity> */}

          <View style={styles.line} />

          <FlatList
            data={settingsArray}
            keyExtractor={(item, index) => index}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={item.onpress}
                  style={[
                    appStyles.rowBtw,
                    rtlStyles.rowBetween,
                    {
                      paddingTop: index > 0 ? wp(6) : wp(3),
                      paddingBottom: index > settingsArray.length - 2 ? wp(6) : 0
                    },
                  ]}>
                  <Text style={[styles.mainText, rtlStyles.textAlign, rtlStyles.writingDirection]}>
                    {`${item.name}`}
                    <Text
                      style={{
                        fontFamily: !isRTL
                          ? fontFamily.UrbanistBold
                          : fontFamily.UrbanistMedium,
                        color: !isRTL
                          ? colors.primaryColor
                          : colors.descriptionColor,
                      }}>
                      {item.name == LocalizedStrings.change_language ? ' (En' : ''}
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
                        fontFamily: isRTL
                          ? fontFamily.UrbanistBold
                          : fontFamily.UrbanistMedium,
                        color: isRTL
                          ? colors.primaryColor
                          : colors.descriptionColor,
                      }}>
                      {item.name == LocalizedStrings.change_language ? 'Ar) ' : ''}
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
                      name={!isRTL ? 'right' : 'left'}
                      color={colors.BlackSecondary}
                      size={wp(4)}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />

          {/* Biometric Authentication Section */}
          {biometricAvailable && (
            <View style={[styles.biometricSection, rtlStyles.row, { justifyContent: "space-between" }]}>
              <View style={[styles.biometricTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.biometricTitle, rtlStyles.textAlign, rtlStyles.writingDirection]}>
                  🔐 {LocalizedStrings.biometric_login || 'Biometric Login'}
                </Text>
                <Text style={[styles.biometricDescription, rtlStyles.textAlign, rtlStyles.writingDirection]}>
                  {LocalizedStrings.biometric_description || 'Use your fingerprint or face to quickly and securely access your account'}
                </Text>
              </View>

              <View style={styles.biometricToggleContainer}>
                <ToggleSwitch
                  isOn={biometricEnabled}
                  onColor={colors.primaryColor}
                  offColor={colors.grayColor}
                  size="medium"
                  onToggle={handleBiometricToggle}
                  disabled={!biometricAvailable}
                />
              </View>
            </View>
          )}
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
    </>
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

    marginBottom: wp(2)
  },
  mainText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.BlackSecondary,
  },
  packageText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.descriptionColor,
  },
  imageContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  imageStyle: {
    width: wp(25),
    height: wp(25),
    resizeMode: 'contain',
    borderRadius: widthPixel(100),
    borderColor: '#cccccc',
    borderWidth: 2,
  },
  imageLoaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: widthPixel(100),
    justifyContent: 'center',
    alignItems: 'center',
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
  biometricSection: {
    // alignItems: 'center',
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
  biometricLeftSection: {
    // alignItems: 'center',
    flex: 1,
  },
  biometricTextContainer: {
    flex: 1,
    alignItems: "flex-start"
  },
  biometricTitle: {
    fontSize: hp(1.8),
    fontFamily: fontFamily.UrbanistBold,
    color: colors.BlackSecondary,
    marginBottom: hp(0.5),
  },
  biometricDescription: {
    fontSize: hp(1.4),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.descriptionColor,
    lineHeight: hp(2),
  },
  biometricToggleContainer: {
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
