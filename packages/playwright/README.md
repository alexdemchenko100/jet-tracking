# Installation

You may have to install browser packages for Chromium etc.

`pnpmx playwright install`


# Create new test

You could use one of many chrome extensions to do this

or 

Use the following command

`pnpx playwright codegen <<URL>>`

eg: `pnpx playwright codegen http://locahost:3000`

Then, save the script in tests/ folder.  

Run all tests by:

`pnpm test`

or `pnpm playwright test`

And, to see the browser in action, use --headed arg

`pnpm playwright test --headed`
