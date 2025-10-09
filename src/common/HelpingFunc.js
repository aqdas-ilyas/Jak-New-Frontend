import { PermissionsAndroid, Platform } from 'react-native'
import ImagePicker from "react-native-image-crop-picker";
import S3 from 'aws-sdk/clients/s3';
import { decode } from 'base64-arraybuffer'
import { launchImageLibrary } from 'react-native-image-picker';
import { showMessage } from "react-native-flash-message";
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
var fs = require('react-native-fs');

export const ImageProfileSelectandUpload = (result) => {
    ImagePicker.openPicker({
        width: 300,
        height: 400,
        compressImageQuality: 1,
        cropping: true,
        writeTempFile: true,
        cropperCircleOverlay: true,
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
        cropping: true,
        writeTempFile: true,
        cropperCircleOverlay: true,
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
        region: 'ap-southeast-2',
        accessKeyId: 'AKIASFBTPUQ4SDJJCWBR',
        secretAccessKey: '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',
        Bucket: 'paisero',
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
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'The Designated app',
                    message:
                        'The Designated app wants to access your device location to track your current location upadtes.',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                const grantedBackground = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                    {
                        title: 'The Designated app',
                        message:
                            'The Designated app wants to access your device location to track your live location updates, even when the app is closed or not in use,',
                    },
                );
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