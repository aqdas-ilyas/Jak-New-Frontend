import { getDeviceId } from 'react-native-device-info';
import { BASE_URL } from './routs';
import { store } from "../store/store";
import { logout, setToken } from '../store/reducers/userDataSlice';
import NetInfo from '@react-native-community/netinfo';
import { EventRegister } from 'react-native-event-listeners';

export const AUTHORIZE = 'AUTHORIZE';
export const NETWORK_ERROR = 'NETWORK ERROR';

export const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

export const Status = {
  SUCCESS: 200,
  ERROR: 400,
  AUTHENTICATION_FAIL: 401,
  NOT_FOUND: 400,
};

var defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const isNetworkAvailable = async () => {
  const response = await NetInfo.fetch();
  return response.isConnected;
}

export const callApi = async (
  method,
  endPoint,
  bodyParams,
  onSuccess,
  onError,
  accessToken,
  multipart,
) => {
  const isConnected = await isNetworkAvailable();
  const deviceToken = getDeviceId()
  if (isConnected) {
    let token = accessToken != undefined ? accessToken : store.getState().user?.token ?? false;
    let refreshToken = store.getState().user?.refreshToken ?? false;

    if (multipart) {
      defaultHeaders['Accept'] = 'application/json';
      defaultHeaders['Content-Type'] = 'multipart/form-data';

    } else {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    if (token) {
      defaultHeaders['Authorization'] = token;
    }
    let fetchObject = {
      method: method,
      headers: defaultHeaders,
      body:
        method == 'GET'
          ? null
          : method == 'DELETE'
            ? null
            : multipart
              ? bodyParams
              : JSON.stringify(bodyParams),
    };
    if (bodyParams == null) {
      delete fetchObject.body;
    }
    try {
      let response = await fetch(endPoint, fetchObject);
      let responseJson = await response.json();
      if (responseJson?.message == 'jwt expired') {
        console.log(responseJson?.message, '-----', deviceToken ? deviceToken : getDeviceId());
        let fetchObject = {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({
            device: {
              id: deviceToken ? deviceToken : getDeviceId(),
            },
          }),
        };
        await fetch(`${BASE_URL}user/refresh/${refreshToken}`, fetchObject)
          .then(async res => {
            // Check if response is OK
            if (!res.ok) {
              console.log('Refresh token API failed - status:', res.status);
              store.dispatch(logout());
              EventRegister.emit('forceLogout');
              return;
            }

            let resJson = await res.json();
            console.log('New refreshToken====', resJson?.data?.accessToken);

            // Check if accessToken exists in response
            if (resJson?.data?.accessToken) {
              store.dispatch(
                setToken({
                  token: resJson.data.accessToken,
                  refreshToken: refreshToken,
                }),
              );
              callApi(
                method,
                endPoint,
                bodyParams,
                onSuccess,
                onError,
                resJson?.data?.accessToken,
                multipart
              );
            } else {
              // No accessToken in response - logout user
              console.log('Refresh token API response missing accessToken');
              store.dispatch(logout());
              EventRegister.emit('forceLogout');
            }
          })
          .catch(err => {
            // Network error or other fetch error - logout user
            console.log('error refresh token=> ', err);
            store.dispatch(logout());
            EventRegister.emit('forceLogout');
            onError(err);
          });
      } else if (responseJson?.status < 400) {
        onSuccess(responseJson);
      } else {
        onError(responseJson);

        if (responseJson?.errorType == "session-expired-device" && responseJson?.status == 401) {
          store.dispatch(logout());
          EventRegister.emit('forceLogout');
        }
      }
    } catch (error) {
      onError(error);
    }
  } else {
    onError('No Internet Connection!');
  }
};