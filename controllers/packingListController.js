const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const BLUE = "#1F4F6F";
const RED = "#D64045";
const HEADER_HEIGHT = 80;

/*  
===========================================================
  INTERNAL FUNCTION (ZIP SAFE)
  Draws the packing list into ANY PDFDocument instance.
  - No Express res
  - No doc.pipe(res)
  - Used by ZIP export
===========================================================
*/
exports.generatePackingListPDF = (doc, data) => {
  const {
    seller,
    buyer,
    items,
    packing_list_number,
    packing_list_date,
    total_cartons,
    total_weight,
    customerLogoPath
  } = data;

  // HEADER BAR
  doc.rect(0, 0, doc.page.width, HEADER_HEIGHT).fill(BLUE);

  doc.fillColor("white")
    .fontSize(28)
    .text("PACKING LIST", 40, 22);

  // LOGO
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
    .text("Packing List No:", 40, metaY)
    .fillColor("black")
    .text(packing_list_number, 160, metaY);

  doc.fillColor(BLUE)
    .text("Date:", 40, metaY + 20)
    .fillColor("black")
    .text(packing_list_date, 160, metaY + 20);

  doc.fillColor(BLUE)
    .text("Total Cartons:", 40, metaY + 40)
    .fillColor("black")
    .text(total_cartons, 160, metaY + 40);

  doc.fillColor(BLUE)
    .text("Total Weight:", 40, metaY + 60)
    .fillColor("black")
    .text(`${total_weight} kg`, 160, metaY + 60);

  // SELLER / BUYER
  const yStart = metaY + 100;

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
    .text("CARTON", 320, tableTop + 8)
    .text("WEIGHT", 430, tableTop + 8);

  doc.moveTo(40, tableTop + 30)
    .lineTo(doc.page.width - 40, tableTop + 30)
    .stroke();

  // ITEMS LOOP
  let itemY = tableTop + 40;
  doc.fillColor("black");

  items.forEach((item) => {
    doc.text(item.description, 40, itemY);
    doc.text(item.quantity, 260, itemY);
    doc.text(item.carton || "-", 320, itemY);
    doc.text(item.weight ? `${item.weight} kg` : "-", 430, itemY);

    itemY += 25;
  });

  // NOTES
  doc.fillColor(BLUE)
    .fontSize(12)
    .text("NOTES:", 40, itemY + 40)
    .fillColor("black")
    .fontSize(10)
    .text("This packing list accompanies the shipment and contains carton and quantity details.");

  // SIGNATURE
  doc.fillColor(BLUE)
    .fontSize(12)
    .text("AUTHORIZED SIGNATURE:", 40, itemY + 120);

  doc.moveTo(40, itemY + 160)
    .lineTo(200, itemY + 160)
    .stroke();
};

/*  
===========================================================
  PUBLIC EXPRESS ENDPOINT (NO CHANGE)
  Streams PDF to the browser normally.
===========================================================
*/
exports.generatePackingList = async (req, res) => {
  try {
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=packing_list_${req.body.packing_list_number}.pdf`
    );

    doc.pipe(res);

    // Use the ZIP-safe internal function to draw
    exports.generatePackingListPDF(doc, req.body);

    doc.end();

  } catch (err) {
    console.error("Packing List Error:", err);
    res.status(500).json({ error: "Unable to generate packing list" });
  }
};
