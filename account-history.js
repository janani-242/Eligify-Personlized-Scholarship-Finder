/* =========================================================
   ELIGIFY | ACCOUNT HISTORY
   GOOGLE SHEET • PROFESSIONAL • BUG-FIXED
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API
    ===================================================== */

    const API_URL =
        "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const accountsList =
        document.getElementById("accountsList");

    const emptyState =
        document.getElementById("emptyState");

    const accountCount =
        document.getElementById("accountCount");

    const loadingState =
        document.getElementById("loadingState");

    const errorState =
        document.getElementById("errorState");

    const errorMessage =
        document.getElementById("errorMessage");

    const retryBtn =
        document.getElementById("retryBtn");

    const historyInfo =
        document.getElementById("historyInfo");

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");


    /* =====================================================
       STATE
    ===================================================== */

    let allAccounts = [];

    let toastTimer = null;


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);

        return div.innerHTML;
    }


    /* =====================================================
       GET ACCOUNT NAME
    ===================================================== */

    function getAccountName(account) {

        return (
            account?.name ||
            account?.fullName ||
            account?.displayName ||
            account?.username ||
            "Unknown User"
        );
    }


    /* =====================================================
       GET USERNAME
    ===================================================== */

    function getUsername(account) {

        return (
            account?.username ||
            account?.userName ||
            "No username"
        );
    }


    /* =====================================================
       GET EMAIL
    ===================================================== */

    function getEmail(account) {

        return (
            account?.email ||
            account?.Email ||
            "No email"
        );
    }


    /* =====================================================
       GET STATUS
       Sheet value is displayed exactly.
    ===================================================== */

    function getStatus(account) {

        const status =
            String(
                account?.status ||
                account?.Status ||
                ""
            ).trim();

        return status || "Unknown";
    }


    /* =====================================================
       GET CREATED DATE
    ===================================================== */

    function getCreatedDate(account) {

        const value =
            account?.createdAt ||
            account?.CreatedAt ||
            "";

        if (!value) {
            return "Date unavailable";
        }

        const date =
            new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       GET INITIALS
    ===================================================== */

    function getInitials(name) {

        const cleanName =
            String(name || "")
                .trim();

        if (!cleanName) {
            return "U";
        }

        const words =
            cleanName
                .split(/\s+/)
                .filter(Boolean);

        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    }


    /* =====================================================
       SHOW LOADING
    ===================================================== */

    function showLoading() {

        if (loadingState) {
            loadingState.hidden = false;
        }

        if (accountsList) {
            accountsList.innerHTML = "";
            accountsList.hidden = true;
        }

        if (emptyState) {
            emptyState.hidden = true;
        }

        if (errorState) {
            errorState.hidden = true;
        }

        if (historyInfo) {
            historyInfo.hidden = false;
        }
    }


    /* =====================================================
       HIDE LOADING
    ===================================================== */

    function hideLoading() {

        if (loadingState) {
            loadingState.hidden = true;
        }

        if (accountsList) {
            accountsList.hidden = false;
        }
    }


    /* =====================================================
       SHOW ERROR
    ===================================================== */

    function showError(message) {

        if (loadingState) {
            loadingState.hidden = true;
        }

        if (accountsList) {
            accountsList.innerHTML = "";
            accountsList.hidden = true;
        }

        if (emptyState) {
            emptyState.hidden = true;
        }

        if (historyInfo) {
            historyInfo.hidden = true;
        }

        if (errorMessage) {
            errorMessage.textContent =
                message ||
                "We couldn't load the account history right now. Please try again.";
        }

        if (errorState) {
            errorState.hidden = false;
        }
    }


    /* =====================================================
       SHOW EMPTY
    ===================================================== */

    function showEmpty() {

        if (loadingState) {
            loadingState.hidden = true;
        }

        if (errorState) {
            errorState.hidden = true;
        }

        if (accountsList) {
            accountsList.innerHTML = "";
            accountsList.hidden = true;
        }

        if (emptyState) {
            emptyState.hidden = false;
        }

        if (historyInfo) {
            historyInfo.hidden = false;
        }
    }


    /* =====================================================
       FETCH USERS FROM GOOGLE SHEET
    ===================================================== */

    async function loadAccounts() {

        showLoading();

        try {

            const response =
                await fetch(
                    API_URL +
                    "?type=users&_=" +
                    Date.now(),
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Server returned HTTP " +
                    response.status
                );
            }


            const result =
                await response.json();


            console.log(
                "Eligify | Users API Response:",
                result
            );


            /* =================================================
               HANDLE BOTH POSSIBLE RESPONSE FORMATS
            ================================================= */

            let users = [];


            if (Array.isArray(result)) {

                users = result;

            } else if (
                result &&
                Array.isArray(result.users)
            ) {

                users = result.users;

            } else if (
                result &&
                Array.isArray(result.data)
            ) {

                users = result.data;

            } else if (
                result &&
                result.success === false
            ) {

                throw new Error(
                    result.error ||
                    "Unable to load users."
                );

            } else {

                users = [];
            }


            /* =================================================
               CLEAN USER DATA
            ================================================= */

            allAccounts =
                users.filter(
                    user =>
                        user &&
                        typeof user === "object"
                );


            /* =================================================
               COUNT
            ================================================= */

            if (accountCount) {

                accountCount.textContent =
                    allAccounts.length;
            }


            hideLoading();


            /* =================================================
               EMPTY
            ================================================= */

            if (allAccounts.length === 0) {

                showEmpty();

                return;
            }


            /* =================================================
               RENDER
            ================================================= */

            renderAccounts();


            showToast(
                allAccounts.length +
                " account" +
                (
                    allAccounts.length === 1
                        ? ""
                        : "s"
                ) +
                " loaded successfully"
            );

        } catch (error) {

            console.error(
                "Eligify | Account History Error:",
                error
            );

            showError(
                "Unable to connect to the account database. Please try again."
            );
        }
    }


    /* =====================================================
       RENDER ACCOUNTS
    ===================================================== */

    function renderAccounts() {

        if (!accountsList) {
            return;
        }


        accountsList.innerHTML = "";


        if (!allAccounts.length) {

            showEmpty();

            return;
        }


        accountsList.hidden = false;


        if (emptyState) {
            emptyState.hidden = true;
        }

        if (errorState) {
            errorState.hidden = true;
        }


        /* =================================================
           NEWEST ACCOUNT FIRST
        ================================================= */

        const accounts =
            [...allAccounts].sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.createdAt ||
                            a.CreatedAt ||
                            0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.createdAt ||
                            b.CreatedAt ||
                            0
                        ).getTime();

                    return dateB - dateA;
                }
            );


        accounts.forEach(account => {

            const name =
                getAccountName(account);

            const username =
                getUsername(account);

            const email =
                getEmail(account);

            const status =
                getStatus(account);

            const createdDate =
                getCreatedDate(account);

            const initials =
                getInitials(name);


            /* =================================================
               CARD
            ================================================= */

            const accountItem =
                document.createElement("article");

            accountItem.className =
                "account-item";


            accountItem.innerHTML = `

                <div
                    class="account-avatar"
                    aria-hidden="true"
                >
                    ${escapeHTML(initials)}
                </div>


                <div class="account-details">

                    <h3 class="account-name">
                        ${escapeHTML(name)}
                    </h3>


                    <p class="account-username">
                        @${escapeHTML(username)}
                    </p>


                    <p class="account-email">
                        ${escapeHTML(email)}
                    </p>


                    <div class="account-meta">

                        <span class="account-date">

                            <i
                                class="fa-regular fa-calendar"
                                aria-hidden="true"
                            ></i>

                            ${escapeHTML(createdDate)}

                        </span>


                        <span class="account-status">

                            ${escapeHTML(status)}

                        </span>

                    </div>

                </div>

            `;


            accountsList.appendChild(
                accountItem
            );

        });
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        if (!toast) {
            return;
        }

        if (toastMessage) {

            toastMessage.textContent =
                message;
        }

        toast.classList.add("show");


        clearTimeout(toastTimer);


        toastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2500
            );
    }


    /* =====================================================
       RETRY
    ===================================================== */

    if (retryBtn) {

        retryBtn.addEventListener(
            "click",
            () => {

                loadAccounts();

            }
        );
    }


    /* =====================================================
       STORAGE EVENT
       Only refresh the page when another tab changes.
       Google Sheet remains the main source.
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key === "eligifyUsers" ||
                event.key === "currentUser" ||
                event.key === "currentUserId"
            ) {

                loadAccounts();
            }

        }
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadAccounts();


    console.log(
        "Eligify | Account History Loaded Successfully"
    );

});