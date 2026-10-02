/* =========================================================
   ELIGIFY | STORAGE GUARD
   Include this FIRST, before every other script, on every
   page. It patches localStorage.setItem app-wide so that a
   full quota can never crash the page again — instead it
   auto-shrinks/cleans data and retries silently.
========================================================= */

(function () {

    "use strict";

    const MAX_HISTORY_PER_USER = 20;


    /* ---------------------------------------------------
       Keep only what's needed to display a scholarship
       in history / cards, instead of the full record.
    --------------------------------------------------- */

    function lightenScholarship(s) {

        if (!s || typeof s !== "object") {
            return s;
        }

        return {
            Id: s.Id || s.id || "",
            "Scholarship Name":
                s["Scholarship Name"] ||
                s.scholarshipName ||
                s.name || "",
            Provider: s.Provider || s.provider || "",
            Category: s.Category || s.category || "",
            Status: s.Status || s.status || "",
            "Scholarship Amount":
                s["Scholarship Amount"] || s.amount || "",
            "Last Date": s["Last Date"] || s.lastDate || "",
            "Apply Link": s["Apply Link"] || s.applyLink || "",
            score: s.score ?? s.matchPercentage ?? s.matchScore ?? 0
        };

    }

    function lightenList(list) {
        return Array.isArray(list) ? list.map(lightenScholarship) : list;
    }


    /* ---------------------------------------------------
       Shrink a single history record, whichever "shape"
       it is (eligibility-check record OR dashboard's
       "viewed scholarship" record — both got saved under
       the same user.history field).
    --------------------------------------------------- */

    function lightenHistoryRecord(r) {

        if (!r || typeof r !== "object") {
            return r;
        }

        if (
            r.eligibleScholarships ||
            r.notEligibleScholarships ||
            r.eligible ||
            r.notEligible
        ) {

            return {
                ...r,
                eligibleScholarships:
                    lightenList(r.eligibleScholarships || r.eligible || []),
                notEligibleScholarships:
                    lightenList(r.notEligibleScholarships || r.notEligible || []),
                closedScholarships:
                    lightenList(r.closedScholarships || []),
                eligible: undefined,
                notEligible: undefined
            };

        }

        if (r.scholarship) {
            return { ...r, scholarship: lightenScholarship(r.scholarship) };
        }

        return r;

    }


    /* ---------------------------------------------------
       Scan and shrink everything Eligify-related that
       could be bloated. Never throws.
    --------------------------------------------------- */

    function pruneEligifyStorage() {

        try {

            /* per-user eligibilityHistory_<id> keys */

            for (let i = localStorage.length - 1; i >= 0; i--) {

                const key = localStorage.key(i);

                if (!key || !key.startsWith("eligibilityHistory_")) {
                    continue;
                }

                try {

                    const list = JSON.parse(localStorage.getItem(key) || "[]");

                    if (Array.isArray(list)) {

                        const cleaned = list
                            .slice(0, MAX_HISTORY_PER_USER)
                            .map(lightenHistoryRecord);

                        Storage.prototype.setItem.call(
                            localStorage, key, JSON.stringify(cleaned)
                        );

                    }

                } catch (e) {

                    try { localStorage.removeItem(key); } catch (e2) {}

                }

            }


            /* eligifyUsers — the shared multi-user blob */

            try {

                const raw = localStorage.getItem("eligifyUsers");

                if (raw) {

                    const users = JSON.parse(raw);

                    if (Array.isArray(users)) {

                        const cleanedUsers = users.map(u => {

                            if (!u || typeof u !== "object") {
                                return u;
                            }

                            const hist =
                                Array.isArray(u.history) ? u.history :
                                Array.isArray(u.eligibilityHistory) ? u.eligibilityHistory :
                                [];

                            const cleanedHist = hist
                                .slice(0, MAX_HISTORY_PER_USER)
                                .map(lightenHistoryRecord);

                            return {
                                ...u,
                                history: cleanedHist,
                                eligibilityHistory: cleanedHist
                            };

                        });

                        Storage.prototype.setItem.call(
                            localStorage, "eligifyUsers", JSON.stringify(cleanedUsers)
                        );


                        const currentUserId = localStorage.getItem("currentUserId");

                        const match = cleanedUsers.find(
                            u => String(u?.id) === String(currentUserId)
                        );

                        if (match) {

                            Storage.prototype.setItem.call(
                                localStorage, "currentUser", JSON.stringify(match)
                            );

                        }

                    }

                }

            } catch (e) { /* eligifyUsers missing/corrupt — skip */ }


            /* global eligibilityHistory key, if used */

            try {

                const raw = localStorage.getItem("eligibilityHistory");

                if (raw) {

                    const list = JSON.parse(raw);

                    if (Array.isArray(list)) {

                        const cleaned = list
                            .slice(0, 100)
                            .map(lightenHistoryRecord);

                        Storage.prototype.setItem.call(
                            localStorage, "eligibilityHistory", JSON.stringify(cleaned)
                        );

                    }

                }

            } catch (e) { /* ignore */ }

        } catch (outer) {

            console.warn("Eligify storage guard: cleanup skipped", outer);

        }

    }


    /* ---------------------------------------------------
       Patch localStorage.setItem GLOBALLY, once.
       Every future setItem call from ANY page/script
       becomes quota-safe automatically.
    --------------------------------------------------- */

    if (!window.__eligifyStorageGuardInstalled) {

        window.__eligifyStorageGuardInstalled = true;

        const originalSetItem = Storage.prototype.setItem;

        Storage.prototype.setItem = function (key, value) {

            try {

                return originalSetItem.call(this, key, value);

            } catch (error) {

                console.warn(
                    "⚠️ Eligify: storage full while saving '" + key + "'. Auto-cleaning..."
                );

                try {

                    pruneEligifyStorage();

                    return originalSetItem.call(this, key, value);

                } catch (error2) {

                    console.warn(
                        "⚠️ Eligify: still full after cleanup — shrinking '" + key + "'..."
                    );

                    try {

                        const parsed = JSON.parse(value);

                        if (Array.isArray(parsed)) {

                            let trimmed = parsed;

                            while (trimmed.length > 1) {

                                trimmed = trimmed.slice(
                                    0, Math.max(1, Math.floor(trimmed.length / 2))
                                );

                                try {

                                    return originalSetItem.call(
                                        this, key, JSON.stringify(trimmed)
                                    );

                                } catch (e3) { /* keep shrinking */ }

                            }

                        }

                    } catch (parseErr) { /* value wasn't a JSON array */ }


                    try {

                        Storage.prototype.removeItem.call(this, key);

                    } catch (e4) {}

                    console.error(
                        "❌ Eligify: could not save '" + key +
                        "' — storage stayed full even after cleanup. This key was cleared so the app can keep working."
                    );

                    return undefined;

                }

            }

        };


        /* Proactively clean once per page load too, so
           already-bloated data shrinks even before any
           new save is attempted. */

        try { pruneEligifyStorage(); } catch (e) {}

    }


    window.EligifyStorageGuard = { pruneEligifyStorage };

})();
