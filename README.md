# PetHaven — Backend API

## Project Name
**PetHaven Backend**

## Purpose
The PetHaven Backend provides RESTful APIs for the Pet Adoption Platform. It handles pet listings, adoption-related operations, database communication, and authenticated requests.

## Live URL
https://pet-adoption-platform-server-nu.vercel.app

## Features
- Create and retrieve pet listings.
- Fetch pet details using API endpoints.
- Manage pet listings associated with users.
- Support adoption request operations.
- Connect to MongoDB for persistent data storage.
- Handle cross-origin requests from the frontend.
- Verify authentication tokens for protected API routes.

## NPM Packages Used
- `express` — Build the REST API server.
- `mongodb` — Connect to and interact with MongoDB.
- `cors` — Configure cross-origin requests.
- `dotenv` — Load environment variables.
- `jose-cjs` — JWT verification utilities, if used by the current backend code.
- `nodemon` — Restart the development server automatically.

## Installation

```bash
git clone <your-backend-repository-url>
cd PetHaven-Server
npm install
```

## Environment Variables

Create a `.env` file in the backend root directory and configure the required environment variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
Client_URL=http://localhost:3000
```

Use the appropriate production frontend URL for `Client_URL` in the deployed backend environment. Never commit real secrets to GitHub.

## Run Locally

```bash
npm run dev
```

The backend will run locally on `http://localhost:5000` if port 5000 is configured.

## Deployment 
The backend is deployed on Vercel.

Live API: https://pet-adoption-platform-server-nu.vercel.app

> Note: Verify the available API endpoints and installed dependencies against the current backend code and `package.json` before publishing this README.
