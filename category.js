// ==========================================
// ELIGIFY CATEGORY JS
// FINAL MULTI-USER SAVED SYSTEM
// CATEGORY + SEARCH + DETAILS
// SAVED = eligifyUsers[currentUserId].saved
// ==========================================


const API_URL =
"https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   ELEMENTS
========================================================= */

const container =
    document.getElementById("categoryContainer");

const title =
    document.getElementById("categoryTitle");

const selectedText =
    document.getElementById("selectedCategory");

const search =
    document.getElementById("categorySearch");


/* =========================================================
   DATA
========================================================= */

let allData = [];
let filteredData = [];


/* =========================================================
   SELECTED CATEGORY
========================================================= */

const category =
    localStorage.getItem("selectedCategory") || "";


if (title) {

    title.innerText =
        category + " Scholarships";

}


if (selectedText) {

    selectedText.innerText =
        category;

}


/* =========================================================
   USERS
========================================================= */

function getUsers() {

    try {

        const data =
            localStorage.getItem("eligifyUsers");

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
   GET CURRENT USER SAVED
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
   SCHOLARSHIP ID
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
   SCHOLARSHIP NAME
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
   CHECK IF SAVED
========================================================= */

function isScholarshipSaved(item) {

    const scholarshipId =
        getScholarshipId(item);


    if (!scholarshipId) {

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
                String(scholarshipId)
            );

        }
    );

}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadData() {

    try {

        if (container) {

            container.innerHTML = `
                <div style="
                    width:100%;
                    text-align:center;
                    padding:40px;
                    font-size:15px;
                ">
                    Loading scholarships...
                </div>
            `;

        }


        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Failed to fetch scholarship data."
            );

        }


        const data =
            await response.json();


        console.log(
            "CATEGORY - API DATA:",
            data
        );


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid scholarship data."
            );

        }


        allData =
            data;


        filteredData =
            data.filter(
                function (item) {

                    const itemCategory =
                        getScholarshipValue(
                            item,
                            [
                                "Category",
                                "category"
                            ],
                            ""
                        );


                    return (
                        String(itemCategory)
                            .trim()
                            .toLowerCase()
                        ===
                        String(category)
                            .trim()
                            .toLowerCase()
                    );

                }
            );


        console.log(
            "CATEGORY - FILTERED:",
            filteredData
        );


        displayCards();


    } catch (error) {

        console.error(
            "Category load error:",
            error
        );


        if (container) {

            container.innerHTML = `
                <div style="
                    width:100%;
                    text-align:center;
                    padding:40px;
                ">
                    Unable to load scholarships.
                </div>
            `;

        }

    }

}


/* =========================================================
   DISPLAY CARDS
========================================================= */

function displayCards() {

    if (!container) return;


    container.innerHTML = "";


    const noResult =
        document.getElementById(
            "noResult"
        );


    if (
        filteredData.length === 0
    ) {

        if (noResult) {

            noResult.style.display =
                "block";

        }

        return;

    }


    if (noResult) {

        noResult.style.display =
            "none";

    }


    filteredData.forEach(
        function (item) {

            createScholarshipCard(item);

        }
    );

}


/* =========================================================
   CREATE SCHOLARSHIP CARD
========================================================= */

function createScholarshipCard(item) {

    if (!container) return;


    const card =
        document.createElement("div");


    card.className =
        "scholarship-card";


    const name =
        getScholarshipName(item);


    const itemCategory =
        getScholarshipValue(
            item,
            [
                "Category",
                "category"
            ],
            "-"
        );


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
            "-"
        );


    const isSaved =
        isScholarshipSaved(item);


    /* =====================================================
       CARD HTML
    ===================================================== */

    card.innerHTML = `

        <button
            class="save-btn ${isSaved ? "saved" : ""}"
            type="button"
            aria-label="${
                isSaved
                    ? "Remove from saved"
                    : "Save scholarship"
            }"
        >

            <i class="${
                isSaved
                    ? "ri-heart-fill"
                    : "ri-heart-line"
            }"></i>

        </button>


        <div class="status">
            🟢 Active
        </div>


        <h3>
            ${escapeHTML(name)}
        </h3>


        <div class="category-badge">
            ${escapeHTML(itemCategory)}
        </div>


        <div class="deadline">

            <i class="ri-calendar-line"></i>

            Last Date:
            ${escapeHTML(formatDateValue(lastDate))}

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
       SAVE BUTTON
    ===================================================== */

    const saveBtn =
        card.querySelector(
            ".save-btn"
        );


    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                toggleSaveScholarship(
                    item,
                    saveBtn
                );

            }
        );

    }


    /* =====================================================
       DETAILS BUTTON
    ===================================================== */

    const viewBtn =
        card.querySelector(
            ".view-btn"
        );


    if (viewBtn) {
    viewBtn.addEventListener(
        "click",
        function () {

            localStorage.setItem(
                "selectedScholarship",
                JSON.stringify(item)
            );

            addRecentlyViewed(item);

            window.location.href = "details.html";
        }
    );
}

    


    container.appendChild(card);

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

    recentlyViewed = recentlyViewed.filter(
        function (oldItem) {
            return (
                String(
                    getScholarshipId(oldItem)
                ) !== String(id)
            );
        }
    );

    recentlyViewed.unshift(item);

    recentlyViewed = recentlyViewed.slice(0, 20);

    users[userIndex] = {
        ...users[userIndex],
        recentlyViewed: recentlyViewed
    };

    saveUsers(users);
}

/* =========================================================
   TOGGLE SAVE SCHOLARSHIP
========================================================= */

function toggleSaveScholarship(
    item,
    saveBtn
) {

    const user =
        getCurrentUser();


    /* -----------------------------------------
       LOGIN CHECK
    ----------------------------------------- */

    if (!user) {

        showMessage(
            "Please login to save scholarships."
        );

        return;

    }


    /* -----------------------------------------
       ID CHECK
    ----------------------------------------- */

    const scholarshipId =
        getScholarshipId(item);


    if (!scholarshipId) {

        showMessage(
            "Scholarship ID not found."
        );

        console.error(
            "Cannot save scholarship without ID:",
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

        showMessage(
            "User account not found."
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


    /* -----------------------------------------
       FIND EXISTING
    ----------------------------------------- */

    const existingIndex =
        saved.findIndex(
            function (savedItem) {

                const savedId =
                    getScholarshipId(
                        savedItem
                    );


                return (
                    String(savedId) ===
                    String(scholarshipId)
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


        updateSaveButtonUI(
            saveBtn,
            false
        );


        showMessage(
            "Scholarship removed from Saved"
        );


    }

    /* -----------------------------------------
       ADD
    ----------------------------------------- */

    else {

        saved.unshift(item);


        /* Keep latest 50 */

        saved =
            saved.slice(0, 50);


        users[userIndex] = {

            ...users[userIndex],

            saved: saved

        };


        saveUsers(users);


        updateSaveButtonUI(
            saveBtn,
            true
        );


        showMessage(
            "Scholarship saved successfully"
        );

    }

}


/* =========================================================
   UPDATE SAVE BUTTON UI
========================================================= */

function updateSaveButtonUI(
    saveBtn,
    saved
) {

    if (!saveBtn) return;


    const icon =
        saveBtn.querySelector("i");


    if (!icon) return;


    if (saved) {

        saveBtn.classList.add(
            "saved"
        );


        saveBtn.setAttribute(
            "aria-label",
            "Remove from saved"
        );


        icon.classList.remove(
            "ri-heart-line"
        );


        icon.classList.add(
            "ri-heart-fill"
        );

    }

    else {

        saveBtn.classList.remove(
            "saved"
        );


        saveBtn.setAttribute(
            "aria-label",
            "Save scholarship"
        );


        icon.classList.remove(
            "ri-heart-fill"
        );


        icon.classList.add(
            "ri-heart-line"
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

if (search) {

    search.addEventListener(
        "input",
        function () {

            const value =
                String(
                    search.value || ""
                )
                    .trim()
                    .toLowerCase();


            filteredData =
                allData.filter(
                    function (item) {

                        const name =
                            getScholarshipName(
                                item
                            )
                                .toLowerCase();


                        const itemCategory =
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
                            name.includes(value) &&
                            itemCategory ===
                                category
                                    .trim()
                                    .toLowerCase()
                        );

                    }
                );


            displayCards();

        }
    );

}


/* =========================================================
   DATE FORMATTER
========================================================= */

function formatDateValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";

    }


    const raw =
        String(value).trim();


    if (
        raw === "" ||
        raw === "-" ||
        raw.toLowerCase() === "null" ||
        raw.toLowerCase() === "undefined"
    ) {

        return "-";

    }


    /* -----------------------------------------
       Google Sheets serial date
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

                return formatDateParts(
                    date,
                    true
                );

            }

        }

    }


    /* -----------------------------------------
       ISO YYYY-MM-DD
    ----------------------------------------- */

    let match =
        raw.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        return formatDatePartsFromNumbers(
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

        return formatDatePartsFromNumbers(
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

        return formatDatePartsFromNumbers(
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

        return formatDatePartsFromNumbers(
            Number(match[3]),
            Number(match[2]),
            Number(match[1])
        );

    }


    /* -----------------------------------------
       ISO datetime
    ----------------------------------------- */

    const isoMatch =
        raw.match(
            /^(\d{4})-(\d{2})-(\d{2})T/
        );


    if (isoMatch) {

        return formatDatePartsFromNumbers(
            Number(isoMatch[1]),
            Number(isoMatch[2]),
            Number(isoMatch[3])
        );

    }


    /* -----------------------------------------
       Normal JS date
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

            return formatDateParts(
                parsed
            );

        }

    }


    return raw;

}


/* =========================================================
   FORMAT DATE PARTS
========================================================= */

function formatDateParts(
    date,
    useUTC = false
) {

    const day =
        useUTC
            ? date.getUTCDate()
            : date.getDate();


    const year =
        useUTC
            ? date.getUTCFullYear()
            : date.getFullYear();


    if (
        year < 1900 ||
        year > 2100
    ) {

        return "-";

    }


    const month =
        date.toLocaleString(
            "en-IN",
            {
                month: "short",
                ...(useUTC
                    ? {
                        timeZone: "UTC"
                    }
                    : {})
            }
        );


    return (
        String(day).padStart(2, "0") +
        " " +
        month +
        " " +
        year
    );

}


/* =========================================================
   FORMAT DATE FROM NUMBERS
========================================================= */

function formatDatePartsFromNumbers(
    year,
    month,
    day
) {

    /* -----------------------------------------
       Prevent invalid years like 9999
    ----------------------------------------- */

    if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2100
    ) {

        return "-";

    }


    if (
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
    ) {

        return "-";

    }


    if (
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31
    ) {

        return "-";

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

        return "-";

    }


    return formatDateParts(
        date
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
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
   TOAST MESSAGE
========================================================= */

function showMessage(message) {

    let toast =
        document.getElementById(
            "categoryToast"
        );


    if (!toast) {

        toast =
            document.createElement("div");


        toast.id =
            "categoryToast";


        Object.assign(
            toast.style,
            {
                position: "fixed",
                bottom: "90px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "#082a33",
                color: "#ffffff",
                fontFamily:
                    "Poppins, sans-serif",
                fontSize: "14px",
                zIndex: "99999",
                boxShadow:
                    "0 8px 25px rgba(0,0,0,.2)"
            }
        );


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        window.categoryToastTimer
    );


    window.categoryToastTimer =
        setTimeout(
            function () {

                toast.style.display =
                    "none";

            },
            2500
        );

}


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener(
    "load",
    loadData
);


console.log(
    "Eligify Category JS Loaded - Multi User Saved System"
);