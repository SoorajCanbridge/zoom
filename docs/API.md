## API Documentation

Base URL: /api

### Authentication
- Staff: login via /api/auth/login → use header Authorization: Bearer <token>.
- Customers: login via /api/customer-auth/login or after OTP verification → use same header.

### Common Responses
Success:
```
{
  "success": true,
  "message": "...",
  "data": { ... },
  "statusCode": 200
}
```
Error:
```
{
  "success": false,
  "message": "...",
  "errors": null,
  "statusCode": 400
}
```

### Pagination
- Query: page, limit
- Response includes pagination: { total, page, pages, limit }

---

## Staff Auth

### POST /auth/register
- Body: firstName, lastName, email, password, department
- Response: { user: { id, firstName, lastName, email, role }, token }

### POST /auth/login
- Body: email, password
- Response: { user: { id, firstName, lastName, email, role }, token }

### POST /auth/password-reset
- Body: email
- Sends staff password reset email

---

## Customer Auth

### POST /customer-auth/signup
- Body: name, email, phone, password, company?
- Creates customer, emails OTP
- Response: { customerId }

### POST /customer-auth/verify-otp
- Body: email, otp
- Response: { token, customer: { id, name, email } }

### POST /customer-auth/login
- Body: email, password
- Requires verified customer
- Response: { token, customer: { id, name, email } }

### POST /customer-auth/resend-otp
- Body: email
- Sends new OTP

### POST /customer-auth/forgot-password
- Body: email
- Sends customer password reset link

### POST /customer-auth/reset-password
- Body: token, password
- Resets customer password

---

## Customers (Staff auth required)
Header: Authorization: Bearer <staff_token>

### POST /customers
- Body: name, email, phone, company?
- Creates a customer assigned to current user

### GET /customers
- Query: page?, limit?, status? (active|inactive|lead), search?
- Paginated list

### GET /customers/:id
- Returns customer with assignedTo and notes.createdBy populated

### PUT /customers/:id
- Partial update; if assignedTo changes, emails new/old assignees

### DELETE /customers/:id (admin only)
- Deletes a customer

### POST /customers/:id/notes
- Body: content
- Adds a note by current user

---

## Meetings (Staff auth required)
Header: Authorization: Bearer <staff_token>

### POST /meetings
- Body: title, customerId, startTime (ISO), duration? (default 30)
- Creates Zoom meeting and emails confirmations

### GET /meetings
- Query: page?, limit?, status?, startDate?, endDate?
- Non-admins see only their meetings

### PATCH /meetings/:id/status
- Body: status (scheduled|completed|cancelled)
- If cancelled: deletes Zoom meeting and notifies

---

## Slots (Staff auth required)
Header: Authorization: Bearer <staff_token>

### POST /slots
- Body: startTime, endTime, recurrence?
- Creates availability slot

### GET /slots/available
- Lists available slots (filters as implemented)

### POST /slots/book
- Body: slotId, meetingId
- Books a slot for an existing meeting

### GET /slots/my-slots
- Lists current user slots

---

## Payments (Staff auth required)
Header: Authorization: Bearer <staff_token>

Meeting payment fields:
- paymentRequired, price (INR), currency (INR), paymentStatus (pending|paid|failed|refunded), razorpayOrderId, razorpayPaymentId, razorpaySignature

Env:
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

### POST /payments/create-order
- Body: meetingId
- Pre-req: paymentRequired=true and valid price
- Response: { orderId, amount, currency, keyId }

### POST /payments/verify
- Body: meetingId, razorpay_order_id, razorpay_payment_id, razorpay_signature
- Verifies signature; sets paymentStatus

---

## Email & Config
- SMTP: EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS
- FRONTEND_URL used in emails

## Middleware (Auth)
- auth: staff JWT
- authCustomer: customer JWT (verified, not inactive)
- authEither: staff or customer JWT
