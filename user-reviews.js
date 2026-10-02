/* =========================================================
   ELIGIFY
   ADMIN USER REVIEWS
   ---------------------------------------------------------
   REAL GOOGLE SHEETS REVIEWS
   NO DUMMY DATA
   NO FALLBACK DATA
   NO ALERT POPUPS

   FEATURES
   1. Load all reviews
   2. Search
   3. Rating filter
   4. Statistics
   5. View details
   6. Approve
   7. Reject
   8. Admin reply
   9. Delete
   10. Refresh
   11. Retry
   12. Logout
   13. Modal controls
   14. Toast messages
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* =========================================================
   GLOBAL STATE
========================================================= */

let allReviews = [];
let filteredReviews = [];
let selectedReview = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const reviewsContainer =
    document.getElementById("reviewsContainer");

const reviewsLoading =
    document.getElementById("reviewsLoading");

const reviewsError =
    document.getElementById("reviewsError");

const reviewsErrorMessage =
    document.getElementById("reviewsErrorMessage");

const retryReviewsBtn =
    document.getElementById("retryReviewsBtn");

const emptyReviews =
    document.getElementById("emptyReviews");

const reviewSearch =
    document.getElementById("reviewSearch");

const ratingFilter =
    document.getElementById("ratingFilter");

const refreshReviewsBtn =
    document.getElementById("refreshReviewsBtn");


/* =========================================================
   STATISTICS
========================================================= */

const totalReviews =
    document.getElementById("totalReviews");

const averageRating =
    document.getElementById("averageRating");

const fiveStarReviews =
    document.getElementById("fiveStarReviews");

const todayReviews =
    document.getElementById("todayReviews");


/* =========================================================
   REVIEW DETAILS MODAL
========================================================= */

const reviewModal =
    document.getElementById("reviewModal");

const closeReviewModal =
    document.getElementById("closeReviewModal");

const reviewDetails =
    document.getElementById("reviewDetails");


/* =========================================================
   REPLY MODAL
========================================================= */

const replyReviewModal =
    document.getElementById("replyReviewModal");

const closeReplyModal =
    document.getElementById("closeReplyModal");

const replyUserPreview =
    document.getElementById("replyUserPreview");

const replyReviewForm =
    document.getElementById("replyReviewForm");

const replyReviewId =
    document.getElementById("replyReviewId");

const adminReply =
    document.getElementById("adminReply");

const replyCharacterCount =
    document.getElementById("replyCharacterCount");

const cancelReplyBtn =
    document.getElementById("cancelReplyBtn");

const saveReplyBtn =
    document.getElementById("saveReplyBtn");


/* =========================================================
   DELETE MODAL
========================================================= */

const deleteReviewModal =
    document.getElementById("deleteReviewModal");

const cancelReviewDelete =
    document.getElementById("cancelReviewDelete");

const confirmReviewDelete =
    document.getElementById("confirmReviewDelete");


/* =========================================================
   LOGOUT
========================================================= */

const logoutBtn =
    document.getElementById("logoutBtn");

const logoutModal =
    document.getElementById("logoutModal");

const cancelLogout =
    document.getElementById("cancelLogout");

const confirmLogout =
    document.getElementById("confirmLogout");


/* =========================================================
   TOAST
========================================================= */

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupEvents();

        loadRealReviews();

    }
);


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEvents() {

    /* SEARCH */

    if (reviewSearch) {

        reviewSearch.addEventListener(
            "input",
            applyFilters
        );

    }


    /* RATING FILTER */

    if (ratingFilter) {

        ratingFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    /* REFRESH */

    if (refreshReviewsBtn) {

        refreshReviewsBtn.addEventListener(
            "click",
            function () {

                loadRealReviews();

            }
        );

    }


    /* RETRY */

    if (retryReviewsBtn) {

        retryReviewsBtn.addEventListener(
            "click",
            function () {

                loadRealReviews();

            }
        );

    }


    /* DETAILS CLOSE */

    if (closeReviewModal) {

        closeReviewModal.addEventListener(
            "click",
            closeReviewDetails
        );

    }


    /* REPLY CLOSE */

    if (closeReplyModal) {

        closeReplyModal.addEventListener(
            "click",
            closeReplyModalWindow
        );

    }


    /* REPLY CANCEL */

    if (cancelReplyBtn) {

        cancelReplyBtn.addEventListener(
            "click",
            closeReplyModalWindow
        );

    }


    /* REPLY FORM */

    if (replyReviewForm) {

        replyReviewForm.addEventListener(
            "submit",
            submitAdminReply
        );

    }


    /* REPLY CHARACTER COUNT */

    if (adminReply) {

        adminReply.addEventListener(
            "input",
            updateReplyCharacterCount
        );

    }


    /* DELETE CANCEL */

    if (cancelReviewDelete) {

        cancelReviewDelete.addEventListener(
            "click",
            closeDeleteModal
        );

    }


    /* DELETE CONFIRM */

    if (confirmReviewDelete) {

        confirmReviewDelete.addEventListener(
            "click",
            confirmDeleteReview
        );

    }


    /* LOGOUT */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (cancelLogout) {

        cancelLogout.addEventListener(
            "click",
            closeLogoutModal
        );

    }


    if (confirmLogout) {

        confirmLogout.addEventListener(
            "click",
            logoutAdmin
        );

    }


    /* =====================================================
       CLICK OUTSIDE MODALS
    ===================================================== */

    window.addEventListener(
        "click",
        function (event) {

            if (
                event.target === reviewModal
            ) {

                closeReviewDetails();

            }


            if (
                event.target === replyReviewModal
            ) {

                closeReplyModalWindow();

            }


            if (
                event.target === deleteReviewModal
            ) {

                closeDeleteModal();

            }


            if (
                event.target === logoutModal
            ) {

                closeLogoutModal();

            }

        }
    );


    /* =====================================================
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeReviewDetails();

                closeReplyModalWindow();

                closeDeleteModal();

                closeLogoutModal();

            }

        }
    );

}


/* =========================================================
   LOAD REAL REVIEWS
========================================================= */

async function loadRealReviews() {

    showLoading();


    try {

        const response =
            await fetch(
                API_URL +
                "?type=reviews&admin=true&_=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to connect to reviews server."
            );

        }


        const data =
            await response.json();


        /*
           Support both:

           [
               {...},
               {...}
           ]

           AND

           {
               reviews: [...]
           }
        */

        let reviewArray = [];


        if (
            Array.isArray(data)
        ) {

            reviewArray = data;

        }
        else if (
            data &&
            Array.isArray(data.reviews)
        ) {

            reviewArray =
                data.reviews;

        }
        else if (
            data &&
            Array.isArray(data.data)
        ) {

            reviewArray =
                data.data;

        }
        else {

            throw new Error(
                "Invalid reviews data received."
            );

        }


        allReviews =
            reviewArray.map(
                normalizeReview
            );


        filteredReviews =
            [...allReviews];


        updateStatistics();

        applyFilters();

        hideLoading();

        hideError();


        if (
            allReviews.length === 0
        ) {

            showEmptyState();

        }

    }
    catch (error) {

        console.error(
            "REVIEWS LOAD ERROR:",
            error
        );


        allReviews = [];

        filteredReviews = [];


        updateStatistics();

        hideLoading();

        renderReviews([]);


        showError(
            error.message ||
            "Unable to load reviews."
        );

    }

}


/* =========================================================
   NORMALIZE REVIEW
========================================================= */

function normalizeReview(review) {

    const safeReview =
        review || {};


    return {

        id:
            String(
                safeReview.id ??
                safeReview.ID ??
                safeReview.reviewId ??
                safeReview.ReviewId ??
                ""
            ).trim(),


        userId:
            String(
                safeReview.userId ??
                safeReview.UserId ??
                safeReview.userID ??
                safeReview.UserID ??
                ""
            ).trim(),


        username:
            String(
                safeReview.username ??
                safeReview.Username ??
                ""
            ).trim(),


        name:
            String(
                safeReview.name ??
                safeReview.Name ??
                safeReview.fullName ??
                safeReview.FullName ??
                "Eligify User"
            ).trim(),


        email:
            String(
                safeReview.email ??
                safeReview.Email ??
                ""
            ).trim(),


        rating:
            normalizeRating(
                safeReview.rating ??
                safeReview.Rating
            ),


        review:
            String(
                safeReview.review ??
                safeReview.Review ??
                safeReview.comment ??
                safeReview.Comment ??
                ""
            ).trim(),


        status:
            String(
                safeReview.status ??
                safeReview.Status ??
                "Pending"
            ).trim(),


        createdAt:
            safeReview.createdAt ??
            safeReview.CreatedAt ??
            safeReview.date ??
            safeReview.Date ??
            "",


        updatedAt:
            safeReview.updatedAt ??
            safeReview.UpdatedAt ??
            "",


        profilePhoto:
            String(
                safeReview.profilePhoto ??
                safeReview.ProfilePhoto ??
                safeReview.photo ??
                safeReview.Photo ??
                ""
            ).trim(),


        adminReply:
            String(
                safeReview.adminReply ??
                safeReview.AdminReply ??
                safeReview.reply ??
                safeReview.Reply ??
                ""
            ).trim(),


        adminReplyAt:
            safeReview.adminReplyAt ??
            safeReview.AdminReplyAt ??
            ""

    };

}


/* =========================================================
   NORMALIZE RATING
========================================================= */

function normalizeRating(value) {

    const rating =
        Number(value);


    if (
        Number.isNaN(rating)
    ) {

        return 0;

    }


    return Math.min(
        5,
        Math.max(
            0,
            rating
        )
    );

}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    const search =
        String(
            reviewSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const selectedRating =
        String(
            ratingFilter?.value ||
            "All"
        );


    filteredReviews =
        allReviews.filter(
            function (review) {

                const searchableText = [

                    review.name,

                    review.username,

                    review.email,

                    review.userId,

                    review.review,

                    review.status,

                    review.adminReply

                ]
                .join(" ")
                .toLowerCase();


                const searchMatch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const ratingMatch =
                    selectedRating === "All" ||
                    String(
                        review.rating
                    ) === selectedRating;


                return (
                    searchMatch &&
                    ratingMatch
                );

            }
        );


    renderReviews(
        filteredReviews
    );

}


/* =========================================================
   RENDER REVIEWS
========================================================= */

function renderReviews(
    reviews
) {

    if (!reviewsContainer) {

        return;

    }


    reviewsContainer.innerHTML = "";


    if (
        !Array.isArray(reviews) ||
        reviews.length === 0
    ) {

        reviewsContainer.style.display =
            "none";


        if (emptyReviews) {

            emptyReviews.style.display =
                "flex";

        }

        return;

    }


    if (emptyReviews) {

        emptyReviews.style.display =
            "none";

    }


    reviewsContainer.style.display =
        "grid";


    reviews.forEach(
        function (review, index) {

            const card =
                createReviewCard(
                    review,
                    index
                );


            reviewsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CREATE REVIEW CARD
========================================================= */

function createReviewCard(
    review,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "review-card";


    const initials =
        getInitials(
            review.name
        );


    const stars =
        createStars(
            review.rating
        );


    const status =
        review.status ||
        "Pending";


    const statusClass =
        getStatusClass(
            status
        );


    const normalizedStatus =
        String(
            status
        )
        .trim()
        .toLowerCase();


    let moderationButtons =
        "";


    /* =====================================================
       MODERATION BUTTONS
    ===================================================== */

    if (
        normalizedStatus !==
        "approved" &&
        normalizedStatus !==
        "rejected"
    ) {

        moderationButtons = `

            <button
                type="button"
                class="review-action-btn approve"
                onclick="approveReview(${index})"
                title="Approve Review"
            >
                <i class="ri-check-line"></i>
            </button>

            <button
                type="button"
                class="review-action-btn reject"
                onclick="rejectReview(${index})"
                title="Reject Review"
            >
                <i class="ri-close-line"></i>
            </button>

        `;

    }
    else if (
        normalizedStatus ===
        "approved"
    ) {

        moderationButtons = `

            <button
                type="button"
                class="review-action-btn reject"
                onclick="rejectReview(${index})"
                title="Reject Review"
            >
                <i class="ri-close-line"></i>
            </button>

        `;

    }
    else {

        moderationButtons = `

            <button
                type="button"
                class="review-action-btn approve"
                onclick="approveReview(${index})"
                title="Approve Review"
            >
                <i class="ri-check-line"></i>
            </button>

        `;

    }


    /* =====================================================
       ADMIN REPLY
    ===================================================== */

    const replyPreview =
        review.adminReply
            ? `

                <div class="admin-reply-preview">

                    <strong>
                        <i class="ri-reply-line"></i>
                        Admin Reply
                    </strong>

                    <p>
                        ${escapeHTML(
                            review.adminReply
                        )}
                    </p>

                </div>

              `
            : "";


    /* =====================================================
       PROFILE IMAGE
    ===================================================== */

    const avatarHTML =
        review.profilePhoto
            ? `

                <img
                    src="${escapeHTML(
                        review.profilePhoto
                    )}"
                    alt="${escapeHTML(
                        review.name
                    )}"
                    onerror="this.style.display='none';this.parentElement.classList.add('avatar-fallback');this.parentElement.textContent='${escapeHTML(initials)}';"
                >

              `
            : escapeHTML(
                initials
            );


    /* =====================================================
       CARD HTML
    ===================================================== */

    card.innerHTML = `

        <div class="review-top">

            <div class="review-user">

                <div class="user-avatar">

                    ${avatarHTML}

                </div>


                <div class="user-info">

                    <h3>
                        ${escapeHTML(
                            review.name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            review.email ||
                            "No email"
                        )}
                    </p>

                </div>

            </div>


            <div class="review-rating">

                <div class="stars">
                    ${stars}
                </div>

                <span class="rating-number">
                    ${review.rating}/5
                </span>

            </div>

        </div>


        <div class="review-message">

            ${escapeHTML(
                review.review ||
                "No review text"
            )}

        </div>


        ${replyPreview}


        <div class="review-meta">

            <span
                class="review-status ${statusClass}"
            >
                ${escapeHTML(
                    status
                )}
            </span>


            <span class="review-date">

                <i class="ri-calendar-line"></i>

                ${escapeHTML(
                    formatDate(
                        review.createdAt
                    )
                )}

            </span>

        </div>


        <div class="review-footer">

            <div class="review-user-id">

                ${
                    review.userId
                    ? `
                        User ID:
                        ${escapeHTML(
                            review.userId
                        )}
                      `
                    : ""
                }

            </div>


            <div class="review-actions">

                ${moderationButtons}


                <button
                    type="button"
                    class="review-action-btn"
                    onclick="viewReview(${index})"
                    title="View Review"
                >
                    <i class="ri-eye-line"></i>
                </button>


                <button
                    type="button"
                    class="review-action-btn"
                    onclick="openReplyReview(${index})"
                    title="Reply to Review"
                >
                    <i class="ri-reply-line"></i>
                </button>


                <button
                    type="button"
                    class="review-action-btn delete"
                    onclick="openDeleteReview(${index})"
                    title="Delete Review"
                >
                    <i class="ri-delete-bin-line"></i>
                </button>

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   APPROVE
========================================================= */

async function approveReview(
    index
) {

    const review =
        filteredReviews[index];


    if (
        !review ||
        !review.id
    ) {

        showToast(
            "Review ID not found.",
            "error"
        );

        return;

    }


    await updateReviewModeration(
        review,
        "Approved"
    );

}


/* =========================================================
   REJECT
========================================================= */

async function rejectReview(
    index
) {

    const review =
        filteredReviews[index];


    if (
        !review ||
        !review.id
    ) {

        showToast(
            "Review ID not found.",
            "error"
        );

        return;

    }


    await updateReviewModeration(
        review,
        "Rejected"
    );

}


/* =========================================================
   UPDATE MODERATION
========================================================= */

async function updateReviewModeration(
    review,
    status
) {

    try {

        showToast(
            status === "Approved"
                ? "Approving review..."
                : "Rejecting review...",
            "success"
        );


        const action =
            status === "Approved"
                ? "approveReview"
                : "rejectReview";


        const response =
            await postToGoogleScript({

                action: action,

                id: review.id

            });


        if (
            !response.success
        ) {

            throw new Error(
                response.error ||
                "Unable to update review."
            );

        }


        /*
           Reload from Google Sheet.
           This keeps dashboard and sheet
           completely synchronized.
        */

        await loadRealReviews();


        showToast(
            status === "Approved"
                ? "Review approved successfully."
                : "Review rejected successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "MODERATION ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to update review.",
            "error"
        );

    }

}


/* =========================================================
   VIEW REVIEW
========================================================= */

function viewReview(
    index
) {

    const review =
        filteredReviews[index];


    if (!review) {

        return;

    }


    selectedReview =
        review;


    if (!reviewDetails) {

        return;

    }


    const status =
        review.status ||
        "Pending";


    const adminReplyHTML =
        review.adminReply
            ? `

                <div class="detail-message-wrapper">

                    <span class="detail-label">
                        Admin Reply
                    </span>

                    <div class="detail-message">
                        ${escapeHTML(
                            review.adminReply
                        )}
                    </div>

                    ${
                        review.adminReplyAt
                        ? `
                            <small>
                                Replied:
                                ${escapeHTML(
                                    formatDate(
                                        review.adminReplyAt
                                    )
                                )}
                            </small>
                          `
                        : ""
                    }

                </div>

              `
            : "";


    reviewDetails.innerHTML = `

        <div class="detail-row">

            <span class="detail-label">
                Name
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    review.name
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Username
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    review.username ||
                    "Not available"
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Email
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    review.email ||
                    "Not available"
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                User ID
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    review.userId ||
                    "Not available"
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Rating
            </span>

            <span class="detail-value">

                <span class="stars">
                    ${createStars(
                        review.rating
                    )}
                </span>

                &nbsp;

                ${review.rating}/5

            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Status
            </span>

            <span class="detail-value">

                <span
                    class="review-status ${getStatusClass(
                        status
                    )}"
                >
                    ${escapeHTML(
                        status
                    )}
                </span>

            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Submitted
            </span>

            <span class="detail-value">

                ${escapeHTML(
                    formatDate(
                        review.createdAt
                    )
                )}

            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Last Updated
            </span>

            <span class="detail-value">

                ${
                    review.updatedAt
                    ? escapeHTML(
                        formatDate(
                            review.updatedAt
                        )
                    )
                    : "Not updated"
                }

            </span>

        </div>


        <div class="detail-message-wrapper">

            <span class="detail-label">
                Review
            </span>

            <div class="detail-message">

                ${escapeHTML(
                    review.review ||
                    "No review text"
                )}

            </div>

        </div>


        ${adminReplyHTML}

    `;


    reviewModal?.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeReviewDetails() {

    reviewModal?.classList.remove(
        "show"
    );

}


/* =========================================================
   OPEN REPLY
========================================================= */

function openReplyReview(
    index
) {

    const review =
        filteredReviews[index];


    if (!review) {

        return;

    }


    selectedReview =
        review;


    if (replyReviewId) {

        replyReviewId.value =
            review.id;

    }


    if (replyUserPreview) {

        const initials =
            getInitials(
                review.name
            );


        const avatar =
            review.profilePhoto
                ? `

                    <img
                        src="${escapeHTML(
                            review.profilePhoto
                        )}"
                        alt="${escapeHTML(
                            review.name
                        )}"
                        onerror="this.style.display='none';this.parentElement.textContent='${escapeHTML(initials)}';"
                    >

                  `
                : escapeHTML(
                    initials
                );


        replyUserPreview.innerHTML = `

            <div class="user-avatar">

                ${avatar}

            </div>


            <div>

                <h3>
                    ${escapeHTML(
                        review.name
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        review.email ||
                        "No email"
                    )}
                </p>

            </div>

        `;

    }


    if (adminReply) {

        adminReply.value =
            review.adminReply ||
            "";

    }


    updateReplyCharacterCount();


    replyReviewModal?.classList.add(
        "show"
    );


    setTimeout(
        function () {

            adminReply?.focus();

        },
        100
    );

}


/* =========================================================
   CLOSE REPLY
========================================================= */

function closeReplyModalWindow() {

    replyReviewModal?.classList.remove(
        "show"
    );


    if (replyReviewForm) {

        replyReviewForm.reset();

    }


    if (replyReviewId) {

        replyReviewId.value =
            "";

    }


    if (replyCharacterCount) {

        replyCharacterCount.textContent =
            "0";

    }


    selectedReview =
        null;

}


/* =========================================================
   CHARACTER COUNT
========================================================= */

function updateReplyCharacterCount() {

    if (
        !adminReply ||
        !replyCharacterCount
    ) {

        return;

    }


    replyCharacterCount.textContent =
        adminReply.value.length;

}


/* =========================================================
   SUBMIT ADMIN REPLY
========================================================= */

async function submitAdminReply(
    event
) {

    event.preventDefault();


    const id =
        String(
            replyReviewId?.value ||
            selectedReview?.id ||
            ""
        ).trim();


    const reply =
        String(
            adminReply?.value ||
            ""
        ).trim();


    if (!id) {

        showToast(
            "Review ID not found.",
            "error"
        );

        return;

    }


    if (!reply) {

        showToast(
            "Please enter a reply.",
            "error"
        );

        return;

    }


    if (
        reply.length > 500
    ) {

        showToast(
            "Reply must be 500 characters or less.",
            "error"
        );

        return;

    }


    try {

        if (saveReplyBtn) {

            saveReplyBtn.disabled =
                true;


            saveReplyBtn.innerHTML = `

                <i class="ri-loader-4-line ri-spin"></i>

                Sending...

            `;

        }


        const data =
            await postToGoogleScript({

                action:
                    "replyReview",

                id:
                    id,

                reply:
                    reply

            });


        if (
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Unable to save reply."
            );

        }


        closeReplyModalWindow();


        await loadRealReviews();


        showToast(
            "Reply sent successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "REPLY ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to send reply.",
            "error"
        );

    }
    finally {

        if (saveReplyBtn) {

            saveReplyBtn.disabled =
                false;


            saveReplyBtn.innerHTML = `

                <i class="ri-send-plane-line"></i>

                Send Reply

            `;

        }

    }

}


/* =========================================================
   OPEN DELETE MODAL
========================================================= */

function openDeleteReview(
    index
) {

    const review =
        filteredReviews[index];


    if (!review) {

        return;

    }


    selectedReview =
        review;


    deleteReviewModal?.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal() {

    deleteReviewModal?.classList.remove(
        "show"
    );

}


/* =========================================================
   DELETE REVIEW
========================================================= */

async function confirmDeleteReview() {

    if (!selectedReview) {

        closeDeleteModal();

        return;

    }


    const reviewId =
        String(
            selectedReview.id ||
            ""
        ).trim();


    if (!reviewId) {

        showToast(
            "Review ID not found.",
            "error"
        );

        closeDeleteModal();

        return;

    }


    try {

        if (confirmReviewDelete) {

            confirmReviewDelete.disabled =
                true;


            confirmReviewDelete.innerHTML = `

                <i class="ri-loader-4-line ri-spin"></i>

                Deleting...

            `;

        }


        const data =
            await postToGoogleScript({

                action:
                    "deleteReview",

                id:
                    reviewId

            });


        if (
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Unable to delete review."
            );

        }


        selectedReview =
            null;


        closeDeleteModal();


        await loadRealReviews();


        showToast(
            "Review deleted successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "DELETE REVIEW ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to delete review.",
            "error"
        );

    }
    finally {

        if (confirmReviewDelete) {

            confirmReviewDelete.disabled =
                false;


            confirmReviewDelete.innerHTML = `

                <i class="ri-delete-bin-line"></i>

                Delete

            `;

        }

    }

}


/* =========================================================
   POST TO GOOGLE APPS SCRIPT
========================================================= */

async function postToGoogleScript(
    payload
) {

    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                /*
                   text/plain avoids the CORS
                   preflight problem with Apps Script.
                */

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
            "Server returned " +
            response.status
        );

    }


    const text =
        await response.text();


    let data;


    try {

        data =
            JSON.parse(
                text
            );

    }
    catch (error) {

        console.error(
            "INVALID SERVER RESPONSE:",
            text
        );


        throw new Error(
            "Invalid response from server."
        );

    }


    return data;

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "approved"
    ) {

        return "status-approved";

    }


    if (
        value === "rejected"
    ) {

        return "status-rejected";

    }


    return "status-pending";

}


/* =========================================================
   CREATE STARS
========================================================= */

function createStars(
    rating
) {

    const numericRating =
        normalizeRating(
            rating
        );


    let html = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        if (
            i <= numericRating
        ) {

            html +=
                '<i class="ri-star-fill"></i>';

        }
        else {

            html +=
                '<i class="ri-star-line"></i>';

        }

    }


    return html;

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(
    name
) {

    const value =
        String(
            name || ""
        ).trim();


    if (!value) {

        return "U";

    }


    const words =
        value.split(
            /\s+/
        );


    if (
        words.length >= 2
    ) {

        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();

    }


    return value
        .substring(
            0,
            2
        )
        .toUpperCase();

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        allReviews.length;


    const validRatings =
        allReviews
            .map(
                function (review) {

                    return Number(
                        review.rating
                    );

                }
            )
            .filter(
                function (rating) {

                    return (
                        rating >= 1 &&
                        rating <= 5
                    );

                }
            );


    const average =
        validRatings.length > 0
            ? validRatings.reduce(
                function (
                    sum,
                    rating
                ) {

                    return (
                        sum +
                        rating
                    );

                },
                0
            ) /
            validRatings.length
            : 0;


    const fiveStars =
        allReviews.filter(
            function (review) {

                return (
                    Number(
                        review.rating
                    ) === 5
                );

            }
        ).length;


    const today =
        allReviews.filter(
            function (review) {

                return isToday(
                    review.createdAt
                );

            }
        ).length;


    if (totalReviews) {

        totalReviews.textContent =
            total;

    }


    if (averageRating) {

        averageRating.textContent =
            average.toFixed(1);

    }


    if (fiveStarReviews) {

        fiveStarReviews.textContent =
            fiveStars;

    }


    if (todayReviews) {

        todayReviews.textContent =
            today;

    }

}


/* =========================================================
   CHECK TODAY
========================================================= */

function isToday(
    value
) {

    const date =
        parseDate(
            value
        );


    if (!date) {

        return false;

    }


    const now =
        new Date();


    return (
        date.getFullYear() ===
        now.getFullYear()

        &&

        date.getMonth() ===
        now.getMonth()

        &&

        date.getDate() ===
        now.getDate()
    );

}


/* =========================================================
   DATE PARSER
========================================================= */

function parseDate(
    value
) {

    if (!value) {

        return null;

    }


    if (
        value instanceof Date &&
        !Number.isNaN(
            value.getTime()
        )
    ) {

        return value;

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

            const date =
                new Date(
                    Date.UTC(
                        1899,
                        11,
                        30
                    )
                );


            date.setUTCDate(
                date.getUTCDate() +
                Math.floor(
                    serial
                )
            );


            const fraction =
                serial -
                Math.floor(
                    serial
                );


            date.setTime(
                date.getTime() +
                fraction *
                24 *
                60 *
                60 *
                1000
            );


            return date;

        }

    }


    /* =====================================================
       NORMAL DATE
    ===================================================== */

    const date =
        new Date(
            text
        );


    if (
        !Number.isNaN(
            date.getTime()
        )
    ) {

        return date;

    }


    return null;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    const date =
        parseDate(
            value
        );


    if (!date) {

        return "Date unavailable";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
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
   SHOW LOADING
========================================================= */

function showLoading() {

    if (reviewsLoading) {

        reviewsLoading.style.display =
            "flex";

    }


    if (reviewsContainer) {

        reviewsContainer.style.display =
            "none";

    }


    if (emptyReviews) {

        emptyReviews.style.display =
            "none";

    }


    hideError();

}


/* =========================================================
   HIDE LOADING
========================================================= */

function hideLoading() {

    if (reviewsLoading) {

        reviewsLoading.style.display =
            "none";

    }

}


/* =========================================================
   SHOW EMPTY
========================================================= */

function showEmptyState() {

    if (reviewsContainer) {

        reviewsContainer.style.display =
            "none";

    }


    if (emptyReviews) {

        emptyReviews.style.display =
            "flex";

    }

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(
    message
) {

    if (reviewsErrorMessage) {

        reviewsErrorMessage.textContent =
            message;

    }


    if (reviewsError) {

        reviewsError.style.display =
            "flex";

    }


    if (reviewsContainer) {

        reviewsContainer.style.display =
            "none";

    }


    if (emptyReviews) {

        emptyReviews.style.display =
            "none";

    }

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideError() {

    if (reviewsError) {

        reviewsError.style.display =
            "none";

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    if (!toast) {

        return;

    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    if (toastIcon) {

        toastIcon.className =
            type === "error"
                ? "ri-error-warning-line"
                : "ri-checkbox-circle-line";

    }


    toast.classList.remove(
        "success",
        "error"
    );


    toast.classList.add(
        type
    );


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
   LOGOUT MODAL
========================================================= */

function openLogoutModal() {

    logoutModal?.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE LOGOUT
========================================================= */

function closeLogoutModal() {

    logoutModal?.classList.remove(
        "show"
    );

}


/* =========================================================
   ADMIN LOGOUT
========================================================= */

function logoutAdmin() {

    localStorage.removeItem(
        "eligifyAdmin"
    );


    localStorage.removeItem(
        "adminLoggedIn"
    );


    sessionStorage.removeItem(
        "eligifyAdmin"
    );


    sessionStorage.removeItem(
        "adminLoggedIn"
    );


    window.location.href =
        "admin-login.html";

}


/* =========================================================
   GLOBAL FUNCTIONS
   Required by onclick=""
========================================================= */

window.viewReview =
    viewReview;

window.approveReview =
    approveReview;

window.rejectReview =
    rejectReview;

window.openReplyReview =
    openReplyReview;

window.openDeleteReview =
    openDeleteReview;

window.closeReviewDetails =
    closeReviewDetails;

window.closeReplyModalWindow =
    closeReplyModalWindow;

window.closeDeleteModal =
    closeDeleteModal;

window.openLogoutModal =
    openLogoutModal;

window.closeLogoutModal =
    closeLogoutModal;