/**
 * Branded membership payment receipt PDF (replicates Razorpay Payment Page style).
 */
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { getReceiptConfig } = require('./receiptConfig');

const ORANGE = '#FF6600';
const TEXT = '#1a1a1a';
const MUTED = '#666666';

function formatInrFromPaise(paise) {
  const n = Number(paise) || 0;
  return (n / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatReceiptDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function membershipLineLabel(payment) {
  const isRenewal =
    payment.member_type === 'EXISTING' ||
    String(payment.enrollment_remark || '').toUpperCase() === 'RENEWAL';
  return isRenewal ? 'ABGP E-Membership — Renewal' : 'ABGP E-Membership — Yearly Membership';
}

function drawField(doc, label, value, x, y, width = 230) {
  doc.fontSize(9).fillColor(MUTED).font('Helvetica').text(label, x, y, { width });
  doc.fontSize(10).fillColor(TEXT).font('Helvetica-Bold').text(String(value || '—'), x, y + 13, { width });
}

/**
 * @param {object} payment — row from abgp.payments after SUCCESS
 * @returns {Promise<Buffer>}
 */
function generateMembershipReceiptPdf(payment) {
  return new Promise((resolve, reject) => {
    const config = getReceiptConfig();
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const paidAt = payment.payment_date || payment.updated_at || new Date();
    const amountInr = formatInrFromPaise(payment.amount);
    const lineLabel = membershipLineLabel(payment);

    if (fs.existsSync(config.logoPath)) {
      doc.save();
      doc.circle(80, 72, 28).clip();
      doc.image(config.logoPath, 52, 44, { width: 56, height: 56 });
      doc.restore();
    }

    doc.fontSize(18).fillColor(TEXT).font('Helvetica-Bold').text(config.businessName, 120, 48);
    doc.fontSize(9).fillColor(MUTED).font('Helvetica').text('Akhil Bhartiya Grahak Panchayat (ABGP)', 120, 72);
    if (config.gstin) {
      doc.text(`GSTIN: ${config.gstin}`, 120, 86);
    }

    doc.y = 130;
    doc.fontSize(16).fillColor(ORANGE).font('Helvetica-Bold').text('Payment Receipt', { align: 'center' });
    doc.moveDown(0.8);
    doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    let y = doc.y + 18;
    drawField(doc, 'Payment ID', payment.razorpay_payment_id, 50, y);
    drawField(doc, 'Order ID', payment.razorpay_order_id, 320, y);
    y += 42;
    drawField(doc, 'Date & time', formatReceiptDate(paidAt), 50, y);
    drawField(doc, 'Status', 'Paid', 320, y);
    y += 48;

    doc.fontSize(11).fillColor(TEXT).font('Helvetica-Bold').text('Customer details', 50, y);
    y += 22;
    drawField(doc, 'Name', payment.full_name, 50, y);
    drawField(doc, 'Email', payment.email, 320, y);
    y += 42;
    drawField(doc, 'Phone', payment.phone_no, 50, y);
    drawField(doc, 'State / District', `${payment.state || '—'} / ${payment.district || '—'}`, 320, y);
    y += 52;

    doc.rect(50, y, 495, 54).fill('#fff5eb');
    doc.fontSize(10).fillColor(TEXT).font('Helvetica-Bold').text('Description', 58, y + 10, { width: 280 });
    doc.text('Amount (INR)', 400, y + 10, { width: 130, align: 'right' });
    doc.font('Helvetica').fontSize(10).text(lineLabel, 58, y + 30, { width: 280 });
    doc.text(amountInr, 400, y + 30, { width: 130, align: 'right' });

    y += 68;
    doc.font('Helvetica-Bold').fontSize(11).fillColor(TEXT).text('Total paid', 58, y);
    doc.text(`₹ ${amountInr}`, 400, y, { width: 130, align: 'right' });

    y += 40;
    doc
      .fontSize(8)
      .fillColor(MUTED)
      .font('Helvetica')
      .text(
        'This is a computer-generated receipt from ABGP for your membership payment. ' +
          'You may also receive a separate payment confirmation from Razorpay.',
        50,
        y,
        { width: 495, align: 'center' }
      );

    doc.fontSize(8).fillColor(ORANGE).text(config.websiteUrl, 50, y + 28, {
      width: 495,
      align: 'center',
      link: config.websiteUrl,
      underline: true,
    });

    doc.end();
  });
}

module.exports = {
  generateMembershipReceiptPdf,
  formatInrFromPaise,
  formatReceiptDate,
  membershipLineLabel,
};
