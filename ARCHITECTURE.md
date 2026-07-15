# Car Service Tracking V2 — Full Amplify Architecture

## Overview

This version uses AWS Amplify Gen 2 for everything — no separate Lambda/API Gateway backend.
All features from V1 are preserved but implemented with Amplify-native services.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                    │
│          Hosted on Amplify Hosting (CDN)             │
├─────────────────────────────────────────────────────┤
│              Amplify Client Libraries                 │
│   (Auth, API/GraphQL, DataStore, PubSub)            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │ Cognito  │  │ AppSync  │  │  DynamoDB      │    │
│  │  Auth    │  │ GraphQL  │  │  (Tables)      │    │
│  │          │  │  + Subs  │  │                │    │
│  └──────────┘  └──────────┘  └────────────────┘    │
│                      │                               │
│              ┌───────┴───────┐                       │
│              │  Resolvers    │                       │
│              │ (VTL/JS)      │                       │
│              └───────────────┘                       │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Lambda Functions (only for complex logic)    │   │
│  │  - Stage validation                           │   │
│  │  - Push notifications                         │   │
│  │  - Admin operations                           │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Key Differences from V1

| Feature | V1 | V2 |
|---------|----|----|
| Auth | Cognito + custom JWT middleware | Amplify Auth (managed) |
| API | Express + Lambda + API Gateway | AppSync GraphQL |
| Real-time | WebSocket (custom) + polling | AppSync Subscriptions (built-in) |
| Database | DynamoDB via SDK | DynamoDB via AppSync resolvers |
| Hosting | Amplify (frontend only) | Amplify (frontend + backend) |
| Cost | Lambda invocations + API GW calls | AppSync queries (much cheaper) |

## Cost Advantage

- **No API Gateway fees** — AppSync handles all API traffic
- **No Lambda per-request** — Most CRUD goes directly to DynamoDB via VTL resolvers
- **Built-in subscriptions** — No WebSocket server to maintain
- **Cognito managed** — No custom auth code to maintain
- **Lambda only for business logic** — Stage validation, notifications

## GraphQL Schema Design

### Types
- User
- Vehicle
- Booking
- ServiceOrder
- StageUpdate
- Notification

### Subscriptions (real-time)
- `onServiceOrderUpdated(customerId)` — Customer gets live updates
- `onBookingStatusChanged(customerId)` — Booking confirmations
- `onNewBooking` — Engineers see new bookings instantly

### Auth Rules
- Customers: read/write own data only
- Engineers: read all orders, update assigned orders
- Admins: full access

## Project Structure

```
car-service-tracking-v2/
├── amplify/
│   ├── auth/
│   │   └── resource.ts          # Cognito config
│   ├── data/
│   │   └── resource.ts          # AppSync schema + resolvers
│   ├── functions/
│   │   ├── stage-validator/     # Validates stage transitions
│   │   └── push-notifier/       # Sends push notifications
│   └── backend.ts               # Main backend definition
├── src/                          # React frontend
│   ├── components/
│   ├── pages/
│   ├── graphql/                  # Generated queries/mutations/subscriptions
│   └── App.tsx
├── amplify.yml                   # Build settings
├── package.json
└── tsconfig.json
```

## Implementation Plan

1. Initialize Amplify Gen 2 project
2. Define GraphQL schema with auth rules
3. Add Lambda functions for business logic
4. Set up subscriptions for real-time
5. Adapt React frontend to use Amplify client
6. Configure Amplify hosting

## Commands

```bash
# Install
npm install

# Start local dev (sandbox)
npx ampx sandbox

# Deploy to cloud
npx ampx deploy
```
