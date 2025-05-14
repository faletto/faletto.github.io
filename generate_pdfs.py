import os
import json
import pymupdf
PDF_DIR = "files"
OUTPUT_FILE = "pdf_index.json"

def extract_metadata(pdf_path):
    try:
        doc = pymupdf.open(pdf_path)
        meta = doc.metadata
        title = (meta["title"]).replace("/"," ")
        page1 = doc.load_page(0)
        pix = page1.get_pixmap()
        img = pix.tobytes("jpeg")
        thumb_path = f"images/thumb/{title}.jpg"
        with open(thumb_path,"wb") as file:
            file.write(img)
        return {
            "title": title,
            "author": meta["author"] or "Unknown",
            "file" : pdf_path.replace("\\","/"),
            "thumb": thumb_path
        }
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return {
            "title": os.path.basename(pdf_path),
            "author": "Unknown",
            "file" : pdf_path.replace("\\","/"),
            "thumb": "images/thumb_unknown.png"
        }
    
def main():
    if not os.path.exists(os.path.join(os.getcwd(),"images","thumb")):
        os.makedirs(os.path.join(os.getcwd(),"images","thumb"))
    if not os.path.exists(PDF_DIR):
        print(f"No {PDF_DIR} folder found.")
        return
    pdfs = []
    for filename in os.listdir(PDF_DIR):
        if filename.lower().endswith(".pdf"):
            path = os.path.join(PDF_DIR,filename)
            metadata = extract_metadata(path)
            pdfs.append(metadata)
    with open(OUTPUT_FILE,"w",encoding="utf-8") as file:
        json.dump(pdfs,file)
    print(f"Wrote metadata for {len(pdfs)} PDFs to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()