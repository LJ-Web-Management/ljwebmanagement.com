1. [Home](https://www.ljwebmanagement.com/)
2. [Learn](https://www.ljwebmanagement.com/learn/)
3. [AI at Work 101](https://www.ljwebmanagement.com/learn/ai-at-work-101/)
4. Writing prompts that get reliable results

Lesson 2 of 6 · AI at Work 101

# Writing prompts that get reliable results

> A simple five-part structure for business prompts, how to get consistent formats like JSON, using examples, and how to test and improve a prompt.

A simple five-part structure for business prompts, how to get consistent formats like JSON, using examples, and how to test and improve a prompt.

9 min lesson Beginner Free, no sign-up

In this lesson

- Good prompts state the task, give context, supply the material, set the output format, and add rules.
- Specific instructions and an example of good output beat long, vague requests.
- For automations, ask for fixed formats such as JSON with set keys, so the workflow can read the answer.
- Test prompts on real examples, including tricky ones, and refine them like any other process.

Most disappointing AI results come from vague prompts. The model is not lazy or confused; it simply filled the gaps with its best guess. This lesson gives you a structure that removes the guessing, whether you are typing into a chat assistant or writing a prompt that runs thousands of times inside an automation.

## The five parts of a strong prompt

1. **Task:** what you want, in one clear sentence. "Classify this email." "Draft a reply." "Extract these fields."
2. **Context:** who you are, who the audience is, and why this matters. "We are a dental practice. The reader is an existing patient."
3. **Material:** the input to work on: the email, the document, the notes. Clearly separated from the instructions.
4. **Format:** exactly what the output should look like: length, structure, tone, bullet points, a table, or JSON with named keys.
5. **Rules:** what to avoid and what to do when unsure. "Use only the information provided." "If the date is missing, write unknown."

## A before and after

**Before:** _"Reply to this customer."_

**After:**

> Draft a reply to the customer email below for our office manager to review. We are a residential plumbing company. The customer is asking to reschedule. Offer these times: Tuesday 9 a.m. or Wednesday 2 p.m. Keep it under 90 words, warm and professional, and end with our booking link: \[link\]. Do not promise discounts or anything not listed here.
> 
> Customer email: \[paste\]

The second prompt takes thirty seconds longer to write and saves several rounds of editing. Better still, save it as a template and reuse it.

## Show, do not just tell

One short example of good output is often worth a paragraph of instructions. If you want replies in a certain style or summaries in a certain shape, include an example and say "follow this format." Keep examples short, and use more than one if the task varies, so the model does not copy one example too literally.

## Prompts for automations: structure is everything

When a prompt runs inside a workflow, a person is not reading the answer. The next step is. That changes what "good output" means:

- Ask for **JSON with fixed keys** and allowed values, for example: `{"category": "sales" | "support" | "billing" | "other", "urgency": "high" | "normal", "summary": "..."}`.
- Tell the model to respond with the JSON **only**, with no extra text.
- Give it a safe answer for uncertainty, such as `"other"` or a `"needs_human": true` flag, so the workflow can route unclear cases to a person.
- Keep the instructions stable. Changing the prompt changes the output; treat edits like changes to the workflow, and test them.

Many AI providers and automation platforms also offer structured output settings that enforce a format. Use them when available.

## Test and improve

Treat a prompt like a recipe you are perfecting:

- Collect 10 to 20 real examples, including tricky and unusual ones
- Run the prompt on all of them and note every wrong or awkward result
- Add a rule or example that fixes each type of failure
- Re-run the full set to make sure the fix did not break something else
- Save the final version, with the date, as the one your team or workflow uses

## Common mistakes

- **Asking for everything at once.** Break big jobs into steps: extract, then summarize, then draft.
- **Burying the instruction.** Put the task first and the material after, clearly marked.
- **Not saying what to avoid.** If invented details would be harmful, say "do not invent facts."
- **Trusting without checking.** Review output wherever mistakes would cost money or trust.

Ready-made prompts for email, sales, support, operations, and automation planning are in the free [AI prompt library](https://www.ljwebmanagement.com/tools/ai-prompt-library/). Next, you will see exactly where AI belongs inside a workflow.

## Check your understanding

3 quick questions. Answer them all to mark this lesson complete.

\1. Which prompt is likely to produce the most reliable result?

\2. Why ask for JSON output in an automation?

\3. What should a prompt tell the model to do when it is unsure?

[Previous lesson How AI language models work (just enough to use them well)](https://www.ljwebmanagement.com/learn/ai-at-work-101/how-ai-models-work/) [Next lesson Where AI fits inside a workflow](https://www.ljwebmanagement.com/learn/ai-at-work-101/where-ai-fits-in-a-workflow/)

[AI at Work 101](https://www.ljwebmanagement.com/learn/ai-at-work-101/)

6 lessons

1. [1 How AI language models work (just enough to use them well)](https://www.ljwebmanagement.com/learn/ai-at-work-101/how-ai-models-work/)
2. [2 Writing prompts that get reliable results](https://www.ljwebmanagement.com/learn/ai-at-work-101/writing-prompts-that-work/)
3. [3 Where AI fits inside a workflow](https://www.ljwebmanagement.com/learn/ai-at-work-101/where-ai-fits-in-a-workflow/)
4. [4 AI agents: goals, tools, and guardrails](https://www.ljwebmanagement.com/learn/ai-at-work-101/ai-agents-explained/)
5. [5 Data, privacy, and accuracy](https://www.ljwebmanagement.com/learn/ai-at-work-101/data-privacy-and-accuracy/)
6. [6 Planning your first AI automation](https://www.ljwebmanagement.com/learn/ai-at-work-101/your-first-ai-automation/)

**Rather have it built?**We design and build automations for small teams, with a flat quote before any work starts.[Book a Free Consultation](https://www.ljwebmanagement.com/appointment/)

---

Source: https://www.ljwebmanagement.com/learn/ai-at-work-101/writing-prompts-that-work/
Site index for AI agents: https://www.ljwebmanagement.com/llms.txt
Developer API and docs: https://www.ljwebmanagement.com/developers/
Contact: info@ljwebmanagement.com, +1-877-559-3268
