import { ShowMessage } from '../../components/ShowMessage';

let regEmail = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
let regName = /^[a-zA-Z ]*$/;

export const checkValidation = (checkableValue) => checkableValue == null || String(checkableValue).trim() === '';

export const signupValidation = (name, email, dob, number, postalCode, ssn, address, city, state, country, password, genderFlag) => {
    if (checkValidation(name)) {
        ShowMessage("Please enter full name");
    } else if (name.length < 2) {
        ShowMessage("Please enter a full name with atleast 2 characters");
    } else if (regName.test(name) === false) {
        ShowMessage("Please enter alphabetic chracters only");
    } else if (checkValidation(email)) {
        ShowMessage("Please enter email");
    } else {
        const trimmedEmail = email.trim();
        if (regEmail.test(trimmedEmail) === false) {
            ShowMessage("Please enter valid email");
        } else if (checkValidation(dob)) {
            ShowMessage("Please select Date of Birth");
        } else if (checkValidation(number)) {
            ShowMessage("Please enter number");
        } else if (checkValidation(postalCode)) {
            ShowMessage("Please enter postal code");
        } else if (checkValidation(ssn)) {
            ShowMessage("Please enter socail security number");
        } else if (ssn?.length < 9) {
            ShowMessage("Please enter valid socail security number");
        } else if (checkValidation(address)) {
            ShowMessage("Please enter address");
        } else if (checkValidation(city)) {
            ShowMessage("Please enter city");
        } else if (checkValidation(state)) {
            ShowMessage("Please enter state");
        } else if (checkValidation(country)) {
            ShowMessage("Please select country");
        } else if (checkValidation(password)) {
            ShowMessage("Please enter password");
        } else if (password.length < 8) {
            ShowMessage("Password should be 8 characters");
        } else if (checkValidation(genderFlag)) {
            ShowMessage("Please select gender");
        } else {
            return true;
        }
    }
}
export const loginValidation = (email, password) => {
    if (checkValidation(email)) {
        ShowMessage("Please enter email");
    } else {
        const trimmedEmail = email.trim();
        if (regEmail.test(trimmedEmail) === false) {
            ShowMessage("Please enter valid email");
        } else if (checkValidation(password)) {
            ShowMessage("Please enter password");
        } else {
            return true;
        }
    }
}