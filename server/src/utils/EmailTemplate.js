import sendEmail from "../services/email.js";



// utils/emailTemplates.js (add this function)

export const sendOrderStatusEmail = async (userEmail, orderDetails) => {
  const {
    orderId,
    status,           // e.g., "Order Placed", "Shipped", "Delivered", "Cancelled"
    customStatus,
    items,
    totalAmount,
    shippingAddress,
    updatedAt
  } = orderDetails;

  const subject = `📦 Order Status Update - GutTalks (Order #${orderId})`;

  const statusColor = {
    'Order Placed': '#18606D',
    'Processing': '#FF9800',
    'Shipped': '#2196F3',
    'Delivered': '#4CAF50',
    'Cancelled': '#F44336'
  }[status] || '#18606D';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - GutTalks</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1A4D3E;
      margin: 0;
      padding: 20px;
      background-color: #F4FAFB;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border: 1px solid #D9EEF2;
    }
    .header {
      background: linear-gradient(135deg, #18606D 0%, #2A7F8F 100%);
      padding: 25px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 25px;
    }
    .status-badge {
      display: inline-block;
      background-color: ${statusColor};
      color: white;
      padding: 6px 14px;
      border-radius: 30px;
      font-weight: bold;
      margin: 15px 0;
    }
    .info-box {
      background-color: #F4FAFB;
      border-left: 4px solid #18606D;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .order-table th, .order-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #D9EEF2;
    }
    .order-table th {
      background-color: #E8F4F7;
      color: #1A4D3E;
    }
    .total {
      font-size: 18px;
      font-weight: bold;
      text-align: right;
      margin-top: 10px;
      color: #18606D;
    }
    .footer {
      background-color: #F4FAFB;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #D9EEF2;
    }
    .btn {
      display: inline-block;
      background-color: #18606D;
      color: white;
      padding: 10px 20px;
      border-radius: 40px;
      text-decoration: none;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Order Status Update</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Your order <strong>#${orderId}</strong> status has been updated to:</p>
      <div style="text-align: center;">
        <span class="status-badge">${customStatus || status}</span>
      </div>
      <div class="info-box">
        <p><strong>📅 Updated on:</strong> ${new Date(updatedAt).toLocaleString('en-IN')}</p>
        ${shippingAddress ? `<p><strong>📍 Shipping Address:</strong><br/>${shippingAddress.fullName}<br/>${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? ', '+shippingAddress.addressLine2 : ''}<br/>${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>📞 ${shippingAddress.phone}</p>` : ''}
      </div>
      
      <h3>Order Summary</h3>
      <table class="order-table">
        <thead>
          <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.product?.name || 'Product'}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price?.toFixed(2) || '0'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">
        Total Paid: ₹${totalAmount?.toFixed(2) || '0'}
      </div>
      
      <div style="text-align: center; color: "white">
        <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View Order Details</a>
      </div>
      <p style="font-size: 12px; margin-top: 20px;">If you have any questions, please contact us at hello@guttalks.in</p>
    </div>
    <div class="footer">
      <p>GutTalks – Your digestive wellness partner</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({ to: userEmail, subject, html });
};
// utils/emailTemplates.js (or inside the controller)
export const sendBookingConfirmationEmail = async (userEmail, bookingDetails) => {
  const { bookingId, date, startTime, endTime, meetLink, price, userName } = bookingDetails;
  
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  
  const invoiceNumber = bookingId;
  const subtotal = price;
  const gstRate = 0; // or actual GST if applicable
  const gstAmount = 0;
  const total = price;
  const paymentMethod = "Online (Razorpay)";
  const transactionId = bookingId.split('-').slice(1).join('-');
  
  const subject = `🧾 Payment Receipt & Booking Confirmation - GutTalks (Invoice: ${invoiceNumber})`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - GutTalks</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1A4D3E;
      margin: 0;
      padding: 20px;
      background-color: #F4FAFB;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border: 1px solid #D9EEF2;
    }
    .header {
      background: linear-gradient(135deg, #18606D 0%, #2A7F8F 100%);
      padding: 25px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
    }
    .header p {
      margin: 5px 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 30px 25px;
    }
    .invoice-title {
      font-size: 20px;
      font-weight: bold;
      color: #1A4D3E;
      border-bottom: 2px solid #18606D;
      display: inline-block;
      padding-bottom: 5px;
      margin-bottom: 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 15px;
    }
    .invoice-details {
      background-color: #F4FAFB;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 20px;
      border-left: 4px solid #18606D;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .detail-label {
      font-weight: 600;
      color: #18606D;
    }
    .detail-value {
      color: #1A4D3E;
    }
    .bill-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .bill-table th, .bill-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #D9EEF2;
    }
    .bill-table th {
      background-color: #E8F4F7;
      color: #1A4D3E;
      font-weight: 600;
    }
    .total-row {
      font-weight: bold;
      font-size: 16px;
    }
    .total-amount {
      font-size: 20px;
      color: #18606D;
    }
    .payment-status {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .meet-link {
      background-color: #E8F4F7;
      padding: 15px;
      border-radius: 12px;
      text-align: center;
      margin: 20px 0;
    }
    .meet-link a {
      display: inline-block;
      background-color: #18606D;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 40px;
      font-weight: bold;
      margin-top: 10px;
    }
    .meet-link a:hover {
      background-color: #2A7F8F;
    }
    .footer {
      background-color: #F4FAFB;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #D9EEF2;
    }
    .download-btn {
      display: inline-block;
      background-color: #18606D;
      color: white;
      padding: 8px 16px;
      border-radius: 40px;
      text-decoration: none;
      font-size: 12px;
      margin-top: 10px;
    }
    .important {
      color: #D9534F;
      font-size: 12px;
      margin-top: 15px;
    }
    @media (max-width: 480px) {
      .detail-row {
        flex-direction: column;
        margin-bottom: 12px;
      }
      .bill-table th, .bill-table td {
        padding: 8px;
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧾 Payment Receipt</h1>
      <p>GutTalks – Your partner in digestive wellness</p>
    </div>
    <div class="content">
      <div class="invoice-title">Invoice #${invoiceNumber}</div>
      
      <div class="greeting">
        Dear <strong>${userName || 'Valued Customer'}</strong>,
      </div>
      <p>Thank you for choosing GutTalks. Your payment has been received successfully, and your consultation is confirmed. Please find your invoice details below.</p>
      
      <!-- Invoice Details -->
      <div class="invoice-details">
        <div class="detail-row">
          <span class="detail-label">Invoice Date:</span>
          <span class="detail-value">${new Date().toLocaleString('en-IN')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction ID:</span>
          <span class="detail-value">${transactionId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Status:</span>
          <span class="detail-value"><span class="payment-status">PAID</span></span>
        </div>
      </div>
      
      <!-- Service Details -->
      <h3 style="margin: 20px 0 10px;">Consultation Details</h3>
      <div class="invoice-details">
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">1-on-1 Gut Health Consultation (30 min)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date & Time:</span>
          <span class="detail-value">${formattedDate} at ${startTime} – ${endTime} IST</span>
        </div>
      </div>
      
      <!-- Price Breakdown Table -->
      <table class="bill-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gut Health Consultation</td>
            <td>₹${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>GST (${gstRate}%)</td>
            <td>₹${gstAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total</strong></td>
            <td class="total-amount"><strong>₹${total.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <!-- Meeting Link Section -->
      <div class="meet-link">
  <strong>🔗 Your Consultation Link:</strong><br/>
  <a href="${meetLink}" target="_blank" style="color:#ffffff !important; background-color:#18606D !important; display:inline-block; padding:12px 24px; border-radius:40px; font-weight:bold; text-decoration:none; margin-top:10px;">
    Join Video Consultation
  </a>
  <p style="font-size: 12px; margin-top: 8px;">Click the button above to join at your scheduled time.</p>
</div>
      
      <p><strong>What to expect:</strong></p>
      <ul>
        <li>Your expert will listen to your concerns and health history.</li>
        <li>You'll receive personalized diet and lifestyle recommendations.</li>
        <li>The session lasts approximately 30 minutes.</li>
        <li>Please join 5 minutes early to test your audio/video.</li>
      </ul>
      
      <p><strong>Need to reschedule?</strong><br/>
      You can manage your booking from your <a href="${process.env.FRONTEND_URL}/dashboard" style="color:white;">dashboard</a>. Changes require at least 24 hours notice.</p>
      
      <div style="text-align: center; margin: 20px 0;">
  <a href="${process.env.FRONTEND_URL}/api/invoice/${bookingId}/pdf" 
     class="download-btn" 
     style="background-color: #2A7F8F; color:#ffffff !important; display:inline-block; padding:8px 16px; border-radius:40px; text-decoration:none; font-size:12px; margin-top:10px;">
     ⬇️ Download Invoice (PDF)
  </a>
</div>
      
      <p class="important">⚠️ For any queries regarding this invoice or your consultation, please contact us at hello@guttalks.com or +91 98765 43210.</p>
    </div>
    <div class="footer">
      <p>GutTalks – Your partner in digestive wellness</p>
      <p>123 Gut Health Street, Wellness City, IN 560001</p>
      <p>&copy; ${new Date().getFullYear()} GutTalks. All rights reserved.</p>
      <p style="margin-top: 8px;">This is a system generated invoice – no signature required.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
};

// utils/emailTemplates.js (add this function)
export const sendRescheduleEmail = async (userEmail, details) => {
  const { bookingId, oldDate, oldStartTime, oldEndTime, newDate, newStartTime, newEndTime, meetLink, userName } = details;
  const formattedOldDate = new Date(oldDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedNewDate = new Date(newDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const oldTime = `${oldStartTime} – ${oldEndTime}`;
  const newTime = `${newStartTime} – ${newEndTime}`;

  const subject = `🔄 Consultation Rescheduled - GutTalks (ID: ${bookingId})`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1A4D3E; background-color: #F4FAFB; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #D9EEF2; overflow: hidden; }
    .header { background: linear-gradient(135deg, #18606D, #2A7F8F); padding: 20px; text-align: center; color: white; }
    .content { padding: 25px; }
    .old-slot { background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 12px; margin: 15px 0; }
    .new-slot { background-color: #E8F4F7; border-left: 4px solid #18606D; padding: 12px; margin: 15px 0; }
    .meet-link { background-color: #E8F4F7; padding: 15px; border-radius: 12px; text-align: center; margin-top: 20px; }
    .button { display: inline-block; background-color: #18606D; color: white; padding: 10px 20px; border-radius: 40px; text-decoration: none; color: white; }
    .footer { background-color: #F4FAFB; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #D9EEF2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔄 Consultation Rescheduled</h2>
    </div>
    <div class="content">
      <p>Dear <strong>${userName}</strong>,</p>
      <p>Your consultation has been rescheduled by the admin. Please see the updated details below.</p>
      <div class="old-slot">
        <strong>❌ Original Slot:</strong><br/>
        Date: ${formattedOldDate}<br/>
        Time: ${oldTime} IST
      </div>
      <div class="new-slot">
        <strong>✅ New Slot:</strong><br/>
        Date: ${formattedNewDate}<br/>
        Time: ${newTime} IST
      </div>
      <div class="meet-link">
        <strong>🔗 Meeting Link (same as before):</strong><br/>
        <a href="${meetLink}" target="_blank" 
   style="display:inline-block; background-color:#18606D; color:#ffffff !important; padding:10px 20px; border-radius:40px; text-decoration:none; font-weight:500;">
   Join Consultation
</a>
      </div>
      <p style="font-size: 12px; margin-top: 20px;">If the new time doesn't work for you, please contact us to reschedule again.</p>
    </div>
    <div class="footer">
      <p>GutTalks – Your digestive wellness partner</p>
    </div>
  </div>
</body>
</html>
  `;
  await sendEmail({ to: userEmail, subject, html });
};

// Send email notification on booking status change by admin
export const sendBookingStatusEmail = async (userEmail, details) => {
  const { bookingId, date, startTime, endTime, status, userName } = details;
  
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });

  const subject = `📅 Booking Status Update - GutTalks (ID: ${bookingId})`;

  // Status mapping to color and custom message
  const statusColor = {
    completed: '#4CAF50', // Green
    cancelled: '#F43F5E',  // Red
    scheduled: '#18606D',  // Teal
    rescheduled: '#FF9800' // Orange
  }[status] || '#18606D';

  const statusText = status.toUpperCase();

  let statusMessage = `Your booking status has been updated to **${statusText}**.`;
  if (status === 'completed') {
    statusMessage = `We hope you had a great consultation! Your session has been marked as **COMPLETED**. You can view details, recommendations, or schedule your next consultation on your dashboard.`;
  } else if (status === 'cancelled') {
    statusMessage = `Your scheduled consultation has been **CANCELLED**. If you have questions regarding refunds, scheduling a new slot, or any other query, please feel free to reach out to us.`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Status Update - GutTalks</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1A4D3E;
      margin: 0;
      padding: 20px;
      background-color: #F4FAFB;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border: 1px solid #D9EEF2;
    }
    .header {
      background: linear-gradient(135deg, #18606D 0%, #2A7F8F 100%);
      padding: 25px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 25px;
    }
    .status-badge {
      display: inline-block;
      background-color: ${statusColor};
      color: white;
      padding: 6px 16px;
      border-radius: 30px;
      font-weight: bold;
      font-size: 14px;
      margin: 15px 0;
      text-transform: uppercase;
    }
    .info-box {
      background-color: #F4FAFB;
      border-left: 4px solid #18606D;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 14px;
    }
    .btn {
      display: inline-block;
      background-color: #18606D;
      color: white;
      padding: 12px 24px;
      border-radius: 40px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 15px;
    }
    .footer {
      background-color: #F4FAFB;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #D9EEF2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Booking Status Update</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${userName}</strong>,</p>
      <p>${statusMessage}</p>
      
      <div style="text-align: center;">
        <span class="status-badge">${statusText}</span>
      </div>

      <div class="info-box">
        <p><strong>📅 Consultation Slot Details:</strong></p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${startTime} – ${endTime} IST</p>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.FRONTEND_URL}/dashboard" class="btn" style="color:#ffffff !important;">Go to Dashboard</a>
      </div>
      
      <p style="font-size: 12px; margin-top: 25px; color: #64748B;">If you have any questions, please contact us at hello@guttalks.com.</p>
    </div>
    <div class="footer">
      <p>GutTalks – Your partner in digestive wellness</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({ to: userEmail, subject, html });
};

