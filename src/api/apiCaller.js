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

const buildHeaders = (multipart = false, token = null) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': multipart ? 'multipart/form-data' : 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  return headers;
};

const shouldRefreshAccessToken = responseJson => {
  const message =
    typeof responseJson?.message === 'string'
      ? responseJson.message.toLowerCase()
      : '';

  return (
    responseJson?.status === 401 &&
    (responseJson?.errorType === 'jwt-expired' ||
      responseJson?.errorType === 'jwt-invalid' ||
      message.includes('jwt expired') ||
      message.includes('token has expired') ||
      message.includes('invalid token') ||
      message.includes('jwt malformed'))
  );
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
    let token = accessToken !== undefined ? accessToken : store.getState().user?.token ?? false;
    let refreshToken = store.getState().user?.refreshToken ?? false;

    const headers = buildHeaders(multipart, token);
    let fetchObject = {
      method: method,
      headers,
      body:
        method === 'GET'
          ? null
          : method === 'DELETE'
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
      if (shouldRefreshAccessToken(responseJson)) {
        if (!refreshToken) {
          store.dispatch(logout());
          EventRegister.emit('forceLogout');
          return;
        }

        console.log(responseJson?.message, '-----', deviceToken ? deviceToken : getDeviceId());
        const refreshFetchObject = {
          method: 'POST',
          headers: buildHeaders(false),
          body: JSON.stringify({
            device: {
              id: deviceToken ? deviceToken : getDeviceId(),
            },
          }),
        };
        try {
          console.log('Attempting to refresh access token with refresh token:', `${BASE_URL}user/refresh/${refreshToken}`);
          
          const refreshResponse = await fetch(
            `${BASE_URL}user/refresh/${refreshToken}`,
            refreshFetchObject,
          );

          if (!refreshResponse.ok) {
            console.log('Refresh token API failed - status:', refreshResponse.status);
            store.dispatch(logout());
            EventRegister.emit('forceLogout');
            return;
          }

          const resJson = await refreshResponse.json();
          console.log('New refreshToken====', resJson?.data?.accessToken);

          if (resJson?.data?.accessToken) {
            store.dispatch(
              setToken({
                token: resJson.data.accessToken,
                refreshToken,
              }),
            );

            return callApi(
              method,
              endPoint,
              bodyParams,
              onSuccess,
              onError,
              resJson?.data?.accessToken,
              multipart,
            );
          }

          console.log('Refresh token API response missing accessToken');
          store.dispatch(logout());
          EventRegister.emit('forceLogout');
        } catch (err) {
          console.log('error refresh token=> ', err);
          store.dispatch(logout());
          EventRegister.emit('forceLogout');
          onError(err);
        }
      } else if (responseJson?.status < 400) {
        onSuccess(responseJson);
      } else {
        onError(responseJson);

        if (
          responseJson?.status === 401 &&
          (responseJson?.errorType === 'session-expired' ||
            responseJson?.errorType === 'session-expired-device')
        ) {
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
