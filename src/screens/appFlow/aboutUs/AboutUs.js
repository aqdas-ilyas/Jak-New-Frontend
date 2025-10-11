import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, hp, fontFamily, wp } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import { LocalizationContext } from '../../../language/LocalizationContext';

const AboutUs = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const aboutUsList = [
        {
            id: 1,
            title: LocalizedStrings.about_intro,
            desc: LocalizedStrings.about_intro_desc
        },
        {
            id: 2,
            title: LocalizedStrings.about_mission,
            desc: LocalizedStrings.about_mission_desc
        },
        {
            id: 3,
            title: LocalizedStrings.about_what_we_offer,
            desc: LocalizedStrings.about_what_we_offer_desc
        },
        {
            id: 4,
            title: LocalizedStrings.about_why_jak,
            desc: LocalizedStrings.about_why_jak_desc
        },
        {
            id: 5,
            title: LocalizedStrings.about_our_values,
            desc: LocalizedStrings.about_our_values_desc
        },
        {
            id: 6,
            title: LocalizedStrings.about_contact,
            desc: LocalizedStrings.about_contact_desc
        },
    ];

    return (
        <SafeAreaView style={[appStyles.safeContainer, { marginHorizontal: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.about_us} />
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {aboutUsList.map((item, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.mainTitle}>{item.title}</Text>
                            <Text style={styles.mainDesc}>{item.desc}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default AboutUs;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingVertical: wp(2),
        paddingBottom: wp(5),
    },
    section: {
        marginTop: wp(4),
    },
    mainTitle: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        lineHeight: 26,
        textAlign: 'left',
        marginBottom: wp(2),
    },
    mainDesc: {
        fontSize: hp(1.5),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        textAlign: 'left',
    },
});
