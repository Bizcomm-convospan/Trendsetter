# Application Architecture

This document outlines the architecture of the Trendsetter Pro application, which follows a modern, decoupled, two-tier architecture to enhance scalability, reliability, and security. The previous three-tier architecture involving a standalone crawler service has been simplified for better performance and easier maintenance.

## The Two-Tier Architecture

The application now consists of two primary components that work together asynchronously.

### 1. Frontend & API Gateway (The Next.js Application)

-   **Role:** The primary user interface and the secure entry point for long-running backend tasks.
-   **Technology:** Next.js, React, Tailwind CSS, ShadCN UI.
-   **Key Features:**
    -   **UI:** A comprehensive dashboard with specialized "AI Agent" modules for various tasks like content generation, trend discovery, and competitor analysis.
    -   **`/api/prospect` (Job Submission Gateway):** Instead of calling the backend `prospect` function directly, the frontend sends requests to this local API route. This route acts as a **secure proxy**. It validates the request, logs it, and then forwards it to the deployed `prospect` Firebase Function. This prevents the function's URL from being exposed on the client side.
    -   **`/api/job-status` (Status Polling API):** A secure, API-key-protected endpoint that allows external clients (or a future version of the frontend) to poll for the status of a specific job by its ID.
-   **Benefits:**
    -   **Security:** The actual backend function URLs and other sensitive details are never exposed to the client's browser.
    -   **Centralization:** The API Gateway is the perfect place to add future cross-cutting concerns like user authentication checks, rate limiting, or advanced logging without modifying the frontend client or the backend function.
    -   **Observability:** The gateway implements structured, JSON-based logging with unique request IDs to trace operations from the user's initial click.

### 2. Asynchronous Backend (Firebase Functions & Firestore)

-   **Role:** An event-driven system for handling heavy, long-running background tasks like AI analysis and web crawling.
-   **Technology:** Firebase Functions (Node.js), Firestore, Genkit AI, Playwright.
-   **Key Features:**
    -   **Decoupled Functions:** The system uses two distinct, single-responsibility functions for prospecting:
        1.  **`prospect` (The Job Creator):** A lightweight HTTP-triggered function that receives a request from the API Gateway. Its only job is to create a "job" document in Firestore and **immediately** return a `jobId`. It does not wait for the long-running task to complete.
        2.  **`onProspectingJobCreated` (The Background Worker):** A Firestore-triggered function that activates whenever a new job document is created. This "worker" is responsible for executing the entire long-running prospecting flow in the background (calling the crawler tool, running the Genkit AI flow, etc.).
    -   **Integrated Crawler Tool:** The web crawling logic, which uses Playwright, is now a **Genkit Tool** that runs directly within the Firebase Functions environment. This eliminates the need for a separate, standalone crawler service, reducing deployment complexity and removing a network hop. The browser instance is intelligently managed and reused across function invocations for optimal performance.
    -   **Firestore as a Job Queue:** The `prospecting_jobs` collection acts as a simple but effective job queue. The worker function updates the job's status (`queued`, `processing`, `complete`, `failed`) directly in its Firestore document. The frontend listens to these changes in real-time to display live progress updates.
-   **Benefits:**
    -   **Responsiveness:** The user gets an immediate response with a `jobId`, dramatically improving the user experience.
    -   **Resilience:** If the heavy-lifting worker function fails, it doesn't affect the user-facing API. The job can be retried or marked as failed without the user's session timing out.
    -   **Scalability:** The system can handle a large influx of requests by queuing them in Firestore for the background workers to process at a controlled rate.
    -   **Simplified Operations:** With one fewer service to deploy, manage, and monitor, the overall operational burden is significantly reduced.

## End-to-End Workflow: An Example

This is how the components work together to fulfill a user request:

1.  **User (Browser):** Clicks "Extract Prospects" for a URL on the `/dashboard/prospecting` page.
2.  **Next.js App (Server Action):** The component calls a Server Action (`handleProspectingJob`).
3.  **API Gateway (`/api/prospect`):** The Server Action sends a `POST` request to its own API Gateway. The gateway logs the request and securely calls the deployed `prospect` Firebase Function.
4.  **`prospect` Function:** Creates a job document in Firestore with a status of `queued` and immediately returns the `jobId` to the API Gateway, which forwards it back to the browser.
5.  **User (Browser):** The `ProspectingClient` component receives the `jobId` and begins listening to the corresponding Firestore document for real-time status updates, powering a live progress log.
6.  **`onProspectingJobCreated` Function:** The new document in Firestore automatically triggers this background worker.
7.  **Background Worker:**
    *   Updates the job status in Firestore to `processing`.
    *   Calls the `autonomousProspecting` Genkit flow.
    *   The Genkit flow invokes its integrated `crawlUrlTool`, which uses Playwright within the same function environment to crawl the URL and return clean text.
    *   The AI flow analyzes the text to extract prospect data.
    *   The worker saves the results to the `prospects` collection and updates the job document's status to `complete`.
8.  **User (Browser):** The listener sees the `complete` status in the jobs table, and the new data appears on the `/dashboard/prospects` page.
