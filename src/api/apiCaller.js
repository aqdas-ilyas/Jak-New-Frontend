import { getDeviceId } from 'react-native-device-info';
import { BASE_URL } from './routs';
import { store } from "../store/store";
import { setToken } from '../store/reducers/userDataSlice';
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

let sessionLogoutQueued = false;

const queueSessionLogout = (reason = 'session-expired') => {
  if (sessionLogoutQueued) {
    return;
  }

  sessionLogoutQueued = true;
  EventRegister.emit('forceLogout', { reason });

  setTimeout(() => {
    sessionLogoutQueued = false;
  }, 3000);
};

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
          queueSessionLogout('session-expired');
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

          console.log('Refresh token API response:', refreshResponse);

          const refreshResponseJson = await refreshResponse.json().catch(() => ({}));

          if (!refreshResponse.ok) {
            console.log('Refresh token API failed - status:', refreshResponse.status);

            const refreshRejected =
              refreshResponse.status === 401 ||
              refreshResponse.status === 403 ||
              refreshResponseJson?.errorType === 'jwt-expired' ||
              refreshResponseJson?.errorType === 'jwt-invalid' ||
              refreshResponseJson?.errorType === 'session-expired' ||
              refreshResponseJson?.errorType === 'session-expired-device' ||
              `${refreshResponseJson?.message || ''}`.toLowerCase().includes('jwt expired') ||
              `${refreshResponseJson?.message || ''}`.toLowerCase().includes('token has expired') ||
              `${refreshResponseJson?.message || ''}`.toLowerCase().includes('invalid token');

            if (refreshRejected) {
              queueSessionLogout('session-expired');
            } else {
              const refreshErrorPayload =
                refreshResponseJson && Object.keys(refreshResponseJson).length > 0
                  ? refreshResponseJson
                  : { message: 'Failed to refresh session' };
              onError(refreshErrorPayload);
            }
            return;
          }

          const resJson = refreshResponseJson;
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
          queueSessionLogout('session-expired');
        } catch (err) {
          console.log('error refresh token=> ', err);
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
          queueSessionLogout('session-expired');
        }
      }
    } catch (error) {
      onError(error);
    }
  } else {
    onError('No Internet Connection!');
  }
};
