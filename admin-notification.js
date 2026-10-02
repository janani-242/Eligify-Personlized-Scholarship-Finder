/* =========================================================
   ELIGIFY ADMIN NOTIFICATION
   ADMIN -> ALL USERS
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
    document.getElementById(
        "notificationForm"
    );


const titleInput =
    document.getElementById(
        "notificationTitle"
    );


const messageInput =
    document.getElementById(
        "notificationMessage"
    );


const targetInput =
    document.getElementById(
        "notificationTarget"
    );


const typeInput =
    document.getElementById(
        "notificationType"
    );


const sendButton =
    document.getElementById(
        "sendNotificationBtn"
    );


const previewTitle =
    document.getElementById(
        "previewTitle"
    );


const previewMessage =
    document.getElementById(
        "previewMessage"
    );


const previewType =
    document.getElementById(
        "previewType"
    );


const titleCount =
    document.getElementById(
        "titleCount"
    );


const messageCount =
    document.getElementById(
        "messageCount"
    );


const toast =
    document.getElementById(
        "toast"
    );


let toastTimer = null;


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updatePreview();

        setupEvents();

    }
);


/* =========================================================
   SETUP EVENTS
========================================================= */

function setupEvents() {

    /* -----------------------------------------------------
       TITLE PREVIEW
    ----------------------------------------------------- */

    if (titleInput) {

        titleInput.addEventListener(
            "input",
            updatePreview
        );

    }


    /* -----------------------------------------------------
       MESSAGE PREVIEW
    ----------------------------------------------------- */

    if (messageInput) {

        messageInput.addEventListener(
            "input",
            updatePreview
        );

    }


    /* -----------------------------------------------------
       TYPE PREVIEW
    ----------------------------------------------------- */

    if (typeInput) {

        typeInput.addEventListener(
            "change",
            updatePreview
        );

    }


    /* -----------------------------------------------------
       FORM SUBMIT
    ----------------------------------------------------- */

    if (form) {

        form.addEventListener(
            "submit",
            sendNotification
        );

    }


    /* -----------------------------------------------------
       BACK BUTTON
    ----------------------------------------------------- */

    const backBtn =
        document.getElementById(
            "backBtn"
        );


    if (backBtn) {

        backBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin-dashboard.html";

            }
        );

    }

}


/* =========================================================
   UPDATE PREVIEW
========================================================= */

function updatePreview() {

    const title =
        titleInput
            ? titleInput.value.trim()
            : "";


    const message =
        messageInput
            ? messageInput.value.trim()
            : "";


    const type =
        typeInput
            ? typeInput.value
            : "general";


    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    if (previewTitle) {

        previewTitle.innerText =
            title ||
            "Notification Title";

    }


    /* -----------------------------------------------------
       MESSAGE
    ----------------------------------------------------- */

    if (previewMessage) {

        previewMessage.innerText =
            message ||
            "Your notification message will appear here.";

    }


    /* -----------------------------------------------------
       TYPE
    ----------------------------------------------------- */

    if (previewType) {

        previewType.innerText =
            formatType(type);

    }


    /* -----------------------------------------------------
       TITLE COUNT
    ----------------------------------------------------- */

    if (titleCount) {

        const length =
            titleInput
                ? titleInput.value.length
                : 0;


        titleCount.innerText =
            `${length} / 100`;

    }


    /* -----------------------------------------------------
       MESSAGE COUNT
    ----------------------------------------------------- */

    if (messageCount) {

        const length =
            messageInput
                ? messageInput.value.length
                : 0;


        messageCount.innerText =
            `${length} / 1000`;

    }

}


/* =========================================================
   FORMAT TYPE
========================================================= */

function formatType(type) {

    if (!type) {
        return "General";
    }


    return String(type)
        .charAt(0)
        .toUpperCase() +
        String(type)
            .slice(1)
            .toLowerCase();

}


/* =========================================================
   SEND NOTIFICATION
========================================================= */

async function sendNotification(event) {

    if (event) {
        event.preventDefault();
    }


    if (
        !form ||
        !titleInput ||
        !messageInput
    ) {

        showToast(
            "Notification form not found"
        );

        return;

    }


    const title =
        titleInput.value.trim();


    const message =
        messageInput.value.trim();


    const target =
        targetInput
            ? targetInput.value
            : "all";


    const type =
        typeInput
            ? typeInput.value
            : "general";


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!title) {

        showToast(
            "Notification title is required"
        );

        titleInput.focus();

        return;

    }


    if (!message) {

        showToast(
            "Notification message is required"
        );

        messageInput.focus();

        return;

    }


    if (title.length > 100) {

        showToast(
            "Title must be within 100 characters"
        );

        return;

    }


    if (message.length > 1000) {

        showToast(
            "Message must be within 1000 characters"
        );

        return;

    }


    /* =====================================================
       NOTIFICATION OBJECT
    ===================================================== */

    const notification = {

        id:
            "notification_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(
                    2,
                    8
                ),

        title:
            title,

        message:
            message,

        target:
            target || "all",

        type:
            type || "general",

        read:
            false,

        createdAt:
            new Date().toISOString()

    };


    /* =====================================================
       BUTTON LOADING
    ===================================================== */

    setSendingState(true);


    try {

        console.log(
            "Sending notification:",
            notification
        );


        /* =================================================
           GOOGLE APPS SCRIPT REQUEST
        ================================================= */

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
                                "sendNotification",

                            data:
                                notification,

                            target:
                                target || "all"

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        /* =================================================
           READ RESPONSE
        ================================================= */

        let result = null;


        const responseText =
            await response.text();


        if (responseText) {

            try {

                result =
                    JSON.parse(
                        responseText
                    );

            }

            catch {

                result =
                    responseText;

            }

        }


        console.log(
            "Notification API Response:",
            result
        );


        /* =================================================
           CHECK API RESULT
        ================================================= */

        if (
            result &&
            typeof result === "object"
        ) {

            if (
                result.success === false ||
                result.status === "error"
            ) {

                throw new Error(
                    result.message ||
                    "Notification server rejected the request"
                );

            }

        }


        /* =================================================
           SAVE ADMIN COPY
        ================================================= */

        saveLocalNotification(
            notification
        );


        /* =================================================
           SUCCESS
        ================================================= */

        showToast(
            "Notification sent successfully"
        );


        /* =================================================
           RESET FORM
        ================================================= */

        form.reset();


        if (targetInput) {

            targetInput.value =
                "all";

        }


        if (typeInput) {

            typeInput.value =
                "general";

        }


        updatePreview();


    }

    catch (error) {

        console.error(
            "Notification Send Error:",
            error
        );


        showToast(
            "Notification server failed"
        );

    }

    finally {

        setSendingState(false);

    }

}


/* =========================================================
   BUTTON STATE
========================================================= */

function setSendingState(isSending) {

    if (!sendButton) {
        return;
    }


    if (isSending) {

        sendButton.disabled =
            true;


        sendButton.innerHTML =
            `
            <i class="ri-loader-4-line"></i>
            Sending...
            `;

    }

    else {

        sendButton.disabled =
            false;


        sendButton.innerHTML =
            `
            <i class="ri-send-plane-fill"></i>
            Send Notification
            `;

    }

}


/* =========================================================
   SAVE LOCAL ADMIN COPY
========================================================= */

function saveLocalNotification(
    notification
) {

    try {

        const stored =
            localStorage.getItem(
                "eligifyNotifications"
            );


        let notifications = [];


        if (stored) {

            try {

                notifications =
                    JSON.parse(
                        stored
                    );

            }

            catch {

                notifications = [];

            }

        }


        if (
            !Array.isArray(
                notifications
            )
        ) {

            notifications = [];

        }


        /*
           Prevent duplicate ID
        */

        notifications =
            notifications.filter(
                item =>
                    String(item.id) !==
                    String(notification.id)
            );


        notifications.unshift(
            notification
        );


        notifications =
            notifications.slice(
                0,
                50
            );


        localStorage.setItem(
            "eligifyNotifications",
            JSON.stringify(
                notifications
            )
        );


    }

    catch (error) {

        console.warn(
            "Local notification save failed:",
            error
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast) {
        return;
    }


    const span =
        toast.querySelector(
            "span"
        );


    if (span) {

        span.innerText =
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
            2800
        );

}


/* =========================================================
   GLOBAL FUNCTION
========================================================= */

window.sendNotification =
    sendNotification;


/* =========================================================
   END
========================================================= */