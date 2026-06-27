# CloudTrack — Serverless Task & Expense Manager

A full-stack, event-driven serverless application built entirely on AWS, demonstrating production-style cloud architecture patterns including authentication, async processing, scheduled automation, and observability.

**Live Demo:** https://d3qe66ml0dyajj.cloudfront.net

---

## Overview

CloudTrack lets users sign up, manage tasks and expenses, upload receipt images, and receive automated email digests — all powered by a 100% serverless AWS backend with zero managed servers.

## Architecture

```
                         ┌─────────────────────┐
                         │   CloudFront (CDN)   │
                         │   HTTPS + Caching    │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   S3 (React SPA)      │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   Amazon Cognito      │
                         │   (Auth / JWT)        │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   API Gateway (HTTP)  │
                         │   JWT Authorizer      │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
      ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
      │ Lambda: CRUD   │    │ Lambda:        │    │ DynamoDB       │
      │ (Create/Read/  │───▶│ Process events │    │ (Tasks &       │
      │ Update/Delete) │    │                │    │  Expenses)     │
      └───────────────┘    └───────────────┘    └───────────────┘

      ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
      │ S3 (Receipt    │───▶│ SQS Queue      │───▶│ Lambda:        │
      │ Uploads)       │    │                │    │ ProcessReceipt │
      └───────────────┘    └───────────────┘    └───────┬───────┘
                                                          │
                                                          ▼
                                                  ┌───────────────┐
                                                  │ SNS (Email     │
                                                  │ Notifications) │
                                                  └───────────────┘

      ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
      │ EventBridge    │───▶│ Lambda:        │───▶│ SNS (Daily     │
      │ (Daily Cron)   │    │ DailyDigest    │    │ Digest Email)  │
      └───────────────┘    └───────────────┘    └───────────────┘

                         ┌───────────────────────┐
                         │  CloudWatch            │
                         │  Dashboards + Alarms   │
                         └───────────────────────┘
```

## Tech Stack

**Frontend**
- React (Vite)
- AWS Amplify (Auth SDK)
- Hosted on S3 + CloudFront (HTTPS)

**Backend**
- AWS Lambda (Node.js) — 6 functions
- API Gateway (HTTP API) with JWT Authorizer
- Amazon DynamoDB (NoSQL, on-demand capacity)

**Auth**
- Amazon Cognito (User Pools, email verification, JWT tokens)

**Event-Driven Processing**
- S3 (receipt uploads) → SQS (queue) → Lambda (processing) → SNS (email notification)

**Scheduled Automation**
- EventBridge (cron schedule) → Lambda → SNS (daily digest email)

**Observability**
- CloudWatch Dashboards (Lambda invocations/errors, DynamoDB capacity, API Gateway metrics)
- CloudWatch Alarms (error-rate alerting via SNS)

**IAM**
- Least-privilege-oriented roles per Lambda function

## Features

- Email/password signup with verification code flow (Cognito)
- JWT-secured REST API — no unauthenticated access to user data
- Full CRUD for tasks and expenses, scoped per authenticated user
- Receipt image upload triggers an async processing pipeline
- Email notification on receipt upload and on daily task/expense summary
- Real-time dashboard of system health (invocations, errors, capacity, API errors)
- Automated alerting on Lambda error spikes

## What I Learned

This project was built and debugged end-to-end, including resolving real production-style issues:
- CORS preflight failures caused by authorizer interaction with OPTIONS requests
- IAM role/policy configuration for least-privilege Lambda access
- JWT authorizer configuration (issuer/audience validation) against Cognito
- Duplicate header bugs in API testing tools
- S3 → SQS event notification permissions (resource-based policies)

## Project Structure

```
cloudtrack-frontend/
├── src/
│   ├── App.jsx          # Auth state routing
│   ├── Auth.jsx          # Signup/Login/Email verification
│   ├── Dashboard.jsx     # CRUD UI for tasks & expenses
│   ├── aws-config.js     # Cognito + API config
│   └── main.jsx          # Amplify initialization
├── dist/                 # Production build (deployed to S3)
└── package.json
```

## AWS Services Used

DynamoDB · Lambda · API Gateway · Cognito · S3 · CloudFront · SQS · SNS · EventBridge · CloudWatch · IAM

---

Built as a hands-on learning project to understand serverless architecture, event-driven design, and AWS service integration at a practical level.