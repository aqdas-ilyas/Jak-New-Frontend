import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking, Alert, StatusBar, Platform } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { Input } from '../../../components/input'
import Button from '../../../components/button'
import { useSelector } from 'react-redux'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'
import { showMessage } from 'react-native-flash-message'
import CountryInput from '../../../components/countryPicker/CountryPicker'
import { Loader } from '../../../components/loader/Loader'

const socialButton = [
    // { id: 1, img: appIcons.facebookContact, url: 'https://facebook.com' },
    { id: 2, img: appIcons.twitterContact, url: 'https://twitter.com' },
    // { id: 3, img: appIcons.linkedinContact, url: 'https://linkedin.com' },
    { id: 4, img: appIcons.webContact, url: 'https://jak.sa' },
]

const ContactUs = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const user = useSelector(state => state?.user?.user?.user);

    // Form state
    const [messageTitle, setMessageTitle] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('966');
    const [isLoading, setIsLoading] = useState(false);

    // Check if user is social login
    const isSocialUser = user?.isSocial;

    const handleSubmit = () => {
        // Validation
        if (!messageTitle.trim()) {
            showMessage({
                message: LocalizedStrings.please_enter_message_title || 'Please enter message title',
                type: 'danger',
            });
            return;
        }

        if (!messageBody.trim()) {
            showMessage({
                message: LocalizedStrings.please_enter_message_body || 'Please enter message body',
                type: 'danger',
            });
            return;
        }

        if (isSocialUser) {
            if (!phoneNumber.trim()) {
                showMessage({
                    message: LocalizedStrings.please_enter_phone_number || 'Please enter your phone number',
                    type: 'danger',
                });
                return;
            }
        } else {
            if (!email.trim()) {
                showMessage({
                    message: LocalizedStrings.please_enter_email || 'Please enter your email',
                    type: 'danger',
                });
                return;
            }
        }

        // API Call
        const onSuccess = (response) => {
            console.log('Contact Us Response:', response);
            setIsLoading(false);
            showMessage({
                message: LocalizedStrings.message_sent_successfully || 'Message sent successfully! We will get back to you soon.',
                type: 'success',
            });
            // Reset form
            setMessageTitle('');
            setMessageBody('');
            setEmail('');
            setPhoneNumber('');
        };

        const onError = (error) => {
            setIsLoading(false);
            showMessage({
                message: error?.message || (LocalizedStrings.failed_to_send_message || 'Failed to send message. Please try again.'),
                type: 'danger',
            });
        };

        const method = Method.POST;
        const endPoint = routs.contactUs; // You'll need to add this route
        let bodyParams = {
            title: messageTitle,
            message: messageBody,
            number: phoneNumber ? `${countryCode}${phoneNumber}` : user?.number,
            email: email ? email : user?.email,
        };

        console.log('Contact Us Body Params:', bodyParams);

        setIsLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const handleSocialPress = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Cannot open URL:", url);
            }
        }).catch(err => console.error('Error opening URL', err));
    };

    return (
        <>
            <StatusBar
                barStyle={'dark-content'}
                backgroundColor={Platform.OS === 'android' ? '#fff' : undefined}
                translucent={Platform.OS === 'android'}
            />
            <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
                <Loader loading={isLoading} />

                <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.contact_us} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.formContainer}>
                        {/* <Text style={styles.formTitle}>{LocalizedStrings.send_us_message || "Send us a Message"}</Text> */}
                        <Text style={styles.formSubtitle}>
                            {LocalizedStrings.contact_form_subtitle || "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
                        </Text>

                        {/* Message Title */}
                        <View style={styles.inputContainer}>
                            <Input
                                placeholder={LocalizedStrings.message_title || "Message Title"}
                                value={messageTitle}
                                onChangeText={setMessageTitle}
                            >
                                {LocalizedStrings.message_title || "Message Title"}
                            </Input>
                        </View>

                        {/* Message Body */}
                        <View style={styles.inputContainer}>
                            <Input
                                placeholder={LocalizedStrings.message_body || "Enter your message"}
                                value={messageBody}
                                onChangeText={setMessageBody}
                                multiline={true}
                                numberOfLines={4}
                                containerStyle={styles.messageInput}
                                inputStyle={styles.messageInput}
                            >
                                {LocalizedStrings.message_body || "Message Body"}
                            </Input>
                        </View>

                        {/* Conditional Contact Field */}
                        {isSocialUser ? (
                            <View style={styles.inputContainer}>
                                <CountryInput
                                    phoneNumber={phoneNumber}
                                    countryCode={countryCode}
                                    countryAbbreviationCode="SA"
                                    setValue={setPhoneNumber}
                                    setSelectedCode={setCountryCode}
                                    layout="first"
                                >
                                    {LocalizedStrings.phone_number || "Phone Number"}
                                </CountryInput>
                            </View>
                        ) : (
                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder={LocalizedStrings.email_address || "Enter your email"}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    leftIcon={appIcons.message}
                                >
                                    {LocalizedStrings.email_address || "Email Address"}
                                </Input>
                            </View>
                        )}

                        {/* Submit Button */}
                        <View style={styles.buttonContainer}>
                            <Button
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (LocalizedStrings.sending || 'Sending...') : (LocalizedStrings.send_message || 'Send Message')}
                            </Button>
                        </View>

                        {/* Contact Info */}
                        {/* <View style={styles.contactInfoContainer}>
                            <Text style={styles.contactInfoTitle}>{LocalizedStrings.reach_us_directly || "Or reach us directly:"}</Text>
                            <Text style={styles.contactInfoText}>{LocalizedStrings.email_label || "Email"}: admin@jak-app.com</Text>
                            <Text style={styles.contactInfoText}>{LocalizedStrings.phone_label || "Phone"}: +966570578852</Text>
                        </View> */}
                    </View>
                </ScrollView>

                {/* Social Media Links */}
                <View style={[appStyles.ph20, styles.socialContainer]}>
                    <View style={styles.socialButtonsRow}>
                        {socialButton.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={{ margin: wp(2) }}
                                activeOpacity={0.7}
                                onPress={() => handleSocialPress(item.url)}
                            >
                                <Image source={item.img} style={styles.ContactImageStyle} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </SafeAreaView>
        </>
    )
}

export default ContactUs

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: wp(10),
    },
    formContainer: {
        paddingVertical: wp(3),
    },
    formTitle: {
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        textAlign: 'center',
        marginBottom: wp(2),
    },
    formSubtitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
        textAlign: 'center',
        lineHeight: hp(2.2),
        marginBottom: wp(5),
    },
    inputContainer: {
        // marginBottom: wp(4),
    },
    messageInput: {
        height: hp(12),
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: wp(3),
        marginBottom: wp(5),
    },
    contactInfoContainer: {
        backgroundColor: colors.grayColor + '10',
        padding: wp(4),
        borderRadius: wp(3),
        marginTop: wp(3),
    },
    contactInfoTitle: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginBottom: wp(2),
        textAlign: 'center',
    },
    contactInfoText: {
        fontSize: hp(1.5),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
        textAlign: 'center',
        marginBottom: wp(1),
    },
    socialContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: wp(2),
    },
    socialButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ContactImageStyle: {
        width: wp(8),
        height: wp(8),
        resizeMode: 'contain',
    },
})
