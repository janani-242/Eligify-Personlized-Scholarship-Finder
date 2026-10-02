/* =========================================================
   ELIGIFY PROFILE JS
   COMPLETE MULTI USER PROFILE SYSTEM
========================================================= */
const PROFILE_API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";

let currentSection = "saved";
let selectedPhoto = null;


/* =========================================================
   USERS
========================================================= */

function getUsers() {

    try {

        const data =
            localStorage.getItem("eligifyUsers");

        const users =
            data ? JSON.parse(data) : [];

        return Array.isArray(users)
            ? users
            : [];

    } catch (error) {

        console.error("getUsers error:", error);

        return [];

    }

}


function saveUsers(users) {

    localStorage.setItem(
        "eligifyUsers",
        JSON.stringify(
            Array.isArray(users)
                ? users
                : []
        )
    );

}


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUserId() {

    return localStorage.getItem(
        "currentUserId"
    );

}


function getCurrentUser() {

    const userId =
        getCurrentUserId();

    if (!userId) {

        return null;

    }

    const users =
        getUsers();

    return users.find(user =>
        String(user.id) ===
        String(userId)
    ) || null;

}


/* =========================================================
   UPDATE CURRENT USER
========================================================= */

function updateCurrentUser(changes) {

    const userId =
        getCurrentUserId();

    if (!userId) {

        return false;

    }

    const users =
        getUsers();

    const index =
        users.findIndex(user =>
            String(user.id) ===
            String(userId)
        );

    if (index === -1) {

        return false;

    }

    users[index] = {

        ...users[index],

        ...changes

    };

    saveUsers(users);

    localStorage.setItem(
        "currentUser",
        JSON.stringify(users[index])
    );

    return true;

}


/* =========================================================
   PROFILE DATA
========================================================= */

function getProfileData() {

    const user =
        getCurrentUser();

    if (!user) {

        return {

            id: "",
            username: "",
            name: "",
            email: "",
            bio: "",
            photo: "",
            saved: [],
            recentlyViewed: [],
            history: []

        };

    }

    return {

        id:
            user.id || "",

        username:
            user.username || "",

        name:
            user.name || "",

        email:
            user.email || "",

        bio:
            user.bio || "",

        photo:
            user.photo || "",

        saved:
            Array.isArray(user.saved)
                ? user.saved
                : [],

        recentlyViewed:
            Array.isArray(user.recentlyViewed)
                ? user.recentlyViewed
                : [],

        history:
            Array.isArray(user.history)
                ? user.history
                : []

    };

}


/* =========================================================
   UPDATE USER ARRAY
========================================================= */

function updateUserArray(
    field,
    data
) {

    return updateCurrentUser({

        [field]:
            Array.isArray(data)
                ? data
                : []

    });

}


/* =========================================================
   SCHOLARSHIP ID
========================================================= */

function getScholarshipId(
    scholarship,
    fallback = ""
) {

    if (!scholarship) {

        return String(fallback);

    }

    return String(

        scholarship.id ??

        scholarship.ID ??

        scholarship.scholarshipId ??

        scholarship.scholarship_id ??

        scholarship["Scholarship ID"] ??

        scholarship.name ??

        scholarship.title ??

        scholarship.scholarshipName ??

        scholarship["Scholarship Name"] ??

        fallback

    );

}


/* =========================================================
   NORMALIZE SCHOLARSHIP
========================================================= */

function normalizeScholarship(
    scholarship
) {

    if (
        !scholarship ||
        typeof scholarship !== "object"
    ) {

        return null;

    }

    return {

        ...scholarship,

        id:
            getScholarshipId(
                scholarship
            )

    };

}


/* =========================================================
   SAVED
========================================================= */

function getSavedScholarships() {

    const profile =
        getProfileData();

    return Array.isArray(profile.saved)
        ? profile.saved
        : [];

}


/* =========================================================
   RECENTLY VIEWED
========================================================= */

function getRecentlyViewed() {

    const profile =
        getProfileData();

    return Array.isArray(
        profile.recentlyViewed
    )
        ? profile.recentlyViewed
        : [];

}


/* =========================================================
   HISTORY
   USER SPECIFIC
========================================================= */

/* =========================================================
   HISTORY
   USER SPECIFIC + COMPATIBLE WITH ELIGIBILITY RESULTS
========================================================= */

function getHistory() {

    const userId = getCurrentUserId();

    if (!userId) {
        return [];
    }

    /*
       FIRST: Read user-specific history
       saved by results.js
    */

    try {

        const key =
            "eligibilityHistory_" +
            String(userId).trim();

        const stored =
            localStorage.getItem(key);

        if (stored) {

            const history =
                JSON.parse(stored);

            if (Array.isArray(history)) {
                return history;
            }
        }

    } catch (error) {

        console.warn(
            "User-specific history read failed:",
            error
        );

    }

    /*
       FALLBACK: Read history from user object
    */

    const user = getCurrentUser();

    if (!user) {
        return [];
    }

    if (Array.isArray(user.history)) {
        return user.history;
    }

    if (Array.isArray(user.eligibilityHistory)) {
        return user.eligibilityHistory;
    }

    return [];
}


function setHistory(history) {

    const userId = getCurrentUserId();

    if (!userId) {
        return false;
    }

    const cleanHistory =
        Array.isArray(history)
            ? history
            : [];

    /*
       PRIMARY STORAGE
    */

    try {

        localStorage.setItem(
            "eligibilityHistory_" +
            String(userId).trim(),
            JSON.stringify(cleanHistory)
        );

    } catch (error) {

        console.warn(
            "History localStorage save failed:",
            error
        );

    }

    /*
       ALSO keep user object synchronized
    */

    const users = getUsers();

    const index = users.findIndex(user =>
        String(user.id).trim() ===
        String(userId).trim()
    );

    if (index === -1) {
        return true;
    }

    users[index].history = cleanHistory;
    users[index].eligibilityHistory = cleanHistory;

    saveUsers(users);

    localStorage.setItem(
        "currentUser",
        JSON.stringify(users[index])
    );

    return true;
}

/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const user =
            getCurrentUser();

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        loadProfile();

        updateCounts();

        showSection("saved");

        setupOutsideMenuClick();

    }
);


/* =========================================================
   LOAD PROFILE
========================================================= */

function loadProfile() {

    const profile =
        getProfileData();

    const usernameElement =
        document.getElementById(
            "profileUsername"
        );

    const nameElement =
        document.getElementById(
            "profileName"
        );

    const bioElement =
        document.getElementById(
            "profileBio"
        );

    const photoElement =
        document.getElementById(
            "profilePhoto"
        );


    if (usernameElement) {

        usernameElement.textContent =
            profile.username
                ? "@" +
                  removeAtSymbol(
                      profile.username
                  )
                : "";

    }


    if (nameElement) {

        nameElement.textContent =
            profile.name || "";

    }


    if (bioElement) {

        bioElement.textContent =
            profile.bio || "";

    }


    setProfilePhoto(
        photoElement,
        profile.photo
    );

}


/* =========================================================
   REMOVE @
========================================================= */

function removeAtSymbol(username) {

    return String(
        username || ""
    )
        .replace(/^@+/, "")
        .trim();

}

function isValidUsername(value) {

    return /^[A-Za-z0-9_.]+$/.test(
        String(value || "").trim()
    );

}
/* =========================================================
   PROFILE PHOTO
========================================================= */

function setProfilePhoto(element, photo) {

    if (!element) return;

    element.replaceChildren();

    if (photo && String(photo).trim()) {

        const img = document.createElement("img");

        img.src = String(photo);
        img.alt = "Profile Photo";

        img.onload = function () {
            img.style.width = "100%";
            img.style.height = "100%";
        };

        img.onerror = function () {
            element.innerHTML =
                `<i class="ri-user-3-fill"></i>`;
        };

        element.appendChild(img);

    } else {

        element.innerHTML =
            `<i class="ri-user-3-fill"></i>`;

    }
}


function setEditPhoto(photo) {

    const element =
        document.getElementById(
            "editPhoto"
        );

    setProfilePhoto(
        element,
        photo
    );

}


/* =========================================================
   COUNTS
========================================================= */

function updateCounts() {

    const profile =
        getProfileData();

    const history =
        getHistory();


    setCount(
        "savedCount",
        profile.saved.length
    );


    setCount(
        "viewedCount",
        profile.recentlyViewed.length
    );


    setCount(
        "historyCount",
        history.length
    );

}


function setCount(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            Number(value) || 0;

    }

}


/* =========================================================
   SHOW SECTION
========================================================= */

function showSection(section) {

    const validSections = [

        "saved",
        "viewed",
        "history"

    ];

    if (
        !validSections.includes(section)
    ) {

        section = "saved";

    }

    currentSection =
        section;

    updateActiveTab();


    const content =
        document.getElementById(
            "contentArea"
        );

    if (!content) return;


    /* IMPORTANT:
       Completely clear old cards
       before rendering.
    */

    content.replaceChildren();


    if (section === "saved") {

        renderSaved();

    }

    else if (section === "viewed") {

        renderRecentlyViewed();

    }

    else {

        renderHistory();

    }

}


/* =========================================================
   HISTORY NAVIGATION
========================================================= */

function goToHistory() {

    showSection("history");

}


/* =========================================================
   ACTIVE TAB
========================================================= */

function updateActiveTab() {

    document
        .querySelectorAll(
            ".profile-tab"
        )
        .forEach(tab => {

            tab.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(
            ".profile-stat"
        )
        .forEach(stat => {

            stat.classList.remove(
                "active"
            );

        });


    const tabMap = {

        saved: {

            tab: "savedTab",
            stat: "savedStat"

        },

        viewed: {

            tab: "viewedTab",
            stat: "viewedStat"

        },

        history: {

            tab: "historyTab",
            stat: "historyStat"

        }

    };


    const active =
        tabMap[currentSection];

    if (!active) return;


    document
        .getElementById(active.tab)
        ?.classList.add("active");


    document
        .getElementById(active.stat)
        ?.classList.add("active");

}


/* =========================================================
   RENDER SAVED
========================================================= */

function renderSaved() {

    const saved =
        getSavedScholarships();

    const content =
        document.getElementById(
            "contentArea"
        );

    if (!content) return;


    content.replaceChildren();


    if (!saved.length) {

        showEmptyState(
            "ri-bookmark-3-line",
            "No Saved Scholarships",
            "Scholarships you save will appear here."
        );

        return;

    }


    saved.forEach(
        (scholarship, index) => {

            const clean =
                normalizeScholarship(
                    scholarship
                );

            if (!clean) return;

            content.insertAdjacentHTML(
                "beforeend",
                createScholarshipCard(
                    clean,
                    index,
                    "saved"
                )
            );

        }
    );

}


/* =========================================================
   RENDER RECENTLY VIEWED
========================================================= */

function renderRecentlyViewed() {

    const viewed =
        getRecentlyViewed();

    const content =
        document.getElementById(
            "contentArea"
        );

    if (!content) return;


    content.replaceChildren();


    if (!viewed.length) {

        showEmptyState(
            "ri-time-line",
            "No Recently Viewed Scholarships",
            "Scholarships you view will appear here."
        );

        return;

    }


    viewed.forEach(
        (scholarship, index) => {

            const clean =
                normalizeScholarship(
                    scholarship
                );

            if (!clean) return;

            content.insertAdjacentHTML(
                "beforeend",
                createScholarshipCard(
                    clean,
                    index,
                    "viewed"
                )
            );

        }
    );

}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory() {

    const history =
        getHistory();

    const content =
        document.getElementById(
            "contentArea"
        );

    if (!content) return;


    content.replaceChildren();


    setCount(
        "historyCount",
        history.length
    );


    if (!history.length) {

        showEmptyState(
            "ri-history-line",
            "No Eligibility History",
            "Your eligibility checks will appear here."
        );

        return;

    }


    history.forEach(
        (item, index) => {

            content.insertAdjacentHTML(
                "beforeend",
                createHistoryCard(
                    item,
                    index
                )
            );

        }
    );

}


/* =========================================================
   SCHOLARSHIP CARD
========================================================= */

function createScholarshipCard(
    scholarship,
    index,
    section
) {

    const id =
        getScholarshipId(
            scholarship,
            index
        );


    const name =
        scholarship.name ??
        scholarship.title ??
        scholarship.scholarshipName ??
        scholarship["Scholarship Name"] ??
        "Scholarship";


    const category =
        scholarship.category ??
        scholarship.Category ??
        "Scholarship";


    const rawDeadline =
        scholarship.deadline ??
        scholarship.lastDate ??
        scholarship.last_date ??
        scholarship["Last Date"] ??
        scholarship["Deadline"] ??
        "-";


    const deadline =
        formatDeadline(
            rawDeadline
        );


    const status =
        scholarship.status ??
        scholarship.Status ??
        "Active";


    return `

        <article
            class="scholarship-card"
            data-id="${escapeHTML(id)}"
        >

            <span class="status">

                <i class="ri-checkbox-circle-fill"></i>

                ${escapeHTML(status)}

            </span>


            ${
                section === "saved"

                    ? `

                    <button
                        type="button"
                        class="save-btn"
                        onclick="removeSavedScholarship(
                            event,
                            '${escapeJS(id)}'
                        )"
                    >

                        <i class="ri-bookmark-fill"></i>

                    </button>

                    `

                    : ""

            }


            <h3>

                ${escapeHTML(name)}

            </h3>


            <span class="category-badge">

                ${escapeHTML(category)}

            </span>


            <div class="deadline">

                <i class="ri-calendar-event-line"></i>

                <span>

                    Deadline:
                    ${escapeHTML(deadline)}

                </span>

            </div>


            <div class="card-actions">

                <button
                    type="button"
                    class="view-btn"
                    onclick="viewScholarship(
                        '${escapeJS(id)}'
                    )"
                >

                    View Details

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   VALUE HELPERS
========================================================= */

function firstValue(
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


    for (const key of keys) {

        if (

            object[key] !== undefined &&

            object[key] !== null &&

            String(object[key])
                .trim() !== ""

        ) {

            return object[key];

        }

    }


    return fallback;

}


function firstNumber(
    object,
    keys,
    fallback = 0
) {

    const value =
        firstValue(
            object,
            keys,
            fallback
        );


    const cleaned =
        String(value ?? "")
            .replace(/,/g, "")
            .replace(/[₹%]/g, "")
            .trim();


    const number =
        Number(cleaned);


    return Number.isFinite(number)
        ? number
        : fallback;

}


/* =========================================================
   HISTORY CARD
========================================================= */

/* =========================================================
   HISTORY CARD
   CORRECT ELIGIBILITY DATA
========================================================= */

function createHistoryCard(
    item,
    index
) {

    item = item || {};

    /* =====================================================
       GET ACTUAL PROFILE DATA
    ===================================================== */

    const profile =
        item.profile ||
        item.eligibilityData ||
        item.studentProfile ||
        item.data ||
        item;


    /* =====================================================
       STUDENT DETAILS
    ===================================================== */

    const name =
        firstValue(
            profile,
            [
                "fullName",
                "name",
                "studentName",
                "Name",
                "username"
            ],
            "User"
        );


    const course =
        firstValue(
            profile,
            [
                "course",
                "selectedCourse",
                "courseName",
                "Course",
                "program",
                "degree"
            ],
            "Course not available"
        );


    const year =
        firstValue(
            profile,
            [
                "yearOfStudy",
                "year",
                "studyYear",
                "academicYear",
                "currentYear",
                "Year"
            ],
            ""
        );


    const state =
        firstValue(
            profile,
            [
                "state",
                "State",
                "userState",
                "selectedState"
            ],
            "Not specified"
        );


    const community =
        firstValue(
            profile,
            [
                "community",
                "Community",
                "selectedCommunity"
            ],
            "Not specified"
        );


    const gender =
        firstValue(
            profile,
            [
                "gender",
                "Gender",
                "sex"
            ],
            "Not specified"
        );


    const income =
        firstValue(
            profile,
            [
                "familyIncome",
                "income",
                "Income",
                "annualIncome",
                "yearlyIncome"
            ],
            ""
        );


    const marks =
        firstValue(
            profile,
            [
                "percentage",
                "Percentage",
                "academicPercentage",
                "academicMarks",
                "marks",
                "Marks",
                "percent"
            ],
            ""
        );


    /* =====================================================
       ELIGIBLE / NOT ELIGIBLE RESULTS
    ===================================================== */

    const eligibleScholarships =
        Array.isArray(
            item.eligibleScholarships
        )
            ? item.eligibleScholarships
            : Array.isArray(item.eligible)
                ? item.eligible
                : [];


    const notEligibleScholarships =
        Array.isArray(
            item.notEligibleScholarships
        )
            ? item.notEligibleScholarships
            : Array.isArray(item.notEligible)
                ? item.notEligible
                : [];


    const eligibleCount =
    Number.isFinite(
        Number(item.eligibleCount)
    )
        ? Number(item.eligibleCount)
        : eligibleScholarships.length;


const notEligibleCount =
    Number.isFinite(
        Number(item.notEligibleCount)
    )
        ? Number(item.notEligibleCount)
        : notEligibleScholarships.length;


    /* =====================================================
       DATE
    ===================================================== */

    const checkedAt =
        firstValue(
            item,
            [
                "checkedAt",
                "createdAt",
                "timestamp",
                "date",
                "Date"
            ],
            ""
        );


    /* =====================================================
       HISTORY ID
    ===================================================== */

    const historyId =
        firstValue(
            item,
            [
                "id",
                "ID",
                "historyId"
            ],
            `history-${index}`
        );


    /* =====================================================
       CARD
    ===================================================== */

    return `

        <article
            class="scholarship-card history-card"
            data-history-id="${escapeHTML(historyId)}"
        >

            <!-- =========================
                 TOP
            ========================== -->

            <div class="history-card-top">

                <div class="user-info">

                    <div class="user-avatar">

                        <i class="ri-user-3-line"></i>

                    </div>


                    <div>

                        <h3>
                            ${escapeHTML(name)}
                        </h3>


                        <p>

                            ${escapeHTML(course)}

                            ${
                                year
                                    ? " • " +
                                      escapeHTML(year)
                                    : ""
                            }

                        </p>

                    </div>

                </div>


                <div class="history-date">

                    <div>
                        ${escapeHTML(
                            formatDate(checkedAt)
                        )}
                    </div>


                    <div>
                        ${escapeHTML(
                            formatTime(checkedAt)
                        )}
                    </div>

                </div>

            </div>


            <!-- =========================
                 PROFILE DETAILS
            ========================== -->

            <div class="profile-details">

                <span class="profile-chip">

                    <i class="ri-map-pin-line"></i>

                    ${escapeHTML(state)}

                </span>


                <span class="profile-chip">

                    <i class="ri-group-line"></i>

                    ${escapeHTML(community)}

                </span>


                <span class="profile-chip">

                    <i class="ri-user-line"></i>

                    ${escapeHTML(gender)}

                </span>


                <span class="profile-chip">

                    <i class="ri-money-rupee-circle-line"></i>

                    ${
                        income
                            ? escapeHTML(income)
                            : "Income not specified"
                    }

                </span>


                <span class="profile-chip">

                    <i class="ri-bar-chart-line"></i>

                    ${
                        marks !== ""
                            ? escapeHTML(marks) + "%"
                            : "Marks not specified"
                    }

                </span>

            </div>


            <!-- =========================
                 RESULT COUNTS
            ========================== -->

            <div class="history-results">

                <div class="count-box eligible-box">

                    <strong>
                        ${formatNumber(eligibleCount)}
                    </strong>

                    Eligible Scholarships

                </div>


                <div class="count-box noteligible-box">

                    <strong>
                        ${formatNumber(notEligibleCount)}
                    </strong>

                    Not Eligible

                </div>

            </div>


            <!-- =========================
                 FOOTER
            ========================== -->

            <div class="history-footer">

                <button
                    type="button"
                    class="view-result-btn"
                    onclick="viewProfileHistoryResult(${index})"
                >

                    <i class="ri-eye-line"></i>

                    View Results

                </button>


                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteProfileHistory(event, ${index})"
                >

                    <i class="ri-delete-bin-line"></i>

                    Delete

                </button>

            </div>

        </article>

    `;
}

/* =========================================================
   VIEW HISTORY RESULT
========================================================= */

function viewProfileHistoryResult(index) {

    const history =
        getHistory();


    if (
        index < 0 ||
        index >= history.length
    ) {

        showToast(
            "History result not found"
        );

        return;

    }


    localStorage.setItem(
        "selectedEligibilityHistory",
        JSON.stringify(
            history[index]
        )
    );


    localStorage.setItem(
        "selectedEligibilityHistoryIndex",
        String(index)
    );


    window.location.href =
        "results.html";

}


/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyState(
    icon,
    title,
    message
) {

    const content =
        document.getElementById(
            "contentArea"
        );

    if (!content) return;


    content.innerHTML = `

        <div class="empty-box">

            <i class="${escapeHTML(icon)}"></i>

            <h2>

                ${escapeHTML(title)}

            </h2>

            <p>

                ${escapeHTML(message)}

            </p>

        </div>

    `;

}


/* =========================================================
   REMOVE SAVED SCHOLARSHIP
========================================================= */

function removeSavedScholarship(
    event,
    id
) {

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    const saved =
        getSavedScholarships();


    const updatedSaved =
        saved.filter(item =>

            String(
                getScholarshipId(item)
            ) !==
            String(id)

        );


    updateUserArray(
        "saved",
        updatedSaved
    );


    updateCounts();


    /* Re-render only once */

    if (currentSection === "saved") {

        renderSaved();

    }


    showToast(
        "Scholarship removed from Saved"
    );

}


/* =========================================================
   CUSTOM CONFIRMATION POPUP
========================================================= */

function showConfirmPopup(
    title,
    message,
    confirmText,
    onConfirm
) {

    const existing =
        document.getElementById(
            "eligifyConfirmPopup"
        );

    if (existing) {

        existing.remove();

    }


    const oldStyle =
        document.getElementById(
            "eligifyConfirmPopupStyle"
        );

    if (oldStyle) {

        oldStyle.remove();

    }


    const overlay =
        document.createElement("div");

    overlay.id =
        "eligifyConfirmPopup";


    overlay.innerHTML = `

        <div class="eligify-confirm-box">

            <div class="eligify-confirm-icon">

                <i class="ri-question-line"></i>

            </div>


            <h3>

                ${escapeHTML(title)}

            </h3>


            <p>

                ${escapeHTML(message)}

            </p>


            <div class="eligify-confirm-actions">

                <button
                    type="button"
                    class="eligify-confirm-cancel"
                    id="eligifyConfirmCancel"
                >

                    Cancel

                </button>


                <button
                    type="button"
                    class="eligify-confirm-ok"
                    id="eligifyConfirmOk"
                >

                    ${escapeHTML(confirmText)}

                </button>

            </div>

        </div>

    `;


    const style =
        document.createElement("style");

    style.id =
        "eligifyConfirmPopupStyle";


    style.textContent = `

        #eligifyConfirmPopup {

            position: fixed;

            inset: 0;

            z-index: 99999;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;

            background:
                rgba(0, 0, 0, 0.45);

            backdrop-filter:
                blur(4px);

        }


        .eligify-confirm-box {

            width: 100%;

            max-width: 390px;

            background: #ffffff;

            border-radius: 18px;

            padding: 28px 24px 22px;

            text-align: center;

            box-shadow:
                0 20px 60px
                rgba(0, 0, 0, 0.20);

            animation:
                eligifyConfirmShow
                0.2s ease;

        }


        .eligify-confirm-icon {

            width: 52px;

            height: 52px;

            margin:
                0 auto 15px;

            border-radius: 50%;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #EAF5F3;

            color: #0B5D5B;

            font-size: 25px;

        }


        .eligify-confirm-box h3 {

            margin:
                0 0 8px;

            color: #073F3D;

            font-family:
                Poppins,
                sans-serif;

            font-size: 20px;

            font-weight: 600;

        }


        .eligify-confirm-box p {

            margin: 0;

            color: #666666;

            font-family:
                Poppins,
                sans-serif;

            font-size: 14px;

            line-height: 1.6;

        }


        .eligify-confirm-actions {

            display: flex;

            gap: 10px;

            margin-top: 22px;

        }


        .eligify-confirm-actions button {

            flex: 1;

            min-height: 44px;

            border-radius: 10px;

            font-family:
                Poppins,
                sans-serif;

            font-size: 14px;

            font-weight: 500;

            cursor: pointer;

            transition:
                0.2s ease;

        }


        .eligify-confirm-cancel {

            border:
                1px solid #d8d8d8;

            background: #ffffff;

            color: #555555;

        }


        .eligify-confirm-cancel:hover {

            background: #f5f5f5;

        }


        .eligify-confirm-ok {

            border:
                1px solid #0B5D5B;

            background: #0B5D5B;

            color: #ffffff;

        }


        .eligify-confirm-ok:hover {

            background: #073F3D;

        }


        @keyframes eligifyConfirmShow {

            from {

                opacity: 0;

                transform:
                    scale(0.94);

            }

            to {

                opacity: 1;

                transform:
                    scale(1);

            }

        }


        @media (max-width: 480px) {

            .eligify-confirm-box {

                max-width: 340px;

                padding:
                    24px 18px 18px;

            }


            .eligify-confirm-box h3 {

                font-size: 18px;

            }


            .eligify-confirm-box p {

                font-size: 13px;

            }

        }

    `;


    document.head.appendChild(
        style
    );


    document.body.appendChild(
        overlay
    );


    const cancelButton =
        document.getElementById(
            "eligifyConfirmCancel"
        );


    const confirmButton =
        document.getElementById(
            "eligifyConfirmOk"
        );


    function handleEscape(event) {

        if (
            event.key === "Escape"
        ) {

            closePopup();

        }

    }


    function closePopup() {

        document.removeEventListener(
            "keydown",
            handleEscape
        );

        overlay.remove();

        style.remove();

    }


    cancelButton.addEventListener(
        "click",
        closePopup
    );


    confirmButton.addEventListener(
        "click",
        function () {

            closePopup();

            if (
                typeof onConfirm ===
                "function"
            ) {

                onConfirm();

            }

        }
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target === overlay
            ) {

                closePopup();

            }

        }
    );


    document.addEventListener(
        "keydown",
        handleEscape
    );

}


/* =========================================================
   DELETE PROFILE HISTORY
========================================================= */

function deleteProfileHistory(
    event,
    index
) {

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    const history =
        [...getHistory()];


    if (
        index < 0 ||
        index >= history.length
    ) {

        return;

    }


    showConfirmPopup(
        "Delete History?",
        "Are you sure you want to delete this history?",
        "Delete",
        function () {

            /* Remove exactly one item */

            history.splice(
                index,
                1
            );


            /* Save immediately */

            setHistory(
                history
            );


            localStorage.removeItem(
                "selectedEligibilityHistory"
            );


            localStorage.removeItem(
                "selectedEligibilityHistoryIndex"
            );


            updateCounts();


            /* IMPORTANT:
               Render only one time
            */

            if (
                currentSection ===
                "history"
            ) {

                renderHistory();

            }


            showToast(
                "History deleted"
            );

        }
    );

}


/* =========================================================
   VIEW SCHOLARSHIP
========================================================= */

function viewScholarship(id) {

    const profile =
        getProfileData();


    const allScholarships = [

        ...profile.saved,

        ...profile.recentlyViewed

    ];


    let scholarship =
        allScholarships.find(item =>

            String(
                getScholarshipId(item)
            ) ===
            String(id)

        );


    if (!scholarship) {

        showToast(
            "Scholarship details not found"
        );

        return;

    }


    scholarship =
        normalizeScholarship(
            scholarship
        );


    let recent =
        getRecentlyViewed();


    recent =
        recent.filter(item =>

            String(
                getScholarshipId(item)
            ) !==
            String(
                getScholarshipId(
                    scholarship
                )
            )

        );


    recent.unshift(
        scholarship
    );


    recent =
        recent.slice(0, 20);


    updateUserArray(
        "recentlyViewed",
        recent
    );


    localStorage.setItem(
        "selectedScholarship",
        JSON.stringify(
            scholarship
        )
    );


    updateCounts();


    window.location.href =
        "details.html";

}


/* =========================================================
   EDIT PROFILE
========================================================= */

function openEditProfile() {

    const modal =
        document.getElementById(
            "editModal"
        );

    if (!modal) return;


    const profile =
        getProfileData();


    document.getElementById(
        "editUsername"
    ).value =
        profile.username || "";


    document.getElementById(
        "editName"
    ).value =
        profile.name || "";


    document.getElementById(
        "editBio"
    ).value =
        profile.bio || "";


    document.getElementById(
        "editEmail"
    ).value =
        profile.email || "";


    selectedPhoto =
        profile.photo || null;


    setEditPhoto(
        selectedPhoto
    );


    updateRemovePhotoButton();


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


function closeEditProfile() {

    const modal =
        document.getElementById(
            "editModal"
        );

    if (!modal) return;


    modal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile(event) {

    if (event) {
        event.preventDefault();
    }


    const username =
        document
            .getElementById("editUsername")
            ?.value
            .trim() || "";


    const name =
        document
            .getElementById("editName")
            ?.value
            .trim() || "";


    const bio =
        document
            .getElementById("editBio")
            ?.value
            .trim() || "";


    const email =
        document
            .getElementById("editEmail")
            ?.value
            .trim()
            .toLowerCase() || "";


    if (!username || !name) {

        showToast(
            "Username and name are required"
        );

        return;
    }


    /* USERNAME VALIDATION */

    if (!/^[A-Za-z0-9_.]+$/.test(username)) {

        showToast(
            "Username can contain only letters, numbers, underscore and dot"
        );

        return;
    }


    const user =
        getCurrentUser();

    if (!user) {

        showToast(
            "User session not found"
        );

        return;
    }


    const cleanUsername =
        removeAtSymbol(username)
            .toLowerCase();


    /* LOCAL DUPLICATE CHECK */

    const duplicate =
        getUsers().some(other =>

            String(other.id) !==
            String(user.id)

            &&

            String(
                other.username || ""
            )
                .toLowerCase() ===
            cleanUsername

        );


    if (duplicate) {

        showToast(
            "Username already exists"
        );

        return;
    }


    /* DISABLE SAVE BUTTON */

    const saveButton =
        document.querySelector(
            "#editProfileForm button[type='submit'], #editProfileModal button[type='submit']"
        );


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.dataset.originalText =
            saveButton.innerHTML;

        saveButton.innerHTML =
            "Saving...";
    }


    try {

        /* =========================================
           UPDATE GOOGLE SHEETS FIRST
        ========================================= */

        const response =
            await fetch(
                PROFILE_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({

                        action:
                            "updateUser",

                        data: {

                            userId:
                                String(
                                    user.id || ""
                                ).trim(),

                            username:
                                cleanUsername,

                            name:
                                name,

                            email:
                                email

                        }

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to connect to server"
            );
        }


        const result =
            await response.json();


        /* =========================================
           BACKEND DUPLICATE CHECK
        ========================================= */

        if (
            !result ||
            result.success !== true
        ) {

            if (
                result?.usernameExists
            ) {

                showToast(
                    "Username already exists"
                );

                return;
            }


            if (
                result?.emailExists
            ) {

                showToast(
                    "Email already exists"
                );

                return;
            }


            throw new Error(
                result?.message ||
                "Unable to update profile"
            );
        }


        /* =========================================
           UPDATE LOCAL USER ONLY AFTER
           GOOGLE SHEETS SUCCESS
        ========================================= */

        const success =
            updateCurrentUser({

                username:
                    cleanUsername,

                name:
                    name,

                email:
                    email,

                bio:
                    bio,

                photo:
                    selectedPhoto || ""

            });


        if (!success) {

            showToast(
                "Profile update failed"
            );

            return;
        }


        /* =========================================
           REFRESH UI
        ========================================= */

        loadProfile();

        updateCounts();

        closeEditProfile();


        showToast(
            "Profile updated successfully"
        );


    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        showToast(
            error.message ||
            "Unable to update profile"
        );


    } finally {

        /* RESTORE BUTTON */

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                saveButton.dataset.originalText ||
                "Save Changes";
        }

    }

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

/* =========================================================
   PHOTO PREVIEW
   ORIGINAL IMAGE QUALITY PRESERVED
========================================================= */

function previewPhoto(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;


    /* IMAGE FILE CHECK */

    if (!file.type.startsWith("image/")) {

        showToast(
            "Please select an image"
        );

        event.target.value = "";

        return;
    }


    /* 5 MB LIMIT */

    if (file.size > 5 * 1024 * 1024) {

        showToast(
            "Please select an image below 5MB"
        );

        event.target.value = "";

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function(event) {

        /*
         * IMPORTANT:
         * No canvas
         * No resize
         * No compression
         * No JPEG conversion
         *
         * Original file is stored directly
         * as Data URL.
         */

        selectedPhoto =
            event.target.result;


        setEditPhoto(
            selectedPhoto
        );


        updateRemovePhotoButton();

    };


    reader.onerror = function() {

        showToast(
            "Unable to read image"
        );

    };


    /* READ ORIGINAL FILE */

    reader.readAsDataURL(file);

}


/* =========================================================
   REMOVE PHOTO
========================================================= */

function removeProfilePhoto() {

    selectedPhoto =
        null;


    const input =
        document.getElementById(
            "photoInput"
        );


    if (input) {

        input.value =
            "";

    }


    setEditPhoto("");

    updateRemovePhotoButton();


    showToast(
        "Profile photo removed"
    );

}


function updateRemovePhotoButton() {

    const button =
        document.getElementById(
            "removePhotoBtn"
        );

    if (!button) return;


    button.style.display =
        selectedPhoto
            ? "inline-flex"
            : "none";

}


/* =========================================================
   MENU
========================================================= */

function toggleMenu(event) {

    if (event) {

        event.stopPropagation();

    }


    document
        .getElementById(
            "menuDropdown"
        )
        ?.classList.toggle(
            "show"
        );

}


function closeMenu() {

    document
        .getElementById(
            "menuDropdown"
        )
        ?.classList.remove(
            "show"
        );

}


function setupOutsideMenuClick() {

    document.addEventListener(
        "click",
        function(event) {

            const menu =
                document.getElementById(
                    "menuDropdown"
                );


            const actions =
                document.querySelector(
                    ".top-actions"
                );


            if (
                menu &&
                actions &&
                !actions.contains(
                    event.target
                )
            ) {

                menu.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function goBack() {

    window.location.href =
        "dashboard.html";

}




function aboutEligify() {

    closeMenu();

    window.location.href =
        "about.html";

}


function privacySecurity() {

    closeMenu();

    window.location.href =
        "privacy.html";

}


function userReviews() {

    closeMenu();

    window.location.href =
        "reviews.html";

}



function helpSupport() {

    closeMenu();

    window.location.href =
        "help.html";

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    closeMenu();


    showConfirmPopup(
        "Logout?",
        "Are you sure you want to logout?",
        "Logout",
        function () {

            localStorage.removeItem(
                "currentUserId"
            );


            localStorage.removeItem(
                "currentUser"
            );


            localStorage.removeItem(
                "loggedIn"
            );


            localStorage.removeItem(
                "isLoggedIn"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) return;


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.profileToastTimer
    );


    window.profileToastTimer =
        setTimeout(
            function() {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   DATE FORMATTERS
========================================================= */

function parseDateValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    if (
        typeof value === "number" &&
        value > 100000000000
    ) {

        const date =
            new Date(value);

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    const text =
        String(value).trim();

    if (!text) return null;


    let match =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        const date =
            new Date(

                Number(match[3]),

                Number(match[2]) - 1,

                Number(match[1])

            );


        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    match =
        text.match(
            /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/
        );


    if (match) {

        return new Date(

            Number(match[1]),

            Number(match[2]) - 1,

            Number(match[3])

        );

    }


    const parsed =
        new Date(text);


    return Number.isNaN(
        parsed.getTime()
    )
        ? null
        : parsed;

}


function formatDeadline(value) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return "-";

    }


    const date =
        parseDateValue(value);


    if (!date) {

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


function formatDate(value) {

    const date =
        parseDateValue(value);

    if (!date) {

        return "Unknown date";

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


function formatTime(value) {

    const date =
        parseDateValue(value);

    if (!date) {

        return "";

    }


    return date.toLocaleTimeString(
        "en-IN",
        {

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


function formatNumber(value) {

    const number =
        Number(
            String(value ?? 0)

                .replace(/,/g, "")

                .replace(/[₹%]/g, "")

                .trim()
        );


    if (!Number.isFinite(number)) {

        return "0";

    }


    return number.toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   ESCAPE JS
========================================================= */

function escapeJS(value) {

    return String(value ?? "")

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, '\\"')

        .replace(/\n/g, "\\n")

        .replace(/\r/g, "\\r");

}


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "editModal"
            );


        if (
            modal &&
            modal.classList.contains("show") &&
            event.target === modal
        ) {

            closeEditProfile();

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeEditProfile();

            closeMenu();

        }

    }
);


/* =========================================================
   PAGE SHOW
========================================================= */

window.addEventListener(
    "pageshow",
    function() {

        const user =
            getCurrentUser();

        if (!user) return;


        loadProfile();

        updateCounts();

        showSection(
            currentSection
        );

    }
);

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const usernameInput =
            document.getElementById(
                "editUsername"
            );

        if (!usernameInput) return;


        usernameInput.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^A-Za-z0-9_.]/g,
                        ""
                    );

            }
        );

    }
);

