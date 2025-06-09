import os, PyPDF2, io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
#directory = os.path.join(os.getcwd(), "files2")

reader = PyPDF2.PdfReader("portfolio_nopg.pdf")
writer = PyPDF2.PdfWriter()

pdfmetrics.registerFont(TTFont("Lexend","Lexend-Medium.ttf"))

for page_num in range(len(reader.pages)):
    packet = io.BytesIO()
    can = canvas.Canvas(packet,pagesize=letter)
    can.setFont("Lexend",12)
    page_label = str(page_num + 1)
    can.drawString(575,770,page_label)
    can.save()
    packet.seek(0)
    overlay_pdf = PyPDF2.PdfReader(packet)
    overlay_page = overlay_pdf.pages[0]
    original_page = reader.pages[page_num]
    original_page.merge_page(overlay_page)
    writer.add_page(original_page)
    print(f"Finished page {page_num}")
with open("portfolio_done.pdf","wb") as out_file:
    writer.write(out_file)
# pdf_files = sorted([f for f in os.listdir(directory) if f.endswith(".pdf")])


# def add_blank_page(merger, width=612, height=792):
#     blank_pdf_writer = PyPDF2.PdfWriter()
#     blank_pdf_writer.add_blank_page(width,height)
#     buffer = io.BytesIO()
#     blank_pdf_writer.write(buffer)
#     buffer.seek(0)
#     merger.append(buffer)    


# merger = PyPDF2.PdfMerger()
# for i, pdf in enumerate(pdf_files):
#     merger.append(os.path.join(directory,pdf))

#     if i == 1:
#         add_blank_page(merger)

# merger.write("combined_file.pdf")
# merger.close()