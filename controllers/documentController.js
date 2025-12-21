const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// Brand Colors
const BLUE = "#1F4F6F";
const RED = "#D64045";
const HEADER_HEIGHT = 80;

/*  
===========================================================
  INTERNAL FUNCTION (ZIP SAFE)
  Draws the invoice inside any PDFDocument instance.
  - No res
  - No doc.pipe(res)
  - No headers
===========================================================
*/
exports.generateInvoicePDF = (doc, data) => {
  const {
    seller,
    buyer,
    items,
    invoice_number,
    invoice_date,
    due_date,
    currency,
    total_value,
    customerLogoPath
  } = data;

  // HEADER BAR
  doc.rect(0, 0, doc.page.width, HEADER_HEIGHT).fill(BLUE);

  // TITLE
  doc
    .fillColor("white")
    .fontSize(28)
    .text("INVOICE", 40, 22);

  // LOGO HANDLING
  let logoPath;

  if (customerLogoPath) {
    const possibleCustomerLogo = path.join(__dirname, "..", customerLogoPath);
    if (fs.existsSync(possibleCustomerLogo)) {
      logoPath = possibleCustomerLogo;
    }
  }

  if (!logoPath) {
    logoPath = path.join(__dirname, "..", "assets", "logo.png");
  }

  try {
    doc.image(logoPath, doc.page.width - 150, 15, { width: 100 });
  } catch (err) {
    console.log("Logo load failed:", err);
  }

  doc.moveDown(3);
  doc.fillColor("black");

  // INVOICE META SECTION
  doc.fontSize(12)
    .fillColor(BLUE)
    .text("Invoice No:", 40, HEADER_HEIGHT + 20)
    .fillColor("black")
    .text(invoice_number, 130, HEADER_HEIGHT + 20);

  doc.fillColor(BLUE)
    .text("Invoice Date:", 40, HEADER_HEIGHT + 40)
    .fillColor("black")
    .text(invoice_date, 130, HEADER_HEIGHT + 40);

  doc.fillColor(BLUE)
    .text("Due Date:", 40, HEADER_HEIGHT + 60)
    .fillColor("black")
    .text(due_date, 130, HEADER_HEIGHT + 60);

  // SELLER & BUYER BLOCK
  const yStart = HEADER_HEIGHT + 100;

  doc.fontSize(12)
    .fillColor(BLUE)
    .text("FROM (Seller):", 40, yStart)
    .fillColor("black")
    .text(seller.name)
    .text(seller.address)
    .text(seller.country);

  doc.fontSize(12)
    .fillColor(BLUE)
    .text("BILL TO (Buyer):", 300, yStart)
    .fillColor("black")
    .text(buyer.name, 300)
    .text(buyer.address)
    .text(buyer.country);

  doc.moveDown(2);

  // TABLE HEADER LINES
  const tableTop = yStart + 100;

  doc.strokeColor(BLUE)
    .lineWidth(1)
    .moveTo(40, tableTop)
    .lineTo(doc.page.width - 40, tableTop)
    .stroke();

  doc.fontSize(12).fillColor(BLUE)
    .text("DESCRIPTION", 40, tableTop + 8)
    .text("QTY", 260, tableTop + 8)
    .text("UNIT PRICE", 320, tableTop + 8)
    .text("AMOUNT", 430, tableTop + 8);

  doc.moveTo(40, tableTop + 30)
    .lineTo(doc.page.width - 40, tableTop + 30)
    .stroke();

  // TABLE ROWS
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

  // NOTES SECTION
  doc.fillColor(BLUE).fontSize(12).text("NOTES:", 40, itemY + 70);
  doc.fillColor("black").fontSize(10)
    .text("Thank you for your business!")
    .text("Please keep this invoice for your records.");
};

/*  
===========================================================
  NORMAL EXPRESS ENDPOINT (NO CHANGES)
  Still streams to the browser when user calls API normally
===========================================================
*/
exports.generateInvoice = async (req, res) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${req.body.invoice_number}.pdf`
    );

    doc.pipe(res);

    // Use the shared internal drawing function
    exports.generateInvoicePDF(doc, req.body);

    doc.end();

  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ error: "Unable to generate invoice" });
  }
};
