import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, hp, fontFamily, wp } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import DocumentViewer from '../../../components/documentViewer';
import { LocalizationContext } from '../../../language/LocalizationContext';
import { useRTL } from '../../../language/useRTL';

const PrivacyPolicyIOS = ({ privacyUrl, LocalizedStrings, rtlStyles, isRTL }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const injectedJavaScript = `
      (function () {
        var direction = '${isRTL ? 'rtl' : 'ltr'}';
        var textAlign = '${isRTL ? 'right' : 'left'}';
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(
          'html, body { direction: ' + direction + ' !important; text-align: ' + textAlign + ' !important; width: 100% !important; max-width: 100% !important; }' +
          ' body { margin: 0 !important; padding: 0 !important; }' +
          ' img, table { max-width: 100% !important; }'
        ));
        document.head.appendChild(style);
        document.documentElement.style.webkitTextSizeAdjust = '300%';
        document.documentElement.setAttribute('dir', direction);
        if (document.body) {
          document.body.setAttribute('dir', direction);
        }
        true;
      })();
    `;

    const handleWebViewLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleWebViewError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primaryColor} />
                    <Text style={[styles.loadingText, rtlStyles.textAlign]}>{LocalizedStrings.loading}</Text>
                </View>
            )}

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

            {!error && (
                <WebView
                    source={{ uri: privacyUrl }}
                    style={styles.webView}
                    onLoad={handleWebViewLoad}
                    onError={handleWebViewError}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    textZoom={300}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    injectedJavaScript={injectedJavaScript}
                    onMessage={(event) => {
                        console.log('WebView message:', event.nativeEvent.data);
                    }}
                />
            )}
        </>
    );
};

const PrivacyPolicy = (props) => {
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const { isRTL, rtlStyles } = useRTL();

    const privacyUrl = appLanguage === 'en'
        ? 'https://docs.google.com/document/d/1o7UAJW5lu-1msK-P9KPQJMaRb-z19MgpriQlk00FTuk/export?format=html'
        : 'https://docs.google.com/document/d/1FNW05ja9X2vjHcAfVHTcgYQH8pPcmockUj76DKN_zok/export?format=html';

    return (
        <SafeAreaView style={[appStyles.safeContainer, rtlStyles.writingDirection, styles.screenContainer, Platform.OS === 'android' ? styles.androidTopPadding : null]}>
            <View style={styles.content}>
                <Header
                    leftIcon
                    onleftIconPress={() => props.navigation.goBack()}
                    title={LocalizedStrings.privacy}
                />
                {Platform.OS === 'android' ? (
                    <DocumentViewer
                        documentUrl={privacyUrl}
                        isRTL={isRTL}
                        localizedStrings={LocalizedStrings}
                    />
                ) : (
                    <PrivacyPolicyIOS
                        privacyUrl={privacyUrl}
                        LocalizedStrings={LocalizedStrings}
                        rtlStyles={rtlStyles}
                        isRTL={isRTL}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        margin: wp(4),
    },
    androidTopPadding: {
        paddingTop: wp(5),
    },
    content: {
        flex: 1,
    },
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
});
