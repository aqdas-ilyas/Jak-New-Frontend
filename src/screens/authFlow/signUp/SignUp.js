import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  googleLoginData,
  _fetchCountryAbbrevicationCode,
} from '../../../services/helpingMethods';
import CountryInput from '../../../components/countryPicker/CountryPicker';
import { isPossibleNumber } from 'libphonenumber-js';

const SignUp = props => {
  const dispatch = useDispatch();
  const { appLanguage, LocalizedStrings } = useContext(LocalizationContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('966');
  const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('SA');

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
    const emailValue = emailFormat.test(email) || email === ' ' ? true : false;

    const passValue =
      passwordFormat.test(password) || password === ' ' ? true : false;

    // if (!emailValue) {
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

    if (password !== confirmPassword) {
      showMessage({ message: 'Your Password is not Matched!', type: 'danger' });
      return false;
    }
    return true;
  };
  const SignUpAfterValidation = () => {
    if (validateInputs()) {
      const onSuccess = response => {
        setIsLoading(false);
        console.log('res while signup====>', response);
        showMessage({ message: response?.message, type: 'success' });

        dispatch(saveNumberLogin(true));

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
        showMessage({ message: error?.message, type: 'danger' });
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
      <Header leftIcon onleftIconPress={() => props.navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        bounces={false}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>
          {LocalizedStrings['Create Your Account']}
        </Text>

        <View>
          {/* <Input
                        placeholder={LocalizedStrings['email']}
                        value={email}
                        onChangeText={(value) => setEmail(value)}
                        leftIcon={appIcons.message}
                    >
                        {LocalizedStrings['email']}
                    </Input> */}

          <CountryInput
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            countryAbbreviationCode={countryAbbreviationCode}
            setValue={setPhoneNumber}
            setSelectedCode={setCountryCode}
            layout={'first'}
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

        <View style={[appStyles.rowCenter, appStyles.mt20]}>
          <Text style={styles.dontAccountTextStyle}>
            {' '}
            {LocalizedStrings['Already have an account?']}{' '}
          </Text>
          <TouchableOpacity
            onPress={() => props.navigation.navigate(routes.login)}>
            <Text style={styles.dontAccountSignUpTextStyle}>
              {' '}
              {LocalizedStrings['Login']}
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
    textAlign: 'left',
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
});
