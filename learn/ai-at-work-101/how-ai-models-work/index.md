1. [Home](https://www.ljwebmanagement.com/)
2. [Learn](https://www.ljwebmanagement.com/learn/)
3. [AI at Work 101](https://www.ljwebmanagement.com/learn/ai-at-work-101/)
4. How AI language models work (just enough to use them well)

Lesson 1 of 6 · AI at Work 101

# How AI language models work (just enough to use them well)

> What large language models are, how they generate text, what tokens and context windows are, and what that means for what AI is good and bad at in business.

What large language models are, how they generate text, what tokens and context windows are, and what that means for what AI is good and bad at in business.

8 min lesson Beginner Free, no sign-up

In this lesson

- A large language model predicts likely text based on patterns learned from huge amounts of writing.
- It is excellent at reading, sorting, summarizing, extracting, and drafting language.
- It does not look facts up unless you give it the information, so it can be confidently wrong.
- Models read and write in tokens, and can only consider a limited context at once.

You do not need to understand the math behind AI to use it well, any more than you need to understand an engine to drive. But a few basic ideas will explain almost every surprising thing AI does, good and bad, and help you decide where it belongs in your business.

## What a large language model is

The AI behind today's chat assistants and AI automation steps is a **large language model** (LLM). It was trained on an enormous amount of text, and from that it learned the patterns of language: grammar, facts that appear often, how arguments are structured, how a polite email sounds, how a contract is laid out.

When you give it a prompt, it generates a response one small piece at a time, each time choosing a likely next piece based on everything before it. That simple process, at huge scale, produces remarkably capable writing and reasoning.

## What that means in practice

Because LLMs work with patterns in language, they are excellent at language tasks:

- **Reading and sorting:** is this email a complaint, a sales lead, or an invoice?
- **Extracting:** pull the name, date, and amount out of this document.
- **Summarizing:** turn a 40-minute call into five bullet points and next steps.
- **Drafting and rewriting:** write a first reply, make this friendlier, shorten this to 100 words.
- **Answering from supplied material:** answer this question using only our policy document.

And they have predictable weaknesses:

- **They can be confidently wrong.** If the answer is not in the prompt or well represented in training data, the model may produce something that sounds right but is not. This is often called a _hallucination_.
- **They do not know your business.** Your prices, policies, and customers are not in the model unless you include them.
- **Their knowledge has a cutoff.** Unless connected to a search or your systems, they do not know recent events.
- **They are not calculators or databases.** For exact math or record lookups, use regular software and let AI handle the language around it.

## Tokens and context windows

Models read and write in **tokens**, chunks of text roughly three quarters of an English word. Two practical consequences:

1. **Cost:** AI providers charge per token, for both what you send and what comes back. The [AI cost calculator](https://www.ljwebmanagement.com/tools/ai-cost-calculator/) shows how that adds up.
2. **Context window:** each model can only consider a limited amount of text at once, including your instructions, any documents, and its answer. Modern models handle long documents, but sending only what is relevant keeps results sharper and cheaper.

## Models do not remember by default

Each request to a model through an API is independent. A chat assistant appears to remember the conversation because the app resends the earlier messages each time. In an automation, if the AI needs customer history or your policies, the workflow must include that information in the prompt, or retrieve it first. This is the idea behind **retrieval-augmented generation** (RAG): find the relevant facts in your own data, then give them to the model with the question.

## Bigger is not always better

Providers offer several model sizes. Large models are better at nuanced writing and multi-step reasoning; small models are faster and much cheaper, and are often perfectly good at narrow tasks like classifying an email. A common pattern is to use a small model for high-volume sorting and a larger one for the occasional complex draft.

**The one idea to remember**

Treat an LLM like a fast, well-read new assistant: brilliant with language, eager to help, and unaware of anything about your business you have not told it. Give it clear instructions and the right information, and check its work where mistakes matter.

Next, you will learn how to write prompts that make the output reliable.

## Check your understanding

3 quick questions. Answer them all to mark this lesson complete.

\1. At its core, what does a large language model do?

\2. Which task is an LLM generally best suited to?

\3. Why might an AI give an outdated or invented answer about your business?

[Back to Course overview](https://www.ljwebmanagement.com/learn/ai-at-work-101/) [Next lesson Writing prompts that get reliable results](https://www.ljwebmanagement.com/learn/ai-at-work-101/writing-prompts-that-work/)

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

Source: https://www.ljwebmanagement.com/learn/ai-at-work-101/how-ai-models-work/
Site index for AI agents: https://www.ljwebmanagement.com/llms.txt
Developer API and docs: https://www.ljwebmanagement.com/developers/
Contact: info@ljwebmanagement.com, +1-877-559-3268
