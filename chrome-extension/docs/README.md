# Zeq OS Framework Documentation

This folder contains PDF documentation files that are automatically loaded by the framework.

## Bundled PDFs

Place your PDF documentation files in this folder. The PDF Manager will automatically:
- Load all PDFs on extension initialization
- Extract and index text content
- Make documentation searchable
- Include relevant excerpts in AI queries

## Supported Files

- `framework-documentation.pdf` - Main framework documentation
- `operator-reference.pdf` - Operator reference guide
- `hulyas-protocol.pdf` - HULYAS protocol documentation

## Adding PDFs

1. Place PDF files in this `docs/` folder
2. Update the `bundledPDFs` array in `lib/pdf-manager.js` to include your PDF filename
3. The PDFs will be automatically loaded when the extension initializes

## Notes

- PDFs must be accessible via `chrome.runtime.getURL('docs/filename.pdf')`
- PDFs are included in `web_accessible_resources` in `manifest.json`
- PDF content is extracted client-side using PDF.js
- All PDF text is indexed for fast searching

