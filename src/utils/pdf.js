import jsPDF from "jspdf";

export function generatePDFReport(items, reportType = "full", summaryData = null) {
  const doc = new jsPDF();
  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("VeriShelf Report", margin, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Report Type: ${reportType}`, margin, yPos);
  yPos += 5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
  yPos += 10;

  // If summary report, show summary data
  if (reportType === "summary" && summaryData) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Daily Summary", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Date: ${new Date(summaryData.date).toLocaleDateString()}`, margin, yPos);
    yPos += 7;
    doc.text(`Total Items: ${summaryData.metrics.totalItems}`, margin, yPos);
    yPos += 7;
    doc.setTextColor(239, 68, 68); // Red
    doc.text(`Expired: ${summaryData.metrics.expired}`, margin, yPos);
    yPos += 7;
    doc.setTextColor(245, 158, 11); // Yellow
    doc.text(`Expiring Soon: ${summaryData.metrics.expiringSoon}`, margin, yPos);
    yPos += 7;
    doc.setTextColor(0, 0, 0);
    doc.text(`Items Handled Today: ${summaryData.metrics.itemsHandledToday}`, margin, yPos);
    yPos += 7;
    doc.text(`Total Value: $${summaryData.metrics.totalValue}`, margin, yPos);
    yPos += 7;
    doc.setTextColor(239, 68, 68);
    doc.text(`Expired Value: $${summaryData.metrics.expiredValue}`, margin, yPos);
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("Compliance Status", margin, yPos);
    yPos += 7;
    doc.setFont(undefined, "normal");
    doc.text(`Risk Level: ${summaryData.compliance.riskLevel}`, margin, yPos);
    yPos += 7;
    doc.text(`Compliance Rate: ${summaryData.compliance.complianceRate}%`, margin, yPos);
    yPos += 10;

    if (summaryData.outstandingIssues.length > 0) {
      doc.setFont(undefined, "bold");
      doc.text(`Outstanding Issues (${summaryData.outstandingIssues.length}):`, margin, yPos);
      yPos += 7;
      doc.setFont(undefined, "normal");
      summaryData.outstandingIssues.slice(0, 20).forEach((issue) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${issue.item} - ${issue.location}`, margin + 5, yPos);
        yPos += 5;
        doc.setFontSize(8);
        doc.text(
          issue.type === "expired" 
            ? `Expired ${issue.daysOverdue} days ago` 
            : `Expires in ${issue.daysUntil} days`,
          margin + 10,
          yPos
        );
        yPos += 6;
        doc.setFontSize(10);
      });
    }

    // Save
    const filename = `verishelf-daily-summary-${summaryData.date}.pdf`;
    doc.save(filename);
    return;
  }

  // Filter items based on report type
  let filteredItems = items.filter((i) => !i.removed);
  if (reportType === "expired") {
    filteredItems = filteredItems.filter((i) => new Date(i.expiry) < new Date());
  } else if (reportType === "expiring") {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    filteredItems = filteredItems.filter(
      (i) => new Date(i.expiry) <= threeDaysFromNow && new Date(i.expiry) >= new Date()
    );
  }

  // Table headers
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  const headers = ["Name", "Category", "Qty", "Price", "Expiry", "Status", "Location"];
  const colWidths = [40, 30, 15, 20, 30, 25, 30];
  let xPos = margin;

  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos);
    xPos += colWidths[i];
  });
  yPos += lineHeight;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos - 2, 190, yPos - 2);

  // Table rows
  doc.setFont(undefined, "normal");
  filteredItems.forEach((item) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    const expiry = new Date(item.expiry);
    const today = new Date();
    const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    let status = "SAFE";
    if (daysUntil < 0) status = "EXPIRED";
    else if (daysUntil <= 3) status = "WARNING";

    xPos = margin;
    const rowData = [
      item.name?.substring(0, 20) || "",
      item.category?.substring(0, 15) || "",
      item.quantity || 0,
      `$${item.price?.toFixed(2) || "0.00"}`,
      expiry.toLocaleDateString(),
      status,
      item.location?.substring(0, 15) || "",
    ];

    rowData.forEach((data, i) => {
      doc.text(String(data), xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += lineHeight;
  });

  // Summary
  yPos += 5;
  doc.line(margin, yPos, 190, yPos);
  yPos += 5;
  doc.setFont(undefined, "bold");
  doc.text(`Total Items: ${filteredItems.length}`, margin, yPos);
  yPos += lineHeight;
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  doc.text(`Total Value: $${totalValue.toFixed(2)}`, margin, yPos);

  // Save
  const filename = `verishelf-${reportType}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

