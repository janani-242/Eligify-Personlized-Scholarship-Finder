
/* =========================================================
   ELIGIFY - RESET PASSWORD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GOOGLE APPS SCRIPT API
    ====================================================== */

    const API_URL =
        "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const resetForm =
        document.getElementById("resetPasswordForm");

    const newPassword =
        document.getElementById("newPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const passwordMessage =
        document.getElementById("passwordMessage");

    const message =
        document.getElementById("message");

    const toast =
        document.getElementById("toast");

    const resetButton =
        document.getElementById("resetPasswordButton");


    /* =====================================================
       GET TOKEN FROM URL
       reset-password.html?token=XXXXX
    ====================================================== */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const resetToken =
        urlParams.get("token");


    /* =====================================================
       MESSAGE FUNCTIONS
    ====================================================== */

    function showPasswordMessage(
        text,
        type = ""
    ) {

        if (!passwordMessage) return;

        passwordMessage.textContent =
            text;

        passwordMessage.className =
            "verification-message";

        if (type) {

            passwordMessage.classList.add(
                type
            );

        }

    }


    function showMessage(
        text,
        type = ""
    ) {

        if (!message) return;

        message.textContent =
            text;

        message.className = "";

        if (type) {

            message.classList.add(
                type
            );

        }

    }


    function showToast() {

        if (!toast) return;

        toast.classList.add(
            "show"
        );

        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);

    }


    /* =====================================================
       TOKEN CHECK
    ====================================================== */

    if (!resetToken) {

        showMessage(
            "Invalid or missing reset link.",
            "error"
        );

        if (resetButton) {

            resetButton.disabled =
                true;

        }

        return;

    }


    /* =====================================================
       PASSWORD VALIDATION
    ====================================================== */

    function validatePassword() {

        const password =
            newPassword.value;

        const confirm =
            confirmPassword.value;


        /* ---------------------------------------------
           EMPTY PASSWORD
        --------------------------------------------- */

        if (!password) {

            showPasswordMessage(
                "Please enter a new password.",
                "error"
            );

            return false;

        }


        /* ---------------------------------------------
           MINIMUM 6 CHARACTERS
        --------------------------------------------- */

        if (password.length < 6) {

            showPasswordMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return false;

        }


        /* ---------------------------------------------
           CONFIRM PASSWORD
        --------------------------------------------- */

        if (!confirm) {

            showPasswordMessage(
                "Please confirm your password.",
                "error"
            );

            return false;

        }


        /* ---------------------------------------------
           PASSWORD MATCH
        --------------------------------------------- */

        if (password !== confirm) {

            showPasswordMessage(
                "Passwords do not match.",
                "error"
            );

            return false;

        }


        /* ---------------------------------------------
           SUCCESS
        --------------------------------------------- */

        showPasswordMessage(
            "✓ Passwords match",
            "success"
        );

        return true;

    }


    /* =====================================================
       LIVE PASSWORD VALIDATION
    ====================================================== */

    if (newPassword) {

        newPassword.addEventListener(
            "input",
            () => {

                if (
                    confirmPassword.value.length > 0
                ) {

                    validatePassword();

                } else {

                    showPasswordMessage("");

                }

            }
        );

    }


    if (confirmPassword) {

        confirmPassword.addEventListener(
            "input",
            () => {

                if (
                    confirmPassword.value.length > 0
                ) {

                    validatePassword();

                } else {

                    showPasswordMessage("");

                }

            }
        );

    }


    /* =====================================================
       RESET PASSWORD API
    ====================================================== */

    async function resetPassword(
        password,
        confirm
    ) {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "resetPassword",

                            data: {

                                token:
                                    resetToken,

                                password:
                                    password,

                                confirmPassword:
                                    confirm

                            }

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Server connection failed."
            );

        }


        const result =
            await response.json();


        return result;

    }


    /* =====================================================
       FORM SUBMIT
    ====================================================== */

    if (resetForm) {

        resetForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                /* =========================================
                   TOKEN CHECK
                ========================================== */

                if (!resetToken) {

                    showMessage(
                        "Invalid or missing reset link.",
                        "error"
                    );

                    return;

                }


                /* =========================================
                   PASSWORD VALIDATION
                ========================================== */

                if (!validatePassword()) {

                    return;

                }


                const password =
                    newPassword.value;

                const confirm =
                    confirmPassword.value;


                /* =========================================
                   LOADING
                ========================================== */

                if (resetButton) {

                    resetButton.disabled =
                        true;

                    resetButton.textContent =
                        "Resetting...";

                }

                showMessage("");


                try {

                    /* =====================================
                       CALL BACKEND
                    ====================================== */

                    const result =
                        await resetPassword(
                            password,
                            confirm
                        );


                    /* =====================================
                       SUCCESS
                    ====================================== */

                    if (
                        result &&
                        result.success === true
                    ) {

                        showMessage(
                            result.message ||
                            "Password reset successfully.",
                            "success"
                        );


                        showToast();


                        /* Clear password fields */

                        newPassword.value =
                            "";

                        confirmPassword.value =
                            "";


                        showPasswordMessage("");


                        /* =================================
                           REDIRECT TO LOGIN
                        ================================== */

                        setTimeout(() => {

                            window.location.href =
                                "login.html";

                        }, 1800);


                        return;

                    }


                    /* =====================================
                       BACKEND ERROR
                    ====================================== */

                    showMessage(
                        result?.message ||
                        result?.error ||
                        "Unable to reset password. Please try again.",
                        "error"
                    );


                    if (resetButton) {

                        resetButton.disabled =
                            false;

                        resetButton.textContent =
                            "Reset Password";

                    }

                }


                catch (error) {

                    console.error(
                        "Reset Password Error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to connect to the server. Please try again.",
                        "error"
                    );


                    if (resetButton) {

                        resetButton.disabled =
                            false;

                        resetButton.textContent =
                            "Reset Password";

                    }

                }

            }
        );

    }

});
