import { PermissionsAndroid, Platform } from 'react-native'
import ImagePicker from "react-native-image-crop-picker";
import S3 from 'aws-sdk/clients/s3';
import { decode } from 'base64-arraybuffer'
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
var fs = require('react-native-fs');

export const decodeBase64Url = (base64Url) => {
    try {
        // Replace URL-safe characters with standard Base64 characters
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        console.log("Base64 URL: ", base64Url);
        console.log("Base64: ", base64);

        // Custom Base64 decoding without `atob`
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        let i = 0;

        while (i < base64.length) {
            let enc1 = chars.indexOf(base64.charAt(i++));
            let enc2 = chars.indexOf(base64.charAt(i++));
            let enc3 = chars.indexOf(base64.charAt(i++));
            let enc4 = chars.indexOf(base64.charAt(i++));

            let chr1 = (enc1 << 2) | (enc2 >> 4);
            let chr2 = ((enc2 & 0xF) << 4) | (enc3 >> 2);
            let chr3 = ((enc3 & 0x3) << 6) | enc4;

            output += String.fromCharCode(chr1);
            if (enc3 !== 64) {
                output += String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output += String.fromCharCode(chr3);
            }
        }

        console.log("Decoded String: ", output);
        return output;
    } catch (error) {
        console.error("Error decoding Base64:", error);
        return null;
    }
};

export const decodeJWT = async (token) => {
    console.log("JWT Token: ", token);

    const [header, payload] = token.split('.');
    const decodedPayload = decodeBase64Url(payload);

    if (decodedPayload) {
        console.log("Decoded Payload: ", decodedPayload);
        const cleanedStr = decodedPayload.replace(/\u0000/g, '');

        return JSON.parse(cleanedStr);
    } else {
        console.error("Failed to decode JWT payload.");
        return null;
    }
};

export const ImageProfileSelectandUpload = (result) => {
    ImagePicker.openPicker({
        width: 300,
        height: 400,
        compressImageQuality: 1,
        cropping: false,
        writeTempFile: true,
        cropperCircleOverlay: false,
    }).then((image) => {
        let splittedName = image.path.split("/");
        const uriParts = image.path.split(".");
        var profileUri = {
            uri: image.path,
            name: `image${Math.floor(new Date().getTime())}.${splittedName[splittedName.length - 1]}`,
            type: uriParts[uriParts.length - 1],
        };

        result(profileUri)
    })
        .catch((err) => {
            console.log("err => ", err)
            result('')
        })
}

export const ImageProfileCameraUpload = (result) => {
    ImagePicker.openCamera({
        width: 300,
        height: 400,
        compressImageQuality: 1,
        cropping: false,
        writeTempFile: true,
        cropperCircleOverlay: false,
    }).then((image) => {
        let splittedName = image.path.split("/");
        const uriParts = image.path.split(".");
        var profileUri = {
            uri: image.path,
            name: `image${Math.floor(new Date().getTime())}.${splittedName[splittedName.length - 1]}`,
            type: uriParts[uriParts.length - 1],
        };

        result(profileUri)
    })
        .catch((err) => {
            console.log("err => ", err)
            result('')
        })
}

export const uploadProfileImageOnS3 = async (file, result) => {
    const s3bucket = new S3({
        region: 'eu-north-1',
        accessKeyId: 'AKIAZQ3DQBKXRCV2ITQP',
        secretAccessKey: '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',
        Bucket: 'jakappbucket',
        signatureVersion: 'v4',
    });
    let contentType = file.type;
    let contentDeposition = 'inline;filename="' + file.name + '"';
    const base64 = await fs.readFile(file.uri, 'base64');
    const arrayBuffer = decode(base64);
    s3bucket.createBucket(async () => {
        const params = {
            Bucket: "paisero",
            Key: file.name,
            Body: arrayBuffer,
            ContentDisposition: contentDeposition,
            ContentType: contentType,
        };
        await s3bucket.upload(params).promise()
            .then((data) => {
                result(data?.Location, false)
            })
            .catch((err) => {
                console.log("err => ", err)

            })
    });
}

export async function getLocationPermission() {
    let response = false;
    if (Platform.OS === 'ios') {
        Geolocation.setRNConfiguration({
            skipPermissionRequests: false,
            authorizationLevel: 'always',
        });
        Geolocation.requestAuthorization();
        response = true;
    } else {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                const grantedBackground = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
                response = true;
            } else {
                console.log(
                    'Location permission denied, you cannot use location features in the application. Please enable from settings location to view location based services.',
                );
            }
        } catch (err) {
            // alert(err);
        }
    }
    return response;
}

export const getAddressFromLatAndLong = async (currentLatitude, currentLongitude) => {
    Geocoder.init('AIzaSyCv3ww-4pSHJ0K9JXyQ6G64cf0uKfERgD8'); // use a valid API key
    const result = await Geocoder.from(currentLatitude, currentLongitude)
        .then(json => {
            const addressComponent = json.results[0];
            const Area =
                addressComponent.address_components[
                    addressComponent.address_components.length - 4
                ].long_name;
            const City =
                addressComponent.address_components[
                    addressComponent.address_components.length - 3
                ].long_name;
            let address = addressComponent.formatted_address
            let obj = {
                address: address,
                area: Area,
                city: City
            }
            return [address, Area, City];
        })
        .catch(error => {
            console.log(error);
            throw error;
        });

    return result;
};

export const combineDateAndTime = (date, time) => {
    const mins = ("0" + time.getMinutes()).slice(-2);
    const hours = ("0" + time.getHours()).slice(-2);
    const timeString = hours + ":" + mins + ":00";
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const dateString = "" + year + "-" + month + "-" + day;
    const datec = dateString + "T" + timeString;
    return new Date(datec).getTime();
}

export const getDistanceFromLatLonInKm = (lat1 = 0, long1 = 0, lat2 = 0, lon2 = 0) => {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - long1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = Math.round(d, 2)
    return d;
}

export const checkMeetingStatus = (timestamp) => {
    var now = new Date().getTime();
    var meetingTime = timestamp;
    if (now < meetingTime) {
        return false;
    }
    var diff = Math.abs(meetingTime - now);
    var minutes = Math.floor((diff / 1000) / 60);
    if (minutes <= 59) {
        return true;
    }
    else {
        return true;
    }
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

export const kMToLongitudes = (km, atLatitude) => {
    return km * 0.0089831 / Math.cos(degreesToRadians(atLatitude));
}

function degreesToRadians(angle) {
    return angle * (Math.PI / 180);
}