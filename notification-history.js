
/* =========================================================
   ELIGIFY | ADMIN NOTIFICATION HISTORY
   GOOGLE APPS SCRIPT -> NOTIFICATIONS SHEET
========================================================= */

"use strict";


/* =========================================================
   API
========================================================= */

const NOTIFICATION_API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   DOM
========================================================= */

const historySection =
    document.getElementById("historySection");

const historyCount =
    document.getElementById("historyCount");

const historySearch =
    document.getElementById("historySearch");

const historyFilter =
    document.getElementById("historyFilter");

const historyRefresh =
    document.getElementById("historyRefresh");

const historyList =
    document.getElementById("historyList");

const historyEmpty =
    document.getElementById("historyEmpty");

const statTotal =
    document.getElementById("statTotal");

const statToday =
    document.getElementById("statToday");

const statWeek =
    document.getElementById("statWeek");


/* =========================================================
   DATA
========================================================= */

let notificationHistory = [];


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupHistoryEvents();

        loadNotifications();

    }
);


/* =========================================================
   EVENTS
========================================================= */

function setupHistoryEvents() {

    if (historySearch) {

        historySearch.addEventListener(
            "input",
            renderNotifications
        );

    }


    if (historyFilter) {

        historyFilter.addEventListener(
            "change",
            renderNotifications
        );

    }


    if (historyRefresh) {

        historyRefresh.addEventListener(
            "click",
            loadNotifications
        );

    }

}


/* =========================================================
   LOAD FROM GOOGLE APPS SCRIPT
========================================================= */

async function loadNotifications() {

    showLoading();


    try {

        /*
           IMPORTANT:
           Code.gs uses:

           type === "notifications"

           NOT action=getNotifications
        */

        const url =
            NOTIFICATION_API_URL +
            "?type=notifications";


        console.log(
            "Loading notifications:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const text =
            await response.text();


        console.log(
            "Notification API response:",
            text
        );


        if (!text) {

            throw new Error(
                "Empty response from server"
            );

        }


        let result;


        try {

            result =
                JSON.parse(text);

        }

        catch (error) {

            throw new Error(
                "Invalid JSON response"
            );

        }


        /*
           Your Code.gs returns:

           [
              {
                 ID: "...",
                 Title: "...",
                 Message: "...",
                 Target: "...",
                 Type: "...",
                 Read: false,
                 CreatedAt: "...",
                 Email: "...",
                 UserId: "...",

                 id: "...",
                 title: "...",
                 ...
              }
           ]
        */


        if (
            result &&
            result.success === false
        ) {

            throw new Error(
                result.error ||
                result.message ||
                "Server returned an error"
            );

        }


        let records = [];


        if (Array.isArray(result)) {

            records = result;

        }

        else if (
            result &&
            Array.isArray(
                result.notifications
            )
        ) {

            records =
                result.notifications;

        }

        else if (
            result &&
            Array.isArray(
                result.data
            )
        ) {

            records =
                result.data;

        }


        notificationHistory =
            records
                .map(normalizeNotification)
                .filter(Boolean);


        /*
           Newest first
        */

        notificationHistory.sort(
            function (a, b) {

                return (
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
                );

            }
        );


        updateStatistics();


        renderNotifications();


        console.log(
            "Notifications loaded:",
            notificationHistory
        );

    }

    catch (error) {

        console.error(
            "Notification history error:",
            error
        );


        notificationHistory = [];


        updateStatistics();


        showError(
            "Unable to load notifications from Google Sheets."
        );

    }

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalizeNotification(item) {

    if (!item) {

        return null;

    }


    const id =
        item.id ||
        item.ID ||
        "";


    const title =
        item.title ||
        item.Title ||
        "";


    const message =
        item.message ||
        item.Message ||
        "";


    const target =
        item.target ||
        item.Target ||
        "all";


    const type =
        String(
            item.type ||
            item.Type ||
            "general"
        )
            .trim()
            .toLowerCase();


    const createdAt =
        item.createdAt ||
        item.CreatedAt ||
        "";


    const email =
        item.email ||
        item.Email ||
        "";


    const userId =
        item.userId ||
        item.UserId ||
        "";


    let read =
        item.read;


    if (
        read === undefined
    ) {

        read =
            item.Read;

    }


    read =
        read === true ||
        String(read).toLowerCase() === "true";


    return {

        id:
            String(id),

        title:
            String(title),

        message:
            String(message),

        target:
            String(target || "all")
                .toLowerCase(),

        type:
            type,

        read:
            read,

        createdAt:
            createdAt,

        email:
            String(email),

        userId:
            String(userId)

    };

}


/* =========================================================
   RENDER
========================================================= */

function renderNotifications() {

    if (!historyList) return;


    const search =
        historySearch
            ? historySearch.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        historyFilter
            ? historyFilter.value
                .trim()
                .toLowerCase()
            : "all";


    let filtered =
        notificationHistory.filter(
            function (notification) {

                const matchesSearch =
                    !search ||
                    notification.title
                        .toLowerCase()
                        .includes(search) ||
                    notification.message
                        .toLowerCase()
                        .includes(search) ||
                    notification.target
                        .toLowerCase()
                        .includes(search);


                const matchesFilter =
                    filter === "all" ||
                    notification.type === filter;


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    if (historyCount) {

        historyCount.innerText =
            filtered.length +
            (
                filtered.length === 1
                    ? " notification"
                    : " notifications"
            );

    }


    if (!filtered.length) {

        historyList.innerHTML = "";


        if (historyEmpty) {

            historyEmpty.style.display =
                "block";

        }

        return;

    }


    if (historyEmpty) {

        historyEmpty.style.display =
            "none";

    }


    historyList.innerHTML =
        filtered
            .map(createNotificationCard)
            .join("");

}


/* =========================================================
   CREATE CARD
========================================================= */

function createNotificationCard(
    notification
) {

    const type =
        notification.type ||
        "general";


    const icon =
        getNotificationIcon(type);


    const date =
        formatDate(
            notification.createdAt
        );


    const targetLabel =
        formatTarget(
            notification.target
        );


    return `
        <div class="history-item">

            <div class="history-icon type-${escapeHTML(type)}">

                <i class="${icon}"></i>

            </div>


            <div class="history-content">

                <div class="history-item-top">

                    <h3>
                        ${escapeHTML(
                            notification.title ||
                            "Untitled Notification"
                        )}
                    </h3>

                    <span class="history-badge">
                        ${escapeHTML(
                            formatType(type)
                        )}
                    </span>

                </div>


                <p class="history-message">
                    ${escapeHTML(
                        notification.message ||
                        ""
                    )}
                </p>


                <div class="history-meta">

                    <span>
                        <i class="ri-group-line"></i>
                        ${escapeHTML(
                            targetLabel
                        )}
                    </span>


                    <span>
                        <i class="ri-calendar-line"></i>
                        ${escapeHTML(date)}
                    </span>

                </div>

            </div>

        </div>
    `;

}


/* =========================================================
   ICON
========================================================= */

function getNotificationIcon(type) {

    switch (type) {

        case "scholarship":
            return "ri-graduation-cap-line";

        case "deadline":
            return "ri-time-line";

        case "announcement":
            return "ri-megaphone-line";

        case "update":
            return "ri-refresh-line";

        default:
            return "ri-notification-3-line";

    }

}


/* =========================================================
   TYPE FORMAT
========================================================= */

function formatType(type) {

    if (!type) {

        return "General";

    }


    return String(type)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, function (char) {

            return char.toUpperCase();

        });

}


/* =========================================================
   TARGET FORMAT
========================================================= */

function formatTarget(target) {

    if (!target) {

        return "All Users";

    }


    const value =
        String(target)
            .trim()
            .toLowerCase();


    if (
        value === "all" ||
        value === "users" ||
        value === "everyone"
    ) {

        return "All Users";

    }


    return target;

}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {

        return "Date unavailable";

    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return String(value);

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        notificationHistory.length;


    const now =
        new Date();


    const startOfToday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    /*
       Monday = start of week
    */

    const day =
        now.getDay();


    const difference =
        day === 0
            ? 6
            : day - 1;


    const startOfWeek =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() -
                difference
        );


    let today =
        0;

    let week =
        0;


    notificationHistory.forEach(
        function (notification) {

            const date =
                new Date(
                    notification.createdAt
                );


            if (
                isNaN(
                    date.getTime()
                )
            ) {

                return;

            }


            if (
                date >= startOfToday
            ) {

                today++;

            }


            if (
                date >= startOfWeek
            ) {

                week++;

            }

        }
    );


    if (statTotal) {

        statTotal.innerText =
            total;

    }


    if (statToday) {

        statToday.innerText =
            today;

    }


    if (statWeek) {

        statWeek.innerText =
            week;

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    if (!historyList) return;


    historyList.innerHTML = `
        <div class="history-loading">

            <i class="ri-loader-4-line"></i>

            <span>
                Loading notifications...
            </span>

        </div>
    `;


    if (historyEmpty) {

        historyEmpty.style.display =
            "none";

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    if (!historyList) return;


    historyList.innerHTML = `
        <div class="history-error">

            <i class="ri-error-warning-line"></i>

            <span>
                ${escapeHTML(message)}
            </span>

        </div>
    `;


    if (historyEmpty) {

        historyEmpty.style.display =
            "none";

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GLOBAL
========================================================= */

window.loadNotifications =
    loadNotifications;

