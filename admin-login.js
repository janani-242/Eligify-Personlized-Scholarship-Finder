document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       ELIGIFY ADMIN LOGIN
       ========================================================= */


    /* =============================
       ELEMENTS
    ============================= */

    const adminForm =
        document.getElementById("adminLoginForm");

    const adminEmail =
        document.getElementById("adminEmail");

    const adminPassword =
        document.getElementById("adminPassword");

    const togglePassword =
        document.getElementById("togglePassword");

    const toast =
        document.getElementById("toast");


    /* =============================
       PASSWORD SHOW / HIDE
    ============================= */

    if (
        togglePassword &&
        adminPassword
    ) {

        togglePassword.addEventListener(
            "click",
            () => {

                const isHidden =
                    adminPassword.type === "password";


                if (isHidden) {

                    adminPassword.type =
                        "text";

                    togglePassword.classList.remove(
                        "fa-eye"
                    );

                    togglePassword.classList.add(
                        "fa-eye-slash"
                    );

                } else {

                    adminPassword.type =
                        "password";

                    togglePassword.classList.remove(
                        "fa-eye-slash"
                    );

                    togglePassword.classList.add(
                        "fa-eye"
                    );

                }

            }
        );

    }


    /* =============================
       TOAST
    ============================= */

    function showToast(message) {

        if (!toast) {
            alert(message);
            return;
        }


        const text =
            toast.querySelector("span");


        if (text) {

            text.textContent =
                message;

        }


        toast.classList.add("show");


        clearTimeout(
            window.adminToastTimer
        );


        window.adminToastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2000
            );

    }


    /* =============================
       ADMIN LOGIN
    ============================= */

    if (adminForm) {

        adminForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const email =
                    adminEmail
                        ? adminEmail.value
                            .trim()
                            .toLowerCase()
                        : "";


                const password =
                    adminPassword
                        ? adminPassword.value
                        : "";


                /* =============================
                   EMPTY VALIDATION
                ============================= */

                if (
                    !email ||
                    !password
                ) {

                    showToast(
                        "Please fill all fields"
                    );

                    return;

                }


                /* =============================
                   ADMIN CREDENTIALS
                ============================= */

                const ADMIN_EMAIL =
                    "ajsadmin@eligify.com";

                const ADMIN_PASSWORD =
                    "AJS@242904";


                /* =============================
                   CHECK LOGIN
                ============================= */

                if (
                    email === ADMIN_EMAIL &&
                    password === ADMIN_PASSWORD
                ) {


                    /* =============================
                       SAVE ADMIN SESSION
                    ============================= */

                    const adminData = {

                        name:
                            "Eligify Admin",

                        email:
                            ADMIN_EMAIL

                    };


                    localStorage.setItem(
                        "eligifyAdmin",
                        JSON.stringify(
                            adminData
                        )
                    );


                    /* =============================
                       SUCCESS
                    ============================= */

                    showToast(
                        "Welcome Admin 👋"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "admin-dashboard.html";

                        },
                        1000
                    );


                } else {

                    /* =============================
                       LOGIN FAILED
                    ============================= */

                    showToast(
                        "Invalid Admin Login"
                    );

                }

            }
        );

    }


    /* =============================
       PREVENT AUTO LOGIN REDIRECT
       ON LOGIN PAGE
    ============================= */

    console.log(
        "Eligify Admin Login loaded successfully."
    );

});