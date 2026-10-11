/* =========================================================
   ELIGIFY
   SCHOLARSHIP DETAILS PAGE
   FINAL VERSION
   DATE + SAVE + ADMIN DASHBOARD COMPATIBLE
========================================================= */


/* =========================================================
   GET USERS
========================================================= */

function getUsers() {

    try {

        const data = localStorage.getItem("eligifyUsers");

        if (!data) return [];

        const users = JSON.parse(data);

        return Array.isArray(users) ? users : [];

    } catch (error) {

        console.error("Error reading users:", error);

        return [];

    }

}


/* =========================================================
   SAVE USERS
========================================================= */

function saveUsers(users) {

    localStorage.setItem(
        "eligifyUsers",
        JSON.stringify(users)
    );

}


/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {

    const userId =
        localStorage.getItem("currentUserId");

    if (!userId) return null;

    const users = getUsers();

    return users.find(user =>
        String(user.id) === String(userId)
    ) || null;

}


/* =========================================================
   SELECTED SCHOLARSHIP
========================================================= */

let scholarship = null;

try {

    const stored =
        localStorage.getItem("selectedScholarship");

    if (stored) {

        scholarship = JSON.parse(stored);

    }

} catch (error) {

    console.error(
        "Selected scholarship error:",
        error
    );

    scholarship = null;

}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!scholarship) {

            window.location.href = "dashboard.html";

            return;

        }

        console.log(
            "DETAILS - SELECTED SCHOLARSHIP:",
            scholarship
        );

        console.log(
            "DETAILS - ALL KEYS:",
            Object.keys(scholarship)
        );

        loadScholarship();

        updateSaveButton();

        const saveBtn =
            document.getElementById("saveBtn");

        if (saveBtn) {

            saveBtn.addEventListener(
                "click",
                toggleSaveScholarship
            );

        }

    }
);


/* =========================================================
   NORMALIZE KEY
   Makes:
   Start Date
   startDate
   START DATE
   start_date
   all comparable
========================================================= */

function normalizeKey(key) {

    return String(key || "")
        .toLowerCase()
        .replace(/[\s_\-]+/g, "")
        .trim();

}


/* =========================================================
   GET SCHOLARSHIP VALUE
   ROBUST VERSION
========================================================= */

function getScholarshipValue(
    object,
    keys,
    fallback = ""
) {

    if (!object || typeof object !== "object") {

        return fallback;

    }


    /* ---------------------------------------------
       1. Exact key match
    --------------------------------------------- */

    for (const key of keys) {

        if (
            Object.prototype.hasOwnProperty.call(
                object,
                key
            )
        ) {

            const value = object[key];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {

                return value;

            }

        }

    }


    /* ---------------------------------------------
       2. Normalized key match
    --------------------------------------------- */

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

function getScholarshipId() {

    return getScholarshipValue(
        scholarship,
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
   LOAD SCHOLARSHIP
========================================================= */

function loadScholarship() {


    /* =====================================================
       BASIC DETAILS
    ===================================================== */

    const name =
        getScholarshipValue(
            scholarship,
            [
                "Scholarship Name",
                "scholarshipName",
                "name",
                "title",
                "Title"
            ],
            "Scholarship"
        );


    const provider =
        getScholarshipValue(
            scholarship,
            [
                "Provider",
                "provider",
                "Organization",
                "organization",
                "Institution",
                "institution"
            ],
            "-"
        );


    const category =
        getScholarshipValue(
            scholarship,
            [
                "Category",
                "category"
            ],
            "-"
        );


    const state =
        getScholarshipValue(
            scholarship,
            [
                "State",
                "state"
            ],
            "-"
        );


    const courseLevel =
        getScholarshipValue(
            scholarship,
            [
                "Course Level",
                "courseLevel",
                "course_level",
                "Level",
                "level"
            ],
            "-"
        );


    const courses =
        getScholarshipValue(
            scholarship,
            [
                "Eligible Courses",
                "eligibleCourses",
                "eligible_courses",
                "courses",
                "course",
                "Course"
            ],
            "-"
        );


    const gender =
        getScholarshipValue(
            scholarship,
            [
                "Gender",
                "gender"
            ],
            "All"
        );


    const community =
        getScholarshipValue(
            scholarship,
            [
                "Community",
                "community"
            ],
            "-"
        );


    const marks =
        getScholarshipValue(
            scholarship,
            [
                "Minimum Marks",
                "minimumMarks",
                "minimum_marks",
                "Marks",
                "marks"
            ],
            "-"
        );


    const income =
        getScholarshipValue(
            scholarship,
            [
                "Family Income Limit",
                "familyIncomeLimit",
                "family_income_limit",
                "Income Limit",
                "incomeLimit",
                "income"
            ],
            "-"
        );


    const firstGraduate =
        getScholarshipValue(
            scholarship,
            [
                "First Graduate",
                "firstGraduate",
                "first_graduate"
            ],
            "All"
        );


    const singleChild =
        getScholarshipValue(
            scholarship,
            [
                "Single Child",
                "singleChild",
                "single_child"
            ],
            "All"
        );


    const ageLimit =
        getScholarshipValue(
            scholarship,
            [
                "Age Limit",
                "ageLimit",
                "age_limit",
                "Age"
            ],
            "-"
        );


    const applicationMode =
        getScholarshipValue(
            scholarship,
            [
                "Application Mode",
                "applicationMode",
                "application_mode",
                "Mode"
            ],
            "Online"
        );


    const description =
        getScholarshipValue(
            scholarship,
            [
                "Description",
                "description",
                "Details",
                "details"
            ],
            "This scholarship provides financial support for eligible students."
        );


    /* =====================================================
       START DATE
    ===================================================== */

    const startDate =
        getScholarshipValue(
            scholarship,
            [
                "Start Date",
                "startDate",
                "start_date",
                "START DATE",
                "START_DATE",
                "Application Start",
                "applicationStart",
                "application_start",
                "Start"
            ],
            ""
        );


    /* =====================================================
       LAST DATE
    ===================================================== */

    const lastDate =
        getScholarshipValue(
            scholarship,
            [
                "Last Date",
                "lastDate",
                "last_date",
                "LAST DATE",
                "LAST_DATE",
                "Application Deadline",
                "applicationDeadline",
                "application_deadline",
                "APPLICATION DEADLINE",
                "Deadline",
                "deadline",
                "End Date",
                "endDate"
            ],
            ""
        );


    /* =====================================================
       DEBUG DATE
    ===================================================== */

    console.log(
        "START DATE RAW:",
        startDate
    );

    console.log(
        "LAST DATE RAW:",
        lastDate
    );


    /* =====================================================
       STATUS
    ===================================================== */

    const statusValue =
        getScholarshipValue(
            scholarship,
            [
                "Status",
                "status"
            ],
            "Active"
        );


    /* =====================================================
       SET BASIC DETAILS
    ===================================================== */

    setText("name", name);

    setText("provider", provider);

    setText("category", category);

    setText("state", state);

    setText("courseLevel", courseLevel);

    setText("courses", courses);

    setText("gender", gender);

    setText("community", community);

    setText("marks", marks);

    setText("income", income);

    setText("incomeRequirement", income);

    setText("firstGraduate", firstGraduate);

    setText("singleChild", singleChild);

    setText("ageLimit", ageLimit);

    setText("applicationMode", applicationMode);

    setText("description", description);


    /* =====================================================
       DATE DISPLAY
    ===================================================== */

    setText(
        "startDate",
        formatDateValue(startDate)
    );


    setText(
        "lastDate",
        formatDateValue(lastDate)
    );


    /* =====================================================
       AMOUNT
    ===================================================== */

    const rawAmount =
        getScholarshipValue(
            scholarship,
            [
                "Scholarship Amount",
                "scholarshipAmount",
                "scholarship_amount",
                "amount",
                "Amount",
                "awardAmount",
                "award_amount"
            ],
            ""
        );


    setText(
        "amount",
        formatAmount(rawAmount)
    );


    /* =====================================================
       STATUS
    ===================================================== */

    const status =
        document.getElementById("status");


    if (status) {

        status.textContent =
            statusValue;


        const statusLower =
            String(statusValue).toLowerCase();


        if (
            statusLower.includes("active")
        ) {

            status.style.color =
                "#00695c";

        } else {

            status.style.color =
                "#e74c3c";

        }

    }


    /* =====================================================
       DOCUMENTS
    ===================================================== */

    loadDocuments();


    /* =====================================================
       APPLY LINK
    ===================================================== */

    setupApplyButton();


    /* =====================================================
       HIDE LOADING
    ===================================================== */

    const loader =
        document.getElementById("loading");


    if (loader) {

        loader.style.display = "none";

    }

}


/* =========================================================
   FORMAT AMOUNT
========================================================= */

function formatAmount(value) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return "-";

    }


    let clean =
        String(value)
            .replace(/[₹,\s]/g, "");


    const number =
        Number(clean);


    if (!Number.isNaN(number)) {

        return (
            "₹" +
            number.toLocaleString("en-IN")
        );

    }


    return String(value);

}


/* =========================================================
   FINAL DATE FORMATTER
   SUPPORTS ALL COMMON GOOGLE SHEETS / HTML DATE VALUES
========================================================= */

function formatDateValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";

    }


    /* ---------------------------------------------
       Date object
    --------------------------------------------- */

    if (
        Object.prototype.toString.call(value) ===
        "[object Date]"
    ) {

        if (!Number.isNaN(value.getTime())) {

            return formatDateParts(value);

        }

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


    /* ---------------------------------------------
       GOOGLE SHEETS SERIAL DATE

       Example:
       45890
    --------------------------------------------- */

    if (
        /^\d+(\.\d+)?$/.test(raw)
    ) {

        const serial =
            Number(raw);


        if (
            serial >= 1 &&
            serial < 100000
        ) {

            const utcDate =
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
                    utcDate.getTime()
                )
            ) {

                return (
                    String(
                        utcDate.getUTCDate()
                    ).padStart(2, "0") +
                    " " +
                    utcDate.toLocaleString(
                        "en-IN",
                        {
                            month: "short",
                            timeZone: "UTC"
                        }
                    ) +
                    " " +
                    utcDate.getUTCFullYear()
                );

            }

        }

    }


    /* ---------------------------------------------
       YYYY-MM-DD

       2026-06-01
    --------------------------------------------- */

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


    /* ---------------------------------------------
       YYYY/MM/DD

       2026/06/01
    --------------------------------------------- */

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


    /* ---------------------------------------------
       DD-MM-YYYY

       01-06-2026
    --------------------------------------------- */

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


    /* ---------------------------------------------
       DD/MM/YYYY

       01/06/2026
    --------------------------------------------- */

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


    /* ---------------------------------------------
       MM/DD/YYYY

       06/01/2026
    --------------------------------------------- */

    match =
        raw.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        const first =
            Number(match[1]);

        const second =
            Number(match[2]);

        const year =
            Number(match[3]);


        /*
           If first > 12, definitely DD/MM/YYYY.
           Otherwise prefer DD/MM/YYYY because
           Indian date format is being used.
        */

        if (first <= 31 && second <= 12) {

            return formatDatePartsFromNumbers(
                year,
                second,
                first
            );

        }

    }


    /* ---------------------------------------------
       GOOGLE / JAVASCRIPT ISO DATE

       2026-06-01T00:00:00.000Z
    --------------------------------------------- */

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


    /* ---------------------------------------------
       Normal JS Date parser
    --------------------------------------------- */

    const parsed =
        new Date(raw);


    if (
        !Number.isNaN(
            parsed.getTime()
        )
    ) {

        return formatDateParts(parsed);

    }


    /* ---------------------------------------------
       Unknown value
    --------------------------------------------- */

    return raw;

}


/* =========================================================
   FORMAT DATE PARTS
========================================================= */

function formatDateParts(date) {

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


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
   FORMAT DATE FROM NUMBERS
========================================================= */

function formatDatePartsFromNumbers(
    year,
    month,
    day
) {

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

        return (
            String(day).padStart(2, "0") +
            "/" +
            String(month).padStart(2, "0") +
            "/" +
            year
        );

    }


    return formatDateParts(date);

}


/* =========================================================
   LOAD DOCUMENTS
========================================================= */

function loadDocuments() {

    const box =
        document.getElementById("documents");


    if (!box) return;


    box.innerHTML = "";


    const docs =
        getScholarshipValue(
            scholarship,
            [
                "Required Documents",
                "requiredDocuments",
                "required_documents",
                "Documents",
                "documents"
            ],
            ""
        );


    if (!docs) {

        const item =
            document.createElement("div");


        item.className =
            "document-item";


        item.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>No specific documents listed</span>
        `;


        box.appendChild(item);

        return;

    }


    let documentList = [];


    if (Array.isArray(docs)) {

        documentList = docs;

    } else {

        documentList =
            String(docs)
                .split(/[,|\n]+/);

    }


    documentList.forEach(
        function (doc) {

            const cleanDoc =
                String(doc).trim();


            if (!cleanDoc) return;


            const item =
                document.createElement("div");


            item.className =
                "document-item";


            const icon =
                document.createElement("i");


            icon.className =
                "fa-solid fa-circle-check";


            const text =
                document.createElement("span");


            text.textContent =
                cleanDoc;


            item.appendChild(icon);

            item.appendChild(text);

            box.appendChild(item);

        }
    );

}


/* =========================================================
   APPLY BUTTON
========================================================= */

function setupApplyButton() {

    const applyBtn =
        document.getElementById("applyBtn");


    if (!applyBtn) return;


    let link =
        getScholarshipValue(
            scholarship,
            [
                "Apply Link",
                "applyLink",
                "apply_link",
                "Official Link",
                "officialLink",
                "official_link",
                "URL",
                "url"
            ],
            ""
        );


    if (!link) {

        applyBtn.href = "#";

        return;

    }


    link =
        String(link).trim();


    if (
        !link.startsWith("http://") &&
        !link.startsWith("https://")
    ) {

        link =
            "https://" + link;

    }


    applyBtn.href = link;

    applyBtn.target = "_blank";

    applyBtn.rel =
        "noopener noreferrer";

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    ) {

        element.textContent =
            String(value);

    } else {

        element.textContent = "-";

    }

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
   CHECK SAVED
========================================================= */

function isScholarshipSaved() {

    const id =
        getScholarshipId();


    if (!id) return false;


    const saved =
        getCurrentUserSaved();


    return saved.some(
        function (item) {

            const itemId =
                getScholarshipValue(
                    item,
                    [
                        "Id",
                        "ID",
                        "id",
                        "scholarshipId",
                        "scholarship_id",
                        "Scholarship ID",
                        "Scholarship Id"
                    ],
                    ""
                );


            return (
                String(itemId) ===
                String(id)
            );

        }
    );

}


/* =========================================================
   UPDATE SAVE BUTTON
========================================================= */

function updateSaveButton() {

    const saveBtn =
        document.getElementById("saveBtn");


    if (!saveBtn) return;


    const icon =
        saveBtn.querySelector("i");


    if (!icon) return;


    if (isScholarshipSaved()) {

        icon.classList.remove("fa-regular");

        icon.classList.add("fa-solid");

        icon.style.color =
            "#ff4d6d";

    } else {

        icon.classList.remove("fa-solid");

        icon.classList.add("fa-regular");

        icon.style.color = "";

    }

}


/* =========================================================
   TOGGLE SAVE
========================================================= */

function toggleSaveScholarship() {

    const user =
        getCurrentUser();


    if (!user) {

        showMessage(
            "Please login to save scholarships."
        );

        return;

    }


    const id =
        getScholarshipId();


    if (!id) {

        showMessage(
            "Scholarship ID not found."
        );

        return;

    }


    let saved =
        Array.isArray(user.saved)
            ? [...user.saved]
            : [];


    const existingIndex =
        saved.findIndex(
            function (item) {

                const itemId =
                    getScholarshipValue(
                        item,
                        [
                            "Id",
                            "ID",
                            "id",
                            "scholarshipId",
                            "scholarship_id",
                            "Scholarship ID",
                            "Scholarship Id"
                        ],
                        ""
                    );


                return (
                    String(itemId) ===
                    String(id)
                );

            }
        );


    if (existingIndex !== -1) {

        saved.splice(
            existingIndex,
            1
        );


        showMessage(
            "Scholarship removed from Saved"
        );

    } else {

        saved.unshift(
            scholarship
        );


        showMessage(
            "Scholarship saved successfully"
        );

    }


    /* Keep latest 50 */

    saved =
        saved.slice(0, 50);


    const users =
        getUsers();


    const userIndex =
        users.findIndex(
            function (item) {

                return (
                    String(item.id) ===
                    String(user.id)
                );

            }
        );


    if (userIndex === -1) {

        return;

    }


    users[userIndex] = {

        ...users[userIndex],

        saved: saved

    };


    saveUsers(users);


    localStorage.setItem(
        "currentUser",
        JSON.stringify(
            users[userIndex]
        )
    );


    updateSaveButton();

}


/* =========================================================
   TOAST MESSAGE
========================================================= */

function showMessage(message) {

    let toast =
        document.getElementById(
            "detailsToast"
        );


    if (!toast) {

        toast =
            document.createElement("div");


        toast.id =
            "detailsToast";


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
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                zIndex: "99999",
                boxShadow:
                    "0 8px 25px rgba(0,0,0,.2)"
            }
        );


        document.body.appendChild(toast);

    }


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        window.detailsToastTimer
    );


    window.detailsToastTimer =
        setTimeout(
            function () {

                toast.style.display =
                    "none";

            },
            2500
        );

}