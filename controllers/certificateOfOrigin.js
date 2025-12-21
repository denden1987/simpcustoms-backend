const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const BLUE = "#1F4F6F";
const RED = "#D64045";
const HEADER_HEIGHT = 80;

/*
===========================================================
 ZIP-SAFE COO GENERATOR
===========================================================
*/
exports.generateCOOPDF = (doc, data) => {
  const {
    seller,
    buyer,
    invoice_number,
    invoice_date,
    country_of_origin,
    items,
    exporter_reference,
    transport_details,
    signature_name,
    signature_title,
    userLogo
  } = data;

  // HEADER BAR
  doc.rect(0, 0, doc.page.width, HEADER_HEIGHT).fill(BLUE);

  doc.fillColor("white")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("CERTIFICATE OF ORIGIN", 40, 25);

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

  // EXPORTER
  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Exporter (Seller)", 40);
  doc.fillColor("black").fontSize(10).text(seller);

  doc.moveDown(1.5);

  // BUYER
  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Consignee (Buyer)", 40);
  doc.fillColor("black").fontSize(10).text(buyer);

  doc.moveDown(1.5);

  // INFO
  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Certificate Information", 40);

  doc.fillColor("black").fontSize(10)
    .text(`Invoice Number: ${invoice_number}`)
    .text(`Invoice Date: ${invoice_date}`)
    .text(`Country of Origin: ${country_of_origin}`)
    .text(`Exporter Reference: ${exporter_reference}`)
    .text(`Transport Details: ${transport_details}`);

  doc.moveDown(2);

  // ==========================================
  // TABLE HEADER (CENTERED)
  // ==========================================

  const colDesc = 50;
  const colHS = 200;
  const colQty = 270;
  const colUnit = 330;
  const colTotal = 390;
  const colWeight = 450;
  const colOrigin = 510;

  const wDesc = 140;
  const wHS = 60;
  const wQty = 40;
  const wUnit = 60;
  const wTotal = 60;
  const wWeight = 40;
  const wOrigin = 60;

  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Goods Details", 40);
  doc.moveDown(1);

  const headerY = doc.y + 10;

  doc.font("Helvetica-Bold").fontSize(10).fillColor("black")
    .text("Description", colDesc, headerY)
    .text("HS Code", colHS, headerY, { width: wHS, align: "center" })
    .text("Qty", colQty, headerY, { width: wQty, align: "center" })
    .text("Unit Value", colUnit, headerY, { width: wUnit, align: "center" })
    .text("Total", colTotal, headerY, { width: wTotal, align: "center" })
    .text("Weight", colWeight, headerY, { width: wWeight, align: "center" })
    .text("Origin", colOrigin, headerY, { width: wOrigin, align: "center" });

  // Divider
  doc.strokeColor(RED).lineWidth(1)
    .moveTo(colDesc, headerY + 15)
    .lineTo(colOrigin + 70, headerY + 15)
    .stroke();

  doc.y = headerY + 25;

  // ROWS
  doc.font("Helvetica").fontSize(10).fillColor("black");

  items.forEach(item => {
    const y = doc.y;

    doc.text(item.description, colDesc, y, { width: wDesc });
    doc.text(item.hs_code, colHS, y, { width: wHS, align: "center" });
    doc.text(item.quantity, colQty, y, { width: wQty, align: "center" });
    doc.text(item.unit_value, colUnit, y, { width: wUnit, align: "center" });
    doc.text(item.total_value, colTotal, y, { width: wTotal, align: "center" });
    doc.text(item.weight, colWeight, y, { width: wWeight, align: "center" });
    doc.text(item.origin, colOrigin, y, { width: wOrigin, align: "center" });

    doc.moveDown(1.1);
  });

  doc.moveDown(2);

  // SIGNATURE
  doc.fillColor(BLUE).fontSize(14).font("Helvetica-Bold").text("Certification", 40);

  doc.fillColor("black").fontSize(10).text(
    "I certify that the goods listed above originate from the stated country and that all information is true and correct.",
    { width: 500 }
  );

  doc.moveDown(2);

  doc.font("Helvetica-Bold").text("Signature:", 40);
  doc.font("Helvetica")
    .text(`Name: ${signature_name}`)
    .text(`Title: ${signature_title}`);
};

/*
===========================================================
 EXPRESS HANDLER
===========================================================
*/
exports.generateCOO = async (req, res) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_of_origin_${req.body.invoice_number}.pdf`
    );

    doc.pipe(res);
    exports.generateCOOPDF(doc, req.body);
    doc.end();
  } catch (err) {
    console.error("COO error:", err);
    res.status(500).send("Failed to generate COO");
  }
};
