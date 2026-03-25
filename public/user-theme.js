const toggle = document.getElementById("themeToggle");


if (localStorage.getItem("user-theme") === "fun") {
    document.documentElement.classList.add("fun-theme");
    toggle.checked = true;
}

toggle.addEventListener("change", () => {
    if (toggle.checked) {
        document.documentElement.classList.add("fun-theme");
        localStorage.setItem("user-theme","fun")
    } else {
        document.documentElement.classList.remove("fun-theme");
        localStorage.setItem("user-theme", "normal")
    }
})