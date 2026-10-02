// ==========================================
// ELIGIFY - SAVED SCHOLARSHIPS
// RESULTS + PROFILE SYNC
// ==========================================

const savedContainer =
    document.getElementById("savedContainer");

let savedScholarships = [];


// ==========================================
// LOAD PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadSavedScholarships();

});


// ==========================================
// GET ALL USERS
// ==========================================

function getUsers() {

    try {

        const data =
            localStorage.getItem("eligifyUsers");

        if (!data) {
            return [];
        }

        const users =
            JSON.parse(data);

        return Array.isArray(users)
            ? users
            : [];

    } catch (error) {

        console.error(
            "Users data error:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE ALL USERS
// ==========================================

function saveUsers(users) {

    try {

        localStorage.setItem(
            "eligifyUsers",
            JSON.stringify(users)
        );

    } catch (error) {

        console.error(
            "Save users error:",
            error
        );

    }

}


// ==========================================
// GET CURRENT USER ID
// ==========================================

function getCurrentUserId() {

    return localStorage.getItem(
        "currentUserId"
    );

}


// ==========================================
// GET CURRENT USER INDEX
// ==========================================

function getCurrentUserIndex(users) {

    const currentUserId =
        getCurrentUserId();

    if (!currentUserId) {
        return -1;
    }

    return users.findIndex(user =>
        String(user.id) ===
        String(currentUserId)
    );

}


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    const users =
        getUsers();

    const userIndex =
        getCurrentUserIndex(users);

    if (userIndex === -1) {
        return null;
    }

    return users[userIndex];

}


// ==========================================
// GET SAVED SCHOLARSHIPS
// ==========================================

function getSavedScholarships() {

    const user =
        getCurrentUser();

    if (!user) {
        return [];
    }

    return Array.isArray(user.saved)
        ? user.saved
        : [];

}


// ==========================================
// GET SCHOLARSHIP ID
// ==========================================

function getScholarshipId(item) {

    if (!item) {
        return "";
    }

    return String(

        item.id ??
        item.Id ??
        item.ID ??
        item.scholarshipId ??
        item.scholarship_id ??
        item["Scholarship ID"] ??
        item.name ??
        item["Scholarship Name"] ??
        item.title ??
        ""

    ).trim();

}


// ==========================================
// LOAD SAVED SCHOLARSHIPS
// ==========================================

function loadSavedScholarships() {

    if (!savedContainer) {
        return;
    }

    savedScholarships =
        getSavedScholarships();

    savedContainer.innerHTML = "";


    // ======================================
    // NO SAVED SCHOLARSHIPS
    // ======================================

    if (savedScholarships.length === 0) {

        savedContainer.innerHTML = `

            <div class="empty-box">

                <i class="ri-heart-3-line"></i>

                <h2>No Saved Scholarships</h2>

                <p>
                    Your favourite scholarships
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    // ======================================
    // CREATE CARDS
    // ======================================

    savedScholarships.forEach(
        item => {

            const card =
                createSavedCard(item);

            savedContainer.appendChild(card);

        }
    );

}


// ==========================================
// CREATE SAVED CARD
// ==========================================

function createSavedCard(item) {

    const card =
        document.createElement("article");

    card.className =
        "scholarship-card";


    // ======================================
    // NORMALIZE DATA
    // ======================================

    const name =
        safe(
            item.name ??
            item["Scholarship Name"]
        );

    const provider =
        safe(
            item.provider ??
            item.Provider
        );

    const amount =
        safe(
            item.amount ??
            item["Scholarship Amount"] ??
            item.Amount
        );

    const state =
        safe(
            item.state ??
            item.State
        );

    const category =
        safe(
            item.category ??
            item.Category
        );


    // ======================================
    // CARD HTML
    // ======================================

    card.innerHTML = `

        <div class="status">

            <i class="ri-heart-fill"></i>

            Saved

        </div>


        <button
            type="button"
            class="save-btn saved"
            aria-label="Remove saved scholarship"
        >

            <i class="ri-heart-3-fill"></i>

        </button>


        <p class="card-provider">

            ${escapeHTML(provider)}

        </p>


        <h3>

            ${escapeHTML(name)}

        </h3>


        <div class="category-badge">

            ${escapeHTML(category)}

        </div>


        <div class="saved-meta">

            <div>

                <span>Amount</span>

                <strong>

                    ${escapeHTML(amount)}

                </strong>

            </div>


            <div>

                <span>Location</span>

                <strong>

                    ${escapeHTML(state)}

                </strong>

            </div>

        </div>


        <div class="card-actions">

            <button
                type="button"
                class="view-btn"
            >

                View Details

                <i class="ri-arrow-right-line"></i>

            </button>

        </div>

    `;


    // ======================================
    // VIEW DETAILS
    // ======================================

    const viewButton =
        card.querySelector(".view-btn");


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "selectedScholarship",
                    JSON.stringify(item)
                );


                window.location.href =
                    "details.html";

            }
        );

    }


    // ======================================
    // REMOVE FROM SAVED
    // ======================================

    const saveButton =
        card.querySelector(".save-btn");


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            () => {

                removeSavedScholarship(
                    item
                );

            }
        );

    }


    return card;

}


// ==========================================
// REMOVE SAVED SCHOLARSHIP
// ==========================================

function removeSavedScholarship(item) {

    const users =
        getUsers();


    const userIndex =
        getCurrentUserIndex(users);


    if (userIndex === -1) {

        console.error(
            "Current user not found."
        );

        return;

    }


    const user =
        users[userIndex];


    if (!Array.isArray(user.saved)) {

        user.saved = [];

    }


    const scholarshipId =
        getScholarshipId(item);


    // ======================================
    // REMOVE MATCHING SCHOLARSHIP
    // ======================================

    user.saved =
        user.saved.filter(savedItem => {

            return (
                getScholarshipId(savedItem) !==
                scholarshipId
            );

        });


    // ======================================
    // UPDATE USERS
    // ======================================

    users[userIndex] =
        user;


    saveUsers(users);


    // ======================================
    // UPDATE CURRENT USER
    // ======================================

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );


    // ======================================
    // NOTIFY
    // ======================================

    window.dispatchEvent(

        new CustomEvent(
            "eligifySavedUpdated",
            {
                detail: {
                    saved:
                        user.saved
                }
            }
        )

    );


    // ======================================
    // RELOAD PAGE
    // ======================================

    loadSavedScholarships();

}


// ==========================================
// SAFE VALUE
// ==========================================

function safe(value) {

    if (

        value === undefined ||
        value === null ||
        String(value).trim() === "" ||
        String(value).toLowerCase() === "undefined" ||
        String(value).toLowerCase() === "null"

    ) {

        return "—";

    }

    return String(value).trim();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// DEBUG
// ==========================================

console.log(
    "Eligify Saved Scholarships loaded ✓"
);