document.addEventListener("DOMContentLoaded", () => {

const store = localStorage.getItem("store_id");

if (!store) {
window.location = "login.html";
}

});