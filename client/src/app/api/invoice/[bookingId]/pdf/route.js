import { NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

export const dynamic = 'force-dynamic';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    lineHeight: 1.5,
    flexDirection: 'column',
    color: '#1A4D3E',
  },
  header: {
    borderBottom: '2px solid #18606D',
    paddingBottom: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    color: '#18606D',
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 4,
  },
  invoiceTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1A4D3E',
    lineHeight: 1.2,
  },
  invoiceNo: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#18606D',
    borderBottom: '1px solid #D9EEF2',
    paddingBottom: 4,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  col: {
    width: '48%',
    backgroundColor: '#F4FAFB',
    borderRadius: 6,
    padding: 10,
    borderLeft: '3px solid #18606D',
  },
  colTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#18606D',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#64748B',
    fontSize: 8,
  },
  value: {
    color: '#1A4D3E',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  badge: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8F4F7',
    borderBottomWidth: 1,
    borderBottomColor: '#D9EEF2',
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D9EEF2',
    padding: 6,
  },
  colDesc: {
    width: '75%',
    fontSize: 9,
  },
  colAmount: {
    width: '25%',
    textAlign: 'right',
    fontSize: 9,
  },
  tableHeaderColDesc: {
    width: '75%',
    fontFamily: 'Helvetica-Bold',
    color: '#1A4D3E',
    fontSize: 9,
  },
  tableHeaderColAmount: {
    width: '25%',
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    color: '#1A4D3E',
    fontSize: 9,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalBox: {
    width: '40%',
    borderTop: '2px solid #18606D',
    paddingTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1A4D3E',
  },
  totalVal: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#18606D',
  },
  noteBox: {
    backgroundColor: '#F4FAFB',
    borderRadius: 6,
    padding: 10,
    marginTop: 15,
  },
  noteTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1A4D3E',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 8,
    color: '#64748B',
    lineHeight: 1.4,
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#D9EEF2',
    paddingTop: 8,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#64748B',
    lineHeight: 1.3,
  },
});

// PDF Document Component
const InvoicePDF = ({ booking }) => {
  const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const invoiceDate = new Date(booking.createdAt || new Date()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });

  const transactionId = booking.paymentDetails?.razorpay_payment_id || booking.bookingId.split('-').slice(1).join('-') || 'N/A';
  const paymentMethod = booking.paymentDetails?.method || 'Online (Razorpay)';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>GutTalks</Text>
            <Text style={styles.subtitle}>Your partner in digestive wellness</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceNo}>Invoice #: {booking.bookingId}</Text>
          </View>
        </View>

        {/* Invoice details & bill to grid */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Invoice Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice Date:</Text>
              <Text style={styles.value}>{invoiceDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{transactionId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>{paymentMethod}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>PAID</Text>
              </View>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.colTitle}>Billed To</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{booking.userName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{booking.userEmail}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{booking.userPhone}</Text>
            </View>
          </View>
        </View>

        {/* Consultation details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Details</Text>
          <View style={{ backgroundColor: '#F4FAFB', padding: 10, borderRadius: 6, borderLeft: '3px solid #18606D' }}>
            <View style={styles.row}>
              <Text style={styles.label}>Service Name:</Text>
              <Text style={styles.value}>1-on-1 Gut Health Consultation (30 min)</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date & Time:</Text>
              <Text style={styles.value}>{formattedDate} at {booking.startTime} – {booking.endTime} IST</Text>
            </View>
          </View>
        </View>

        {/* Pricing Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderColDesc}>Description</Text>
            <Text style={styles.tableHeaderColAmount}>Amount (INR)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Gut Health Consultation (1 Session)</Text>
            <Text style={styles.colAmount}>Rs. {booking.price?.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>GST (0%)</Text>
            <Text style={styles.colAmount}>Rs. 0.00</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid:</Text>
              <Text style={styles.totalVal}>Rs. {booking.price?.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Expectation / Notes */}
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Important Information:</Text>
          <Text style={styles.noteText}>• Rescheduling requires at least 24 hours prior notice from your dashboard.</Text>
          <Text style={styles.noteText}>• Please join the consultation 5 minutes early to test your audio and video.</Text>
          <Text style={styles.noteText}>• For any queries regarding this invoice, reach hello@guttalks.com.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>GutTalks – Your partner in digestive wellness</Text>
          <Text style={styles.footerText}>123 Gut Health Street, Wellness City, IN 560001</Text>
          <Text style={styles.footerText}>This is a system generated tax invoice and does not require a physical signature.</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { bookingId } = resolvedParams;

    // Fetch from backend
    const apiBaseUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
    const response = await fetch(`${apiBaseUrl}/api/booking/invoice-details/${bookingId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Failed to fetch booking details: ${errorText}`, { status: response.status });
    }

    const { booking } = await response.json();

    // Generate PDF buffer
    const buffer = await renderToBuffer(<InvoicePDF booking={booking} />);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${bookingId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice PDF generation error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
