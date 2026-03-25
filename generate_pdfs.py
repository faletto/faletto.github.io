import os
import json
import pymupdf
PDF_DIR = "labs"
OUTPUT_FILE = "pdf_index.json"

def extract_metadata(pdf_path):
    try:
        doc = pymupdf.open(f"public/{pdf_path}")
        meta = doc.metadata
        title = (meta["title"]).replace("/"," ")
        page1 = doc.load_page(0)
        pix = page1.get_pixmap()
        img = pix.tobytes("jpeg")
        thumb_path = f"/thumb/{title}.jpg"
        with open(f"public{thumb_path}","wb") as file:
            file.write(img)
        return {
            "title": title,
            "author": meta["author"] or "Unknown",
            "file" : "/" + pdf_path.replace("\\","/"),
            "thumb": thumb_path
        }
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return {
            "title": os.path.basename(pdf_path),
            "author": "Unknown",
            "file" : "/" + pdf_path.replace("\\","/"),
            "thumb": "/thumb_unknown.png"
        }
    
def main():
    if not os.path.exists(os.path.join(os.getcwd(),"public","thumb")):
        os.makedirs(os.path.join(os.getcwd(),"public","thumb"))
    if not os.path.exists(f"public/{PDF_DIR}"):
        print(f"No {PDF_DIR} folder found.")
        return
    pdfs = []
    for filename in os.listdir(f"public/{PDF_DIR}"):
        if filename.lower().endswith(".pdf"):
            path = os.path.join(PDF_DIR,filename)
            metadata = extract_metadata(path)
            pdfs.append(metadata)
    with open(f"public/{OUTPUT_FILE}","w",encoding="utf-8") as file:
        json.dump(pdfs,file)
    print(f"Wrote metadata for {len(pdfs)} PDFs to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()