import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, hp, fontFamily, wp } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import { LocalizationContext } from '../../../language/LocalizationContext';

const PrivacyPolicy = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const PrivacyPolicyList = [
        { 
            id: 1, 
            title: LocalizedStrings.privacy_introduction, 
            desc: LocalizedStrings.privacy_introduction_desc 
        },
        { 
            id: 2, 
            title: LocalizedStrings.privacy_info_collection, 
            desc: LocalizedStrings.privacy_info_collection_desc 
        },
        { 
            id: 3, 
            title: LocalizedStrings.privacy_how_we_use, 
            desc: LocalizedStrings.privacy_how_we_use_desc 
        },
        { 
            id: 4, 
            title: LocalizedStrings.privacy_data_sharing, 
            desc: LocalizedStrings.privacy_data_sharing_desc 
        },
        { 
            id: 5, 
            title: LocalizedStrings.privacy_data_security, 
            desc: LocalizedStrings.privacy_data_security_desc 
        },
        { 
            id: 6, 
            title: LocalizedStrings.privacy_your_rights, 
            desc: LocalizedStrings.privacy_your_rights_desc 
        },
    ];

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.privacy} />
            <View style={{ flex: 1, marginTop: wp(5) }}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {PrivacyPolicyList.map((item, index) => (
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

export default PrivacyPolicy;

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
