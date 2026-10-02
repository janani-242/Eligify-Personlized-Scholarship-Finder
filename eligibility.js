const RESULTS_PAGE = "results.html";

const GAS_API_URL =
    "https://script.google.com/macros/s/AKfycbynoFho18xt7LOtn0t3r6vsEKg8L2WZAaHF8PRcql5lMMqlIAVP7l1c2OUyki2oUUTJ/exec";


/* ==========================================================
   ELEMENTS
========================================================== */

const form =
    document.getElementById("eligibilityForm");

const steps =
    document.querySelectorAll(".form-step");


/* ==========================================================
   STEP BUTTONS
========================================================== */

const nextStep1 =
    document.getElementById("nextStep1");

const nextStep2 =
    document.getElementById("nextStep2");

const nextStep3 =
    document.getElementById("nextStep3");

const nextStep4 =
    document.getElementById("nextStep4");

const backStep2 =
    document.getElementById("backStep2");

const backStep3 =
    document.getElementById("backStep3");

const backStep4 =
    document.getElementById("backStep4");

const backStep5 =
    document.getElementById("backStep5");


/* ==========================================================
   PROGRESS
========================================================== */

const progressFill =
    document.getElementById("progressFill");

const progressLabel =
    document.getElementById("progressLabel");

const progressStep =
    document.getElementById("progressStep");


/* ==========================================================
   DISCLAIMER
========================================================== */

const disclaimerOverlay =
    document.getElementById("disclaimerOverlay");

const acceptDisclaimer =
    document.getElementById("acceptDisclaimer");

const disclaimerAgreement =
    document.getElementById("disclaimerAgreement");


/* ==========================================================
   PERSONAL DETAILS
========================================================== */

const fullName =
    document.getElementById("fullName");

const age =
    document.getElementById("age");

const gender =
    document.getElementById("gender");

const state =
    document.getElementById("state");

const domicileStatus =
    document.getElementById("domicileStatus");

const citizenship =
    document.getElementById("citizenship");

const disabilityStatus =
    document.getElementById("disabilityStatus");

const residenceType =
    document.getElementById("residenceType");


/* ==========================================================
   EDUCATION
========================================================== */

const educationLevel =
    document.getElementById("educationLevel");

const courseCategory =
    document.getElementById("courseCategory");

const course =
    document.getElementById("course");

const yearOfStudy =
    document.getElementById("yearOfStudy");

const otherCourse =
    document.getElementById("otherCourse");

const otherCourseGroup =
    document.getElementById("otherCourseGroup");

const institutionName =
    document.getElementById("institutionName");

const schoolType =
    document.getElementById("schoolType");

const governmentSchool =
    document.getElementById("governmentSchool");


/* ==========================================================
   ACADEMIC
========================================================== */

const percentage =
    document.getElementById("percentage");

const class10Percentage =
    document.getElementById("class10Percentage");

const class12Percentage =
    document.getElementById("class12Percentage");

const diplomaPercentage =
    document.getElementById("diplomaPercentage");

const ugPercentage =
    document.getElementById("ugPercentage");

const pgPercentage =
    document.getElementById("pgPercentage");

const cgpa =
    document.getElementById("cgpa");

const percentile =
    document.getElementById("percentile");

const previousExamStatus =
    document.getElementById("previousExamStatus");

const firstAttemptPass =
    document.getElementById("firstAttemptPass");

const attendance =
    document.getElementById("attendance");


/* ==========================================================
   FAMILY / ELIGIBILITY
========================================================== */

const community =
    document.getElementById("community");

const ewsStatus =
    document.getElementById("ewsStatus");

const minorityStatus =
    document.getElementById("minorityStatus");

const familyIncome =
    document.getElementById("familyIncome");

const firstGraduate =
    document.getElementById("firstGraduate");

const singleChild =
    document.getElementById("singleChild");

const singleGirlChild =
    document.getElementById("singleGirlChild");

const parentStatus =
    document.getElementById("parentStatus");

const familySupport =
    document.getElementById("familySupport");


/* ==========================================================
   SPECIAL ELIGIBILITY
========================================================== */

const specialCategory =
    document.getElementById("specialCategory");

const entranceQualified =
    document.getElementById("entranceQualified");

const entranceExam =
    document.getElementById("entranceExam");

const examScore =
    document.getElementById("examScore");

const examRank =
    document.getElementById("examRank");

const meritStatus =
    document.getElementById("meritStatus");

const researchStatus =
    document.getElementById("researchStatus");

const portfolioStatus =
    document.getElementById("portfolioStatus");

const interviewStatus =
    document.getElementById("interviewStatus");

const documentAvailability =
    document.getElementById("documentAvailability");


/* ==========================================================
   STEP STATE
========================================================== */

let currentStep = 1;

const TOTAL_STEPS = 5;


/* ==========================================================
   STEP INFORMATION
========================================================== */

const stepInformation = {

    1: {
        label: "Personal Details",
        description:
            "Enter your basic personal information."
    },

    2: {
        label: "Education & Course",
        description:
            "Tell us about your current education and course."
    },

    3: {
        label: "Academic Details",
        description:
            "Provide your academic qualification details."
    },

    4: {
        label: "Family & Eligibility",
        description:
            "Provide your family and scholarship eligibility details."
    },

    5: {
        label: "Special Eligibility",
        description:
            "Add competitive exams, merit and special eligibility details."
    }

};


/* ==========================================================
   COURSE DATABASE
========================================================== */

const courseData = {

    School: {

        categories: {

            "School Education": [
                "Below Class 10",
                "10th",
                "11th",
                "12th"
            ]

        }

    },

    ITI: {

        categories: {

            "Technical Trades": [
                "ITI Computer Operator",
                "ITI Electrician",
                "ITI Fitter",
                "ITI Welder",
                "ITI Mechanic",
                "Other ITI Course"
            ]

        }

    },

    Diploma: {

        categories: {

            Engineering: [
                "Diploma in Computer Engineering",
                "Diploma in Mechanical Engineering",
                "Diploma in Civil Engineering",
                "Diploma in Electrical Engineering",
                "Diploma in Electronics Engineering",
                "Diploma in Automobile Engineering",
                "Diploma in Information Technology",
                "Others"
            ],

            "Medical & Health": [
                "Diploma in Nursing",
                "Diploma in Pharmacy",
                "Diploma in Medical Laboratory Technology",
                "Others"
            ],

            Others: [
                "Other Diploma Course"
            ]

        }

    },

    UG: {

        categories: {

            "Arts & Science": [
                "B.A.",
                "B.Sc. Computer Science",
                "B.Sc. Mathematics",
                "B.Sc. Physics",
                "B.Sc. Chemistry",
                "B.Sc. Biotechnology",
                "B.Sc. Psychology",
                "B.Sc. Microbiology",
                "B.Com.",
                "BBA",
                "BCA",
                "Others"
            ],

            Engineering: [
                "B.E. Computer Science Engineering",
                "B.E. Information Technology",
                "B.E. Mechanical Engineering",
                "B.E. Civil Engineering",
                "B.E. Electrical Engineering",
                "B.E. Electronics and Communication Engineering",
                "B.Tech Computer Science",
                "B.Tech Information Technology",
                "Others"
            ],

            Medical: [
                "MBBS",
                "BDS",
                "BAMS",
                "BHMS",
                "BPT",
                "Others"
            ],

            Law: [
                "LLB",
                "BA LLB",
                "BBA LLB",
                "Others"
            ],

            "Commerce & Management": [
                "B.Com.",
                "B.Com. Accounting & Finance",
                "B.Com. Corporate Secretaryship",
                "B.Com. Corporate Secretaryship",
                "BBA",
                "Others"
            ],

            "Computer Applications": [
                "BCA",
                "B.Sc. Computer Science",
                "Others"
            ],

            "Nursing & Allied Health": [
                "B.Sc. Nursing",
                "B.Sc. Medical Laboratory Technology",
                "B.Sc. Radiology",
                "Others"
            ],

            Education: [
                "B.Ed.",
                "B.El.Ed.",
                "Others"
            ],

            Pharmacy: [
                "B.Pharm",
                "Pharm.D",
                "Others"
            ],

            Agriculture: [
                "B.Sc. Agriculture",
                "B.Sc. Horticulture",
                "Others"
            ],

            Architecture: [
                "B.Arch",
                "Others"
            ],

            "Hotel Management": [
                "BHM",
                "B.Sc. Hotel Management",
                "Others"
            ]

        }

    },

    PG: {

        categories: {

            "Arts & Science": [
                "M.A.",
                "M.Sc. Computer Science",
                "M.Sc. Mathematics",
                "M.Sc. Physics",
                "M.Sc. Chemistry",
                "M.Com.",
                "Others"
            ],

            Engineering: [
                "M.E. Computer Science Engineering",
                "M.E. Information Technology",
                "M.Tech Computer Science",
                "Others"
            ],

            Management: [
                "MBA",
                "Others"
            ],

            Computer: [
                "MCA",
                "M.Sc. Computer Science",
                "Others"
            ],

            Medical: [
                "MD",
                "MS",
                "MDS",
                "Others"
            ],

            Law: [
                "LLM",
                "Others"
            ]

        }

    },

    MPhil: {

        categories: {

            Research: [
                "M.Phil",
                "Other M.Phil Course"
            ]

        }

    },

    PhD: {

        categories: {

            Research: [
                "Ph.D",
                "Research Scholar",
                "Other Research Course"
            ]

        }

    }

};


/* ==========================================================
   COURSE YEARS
========================================================== */

const courseYears = {

    "Below Class 10": [
        "Below Class 10"
    ],

    "10th": [
        "10th"
    ],

    "11th": [
        "11th"
    ],

    "12th": [
        "12th"
    ],

    "ITI Computer Operator": [
        "1st Year",
        "2nd Year"
    ],

    "ITI Electrician": [
        "1st Year",
        "2nd Year"
    ],

    "ITI Fitter": [
        "1st Year",
        "2nd Year"
    ],

    "ITI Welder": [
        "1st Year",
        "2nd Year"
    ],

    "ITI Mechanic": [
        "1st Year",
        "2nd Year"
    ],

    "Other ITI Course": [
        "1st Year",
        "2nd Year"
    ],

    "Diploma in Computer Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "Diploma in Mechanical Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "Diploma in Civil Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "Diploma in Electrical Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "Diploma in Electronics Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "Diploma in Automobile Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "Diploma in Information Technology": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Sc. Computer Science": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "BCA": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.A.": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Com.": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "BBA": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Sc. Mathematics": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Sc. Physics": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Sc. Chemistry": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Sc. Biotechnology": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Sc. Psychology": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.Sc. Microbiology": [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    "B.E. Computer Science Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.E. Information Technology": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.E. Mechanical Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.E. Civil Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.E. Electrical Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.E. Electronics and Communication Engineering": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.Tech Computer Science": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.Tech Information Technology": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "MBBS": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
        "5th Year"
    ],

    "BDS": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
        "5th Year"
    ],

    "B.Arch": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
        "5th Year"
    ],

    "B.Sc. Nursing": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "B.Pharm": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year"
    ],

    "Pharm.D": [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
        "5th Year",
        "6th Year"
    ],

    "MCA": [
        "1st Year",
        "2nd Year"
    ],

    "MBA": [
        "1st Year",
        "2nd Year"
    ],

    "M.Sc. Computer Science": [
        "1st Year",
        "2nd Year"
    ],

    "M.Com.": [
        "1st Year",
        "2nd Year"
    ],

    "M.A.": [
        "1st Year",
        "2nd Year"
    ],

    "M.Phil": [
        "1st Year",
        "2nd Year"
    ],

    "Ph.D": [
        "Research"
    ],

    "Research Scholar": [
        "Research"
    ]

};


/* ==========================================================
   DEFAULT YEARS
========================================================== */

const defaultYears = {

    School: [
        "Below Class 10",
        "10th",
        "11th",
        "12th"
    ],

    ITI: [
        "1st Year",
        "2nd Year"
    ],

    Diploma: [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    UG: [
        "1st Year",
        "2nd Year",
        "3rd Year"
    ],

    PG: [
        "1st Year",
        "2nd Year"
    ],

    MPhil: [
        "1st Year",
        "2nd Year"
    ],

    PhD: [
        "Research"
    ]

};


/* ==========================================================
   CURRENT USER
========================================================== */

function getCurrentUser() {

    try {

        const user =
            JSON.parse(
                localStorage.getItem("currentUser") || "null"
            );

        if (
            user &&
            typeof user === "object"
        ) {

            return user;

        }

    } catch (error) {

        console.warn(
            "Unable to read current user:",
            error
        );

    }

    return null;

}


/* ==========================================================
   USER ID
========================================================== */

function getUserId() {

    const currentId =
        localStorage.getItem("currentUserId");

    if (currentId) {

        return String(currentId)
            .trim()
            .toLowerCase();

    }


    const user =
        getCurrentUser();


    if (user) {

        const id =
            user.id ||
            user.userId ||
            user.UserId ||
            user.email ||
            user.username ||
            user.Username;


        if (id) {

            return String(id)
                .trim()
                .toLowerCase();

        }

    }


    return "guest";

}


/* ==========================================================
   USERS STORAGE
========================================================== */

function getUsers() {

    try {

        const raw =
            JSON.parse(
                localStorage.getItem("eligifyUsers") || "[]"
            );


        if (Array.isArray(raw)) {

            return raw;

        }


        if (
            raw &&
            typeof raw === "object"
        ) {

            return Object.values(raw);

        }

    } catch (error) {

        console.warn(
            "Unable to read users:",
            error
        );

    }


    return [];

}


/* ==========================================================
   GET CURRENT ACCOUNT EMAIL
   ----------------------------------------------------------
   Priority:
   1. currentUser email
   2. eligifyUsers matched by UserId
   3. eligifyUsers matched by username
   4. currentUser email fallback aliases
========================================================== */

function getCurrentAccountEmail() {

    const currentUser =
        getCurrentUser();


    /* ======================================================
       1. CURRENT USER OBJECT
    ====================================================== */

    let email =
        currentUser?.email ||
        currentUser?.Email ||
        currentUser?.emailId ||
        currentUser?.EmailId ||
        currentUser?.mail ||
        currentUser?.Mail ||
        currentUser?.emailAddress ||
        currentUser?.EmailAddress ||
        "";


    email =
        String(email || "")
            .trim();


    if (email) {

        return email;

    }


    /* ======================================================
       2. CURRENT USER ID
    ====================================================== */

    const userId =
        localStorage.getItem("currentUserId") ||
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.UserId ||
        "";


    const normalizedUserId =
        String(userId || "")
            .trim()
            .toLowerCase();


    const username =
        currentUser?.username ||
        currentUser?.Username ||
        "";


    const normalizedUsername =
        String(username || "")
            .trim()
            .toLowerCase();


    const users =
        getUsers();


    const matchedUser =
        users.find(
            user => {

                if (
                    !user ||
                    typeof user !== "object"
                ) {

                    return false;

                }


                const possibleIds = [

                    user.id,
                    user.userId,
                    user.UserId,
                    user.ID,
                    user.Id

                ];


                const possibleUsernames = [

                    user.username,
                    user.Username,
                    user.userName,
                    user.UserName

                ];


                const idMatch =
                    normalizedUserId &&
                    possibleIds.some(
                        id =>
                            String(id || "")
                                .trim()
                                .toLowerCase() ===
                            normalizedUserId
                    );


                const usernameMatch =
                    normalizedUsername &&
                    possibleUsernames.some(
                        name =>
                            String(name || "")
                                .trim()
                                .toLowerCase() ===
                            normalizedUsername
                    );


                return (
                    idMatch ||
                    usernameMatch
                );

            }
        );


    if (!matchedUser) {

        return "";

    }


    email =
        matchedUser.email ||
        matchedUser.Email ||
        matchedUser.emailId ||
        matchedUser.EmailId ||
        matchedUser.mail ||
        matchedUser.Mail ||
        matchedUser.emailAddress ||
        matchedUser.EmailAddress ||
        "";


    return String(email || "")
        .trim();

}
function profileBelongsToCurrentUser(profile) {

    if (!profile) return false;

    const currentUserId =
        String(getUserId())
            .trim()
            .toLowerCase();

    const profileUserId =
        String(
            profile.userId ||
            profile.UserId ||
            ""
        )
        .trim()
        .toLowerCase();

    return (
        currentUserId !== "guest" &&
        profileUserId !== "" &&
        profileUserId === currentUserId
    );
}

/* ==========================================================
   SAVE USER PROFILE
========================================================== */

function saveUserProfile(profileData) {

    const users =
        getUsers();

    const userId =
        getUserId();


    const index =
        users.findIndex(
            user => {

                const id =
                    user.id ||
                    user.userId ||
                    user.UserId ||
                    user.email ||
                    user.Email ||
                    user.username ||
                    user.Username ||
                    "";

                return String(id)
                    .trim()
                    .toLowerCase() ===
                    String(userId)
                        .trim()
                        .toLowerCase();

            }
        );


    if (index < 0) {

        return;

    }


    const existingProfile =
        users[index].profile || {};


    const profile = {

        ...existingProfile,

        ...profileData,

        eligibilityCompleted:
            true,

        updatedAt:
            new Date().toISOString()

    };


    users[index].profile =
        profile;


    users[index].eligibilityProfile =
        profile;


    localStorage.setItem(
        "eligifyUsers",
        JSON.stringify(users)
    );

}


/* ==========================================================
   NORMALIZE COMMUNITY
========================================================== */

function normalizeCommunity(value) {

    const text =
        String(value || "")
            .trim()
            .toLowerCase();


    if (
        [
            "general",
            "general / oc",
            "general/oc",
            "oc",
            "open",
            "gen"
        ].includes(text)
    ) {

        return "General";

    }


    if (text === "bc") return "BC";

    if (text === "mbc") return "MBC";

    if (text === "dnc") return "DNC";

    if (text === "obc") return "OBC";


    if (
        text === "sc" ||
        text === "scheduled caste"
    ) {

        return "SC";

    }


    if (
        text === "st" ||
        text === "scheduled tribe"
    ) {

        return "ST";

    }


    if (text === "ews") {

        return "EWS";

    }


    return String(value || "")
        .trim();

}


/* ==========================================================
   YES / NO VALUE
========================================================== */

function getYesNoValue(element) {

    if (!element) {

        return "";

    }


    if (
        element.type === "checkbox"
    ) {

        return element.checked
            ? "Yes"
            : "No";

    }


    return element.value || "";

}


/* ==========================================================
   SET YES / NO
========================================================== */

function setYesNoValue(
    element,
    value
) {

    if (!element) return;


    const normalized =
        String(value || "")
            .trim()
            .toLowerCase();


    if (
        element.type === "checkbox"
    ) {

        element.checked =
            normalized === "yes" ||
            normalized === "true" ||
            normalized === "1";

        return;

    }


    element.value =
        value || "";

}


/* ==========================================================
   UPDATE PROGRESS
========================================================== */

function updateProgress(number) {

    const info =
        stepInformation[number] ||
        stepInformation[1];


    if (progressLabel) {

        progressLabel.textContent =
            info.label;

    }


    if (progressStep) {

        progressStep.textContent =
            number;

    }


    if (progressFill) {

        const progress =
            (number / TOTAL_STEPS) * 100;

        progressFill.style.width =
            `${progress}%`;

    }

}


/* ==========================================================
   SHOW STEP
========================================================== */

function showStep(number) {

    if (
        number < 1 ||
        number > TOTAL_STEPS
    ) {

        return;

    }


    currentStep =
        number;


    steps.forEach(
        step => {

            step.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            `step${number}`
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    updateProgress(number);


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ==========================================================
   ERROR HELPERS
========================================================== */

function clearError(field) {

    if (!field) return;


    const group =
        field.closest(".form-group");


    if (!group) return;


    group.classList.remove(
        "error"
    );

    group.classList.remove(
        "has-error"
    );


    const error =
        group.querySelector(
            ".error-message"
        );


    if (error) {

        error.textContent =
            "";

    }

}


function showError(
    field,
    message
) {

    if (!field) return;


    const group =
        field.closest(".form-group");


    if (!group) return;


    group.classList.add(
        "error"
    );

    group.classList.add(
        "has-error"
    );


    const error =
        group.querySelector(
            ".error-message"
        );


    if (error) {

        error.textContent =
            message;

    }

}


/* ==========================================================
   DYNAMIC QUESTION HELPERS
========================================================== */

function getFieldGroup(field) {

    if (!field) return null;

    return field.closest(".form-group");

}


function clearFieldValue(field) {

    if (!field) return;


    if (
        field.type === "checkbox" ||
        field.type === "radio"
    ) {

        field.checked = false;

        return;

    }


    field.value = "";

    clearError(field);

}


function setQuestionVisibility(
    field,
    visible,
    clearWhenHidden = true
) {

    const group =
        getFieldGroup(field);


    if (!group) return;


    group.hidden =
        !visible;


    group.setAttribute(
        "aria-hidden",
        visible ? "false" : "true"
    );


    if (!visible) {

        clearError(field);


        if (clearWhenHidden) {

            clearFieldValue(field);

        }

    }

}


/* ==========================================================
   ACADEMIC VISIBILITY
========================================================== */

function updateAcademicVisibility() {

    const level =
        educationLevel?.value || "";

    const selectedCourse =
        course?.value || "";


    let showClass10 = false;
    let showClass12 = false;
    let showDiploma = false;
    let showUG = false;
    let showPG = false;

    let showCGPA = false;
    let showPercentile = false;

    let showFirstAttempt = false;
    let showAttendance = false;


    /* ======================================================
       BELOW CLASS 10
    ====================================================== */

    if (
        level === "School" &&
        selectedCourse === "Below Class 10"
    ) {

        showAttendance = true;

    }


    /* ======================================================
       10TH
    ====================================================== */

    else if (
        level === "School" &&
        selectedCourse === "10th"
    ) {

        showFirstAttempt = true;
        showAttendance = true;

    }


    /* ======================================================
       11TH
    ====================================================== */

    else if (
        level === "School" &&
        selectedCourse === "11th"
    ) {

        showClass10 = true;
        showAttendance = true;

    }


    /* ======================================================
       12TH
    ====================================================== */

    else if (
        level === "School" &&
        selectedCourse === "12th"
    ) {

        showClass10 = true;
        showAttendance = true;
        showFirstAttempt = true;

    }


    /* ======================================================
       ITI
    ====================================================== */

    else if (level === "ITI") {

        showClass10 = true;
        showAttendance = true;
        showFirstAttempt = true;

    }


    /* ======================================================
       DIPLOMA
    ====================================================== */

    else if (level === "Diploma") {

        showClass10 = true;
        showAttendance = true;
        showFirstAttempt = true;

    }


    /* ======================================================
       UG
    ====================================================== */

    else if (level === "UG") {

        showClass10 = true;
        showClass12 = true;
        showCGPA = true;
        showPercentile = true;
        showFirstAttempt = true;
        showAttendance = true;

    }


    /* ======================================================
       PG
    ====================================================== */

    else if (level === "PG") {

        showUG = true;
        showCGPA = true;
        showPercentile = true;
        showFirstAttempt = true;
        showAttendance = true;

    }


    /* ======================================================
       MPHIL
    ====================================================== */

    else if (level === "MPhil") {

        showPG = true;
        showCGPA = true;
        showPercentile = true;
        showFirstAttempt = true;
        showAttendance = true;

    }


    /* ======================================================
       PHD
    ====================================================== */

    else if (level === "PhD") {

        showPG = true;
        showCGPA = true;
        showPercentile = true;

    }


    /* ======================================================
       APPLY VISIBILITY
    ====================================================== */

    setQuestionVisibility(
        class10Percentage,
        showClass10
    );

    setQuestionVisibility(
        class12Percentage,
        showClass12
    );

    setQuestionVisibility(
        diplomaPercentage,
        showDiploma
    );

    setQuestionVisibility(
        ugPercentage,
        showUG
    );

    setQuestionVisibility(
        pgPercentage,
        showPG
    );

    setQuestionVisibility(
        cgpa,
        showCGPA
    );

    setQuestionVisibility(
        percentile,
        showPercentile
    );

    setQuestionVisibility(
        firstAttemptPass,
        showFirstAttempt
    );

    setQuestionVisibility(
        attendance,
        showAttendance
    );

}


/* ==========================================================
   SPECIAL VISIBILITY
========================================================== */

function updateSpecialVisibility() {

    const level =
        educationLevel?.value || "";

    const category =
        courseCategory?.value || "";

    const selectedCourse =
        course?.value || "";


    let showEntrance = false;
    let showMerit = false;
    let showResearch = false;
    let showPortfolio = false;
    let showInterview = false;


    /* ======================================================
       UG
    ====================================================== */

    if (level === "UG") {

        showEntrance = true;
        showMerit = true;
        showInterview = true;


        if (
            category === "Architecture" ||
            category === "Arts & Science" ||
            category === "Hotel Management" ||
            selectedCourse === "B.Arch"
        ) {

            showPortfolio = true;

        }

    }


    /* ======================================================
       PG
    ====================================================== */

    else if (level === "PG") {

        showEntrance = true;
        showMerit = true;
        showInterview = true;

    }


    /* ======================================================
       MPHIL
    ====================================================== */

    else if (level === "MPhil") {

        showEntrance = true;
        showMerit = true;
        showResearch = true;
        showInterview = true;

    }


    /* ======================================================
       PHD
    ====================================================== */

    else if (level === "PhD") {

        showEntrance = true;
        showMerit = true;
        showResearch = true;
        showInterview = true;

    }


    /* ======================================================
       ENTRANCE
    ====================================================== */

    setQuestionVisibility(
        entranceQualified,
        showEntrance
    );


    const entranceYes =
        entranceQualified?.value === "Yes";


    setQuestionVisibility(
        entranceExam,
        showEntrance && entranceYes
    );

    setQuestionVisibility(
        examScore,
        showEntrance && entranceYes
    );

    setQuestionVisibility(
        examRank,
        showEntrance && entranceYes
    );


    /* ======================================================
       OTHER SPECIAL FIELDS
    ====================================================== */

    setQuestionVisibility(
        meritStatus,
        showMerit
    );

    setQuestionVisibility(
        researchStatus,
        showResearch
    );

    setQuestionVisibility(
        portfolioStatus,
        showPortfolio
    );

    setQuestionVisibility(
        interviewStatus,
        showInterview
    );


    /* ======================================================
       COMMON
    ====================================================== */

    setQuestionVisibility(
        specialCategory,
        true,
        false
    );

    setQuestionVisibility(
        documentAvailability,
        true,
        false
    );

}


/* ==========================================================
   UPDATE ALL DYNAMIC QUESTIONS
========================================================== */

function updateDynamicQuestionVisibility() {

    updateAcademicVisibility();

    updateSpecialVisibility();

}


/* ==========================================================
   REQUIRED VALIDATION
========================================================== */

function validateRequired(
    field,
    message
) {

    if (!field) {

        return true;

    }


    const group =
        getFieldGroup(field);


    if (
        group &&
        group.hidden
    ) {

        clearError(field);

        return true;

    }


    clearError(field);


    const value =
        String(
            field.value || ""
        ).trim();


    if (!value) {

        showError(
            field,
            message
        );

        return false;

    }


    return true;

}


/* ==========================================================
   NUMBER VALIDATION
========================================================== */

function validateNumberRange(
    field,
    min,
    max,
    requiredMessage,
    rangeMessage
) {

    if (!field) {

        return true;

    }


    const group =
        getFieldGroup(field);


    if (
        group &&
        group.hidden
    ) {

        clearError(field);

        return true;

    }


    clearError(field);


    const raw =
        String(
            field.value || ""
        ).trim();


    if (!raw) {

        if (requiredMessage) {

            showError(
                field,
                requiredMessage
            );

            return false;

        }

        return true;

    }


    const value =
        Number(raw);


    if (
        Number.isNaN(value) ||
        value < min ||
        value > max
    ) {

        showError(
            field,
            rangeMessage
        );

        return false;

    }


    return true;

}


/* ==========================================================
   STEP 1 VALIDATION
========================================================== */

function validateStep1() {

    let valid = true;


    const fields = [

        [
            fullName,
            "Please enter your full name."
        ],

        [
            age,
            "Please enter your age."
        ],

        [
            gender,
            "Please select your gender."
        ],

        [
            state,
            "Please select your domicile state / UT."
        ],

        [
            domicileStatus,
            "Please select your domicile status."
        ],

        [
            citizenship,
            "Please select your citizenship / nationality."
        ],

        [
            disabilityStatus,
            "Please select your disability status."
        ]

    ];


    fields.forEach(
        ([field, message]) => {

            if (
                !validateRequired(
                    field,
                    message
                )
            ) {

                valid = false;

            }

        }
    );


    const ageValid =
        validateNumberRange(
            age,
            10,
            100,
            "Please enter your age.",
            "Please enter a valid age between 10 and 100."
        );


    if (!ageValid) {

        valid = false;

    }


    if (!valid) {

        focusFirstError(
            document.getElementById("step1")
        );

    }


    return valid;

}


/* ==========================================================
   STEP 2 VALIDATION
========================================================== */

function validateStep2() {

    let valid = true;


    const fields = [

        [
            educationLevel,
            "Please select your education level."
        ],

        [
            courseCategory,
            "Please select your course category."
        ],

        [
            course,
            "Please select your course."
        ],

        [
            yearOfStudy,
            "Please select your current class / year."
        ],

        [
            institutionName,
            "Please enter your institution / college name."
        ],

        [
            schoolType,
            "Please select your institution type."
        ],

        [
            governmentSchool,
            "Please select whether you studied in a government school."
        ]

    ];


    fields.forEach(
        ([field, message]) => {

            if (
                !validateRequired(
                    field,
                    message
                )
            ) {

                valid = false;

            }

        }
    );


    const selectedCourse =
        course?.value || "";


    if (
        selectedCourse === "Others" ||
        selectedCourse === "Other Diploma Course" ||
        selectedCourse === "Other ITI Course"
    ) {

        if (
            !validateRequired(
                otherCourse,
                "Please specify your course."
            )
        ) {

            valid = false;

        }

    }


    if (!valid) {

        focusFirstError(
            document.getElementById("step2")
        );

    }


    return valid;

}


/* ==========================================================
   STEP 3 VALIDATION
========================================================== */

function validateStep3() {

    let valid = true;


    if (
        !validateNumberRange(
            percentage,
            0,
            100,
            "Please enter your qualifying exam percentage.",
            "Percentage must be between 0 and 100."
        )
    ) {

        valid = false;

    }


    if (
        !validateRequired(
            previousExamStatus,
            "Please select your previous qualifying exam status."
        )
    ) {

        valid = false;

    }


    const optionalPercentageFields = [

        class10Percentage,
        class12Percentage,
        diplomaPercentage,
        ugPercentage,
        pgPercentage

    ];


    optionalPercentageFields.forEach(
        field => {

            if (
                !validateNumberRange(
                    field,
                    0,
                    100,
                    null,
                    "Percentage must be between 0 and 100."
                )
            ) {

                valid = false;

            }

        }
    );


    if (
        !validateNumberRange(
            cgpa,
            0,
            10,
            null,
            "CGPA must be between 0 and 10."
        )
    ) {

        valid = false;

    }


    if (
        !validateNumberRange(
            percentile,
            0,
            100,
            null,
            "Percentile must be between 0 and 100."
        )
    ) {

        valid = false;

    }


    if (
        !validateNumberRange(
            attendance,
            0,
            100,
            null,
            "Attendance must be between 0 and 100."
        )
    ) {

        valid = false;

    }


    if (!valid) {

        focusFirstError(
            document.getElementById("step3")
        );

    }


    return valid;

}


/* ==========================================================
   STEP 4 VALIDATION
========================================================== */

function validateStep4() {

    let valid = true;


    const fields = [

        [
            community,
            "Please select your community."
        ],

        [
            familyIncome,
            "Please enter your annual family income."
        ],

        [
            firstGraduate,
            "Please select First Graduate status."
        ],

        [
            singleChild,
            "Please select Single Child status."
        ]

    ];


    fields.forEach(
        ([field, message]) => {

            if (
                !validateRequired(
                    field,
                    message
                )
            ) {

                valid = false;

            }

        }
    );


    if (familyIncome?.value) {

        const income =
            Number(
                familyIncome.value
            );


        if (
            Number.isNaN(income) ||
            income < 0
        ) {

            showError(
                familyIncome,
                "Please enter a valid annual family income."
            );

            valid = false;

        }

    }


    if (!valid) {

        focusFirstError(
            document.getElementById("step4")
        );

    }


    return valid;

}


/* ==========================================================
   STEP 5 VALIDATION
========================================================== */

function validateStep5() {

    let valid = true;


    if (
        !validateRequired(
            documentAvailability,
            "Please select whether you can provide the required documents."
        )
    ) {

        valid = false;

    }


    const entranceGroup =
        getFieldGroup(entranceQualified);


    if (
        entranceGroup &&
        entranceGroup.hidden
    ) {

        clearError(entranceQualified);
        clearError(entranceExam);
        clearError(examScore);
        clearError(examRank);

    }

    else if (
        entranceQualified?.value === "Yes"
    ) {

        if (
            !validateRequired(
                entranceExam,
                "Please enter the entrance / competitive exam name."
            )
        ) {

            valid = false;

        }


        if (examScore?.value) {

            const score =
                Number(
                    examScore.value
                );


            if (
                Number.isNaN(score) ||
                score < 0
            ) {

                showError(
                    examScore,
                    "Please enter a valid exam score / percentile."
                );

                valid = false;

            }

        }


        if (examRank?.value) {

            const rank =
                Number(
                    examRank.value
                );


            if (
                Number.isNaN(rank) ||
                rank < 1
            ) {

                showError(
                    examRank,
                    "Please enter a valid exam rank."
                );

                valid = false;

            }

        }

    }

    else {

        clearError(entranceExam);
        clearError(examScore);
        clearError(examRank);

    }


    if (!valid) {

        focusFirstError(
            document.getElementById("step5")
        );

    }


    return valid;

}


/* ==========================================================
   FOCUS FIRST ERROR
========================================================== */

function focusFirstError(stepElement) {

    if (!stepElement) return;


    const errorField =
        stepElement.querySelector(
            ".form-group.error input, " +
            ".form-group.error select, " +
            ".form-group.has-error input, " +
            ".form-group.has-error select"
        );


    if (errorField) {

        setTimeout(
            () => {

                errorField.focus({
                    preventScroll: true
                });


                errorField.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            },
            50
        );

    }

}


/* ==========================================================
   COURSE CATEGORIES
========================================================== */

function updateCourseCategories(level) {

    if (!courseCategory) return;


    courseCategory.innerHTML =
        `<option value="">Select category</option>`;

    courseCategory.disabled =
        true;


    if (course) {

        course.innerHTML =
            `<option value="">Select category first</option>`;

        course.disabled =
            true;

    }


    if (yearOfStudy) {

        yearOfStudy.innerHTML =
            `<option value="">Select your course first</option>`;

        yearOfStudy.disabled =
            true;

    }


    if (otherCourseGroup) {

        otherCourseGroup.classList.add(
            "hidden"
        );

    }


    const categories =
        courseData[level]?.categories;


    if (!categories) {

        updateDynamicQuestionVisibility();

        return;

    }


    Object.keys(categories)
        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category;

                option.textContent =
                    category;


                courseCategory.appendChild(
                    option
                );

            }
        );


    courseCategory.disabled =
        false;


    updateDynamicQuestionVisibility();

}


/* ==========================================================
   COURSES
========================================================== */

function updateCourses(
    level,
    category
) {

    if (!course) return;


    course.innerHTML =
        `<option value="">Select course</option>`;

    course.disabled =
        true;


    if (yearOfStudy) {

        yearOfStudy.innerHTML =
            `<option value="">Select your course first</option>`;

        yearOfStudy.disabled =
            true;

    }


    if (otherCourseGroup) {

        otherCourseGroup.classList.add(
            "hidden"
        );

    }


    const courses =
        courseData[level]
            ?.categories?.[category];


    if (!courses) {

        updateDynamicQuestionVisibility();

        return;

    }


    courses.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item;

            option.textContent =
                item;


            course.appendChild(
                option
            );

        }
    );


    course.disabled =
        false;


    updateDynamicQuestionVisibility();

}


/* ==========================================================
   YEARS
========================================================== */

function updateYears(
    selectedCourse,
    level
) {

    if (!yearOfStudy) return;


    yearOfStudy.innerHTML =
        `<option value="">Select current class / year</option>`;

    yearOfStudy.disabled =
        true;


    if (otherCourseGroup) {

        otherCourseGroup.classList.add(
            "hidden"
        );

    }


    if (
        selectedCourse === "Others" ||
        selectedCourse === "Other Diploma Course" ||
        selectedCourse === "Other ITI Course"
    ) {

        if (otherCourseGroup) {

            otherCourseGroup.classList.remove(
                "hidden"
            );

        }

    }


    if (!selectedCourse) {

        updateDynamicQuestionVisibility();

        return;

    }


    let years =
        courseYears[selectedCourse];


    if (!years) {

        years =
            defaultYears[level];

    }


    if (!years) {

        years = [
            "1st Year",
            "2nd Year",
            "3rd Year"
        ];

    }


    years.forEach(
        year => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                year;

            option.textContent =
                year;


            yearOfStudy.appendChild(
                option
            );

        }
    );


    yearOfStudy.disabled =
        false;


    updateDynamicQuestionVisibility();

}


/* ==========================================================
   COURSE EVENTS
========================================================== */

educationLevel?.addEventListener(
    "change",
    () => {

        updateCourseCategories(
            educationLevel.value
        );

        clearError(
            educationLevel
        );

        updateDynamicQuestionVisibility();

    }
);


courseCategory?.addEventListener(
    "change",
    () => {

        updateCourses(
            educationLevel?.value,
            courseCategory.value
        );

        clearError(
            courseCategory
        );

        updateDynamicQuestionVisibility();

    }
);


course?.addEventListener(
    "change",
    () => {

        updateYears(
            course.value,
            educationLevel?.value
        );

        clearError(
            course
        );

        updateDynamicQuestionVisibility();

    }
);


/* ==========================================================
   ENTRANCE EVENTS
========================================================== */

entranceQualified?.addEventListener(
    "change",
    () => {

        clearError(
            entranceQualified
        );

        clearError(
            entranceExam
        );

        clearError(
            examScore
        );

        clearError(
            examRank
        );

        updateDynamicQuestionVisibility();

    }
);


/* ==========================================================
   STEP BUTTON EVENTS
========================================================== */

nextStep1?.addEventListener(
    "click",
    () => {

        if (validateStep1()) {

            showStep(2);

        }

    }
);


nextStep2?.addEventListener(
    "click",
    () => {

        if (validateStep2()) {

            showStep(3);

        }

    }
);


nextStep3?.addEventListener(
    "click",
    () => {

        if (validateStep3()) {

            showStep(4);

        }

    }
);


nextStep4?.addEventListener(
    "click",
    () => {

        if (validateStep4()) {

            showStep(5);

        }

    }
);


/* ==========================================================
   BACK BUTTONS
========================================================== */

backStep2?.addEventListener(
    "click",
    () => showStep(1)
);

backStep3?.addEventListener(
    "click",
    () => showStep(2)
);

backStep4?.addEventListener(
    "click",
    () => showStep(3)
);

backStep5?.addEventListener(
    "click",
    () => showStep(4)
);


/* ==========================================================
   NUMBER HELPER
========================================================== */

function numberOrEmpty(field) {

    if (
        !field ||
        String(field.value || "").trim() === ""
    ) {

        return "";

    }


    const number =
        Number(field.value);


    return Number.isNaN(number)
        ? ""
        : number;

}


/* ==========================================================
   BUILD PROFILE DATA
   IMPORTANT:
   Name = ONLY eligibility form name
   Email = CURRENT LOGGED-IN ACCOUNT EMAIL
========================================================== */

function buildProfileData() {

    let selectedCourse =
        course?.value || "";


    const originalCourse =
        selectedCourse;


    if (
        selectedCourse === "Others" ||
        selectedCourse === "Other Diploma Course" ||
        selectedCourse === "Other ITI Course"
    ) {

        selectedCourse =
            otherCourse?.value.trim() || "";

    }


    const userId =
        getUserId();


    const accountEmail =
        getCurrentAccountEmail();


    /*
       VERY IMPORTANT:
       This value comes ONLY from the
       eligibility form.
       It does NOT use account Name,
       Username or profile Name.
    */

    const formName =
        fullName?.value
            ?.trim() || "";


    return {

        /* ====================================================
           PERSONAL
        ==================================================== */

        name:
            formName,

        Name:
            formName,

        fullName:
            formName,

        age:
            numberOrEmpty(age),

        gender:
            gender?.value || "",

        state:
            state?.value || "",

        domicileStatus:
            domicileStatus?.value || "",

        citizenship:
            citizenship?.value || "",

        disabilityStatus:
            disabilityStatus?.value || "",

        residenceType:
            residenceType?.value || "",


        /* ====================================================
           EDUCATION
        ==================================================== */

        educationLevel:
            educationLevel?.value || "",

        courseLevel:
            educationLevel?.value || "",

        courseCategory:
            courseCategory?.value || "",

        course:
            selectedCourse,

        originalCourse:
            originalCourse,

        yearOfStudy:
            yearOfStudy?.value || "",

        institutionName:
            institutionName?.value.trim() || "",

        institutionType:
            schoolType?.value || "",

        schoolType:
            schoolType?.value || "",

        governmentSchool:
            governmentSchool?.value || "",


        /* ====================================================
           ACADEMIC
        ==================================================== */

        percentage:
            numberOrEmpty(percentage),

        class10Percentage:
            numberOrEmpty(class10Percentage),

        class12Percentage:
            numberOrEmpty(class12Percentage),

        diplomaPercentage:
            numberOrEmpty(diplomaPercentage),

        ugPercentage:
            numberOrEmpty(ugPercentage),

        pgPercentage:
            numberOrEmpty(pgPercentage),

        cgpa:
            numberOrEmpty(cgpa),

        percentile:
            numberOrEmpty(percentile),

        previousExamStatus:
            previousExamStatus?.value || "",

        firstAttemptPass:
            firstAttemptPass?.value || "",

        attendance:
            numberOrEmpty(attendance),


        /* ====================================================
           FAMILY
        ==================================================== */

        community:
            normalizeCommunity(
                community?.value || ""
            ),

        ewsStatus:
            ewsStatus?.value || "",

        minorityStatus:
            minorityStatus?.value || "",

        familyIncome:
            numberOrEmpty(familyIncome),

        firstGraduate:
            getYesNoValue(firstGraduate),

        singleChild:
            getYesNoValue(singleChild),

        singleGirlChild:
            getYesNoValue(singleGirlChild),

        parentStatus:
            parentStatus?.value || "",

        familySupport:
            familySupport?.value || "",


        /* ====================================================
           SPECIAL
        ==================================================== */

        specialCategory:
            specialCategory?.value || "",

        entranceQualified:
            entranceQualified?.value || "",

        entranceExam:
            entranceExam?.value.trim() || "",

        examScore:
            numberOrEmpty(examScore),

        examRank:
            numberOrEmpty(examRank),

        meritStatus:
            meritStatus?.value || "",

        researchStatus:
            researchStatus?.value || "",

        portfolioStatus:
            portfolioStatus?.value || "",

        interviewStatus:
            interviewStatus?.value || "",

        documentAvailability:
            documentAvailability?.value || "",


        /* ====================================================
           ACCOUNT
        ==================================================== */

        userId:
            userId,

        UserId:
            userId,

        email:
            accountEmail,

        Email:
            accountEmail,

        completed:
            true,

        updatedAt:
            new Date().toISOString()

    };

}


/* ==========================================================
   SAVE TO LOCAL STORAGE
========================================================== */

function saveLocalEligibilityProfile(profileData) {

    if (!profileData) return false;

    const userId = getUserId();

    if (!userId || userId === "guest") {
        return false;
    }

    if (!profileBelongsToCurrentUser(profileData)) {
        console.warn("Blocked saving another user's profile.");
        return false;
    }

    try {

        localStorage.setItem(
            `eligifyEligibility_${userId}`,
            JSON.stringify(profileData)
        );

        localStorage.setItem(
            `eligibilityData_${userId}`,
            JSON.stringify(profileData)
        );

        localStorage.setItem(
            `currentEligibilityProfile_${userId}`,
            JSON.stringify(profileData)
        );

        saveUserProfile(profileData);

        return true;

    } catch (error) {

        console.error(
            "Unable to save local eligibility profile:",
            error
        );

        return false;
    }
}

/* ==========================================================
   SAVE TO GOOGLE SHEETS
========================================================== */

async function saveEligibilityToGAS(
    profileData
) {

    if (!profileData) {

        throw new Error(
            "Eligibility profile is empty."
        );

    }


    const userId =
        getUserId();


    if (
        !userId ||
        userId === "guest"
    ) {

        throw new Error(
            "User account not found."
        );

    }


    /*
       Re-read account email at save time.
       This makes sure Email does not become blank
       just because currentUser was incomplete.
    */

    const accountEmail =
        getCurrentAccountEmail();


    /*
       Name MUST ALWAYS come from the form.
    */

    const formName =
        fullName?.value
            ?.trim() ||
        String(
            profileData.fullName ||
            ""
        ).trim();


    if (!formName) {

        throw new Error(
            "Name is empty."
        );

    }


    if (!accountEmail) {

        throw new Error(
            "Logged-in account email not found."
        );

    }


    const payload = {

        action:
            "saveEligibility",

        data: {

            ...profileData,


            /* =================================================
               USER
            ================================================= */

            userId:
                userId,

            UserId:
                userId,


            /* =================================================
               NAME
               ONLY FORM NAME
            ================================================= */

            name:
                formName,

            Name:
                formName,

            fullName:
                formName,


            /* =================================================
               EMAIL
               CURRENT ACCOUNT EMAIL
            ================================================= */

            email:
                accountEmail,

            Email:
                accountEmail,


            /* =================================================
               UPDATED TIME
            ================================================= */

            updatedAt:
                new Date().toISOString()

        }

    };


    console.log(
        "Eligibility payload:",
        payload.data
    );


    const response =
        await fetch(
            GAS_API_URL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(payload)

            }
        );


    if (!response.ok) {

        throw new Error(
            `Server error: ${response.status}`
        );

    }


    const result =
        await response.json();


    console.log(
        "Eligibility GAS response:",
        result
    );


    if (
        !result ||
        result.success !== true
    ) {

        throw new Error(
            result?.message ||
            "Unable to save eligibility profile to Google Sheets."
        );

    }


    return result;

}


/* ==========================================================
   GET PROFILE FROM GOOGLE SHEETS
========================================================== */

async function getEligibilityFromGAS() {

    const userId =
        getUserId();


    /* ======================================================
       CHECK LOGIN
    ====================================================== */

    if (
        !userId ||
        userId === "guest"
    ) {

        return null;

    }


    /* ======================================================
       REQUEST
    ====================================================== */

    const payload = {

        action:
            "getEligibility",

        userId:
            userId

    };


    const response =
        await fetch(
            GAS_API_URL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(payload)

            }
        );


    /* ======================================================
       SERVER ERROR
    ====================================================== */

    if (!response.ok) {

        throw new Error(
            `Server error: ${response.status}`
        );

    }


    /* ======================================================
       READ RESPONSE
    ====================================================== */

    const result =
        await response.json();


    if (
        !result ||
        result.success !== true
    ) {

        throw new Error(
            result?.message ||
            "Unable to retrieve eligibility profile."
        );

    }


    /* ======================================================
       NO PROFILE
    ====================================================== */

    const profile =
        result.profile || null;


    if (!profile) {

        return null;

    }


    /* ======================================================
       SECURITY CHECK
       PROFILE MUST BELONG TO CURRENT USER
    ====================================================== */

    if (
        !profileBelongsToCurrentUser(
            profile
        )
    ) {

        console.warn(
            "Blocked cloud profile belonging to another user."
        );

        return null;

    }


    /* ======================================================
       RETURN CURRENT USER PROFILE ONLY
    ====================================================== */

    return profile;

}


/* ==========================================================
   FINAL PROFILE SAVE
========================================================== */

async function saveEligibilityProfile(
    profileData
) {

    if (!profileData) {

        return false;

    }


    /*
       ALWAYS save locally first.
    */

    const localSaved =
        saveLocalEligibilityProfile(
            profileData
        );


    if (!localSaved) {

        return false;

    }


    /*
       Then synchronize with Google Sheets.
       Existing local flow will still work
       if GAS temporarily fails.
    */

    try {

        await saveEligibilityToGAS(
            profileData
        );


        console.log(
            "Eligibility profile saved to Google Sheets."
        );


        return true;

    } catch (error) {

        console.error(
            "Google Sheets eligibility save failed:",
            error
        );


        /*
           Keep local copy.
        */

        return true;

    }

}


/* ==========================================================
   SAVE HISTORY
========================================================== */

function saveEligibilityHistory(profileData) {

    if (!profileData) {
        return null;
    }

    const userId = getUserId();

    if (!userId || userId === "guest") {
        return null;
    }

    /* ======================================================
       SECURITY CHECK
    ====================================================== */

    if (!profileBelongsToCurrentUser(profileData)) {

        console.warn(
            "Blocked saving history for another user."
        );

        return null;
    }


    /* ======================================================
       USER-SPECIFIC STORAGE KEYS
    ====================================================== */

    const historyKey =
        `eligibilityHistory_${userId}`;

    const selectedHistoryKey =
        `selectedEligibilityHistory_${userId}`;


    /* ======================================================
       GET CURRENT USER HISTORY
    ====================================================== */

    let history = [];

    try {

        const raw =
            localStorage.getItem(historyKey);

        if (raw) {

            const parsed =
                JSON.parse(raw);

            if (Array.isArray(parsed)) {

                history = parsed;

            }

        }

    } catch (error) {

        console.warn(
            "Unable to read current user's history:",
            error
        );

        history = [];

    }


    /* ======================================================
       CREATE HISTORY ENTRY
    ====================================================== */

    const now =
        new Date().toISOString();

    const currentUser =
        getCurrentUser();

    const entry = {

        id:
            `eligibility_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        userId:
            userId,

        username:
            currentUser?.username ||
            currentUser?.Username ||
            "",

        fullName:
            profileData.fullName ||
            profileData.name ||
            profileData.Name ||
            "",

        profile: {
            ...profileData
        },

        createdAt:
            now,

        updatedAt:
            now

    };


    /* ======================================================
       ADD ENTRY
    ====================================================== */

    history.push(entry);


    /* ======================================================
       SAVE ONLY CURRENT USER DATA
    ====================================================== */

    try {

        localStorage.setItem(
            historyKey,
            JSON.stringify(history)
        );

        localStorage.setItem(
            selectedHistoryKey,
            JSON.stringify(entry)
        );


        return entry;

    } catch (error) {

        console.error(
            "Unable to save eligibility history:",
            error
        );

        return null;

    }

}

/* ==========================================================
   FINAL SAVE
========================================================== */

async function finalizeProfileSave(
    profileData
) {

    if (!profileData) {

        return false;

    }


    const profileSaved =
        await saveEligibilityProfile(
            profileData
        );


    if (!profileSaved) {

        return false;

    }


    const historySaved =
        saveEligibilityHistory(
            profileData
        );


    if (!historySaved) {

        console.warn(
            "Profile saved, but history could not be saved."
        );

    }


    try {

        localStorage.setItem(
    `eligibilityData_${getUserId()}`,
    JSON.stringify(profileData)
);

localStorage.setItem(
    `eligifyActiveApplicant_${getUserId()}`,
    JSON.stringify(profileData)
);
    } catch (error) {

        console.error(
            "Unable to save active applicant:",
            error
        );

        return false;

    }


    return true;

}


/* ==========================================================
   RESTORE FROM GOOGLE SHEET
========================================================== */

async function restoreProfileFromGAS() {

    try {

        const profile =
            await getEligibilityFromGAS();


        /* ==================================================
           NO PROFILE
        ================================================== */

        if (!profile) {

            return null;

        }


        /* ==================================================
           SECURITY CHECK
           PROFILE MUST BELONG TO CURRENT USER
        ================================================== */

        if (
            !profileBelongsToCurrentUser(
                profile
            )
        ) {

            console.warn(
                "Blocked cloud profile belonging to another user."
            );

            return null;

        }


        /* ==================================================
           SAVE CURRENT USER PROFILE LOCALLY
        ================================================== */

        const saved =
            saveLocalEligibilityProfile(
                profile
            );


        if (!saved) {

            console.warn(
                "Unable to save restored profile locally."
            );

            return null;

        }


        return profile;


    } catch (error) {

        console.warn(
            "Google Sheets profile restore failed:",
            error
        );

        return null;

    }

}

/* ==========================================================
   TOAST
========================================================== */

function showToast(
    message,
    type = "success"
) {

    let toast =
        document.querySelector(
            ".eligify-toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.className =
            "eligify-toast";


        toast.innerHTML = `
            <div class="toast-icon"></div>
            <span class="toast-message"></span>
        `;


        document.body.appendChild(
            toast
        );

    }


    toast.className =
        `eligify-toast ${type}`;


    const icon =
        toast.querySelector(
            ".toast-icon"
        );


    const messageElement =
        toast.querySelector(
            ".toast-message"
        );


    if (icon) {

        icon.textContent =
            type === "error"
                ? "!"
                : "✓";

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    toast.classList.remove(
        "show"
    );


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* ==========================================================
   DISCLAIMER
========================================================== */

function updateDisclaimerButton() {

    if (!acceptDisclaimer) {

        return;

    }


    acceptDisclaimer.disabled =
        !(
            disclaimerAgreement &&
            disclaimerAgreement.checked
        );

}


disclaimerAgreement?.addEventListener(
    "change",
    updateDisclaimerButton
);


/* ==========================================================
   FORM SUBMIT
========================================================== */

if (form) {

    form.setAttribute(
        "novalidate",
        "true"
    );

}


form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const validators = [

            validateStep1,
            validateStep2,
            validateStep3,
            validateStep4,
            validateStep5

        ];


        for (
            let i = 0;
            i < validators.length;
            i++
        ) {

            const isValid =
                validators[i]();


            if (!isValid) {

                showStep(
                    i + 1
                );


                showToast(
                    `Please complete Step ${i + 1} correctly.`,
                    "error"
                );


                return;

            }

        }


        const profileData =
            buildProfileData();


        if (!profileData) {

            showToast(
                "Unable to create your eligibility profile.",
                "error"
            );

            return;

        }


        /*
           Prevent duplicate clicks.
        */

        if (form.dataset.saving === "true") {

            return;

        }


        form.dataset.saving =
            "true";


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        const originalButtonText =
            submitButton?.innerHTML;


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.innerHTML =
                "Saving...";

        }


        try {

            const saved =
                await finalizeProfileSave(
                    profileData
                );


            if (!saved) {

                showToast(
                    "Unable to save your profile.",
                    "error"
                );

                return;

            }


            showToast(
                "Profile saved successfully.",
                "success"
            );


            if (disclaimerAgreement) {

                disclaimerAgreement.checked =
                    false;

            }


            updateDisclaimerButton();


            setTimeout(
                () => {

                    if (disclaimerOverlay) {

                        disclaimerOverlay.classList.add(
                            "show"
                        );

                    }

                },
                500
            );

        } catch (error) {

            console.error(
                "Eligibility submit error:",
                error
            );


            showToast(
                "Unable to save your profile.",
                "error"
            );

        } finally {

            form.dataset.saving =
                "false";


            if (submitButton) {

                submitButton.disabled =
                    false;


                if (
                    originalButtonText !==
                    undefined
                ) {

                    submitButton.innerHTML =
                        originalButtonText;

                }

            }

        }

    }
);


/* ==========================================================
   DISCLAIMER CONTINUE
========================================================== */

acceptDisclaimer?.addEventListener(
    "click",
    () => {

        if (
            !disclaimerAgreement?.checked
        ) {

            updateDisclaimerButton();

            showToast(
                "Please confirm that you have read and understood the disclaimer.",
                "error"
            );

            return;

        }


        disclaimerOverlay?.classList.remove(
            "show"
        );


        setTimeout(
            () => {

                window.location.href =
                    RESULTS_PAGE;

            },
            150
        );

    }
);


/* ==========================================================
   CLOSE DISCLAIMER
========================================================== */

disclaimerOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            disclaimerOverlay
        ) {

            disclaimerOverlay.classList.remove(
                "show"
            );

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            disclaimerOverlay?.classList.contains(
                "show"
            )
        ) {

            disclaimerOverlay.classList.remove(
                "show"
            );

        }

    }
);


/* ==========================================================
   GET SAVED PROFILE
========================================================== */

function getSavedEligibilityProfile() {

    const userId = getUserId();

    if (
        !userId ||
        userId === "guest"
    ) {
        return null;
    }

    const profileKey =
        `eligifyEligibility_${String(userId).trim()}`;

    try {

        const saved =
            localStorage.getItem(profileKey);

        if (!saved) {

            /*
               CURRENT USER-KU PROFILE ILLA.
               So form blank-a irukkum.
            */

            return null;

        }

        const profile =
            JSON.parse(saved);

        /*
           Extra safety:
           saved profile current user-oda
           UserId match aaganum.
        */

        const savedUserId =
            String(
                profile?.userId ||
                profile?.UserId ||
                ""
            )
            .trim()
            .toLowerCase();

        const currentUserId =
            String(userId)
                .trim()
                .toLowerCase();

        if (
            !savedUserId ||
            savedUserId !== currentUserId
        ) {

            console.warn(
                "Blocked another user's eligibility data."
            );

            return null;

        }

        return profile;

    } catch (error) {

        console.warn(
            "Unable to read current user's profile:",
            error
        );

        return null;

    }

}

/* ==========================================================
   RESTORE PROFILE TO FORM
========================================================== */

function restoreSavedProfile(
    profile
) {

    if (!profile) {

        updateDynamicQuestionVisibility();

        return;

    }


    /* ======================================================
       PERSONAL
    ====================================================== */

    if (fullName)
        fullName.value =
            profile.fullName ||
            profile.name ||
            profile.Name ||
            "";

    if (age)
        age.value =
            profile.age ??
            profile.Age ??
            "";

    if (gender)
        gender.value =
            profile.gender ||
            profile.Gender ||
            "";

    if (state)
        state.value =
            profile.state ||
            profile.State ||
            "";

    if (domicileStatus)
        domicileStatus.value =
            profile.domicileStatus ||
            profile.DomicileStatus ||
            "";

    if (citizenship)
        citizenship.value =
            profile.citizenship ||
            profile.Citizenship ||
            "";

    if (disabilityStatus)
        disabilityStatus.value =
            profile.disabilityStatus ||
            profile.DisabilityStatus ||
            "";

    if (residenceType)
        residenceType.value =
            profile.residenceType ||
            profile.ResidenceType ||
            "";


    /* ======================================================
       EDUCATION
    ====================================================== */

    const level =
        profile.educationLevel ||
        profile.EducationLevel ||
        profile.courseLevel ||
        "";


    if (
        educationLevel &&
        level
    ) {

        educationLevel.value =
            level;


        updateCourseCategories(
            level
        );

    }


    const category =
        profile.courseCategory ||
        profile.CourseCategory ||
        "";


    if (
        courseCategory &&
        category
    ) {

        courseCategory.value =
            category;


        updateCourses(
            level,
            category
        );

    }


    const originalCourse =
        profile.originalCourse ||
        profile.OriginalCourse ||
        profile.course ||
        profile.Course ||
        "";


    if (
        course &&
        originalCourse
    ) {

        const exists =
            Array.from(
                course.options
            )
            .some(
                option =>
                    option.value ===
                    originalCourse
            );


        if (exists) {

            course.value =
                originalCourse;

        }


        updateYears(
            originalCourse,
            level
        );


        if (
            originalCourse === "Others" ||
            originalCourse === "Other Diploma Course" ||
            originalCourse === "Other ITI Course"
        ) {

            if (otherCourse) {

                otherCourse.value =
                    profile.course ||
                    profile.Course ||
                    "";

            }

        }

    }


    if (
        yearOfStudy &&
        (
            profile.yearOfStudy ||
            profile.YearOfStudy
        )
    ) {

        yearOfStudy.value =
            profile.yearOfStudy ||
            profile.YearOfStudy;

    }


    if (institutionName)
        institutionName.value =
            profile.institutionName ||
            profile.InstitutionName ||
            "";

    if (schoolType)
        schoolType.value =
            profile.schoolType ||
            profile.SchoolType ||
            profile.institutionType ||
            "";

    if (governmentSchool)
        governmentSchool.value =
            profile.governmentSchool ||
            profile.GovernmentSchool ||
            "";


    /* ======================================================
       ACADEMIC
    ====================================================== */

    if (percentage)
        percentage.value =
            profile.percentage ??
            profile.Percentage ??
            "";

    if (class10Percentage)
        class10Percentage.value =
            profile.class10Percentage ??
            profile.Class10Percentage ??
            "";

    if (class12Percentage)
        class12Percentage.value =
            profile.class12Percentage ??
            profile.Class12Percentage ??
            "";

    if (diplomaPercentage)
        diplomaPercentage.value =
            profile.diplomaPercentage ??
            profile.DiplomaPercentage ??
            "";

    if (ugPercentage)
        ugPercentage.value =
            profile.ugPercentage ??
            profile.UGPercentage ??
            "";

    if (pgPercentage)
        pgPercentage.value =
            profile.pgPercentage ??
            profile.PGPercentage ??
            "";

    if (cgpa)
        cgpa.value =
            profile.cgpa ??
            profile.CGPA ??
            "";

    if (percentile)
        percentile.value =
            profile.percentile ??
            profile.Percentile ??
            "";

    if (previousExamStatus)
        previousExamStatus.value =
            profile.previousExamStatus ||
            profile.PreviousExamStatus ||
            "";

    if (firstAttemptPass)
        firstAttemptPass.value =
            profile.firstAttemptPass ||
            profile.FirstAttemptPass ||
            "";

    if (attendance)
        attendance.value =
            profile.attendance ??
            profile.Attendance ??
            "";


    /* ======================================================
       FAMILY
    ====================================================== */

    if (community)
        community.value =
            normalizeCommunity(
                profile.community ||
                profile.Community ||
                ""
            );


    if (ewsStatus)
        ewsStatus.value =
            profile.ewsStatus ||
            profile.EWSStatus ||
            "";


    if (minorityStatus)
        minorityStatus.value =
            profile.minorityStatus ||
            profile.MinorityCommunity ||
            "";


    if (familyIncome)
        familyIncome.value =
            profile.familyIncome ??
            profile.FamilyIncome ??
            "";


    setYesNoValue(
        firstGraduate,
        profile.firstGraduate ||
        profile.FirstGraduate
    );


    setYesNoValue(
        singleChild,
        profile.singleChild ||
        profile.SingleChild
    );


    setYesNoValue(
        singleGirlChild,
        profile.singleGirlChild ||
        profile.SingleGirlChild
    );


    if (parentStatus)
        parentStatus.value =
            profile.parentStatus ||
            profile.ParentStatus ||
            "";


    if (familySupport)
        familySupport.value =
            profile.familySupport ||
            profile.FamilySupport ||
            "";


    /* ======================================================
       SPECIAL
    ====================================================== */

    if (specialCategory)
        specialCategory.value =
            profile.specialCategory ||
            profile.SpecialCategory ||
            "";


    if (entranceQualified)
        entranceQualified.value =
            profile.entranceQualified ||
            profile.EntranceQualified ||
            "";


    if (entranceExam)
        entranceExam.value =
            profile.entranceExam ||
            profile.EntranceExam ||
            "";


    if (examScore)
        examScore.value =
            profile.examScore ??
            profile.ExamScore ??
            "";


    if (examRank)
        examRank.value =
            profile.examRank ??
            profile.ExamRank ??
            "";


    if (meritStatus)
        meritStatus.value =
            profile.meritStatus ||
            profile.MeritStatus ||
            "";


    if (researchStatus)
        researchStatus.value =
            profile.researchStatus ||
            profile.ResearchStatus ||
            "";


    if (portfolioStatus)
        portfolioStatus.value =
            profile.portfolioStatus ||
            profile.PortfolioStatus ||
            "";


    if (interviewStatus)
        interviewStatus.value =
            profile.interviewStatus ||
            profile.InterviewStatus ||
            "";


    if (documentAvailability)
        documentAvailability.value =
            profile.documentAvailability ||
            profile.DocumentAvailability ||
            "";


    /*
       Restore first.
       Then dynamically hide/show questions.
    */

    updateDynamicQuestionVisibility();

}


/* ==========================================================
   HEADER PROFILE
========================================================== */

function initializeHeader() {

    const user =
        getCurrentUser();


    const image =
        document.getElementById(
            "headerProfileImage"
        );


    const fallback =
        document.getElementById(
            "headerProfileFallback"
        );


    const name =
        document.getElementById(
            "headerProfileName"
        );


    const displayName =
        user?.name ||
        user?.fullName ||
        user?.Name ||
        user?.username ||
        user?.Username ||
        "User";


    if (name) {

        name.textContent =
            displayName;

    }


    const photo =
        user?.photo ||
        user?.profilePhoto ||
        user?.profileImage ||
        user?.avatar ||
        user?.image ||
        "";


    if (
        image &&
        photo
    ) {

        image.src =
            photo;


        image.style.display =
            "block";


        if (fallback) {

            fallback.style.display =
                "none";

        }


        image.onerror =
            () => {

                image.style.display =
                    "none";


                if (fallback) {

                    fallback.style.display =
                        "flex";

                }

            };

    }

    else {

        if (image) {

            image.style.display =
                "none";

        }


        if (fallback) {

            fallback.style.display =
                "flex";

        }

    }

}


/* ==========================================================
   INPUT LIMITS
========================================================== */

function limitNumber(
    field,
    max
) {

    if (!field) return;


    field.addEventListener(
        "input",
        () => {

            if (
                field.value === ""
            ) {

                return;

            }


            const value =
                Number(field.value);


            if (
                Number.isFinite(value) &&
                value > max
            ) {

                field.value =
                    max;

            }

        }
    );

}


limitNumber(percentage, 100);
limitNumber(class10Percentage, 100);
limitNumber(class12Percentage, 100);
limitNumber(diplomaPercentage, 100);
limitNumber(ugPercentage, 100);
limitNumber(pgPercentage, 100);
limitNumber(percentile, 100);
limitNumber(attendance, 100);
limitNumber(cgpa, 10);


/* ==========================================================
   CLEAR ERROR WHILE TYPING
========================================================== */

document
    .querySelectorAll(
        "#eligibilityForm input, #eligibilityForm select"
    )
    .forEach(
        field => {

            field.addEventListener(
                "input",
                () => {

                    clearError(field);

                }
            );


            field.addEventListener(
                "change",
                () => {

                    clearError(field);

                }
            );

        }
    );


/* ==========================================================
   INITIALIZE
========================================================== */


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initializeHeader();

        const userId = getUserId();

        /* =====================================================
           NO LOGGED-IN USER
        ===================================================== */

        if (
            !userId ||
            userId === "guest"
        ) {

            console.warn(
                "No logged-in user found."
            );

            if (form) {
                form.reset();
            }

            updateDynamicQuestionVisibility();
            showStep(1);
            updateDisclaimerButton();

            return;
        }


        /* =====================================================
           IMPORTANT MULTI-USER PROTECTION
           -----------------------------------------------------
           Always start with a completely empty form.
           Do NOT allow values from another account/browser
           session to remain in the form.
        ===================================================== */

        if (form) {
            form.reset();
        }


        /* =====================================================
           RESET DYNAMIC COURSE FIELDS
        ===================================================== */

        if (courseCategory) {

            courseCategory.innerHTML =
                `<option value="">Select category</option>`;

            courseCategory.disabled = true;
        }


        if (course) {

            course.innerHTML =
                `<option value="">Select category first</option>`;

            course.disabled = true;
        }


        if (yearOfStudy) {

            yearOfStudy.innerHTML =
                `<option value="">Select your course first</option>`;

            yearOfStudy.disabled = true;
        }


        if (otherCourseGroup) {

            otherCourseGroup.classList.add(
                "hidden"
            );
        }


        /* =====================================================
           LOAD ONLY CURRENT USER'S LOCAL PROFILE
        ===================================================== */

        const localProfile =
            getSavedEligibilityProfile();


        if (
            localProfile &&
            profileBelongsToCurrentUser(
                localProfile
            )
        ) {

            restoreSavedProfile(
                localProfile
            );

        }


        /* =====================================================
           LOAD ONLY CURRENT USER'S GOOGLE SHEET PROFILE
        ===================================================== */

        const cloudProfile =
            await restoreProfileFromGAS();


        if (
            cloudProfile &&
            profileBelongsToCurrentUser(
                cloudProfile
            )
        ) {

            restoreSavedProfile(
                cloudProfile
            );

        }


        /* =====================================================
           FINAL UI UPDATE
        ===================================================== */

        updateDynamicQuestionVisibility();

        showStep(1);

        updateDisclaimerButton();

    }
);



/* ==========================================================
   GLOBAL API
========================================================== */

window.EligifyEligibility = {

    getUserId,

    getCurrentUser,

    getCurrentAccountEmail,

    getSavedEligibilityProfile,

    buildProfileData,

    saveEligibilityProfile,

    saveEligibilityToGAS,

    getEligibilityFromGAS,

    restoreProfileFromGAS,

    saveEligibilityHistory,

    finalizeProfileSave,

    normalizeCommunity,

    getYesNoValue,

    setYesNoValue,

    validateStep1,

    validateStep2,

    validateStep3,

    validateStep4,

    validateStep5,

    showStep,

    updateCourseCategories,

    updateCourses,

    updateYears,

    updateDynamicQuestionVisibility,

    updateAcademicVisibility,

    updateSpecialVisibility

};
/* ==========================================
   DASHBOARD BACK BUTTON
========================================== */

const dashboardBackBtn =
    document.getElementById("dashboardBackBtn");

if (dashboardBackBtn) {

    dashboardBackBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";

        }
    );

}
