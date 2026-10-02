/* =========================================================
   ELIGIFY
   USER REVIEWS JS
   ---------------------------------------------------------
   FEATURES
   1. Multiple reviews per user
   2. Edit own review
   3. Submit new review
   4. Show all reviews
   5. Star rating
   6. Character counter
   7. Profile photo
   8. Admin reply
   9. Toast messages
   10. User identification
   11. My Reviews
   12. Approved / Pending / Rejected status
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
"https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedRating = 0;

let allReviews = [];

let myReviews = [];

let currentUser = null;

let editingReviewId = "";


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        currentUser = getCurrentUser();

        loadUserDetails();

        setupRating();

        setupCharacterCounter();

        loadReviews();

    }
);


/* =========================================================
   GO BACK
========================================================= */

function goBack() {

    if (
        document.referrer &&
        document.referrer !== window.location.href
    ) {

        history.back();

    }
    else {

        window.location.href =
            "profile.html";

    }

}


/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {

    let users = {};

    try {

        users =
            JSON.parse(
                localStorage.getItem(
                    "eligifyUsers"
                )
            ) || {};

    }
    catch (error) {

        console.warn(
            "eligifyUsers parse error:",
            error
        );

    }


    const currentUserKey =
        String(
            localStorage.getItem(
                "currentUser"
            ) || ""
        ).trim();


    /* =====================================================
       DIRECT CURRENT USER
    ===================================================== */

    if (
        currentUserKey &&
        users[currentUserKey]
    ) {

        return normalizeUser(
            users[currentUserKey],
            currentUserKey
        );

    }


    /* =====================================================
       STORED IDENTIFIERS
    ===================================================== */

    const storedEmail =
        String(
            localStorage.getItem(
                "email"
            ) || ""
        )
        .trim()
        .toLowerCase();


    const storedUsername =
        String(
            localStorage.getItem(
                "username"
            ) || ""
        )
        .trim()
        .toLowerCase();


    const storedUserId =
        String(
            localStorage.getItem(
                "userId"
            ) || ""
        ).trim();


    /* =====================================================
       SEARCH USERS
    ===================================================== */

    for (
        const [key, user]
        of Object.entries(users)
    ) {

        if (!user) continue;


        const userEmail =
            String(
                user.email ||
                user.Email ||
                ""
            )
            .trim()
            .toLowerCase();


        const username =
            String(
                user.username ||
                user.Username ||
                ""
            )
            .trim()
            .toLowerCase();


        const userId =
            String(
                user.userId ||
                user.id ||
                key ||
                ""
            ).trim();


        if (

            (
                storedEmail &&
                userEmail === storedEmail
            )

            ||

            (
                storedUsername &&
                username === storedUsername
            )

            ||

            (
                storedUserId &&
                userId === storedUserId
            )

        ) {

            return normalizeUser(
                user,
                key
            );

        }

    }


    /* =====================================================
       DIRECT STORAGE FALLBACK
    ===================================================== */

    const possibleKeys = [

        "eligifyUser",
        "loggedInUser",
        "profileUser"

    ];


    for (
        const key of possibleKeys
    ) {

        try {

            const value =
                localStorage.getItem(
                    key
                );


            if (!value) continue;


            const parsed =
                JSON.parse(value);


            if (
                parsed &&
                typeof parsed === "object"
            ) {

                return normalizeUser(
                    parsed,
                    ""
                );

            }

        }
        catch (error) {

            console.warn(
                "User storage error:",
                key
            );

        }

    }


    /* =====================================================
       FINAL FALLBACK
    ===================================================== */

    return {

        userId:
            localStorage.getItem(
                "userId"
            ) || "",

        username:
            localStorage.getItem(
                "username"
            ) || "",

        name:
            localStorage.getItem(
                "fullName"
            ) ||
            localStorage.getItem(
                "name"
            ) ||
            localStorage.getItem(
                "username"
            ) ||
            "Eligify User",

        email:
            localStorage.getItem(
                "email"
            ) || "",

        profilePhoto:
            localStorage.getItem(
                "profilePhoto"
            ) ||
            localStorage.getItem(
                "photo"
            ) ||
            ""

    };

}


/* =========================================================
   NORMALIZE USER
========================================================= */

function normalizeUser(
    user,
    storageKey = ""
) {

    if (!user) {

        return {

            userId: "",
            username: "",
            name: "Eligify User",
            email: "",
            profilePhoto: ""

        };

    }


    return {

        ...user,

        userId:
            user.userId ||
            user.id ||
            storageKey ||
            "",

        username:
            user.username ||
            user.Username ||
            "",

        name:
            user.fullName ||
            user.name ||
            user.Name ||
            user.username ||
            user.Username ||
            "Eligify User",

        email:
            user.email ||
            user.Email ||
            "",

        profilePhoto:
            user.profilePhoto ||
            user.ProfilePhoto ||
            user.profile_picture ||
            user.profilePicture ||
            user.photo ||
            user.Photo ||
            ""

    };

}


/* =========================================================
   LOAD USER DETAILS
========================================================= */

function loadUserDetails() {

    const user =
        currentUser ||
        getCurrentUser();


    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "Eligify User";


    const username =
        user.username ||
        "";


    const avatar =
        getUserProfilePhoto(
            user
        );


    const nameElement =
        document.getElementById(
            "reviewUserName"
        );


    const usernameElement =
        document.getElementById(
            "reviewUsername"
        );


    const avatarElement =
        document.getElementById(
            "reviewAvatar"
        );


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    if (usernameElement) {

        usernameElement.textContent =
            username
                ? "@" + username
                : "";

    }


    if (avatarElement) {

        if (avatar) {

            avatarElement.innerHTML = `

                <img
                    src="${escapeAttribute(avatar)}"
                    alt="Profile photo"
                    onerror="
                        this.style.display='none';
                        this.parentElement.textContent='${escapeAttribute(
                            getInitial(name)
                        )}';
                    "
                >

            `;

        }
        else {

            avatarElement.textContent =
                getInitial(name);

        }

    }

}


/* =========================================================
   GET PROFILE PHOTO
========================================================= */

function getUserProfilePhoto(
    user
) {

    if (!user) return "";


    const directPhoto =
        user.profilePhoto ||
        user.ProfilePhoto ||
        user.profile_picture ||
        user.profilePicture ||
        user.photo ||
        user.Photo ||
        "";


    if (directPhoto) {

        return String(
            directPhoto
        ).trim();

    }


    try {

        const users =
            JSON.parse(
                localStorage.getItem(
                    "eligifyUsers"
                )
            ) || {};


        const userId =
            String(
                user.userId ||
                user.id ||
                ""
            ).trim();


        const email =
            String(
                user.email ||
                user.Email ||
                ""
            )
            .trim()
            .toLowerCase();


        const username =
            String(
                user.username ||
                user.Username ||
                ""
            )
            .trim()
            .toLowerCase();


        for (
            const [key, storedUser]
            of Object.entries(users)
        ) {

            if (!storedUser) continue;


            const storedId =
                String(
                    storedUser.userId ||
                    storedUser.id ||
                    key ||
                    ""
                ).trim();


            const storedEmail =
                String(
                    storedUser.email ||
                    storedUser.Email ||
                    ""
                )
                .trim()
                .toLowerCase();


            const storedUsername =
                String(
                    storedUser.username ||
                    storedUser.Username ||
                    ""
                )
                .trim()
                .toLowerCase();


            const matched =

                (
                    userId &&
                    storedId &&
                    userId === storedId
                )

                ||

                (
                    email &&
                    storedEmail &&
                    email === storedEmail
                )

                ||

                (
                    username &&
                    storedUsername &&
                    username === storedUsername
                );


            if (matched) {

                return String(

                    storedUser.profilePhoto ||
                    storedUser.ProfilePhoto ||
                    storedUser.profile_picture ||
                    storedUser.profilePicture ||
                    storedUser.photo ||
                    storedUser.Photo ||
                    ""

                ).trim();

            }

        }

    }
    catch (error) {

        console.warn(
            "Profile photo lookup failed:",
            error
        );

    }


    return (

        localStorage.getItem(
            "profilePhoto"
        ) ||

        localStorage.getItem(
            "photo"
        ) ||

        ""

    );

}


/* =========================================================
   STAR RATING
========================================================= */

function setupRating() {

    const stars =
        document.querySelectorAll(
            ".star-btn"
        );


    stars.forEach(
        function (star) {

            star.addEventListener(
                "click",
                function () {

                    selectedRating =
                        Number(
                            star.dataset.rating
                        );

                    updateRatingStars();

                }
            );


            star.addEventListener(
                "mouseenter",
                function () {

                    highlightStars(
                        Number(
                            star.dataset.rating
                        )
                    );

                }
            );

        }
    );


    const ratingContainer =
        document.getElementById(
            "starRating"
        );


    if (ratingContainer) {

        ratingContainer.addEventListener(
            "mouseleave",
            function () {

                updateRatingStars();

            }
        );

    }

}


/* =========================================================
   HIGHLIGHT STARS
========================================================= */

function highlightStars(
    rating
) {

    const stars =
        document.querySelectorAll(
            ".star-btn"
        );


    stars.forEach(
        function (
            star,
            index
        ) {

            const icon =
                star.querySelector(
                    "i"
                );


            if (
                index < rating
            ) {

                star.classList.add(
                    "selected"
                );


                if (icon) {

                    icon.className =
                        "ri-star-fill";

                }

            }
            else {

                star.classList.remove(
                    "selected"
                );


                if (icon) {

                    icon.className =
                        "ri-star-line";

                }

            }

        }
    );

}


/* =========================================================
   UPDATE RATING
========================================================= */

function updateRatingStars() {

    highlightStars(
        selectedRating
    );


    const ratingText =
        document.getElementById(
            "ratingText"
        );


    if (!ratingText) return;


    const labels = {

        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent"

    };


    ratingText.textContent =
        labels[selectedRating] ||
        "Select a rating";

}


/* =========================================================
   CHARACTER COUNTER
========================================================= */

function setupCharacterCounter() {

    const textarea =
        document.getElementById(
            "reviewText"
        );


    const counter =
        document.getElementById(
            "characterCount"
        );


    if (
        !textarea ||
        !counter
    ) {

        return;

    }


    function updateCounter() {

        counter.textContent =
            `${textarea.value.length} / 500`;

    }


    textarea.addEventListener(
        "input",
        updateCounter
    );


    updateCounter();

}


/* =========================================================
   LOAD REVIEWS
========================================================= */

async function loadReviews() {

    const container =
        document.getElementById(
            "reviewsList"
        );


    const loading =
        document.getElementById(
            "reviewsLoading"
        );


    const empty =
        document.getElementById(
            "reviewsEmpty"
        );


    if (!container) return;


    if (loading) {

        loading.style.display =
            "flex";

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    container.innerHTML =
        "";


    try {

        const user =
    currentUser ||
    getCurrentUser();

const userId =
    String(
        user.userId ||
        user.id ||
        ""
    ).trim();

const email =
    String(
        user.email ||
        user.Email ||
        ""
    )
    .trim()
    .toLowerCase();

const params =
    new URLSearchParams();

params.set(
    "type",
    "reviews"
);

if (userId) {

    params.set(
        "userId",
        userId
    );

}

if (email) {

    params.set(
        "email",
        email
    );

}

params.set(
    "_",
    Date.now()
);

const response =
    await fetch(
        API_URL +
        "?" +
        params.toString(),
        {
            method: "GET",
            cache: "no-store"
        }
    );


        if (!response.ok) {

            throw new Error(
                "Failed to load reviews"
            );

        }


        const data =
            await response.json();


        console.log(
            "ELIGIFY REVIEWS:",
            data
        );


        let reviewData = [];


        if (
            Array.isArray(data)
        ) {

            reviewData =
                data;

        }
        else if (
            data &&
            Array.isArray(data.reviews)
        ) {

            reviewData =
                data.reviews;

        }
        else if (
            data &&
            Array.isArray(data.data)
        ) {

            reviewData =
                data.data;

        }
        else {

            throw new Error(
                "Invalid reviews response"
            );

        }


        /* =================================================
           NORMALIZE
        ================================================= */

        allReviews =
            reviewData.map(
                normalizeReview
            );


        /* =================================================
           NEWEST FIRST
        ================================================= */

        allReviews.sort(
            function (a, b) {

                return (
                    getTime(
                        b.createdAt
                    ) -
                    getTime(
                        a.createdAt
                    )
                );

            }
        );


        /* =================================================
           CURRENT USER REVIEWS
        ================================================= */

        myReviews =
            allReviews.filter(
                isCurrentUserReview
            );


        renderMyReviews();

        renderReviews();


    }
    catch (error) {

        console.error(
            "Load reviews error:",
            error
        );


        allReviews =
            [];

        myReviews =
            [];


        container.innerHTML = `

            <div class="review-error">

                <i class="ri-error-warning-line"></i>

                <p>
                    Unable to load reviews.
                    Please try again.
                </p>

            </div>

        `;

        renderMyReviews();

    }
    finally {

        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


/* =========================================================
   NORMALIZE REVIEW
========================================================= */

function normalizeReview(
    review
) {

    if (!review) {

        return {

            id: "",
            userId: "",
            username: "",
            name: "Eligify User",
            email: "",
            rating: 0,
            review: "",
            status: "Pending",
            createdAt: "",
            updatedAt: "",
            profilePhoto: "",
            adminReply: "",
            adminReplyAt: ""

        };

    }


    return {

        id:
            String(
                review.id ||
                review.ID ||
                review.reviewId ||
                review.ReviewId ||
                ""
            ).trim(),

        userId:
            String(
                review.userId ||
                review.UserId ||
                review.userID ||
                review.UserID ||
                ""
            ).trim(),

        username:
            String(
                review.username ||
                review.Username ||
                ""
            ).trim(),

        name:
            String(
                review.name ||
                review.Name ||
                review.fullName ||
                review.FullName ||
                review.username ||
                review.Username ||
                "Eligify User"
            ).trim(),

        email:
            String(
                review.email ||
                review.Email ||
                ""
            ).trim(),

        rating:
            normalizeRating(
                review.rating ??
                review.Rating
            ),

        review:
            String(
                review.review ||
                review.Review ||
                review.comment ||
                review.Comment ||
                ""
            ).trim(),

        status:
            String(
                review.status ||
                review.Status ||
                "Pending"
            ).trim(),

        createdAt:
            review.createdAt ||
            review.CreatedAt ||
            review.date ||
            review.Date ||
            "",

        updatedAt:
            review.updatedAt ||
            review.UpdatedAt ||
            "",

        profilePhoto:
            String(
                review.profilePhoto ||
                review.ProfilePhoto ||
                review.profile_picture ||
                review.profilePicture ||
                review.photo ||
                review.Photo ||
                ""
            ).trim(),

        adminReply:
            String(
                review.adminReply ||
                review.AdminReply ||
                review.reply ||
                review.Reply ||
                ""
            ).trim(),

        adminReplyAt:
            review.adminReplyAt ||
            review.AdminReplyAt ||
            ""

    };

}


/* =========================================================
   CURRENT USER REVIEW CHECK
========================================================= */

function isCurrentUserReview(
    review
) {

    const user =
        currentUser ||
        getCurrentUser();


    const currentUserId =
        String(
            user.userId ||
            user.id ||
            ""
        ).trim();


    const currentEmail =
        String(
            user.email ||
            user.Email ||
            ""
        )
        .trim()
        .toLowerCase();


    const currentUsername =
        String(
            user.username ||
            user.Username ||
            ""
        )
        .trim()
        .toLowerCase();


    const reviewUserId =
        String(
            review.userId ||
            ""
        ).trim();


    const reviewEmail =
        String(
            review.email ||
            ""
        )
        .trim()
        .toLowerCase();


    const reviewUsername =
        String(
            review.username ||
            ""
        )
        .trim()
        .toLowerCase();


    return (

        (
            currentUserId &&
            reviewUserId &&
            currentUserId ===
            reviewUserId
        )

        ||

        (
            currentEmail &&
            reviewEmail &&
            currentEmail ===
            reviewEmail
        )

        ||

        (
            currentUsername &&
            reviewUsername &&
            currentUsername ===
            reviewUsername
        )

    );

}


/* =========================================================
   RENDER MY REVIEWS
   ---------------------------------------------------------
   IMPORTANT FIX:
   HTML ID = myReviewsList
   NOT myReviewCard
========================================================= */

function renderMyReviews() {

    const section =
        document.getElementById(
            "myReviewSection"
        );


    const list =
        document.getElementById(
            "myReviewsList"
        );


    const empty =
        document.getElementById(
            "myReviewsEmpty"
        );


    if (
        !section ||
        !list
    ) {

        return;

    }


    if (!myReviews.length) {

        section.style.display =
            "none";


        list.innerHTML =
            "";


        if (empty) {

            empty.style.display =
                "none";

        }


        return;

    }


    section.style.display =
        "block";


    if (empty) {

        empty.style.display =
            "none";

    }


    list.innerHTML =
        myReviews.map(
            createMyReviewHTML
        ).join("");

}


/* =========================================================
   CREATE MY REVIEW HTML
========================================================= */

function createMyReviewHTML(
    review
) {

    const rating =
        normalizeRating(
            review.rating
        );


    const status =
        String(
            review.status ||
            "Pending"
        ).trim();


    const statusValue =
        normalizeStatus(
            status
        );


    let statusClass =
        "pending";


    let statusIcon =
        "ri-time-line";


    if (
        statusValue ===
        "approved"
    ) {

        statusClass =
            "approved";

        statusIcon =
            "ri-checkbox-circle-fill";

    }
    else if (
        statusValue ===
        "rejected"
    ) {

        statusClass =
            "rejected";

        statusIcon =
            "ri-close-circle-fill";

    }


    let adminReplyHTML =
        "";


    if (
        review.adminReply &&
        String(
            review.adminReply
        ).trim()
    ) {

        adminReplyHTML = `

            <div class="admin-reply">

                <strong>

                    <i class="ri-admin-line"></i>

                    Eligify Admin

                </strong>

                <p>

                    ${escapeHTML(
                        review.adminReply
                    )}

                </p>

                ${
                    review.adminReplyAt
                    ?
                    `
                        <small>

                            ${escapeHTML(
                                formatReviewDate(
                                    review.adminReplyAt
                                )
                            )}

                        </small>
                    `
                    :
                    ""
                }

            </div>

        `;

    }


    const editButton =
        review.id
        ?
        `

            <button
                type="button"
                class="edit-review-btn"
                onclick="editReview('${escapeAttribute(
                    review.id
                )}')"
            >

                <i class="ri-edit-line"></i>

                Edit Review

            </button>

        `
        :
        "";


    return `

        <div
            class="my-review-item"
            data-review-id="${escapeAttribute(
                review.id
            )}"
        >

            <div class="my-review-header">

                <div class="my-review-heading">

                    <div class="my-review-title-row">

                        <span class="my-review-label">

                            Your Review

                        </span>


                        <span
                            class="review-status ${statusClass}"
                        >

                            <i class="${statusIcon}"></i>

                            ${escapeHTML(
                                status
                            )}

                        </span>

                    </div>


                    <div class="my-review-stars">

                        ${getStarsHTML(
                            rating
                        )}

                    </div>

                </div>

            </div>


            <p class="my-review-text">

                ${escapeHTML(
                    review.review
                )}

            </p>


            <div class="my-review-footer">

                <span class="my-review-date">

                    ${escapeHTML(
                        formatReviewDate(
                            review.createdAt
                        )
                    )}

                </span>


                ${editButton}

            </div>


            ${adminReplyHTML}

        </div>

    `;

}


/* =========================================================
   EDIT REVIEW
========================================================= */

function editReview(
    reviewId
) {

    const review =
        allReviews.find(
            function (item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        reviewId
                    )
                );

            }
        );


    if (!review) {

        showToast(
            "Review not found",
            "error"
        );

        return;

    }


    if (
        !isCurrentUserReview(
            review
        )
    ) {

        showToast(
            "You can edit only your own review",
            "error"
        );

        return;

    }


    editingReviewId =
        String(
            review.id
        );


    selectedRating =
        normalizeRating(
            review.rating
        );


    const textarea =
        document.getElementById(
            "reviewText"
        );


    if (textarea) {

        textarea.value =
            review.review || "";

        textarea.focus();

        textarea.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    updateRatingStars();


    const counter =
        document.getElementById(
            "characterCount"
        );


    if (
        counter &&
        textarea
    ) {

        counter.textContent =
            `${textarea.value.length} / 500`;

    }


    const button =
        document.getElementById(
            "submitReviewBtn"
        );


    const buttonText =
        document.getElementById(
            "submitReviewText"
        );


    if (buttonText) {

        buttonText.textContent =
            "Update Review";

    }
    else if (button) {

        button.innerHTML = `

            <i class="ri-save-line"></i>

            <span>
                Update Review
            </span>

        `;

    }


    if (button) {

        const icon =
            button.querySelector(
                "i"
            );


        if (icon) {

            icon.className =
                "ri-save-line";

        }

    }


    const cancelButton =
        document.getElementById(
            "cancelEditBtn"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "inline-flex";

    }


    const title =
        document.getElementById(
            "reviewFormTitle"
        );


    const subtitle =
        document.getElementById(
            "reviewFormSubtitle"
        );


    if (title) {

        title.textContent =
            "Edit Your Review";

    }


    if (subtitle) {

        subtitle.textContent =
            "Update your experience with Eligify.";

    }


    const note =
        document.getElementById(
            "reviewNote"
        );


    if (note) {

        note.textContent =
            "You are editing your previous review. Submit to save the changes.";

    }


    showToast(
        "Review loaded for editing",
        "success"
    );

}


/* =========================================================
   CANCEL EDIT
========================================================= */

function cancelEditReview() {

    editingReviewId =
        "";


    selectedRating =
        0;


    const textarea =
        document.getElementById(
            "reviewText"
        );


    if (textarea) {

        textarea.value =
            "";

    }


    updateRatingStars();


    const counter =
        document.getElementById(
            "characterCount"
        );


    if (counter) {

        counter.textContent =
            "0 / 500";

    }


    resetSubmitButton();


    const cancelButton =
        document.getElementById(
            "cancelEditBtn"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    const title =
        document.getElementById(
            "reviewFormTitle"
        );


    const subtitle =
        document.getElementById(
            "reviewFormSubtitle"
        );


    if (title) {

        title.textContent =
            "Write a Review";

    }


    if (subtitle) {

        subtitle.textContent =
            "Share your experience with Eligify.";

    }


    const note =
        document.getElementById(
            "reviewNote"
        );


    if (note) {

        note.textContent =
            "You can share your experience whenever you use Eligify. Each review will be sent to the Eligify admin for approval.";

    }

}


/* =========================================================
   OLD NAME SUPPORT
   ---------------------------------------------------------
   Keeps cancelEdit() working too.
========================================================= */

function cancelEdit() {

    cancelEditReview();

}


/* =========================================================
   RESET SUBMIT BUTTON
========================================================= */

function resetSubmitButton() {

    const button =
        document.getElementById(
            "submitReviewBtn"
        );


    if (!button) return;


    button.innerHTML = `

        <i class="ri-send-plane-fill"></i>

        <span id="submitReviewText">
            Submit Review
        </span>

    `;


    button.disabled =
        false;


    const cancelButton =
        document.getElementById(
            "cancelEditBtn"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }

}


/* =========================================================
   RENDER ALL REVIEWS
========================================================= */

function renderReviews() {

    const container =
        document.getElementById(
            "reviewsList"
        );


    const empty =
        document.getElementById(
            "reviewsEmpty"
        );


    if (!container) {

        return;

    }


    if (!allReviews.length) {

        container.innerHTML =
            "";


        if (empty) {

            empty.style.display =
                "flex";

        }


        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    container.innerHTML =
        allReviews.map(
            createReviewHTML
        ).join("");

}


/* =========================================================
   CREATE PUBLIC REVIEW HTML
========================================================= */

function createReviewHTML(
    review
) {

    const isMine =
        isCurrentUserReview(
            review
        );


    const name =
        escapeHTML(
            review.name ||
            review.username ||
            "Eligify User"
        );


    const text =
        escapeHTML(
            review.review ||
            ""
        );


    const rating =
        normalizeRating(
            review.rating
        );


    const date =
        formatReviewDate(
            review.createdAt
        );


    const avatar =
        getAvatarHTML(
            review
        );


    const status =
        String(
            review.status ||
            "Pending"
        ).trim();


    const statusValue =
        normalizeStatus(
            status
        );


    let statusHTML =
        "";


    if (
        statusValue ===
        "pending"
    ) {

        statusHTML = `

            <span class="public-review-status pending">

                Pending

            </span>

        `;

    }
    else if (
        statusValue ===
        "rejected"
    ) {

        statusHTML = `

            <span class="public-review-status rejected">

                Rejected

            </span>

        `;

    }
    else if (
        statusValue ===
        "approved"
    ) {

        statusHTML = `

            <span class="public-review-status approved">

                Approved

            </span>

        `;

    }


    let adminReplyHTML =
        "";


    if (
        review.adminReply &&
        String(
            review.adminReply
        ).trim()
    ) {

        adminReplyHTML = `

            <div class="user-admin-reply">

                <div class="admin-reply-title">

                    <i class="ri-admin-line"></i>

                    <strong>
                        Eligify Admin
                    </strong>

                </div>

                <p>

                    ${escapeHTML(
                        review.adminReply
                    )}

                </p>

            </div>

        `;

    }


    const mineBadge =
        isMine
        ?
        `

            <span class="my-review-badge">

                You

            </span>

        `
        :
        "";


    const editButton =
        isMine &&
        review.id
        ?
        `

            <button
                type="button"
                class="review-edit-btn"
                onclick="editReview('${escapeAttribute(
                    review.id
                )}')"
                aria-label="Edit review"
                title="Edit review"
            >

                <i class="ri-edit-line"></i>

            </button>

        `
        :
        "";


    return `

        <article
            class="review-card"
            data-review-id="${escapeAttribute(
                review.id
            )}"
        >

            <div class="review-top">

                <div class="reviewer-info">

                    <div class="reviewer-avatar">

                        ${avatar}

                    </div>


                    <div>

                        <div class="reviewer-name">

                            ${name}

                            ${mineBadge}

                        </div>


                        <div class="reviewer-date">

                            ${escapeHTML(
                                date
                            )}

                        </div>

                    </div>

                </div>


                <div class="review-actions">

                    <div class="review-rating">

                        ${getStarsHTML(
                            rating
                        )}

                    </div>


                    ${editButton}

                </div>

            </div>


            <div class="review-status-row">

                ${statusHTML}

            </div>


            <p class="review-text">

                ${text}

            </p>


            ${adminReplyHTML}

        </article>

    `;

}


/* =========================================================
   SUBMIT / UPDATE REVIEW
========================================================= */

async function submitReview() {

    const button =
        document.getElementById(
            "submitReviewBtn"
        );


    const textarea =
        document.getElementById(
            "reviewText"
        );


    if (
        !button ||
        !textarea
    ) {

        return;

    }


    /* =====================================================
       RATING
    ===================================================== */

    if (
        selectedRating < 1 ||
        selectedRating > 5
    ) {

        showToast(
            "Please select a rating",
            "error"
        );

        return;

    }


    /* =====================================================
       TEXT
    ===================================================== */

    const reviewText =
        textarea.value.trim();


    if (!reviewText) {

        showToast(
            "Please write your review",
            "error"
        );

        textarea.focus();

        return;

    }


    if (
        reviewText.length < 5
    ) {

        showToast(
            "Review is too short",
            "error"
        );

        textarea.focus();

        return;

    }


    if (
        reviewText.length > 500
    ) {

        showToast(
            "Review must be within 500 characters",
            "error"
        );

        return;

    }


    /* =====================================================
       USER
    ===================================================== */

    currentUser =
        getCurrentUser();


    const user =
        currentUser;


    const userId =
        String(
            user.userId ||
            user.id ||
            localStorage.getItem(
                "userId"
            ) ||
            ""
        ).trim();


    const username =
        String(
            user.username ||
            user.Username ||
            localStorage.getItem(
                "username"
            ) ||
            ""
        ).trim();


    const name =
        String(
            user.name ||
            user.fullName ||
            user.Name ||
            username ||
            localStorage.getItem(
                "name"
            ) ||
            localStorage.getItem(
                "fullName"
            ) ||
            "Eligify User"
        ).trim();


    const email =
        String(
            user.email ||
            user.Email ||
            localStorage.getItem(
                "email"
            ) ||
            ""
        )
        .trim()
        .toLowerCase();


    const profilePhoto =
        getUserProfilePhoto(
            user
        );


    if (
        !userId &&
        !email
    ) {

        showToast(
            "Please login before submitting a review",
            "error"
        );

        return;

    }


    /* =====================================================
       BUTTON LOADING
    ===================================================== */

    button.disabled =
        true;


    button.innerHTML = `

        <i class="ri-loader-4-line review-spin-icon"></i>

        <span>

            ${
                editingReviewId
                ? "Updating..."
                : "Submitting..."
            }

        </span>

    `;


    /* =====================================================
       PAYLOAD
    ===================================================== */

    const payload = {

    action:
        editingReviewId
        ?
        "editReview"
        :
        "addReview",

    id:
        editingReviewId || "",

    data: {

        userId:
            userId,

        username:
            username,

        name:
            name,

        email:
            email,

        rating:
            selectedRating,

        review:
            reviewText,

        profilePhoto:
            profilePhoto,

        reviewId:
            editingReviewId || ""

    }

};


    console.log(
        "ELIGIFY REVIEW PAYLOAD:",
        payload
    );


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method:
                        "POST",

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
                "Server connection failed"
            );

        }


        const result =
            await response.json();


        console.log(
            "ELIGIFY REVIEW RESPONSE:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.error ||
                (
                    editingReviewId
                    ?
                    "Review update failed"
                    :
                    "Review submission failed"
                )
            );

        }


        const wasEditing =
            Boolean(
                editingReviewId
            );


        /* =================================================
           RESET FORM
        ================================================= */

        textarea.value =
            "";


        selectedRating =
            0;


        editingReviewId =
            "";


        updateRatingStars();


        const counter =
            document.getElementById(
                "characterCount"
            );


        if (counter) {

            counter.textContent =
                "0 / 500";

        }


        resetSubmitButton();


        const title =
            document.getElementById(
                "reviewFormTitle"
            );


        const subtitle =
            document.getElementById(
                "reviewFormSubtitle"
            );


        if (title) {

            title.textContent =
                "Write a Review";

        }


        if (subtitle) {

            subtitle.textContent =
                "Share your experience with Eligify.";

        }


        const note =
            document.getElementById(
                "reviewNote"
            );


        if (note) {

            note.textContent =
                "You can share your experience whenever you use Eligify. Each review will be sent to the Eligify admin for approval.";

        }


        showToast(

            wasEditing
            ?
            "Review updated successfully"
            :
            "Review sent to admin successfully",

            "success"

        );


        /* =================================================
           RELOAD REAL GOOGLE SHEET DATA
        ================================================= */

        await loadReviews();

    }
    catch (error) {

        console.error(
            "ELIGIFY REVIEW ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to process review",
            "error"
        );

    }
    finally {

        button.disabled =
            false;


        if (
            !editingReviewId
        ) {

            resetSubmitButton();

        }
        else {

            button.innerHTML = `

                <i class="ri-save-line"></i>

                <span id="submitReviewText">
                    Update Review
                </span>

            `;

        }

    }

}


/* =========================================================
   STAR HTML
========================================================= */

function getStarsHTML(
    rating
) {

    let html =
        "";


    const value =
        normalizeRating(
            rating
        );


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        html +=

            i <= value

            ?

            '<i class="ri-star-fill"></i>'

            :

            '<i class="ri-star-line"></i>';

    }


    return html;

}


/* =========================================================
   AVATAR HTML
========================================================= */

function getAvatarHTML(
    review
) {

    const photo =
        review.profilePhoto ||
        review.ProfilePhoto ||
        review.profile_picture ||
        review.profilePicture ||
        review.photo ||
        review.Photo ||
        "";


    const name =
        review.name ||
        review.username ||
        "U";


    if (photo) {

        return `

            <img
                src="${escapeAttribute(photo)}"
                alt="Profile photo"
                onerror="
                    this.style.display='none';
                    this.parentElement.textContent='${escapeAttribute(
                        getInitial(name)
                    )}';
                "
            >

        `;

    }


    return escapeHTML(
        getInitial(name)
    );

}


/* =========================================================
   GET INITIAL
========================================================= */

function getInitial(
    name
) {

    const value =
        String(
            name || "U"
        ).trim();


    return (

        value.charAt(0) ||
        "U"

    ).toUpperCase();

}


/* =========================================================
   NORMALIZE RATING
========================================================= */

function normalizeRating(
    value
) {

    const rating =
        Number(value);


    if (
        Number.isNaN(rating) ||
        rating < 1 ||
        rating > 5
    ) {

        return 0;

    }


    return Math.round(
        rating
    );

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
    value
) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();

}


/* =========================================================
   GET TIME
========================================================= */

function getTime(
    value
) {

    const date =
        parseReviewDate(
            value
        );


    if (!date) {

        return 0;

    }


    return date.getTime();

}


/* =========================================================
   PARSE DATE
========================================================= */

function parseReviewDate(
    value
) {

    if (!value) {

        return null;

    }


    if (
        value instanceof Date
    ) {

        return Number.isNaN(
            value.getTime()
        )
            ? null
            : value;

    }


    const text =
        String(
            value
        ).trim();


    if (!text) {

        return null;

    }


    /* =====================================================
       GOOGLE SHEETS SERIAL DATE
    ===================================================== */

    if (
        /^\d+(\.\d+)?$/.test(
            text
        )
    ) {

        const serial =
            Number(text);


        if (
            serial > 20000 &&
            serial < 100000
        ) {

            const base =
                new Date(
                    Date.UTC(
                        1899,
                        11,
                        30
                    )
                );


            base.setUTCDate(
                base.getUTCDate() +
                Math.floor(
                    serial
                )
            );


            return base;

        }

    }


    const date =
        new Date(
            text
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatReviewDate(
    value
) {

    const date =
        parseReviewDate(
            value
        );


    if (!date) {

        return "Recently";

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"

        }
    );

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
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
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
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    const icon =
        document.getElementById(
            "toastIcon"
        );


    if (
        !toast ||
        !messageElement
    ) {

        return;

    }


    messageElement.textContent =
        message;


    if (icon) {

        icon.className =

            type === "error"

            ?

            "ri-error-warning-line"

            :

            "ri-check-line";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.reviewToastTimer
    );


    window.reviewToastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.goBack =
    goBack;

window.submitReview =
    submitReview;

window.editReview =
    editReview;

window.cancelEditReview =
    cancelEditReview;

window.cancelEdit =
    cancelEdit;