/* Logged-in users must never see onboarding / home / login / signup again.
   Include in <head> of those pages. They go straight to the dashboard. */
(function () {
    try {
        var id = localStorage.getItem("currentUserId");
        var user = localStorage.getItem("currentUser");
        var flag = localStorage.getItem("loggedIn");
        if (id && user && flag !== "false") {
            window.location.replace("dashboard.html");
        }
    } catch (e) {}
})();
