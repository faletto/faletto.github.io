const list = document.getElementById("pdf-list");
const loadingMessage = document.getElementById("loading-message");
loadingMessage.textContent = "Loading PDFs...";
fetch("pdf_index.json").then(response => {
    if (!response.ok) { loadingMessage.textContent = "Error retrieving PDF index"; throw new Error("Error retrieving PDF index"); }
    return response.json();
}).then(
    data => {
        data.forEach(element => {
            const card = document.createElement("div");
            card.className = "pdf-card";
            card.innerHTML = `
            <h2>${element.title}</h2>
            <p><strong>Author:</strong> ${element.author}</p>`;

            const link = document.createElement("a");
            link.href = element.file;
            link.target = "_blank";

            const img = document.createElement("img");
            img.src = element.thumb;
            img.alt = "Preview image";
            img.style.display = "block";
            img.style.width = "100%";
            img.style.maxWidth = "300px";
            img.style.marginTop = "1rem";

            link.appendChild(img);
            card.appendChild(link);
            list.appendChild(card);
        });
    }
).then(()=> {
    loadingMessage.remove();
})