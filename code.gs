/* =========================================================
   ELIGIFY
   GOOGLE APPS SCRIPT BACKEND

   FEATURES
   1. Scholarship CRUD
   2. Notifications
   3. User Reviews
   4. User Edit Review
   5. Admin Review Management
   6. Admin Approve / Reject Review
   7. Admin Reply to Review
   8. Delete Review
   9. Real-time synced review data
   10. User Account History
   11. Secure User Signup
   12. Secure User Login
   13. Secure Forgot Password
   14. Secure Password Reset
   15. Eligibility Profile Save
   16. Eligibility Profile Get
   17. Eligibility Profile History / Multiple Saves
========================================================= */


/* =========================================================
   SHEET NAMES
========================================================= */

const SHEET_NAME = "Eligify";
const NOTIFICATION_SHEET_NAME = "Notifications";
const REVIEW_SHEET_NAME = "Reviews";
const USER_SHEET_NAME = "Users";
const ELIGIBILITY_SHEET_NAME = "EligibilityProfiles";


/* =========================================================
   SCHOLARSHIP HEADERS
========================================================= */

const SCHOLARSHIP_HEADERS = [
    "Id",
    "Scholarship Name",
    "Provider",
    "Category",
    "State",
    "Course Level",
    "Eligible Courses",
    "Scholarship Type",
    "Gender",
    "Community",
    "Family Income Limit",
    "Minimum Marks",
    "Scholarship Amount",
    "Single Child",
    "Application Mode",
    "Age Limit",
    "First Graduate",
    "Start Date",
    "Last Date",
    "Apply Link",
    "Status",
    "Required Documents"
];


/* =========================================================
   REVIEW HEADERS
========================================================= */

const REVIEW_HEADERS = [
    "ID",
    "UserId",
    "Username",
    "Name",
    "Email",
    "Rating",
    "Review",
    "Status",
    "CreatedAt",
    "UpdatedAt",
    "AdminReply",
    "AdminReplyAt"
];


/* =========================================================
   NOTIFICATION HEADERS
========================================================= */

const NOTIFICATION_HEADERS = [
    "ID",
    "Title",
    "Message",
    "Target",
    "Type",
    "Read",
    "CreatedAt",
    "Email",
    "UserId"
];


/* =========================================================
   USER HEADERS
========================================================= */

const USER_HEADERS = [
    "UserId",
    "Username",
    "Name",
    "Email",
    "CreatedAt",
    "Status",
    "PasswordHash"
];


/* =========================================================
   ELIGIBILITY PROFILE HEADERS
   ---------------------------------------------------------
   One row = one eligibility profile save.

   Same UserId can have multiple rows.
   Every save creates a NEW ROW.
========================================================= */

const ELIGIBILITY_HEADERS = [

    "ProfileId",
    "UserId",
    "Name",
    "Email",

    "EducationLevel",
    "CourseCategory",
    "Course",
    "YearOfStudy",
    "InstitutionName",

    "State",
    "DomicileStatus",
    "Gender",
    "Age",
    "Citizenship",
    "DisabilityStatus",

    "SchoolType",
    "GovernmentSchool",

    "Percentage",
    "Class10Percentage",
    "Class12Percentage",
    "DiplomaPercentage",
    "UGPercentage",
    "PGPercentage",
    "CGPA",
    "Percentile",

    "PreviousExamStatus",
    "FirstAttemptPass",
    "Attendance",

    "Community",
    "MinorityCommunity",
    "FamilyIncome",
    "EWSStatus",
    "FirstGraduate",
    "SingleChild",
    "SingleGirlChild",
    "ParentStatus",
    "SpecialCategory",

    "EntranceQualified",
    "EntranceExam",
    "ExamScore",
    "ExamRank",
    "MeritStatus",

    "ResearchStatus",
    "PortfolioStatus",
    "InterviewStatus",
    "DocumentAvailability",

    "UpdatedAt"

];


/* =========================================================
   GET
========================================================= */

function doGet(e) {

    try {

        const params =
            e && e.parameter
                ? e.parameter
                : {};

        const type =
            String(
                params.type || ""
            )
                .trim()
                .toLowerCase();

        /* =====================================================
   CHECK USER EXISTS
===================================================== */

if (type === "checkuser") {

    const email =
        String(
            params.email || ""
        )
            .trim()
            .toLowerCase();

    const username =
        String(
            params.username || ""
        )
            .trim()
            .toLowerCase();

    const result =
        checkUserExists(
            email,
            username
        );

    return jsonResponse(result);

}
        /* =====================================================
           USERS
        ===================================================== */

        if (type === "users") {

            return getUsersResponse();

        }


        /* =====================================================
           NOTIFICATIONS
        ===================================================== */

        if (type === "notifications") {

            return getNotificationsResponse(
                params
            );

        }


        /* =====================================================
           REVIEWS
        ===================================================== */

        if (type === "reviews") {

            return getReviewsResponse(
                params
            );

        }


        /* =====================================================
           ELIGIBILITY PROFILE
        ===================================================== */

        if (
            type === "eligibility" ||
            type === "eligibilityprofile"
        ) {

            const userId =
                String(
                    params.userId ||
                    params.UserId ||
                    ""
                ).trim();


            if (!userId) {

                throw new Error(
                    "User ID is required"
                );

            }


            const profile =
                getEligibilityProfile(
                    userId
                );


            return jsonResponse({

                success: true,

                profile:
                    profile

            });

        }


        /* =====================================================
           SCHOLARSHIPS
        ===================================================== */

        const sheet =
            getScholarshipSheet();


        const values =
            sheet
                .getDataRange()
                .getValues();


        if (values.length < 2) {

            return jsonResponse([]);

        }


        const headers =
            values.shift();


        const result =
            values.map(row => {

                const obj = {};


                headers.forEach(
                    (head, index) => {

                        let value =
                            row[index];


                        if (
                            value instanceof Date &&
                            !isNaN(value.getTime())
                        ) {

                            value =
                                Utilities.formatDate(
                                    value,
                                    Session.getScriptTimeZone(),
                                    "yyyy-MM-dd"
                                );

                        }


                        obj[head] =
                            value;

                    }
                );


                return obj;

            });


        return jsonResponse(
            result
        );

    }


    catch (error) {

        return jsonResponse({

            success: false,

            error:
                error.message ||
                String(error)

        });

    }

}


/* =========================================================
   POST
========================================================= */

function doPost(e) {

    try {

        if (
            !e ||
            !e.postData ||
            !e.postData.contents
        ) {

            throw new Error(
                "No POST data received"
            );

        }


        const request =
            JSON.parse(
                e.postData.contents
            );


        const action =
            String(
                request.action || ""
            ).trim();


        const data =
            request.data || {};


        /* =====================================================
           ADD USER
        ===================================================== */

        if (action === "addUser") {

            const user =
                addUser(
                    data
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                user:
                    user

            });

        }


        /* =====================================================
           LOGIN USER
        ===================================================== */

        if (action === "login") {

            const user =
                loginUser(
                    data
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                user:
                    user

            });

        }


        /* =====================================================
           FORGOT PASSWORD
        ===================================================== */

        if (action === "forgotPassword") {

            const resetData =
                createPasswordResetToken(
                    data
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                message:
                    "Verification successful",

                token:
                    resetData.token

            });

        }


        /* =====================================================
           RESET PASSWORD
        ===================================================== */

        if (action === "resetPassword") {

            const resetResult =
                resetPasswordWithToken(
                    data
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                message:
                    "Password reset successfully",

                user:
                    resetResult

            });

        }

    /* =====================================================
   UPDATE USER
===================================================== */

if (action === "updateUser") {

    const updatedUser =
        updateUser(
            data
        );

    SpreadsheetApp.flush();

    return jsonResponse(
        updatedUser
    );

}
        /* =====================================================
   CLOSE USER ACCOUNT
===================================================== */

if (action === "closeAccount") {

    const userId =
        String(
            data.userId ||
            data.UserId ||
            request.userId ||
            request.UserId ||
            ""
        ).trim();

    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }

    const closedUser =
        closeUserAccount(
            userId
        );

    SpreadsheetApp.flush();

    return jsonResponse({

        success: true,

        message:
            "Account closed successfully",

        user:
            closedUser

    });

}

        /* =====================================================
           SAVE ELIGIBILITY PROFILE
           -----------------------------------------------------
           EVERY SAVE = NEW ROW

           Same UserId is NOT used for update.
        ===================================================== */

        if (
            action === "saveEligibility" ||
            action === "saveEligibilityProfile"
        ) {

            const profile =
                saveEligibilityProfile(
                    data
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                message:
                    "Eligibility profile saved successfully",

                profile:
                    profile

            });

        }


        /* =====================================================
           GET ELIGIBILITY PROFILE
        ===================================================== */

        if (
            action === "getEligibility" ||
            action === "getEligibilityProfile"
        ) {

            const userId =
                String(
                    data.userId ||
                    data.UserId ||
                    request.userId ||
                    request.UserId ||
                    ""
                ).trim();


            if (!userId) {

                throw new Error(
                    "User ID is required"
                );

            }


            const profile =
                getEligibilityProfile(
                    userId
                );


            return jsonResponse({

                success: true,

                profile:
                    profile

            });

        }


        /* =====================================================
           DELETE ELIGIBILITY PROFILE
        ===================================================== */

        if (
            action === "deleteEligibility" ||
            action === "deleteEligibilityProfile"
        ) {

            const userId =
                String(
                    data.userId ||
                    data.UserId ||
                    request.userId ||
                    request.UserId ||
                    ""
                ).trim();


            if (!userId) {

                throw new Error(
                    "User ID is required"
                );

            }


            deleteEligibilityProfile(
                userId
            );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                message:
                    "Eligibility profile deleted successfully"

            });

        }


        /* =====================================================
           SEND NOTIFICATION
        ===================================================== */

        if (action === "sendNotification") {

            const notification =
                sendNotification(
                    data,
                    request.target
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                notification:
                    notification

            });

        }


        /* =====================================================
           MARK SINGLE NOTIFICATION READ
        ===================================================== */

        if (
            action ===
            "markNotificationRead"
        ) {

            const id =
                request.id ||
                data.id;


            if (!id) {

                throw new Error(
                    "Notification ID is missing"
                );

            }


            markNotificationRead(
                id
            );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true

            });

        }


        /* =====================================================
           MARK ALL NOTIFICATIONS READ
        ===================================================== */

        if (
            action ===
            "markAllNotificationsRead"
        ) {

            markAllNotificationsRead(
                request.email ||
                data.email,

                request.userId ||
                data.userId
            );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true

            });

        }


        /* =====================================================
           ADD REVIEW
        ===================================================== */

        if (action === "addReview") {

            const review =
                addReview(
                    data
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                review:
                    review

            });

        }


        /* =====================================================
           EDIT REVIEW
        ===================================================== */

        if (action === "editReview") {

            const reviewId =
                request.id ||
                data.id ||
                data.reviewId;


            if (!reviewId) {

                throw new Error(
                    "Review ID is missing"
                );

            }


            const updatedReview =
                editReview(
                    reviewId,
                    data
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                review:
                    updatedReview

            });

        }


        /* =====================================================
           APPROVE REVIEW
        ===================================================== */

        if (
            action ===
            "approveReview"
        ) {

            const reviewId =
                request.id ||
                data.id ||
                data.reviewId;


            if (!reviewId) {

                throw new Error(
                    "Review ID is missing"
                );

            }


            const updatedReview =
                updateReviewStatus(
                    reviewId,
                    "Approved"
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                review:
                    updatedReview

            });

        }


        /* =====================================================
           REJECT REVIEW
        ===================================================== */

        if (
            action ===
            "rejectReview"
        ) {

            const reviewId =
                request.id ||
                data.id ||
                data.reviewId;


            if (!reviewId) {

                throw new Error(
                    "Review ID is missing"
                );

            }


            const updatedReview =
                updateReviewStatus(
                    reviewId,
                    "Rejected"
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                review:
                    updatedReview

            });

        }


        /* =====================================================
           REPLY TO REVIEW
        ===================================================== */

        if (
            action ===
            "replyReview"
        ) {

            const reviewId =
                request.id ||
                data.id ||
                data.reviewId;


            const reply =
                String(
                    request.reply ||
                    data.reply ||
                    ""
                ).trim();


            if (!reviewId) {

                throw new Error(
                    "Review ID is missing"
                );

            }


            if (!reply) {

                throw new Error(
                    "Admin reply cannot be empty"
                );

            }


            if (reply.length > 1000) {

                throw new Error(
                    "Admin reply must be within 1000 characters"
                );

            }


            const updatedReview =
                replyToReview(
                    reviewId,
                    reply
                );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true,

                review:
                    updatedReview

            });

        }


        /* =====================================================
           DELETE REVIEW
        ===================================================== */

        if (
            action ===
            "deleteReview"
        ) {

            const reviewId =
                request.id ||
                data.id ||
                data.reviewId;


            if (!reviewId) {

                throw new Error(
                    "Review ID is missing"
                );

            }


            deleteReview(
                reviewId
            );


            SpreadsheetApp.flush();


            return jsonResponse({

                success: true

            });

        }


        /* =====================================================
           SCHOLARSHIP SHEET
        ===================================================== */

        const sheet =
            getScholarshipSheet();


        /* =====================================================
           ADD SCHOLARSHIP
        ===================================================== */

        if (action === "add") {

            const id =
                data.Id ||
                data.id ||
                Date.now().toString();


            const row =
                buildScholarshipRow(
                    id,
                    data
                );


            sheet.appendRow(
                row
            );

        }


        /* =====================================================
           EDIT SCHOLARSHIP
        ===================================================== */

        else if (action === "edit") {

            const id =
                data.Id ||
                data.id;


            if (!id) {

                throw new Error(
                    "Scholarship ID is missing"
                );

            }


            const rows =
                sheet
                    .getDataRange()
                    .getValues();


            let found =
                false;


            for (
                let i = 1;
                i < rows.length;
                i++
            ) {

                if (
                    String(rows[i][0]) ===
                    String(id)
                ) {

                    const row =
                        buildScholarshipRow(
                            id,
                            data
                        );


                    sheet
                        .getRange(
                            i + 1,
                            1,
                            1,
                            SCHOLARSHIP_HEADERS.length
                        )
                        .setValues([
                            row
                        ]);


                    found =
                        true;

                    break;

                }

            }


            if (!found) {

                throw new Error(
                    "Scholarship ID not found: " +
                    id
                );

            }

        }


        /* =====================================================
           DELETE SCHOLARSHIP
        ===================================================== */

        else if (action === "delete") {

            const id =
                request.id ||
                data.Id ||
                data.id;


            if (!id) {

                throw new Error(
                    "Scholarship ID is missing"
                );

            }


            const rows =
                sheet
                    .getDataRange()
                    .getValues();


            let found =
                false;


            for (
                let i = 1;
                i < rows.length;
                i++
            ) {

                if (
                    String(rows[i][0]) ===
                    String(id)
                ) {

                    sheet.deleteRow(
                        i + 1
                    );


                    found =
                        true;

                    break;

                }

            }


            if (!found) {

                throw new Error(
                    "Scholarship ID not found: " +
                    id
                );

            }

        }


        else {

            throw new Error(
                "Invalid action: " +
                action
            );

        }


        SpreadsheetApp.flush();


        return jsonResponse({

            success: true

        });

    }


    catch (error) {

        return jsonResponse({

            success: false,

            error:
                error.message ||
                String(error)

        });

    }

}


/* =========================================================
   PASSWORD HASHING
========================================================= */

function hashPassword(
    password
) {

    const plainPassword =
        String(
            password || ""
        );


    if (!plainPassword) {

        throw new Error(
            "Password is required"
        );

    }


    const digest =
        Utilities.computeDigest(
            Utilities.DigestAlgorithm.SHA_256,
            plainPassword,
            Utilities.Charset.UTF_8
        );


    return digest
        .map(function(byte) {

            const value =
                byte < 0
                    ? byte + 256
                    : byte;


            return (
                "0" +
                value.toString(16)
            )
                .slice(-2);

        })
        .join("");

}


/* =========================================================
   USER SHEET
========================================================= */

function getUserSheet() {

    const spreadsheet =
        SpreadsheetApp
            .getActiveSpreadsheet();


    let sheet =
        spreadsheet
            .getSheetByName(
                USER_SHEET_NAME
            );


    if (!sheet) {

        sheet =
            spreadsheet.insertSheet(
                USER_SHEET_NAME
            );

    }


    const lastRow =
        sheet.getLastRow();


    const lastColumn =
        sheet.getLastColumn();


    if (
        lastRow === 0 ||
        lastColumn === 0
    ) {

        sheet
            .getRange(
                1,
                1,
                1,
                USER_HEADERS.length
            )
            .setValues([
                USER_HEADERS
            ]);

    }


    else {

        const currentHeaders =
            sheet
                .getRange(
                    1,
                    1,
                    1,
                    Math.max(
                        lastColumn,
                        USER_HEADERS.length
                    )
                )
                .getValues()[0];


        USER_HEADERS.forEach(
            (header, index) => {

                if (
                    String(
                        currentHeaders[index] ||
                        ""
                    ).trim() !== header
                ) {

                    sheet
                        .getRange(
                            1,
                            index + 1
                        )
                        .setValue(
                            header
                        );

                }

            }
        );

    }


    sheet
        .getRange(
            1,
            1,
            1,
            USER_HEADERS.length
        )
        .setFontWeight("bold");


    sheet.setFrozenRows(1);


    return sheet;

}


/* =========================================================
   ADD USER
========================================================= */

function addUser(
    data
) {

    const sheet =
        getUserSheet();


    const userId =
        String(
            data.userId ||
            data.UserId ||
            data.id ||
            ""
        ).trim();


    const username =
        String(
            data.username ||
            data.Username ||
            ""
        ).trim();


    const name =
        String(
            data.name ||
            data.Name ||
            username ||
            "Eligify User"
        ).trim();


    const email =
        String(
            data.email ||
            data.Email ||
            ""
        )
            .trim()
            .toLowerCase();


    const password =
        String(
            data.password ||
            data.Password ||
            ""
        );


    const status =
        String(
            data.status ||
            data.Status ||
            "Active"
        ).trim();


    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }


    if (!username) {

        throw new Error(
            "Username is required"
        );

    }


    if (!email) {

        throw new Error(
            "Email is required"
        );

    }


    if (!password) {

        throw new Error(
            "Password is required"
        );

    }


    const passwordHash =
        hashPassword(
            password
        );


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const existingUserId =
            String(
                values[i][0] || ""
            ).trim();


        const existingUsername =
            String(
                values[i][1] || ""
            ).trim();


        const existingEmail =
            String(
                values[i][3] || ""
            )
                .trim()
                .toLowerCase();


        if (
            existingUserId &&
            existingUserId === userId
        ) {

            throw new Error(
                "User ID already exists"
            );

        }


        if (
            existingUsername &&
            existingUsername.toLowerCase() ===
            username.toLowerCase()
        ) {

            throw new Error(
                "Username already exists"
            );

        }


        if (
            existingEmail &&
            existingEmail === email
        ) {

            throw new Error(
                "Email already exists"
            );

        }

    }


    const createdAt =
        new Date();


    const finalStatus =
        status ||
        "Active";


    sheet.appendRow([

        userId,
        username,
        name,
        email,
        createdAt,
        finalStatus,
        passwordHash

    ]);


    return {

        userId:
            userId,

        username:
            username,

        name:
            name,

        email:
            email,

        createdAt:
            createdAt.toISOString(),

        status:
            finalStatus

    };

}

/* =========================================================
   UPDATE USER
   ---------------------------------------------------------
   Updates:
   - Username
   - Name
   - Email
   ---------------------------------------------------------
   PasswordHash is NOT changed
========================================================= */

function updateUser(data) {

    const userId =
        String(
            data.userId ||
            data.UserId ||
            ""
        ).trim();

    const username =
        String(
            data.username ||
            data.Username ||
            ""
        ).trim();

    const name =
        String(
            data.name ||
            data.Name ||
            ""
        ).trim();

    const email =
        String(
            data.email ||
            data.Email ||
            ""
        )
        .trim()
        .toLowerCase();


    if (!userId) {
        return {
            success: false,
            message: "User ID is required"
        };
    }


    if (!username) {
        return {
            success: false,
            message: "Username is required"
        };
    }


    if (!name) {
        return {
            success: false,
            message: "Name is required"
        };
    }


    /* USERNAME VALIDATION */

    if (!/^[A-Za-z0-9_.]+$/.test(username)) {

        return {
            success: false,
            message:
                "Username can contain only letters, numbers, underscore and dot"
        };

    }


    const sheet =
        getUserSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    let userRow = -1;

    let usernameExists = false;

    let emailExists = false;


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const rowUserId =
            String(
                values[i][0] || ""
            ).trim();


        const rowUsername =
            String(
                values[i][1] || ""
            )
            .trim()
            .toLowerCase();


        const rowEmail =
            String(
                values[i][3] || ""
            )
            .trim()
            .toLowerCase();


        /* CURRENT USER */

        if (
            rowUserId === userId
        ) {

            userRow =
                i + 1;

        }


        /* OTHER USER - USERNAME */

        if (
            rowUserId !== userId &&
            rowUsername ===
            username.toLowerCase()
        ) {

            usernameExists =
                true;

        }


        /* OTHER USER - EMAIL */

        if (
            rowUserId !== userId &&
            email &&
            rowEmail === email
        ) {

            emailExists =
                true;

        }

    }


    /* DUPLICATE USERNAME */

    if (usernameExists) {

        return {
            success: false,
            usernameExists: true,
            message:
                "Username already exists"
        };

    }


    /* DUPLICATE EMAIL */

    if (emailExists) {

        return {
            success: false,
            emailExists: true,
            message:
                "Email already exists"
        };

    }


    /* USER NOT FOUND */

    if (userRow === -1) {

        return {
            success: false,
            message:
                "User not found"
        };

    }


    /* UPDATE USER */

    sheet
        .getRange(
            userRow,
            2
        )
        .setValue(
            username
        );


    sheet
        .getRange(
            userRow,
            3
        )
        .setValue(
            name
        );


    sheet
        .getRange(
            userRow,
            4
        )
        .setValue(
            email
        );


    SpreadsheetApp.flush();


    return {

        success: true,

        message:
            "User updated successfully",

        userId:
            userId,

        username:
            username,

        name:
            name,

        email:
            email

    };

}
/* =========================================================
   CLOSE USER ACCOUNT
   ---------------------------------------------------------
   IMPORTANT:
   - User row is NOT deleted
   - Status becomes "Closed"
   - Only matching UserId is changed
========================================================= */

function closeUserAccount(
    userId
) {

    const cleanUserId =
        String(
            userId || ""
        ).trim();

    if (!cleanUserId) {

        throw new Error(
            "User ID is required"
        );

    }

    const sheet =
        getUserSheet();

    const values =
        sheet
            .getDataRange()
            .getValues();

    if (values.length < 2) {

        throw new Error(
            "User account not found"
        );

    }

    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const rowUserId =
            String(
                values[i][0] || ""
            ).trim();

        if (
            rowUserId ===
            cleanUserId
        ) {

            const currentStatus =
                String(
                    values[i][5] || ""
                ).trim();

            if (
                currentStatus.toLowerCase() ===
                "closed"
            ) {

                return {

                    userId:
                        rowUserId,

                    status:
                        "Closed"

                };

            }

            /* Status column = 6 */

            sheet
                .getRange(
                    i + 1,
                    6
                )
                .setValue(
                    "Closed"
                );

            SpreadsheetApp.flush();

            return {

                userId:
                    rowUserId,

                username:
                    String(
                        values[i][1] || ""
                    ).trim(),

                name:
                    String(
                        values[i][2] || ""
                    ).trim(),

                email:
                    String(
                        values[i][3] || ""
                    )
                    .trim()
                    .toLowerCase(),

                status:
                    "Closed"

            };

        }

    }

    throw new Error(
        "User account not found"
    );

}

/* =========================================================
   LOGIN USER
========================================================= */

function loginUser(
    data
) {

    const sheet =
        getUserSheet();


    const identifier =
        String(
            data.identifier ||
            data.username ||
            data.email ||
            ""
        )
            .trim()
            .toLowerCase();


    const password =
        String(
            data.password ||
            ""
        );


    if (!identifier) {

        throw new Error(
            "Username or email is required"
        );

    }


    if (!password) {

        throw new Error(
            "Password is required"
        );

    }


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        throw new Error(
            "Invalid username, email or password"
        );

    }


    const enteredPasswordHash =
        hashPassword(
            password
        );


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const row =
            values[i];


        const userId =
            String(
                row[0] || ""
            ).trim();


        const username =
            String(
                row[1] || ""
            )
                .trim()
                .toLowerCase();


        const name =
            String(
                row[2] || ""
            ).trim();


        const email =
            String(
                row[3] || ""
            )
                .trim()
                .toLowerCase();


        const createdAt =
            row[4];


        const status =
            String(
                row[5] || "Active"
            ).trim();


        const passwordHash =
            String(
                row[6] || ""
            ).trim();


        const identifierMatch =
            identifier === username ||
            identifier === email;


        const passwordMatch =
            passwordHash &&
            passwordHash ===
            enteredPasswordHash;


        if (
            identifierMatch &&
            passwordMatch
        ) {

            if (
                status.toLowerCase() !==
                "active"
            ) {

                throw new Error(
                    "Your account is not active"
                );

            }


            return {

                userId:
                    userId,

                username:
                    username,

                name:
                    name,

                email:
                    email,

                createdAt:
                    toISOStringSafe(
                        createdAt
                    ),

                status:
                    status

            };

        }

    }


    throw new Error(
        "Invalid username, email or password"
    );

}


/* =========================================================
   PASSWORD RESET TOKEN
========================================================= */

function createPasswordResetToken(
    data
) {

    const sheet =
        getUserSheet();


    const email =
        String(
            data.email ||
            data.Email ||
            ""
        )
            .trim()
            .toLowerCase();


    if (!email) {

        throw new Error(
            "Email is required"
        );

    }


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        throw new Error(
            "No registered account found with this email"
        );

    }


    let matchedUser =
        null;


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const row =
            values[i];


        const rowEmail =
            String(
                row[3] || ""
            )
                .trim()
                .toLowerCase();


        if (
            rowEmail ===
            email
        ) {

            const userId =
                String(
                    row[0] || ""
                ).trim();


            const username =
                String(
                    row[1] || ""
                ).trim();


            const name =
                String(
                    row[2] || ""
                ).trim();


            const status =
                String(
                    row[5] || "Active"
                ).trim();


            if (
                status.toLowerCase() !==
                "active"
            ) {

                throw new Error(
                    "Your account is not active"
                );

            }


            matchedUser = {

                userId:
                    userId,

                username:
                    username,

                name:
                    name,

                email:
                    rowEmail

            };


            break;

        }

    }


    if (!matchedUser) {

        throw new Error(
            "No registered account found with this email"
        );

    }


    const token =
        Utilities
            .getUuid()
            .replace(/-/g, "");


    const expiresAt =
        Date.now() +
        (10 * 60 * 1000);


    const tokenData = {

        userId:
            matchedUser.userId,

        username:
            matchedUser.username,

        name:
            matchedUser.name,

        email:
            matchedUser.email,

        expiresAt:
            expiresAt

    };


    PropertiesService
        .getScriptProperties()
        .setProperty(
            "RESET_TOKEN_" + token,
            JSON.stringify(
                tokenData
            )
        );


    return {

        token:
            token,

        expiresAt:
            expiresAt

    };

}


/* =========================================================
   RESET PASSWORD
========================================================= */

function resetPasswordWithToken(
    data
) {

    const token =
        String(
            data.token ||
            ""
        ).trim();


    const newPassword =
        String(
            data.password ||
            data.newPassword ||
            ""
        );


    const confirmPassword =
        String(
            data.confirmPassword ||
            data.confirm_password ||
            ""
        );


    if (!token) {

        throw new Error(
            "Reset token is missing"
        );

    }


    if (!newPassword) {

        throw new Error(
            "New password is required"
        );

    }


    if (
        confirmPassword &&
        newPassword !==
        confirmPassword
    ) {

        throw new Error(
            "Passwords do not match"
        );

    }


    if (newPassword.length < 6) {

        throw new Error(
            "Password must be at least 6 characters"
        );

    }


    const properties =
        PropertiesService
            .getScriptProperties();


    const propertyKey =
        "RESET_TOKEN_" +
        token;


    const storedToken =
        properties.getProperty(
            propertyKey
        );


    if (!storedToken) {

        throw new Error(
            "Invalid or expired reset token"
        );

    }


    let tokenData;


    try {

        tokenData =
            JSON.parse(
                storedToken
            );

    }

    catch (error) {

        properties.deleteProperty(
            propertyKey
        );


        throw new Error(
            "Invalid reset token"
        );

    }


    if (
        !tokenData.expiresAt ||
        Date.now() >
        Number(
            tokenData.expiresAt
        )
    ) {

        properties.deleteProperty(
            propertyKey
        );


        throw new Error(
            "Reset token has expired"
        );

    }


    const tokenUserId =
        String(
            tokenData.userId ||
            ""
        ).trim();


    const tokenEmail =
        String(
            tokenData.email ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        !tokenUserId ||
        !tokenEmail
    ) {

        properties.deleteProperty(
            propertyKey
        );


        throw new Error(
            "Invalid reset token data"
        );

    }


    const sheet =
        getUserSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    let userFound =
        false;


    let updatedUser =
        null;


    const passwordHash =
        hashPassword(
            newPassword
        );


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const row =
            values[i];


        const userId =
            String(
                row[0] || ""
            ).trim();


        const username =
            String(
                row[1] || ""
            ).trim();


        const name =
            String(
                row[2] || ""
            ).trim();


        const email =
            String(
                row[3] || ""
            )
                .trim()
                .toLowerCase();


        const createdAt =
            row[4];


        const status =
            String(
                row[5] || "Active"
            ).trim();


        if (
            userId ===
            tokenUserId &&
            email ===
            tokenEmail
        ) {

            if (
                status.toLowerCase() !==
                "active"
            ) {

                properties.deleteProperty(
                    propertyKey
                );


                throw new Error(
                    "Your account is not active"
                );

            }


            sheet
                .getRange(
                    i + 1,
                    7
                )
                .setValue(
                    passwordHash
                );


            userFound =
                true;


            updatedUser = {

                userId:
                    userId,

                username:
                    username,

                name:
                    name ||
                    "Eligify User",

                email:
                    email,

                createdAt:
                    toISOStringSafe(
                        createdAt
                    ),

                status:
                    status

            };


            break;

        }

    }


    if (!userFound) {

        properties.deleteProperty(
            propertyKey
        );


        throw new Error(
            "User account not found"
        );

    }


    properties.deleteProperty(
        propertyKey
    );


    SpreadsheetApp.flush();


    return updatedUser;

}

/* =====================================================
   CHECK USER EXISTS
   -----------------------------------------------------
   Checks Users sheet directly.

   email    -> case-insensitive
   username -> case-insensitive
===================================================== */

function checkUserExists(
    email,
    username
) {

    const sheet =
        getUserSheet();

    const values =
        sheet
            .getDataRange()
            .getValues();

    let emailExists =
        false;

    let usernameExists =
        false;


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const existingUsername =
            String(
                values[i][1] || ""
            )
                .trim()
                .toLowerCase();


        const existingEmail =
            String(
                values[i][3] || ""
            )
                .trim()
                .toLowerCase();


        if (
            email &&
            existingEmail === email
        ) {

            emailExists =
                true;

        }


        if (
            username &&
            existingUsername === username
        ) {

            usernameExists =
                true;

        }

    }


    return {

        success: true,

        emailExists:
            emailExists,

        usernameExists:
            usernameExists

    };

}

/* =========================================================
   GET USERS
========================================================= */

function getUsersResponse() {

    const sheet =
        getUserSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        return jsonResponse([]);

    }


    const headers =
        values.shift();


    const users =
        values.map(row => {

            const user = {};


            headers.forEach(
                (header, index) => {

                    let value =
                        row[index];


                    if (
                        value instanceof Date &&
                        !isNaN(value.getTime())
                    ) {

                        value =
                            value.toISOString();

                    }


                    user[header] =
                        value;

                }
            );


            return {

                userId:
                    user.UserId ||
                    user.userId ||
                    "",

                username:
                    user.Username ||
                    user.username ||
                    "",

                name:
                    user.Name ||
                    user.name ||
                    "Eligify User",

                email:
                    user.Email ||
                    user.email ||
                    "",

                createdAt:
                    user.CreatedAt ||
                    user.createdAt ||
                    "",

                status:
                    user.Status ||
                    user.status ||
                    "Active"

            };

        });


    users.reverse();


    return jsonResponse(
        users
    );

}


/* =========================================================
   ELIGIBILITY PROFILE SHEET
========================================================= */

function getEligibilitySheet() {

    const spreadsheet =
        SpreadsheetApp
            .getActiveSpreadsheet();


    let sheet =
        spreadsheet
            .getSheetByName(
                ELIGIBILITY_SHEET_NAME
            );


    if (!sheet) {

        sheet =
            spreadsheet.insertSheet(
                ELIGIBILITY_SHEET_NAME
            );

    }


    const lastRow =
        sheet.getLastRow();


    const lastColumn =
        sheet.getLastColumn();


    if (
        lastRow === 0 ||
        lastColumn === 0
    ) {

        sheet
            .getRange(
                1,
                1,
                1,
                ELIGIBILITY_HEADERS.length
            )
            .setValues([
                ELIGIBILITY_HEADERS
            ]);

    }


    else {

        const currentHeaders =
            sheet
                .getRange(
                    1,
                    1,
                    1,
                    Math.max(
                        lastColumn,
                        ELIGIBILITY_HEADERS.length
                    )
                )
                .getValues()[0];


        ELIGIBILITY_HEADERS.forEach(
            (header, index) => {

                if (
                    String(
                        currentHeaders[index] ||
                        ""
                    ).trim() !== header
                ) {

                    sheet
                        .getRange(
                            1,
                            index + 1
                        )
                        .setValue(
                            header
                        );

                }

            }
        );

    }


    sheet
        .getRange(
            1,
            1,
            1,
            ELIGIBILITY_HEADERS.length
        )
        .setFontWeight("bold");


    sheet.setFrozenRows(1);


    return sheet;

}


/* =========================================================
   SAVE ELIGIBILITY PROFILE
   ---------------------------------------------------------
   IMPORTANT:

   Every save creates a NEW ROW.

   Same UserId இருந்தாலும்
   existing row UPDATE ஆகாது.

   Save 1 -> Row 2
   Save 2 -> Row 3
   Save 3 -> Row 4
========================================================= */

function saveEligibilityProfile(
    data
) {

    const sheet =
        getEligibilitySheet();


    const userId =
        String(
            data.userId ||
            data.UserId ||
            ""
        ).trim();


    if (!userId) {

        throw new Error(
            "User ID is required to save eligibility profile"
        );

    }


    /* =====================================================
       UNIQUE PROFILE ID FOR EVERY SAVE
    ===================================================== */

    const profileId =
        "ELGPROFILE_" +
        userId +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8);


    /* =====================================================
       BUILD COMPLETE PROFILE ROW
    ===================================================== */

    const row =
        buildEligibilityRow(
            profileId,
            userId,
            data
        );


    /* =====================================================
       ALWAYS APPEND NEW ROW
       -----------------------------------------------------
       NO EXISTING USER SEARCH
       NO UPDATE
       NO UPSERT
    ===================================================== */

    sheet.appendRow(
        row
    );


    SpreadsheetApp.flush();


    return eligibilityRowToObject(
        row
    );

}


/* =========================================================
   BUILD ELIGIBILITY ROW
========================================================= */

function buildEligibilityRow(
    profileId,
    userId,
    data
) {

    const now =
        new Date();


    return [

        /* 1 */
        profileId,

        /* 2 */
        userId,

        /* 3
           IMPORTANT:
           Name comes ONLY from eligibility form.
           No account-name fallback.
        */
        cleanProfileValue(
            data.fullName !== undefined
                ? data.fullName
                : data.name !== undefined
                    ? data.name
                    : ""
        ),

        /* 4 */
        cleanProfileValue(
            data.email ||
            data.Email
        )
            .toLowerCase(),

        /* 5 */
        cleanProfileValue(
            data.educationLevel ||
            data.EducationLevel
        ),

        /* 6 */
        cleanProfileValue(
            data.courseCategory ||
            data.CourseCategory
        ),

        /* 7 */
        cleanProfileValue(
            data.course ||
            data.Course
        ),

        /* 8 */
        cleanProfileValue(
            data.yearOfStudy ||
            data.YearOfStudy
        ),

        /* 9 */
        cleanProfileValue(
            data.institutionName ||
            data.InstitutionName
        ),

        /* 10 */
        cleanProfileValue(
            data.state ||
            data.State
        ),

        /* 11 */
        cleanProfileValue(
            data.domicileStatus ||
            data.DomicileStatus
        ),

        /* 12 */
        cleanProfileValue(
            data.gender ||
            data.Gender
        ),

        /* 13 */
        cleanProfileValue(
            data.age ||
            data.Age
        ),

        /* 14 */
        cleanProfileValue(
            data.citizenship ||
            data.Citizenship
        ),

        /* 15 */
        cleanProfileValue(
            data.disabilityStatus ||
            data.DisabilityStatus
        ),

        /* 16 */
        cleanProfileValue(
            data.schoolType ||
            data.SchoolType
        ),

        /* 17 */
        cleanProfileValue(
            data.governmentSchool ||
            data.GovernmentSchool
        ),

        /* 18 */
        cleanProfileValue(
            data.percentage ||
            data.Percentage
        ),

        /* 19 */
        cleanProfileValue(
            data.class10Percentage ||
            data.Class10Percentage
        ),

        /* 20 */
        cleanProfileValue(
            data.class12Percentage ||
            data.Class12Percentage
        ),

        /* 21 */
        cleanProfileValue(
            data.diplomaPercentage ||
            data.DiplomaPercentage
        ),

        /* 22 */
        cleanProfileValue(
            data.ugPercentage ||
            data.UGPercentage
        ),

        /* 23 */
        cleanProfileValue(
            data.pgPercentage ||
            data.PGPercentage
        ),

        /* 24 */
        cleanProfileValue(
            data.cgpa ||
            data.CGPA
        ),

        /* 25 */
        cleanProfileValue(
            data.percentile ||
            data.Percentile
        ),

        /* 26 */
        cleanProfileValue(
            data.previousExamStatus ||
            data.PreviousExamStatus
        ),

        /* 27 */
        cleanProfileValue(
            data.firstAttemptPass ||
            data.FirstAttemptPass
        ),

        /* 28 */
        cleanProfileValue(
            data.attendance ||
            data.Attendance
        ),

        /* 29 */
        cleanProfileValue(
            data.community ||
            data.Community
        ),

        /* 30 */
        cleanProfileValue(
            data.minorityCommunity ||
            data.MinorityCommunity ||
            data.minorityStatus ||
            data.MinorityStatus
        ),

        /* 31 */
        cleanProfileValue(
            data.familyIncome ||
            data.FamilyIncome
        ),

        /* 32 */
        cleanProfileValue(
            data.ewsStatus ||
            data.EWSStatus
        ),

        /* 33 */
        cleanProfileValue(
            data.firstGraduate ||
            data.FirstGraduate
        ),

        /* 34 */
        cleanProfileValue(
            data.singleChild ||
            data.SingleChild
        ),

        /* 35 */
        cleanProfileValue(
            data.singleGirlChild ||
            data.SingleGirlChild
        ),

        /* 36 */
        cleanProfileValue(
            data.parentStatus ||
            data.ParentStatus
        ),

        /* 37 */
        cleanProfileValue(
            data.specialCategory ||
            data.SpecialCategory
        ),

        /* 38 */
        cleanProfileValue(
            data.entranceQualified ||
            data.EntranceQualified
        ),

        /* 39 */
        cleanProfileValue(
            data.entranceExam ||
            data.EntranceExam
        ),

        /* 40 */
        cleanProfileValue(
            data.examScore ||
            data.ExamScore
        ),

        /* 41 */
        cleanProfileValue(
            data.examRank ||
            data.ExamRank
        ),

        /* 42 */
        cleanProfileValue(
            data.meritStatus ||
            data.MeritStatus
        ),

        /* 43 */
        cleanProfileValue(
            data.researchStatus ||
            data.ResearchStatus
        ),

        /* 44 */
        cleanProfileValue(
            data.portfolioStatus ||
            data.PortfolioStatus
        ),

        /* 45 */
        cleanProfileValue(
            data.interviewStatus ||
            data.InterviewStatus
        ),

        /* 46 */
        cleanProfileValue(
            data.documentAvailability ||
            data.DocumentAvailability
        ),

        /* 47 */
        now

    ];

}


/* =========================================================
   GET ELIGIBILITY PROFILE
   ---------------------------------------------------------
   Returns the FIRST matching profile currently stored.
========================================================= */

function getEligibilityProfile(
    userId
) {

    const cleanUserId =
        String(
            userId ||
            ""
        ).trim();


    if (!cleanUserId) {

        throw new Error(
            "User ID is required"
        );

    }


    const sheet =
        getEligibilitySheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        return null;

    }


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const rowUserId =
            String(
                values[i][1] || ""
            ).trim();


        if (
            rowUserId ===
            cleanUserId
        ) {

            return eligibilityRowToObject(
                values[i]
            );

        }

    }


    return null;

}


/* =========================================================
   DELETE ELIGIBILITY PROFILE
========================================================= */

function deleteEligibilityProfile(
    userId
) {

    const cleanUserId =
        String(
            userId ||
            ""
        ).trim();


    if (!cleanUserId) {

        throw new Error(
            "User ID is required"
        );

    }


    const sheet =
        getEligibilitySheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const rowUserId =
            String(
                values[i][1] || ""
            ).trim();


        if (
            rowUserId ===
            cleanUserId
        ) {

            sheet.deleteRow(
                i + 1
            );


            return true;

        }

    }


    return false;

}


/* =========================================================
   ELIGIBILITY ROW -> OBJECT
========================================================= */

function eligibilityRowToObject(
    row
) {

    const profile = {};


    ELIGIBILITY_HEADERS.forEach(
        function(header, index) {

            let value =
                row[index];


            if (
                value instanceof Date &&
                !isNaN(value.getTime())
            ) {

                value =
                    value.toISOString();

            }


            profile[header] =
                value === null ||
                value === undefined
                    ? ""
                    : value;

        }
    );


    profile.profileId =
        profile.ProfileId || "";

    profile.userId =
        profile.UserId || "";

    profile.name =
        profile.Name || "";

    profile.email =
        profile.Email || "";

    profile.educationLevel =
        profile.EducationLevel || "";

    profile.courseCategory =
        profile.CourseCategory || "";

    profile.course =
        profile.Course || "";

    profile.yearOfStudy =
        profile.YearOfStudy || "";

    profile.institutionName =
        profile.InstitutionName || "";

    profile.state =
        profile.State || "";

    profile.domicileStatus =
        profile.DomicileStatus || "";

    profile.gender =
        profile.Gender || "";

    profile.age =
        profile.Age || "";

    profile.citizenship =
        profile.Citizenship || "";

    profile.disabilityStatus =
        profile.DisabilityStatus || "";

    profile.schoolType =
        profile.SchoolType || "";

    profile.governmentSchool =
        profile.GovernmentSchool || "";

    profile.percentage =
        profile.Percentage || "";

    profile.class10Percentage =
        profile.Class10Percentage || "";

    profile.class12Percentage =
        profile.Class12Percentage || "";

    profile.diplomaPercentage =
        profile.DiplomaPercentage || "";

    profile.ugPercentage =
        profile.UGPercentage || "";

    profile.pgPercentage =
        profile.PGPercentage || "";

    profile.cgpa =
        profile.CGPA || "";

    profile.percentile =
        profile.Percentile || "";

    profile.previousExamStatus =
        profile.PreviousExamStatus || "";

    profile.firstAttemptPass =
        profile.FirstAttemptPass || "";

    profile.attendance =
        profile.Attendance || "";

    profile.community =
        profile.Community || "";

    profile.minorityCommunity =
        profile.MinorityCommunity || "";

    profile.familyIncome =
        profile.FamilyIncome || "";

    profile.ewsStatus =
        profile.EWSStatus || "";

    profile.firstGraduate =
        profile.FirstGraduate || "";

    profile.singleChild =
        profile.SingleChild || "";

    profile.singleGirlChild =
        profile.SingleGirlChild || "";

    profile.parentStatus =
        profile.ParentStatus || "";

    profile.specialCategory =
        profile.SpecialCategory || "";

    profile.entranceQualified =
        profile.EntranceQualified || "";

    profile.entranceExam =
        profile.EntranceExam || "";

    profile.examScore =
        profile.ExamScore || "";

    profile.examRank =
        profile.ExamRank || "";

    profile.meritStatus =
        profile.MeritStatus || "";

    profile.researchStatus =
        profile.ResearchStatus || "";

    profile.portfolioStatus =
        profile.PortfolioStatus || "";

    profile.interviewStatus =
        profile.InterviewStatus || "";

    profile.documentAvailability =
        profile.DocumentAvailability || "";

    profile.updatedAt =
        profile.UpdatedAt || "";


    return profile;

}


/* =========================================================
   CLEAN PROFILE VALUE
========================================================= */

function cleanProfileValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    if (
        typeof value === "object"
    ) {

        return JSON.stringify(
            value
        );

    }


    return String(
        value
    ).trim();

}


/* =========================================================
   SCHOLARSHIP SHEET
========================================================= */

function getScholarshipSheet() {

    const spreadsheet =
        SpreadsheetApp
            .getActiveSpreadsheet();


    const sheet =
        spreadsheet
            .getSheetByName(
                SHEET_NAME
            );


    if (!sheet) {

        throw new Error(
            "Sheet not found: " +
            SHEET_NAME
        );

    }


    return sheet;

}


/* =========================================================
   BUILD SCHOLARSHIP ROW
========================================================= */

function buildScholarshipRow(
    id,
    data
) {

    return [

        id,

        data["Scholarship Name"] ||
        "",

        data.Provider ||
        "",

        data.Category ||
        "",

        data.State ||
        "",

        data["Course Level"] ||
        "",

        data["Eligible Courses"] ||
        "",

        data["Scholarship Type"] ||
        "",

        data.Gender ||
        "All",

        data.Community ||
        "",

        data["Family Income Limit"] ||
        "",

        data["Minimum Marks"] ||
        "",

        data["Scholarship Amount"] ||
        "",

        data["Single Child"] ||
        "All",

        data["Application Mode"] ||
        "",

        data["Age Limit"] ||
        "",

        data["First Graduate"] ||
        "All",

        data["Start Date"] ||
        "",

        data["Last Date"] ||
        "",

        data["Apply Link"] ||
        "",

        data.Status !== undefined &&
        data.Status !== null
            ? data.Status
            : "Active",

        data["Required Documents"] ||
        ""

    ];

}


/* =========================================================
   NOTIFICATION SHEET
========================================================= */

function getNotificationSheet() {

    const spreadsheet =
        SpreadsheetApp
            .getActiveSpreadsheet();


    let sheet =
        spreadsheet
            .getSheetByName(
                NOTIFICATION_SHEET_NAME
            );


    if (!sheet) {

        sheet =
            spreadsheet.insertSheet(
                NOTIFICATION_SHEET_NAME
            );


        sheet
            .getRange(
                1,
                1,
                1,
                NOTIFICATION_HEADERS.length
            )
            .setValues([
                NOTIFICATION_HEADERS
            ]);

    }


    return sheet;

}


/* =========================================================
   SEND NOTIFICATION
========================================================= */

function sendNotification(
    data,
    requestTarget
) {

    const sheet =
        getNotificationSheet();


    const id =
        data.id ||
        data.Id ||
        (
            "notification_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );


    const title =
        String(
            data.title ||
            data.Title ||
            ""
        ).trim();


    const message =
        String(
            data.message ||
            data.Message ||
            ""
        ).trim();


    const target =
        String(
            requestTarget ||
            data.target ||
            data.Target ||
            "all"
        )
            .trim()
            .toLowerCase();


    const type =
        String(
            data.type ||
            data.Type ||
            "general"
        )
            .trim()
            .toLowerCase();


    const email =
        String(
            data.email ||
            data.Email ||
            data.userEmail ||
            ""
        )
            .trim()
            .toLowerCase();


    const userId =
        String(
            data.userId ||
            data.UserId ||
            ""
        ).trim();


    if (!title) {

        throw new Error(
            "Notification title is required"
        );

    }


    if (!message) {

        throw new Error(
            "Notification message is required"
        );

    }


    if (title.length > 100) {

        throw new Error(
            "Notification title must be within 100 characters"
        );

    }


    if (message.length > 1000) {

        throw new Error(
            "Notification message must be within 1000 characters"
        );

    }


    const createdAt =
        new Date();


    sheet.appendRow([

        id,
        title,
        message,
        target || "all",
        type || "general",
        false,
        createdAt,
        email,
        userId

    ]);


    return {

        id: id,
        title: title,
        message: message,
        target: target || "all",
        type: type || "general",
        read: false,
        createdAt: createdAt.toISOString(),
        email: email,
        userId: userId

    };

}


/* =========================================================
   GET NOTIFICATIONS
========================================================= */

function getNotificationsResponse(
    params
) {

    const sheet =
        getNotificationSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        return jsonResponse([]);

    }


    const headers =
        values.shift();


    const notifications =
        values.map(row => {

            const notification =
                {};


            headers.forEach(
                (header, index) => {

                    let value =
                        row[index];


                    if (
                        value instanceof Date &&
                        !isNaN(value.getTime())
                    ) {

                        value =
                            value.toISOString();

                    }


                    notification[header] =
                        value;

                }
            );


            notification.id =
                notification.ID ||
                notification.id ||
                "";


            notification.title =
                notification.Title ||
                notification.title ||
                "";


            notification.message =
                notification.Message ||
                notification.message ||
                "";


            notification.target =
                notification.Target ||
                notification.target ||
                "all";


            notification.type =
                notification.Type ||
                notification.type ||
                "general";


            notification.read =
                notification.Read === true ||
                String(
                    notification.Read
                ).toLowerCase() === "true";


            notification.createdAt =
                notification.CreatedAt ||
                notification.createdAt ||
                "";


            notification.email =
                notification.Email ||
                notification.email ||
                "";


            notification.userId =
                notification.UserId ||
                notification.userId ||
                "";


            return notification;

        });


    notifications.reverse();


    return jsonResponse(
        notifications
    );

}


/* =========================================================
   MARK SINGLE NOTIFICATION READ
========================================================= */

function markNotificationRead(
    notificationId
) {

    const sheet =
        getNotificationSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        if (
            String(values[i][0]) ===
            String(notificationId)
        ) {

            sheet
                .getRange(
                    i + 1,
                    6
                )
                .setValue(true);


            return;

        }

    }


    throw new Error(
        "Notification ID not found: " +
        notificationId
    );

}


/* =========================================================
   MARK ALL NOTIFICATIONS READ
========================================================= */

function markAllNotificationsRead(
    requestEmail,
    requestUserId
) {

    const sheet =
        getNotificationSheet();


    const email =
        String(
            requestEmail || ""
        )
            .trim()
            .toLowerCase();


    const userId =
        String(
            requestUserId || ""
        ).trim();


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        return;

    }


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const target =
            String(
                values[i][3] ||
                "all"
            )
                .trim()
                .toLowerCase();


        const notificationEmail =
            String(
                values[i][7] || ""
            )
                .trim()
                .toLowerCase();


        const notificationUserId =
            String(
                values[i][8] || ""
            ).trim();


        let belongsToUser =
            false;


        if (
            target === "all" ||
            target === "users" ||
            target === "everyone" ||
            target === ""
        ) {

            belongsToUser =
                true;

        }


        if (
            email &&
            notificationEmail &&
            email === notificationEmail
        ) {

            belongsToUser =
                true;

        }


        if (
            userId &&
            notificationUserId &&
            userId === notificationUserId
        ) {

            belongsToUser =
                true;

        }


        if (belongsToUser) {

            sheet
                .getRange(
                    i + 1,
                    6
                )
                .setValue(true);

        }

    }

}


/* =========================================================
   REVIEW SHEET
========================================================= */

function getReviewSheet() {

    const spreadsheet =
        SpreadsheetApp
            .getActiveSpreadsheet();


    let sheet =
        spreadsheet
            .getSheetByName(
                REVIEW_SHEET_NAME
            );


    if (!sheet) {

        sheet =
            spreadsheet.insertSheet(
                REVIEW_SHEET_NAME
            );

    }


    const lastColumn =
        sheet.getLastColumn();


    const lastRow =
        sheet.getLastRow();


    if (
        lastRow === 0 ||
        lastColumn === 0
    ) {

        sheet
            .getRange(
                1,
                1,
                1,
                REVIEW_HEADERS.length
            )
            .setValues([
                REVIEW_HEADERS
            ]);

    }


    else {

        const currentHeaders =
            sheet
                .getRange(
                    1,
                    1,
                    1,
                    Math.max(
                        lastColumn,
                        REVIEW_HEADERS.length
                    )
                )
                .getValues()[0];


        REVIEW_HEADERS.forEach(
            (header, index) => {

                if (
                    String(
                        currentHeaders[index] ||
                        ""
                    ).trim() !== header
                ) {

                    sheet
                        .getRange(
                            1,
                            index + 1
                        )
                        .setValue(header);

                }

            }
        );

    }


    sheet
        .getRange(
            1,
            1,
            1,
            REVIEW_HEADERS.length
        )
        .setFontWeight("bold");


    sheet.setFrozenRows(1);


    return sheet;

}


/* =========================================================
   ADD REVIEW
========================================================= */

function addReview(
    data
) {

    const sheet =
        getReviewSheet();


    const userId =
        String(
            data.userId ||
            data.UserId ||
            ""
        ).trim();


    const username =
        String(
            data.username ||
            data.Username ||
            ""
        ).trim();


    const name =
        String(
            data.name ||
            data.Name ||
            username ||
            "Eligify User"
        ).trim();


    const email =
        String(
            data.email ||
            data.Email ||
            ""
        )
            .trim()
            .toLowerCase();


    const rating =
        Number(
            data.rating ||
            data.Rating ||
            0
        );


    const review =
        String(
            data.review ||
            data.Review ||
            data.text ||
            ""
        ).trim();


    validateReviewInput(
        userId,
        email,
        rating,
        review
    );


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const existingUserId =
            String(
                values[i][1] || ""
            ).trim();


        const existingEmail =
            String(
                values[i][4] || ""
            )
                .trim()
                .toLowerCase();


        const existingStatus =
            String(
                values[i][7] || ""
            )
                .trim()
                .toLowerCase();


        const sameUser =
            userId &&
            existingUserId &&
            userId === existingUserId;


        const sameEmail =
            email &&
            existingEmail &&
            email === existingEmail;


        if (
            sameUser ||
            sameEmail
        ) {

            if (
                existingStatus !==
                "rejected"
            ) {

                throw new Error(
                    "You have already submitted a review"
                );

            }

        }

    }


    const id =
        "review_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8);


    const createdAt =
        new Date();


    const status =
        "Pending";


    sheet.appendRow([

        id,
        userId,
        username,
        name,
        email,
        rating,
        review,
        status,
        createdAt,
        createdAt,
        "",
        ""

    ]);


    return buildReviewObject(
        id,
        userId,
        username,
        name,
        email,
        rating,
        review,
        status,
        createdAt,
        createdAt,
        "",
        ""
    );

}


/* =========================================================
   VALIDATE REVIEW INPUT
========================================================= */

function validateReviewInput(
    userId,
    email,
    rating,
    review
) {

    if (!userId && !email) {

        throw new Error(
            "User information is missing"
        );

    }


    if (
        !rating ||
        rating < 1 ||
        rating > 5
    ) {

        throw new Error(
            "Rating must be between 1 and 5"
        );

    }


    if (
        !Number.isInteger(rating)
    ) {

        throw new Error(
            "Rating must be a whole number between 1 and 5"
        );

    }


    if (!review) {

        throw new Error(
            "Review cannot be empty"
        );

    }


    if (review.length < 5) {

        throw new Error(
            "Review is too short"
        );

    }


    if (review.length > 500) {

        throw new Error(
            "Review must be within 500 characters"
        );

    }

}


/* =========================================================
   EDIT REVIEW
========================================================= */

function editReview(
    reviewId,
    data
) {

    const sheet =
        getReviewSheet();


    const requestUserId =
        String(
            data.userId ||
            data.UserId ||
            ""
        ).trim();


    const requestEmail =
        String(
            data.email ||
            data.Email ||
            ""
        )
            .trim()
            .toLowerCase();


    const newRating =
        Number(
            data.rating ||
            data.Rating ||
            0
        );


    const newReview =
        String(
            data.review ||
            data.Review ||
            data.text ||
            ""
        ).trim();


    if (
        !requestUserId &&
        !requestEmail
    ) {

        throw new Error(
            "User information is required to edit review"
        );

    }


    validateReviewInput(
        requestUserId,
        requestEmail,
        newRating,
        newReview
    );


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        const currentReviewId =
            String(
                values[i][0] || ""
            ).trim();


        if (
            currentReviewId !==
            String(reviewId).trim()
        ) {

            continue;

        }


        const storedUserId =
            String(
                values[i][1] || ""
            ).trim();


        const storedEmail =
            String(
                values[i][4] || ""
            )
                .trim()
                .toLowerCase();


        const isOwner =
            (
                requestUserId &&
                storedUserId &&
                requestUserId ===
                storedUserId
            ) ||
            (
                requestEmail &&
                storedEmail &&
                requestEmail ===
                storedEmail
            );


        if (!isOwner) {

            throw new Error(
                "You can edit only your own review"
            );

        }


        const now =
            new Date();


        sheet
            .getRange(
                i + 1,
                6
            )
            .setValue(
                newRating
            );


        sheet
            .getRange(
                i + 1,
                7
            )
            .setValue(
                newReview
            );


        sheet
            .getRange(
                i + 1,
                8
            )
            .setValue(
                "Pending"
            );


        sheet
            .getRange(
                i + 1,
                10
            )
            .setValue(
                now
            );


        sheet
            .getRange(
                i + 1,
                11,
                1,
                2
            )
            .setValues([
                ["", ""]
            ]);


        SpreadsheetApp.flush();


        const updatedRow =
            sheet
                .getRange(
                    i + 1,
                    1,
                    1,
                    REVIEW_HEADERS.length
                )
                .getValues()[0];


        return reviewRowToObject(
            updatedRow
        );

    }


    throw new Error(
        "Review ID not found: " +
        reviewId
    );

}


/* =========================================================
   GET REVIEWS
========================================================= */

function getReviewsResponse(
    params
) {

    const sheet =
        getReviewSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    if (values.length < 2) {

        return jsonResponse([]);

    }


    const headers =
        values.shift();


    const isAdmin =
        String(
            params.admin || ""
        )
            .toLowerCase() ===
        "true";


    const requestedUserId =
        String(
            params.userId || ""
        ).trim();


    const requestedEmail =
        String(
            params.email || ""
        )
            .trim()
            .toLowerCase();


    const reviews =
        values.map(row => {

            const review = {};


            headers.forEach(
                (header, index) => {

                    let value =
                        row[index];


                    if (
                        value instanceof Date &&
                        !isNaN(value.getTime())
                    ) {

                        value =
                            value.toISOString();

                    }


                    review[header] =
                        value;

                }
            );


            return normalizeReviewObject(
                review
            );

        });


    if (isAdmin) {

        reviews.sort(
            newestReviewFirst
        );


        return jsonResponse(
            reviews
        );

    }


    let filteredReviews =
        reviews.filter(
            review =>
                String(
                    review.status
                )
                    .toLowerCase() ===
                "approved"
        );


    if (
        requestedUserId ||
        requestedEmail
    ) {

        const userReviews =
            reviews.filter(
                review => {

                    const sameUserId =
                        requestedUserId &&
                        String(
                            review.userId
                        ).trim() ===
                        requestedUserId;


                    const sameEmail =
                        requestedEmail &&
                        String(
                            review.email
                        )
                            .trim()
                            .toLowerCase() ===
                        requestedEmail;


                    return (
                        sameUserId ||
                        sameEmail
                    );

                }
            );


        userReviews.forEach(
            userReview => {

                const exists =
                    filteredReviews.some(
                        review =>
                            review.id ===
                            userReview.id
                    );


                if (!exists) {

                    filteredReviews.push(
                        userReview
                    );

                }

            }
        );

    }


    filteredReviews.sort(
        newestReviewFirst
    );


    return jsonResponse(
        filteredReviews
    );

}


/* =========================================================
   NORMALIZE REVIEW OBJECT
========================================================= */

function normalizeReviewObject(
    review
) {

    return {

        id:
            review.ID ||
            review.id ||
            "",

        userId:
            review.UserId ||
            review.userId ||
            "",

        username:
            review.Username ||
            review.username ||
            "",

        name:
            review.Name ||
            review.name ||
            "Eligify User",

        email:
            review.Email ||
            review.email ||
            "",

        rating:
            Number(
                review.Rating ||
                review.rating ||
                0
            ),

        review:
            review.Review ||
            review.review ||
            "",

        status:
            review.Status ||
            review.status ||
            "Pending",

        createdAt:
            review.CreatedAt ||
            review.createdAt ||
            "",

        updatedAt:
            review.UpdatedAt ||
            review.updatedAt ||
            "",

        adminReply:
            review.AdminReply ||
            review.adminReply ||
            "",

        adminReplyAt:
            review.AdminReplyAt ||
            review.adminReplyAt ||
            ""

    };

}


/* =========================================================
   REVIEW ROW -> OBJECT
========================================================= */

function reviewRowToObject(
    row
) {

    return buildReviewObject(

        row[0],
        row[1],
        row[2],
        row[3],
        row[4],
        Number(row[5]) || 0,
        row[6] || "",
        row[7] || "Pending",
        row[8],
        row[9],
        row[10] || "",
        row[11] || ""

    );

}


/* =========================================================
   BUILD REVIEW OBJECT
========================================================= */

function buildReviewObject(
    id,
    userId,
    username,
    name,
    email,
    rating,
    review,
    status,
    createdAt,
    updatedAt,
    adminReply,
    adminReplyAt
) {

    return {

        id:
            id || "",

        userId:
            userId || "",

        username:
            username || "",

        name:
            name || "Eligify User",

        email:
            email || "",

        rating:
            Number(rating) || 0,

        review:
            review || "",

        status:
            status || "Pending",

        createdAt:
            toISOStringSafe(
                createdAt
            ),

        updatedAt:
            toISOStringSafe(
                updatedAt
            ),

        adminReply:
            adminReply || "",

        adminReplyAt:
            toISOStringSafe(
                adminReplyAt
            )

    };

}


/* =========================================================
   SORT REVIEWS
========================================================= */

function newestReviewFirst(
    a,
    b
) {

    const dateA =
        new Date(
            a.createdAt
        ).getTime() || 0;


    const dateB =
        new Date(
            b.createdAt
        ).getTime() || 0;


    return dateB -
        dateA;

}


/* =========================================================
   UPDATE REVIEW STATUS
========================================================= */

function updateReviewStatus(
    reviewId,
    newStatus
) {

    const sheet =
        getReviewSheet();


    const allowedStatuses = [
        "Approved",
        "Rejected",
        "Pending"
    ];


    if (
        allowedStatuses.indexOf(
            newStatus
        ) === -1
    ) {

        throw new Error(
            "Invalid review status"
        );

    }


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        if (
            String(values[i][0]).trim() ===
            String(reviewId).trim()
        ) {

            const now =
                new Date();


            sheet
                .getRange(
                    i + 1,
                    8
                )
                .setValue(
                    newStatus
                );


            sheet
                .getRange(
                    i + 1,
                    10
                )
                .setValue(
                    now
                );


            SpreadsheetApp.flush();


            const updatedRow =
                sheet
                    .getRange(
                        i + 1,
                        1,
                        1,
                        REVIEW_HEADERS.length
                    )
                    .getValues()[0];


            return reviewRowToObject(
                updatedRow
            );

        }

    }


    throw new Error(
        "Review ID not found: " +
        reviewId
    );

}


/* =========================================================
   ADMIN REPLY TO REVIEW
========================================================= */

function replyToReview(
    reviewId,
    reply
) {

    const sheet =
        getReviewSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        if (
            String(values[i][0]).trim() ===
            String(reviewId).trim()
        ) {

            const now =
                new Date();


            sheet
                .getRange(
                    i + 1,
                    11
                )
                .setValue(
                    reply
                );


            sheet
                .getRange(
                    i + 1,
                    12
                )
                .setValue(
                    now
                );


            sheet
                .getRange(
                    i + 1,
                    10
                )
                .setValue(
                    now
                );


            SpreadsheetApp.flush();


            const updatedRow =
                sheet
                    .getRange(
                        i + 1,
                        1,
                        1,
                        REVIEW_HEADERS.length
                    )
                    .getValues()[0];


            return reviewRowToObject(
                updatedRow
            );

        }

    }


    throw new Error(
        "Review ID not found: " +
        reviewId
    );

}


/* =========================================================
   DELETE REVIEW
========================================================= */

function deleteReview(
    reviewId
) {

    const sheet =
        getReviewSheet();


    const values =
        sheet
            .getDataRange()
            .getValues();


    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        if (
            String(values[i][0]).trim() ===
            String(reviewId).trim()
        ) {

            sheet.deleteRow(
                i + 1
            );


            SpreadsheetApp.flush();


            return;

        }

    }


    throw new Error(
        "Review ID not found: " +
        reviewId
    );

}


/* =========================================================
   SAFE ISO DATE
========================================================= */

function toISOStringSafe(
    value
) {

    if (
        value instanceof Date &&
        !isNaN(value.getTime())
    ) {

        return value.toISOString();

    }


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }


    const date =
        new Date(value);


    if (
        !isNaN(date.getTime())
    ) {

        return date.toISOString();

    }


    return String(value);

}


/* =========================================================
   JSON RESPONSE
========================================================= */

function jsonResponse(
    data
) {

    return ContentService
        .createTextOutput(
            JSON.stringify(data)
        )
        .setMimeType(
            ContentService.MimeType.JSON
        );

}