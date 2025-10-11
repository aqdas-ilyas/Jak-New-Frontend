import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, hp, fontFamily, wp } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import { LocalizationContext } from '../../../language/LocalizationContext';

const Terms = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const termsList = [
        {
            id: 1,
            title: LocalizedStrings.terms_acceptance,
            desc: LocalizedStrings.terms_acceptance_desc
        },
        {
            id: 2,
            title: LocalizedStrings.terms_user_account,
            desc: LocalizedStrings.terms_user_account_desc
        },
        {
            id: 3,
            title: LocalizedStrings.terms_app_usage,
            desc: LocalizedStrings.terms_app_usage_desc
        },
        {
            id: 4,
            title: LocalizedStrings.terms_loyalty_programs,
            desc: LocalizedStrings.terms_loyalty_programs_desc
        },
        {
            id: 5,
            title: LocalizedStrings.terms_intellectual_property,
            desc: LocalizedStrings.terms_intellectual_property_desc
        },
        {
            id: 6,
            title: LocalizedStrings.terms_limitation,
            desc: LocalizedStrings.terms_limitation_desc
        },
        {
            id: 7,
            title: LocalizedStrings.terms_termination,
            desc: LocalizedStrings.terms_termination_desc
        },
    ];

    return (
        <SafeAreaView style={[appStyles.safeContainer, { marginHorizontal: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.terms} />
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {termsList.map((item, index) => (
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

export default Terms;

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
