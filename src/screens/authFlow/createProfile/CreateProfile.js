import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, Pressable, Alert, ActivityIndicator, Modal, KeyboardAvoidingView } from "react-native";
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, fontPixel, GOOGLE_API_KEY, emailFormat } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import Header from '../../../components/header'
import { Input } from '../../../components/input'
import { ImageProfileSelectandUpload, ImageProfileCameraUpload, uploadProfileImageOnS3 } from '../../../common/HelpingFunc';
import CountryInput from '../../../components/countryPicker/CountryPicker'
import { LocalizationContext } from '../../../language/LocalizationContext'
import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { Loader } from '../../../components/loader/Loader';
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useDispatch } from 'react-redux';
import { setToken, updateUser } from '../../../store/reducers/userDataSlice';
import { showMessage } from 'react-native-flash-message';
import { getDeviceId } from 'react-native-device-info';
import { _fetchCountryAbbrevicationCode } from '../../../services/helpingMethods';
import { CodeField, Cursor } from "react-native-confirmation-code-field";

const CreateProfile = (props) => {
    const { number, email } = props?.route?.params ?? {}
    const dispatch = useDispatch()
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const genderArray = [
        { id: 1, title: LocalizedStrings.Male },
        { id: 2, title: LocalizedStrings.Female },
    ]

    const [name, setName] = useState('')
    const [userEmail, setEmail] = useState('')
    const [image, setImage] = useState({ uri: 'https://wheelzconnect.s3.amazonaws.com/dummyUser.png' });
    const [dob, setDOB] = useState('');
    const [gender, setGender] = useState(genderArray[0].id);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('966');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [imageLoading, setImageLoading] = useState(false)
    const [country, setCountry] = useState('');
    const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('');
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [isNumberVerified, setIsNumberVerified] = useState(false);

    // Handle OTP verification
    const handleVerifyNumber = () => {
        if (!phoneNumber || phoneNumber.length < 8) {
            showMessage({
                message: 'Please enter a valid phone number',
                type: 'danger',
            });
            return;
        }
        setShowOTPModal(true);
        // Here you would typically send OTP to the phone number
        // For now, we'll just show the modal
        showMessage({
            message: 'OTP sent to your phone number',
            type: 'success',
        });
    };

    const verifyOTP = async () => {
        if (otpValue.length !== 4) {
            showMessage({
                message: 'Please enter complete OTP',
                type: 'danger',
            });
            return;
        }

        setIsVerifyingOTP(true);

        // Simulate OTP verification API call
        setTimeout(() => {
            setIsVerifyingOTP(false);
            setIsNumberVerified(true);
            setShowOTPModal(false);
            showMessage({
                message: 'Phone number verified successfully!',
                type: 'success',
            });
        }, 2000);
    };

    const resendOTP = () => {
        setOtpValue('');
        showMessage({
            message: 'OTP resent to your phone number',
            type: 'success',
        });
    };

    // Fetch and set the State's
    const fetchCountryAbbrivaition = async (code) => {
        try {
            const country = await _fetchCountryAbbrevicationCode(code);
            console.log("fetchCountryAbbrivaition: ", country)
            setCountryAbbrivaitionCode(country)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (countryCode != '') {
            fetchCountryAbbrivaition(countryCode)
        }
    }, [countryCode])

    // Show image picker options (Camera or Gallery)
    const showImagePickerOptions = () => {
        Alert.alert(
            LocalizedStrings.select_image_source || 'Select Image Source',
            LocalizedStrings.choose_image_source || 'Choose how you want to select your profile picture',
            [
                {
                    text: LocalizedStrings.camera || 'Camera',
                    onPress: () => openCamera(),
                },
                {
                    text: LocalizedStrings.gallery || 'Gallery',
                    onPress: () => openGallery(),
                },
                {
                    text: LocalizedStrings.cancel || 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    }

    // Open Camera to Capture Image
    const openCamera = async () => {
        ImageProfileCameraUpload((data, val) => {
            if (data) {
                uploadImage(data)
            }
        })
    }

    // Open Gallery to Pick Image
    const openGallery = async () => {
        ImageProfileSelectandUpload((data, val) => {
            if (data) {
                uploadImage(data)
            }
        })
    }

    // BUtton Press to Create profile
    const createUserProfile = async () => {
        if (validate()) {
            UpdateProfile()
        }
    }

    const validate = () => {
        const emailValue = emailFormat.test(userEmail) || userEmail === ' ' ? true : false;

        if (/\d/.test(name)) {
            showMessage({ message: "Name can only consists of alphabets between A to Z or a to z", type: "danger" });
            return false;
        }

        if (name.length < 2) {
            showMessage({ message: "Please enter a valid name", type: "danger" });
            return false;
        }

        if (dob.length < 2) {
            showMessage({ message: "Please select your Date of Birth", type: "danger" });
            return false;
        }

        // Validate age - must be 15 years or older
        if (dob) {
            const today = new Date();
            const birthDate = moment(dob, 'DD/MM/YYYY').toDate();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // Check if birthday hasn't occurred this year
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ? age - 1
                : age;

            if (actualAge < 15) {
                showMessage({
                    message: LocalizedStrings.age_validation_error || "You must be at least 15 years old to create a profile",
                    type: "danger"
                });
                return false;
            }
        }

        if (email) {
            if (!isPossiblePhoneNumber(`+${countryCode}` + phoneNumber)) {
                showMessage({ message: "Please add Valid Phone Number", type: "danger" });
                return false;
            }
        } else {
            if (!emailValue) {
                showMessage({ message: "Invalid Email", type: "danger" });
                return false;
            }
        }

        if (country.length < 2) {
            showMessage({ message: "Please Enter Valid Country", type: "danger" });
            return false;
        }

        // if (!image?.uri) {
        //     showMessage({ message: "Please Upload a Profile Picture", type: "danger" });
        //     return false;
        // }
        return true
    }

    const uploadImage = async (photo) => {
        try {
            setIsLoading(true);
            const uri = `file://${photo.uri}`;
            const fileName = photo.uri.substring(photo.uri.lastIndexOf('/') + 1);
            const fileType = fileName.split('.').pop();

            const data = {
                uri,
                type: `image/${fileType}`,
                name: fileName,
            };

            await uploadProfileImageOnS3(data, (res) => {
                setIsLoading(false);

                if (res) {
                    setImage({ uri: res });
                    showMessage({ message: 'Image uploaded successfully', type: 'success' });
                } else {
                    throw new Error('Image upload failed');
                }
            });
        } catch (error) {
            setIsLoading(false);
            handleImageError(error, 'Failed to upload image');
        }
    };

    const UpdateProfile = () => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('Success while UpdateProfile====>', response);
            showMessage({ message: 'Profile Created Successfully!', type: 'success' })
            dispatch(updateUser(response?.data))
            dispatch(setToken({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
            }))

            // props?.navigation?.navigate(routes.preferences);
            props.navigation.replace(routes.tab, { screen: routes.home })
        };

        const onError = error => {
            setIsLoading(false);
            console.log('error while UpdateProfile====>', error);
            showMessage({ message: error?.message, type: 'danger' })
        };

        const method = Method.POST;
        const endPoint = routs.accountSetup

        let body = {
            "name": name,
            "dob": dob,
            "image": image?.uri ? image?.uri : '',
            "gender": gender == 1 ? 'Male' : 'Female', // Female,Other
            "location": {
                "type": "Point",
                coordinates: [0, 0],
                address: country,
            },
            "device": {
                id: getDeviceId(),
                deviceToken: "fcmToken"
            }
        }

        if (number) {
            body = { ...body, "email": userEmail }
        }

        if (email) {
            body = { ...body, "number": countryCode + phoneNumber }
        }

        setIsLoading(true);
        callApi(method, endPoint, body, onSuccess, onError);
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header
                leftIcon
                onleftIconPress={() => props.navigation.goBack()}
                title={LocalizedStrings['Build Profile']}
            // rightTitle={LocalizedStrings.skip}
            // onPressRightTitle={() => props.navigation.navigate(routes.preferences)}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    keyboardShouldPersistTaps={"handled"}
                    bounces={false}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: hp(10) }}
                >
                    <View style={{ marginVertical: wp(5) }}>
                        <View style={styles.imageTopView}>
                            <View style={styles.imageView}>
                                <Image
                                    source={Object.keys(image).length !== 0 ? image : appImages.profile1}
                                    style={[styles.imageStyle, { resizeMode: 'cover' }]}
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
                            <TouchableOpacity style={styles.editIconView} onPress={() => showImagePickerOptions()}>
                                <Image source={appIcons.edit} style={styles.editIcon} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>{LocalizedStrings.profile_picture}</Text>
                        <View>
                            <Input
                                placeholder={LocalizedStrings.full_name}
                                value={name}
                                onChangeText={(value) => setName(value)}
                            >
                                {LocalizedStrings.full_name}
                            </Input>

                            <Input
                                editable={false}
                                placeholder={'mm/dd/yyyy'}
                                value={dob}
                                rightIcon
                                onPressIcon={() => setShowDatePicker(true)}
                                eyeValue={appIcons.calender1}
                                rightIconColor={colors.primaryColor}
                                touchable
                            >
                                {LocalizedStrings.DOB}
                            </Input>

                            {
                                number
                                && (
                                    <View style={{ marginBottom: wp(5) }}>
                                        <Input
                                            placeholder={LocalizedStrings.email}
                                            value={userEmail}
                                            onChangeText={(value) => setEmail(value)}
                                            leftIcon={appIcons.message}
                                        >
                                            {LocalizedStrings.email}
                                        </Input>
                                    </View>
                                )
                            }

                            {
                                email && (
                                    <View style={styles.phoneNumberContainer}>
                                        <CountryInput phoneNumber={phoneNumber} countryCode={countryCode ? countryCode : '966'} countryAbbreviationCode={countryAbbreviationCode ? countryAbbreviationCode : 'SA'} setValue={setPhoneNumber} setSelectedCode={setCountryCode} layout={'first'} />
                                        <TouchableOpacity
                                            style={[styles.verifyButton, isNumberVerified && styles.verifiedButton]}
                                            onPress={handleVerifyNumber}
                                            disabled={isNumberVerified}
                                        >
                                            <Text style={[styles.verifyButtonText, isNumberVerified && styles.verifiedButtonText]}>
                                                {isNumberVerified ? '✓ Verified' : 'Verify Number'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            }

                            <FlatList
                                data={genderArray}
                                keyExtractor={(_, index) => index.toString()}
                                ListHeaderComponent={
                                    <Text style={[styles.headerText]}>{LocalizedStrings.gender}</Text>
                                }
                                renderItem={({ item, index }) => {
                                    return (
                                        <Pressable key={index} onPress={() => setGender(item.id)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: wp(3) }}>
                                            <View style={[styles.dotComponentActiveStyle, { borderWidth: 2, marginRight: wp(3) }]}>
                                                <View style={[styles.dotComponentStyle, { backgroundColor: gender == item.id ? colors.primaryColor : 'transparent' }]} />
                                            </View>
                                            <Text style={styles.mainDes}>{item.title}</Text>
                                        </Pressable>
                                    )
                                }}
                            />

                            <Input
                                placeholder={LocalizedStrings.Location}
                                rightIcon
                                eyeValue={appIcons.location}
                                rightIconColor={colors.primaryColor}
                                value={country}
                                onChangeText={(text) => setCountry(text)}
                            >
                                {LocalizedStrings.Location}
                            </Input>


                        </View>
                    </View>

                    <View style={[appStyles.ph20, appStyles.mt10]}>
                        <Button onPress={() => createUserProfile()}>{LocalizedStrings.save_changes}</Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <DatePicker
                modal
                open={showDatePicker}
                date={new Date()}
                mode='date'
                maximumDate={new Date()}
                minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)} // 100 years ago
                onConfirm={(date) => {
                    const today = new Date();
                    const age = today.getFullYear() - date.getFullYear();
                    const monthDiff = today.getMonth() - date.getMonth();

                    // Check if birthday hasn't occurred this year
                    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
                        ? age - 1
                        : age;

                    if (actualAge < 15) {
                        showMessage({
                            message: LocalizedStrings.age_validation_error || "You must be at least 15 years old to create a profile",
                            type: "danger"
                        });
                        setShowDatePicker(false);
                        return;
                    }

                    const formattedDate = moment(date).format('DD/MM/YYYY');
                    console.log("formattedDate: ", formattedDate);
                    setDOB(formattedDate)
                    setShowDatePicker(false)
                }}
                onCancel={() => {
                    setShowDatePicker(false)
                }}
            />

            {/* OTP Verification Modal */}
            <Modal
                visible={showOTPModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowOTPModal(false)}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Verify Phone Number</Text>
                            <Text style={styles.modalSubtitle}>
                                Enter the 4-digit code sent to +{countryCode}{phoneNumber}
                            </Text>
                        </View>

                        <View style={styles.otpContainer}>
                            <View style={styles.otpInputContainer}>
                                <CodeField
                                    value={otpValue}
                                    onChangeText={(txt) => {
                                        setOtpValue(txt);
                                    }}
                                    cellCount={4}
                                    keyboardType="number-pad"
                                    textContentType="oneTimeCode"
                                    renderCell={({ index, symbol, isFocused }) => (
                                        <Text
                                            key={index}
                                            style={[styles.cell]}>
                                            {symbol || (isFocused ? <Cursor /> : null)}
                                        </Text>
                                    )}
                                />
                            </View>

                            <View style={styles.otpButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.otpButton, styles.resendButton]}
                                    onPress={resendOTP}
                                >
                                    <Text style={styles.resendButtonText}>Resend OTP</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.otpButton, styles.verifyOTPButton]}
                                    onPress={verifyOTP}
                                    disabled={isVerifyingOTP}
                                >
                                    {isVerifyingOTP ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <Text style={styles.verifyOTPButtonText}>Verify</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowOTPModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default CreateProfile

const styles = StyleSheet.create({
    mainTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.BlackSecondary,
        textAlign: "center",
        lineHeight: 24
    },
    imageTopView: {
        marginTop: heightPixel(4),
        alignSelf: 'center',
        justifyContent: 'center'
    },
    imageView: {
        width: wp(25),
        height: wp(25),
        borderRadius: widthPixel(100),
        position: 'relative',
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
    imageStyle: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: widthPixel(100)
    },
    editIconView: {
        width: widthPixel(32),
        position: 'absolute',
        bottom: 2,
        right: widthPixel(2),
        height: widthPixel(32),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: widthPixel(23),
    },
    editIcon: {
        width: widthPixel(30),
        height: widthPixel(30),
        resizeMode: 'contain',
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
        width: wp(3),
        height: wp(3),
        borderRadius: 50,
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: "center",
        lineHeight: 24,
    },
    headerText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        lineHeight: 24,
    },
    phoneNumberContainer: {
        marginBottom: wp(5),
        position: 'relative',
    },
    verifyButton: {
        position: 'absolute',
        right: wp(0),
        top: wp(3),
        backgroundColor: colors.primaryColor,
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: wp(1.5),
        borderWidth: 1,
        borderColor: colors.primaryColor,
    },
    verifiedButton: {
        backgroundColor: colors.successColor || '#4CAF50',
        borderColor: colors.successColor || '#4CAF50',
    },
    verifyButtonText: {
        fontSize: hp(1.2),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.white,
    },
    verifiedButtonText: {
        color: colors.white,
    },
    otpContainer: {
        paddingTop: wp(2),
    },
    otpInputContainer: {
        width: '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: wp(5),
    },
    cell: {
        width: wp(17),
        height: wp(13),
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: '#FAFAFA',
        color: colors.BlackSecondary,
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        textAlign: "center",
        lineHeight: wp(12)
    },
    otpButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    otpButton: {
        flex: 1,
        paddingVertical: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    resendButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primaryColor,
        marginRight: wp(2),
    },
    verifyOTPButton: {
        backgroundColor: colors.primaryColor,
        marginLeft: wp(2),
    },
    resendButtonText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.primaryColor,
    },
    verifyOTPButtonText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(5),
    },
    modalContainer: {
        backgroundColor: colors.fullWhite,
        borderRadius: wp(5),
        padding: wp(6),
        width: '100%',
        maxWidth: wp(90),
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: wp(5),
    },
    modalTitle: {
        fontSize: hp(2.2),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        textAlign: 'center',
        marginBottom: wp(2),
    },
    modalSubtitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
        textAlign: 'center',
        lineHeight: hp(2.2),
    },
    closeButton: {
        position: 'absolute',
        top: wp(4),
        right: wp(4),
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        backgroundColor: colors.grayColor + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
    },
})