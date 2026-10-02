javascript
/* =========================================================
   ELIGIFY USER STORAGE
   CENTRAL MULTI-USER STORAGE SYSTEM
   ---------------------------------------------------------
   IMPORTANT:
   All pages should use this file for user/account data.

   Main Storage:
   eligifyUsers
   currentUserId
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const USER_STORAGE_KEY = "eligifyUsers";
const CURRENT_USER_KEY = "currentUser";
const CURRENT_USER_ID_KEY = "currentUserId";


/* =========================================================
   GET ALL USERS
========================================================= */

function getUsers() {

    try {

        const data =
            localStorage.getItem(
                USER_STORAGE_KEY
            );

        if (!data) {

            return [];

        }

        const users =
            JSON.parse(data);

        return Array.isArray(users)
            ? users
            : [];

    }

    catch (error) {

        console.error(
            "User storage read error:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE ALL USERS
========================================================= */

function saveUsers(users) {

    if (!Array.isArray(users)) {

        console.error(
            "saveUsers: users must be an array"
        );

        return false;

    }

    try {

        localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(users)
        );

        return true;

    }

    catch (error) {

        console.error(
            "User storage save error:",
            error
        );

        return false;

    }

}


/* =========================================================
   GENERATE USER ID
========================================================= */

function generateUserId() {

    return (
        "user_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


/* =========================================================
   CREATE / NORMALIZE USER
========================================================= */

function normalizeUser(user) {

    if (
        !user ||
        typeof user !== "object"
    ) {

        return null;

    }


    const normalized = {

        ...user,

        id:
            user.id ||
            generateUserId(),

        username:
            String(
                user.username || ""
            )
            .trim(),

        name:
            String(
                user.name || ""
            )
            .trim(),

        email:
            String(
                user.email || ""
            )
            .trim()
            .toLowerCase(),

        password:
            String(
                user.password || ""
            ),

        bio:
            String(
                user.bio || ""
            ),

        photo:
            user.photo || "",


        /* User-specific data */

        saved:
            Array.isArray(user.saved)
                ? user.saved
                : [],

        recentlyViewed:
            Array.isArray(
                user.recentlyViewed
            )
                ? user.recentlyViewed
                : [],

        history:
            Array.isArray(user.history)
                ? user.history
                : []

    };


    return normalized;

}


/* =========================================================
   GET CURRENT USER ID
========================================================= */

function getCurrentUserId() {

    return localStorage.getItem(
        CURRENT_USER_ID_KEY
    );

}


/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {

    const userId =
        getCurrentUserId();


    if (!userId) {

        return null;

    }


    const users =
        getUsers();


    const user =
        users.find(
            item =>
                String(item.id) ===
                String(userId)
        );


    return user
        ? normalizeUser(user)
        : null;

}


/* =========================================================
   SET CURRENT USER
========================================================= */

function setCurrentUser(user) {

    if (!user) {

        return false;

    }


    const normalized =
        normalizeUser(user);


    if (!normalized) {

        return false;

    }


    localStorage.setItem(
        CURRENT_USER_ID_KEY,
        String(normalized.id)
    );


    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(normalized)
    );


    return true;

}


/* =========================================================
   ADD NEW USER
========================================================= */

function addUser(userData) {

    const users =
        getUsers();


    const user =
        normalizeUser(userData);


    if (!user) {

        return {
            success: false,
            message: "Invalid user data"
        };

    }


    /* Prevent duplicate email */

    const emailExists =
        users.some(
            existingUser =>

                String(
                    existingUser.email || ""
                )
                .trim()
                .toLowerCase() ===
                user.email

        );


    if (
        user.email &&
        emailExists
    ) {

        return {
            success: false,
            message: "Email already exists"
        };

    }


    /* Prevent duplicate username */

    const usernameExists =
        users.some(
            existingUser =>

                String(
                    existingUser.username || ""
                )
                .trim()
                .toLowerCase() ===

                user.username
                    .trim()
                    .toLowerCase()

        );


    if (
        user.username &&
        usernameExists
    ) {

        return {
            success: false,
            message: "Username already exists"
        };

    }


    users.push(user);


    const saved =
        saveUsers(users);


    if (!saved) {

        return {
            success: false,
            message: "Unable to save account"
        };

    }


    return {
        success: true,
        user: user
    };

}


/* =========================================================
   UPDATE USER
========================================================= */

function updateUser(userId, changes) {

    if (!userId) {

        return false;

    }


    const users =
        getUsers();


    const index =
        users.findIndex(
            user =>
                String(user.id) ===
                String(userId)
        );


    if (index === -1) {

        return false;

    }


    const updatedUser =
        normalizeUser({

            ...users[index],

            ...changes,

            id:
                users[index].id

        });


    users[index] =
        updatedUser;


    const success =
        saveUsers(users);


    if (!success) {

        return false;

    }


    /* Keep currentUser synchronized */

    if (
        String(
            getCurrentUserId()
        ) ===
        String(userId)
    ) {

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(
                updatedUser
            )
        );

    }


    return true;

}


/* =========================================================
   UPDATE CURRENT USER
========================================================= */

function updateCurrentUser(changes) {

    const userId =
        getCurrentUserId();


    if (!userId) {

        return false;

    }


    return updateUser(
        userId,
        changes
    );

}


/* =========================================================
   DELETE USER
========================================================= */

function deleteUser(userId) {

    if (!userId) {

        return false;

    }


    const users =
        getUsers();


    const updatedUsers =
        users.filter(
            user =>
                String(user.id) !==
                String(userId)
        );


    if (
        updatedUsers.length ===
        users.length
    ) {

        return false;

    }


    const success =
        saveUsers(
            updatedUsers
        );


    if (!success) {

        return false;

    }


    /* If deleted user is current user */

    if (
        String(
            getCurrentUserId()
        ) ===
        String(userId)
    ) {

        clearCurrentUser();

    }


    return true;

}


/* =========================================================
   CLEAR CURRENT LOGIN
   ---------------------------------------------------------
   IMPORTANT:
   DO NOT DELETE eligifyUsers
========================================================= */

function clearCurrentUser() {

    localStorage.removeItem(
        CURRENT_USER_ID_KEY
    );

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );

    localStorage.removeItem(
        "loggedInUser"
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    clearCurrentUser();

    window.location.href =
        "login.html";

}


/* =========================================================
   GET USER BY ID
========================================================= */

function getUserById(userId) {

    if (!userId) {

        return null;

    }


    const users =
        getUsers();


    return users.find(
        user =>
            String(user.id) ===
            String(userId)
    ) || null;

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function isUserLoggedIn() {

    const userId =
        getCurrentUserId();


    if (!userId) {

        return false;

    }


    return !!getUserById(
        userId
    );

}


/* =========================================================
   REQUIRE LOGIN
   ---------------------------------------------------------
   Use on protected pages.
========================================================= */

function requireLogin() {

    if (
        !isUserLoggedIn()
    ) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


/* =========================================================
   USER SAVED SCHOLARSHIPS
========================================================= */

function getUserSaved(userId = null) {

    const id =
        userId ||
        getCurrentUserId();


    const user =
        getUserById(id);


    if (!user) {

        return [];

    }


    return Array.isArray(
        user.saved
    )
        ? user.saved
        : [];

}


/* =========================================================
   UPDATE USER SAVED
========================================================= */

function updateUserSaved(
    saved,
    userId = null
) {

    const id =
        userId ||
        getCurrentUserId();


    if (!id) {

        return false;

    }


    return updateUser(
        id,
        {

            saved:
                Array.isArray(saved)
                    ? saved
                    : []

        }
    );

}


/* =========================================================
   USER RECENTLY VIEWED
========================================================= */

function getUserRecentlyViewed(
    userId = null
) {

    const id =
        userId ||
        getCurrentUserId();


    const user =
        getUserById(id);


    if (!user) {

        return [];

    }


    return Array.isArray(
        user.recentlyViewed
    )
        ? user.recentlyViewed
        : [];

}


/* =========================================================
   UPDATE RECENTLY VIEWED
========================================================= */

function updateUserRecentlyViewed(
    data,
    userId = null
) {

    const id =
        userId ||
        getCurrentUserId();


    if (!id) {

        return false;

    }


    return updateUser(
        id,
        {

            recentlyViewed:
                Array.isArray(data)
                    ? data
                    : []

        }
    );

}


/* =========================================================
   USER HISTORY
========================================================= */

function getUserHistory(
    userId = null
) {

    const id =
        userId ||
        getCurrentUserId();


    const user =
        getUserById(id);


    if (!user) {

        return [];

    }


    return Array.isArray(
        user.history
    )
        ? user.history
        : [];

}


/* =========================================================
   UPDATE USER HISTORY
========================================================= */

function updateUserHistory(
    history,
    userId = null
) {

    const id =
        userId ||
        getCurrentUserId();


    if (!id) {

        return false;

    }


    return updateUser(
        id,
        {

            history:
                Array.isArray(history)
                    ? history
                    : []

        }
    );

}


/* =========================================================
   MIGRATION / REPAIR
   ---------------------------------------------------------
   Repairs old users without IDs or arrays.
========================================================= */

function repairUserStorage() {

    const users =
        getUsers();


    let changed = false;


    const repairedUsers =
        users.map(user => {

            const normalized =
                normalizeUser(user);


            if (
                JSON.stringify(
                    normalized
                ) !==
                JSON.stringify(user)
            ) {

                changed = true;

            }


            return normalized;

        });


    if (changed) {

        saveUsers(
            repairedUsers
        );

    }


    /* Repair currentUser */

    const currentId =
        getCurrentUserId();


    if (currentId) {

        const currentUser =
            repairedUsers.find(
                user =>
                    String(user.id) ===
                    String(currentId)
            );


        if (currentUser) {

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(
                    currentUser
                )
            );

        }

    }


    return repairedUsers;

}


/* =========================================================
   INITIAL REPAIR
========================================================= */

repairUserStorage();


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "Eligify User Storage Loaded"
);

console.log(
    "Total Accounts:",
    getUsers().length
);

