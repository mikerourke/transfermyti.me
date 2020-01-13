# transfermyti.me

> Formerly toggl-to-clockify-web

## Purpose

This tool is intended to replace the [**toggl-to-clockify-cli**](https://github.com/mikerourke/toggl-to-clockify-cli)
tool I created for transferring entries from Toggl to Clockify.

I changed the name from **toggl-to-clockify-web** to **transfermyti.me** after buying the domain name and completely 
refactoring the application to allow for two-way transfers.

## Usage

The tool is step-based, so you start by selecting the action you'd like to perform, then you enter your API keys, and so on. There are help details associated with each step on the [website](https://transfermyti.me).

## Prerequisites

- Toggl account with API key
- Clockify account with API key

## Technologies Used

This is by no means an exhaustive list, but it makes up the core of the front-end code:

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Redux Saga](http://redux-saga.js.org/)
- [Emotion](https://emotion.sh)
- [Ramda](https://ramdajs.com/)
- [date-fns](https://date-fns.org/)
- [Parcel](https://parceljs.org/)
- [TypeScript](https://www.typescriptlang.org/)

## Development

To expedite development and get around API rate limiting, I created a development server that mocks the Toggl and Clockify APIs.
The codebase checks whether the API server should be used based on an environment variable set in the `.env` file.

If you'd like to use the mock server in development, follow the steps in the **Development With the Mock Server** section below.

If you want to pull and transfer data between the time tracking tools, follow the steps in the **Development Without the Mock Server**
section.

### Development With the Mock Server

1. Install dependencies with `yarn install`
2. Rename `.env.example` to `.env`
3. Set `USE_LOCAL_API` to `true` in the `.env` file
4. Set `LOCAL_API_<TOOL>_EMPTY` to `true` in the `.env` file if you want either of the mock APIs to return empty records (useful for testing transfer)
5. Run `yarn start` (no data will be transferred from Toggl to Clockify)
6. Navigate to `http://localhost:3000`

### Development Without the Mock Server

1. Install dependencies with `yarn install`
2. Rename `.env.example` to `.env`
3. Set `USE_LOCAL_API` to `false`
4. Run `yarn start:web`
5. Navigate to `http://localhost:3000`

## TODO

- [ ] Verify Clockify -> Toggl transfer works
- [ ] Add tests
