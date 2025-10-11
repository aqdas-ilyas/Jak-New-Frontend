import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import { LocalizationContext } from '../../../language/LocalizationContext'

const socialButton = [
    // { id: 1, img: appIcons.facebookContact, url: 'https://facebook.com' },
    { id: 2, img: appIcons.twitterContact, url: 'https://twitter.com' },
    // { id: 3, img: appIcons.linkedinContact, url: 'https://linkedin.com' },
    { id: 4, img: appIcons.webContact, url: 'https://jak.sa' },
]

const ContactUs = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const contactUsList = [
        { id: 1, mainTitle: LocalizedStrings.chat_to_us, desc: LocalizedStrings.our_friendly_team_is_here_to_help, email: 'Admin@jak-app.com', img: appIcons.chatToUs },
        // { id: 2, mainTitle: LocalizedStrings.phone, desc: LocalizedStrings.lorem_ipsum_dolor_sit_amet, email: '+966570578852', img: appIcons.phoneToUs },
    ]

    const openWhatsAppChat = (whatsApp) => {
        // Construct the deep link to open WhatsApp with the phone number
        const url = `whatsapp://send?phone=${whatsApp}`;

        // Check if the WhatsApp app is installed and open the chat
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                return Linking.openURL(url);
            } else {
                console.log("WhatsApp is not installed on this device.");
            }
        }).catch(error => {
            console.error("An error occurred while opening WhatsApp:", error);
        });
    };

    const handleEmailPress = (strEmail) => {
        const email = strEmail;
        const mailtoURL = `mailto:${email}`;

        Linking.openURL(mailtoURL).catch((err) => console.error('Error opening email app', err));
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
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.contact_us} />
            <View style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={[styles.mainDes, { marginVertical: wp(5) }]}>{LocalizedStrings.contact_us_description}</Text>
                    
                    {contactUsList.map((item, index) => (
                        <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginVertical: wp(2) }}>
                            <Image source={item.img} style={styles.ImageStyle} />
                            <View style={{ marginLeft: wp(3), flex: 1 }}>
                                <Text style={[styles.mainTitle]}>{item.mainTitle}</Text>
                                <Text style={[styles.mainDesc]}>{item.desc}</Text>
                                <Text onPress={() => handleEmailPress(item.email)} style={[styles.emailText]}>{item.email}</Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity activeOpacity={0.8} onPress={() => openWhatsAppChat('+966570578852')}>
                        <Image source={appIcons.whatsapp} style={styles.whatsappIcon} />
                    </TouchableOpacity>
                </ScrollView>
            </View>

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
    )
}

export default ContactUs

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: wp(5),
    },
    mainTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        lineHeight: 24,
        textAlign: 'left'
    },
    mainDesc: {
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistLight,
        color: colors.descriptionColor,
        lineHeight: 22,
        textAlign: 'left'
    },
    emailText: {
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.BlackSecondary,
        lineHeight: 22,
        textAlign: 'left'
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        textAlign: 'left'
    },
    ImageStyle: {
        width: wp(12),
        height: wp(12),
        resizeMode: 'contain',
    },
    ContactImageStyle: {
        width: wp(15),
        height: wp(15),
        resizeMode: 'contain',
    },
    whatsappIcon: {
        width: heightPixel(50),
        height: heightPixel(50),
        resizeMode: 'contain',
        margin: wp(2)
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
})
