import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  I18nManager,
  FlatList,
  StatusBar,
  ScrollView,
} from 'react-native';
import {
  colors,
  hp,
  fontFamily,
  wp,
  routes,
  heightPixel,
  widthPixel,
  emailFormat,
  passwordFormat,
} from '../../../services';
import { appIcons, appImages } from '../../../services/utilities/assets';
import appStyles from '../../../services/utilities/appStyles';
import Button from '../../../components/button';
import Header from '../../../components/header';
import { Input } from '../../../components/input';
import CheckBox from '@react-native-community/checkbox';
import { LocalizationContext } from '../../../language/LocalizationContext';
import RNRestart from 'react-native-restart'; // Import package from node modules
import ToggleSwitch from 'toggle-switch-react-native';
import { showMessage } from 'react-native-flash-message';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { getDeviceId } from 'react-native-device-info';
import { Loader } from '../../../components/loader/Loader';
import { useDispatch } from 'react-redux';
import {
  saveLoginRemember,
  saveNumberLogin,
  setToken,
  updateUser,
} from '../../../store/reducers/userDataSlice';
import {
  googleLoginData,
  _fetchCountryAbbrevicationCode,
} from '../../../services/helpingMethods';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import CountryInput from '../../../components/countryPicker/CountryPicker';
import { isPossibleNumber } from 'libphonenumber-js';

const SignIn = props => {
  const dispatch = useDispatch();
  const { appLanguage, LocalizedStrings, setAppLanguage } = useContext(LocalizationContext);

  const [email, setEmail] = useState('');
  const [Phone, setPhone] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('966');
  const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('SA');
  const [allowPhone, setAllowPhone] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch and set the State's
  const fetchCountryAbbrivaition = async code => {
    try {
      const country = await _fetchCountryAbbrevicationCode(code);
      setCountryAbbrivaitionCode(country);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (countryCode != '') {
      fetchCountryAbbrivaition(countryCode);
    } else {
      fetchCountryAbbrivaition('SA');
    }
  }, [countryCode]);

  // Language Change
  const [language, setLanguage] = useState(appLanguage === 'ar' ? true : false);
  const onChangeLng = async lng => {
    setLanguage(lng);
    if (lng === 'en') {
      setAppLanguage(lng);
      I18nManager.forceRTL(false);
      RNRestart.Restart();
      return;
    }
    if (lng === 'ar') {
      setAppLanguage(lng);
      I18nManager.forceRTL(true);
      RNRestart.Restart();
      return;
    }
  };

  // Validate Login Inputs
  const validateInputs = () => {
    const emailValue = emailFormat.test(email) || email === ' ' ? true : false;

    const passValue =
      passwordFormat.test(password) || password === ' ' ? true : false;

    // if (!emailValue) {
    // showMessage({ message: "Invalid Email", type: "danger" });
    // return false;
    // }

    if (!isPossibleNumber(`+${countryCode}` + phoneNumber)) {
      showMessage({ message: 'Invalid Phone Number', type: 'danger' });
      return false;
    }

    if (password.length < 4) {
      showMessage({ message: 'Please enter a strong password', type: 'danger' });
      return false;
    }
    // if (!passValue) {
    //     showMessage({ message: "Please enter a strong password (Containing A-Z + a-z + 0-9)", type: "danger", });
    //     return false;
    // }
    return true;
  };
  const SignInAfterValidation = () => {
    if (validateInputs()) {
      const onSuccess = response => {
        setIsLoading(false);
        console.log('res while login====>', response);
        showMessage({ message: response?.message, type: 'success' });
        dispatch(updateUser(response?.data));
        dispatch(
          setToken({
            token: response?.data?.token,
            refreshToken: response?.data?.refreshToken,
          }),
        );
        dispatch(saveLoginRemember(toggleCheckBox));
        dispatch(saveNumberLogin(true));

        if (response?.act === 'login-granted') {
          props.navigation.navigate(routes.tab, { screen: routes.home });
        } else if (response?.act === 'incomplete-profile') {
          props?.navigation?.navigate(routes.createProfile, {
            number: `${countryCode + phoneNumber}`,
          });
        } else if (response?.act === 'incomplete-preferences') {
          if (!response?.data?.user?.isPreferencesSkipped) {
            props?.navigation?.navigate(routes.preferences);
          } else {
            if (response?.act == 'admin-pending') {
              props.navigation.navigate(routes.tab, { screen: routes.home });
              // props?.navigation?.navigate(routes.preferences);
              // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
            } else if (response?.act == 'incomplete-subscription') {
              props?.navigation?.navigate(routes.subscription);
              showMessage({
                message: 'You are not subscribed yet!',
                type: 'danger',
              });
            }
          }
        } else if (response?.act == 'admin-pending') {
          props.navigation.navigate(routes.tab, { screen: routes.home });
          // props?.navigation?.navigate(routes.preferences);
          // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
        } else if (response?.act == 'incomplete-subscription') {
          props?.navigation?.navigate(routes.subscription);
          showMessage({ message: 'You are not subscribed yet!', type: 'danger' });
        }
      };

      const onError = error => {
        setIsLoading(false);
        console.log('error while login====>', error);
        showMessage({ message: error?.message, type: 'danger' });

        if (error?.errorType == 'number-not-verify') {
          props.navigation.navigate(routes.otp, {
            number: `${countryCode + phoneNumber}`,
            key: 'auth',
          });
        }
      };

      const endPoint = routs.signIn;
      const method = Method.POST;
      const bodyParams = {
        number: `${countryCode + phoneNumber}`,
        password: password,
        language: appLanguage == 'en' ? 'english' : 'arabic',
        device: { id: getDeviceId(), deviceToken: 'fcmToken' },
      };

      console.log('SignInAfterValidation:- ', bodyParams);

      setIsLoading(true);
      callApi(method, endPoint, bodyParams, onSuccess, onError);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '773361963603-cv2gjtb7ni4or5i5vpudlmao8b90k1do.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const googleLoginClicked = async () => {
    let info = await googleLoginData();
    if (info.Error === undefined) {
      console.log('Google info => ', info?.Data?.userInfo?.user);
      handleSociallogin(info?.Data?.userInfo?.user);
    } else {
      console.log(JSON.stringify(info.Error));
    }
  };

  const handleSociallogin = user => {
    const onSuccess = response => {
      setIsLoading(false);
      console.log('res while handleSociallogin====>', response);
      showMessage({ message: response?.message, type: 'success' });
      dispatch(updateUser(response?.data));
      dispatch(
        setToken({
          token: response?.data?.token,
          refreshToken: response?.data?.refreshToken,
        }),
      );
      dispatch(saveLoginRemember(true));

      if (response?.act === 'login-granted') {
        props.navigation.navigate(routes.tab, { screen: routes.home });
      } else if (response?.act === 'email-unverified') {
        props.navigation.navigate(routes.otp, {
          email: user?.email.toLowerCase(),
          key: 'auth',
        });
      } else if (response?.act === 'incomplete-profile') {
        props?.navigation?.navigate(routes.createProfile, {
          email: user?.email.toLowerCase(),
        });
      } else if (response?.act === 'incomplete-preferences') {
        if (!response?.data?.user?.isPreferencesSkipped) {
          props?.navigation?.navigate(routes.preferences);
        } else {
          if (response?.act == 'admin-pending') {
            // props?.navigation?.navigate(routes.preferences);
            props.navigation.navigate(routes.tab, { screen: routes.home });
            // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
          } else if (response?.act == 'incomplete-subscription') {
            props?.navigation?.navigate(routes.subscription);
            showMessage({
              message: 'You are not subscribed yet!',
              type: 'danger',
            });
          }
        }
      } else if (response?.act == 'admin-pending') {
        // props?.navigation?.navigate(routes.preferences);
        props.navigation.navigate(routes.tab, { screen: routes.home });
        // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
      } else if (response?.act == 'incomplete-subscription') {
        props?.navigation?.navigate(routes.subscription);
        showMessage({ message: 'You are not subscribed yet!', type: 'danger' });
      }
    };

    const onError = error => {
      setIsLoading(false);
      console.log('error while handleSociallogin====>', error);
      showMessage({ message: error?.message, type: 'danger' });

      if (error?.errorType == 'email-not-verify') {
        props.navigation.navigate(routes.otp, {
          email: user?.email.toLowerCase(),
          key: 'auth',
        });
      }
    };

    const endPoint = routs.socialLogin;
    const method = Method.POST;
    const bodyParams = {
      email: user?.email.toLowerCase(),
      device: { id: getDeviceId(), deviceToken: 'fcmToken' },
    };

    setIsLoading(true);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  return (
    <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
      <Loader loading={isLoading} />
      <StatusBar barStyle={'dark-content'} backgroundColor="#fff" />

      <Header leftIcon onleftIconPress={() => props.navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        bounces={false}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>
          {LocalizedStrings['Welcome Back!']}
        </Text>
        <Text style={styles.mainDes}>
          {LocalizedStrings['Login and manage your Jak Mobile App account.']}
        </Text>
        <View>
          {/* {
                        allowPhone ? (
                            <CountryInput
                                phoneNumber={phoneNumber}
                                countryCode={countryCode}
                                countryAbbreviationCode={countryAbbreviationCode}
                                setValue={setPhoneNumber}
                                setSelectedCode={setCountryCode}
                                layout={'first'}
                                rghtText={'Use Email Address'}
                                onrightTextPress={() => setAllowPhone(!allowPhone)}
                            />
                        )
                            : (
                                <Input
                                    placeholder={LocalizedStrings.email}
                                    value={email}
                                    onChangeText={(value) => setEmail(value)}
                                    leftIcon={appIcons.message}
                                    rghtText={'Use Phone Number'}
                                    onrightTextPress={() => [setCountryCode('966'), setCountryAbbrivaitionCode('SA'), setAllowPhone(!allowPhone)]}
                                >
                                    {LocalizedStrings.email}
                                </Input>
                            )
                    } */}

          <CountryInput
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            countryAbbreviationCode={countryAbbreviationCode}
            setValue={setPhoneNumber}
            setSelectedCode={setCountryCode}
            layout={'first'}
          />

          <Input
            placeholder={LocalizedStrings.password}
            secureTextEntry={showPassword}
            onPressEye={() => setShowPassword(!showPassword)}
            value={password}
            onChangeText={value => setPassword(value)}
            eye={true}
            leftIcon={appIcons.lock}>
            {LocalizedStrings.password}
          </Input>
        </View>

        <View style={[appStyles.rowBtw, { marginVertical: wp(5) }]}>
          <View style={[appStyles.row, { paddingLeft: wp(1) }]}>
            <CheckBox
              disabled={false}
              onFillColor={colors.primaryColor}
              onCheckColor="white"
              value={toggleCheckBox}
              onValueChange={newValue => setToggleCheckBox(newValue)}
              boxType="square"
              onTintColor={colors.primaryColor}
              style={styles.checbox}
              hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }}
              tintColors={{
                true: colors.primaryColor,
                false: colors.placeholderColor,
              }} // Change tint colors if needed
            />
            <Text style={styles.rememberMe}>
              {LocalizedStrings.remember_me}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => props.navigation.navigate(routes.forgotPassword)}>
            <Text style={styles.forgotPassword}>
              {LocalizedStrings['Forgot Password?']}
            </Text>
          </TouchableOpacity>
        </View>

        <View activeOpacity={0.5} style={[appStyles.rowBtw]}>
          <Text style={[styles.mainText]}>
            {`${LocalizedStrings.Language}  (`}
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
              {'En'}
            </Text>
            <Text
              style={{
                fontFamily: fontFamily.UrbanistMedium,
                color: colors.descriptionColor,
              }}>
              {'/'}
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
              {'Ar'}
            </Text>
            {')'}
          </Text>
          <ToggleSwitch
            isOn={language}
            onColor={colors.primaryColor}
            offColor={colors.borderColor}
            labelStyle={{ display: 'none' }}
            size="small"
            onToggle={e => onChangeLng(e ? 'ar' : 'en')}
          />
        </View>

        <View style={[appStyles.rowCenter, appStyles.mt10]}>
          <Text style={styles.dontAccountTextStyle}>
            {LocalizedStrings['Don’t have an account?']}{' '}
          </Text>
          <TouchableOpacity
            onPress={() => props.navigation.navigate(routes.register)}>
            <Text style={styles.dontAccountSignUpTextStyle}>
              {LocalizedStrings['SIGN UP']}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            appStyles.rowCenter,
            { marginTop: wp(10), marginBottom: wp(5) },
          ]}>
          <View style={styles.line} />
          <Text style={styles.orTextStyle}>
            {LocalizedStrings['Or Continue with']}
          </Text>
          <View style={styles.line} />
        </View>
        <View style={[appStyles.row, appStyles.jcSpaceEvenly]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => googleLoginClicked()}
            style={styles.socialLoginTopView}>
            <Image source={appIcons.google} style={styles.socialIconStyle} />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.socialLoginTopView}>
                        <Image source={appIcons.facebook} style={styles.socialIconStyle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialLoginTopView]}>
                        <Image source={appIcons.apple} style={styles.socialIconStyle} />
                    </TouchableOpacity> */}
        </View>
      </ScrollView>

      <View style={[appStyles.ph20, appStyles.mb5]}>
        <Button onPress={() => SignInAfterValidation()}>
          {LocalizedStrings.Login}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  mainText: {
    fontSize: hp(1.4),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.BlackSecondary,
    textAlign: 'left',
  },
  mainTitle: {
    fontSize: hp(2.4),
    fontFamily: fontFamily.UrbanistBold,
    color: colors.BlackSecondary,
    marginTop: wp(5),
    textAlign: 'left',
  },
  mainDes: {
    fontSize: hp(1.8),
    fontFamily: fontFamily.UrbanistRegular,
    color: colors.descriptionColor,
    marginTop: wp(5),
    textAlign: 'left',
  },
  forgotPassword: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.primaryColor,
    textAlign: 'left',
  },
  rememberMe: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.BlackSecondary,
    marginLeft: wp(1.5),
  },
  dontAccountTextStyle: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistRegular,
    color: colors.descriptionColor,
  },
  dontAccountSignUpTextStyle: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: '#625984',
  },
  socialLoginTopView: {
    borderColor: colors.borderColor,
    borderWidth: 1,
    paddingHorizontal: wp(6),
    paddingVertical: wp(2.5),
    borderRadius: 15,
  },
  socialIconStyle: {
    width: wp(8),
    height: wp(8),
    resizeMode: 'contain',
  },
  orTextStyle: {
    textAlign: 'center',
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.placeholderColor,
  },
  line: {
    borderColor: colors.borderColor,
    borderWidth: 0.5,
    width: wp(28),
    marginHorizontal: wp(3),
  },
  checbox: {
    height: Platform.OS == 'ios' ? heightPixel(15) : heightPixel(20),
    width: Platform.OS == 'ios' ? widthPixel(15) : widthPixel(30),
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
