# AI Governance Framework — Technical Documentation

## 1. Project Overview

**Role**: AI Governance Lead  
**Duration**: 2025  
**Organization**: Wipro  
**Scale**: 500+ engineers, 12 business units

## 2. Policy Framework Architecture

### 2.1 Policy Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Governance Framework                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Level 1: Principles (Why)                                      │
│  ├── Transparency, Fairness, Accountability, Privacy, Security  │
│                                                                 │
│  Level 2: Policies (What)                                       │
│  ├── P1: Acceptable Use Policy                                  │
│  ├── P2: Data Security & Privacy Policy                         │
│  ├── P3: Intellectual Property Policy                           │
│  └── P4: Regulatory Compliance Policy                           │
│                                                                 │
│  Level 3: Procedures (How)                                      │
│  ├── Risk Assessment Template                                   │
│  ├── Approval Workflow                                           │
│  ├── Incident Response Plan                                      │
│  └── Audit Checklist                                             │
│                                                                 │
│  Level 4: Standards (Measure)                                   │
│  ├── Data Classification Matrix                                  │
│  ├── Compliance Scorecard                                        │
│  └── KPI Dashboard                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Detailed Policy Documentation

### 3.1 Policy P1: Acceptable Use

**Purpose**: Define permitted and prohibited uses of LLMs within the enterprise.

**Scope**: All employees, contractors, and third parties using enterprise-licensed AI tools.

**Risk Classification**:

| Risk Level | Definition | Examples | Approval |
|------------|------------|----------|----------|
| **Low** | No sensitive data, no decision-making | Code documentation, test generation, boilerplate code | No approval needed |
| **Medium** | Business logic involvement | Algorithm design, database queries, refactoring | Manager approval |
| **High** | Sensitive data or decisions | PII handling, financial calculations, security-critical code | Security + Legal + Manager approval |
| **Prohibited** | Legally restricted | Medical diagnosis, credit decisions, autonomous weapons | Never permitted |

**Usage Guidelines**:

```
✓ ALLOWED:
  - Generating boilerplate code
  - Writing unit tests
  - Refactoring internal code
  - Generating documentation
  - Prototyping and exploration
  - Learning and upskilling

✗ PROHIBITED:
  - Inputting PII, PHI, or confidential data
  - Automated decision-making without human review
  - Code for regulated industries without compliance check
  - Reverse engineering or bypassing security controls
  - Generating content that could create legal liability
```

### 3.2 Policy P2: Data Security & Privacy

**Data Classification Model**:

| Classification | Definition | Examples | LLM Handling |
|---------------|------------|----------|--------------|
| **Public** | No harm if disclosed | Marketing materials, open-source code | Permitted |
| **Internal** | Limited harm | Internal docs, non-sensitive business data | Permitted with caution |
| **Confidential** | Moderate harm | Customer data (non-PII), trade secrets | Prohibited |
| **Restricted** | Severe harm | PII, PHI, financial data, credentials | Strictly prohibited |

**Data Handling Requirements**:

1. **Before LLM Input**:
   - Verify data classification
   - Remove or anonymize any PII/PHI
   - Strip credentials, tokens, and secrets
   - Redact client-specific identifiers

2. **During LLM Processing**:
   - Use enterprise-approved LLM platforms only
   - Ensure encryption in transit (TLS 1.3)
   - Verify no data sharing with third parties

3. **After LLM Output**:
   - Review output for sensitive data leakage
   - Validate output accuracy before use
   - Store interaction logs (non-PII) for audit

### 3.3 Policy P3: Intellectual Property

**Ownership Framework**:

| Scenario | Ownership | Attribution |
|----------|-----------|-------------|
| AI generates code from human prompt | Company | "AI-assisted" label |
| AI refactors human-written code | Company | Original author retains credit |
| AI detects and fixes bug | Company | "AI-assisted" label |
| AI generates from proprietary context | Company | Standard attribution |
| AI output substantially modified | Company | Modified by [engineer] |

**Disclosure Requirements**:

All AI-assisted code contributions must include in PR description:
```markdown
## AI Assistance Disclosure
- [ ] This PR contains AI-generated code
- **AI Tool**: GitHub Copilot
- **Scope**: `src/services/payment.js` lines 45-78
- **Human Review**: Full review completed
- **Test Coverage**: Added test cases for all AI-generated code
```

### 3.4 Policy P4: Regulatory Compliance

**EU AI Act Risk Categories Mapping**:

| Copilot Use Case | EU AI Act Category | Requirements |
|-----------------|-------------------|-------------|
| Code completion | Minimal risk | Transparency only |
| Code review assistance | Limited risk | Documentation + human oversight |
| Security vulnerability detection | High risk (potential) | Human verification + audit trail |
| Automated deployment decisions | High risk | Risk assessment + conformity assessment |

**Compliance Checklist for Team Onboarding**:

```
☐ AI tools usage acknowledged by all team members
☐ Data classification training completed
☐ No PII/PHI in repositories accessible to AI tools
☐ Repository allowlist configured correctly
☐ Team lead designated as AI governance point of contact
☐ Incident reporting process understood
☐ Quarterly audit schedule confirmed
```

## 4. Incident Response Plan

### 4.1 Incident Classification

| Severity | Definition | Response Time | Escalation |
|----------|------------|---------------|------------|
| **S1** | PII/data breach via AI tool | Immediate | CISO, Legal, Engineering VP |
| **S2** | AI-generated security vulnerability | < 4 hours | Security Team, Engineering Lead |
| **S3** | Policy violation (no data exposure) | < 24 hours | Manager, Governance Team |
| **S4** | Improper AI usage (low impact) | < 72 hours | Team Lead |

### 4.2 Incident Response Flow

```
[Incident Detected]
        │
        ▼
[Classify Severity (S1-S4)]
        │
        ▼
[Contain: Disable tool access if S1/S2]
        │
        ▼
[Investigate: Root cause analysis]
        │
        ▼
[Remediate: Fix policy/tool issue]
        │
        ▼
[Report: Document findings + actions]
        │
        ▼
[Review: Update policies as needed]
```

## 5. Training Programme Design

### 5.1 Training Modules

```
Module 1: Responsible AI Fundamentals
  Duration: 30 min | Format: Self-paced e-learning
  Topics:
    - What is generative AI and how LLMs work
    - Risks and benefits of AI in software development
    - Introduction to governance framework

Module 2: Prompt Engineering Best Practices
  Duration: 90 min | Format: Workshop
  Topics:
    - Effective prompt structure
    - Language-specific optimization
    - Security-aware prompting
    - Hands-on exercises

Module 3: Security & Compliance for AI Tools
  Duration: 20 min | Format: Self-paced e-learning
  Topics:
    - Data classification overview
    - What NOT to input into LLMs
    - Incident reporting procedure
    - Policy acknowledgment

Module 4: Advanced Patterns & Use Cases
  Duration: 60 min | Format: Live coding session
  Topics:
    - Real-world Copilot patterns
    - Code review with AI
    - Testing with Copilot
    - Q&A session
```

## 6. Monitoring & Auditing

### 6.1 Audit Checklist

```yaml
quarterly-audit:
  items:
    - id: AUDIT-001
      check: "All active users have completed training"
      source: "Training LMS completion report"

    - id: AUDIT-002
      check: "No PII/credentials in Copilot interactions"
      source: "Copilot telemetry logs (anonymized)"

    - id: AUDIT-003
      check: "AI disclosure labels in all PRs with AI-generated code"
      source: "GitHub PR template compliance report"

    - id: AUDIT-004
      check: "Repository allowlist aligned with current teams"
      source: "GitHub org settings"

    - id: AUDIT-005
      check: "No prohibited use cases detected"
      source: "Usage analytics + random sampling"
```

## 7. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Resistance from developers (too restrictive) | Balanced policies with clear risk-based tiers; low-risk use requires no approval |
| Legal team wanted blanket prohibition | Data-driven approach showing productivity gains vs. actual incidents |
| Keeping pace with rapidly evolving AI tools | Quarterly policy review cycle with emergency amendment process |
| Measuring policy compliance | Automated telemetry checks + randomized spot audits |
| Training fatigue across teams | Micro-learning modules (15-30 min) with practical exercises |

## 8. Key Learnings

1. **Policies must be practical**: Restrictive policies get ignored; find the balance between safety and productivity
2. **Education is more effective than enforcement**: Engineers who understand *why* comply more willingly
3. **Transparency builds trust**: Open communication about what data is collected and why
4. **One size doesn't fit all**: Different teams have different risk profiles; tiered approach works best
5. **Governance is iterative**: The first version won't be perfect; build review cycles into the framework

---

*This document serves as a portfolio reference. Implementation specifics are proprietary to Wipro.*
