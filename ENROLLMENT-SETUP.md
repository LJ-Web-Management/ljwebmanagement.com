# Enrollment setup

Each course's detail view (`courses/index.html`, rendered by
`assets/apple.js`) shows a **Book an Appointment** button instead of a
custom form. It links to `/appointment`, a page that embeds a
Typeform (`data-tf-live="01KY5CPJYD0ZA29RZEH68M7A52"`) where the
visitor picks a time and tells you which course they want. There is
no backend in this repo; Typeform hosts the form and handles
notifications and anti-spam on its own.

## 1. Notifications (required before this works)

Typeform only emails you when a recipient is configured:

1. Open the form in your Typeform dashboard.
2. Go to **Settings -> Notifications**.
3. Add `info@ljwebmanagement.com` as a recipient for new responses.

Without this, submissions still land in the Typeform dashboard but
you won't get an email.

## 2. What happens on submission

The visitor books a time and answers the form's questions (name,
email, and which course they want). Typeform redirects them to
`/appointment/booked`, a confirmation page built into this site, and
(once notifications are configured per step 1) emails
`info@ljwebmanagement.com` with the response.

If the redirect ever needs to change, it's set in the Typeform's own
**Connect -> Redirect on completion** setting, not in this repo.

## 3. Collecting payment after a booking comes in

This flow does not charge a card on the site. After you get a
booking notification (or talk to the person on the call):

1. Create a one-off Stripe Payment Link or Invoice for that
   customer at the course's price (Stripe Dashboard -> Payments ->
   Invoices, or Payment Links -> + New).
2. Email it to the customer along with the course access/materials,
   from `info@ljwebmanagement.com`.

If you'd rather not do this by hand for every sale, ask your developer
or Claude Code to wire this up to create the Stripe Payment Link
automatically (requires a Stripe secret key on a small server
function, since Stripe's API can't be called securely from a static
page).

## 4. Anti-spam

Typeform applies its own spam filtering; there's no custom honeypot
or validation code in this repo for this form.

## 5. Test before going live

Book a test appointment yourself end to end, confirm you land on
`/appointment/booked`, and confirm the notification email actually
arrives at `info@ljwebmanagement.com`.
