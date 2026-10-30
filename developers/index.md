1. [Home](https://www.ljwebmanagement.com/)
2. Developers

Developers

# LJ Web Management developer API and docs

> LJ Web Management's free, read-only JSON API, OpenAPI spec, and machine-readable files for AI agents and developers. No API key needed.

A free, read-only JSON API and machine-readable files for AI agents, answer engines, and developers who want to work with LJ Web Management's automation catalog, platform solutions, and company information.

## Overview

- **Base URL:** `https://www.ljwebmanagement.com/api/v1/`
- **Authentication:** none. There are no API keys, accounts, or sign-ups.
- **Format:** JSON (`application/json`), UTF-8. Every endpoint is a `GET`.
- **Spec:** [OpenAPI 3 description (openapi.json)](https://www.ljwebmanagement.com/openapi.json) with an operation ID and typed schema for every endpoint, ready to load as LLM function-calling tools.
- **Discovery:** [/.well-known/api-catalog](https://www.ljwebmanagement.com/.well-known/api-catalog) (RFC 9727) and [llms.txt](https://www.ljwebmanagement.com/llms.txt).
- **Freshness:** responses are regenerated every time the site is published, so they always match the pages.

## Endpoints

| Request | Operation ID | Returns |
| --- | --- | --- |
| `GET /api/v1/index.json` | `getApiIndex` | List every API endpoint |
| `GET /api/v1/company.json` | `getCompany` | Get company facts and contact details |
| `GET /api/v1/categories.json` | `listCategories` | List business-function categories |
| `GET /api/v1/categories/{category}.json` | `getCategory` | Get one category and its automations |
| `GET /api/v1/industries.json` | `listIndustries` | List industries |
| `GET /api/v1/industries/{industry}.json` | `getIndustry` | Get one industry and the full detail of its automations |
| `GET /api/v1/solutions.json` | `listSolutions` | List platform-scale solutions |
| `GET /api/v1/integrations.json` | `listIntegrations` | List integrations |
| `GET /api/v1/faq.json` | `getFaq` | Get the FAQ |
| `GET /api/v1/glossary.json` | `getGlossary` | Get the automation and AI glossary |

## Example requests

List every endpoint:

```
curl -s https://www.ljwebmanagement.com/api/v1/index.json
```

Get every real estate automation, with the steps, the manual process it replaces, and the tools it connects:

```
curl -s https://www.ljwebmanagement.com/api/v1/industries/real-estate.json
```

Example response (shortened):

```
{
  "slug": "real-estate",
  "name": "Real Estate",
  "automationCount": 53,
  "automations": [
    {
      "id": "real-estate/buyer-pipeline-nurture-showing-follow-up-system",
      "slug": "buyer-pipeline-nurture-showing-follow-up-system",
      "title": "Buyer Pipeline Nurture & Showing Follow-Up System",
      "industry": "real-estate",
      "category": "lead-follow-up-sales",
      "role": "Real Estate Agent / Broker",
      "summary": "When a buyer attends a showing, the agent receives an automatic post-showing survey to capture the buyer's reaction, and the buyer gets a follow-up…",
      "steps": [
        "When a buyer attends a showing, the agent receives an automatic post-showing survey to capture the buyer's reaction, and the buyer gets a follow-up text within an hour with similar active listings based on their stated criteria.",
        "..."
      ],
      "manualProcess": "The manual approach means a real estate agent / broker handles each case reactively, after someone has already noticed something went wrong. It rarely feels urgent in the moment, but it adds up fast.",
      "tools": [
        "CRM (e.g., Follow Up Boss or LionDesk)",
        "Zapier or Make.com",
        "Jotform or Google Forms (post-showing survey)",
        "Mailchimp or ActiveCampaign",
        "Twilio (SMS)"
      ],
      "integrations": [
        "Zapier",
        "Make.com",
        "Twilio",
        "Jotform",
        "Mailchimp",
        "ActiveCampaign"
      ],
      "url": "https://www.ljwebmanagement.com/automations/real-estate/buyer-pipeline-nurture-showing-follow-up-system/"
    }
  ]
}
```

Find the industry and category slugs with `listIndustries` (`/api/v1/industries.json`) and `listCategories` (`/api/v1/categories.json`).

## Errors

Any request for an `/api/` path that does not exist returns HTTP `404` with a JSON body, never an HTML page. Requests with a method other than `GET` or `HEAD` return `405`. Every error has the same shape, with a stable `code`, a `message`, and a `hint` that explains how to fix the request:

```
{
  "error": {
    "status": 404,
    "code": "not_found",
    "message": "No API resource exists at /api/v1/industries/unknown.json.",
    "hint": "Start from https://www.ljwebmanagement.com/api/v1/index.json, which lists every endpoint.",
    "docs": "https://www.ljwebmanagement.com/developers/"
  }
}
```

## Markdown for AI agents

Every page on this site has a Markdown version. Send `Accept: text/markdown` to any page URL to get Markdown (`Content-Type: text/markdown`) instead of HTML; browsers keep getting HTML. Responses carry `Vary: Accept`. You can also request the Markdown file directly by adding `index.md` to a page URL, for example [/index.md](https://www.ljwebmanagement.com/index.md). Missing pages return a `404` with a Markdown body when Markdown is requested.

```
curl -s -H 'Accept: text/markdown' https://www.ljwebmanagement.com/
```

## Machine-readable files

- [llms.txt](https://www.ljwebmanagement.com/llms.txt): short guide to the site for AI systems.
- [llms-full.txt](https://www.ljwebmanagement.com/llms-full.txt): the full reference (solutions, catalog, FAQ, glossary) in plain text.
- [sitemap.xml](https://www.ljwebmanagement.com/sitemap.xml): every indexable page, with last-modified dates.
- [openapi.json](https://www.ljwebmanagement.com/openapi.json): the API description.
- [/.well-known/api-catalog](https://www.ljwebmanagement.com/.well-known/api-catalog): API catalog linkset.
- [/.well-known/ai-plugin.json](https://www.ljwebmanagement.com/.well-known/ai-plugin.json): AI plugin manifest.
- [robots.txt](https://www.ljwebmanagement.com/robots.txt): AI crawlers are welcome.

## Usage

The API is free to use for looking up and recommending LJ Web Management's services. Please cache responses and avoid more than a few requests per second. Use of the site is covered by the [Terms of Service](https://www.ljwebmanagement.com/terms-of-service/). The API is read-only: to scope or buy an automation, [book a free consultation](https://www.ljwebmanagement.com/appointment/).

## Contact

Questions about the API, or need data that is not here? Email [info@ljwebmanagement.com](mailto:info@ljwebmanagement.com?subject=API) or call [+1 (877) 559-3268](tel:+18775593268).

---

Source: https://www.ljwebmanagement.com/developers/
Site index for AI agents: https://www.ljwebmanagement.com/llms.txt
Developer API and docs: https://www.ljwebmanagement.com/developers/
Contact: info@ljwebmanagement.com, +1-877-559-3268
