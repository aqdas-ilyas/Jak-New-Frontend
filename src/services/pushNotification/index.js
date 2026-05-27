import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { _savefcmToken } from '../../store/reducers/userDataSlice';
import { store } from '../../store/store';

export async function requestUserPermission() {
    Platform.OS === 'android' && PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
        getFcmToken();
    }
}

async function getFcmToken() {
    let fToken = await AsyncStorage.getItem('fcmToken');
    console.log('fcmToken', fToken);
    if (!fToken) {
        try {
            const fToken = await messaging().getToken();
            if (fToken) {
                console.log('inside fcmToken', fToken);
                store.dispatch(_savefcmToken(fToken))
                await AsyncStorage.setItem('fcmToken', fToken);
            } else {
                console.log('No token found');
            }
        } catch (error) {
            console.log('Error on ', error);
        }
    }
}

const displayCustomNotification = async data => {
    if (Platform.OS === 'ios') {
        await notifee.requestPermission();
    }
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });
    // Display a notification
    await notifee.displayNotification({
        title: data?.notification.title,
        body: data?.notification.body,
        android: {
            channelId,
        },
    });
};

export async function notificationListeners() {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('A new FCM message arrived!', remoteMessage);
        displayCustomNotification(remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Background Message===', remoteMessage);
        displayCustomNotification(remoteMessage);
    });

    messaging()
        .getInitialNotification()
        .then(async remoteMessage => {
            if (remoteMessage) {
                console.log('kill State==', remoteMessage.notification);
                await displayCustomNotification(remoteMessage);
            }
        });

    return unsubscribe;
}