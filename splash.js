/* =========================================================
   ELIGIFY | SPLASH
   Every time the website is opened the splash screen shows.
   - Logged-in user (logged in once, not logged out)  -> Dashboard
   - New user / logged-out user                       -> Onboarding
========================================================= */

function eligifyIsLoggedIn() {
    try {
        var id = localStorage.getItem("currentUserId");
        var user = localStorage.getItem("currentUser");
        var flag = localStorage.getItem("loggedIn");
        return !!(id && user && flag !== "false");
    } catch (e) {
        return false;
    }
}

setTimeout(function () {
    window.location.replace(
        eligifyIsLoggedIn() ? "dashboard.html" : "onboarding.html"
    );
}, 3000);
