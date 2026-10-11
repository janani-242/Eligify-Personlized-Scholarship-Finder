// ==========================================
// ELIGIFY SCHOLARSHIPS JS
// FINAL VERSION
// MULTI USER SAVED SYSTEM
// SEARCH + VIEW MORE
// DATE + STATUS FIX
// ==========================================


const API_URL =
"https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   ELEMENTS
========================================================= */

const scholarshipContainer =
    document.getElementById("scholarshipContainer");

const searchInput =
    document.getElementById("searchInput");

const viewMoreBtn =
    document.getElementById("viewMoreBtn");

const cardLoader =
    document.getElementById("cardLoader");


/* =========================================================
   DATA
========================================================= */

let scholarships = [];

let currentData = [];

let visibleCount = 10;


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener(
    "load",
    loadScholarships
);


/* =========================================================
   USERS
========================================================= */

function getUsers() {

    try {

        const data =
            localStorage.getItem(
                "eligifyUsers"
            );

        if (!data) return [];

        const users =
            JSON.parse(data);

        return Array.isArray(users)
            ? users
            : [];

    } catch (error) {

        console.error(
            "Error reading users:",
            error
        );

        return [];

    }

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

    } catch (error) {

        console.error(
            "Error saving users:",
            error
        );

    }

}


/* =========================================================
   CURRENT USER ID
========================================================= */

function getCurrentUserId() {

    return localStorage.getItem(
        "currentUserId"
    );

}


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {

    const userId =
        getCurrentUserId();

    if (!userId) return null;


    const users =
        getUsers();


    return users.find(
        function (user) {

            return (
                String(user.id) ===
                String(userId)
            );

        }
    ) || null;

}


/* =========================================================
   CURRENT USER SAVED
========================================================= */

function getCurrentUserSaved() {

    const user =
        getCurrentUser();


    if (!user) return [];


    return Array.isArray(user.saved)
        ? [...user.saved]
        : [];

}


/* =========================================================
   NORMALIZE KEY
========================================================= */

function normalizeKey(key) {

    return String(key || "")
        .toLowerCase()
        .replace(/[\s_\-]+/g, "")
        .trim();

}


/* =========================================================
   GET SCHOLARSHIP VALUE
========================================================= */

function getScholarshipValue(
    object,
    keys,
    fallback = ""
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return fallback;

    }


    /* -----------------------------------------
       EXACT KEY
    ----------------------------------------- */

    for (const key of keys) {

        if (
            Object.prototype.hasOwnProperty.call(
                object,
                key
            )
        ) {

            const value =
                object[key];


            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {

                return value;

            }

        }

    }


    /* -----------------------------------------
       NORMALIZED KEY
    ----------------------------------------- */

    const objectKeys =
        Object.keys(object);


    for (const wantedKey of keys) {

        const normalizedWanted =
            normalizeKey(wantedKey);


        for (const actualKey of objectKeys) {

            if (
                normalizeKey(actualKey) ===
                normalizedWanted
            ) {

                const value =
                    object[actualKey];


                if (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
                ) {

                    return value;

                }

            }

        }

    }


    return fallback;

}


/* =========================================================
   GET SCHOLARSHIP ID
========================================================= */

function getScholarshipId(item) {

    return getScholarshipValue(
        item,
        [
            "Id",
            "ID",
            "id",
            "Scholarship ID",
            "Scholarship Id",
            "scholarshipId",
            "scholarship_id"
        ],
        ""
    );

}


/* =========================================================
   GET SCHOLARSHIP NAME
========================================================= */

function getScholarshipName(item) {

    return getScholarshipValue(
        item,
        [
            "Scholarship Name",
            "scholarshipName",
            "name",
            "title",
            "Title"
        ],
        "Scholarship"
    );

}


/* =========================================================
   LOAD SCHOLARSHIPS
========================================================= */

async function loadScholarships() {

    try {

        if (cardLoader) {

            cardLoader.style.display =
                "flex";

        }


        if (scholarshipContainer) {

            scholarshipContainer.innerHTML =
                "";

        }


        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "API Error"
            );

        }


        const data =
            await response.json();


        console.log(
            "Scholarships:",
            data
        );


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid API response"
            );

        }


        scholarships =
            [...data];


        /* -----------------------------------------
           Random order
        ----------------------------------------- */

        scholarships.sort(
            function () {

                return Math.random() - 0.5;

            }
        );


        currentData =
            [...scholarships];


        visibleCount = 10;


        if (cardLoader) {

            cardLoader.style.display =
                "none";

        }


        displayScholarships();


    } catch (error) {

        console.error(
            "Scholarship loading error:",
            error
        );


        if (cardLoader) {

            cardLoader.style.display =
                "none";

        }


        if (scholarshipContainer) {

            scholarshipContainer.innerHTML = `

                <div class="error-box">

                    <h3>
                        Unable to load scholarships
                    </h3>

                </div>

            `;

        }

    }

}


/* =========================================================
   DATE STATUS
========================================================= */

function getStatus(dateValue) {

    const parsedDate =
        parseDateValue(dateValue);


    if (!parsedDate) {

        return {

            text: "Active",

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


    parsedDate.setHours(
        0,
        0,
        0,
        0
    );


    if (parsedDate < today) {

        return {

            text: "Closed",

            class: "closed"

        };

    }


    return {

        text: "Active",

        class: "active"

    };

}


/* =========================================================
   DISPLAY SCHOLARSHIPS
========================================================= */

function displayScholarships() {

    if (!scholarshipContainer) return;


    scholarshipContainer.innerHTML =
        "";


    const dataToShow =
        currentData.slice(
            0,
            visibleCount
        );


    if (
        dataToShow.length === 0
    ) {

        scholarshipContainer.innerHTML = `

            <div class="error-box">

                <h3>
                    No scholarships found
                </h3>

            </div>

        `;

    }


    dataToShow.forEach(
        function (item) {

            scholarshipContainer.appendChild(
                createCard(item)
            );

        }
    );


    /* -----------------------------------------
       VIEW MORE
    ----------------------------------------- */

    if (viewMoreBtn) {

        if (
            visibleCount <
            currentData.length
        ) {

            viewMoreBtn.style.display =
                "block";

        } else {

            viewMoreBtn.style.display =
                "none";

        }

    }

}


/* =========================================================
   CREATE SCHOLARSHIP CARD
========================================================= */

function createCard(item) {

    const card =
        document.createElement("div");


    card.className =
        "scholarship-card";


    const saved =
        isSaved(item);


    const lastDate =
        getScholarshipValue(
            item,
            [
                "Last Date",
                "lastDate",
                "last_date",
                "Application Deadline",
                "applicationDeadline",
                "deadline",
                "Deadline",
                "End Date",
                "endDate"
            ],
            ""
        );


    const category =
        getScholarshipValue(
            item,
            [
                "Category",
                "category"
            ],
            "General"
        );


    const name =
        getScholarshipName(item);


    const status =
        getStatus(lastDate);


    card.innerHTML = `

        <div class="status ${status.class}">

            ${
                status.class === "closed"
                    ? "🔴 Closed"
                    : "🟢 Active"
            }

        </div>


        <button
            class="save-btn ${saved ? "saved" : ""}"
            type="button"
            aria-label="${
                saved
                    ? "Remove from saved"
                    : "Save scholarship"
            }"
        >

            <i class="${
                saved
                    ? "ri-heart-3-fill"
                    : "ri-heart-3-line"
            }"></i>

        </button>


        <h3>
            ${escapeHTML(name)}
        </h3>


        <div class="category-badge">
            ${escapeHTML(category)}
        </div>


        <div class="deadline">

            <i class="ri-calendar-line"></i>

            Last Date :

            ${escapeHTML(
                formatDateValue(lastDate)
            )}

        </div>


        <div class="card-actions">

            <button
                class="view-btn"
                type="button"
            >
                View Details
            </button>

        </div>

    `;


    /* =====================================================
       VIEW DETAILS
    ===================================================== */

    const viewBtn =
        card.querySelector(
            ".view-btn"
        );


    if (viewBtn) {
    viewBtn.onclick = function () {

        localStorage.setItem(
            "selectedScholarship",
            JSON.stringify(item)
        );

        addRecentlyViewed(item);

        window.location.href = "details.html";
    };
}


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    const saveBtn =
        card.querySelector(
            ".save-btn"
        );


    if (saveBtn) {

        saveBtn.onclick =
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                toggleSave(
                    item,
                    saveBtn
                );

            };

    }


    return card;

}


/* =========================================================
   CHECK SAVED
========================================================= */

function isSaved(item) {

    const id =
        getScholarshipId(item);


    if (!id) {

        return false;

    }


    const saved =
        getCurrentUserSaved();


    return saved.some(
        function (savedItem) {

            const savedId =
                getScholarshipId(
                    savedItem
                );


            return (
                String(savedId) ===
                String(id)
            );

        }
    );

}
/* =========================================================
   ADD RECENTLY VIEWED
========================================================= */

function addRecentlyViewed(item) {

    const user = getCurrentUser();

    if (!user) return;

    const users = getUsers();

    const userIndex = users.findIndex(
        function (userItem) {
            return (
                String(userItem.id) ===
                String(user.id)
            );
        }
    );

    if (userIndex === -1) return;

    let recentlyViewed =
        Array.isArray(
            users[userIndex].recentlyViewed
        )
            ? [...users[userIndex].recentlyViewed]
            : [];

    const id = getScholarshipId(item);

    recentlyViewed =
        recentlyViewed.filter(
            function (oldItem) {
                return (
                    String(
                        getScholarshipId(oldItem)
                    ) !== String(id)
                );
            }
        );

    recentlyViewed.unshift(item);

    recentlyViewed =
        recentlyViewed.slice(0, 20);

    users[userIndex] = {
        ...users[userIndex],
        recentlyViewed: recentlyViewed
    };

    saveUsers(users);
}

/* =========================================================
   TOGGLE SAVE
========================================================= */

function toggleSave(
    item,
    button
) {

    const user =
        getCurrentUser();


    /* -----------------------------------------
       LOGIN CHECK
    ----------------------------------------- */

    if (!user) {

        showToast(
            "Please login to save scholarships"
        );

        return;

    }


    const id =
        getScholarshipId(item);


    if (!id) {

        showToast(
            "Scholarship ID not found"
        );

        console.error(
            "Scholarship ID missing:",
            item
        );

        return;

    }


    const users =
        getUsers();


    const userIndex =
        users.findIndex(
            function (userItem) {

                return (
                    String(userItem.id) ===
                    String(user.id)
                );

            }
        );


    if (userIndex === -1) {

        showToast(
            "User account not found"
        );

        return;

    }


    let saved =
        Array.isArray(
            users[userIndex].saved
        )
            ? [
                ...users[userIndex].saved
            ]
            : [];


    const existingIndex =
        saved.findIndex(
            function (savedItem) {

                const savedId =
                    getScholarshipId(
                        savedItem
                    );


                return (
                    String(savedId) ===
                    String(id)
                );

            }
        );


    /* -----------------------------------------
       REMOVE
    ----------------------------------------- */

    if (existingIndex !== -1) {

        saved.splice(
            existingIndex,
            1
        );


        users[userIndex] = {

            ...users[userIndex],

            saved: saved

        };


        saveUsers(users);


        updateSaveButton(
            button,
            false
        );


        showToast(
            "Scholarship removed from Saved"
        );

    }


    /* -----------------------------------------
       ADD
    ----------------------------------------- */

    else {

        saved.unshift(item);


        saved =
            saved.slice(
                0,
                50
            );


        users[userIndex] = {

            ...users[userIndex],

            saved: saved

        };


        saveUsers(users);


        updateSaveButton(
            button,
            true
        );


        showToast(
            "Scholarship saved successfully"
        );

    }

}


/* =========================================================
   UPDATE SAVE BUTTON
========================================================= */

function updateSaveButton(
    button,
    saved
) {

    if (!button) return;


    const icon =
        button.querySelector("i");


    if (!icon) return;


    if (saved) {

        button.classList.add(
            "saved"
        );


        button.setAttribute(
            "aria-label",
            "Remove from saved"
        );


        icon.className =
            "ri-heart-3-fill";

    }

    else {

        button.classList.remove(
            "saved"
        );


        button.setAttribute(
            "aria-label",
            "Save scholarship"
        );


        icon.className =
            "ri-heart-3-line";

    }

}


/* =========================================================
   VIEW MORE
========================================================= */

if (viewMoreBtn) {

    viewMoreBtn.onclick =
        function () {

            visibleCount += 10;

            displayScholarships();

        };

}


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const value =
                String(
                    searchInput.value || ""
                )
                    .toLowerCase()
                    .trim();


            if (value === "") {

                currentData =
                    [...scholarships];

            }

            else {

                currentData =
                    scholarships.filter(
                        function (item) {

                            const name =
                                getScholarshipName(
                                    item
                                )
                                    .toLowerCase();


                            const category =
                                getScholarshipValue(
                                    item,
                                    [
                                        "Category",
                                        "category"
                                    ],
                                    ""
                                )
                                    .toLowerCase();


                            return (
                                name.includes(value) ||
                                category.includes(value)
                            );

                        }
                    );

            }


            visibleCount = 10;


            displayScholarships();

        }
    );

}


/* =========================================================
   DATE PARSER
========================================================= */

function parseDateValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;

    }


    const raw =
        String(value).trim();


    if (
        !raw ||
        raw === "-" ||
        raw.toLowerCase() === "null" ||
        raw.toLowerCase() === "undefined"
    ) {

        return null;

    }


    /* -----------------------------------------
       GOOGLE SHEETS SERIAL
    ----------------------------------------- */

    if (
        /^\d+(\.\d+)?$/.test(raw)
    ) {

        const serial =
            Number(raw);


        if (
            serial >= 1 &&
            serial < 100000
        ) {

            const date =
                new Date(
                    Date.UTC(
                        1899,
                        11,
                        30
                    ) +
                    serial * 86400000
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                const year =
                    date.getUTCFullYear();


                if (
                    year >= 1900 &&
                    year <= 2100
                ) {

                    return new Date(
                        year,
                        date.getUTCMonth(),
                        date.getUTCDate()
                    );

                }

            }

        }

    }


    /* -----------------------------------------
       YYYY-MM-DD
    ----------------------------------------- */

    let match =
        raw.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        return createValidDate(
            Number(match[1]),
            Number(match[2]),
            Number(match[3])
        );

    }


    /* -----------------------------------------
       YYYY/MM/DD
    ----------------------------------------- */

    match =
        raw.match(
            /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/
        );


    if (match) {

        return createValidDate(
            Number(match[1]),
            Number(match[2]),
            Number(match[3])
        );

    }


    /* -----------------------------------------
       DD-MM-YYYY
    ----------------------------------------- */

    match =
        raw.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );


    if (match) {

        return createValidDate(
            Number(match[3]),
            Number(match[2]),
            Number(match[1])
        );

    }


    /* -----------------------------------------
       DD/MM/YYYY
    ----------------------------------------- */

    match =
        raw.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        return createValidDate(
            Number(match[3]),
            Number(match[2]),
            Number(match[1])
        );

    }


    /* -----------------------------------------
       ISO DATETIME
    ----------------------------------------- */

    const isoMatch =
        raw.match(
            /^(\d{4})-(\d{2})-(\d{2})T/
        );


    if (isoMatch) {

        return createValidDate(
            Number(isoMatch[1]),
            Number(isoMatch[2]),
            Number(isoMatch[3])
        );

    }


    /* -----------------------------------------
       NORMAL JS DATE
    ----------------------------------------- */

    const parsed =
        new Date(raw);


    if (
        !Number.isNaN(
            parsed.getTime()
        )
    ) {

        const year =
            parsed.getFullYear();


        if (
            year >= 1900 &&
            year <= 2100
        ) {

            return parsed;

        }

    }


    return null;

}


/* =========================================================
   CREATE VALID DATE
========================================================= */

function createValidDate(
    year,
    month,
    day
) {

    if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2100
    ) {

        return null;

    }


    if (
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
    ) {

        return null;

    }


    if (
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31
    ) {

        return null;

    }


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {

        return null;

    }


    return date;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateValue(value) {

    const date =
        parseDateValue(value);


    if (!date) {

        return "-";

    }


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        date.toLocaleString(
            "en-IN",
            {
                month: "short"
            }
        );


    const year =
        date.getFullYear();


    return (
        day +
        " " +
        month +
        " " +
        year
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ONLINE / OFFLINE
========================================================= */

window.addEventListener(
    "offline",
    function () {

        showToast(
            "No Internet Connection"
        );

    }
);


window.addEventListener(
    "online",
    function () {

        showToast(
            "Connection Restored"
        );


        loadScholarships();

    }
);


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.createElement("div");


    toast.className =
        "toast";


    toast.innerText =
        message;


    document.body.appendChild(
        toast
    );


    setTimeout(
        function () {

            toast.remove();

        },
        3000
    );

}


/* =========================================================
   INITIAL MESSAGE
========================================================= */

console.log(
    "Eligify Scholarships Loaded Successfully - Multi User Saved System"
);