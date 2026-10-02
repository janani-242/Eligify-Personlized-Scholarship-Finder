/* =========================================================
   ELIGIFY - RESULTS.JS  (quota-safe version)
========================================================= */

"use strict";

const API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";

const MAX_RESULTS = 100;
const FETCH_TIMEOUT = 15000;

const STORAGE = {
    currentUser: "currentUser",
    currentUserId: "currentUserId",
    eligibilityData: "eligibilityData",
    selectedScholarship: "selectedScholarship",
    scholarshipCache: "eligifyScholarshipCache"
};

/* =========================================================
   STORAGE CORE  (quota-safe)
   - History is stored COMPACT (ids + counts + best match)
   - Writes never throw; they auto-clean and retry
========================================================= */

const MAX_HISTORY_RECORDS = 20;
const MAX_SAVED = 100;
const MAX_VIEWED = 30;
const HISTORY_PREFIX = "eligibilityHistory_";

function readJSON(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const value = JSON.parse(raw);
        return value === null || value === undefined ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function slimScholarship(s) {
    if (!s || typeof s !== "object") return s;
    const copy = {};
    Object.keys(s).forEach(k => {
        if (k === "matchReasons" || k === "failureReasons") return;
        copy[k] = s[k];
    });
    return copy;
}

function scholarshipKey(s) {
    if (!s || typeof s !== "object") return String(s || "");
    return String(s.id || s.Id || s.ID || s["Scholarship Name"] || s.name || "").trim();
}

function pickBest(list) {
    if (!Array.isArray(list) || !list.length) return null;
    return list.slice().sort((a, b) => {
        const pa = Number(a && a.priority) || 4;
        const pb = Number(b && b.priority) || 4;
        if (pa !== pb) return pa - pb;
        const sa = Number(a && (a.matchScore ?? a.score)) || 0;
        const sb = Number(b && (b.matchScore ?? b.score)) || 0;
        return sb - sa;
    })[0];
}

function summarizeBest(s) {
    if (!s || typeof s !== "object") return null;
    return {
        id: scholarshipKey(s),
        name: s.name || s["Scholarship Name"] || s.scholarshipName || "",
        provider: s.provider || s.Provider || "",
        amount: s.amount || s["Scholarship Amount"] || "",
        matchScore: Number(s.matchScore ?? s.score ?? 0) || 0,
        priority: Number(s.priority) || 4
    };
}

function compactProfile(profile) {
    const out = {};
    if (!profile || typeof profile !== "object") return out;
    Object.keys(profile).forEach(k => {
        const v = profile[k];
        if (v === null || v === undefined || typeof v === "object") return;
        if (typeof v === "string" && v.length > 200) return;
        out[k] = v;
    });
    return out;
}

function compactRecord(rec) {
    if (!rec || typeof rec !== "object") return null;

    const checkedAt = rec.checkedAt || rec.createdAt || rec.timestamp || rec.date || new Date().toISOString();
    const id = String(rec.id || rec.historyId || rec.checkId || ("ELG-HISTORY-" + (Date.parse(checkedAt) || Date.now())));
    const profile = compactProfile(rec.profile || rec.eligibilityData || rec.studentProfile || rec.userProfile || {});
    const userId = rec.userId ? String(rec.userId) : "";

    if (Array.isArray(rec.eligibleIds)) {
        return {
            id, userId, checkedAt, profile,
            eligibleIds: rec.eligibleIds,
            notEligibleIds: Array.isArray(rec.notEligibleIds) ? rec.notEligibleIds : [],
            closedIds: Array.isArray(rec.closedIds) ? rec.closedIds : [],
            eligibleCount: rec.eligibleCount ?? rec.eligibleIds.length,
            notEligibleCount: rec.notEligibleCount ?? (Array.isArray(rec.notEligibleIds) ? rec.notEligibleIds.length : 0),
            closedCount: rec.closedCount ?? (Array.isArray(rec.closedIds) ? rec.closedIds.length : 0),
            bestMatch: rec.bestMatch || null,
            signature: rec.signature || ""
        };
    }

    const pickArr = (...candidates) => {
        for (const c of candidates) if (Array.isArray(c)) return c;
        return [];
    };

    const eligible = pickArr(rec.eligibleScholarships, rec.eligible, rec.eligibleMatches, rec.matchedScholarships);
    const notEligible = pickArr(rec.notEligibleScholarships, rec.notEligible, rec.notEligibleMatches);
    const closed = pickArr(rec.closedScholarships);

    return {
        id, userId, checkedAt, profile,
        eligibleIds: eligible.map(scholarshipKey),
        notEligibleIds: notEligible.map(scholarshipKey),
        closedIds: closed.map(scholarshipKey),
        eligibleCount: eligible.length,
        notEligibleCount: notEligible.length,
        closedCount: closed.length,
        bestMatch: summarizeBest(pickBest(eligible)),
        signature: ""
    };
}

function trimKeysByPrefix(prefix, max) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach(k => {
        try {
            const list = JSON.parse(localStorage.getItem(k) || "[]");
            if (Array.isArray(list) && list.length > max) {
                localStorage.setItem(k, JSON.stringify(list.slice(0, max)));
            }
        } catch (e) { /* ignore */ }
    });
}

/* One-time (idempotent) migration: moves old BIG history out of
   eligifyUsers / currentUser into small per-user compact keys. */

function migrateLegacyStorage() {

    try {

        const users = readJSON("eligifyUsers", null);
        const pending = {};
        let usersChanged = false;

        const needsSlim = (arr, max) =>
            Array.isArray(arr) &&
            (arr.length > max || arr.some(x => x && (x.matchReasons || x.failureReasons)));

        if (Array.isArray(users)) {

            users.forEach(user => {

                if (!user || typeof user !== "object") return;

                const uid = String(user.id || "");

                if ("history" in user || "eligibilityHistory" in user) {

                    const legacy = [].concat(
                        Array.isArray(user.history) ? user.history : [],
                        Array.isArray(user.eligibilityHistory) ? user.eligibilityHistory : []
                    );

                    if (uid) {
                        pending[uid] = (pending[uid] || []).concat(
                            legacy.map(compactRecord).filter(Boolean)
                        );
                    }

                    delete user.history;
                    delete user.eligibilityHistory;
                    usersChanged = true;
                }

                if (needsSlim(user.saved, MAX_SAVED)) {
                    user.saved = user.saved.slice(0, MAX_SAVED).map(slimScholarship);
                    usersChanged = true;
                }

                if (needsSlim(user.recentlyViewed, MAX_VIEWED)) {
                    user.recentlyViewed = user.recentlyViewed.slice(0, MAX_VIEWED).map(slimScholarship);
                    usersChanged = true;
                }

            });

            if (usersChanged) {
                try {
                    localStorage.setItem("eligifyUsers", JSON.stringify(users));
                } catch (e) {
                    return;
                }
            }

        }

        const cu = readJSON("currentUser", null);

        if (cu && typeof cu === "object" && (usersChanged || "history" in cu || "eligibilityHistory" in cu)) {

            const match = Array.isArray(users)
                ? users.find(u => u && String(u.id) === String(cu.id))
                : null;

            const next = match || cu;

            delete next.history;
            delete next.eligibilityHistory;

            try {
                localStorage.setItem("currentUser", JSON.stringify(next));
            } catch (e) { /* ignore */ }

        }

        const keys = new Set(Object.keys(pending).map(id => HISTORY_PREFIX + id));

        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(HISTORY_PREFIX)) keys.add(k);
        }

        keys.forEach(key => {

            const uid = key.slice(HISTORY_PREFIX.length);
            const existing = readJSON(key, []);

            const merged = (Array.isArray(existing) ? existing : [])
                .map(compactRecord)
                .filter(Boolean)
                .concat(pending[uid] || []);

            const seen = new Set();
            const unique = [];

            merged.forEach(r => {
                if (seen.has(r.id)) return;
                seen.add(r.id);
                unique.push(r);
            });

            unique.sort((a, b) => (Date.parse(b.checkedAt) || 0) - (Date.parse(a.checkedAt) || 0));

            try {
                localStorage.setItem(key, JSON.stringify(unique.slice(0, MAX_HISTORY_RECORDS)));
            } catch (e) { /* ignore */ }

        });

    } catch (error) {
        console.warn("Storage migration skipped:", error);
    }

}

const CLEANUP_STEPS = [

    () => localStorage.removeItem("eligifyScholarshipCache"),

    () => {
        ["selectedEligibilityHistory", "eligifySelectedHistory", "selectedEligibilityHistoryIndex"]
            .forEach(k => localStorage.removeItem(k));
    },

    () => migrateLegacyStorage(),

    () => trimKeysByPrefix("eligifyHistory_", 10),

    () => trimKeysByPrefix(HISTORY_PREFIX, 8),

    () => trimKeysByPrefix("eligifySaved_", 30),

    () => trimKeysByPrefix("eligifyHistory_", 3),

    () => trimKeysByPrefix(HISTORY_PREFIX, 3)

];

/* Never throws. Returns true/false.
   cleanup=false → try once only (for regenerable data). */

function safeSetLocalStorage(key, value, cleanup = true) {

    let text;

    try {
        text = typeof value === "string" ? value : JSON.stringify(value);
    } catch (e) {
        return false;
    }

    try {
        localStorage.setItem(key, text);
        return true;
    } catch (e) { /* quota → continue */ }

    if (!cleanup) return false;

    for (const step of CLEANUP_STEPS) {

        try { step(); } catch (e) { /* ignore */ }

        try {
            localStorage.setItem(key, text);
            return true;
        } catch (e) { /* keep cleaning */ }

    }

    if (Array.isArray(value)) {

        let trimmed = value.slice();

        while (trimmed.length > 1) {

            trimmed = trimmed.slice(0, Math.ceil(trimmed.length / 2));

            try {
                localStorage.setItem(key, JSON.stringify(trimmed));
                return true;
            } catch (e) { /* keep shrinking */ }

        }

    }

    console.warn("⚠️ Could not save", key, "- storage still full.");

    return false;

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initResultsPage();
});


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

async function initResultsPage() {

    try {

        /* Move old bloated data out of the way FIRST */
        migrateLegacyStorage();

        setupButtons();
        setupProfileSidebar();
        setupModal();

        showLoader();

        updateLoader(10, "Reading profile", "Loading your latest eligibility details...", 1);

        const currentUser = getCurrentUser();

        if (!currentUser) {
            throw new Error("Please login before viewing scholarship results.");
        }


        /* -------------------------------------------------
           OPENED FROM HISTORY?
        ------------------------------------------------- */

        const selectedHistoryRaw =
            localStorage.getItem("selectedEligibilityHistory") ||
            localStorage.getItem("eligifySelectedHistory");

        let historyItem = null;

        if (selectedHistoryRaw) {

            try {
                historyItem = JSON.parse(selectedHistoryRaw);
            } catch (error) {
                historyItem = null;
            }

            /* Clear immediately so a refresh/fresh check
               never gets stuck on an old record. */

            try {
                localStorage.removeItem("selectedEligibilityHistory");
                localStorage.removeItem("eligifySelectedHistory");
                localStorage.removeItem("selectedEligibilityHistoryIndex");
            } catch (e) { /* ignore */ }

        }

        if (historyItem && typeof historyItem === "object") {

            updateLoader(40, "Loading saved result", "Opening your saved eligibility check...", 2);

            const historyProfile =
                historyItem.profile ||
                historyItem.eligibilityData ||
                {};

            renderUserProfile(historyProfile, currentUser);

            let historyResult;

            if (Array.isArray(historyItem.eligibleIds)) {

                /* NEW compact record → rebuild the EXACT same lists */

                updateLoader(60, "Loading scholarships", "Rebuilding your saved scholarship matches...", 3);

                const allScholarships = await getScholarships();

                historyResult = rebuildResultFromRecord(
                    historyItem,
                    historyProfile,
                    allScholarships
                );

            } else {

                /* OLD full record (fallback) */

                historyResult = {

                    eligible: (Array.isArray(historyItem.eligibleScholarships)
                        ? historyItem.eligibleScholarships : [])
                        .map(normalizeSavedScholarship),

                    notEligible: (Array.isArray(historyItem.notEligibleScholarships)
                        ? historyItem.notEligibleScholarships : [])
                        .map(normalizeSavedScholarship),

                    closed: (Array.isArray(historyItem.closedScholarships)
                        ? historyItem.closedScholarships : [])
                        .map(normalizeSavedScholarship)

                };

                historyResult.eligible.sort(sortScholarshipsByPriority);
                historyResult.notEligible.sort(sortScholarshipsByPriority);

            }

            renderAllResults(historyResult, historyProfile, true);

            updateLoader(100, "Results ready", "Showing your saved scholarship matches.", 4);

            await delay(500);

            hideLoader();

            return;

        }


        /* -------------------------------------------------
           FRESH CHECK
        ------------------------------------------------- */

        const profile = await getLatestEligibilityProfile(currentUser);

        if (!profile) {
            throw new Error(
                "Eligibility profile not found. Please complete your eligibility profile first."
            );
        }

        updateLoader(30, "Profile loaded", "Reading your eligibility answers...", 1);

        renderUserProfile(profile, currentUser);

        updateLoader(45, "Matching scholarships", "Comparing your profile with scholarship criteria...", 2);

        const scholarships = await getScholarships();

        updateLoader(65, "Checking eligibility", "Evaluating scholarship requirements...", 3);

        if (!Array.isArray(scholarships)) {
            throw new Error("Scholarship data is unavailable.");
        }

        const result = matchScholarships(profile, scholarships);

        updateLoader(85, "Preparing results", "Creating your personalized scholarship matches...", 4);

        renderAllResults(result, profile);

        updateLoader(100, "Results ready", "Your scholarship matches are ready.", 4);

        await delay(500);

        hideLoader();

    } catch (error) {

        console.error("Eligify Results Error:", error);

        showError(error.message || "Unable to load scholarship results.");

    }

}


/* =========================================================
   REBUILD SAVED RESULT (history → exact same lists)
========================================================= */

function decorateScholarship(profile, scholarship) {

    const evaluation = evaluateScholarship(profile, scholarship);

    scholarship.matchScore = evaluation.score;
    scholarship.matchReasons = evaluation.reasons;
    scholarship.failureReasons = evaluation.failures;
    scholarship.priority = getScholarshipPriority(scholarship);

    return evaluation;

}

function rebuildResultFromRecord(record, profile, scholarships) {

    const eligibleSet = new Set((record.eligibleIds || []).map(String));
    const notEligibleSet = new Set((record.notEligibleIds || []).map(String));
    const closedSet = new Set((record.closedIds || []).map(String));

    const eligible = [];
    const notEligible = [];
    const closed = [];

    (scholarships || []).forEach(raw => {

        const scholarship = normalizeScholarship(raw);
        const key = scholarshipKey(scholarship);

        if (eligibleSet.has(key)) {
            decorateScholarship(profile, scholarship);
            eligible.push(scholarship);
        } else if (notEligibleSet.has(key)) {
            decorateScholarship(profile, scholarship);
            notEligible.push(scholarship);
        } else if (closedSet.has(key)) {
            closed.push(scholarship);
        }

    });

    eligible.sort(sortScholarshipsByPriority);
    notEligible.sort(sortScholarshipsByPriority);

    return {
        eligible: eligible.slice(0, MAX_RESULTS),
        notEligible: notEligible.slice(0, MAX_RESULTS),
        closed: closed.slice(0, MAX_RESULTS)
    };

}

function normalizeSavedScholarship(item) {

    const s = normalizeScholarship(item);

    s.matchScore = Number((item && (item.matchScore ?? item.score)) || 0);
    s.matchReasons = (item && item.matchReasons) || [];
    s.failureReasons = (item && item.failureReasons) || [];

    s.priority =
        item && item.priority !== undefined && item.priority !== null && item.priority !== ""
            ? Number(item.priority)
            : getScholarshipPriority(s);

    return s;

}


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {

    let user = readJSON(STORAGE.currentUser, null);

    if (!user) {

        const userId = localStorage.getItem(STORAGE.currentUserId);

        if (userId) {
            user = { userId: userId };
        }

    }

    return user;

}

function getCurrentUserId(user) {

    if (!user) return "";

    return String(
        user.userId || user.UserId || user.id || user.Id ||
        localStorage.getItem(STORAGE.currentUserId) || ""
    ).trim();

}

function getCurrentEmail(user) {

    if (!user) return "";

    return String(user.email || user.Email || "").trim().toLowerCase();

}


/* =========================================================
   LATEST ELIGIBILITY PROFILE
========================================================= */

async function getLatestEligibilityProfile(user) {

    const userId = getCurrentUserId(user);
    const email = getCurrentEmail(user);

    /* 1. LOCAL PROFILE */

    const localProfile = readLocalEligibilityProfile();

    if (localProfile) {

        const localUserId = String(localProfile.userId || localProfile.UserId || "").trim();
        const localEmail = String(localProfile.email || localProfile.Email || "").trim().toLowerCase();

        if (!localUserId && !localEmail) {
            return normalizeProfile(localProfile);
        }

        if (
            (userId && localUserId === userId) ||
            (email && localEmail === email)
        ) {
            return normalizeProfile(localProfile);
        }

    }

    /* 2. USER-SCOPED STORAGE */

    if (userId) {

        const possibleKeys = [
            `eligifyEligibility_${userId}`,
            `eligifyProfile_${userId}`,
            `eligibilityProfile_${userId}`,
            "eligifyUsers"
        ];

        for (const key of possibleKeys) {

            try {

                const raw = localStorage.getItem(key);
                if (!raw) continue;

                const parsed = JSON.parse(raw);

                if (key === "eligifyUsers") {

                    if (!Array.isArray(parsed)) continue;

                    const matched = parsed.find(
                        item => String(item.userId || item.UserId || item.id || item.Id || "") === userId
                    );

                    if (matched && matched.eligibilityProfile) {
                        return normalizeProfile(matched.eligibilityProfile);
                    }

                    continue;

                }

                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    return normalizeProfile(parsed);
                }

            } catch (error) {
                console.warn("Profile storage read failed:", key);
            }

        }

    }

    /* 3. GOOGLE APPS SCRIPT */

    if (!userId) return null;

    try {

        const url = API_URL + "?type=eligibility&userId=" + encodeURIComponent(userId);

        const response = await fetchWithTimeout(url);

        if (!response.ok) {
            throw new Error("Eligibility API request failed.");
        }

        const data = await response.json();

        let profile = null;

        if (data && data.profile) {
            profile = data.profile;
        } else if (data && data.data && !Array.isArray(data.data)) {
            profile = data.data;
        } else if (data && !Array.isArray(data)) {
            profile = data;
        }

        if (profile) return normalizeProfile(profile);

    } catch (error) {
        console.warn("Eligibility API failed:", error);
    }

    return null;

}

function readLocalEligibilityProfile() {

    const keys = [STORAGE.eligibilityData, "eligifyActiveApplicant", "eligifyProfile"];

    for (const key of keys) {

        const parsed = readJSON(key, null);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
        }

    }

    return null;

}

function normalizeProfile(profile) {

    if (!profile) return null;

    const result = {};

    Object.keys(profile).forEach(key => {
        result[key] = profile[key];
    });

    return result;

}


/* =========================================================
   SCHOLARSHIP DATA
========================================================= */

async function getScholarships() {

    try {

        const response = await fetchWithTimeout(API_URL);

        if (!response.ok) {
            throw new Error("Scholarship API failed.");
        }

        const data = await response.json();

        let scholarships = [];

        if (Array.isArray(data)) {
            scholarships = data;
        } else if (data && Array.isArray(data.data)) {
            scholarships = data.data;
        } else if (data && Array.isArray(data.scholarships)) {
            scholarships = data.scholarships;
        }

        if (scholarships.length) {

            /* Cache is optional → single try, never cleans user data */
            safeSetLocalStorage(STORAGE.scholarshipCache, scholarships, false);

            return scholarships;

        }

        throw new Error("No scholarship records returned.");

    } catch (error) {

        console.warn("Scholarship API failed. Trying cache...", error);

        const cached = readJSON(STORAGE.scholarshipCache, []);

        if (Array.isArray(cached) && cached.length) {
            return cached;
        }

        throw error;

    }

}

async function fetchWithTimeout(url) {

    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {

        return await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" },
            signal: controller.signal
        });

    } finally {

        clearTimeout(timer);

    }

}


/* =========================================================
   MATCH SCHOLARSHIPS
========================================================= */

function matchScholarships(profile, scholarships) {

    const eligible = [];
    const notEligible = [];
    const closed = [];

    /* Check EVERY scholarship, limit only at the end */

    scholarships.forEach(rawScholarship => {

        const scholarship = normalizeScholarship(rawScholarship);

        if (isClosedScholarship(scholarship)) {
            closed.push(scholarship);
            return;
        }

        const evaluation = decorateScholarship(profile, scholarship);

        if (evaluation.eligible) {
            eligible.push(scholarship);
        } else {
            notEligible.push(scholarship);
        }

    });

    eligible.sort(sortScholarshipsByPriority);
    notEligible.sort(sortScholarshipsByPriority);

    return {
        eligible: eligible.slice(0, MAX_RESULTS),
        notEligible: notEligible.slice(0, MAX_RESULTS),
        closed: closed.slice(0, MAX_RESULTS)
    };

}


/* =========================================================
   SCHOLARSHIP PRIORITY
   1 = Central, 2 = State, 3 = Bank, 4 = Others
========================================================= */

function getScholarshipPriority(scholarship) {

    const centralText = normalizeText(
        [
            scholarship.name,
            scholarship.provider,
            scholarship.category,
            scholarship.scholarshipType,
            scholarship["Scholarship Type"],
            scholarship.type
        ].filter(Boolean).join(" ")
    );

    if (
        /central government/.test(centralText) ||
        /central govt/.test(centralText) ||
        /government of india/.test(centralText) ||
        /govt of india/.test(centralText) ||
        /central scheme/.test(centralText) ||
        /central sector/.test(centralText) ||
        /national scholarship/.test(centralText) ||
        /\bnsp\b/.test(centralText) ||
        /\bministry of\b/.test(centralText)
    ) {
        return 1;
    }

    if (
        /state government/.test(centralText) ||
        /state govt/.test(centralText) ||
        /government of tamil nadu/.test(centralText) ||
        /tamil nadu government/.test(centralText) ||
        /\btn government\b/.test(centralText) ||
        /state scheme/.test(centralText) ||
        /state scholarship/.test(centralText)
    ) {
        return 2;
    }

    if (
        /bank sponsored/.test(centralText) ||
        /\bbank scholarship\b/.test(centralText) ||
        /\bsbi\b/.test(centralText) ||
        /\bhdfc\b/.test(centralText) ||
        /\bicici\b/.test(centralText) ||
        /axis bank/.test(centralText) ||
        /\bkotak\b/.test(centralText) ||
        /\bindusind\b/.test(centralText) ||
        /federal bank/.test(centralText) ||
        /canara bank/.test(centralText) ||
        /union bank/.test(centralText)
    ) {
        return 3;
    }

    return 4;

}

function sortScholarshipsByPriority(a, b) {

    const priorityA = Number(a.priority || 4);
    const priorityB = Number(b.priority || 4);

    if (priorityA !== priorityB) {
        return priorityA - priorityB;
    }

    const scoreA = Number(a.matchScore || 0);
    const scoreB = Number(b.matchScore || 0);

    return scoreB - scoreA;

}


/* =========================================================
   NORMALIZE SCHOLARSHIP
========================================================= */

function normalizeScholarship(item) {

    const result = {};

    Object.keys(item || {}).forEach(key => {
        result[key] = item[key];
    });

    result.id = firstValue(item, ["Id", "ID", "id", "ScholarshipId"]);
    result.name = firstValue(item, ["Scholarship Name", "ScholarshipName", "name", "Name"]);
    result.provider = firstValue(item, ["Provider", "provider"]);
    result.category = firstValue(item, ["Category", "category"]);
    result.state = firstValue(item, ["State", "state"]);
    result.courseLevel = firstValue(item, ["Course Level", "CourseLevel", "EducationLevel"]);
    result.eligibleCourses = firstValue(item, ["Eligible Courses", "EligibleCourses", "Course"]);
    result.gender = firstValue(item, ["Gender", "gender"]);
    result.community = firstValue(item, ["Community", "community"]);
    result.incomeLimit = firstValue(item, ["Family Income Limit", "FamilyIncomeLimit", "Income Limit"]);
    result.minimumMarks = firstValue(item, ["Minimum Marks", "MinimumMarks"]);
    result.singleChild = firstValue(item, ["Single Child", "SingleChild"]);
    result.firstGraduate = firstValue(item, ["First Graduate", "FirstGraduate"]);
    result.ageLimit = firstValue(item, ["Age Limit", "AgeLimit"]);
    result.status = firstValue(item, ["Status", "status"]);
    result.lastDate = firstValue(item, ["Last Date", "LastDate"]);
    result.amount = firstValue(item, ["Scholarship Amount", "ScholarshipAmount"]);
    result.applyLink = firstValue(item, ["Apply Link", "ApplyLink"]);
    result.requiredDocuments = firstValue(item, ["Required Documents", "RequiredDocuments"]);

    return result;

}


/* =========================================================
   EVALUATE SCHOLARSHIP
========================================================= */

function evaluateScholarship(profile, scholarship) {

    let score = 0;

    const reasons = [];
    const failures = [];

    /* STATE */

    const stateResult = compareTextCriteria(
        getProfileValue(profile, ["State"]),
        scholarship.state
    );

    if (stateResult.applicable) {

        if (stateResult.match) {
            score += 2;
            reasons.push("Your state matches the scholarship eligibility.");
        } else {
            failures.push(
                `State requirement does not match your state (${displayValue(getProfileValue(profile, ["State"]))}).`
            );
        }

    }

    /* COURSE */

    const educationLevel = getProfileValue(profile, ["EducationLevel", "educationLevel"]);
    const courseCategory = getProfileValue(profile, ["CourseCategory", "courseCategory"]);
    const course = getProfileValue(profile, ["Course", "course"]);

    const courseResult = compareCourse(
        educationLevel,
        courseCategory,
        course,
        scholarship.courseLevel,
        scholarship.eligibleCourses
    );

    if (courseResult.applicable) {

        if (courseResult.match) {
            score += 3;
            reasons.push("Your education/course details match the scholarship.");
        } else {
            failures.push(
                `Course requirement does not match your profile (${displayValue(course || courseCategory || educationLevel)}).`
            );
        }

    }

    /* GENDER */

    const gender = getProfileValue(profile, ["Gender", "gender"]);
    const genderResult = compareTextCriteria(gender, scholarship.gender);

    if (genderResult.applicable) {

        if (genderResult.match) {
            score += 2;
            reasons.push("Your gender matches the scholarship requirement.");
        } else {
            failures.push(
                `Gender requirement is ${displayValue(scholarship.gender)}, while your profile is ${displayValue(gender)}.`
            );
        }

    }

    /* COMMUNITY */

    const community = getProfileValue(profile, ["Community", "community"]);
    const communityResult = compareTextCriteria(community, scholarship.community);

    if (communityResult.applicable) {

        if (communityResult.match) {
            score += 2;
            reasons.push("Your community matches the scholarship eligibility.");
        } else {
            failures.push(
                `Community requirement is ${displayValue(scholarship.community)}, while your profile shows ${displayValue(community)}.`
            );
        }

    }

    /* FAMILY INCOME */

    const familyIncome = parseIncome(getProfileValue(profile, ["FamilyIncome", "familyIncome"]));
    const incomeLimit = parseIncomeLimit(scholarship.incomeLimit);

    if (incomeLimit !== null) {

        if (familyIncome !== null) {

            if (familyIncome <= incomeLimit) {
                score += 3;
                reasons.push(`Your family income is within the scholarship limit of ${formatMoney(incomeLimit)}.`);
            } else {
                failures.push(`Family income exceeds the scholarship limit of ${formatMoney(incomeLimit)}.`);
            }

        } else {
            failures.push("Family income could not be verified against the scholarship income limit.");
        }

    }

    /* MINIMUM MARKS */

    const marks = parseNumber(getProfileValue(profile, ["Percentage", "percentage"]));
    const minimumMarks = parseNumber(scholarship.minimumMarks);

    if (minimumMarks !== null) {

        if (marks !== null) {

            if (marks >= minimumMarks) {
                score += 3;
                reasons.push(`Your academic percentage (${marks}%) meets the minimum requirement of ${minimumMarks}%.`);
            } else {
                failures.push(`Your academic percentage (${marks}%) is below the required ${minimumMarks}%.`);
            }

        } else {
            failures.push("Academic percentage is required to verify the minimum marks requirement.");
        }

    }

    /* AGE */

    const age = parseNumber(getProfileValue(profile, ["Age", "age"]));
    const ageResult = compareAge(age, scholarship.ageLimit);

    if (ageResult.applicable) {

        if (ageResult.match) {
            score += 2;
            reasons.push("Your age is within the scholarship age requirement.");
        } else {
            failures.push(
                `Your age (${age}) does not meet the scholarship age limit (${displayValue(scholarship.ageLimit)}).`
            );
        }

    }

    /* SINGLE CHILD */

    const singleChild = getProfileValue(profile, ["SingleChild", "singleChild"]);
    const singleResult = compareYesNo(singleChild, scholarship.singleChild);

    if (singleResult.applicable) {

        if (singleResult.match) {
            score += 2;
            reasons.push("Your single-child status matches the scholarship requirement.");
        } else {
            failures.push(
                `Single-child requirement does not match your profile (${displayValue(singleChild)}).`
            );
        }

    }

    /* FIRST GRADUATE */

    const firstGraduate = getProfileValue(profile, ["FirstGraduate", "firstGraduate"]);
    const firstGraduateResult = compareYesNo(firstGraduate, scholarship.firstGraduate);

    if (firstGraduateResult.applicable) {

        if (firstGraduateResult.match) {
            score += 2;
            reasons.push("Your first-graduate status matches the scholarship requirement.");
        } else {
            failures.push(
                `First-graduate requirement does not match your profile (${displayValue(firstGraduate)}).`
            );
        }

    }

    /* FINAL: 3 or more matching fields = Eligible */

    const eligible = reasons.length >= 3;

    return {
        eligible,
        score,
        reasons: reasons.slice(0, 6),
        failures: failures.slice(0, 6)
    };

}


/* =========================================================
   CRITERIA COMPARISON
========================================================= */

function compareTextCriteria(userValue, scholarshipValue) {

    const user = normalizeText(userValue);
    const scholarship = normalizeText(scholarshipValue);

    if (isUniversal(scholarship)) {
        return { applicable: false, match: true };
    }

    if (!user) {
        return { applicable: true, match: false };
    }

    const values = scholarship
        .split(/[,|;/]+/)
        .map(item => normalizeText(item))
        .filter(Boolean);

    return {
        applicable: true,
        match: values.some(
            value => user === value || user.includes(value) || value.includes(user)
        )
    };

}

function compareCourse(educationLevel, courseCategory, course, scholarshipLevel, scholarshipCourses) {

    const level = normalizeText(scholarshipLevel);
    const courses = normalizeText(scholarshipCourses);

    if (isUniversal(level) && isUniversal(courses)) {
        return { applicable: false, match: true };
    }

    const userValues = [educationLevel, courseCategory, course]
        .map(value => normalizeText(value))
        .filter(Boolean);

    if (!userValues.length) {
        return { applicable: true, match: false };
    }

    const scholarshipValues = [level, courses]
        .join(",")
        .split(/[,|;/]+/)
        .map(value => normalizeText(value))
        .filter(Boolean);

    if (!scholarshipValues.length) {
        return { applicable: false, match: true };
    }

    const match = userValues.some(
        userValue => scholarshipValues.some(
            scholarshipValue =>
                userValue === scholarshipValue ||
                userValue.includes(scholarshipValue) ||
                scholarshipValue.includes(userValue)
        )
    );

    return { applicable: true, match };

}

function compareYesNo(userValue, scholarshipValue) {

    const scholarship = normalizeText(scholarshipValue);

    if (isUniversal(scholarship)) {
        return { applicable: false, match: true };
    }

    const user = normalizeYesNo(userValue);
    const required = normalizeYesNo(scholarshipValue);

    if (!required) {
        return { applicable: false, match: true };
    }

    return { applicable: true, match: user === required };

}

function compareAge(age, ageLimit) {

    if (!normalizeText(ageLimit)) {
        return { applicable: false, match: true };
    }

    if (age === null) {
        return { applicable: true, match: false };
    }

    const text = String(ageLimit).toLowerCase();
    const numbers = text.match(/\d+(?:\.\d+)?/g);

    if (!numbers || !numbers.length) {
        return { applicable: false, match: true };
    }

    const nums = numbers.map(Number);

    if (text.includes("to") || text.includes("-") || text.includes("between")) {

        if (nums.length >= 2) {
            return { applicable: true, match: age >= nums[0] && age <= nums[1] };
        }

    }

    if (text.includes("below") || text.includes("under") || text.includes("<")) {
        return { applicable: true, match: age < nums[0] };
    }

    if (text.includes("above") || text.includes("over") || text.includes(">")) {
        return { applicable: true, match: age > nums[0] };
    }

    return { applicable: true, match: age <= nums[0] };

}

function isClosedScholarship(scholarship) {

    const status = normalizeText(scholarship.status);

    return status === "closed" || status === "expired";

}


/* =========================================================
   RENDER ALL RESULTS
========================================================= */

function renderAllResults(result, profile, skipSave = false) {

    hideNotEligibleIfNecessary();

    renderBestMatch(result.eligible[0], profile);
    renderEligible(result.eligible);
    renderNotEligible(result.notEligible);
    renderClosed(result.closed);
    renderNoResults(result);

    /* Save history ONLY for a freshly computed result */

    if (!skipSave) {
        saveEligibilityCheckHistory(result, profile);
    }

}


/* =========================================================
   ELIGIBLE / NOT ELIGIBLE / CLOSED
========================================================= */

function renderEligible(scholarships) {

    const grid = document.getElementById("scholarshipGrid");
    const count = document.getElementById("eligibleSectionCount");

    if (!grid) return;

    grid.innerHTML = "";

    if (count) count.textContent = scholarships.length;

    scholarships.slice(0, MAX_RESULTS).forEach(scholarship => {
        grid.appendChild(createScholarshipCard(scholarship, "eligible"));
    });

    setupHorizontalGrid(grid);

    setupViewMore(
        scholarships,
        grid,
        document.getElementById("viewMoreWrapper"),
        document.getElementById("viewMoreBtn"),
        "eligible"
    );

}

function renderNotEligible(scholarships) {

    const section = document.getElementById("notEligibleSection");
    const grid = document.getElementById("notEligibleGrid");
    const count = document.getElementById("notEligibleSectionCount");

    if (!section || !grid) return;

    grid.innerHTML = "";

    if (count) count.textContent = scholarships.length;

    if (!scholarships.length) {
        section.style.display = "none";
        return;
    }

    section.style.display = "";

    scholarships.slice(0, MAX_RESULTS).forEach(scholarship => {
        grid.appendChild(createScholarshipCard(scholarship, "notEligible"));
    });

    setupHorizontalGrid(grid);

    setupViewMore(
        scholarships,
        grid,
        document.getElementById("notEligibleMore"),
        document.getElementById("notEligibleViewMoreBtn"),
        "notEligible"
    );

}

function renderClosed(scholarships) {

    let section = document.getElementById("closedScholarshipSection");

    if (!section) {
        section = createClosedSection();
    }

    const grid = document.getElementById("closedScholarshipGrid");
    const count = document.getElementById("closedScholarshipCount");

    if (!grid) return;

    grid.innerHTML = "";

    if (count) count.textContent = scholarships.length;

    if (!scholarships.length) {
        section.style.display = "none";
        return;
    }

    section.style.display = "";

    scholarships.slice(0, MAX_RESULTS).forEach(scholarship => {
        grid.appendChild(createScholarshipCard(scholarship, "closed"));
    });

    setupHorizontalGrid(grid);

}

function createClosedSection() {

    const section = document.createElement("section");

    section.id = "closedScholarshipSection";
    section.className = "scholarship-section closed-scholarship-section";

    section.innerHTML = `

        <div class="section-heading">

            <div>

                <span class="section-label">CLOSED</span>

                <h2>Closed Scholarships</h2>

                <p>These scholarships are currently closed and cannot be applied for.</p>

            </div>

            <span class="scholarship-count">
                <span id="closedScholarshipCount">0</span>
            </span>

        </div>

        <div class="scholarship-scroll-wrapper">

            <div class="scholarship-grid closed-scholarship-grid" id="closedScholarshipGrid"></div>

        </div>

    `;

    const resultsContent = document.querySelector(".results-content");
    const noResults = document.getElementById("noResults");

    if (resultsContent && noResults) {
        resultsContent.insertBefore(section, noResults);
    } else if (resultsContent) {
        resultsContent.appendChild(section);
    }

    return section;

}


/* =========================================================
   CARD
========================================================= */

function createScholarshipCard(scholarship, type) {

    const card = document.createElement("article");

    card.className = "scholarship-card";
    card.dataset.id = scholarship.id || "";

    const saved = isScholarshipSaved(scholarship);

    const reasons =
        type === "notEligible"
            ? scholarship.failureReasons || []
            : scholarship.matchReasons || [];

    const reasonTitle =
        type === "notEligible"
            ? "Why you're not eligible"
            : type === "closed"
                ? "Scholarship status"
                : "Why you're eligible";

    const reasonItems =
        reasons.length
            ? reasons
            : type === "closed"
                ? ["This scholarship is marked as Closed in the scholarship database."]
                : ["No additional matching details are available."];

    const safeName = escapeHTML(scholarship.name || "Scholarship");
    const safeProvider = escapeHTML(scholarship.provider || "Scholarship Provider");
    const safeCategory = escapeHTML(scholarship.category || "Scholarship");
    const safeAmount = escapeHTML(scholarship.amount || "Amount not specified");
    const safeState = escapeHTML(scholarship.state || "All India");
    const safeLastDate = escapeHTML(scholarship.lastDate || "Not specified");

    let badge = "";

    if (type === "eligible") {
        badge = `<span class="scholarship-badge eligible-badge">Eligible</span>`;
    } else if (type === "notEligible") {
        badge = `<span class="scholarship-badge not-eligible-badge">Not Eligible</span>`;
    } else {
        badge = `<span class="scholarship-badge closed-badge">Closed</span>`;
    }

    card.innerHTML = `

        <div class="scholarship-card-top">

            ${badge}

            <button
                type="button"
                class="scholarship-save-btn ${saved ? "saved" : ""}"
                aria-label="${saved ? "Remove saved scholarship" : "Save scholarship"}"
                title="${saved ? "Remove from saved" : "Save scholarship"}">

                <i class="fa-${saved ? "solid" : "regular"} fa-heart"></i>

            </button>

        </div>

        <div class="scholarship-provider">${safeProvider}</div>

        <h3 class="scholarship-title">${safeName}</h3>

        <div class="scholarship-meta">

            <span><i class="fa-solid fa-layer-group"></i> ${safeCategory}</span>

            <span><i class="fa-solid fa-location-dot"></i> ${safeState}</span>

        </div>

        <div class="scholarship-amount">

            <small>Scholarship Amount</small>

            <strong>${safeAmount}</strong>

        </div>

        <div class="scholarship-date">

            <i class="fa-regular fa-calendar"></i>

            Last Date: ${safeLastDate}

        </div>

        <div class="scholarship-actions">

            <button type="button" class="reasons-btn">

                <i class="fa-solid fa-circle-info"></i>

                Reasons

            </button>

            <button type="button" class="view-details-btn">

                View Details

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>

        <div class="scholarship-reasons" style="display:none;">

            <div class="reasons-heading">

                <i class="fa-solid fa-lightbulb"></i>

                <strong>${reasonTitle}</strong>

            </div>

            <ul>
                ${reasonItems.slice(0, 6).map(reason => `<li>${escapeHTML(reason)}</li>`).join("")}
            </ul>

        </div>

    `;

    const reasonsBtn = card.querySelector(".reasons-btn");
    const reasonsBox = card.querySelector(".scholarship-reasons");

    if (reasonsBtn && reasonsBox) {

        reasonsBtn.addEventListener("click", () => {

            const isOpen = reasonsBox.style.display !== "none";

            reasonsBox.style.display = isOpen ? "none" : "block";

            reasonsBtn.innerHTML = isOpen
                ? `<i class="fa-solid fa-circle-info"></i> Reasons`
                : `<i class="fa-solid fa-eye-slash"></i> Hide Reasons`;

        });

    }

    const saveBtn = card.querySelector(".scholarship-save-btn");

    if (saveBtn) {

        saveBtn.addEventListener("click", event => {
            event.stopPropagation();
            toggleSavedScholarship(scholarship, saveBtn);
        });

    }

    const viewBtn = card.querySelector(".view-details-btn");

    if (viewBtn) {
        viewBtn.addEventListener("click", () => openScholarshipDetails(scholarship));
    }

    return card;

}


/* =========================================================
   BEST MATCH
========================================================= */

function renderBestMatch(scholarship, profile) {

    const section = document.getElementById("bestMatchSection");
    const card = document.getElementById("bestMatchCard");

    if (!section || !card) return;

    if (!scholarship) {
        section.style.display = "none";
        return;
    }

    section.style.display = "";

    const saved = isScholarshipSaved(scholarship);
    const reasons = scholarship.matchReasons || [];

    card.innerHTML = `

        <div class="best-match-inner">

            <div class="best-match-info">

                <span class="scholarship-badge eligible-badge">Best Match</span>

                <h3>${escapeHTML(scholarship.name || "Scholarship")}</h3>

                <p>${escapeHTML(scholarship.provider || "Scholarship Provider")}</p>

                <div class="best-match-meta">

                    <span>
                        <i class="fa-solid fa-layer-group"></i>
                        ${escapeHTML(scholarship.category || "Scholarship")}
                    </span>

                    <span>
                        <i class="fa-solid fa-indian-rupee-sign"></i>
                        ${escapeHTML(scholarship.amount || "Amount not specified")}
                    </span>

                </div>

            </div>

            <div class="best-match-actions">

                <button
                    type="button"
                    class="best-match-save-btn ${saved ? "saved" : ""}"
                    title="${saved ? "Remove saved scholarship" : "Save scholarship"}">

                    <i class="fa-${saved ? "solid" : "regular"} fa-heart"></i>

                </button>

                <button type="button" class="best-match-view-btn">

                    View Details

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        </div>

        <div class="best-match-reasons" style="display:none;">

            <ul>
                ${
                    reasons.length
                        ? reasons.slice(0, 6).map(reason => `<li>${escapeHTML(reason)}</li>`).join("")
                        : `<li>Your profile matches the available scholarship criteria.</li>`
                }
            </ul>

        </div>

    `;

    const saveBtn = card.querySelector(".best-match-save-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", () => toggleSavedScholarship(scholarship, saveBtn));
    }

    const viewBtn = card.querySelector(".best-match-view-btn");

    if (viewBtn) {
        viewBtn.addEventListener("click", () => openScholarshipDetails(scholarship));
    }

}


/* =========================================================
   HORIZONTAL SCROLL / VIEW MORE
========================================================= */

function setupHorizontalGrid(grid) {

    if (!grid) return;

    grid.style.display = "flex";
    grid.style.flexWrap = "nowrap";
    grid.style.overflowX = "auto";
    grid.style.overflowY = "hidden";
    grid.style.scrollBehavior = "smooth";
    grid.style.gap = "20px";

    Array.from(grid.children).forEach(card => {
        card.style.flex = "0 0 340px";
    });

}

function setupViewMore(scholarships, grid, wrapper, button, type) {

    if (!wrapper || !button) return;

    if (scholarships.length <= 6) {
        wrapper.style.display = "none";
        return;
    }

    wrapper.style.display = "";

    let expanded = false;

    function renderVisible() {

        Array.from(grid.children).forEach((card, index) => {
            card.style.display = (expanded || index < 6) ? "" : "none";
        });

        button.innerHTML = expanded
            ? `Show Less <i class="fa-solid fa-arrow-left"></i>`
            : `View More <i class="fa-solid fa-arrow-right"></i>`;

    }

    button.onclick = () => {
        expanded = !expanded;
        renderVisible();
    };

    renderVisible();

}


/* =========================================================
   PROFILE SIDEBAR
========================================================= */

function setupProfileSidebar() {

    const sidebar = document.getElementById("profileSidebar");
    const openBtn = document.getElementById("profileToggleBtn");
    const closeBtn = document.getElementById("closeProfileSidebar");

    if (!sidebar) return;

    sidebar.classList.remove("active", "open");

    if (openBtn) {
        openBtn.addEventListener("click", () => sidebar.classList.add("active"));
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
    }

}

function renderUserProfile(profile, currentUser) {

    const displayName =
        firstValue(profile, ["Name", "name", "FullName", "fullName"]) ||
        firstValue(currentUser, ["Name", "name", "Username", "username"]) ||
        "Student";

    const username =
        firstValue(currentUser, ["Username", "username"]) || "Applicant";

    setText("profileName", displayName);
    setText("profileUsername", username);
    setText("headerUsername", username);

    setProfileImage(profile, currentUser);

    renderDynamicProfileDetails(profile);

}

function renderDynamicProfileDetails(profile) {

    const container = document.querySelector(".sidebar-details");

    if (!container) return;

    container.innerHTML = "";

    const fields = [
        { keys: ["Name", "name", "FullName", "fullName"], label: "Full Name", icon: "fa-user" },
        { keys: ["Age", "age"], label: "Age", icon: "fa-cake-candles" },
        { keys: ["Gender", "gender"], label: "Gender", icon: "fa-venus-mars" },
        { keys: ["State", "state"], label: "State", icon: "fa-location-dot" },
        { keys: ["DomicileStatus", "domicileStatus"], label: "Domicile Status", icon: "fa-house" },
        { keys: ["Citizenship", "citizenship"], label: "Citizenship", icon: "fa-passport" },
        { keys: ["DisabilityStatus", "disabilityStatus"], label: "Disability Status", icon: "fa-wheelchair" },
        { keys: ["ResidenceType", "residenceType"], label: "Residence Type", icon: "fa-building" },
        { keys: ["EducationLevel", "educationLevel"], label: "Education Level", icon: "fa-graduation-cap" },
        { keys: ["CourseCategory", "courseCategory"], label: "Course Category", icon: "fa-layer-group" },
        { keys: ["Course", "course"], label: "Course", icon: "fa-book-open" },
        { keys: ["YearOfStudy", "yearOfStudy"], label: "Year of Study", icon: "fa-calendar" },
        { keys: ["OtherCourse", "otherCourse"], label: "Other Course", icon: "fa-book" },
        { keys: ["InstitutionName", "institutionName"], label: "Institution", icon: "fa-school" },
        { keys: ["SchoolType", "schoolType"], label: "School Type", icon: "fa-school" },
        { keys: ["GovernmentSchool", "governmentSchool"], label: "Government School", icon: "fa-landmark" },
        { keys: ["Percentage", "percentage"], label: "Academic Percentage", icon: "fa-chart-line" },
        { keys: ["Class10Percentage", "class10Percentage"], label: "Class 10 Percentage", icon: "fa-chart-column" },
        { keys: ["Class12Percentage", "class12Percentage"], label: "Class 12 Percentage", icon: "fa-chart-column" },
        { keys: ["DiplomaPercentage", "diplomaPercentage"], label: "Diploma Percentage", icon: "fa-chart-column" },
        { keys: ["UGPercentage", "ugPercentage"], label: "UG Percentage", icon: "fa-chart-column" },
        { keys: ["PGPercentage", "pgPercentage"], label: "PG Percentage", icon: "fa-chart-column" },
        { keys: ["CGPA", "cgpa"], label: "CGPA", icon: "fa-star" },
        { keys: ["Percentile", "percentile"], label: "Percentile", icon: "fa-percent" },
        { keys: ["PreviousExamStatus", "previousExamStatus"], label: "Previous Exam Status", icon: "fa-file-circle-check" },
        { keys: ["FirstAttemptPass", "firstAttemptPass"], label: "First Attempt Pass", icon: "fa-check" },
        { keys: ["Attendance", "attendance"], label: "Attendance", icon: "fa-calendar-check" },
        { keys: ["Community", "community"], label: "Community", icon: "fa-people-group" },
        { keys: ["EWSStatus", "ewsStatus"], label: "EWS Status", icon: "fa-id-card" },
        { keys: ["MinorityStatus", "minorityStatus", "MinorityCommunity"], label: "Minority Status", icon: "fa-people-group" },
        { keys: ["FamilyIncome", "familyIncome"], label: "Family Income", icon: "fa-indian-rupee-sign" },
        { keys: ["FirstGraduate", "firstGraduate"], label: "First Graduate", icon: "fa-user-graduate" },
        { keys: ["SingleChild", "singleChild"], label: "Single Child", icon: "fa-child" },
        { keys: ["SingleGirlChild", "singleGirlChild"], label: "Single Girl Child", icon: "fa-child-dress" },
        { keys: ["ParentStatus", "parentStatus"], label: "Parent Status", icon: "fa-people-roof" },
        { keys: ["FamilySupport", "familySupport"], label: "Family Support", icon: "fa-hand-holding-heart" },
        { keys: ["SpecialCategory", "specialCategory"], label: "Special Category", icon: "fa-medal" },
        { keys: ["EntranceQualified", "entranceQualified"], label: "Entrance Qualified", icon: "fa-file-signature" },
        { keys: ["EntranceExam", "entranceExam"], label: "Entrance Exam", icon: "fa-pen" },
        { keys: ["ExamScore", "examScore"], label: "Exam Score", icon: "fa-chart-simple" },
        { keys: ["ExamRank", "examRank"], label: "Exam Rank", icon: "fa-ranking-star" },
        { keys: ["MeritStatus", "meritStatus"], label: "Merit Status", icon: "fa-award" },
        { keys: ["ResearchStatus", "researchStatus"], label: "Research", icon: "fa-flask" },
        { keys: ["PortfolioStatus", "portfolioStatus"], label: "Portfolio", icon: "fa-folder-open" },
        { keys: ["InterviewStatus", "interviewStatus"], label: "Interview Status", icon: "fa-comments" },
        { keys: ["DocumentAvailability", "documentAvailability"], label: "Documents", icon: "fa-file-lines" }
    ];

    fields.forEach(field => {

        const value = getProfileValue(profile, field.keys);

        if (!hasMeaningfulValue(value)) return;

        const row = document.createElement("div");

        row.className = "sidebar-detail";

        row.innerHTML = `

            <span>

                <i class="fa-solid ${field.icon}"></i>

                ${escapeHTML(field.label)}

            </span>

            <strong>${escapeHTML(formatProfileValue(value, field.label))}</strong>

        `;

        container.appendChild(row);

    });

}

function setProfileImage(profile, currentUser) {

    const imageKeys = ["profilePhoto", "ProfilePhoto", "photo", "Photo", "profileImage", "ProfileImage"];

    const image =
        firstValue(currentUser, imageKeys) ||
        firstValue(profile, imageKeys);

    const profileImg = document.getElementById("profilePhoto");
    const headerImg = document.getElementById("headerProfilePhoto");
    const profileInitial = document.getElementById("profileInitial");
    const headerInitial = document.getElementById("headerProfileInitial");

    const name =
        String(firstValue(profile, ["Name", "name", "FullName", "fullName"]) || "U");

    const initial = name.trim().charAt(0).toUpperCase() || "U";

    if (profileInitial) profileInitial.textContent = initial;
    if (headerInitial) headerInitial.textContent = initial;

    if (image) {

        if (profileImg) {
            profileImg.src = image;
            profileImg.style.display = "";
        }

        if (headerImg) {
            headerImg.src = image;
            headerImg.style.display = "";
        }

    }

}


/* =========================================================
   USERS / SAVED / RECENTLY VIEWED  (slim + capped + safe)
========================================================= */

function getUsersArray() {

    const users = readJSON("eligifyUsers", []);

    return Array.isArray(users) ? users : [];

}

function syncUserFields(userId, changes) {

    try {

        const users = getUsersArray();

        const index = users.findIndex(u => u && String(u.id) === String(userId));

        if (index < 0) return;

        users[index] = { ...users[index], ...changes };

        delete users[index].history;
        delete users[index].eligibilityHistory;

        safeSetLocalStorage("eligifyUsers", users);
        safeSetLocalStorage("currentUser", users[index]);

    } catch (error) {
        console.warn("User sync skipped:", error);
    }

}

function getSavedKey() {

    const userId = getCurrentUserId(getCurrentUser());

    return userId ? `eligifySaved_${userId}` : "eligifySaved";

}

function getSavedScholarships() {

    const userId = getCurrentUserId(getCurrentUser());

    const user = getUsersArray().find(u => u && String(u.id) === String(userId));

    if (user && Array.isArray(user.saved)) {
        return user.saved;
    }

    const data = readJSON(getSavedKey(), []);

    return Array.isArray(data) ? data : [];

}

function savedIdOf(item) {

    return String(
        (item && (item.id || item.Id || item["Scholarship Name"] || item.name)) || ""
    );

}

function isScholarshipSaved(scholarship) {

    const id = savedIdOf(scholarship);

    return getSavedScholarships().some(item => savedIdOf(item) === id);

}

function toggleSavedScholarship(scholarship, button) {

    const user = getCurrentUser();
    const userId = getCurrentUserId(user);

    if (!user || !userId) {
        showToast("Please login first.", "error");
        return;
    }

    let saved = getSavedScholarships().slice();

    const id = savedIdOf(scholarship);

    const index = saved.findIndex(item => savedIdOf(item) === id);

    if (index >= 0) {

        saved.splice(index, 1);

        button.classList.remove("saved");
        button.innerHTML = `<i class="fa-regular fa-heart"></i>`;

        showToast("Removed from saved scholarships.", "info");

    } else {

        saved.unshift(slimScholarship(scholarship));

        button.classList.add("saved");
        button.innerHTML = `<i class="fa-solid fa-heart"></i>`;

        showToast("Scholarship saved successfully.", "success");

    }

    saved = saved.slice(0, MAX_SAVED).map(slimScholarship);

    safeSetLocalStorage(getSavedKey(), saved);

    syncUserFields(userId, { saved });

    if (typeof updateSavedCount === "function") {
        updateSavedCount(saved.length);
    }

}

function recordRecentlyViewed(scholarship) {

    const user = getCurrentUser();
    const userId = getCurrentUserId(user);

    if (!userId) return;

    const key = `eligifyHistory_${userId}`;

    const id = savedIdOf(scholarship);

    let viewed = readJSON(key, []);

    if (!Array.isArray(viewed)) viewed = [];

    viewed = viewed.filter(item => savedIdOf(item) !== id);

    viewed.unshift({
        ...slimScholarship(scholarship),
        viewedAt: new Date().toISOString()
    });

    viewed = viewed.slice(0, MAX_VIEWED);

    safeSetLocalStorage(key, viewed);

    syncUserFields(userId, { recentlyViewed: viewed });

}

function addToHistory(scholarship) {
    recordRecentlyViewed(scholarship);
}

function openScholarshipDetails(scholarship) {

    const user = getCurrentUser();
    const userId = getCurrentUserId(user);

    if (!user || !userId) {
        showToast("Please login first.", "error");
        return;
    }

    safeSetLocalStorage(STORAGE.selectedScholarship, scholarship);

    recordRecentlyViewed(scholarship);

    window.location.href = "details.html";

}


/* =========================================================
   SAVE ELIGIBILITY CHECK HISTORY  (COMPACT)
   Stores only: profile + scholarship IDs + counts + best match
========================================================= */

function hashString(text) {

    let hash = 5381;

    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
    }

    return String(hash);

}

function saveEligibilityCheckHistory(result, profile) {

    try {

        const userId =
            String(localStorage.getItem("currentUserId") || "").trim();

        if (!userId) {
            console.warn("History: currentUserId not found");
            return false;
        }

        const key =
            HISTORY_PREFIX + userId;

        let history =
            readJSON(key, []);

        if (!Array.isArray(history)) {
            history = [];
        }

        history =
            history
                .map(compactRecord)
                .filter(Boolean);

        const eligibleIds =
            (result.eligible || [])
                .map(scholarshipKey)
                .filter(Boolean);

        const notEligibleIds =
            (result.notEligible || [])
                .map(scholarshipKey)
                .filter(Boolean);

        const closedIds =
            (result.closed || [])
                .map(scholarshipKey)
                .filter(Boolean);

        const compactProf =
            compactProfile(profile);

        const signature =
            hashString(
                JSON.stringify([
                    compactProf,
                    eligibleIds,
                    notEligibleIds,
                    closedIds
                ])
            );

        /* Prevent duplicate save within 10 minutes */

        const latest = history[0];

        if (
            latest &&
            latest.signature === signature &&
            Date.now() -
                (Date.parse(latest.checkedAt) || 0) <
                10 * 60 * 1000
        ) {
            return true;
        }

        const record = {

            id:
                "ELG-HISTORY-" +
                Date.now(),

            userId,

            checkedAt:
                new Date().toISOString(),

            profile:
                compactProf,

            eligibleIds,

            notEligibleIds,

            closedIds,

            eligibleCount:
                eligibleIds.length,

            notEligibleCount:
                notEligibleIds.length,

            closedCount:
                closedIds.length,

            bestMatch:
                summarizeBest(
                    (result.eligible || [])[0]
                ),

            signature
        };

        history.unshift(record);

        history =
            history.slice(
                0,
                MAX_HISTORY_RECORDS
            );

        /* =========================================
           1. SAVE USER-SPECIFIC HISTORY
        ========================================= */

        const saved =
            safeSetLocalStorage(
                key,
                history
            );

        if (!saved) {
            console.warn(
                "History: localStorage save failed"
            );
            return false;
        }

        /* =========================================
           2. SYNC INTO eligifyUsers
        ========================================= */

        try {

            const users =
                readJSON(
                    "eligifyUsers",
                    []
                );

            if (Array.isArray(users)) {

                const userIndex =
                    users.findIndex(user =>
                        user &&
                        String(
                            user.id || ""
                        ).trim() === userId
                    );

                if (userIndex !== -1) {

                    users[userIndex].history =
                        history;

                    users[userIndex].eligibilityHistory =
                        history;

                    /*
                     * Save updated users.
                     */

                    safeSetLocalStorage(
                        "eligifyUsers",
                        users
                    );

                    /*
                     * Keep currentUser synchronized.
                     */

                    safeSetLocalStorage(
                        "currentUser",
                        users[userIndex]
                    );

                    console.log(
                        "History: synced successfully"
                    );

                } else {

                    console.warn(
                        "History: user not found in eligifyUsers"
                    );
                }
            }

        } catch (userSaveError) {

            console.warn(
                "History user sync failed:",
                userSaveError
            );
        }

        return true;

    } catch (error) {

        console.warn(
            "History save skipped:",
            error
        );

        return false;
    }
}


/* =========================================================
   NO RESULTS / SECTIONS
========================================================= */

function renderNoResults(result) {

    const noResults = document.getElementById("noResults");

    if (!noResults) return;

    const hasAny =
        result.eligible.length > 0 ||
        result.notEligible.length > 0 ||
        result.closed.length > 0;

    noResults.style.display = hasAny ? "none" : "";

}

function hideNotEligibleIfNecessary() {

    const section = document.getElementById("notEligibleSection");

    if (section) section.style.display = "";

}


/* =========================================================
   BUTTONS / MODAL
========================================================= */

function setupButtons() {

    const retry = document.getElementById("retryResultsBtn");

    if (retry) {
        retry.addEventListener("click", () => window.location.reload());
    }

    const edit = document.getElementById("editProfileBtn");
    const update = document.getElementById("updateProfileBtn");

    const openModal = () => {

        const modal = document.getElementById("profileModal");

        if (modal) modal.style.display = "flex";

    };

    if (edit) edit.addEventListener("click", openModal);
    if (update) update.addEventListener("click", openModal);

}

function setupModal() {

    const modal = document.getElementById("profileModal");
    const close = document.getElementById("cancelProfileModal");
    const cancel = document.getElementById("cancelProfileModalBtn");
    const confirm = document.getElementById("confirmProfileModal");

    const closeModal = () => {
        if (modal) modal.style.display = "none";
    };

    if (close) close.addEventListener("click", closeModal);
    if (cancel) cancel.addEventListener("click", closeModal);

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) closeModal();
        });
    }

    if (confirm) {
        confirm.addEventListener("click", () => {
            window.location.href = "eligibility.html";
        });
    }

}


/* =========================================================
   LOADER / ERROR / TOAST
========================================================= */

function showLoader() {

    const loader = document.getElementById("resultsLoader");

    if (loader) loader.style.display = "flex";

}

function hideLoader() {

    const loader = document.getElementById("resultsLoader");

    if (loader) loader.style.display = "none";

}

function updateLoader(percentage, title, message, activeStep) {

    const bar = document.getElementById("loaderProgressBar");
    const percent = document.getElementById("loaderPercentage");
    const text = document.getElementById("loaderProgressText");
    const loaderTitle = document.getElementById("loaderTitle");
    const loaderMessage = document.getElementById("loaderMessage");

    if (bar) bar.style.width = `${percentage}%`;
    if (percent) percent.textContent = `${percentage}%`;
    if (text) text.textContent = title;
    if (loaderTitle) loaderTitle.textContent = title;
    if (loaderMessage) loaderMessage.textContent = message;

    for (let i = 1; i <= 4; i++) {

        const step = document.getElementById(`loaderStep${i}`);

        if (!step) continue;

        step.classList.toggle("active", i === activeStep);
        step.classList.toggle("completed", i < activeStep);

    }

}

function showError(message) {

    hideLoader();

    const error = document.getElementById("resultsError");
    const errorMessage = document.getElementById("resultsErrorMessage");

    if (errorMessage) errorMessage.textContent = message;

    if (error) error.style.display = "flex";

}

function showToast(message, type = "success") {

    const toast = document.getElementById("resultsToast");
    const text = document.getElementById("toastMessage");
    const icon = document.getElementById("toastIcon");

    if (!toast) return;

    if (text) text.textContent = message;

    if (icon) {
        icon.innerHTML = type === "success"
            ? `<i class="fa-solid fa-check"></i>`
            : `<i class="fa-solid fa-circle-info"></i>`;
    }

    toast.style.display = "flex";

    clearTimeout(window.__eligifyToastTimer);

    window.__eligifyToastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 2500);

}


/* =========================================================
   HELPERS
========================================================= */

function firstValue(object, keys) {

    if (!object || typeof object !== "object") return "";

    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            String(object[key]).trim() !== ""
        ) {
            return object[key];
        }

    }

    return "";

}

/* Case-insensitive fallback so saved profiles with
   different key casing still evaluate correctly. */

function getProfileValue(profile, keys) {

    const direct = firstValue(profile, keys);

    if (direct !== "") return direct;

    if (!profile || typeof profile !== "object") return "";

    const wanted = keys.map(k => String(k).toLowerCase());

    for (const k of Object.keys(profile)) {

        if (
            wanted.includes(k.toLowerCase()) &&
            profile[k] !== undefined &&
            profile[k] !== null &&
            String(profile[k]).trim() !== ""
        ) {
            return profile[k];
        }

    }

    return "";

}

function normalizeText(value) {

    return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

}

function normalizeYesNo(value) {

    const text = normalizeText(value);

    if (["yes", "y", "true", "1"].includes(text)) return "yes";
    if (["no", "n", "false", "0"].includes(text)) return "no";

    return text;

}

function isUniversal(value) {

    const text = normalizeText(value);

    return (
        !text ||
        [
            "all", "any", "everyone", "all india", "india", "national",
            "not specified", "no restriction", "open", "general"
        ].includes(text)
    );

}

function hasMeaningfulValue(value) {

    if (value === null || value === undefined) return false;

    const text = String(value).trim();

    if (!text) return false;

    if (
        ["-", "—", "null", "undefined", "select", "select option", "choose", "choose one"]
            .includes(text.toLowerCase())
    ) {
        return false;
    }

    return true;

}

function parseNumber(value) {

    if (value === null || value === undefined) return null;

    const match = String(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);

    if (!match) return null;

    const number = Number(match[0]);

    return Number.isFinite(number) ? number : null;

}

function parseIncome(value) {

    if (value === null || value === undefined) return null;

    const text = normalizeText(value);

    if (text.includes("lakh")) {

        const n = parseNumber(text);

        if (n !== null) return n * 100000;

    }

    const number = parseNumber(text);

    if (number === null) return null;

    if (number >= 1000) return number;

    return number * 100000;

}

function parseIncomeLimit(value) {

    if (!hasMeaningfulValue(value)) return null;

    const text = normalizeText(value);

    if (text.includes("above") || text.includes("no limit") || text.includes("unlimited")) {
        return null;
    }

    return parseIncome(value);

}

function formatMoney(value) {

    if (value === null || value === undefined) return "";

    return "₹" + Number(value).toLocaleString("en-IN");

}

function formatProfileValue(value, label) {

    if (value === null || value === undefined) return "";

    if (label === "Family Income") {

        const income = parseIncome(value);

        if (income !== null) return formatMoney(income);

    }

    return String(value);

}

function displayValue(value) {

    return hasMeaningfulValue(value) ? String(value) : "not provided";

}

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) element.textContent = value || "—";

}

function delay(milliseconds) {

    return new Promise(resolve => setTimeout(resolve, milliseconds));

}


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.EligifyResults = {
    reload: initResultsPage,
    getProfile: getLatestEligibilityProfile,
    match: matchScholarships
};