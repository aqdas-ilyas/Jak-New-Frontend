import Toast from "react-native-toast-message";

export const ShowMessage = (msg, position) => {
    Toast.show({
        type: "message",
        position: position ? position : "bottom",
        props: {
            body: msg,
        },
    });
};

export default ShowMessage;
