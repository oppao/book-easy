# BookEasy AI — Create Camp Workshop Starter

## 1. Create app

```bash
npx create-expo-app@latest BookEasy --template blank
cd BookEasy
```

Replace the generated `App.js` with the provided `App.js`. Edit `WEBHOOK_URL` to your active HTTPS n8n **production** webhook URL.

```bash
npx expo start
```

Open Expo Go and scan the QR code. If LAN discovery fails, try `npx expo start --tunnel`.

## 2. Create Google Sheet

Create a spreadsheet named `BookEasy Bookings` and a tab named `Bookings` with headers:

`bookingId,createdAt,name,email,service,date,time,status`

## 3. Build n8n workflow

1. **Webhook**: POST; path `bookeasy-booking`; Response: `Using Respond to Webhook Node`. Test with its test URL while the editor is listening.
2. **Code**: `Run Once for All Items`; paste `validation-code.js`.
3. **IF**: condition `{{ $json.success }}` equals boolean `true`.
4. **False** -> **Respond to Webhook**: response code `400`; respond with first incoming JSON item (contains `success:false`, `message`).
5. **True** -> **Google Sheets**: `Append Row` to `BookEasy Bookings / Bookings`, map `bookingId`, `createdAt`, `name`, `email`, `service`, `date`, `time`, `status` from the **Code** node's fields. Use expressions such as `{{ $('Code').first().json.bookingId }}`; change `Code` if your node has a different name.
6. **Gmail**: Send an admin notification. To: your workshop inbox. Subject: `New booking {{ $('Code').first().json.bookingId }}`. Body: map service, date, time, name, email from the Code node. Don't send sensitive real customer data in demos.
7. **Respond to Webhook**: response code `200`, JSON body using expressions: `{"success":true,"bookingId":"{{ $('Code').first().json.bookingId }}","status":"Pending","message":"Booking request received"}`. Make sure the expression evaluates to valid JSON; alternatively configure fields in JSON mode with one expression returning an object.
8. Save and **activate/publish** the workflow. Use the production URL (not the temporary test URL) in `App.js`.

**Note:** The success response happens after Sheets and Gmail. If either node fails, n8n may return an error even if Sheets already saved the request. For the workshop, keep this sequential setup and explain retry/duplicate handling as a production improvement.

## 4. Test the API

```bash
curl -i -X POST 'https://YOUR-N8N-DOMAIN/webhook/bookeasy-booking' \
  -H 'Content-Type: application/json' \

  -d '{"name":"Demo Participant","email":"demo@example.com","service":"Consultation","date":"2026-10-28","time":"10:00"}'
```

Expected success JSON: `{"success":true,"bookingId":"BE-...","status":"Pending","message":"Booking request received"}`. Test an invalid email or yesterday's date and expect HTTP 400.

## 5. Workshop exercises

- Beginner: Change branding and add a fourth service in both the app and n8n validation.
- Intermediate: Add a notes field and save it in Sheets.
- Advanced: Check Google Calendar availability, add idempotency to prevent duplicate requests, and return a confirmed status only after successful calendar event creation.

## 6. Trainer demo sequence

1. Show the app on a phone.
2. Submit a request.
3. Show the n8n execution.
4. Show the row added to Sheets.
5. Show the admin notification.
6. Return to the app and show the booking reference.

## Security and production caveats

This is a **workshop prototype**, not a production booking system. Public webhooks can be spammed. Add authentication, rate limiting, consent/privacy notice, secure secret handling, server-side validation, database uniqueness/idempotency, and calendar conflict checks before real use. Do not embed API secrets in the mobile app. Use dummy data for the workshop.
