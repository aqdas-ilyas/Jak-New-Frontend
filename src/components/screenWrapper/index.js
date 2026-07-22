import React, { useCallback, useRef } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const ScreenBackPressWrapper = ({
  children,
  enabled = false,
  title = 'Alert',
  message = 'Are you sure you want to exit?',
  cancelText = 'Cancel',
  confirmText = 'Yes',
  onConfirm = BackHandler.exitApp,
}) => {
  const alertVisibleRef = useRef(false);

  const handleBackPress = useCallback(() => {
    if (!enabled) {
      return false;
    }

    if (alertVisibleRef.current) {
      return true;
    }

    alertVisibleRef.current = true;

    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: () => {
            alertVisibleRef.current = false;
          },
        },
        {
          text: confirmText,
          onPress: () => {
            alertVisibleRef.current = false;
            onConfirm?.();
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          alertVisibleRef.current = false;
        },
      },
    );

    return true;
  }, [cancelText, confirmText, enabled, message, onConfirm, title]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || Platform.OS !== 'android') {
        return undefined;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );

      return () => {
        alertVisibleRef.current = false;
        subscription.remove();
      };
    }, [enabled, handleBackPress]),
  );

  return <>{children}</>;
};

export default ScreenBackPressWrapper;
