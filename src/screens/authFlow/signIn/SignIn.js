import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, I18nManager, StatusBar, ScrollView, Platform, } from 'react-native';
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, emailFormat, passwordFormat } from '../../../services';
import { appIcons } from '../../../services/utilities/assets';
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
import { useDispatch, useSelector } from 'react-redux';
import { saveLoginRemember, saveNumberLogin, setToken, updateUser, saveCredentials } from '../../../store/reducers/userDataSlice';
import ReactNativeBiometrics from 'react-native-biometrics';
import { googleLoginData, _fetchCountryAbbrevicationCode } from '../../../services/helpingMethods';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import CountryInput from '../../../components/countryPicker/CountryPicker';
import { isPossibleNumber } from 'libphonenumber-js';
import { decodeJWT } from '../../../common/HelpingFunc';
import appleAuth from '@invertase/react-native-apple-authentication';

const SignIn = props => {
  const dispatch = useDispatch();
  const biometricEnabled = useSelector(state => state?.user?.biometricEnabled || false);
  const savedCredentials = useSelector(state => state?.user?.savedCredentials || {
    email: null,
    password: null,
    phoneNumber: null,
    countryCode: null,
    loginType: null,
    googleEmail: null,
    appleEmail: null,
  });
  const { appLanguage, LocalizedStrings, setAppLanguage } = useContext(LocalizationContext);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('966');
  const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('SA');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
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
    if (!isPossibleNumber(`+${countryCode}` + phoneNumber)) {
      showMessage({ message: 'Invalid Phone Number', type: 'danger' });
      return false;
    }

    if (password.length < 4) {
      showMessage({ message: 'Please enter a strong password', type: 'danger' });
      return false;
    }

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
    checkBiometricAvailability();
  }, []);

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

  // Handle biometric phone login
  const handleBiometricPhoneLogin = async (credentials) => {
    console.log('handleBiometricPhoneLogin called with credentials:', credentials);

    const onSuccess = response => {
      console.log('res while SignInAfterValidation====>', response);
      dispatch(updateUser(response?.data));
      dispatch(
        setToken({
          token: response?.data?.token,
          refreshToken: response?.data?.refreshToken,
        }),
      );
      dispatch(saveLoginRemember(true));
      dispatch(saveNumberLogin(true));

      if (response?.act === 'login-granted') {
        props.navigation.navigate(routes.tab, { screen: routes.home });
      } else if (response?.act === 'incomplete-profile') {
        props?.navigation?.navigate(routes.createProfile, {
          number: `${credentials.countryCode + credentials.phoneNumber}`,
        });
      } else if (response?.act === 'incomplete-preferences') {
        if (!response?.data?.user?.isPreferencesSkipped) {
          props?.navigation?.navigate(routes.preferences);
        } else {
          if (response?.act == 'admin-pending') {
            props.navigation.navigate(routes.tab, { screen: routes.home });
          } else if (response?.act == 'incomplete-subscription') {
            props?.navigation?.navigate(routes.subscription);
            showMessage({
              message: 'You are not subscribed yet!',
              type: 'danger',
            });
          } else {
            props.navigation.navigate(routes.tab, { screen: routes.home });
          }
        }
      } else {
        props.navigation.navigate(routes.tab, { screen: routes.home });
      }
    };

    const onError = error => {
      console.log('error while SignInAfterValidation====>', error.message);
      showMessage({
        message: error?.message || 'Login failed',
        type: 'danger',
      });
    };

    const endPoint = routs.signIn;
    const method = Method.POST;
    const bodyParams = {
      number: `${credentials.countryCode + credentials.phoneNumber}`,
      password: credentials.password,
      language: appLanguage == 'en' ? 'english' : 'arabic',
      device: { id: getDeviceId(), deviceToken: 'fcmToken' },
    };

    console.log('Biometric phone login API call with params:', bodyParams);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  // Handle biometric email login
  const handleBiometricEmailLogin = async (credentials) => {
    console.log('handleBiometricEmailLogin called with credentials:', credentials);

    const onSuccess = response => {
      console.log('res while SignInAfterValidation====>', response);
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
          email: credentials.email.toLowerCase(),
          key: 'auth',
        });
      } else if (response?.act === 'incomplete-profile') {
        props?.navigation?.navigate(routes.createProfile, {
          email: credentials.email.toLowerCase(),
        });
      } else if (response?.act === 'incomplete-preferences') {
        if (!response?.data?.user?.isPreferencesSkipped) {
          props?.navigation?.navigate(routes.preferences);
        } else {
          if (response?.act == 'admin-pending') {
            props.navigation.navigate(routes.tab, { screen: routes.home });
          } else if (response?.act == 'incomplete-subscription') {
            props?.navigation?.navigate(routes.subscription);
            showMessage({
              message: 'You are not subscribed yet!',
              type: 'danger',
            });
          } else {
            props.navigation.navigate(routes.tab, { screen: routes.home });
          }
        }
      } else {
        props.navigation.navigate(routes.tab, { screen: routes.home });
      }
    };

    const onError = error => {
      console.log('error while SignInAfterValidation====>', error.message);
      showMessage({
        message: error?.message || 'Login failed',
        type: 'danger',
      });
    };

    const endPoint = routs.signIn;
    const method = Method.POST;
    const bodyParams = {
      email: credentials?.email.toLowerCase(),
      device: { id: getDeviceId(), deviceToken: 'fcmToken' },
    };

    console.log('Biometric email login API call with params:', bodyParams);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  // Handle biometric login
  const handleBiometricLogin = async () => {
    console.log('handleBiometricLogin called');
    console.log('Current savedCredentials:', savedCredentials);
    console.log('biometricAvailable:', biometricAvailable);
    console.log('biometricEnabled:', biometricEnabled);

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

      // Check if we have saved credentials
      if (!savedCredentials.loginType) {
        showMessage({
          message: 'No saved credentials found. Please login normally first.',
          type: 'danger',
        });
        return;
      }

      // Validate saved credentials based on login type
      if (savedCredentials.loginType === 'phone') {
        if (!savedCredentials.phoneNumber || !savedCredentials.countryCode || !savedCredentials.password) {
          showMessage({
            message: 'Phone credentials are incomplete. Please login normally first.',
            type: 'danger',
          });
          return;
        }
      } else if (savedCredentials.loginType === 'email') {
        if (!savedCredentials.email || !savedCredentials.password) {
          showMessage({
            message: 'Email credentials are incomplete. Please login normally first.',
            type: 'danger',
          });
          return;
        }
      }

      console.log('Starting biometric authentication...');
      const { success, error } = await rnBiometrics.simplePrompt({
        promptMessage: LocalizedStrings.biometric_login_prompt || 'Authenticate to login',
        cancelButtonText: LocalizedStrings.cancel || 'Cancel',
      });

      console.log('Biometric result - Success:', success, 'Error:', error);

      if (success) {
        console.log('Biometric authentication successful, proceeding with login...');

        if (savedCredentials.loginType === 'phone') {
          console.log('Processing phone biometric login with credentials:', savedCredentials);
          // Set fields for display
          setPhoneNumber(savedCredentials.phoneNumber);
          setPassword(savedCredentials.password);
          setCountryCode(savedCredentials.countryCode);
          // Call API directly
          handleBiometricPhoneLogin(savedCredentials);
        } else if (savedCredentials.loginType === 'email') {
          console.log('Processing email biometric login with credentials:', savedCredentials);
          // Set fields for display
          setEmail(savedCredentials.email);
          setPassword(savedCredentials.password);
          // Call API directly
          handleBiometricEmailLogin(savedCredentials);
        } else if (savedCredentials.loginType === 'google') {
          // Check if googleEmail exists
          if (savedCredentials.googleEmail) {
            handleSociallogin({ email: savedCredentials.googleEmail });
          } else {
            showMessage({
              message: 'Google email not found in saved credentials',
              type: 'danger',
            });
          }
        } else if (savedCredentials.loginType === 'apple') {
          // Check if appleEmail exists
          if (savedCredentials.appleEmail) {
            handleSociallogin({ email: savedCredentials.appleEmail });
          } else {
            showMessage({
              message: 'Apple email not found in saved credentials',
              type: 'danger',
            });
          }
        }
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
      console.log('Biometric login catch error:', error);

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
          message: 'Biometric authentication failed. Please try again or login normally.',
          type: 'danger',
        });
      }
    }
  };

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
    // Check if user and email exist
    if (!user || !user.email) {
      showMessage({
        message: 'Invalid user data for social login',
        type: 'danger',
      });
      return;
    }

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
          email: user?.email?.toLowerCase() || '',
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
        <View style={[appStyles.row, appStyles.jcCenter]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => googleLoginClicked()}
            style={[styles.socialLoginTopView, { marginRight: wp(5) }]}>
            <Image source={appIcons.google} style={styles.socialIconStyle} />
          </TouchableOpacity>
          {/* <TouchableOpacity activeOpacity={0.8} style={styles.socialLoginTopView}>
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

      <View style={[appStyles.ph20]}>
        <Button onPress={() => SignInAfterValidation()}>
          {LocalizedStrings.Login}
        </Button>
      </View>

      {/* Biometric Login Button */}
      {biometricAvailable && biometricEnabled && savedCredentials.loginType && (
        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin} activeOpacity={0.8}>
          <Text style={styles.biometricButtonText}>
            {LocalizedStrings.biometric_login || 'Use Biometric Authentication'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Debug Info */}
      {__DEV__ && (
        <View style={[appStyles.ph20, appStyles.mb5]}>
          <Text style={styles.debugText}>
            Biometric Available: {biometricAvailable ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.debugText}>
            Biometric Enabled: {biometricEnabled ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.debugText}>
            Login Type: {savedCredentials.loginType || 'None'}
          </Text>
          {savedCredentials.loginType === 'phone' && (
            <>
              <Text style={styles.debugText}>
                Phone: {savedCredentials.phoneNumber || 'None'}
              </Text>
              <Text style={styles.debugText}>
                Country Code: {savedCredentials.countryCode || 'None'}
              </Text>
            </>
          )}
          {savedCredentials.loginType === 'email' && (
            <Text style={styles.debugText}>
              Email: {savedCredentials.email || 'None'}
            </Text>
          )}
        </View>
      )}
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
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primaryColor,
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(5),
    marginHorizontal: wp(2),
    borderRadius: 50,
  },
  biometricButtonText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.primaryColor,
  },
  debugText: {
    fontSize: hp(1.2),
    fontFamily: fontFamily.UrbanistRegular,
    color: 'red',
    marginVertical: hp(0.5),
  },
});
