# Admin Dashboard - Complete Feature Guide

## 🎯 Overview
A comprehensive admin dashboard has been created for the Client Billing System with full Supabase integration. The dashboard allows administrators to manage all clients, view payment details, update payment statuses, and configure per-square-meter rates for different categories.

## ✨ Features Implemented

### 1. **Admin Dashboard Page** (`/dashboard/admin`)

#### **Clients & Payments Tab**
- **Summary Cards**:
  - Total Clients count
  - Total Revenue (sum of all bills)
  - Outstanding Amount (unpaid balances)

- **Client List View**:
  - View all clients with their contact information (phone, address)
  - Expandable details for each client showing:
    - **Projects**: All projects with area, rate per sq ft, and total amount
    - **Bills Table**: Complete billing information including:
      - Bill Number
      - Total Amount
      - Paid Amount (in green)
      - Outstanding Amount (in red)
      - Status badge (PENDING, PARTIAL, PAID, OVERDUE)
      - Quick actions: Add Payment button and Status dropdown
    - **Payment History**: List of all payments made for each bill with:
      - Amount paid
      - Payment method (CASH, BANK_TRANSFER, CHEQUE, ONLINE)
      - Payment date
      - Notes

#### **Rate Management Tab**
- **Add New Rate Button**: Create new rate categories
- **Rate Categories Display**:
  - CHINE category rate per square meter
  - STAR category rate per square meter
  - Description for each rate
  - Edit and Delete buttons for each rate

### 2. **Payment Management Features**

#### **Add Payment Modal**
When clicking "Add Payment" on any bill, admin can:
- View bill number and outstanding amount
- Enter payment amount (defaults to outstanding amount)
- Select payment method:
  - Cash
  - Bank Transfer
  - Cheque
  - Online
- Set payment date
- Add optional notes
- System automatically:
  - Updates bill's paid amount
  - Recalculates outstanding amount
  - Updates bill status (PENDING → PARTIAL → PAID)
  - Sets paid date when bill is fully paid

#### **Update Bill Status**
- Quick status dropdown for each bill
- Options: PENDING, PARTIAL, PAID, OVERDUE
- Only available for unpaid bills

### 3. **Rate Management System**

#### **Add/Edit Rate Modal**
- **Rate Category**: Choose between CHINE or STAR
- **Rate per Square Meter**: Set the price (supports decimals)
- **Description**: Optional description for the rate category
- Rates can be edited or deleted after creation
- Only one rate per category type (CHINE or STAR)

## 🔌 API Endpoints Created

### Payments API (`/api/payments-supabase/route.ts`)

#### GET `/api/payments-supabase`
- Fetches all payments with bill and client details
- Returns payments ordered by date (newest first)

#### POST `/api/payments-supabase`
- Creates a new payment for a bill
- Automatically updates bill's paid amount and status
- Request body:
```json
{
  "billId": "string",
  "amount": number,
  "method": "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE",
  "notes": "string (optional)",
  "paymentDate": "ISO date string (optional)"
}
```

#### PUT `/api/payments-supabase`
- Updates bill status (admin only)
- Can manually adjust paid amount
- Request body:
```json
{
  "billId": "string",
  "status": "PENDING" | "PARTIAL" | "PAID" | "OVERDUE",
  "paidAmount": number (optional)
}
```

### Rates API (`/api/rates/route.ts`) - Already existed, works with Supabase

#### GET `/api/rates`
- Fetches all rate categories (CHINE and STAR)

#### POST `/api/rates`
- Creates new rate category
- Admin only
- Request body:
```json
{
  "rateType": "CHINE" | "STAR",
  "ratePerSqMeter": number,
  "description": "string (optional)"
}
```

#### PUT `/api/rates`
- Updates existing rate
- Admin only
- Request body:
```json
{
  "id": "string",
  "ratePerSqMeter": number,
  "description": "string (optional)"
}
```

#### DELETE `/api/rates?id=<rate_id>`
- Deletes a rate category
- Admin only

### Client Overview API (`/api/client-overview/route.ts`) - Already existed
- Fetches all clients with projects, bills, and payments
- Returns summary statistics for each client
- Admin only

## 🗄️ Database Schema (Supabase)

The system uses the following tables:

### Tables Used:
1. **clients** - Client information
2. **projects** - Project details with area and rates
3. **bills** - Billing information with payment tracking
4. **payments** - Individual payment records
5. **rates** - Rate categories (CHINE/STAR) per square meter

## 🎨 UI Features

### Design Elements:
- **Clean, Modern Interface**: Professional white background with blue accents
- **Responsive Layout**: Works on desktop and mobile devices
- **Color-Coded Information**:
  - Green for paid amounts and revenue
  - Red for outstanding amounts
  - Status badges with appropriate colors
- **Interactive Elements**:
  - Expandable client details
  - Modal dialogs for forms
  - Hover effects on buttons
  - Tab navigation

### User Experience:
- **Instant Feedback**: Alert messages for all actions
- **Data Refresh**: Automatic data reload after updates
- **Validation**: Required fields marked with asterisks
- **Default Values**: Smart defaults (e.g., outstanding amount as payment amount)

## 🔐 Authentication & Authorization

- **Login System**: Uses Supabase authentication via `/api/auth/login`
- **Role-Based Access**: Admin role required for dashboard access
- **Session Management**: Cookie-based authentication (user_id, user_role)
- **Protected Routes**: Middleware checks for valid authentication

## 📱 How to Use

### For Administrators:

1. **Login**: Navigate to `/auth/login` and use admin credentials
2. **View Dashboard**: Automatically redirected to `/dashboard/admin`
3. **Manage Payments**:
   - Click "View Details" on any client
   - Review bills and payment status
   - Click "Add Payment" to record a payment
   - Use status dropdown to manually update bill status
4. **Configure Rates**:
   - Click "Rate Management" tab
   - Click "Add New Rate" to create CHINE or STAR rates
   - Edit or delete existing rates as needed

### Setting Up Rates:

1. Navigate to Rate Management tab
2. Click "Add New Rate"
3. Select CHINE or STAR category
4. Enter rate per square meter (e.g., 150.00)
5. Optionally add description (e.g., "Standard quality print rate")
6. Click "Add Rate"

### Recording Payments:

1. Find client in Clients & Payments tab
2. Click "View Details"
3. Locate the bill in the Bills table
4. Click "Add Payment"
5. Verify/adjust payment amount
6. Select payment method
7. Set payment date (defaults to today)
8. Add notes if needed
9. Click "Add Payment"
10. Bill status updates automatically

## 🚀 Technical Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with bcrypt
- **State Management**: React useState
- **Styling**: Tailwind CSS with custom components

## 📊 Data Flow

```
User Action (Frontend)
    ↓
API Route (/api/payments-supabase or /api/rates)
    ↓
Authentication Check (cookies)
    ↓
Supabase Query/Update
    ↓
Response to Frontend
    ↓
UI Update & Feedback
```

## 🎯 Key Benefits

1. **Complete Visibility**: See all clients, projects, bills, and payments in one place
2. **Easy Payment Tracking**: Record payments and see status update automatically
3. **Flexible Rate Management**: Configure different rates for CHINE and STAR categories
4. **Real-time Updates**: All changes reflect immediately
5. **Audit Trail**: Payment history shows who paid what and when
6. **Financial Overview**: Quick summary of revenue and outstanding amounts

## 📝 Future Enhancements (Optional)

- Export data to PDF/Excel
- Advanced filtering and search
- Payment reminders for overdue bills
- Analytics dashboard with charts
- Bulk payment entry
- Client portal for self-service
- Email notifications for payments

## 🔧 Configuration

### Environment Variables Required:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup:
- All tables should have Row Level Security (RLS) policies
- Admin users need appropriate permissions
- Rate table should allow inserts/updates/deletes for admins

## ✅ Testing Checklist

- [x] Admin can view all clients
- [x] Client details expand/collapse correctly
- [x] Payment modal opens with correct bill details
- [x] Payments are recorded successfully
- [x] Bill status updates after payment
- [x] Outstanding amount calculates correctly
- [x] Rate management CRUD operations work
- [x] Only one rate per category (CHINE/STAR)
- [x] Authentication protects admin routes
- [x] UI is responsive and user-friendly

---

**Created**: January 2026  
**Version**: 1.0  
**Status**: Production Ready

