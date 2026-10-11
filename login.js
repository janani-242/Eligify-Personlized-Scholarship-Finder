document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       ELIGIFY
       LOGIN PAGE JAVASCRIPT
       ---------------------------------------------------------
       - Username or Email Login
       - Google Apps Script Server Login
       - Password Show / Hide
       - Existing localStorage Compatibility
       - Current User Storage
       - Profile / Saved / History Preservation
       - Browser Autofill Protection
    ========================================================= */


    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const API_URL =
        "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const loginForm =
        document.getElementById("loginForm");

    const loginIdentifier =
        document.getElementById("loginIdentifier");

    const passwordInput =
        document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");


    let toastTimer = null;


    /* =========================================================
       CHECK REQUIRED ELEMENTS
    ========================================================= */

    if (!loginForm) {

        console.error(
            "Eligify Login: loginForm not found."
        );

        return;
    }


    /* =========================================================
       AUTOFILL PROTECTION
    ========================================================= */

    if (loginIdentifier) {

        loginIdentifier.setAttribute(
            "autocomplete",
            "username"
        );

        loginIdentifier.setAttribute(
            "autocapitalize",
            "none"
        );

        loginIdentifier.setAttribute(
            "autocorrect",
            "off"
        );

        loginIdentifier.setAttribute(
            "spellcheck",
            "false"
        );

    }


    if (passwordInput) {

        passwordInput.setAttribute(
            "autocomplete",
            "current-password"
        );

    }


    /* =========================================================
       TOAST FUNCTION
    ========================================================= */

    function showToast(
        message,
        type = "success"
    ) {

        if (!toast || !toastMessage) {

            alert(message);

            return;
        }


        toastMessage.textContent =
            message;


        const icon =
            toast.querySelector("i");


        if (icon) {

            if (type === "error") {

                icon.className =
                    "fa-solid fa-circle-exclamation";

            } else {

                icon.className =
                    "fa-solid fa-circle-check";

            }

        }


        toast.classList.remove(
            "success",
            "error"
        );


        toast.classList.add(type);


        toast.classList.add("show");


        clearTimeout(toastTimer);


        toastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2500);

    }


    /* =========================================================
       PASSWORD SHOW / HIDE
    ========================================================= */

    if (
        togglePassword &&
        passwordInput
    ) {

        togglePassword.addEventListener(
            "click",
            () => {

                const passwordVisible =
                    passwordInput.type === "text";


                if (passwordVisible) {

                    passwordInput.type =
                        "password";


                    togglePassword.classList.remove(
                        "fa-eye-slash"
                    );


                    togglePassword.classList.add(
                        "fa-eye"
                    );

                } else {

                    passwordInput.type =
                        "text";


                    togglePassword.classList.remove(
                        "fa-eye"
                    );


                    togglePassword.classList.add(
                        "fa-eye-slash"
                    );

                }

            }
        );

    }


    /* =========================================================
       GET USERS FROM LOCAL STORAGE
       ---------------------------------------------------------
       Used only for preserving existing local data.
       Authentication is done by Google Apps Script.
    ========================================================= */

    function getUsers() {

        try {

            const storedUsers =
                localStorage.getItem(
                    "eligifyUsers"
                );


            if (!storedUsers) {

                return [];

            }


            const parsedUsers =
                JSON.parse(storedUsers);


            if (
                !Array.isArray(parsedUsers)
            ) {

                console.warn(
                    "eligifyUsers is not an array."
                );

                return [];

            }


            return parsedUsers;

        } catch (error) {

            console.error(
                "Unable to read eligifyUsers:",
                error
            );

            return [];

        }

    }


    /* =========================================================
       NORMALIZE VALUE
    ========================================================= */

    function normalize(value) {

        return String(
            value ?? ""
        )
            .trim()
            .toLowerCase();

    }


    /* =========================================================
       GET USERNAME
    ========================================================= */

    function getUsername(user) {

        return String(

            user.username ??
            user.userName ??
            user.user_name ??
            ""

        ).trim();

    }


    /* =========================================================
       GET EMAIL
    ========================================================= */

    function getEmail(user) {

        return String(

            user.email ??
            user.emailAddress ??
            user.emailId ??
            ""

        ).trim();

    }


    /* =========================================================
       FIND EXISTING LOCAL USER
       ---------------------------------------------------------
       This does NOT verify password.
       It is only used to preserve:
       - profile
       - photo
       - saved
       - history
       - recentlyViewed
       - other existing local data
    ========================================================= */

    function findLocalUser(
        identifier
    ) {

        const users =
            getUsers();


        const normalizedIdentifier =
            normalize(identifier);


        for (
            let i = 0;
            i < users.length;
            i++
        ) {

            const user =
                users[i];


            if (
                !user ||
                typeof user !== "object"
            ) {

                continue;

            }


            const username =
                normalize(
                    getUsername(user)
                );


            const email =
                normalize(
                    getEmail(user)
                );


            if (
                normalizedIdentifier ===
                username
            ) {

                return user;

            }


            if (
                normalizedIdentifier ===
                email
            ) {

                return user;

            }

        }


        return null;

    }


    /* =========================================================
       SAVE USERS
    ========================================================= */

    function saveUsers(users) {

        try {

            localStorage.setItem(
                "eligifyUsers",
                JSON.stringify(users)
            );

            return true;

        } catch (error) {

            console.error(
                "Unable to save users:",
                error
            );

            return false;

        }

    }


    /* =========================================================
       UPDATE LOCAL USER
       ---------------------------------------------------------
       Keeps existing localStorage data while syncing
       server account information.
    ========================================================= */

    function updateLocalUser(
        mergedUser,
        localMatchedUser
    ) {

        const users =
            getUsers();


        let foundIndex =
            -1;


        if (localMatchedUser) {

            foundIndex =
                users.indexOf(
                    localMatchedUser
                );

        }


        if (
            foundIndex === -1
        ) {

            const serverUserId =
                mergedUser.userId ||
                mergedUser.id;


            for (
                let i = 0;
                i < users.length;
                i++
            ) {

                const existing =
                    users[i];


                if (
                    existing &&
                    String(
                        existing.id ||
                        existing.userId ||
                        ""
                    ) ===
                    String(
                        serverUserId ||
                        ""
                    )
                ) {

                    foundIndex =
                        i;

                    break;

                }

            }

        }


        if (
            foundIndex !== -1
        ) {

            users[foundIndex] =
                mergedUser;

        } else {

            users.push(
                mergedUser
            );

        }


        saveUsers(
            users
        );

    }


    /* =========================================================
       MERGE SERVER USER + LOCAL USER
       ---------------------------------------------------------
       Server data is the source of truth for:
       - UserId
       - Username
       - Name
       - Email
       - CreatedAt
       - Status

       Local data is preserved for:
       - profile
       - photo
       - saved
       - recentlyViewed
       - history
       - eligibility data
       - other existing frontend fields
    ========================================================= */

    function mergeUserData(
        localUser,
        serverUser
    ) {

        const safeLocalUser =
            localUser &&
            typeof localUser === "object"
                ? localUser
                : {};


        const safeServerUser =
            serverUser &&
            typeof serverUser === "object"
                ? serverUser
                : {};


        const mergedUser = {

            ...safeLocalUser,

            ...safeServerUser

        };


        /* =====================================================
           ID COMPATIBILITY
        ===================================================== */

        const finalUserId =
            safeServerUser.userId ||
            safeServerUser.id ||
            safeLocalUser.userId ||
            safeLocalUser.id ||
            "";


        mergedUser.id =
            finalUserId;


        mergedUser.userId =
            finalUserId;


        /* =====================================================
           SERVER USERNAME
        ===================================================== */

        if (
            safeServerUser.username
        ) {

            mergedUser.username =
                safeServerUser.username;

        }


        /* =====================================================
           SERVER EMAIL
        ===================================================== */

        if (
            safeServerUser.email
        ) {

            mergedUser.email =
                safeServerUser.email;

        }


        /* =====================================================
           SERVER NAME
        ===================================================== */

        if (
            safeServerUser.name
        ) {

            mergedUser.name =
                safeServerUser.name;

        }


        /* =====================================================
           SERVER STATUS
        ===================================================== */

        if (
            safeServerUser.status
        ) {

            mergedUser.status =
                safeServerUser.status;

        }


        /* =====================================================
           IMPORTANT
           -----------------------------------------------------
           Do NOT replace local password with server response.
           Server never returns password.
        ===================================================== */

        return mergedUser;

    }


    /* =========================================================
       LOGIN BUTTON STATE
    ========================================================= */

    function setLoginLoading(
        loading
    ) {

        const submitButton =
            loginForm.querySelector(
                'button[type="submit"], input[type="submit"]'
            );


        if (!submitButton) {

            return;

        }


        if (loading) {

            submitButton.disabled =
                true;


            if (
                submitButton.tagName
                    .toLowerCase() ===
                "button"
            ) {

                submitButton.dataset.originalText =
                    submitButton.innerHTML;


                submitButton.innerHTML =
                    "Logging in...";

            }

        } else {

            submitButton.disabled =
                false;


            if (
                submitButton.tagName
                    .toLowerCase() ===
                "button" &&
                submitButton.dataset.originalText
            ) {

                submitButton.innerHTML =
                    submitButton.dataset.originalText;

                delete submitButton.dataset.originalText;

            }

        }

    }


    /* =========================================================
       SERVER LOGIN
       ---------------------------------------------------------
       Authentication happens ONLY here.
    ========================================================= */

    async function loginWithServer(
        identifier,
        password
    ) {

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
                                "login",

                            data: {

                                identifier:
                                    identifier,

                                password:
                                    password

                            }

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to connect to login server."
            );

        }


        const result =
            await response.json();


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(

                result &&
                result.error

                    ? result.error

                    : "Invalid username, email or password."

            );

        }


        if (
            !result.user ||
            typeof result.user !== "object"
        ) {

            throw new Error(
                "Invalid user data received from server."
            );

        }


        return result.user;

    }


    /* =========================================================
       LOGIN FORM SUBMIT
    ========================================================= */

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* =================================================
               GET INPUT VALUES
            ================================================= */

            const enteredIdentifier =
                normalize(
                    loginIdentifier
                        ? loginIdentifier.value
                        : ""
                );


            const enteredPassword =
                passwordInput
                    ? passwordInput.value
                    : "";


            /* =================================================
               EMPTY VALIDATION
            ================================================= */

            if (
                !enteredIdentifier ||
                !enteredPassword
            ) {

                showToast(
                    "Please fill in all fields.",
                    "error"
                );

                return;

            }


            /* =================================================
               SAVE EXISTING LOCAL USER REFERENCE
               -------------------------------------------------
               Only for preserving frontend data.
            ================================================= */

            const localMatchedUser =
                findLocalUser(
                    enteredIdentifier
                );


            /* =================================================
               DISABLE LOGIN
            ================================================= */

            setLoginLoading(
                true
            );


            try {

                /* =============================================
                   SERVER AUTHENTICATION
                ============================================= */

                const serverUser =
                    await loginWithServer(
                        enteredIdentifier,
                        enteredPassword
                    );


                /* =============================================
                   MERGE LOCAL + SERVER DATA
                ============================================= */

                const mergedUser =
                    mergeUserData(
                        localMatchedUser,
                        serverUser
                    );


                /* =============================================
                   UPDATE LOCAL USER LIST
                ============================================= */

                updateLocalUser(
                    mergedUser,
                    localMatchedUser
                );


                /* =============================================
                   SAVE CURRENT USER ID
                ============================================= */

                localStorage.setItem(
                    "currentUserId",
                    String(
                        mergedUser.userId ||
                        mergedUser.id
                    )
                );


                /* =============================================
                   SAVE CURRENT USER
                ============================================= */

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        mergedUser
                    )
                );


                /* =============================================
                   OLD COMPATIBILITY KEY
                ============================================= */

                localStorage.setItem(
                    "eligifyUser",
                    JSON.stringify(
                        mergedUser
                    )
                );


                /* =============================================
                   LOGIN STATUS
                ============================================= */

                localStorage.setItem(
                    "loggedIn",
                    "true"
                );


                localStorage.setItem(
                    "isLoggedIn",
                    "true"
                );


                /* =============================================
                   SAVE LOGIN TIME
                ============================================= */

                localStorage.setItem(
                    "loginTime",
                    new Date().toISOString()
                );


                /* =============================================
                   SUCCESS MESSAGE
                ============================================= */

                showToast(
                    "Login Successful!",
                    "success"
                );


                /* =============================================
                   REDIRECT
                ============================================= */

                setTimeout(
                    () => {

                        window.location.href =
                            "dashboard.html";

                    },
                    1000
                );

            }


            catch (error) {

                console.error(
                    "Eligify Login Error:",
                    error
                );


                let message =
                    error &&
                    error.message
                        ? error.message
                        : "Login failed. Please try again.";


                /* =============================================
                   CLEAN USER-FRIENDLY MESSAGES
                ============================================= */

                if (
                    message.includes(
                        "Failed to fetch"
                    )
                ) {

                    message =
                        "Unable to connect to server. Please check your internet connection.";

                }


                showToast(
                    message,
                    "error"
                );

            }


            finally {

                setLoginLoading(
                    false
                );

            }

        }
    );


    /* =========================================================
       ENTER KEY SUPPORT
    ========================================================= */

    if (loginIdentifier) {

        loginIdentifier.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();


                    if (passwordInput) {

                        passwordInput.focus();

                    }

                }

            }
        );

    }


    if (passwordInput) {

        passwordInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    loginForm.requestSubmit();

                }

            }
        );

    }


    /* =========================================================
       PAGE LOAD CHECK
    ========================================================= */

    console.log(
        "Eligify Login JS loaded successfully."
    );

    console.log(
        "Eligify Server Login: ENABLED"
    );

});