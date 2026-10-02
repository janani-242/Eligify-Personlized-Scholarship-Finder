// =========================================================
// ELIGIFY DASHBOARD JS
// FINAL + STABLE VERSION
// MULTI USER SAVED SYSTEM
// DASHBOARD + PROFILE SYNC
// OFFLINE PAGE
// EXPIRED DEADLINE SCHOLARSHIPS
// HIDDEN ADMIN ACCESS - CTRL + SHIFT + A
// =========================================================


const API_URL =
"https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


// =========================================================
// DOM ELEMENTS
// =========================================================

const deadlineContainer =
document.getElementById("deadlineContainer");

const popularContainer =
document.getElementById("popularContainer");

const cardLoader =
document.getElementById("cardLoader");

const dashboardApp =
document.getElementById("dashboardApp");

const offlinePage =
document.getElementById("offlinePage");

const retryConnection =
document.getElementById("retryConnection");


// =========================================================
// PROFILE PHOTO ELEMENTS
// =========================================================

const dashboardProfilePhoto =
document.getElementById(
    "dashboardProfilePhoto"
);

const dashboardProfileIcon =
document.getElementById(
    "dashboardProfileIcon"
);


// =========================================================
// ADMIN ELEMENTS
// IMPORTANT: DECLARE BEFORE USING
// =========================================================

const adminAccessOverlay =
document.getElementById(
    "adminAccessOverlay"
);

const adminAccessCode =
document.getElementById(
    "adminAccessCode"
);

const adminAccessSubmit =
document.getElementById(
    "adminAccessSubmit"
);

const closeAdminAccess =
document.getElementById(
    "closeAdminAccess"
);

const adminAccessError =
document.getElementById(
    "adminAccessError"
);


// =========================================================
// GLOBAL DATA
// =========================================================

let allScholarships = [];


// =========================================================
// OFFLINE PAGE
// =========================================================

function showOfflinePage() {

    if (dashboardApp) {

        dashboardApp.style.display = "none";

    }

    if (offlinePage) {

        offlinePage.classList.add("show");

    }

}


function hideOfflinePage() {

    if (offlinePage) {

        offlinePage.classList.remove("show");

    }

    if (dashboardApp) {

        dashboardApp.style.display = "";

    }

}


// =========================================================
// RETRY CONNECTION
// =========================================================

if (retryConnection) {

    retryConnection.addEventListener(
        "click",
        function () {

            if (!navigator.onLine) {

                return;

            }

            hideOfflinePage();

            loadScholarships();

        }
    );

}


// =========================================================
// INITIAL NETWORK CHECK
// =========================================================

if (!navigator.onLine) {

    showOfflinePage();

}


// =========================================================
// INITIAL PAGE LOAD
// =========================================================

window.addEventListener(
    "load",
    function () {

        if (!navigator.onLine) {

            showOfflinePage();

            return;

        }

        loadDashboardProfilePhoto();

        loadScholarships();

    }
);


// =========================================================
// LOAD SCHOLARSHIPS
// =========================================================

async function loadScholarships() {

    if (!navigator.onLine) {

        showOfflinePage();

        return;

    }

    try {

        if (cardLoader) {

            cardLoader.style.display = "grid";

        }


        const response =
        await fetch(
            API_URL,
            {
                method: "GET",
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "API Response Error: " +
                response.status
            );

        }


        const data =
        await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Scholarship data is not an array"
            );

        }


        allScholarships = data;


        if (cardLoader) {

            cardLoader.style.display = "none";

        }


        hideOfflinePage();


        renderDeadline();

        renderPopular();

        showRandomScholarship();

        updateSavedCount();

    }

    catch (error) {

        console.error(
            "SCHOLARSHIP LOAD ERROR:",
            error
        );


        if (cardLoader) {

            cardLoader.style.display = "none";

        }


        if (!navigator.onLine) {

            showOfflinePage();

            return;

        }


        showError(
            "Unable to load scholarships. Please try again."
        );

    }

}


// =========================================================
// DATE PARSER
// =========================================================

function parseDate(date) {

    if (
        !date ||
        String(date).trim() === ""
    ) {

        return null;

    }


    const value =
    String(date).trim();


    // -----------------------------------------
    // DD/MM/YYYY
    // -----------------------------------------

    if (value.includes("/")) {

        const parts =
        value.split("/");


        if (parts.length === 3) {

            const day =
            Number(parts[0]);

            const month =
            Number(parts[1]);

            const year =
            Number(parts[2]);


            const parsed =
            new Date(
                year,
                month - 1,
                day
            );


            if (
                !isNaN(parsed.getTime()) &&
                parsed.getFullYear() === year &&
                parsed.getMonth() === month - 1 &&
                parsed.getDate() === day
            ) {

                return parsed;

            }

        }

    }


    // -----------------------------------------
    // YYYY-MM-DD
    // -----------------------------------------

    if (value.includes("-")) {

        const parts =
        value.split("-");


        if (parts.length === 3) {

            const year =
            Number(parts[0]);

            const month =
            Number(parts[1]);

            const day =
            Number(parts[2]);


            const parsed =
            new Date(
                year,
                month - 1,
                day
            );


            if (
                !isNaN(parsed.getTime()) &&
                parsed.getFullYear() === year &&
                parsed.getMonth() === month - 1 &&
                parsed.getDate() === day
            ) {

                return parsed;

            }

        }

    }


    // -----------------------------------------
    // MONTH NAME
    // -----------------------------------------

    const months = {

        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11

    };


    if (months[value] !== undefined) {

        return new Date(
            new Date().getFullYear(),
            months[value],
            1
        );

    }


    // -----------------------------------------
    // NORMAL DATE
    // -----------------------------------------

    const parsed =
    new Date(value);


    return isNaN(parsed.getTime())
        ? null
        : parsed;

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(date) {

    if (
        !date ||
        String(date).trim() === ""
    ) {

        return "Not Available";

    }


    const parsed =
    parseDate(date);


    if (!parsed) {

        return "Not Available";

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// DEADLINE STATUS
// =========================================================

function getDeadlineStatus(date) {

    const deadline =
    parseDate(date);


    if (!deadline) {

        return {

            text: "Date Not Available",

            class: "active"

        };

    }


    const today =
    new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    deadline.setHours(
        0,
        0,
        0,
        0
    );


    if (deadline < today) {

        return {

            text: "Closed",

            class: "closed"

        };

    }


    const difference =
    deadline - today;


    const daysLeft =
    Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );


    if (daysLeft <= 7) {

        return {

            text: "Closing Soon",

            class: "urgent"

        };

    }


    return {

        text: "Active",

        class: "active"

    };

}


// =========================================================
// DEADLINE SECTION
// =========================================================

function renderDeadline() {

    if (!deadlineContainer) {

        return;

    }


    deadlineContainer.innerHTML = "";


    const today =
    new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const list =
    [...allScholarships]
    .filter(function (item) {

        const deadline =
        parseDate(
            item["Last Date"]
        );


        if (!deadline) {

            return false;

        }


        deadline.setHours(
            0,
            0,
            0,
            0
        );


        return deadline < today;

    })
    .sort(function (a, b) {

        const dateA =
        parseDate(
            a["Last Date"]
        );

        const dateB =
        parseDate(
            b["Last Date"]
        );


        if (!dateA && !dateB) {

            return 0;

        }


        if (!dateA) {

            return 1;

        }


        if (!dateB) {

            return -1;

        }


        return dateB - dateA;

    })
    .slice(0, 6);


    list.forEach(function (item) {

        deadlineContainer.appendChild(
            createCard(item)
        );

    });


    if (list.length === 0) {

        deadlineContainer.innerHTML = `

            <div class="empty-state">

                <p>
                    No closed scholarships available.
                </p>

            </div>

        `;

    }

}


// =========================================================
// POPULAR SCHOLARSHIPS
// =========================================================

function renderPopular() {

    if (!popularContainer) {

        return;

    }


    popularContainer.innerHTML = "";


    const list =
    [...allScholarships]
    .filter(function (item) {

        return (
            getDeadlineStatus(
                item["Last Date"]
            ).class !== "closed"
        );

    })
    .sort(function () {

        return Math.random() - 0.5;

    })
    .slice(0, 6);


    list.forEach(function (item) {

        popularContainer.appendChild(
            createCard(item)
        );

    });

}


// =========================================================
// SCHOLARSHIP ID
// =========================================================

function getScholarshipId(item) {

    if (!item) {

        return "";

    }


    return String(

        item.Id ??

        item.ID ??

        item.id ??

        item.scholarshipId ??

        item.scholarship_id ??

        item["Scholarship ID"] ??

        item["Scholarship Name"] ??

        item.name ??

        item.title ??

        ""

    );

}


// =========================================================
// CREATE SCHOLARSHIP CARD
// =========================================================

function createCard(item) {

    const card =
    document.createElement("div");


    card.className =
    "scholarship-card";


    const scholarshipId =
    getScholarshipId(item);


    const saved =
    isSaved(scholarshipId);


    const status =
    getDeadlineStatus(
        item["Last Date"]
    );


    const scholarshipName =
    item["Scholarship Name"] ||
    item.name ||
    item.title ||
    "Scholarship";


    const category =
    item["Category"] ||
    item.category ||
    "General";


    card.innerHTML = `

        <div class="status ${status.class}">

            ${
                status.class === "closed"
                ? "🔴 Closed"
                : status.class === "urgent"
                ? "🟠 Closing Soon"
                : "🟢 Active"
            }

        </div>


        <button
            class="save-btn ${saved ? "saved" : ""}"
            type="button"
            aria-label="Save scholarship">

            <i class="${
                saved
                ? "ri-heart-3-fill"
                : "ri-heart-3-line"
            }"></i>

        </button>


        <h3>
            ${escapeHTML(scholarshipName)}
        </h3>


        <div class="category-badge">

            ${escapeHTML(category)}

        </div>


        <div class="deadline">

            <i class="ri-calendar-line"></i>

            Last Date:

            ${formatDate(item["Last Date"])}

            <br>

            <small>
                ${escapeHTML(status.text)}
            </small>

        </div>


        <div class="card-actions">

            <button
                class="view-btn"
                type="button">

                View Details

            </button>

        </div>

    `;


    // -----------------------------------------
    // VIEW DETAILS
    // -----------------------------------------

    const viewBtn =
    card.querySelector(".view-btn");


    if (viewBtn) {

        viewBtn.addEventListener(
            "click",
            function () {

                localStorage.setItem(
                    "selectedScholarship",
                    JSON.stringify(item)
                );


                addRecentlyViewed(item);

                addHistory(item);


                window.location.href =
                "details.html";

            }
        );

    }


    // -----------------------------------------
    // SAVE
    // -----------------------------------------

    const saveButton =
    card.querySelector(".save-btn");


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                toggleSave(
                    item,
                    saveButton
                );

            }
        );

    }


    return card;

}


// =========================================================
// USERS
// =========================================================

function getUsers() {

    try {

        const data =
        localStorage.getItem(
            "eligifyUsers"
        );


        if (!data) {

            return [];

        }


        const users =
        JSON.parse(data);


        return Array.isArray(users)
            ? users
            : [];

    }

    catch (error) {

        console.error(
            "USER DATA ERROR:",
            error
        );


        return [];

    }

}


function saveUsers(users) {

    try {

        localStorage.setItem(
            "eligifyUsers",
            JSON.stringify(users)
        );

        return true;

    }

    catch (error) {

        console.error(
            "USER SAVE ERROR:",
            error
        );

        return false;

    }

}


// =========================================================
// CURRENT USER
// =========================================================

function getCurrentUser() {

    const currentUserId =
    localStorage.getItem(
        "currentUserId"
    );


    if (!currentUserId) {

        return null;

    }


    const users =
    getUsers();


    return users.find(function (user) {

        return String(user.id) ===
               String(currentUserId);

    }) || null;

}


// =========================================================
// GET SAVED SCHOLARSHIPS
// =========================================================

function getSaved() {

    const user =
    getCurrentUser();


    if (!user) {

        return [];

    }


    return Array.isArray(user.saved)
        ? user.saved
        : [];

}


// =========================================================
// CHECK SAVED
// =========================================================

function isSaved(id) {

    const saved =
    getSaved();


    const currentId =
    String(id);


    return saved.some(function (item) {

        return String(
            getScholarshipId(item)
        ) === currentId;

    });

}


// =========================================================
// TOGGLE SAVE
// =========================================================

function toggleSave(item, button) {

    const currentUserId =
    localStorage.getItem(
        "currentUserId"
    );


    if (!currentUserId) {

        showToast(
            "Please login first"
        );

        return;

    }


    const users =
    getUsers();


    const userIndex =
    users.findIndex(function (user) {

        return String(user.id) ===
               String(currentUserId);

    });


    if (userIndex === -1) {

        showToast(
            "User not found"
        );

        return;

    }


    const user =
    users[userIndex];


    if (!Array.isArray(user.saved)) {

        user.saved = [];

    }


    const itemId =
    getScholarshipId(item);


    const index =
    user.saved.findIndex(function (savedItem) {

        return String(
            getScholarshipId(savedItem)
        ) === String(itemId);

    });


    const icon =
    button
        ? button.querySelector("i")
        : null;


    // -----------------------------------------
    // REMOVE
    // -----------------------------------------

    if (index !== -1) {

        user.saved.splice(
            index,
            1
        );


        if (button) {

            button.classList.remove(
                "saved"
            );

        }


        if (icon) {

            icon.className =
            "ri-heart-3-line";

        }


        showToast(
            "Scholarship removed from Saved"
        );

    }


    // -----------------------------------------
    // SAVE
    // -----------------------------------------

    else {

        user.saved.unshift({
            ...item
        });


        if (button) {

            button.classList.add(
                "saved"
            );

        }


        if (icon) {

            icon.className =
            "ri-heart-3-fill";

        }


        showToast(
            "Scholarship saved successfully"
        );

    }


    users[userIndex] =
    user;


    const savedSuccessfully =
    saveUsers(users);


    if (!savedSuccessfully) {

        showToast(
            "Unable to save scholarship"
        );

        return;

    }


    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );


    localStorage.setItem(
        "savedScholarships",
        JSON.stringify(user.saved)
    );


    updateSavedCount();


    window.dispatchEvent(
        new CustomEvent(
            "eligifySavedUpdated",
            {
                detail: {
                    saved: user.saved
                }
            }
        )
    );

}


// =========================================================
// SAVED COUNT
// =========================================================

function updateSavedCount() {

    const count =
    getSaved().length;


    const ids = [

        "savedCount",
        "saveCount",
        "saved-count",
        "dashboardSavedCount"

    ];


    ids.forEach(function (id) {

        const element =
        document.getElementById(id);


        if (element) {

            element.textContent =
            count;

        }

    });

}


// =========================================================
// RECENTLY VIEWED
// =========================================================

function addRecentlyViewed(item) {

    const currentUserId =
    localStorage.getItem(
        "currentUserId"
    );


    if (!currentUserId) {

        return;

    }


    const users =
    getUsers();


    const userIndex =
    users.findIndex(function (user) {

        return String(user.id) ===
               String(currentUserId);

    });


    if (userIndex === -1) {

        return;

    }


    const user =
    users[userIndex];


    if (!Array.isArray(user.recentlyViewed)) {

        user.recentlyViewed = [];

    }


    const itemId =
    getScholarshipId(item);


    user.recentlyViewed =
    user.recentlyViewed.filter(
        function (viewedItem) {

            return String(
                getScholarshipId(
                    viewedItem
                )
            ) !== String(itemId);

        }
    );


    user.recentlyViewed.unshift({

        ...item,

        viewedAt:
        new Date().toISOString()

    });


    user.recentlyViewed =
    user.recentlyViewed.slice(
        0,
        20
    );


    users[userIndex] =
    user;


    saveUsers(users);


    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

}


// =========================================================
// HISTORY
// =========================================================

function addHistory(item) {

    const currentUserId =
    localStorage.getItem(
        "currentUserId"
    );


    if (!currentUserId) {

        return;

    }


    const users =
    getUsers();


    const userIndex =
    users.findIndex(function (user) {

        return String(user.id) ===
               String(currentUserId);

    });


    if (userIndex === -1) {

        return;

    }


    const user =
    users[userIndex];


    if (!Array.isArray(user.history)) {

        user.history = [];

    }


    const now =
    new Date().toISOString();


    const historyItem = {

        scholarship: {
            ...item
        },

        scholarshipId:
        getScholarshipId(item),

        scholarshipName:
        item["Scholarship Name"] ||
        item.name ||
        item.title ||
        "Scholarship",

        provider:
        item["Provider"] ||
        item.provider ||
        "Not Available",

        amount:
        item["Scholarship Amount"] ||
        item.amount ||
        "Not Available",

        category:
        item["Category"] ||
        item.category ||
        "Scholarship",

        viewedBy:
        user.name ||
        user.username ||
        "Unknown User",

        viewedByUsername:
        user.username ||
        "",

        date:
        now,

        viewedAt:
        now,

        checkedAt:
        now,

        result:
        "Viewed"

    };


    user.history.unshift(
        historyItem
    );


    user.history =
    user.history.slice(
        0,
        50
    );


    users[userIndex] =
    user;


    saveUsers(users);


    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

}


// =========================================================
// DID YOU KNOW
// =========================================================

function showRandomScholarship() {

    if (
        allScholarships.length === 0
    ) {

        return;

    }


    const random =
    allScholarships[
        Math.floor(
            Math.random() *
            allScholarships.length
        )
    ];


    const title =
    document.getElementById(
        "didTitle"
    );


    const text =
    document.getElementById(
        "didText"
    );


    if (title) {

        title.textContent =
        random["Scholarship Name"] ||
        random.name ||
        "Scholarship";

    }


    if (text) {

        text.textContent =

        (
            random["Category"] ||
            random.category ||
            "Scholarship"
        )

        + " • " +

        (
            random["Scholarship Amount"] ||
            random.amount ||
            "Financial Support"
        );

    }

}


setInterval(
    showRandomScholarship,
    60000
);


// =========================================================
// CATEGORY CARDS
// =========================================================

document
.querySelectorAll(".category-card")
.forEach(function (card) {

    card.addEventListener(
        "click",
        function () {

            const category =
            card.dataset.category;


            localStorage.setItem(
                "selectedCategory",
                category
            );


            window.location.href =
            "category.html";

        }
    );

});


// =========================================================
// SMART ELIGIBILITY
// =========================================================

const eligibilityBtn =
document.getElementById(
    "checkEligibility"
);


if (eligibilityBtn) {

    eligibilityBtn.addEventListener(
        "click",
        function () {

            window.location.href =
            "eligibility.html";

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

const logoutBtn =
document.getElementById(
    "logoutBtn"
);

const logoutPopup =
document.getElementById(
    "logoutPopup"
);

const cancelLogout =
document.getElementById(
    "cancelLogout"
);

const confirmLogout =
document.getElementById(
    "confirmLogout"
);


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            if (logoutPopup) {

                logoutPopup.style.display =
                "flex";

            }

        }
    );

}


if (cancelLogout) {

    cancelLogout.addEventListener(
        "click",
        function () {

            if (logoutPopup) {

                logoutPopup.style.display =
                "none";

            }

        }
    );

}


if (confirmLogout) {

    confirmLogout.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "loggedInUser"
            );


            localStorage.removeItem(
                "currentUser"
            );


            localStorage.removeItem(
                "currentUserId"
            );


            window.location.href =
            "login.html";

        }
    );

}


// =========================================================
// LOGOUT OUTSIDE CLICK
// =========================================================

window.addEventListener(
    "click",
    function (event) {

        if (
            logoutPopup &&
            event.target === logoutPopup
        ) {

            logoutPopup.style.display =
            "none";

        }

    }
);


// =========================================================
// AUTO REFRESH
// =========================================================

setInterval(
    loadScholarships,
    300000
);


// =========================================================
// INTERNET STATUS
// =========================================================

window.addEventListener(
    "offline",
    function () {

        showOfflinePage();

    }
);


window.addEventListener(
    "online",
    function () {

        hideOfflinePage();

        loadScholarships();

        loadDashboardProfilePhoto();

    }
);


// =========================================================
// TOAST
// =========================================================

function showToast(message) {

    const oldToast =
    document.querySelector(
        ".toast"
    );


    if (oldToast) {

        oldToast.remove();

    }


    const toast =
    document.createElement("div");


    toast.className =
    "toast";


    toast.textContent =
    message;


    document.body.appendChild(
        toast
    );


    setTimeout(
        function () {

            if (toast) {

                toast.remove();

            }

        },
        3000
    );

}


// =========================================================
// ERROR
// =========================================================

function showError(message) {

    if (!deadlineContainer) {

        return;

    }


    deadlineContainer.innerHTML = `

        <div class="error-box">

            <i class="ri-error-warning-line"></i>

            <h3>
                ${escapeHTML(message)}
            </h3>

        </div>

    `;

}


// =========================================================
// BOTTOM NAV ACTIVE
// =========================================================

document
.querySelectorAll(".bottom-nav a")
.forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            document
            .querySelectorAll(".bottom-nav a")
            .forEach(function (item) {

                item.classList.remove(
                    "active"
                );

            });


            link.classList.add(
                "active"
            );

        }
    );

});


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    const div =
    document.createElement(
        "div"
    );


    div.textContent =
    value == null
        ? ""
        : String(value);


    return div.innerHTML;

}


// =========================================================
// DASHBOARD PROFILE PHOTO
// =========================================================

function loadDashboardProfilePhoto() {

    const photoElement =
    dashboardProfilePhoto;

    const iconElement =
    dashboardProfileIcon;


    if (!photoElement || !iconElement) {

        return;

    }


    let user = null;


    const currentUserId =
    localStorage.getItem(
        "currentUserId"
    );


    // -----------------------------------------
    // GET USER FROM eligifyUsers
    // -----------------------------------------

    try {

        const users =
        JSON.parse(
            localStorage.getItem(
                "eligifyUsers"
            ) || "[]"
        );


        if (
            Array.isArray(users) &&
            currentUserId
        ) {

            user =
            users.find(function (item) {

                return String(item.id) ===
                       String(currentUserId);

            }) || null;

        }

    }

    catch (error) {

        console.error(
            "Dashboard profile photo error:",
            error
        );

    }


    // -----------------------------------------
    // FALLBACK TO currentUser
    // -----------------------------------------

    if (!user) {

        try {

            const storedUser =
            localStorage.getItem(
                "currentUser"
            );


            if (storedUser) {

                user =
                JSON.parse(
                    storedUser
                );

            }

        }

        catch (error) {

            console.error(
                "currentUser photo error:",
                error
            );

        }

    }


    // -----------------------------------------
    // GET PHOTO
    // -----------------------------------------

    const profilePhoto =
    user &&
    typeof user.photo === "string"
        ? user.photo.trim()
        : "";


    // -----------------------------------------
    // NO PHOTO
    // -----------------------------------------

    if (!profilePhoto) {

        photoElement.removeAttribute(
            "src"
        );


        photoElement.style.display =
        "none";


        iconElement.style.display =
        "block";


        return;

    }


    // -----------------------------------------
    // PREPARE IMAGE
    // -----------------------------------------

    photoElement.style.width =
    "44px";

    photoElement.style.height =
    "44px";

    photoElement.style.objectFit =
    "cover";

    photoElement.style.objectPosition =
    "center";

    photoElement.style.borderRadius =
    "50%";


    // -----------------------------------------
    // LOAD SUCCESS
    // -----------------------------------------

    photoElement.onload =
    function () {

        photoElement.style.display =
        "block";

        iconElement.style.display =
        "none";

    };


    // -----------------------------------------
    // LOAD ERROR
    // -----------------------------------------

    photoElement.onerror =
    function () {

        console.error(
            "Dashboard profile photo failed to load."
        );


        photoElement.removeAttribute(
            "src"
        );


        photoElement.style.display =
        "none";


        iconElement.style.display =
        "block";

    };


    // -----------------------------------------
    // SET PHOTO
    // -----------------------------------------

    photoElement.src =
    profilePhoto;

}


// =========================================================
// PROFILE PHOTO - INITIAL LOAD
// =========================================================

loadDashboardProfilePhoto();


// =========================================================
// PROFILE PHOTO - PAGESHOW
// =========================================================

window.addEventListener(
    "pageshow",
    function () {

        loadDashboardProfilePhoto();

    }
);


// =========================================================
// PROFILE PHOTO - STORAGE CHANGE
// =========================================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key === "eligifyUsers" ||
            event.key === "currentUser" ||
            event.key === "currentUserId"
        ) {

            loadDashboardProfilePhoto();

            updateSavedCount();

        }

    }
);


// =========================================================
// HIDDEN ADMIN ACCESS
// CTRL + SHIFT + A
// =========================================================

document.addEventListener(
    "keydown",
    function (event) {

        const isAdminShortcut =

            event.ctrlKey === true &&

            event.shiftKey === true &&

            event.code === "KeyA";


        if (!isAdminShortcut) {

            return;

        }


        event.preventDefault();

        event.stopPropagation();


        if (adminAccessOverlay) {

            adminAccessOverlay.classList.add(
                "show"
            );

        }


        if (adminAccessError) {

            adminAccessError.textContent =
            "";

        }


        if (adminAccessCode) {

            adminAccessCode.value =
            "";


            setTimeout(
                function () {

                    adminAccessCode.focus();

                },
                100
            );

        }

    },
    true
);


// =========================================================
// CLOSE ADMIN POPUP
// =========================================================

function closeAdminAccessPopup() {

    if (adminAccessOverlay) {

        adminAccessOverlay.classList.remove(
            "show"
        );

    }


    if (adminAccessCode) {

        adminAccessCode.value =
        "";

    }


    if (adminAccessError) {

        adminAccessError.textContent =
        "";

    }


    if (adminAccessSubmit) {

        adminAccessSubmit.disabled =
        false;

        adminAccessSubmit.textContent =
        "Continue";

    }

}


// =========================================================
// CLOSE ADMIN BUTTON
// =========================================================

if (closeAdminAccess) {

    closeAdminAccess.addEventListener(
        "click",
        closeAdminAccessPopup
    );

}


// =========================================================
// CLOSE ADMIN OUTSIDE CLICK
// =========================================================

if (adminAccessOverlay) {

    adminAccessOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                adminAccessOverlay
            ) {

                closeAdminAccessPopup();

            }

        }
    );

}


// =========================================================
// VERIFY ADMIN ACCESS
// =========================================================

function verifyAdminAccess() {

    const enteredCode =
    adminAccessCode
        ? adminAccessCode.value.trim()
        : "";


    const ADMIN_ACCESS_CODE =
    "AJS";


    // -----------------------------------------
    // EMPTY CODE
    // -----------------------------------------

    if (!enteredCode) {

        if (adminAccessError) {

            adminAccessError.textContent =
            "Please enter the access code.";

        }

        return;

    }


    // -----------------------------------------
    // INVALID CODE
    // -----------------------------------------

    if (
        enteredCode.toUpperCase() !==
        ADMIN_ACCESS_CODE
    ) {

        if (adminAccessError) {

            adminAccessError.textContent =
            "Invalid access code.";

        }


        if (adminAccessCode) {

            adminAccessCode.value =
            "";

            adminAccessCode.focus();

        }

        return;

    }


    // -----------------------------------------
    // VALID
    // -----------------------------------------

    if (adminAccessError) {

        adminAccessError.textContent =
        "";

    }


    if (adminAccessSubmit) {

        adminAccessSubmit.disabled =
        true;

        adminAccessSubmit.textContent =
        "Opening...";

    }


    setTimeout(
        function () {

            window.location.href =
            "admin-login.html";

        },
        300
    );

}


// =========================================================
// ADMIN SUBMIT BUTTON
// =========================================================

if (adminAccessSubmit) {

    adminAccessSubmit.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            verifyAdminAccess();

        }
    );

}


// =========================================================
// ENTER KEY IN ADMIN CODE
// =========================================================

if (adminAccessCode) {

    adminAccessCode.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                verifyAdminAccess();

            }

        }
    );

}


// =========================================================
// BACK BUTTON
// =========================================================

const backBtn =
document.getElementById("backBtn");


if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
            "index.html";

        }
    );

}


// =========================================================
// FINAL LOG
// =========================================================

console.log(
    "Eligify Dashboard Loaded Successfully"
);