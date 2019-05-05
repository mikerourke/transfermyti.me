# Toggl to Clockify Web

## Purpose

This tool is intended to replace the [`toggl-to-clockify`](https://github.com/mikerourke/toggl-to-clockify)
CLI tool I created for transferring entries from Toggl to Clockify.

## Usage

<s>The tool is hosted on surge.sh. You can access it via http://toggl-to-clockify.surge.sh</s>.

## Prerequisites

- Toggl account with API key
- Clockify account with API key

## Technologies Used

- React
- Redux
- Bulma/Bloomer
- Emotion
- Lodash
- date-fns
- Parcel
- TypeScript
- ...and several others

## Development

- Install dependencies with `yarn install`
- To start the app with the mock server, set the `USE_LOCAL_API` to
  `true` in the `.env` file and run `yarn start` (no data will be
  transferred from Toggl to Clockify
- To start the app with the ability to actually transfer data, set the
- `USE_LOCAL_API` to `false` in the `.env` file , run `yarn start:web`
  and navigate to `http://localhost:3000`
