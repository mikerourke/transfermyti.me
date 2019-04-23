# Mock Server

## Overview

This server is used for testing and development. Since the app may end
up making > 100 API calls, it ensures we can go bananas without having
to worry about exceeding the API limits.

## Technologies Used

- express
- morgan
- body-parser
- nodemon

## Getting Started

1. Run `yarn` to install the required dependencies in the repo directory
2. Run `yarn server` to start

## Code Details

- The `/db` directory (2) JSON files: 1 with Toggl mock records and
  another with Clockify mock records
- The contents of the `/db` files are read from the corresponding tool
  file in `/routes`
