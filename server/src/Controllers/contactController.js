// controllers/contactController.js
import Contact from "../Models/Contact.js";

import sendEmail from "../services/email.js";

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message} = req.body;
    console.log(name)
    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }
    
    
    
    
    
    // Create contact record
    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      subject,
      message,
      userId: req.user?._id // if user is logged in
    });
    
    // Send notification emails (optional)
    await sendContactNotification(contact);
    
    res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you soon.",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject
      }
    });
    
  } catch (error) {
    console.log("Contact form submission error:", error.message);
    
    // Handle duplicate submissions or validation errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate submission detected"
      });
    }
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || "Validation error"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

// Get all contact messages (for admin)
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter
    let filter = {};
    
    if (status && ["pending", "read", "replied", "closed"].includes(status)) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }
    
    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("-__v");
    
    const total = await Contact.countDocuments(filter);
    
    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts"
    });
  }
};

// Get single contact (for admin)
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
    
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact"
    });
  }
};

// Update contact status (for admin)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyMessage } = req.body;
    
    if (!status || !["pending", "read", "replied", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    // Send reply email if replyMessage is provided
    if (status === "replied" && replyMessage && contact.email) {
      await sendReplyEmail(contact, replyMessage);
    }
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      message: "Status updated successfully",
      data: contact
    });
    
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact"
    });
  }
};

const sendReplyEmail = async (contact, replyMessage) => {
  try {
   const emailOptions = {
  to: contact.email,
  subject: `Re: Your contact inquiry - GutTalks`,
  html: `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1A4D3E;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #F4FAFB;
        }
        .container {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border: 1px solid #D9EEF2;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #18606D;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #18606D;
            margin-bottom: 5px;
        }
        .greeting {
            font-size: 18px;
            color: #1A4D3E;
            margin: 15px 0;
        }
        .reply-box {
            background-color: #F4FAFB;
            padding: 18px;
            border-radius: 12px;
            border-left: 4px solid #18606D;
            margin: 20px 0;
        }
        .signature {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #D9EEF2;
            color: #64748B;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #D9EEF2;
            color: #94A3B8;
            font-size: 12px;
        }
        a {
            color: #18606D;
            text-decoration: none;
        }
        a:hover {
            color: #2A7F8F;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">GutTalks</div>
            <div style="color: #64748B; font-size: 14px;">Reply to your inquiry</div>
        </div>
        
        <div class="greeting">
            Dear <strong>${contact.name}</strong>,
        </div>
        
        <p>Thank you for contacting GutTalks. Here's our response to your inquiry:</p>
        
        <div class="reply-box">
            <strong>📝 Our Response:</strong>
            <p style="margin-top: 10px;">${replyMessage}</p>
        </div>
        
        <p>If you have any further questions, feel free to reply to this email or visit our <a href="${process.env.FRONTEND_URL || 'https://guttalks.com'}/faq">FAQ page</a>.</p>
        
        <div class="signature">
            <p><strong>Best regards,</strong><br>
            The GutTalks Support Team<br>
            <a href="mailto:hello@guttalks.com">hello@guttalks.com</a> | <a href="tel:+919876543210">+91 98765 43210</a></p>
        </div>
        
        <div class="footer">
            <p>This is an automated response. Please do not reply to this email if you need further assistance.</p>
            <p>&copy; ${new Date().getFullYear()} GutTalks – Your partner in digestive wellness. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `
};


    
    // Send email using your existing sendEmail middleware
    await sendEmail(emailOptions);
    
    console.log(`✅ Reply email sent to ${contact.email}`);
    
  } catch (error) {
    console.error("Reply email sending error:", error);
    // Don't throw error - just log it
  }
};

// Delete contact (for admin)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }
    
    res.json({
      success: true,
      message: "Contact deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact"
    });
  }
};

// Helper function to send emails (optional)
// Helper function to send emails using your existing sendEmail middleware
const sendContactNotification = async (contact) => {
  try {
    // Email to admin
   // Email template for admin notification
const adminMailOptions = {
  to: "help@guttalks.in",
  subject: `📩 New Contact Form Submission: ${contact.subject}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #F4FAFB;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                padding: 30px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                border: 1px solid #D9EEF2;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #18606D;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #18606D;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #64748B;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .field {
                margin-bottom: 15px;
                padding: 10px;
                background-color: #F4FAFB;
                border-radius: 12px;
                border-left: 4px solid #18606D;
            }
            .field strong {
                color: #1A4D3E;
                display: block;
                margin-bottom: 5px;
            }
            .field-value {
                color: #475569;
            }
            .message-box {
                background-color: #F4FAFB;
                padding: 15px;
                border-radius: 12px;
                border: 1px solid #D9EEF2;
                margin: 15px 0;
            }
            .timestamp {
                color: #94A3B8;
                font-size: 12px;
                text-align: right;
                margin-top: 10px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #D9EEF2;
                color: #64748B;
                font-size: 14px;
            }
            .action-btn {
                display: inline-block;
                background-color: #18606D;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 40px;
                font-weight: bold;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">GutTalks</div>
                <div class="subtitle">New Contact Form Submission Received</div>
            </div>
            <div class="content">
                <p>A user has submitted a contact form on the website. Here are the details:</p>
                <div class="field">
                    <strong>👤 Name</strong>
                    <div class="field-value">${contact.name}</div>
                </div>
                <div class="field">
                    <strong>📧 Email</strong>
                    <div class="field-value">${contact.email}</div>
                </div>
                <div class="field">
                    <strong>📱 Phone</strong>
                    <div class="field-value">${contact.phone || 'Not provided'}</div>
                </div>
                <div class="field">
                    <strong>🏷️ Subject</strong>
                    <div class="field-value">${contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1)}</div>
                </div>
                <div class="message-box">
                    <strong>📝 Message:</strong>
                    <p>${contact.message}</p>
                </div>
                <div class="timestamp">
                    📅 Submitted: ${contact.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                </div>
            </div>
            <div class="footer">
                <p>You can view this contact in the admin panel:</p>
                <a href='https://gutstalks.in/contacts' class="action-btn">View in Admin Panel</a>
                <p style="margin-top: 20px;"><small>This is an automated notification. Please do not reply to this email.</small></p>
            </div>
        </div>
    </body>
    </html>
  `
};

// Email template for user auto-reply
const userMailOptions = {
  to: contact.email,
  subject: '🙏 Thank You for Contacting GutTalks',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting GutTalks</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #F4FAFB;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                padding: 30px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                border: 1px solid #D9EEF2;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #18606D;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #18606D;
                margin-bottom: 10px;
            }
            .welcome-text {
                font-size: 20px;
                color: #1A4D3E;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #64748B;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1A4D3E;
            }
            .message-summary {
                background-color: #F4FAFB;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #18606D;
                margin: 20px 0;
            }
            .summary-title {
                color: #18606D;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .summary-item {
                margin-bottom: 10px;
            }
            .contact-info {
                background-color: #E8F4F7;
                padding: 15px;
                border-radius: 12px;
                border-left: 4px solid #2A7F8F;
                margin: 20px 0;
                text-align: center;
            }
            .phone-number {
                font-size: 24px;
                font-weight: bold;
                color: #1A4D3E;
                margin: 10px 0;
            }
            .hours {
                color: #64748B;
                font-size: 14px;
            }
            .next-steps {
                margin: 30px 0;
            }
            .step {
                display: flex;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            .step-icon {
                width: 30px;
                height: 30px;
                background-color: #18606D;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                flex-shrink: 0;
                font-weight: bold;
            }
            .step-content {
                flex: 1;
            }
            .step-title {
                font-weight: bold;
                color: #1A4D3E;
                margin-bottom: 5px;
            }
            .step-description {
                color: #64748B;
            }
            .cta-button {
                display: block;
                width: 100%;
                background-color: #18606D;
                color: white;
                text-align: center;
                padding: 15px;
                border-radius: 40px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                transition: background-color 0.3s;
            }
            .cta-button:hover {
                background-color: #2A7F8F;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #D9EEF2;
                color: #64748B;
                font-size: 14px;
            }
            .social-links {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 20px 0;
            }
            .social-link {
                color: #18606D;
                text-decoration: none;
                font-weight: bold;
            }
            .disclaimer {
                font-size: 12px;
                color: #94A3B8;
                margin-top: 20px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">GutTalks</div>
                <div class="welcome-text">Thank You for Contacting Us!</div>
                <div class="subtitle">Your journey to better gut health starts here</div>
            </div>
            <div class="content">
                <div class="greeting">Dear <strong>${contact.name}</strong>,</div>
                <p>We have successfully received your message and truly appreciate you reaching out. Our team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
                <div class="message-summary">
                    <div class="summary-title">📋 Your Message Summary:</div>
                    <div class="summary-item"><strong>Subject:</strong> ${contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1)}</div>
                    <div class="summary-item"><strong>Submitted:</strong> ${contact.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
                <div class="next-steps">
                    <div class="step-title">📅 What happens next?</div>
                    <div class="step">
                        <div class="step-icon">1</div>
                        <div class="step-content">
                            <div class="step-title">Review Process</div>
                            <div class="step-description">Our gut health experts will review your message and assign it to the appropriate department.</div>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-icon">2</div>
                        <div class="step-content">
                            <div class="step-title">Response Timeline</div>
                            <div class="step-description">You will receive a detailed response from our team within 24 hours via email.</div>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-icon">3</div>
                        <div class="step-content">
                            <div class="step-title">Follow-up</div>
                            <div class="step-description">If needed, we may reach out for additional information to better assist you.</div>
                        </div>
                    </div>
                </div>
                <div class="contact-info">
                    <strong>📞 Need Immediate Assistance?</strong>
                    <div class="phone-number">+91 98765 43210</div>
                    <div class="hours">Available Monday-Saturday: 9 AM - 7 PM IST</div>
                    <p style="margin-top: 10px; font-size: 14px;">Our support team is here to help with any gut health queries.</p>
                </div>
                <a href="${process.env.FRONTEND_URL || 'https://guttalks.com'}/products" class="cta-button">🍏 Explore Our Gut Health Programs</a>
            </div>
            <div class="footer">
                <div class="social-links">
                    <a href="${process.env.FRONTEND_URL || 'https://guttalks.in'}/contact" class="social-link">Contact Us</a>
                    <a href="${process.env.FRONTEND_URL || 'https://guttalks.in'}/faq" class="social-link">FAQ</a>
                    <a href="${process.env.FRONTEND_URL || 'https://guttalks.in'}/privacy-policy" class="social-link">Privacy Policy</a>
                    <a href="${process.env.FRONTEND_URL || 'https://guttalks.in'}/terms-conditions" class="social-link">Terms</a>
                </div>
                <p>Best regards,<br><strong>The GutTalks Team</strong><br><em>Your partner in digestive wellness</em></p>
                <div class="disclaimer">This is an automated message. Please do not reply to this email directly.<br>If you have further questions, please contact us through our website.</div>
            </div>
        </div>
    </body>
    </html>
  `
};
    
    // Send emails using your existing email middleware
    await sendEmail(adminMailOptions);
    await sendEmail(userMailOptions);
    
    console.log(`✅ Contact emails sent to admin and ${contact.email}`);
    
  } catch (error) {
    console.error("Email sending error:", error);
    // Don't throw error to prevent form submission failure
  }
};