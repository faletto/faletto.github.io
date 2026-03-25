async function mergePDFs() {
    const portfolio_text = document.getElementById("portfolio-link");
    portfolio_text.textContent = "Please wait..."

    const {PDFDocument} = PDFLib;
    const urls = ["/portfolio_pt1.pdf","/portfolio_pt2.pdf"];
    const mergedPDF = await PDFDocument.create();

    for (const url of urls) {
        const existingPDFBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdf = await PDFDocument.load(existingPDFBytes);
        const copiedPages = await mergedPDF.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(element => {
            mergedPDF.addPage(element)
        });
    }

    const mergedPDFBytes = await mergedPDF.save();
    const blob = new Blob([mergedPDFBytes], {type: 'application/pdf'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "portfolio-faletto.pdf";
    link.target = "_blank";
    link.rel = "noopener no-referrer";
    
    portfolio_text.innerHTML=`Full Portfolio (PDF) <i class="fa-solid fa-arrow-up-right-from-square"></i>`

    link.click();

}