# Invoice Generator (Preview)

This folder is a **standalone invoice design** using HTML, CSS, and JavaScript. Use it to:

1. **Preview the invoice** – Open `index.html` in your browser.
2. **Edit the design** – Change `index.html` and `styles.css` to match your own design (or paste your HTML/CSS/JS here).
3. **Test with sample data** – Click “Load sample data” to fill the invoice. You can edit `app.js` to change sample data or add more fields.
4. **Save as PDF** – Click “Print / Save as PDF” and choose “Save as PDF” in the print dialog.

## When you’re happy with the design

- Tell me when it’s approved, and I’ll **port this layout into the main app’s PDF** in `backend/src/utils/invoice.js`, so the backend generates PDFs that look like this.
- If you already have your own **HTML/CSS/JS invoice**, put your files in this folder (replace or add to these files), and we’ll use that as the reference for the main program.

## File roles

| File         | Purpose                                      |
|--------------|----------------------------------------------|
| `index.html` | Invoice structure (header, table, totals)    |
| `styles.css` | Look and feel (fonts, spacing, print style)  |
| `app.js`     | Sample data and “Load sample” / fill logic   |
| `README.md`  | This file                                    |

Main app is **not** changed until you confirm; this folder is only for design and preview.
