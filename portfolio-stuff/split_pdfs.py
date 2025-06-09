import PyPDF2


input_pdf_path = 'portfolio.pdf'


reader = PyPDF2.PdfReader(input_pdf_path)


pages_per_file = len(reader.pages) // 2 


writer1 = PyPDF2.PdfWriter()
for i in range(pages_per_file):
    print(i)
    writer1.add_page(reader.pages[i])

with open('portfolio_pt1.pdf', 'wb') as f1:
    writer1.write(f1)
print("SPLIT")

writer2 = PyPDF2.PdfWriter()
for i in range(pages_per_file, len(reader.pages)):
    writer2.add_page(reader.pages[i])
    print(i)
with open("portfolio_pt2.pdf", 'wb') as f2:
    writer2.write(f2)


