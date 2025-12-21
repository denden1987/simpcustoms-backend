const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// Brand Colors
const BLUE = "#1F4F6F";
const RED = "#D64045";
const HEADER_HEIGHT = 80;

/*  
===========================================================
  INTERNAL FUNCTION — ZIP SAFE
  Draws the Pro Forma Invoice into ANY PDFDocument instance.
  - No doc.pipe(res)
  - No res.status
  - Used by ZIP bundle generator
===========================================================
*/
exports.generateProFormaPDF = (doc, data) => {
  const {
    seller,
    buyer,
    items,
    proforma_number,
    proforma_date,
    currency,
    total_value,
    reason_for_export,
    customerLogoPath
  } = data;

  // HEADER BAR
  doc.rect(0, 0, doc.page.width, HEADER_HEIGHT).fill(BLUE);

  doc.fillColor("white")
    .fontSize(26)
    .text("PRO FORMA INVOICE", 40, 22);

  // LOGO HANDLING
  let logoPath;

  if (customerLogoPath) {
    const possible = path.join(__dirname, "..", customerLogoPath);
    if (fs.existsSync(possible)) logoPath = possible;
  }

  if (!logoPath) {
    logoPath = path.join(__dirname, "..", "assets", "logo.png");
  }

  try {
    doc.image(logoPath, doc.page.width - 150, 15, { width: 100 });
  } catch (err) {
    console.log("Logo load failed:", err);
  }

  doc.fillColor("black");

  // META INFO
  const metaY = HEADER_HEIGHT + 20;

  doc.fillColor(BLUE)
    .fontSize(12)
    .text("Pro Forma No:", 40, metaY)
    .fillColor("black")
    .text(proforma_number, 150, metaY);

  doc.fillColor(BLUE)
    .text("Date:", 40, metaY + 20)
    .fillColor("black")
    .text(proforma_date, 150, metaY + 20);

  doc.fillColor(BLUE)
    .text("Reason for Export:", 40, metaY + 40)
    .fillColor("black")
    .text(reason_for_export || "N/A", 150, metaY + 40);

  // SELLER / BUYER BLOCK
  const yStart = metaY + 90;

  doc.fontSize(12)
    .fillColor(BLUE)
    .text("FROM (Seller):", 40, yStart)
    .fillColor("black")
    .text(seller.name)
    .text(seller.address)
    .text(seller.country);

  doc.fontSize(12)
    .fillColor(BLUE)
    .text("SHIP TO (Buyer):", 300, yStart)
    .fillColor("black")
    .text(buyer.name, 300)
    .text(buyer.address)
    .text(buyer.country);

  // TABLE HEADER
  const tableTop = yStart + 120;

  doc.strokeColor(BLUE)
    .lineWidth(1)
    .moveTo(40, tableTop)
    .lineTo(doc.page.width - 40, tableTop)
    .stroke();

  doc.fontSize(12)
    .fillColor(BLUE)
    .text("DESCRIPTION", 40, tableTop + 8)
    .text("QTY", 260, tableTop + 8)
    .text("UNIT PRICE", 320, tableTop + 8)
    .text("AMOUNT", 430, tableTop + 8);

  doc.moveTo(40, tableTop + 30)
    .lineTo(doc.page.width - 40, tableTop + 30)
    .stroke();

  // ITEMS LOOP
  let itemY = tableTop + 40;
  doc.fillColor("black");

  items.forEach((item) => {
    doc.text(item.description, 40, itemY);
    doc.text(item.quantity, 260, itemY);
    doc.text(`${item.value} ${currency}`, 320, itemY);

    const amount = item.value * item.quantity;
    doc.text(`${amount} ${currency}`, 430, itemY);

    itemY += 25;
  });

  // TOTAL SECTION
  doc.moveTo(40, itemY + 10)
    .lineTo(doc.page.width - 40, itemY + 10)
    .stroke();

  doc.fontSize(14)
    .fillColor(BLUE)
    .text("TOTAL:", 40, itemY + 20)
    .fillColor("black")
    .text(`${total_value} ${currency}`, 430, itemY + 20);

  // NOTES
  doc.fillColor(BLUE)
    .fontSize(12)
    .text("NOTES:", 40, itemY + 60)
    .fillColor("black")
    .fontSize(10)
    .text("This Pro Forma Invoice is for customs, quotation, or pre-shipment purposes only.")
    .text("It is not a VAT invoice and does not demand payment.");
};

/*  
===========================================================
  PUBLIC EXPRESS ENDPOINT — NORMAL DOWNLOAD
  Browser download still works the same
===========================================================
*/
exports.generateProForma = async (req, res) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=proforma_${req.body.proforma_number}.pdf`
    );

    doc.pipe(res);

    // Use internal ZIP-safe draw function
    exports.generateProFormaPDF(doc, req.body);

    doc.end();

  } catch (err) {
    console.error("Pro Forma Error:", err);
    res.status(500).json({ error: "Unable to generate Pro Forma Invoice" });
  }
};
