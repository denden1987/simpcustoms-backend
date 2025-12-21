const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const PDFDocument = require("pdfkit");

// Import ZIP-safe PDF generators
const { generateInvoicePDF } = require("./documentController");
const { generatePackingListPDF } = require("./packingListController");
const { generateProFormaPDF } = require("./proFormaController");
const { generateCOOPDF } = require("./certificateOfOrigin");
const { generateCreditNotePDF } = require("./creditNote");

// --------------------------------------------------------
// Helper: writes any PDFDocument instance to a temp file
// --------------------------------------------------------
function writePDFToFile(drawFunction, data, outPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const stream = fs.createWriteStream(outPath);

    doc.pipe(stream);

    // Draw content using ZIP-safe function
    drawFunction(doc, data);

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// --------------------------------------------------------
// MAIN EXPORT: Beginner Bundle
// --------------------------------------------------------
exports.generateBeginnerBundle = async (req, res) => {
  try {
    const {
      invoiceData,
      packingListData,
      proFormaData,
      creditNoteData,
      cooData
    } = req.body;

    // Ensure /tmp folder exists
    const tempDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Paths for each PDF file
    const files = {
      invoice: path.join(tempDir, "invoice.pdf"),
      packingList: path.join(tempDir, "packing_list.pdf"),
      proforma: path.join(tempDir, "pro_forma.pdf"),
      creditNote: path.join(tempDir, "credit_note.pdf"),
      coo: path.join(tempDir, "certificate_of_origin.pdf"),
    };

    // Generate PDFs → temp folder
    await writePDFToFile(generateInvoicePDF, invoiceData, files.invoice);
    await writePDFToFile(generatePackingListPDF, packingListData, files.packingList);
    await writePDFToFile(generateProFormaPDF, proFormaData, files.proforma);
    await writePDFToFile(generateCreditNotePDF, creditNoteData, files.creditNote);
    await writePDFToFile(generateCOOPDF, cooData, files.coo);

    // Prepare ZIP response
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="simp-customs-beginner-bundle.zip"'
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Add PDF files into zip
    archive.file(files.invoice, { name: "invoice.pdf" });
    archive.file(files.packingList, { name: "packing_list.pdf" });
    archive.file(files.proforma, { name: "pro_forma.pdf" });
    archive.file(files.creditNote, { name: "credit_note.pdf" });
    archive.file(files.coo, { name: "certificate_of_origin.pdf" });

    await archive.finalize();

    // Cleanup temp files after ZIP finishes sending
    archive.on("end", () => {
      Object.values(files).forEach((filePath) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    });

  } catch (error) {
    console.error("ZIP export error:", error);
    res.status(500).send("Failed to generate Beginner Bundle ZIP");
  }
};
