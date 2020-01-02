# transfermyti.me

*Formerly toggl-to-clockify-web*

## Purpose

This tool is intended to replace the [`toggl-to-clockify`](https://github.com/mikerourke/toggl-to-clockify)
CLI tool I created for transferring entries from Toggl to Clockify.

I changed the name to **transfermyti.me** after buying the domain name and completely refactoring
the application to allow you to transfer from Toggl to Clockify or vice versa.

## Usage

Follow the steps on the [website](https://transfermyti.me), it's pretty intuitive (hopefully).

## Prerequisites

- Toggl account with API key
- Clockify account with API key

## Technologies Used

- React
- Redux
- Redux Saga
- Emotion
- Ramda
- date-fns
- Parcel
- TypeScript

## Development

- Install dependencies with `yarn install`
- To start the app with the mock server, set the `USE_LOCAL_API` to `true` in the `.env` file and 
  run `yarn start` (no data will be transferred from Toggl to Clockify
- To start the app with the ability to actually transfer data, set the `USE_LOCAL_API` to `false`
  in the `.env` file , run `yarn start:web` and navigate to `http://localhost:3000`

## TODO

- [ ] Finish progress page
- [ ] Verify Clockify -> Toggl transfer works
- [ ] Add tests (Important!)
