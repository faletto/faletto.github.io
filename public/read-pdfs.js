const list = document.getElementById("pdf-list");
const loadingMessage = document.getElementById("loading-message");
loadingMessage.textContent = "Loading PDFs...";
fetch("/pdf_index.json").then(response => {
    if (!response.ok) { loadingMessage.textContent = "Error retrieving PDF index"; throw new Error("Error retrieving PDF index"); }
    return response.json();
}).then(
    data => {
        data.forEach(element => {
            const card = document.createElement("div");
            card.className = "pdf-card";
            card.innerHTML = `
            <div class="pdf-card-content">
                <h2><a class="pdf-card-link" href="${element.file}" target="_blank" rel="noopener noreferrer">${element.title}</a></h2>
                <p><strong>Author:</strong> ${element.author}</p>
            </div>
            <a class="pdf-card-link" href="${element.file}" target="_blank" rel="noopener noreferrer">
                <img src="${element.thumb}" alt="Preview image" />
            </a>`;

            list.appendChild(card);
        });
    }
).then(()=> {
    loadingMessage.remove();
})