document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       DOM ELEMENTS
    ========================= */

    const step1 =
        document.getElementById("step1");

    const step2 =
        document.getElementById("step2");

    const detailsForm =
        document.getElementById("detailsForm");

    const fullName =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const password =
        document.getElementById("password");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleConfirmPassword =
        document.getElementById("toggleConfirmPassword");

    const terms =
        document.getElementById("terms");

    const username =
        document.getElementById("username");

    const usernameStatus =
        document.getElementById("usernameStatus");

    const suggestionsBox =
        document.getElementById("suggestions");

    const backBtn =
        document.getElementById("backBtn");

    const createAccountBtn =
        document.getElementById("createAccountBtn");

    const strengthFill =
        document.getElementById("strengthFill");

    const strengthText =
        document.getElementById("strengthText");

    const ruleLength =
        document.getElementById("ruleLength");

    const ruleUpper =
        document.getElementById("ruleUpper");

    const ruleNumber =
        document.getElementById("ruleNumber");

    const ruleSpecial =
        document.getElementById("ruleSpecial");

    const passwordMatch =
        document.getElementById("passwordMatch");

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const loadingOverlay =
        document.getElementById("loadingOverlay");

    const stepTwoIndicator =
        document.getElementById("stepTwoIndicator");

    const progressSteps =
        document.querySelectorAll(".progress-step");

    const progressLine =
        document.querySelector(".progress-line");


    /* =========================
       GOOGLE APPS SCRIPT API
    ========================= */

    const API_URL =
        "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


    /* =========================
       VARIABLES
    ========================= */

    let usernameTimer = null;
    let toastTimer = null;
    let usernameRequestId = 0;


    /* =========================
       GENERATE UNIQUE USER ID
    ========================= */

    function generateUserId() {

        return (
            "ELG-" +
            Date.now()
                .toString(36)
                .toUpperCase() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase()
        );

    }


    /* =========================
       PASSWORD SHOW / HIDE
    ========================= */

    function setupPasswordToggle(
        input,
        button
    ) {

        if (!input || !button) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword
                        ? "text"
                        : "password";

                button.classList.toggle(
                    "fa-eye",
                    !isPassword
                );

                button.classList.toggle(
                    "fa-eye-slash",
                    isPassword
                );

            }
        );

    }


    setupPasswordToggle(
        password,
        togglePassword
    );

    setupPasswordToggle(
        confirmPassword,
        toggleConfirmPassword
    );


    /* =========================
       PASSWORD RULE
    ========================= */

    function updateRule(
        element,
        valid
    ) {

        if (!element) {
            return;
        }

        const icon =
            element.querySelector("i");

        element.classList.toggle(
            "valid",
            valid
        );

        element.classList.toggle(
            "invalid",
            !valid
        );

        if (icon) {

            icon.className =
                valid
                    ? "fa-solid fa-circle-check"
                    : "fa-solid fa-circle";

        }

    }


    /* =========================
       PASSWORD STRENGTH
    ========================= */

    function checkPasswordStrength() {

        if (!password) {
            return;
        }

        const value =
            password.value;

        const hasLength =
            value.length >= 8;

        const hasUpper =
            /[A-Z]/.test(value);

        const hasNumber =
            /[0-9]/.test(value);

        const hasSpecial =
            /[^A-Za-z0-9]/.test(value);


        updateRule(
            ruleLength,
            hasLength
        );

        updateRule(
            ruleUpper,
            hasUpper
        );

        updateRule(
            ruleNumber,
            hasNumber
        );

        updateRule(
            ruleSpecial,
            hasSpecial
        );


        let score = 0;

        if (hasLength) {
            score++;
        }

        if (hasUpper) {
            score++;
        }

        if (hasNumber) {
            score++;
        }

        if (hasSpecial) {
            score++;
        }


        if (
            !strengthFill ||
            !strengthText
        ) {
            return;
        }


        const levels = [

            {
                width: "0%",
                color: "#E5E7EB",
                text: "Password strength"
            },

            {
                width: "25%",
                color: "#EF4444",
                text: "Weak"
            },

            {
                width: "50%",
                color: "#F59E0B",
                text: "Fair"
            },

            {
                width: "75%",
                color: "#3B82F6",
                text: "Good"
            },

            {
                width: "100%",
                color: "#22C55E",
                text: "Strong"
            }

        ];


        const level =
            levels[score];


        strengthFill.style.width =
            level.width;

        strengthFill.style.background =
            level.color;

        strengthText.textContent =
            level.text;

    }


    /* =========================
       PASSWORD MATCH
    ========================= */

    function checkPasswordMatch() {

        if (
            !password ||
            !confirmPassword ||
            !passwordMatch
        ) {
            return;
        }


        if (
            confirmPassword.value === ""
        ) {

            passwordMatch.textContent = "";

            return;

        }


        if (
            password.value ===
            confirmPassword.value
        ) {

            passwordMatch.textContent =
                "✓ Passwords match";

            passwordMatch.style.color =
                "#22C55E";

        } else {

            passwordMatch.textContent =
                "✕ Passwords do not match";

            passwordMatch.style.color =
                "#EF4444";

        }

    }


    if (password) {

        password.addEventListener(
            "input",
            () => {

                checkPasswordStrength();
                checkPasswordMatch();

            }
        );

    }


    if (confirmPassword) {

        confirmPassword.addEventListener(
            "input",
            checkPasswordMatch
        );

    }


    /* =========================
       EMAIL VALIDATION
    ========================= */

    function validEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(
                String(value || "").trim()
            );

    }


    /* =========================
       PASSWORD VALIDATION
    ========================= */

    function validPassword() {

        if (!password) {
            return false;
        }

        const value =
            password.value;

        return (

            value.length >= 8 &&

            /[A-Z]/.test(value) &&

            /[0-9]/.test(value) &&

            /[^A-Za-z0-9]/.test(value)

        );

    }


    /* =========================
       USERNAME VALIDATION
       ALLOWED:
       LETTERS
       NUMBERS
       _
       .
    ========================= */

    function isValidUsername(value) {

        return /^[A-Za-z0-9_.]+$/.test(
            String(value || "").trim()
        );

    }


    /* =========================
       CLEAN USERNAME
       NO LENGTH LIMIT
    ========================= */

    function cleanUsername(value) {

        return String(value || "")
            .replace(
                /[^A-Za-z0-9_.]/g,
                ""
            );

    }


    /* =========================
       GET LOCAL USERS
    ========================= */

    function getExistingUsers() {

        try {

            const savedUsers =
                JSON.parse(
                    localStorage.getItem(
                        "eligifyUsers"
                    )
                );

            if (
                Array.isArray(savedUsers)
            ) {

                return savedUsers;

            }

        } catch (error) {

            console.error(
                "Error reading local users:",
                error
            );

        }

        return [];

    }


    /* =========================
       LOCAL EMAIL CHECK
    ========================= */

    function emailExistsLocal(value) {

        const normalizedEmail =
            String(value || "")
                .trim()
                .toLowerCase();


        const users =
            getExistingUsers();


        return users.some(
            user => {

                return (
                    user.email &&
                    String(user.email)
                        .trim()
                        .toLowerCase() ===
                    normalizedEmail
                );

            }
        );

    }


    /* =========================
       LOCAL USERNAME CHECK
    ========================= */

    function usernameExistsLocal(value) {

        const normalizedUsername =
            String(value || "")
                .trim()
                .toLowerCase();


        const users =
            getExistingUsers();


        return users.some(
            user => {

                return (
                    user.username &&
                    String(user.username)
                        .trim()
                        .toLowerCase() ===
                    normalizedUsername
                );

            }
        );

    }


    /* =========================
       GOOGLE SHEET USER CHECK
    ========================= */

    async function checkUserInAPI({
        emailValue = "",
        usernameValue = ""
    } = {}) {

        const params =
            new URLSearchParams();


        params.append(
            "type",
            "checkuser"
        );


        if (emailValue) {

            params.append(
                "email",
                String(emailValue)
                    .trim()
                    .toLowerCase()
            );

        }


        if (usernameValue) {

            params.append(
                "username",
                String(usernameValue)
                    .trim()
                    .toLowerCase()
            );

        }


        const response =
            await fetch(
                API_URL +
                "?" +
                params.toString(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to check account details."
            );

        }


        const result =
            await response.json();


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Unable to check account details."
            );

        }


        return result;

    }


    /* =========================
       EMAIL EXISTS
       LOCAL + GOOGLE SHEET
    ========================= */

    async function emailExists(
        value
    ) {

        const normalizedEmail =
            String(value || "")
                .trim()
                .toLowerCase();


        if (
            emailExistsLocal(
                normalizedEmail
            )
        ) {

            return true;

        }


        try {

            const result =
                await checkUserInAPI({
                    emailValue:
                        normalizedEmail
                });


            return (
                result.emailExists === true
            );

        } catch (error) {

            console.error(
                "Email check error:",
                error
            );

            throw error;

        }

    }


    /* =========================
       USERNAME EXISTS
       LOCAL + GOOGLE SHEET
    ========================= */

    async function usernameExists(
        value
    ) {

        const normalizedUsername =
            String(value || "")
                .trim()
                .toLowerCase();


        if (
            usernameExistsLocal(
                normalizedUsername
            )
        ) {

            return true;

        }


        try {

            const result =
                await checkUserInAPI({
                    usernameValue:
                        normalizedUsername
                });


            return (
                result.usernameExists === true
            );

        } catch (error) {

            console.error(
                "Username check error:",
                error
            );

            throw error;

        }

    }


    /* =========================
       STEP 1
    ========================= */

    if (detailsForm) {

        detailsForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const name =
                    fullName.value.trim();

                const mail =
                    email.value
                        .trim()
                        .toLowerCase();


                if (
                    name.length < 2
                ) {

                    showToast(
                        "Please enter your full name."
                    );

                    fullName.focus();

                    return;

                }


                if (
                    !validEmail(mail)
                ) {

                    showToast(
                        "Please enter a valid email address."
                    );

                    email.focus();

                    return;

                }


                /* =========================
                   EMAIL DUPLICATE CHECK
                ========================= */

                try {

                    showLoading();

                    const exists =
                        await emailExists(
                            mail
                        );


                    if (exists) {

                        hideLoading();

                        showToast(
                            "An account already exists with this email."
                        );

                        email.focus();

                        return;

                    }

                } catch (error) {

                    hideLoading();

                    showToast(
                        "Unable to verify this email right now. Please try again."
                    );

                    return;

                }


                if (
                    !validPassword()
                ) {

                    hideLoading();

                    showToast(
                        "Password does not meet all requirements."
                    );

                    password.focus();

                    return;

                }


                if (
                    password.value !==
                    confirmPassword.value
                ) {

                    hideLoading();

                    showToast(
                        "Passwords do not match."
                    );

                    confirmPassword.focus();

                    return;

                }


                if (
                    !terms.checked
                ) {

                    hideLoading();

                    showToast(
                        "Please accept the Terms & Conditions."
                    );

                    return;

                }


                hideLoading();


                step1.classList.add(
                    "hidden"
                );

                step2.classList.remove(
                    "hidden"
                );


                if (
                    progressSteps.length > 0
                ) {

                    progressSteps[0]
                        .classList.remove(
                            "active"
                        );

                    progressSteps[0]
                        .classList.add(
                            "completed"
                        );

                }


                if (
                    stepTwoIndicator
                ) {

                    stepTwoIndicator
                        .classList.add(
                            "active"
                        );

                }


                if (
                    progressLine
                ) {

                    progressLine
                        .classList.add(
                            "active"
                        );

                }


                generateSuggestions();


                setTimeout(
                    () => {

                        if (username) {

                            username.focus();

                        }

                    },
                    200
                );

            }
        );

    }


    /* =========================
       USERNAME CHECK
    ========================= */

    async function checkUsername() {

        if (
            !username ||
            !usernameStatus
        ) {
            return;
        }


        clearTimeout(
            usernameTimer
        );


        const requestId =
            ++usernameRequestId;


        const value =
            cleanUsername(
                username.value
            );


        username.value =
            value;


        /* =========================
           EMPTY
        ========================= */

        if (
            value.length === 0
        ) {

            usernameStatus.textContent =
                "Choose a unique username for your profile";

            return;

        }


        /* =========================
           INVALID CHARACTER
           SHOULD NOT NORMALLY HAPPEN
           BECAUSE CLEANING REMOVES THEM
        ========================= */

        if (
            !isValidUsername(value)
        ) {

            usernameStatus.innerHTML =
                '<span class="username-error">✕ Only letters, numbers, _ and . are allowed</span>';

            return;

        }


        usernameStatus.innerHTML =
            '<span class="checking">Checking username...</span>';


        usernameTimer =
            setTimeout(
                async () => {

                    try {

                        const exists =
                            await usernameExists(
                                value
                            );


                        /* Ignore old API response */

                        if (
                            requestId !==
                            usernameRequestId
                        ) {

                            return;

                        }


                        if (exists) {

                            usernameStatus.innerHTML =
                                '<span class="username-error">✕ Username already exists</span>';

                        } else {

                            usernameStatus.innerHTML =
                                '<span class="username-success">✓ Username available</span>';

                        }

                    } catch (error) {

                        if (
                            requestId !==
                            usernameRequestId
                        ) {

                            return;

                        }


                        console.error(
                            "Username check error:",
                            error
                        );


                        usernameStatus.innerHTML =
                            '<span class="username-error">Unable to check username</span>';

                    }

                },
                400
            );

    }


    if (username) {

        username.addEventListener(
            "input",
            checkUsername
        );


        /* =========================
           EXTRA INPUT PROTECTION
        ========================= */

        username.addEventListener(
            "input",
            function () {

                const cleaned =
                    this.value.replace(
                        /[^A-Za-z0-9_.]/g,
                        ""
                    );

                if (
                    this.value !== cleaned
                ) {

                    this.value =
                        cleaned;

                }

            }
        );

    }


    /* =========================
       USERNAME SUGGESTIONS
    ========================= */

    function generateSuggestions() {

        if (
            !suggestionsBox ||
            !fullName
        ) {
            return;
        }


        const base =
            fullName.value
                .trim()
                .toLowerCase()
                .replace(
                    /[^a-z0-9]/g,
                    ""
                )
                .slice(0, 12);


        if (!base) {

            suggestionsBox.innerHTML =
                "";

            return;

        }


        const suggestions = [

            `${base}_01`,
            `${base}.2026`,
            `${base}_study`,
            `${base}.edu`,
            `${base}_official`

        ];


        suggestionsBox.innerHTML =
            "";


        suggestions.forEach(
            suggestion => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";

                button.className =
                    "suggestion-btn";

                button.textContent =
                    "@" + suggestion;


                button.addEventListener(
                    "click",
                    () => {

                        username.value =
                            suggestion;

                        checkUsername();

                    }
                );


                suggestionsBox.appendChild(
                    button
                );

            }
        );

    }


    /* =========================
       BACK BUTTON
    ========================= */

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            () => {

                step2.classList.add(
                    "hidden"
                );

                step1.classList.remove(
                    "hidden"
                );


                if (
                    progressSteps.length > 0
                ) {

                    progressSteps[0]
                        .classList.remove(
                            "completed"
                        );

                    progressSteps[0]
                        .classList.add(
                            "active"
                        );

                }


                if (
                    stepTwoIndicator
                ) {

                    stepTwoIndicator
                        .classList.remove(
                            "active"
                        );

                }


                if (
                    progressLine
                ) {

                    progressLine
                        .classList.remove(
                            "active"
                        );

                }

            }
        );

    }


    /* =========================
       CREATE ACCOUNT BUTTON
    ========================= */

    if (createAccountBtn) {

        createAccountBtn.addEventListener(
            "click",
            async () => {

                const finalUsername =
                    cleanUsername(
                        username.value
                    );


                /* =========================
                   USERNAME REQUIRED
                ========================= */

                if (
                    finalUsername.length === 0
                ) {

                    showToast(
                        "Please choose a username."
                    );

                    username.focus();

                    return;

                }


                /* =========================
                   USERNAME CHARACTER CHECK
                ========================= */

                if (
                    !isValidUsername(
                        finalUsername
                    )
                ) {

                    usernameStatus.innerHTML =
                        '<span class="username-error">✕ Only letters, numbers, _ and . are allowed</span>';

                    username.focus();

                    return;

                }


                /* =========================
                   LOCAL DUPLICATE CHECK
                ========================= */

                if (
                    usernameExistsLocal(
                        finalUsername
                    )
                ) {

                    usernameStatus.innerHTML =
                        '<span class="username-error">✕ Username already exists</span>';

                    username.focus();

                    return;

                }


                /* =========================
                   GOOGLE SHEET DUPLICATE CHECK
                ========================= */

                try {

                    showLoading();


                    const result =
                        await checkUserInAPI({
                            usernameValue:
                                finalUsername
                        });


                    if (
                        result.usernameExists === true
                    ) {

                        hideLoading();

                        usernameStatus.innerHTML =
                            '<span class="username-error">✕ Username already exists</span>';

                        showToast(
                            "This username is already registered."
                        );

                        username.focus();

                        return;

                    }


                } catch (error) {

                    console.error(
                        "Final username check error:",
                        error
                    );

                    hideLoading();

                    showToast(
                        "Unable to verify username. Please try again."
                    );

                    return;

                }


                hideLoading();


                /* =========================
                   CREATE ACCOUNT
                ========================= */

                await createAccount(
                    finalUsername
                );

            }
        );

    }


    /* =========================
       CREATE & SAVE ACCOUNT
       GOOGLE SHEET + LOCAL STORAGE
    ========================= */

    async function createAccount(
        finalUsername
    ) {

        showLoading();


        const userId =
            generateUserId();


        const user = {

            /* =========================
               UNIQUE USER ID
            ========================= */

            id:
                userId,

            userId:
                userId,


            /* =========================
               BASIC DETAILS
            ========================= */

            name:
                fullName.value.trim(),

            email:
                email.value
                    .trim()
                    .toLowerCase(),

            username:
                finalUsername,


            /*
               PASSWORD IS ONLY USED
               FOR GOOGLE APPS SCRIPT.
               IT IS NOT SAVED IN
               LOCAL STORAGE.
            */

            password:
                password.value,


            /* =========================
               PROFILE DETAILS
            ========================= */

            bio: "",

            photo: "",


            /* =========================
               USER DATA
            ========================= */

            saved: [],

            recentlyViewed: [],

            history: [],


            /* =========================
               ACCOUNT INFO
            ========================= */

            createdAt:
                new Date()
                    .toISOString()

        };


        /* =========================
           FINAL EMAIL + USERNAME
           DUPLICATE CHECK
        ========================= */

        try {

            const duplicateCheck =
                await checkUserInAPI({
                    emailValue:
                        user.email,

                    usernameValue:
                        user.username
                });


            if (
                duplicateCheck.emailExists === true
            ) {

                hideLoading();

                showToast(
                    "An account already exists with this email."
                );

                return;

            }


            if (
                duplicateCheck.usernameExists === true
            ) {

                hideLoading();

                usernameStatus.innerHTML =
                    '<span class="username-error">✕ Username already exists</span>';

                username.focus();

                return;

            }

        } catch (error) {

            console.error(
                "Final duplicate check error:",
                error
            );

            hideLoading();

            showToast(
                "Unable to verify account details. Please try again."
            );

            return;

        }


        /* =========================
           SAVE USER TO GOOGLE SHEET
           PASSWORD SENT TO GAS
           GAS HASHES PASSWORD
        ========================= */

        try {

            const sheetPayload = {

                action:
                    "addUser",

                data: {

                    userId:
                        user.userId,

                    username:
                        user.username,

                    name:
                        user.name,

                    email:
                        user.email,

                    password:
                        user.password,

                    status:
                        "Active"

                }

            };


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
                            JSON.stringify(
                                sheetPayload
                            )
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Server returned an error."
                );

            }


            const result =
                await response.json();


            if (
                !result ||
                result.success !== true
            ) {

                /*
                   Backend duplicate protection
                   can still catch a race condition.
                */

                if (
                    result &&
                    result.usernameExists
                ) {

                    usernameStatus.innerHTML =
                        '<span class="username-error">✕ Username already exists</span>';

                    username.focus();

                }


                if (
                    result &&
                    result.emailExists
                ) {

                    showToast(
                        "An account already exists with this email."
                    );

                    email.focus();

                }


                throw new Error(
                    result &&
                    (
                        result.error ||
                        result.message
                    )
                        ? (
                            result.error ||
                            result.message
                        )
                        : "Unable to save account."
                );

            }


        } catch (error) {

            console.error(
                "Google Sheet user save error:",
                error
            );


            hideLoading();


            if (
                error.message &&
                (
                    error.message
                        .toLowerCase()
                        .includes("username")
                )
            ) {

                usernameStatus.innerHTML =
                    '<span class="username-error">✕ Username already exists</span>';

            } else {

                showToast(
                    "Unable to create account right now. Please try again."
                );

            }


            return;

        }


        /* =========================
           GET LOCAL USERS
        ========================= */

        const allUsers =
            getExistingUsers();


        /* =========================
           IMPORTANT:
           NEVER SAVE PASSWORD
           IN LOCAL STORAGE
        ========================= */

        const localUser = {

            id:
                user.id,

            userId:
                user.userId,

            name:
                user.name,

            email:
                user.email,

            username:
                user.username,

            bio:
                user.bio,

            photo:
                user.photo,

            saved:
                user.saved,

            recentlyViewed:
                user.recentlyViewed,

            history:
                user.history,

            createdAt:
                user.createdAt

        };


        /* =========================
           ADD NEW USER
        ========================= */

        allUsers.push(
            localUser
        );


        /* =========================
           SAVE USERS
        ========================= */

        localStorage.setItem(
            "eligifyUsers",
            JSON.stringify(
                allUsers
            )
        );


        /* =========================
           CURRENT USER
        ========================= */

        localStorage.setItem(
            "eligifyUser",
            JSON.stringify(
                localUser
            )
        );


        /* =========================
           COMPATIBILITY DATA
        ========================= */

        localStorage.setItem(
            "currentUserId",
            localUser.userId
        );

        localStorage.setItem(
            "fullName",
            localUser.name
        );

        localStorage.setItem(
            "email",
            localUser.email
        );

        localStorage.setItem(
            "username",
            localUser.username
        );


        /* =========================
           SUCCESS
        ========================= */

        setTimeout(
            () => {

                hideLoading();


                showToast(
                    "Account created successfully!"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );

            },
            500
        );

    }


    /* =========================
       TOAST
    ========================= */

    function showToast(
        message
    ) {

        if (!toast) {
            return;
        }


        if (toastMessage) {

            toastMessage.textContent =
                message;

        }


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toastTimer
        );


        toastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                3000
            );

    }


    /* =========================
       LOADING
    ========================= */

    function showLoading() {

        if (loadingOverlay) {

            loadingOverlay.classList.add(
                "show"
            );

        }

    }


    function hideLoading() {

        if (loadingOverlay) {

            loadingOverlay.classList.remove(
                "show"
            );

        }

    }


    /* =========================
       AUTO FOCUS
    ========================= */

    if (fullName) {

        fullName.focus();

    }

});