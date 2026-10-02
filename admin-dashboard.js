/* =========================================================
   ELIGIFY ADMIN DASHBOARD
   FINAL FIXED VERSION
   =========================================================
   FEATURES
   ---------------------------------------------------------
   - Load scholarships
   - Show limited scholarships
   - View More
   - Search
   - Category filter
   - Add scholarship
   - Edit scholarship
   - Delete scholarship
   - View scholarship
   - Date normalization
   - Google Sheet date serial handling
   - Sheet Status priority
   - Dashboard counters
   - Logout
   - Strong ID handling
   - Safe HTML rendering
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   SETTINGS
========================================================= */

const INITIAL_DISPLAY_COUNT = 6;


/* =========================================================
   GLOBAL STATE
========================================================= */

let allScholarships = [];

let scholarships = [];

let editIndex = null;

let deleteId = null;

let currentSearch = "";

let currentCategory = "All";

let showAll = false;

let toastTimer = null;


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupEvents();

        loadScholarships();

    }
);


/* =========================================================
   SETUP EVENTS
========================================================= */

function setupEvents() {


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchBox =
        document.getElementById(
            "searchBox"
        );


    if (searchBox) {

        searchBox.addEventListener(
            "input",
            function () {

                currentSearch =
                    searchBox.value
                        .trim()
                        .toLowerCase();

                showAll = true;

                applyFilters();

            }
        );

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            function () {

                currentCategory =
                    categoryFilter.value ||
                    "All";

                showAll = true;

                applyFilters();

            }
        );

    }


    /* =====================================================
       REFRESH
    ===================================================== */

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            async function () {

                if (refreshBtn.disabled) {

                    return;

                }


                refreshBtn.disabled = true;


                refreshBtn.innerHTML =
                    `
                    <i class="ri-loader-4-line"></i>
                    <span>Refreshing...</span>
                    `;


                try {

                    showAll = false;

                    await loadScholarships(
                        true
                    );


                    showToast(
                        "Dashboard refreshed"
                    );

                }

                catch (error) {

                    console.error(
                        error
                    );

                }

                finally {

                    refreshBtn.disabled =
                        false;


                    refreshBtn.innerHTML =
                        `
                        <i class="ri-refresh-line"></i>
                        <span>Refresh</span>
                        `;

                }

            }
        );

    }


    /* =====================================================
       ADD SCHOLARSHIP
    ===================================================== */

    const addBtn =
        document.getElementById(
            "addScholarshipBtn"
        );


    if (addBtn) {

        addBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openAddModal();

            }
        );

    }


    /* =====================================================
       SCHOLARSHIP FORM
    ===================================================== */

    const form =
        document.getElementById(
            "scholarshipForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveScholarship
        );

    }


    /* =====================================================
       DELETE CANCEL
    ===================================================== */

    const cancelDeleteBtn =
        document.getElementById(
            "cancelDeleteBtn"
        );


    if (cancelDeleteBtn) {

        cancelDeleteBtn.addEventListener(
            "click",
            closeDeleteModal
        );

    }


    /* =====================================================
       DELETE CONFIRM
    ===================================================== */

    const confirmDeleteBtn =
        document.getElementById(
            "confirmDeleteBtn"
        );


    if (confirmDeleteBtn) {

        confirmDeleteBtn.addEventListener(
            "click",
            confirmDeleteScholarship
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            openLogoutModal
        );

    }


    /* =====================================================
       SIDEBAR SCHOLARSHIP
    ===================================================== */

    const scholarshipLink =
        document.querySelector(
            'a[href="#scholarshipSection"]'
        );


    if (scholarshipLink) {

        scholarshipLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                currentSearch = "";

                currentCategory = "All";

                showAll = false;


                const search =
                    document.getElementById(
                        "searchBox"
                    );


                if (search) {

                    search.value = "";

                }


                const filter =
                    document.getElementById(
                        "categoryFilter"
                    );


                if (filter) {

                    filter.value = "All";

                }


                applyFilters();

                scrollToSection(
                    "scholarshipSection"
                );

            }
        );

    }


    /* =====================================================
       SIDEBAR DASHBOARD
    ===================================================== */

    const dashboardLink =
        document.querySelector(
            'a[href="#dashboard"]'
        );


    if (dashboardLink) {

        dashboardLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                scrollToSection(
                    "dashboard"
                );

            }
        );

    }


    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {

                return;

            }


            closeScholarshipModal();

            closeDeleteModal();

            closeViewModal();

            closeLogoutModal();

        }
    );

}


/* =========================================================
   LOAD SCHOLARSHIPS
========================================================= */

async function loadScholarships(
    showLoading = false
) {

    try {

        if (showLoading) {

            const container =
                document.getElementById(
                    "scholarshipContainer"
                );


            if (container) {

                container.innerHTML =
                    `
                    <div class="empty">
                        Loading scholarships...
                    </div>
                    `;

            }

        }


        const response =
            await fetch(
                API_URL +
                "?t=" +
                Date.now(),
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


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid API response"
            );

        }


        /*
           Normalize every scholarship.
        */

        allScholarships =
            data
                .filter(
                    item =>
                        item &&
                        typeof item === "object"
                )
                .map(
                    item => {

                        const normalized = {
                            ...item
                        };


                        /*
                           Make sure every record
                           has a usable ID.
                        */

                        normalized.Id =
                            getScholarshipId(
                                item
                            );


                        /*
                           Normalize dates.
                        */

                        normalized["Start Date"] =
                            normalizeDate(
                                getStartDateFromItem(
                                    item
                                )
                            );


                        normalized["Last Date"] =
                            normalizeDate(
                                getLastDateFromItem(
                                    item
                                )
                            );


                        return normalized;

                    }
                );


        /*
           IMPORTANT:
           Google Sheet Status has priority.
        */

        autoUpdateStatus();


        scholarships =
            [...allScholarships];


        updateDashboardCards();

        updateCategoryCounts();

        applyFilters();

    }


    catch (error) {

        console.error(
            "Scholarship Load Error:",
            error
        );


        const container =
            document.getElementById(
                "scholarshipContainer"
            );


        if (container) {

            container.innerHTML =
                `
                <div class="empty">
                    Unable to load scholarships.
                </div>
                `;

        }


        showToast(
            "Unable to load scholarships"
        );


        throw error;

    }

}


/* =========================================================
   GET SCHOLARSHIP ID
========================================================= */

function getScholarshipId(
    item
) {

    if (!item) {

        return "";

    }


    const possibleIds = [

        item.Id,
        item.ID,
        item.id,
        item["Scholarship ID"],
        item["Scholarship Id"],
        item.scholarshipId

    ];


    for (
        const id of possibleIds
    ) {

        if (
            id !== undefined &&
            id !== null &&
            String(id).trim() !== ""
        ) {

            return String(id).trim();

        }

    }


    return "";

}


/* =========================================================
   GET START DATE
========================================================= */

function getStartDateFromItem(
    item
) {

    if (!item) {

        return "";

    }


    const possibleKeys = [

        "Start Date",
        "Application Start Date",
        "StartDate",
        "Application Start",
        "ApplicationStartDate",
        "startDate",
        "start_date",
        "Start date",
        "START DATE",
        "Start_Date"

    ];


    for (
        const key of possibleKeys
    ) {

        if (
            item[key] !== undefined &&
            item[key] !== null &&
            String(
                item[key]
            ).trim() !== ""
        ) {

            return item[key];

        }

    }


    return "";

}


/* =========================================================
   GET LAST DATE
========================================================= */

function getLastDateFromItem(
    item
) {

    if (!item) {

        return "";

    }


    const possibleKeys = [

        "Last Date",
        "Application Last Date",
        "LastDate",
        "Application Last",
        "ApplicationLastDate",
        "lastDate",
        "last_date",
        "Last date",
        "LAST DATE",
        "Last_Date"

    ];


    for (
        const key of possibleKeys
    ) {

        if (
            item[key] !== undefined &&
            item[key] !== null &&
            String(
                item[key]
            ).trim() !== ""
        ) {

            return item[key];

        }

    }


    return "";

}


/* =========================================================
   NORMALIZE DATE
   FIXED:
   - YYYY-MM-DD
   - ISO
   - DD/MM/YYYY
   - DD-MM-YYYY
   - Google Sheet serial number
   - JS Date
========================================================= */

function normalizeDate(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    /*
       Already Date object
    */

    if (
        Object.prototype.toString.call(value)
        === "[object Date]"
    ) {

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {

            return "";

        }


        return createDateString(
            value.getFullYear(),
            value.getMonth() + 1,
            value.getDate()
        );

    }


    const text =
        String(value).trim();


    if (!text) {

        return "";

    }


    /*
       Reject impossible year 9999
       and other invalid years.
    */

    if (
        /^9999[-/]/.test(text) ||
        /^9999$/.test(text)
    ) {

        return "";

    }


    /* =====================================================
       YYYY-MM-DD
    ===================================================== */

    let match =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        return validateAndCreateDate(
            match[1],
            match[2],
            match[3]
        );

    }


    /* =====================================================
       ISO DATE
    ===================================================== */

    match =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})[T\s]/
        );


    if (match) {

        return validateAndCreateDate(
            match[1],
            match[2],
            match[3]
        );

    }


    /* =====================================================
       DD-MM-YYYY
    ===================================================== */

    match =
        text.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );


    if (match) {

        return validateAndCreateDate(
            match[3],
            match[2],
            match[1]
        );

    }


    /* =====================================================
       DD/MM/YYYY
    ===================================================== */

    match =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        return validateAndCreateDate(
            match[3],
            match[2],
            match[1]
        );

    }


    /* =====================================================
       GOOGLE SHEET SERIAL NUMBER
    ===================================================== */

    if (
        /^\d+(\.\d+)?$/.test(text)
    ) {

        const serial =
            Number(text);


        /*
           Google Sheets / Excel date serial.
           Valid practical range only.
        */

        if (
            serial > 1 &&
            serial < 60000
        ) {

            const base =
                new Date(
                    Date.UTC(
                        1899,
                        11,
                        30
                    )
                );


            const date =
                new Date(
                    base.getTime() +
                    serial *
                    86400000
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                return createDateString(
                    date.getUTCFullYear(),
                    date.getUTCMonth() + 1,
                    date.getUTCDate()
                );

            }

        }

    }


    /*
       Final fallback.
    */

    const date =
        new Date(text);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    /*
       Reject unrealistic years.
    */

    if (
        year < 1900 ||
        year > 2100
    ) {

        return "";

    }


    return createDateString(
        year,
        date.getMonth() + 1,
        date.getDate()
    );

}


/* =========================================================
   VALIDATE DATE
========================================================= */

function validateAndCreateDate(
    year,
    month,
    day
) {

    const y =
        Number(year);

    const m =
        Number(month);

    const d =
        Number(day);


    if (
        y < 1900 ||
        y > 2100
    ) {

        return "";

    }


    if (
        m < 1 ||
        m > 12
    ) {

        return "";

    }


    if (
        d < 1 ||
        d > 31
    ) {

        return "";

    }


    const date =
        new Date(
            y,
            m - 1,
            d
        );


    if (
        date.getFullYear() !== y ||
        date.getMonth() !== m - 1 ||
        date.getDate() !== d
    ) {

        return "";

    }


    return createDateString(
        y,
        m,
        d
    );

}


/* =========================================================
   CREATE DATE STRING
========================================================= */

function createDateString(
    year,
    month,
    day
) {

    return (

        String(year)
            .padStart(4, "0")

        + "-" +

        String(month)
            .padStart(2, "0")

        + "-" +

        String(day)
            .padStart(2, "0")

    );

}


/* =========================================================
   FORMAT DATE FOR DISPLAY
========================================================= */

function formatDateForDisplay(
    value
) {

    const normalized =
        normalizeDate(value);


    if (!normalized) {

        return "-";

    }


    const parts =
        normalized.split("-");


    if (
        parts.length !== 3
    ) {

        return "-";

    }


    return (

        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]

    );

}


/* =========================================================
   AUTO STATUS
   ---------------------------------------------------------
   IMPORTANT:
   Google Sheet Status is the SOURCE OF TRUTH.
   
   RULE:
   - Sheet = Closed  -> Closed
   - Sheet = Active  -> Active
   - Sheet = any text -> same text
   - Sheet Status empty -> calculate from Last Date
   - Both empty -> keep blank
========================================================= */

function autoUpdateStatus() {

    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    allScholarships.forEach(
        function (item) {

            /* =============================================
               FIRST PRIORITY:
               STATUS FROM GOOGLE SHEET
            ============================================= */

            const sheetStatus =
                String(
                    item.Status ?? ""
                )
                    .trim();


            /*
               If Google Sheet contains a status,
               NEVER overwrite it.

               Sheet:
               Active -> Active

               Sheet:
               Closed -> Closed
            */

            if (sheetStatus !== "") {

                item.Status =
                    sheetStatus;

                return;

            }


            /* =============================================
               STATUS IS EMPTY
               USE LAST DATE ONLY
            ============================================= */

            const lastDate =
                normalizeDate(
                    item["Last Date"]
                );


            /*
               No Status + No Last Date
               = DO NOT DEFAULT TO ACTIVE
            */

            if (!lastDate) {

                item.Status = "";

                return;

            }


            const parts =
                lastDate.split("-");


            const date =
                new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2])
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                item.Status = "";

                return;

            }


            /*
               Only calculate when Google Sheet
               Status is actually empty.
            */

            item.Status =
                date < today
                    ? "Closed"
                    : "Active";

        }
    );

}


/* =========================================================
   FILTER SYSTEM
========================================================= */

function applyFilters() {

    let result =
        [...allScholarships];


    /* =====================================================
       CATEGORY
    ===================================================== */

    if (
        currentCategory &&
        currentCategory !== "All"
    ) {

        result =
            result.filter(
                function (item) {

                    return (
                        normalizeText(
                            item.Category
                        ) ===
                        normalizeText(
                            currentCategory
                        )
                    );

                }
            );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (currentSearch) {

        result =
            result.filter(
                function (item) {

                    const fields = [

                        item["Scholarship Name"],
                        item.Provider,
                        item.Category,
                        item.State,
                        item["Eligible Courses"],
                        item["Course Level"],
                        item["Scholarship Type"],
                        item["Scholarship Amount"],
                        item.Status

                    ];


                    return fields.some(
                        function (value) {

                            return normalizeText(
                                value
                            ).includes(
                                currentSearch
                            );

                        }
                    );

                }
            );

    }


    scholarships =
        result;


    displayScholarships(
        result
    );

}


/* =========================================================
   DISPLAY SCHOLARSHIPS
========================================================= */

function displayScholarships(
    data
) {

    const container =
        document.getElementById(
            "scholarshipContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";

    removeViewMoreButton();


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty">
                No Scholarship Found
            </div>
            `;

        return;

    }


    const shouldShowAll =
        showAll ||
        currentSearch !== "" ||
        currentCategory !== "All";


    const visibleData =
        shouldShowAll
            ? data
            : data.slice(
                0,
                INITIAL_DISPLAY_COUNT
            );


    const fragment =
        document.createDocumentFragment();


    visibleData.forEach(
        function (item) {

            /*
               IMPORTANT:
               Use unique ID to find
               original item.
            */

            const itemId =
                getScholarshipId(
                    item
                );


            const realIndex =
                findScholarshipIndex(
                    item,
                    itemId
                );


            /*
               IMPORTANT:
               Do not force Active here.
               Status must come from Sheet /
               autoUpdateStatus().
            */

            const status =
                String(
                    item.Status ?? ""
                ).trim();


            const statusClass =
                normalizeText(
                    status
                ) === "closed"
                    ? "closed"
                    : "active";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "scholarship-card";


            card.innerHTML =
                `
                <div class="card-header">

                    <h3>
                        ${escapeHTML(
                            item[
                                "Scholarship Name"
                            ] ||
                            "-"
                        )}
                    </h3>

                    <span
                        class="status ${statusClass}">

                        ${escapeHTML(
                            status ||
                            "-"
                        )}

                    </span>

                </div>


                <div class="card-body">

                    <p>
                        <b>Provider:</b>
                        ${escapeHTML(
                            item.Provider ||
                            "-"
                        )}
                    </p>

                    <p>
                        <b>Category:</b>
                        ${escapeHTML(
                            item.Category ||
                            "-"
                        )}
                    </p>

                    <p>
                        <b>Amount:</b>
                        ${escapeHTML(
                            item[
                                "Scholarship Amount"
                            ] ||
                            "-"
                        )}
                    </p>

                    <p>
                        <b>Start Date:</b>
                        ${escapeHTML(
                            formatDateForDisplay(
                                item[
                                    "Start Date"
                                ]
                            )
                        )}
                    </p>

                    <p>
                        <b>Last Date:</b>
                        ${escapeHTML(
                            formatDateForDisplay(
                                item[
                                    "Last Date"
                                ]
                            )
                        )}
                    </p>

                </div>


                <div class="card-actions">

                    <button
                        type="button"
                        class="view-btn"
                        data-action="view">

                        <i class="ri-eye-line"></i>
                        View

                    </button>


                    <button
                        type="button"
                        class="edit-btn"
                        data-action="edit">

                        <i class="ri-edit-line"></i>
                        Edit

                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        data-action="delete">

                        <i class="ri-delete-bin-line"></i>
                        Delete

                    </button>

                </div>
                `;


            const viewBtn =
                card.querySelector(
                    '[data-action="view"]'
                );


            if (viewBtn) {

                viewBtn.addEventListener(
                    "click",
                    function () {

                        viewScholarship(
                            realIndex
                        );

                    }
                );

            }


            const editBtn =
                card.querySelector(
                    '[data-action="edit"]'
                );


            if (editBtn) {

                editBtn.addEventListener(
                    "click",
                    function () {

                        editScholarship(
                            realIndex
                        );

                    }
                );

            }


            const deleteBtn =
                card.querySelector(
                    '[data-action="delete"]'
                );


            if (deleteBtn) {

                deleteBtn.addEventListener(
                    "click",
                    function () {

                        openDeleteModal(
                            realIndex
                        );

                    }
                );

            }


            fragment.appendChild(
                card
            );

        }
    );


    container.appendChild(
        fragment
    );


    if (
        !shouldShowAll &&
        data.length > INITIAL_DISPLAY_COUNT
    ) {

        createViewMoreButton(
            container
        );

    }

}


/* =========================================================
   FIND ORIGINAL SCHOLARSHIP INDEX
========================================================= */

function findScholarshipIndex(
    item,
    itemId
) {

    if (
        itemId
    ) {

        const idIndex =
            allScholarships.findIndex(
                function (original) {

                    return String(
                        getScholarshipId(
                            original
                        )
                    ) === String(
                        itemId
                    );

                }
            );


        if (idIndex !== -1) {

            return idIndex;

        }

    }


    return allScholarships.indexOf(
        item
    );

}


/* =========================================================
   CREATE VIEW MORE
========================================================= */

function createViewMoreButton(
    container
) {

    removeViewMoreButton();


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.id =
        "viewMoreWrapper";


    wrapper.className =
        "view-more-wrapper";


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "viewMoreBtn";


    button.type =
        "button";


    button.className =
        "view-more-btn";


    button.innerHTML =
        `
        <i class="ri-add-line"></i>
        View More
        `;


    button.addEventListener(
        "click",
        function () {

            showAll = true;

            displayScholarships(
                scholarships
            );


            wrapper.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );


    wrapper.appendChild(
        button
    );


    /*
       IMPORTANT:
       Put wrapper INSIDE scholarship
       container so grid-column works.
    */

    container.appendChild(
        wrapper
    );

}


/* =========================================================
   REMOVE VIEW MORE
========================================================= */

function removeViewMoreButton() {

    const wrapper =
        document.getElementById(
            "viewMoreWrapper"
        );


    if (wrapper) {

        wrapper.remove();

    }

}


/* =========================================================
   DASHBOARD COUNTS
========================================================= */

function updateDashboardCards() {

    const total =
        allScholarships.length;


    const active =
        allScholarships.filter(
            function (item) {

                return normalizeText(
                    item.Status
                ) === "active";

            }
        ).length;


    const closed =
        allScholarships.filter(
            function (item) {

                return normalizeText(
                    item.Status
                ) === "closed";

            }
        ).length;


    setText(
        "totalScholarships",
        total
    );


    setText(
        "activeScholarships",
        active
    );


    setText(
        "closedScholarships",
        closed
    );

}


/* =========================================================
   CATEGORY COUNTS
========================================================= */

function updateCategoryCounts() {

    setText(
        "centralCount",
        countCategory("Central Government")
    );

    setText(
        "stateCount",
        countCategory("State Government")
    );

    setText(
        "privateCount",
        countCategory("Private Company")
    );

    setText(
        "trustCount",
        countCategory("Trust / Foundation")
    );

}


function countCategory(
    category
) {

    return allScholarships.filter(
        function (item) {

            return (
                normalizeText(
                    item.Category
                ) ===
                normalizeText(
                    category
                )
            );

        }
    ).length;

}


/* =========================================================
   FILTER BY CATEGORY
========================================================= */

function filterByCategory(
    category
) {

    currentCategory =
        category || "All";

    currentSearch = "";

    showAll = true;


    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (filter) {

        filter.value =
            currentCategory;

    }


    const search =
        document.getElementById(
            "searchBox"
        );


    if (search) {

        search.value = "";

    }


    applyFilters();


    scrollToSection(
        "scholarshipSection"
    );

}


/* =========================================================
   SHOW ALL SCHOLARSHIPS
========================================================= */

function showAllScholarships(
    event
) {

    if (event) {

        event.preventDefault();

    }


    currentCategory = "All";

    currentSearch = "";

    showAll = true;


    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (filter) {

        filter.value = "All";

    }


    const search =
        document.getElementById(
            "searchBox"
        );


    if (search) {

        search.value = "";

    }


    displayScholarships(
        allScholarships
    );


    scrollToSection(
        "scholarshipSection"
    );

}


/* =========================================================
   VIEW ALL
========================================================= */

function viewAllScholarships() {

    currentCategory = "All";

    currentSearch = "";

    showAll = true;


    displayScholarships(
        allScholarships
    );

}


/* =========================================================
   ADD MODAL
========================================================= */

function openAddModal() {

    editIndex = null;


    const form =
        document.getElementById(
            "scholarshipForm"
        );


    if (form) {

        form.reset();

    }


    setValue(
        "gender",
        "All"
    );


    setValue(
        "firstGraduate",
        "All"
    );


    setValue(
        "singleChild",
        "All"
    );


    setValue(
        "applicationMode",
        "Online"
    );


    setValue(
        "status",
        "Active"
    );


    setText(
        "modalTitle",
        "Add Scholarship"
    );


    showModal(
        "scholarshipModal"
    );

}


/* =========================================================
   CLOSE SCHOLARSHIP MODAL
========================================================= */

function closeScholarshipModal() {

    hideModal(
        "scholarshipModal"
    );


    editIndex = null;

}


/* =========================================================
   EDIT SCHOLARSHIP
========================================================= */

function editScholarship(
    index
) {

    const item =
        allScholarships[index];


    if (!item) {

        showToast(
            "Scholarship not found"
        );

        return;

    }


    editIndex = index;


    setValue(
        "scholarshipName",
        item["Scholarship Name"]
    );


    setValue(
        "provider",
        item.Provider
    );


    setValue(
        "category",
        item.Category
    );


    setValue(
        "state",
        item.State
    );


    setValue(
        "courseLevel",
        item["Course Level"]
    );


    setValue(
        "eligibleCourses",
        item["Eligible Courses"]
    );


    setValue(
        "scholarshipType",
        item["Scholarship Type"]
    );


    setValue(
        "gender",
        item.Gender || "All"
    );


    setValue(
        "community",
        item.Community
    );


    setValue(
        "income",
        item["Family Income Limit"]
    );


    setValue(
        "marks",
        item["Minimum Marks"]
    );


    setValue(
        "amount",
        item["Scholarship Amount"]
    );


    setValue(
        "firstGraduate",
        item["First Graduate"] ||
        "All"
    );


    setValue(
        "singleChild",
        item["Single Child"] ||
        "All"
    );


    setValue(
        "ageLimit",
        item["Age Limit"]
    );


    setValue(
        "applicationMode",
        item["Application Mode"] ||
        "Online"
    );


    setValue(
        "startDate",
        normalizeDate(
            getStartDateFromItem(
                item
            )
        )
    );


    setValue(
        "lastDate",
        normalizeDate(
            getLastDateFromItem(
                item
            )
        )
    );


    setValue(
        "link",
        item["Apply Link"]
    );


    /*
       IMPORTANT:
       Preserve actual Sheet status.
       Do not force Active.
    */

    setValue(
        "status",
        item.Status || ""
    );


    setValue(
        "documents",
        item["Required Documents"]
    );


    setText(
        "modalTitle",
        "Edit Scholarship"
    );


    showModal(
        "scholarshipModal"
    );

}


/* =========================================================
   COLLECT FORM DATA
========================================================= */

function collectScholarshipFormData(
    oldItem = null
) {

    const startDate =
        normalizeDate(
            getValue(
                "startDate"
            )
        );


    const lastDate =
        normalizeDate(
            getValue(
                "lastDate"
            )
        );


    let id =
        getScholarshipId(
            oldItem
        );


    if (!id) {

        id =
            "SCH-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 1000
            );

    }


    return {

        Id: id,


        "Scholarship Name":
            getValue(
                "scholarshipName"
            ),


        Provider:
            getValue(
                "provider"
            ),


        Category:
            getValue(
                "category"
            ),


        State:
            getValue(
                "state"
            ),


        "Course Level":
            getValue(
                "courseLevel"
            ),


        "Eligible Courses":
            getValue(
                "eligibleCourses"
            ),


        "Scholarship Type":
            getValue(
                "scholarshipType"
            ),


        Gender:
            getValue(
                "gender"
            ),


        Community:
            getValue(
                "community"
            ),


        "Family Income Limit":
            getValue(
                "income"
            ),


        "Minimum Marks":
            getValue(
                "marks"
            ),


        "Scholarship Amount":
            getValue(
                "amount"
            ),


        "First Graduate":
            getValue(
                "firstGraduate"
            ),


        "Single Child":
            getValue(
                "singleChild"
            ),


        "Age Limit":
            getValue(
                "ageLimit"
            ),


        "Application Mode":
            getValue(
                "applicationMode"
            ),


        "Start Date":
            startDate,


        "Last Date":
            lastDate,


        "Apply Link":
            getValue(
                "link"
            ),


        /*
           Preserve whatever is selected
           in Status field.
        */

        Status:
            getValue(
                "status"
            ),


        "Required Documents":
            getValue(
                "documents"
            )

    };

}


/* =========================================================
   SAVE SCHOLARSHIP
========================================================= */

async function saveScholarship(
    event
) {

    event.preventDefault();


    const form =
        document.getElementById(
            "scholarshipForm"
        );


    if (!form) {

        return;

    }


    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }


    const saveBtn =
        form.querySelector(
            'button[type="submit"]'
        );


    const isEdit =
        editIndex !== null;


    const oldItem =
        isEdit
            ? allScholarships[
                editIndex
            ]
            : null;


    if (
        isEdit &&
        !oldItem
    ) {

        showToast(
            "Original scholarship not found"
        );

        return;

    }


    const startDate =
        normalizeDate(
            getValue(
                "startDate"
            )
        );


    const lastDate =
        normalizeDate(
            getValue(
                "lastDate"
            )
        );


    /* =====================================================
       DATE VALIDATION
    ===================================================== */

    if (
        startDate &&
        lastDate
    ) {

        const start =
            new Date(
                startDate +
                "T00:00:00"
            );


        const last =
            new Date(
                lastDate +
                "T00:00:00"
            );


        if (
            start > last
        ) {

            showToast(
                "Last Date must be after Start Date"
            );

            return;

        }

    }


    const item =
        collectScholarshipFormData(
            oldItem
        );


    /*
       Preserve exact original ID.
    */

    if (oldItem) {

        const originalId =
            getScholarshipId(
                oldItem
            );


        if (originalId) {

            item.Id =
                originalId;

        }

    }


    const action =
        isEdit
            ? "edit"
            : "add";


    try {

        if (saveBtn) {

            saveBtn.disabled = true;


            saveBtn.innerHTML =
                isEdit
                    ?
                    `
                    <i class="ri-loader-4-line"></i>
                    Updating...
                    `
                    :
                    `
                    <i class="ri-loader-4-line"></i>
                    Saving...
                    `;

        }


        const payload = {

            action: action,

            data: item,

            id: item.Id

        };


        console.log(
            "ELIGIFY SAVE PAYLOAD:",
            payload
        );


        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const rawResponse =
            await response.text();


        console.log(
            "ELIGIFY SAVE RESPONSE:",
            rawResponse
        );


        let result = null;


        if (rawResponse.trim()) {

            try {

                result =
                    JSON.parse(
                        rawResponse
                    );

            }

            catch (parseError) {

                console.warn(
                    "Response is not JSON:",
                    rawResponse
                );

            }

        }


        /*
           If server explicitly says failure,
           stop here.
        */

        if (
            result &&
            (
                result.success === false ||
                result.status === "error" ||
                result.ok === false
            )
        ) {

            throw new Error(
                result.message ||
                result.error ||
                "Server rejected request"
            );

        }


        /* =================================================
           LOCAL UPDATE
        ================================================= */

        if (isEdit) {

            allScholarships[
                editIndex
            ] = {
                ...allScholarships[
                    editIndex
                ],
                ...item
            };

        }

        else {

            allScholarships.unshift(
                {
                    ...item
                }
            );

        }


        autoUpdateStatus();

        scholarships =
            [...allScholarships];


        updateDashboardCards();

        updateCategoryCounts();


        /*
           Reset filters.
        */

        showAll = false;

        currentSearch = "";

        currentCategory = "All";


        const search =
            document.getElementById(
                "searchBox"
            );


        if (search) {

            search.value = "";

        }


        const filter =
            document.getElementById(
                "categoryFilter"
            );


        if (filter) {

            filter.value = "All";

        }


        applyFilters();


        closeScholarshipModal();


        showToast(
            isEdit
                ? "Scholarship updated successfully"
                : "Scholarship added successfully"
        );


        /*
           IMPORTANT:
           Reload from Google Sheet after save.
           This makes Sheet the final source of truth.
        */

        await wait(800);


        try {

            await loadScholarships(
                false
            );

        }

        catch (reloadError) {

            console.warn(
                "Reload after save failed:",
                reloadError
            );

        }

    }


    catch (error) {

        console.error(
            "SAVE SCHOLARSHIP ERROR:",
            error
        );


        showToast(
            isEdit
                ? "Update failed. Check Google Sheet/API."
                : "Save failed. Check Google Sheet/API."
        );

    }


    finally {

        if (saveBtn) {

            saveBtn.disabled = false;


            saveBtn.innerHTML =
                `
                <i class="ri-save-line"></i>
                Save Scholarship
                `;

        }

    }

}


/* =========================================================
   DELETE MODAL
========================================================= */

function openDeleteModal(
    index
) {

    const item =
        allScholarships[index];


    if (!item) {

        showToast(
            "Scholarship not found"
        );

        return;

    }


    deleteId =
        getScholarshipId(
            item
        );


    if (!deleteId) {

        showToast(
            "This scholarship has no ID"
        );

        return;

    }


    showModal(
        "deleteModal"
    );

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal() {

    hideModal(
        "deleteModal"
    );


    deleteId = null;

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

async function confirmDeleteScholarship() {

    if (
        !deleteId
    ) {

        showToast(
            "Invalid scholarship"
        );

        return;

    }


    const button =
        document.getElementById(
            "confirmDeleteBtn"
        );


    try {

        if (button) {

            button.disabled = true;


            button.innerHTML =
                `
                <i class="ri-loader-4-line"></i>
                Deleting...
                `;

        }


        const payload = {

            action: "delete",

            id: deleteId

        };


        console.log(
            "ELIGIFY DELETE PAYLOAD:",
            payload
        );


        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const rawResponse =
            await response.text();


        console.log(
            "ELIGIFY DELETE RESPONSE:",
            rawResponse
        );


        let result = null;


        if (rawResponse.trim()) {

            try {

                result =
                    JSON.parse(
                        rawResponse
                    );

            }

            catch {

                result = null;

            }

        }


        if (
            result &&
            (
                result.success === false ||
                result.status === "error" ||
                result.ok === false
            )
        ) {

            throw new Error(
                result.message ||
                result.error ||
                "Delete rejected"
            );

        }


        /* =================================================
           REMOVE LOCAL RECORD
        ================================================= */

        allScholarships =
            allScholarships.filter(
                function (item) {

                    return String(
                        getScholarshipId(
                            item
                        )
                    ) !==
                    String(
                        deleteId
                    );

                }
            );


        scholarships =
            [...allScholarships];


        autoUpdateStatus();

        updateDashboardCards();

        updateCategoryCounts();


        showAll = false;


        applyFilters();


        closeDeleteModal();


        showToast(
            "Scholarship deleted successfully"
        );


        /*
           Reload from Google Sheet after delete.
        */

        await wait(800);


        try {

            await loadScholarships();

        }

        catch (reloadError) {

            console.warn(
                "Reload after delete failed:",
                reloadError
            );

        }

    }


    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        showToast(
            "Delete failed. Check API."
        );

    }


    finally {

        if (button) {

            button.disabled = false;


            button.innerHTML =
                `
                <i class="ri-delete-bin-line"></i>
                Delete
                `;

        }

    }

}


/* =========================================================
   VIEW SCHOLARSHIP
========================================================= */

function viewScholarship(
    index
) {

    const item =
        allScholarships[index];


    if (!item) {

        showToast(
            "Scholarship not found"
        );

        return;

    }


    const content =
        document.getElementById(
            "viewContent"
        );


    if (!content) {

        return;

    }


    const fields = [

        [
            "Scholarship Name",
            item[
                "Scholarship Name"
            ]
        ],

        [
            "Provider",
            item.Provider
        ],

        [
            "Category",
            item.Category
        ],

        [
            "State",
            item.State
        ],

        [
            "Course Level",
            item[
                "Course Level"
            ]
        ],

        [
            "Eligible Courses",
            item[
                "Eligible Courses"
            ]
        ],

        [
            "Scholarship Type",
            item[
                "Scholarship Type"
            ]
        ],

        [
            "Gender",
            item.Gender
        ],

        [
            "Community",
            item.Community
        ],

        [
            "Family Income",
            item[
                "Family Income Limit"
            ]
        ],

        [
            "Minimum Marks",
            item[
                "Minimum Marks"
            ]
        ],

        [
            "Scholarship Amount",
            item[
                "Scholarship Amount"
            ]
        ],

        [
            "First Graduate",
            item[
                "First Graduate"
            ]
        ],

        [
            "Single Child",
            item[
                "Single Child"
            ]
        ],

        [
            "Age Limit",
            item[
                "Age Limit"
            ]
        ],

        [
            "Application Mode",
            item[
                "Application Mode"
            ]
        ],

        [
            "Start Date",
            formatDateForDisplay(
                getStartDateFromItem(
                    item
                )
            )
        ],

        [
            "Last Date",
            formatDateForDisplay(
                getLastDateFromItem(
                    item
                )
            )
        ],

        [
            "Status",
            item.Status
        ],

        [
            "Required Documents",
            item[
                "Required Documents"
            ]
        ]

    ];


    content.innerHTML =
        fields
            .map(
                function (
                    [label, value]
                ) {

                    return `
                    <div>

                        <strong>
                            ${escapeHTML(
                                label
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                value ||
                                "-"
                            )}
                        </span>

                    </div>
                    `;

                }
            )
            .join("");


    /* =====================================================
       APPLY LINK
    ===================================================== */

    if (
        item["Apply Link"]
    ) {

        const link =
            String(
                item["Apply Link"]
            ).trim();


        /*
           Only allow http/https links.
        */

        if (
            /^https?:\/\//i.test(
                link
            )
        ) {

            content.innerHTML +=
                `
                <div
                    style="grid-column:1/-1;">

                    <strong>
                        APPLY LINK
                    </strong>

                    <a
                        href="${escapeHTML(
                            link
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="apply-link">

                        Apply Now

                    </a>

                </div>
                `;

        }

    }


    showModal(
        "viewModal"
    );

}


/* =========================================================
   CLOSE VIEW MODAL
========================================================= */

function closeViewModal() {

    hideModal(
        "viewModal"
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function openLogoutModal() {

    showModal(
        "logoutModal"
    );

}


function closeLogoutModal() {

    hideModal(
        "logoutModal"
    );

}


function logoutAdmin() {

    window.location.href =
        "login.html";

}


/* =========================================================
   MODAL HELPERS
========================================================= */

function showModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


function hideModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "none";


    modal.classList.remove(
        "show"
    );


    const openModal =
        document.querySelector(
            ".modal.show"
        );


    if (!openModal) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


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
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.innerText =
            value ?? "";

    }

}


/* =========================================================
   SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.value =
        value === null ||
        value === undefined
            ? ""
            : String(value);

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "";

    }


    return String(
        element.value ?? ""
    ).trim();

}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

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
   SCROLL TO SECTION
========================================================= */

function scrollToSection(
    id
) {

    const section =
        document.getElementById(
            id
        );


    if (!section) {

        return;

    }


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   WAIT
========================================================= */

function wait(
    ms
) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                ms
            );

        }
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
   For HTML onclick
========================================================= */

window.openAddModal =
    openAddModal;

window.closeScholarshipModal =
    closeScholarshipModal;

window.editScholarship =
    editScholarship;

window.openDeleteModal =
    openDeleteModal;

window.closeDeleteModal =
    closeDeleteModal;

window.confirmDeleteScholarship =
    confirmDeleteScholarship;

window.viewScholarship =
    viewScholarship;

window.closeViewModal =
    closeViewModal;

window.closeLogoutModal =
    closeLogoutModal;

window.logoutAdmin =
    logoutAdmin;

window.filterByCategory =
    filterByCategory;

window.showAllScholarships =
    showAllScholarships;

window.viewAllScholarships =
    viewAllScholarships;


/* =========================================================
   END
========================================================= */