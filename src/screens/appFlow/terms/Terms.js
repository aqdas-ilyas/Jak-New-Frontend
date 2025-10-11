import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, hp, fontFamily, wp } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import { LocalizationContext } from '../../../language/LocalizationContext';

const Terms = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const [selectedTab, setSelectedTab] = useState('terms'); // 'terms' or 'privacy'

    const termsContent = {
        title: LocalizedStrings.terms_title,
        welcome: LocalizedStrings.terms_welcome,
        intro: LocalizedStrings.terms_intro,
        
        sections: [
            {
                title: LocalizedStrings.terms_cookies_title,
                content: LocalizedStrings.terms_cookies_content
            },
            {
                title: LocalizedStrings.terms_license_title,
                content: LocalizedStrings.terms_license_content
            },
            {
                title: LocalizedStrings.terms_content_liability_title,
                content: LocalizedStrings.terms_content_liability_content
            },
            {
                title: LocalizedStrings.terms_reservation_title,
                content: LocalizedStrings.terms_reservation_content
            },
            {
                title: LocalizedStrings.terms_disclaimer_title,
                content: LocalizedStrings.terms_disclaimer_content
            }
        ]
    };

    const privacyContent = {
        title: LocalizedStrings.privacy_title,
        intro: LocalizedStrings.privacy_intro,
        
        sections: [
            {
                title: LocalizedStrings.privacy_personal_info_title,
                content: LocalizedStrings.privacy_personal_info_content
            },
            {
                title: LocalizedStrings.privacy_why_process_title,
                content: LocalizedStrings.privacy_why_process_content
            },
            {
                title: LocalizedStrings.privacy_your_rights_title,
                content: LocalizedStrings.privacy_your_rights_content
            },
            {
                title: LocalizedStrings.privacy_links_title,
                content: LocalizedStrings.privacy_links_content
            },
            {
                title: LocalizedStrings.privacy_security_title,
                content: LocalizedStrings.privacy_security_content
            },
            {
                title: LocalizedStrings.privacy_legal_title,
                content: LocalizedStrings.privacy_legal_content
            },
            {
                title: LocalizedStrings.privacy_contact_title,
                content: LocalizedStrings.privacy_contact_content
            }
        ]
    };

    return (
        <SafeAreaView style={[appStyles.safeContainer, { marginHorizontal: wp(4) }]}>
            <Header 
                leftIcon 
                onleftIconPress={() => props.navigation.goBack()} 
                title={LocalizedStrings.terms_and_privacy} 
            />
            
            {/* Toggle Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, selectedTab === 'terms' && styles.activeTab]}
                    onPress={() => setSelectedTab('terms')}
                >
                    <Text style={[styles.tabText, selectedTab === 'terms' && styles.activeTabText]}>
                        {LocalizedStrings.terms}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tab, selectedTab === 'privacy' && styles.activeTab]}
                    onPress={() => setSelectedTab('privacy')}
                >
                    <Text style={[styles.tabText, selectedTab === 'privacy' && styles.activeTabText]}>
                        {LocalizedStrings.privacy}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {selectedTab === 'terms' ? (
                        <>
                            <Text style={styles.mainTitle}>{termsContent.title}</Text>
                            <Text style={styles.welcome}>{termsContent.welcome}</Text>
                            <Text style={styles.introText}>{termsContent.intro}</Text>
                            
                            {termsContent.sections.map((section, index) => (
                                <View key={index} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Text style={styles.sectionContent}>{section.content}</Text>
                                </View>
                            ))}
                        </>
                    ) : (
                        <>
                            <Text style={styles.mainTitle}>{privacyContent.title}</Text>
                            <Text style={styles.introText}>{privacyContent.intro}</Text>
                            
                            {privacyContent.sections.map((section, index) => (
                                <View key={index} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Text style={styles.sectionContent}>{section.content}</Text>
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Terms;

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        marginTop: wp(4),
        marginBottom: wp(2),
        backgroundColor: colors.offWhite,
        borderRadius: 12,
        padding: wp(1),
    },
    tab: {
        flex: 1,
        paddingVertical: wp(3),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: colors.primaryColor,
    },
    tabText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.descriptionColor,
    },
    activeTabText: {
        color: colors.fullWhite,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingVertical: wp(2),
        paddingBottom: wp(5),
    },
    mainTitle: {
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        textAlign: 'left',
        marginTop: wp(4),
        marginBottom: wp(3),
    },
    welcome: {
        fontSize: hp(1.9),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.primaryColor,
        textAlign: 'left',
        marginBottom: wp(3),
    },
    introText: {
        fontSize: hp(1.5),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        textAlign: 'left',
        marginBottom: wp(4),
    },
    section: {
        marginTop: wp(4),
    },
    sectionTitle: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        lineHeight: 26,
        textAlign: 'left',
        marginBottom: wp(2),
    },
    sectionContent: {
        fontSize: hp(1.5),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        textAlign: 'left',
    },
});
