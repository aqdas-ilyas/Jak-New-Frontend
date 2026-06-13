import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, fontFamily, hp, wp } from '../../services';

const DOCUMENT_BASE_URL = 'https://docs.google.com';

const buildInjectedJavaScript = (isRTL) => `
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
    ${Platform.OS === 'ios' ? "document.documentElement.style.webkitTextSizeAdjust = '300%';" : ''}
    document.documentElement.setAttribute('dir', direction);
    if (document.body) {
      document.body.setAttribute('dir', direction);
    }
    true;
  })();
`;

const DocumentViewer = ({ documentUrl, isRTL, localizedStrings }) => {
  const [documentSource, setDocumentSource] = useState(
    Platform.OS === 'android' ? null : { uri: documentUrl },
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const injectedJavaScript = useMemo(() => buildInjectedJavaScript(isRTL), [isRTL]);
  const isAndroid = Platform.OS === 'android';

  useEffect(() => {
    let isActive = true;

    const loadDocument = async () => {
      setLoading(true);
      setError(false);
      setDocumentSource(isAndroid ? null : { uri: documentUrl });

      if (!isAndroid) {
        return;
      }

      try {
        // Android WebView can treat Google Docs export URLs like a download,
        // so we fetch the HTML and render it locally instead of loading the URL directly.
        const response = await fetch(documentUrl, {
          headers: {
            Accept: 'text/html',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.status}`);
        }

        const html = await response.text();

        if (isActive) {
          setDocumentSource({
            html,
            baseUrl: DOCUMENT_BASE_URL,
          });
        }
      } catch (fetchError) {
        if (isActive) {
          console.log('Document load error:', fetchError);
          setError(true);
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isActive = false;
    };
  }, [documentUrl, isAndroid, reloadKey]);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (webViewError) => {
    console.log('Document webview error:', webViewError?.nativeEvent?.description || webViewError);
    setError(true);
    setLoading(false);
  };

  const handleRetry = () => {
    setReloadKey((value) => value + 1);
  };

  return (
    <View style={styles.container}>
      {!error && documentSource && (
        <WebView
          source={documentSource}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          injectedJavaScript={injectedJavaScript}
          textZoom={300}
          scalesPageToFit
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      )}

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.primaryColor} />
          <Text style={[styles.loadingText, isRTL && styles.loadingTextRtl]}>
            {localizedStrings.loading}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.overlay}>
          <Text style={[styles.errorText, isRTL && styles.errorTextRtl]}>
            {localizedStrings.error_loading_document}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>{localizedStrings.retry}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DocumentViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    // backgroundColor: colors.fullWhite,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.fullWhite,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
    zIndex: 2,
    // elevation: 2,
  },
  loadingText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.descriptionColor,
    textAlign: 'left',
    marginTop: wp(3),
  },
  loadingTextRtl: {
    textAlign: 'right',
  },
  errorText: {
    fontSize: hp(1.8),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.descriptionColor,
    textAlign: 'center',
    marginBottom: wp(4),
  },
  errorTextRtl: {
    textAlign: 'right',
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
