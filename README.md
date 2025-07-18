# Trendsetter Pro: AI-Powered Content & Sales Automation

This is a comprehensive application built with Next.js, Firebase, and Genkit, providing a suite of specialized AI agents for content strategy, SEO, and sales prospecting.

## Architecture Overview

The application uses a decoupled, three-tier architecture for scalability and resilience. For a detailed explanation of how the frontend, backend functions, and crawler service work together, please see the [ARCHITECTURE.md](ARCHITECTURE.md) file.

## Getting Started: Local Development

### 1. Prerequisite: Install Node.js & Firebase CLI

- Ensure you have Node.js (v20 or higher) installed.
- Install the Firebase CLI globally: `npm install -g firebase-tools`

### 2. Environment Setup (Mandatory)

This application requires several environment variables to connect to Firebase, the AI models, and the internal services. The app will not run correctly without them.

1.  **Copy the example environment file:**
    ```bash
    cp .env.example .env
    ```
2.  **Fill in the values in `.env`:**
    -   You will need to create a Firebase project and a service account. Detailed instructions are in the comments of the `.env.example` file.
    -   Initially, you can leave `PROSPECTING_FUNCTION_URL` and `CRAWLER_SERVICE_URL` as their `http://localhost...` values for local testing.

### 3. Install Dependencies

This project uses a monorepo-style setup. You must install dependencies from the root directory.

```bash
npm install
```
This command will automatically install dependencies for the Next.js app, the `functions` directory, and the `crawler` directory.

### 4. Run the Full Local Stack

For the complete application to work locally, you need to run three separate services in three different terminals.

-   **Terminal 1: Run the Next.js Frontend App**
    ```bash
    npm run dev
    ```
    This starts the main application, accessible at `http://localhost:3000`.

-   **Terminal 2: Run the Backend Functions Emulator**
    ```bash
    # Make sure you are in the project's root directory
    firebase emulators:start --only functions,firestore
    ```
    This starts a local emulation of Firebase Functions and Firestore. The `prospect` function will be available at a local URL shown in the terminal output (this is your `PROSPECTING_FUNCTION_URL` for local dev).

-   **Terminal 3: Run the Crawler Service**
    ```bash
    # Navigate to the crawler directory
    cd crawler
    npm start
    ```
    This starts the web crawler service, which will be available at `http://localhost:8080` (this is your `CRAWLER_SERVICE_URL` for local dev).

## Deployment

Deploying this application involves three main steps: deploying the backend services (Crawler and Firebase Functions) and then deploying the Next.js frontend to Firebase Hosting.

### Step 1: Deploy the Crawler Service

The crawler is a standard Node.js application that can be deployed to any container-based hosting service like Google Cloud Run or AWS Fargate.

**Example using Google Cloud Run:**
1.  Ensure you have the Google Cloud SDK installed and configured (`gcloud init`).
2.  From the `crawler` directory, run the deploy command:
    ```bash
    # Replace [YOUR_PROJECT_ID] and [YOUR_REGION]
    gcloud run deploy crawler-service --source . --platform managed --region [YOUR_REGION] --project [YOUR_PROJECT_ID] --allow-unauthenticated
    ```
3.  After deployment, Cloud Run will provide a public URL. **Copy this URL.**

### Step 2: Deploy the Firebase Functions

1.  **Update `.env`:** In your `.env` file, update `CRAWLER_SERVICE_URL` with the public URL you got from deploying the crawler service in Step 1.
2.  Deploy the functions:
    ```bash
    # From the project root directory
    firebase deploy --only functions
    ```
3.  The deploy command will output the public URL for your `prospect` function. **Copy this URL.**

### Step 3: Deploy the Next.js App

1.  **Update `.env`:** In your `.env` file, update `PROSPECTING_FUNCTION_URL` with the public URL of your `prospect` function from Step 2.
2.  **Build the Next.js App:**
    ```bash
    npm run build
    ```
3.  **Deploy to Firebase Hosting:**
    ```bash
    firebase deploy --only hosting
    ```

After these steps, your entire application will be live.
