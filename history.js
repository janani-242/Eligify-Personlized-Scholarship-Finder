/* =========================================================
   ELIGIFY | HISTORY JS
   MULTI-CHECK HISTORY • MULTI-USER SAFE
   Works with the COMPACT records saved by results.js
========================================================= */

"use strict";


/* =========================================================
   DOM
========================================================= */

const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const eligibleCountElement = document.getElementById("eligibleCount");
const notEligibleCountElement = document.getElementById("notEligibleCount");

const emptyHistory = document.getElementById("emptyHistory");
const emptyCheckBtn = document.getElementById("emptyCheckBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const historyToast = document.getElementById("historyToast");
const toastIcon = document.getElementById("toastIcon");
const toastMessage = document.getElementById("toastMessage");


/* =========================================================
   HISTORY STORAGE KEYS
========================================================= */

function historyKeysFor(userId) {

    return [
        `eligibilityHistory_${userId}`,
        `eligifyEligibilityHistory_${userId}`,
        `history_${userId}`
    ];

}


/* =========================================================
   JSON HELPERS
========================================================= */

function readJSON(key, fallback = null) {

    try {

        const value = localStorage.getItem(key);

        if (!value) return fallback;

        return JSON.parse(value);

    } catch (error) {

        console.warn("Eligify read error:", key, error);

        return fallback;

    }

}


function writeJSON(key, value) {

    try {

        localStorage.setItem(key, JSON.stringify(value));

        return true;

    } catch (error) {

        console.warn(
            "⚠️ Storage full while saving",
            key,
            "- trying to auto-clean..."
        );

        if (Array.isArray(value)) {

            let trimmed = value.slice();

            while (trimmed.length > 1) {

                trimmed = trimmed.slice(
                    0,
                    Math.max(1, Math.floor(trimmed.length / 2))
                );

                try {

                    localStorage.setItem(
                        key,
                        JSON.stringify(trimmed)
                    );

                    console.warn(
                        `⚠️ Reduced "${key}" to ${trimmed.length} record(s) to free up space.`
                    );

                    return true;

                } catch (innerError) {

                    /* keep shrinking */

                }

            }

            try {

                localStorage.removeItem(key);

            } catch (finalError) {

                /* ignore */

            }

        }

        console.error(
            "Eligify write error:",
            key,
            error
        );

        return false;

    }

}


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {

    const currentUserId =
        localStorage.getItem("currentUserId");


    /* =========================================
       CURRENT USER ID IS THE PRIMARY SOURCE
    ========================================= */

    if (currentUserId) {

        const users =
            readJSON(
                "eligifyUsers",
                []
            );


        if (Array.isArray(users)) {

            const target =
                String(currentUserId)
                    .trim()
                    .toLowerCase();


            const user =
                users.find(user => {

                    if (
                        !user ||
                        typeof user !== "object"
                    ) {
                        return false;
                    }


                    return [

                        user.id,
                        user.userId,
                        user.email,
                        user.username

                    ].some(value =>

                        String(value || "")
                            .trim()
                            .toLowerCase() ===
                        target

                    );

                });


            if (user) {

                return user;

            }

        }

    }


    /* =========================================
       FALLBACK ONLY
    ========================================= */

    const storedUser =
        readJSON(
            "currentUser",
            null
        );


    if (
        storedUser &&
        typeof storedUser === "object"
    ) {

        return storedUser;

    }


    return null;

}


function getUserId() {

    const storedId =
        localStorage.getItem("currentUserId");

    if (storedId) {

        return String(storedId);

    }


    const user = getCurrentUser();

    if (!user) return "guest";


    return String(
        user.userId ||
        user.id ||
        user.email ||
        user.username ||
        "guest"
    );

}


/* =========================================================
   USERS
========================================================= */

function getUsers() {

    const users =
        readJSON("eligifyUsers", []);

    return Array.isArray(users)
        ? users
        : [];

}


function saveUsers(users) {

    writeJSON(
        "eligifyUsers",
        Array.isArray(users)
            ? users
            : []
    );

}


function findUserKey(users, userId) {

    const target =
        String(userId || "")
            .trim()
            .toLowerCase();

    if (!target || !Array.isArray(users)) {
        return -1;
    }

    return users.findIndex(user => {

        if (
            !user ||
            typeof user !== "object"
        ) {
            return false;
        }

        const values = [
            user.id,
            user.userId,
            user.email,
            user.username
        ];

        return values.some(
            value =>
                String(value || "")
                    .trim()
                    .toLowerCase() === target
        );

    });

}

/* =========================================================
   NORMALIZE PROFILE
========================================================= */

function normalizeProfile(
    profile,
    fallbackUser = null,
    item = null
) {

    profile =
        (
            profile &&
            typeof profile === "object"
        )
            ? profile
            : {};


    fallbackUser =
        (
            fallbackUser &&
            typeof fallbackUser === "object"
        )
            ? fallbackUser
            : {};


    profile = new Proxy(profile, {

        get(target, prop) {

            if (
                typeof prop !== "string" ||
                prop in target
            ) {

                return target[prop];

            }


            const match =
                Object.keys(target).find(
                    key =>
                        key.toLowerCase() ===
                        prop.toLowerCase()
                );


            return match
                ? target[match]
                : undefined;

        }

    });


    return {

        fullName:
            profile.fullName ||
            profile.name ||
            item?.fullName ||
            item?.name ||
            fallbackUser.fullName ||
            fallbackUser.name ||
            fallbackUser.username ||
            "",


        email:
            profile.email ||
            item?.email ||
            item?.userEmail ||
            fallbackUser.email ||
            "",


        age:
            profile.age ??
            item?.age ??
            "",


        gender:
            profile.gender ||
            item?.gender ||
            "",


        state:
            profile.state ||
            item?.state ||
            "",


        courseCategory:
            profile.courseCategory ||
            profile.category ||
            item?.courseCategory ||
            item?.category ||
            "",


        course:
            profile.course ||
            profile.courseName ||
            item?.course ||
            item?.courseName ||
            "",


        yearOfStudy:
            profile.yearOfStudy ||
            profile.year ||
            item?.yearOfStudy ||
            item?.year ||
            "",


        firstGraduate:
            profile.firstGraduate ??
            item?.firstGraduate ??
            "",


        singleChild:
            profile.singleChild ??
            item?.singleChild ??
            "",


        community:
            profile.community ||
            item?.community ||
            "",


        familyIncome:
            profile.familyIncome ||
            profile.income ||
            item?.familyIncome ||
            item?.income ||
            "",


        percentage:
            profile.percentage ??
            profile.marks ??
            item?.percentage ??
            item?.marks ??
            ""

    };

}


/* =========================================================
   NORMALIZE HISTORY ITEM
========================================================= */

function normalizeHistoryItem(
    item,
    fallbackUser = null
) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return null;

    }


    const rawProfile =
        item.profile ||
        item.eligibilityData ||
        item.studentProfile ||
        item.userProfile ||
        {};


    const profile =
        normalizeProfile(
            rawProfile,
            fallbackUser,
            item
        );


    const isCompact =
        Array.isArray(item.eligibleIds);


    let eligible = [];

    let notEligible = [];


    /* ---------- ELIGIBLE SOURCES ---------- */

    const eligibleSources = [

        item.eligibleScholarships,
        item.eligible,
        item.eligibleMatches,
        item.eligibleResults,
        item.matchedScholarships,
        item.eligibleData

    ];


    for (
        const source of eligibleSources
    ) {

        if (Array.isArray(source)) {

            eligible = source.slice();

            break;

        }

    }


    /* ---------- NOT ELIGIBLE SOURCES ---------- */

    const notEligibleSources = [

        item.notEligibleScholarships,
        item.notEligible,
        item.notEligibleMatches,
        item.notEligibleResults,
        item.rejectedScholarships,
        item.notEligibleData

    ];


    for (
        const source of notEligibleSources
    ) {

        if (Array.isArray(source)) {

            notEligible = source.slice();

            break;

        }

    }


    /* ---------- RESULTS ARRAY FALLBACK ---------- */

    if (
        eligible.length === 0 &&
        notEligible.length === 0 &&
        Array.isArray(item.results)
    ) {

        item.results.forEach(result => {

            if (
                !result ||
                typeof result !== "object"
            ) {

                return;

            }


            const status =
                String(
                    result.status ||
                    result.eligibility ||
                    result.result ||
                    result.eligible ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const isEligible =
                result.eligible === true ||
                status === "eligible" ||
                (
                    status.includes("eligible") &&
                    !status.includes("not")
                );


            if (isEligible) {

                eligible.push(result);

            } else {

                notEligible.push(result);

            }

        });

    }


    const checkedAt =
        item.checkedAt ||
        item.createdAt ||
        item.timestamp ||
        item.date ||
        new Date().toISOString();


    const userId =
        item.userId ||
        item.currentUserId ||
        item.accountId ||
        fallbackUser?.userId ||
        fallbackUser?.id ||
        fallbackUser?.email ||
        getUserId();


    return {

        ...item,

        userId,

        profile,

        originalProfile: rawProfile,

        fullName: profile.fullName,

        email: profile.email,

        eligibleScholarships: eligible,

        notEligibleScholarships: notEligible,

        eligibleCount:
            isCompact
                ? (
                    item.eligibleCount ??
                    item.eligibleIds.length
                )
                : eligible.length,

        notEligibleCount:
            isCompact
                ? (
                    item.notEligibleCount ??
                    (
                        Array.isArray(
                            item.notEligibleIds
                        )
                            ? item.notEligibleIds.length
                            : 0
                    )
                )
                : notEligible.length,

        checkedAt

    };

}


/* =========================================================
   HISTORY ID / FINGERPRINT
========================================================= */

function arraySignature(array) {

    if (!Array.isArray(array)) {

        return "";

    }


    return array.map(item => {

        if (
            !item ||
            typeof item !== "object"
        ) {

            return String(item);

        }


        return (

            item.Id ||
            item.id ||
            item["Scholarship Name"] ||
            item.scholarshipName ||
            item.scholarship_name ||
            item.name ||
            item.title ||
            ""

        );

    }).join("|");

}


function getHistoryIdentity(item) {

    if (!item) return "";


    const explicitId =
        item.historyId ||
        item.checkId ||
        item.id;


    if (explicitId) {

        return (
            "ID:" +
            String(explicitId)
                .trim()
                .toLowerCase()
        );

    }


    const profile =
        item.profile || {};


    const eligible =
        Array.isArray(
            item.eligibleScholarships
        )
            ? item.eligibleScholarships
            : [];


    const notEligible =
        Array.isArray(
            item.notEligibleScholarships
        )
            ? item.notEligibleScholarships
            : [];


    const scholarshipSignature =
        arraySignature(eligible) +
        "|" +
        arraySignature(notEligible);


    return [

        String(item.userId || "")
            .trim()
            .toLowerCase(),

        String(item.checkedAt || ""),

        String(profile.fullName || "")
            .trim()
            .toLowerCase(),

        String(profile.email || "")
            .trim()
            .toLowerCase(),

        String(eligible.length),

        String(notEligible.length),

        scholarshipSignature

    ].join("||");

}


function sameHistoryRecord(a, b) {

    if (!a || !b) return false;


    const aId =
        a.historyId ||
        a.checkId ||
        a.id;


    const bId =
        b.historyId ||
        b.checkId ||
        b.id;


    if (aId && bId) {

        return (
            String(aId)
                .trim()
                .toLowerCase() ===
            String(bId)
                .trim()
                .toLowerCase()
        );

    }


    return (
        getHistoryIdentity(a) ===
        getHistoryIdentity(b)
    );

}


/* =========================================================
   GET ALL USER HISTORY
========================================================= */

function getEligibilityHistory() {

    const users = getUsers();

    const userId = getUserId();

    const currentUser = getCurrentUser();

    const allRecords = [];


    const pushAll = source => {

        if (!Array.isArray(source)) return;


        source.forEach(item => {

            const normalized =
                normalizeHistoryItem(
                    item,
                    currentUser
                );


            if (normalized) {

                allRecords.push(normalized);

            }

        });

    };


    /* 1. USER OBJECT */

    const userKey =
        findUserKey(
            users,
            userId
        );


    if (userKey !== -1) {

        const user =
            users[userKey];


        pushAll(
            user?.eligibilityHistory
        );

        pushAll(
            user?.history
        );

        pushAll(
            user?.eligibilityHistories
        );

    }


    /* 2. USER-SPECIFIC STORAGE */

    historyKeysFor(userId)
        .forEach(key => {

            pushAll(
                readJSON(
                    key,
                    null
                )
            );

        });


    /* 3. GLOBAL HISTORY */

    const globalHistory =
        readJSON(
            "eligibilityHistory",
            []
        );


    if (Array.isArray(globalHistory)) {

        const currentEmail =
            String(
                currentUser?.email || ""
            )
                .trim()
                .toLowerCase();


        const currentId =
            String(userId || "")
                .trim()
                .toLowerCase();


        globalHistory.forEach(item => {

            if (
                !item ||
                typeof item !== "object"
            ) {

                return;

            }


            const itemId =
                String(
                    item.userId ||
                    item.currentUserId ||
                    item.accountId ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const itemEmail =
                String(
                    item.email ||
                    item.userEmail ||
                    item.profile?.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const belongsToUser =
                (
                    itemId &&
                    itemId === currentId
                ) ||
                (
                    itemEmail &&
                    currentEmail &&
                    itemEmail === currentEmail
                );


            if (!belongsToUser) return;


            const normalized =
                normalizeHistoryItem(
                    item,
                    currentUser
                );


            if (normalized) {

                allRecords.push(normalized);

            }

        });

    }


    /* 4. REMOVE DUPLICATES */

    const unique = [];

    const seen = new Set();


    allRecords.forEach(item => {

        const identity =
            getHistoryIdentity(item);


        if (seen.has(identity)) return;


        seen.add(identity);

        unique.push(item);

    });


    /* 5. NEWEST FIRST */

    unique.sort((a, b) => {

        const dateA =
            new Date(
                a.checkedAt
            ).getTime();


        const dateB =
            new Date(
                b.checkedAt
            ).getTime();


        return (
            (isNaN(dateB) ? 0 : dateB) -
            (isNaN(dateA) ? 0 : dateA)
        );

    });


    console.log(
        "ELIGIFY | ALL HISTORY:",
        unique
    );


    return unique;

}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {

        return "Date not available";

    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return "Date not available";

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

    if (!value) return "";


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

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


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

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
   CREATE HISTORY CARD
   NO BEST MATCH / NO SCORE
========================================================= */

function createHistoryCard(
    item,
    index
) {

    const profile =
        item.profile || {};


    const eligible =
        Array.isArray(
            item.eligibleScholarships
        )
            ? item.eligibleScholarships
            : [];


    const notEligible =
        Array.isArray(
            item.notEligibleScholarships
        )
            ? item.notEligibleScholarships
            : [];


    const eligibleTotal =
        item.eligibleCount ??
        eligible.length;


    const notEligibleTotal =
        item.notEligibleCount ??
        notEligible.length;


    const studentName =
        profile.fullName ||
        item.fullName ||
        item.name ||
        item.studentName ||
        "Eligify Account";


    return `

        <article
            class="history-card"
            data-history-index="${index}"
        >

            <div class="history-card-header">

                <div>

                    <span class="check-number">
                        Eligibility Check #${index + 1}
                    </span>


                    <h2>
                        ${escapeHTML(studentName)}
                    </h2>


                    <p class="checked-date">

                        📅 ${formatDate(item.checkedAt)}

                        ${
                            formatTime(item.checkedAt)
                                ? ` • ${formatTime(item.checkedAt)}`
                                : ""
                        }

                    </p>

                </div>


                <button
                    type="button"
                    class="delete-history-btn"
                    data-delete-index="${index}"
                >

                    🗑 Delete

                </button>

            </div>



            <!-- RESULT COUNTS -->

            <div class="result-summary">

                <div class="result-box eligible-box">

                    <span class="result-number">
                        ${eligibleTotal}
                    </span>

                    <span class="result-label">
                        Eligible
                    </span>

                </div>


                <div class="result-box noteligible-box">

                    <span class="result-number">
                        ${notEligibleTotal}
                    </span>

                    <span class="result-label">
                        Not Eligible
                    </span>

                </div>

            </div>



            <!-- VIEW RESULT -->

            <div class="history-card-footer">

                <button
                    type="button"
                    class="view-result-btn"
                    data-view-index="${index}"
                >

                    View Results

                </button>

            </div>


        </article>

    `;

}


/* =========================================================
   RENDER
========================================================= */

function renderHistory() {

    if (!historyList) return;


    const history =
        getEligibilityHistory();


    /* TOTAL CHECKS */

    if (historyCount) {

        historyCount.textContent =
            history.length;

    }


    /* TOTAL ELIGIBLE */

    const totalEligible =
        history.reduce(
            (total, item) =>
                total +
                Number(
                    item.eligibleCount || 0
                ),
            0
        );


    /* TOTAL NOT ELIGIBLE */

    const totalNotEligible =
        history.reduce(
            (total, item) =>
                total +
                Number(
                    item.notEligibleCount || 0
                ),
            0
        );


    if (eligibleCountElement) {

        eligibleCountElement.textContent =
            totalEligible;

    }


    if (notEligibleCountElement) {

        notEligibleCountElement.textContent =
            totalNotEligible;

    }


    /* HISTORY STATUS */

    const historyStatus =
        document.getElementById(
            "historyStatus"
        );


    if (historyStatus) {

        historyStatus.textContent =
            `${history.length} ${
                history.length === 1
                    ? "check"
                    : "checks"
            }`;

    }


    /* EMPTY */

    if (history.length === 0) {

        historyList.innerHTML = "";


        if (emptyHistory) {

            emptyHistory.style.display =
                "block";

        }


        return;

    }


    if (emptyHistory) {

        emptyHistory.style.display =
            "none";

    }


    /* CREATE CARDS */

    historyList.innerHTML =
        history
            .map(
                (item, index) =>
                    createHistoryCard(
                        item,
                        index
                    )
            )
            .join("");


    setupHistoryButtons();

}


/* =========================================================
   BUTTONS
========================================================= */

function setupHistoryButtons() {


    /* VIEW RESULT */

    document
        .querySelectorAll(".view-result-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openHistoryResult(
                        Number(
                            button.dataset.viewIndex
                        )
                    );

                }
            );

        });


    /* DELETE */

    document
        .querySelectorAll(".delete-history-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showDeletePopup(
                        Number(
                            button.dataset.deleteIndex
                        )
                    );

                }
            );

        });

}


/* =========================================================
   VIEW COMPLETE RESULT
   SAME LOGIC — DO NOT CHANGE
========================================================= */

function openHistoryResult(index) {

    const history =
        getEligibilityHistory();


    const item =
        history[index];


    if (!item) {

        showToast(
            "!",
            "Unable to open this result"
        );

        return;

    }


    /* COMPLETE DEEP COPY */

    const selectedHistory =
        JSON.parse(
            JSON.stringify(item)
        );


    /* ORIGINAL PROFILE */

    selectedHistory.profile =
        selectedHistory.originalProfile ||
        selectedHistory.profile;


    delete selectedHistory.originalProfile;


    /* PRIORITY ORDER */

    if (
        Array.isArray(
            selectedHistory.eligibleScholarships
        )
    ) {

        selectedHistory
            .eligibleScholarships
            .sort(
                (a, b) => {

                    const priorityA =
                        Number(
                            a?.priority ?? 999
                        );

                    const priorityB =
                        Number(
                            b?.priority ?? 999
                        );

                    if (
                        priorityA !==
                        priorityB
                    ) {

                        return (
                            priorityA -
                            priorityB
                        );

                    }

                    return 0;

                }
            );

    }


    if (
        Array.isArray(
            selectedHistory.notEligibleScholarships
        )
    ) {

        selectedHistory
            .notEligibleScholarships
            .sort(
                (a, b) => {

                    const priorityA =
                        Number(
                            a?.priority ?? 999
                        );

                    const priorityB =
                        Number(
                            b?.priority ?? 999
                        );

                    if (
                        priorityA !==
                        priorityB
                    ) {

                        return (
                            priorityA -
                            priorityB
                        );

                    }

                    return 0;

                }
            );

    }


    /* GUARANTEE ID */

    if (!selectedHistory.historyId) {

        selectedHistory.historyId =

            selectedHistory.checkId ||

            selectedHistory.id ||

            `HIS-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;

    }


    /*
       RESULTS.JS READS THIS
       BEFORE CREATING A FRESH RESULT
    */

    writeJSON(
        "selectedEligibilityHistory",
        selectedHistory
    );


    writeJSON(
        "eligifySelectedHistory",
        selectedHistory
    );


    localStorage.setItem(
        "selectedEligibilityHistoryIndex",
        String(index)
    );


    /* SAME RESULT PAGE */

    window.location.href =
        "results.html";

}


/* =========================================================
   DELETE POPUP STYLES
========================================================= */

function ensurePopupStyles() {

    if (
        document.getElementById(
            "historyDeletePopupStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "historyDeletePopupStyles";


    style.textContent = `

        #historyDeletePopup,
        #clearHistoryPopup {

            position: fixed;
            inset: 0;
            z-index: 99999;
            display: none;

        }


        .delete-popup-overlay {

            position: fixed;
            inset: 0;

            background:
                rgba(0,0,0,.48);

            display: flex;

            align-items: center;
            justify-content: center;

            padding: 20px;

            backdrop-filter:
                blur(3px);

        }


        .delete-popup-box {

            position: relative;

            width:
                min(400px, 100%);

            background: #fff;

            border-radius: 18px;

            padding:
                30px 28px 25px;

            text-align: center;

            box-shadow:
                0 22px 60px
                rgba(0,0,0,.20);

            animation:
                deletePopupIn
                .18s ease;

            font-family:
                "Poppins",
                sans-serif;

        }


        @keyframes deletePopupIn {

            from {

                opacity: 0;
                transform:
                    translateY(10px)
                    scale(.97);

            }

            to {

                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);

            }

        }


        .delete-popup-close {

            position: absolute;

            top: 13px;
            right: 15px;

            width: 31px;
            height: 31px;

            border: none;

            border-radius: 50%;

            background:
                #f1f4f4;

            color:
                #68747d;

            font-size: 20px;

            cursor: pointer;

        }


        .delete-popup-icon {

            width: 58px;
            height: 58px;

            margin:
                0 auto 15px;

            border-radius: 50%;

            background:
                #fceeee;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 25px;

        }


        .delete-popup-box h2 {

            margin: 0;

            color:
                #084746;

            font-size: 20px;

            font-weight: 700;

        }


        .delete-popup-box p {

            margin:
                9px auto 22px;

            max-width: 320px;

            color:
                #68747d;

            font-size: 12px;

            line-height: 1.6;

        }


        .delete-popup-actions {

            display: flex;

            justify-content: center;

            gap: 10px;

        }


        .delete-cancel-btn,
        .delete-confirm-btn {

            min-width: 105px;

            padding:
                10px 18px;

            border-radius: 8px;

            font-family:
                "Poppins",
                sans-serif;

            font-size: 12px;

            font-weight: 600;

            cursor: pointer;

        }


        .delete-cancel-btn {

            border:
                1px solid #dfe6e6;

            background: #fff;

            color:
                #68747d;

        }


        .delete-confirm-btn {

            border:
                1px solid #c94a4a;

            background:
                #c94a4a;

            color: #fff;

        }


        @media (max-width:500px) {

            .delete-popup-box {

                padding:
                    27px 20px 22px;

            }


            .delete-popup-actions {

                flex-direction:
                    column-reverse;

            }


            .delete-cancel-btn,
            .delete-confirm-btn {

                width: 100%;

            }

        }

    `;


    document.head.appendChild(style);

}


/* =========================================================
   CREATE DELETE POPUP
========================================================= */

function createDeletePopup() {

    let popup =
        document.getElementById(
            "historyDeletePopup"
        );


    if (popup) return popup;


    popup =
        document.createElement("div");


    popup.id =
        "historyDeletePopup";


    popup.innerHTML = `

        <div class="delete-popup-overlay">

            <div class="delete-popup-box">

                <button
                    type="button"
                    class="delete-popup-close"
                    id="deletePopupClose"
                >
                    ×
                </button>


                <div class="delete-popup-icon">
                    🗑
                </div>


                <h2>
                    Delete History?
                </h2>


                <p id="deletePopupMessage">
                    Are you sure you want to delete this eligibility history?
                </p>


                <div class="delete-popup-actions">

                    <button
                        type="button"
                        class="delete-cancel-btn"
                        id="deleteCancelBtn"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        class="delete-confirm-btn"
                        id="deleteConfirmBtn"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(popup);


    ensurePopupStyles();


    return popup;

}


/* =========================================================
   SHOW DELETE POPUP
========================================================= */

function showDeletePopup(index) {

    const history =
        getEligibilityHistory();


    const item =
        history[index];


    if (!item) return;


    const profile =
        item.profile || {};


    const name =
        profile.fullName ||
        item.fullName ||
        item.name ||
        "this history";


    const popup =
        createDeletePopup();


    const message =
        document.getElementById(
            "deletePopupMessage"
        );


    if (message) {

        message.textContent =
            `Are you sure you want to delete the eligibility history of ${name}?`;

    }


    popup.style.display =
        "block";


    const closePopup = () => {

        popup.style.display =
            "none";

    };


    const closeBtn =
        document.getElementById(
            "deletePopupClose"
        );


    const cancelBtn =
        document.getElementById(
            "deleteCancelBtn"
        );


    const confirmBtn =
        document.getElementById(
            "deleteConfirmBtn"
        );


    if (closeBtn) {

        closeBtn.onclick =
            closePopup;

    }


    if (cancelBtn) {

        cancelBtn.onclick =
            closePopup;

    }


    if (confirmBtn) {

        confirmBtn.onclick = () => {

            closePopup();

            deleteSingleHistory(index);

        };

    }


    const overlay =
        popup.querySelector(
            ".delete-popup-overlay"
        );


    if (overlay) {

        overlay.onclick =
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    closePopup();

                }

            };

    }

}


/* =========================================================
   REMOVE ONE RECORD
========================================================= */

function removeOneMatching(
    array,
    target
) {

    if (!Array.isArray(array)) {

        return [];

    }


    let removed = false;


    return array.filter(record => {

        if (removed) {

            return true;

        }


        if (
            sameHistoryRecord(
                record,
                target
            )
        ) {

            removed = true;

            return false;

        }


        return true;

    });

}


/* =========================================================
   BELONGS TO CURRENT USER
========================================================= */

function belongsToCurrentUser(
    record,
    currentId,
    currentEmail
) {

    const recordId =
        String(
            record?.userId ||
            record?.currentUserId ||
            record?.accountId ||
            ""
        )
            .trim()
            .toLowerCase();


    const recordEmail =
        String(
            record?.email ||
            record?.userEmail ||
            record?.profile?.email ||
            ""
        )
            .trim()
            .toLowerCase();


    return (

        (
            recordId &&
            recordId === currentId
        ) ||

        (
            recordEmail &&
            currentEmail &&
            recordEmail === currentEmail
        )

    );

}


/* =========================================================
   DELETE SINGLE HISTORY
========================================================= */

function deleteSingleHistory(index) {

    const history =
        getEligibilityHistory();


    const target =
        history[index];


    if (!target) return;


    const users =
        getUsers();


    const userId =
        getUserId();


    const userKey =
        findUserKey(
            users,
            userId
        );


    /* USER OBJECT */

    if (userKey !== -1) {

        const user =
            users[userKey];


        [
            "eligibilityHistory",
            "history",
            "eligibilityHistories"
        ]
            .forEach(field => {

                if (
                    Array.isArray(
                        user[field]
                    )
                ) {

                    user[field] =
                        removeOneMatching(
                            user[field],
                            target
                        );

                }

            });


        users[userKey] =
            user;


        saveUsers(users);

    }


    /* USER-SPECIFIC HISTORY */

    historyKeysFor(userId)
        .forEach(key => {

            const data =
                readJSON(
                    key,
                    null
                );


            if (Array.isArray(data)) {

                writeJSON(
                    key,
                    removeOneMatching(
                        data,
                        target
                    )
                );

            }

        });


    /* GLOBAL HISTORY */

    const globalHistory =
        readJSON(
            "eligibilityHistory",
            []
        );


    if (Array.isArray(globalHistory)) {

        const currentUser =
            getCurrentUser();


        const currentEmail =
            String(
                currentUser?.email || ""
            )
                .trim()
                .toLowerCase();


        const currentId =
            String(userId || "")
                .trim()
                .toLowerCase();


        let removed = false;


        const updated =
            globalHistory.filter(
                record => {

                    if (removed) {

                        return true;

                    }


                    if (
                        !belongsToCurrentUser(
                            record,
                            currentId,
                            currentEmail
                        )
                    ) {

                        return true;

                    }


                    if (
                        sameHistoryRecord(
                            record,
                            target
                        )
                    ) {

                        removed = true;

                        return false;

                    }


                    return true;

                }
            );


        writeJSON(
            "eligibilityHistory",
            updated
        );

    }


    /* REMOVE SELECTED RESULT */

    localStorage.removeItem(
        "selectedEligibilityHistory"
    );

    localStorage.removeItem(
        "eligifySelectedHistory"
    );

    localStorage.removeItem(
        "selectedEligibilityHistoryIndex"
    );


    renderHistory();


    showToast(
        "✓",
        "History deleted successfully"
    );

}


/* =========================================================
   CLEAR ALL HISTORY
========================================================= */

function clearHistory() {

    const history =
        getEligibilityHistory();


    if (history.length === 0) {

        showToast(
            "ℹ",
            "No history to clear"
        );

        return;

    }


    const popup =
        createClearPopup();


    popup.style.display =
        "block";

}


/* =========================================================
   CREATE CLEAR POPUP
========================================================= */

function createClearPopup() {

    let popup =
        document.getElementById(
            "clearHistoryPopup"
        );


    if (popup) return popup;


    popup =
        document.createElement("div");


    popup.id =
        "clearHistoryPopup";


    popup.innerHTML = `

        <div class="delete-popup-overlay">

            <div class="delete-popup-box">

                <button
                    type="button"
                    class="delete-popup-close"
                    id="clearPopupClose"
                >
                    ×
                </button>


                <div class="delete-popup-icon">
                    🗑
                </div>


                <h2>
                    Clear All History?
                </h2>


                <p>
                    Are you sure you want to clear all your eligibility history?
                </p>


                <div class="delete-popup-actions">

                    <button
                        type="button"
                        class="delete-cancel-btn"
                        id="clearCancelBtn"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        class="delete-confirm-btn"
                        id="clearConfirmBtn"
                    >
                        Clear All
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(popup);


    ensurePopupStyles();


    const close = () => {

        popup.style.display =
            "none";

    };


    document
        .getElementById(
            "clearPopupClose"
        )
        .onclick = close;


    document
        .getElementById(
            "clearCancelBtn"
        )
        .onclick = close;


    document
        .getElementById(
            "clearConfirmBtn"
        )
        .onclick = () => {

            close();

            performClearHistory();

        };


    return popup;

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function performClearHistory() {

    const users =
        getUsers();


    const userId =
        getUserId();


    const userKey =
        findUserKey(
            users,
            userId
        );


    if (userKey !== -1) {

        const user =
            users[userKey];


        [
            "eligibilityHistory",
            "history",
            "eligibilityHistories"
        ]
            .forEach(field => {

                if (
                    Array.isArray(
                        user[field]
                    )
                ) {

                    user[field] = [];

                }

            });


        users[userKey] =
            user;


        saveUsers(users);

    }


    /* USER HISTORY */

    historyKeysFor(userId)
        .forEach(key => {

            localStorage.removeItem(key);

        });


    /* GLOBAL HISTORY */

    const globalHistory =
        readJSON(
            "eligibilityHistory",
            []
        );


    if (Array.isArray(globalHistory)) {

        const currentUser =
            getCurrentUser();


        const currentEmail =
            String(
                currentUser?.email || ""
            )
                .trim()
                .toLowerCase();


        const currentId =
            String(userId || "")
                .trim()
                .toLowerCase();


        const remaining =
            globalHistory.filter(
                record =>
                    !belongsToCurrentUser(
                        record,
                        currentId,
                        currentEmail
                    )
            );


        writeJSON(
            "eligibilityHistory",
            remaining
        );

    }


    /* CLEAR SELECTED RESULT */

    localStorage.removeItem(
        "selectedEligibilityHistory"
    );

    localStorage.removeItem(
        "eligifySelectedHistory"
    );

    localStorage.removeItem(
        "selectedEligibilityHistoryIndex"
    );


    renderHistory();


    showToast(
        "✓",
        "All history cleared"
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    icon,
    message
) {

    if (!historyToast) return;


    if (toastIcon) {

        toastIcon.textContent =
            icon;

    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    historyToast.classList.add(
        "show"
    );


    setTimeout(() => {

        historyToast.classList.remove(
            "show"
        );

    }, 2500);

}


/* =========================================================
   EVENTS
========================================================= */

function setupEventListeners() {

    if (clearHistoryBtn) {

        clearHistoryBtn.addEventListener(
            "click",
            clearHistory
        );

    }


    if (emptyCheckBtn) {

        emptyCheckBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "eligibility.html";

            }
        );

    }

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEventListeners();

        renderHistory();

    }
);