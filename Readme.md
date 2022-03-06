###Welcome to Synthetics monorepo

Repo contains4 main projects/folders.

1. api - Fastify backend server api
2. web - React front end web application
3. db - common db access layer and corresponding types
4. aws - serverless backend stack

###To get started:

* Setup Postgres database and provide the DATABASE_URL in the .env file in the root folder. There is an example file named .env.example for reference
* Run `pnpm install` to setup nodejs 

* Then, the following command brings up the server, webapp and db for dev:
`pnpm run dev`

