# A sudoku puzzle server with a Vue frontent

## Why write another sudoku app?
Honestly, this was an excuse to display/use the results of my [Cdoku](https://github.com/seth-aker/cdoku) puzzle generator application. That application was designed to be *blazingly fast*, capable of generating hundreds of unique sudoku puzzles of various difficulties. This application is designed to compliment it.

## The Stack
- **Cdoku**: The root of the application, written in plain C, generates the puzzles and passes them to the database.
- **SQLite**: Fast and simple database
- **Node/Express.js**: Tried and true javascript server library. Implements Controller-Service-Repository architecture.
- **Vue/Vite**: Simple SPA that displays the puzzles. Vue is lowkey better than React IMO which is why it is my go-to frontend framework.

## Infrastructure
Reusing a retired PC, this app is hosted on Ubuntu Server 24.04.4 LTS. Managed by a Nginx reverse-proxy pointing to two docker containers deployed via docker-compose. While this setup likely would quickly be overwhelmed by heavy loads, it is an economical and effective for this use case. 

## Comming Next
- Mobile Support
- Impoved CI/CD deployments: Turn the frontend and backend into a true monorepo with pnpm workspaces.
- User authentication: Allow users to login, see their puzzle solving statistics, and be able to retrieve puzzle progress from different devices.
- Hard/Impossible difficulties (this technically comes from Cdoku, but it is part of the project)
