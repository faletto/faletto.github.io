const files = [
"files/Building Network Infrastructure Donating IT Equipment in Antigua - Rotary Club of Antigua BBRC RCKD.pdf",
"files/Configuring a Cisco Wireless Access Point and WLC with WPA2-PSK and WPA2-Enterprise with a RADIUS Server - Advanced Cisco Networking Academy.pdf",
"files/Configuring a FortiGate 40F Firewall for a SOHO Environment Configuring a Fortinet 421E AP with WPA2-PSK and WPA2-Enterprise Local Auth - Fortinet Cybersecurity Academy.pdf",
"files/Configuring a Network with the IS-IS Routing Protocol - Advanced Cisco Networking Academy.pdf",
"files/Configuring an SSL Remote Access VPN on a FortiGate 40-F Firewall - Fortinet Cybersecurity Academy.pdf",
"files/Configuring Elastic Block Store, Relational Database Service, and Elastic Cloud Compute Auto Scaling - AWS Academy Cloud Foundations.pdf",
"files/Configuring GlobalProtect RAVPN on a PA220 Firewall - Palo Alto Networks Cybersecurity Academy.pdf",
"files/Configuring Identity and Access Management, Virtual Private Cloud, and Elastic Compute Cloud - AWS Academy Cloud Foundations.pdf",
"files/Designing a Multi-Area OSPF Network - Advanced Cisco Networking Academy.pdf",
"files/Designing a Multiprotocol Network with BGP - Advanced Cisco Networking Academy.pdf",
"files/Designing a Multiprotocol Network with Internal External BGP - Advanced Cisco Networking Academy.pdf",
"files/Factory Resetting a PA220 Firewall - Palo Alto Networks Cybersecurity Academy.pdf",
"files/Installing and Preparing Windows 11 Lab - Advanced CCNP.pdf",
"files/Setting up a PA220 Firewall for a SOHO Environment - Palo Alto Networks Cybersecurity Academy.pdf",
"files/Setting up Web Filtering - Palo Alto Networks Cybersecurity Academy.pdf",
]
const list = document.getElementById("pdf-list");
const loadingDiv = document.getElementById("loading-message")
const loadingMessage = document.createElement("p");
loadingMessage.id = "loading-text"
loadingMessage.textContent = "Loading PDFs...";
loadingDiv.appendChild(loadingMessage);


Promise.all(files.map(async (file) => {
    try {
        const loadingTask = pdfjsLib.getDocument(file);
        const pdf = await loadingTask.promise;
        const meta = await pdf.getMetadata();

        const title = meta.info.Title || file.split("/").pop();
        const author = meta.info.Author || "Unknown";

        const card = document.createElement("div");
        card.className = "pdf-card";

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({scale: 0.5});
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({canvasContext: context, viewport}).promise;

        const img = document.createElement("img");
        img.src = canvas.toDataURL();
        img.alt = "Preview of first page";
        img.style.display = "block";
        img.style.width = "100%";
        img.style.maxWidth = "300px";
        img.style.marginTop = "1rem";

        card.innerHTML = `
        <h2>${title}</h2>
        <p><strong>Author:</strong> ${author}</p>
        `;
        const link = document.createElement("a");
        link.href = file;
        link.target = "_blank"

        card.appendChild(link)
        link.appendChild(img)
        list.appendChild(card);
    } catch (err) {
        console.error("Failed to load ${file}",err);
        const errorCard = document.createElement("div");
        errorCard.className = "pdf-card";
        errorCard.innerHTML = `<h2>Error loading ${file}</h2><p>${err.message}</p>`;
        list.appendChild(errorCard);
    }
})).then(() => {
    loadingMessage.remove();
});




