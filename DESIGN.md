# Boardroom AI — 1-page design note

## Product thesis

A useful executive board simulator should not be a collection of personas that simply repeat the same LLM answer with different job titles. The prototype therefore treats the product as a decision workflow:

**CEO question → independent executive analysis → cross-examination → decision memo.**

This gives the CEO three useful layers: what each executive thinks, where they disagree, and what decision follows after the disagreement.

## Agent architecture

The CFO, CMO, COO and CSO have separate system instructions defining mission, lens, default bias and behavioral rules. They receive the same company-data context so disagreements are about priorities and interpretation rather than different facts.

The first analysis round runs in parallel. The debate moderator then receives the four positions and creates targeted challenges. Finally, a chairperson synthesizes the discussion.

I chose a lightweight orchestrator rather than a fully autonomous agent framework because this assignment benefits from deterministic control, observability and testability. Each stage has a clear input/output contract.

## Grounding and reliability

Uploaded CSV/JSON is normalized and stored with the session. Every model call receives that normalized data and is instructed to distinguish facts from assumptions and never invent company-specific numbers.

This is intentionally stronger than simply saying “use the data.” A production system should go further: source IDs on every claim, validation against a typed financial schema, retrieval over large datasets, confidence labels, audit logs and automated hallucination evaluations.

## Persistence

Sessions and transcripts are stored in MongoDB. A CEO can return to a session and continue the conversation. The transcript is also passed back into later executive analysis to preserve context.

## Product decisions / what I left out

I did not add autonomous web research, action-taking, financial forecasting or a complex memory graph in this prototype. Those features can make an executive product look impressive while making correctness and evaluation harder.

The next high-value features would be:
1. typed KPI/financial models and charting;
2. citations back to uploaded data rows;
3. scenario comparison (“cut marketing 15% vs. raise price 5%”);
4. board-quality decision history;
5. authentication, tenant isolation and audit logging.

## Why the CTO is not included

The initial four roles cover the assignment's core decision dimensions: finance, demand, execution and strategy. A CTO can be added when technology/product investment is a recurring decision category. Keeping the prototype to four agents reduces redundant model calls and keeps the debate legible.
