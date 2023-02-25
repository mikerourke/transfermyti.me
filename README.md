# transfermyti.me

[![Netlify Status](https://api.netlify.com/api/v1/badges/c999c9b1-0c44-4186-ba27-d6eba1f6b223/deploy-status)](https://app.netlify.com/sites/transfer-my-time/deploys)

> Formerly toggl-to-clockify-web

## Purpose

This tool is intended to replace the [**toggl-to-clockify-cli**](https://github.com/mikerourke/toggl-to-clockify-cli)
tool I created for transferring entries from Toggl to Clockify.

I changed the name from **toggl-to-clockify-web** to **transfermyti.me** after buying the domain name and completely 
refactoring the application to allow for two-way transfers.

## Usage

The tool is step-based, so you start by selecting the action you'd like to perform, then you enter your API keys, and so on. There are help details associated with each step on the [website](https://transfermyti.me).

You'll need the following to use the application:

- Toggl account with API key
- Clockify account with API key

## Development

### Prerequisites

- Node.js >= v18
- pnpm

### Technologies Used

This is by no means an exhaustive list, but it makes up the core of the front-end code:

- [Svelte](https://svelte.dev/)
- [Redux](https://redux.js.org/)
- [Redux Saga](http://redux-saga.js.org/)
- [Goober](https://goober.rocks/)
- [Ramda](https://ramdajs.com/)
- [date-fns](https://date-fns.org/)
- [TypeScript](https://www.typescriptlang.org/)

### Mock Server

To expedite development and get around API rate limiting, I created a development server that mocks the Toggl and Clockify APIs.
The codebase checks whether the API server should be used based on args passed into the `start` scripts.

If you'd like to use the mock server in development, follow the steps in the **Development With the Mock Server** section below.

If you want to pull and transfer data between the time tracking tools, follow the steps in the **Development Without the Mock Server**
section.

**Note: By default I have the mock server enabled, so if you only start the application and get network request failures, it's because you forgot to disable it.**

#### Development With the Mock Server

1. Install dependencies with `pnpm install`
2. Run `pnpm start:server` (no data will be transferred from Toggl to Clockify)
3. Run `pnpm start:web --mode mocked` to start the web application
4. Navigate to `http://localhost:8080`

#### Development Without the Mock Server

1. Install dependencies with `pnpm install`
2. Run `pnpm start:web`
3. Navigate to `http://localhost:8080`
