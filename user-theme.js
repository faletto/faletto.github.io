const toggle = document.getElementById("themeToggle");
const stylesheet = document.getElementById("themeStylesheet");

if (localStorage.getItem("user-theme") === "fun") {
    toggle.checked = true;
    stylesheet.href = "styles-fun.css";
}

toggle.addEventListener("change", () => {
    if (toggle.checked) {
        stylesheet.href = "styles-fun.css";
        localStorage.setItem("user-theme","fun")
    } else {
        stylesheet.href = "styles.css";
        localStorage.setItem("user-theme", "normal")
    }
})