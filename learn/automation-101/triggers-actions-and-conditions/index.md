1. [Home](https://www.ljwebmanagement.com/)
2. [Learn](https://www.ljwebmanagement.com/learn/)
3. [Automation 101](https://www.ljwebmanagement.com/learn/automation-101/)
4. Triggers, actions, and conditions: how workflows think

Lesson 4 of 8 · Automation 101

# Triggers, actions, and conditions: how workflows think

> The building blocks of every automated workflow explained with examples: event and scheduled triggers, actions, filters, branches, delays, and loops.

The building blocks of every automated workflow explained with examples: event and scheduled triggers, actions, filters, branches, delays, and loops.

9 min lesson Beginner Free, no sign-up

In this lesson

- A trigger is the event that starts a workflow: something happens, or a scheduled time arrives.
- Actions do the work, usually by creating, updating, sending, or looking something up in an app.
- Conditions (filters and branches) decide which actions run for each record.
- Delays, lookups, and loops let one workflow handle follow-ups, existing records, and lists.

In lesson one you met the three building blocks of every workflow. Now it is time to look at each one closely, because once you understand them, every automation tool on the market will feel familiar. Zapier, Make, n8n, and Power Automate all use different words for the same ideas.

## Triggers: what starts the workflow

A trigger is the moment a workflow wakes up. There are two main kinds:

- **Event triggers** fire when something happens in an app: a form is submitted, an email arrives, a payment succeeds, a deal moves to "won," a row is added to a spreadsheet, a file lands in a folder.
- **Scheduled triggers** fire at a set time: every morning at 8, every Friday at 4, the first of the month.

Choosing the right trigger is half the design. Ask: _what is the earliest reliable signal that this work needs to happen?_ For invoicing, it might be "job marked complete." For a review request, "appointment checked out." The more precise the trigger, the more precise everything after it.

**Watch out for "someone notices"**

If today's trigger is a person noticing something ("when I see the job is done"), you need to capture that moment digitally first, for example with a status field or a one-tap button. Automation cannot start from something that only happens in someone's head.

## Actions: what the workflow does

Actions are the steps that run after the trigger. Almost every action is one of a handful of verbs:

- **Create:** a contact, a task, an invoice, a calendar event, a document.
- **Update:** a deal stage, a status, a spreadsheet row, a tag.
- **Send:** an email, a text, a chat message, a notification.
- **Find:** look up a customer, an order, or a record to use its details later.
- **Transform:** format a date, split a full name, calculate a total, or ask an AI model to summarize or classify text.

Each action can use data from the trigger and from earlier steps. That is called **data mapping**: telling the tool that the "Email" field from the form goes into the "Email" field of the CRM contact.

## Conditions: deciding what happens

Conditions make a workflow smart. There are two common forms:

- **Filters** stop the workflow unless a rule is met: only continue if the order total is over $500, only if the lead's state is Illinois, only if the email is not from our own domain.
- **Branches** (also called paths or routers) send each record down a different set of actions: residential leads get one follow-up sequence, commercial leads another.

Write conditions in plain English first: "If the customer is new, send the welcome sequence; otherwise, send a thank-you." Then build them.

## Four more tools you will use often

1. **Delays:** wait a set time before the next step, such as two days before a follow-up or one hour before a reminder.
2. **Lookups:** search before you create, so you update an existing customer instead of creating a duplicate.
3. **Loops:** repeat actions for each item in a list, such as every line item on an order or every row in a report.
4. **Error paths:** decide what happens when a step fails, such as retrying or alerting a person. Lesson seven covers this.

## Putting it together

Here is the lead follow-up workflow from lesson three, written the way an automation tool sees it:

| Step | Type | What it does |
| --- | --- | --- |
| 1 | Trigger | New website form submission |
| 2 | Find | Search the CRM for a contact with this email |
| 3 | Branch | Found? Update the contact. Not found? Create it. |
| 4 | Send | Text and email a reply with a booking link |
| 5 | Send | Notify the assigned salesperson in chat |
| 6 | Delay | Wait 2 days |
| 7 | Filter | Continue only if no appointment has been booked |
| 8 | Send | Send a friendly follow-up text |

Eight steps, no code, and every lead gets a fast reply and a follow-up, every time. The [lead follow-up guide](https://www.ljwebmanagement.com/guides/automate-lead-follow-up/) shows a complete version with message templates.

In the next lesson, you will see how automation tools actually connect to your apps behind the scenes.

## Check your understanding

3 quick questions. Answer them all to mark this lesson complete.

\1. "Every Monday at 8 a.m., email the weekly sales summary." What kind of trigger is this?

\2. You want different follow-ups for residential and commercial leads. What do you add?

\3. Why add a lookup (search) step before creating a CRM contact?

[Previous lesson Mapping a process before you automate it](https://www.ljwebmanagement.com/learn/automation-101/mapping-a-process/) [Next lesson Connecting your tools: integrations, APIs, and webhooks](https://www.ljwebmanagement.com/learn/automation-101/connecting-your-tools/)

[Automation 101](https://www.ljwebmanagement.com/learn/automation-101/)

8 lessons

1. [1 What automation is (and what it is not)](https://www.ljwebmanagement.com/learn/automation-101/what-is-automation/)
2. [2 Spotting tasks worth automating](https://www.ljwebmanagement.com/learn/automation-101/spotting-tasks-worth-automating/)
3. [3 Mapping a process before you automate it](https://www.ljwebmanagement.com/learn/automation-101/mapping-a-process/)
4. [4 Triggers, actions, and conditions: how workflows think](https://www.ljwebmanagement.com/learn/automation-101/triggers-actions-and-conditions/)
5. [5 Connecting your tools: integrations, APIs, and webhooks](https://www.ljwebmanagement.com/learn/automation-101/connecting-your-tools/)
6. [6 Choosing an automation platform](https://www.ljwebmanagement.com/learn/automation-101/choosing-an-automation-platform/)
7. [7 Testing, monitoring, and handling errors](https://www.ljwebmanagement.com/learn/automation-101/testing-and-monitoring/)
8. [8 Measuring results and scaling what works](https://www.ljwebmanagement.com/learn/automation-101/measuring-roi-and-scaling/)

**Rather have it built?**We design and build automations for small teams, with a flat quote before any work starts.[Book a Free Consultation](https://www.ljwebmanagement.com/appointment/)

---

Source: https://www.ljwebmanagement.com/learn/automation-101/triggers-actions-and-conditions/
Site index for AI agents: https://www.ljwebmanagement.com/llms.txt
Developer API and docs: https://www.ljwebmanagement.com/developers/
Contact: info@ljwebmanagement.com, +1-877-559-3268
