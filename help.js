/* =========================================================
   ELIGIFY — HELP & SUPPORT
   ========================================================= */


/* =========================================================
   GO BACK
   ========================================================= */

function goBack() {
    window.location.href = "profile.html";
}


/* =========================================================
   QUICK HELP CONTENT
   ========================================================= */

const quickHelpData = {

    eligibility: {
        icon: "ri-checkbox-circle-line",
        title: "Check your eligibility",
        text: "Open Smart Eligibility and complete your profile with accurate academic and personal details. Make sure your course, year, marks, state, community and income information are entered correctly before submitting."
    },

    matching: {
        icon: "ri-sparkling-2-line",
        title: "Understand scholarship matching",
        text: "Eligify compares the information in your eligibility profile with the requirements of available scholarships. Scholarships are matched using relevant eligibility factors such as course, marks, income, state and other applicable criteria."
    },

    results: {
        icon: "ri-search-eye-line",
        title: "View scholarship results",
        text: "After completing your eligibility check, you can explore your scholarship results. Review the scholarship name, provider, eligibility information, amount, deadline and application details before applying."
    },

    saved: {
        icon: "ri-heart-3-line",
        title: "Save scholarships",
        text: "Use the heart icon on a scholarship to save it for later. Your saved scholarships can be accessed from the Saved section of your account."
    },

    history: {
        icon: "ri-history-line",
        title: "View eligibility history",
        text: "Your completed eligibility checks are stored in History. You can revisit previous checks and review the scholarship results associated with them."
    }

};


/* =========================================================
   SHOW QUICK HELP
   ========================================================= */

function showHelp(type) {

    const detail = document.getElementById("quickHelpDetail");

    if (!detail) return;

    const data = quickHelpData[type];

    if (!data) return;


    /* If same item is clicked again, close it */

    if (
        detail.classList.contains("show") &&
        detail.dataset.type === type
    ) {
        closeHelp();
        return;
    }


    detail.dataset.type = type;


    detail.innerHTML = `
        <div class="quick-help-detail-content">

            <div class="quick-help-detail-icon">
                <i class="${data.icon}"></i>
            </div>

            <div class="quick-help-detail-text">

                <h3>${data.title}</h3>

                <p>${data.text}</p>

            </div>

            <button
                type="button"
                class="quick-help-close"
                onclick="closeHelp()"
                aria-label="Close">

                <i class="ri-close-line"></i>

            </button>

        </div>
    `;


    detail.classList.add("show");


    /* Scroll gently to the opened content */

    setTimeout(() => {

        detail.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }, 80);


    /* Mark selected quick-help item */

    document.querySelectorAll(".help-row").forEach(row => {
        row.classList.remove("selected");
    });


    const selectedRow =
        document.querySelector(
            `.help-row[onclick="showHelp('${type}')"]`
        );

    if (selectedRow) {
        selectedRow.classList.add("selected");
    }

}


/* =========================================================
   CLOSE QUICK HELP
   ========================================================= */

function closeHelp() {

    const detail =
        document.getElementById("quickHelpDetail");

    if (!detail) return;


    detail.classList.remove("show");

    detail.removeAttribute("data-type");


    document.querySelectorAll(".help-row").forEach(row => {
        row.classList.remove("selected");
    });


    setTimeout(() => {

        if (!detail.classList.contains("show")) {
            detail.innerHTML = "";
        }

    }, 250);

}


/* =========================================================
   FAQ TOGGLE
   ========================================================= */

function toggleFAQ(button) {

    const currentItem =
        button.closest(".faq-item");

    if (!currentItem) return;


    const currentAnswer =
        currentItem.querySelector(".faq-answer");

    const currentIcon =
        button.querySelector("i");


    if (!currentAnswer) return;


    /* Close all other FAQ items */

    document.querySelectorAll(".faq-item").forEach(item => {

        if (item !== currentItem) {

            item.classList.remove("active");


            const answer =
                item.querySelector(".faq-answer");

            const icon =
                item.querySelector(".faq-question i");


            if (answer) {
                answer.style.maxHeight = null;
            }


            if (icon) {
                icon.className = "ri-add-line";
            }

        }

    });


    /* Toggle selected FAQ */

    const isOpen =
        currentItem.classList.contains("active");


    if (isOpen) {

        currentItem.classList.remove("active");

        currentAnswer.style.maxHeight = null;

        if (currentIcon) {
            currentIcon.className = "ri-add-line";
        }

    } else {

        currentItem.classList.add("active");

        currentAnswer.style.maxHeight =
            currentAnswer.scrollHeight + "px";

        if (currentIcon) {
            currentIcon.className = "ri-subtract-line";
        }

    }

}


/* =========================================================
   CONTACT SUPPORT
   ========================================================= */

function contactSupport() {

    window.location.href =
        "mailto:eligify.support@gmail.com?subject=Eligify%20Support";

}


/* =========================================================
   CLOSE FAQ WITH ESCAPE
   ========================================================= */

function closeAllFAQs() {

    document
        .querySelectorAll(".faq-item.active")
        .forEach(item => {

            item.classList.remove("active");


            const answer =
                item.querySelector(".faq-answer");

            const icon =
                item.querySelector(".faq-question i");


            if (answer) {
                answer.style.maxHeight = null;
            }


            if (icon) {
                icon.className = "ri-add-line";
            }

        });

}


/* =========================================================
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeAllFAQs();

        closeHelp();

    }

});


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* Keep FAQ answers closed initially */

    document
        .querySelectorAll(".faq-answer")
        .forEach(answer => {

            answer.style.maxHeight = null;

        });


    /* Prevent button focus from causing unwanted outline */

    document
        .querySelectorAll(".help-row, .faq-question")
        .forEach(button => {

            button.addEventListener("click", function () {
                this.blur();
            });

        });

});