import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, } from 'react-native';
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, emailFormat, passwordFormat, } from '../../../services';
import { appIcons } from '../../../services/utilities/assets';
import appStyles from '../../../services/utilities/appStyles';
import Button from '../../../components/button';
import Header from '../../../components/header';
import { Input } from '../../../components/input';
import { LocalizationContext } from '../../../language/LocalizationContext';
import { useRTL } from '../../../language/useRTL';
import { showMessage } from 'react-native-flash-message';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { getDeviceId } from 'react-native-device-info';
import { Loader } from '../../../components/loader/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { saveLoginRemember, saveNumberLogin, setToken, updateUser, saveCredentials } from '../../../store/reducers/userDataSlice';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { googleLoginData, _fetchCountryAbbrevicationCode } from '../../../services/helpingMethods';
import CountryInput from '../../../components/countryPicker/CountryPicker';
import { isPossibleNumber } from 'libphonenumber-js';
import { decodeJWT } from '../../../common/HelpingFunc';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { resolveMessage } from '../../../language/helpers';
import CheckBox from '@react-native-community/checkbox';

const SignUp = props => {
  const dispatch = useDispatch();
  const biometricEnabled = useSelector(state => state?.user?.biometricEnabled || false);
  const { appLanguage, LocalizedStrings } = useContext(LocalizationContext);
  const { rtlStyles, isRTL } = useRTL();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('966');
  const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('SA');
  const [acceptPolicies, setAcceptPolicies] = useState(false);

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

  // Validate Login Inputs
  const validateInputs = () => {
    if (!isPossibleNumber(`+${countryCode}` + phoneNumber)) {
      showMessage({ message: LocalizedStrings.invalid_phone_number, type: 'danger' });
      return false;
    }

    if (password.length < 4) {
      showMessage({ message: LocalizedStrings.please_enter_strong_password, type: 'danger' });
      return false;
    }

    if (password !== confirmPassword) {
      showMessage({ message: LocalizedStrings.password_not_matched, type: 'danger' });
      return false;
    }
    if (!acceptPolicies) {
      showMessage({
        message:
          LocalizedStrings.accept_terms_privacy_error ||
          'Please accept the terms & conditions and privacy policy',
        type: 'danger',
      });
      return false;
    }
    return true;
  };
  const SignUpAfterValidation = () => {
    if (validateInputs()) {
      const onSuccess = response => {
        setIsLoading(false);
        console.log('res while signup====>', response);
        showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: 'success' });

        dispatch(saveNumberLogin(true));

        // Save credentials for biometric login if biometric is enabled
        if (biometricEnabled) {
          dispatch(saveCredentials({
            loginType: 'phone',
            phoneNumber: phoneNumber,
            countryCode: countryCode,
            password: password,
            email: null,
            googleEmail: null,
            appleEmail: null,
          }));
        }

        if (response?.success) {
          dispatch(updateUser(response?.data));
          props.navigation.navigate(routes.otp, {
            number: `${countryCode + phoneNumber}`,
            key: 'auth',
          });
        }
      };

      const onError = error => {
        setIsLoading(false);
        console.log('error while signup====>', error);
        showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: 'danger' });
      };

      const endPoint = routs.signUp;
      const method = Method.POST;
      const bodyParams = {
        number: `${countryCode + phoneNumber}`,
        password: password,
        language: appLanguage == 'en' ? 'english' : 'arabic',
        device: { id: getDeviceId(), deviceToken: 'fcmToken' },
      };

      console.log('SignUpAfterValidation:- ', bodyParams);

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
      showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: 'success' });
      dispatch(updateUser(response?.data));
      dispatch(
        setToken({
          token: response?.data?.token,
          refreshToken: response?.data?.refreshToken,
        }),
      );
      // dispatch(saveLoginRemember(true));

      // Save credentials for biometric login if biometric is enabled
      if (biometricEnabled) {
        dispatch(saveCredentials({
          loginType: 'google',
          phoneNumber: null,
          countryCode: null,
          password: null,
          email: null,
          googleEmail: user?.email,
          appleEmail: null,
        }));
      }

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
      } else {
        props.navigation.navigate(routes.tab, { screen: routes.home });
      }
      // else if (response?.act === 'incomplete-preferences') {
      //   if (!response?.data?.user?.isPreferencesSkipped) {
      //     props?.navigation?.navigate(routes.preferences);
      //   } else {
      //     if (response?.act == 'admin-pending') {
      //       props.navigation.navigate(routes.tab, { screen: routes.home });

      //       // props?.navigation?.navigate(routes.preferences);
      //       // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
      //     } else if (response?.act == 'incomplete-subscription') {
      //       props?.navigation?.navigate(routes.subscription);
      //       showMessage({
      //         message: 'You are not subscribed yet!',
      //         type: 'danger',
      //       });
      //     }
      //   }
      // } else if (response?.act == 'admin-pending') {
      //   props.navigation.navigate(routes.tab, { screen: routes.home });
      //   // props?.navigation?.navigate(routes.preferences);
      //   // showMessage({ message: 'Admin Not Approved yet!', type: 'danger' })
      // } else if (response?.act == 'incomplete-subscription') {
      //   props?.navigation?.navigate(routes.subscription);
      //   showMessage({ message: 'You are not subscribed yet!', type: 'danger' });
      // }
    };

    const onError = error => {
      setIsLoading(false);
      console.log('error while handleSociallogin====>', error);
      showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: 'danger' });

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

  const onAppleButtonPress = async () => {
    try {
      // Perform the login request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Get credential state for the user
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      if (credentialState === appleAuth.State.AUTHORIZED) {

        // Decode identity token
        const decodedToken = await decodeJWT(appleAuthRequestResponse?.identityToken);

        console.log('Decoded Token: ', decodedToken);

        const { email, email_verified, sub } = decodedToken;

        console.log('Email:', email);
        console.log('Email Verified:', email_verified);
        console.log('Sub:', sub);

        if (email) {
          // Save credentials for biometric login if biometric is enabled
          if (biometricEnabled) {
            dispatch(saveCredentials({
              loginType: 'apple',
              phoneNumber: null,
              countryCode: null,
              password: null,
              email: null,
              googleEmail: null,
              appleEmail: email,
            }));
          }
          // Handle successful login and save user data
          handleSociallogin({ email: email, userFirstName: appleAuthRequestResponse?.fullName?.givenName, userLastName: appleAuthRequestResponse?.fullName?.familyName })
        }
        // e.g., call your backend with the token or user info
      } else {
        console.log('User not authorized');
      }
    } catch (error) {
      console.error('Apple Sign-In Error: ', error);
    }
  }

  return (
    <SafeAreaView style={[appStyles.safeContainer, rtlStyles.writingDirection, { margin: wp(4) }]}>
      <Loader loading={isLoading} />
      <Header leftIcon onleftIconPress={() => props.navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        bounces={false}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.mainTitle, rtlStyles.textAlign, rtlStyles.writingDirection]}>
          {LocalizedStrings['Create Your Account']}
        </Text>

        <View>
          <CountryInput
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            countryAbbreviationCode={countryAbbreviationCode}
            setValue={setPhoneNumber}
            setSelectedCode={setCountryCode}
            layout={'second'}
          />

          <Input
            placeholder={LocalizedStrings['password']}
            secureTextEntry={showPassword}
            onPressEye={() => setShowPassword(!showPassword)}
            value={password}
            onChangeText={value => setPassword(value)}
            eye={true}
            leftIcon={appIcons.lock}>
            {LocalizedStrings['password']}
          </Input>

          <Input
            placeholder={LocalizedStrings['password']}
            secureTextEntry={showConfirmPassword}
            onPressEye={() => setShowConfirmPassword(!showConfirmPassword)}
            value={confirmPassword}
            onChangeText={value => setConfirmPassword(value)}
            eye={true}
            leftIcon={appIcons.lock}>
            {LocalizedStrings['Re-Enter Password']}
          </Input>
        </View>

        <View style={[styles.termsRow, rtlStyles.row, { marginTop: wp(4) }]}>
          <CheckBox
            value={acceptPolicies}
            onValueChange={setAcceptPolicies}
            boxType="square"
            onFillColor={colors.primaryColor}
            onCheckColor="white"
            onTintColor={colors.primaryColor}
            tintColors={{ true: colors.primaryColor, false: colors.placeholderColor }}
            style={styles.checbox}
          />
          <Text style={[styles.termsText, rtlStyles.textAlign, rtlStyles.writingDirection]}>
            {(LocalizedStrings.accept_terms_prefix || 'I accept the ')}
            <Text
              style={styles.linkText}
              onPress={() => props.navigation.navigate(routes.termsConditions)}>
              {LocalizedStrings.terms || 'Terms & Conditions'}
            </Text>
            {` ${LocalizedStrings.and || 'and'} `}
            <Text
              style={styles.linkText}
              onPress={() => props.navigation.navigate(routes.privacyPolicy)}>
              {LocalizedStrings.privacy || 'Privacy Policy'}
            </Text>
          </Text>
        </View>

        <View style={[rtlStyles.row, appStyles.jcCenter, appStyles.mt20]}>
          <Text style={[styles.dontAccountTextStyle, rtlStyles.textAlign, rtlStyles.writingDirection]}>
            {LocalizedStrings['Already have an account?']}{' '}
          </Text>
          <TouchableOpacity
            onPress={() => props.navigation.navigate(routes.login)}>
            <Text style={[styles.dontAccountSignUpTextStyle, rtlStyles.textAlign, rtlStyles.writingDirection]}>
              {LocalizedStrings['Login']}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            rtlStyles.row,
            styles.socialRow,
            { marginTop: wp(10), marginBottom: wp(5) },
          ]}>
          <View style={styles.line} />
          <Text style={styles.orTextStyle}>
            {LocalizedStrings['Or Continue with']}
          </Text>
          <View style={styles.line} />
        </View>
        <View style={[rtlStyles.row, styles.socialRow]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => googleLoginClicked()}
            style={[
              styles.socialLoginTopView,
              isRTL ? { marginStart: wp(5) } : { marginEnd: wp(5) },
            ]}>
            <Image source={appIcons.google} style={styles.socialIconStyle} />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.socialLoginTopView}>
            <Image source={appIcons.facebook} style={styles.socialIconStyle} />
          </TouchableOpacity> */}
          {
            Platform.OS === 'android' ? null : (

              <TouchableOpacity activeOpacity={0.8} onPress={() => onAppleButtonPress()} style={[styles.socialLoginTopView]}>
                <Image source={appIcons.apple} style={styles.socialIconStyle} />
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>

      <View style={[appStyles.ph20, appStyles.mb5]}>
        <Button onPress={() => SignUpAfterValidation()}>
          {LocalizedStrings['Sign Up']}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: hp(2.4),
    fontFamily: fontFamily.UrbanistBold,
    color: '#1D191C',
    marginTop: wp(5),
  },
  forgotPassword: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: '#625984',
  },
  rememberMe: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.BlackSecondary,
    marginStart: wp(1.5),
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
  termsRow: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  termsText: {
    flex: 1,
    fontSize: hp(1.4),
    fontFamily: fontFamily.UrbanistRegular,
    color: colors.descriptionColor,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primaryColor,
    fontFamily: fontFamily.UrbanistSemiBold,
    textDecorationLine: 'underline',
  },
  socialRow: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginHorizontal: wp(2),
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(6),
    borderRadius: wp(4),
    marginVertical: hp(1.5),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  biometricIcon: {
    width: wp(5.5),
    height: wp(5.5),
    resizeMode: 'contain',
    marginRight: wp(3),
    tintColor: colors.white,
  },
  biometricButtonText: {
    fontSize: hp(1.7),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.white,
  },
});
