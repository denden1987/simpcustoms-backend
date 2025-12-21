const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const BLUE = "#1F4F6F";
const RED = "#D64045";
const HEADER_HEIGHT = 80;

/*
===========================================================
 ZIP-SAFE CREDIT NOTE GENERATOR
===========================================================
*/
exports.generateCreditNotePDF = (doc, data) => {
  const {
    seller,
    buyer,
    items,
    credit_note_number,
    credit_note_date,
    reference_invoice_number,
    reason,
    currency,
    total_value,
    userLogo
  } = data;

  // HEADER BAR
  doc.rect(0, 0, doc.page.width, HEADER_HEIGHT).fill(BLUE);

  doc.fillColor("white")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("CREDIT NOTE", 40, 25);

  // LOGO
  let logoPath = null;

  if (userLogo) {
    const customPath = path.join(__dirname, "..", userLogo);
    if (fs.existsSync(customPath)) logoPath = customPath;
  }

  if (!logoPath) {
    logoPath = path.join(__dirname, "..", "assets", "logo.png");
  }

  try {
    doc.image(logoPath, doc.page.width - 140, 15, { width: 100 });
  } catch {}

  doc.moveDown(3);

  // SELLER
  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Seller", 40);
  doc.fillColor("black").fontSize(10).text(seller);

  doc.moveDown(1.5);

  // BUYER
  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Buyer", 40);
  doc.fillColor("black").fontSize(10).text(buyer);

  doc.moveDown(1.5);

  // DETAILS
  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Credit Note Details", 40);

  doc.fillColor("black").fontSize(10)
    .text(`Credit Note No: ${credit_note_number}`)
    .text(`Credit Note Date: ${credit_note_date}`)
    .text(`Reference Invoice: ${reference_invoice_number || "N/A"}`)
    .text(`Reason: ${reason}`);

  doc.moveDown(2);

  // ================================
  // TABLE HEADER (CENTERED COLUMNS)
  // ================================

  // column x positions AND widths
  const colDesc = 40;
  const colQty = 280;
  const colUnit = 350;
  const colTotal = 430;

  const wDesc = 200;
  const wQty = 60;
  const wUnit = 60;
  const wTotal = 60;

  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Credited Items", 40);
  doc.moveDown(1);

  const headerY = doc.y;

  doc.font("Helvetica-Bold").fontSize(10).fillColor("black")
    .text("Description", colDesc, headerY)
    .text("Qty", colQty, headerY, { width: wQty, align: "center" })
    .text("Unit Price", colUnit, headerY, { width: wUnit, align: "center" })
    .text("Total", colTotal, headerY, { width: wTotal, align: "center" });

  // Divider
  doc.strokeColor(RED).lineWidth(1)
    .moveTo(colDesc, headerY + 15)
    .lineTo(colTotal + 70, headerY + 15)
    .stroke();

  doc.y = headerY + 25;

  // ROWS
  doc.font("Helvetica").fontSize(10);

  items.forEach(item => {
    const y = doc.y;

    doc.text(item.description, colDesc, y, { width: wDesc });
    doc.text(item.quantity, colQty, y, { width: wQty, align: "center" });
    doc.text(item.unit_price, colUnit, y, { width: wUnit, align: "center" });
    doc.text(item.total, colTotal, y, { width: wTotal, align: "center" });

    doc.moveDown(1.2);
  });

  doc.moveDown(2);

  // TOTAL CREDIT
  doc.font("Helvetica-Bold").fontSize(12).fillColor(BLUE)
    .text("Total Credit Value:", 40);

  doc.font("Helvetica").fontSize(12).fillColor("black")
    .text(`${currency} ${total_value}`, 40);
};

/*
===========================================================
 EXPRESS HANDLER
===========================================================
*/
exports.generateCreditNote = async (req, res) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=credit_note_${req.body.credit_note_number}.pdf`
    );

    doc.pipe(res);
    exports.generateCreditNotePDF(doc, req.body);
    doc.end();
  } catch (err) {
    console.error("Credit Note error:", err);
    res.status(500).send("Failed to generate Credit Note PDF");
  }
};
