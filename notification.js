/* =========================================================
   ELIGIFY | NOTIFICATION JS
   API FETCH • MULTI USER SAFE • LOGIN DATE
========================================================= */

"use strict";


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   DOM
========================================================= */

const notificationList =
    document.getElementById("notificationList");

const emptyNotification =
    document.getElementById("emptyNotification");

const clearAllBtn =
    document.getElementById("clearAllBtn");

const deletePopup =
    document.getElementById("deletePopup");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");

const clearAllPopup =
    document.getElementById("clearAllPopup");

const cancelClearAll =
    document.getElementById("cancelClearAll");

const confirmClearAll =
    document.getElementById("confirmClearAll");

const backBtn =
    document.getElementById("backBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const logoutPopup =
    document.getElementById("logoutPopup");

const cancelLogout =
    document.getElementById("cancelLogout");

const confirmLogout =
    document.getElementById("confirmLogout");


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {

    const keys = [
        "eligifyCurrentUser",
        "currentUser",
        "loggedInUser",
        "eligifyUser",
        "user"
    ];

    for (const key of keys) {

        const value = localStorage.getItem(key);

        if (!value) continue;

        try {

            const parsed = JSON.parse(value);

            if (parsed && typeof parsed === "object") {
                return parsed;
            }

        } catch {

            return {
                email: value
            };

        }
    }

    return null;
}


/* =========================================================
   USER ID
========================================================= */

function getUserId() {

    const user = getCurrentUser();

    return (
        localStorage.getItem("currentUserId") ||
        localStorage.getItem("userId") ||
        user?.id ||
        user?.UserId ||
        user?.userId ||
        ""
    );
}


/* =========================================================
   USER EMAIL
========================================================= */

function getUserEmail() {

    const user = getCurrentUser();

    return (
        localStorage.getItem("userEmail") ||
        user?.email ||
        user?.Email ||
        ""
    ).toString().trim().toLowerCase();
}


/* =========================================================
   LOGIN DATE
   -----------------------------------------
   This date is created when the user logs in.
   Notification page uses THIS date.
========================================================= */

function getLoginDate() {

    let loginDate =
        localStorage.getItem("eligifyLoginDate");

    if (loginDate) {
        return loginDate;
    }

    const user = getCurrentUser();

    loginDate =
        user?.loginDate ||
        user?.LoginDate ||
        user?.lastLogin ||
        user?.LastLogin ||
        "";

    if (loginDate) {
        return loginDate;
    }

    /*
       If login date was not saved by login.js,
       create it once for this login session.
    */

    loginDate = new Date().toISOString();

    localStorage.setItem(
        "eligifyLoginDate",
        loginDate
    );

    return loginDate;
}


/* =========================================================
   FORMAT LOGIN DATE
========================================================= */

function formatLoginDate(dateValue) {

    if (!dateValue) {
        return "Today";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Today";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   NOTIFICATION STORAGE KEY
========================================================= */

function getNotificationStorageKey() {

    const userId = getUserId();
    const email = getUserEmail();

    const identity =
        userId ||
        email ||
        "guest";

    return "eligifyUserNotifications_" + identity;
}


/* =========================================================
   READ LOCAL NOTIFICATIONS
========================================================= */

function getLocalNotifications() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    getNotificationStorageKey()
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];
    }
}


/* =========================================================
   SAVE LOCAL NOTIFICATIONS
========================================================= */

function saveLocalNotifications(notifications) {

    try {

        localStorage.setItem(
            getNotificationStorageKey(),
            JSON.stringify(notifications)
        );

    } catch (error) {

        console.warn(
            "Unable to save notifications:",
            error
        );

    }
}


/* =========================================================
   NOTIFICATION ID
========================================================= */

function getNotificationId(item) {

    return String(
        item?.id ||
        item?.ID ||
        (
            item?.title +
            "_" +
            item?.createdAt
        )
    );
}


/* =========================================================
   CHECK WHETHER NOTIFICATION BELONGS TO USER
========================================================= */

function isForCurrentUser(notification) {

    const userId =
        getUserId().toString().trim().toLowerCase();

    const email =
        getUserEmail();

    const target =
        (notification?.target || "")
            .toString()
            .trim()
            .toLowerCase();

    const notificationEmail =
        (notification?.email || "")
            .toString()
            .trim()
            .toLowerCase();

    const notificationUserId =
        (
            notification?.userId ||
            notification?.UserId ||
            ""
        )
            .toString()
            .trim()
            .toLowerCase();


    /* -----------------------------------------
       Global notification
    ----------------------------------------- */

    if (
        target === "all" ||
        target === "everyone" ||
        target === "users" ||
        target === ""
    ) {

        return true;
    }


    /* -----------------------------------------
       User ID match
    ----------------------------------------- */

    if (
        userId &&
        (
            target === userId ||
            notificationUserId === userId
        )
    ) {

        return true;
    }


    /* -----------------------------------------
       Email match
    ----------------------------------------- */

    if (
        email &&
        (
            target === email ||
            notificationEmail === email
        )
    ) {

        return true;
    }


    return false;
}


/* =========================================================
   FETCH NOTIFICATIONS FROM GOOGLE APPS SCRIPT
========================================================= */

async function fetchNotifications() {

    try {

        const response =
            await fetch(
                API_URL +
                "?type=notifications&_=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Notification API failed"
            );
        }


        const data =
            await response.json();


        let notifications = [];


        if (Array.isArray(data)) {

            notifications = data;

        } else if (
            Array.isArray(data.notifications)
        ) {

            notifications =
                data.notifications;

        } else if (
            Array.isArray(data.data)
        ) {

            notifications =
                data.data;
        }


        /*
           Only notifications intended for
           current user are displayed.
        */

        notifications =
            notifications
                .filter(isForCurrentUser);


        /*
           Newest notification first
        */

        notifications.sort(
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


        /*
           Save API result locally for this user.
        */

        saveLocalNotifications(
            notifications
        );


        return notifications;

    } catch (error) {

        console.error(
            "Notification fetch error:",
            error
        );

        /*
           If API temporarily fails,
           show the user's previous notifications.
        */

        return getLocalNotifications();
    }
}


/* =========================================================
   GET NOTIFICATION TYPE ICON
========================================================= */

function getNotificationIcon(type) {

    const value =
        (type || "")
            .toString()
            .toLowerCase();


    if (
        value.includes("scholar") ||
        value.includes("eligib")
    ) {

        return "ri-graduation-cap-line";
    }


    if (
        value.includes("success") ||
        value.includes("approved")
    ) {

        return "ri-checkbox-circle-line";
    }


    if (
        value.includes("warning") ||
        value.includes("alert")
    ) {

        return "ri-error-warning-line";
    }


    if (
        value.includes("review")
    ) {

        return "ri-chat-3-line";
    }


    return "ri-notification-3-line";
}


/* =========================================================
   RENDER NOTIFICATIONS
========================================================= */

function renderNotifications(
    notifications
) {

    if (!notificationList) {
        return;
    }


    notificationList.innerHTML = "";


    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        if (emptyNotification) {
            emptyNotification.style.display = "flex";
        }

        if (clearAllBtn) {
            clearAllBtn.style.display = "none";
        }

        return;
    }


    if (emptyNotification) {
        emptyNotification.style.display = "none";
    }

    if (clearAllBtn) {
        clearAllBtn.style.display = "inline-flex";
    }


    /*
       IMPORTANT:
       Notification date shown here is the
       USER LOGIN DATE, not API createdAt.
    */

    const loginDate =
        formatLoginDate(
            getLoginDate()
        );


    notifications.forEach(
        (notification, index) => {

            const id =
                getNotificationId(
                    notification
                );


            const title =
                notification.title ||
                notification.Title ||
                "Eligify Notification";


            const message =
                notification.message ||
                notification.Message ||
                "";


            const type =
                notification.type ||
                notification.Type ||
                "general";


            const isRead =
                notification.read === true ||
                notification.read === "true" ||
                notification.Read === true ||
                notification.Read === "true";


            const card =
                document.createElement("div");


            card.className =
                "notification-card" +
                (
                    isRead
                        ? ""
                        : " unread"
                );


            card.dataset.id = id;


            card.innerHTML = `
                <div class="notification-icon">
                    <i class="${escapeHTML(
                        getNotificationIcon(type)
                    )}"></i>
                </div>

                <div class="notification-body">

                    <div class="notification-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="notification-message">
                        ${escapeHTML(message)}
                    </div>

                    <div class="notification-date">
                        <i class="ri-calendar-line"></i>
                        ${escapeHTML(loginDate)}
                    </div>

                </div>

                <button
                    type="button"
                    class="notification-delete"
                    data-index="${index}"
                    aria-label="Delete notification">

                    <i class="ri-delete-bin-6-line"></i>

                </button>
            `;


            notificationList.appendChild(
                card
            );
        }
    );


    attachDeleteEvents();
}


/* =========================================================
   DELETE ONE NOTIFICATION
========================================================= */

let deleteIndex = null;


function attachDeleteEvents() {

    const buttons =
        document.querySelectorAll(
            ".notification-delete"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                deleteIndex =
                    Number(
                        this.dataset.index
                    );


                if (deletePopup) {
                    deletePopup.classList.add(
                        "show"
                    );
                }
            }
        );

    });
}


/* =========================================================
   CLOSE DELETE POPUP
========================================================= */

function closeDeletePopup() {

    deleteIndex = null;

    if (deletePopup) {
        deletePopup.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   CONFIRM DELETE
========================================================= */

if (confirmDelete) {

    confirmDelete.addEventListener(
        "click",
        function () {

            if (
                deleteIndex === null
            ) {
                closeDeletePopup();
                return;
            }


            const notifications =
                getLocalNotifications();


            if (
                deleteIndex >= 0 &&
                deleteIndex <
                notifications.length
            ) {

                notifications.splice(
                    deleteIndex,
                    1
                );


                saveLocalNotifications(
                    notifications
                );


                renderNotifications(
                    notifications
                );
            }


            closeDeletePopup();
        }
    );
}


/* =========================================================
   CANCEL DELETE
========================================================= */

if (cancelDelete) {

    cancelDelete.addEventListener(
        "click",
        closeDeletePopup
    );
}


/* =========================================================
   CLEAR ALL
========================================================= */

if (clearAllBtn) {

    clearAllBtn.addEventListener(
        "click",
        function () {

            if (clearAllPopup) {

                clearAllPopup.classList.add(
                    "show"
                );
            }
        }
    );
}


/* =========================================================
   CANCEL CLEAR ALL
========================================================= */

if (cancelClearAll) {

    cancelClearAll.addEventListener(
        "click",
        function () {

            if (clearAllPopup) {

                clearAllPopup.classList.remove(
                    "show"
                );
            }
        }
    );
}


/* =========================================================
   CONFIRM CLEAR ALL
========================================================= */

if (confirmClearAll) {

    confirmClearAll.addEventListener(
        "click",
        function () {

            saveLocalNotifications([]);


            renderNotifications([]);


            if (clearAllPopup) {

                clearAllPopup.classList.remove(
                    "show"
                );
            }

        }
    );
}


/* =========================================================
   BACK BUTTON
========================================================= */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );
}


/* =========================================================
   LOGOUT POPUP
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            if (logoutPopup) {

                logoutPopup.classList.add(
                    "show"
                );
            }
        }
    );
}


if (cancelLogout) {

    cancelLogout.addEventListener(
        "click",
        function () {

            if (logoutPopup) {

                logoutPopup.classList.remove(
                    "show"
                );
            }
        }
    );
}


/* =========================================================
   CONFIRM LOGOUT
========================================================= */

if (confirmLogout) {

    confirmLogout.addEventListener(
        "click",
        function () {

            /*
               Do NOT delete user notification data.
               It must remain available when the same
               user logs in again.
            */

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "currentUser"
            );

            localStorage.removeItem(
                "currentUserId"
            );

            localStorage.removeItem(
                "userEmail"
            );

            localStorage.removeItem(
                "eligifyCurrentUser"
            );

            localStorage.removeItem(
                "eligifyUser"
            );

            localStorage.removeItem(
                "eligifyLoginDate"
            );


            window.location.href =
                "login.html";
        }
    );
}


/* =========================================================
   CLOSE POPUPS WHEN CLICKING OUTSIDE
========================================================= */

[
    deletePopup,
    clearAllPopup,
    logoutPopup
].forEach(popup => {

    if (!popup) return;


    popup.addEventListener(
        "click",
        function (event) {

            if (
                event.target === popup
            ) {

                popup.classList.remove(
                    "show"
                );
            }

        }
    );

});


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        if (deletePopup) {
            deletePopup.classList.remove(
                "show"
            );
        }


        if (clearAllPopup) {
            clearAllPopup.classList.remove(
                "show"
            );
        }


        if (logoutPopup) {
            logoutPopup.classList.remove(
                "show"
            );
        }

    }
);


/* =========================================================
   PROFILE PHOTO
========================================================= */

function loadProfilePhoto() {

    const photo =
        localStorage.getItem(
            "profilePhoto"
        );


    const image =
        document.getElementById(
            "notificationProfilePhoto"
        );


    const icon =
        document.getElementById(
            "notificationProfileIcon"
        );


    if (
        photo &&
        image
    ) {

        image.src = photo;
        image.style.display = "block";

        if (icon) {
            icon.style.display = "none";
        }

    } else {

        if (image) {
            image.style.display = "none";
        }

        if (icon) {
            icon.style.display = "block";
        }
    }
}


/* =========================================================
   INITIAL LOAD
========================================================= */

async function initNotifications() {

    const user =
        getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    /*
       Get the login date before fetching.
       This date is what gets displayed.
    */

    getLoginDate();


    loadProfilePhoto();


    const notifications =
        await fetchNotifications();


    renderNotifications(
        notifications
    );
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initNotifications
);