import validator from "validator";

export const validateEmail = (email) => {
  return validator.isEmail(email) && email.endsWith("@krmu.edu.in");
};

export const validatePassword = (password) => {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
};

export const validatePhoneNumber = (phoneNumber) => {
  return /^\d{10}$/.test(phoneNumber);
};

export const validateUsername = (username) => {
  return /^[A-Za-z]+$/.test(username);
};
