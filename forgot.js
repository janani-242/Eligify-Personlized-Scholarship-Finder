/* =========================================================
   ELIGIFY
   FORGOT PASSWORD JAVASCRIPT
   ---------------------------------------------------------
   - Logged-in user's email auto-fill
   - Memory icon human verification
   - Separate human verification message
   - Separate email verification message
   - Google Apps Script backend verification
   - Reset token generation
   - Redirect to reset-password.html
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       API CONFIGURATION
    ====================================================== */

    const API_URL =
        "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


    /* =====================================================
       GET ELEMENTS
    ====================================================== */

    const forgotForm =
        document.getElementById("forgotForm");

    const emailInput =
        document.getElementById("email");

    const memoryIcon =
        document.getElementById("memoryIcon");

    const memoryText =
        document.getElementById("memoryText");

    const memoryArea =
        document.getElementById("memoryArea");

    const iconOptions =
        document.getElementById("iconOptions");

    const verificationMessage =
        document.getElementById("verificationMessage");

    const emailMessage =
        document.getElementById("emailMessage");

    const resetButton =
        document.getElementById("resetButton");

    const toast =
        document.getElementById("toast");


    const iconButtons =
        document.querySelectorAll(".icon-option");


    /* =====================================================
       VARIABLES
    ====================================================== */

    let correctIcon = "";

    let humanVerified = false;

    let memoryTimer = null;


    /* =====================================================
       ICON LIST
    ====================================================== */

    const availableIcons = [
        "🔖",
        "💎",
        "🌿",
        "⭐",
        "🔐",
        "✨",
        "🟢",
        "🔵"
    ];


    /* =====================================================
       SHUFFLE
    ====================================================== */

    function shuffle(array) {

        const result =
            array.slice();


        for (
            let i = result.length - 1;
            i > 0;
            i--
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() * (i + 1)
                );


            const temp =
                result[i];


            result[i] =
                result[randomIndex];


            result[randomIndex] =
                temp;

        }


        return result;

    }


    /* =====================================================
       HUMAN VERIFICATION MESSAGE
    ====================================================== */

    function showVerificationMessage(
        message,
        type
    ) {

        if (!verificationMessage) {
            return;
        }


        verificationMessage.textContent =
            message;


        verificationMessage.classList.remove(
            "success",
            "error"
        );


        if (type) {

            verificationMessage.classList.add(
                type
            );

        }

    }


    /* =====================================================
       EMAIL MESSAGE
    ====================================================== */

    function showEmailMessage(
        message,
        type
    ) {

        if (!emailMessage) {
            return;
        }


        emailMessage.textContent =
            message;


        emailMessage.classList.remove(
            "success",
            "error"
        );


        if (type) {

            emailMessage.classList.add(
                type
            );

        }

    }


    /* =====================================================
       GENERATE MEMORY VERIFICATION
    ====================================================== */

    function generateMemoryVerification() {

        humanVerified =
            false;


        correctIcon =
            "";


        clearTimeout(
            memoryTimer
        );


        showVerificationMessage(
            "",
            ""
        );


        /* =================================================
           SHOW MEMORY AREA
        ================================================== */

        if (memoryArea) {

            memoryArea.style.display =
                "flex";

        }


        if (iconOptions) {

            iconOptions.style.display =
                "none";

        }


        if (memoryText) {

            memoryText.textContent =
                "Remember this icon";

        }


        /* =================================================
           SELECT RANDOM ICON
        ================================================== */

        const shuffled =
            shuffle(
                availableIcons
            );


        correctIcon =
            shuffled[0];


        /* =================================================
           DISPLAY MEMORY ICON
        ================================================== */

        if (memoryIcon) {

            memoryIcon.textContent =
                correctIcon;

        }


        /* =================================================
           CLEAR OPTIONS
        ================================================== */

        iconButtons.forEach(
            function (button) {

                button.textContent =
                    "";

                button.dataset.icon =
                    "";

                button.disabled =
                    false;

                button.classList.remove(
                    "selected",
                    "correct",
                    "wrong"
                );

            }
        );


        /* =================================================
           WAIT 2 SECONDS
        ================================================== */

        memoryTimer =
            setTimeout(
                function () {

                    /* =====================================
                       HIDE MEMORY
                    ====================================== */

                    if (memoryArea) {

                        memoryArea.style.display =
                            "none";

                    }


                    /* =====================================
                       CREATE OPTIONS
                    ====================================== */

                    const wrongIcons =
                        shuffled
                            .filter(
                                function (icon) {

                                    return icon !==
                                        correctIcon;

                                }
                            )
                            .slice(
                                0,
                                3
                            );


                    const options =
                        shuffle(
                            [
                                correctIcon,
                                ...wrongIcons
                            ]
                        );


                    /* =====================================
                       PUT ICONS INTO BUTTONS
                    ====================================== */

                    iconButtons.forEach(
                        function (
                            button,
                            index
                        ) {

                            const icon =
                                options[index];


                            button.textContent =
                                icon;


                            button.dataset.icon =
                                icon;


                            button.disabled =
                                false;


                            button.classList.remove(
                                "selected",
                                "correct",
                                "wrong"
                            );

                        }
                    );


                    /* =====================================
                       SHOW OPTIONS
                    ====================================== */

                    if (iconOptions) {

                        iconOptions.style.display =
                            "grid";

                    }


                    if (memoryText) {

                        memoryText.textContent =
                            "Select the icon you remember";

                    }

                },
                2000
            );

    }


    /* =====================================================
       ICON CLICK
    ====================================================== */

    iconButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    if (humanVerified) {
                        return;
                    }


                    const selectedIcon =
                        button.dataset.icon;


                    /* =====================================
                       WRONG ANSWER
                    ====================================== */

                    if (
                        selectedIcon !==
                        correctIcon
                    ) {

                        button.classList.add(
                            "wrong"
                        );


                        showVerificationMessage(
                            "Incorrect icon. Please try again.",
                            "error"
                        );


                        setTimeout(
                            function () {

                                button.classList.remove(
                                    "wrong"
                                );

                            },
                            600
                        );


                        return;

                    }


                    /* =====================================
                       CORRECT ANSWER
                    ====================================== */

                    humanVerified =
                        true;


                    button.classList.remove(
                        "wrong"
                    );


                    button.classList.add(
                        "correct"
                    );


                    iconButtons.forEach(
                        function (option) {

                            option.disabled =
                                true;

                        }
                    );


                    showVerificationMessage(
                        "Human verification successful ✓",
                        "success"
                    );

                }
            );

        }
    );


    /* =====================================================
       EMAIL VALIDATION
    ====================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =====================================================
       LOAD LOGGED-IN USER EMAIL
    ====================================================== */

    function loadLoginEmail() {

        if (!emailInput) {
            return;
        }


        let email =
            "";


        /* =================================================
           1. CURRENT USER
        ================================================== */

        try {

            const currentUserRaw =
                localStorage.getItem(
                    "currentUser"
                );


            if (currentUserRaw) {

                const currentUser =
                    JSON.parse(
                        currentUserRaw
                    );


                if (
                    currentUser &&
                    typeof currentUser ===
                    "object"
                ) {

                    email =
                        currentUser.email ||
                        currentUser.Email ||
                        "";

                }

            }

        }

        catch (error) {

            console.warn(
                "Unable to read currentUser:",
                error
            );

        }


        /* =================================================
           2. CURRENT USER EMAIL
        ================================================== */

        if (!email) {

            email =
                localStorage.getItem(
                    "currentUserEmail"
                ) ||
                "";

        }


        /* =================================================
           3. ELIGIFY USERS
        ================================================== */

        if (!email) {

            try {

                const currentUserId =
                    localStorage.getItem(
                        "currentUserId"
                    );


                const usersRaw =
                    localStorage.getItem(
                        "eligifyUsers"
                    );


                if (
                    currentUserId &&
                    usersRaw
                ) {

                    const users =
                        JSON.parse(
                            usersRaw
                        );


                    /* =====================================
                       FIXED SYNTAX
                    ====================================== */

                    if (Array.isArray(users)) {

                        const foundUser =
                            users.find(
                                function (user) {

                                    if (
                                        !user ||
                                        typeof user !==
                                        "object"
                                    ) {

                                        return false;

                                    }


                                    const userId =
                                        String(
                                            user.userId ||
                                            user.UserId ||
                                            user.id ||
                                            user.Id ||
                                            ""
                                        ).trim();


                                    return (
                                        userId ===
                                        String(
                                            currentUserId
                                        ).trim()
                                    );

                                }
                            );


                        if (foundUser) {

                            email =
                                foundUser.email ||
                                foundUser.Email ||
                                "";

                        }

                    }

                }

            }

            catch (error) {

                console.warn(
                    "Unable to read eligifyUsers:",
                    error
                );

            }

        }


        /* =================================================
           SET EMAIL
        ================================================== */

        if (email) {

            emailInput.value =
                String(
                    email
                )
                    .trim()
                    .toLowerCase();

        }

    }


    /* =====================================================
       TOAST
    ====================================================== */

    function showToast(message) {

        if (!toast) {
            return;
        }


        const toastText =
            toast.querySelector(
                "span"
            );


        if (toastText) {

            toastText.textContent =
                message;

        }


        toast.classList.add(
            "show"
        );


        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

    }


    /* =====================================================
       BACKEND REQUEST
    ====================================================== */

    async function sendResetRequest(email) {

        const response =
            await fetch(
                API_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "forgotPassword",

                            data: {

                                email:
                                    email

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

    if (forgotForm) {

        forgotForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                /* =========================================
                   CLEAR EMAIL MESSAGE
                ========================================== */

                showEmailMessage(
                    "",
                    ""
                );


                /* =========================================
                   HUMAN VERIFICATION
                ========================================== */

                if (!humanVerified) {

                    showVerificationMessage(
                        "Please complete the human verification.",
                        "error"
                    );


                    return;

                }


                /* =========================================
                   GET EMAIL
                ========================================== */

                const email =
                    String(
                        emailInput
                            ? emailInput.value
                            : ""
                    )
                        .trim()
                        .toLowerCase();


                /* =========================================
                   EMAIL REQUIRED
                ========================================== */

                if (!email) {

                    showEmailMessage(
                        "Please enter your email address.",
                        "error"
                    );


                    if (emailInput) {

                        emailInput.focus();

                    }


                    return;

                }


                /* =========================================
                   EMAIL FORMAT
                ========================================== */

                if (
                    !isValidEmail(
                        email
                    )
                ) {

                    showEmailMessage(
                        "Please enter a valid email address.",
                        "error"
                    );


                    if (emailInput) {

                        emailInput.focus();

                    }


                    return;

                }


                /* =========================================
                   DISABLE BUTTON
                ========================================== */

                const originalButtonText =
                    resetButton
                        ? resetButton.textContent
                        : "Send Reset Link";


                if (resetButton) {

                    resetButton.disabled =
                        true;


                    resetButton.textContent =
                        "Verifying Email...";

                }


                try {

                    /* =====================================
                       BACKEND EMAIL CHECK
                    ====================================== */

                    const result =
                        await sendResetRequest(
                            email
                        );


                    /* =====================================
                       EMAIL NOT FOUND
                    ====================================== */

                    if (
                        !result ||
                        result.success !== true
                    ) {

                        showEmailMessage(
                            "This email is not registered.",
                            "error"
                        );


                        if (resetButton) {

                            resetButton.disabled =
                                false;


                            resetButton.textContent =
                                originalButtonText;

                        }


                        return;

                    }


                    /* =====================================
                       EMAIL VERIFIED
                    ====================================== */

                    showEmailMessage(
                        "Email verified successfully ✓",
                        "success"
                    );


                    /* =====================================
                       GET TOKEN
                    ====================================== */

                    const token =
                        String(
                            result.token ||
                            ""
                        ).trim();


                    if (!token) {

                        throw new Error(
                            "Reset token was not generated."
                        );

                    }


                    /* =====================================
                       SUCCESS TOAST
                    ====================================== */

                    showToast(
                        "Email Verified Successfully"
                    );


                    /* =====================================
                       REDIRECT
                    ====================================== */

                    const resetURL =
                        "reset-password.html?token=" +
                        encodeURIComponent(
                            token
                        );


                    setTimeout(
                        function () {

                            window.location.href =
                                resetURL;

                        },
                        1000
                    );

                }

                catch (error) {

                    console.error(
                        "Eligify Forgot Password Error:",
                        error
                    );


                    showEmailMessage(
                        "Unable to verify email. Please try again.",
                        "error"
                    );


                    if (resetButton) {

                        resetButton.disabled =
                            false;


                        resetButton.textContent =
                            originalButtonText;

                    }

                }

            }
        );

    }


    /* =====================================================
       INITIALIZE
    ====================================================== */

    loadLoginEmail();

    generateMemoryVerification();


    /* =====================================================
       CONSOLE
    ====================================================== */

    console.log(
        "Eligify Forgot Password JS loaded successfully."
    );

});