export const isEmailValid = (email) => /.+@.+\..+/.test(email);
export const isPasswordValid = (password) => password && password.length >= 6;
