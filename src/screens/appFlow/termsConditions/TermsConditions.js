import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, hp, fontFamily, wp, appIcons } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import { LocalizationContext } from '../../../language/LocalizationContext';
import { useRTL } from '../../../language/useRTL';

const TermsConditions = (props) => {
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const { isRTL, rtlStyles } = useRTL();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Google Docs URL for Terms & Conditions
    const termsUrl = appLanguage == 'en' ? 'https://docs.google.com/document/d/1Uc2Dk7TuWiw0eLZ-iYgUN_aYTkdBUIr-Ca88A3ncNiU/edit?tab=t.0' : 'https://docs.google.com/document/d/1DxBa4Vr-7xJmLntiYQOiBVJajU5wSArR81DRcLlnf1E/edit?tab=t.0';

    const handleWebViewLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleWebViewError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <SafeAreaView style={[appStyles.safeContainer, rtlStyles.writingDirection, { margin: wp(4), paddingTop: Platform.OS == 'android' ? wp(5) : 0 }]}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => props.navigation.goBack()} style={{ backgroundColor: 'white', borderRadius: 50, position: "absolute", top: wp(2.5), zIndex: 1, left: wp(1), padding: wp(2), }}>
                    <Image source={appIcons.back} style={[styles.back]} />
                </TouchableOpacity>

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                        <Text style={[styles.loadingText, rtlStyles.textAlign]}>{LocalizedStrings.loading}</Text>
                    </View>
                )}

                {/* Error Message */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={[styles.errorText, rtlStyles.textAlign]}>{LocalizedStrings.error_loading_document}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => {
                                setLoading(true);
                                setError(false);
                            }}
                        >
                            <Text style={styles.retryButtonText}>{LocalizedStrings.retry}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* WebView */}
                {!error && (
                    <WebView
                        source={{ uri: termsUrl }}
                        style={styles.webView}
                        onLoad={handleWebViewLoad}
                        onError={handleWebViewError}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={false}
                        onMessage={(event) => {
                            console.log('WebView message:', event.nativeEvent.data);
                        }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default TermsConditions;

const styles = StyleSheet.create({
    webView: {
        flex: 1,
        backgroundColor: colors.fullWhite,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.fullWhite,
    },
    loadingText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
        marginTop: wp(3),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.fullWhite,
        paddingHorizontal: wp(8),
    },
    errorText: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
        textAlign: 'center',
        marginBottom: wp(4),
    },
    retryButton: {
        backgroundColor: colors.primaryColor,
        paddingHorizontal: wp(6),
        paddingVertical: wp(3),
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.fullWhite,
    },
    back: {
        width: wp(5),
        height: wp(5),
        tintColor: colors.BlackSecondary
    },
});
