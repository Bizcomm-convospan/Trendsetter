# Revised Application Architecture

This document outlines the revised architecture of the Trendsetter Pro application, reflecting a series of improvements to enhance scalability, reliability, and security. The system follows a modern, decoupled, three-tier architecture.

## The Three-Tier Architecture

The application consists of three primary components that work together asynchronously.

### 1. Frontend & API Gateway (The Next.js Application)

-   **Role:** The primary user interface and the secure entry point for backend requests.
-   **Key Features:**
    -   **`/api/prospect` (Job Submission):** Instead of calling Firebase Functions directly, the frontend sends requests to this local API route. This route acts as a **secure proxy** or **API Gateway**. It validates the request (including an optional `webhookUrl`), logs it, and then forwards it to the backend `prospect` function.
    -   **`/api/job-status` (Status Polling):** A secure, API-key-protected endpoint that allows external clients or the frontend to poll for the status of a specific job by its ID.
-   **Benefits:**
    -   **Security:** The actual backend function URL and Firestore details are never exposed to the client's browser. API keys protect status endpoints.
    -   **Centralization:** The proxy is the perfect place to add future cross-cutting concerns like user authentication checks, rate limiting, or advanced logging without modifying the frontend client or the backend function.
    -   **Observability:** The gateway implements structured, JSON-based logging with unique request IDs to trace operations end-to-end.

### 2. Asynchronous Backend (Firebase Functions & Firestore)

-   **Role:** An event-driven system for handling heavy, long-running background tasks.
-   **Key Feature (Decoupled Functions):** The original monolithic function has been split into two distinct, single-responsibility functions:
    1.  **`prospect` (The Job Creator):** A lightweight HTTP-triggered function that receives a request from the API Gateway, creates a "job" document in Firestore (including the `webhookUrl` if provided), and **immediately** returns a `jobId`. It does not wait for the long-running task to complete.
    2.  **`onProspectingJobCreated` (The Background Worker):** A Firestore-triggered function that activates whenever a new job document is created. This "worker" is responsible for executing the entire long-running prospecting flow in the background.
-   **Key Feature (Firestore as a Job Queue):** The `prospecting_jobs` collection acts as a simple but effective job queue. The worker function updates the job's status (`queued`, `processing`, `complete`, `failed`) directly in its Firestore document, providing real-time progress updates that the frontend can monitor.
-   **Key Feature (Webhook Notifications):** Upon successful job completion, the background worker sends a `POST` request to the stored `webhookUrl` with the final job results. This allows for seamless integration with external systems like WordPress plugins. The payload sent to the webhook will have the following structure:
    ```json
    {
      "jobId": "string",
      "status": "complete",
      "result": {
        "summary": "string",
        "prospects": [
          {
            "companyName": "string",
            "people": [{ "name": "string", "role": "string" }],
            "emails": ["string"],
            "links": ["string"],
            "industryKeywords": ["string"]
          }
        ]
      }
    }
    ```
-   **Key Feature (Rate Limiting):** The background worker includes a rate-limiting mechanism to prevent cost spikes from too many concurrent AI calls.
-   **Benefits:**
    -   **Responsiveness:** The user gets an immediate response with a `jobId`, improving the user experience.
    -   **Resilience:** If the heavy-lifting worker function fails, it doesn't affect the user-facing API. The job can be retried or marked as failed without the user's session timing out.
    -   **Scalability:** The system can handle a large influx of requests by queuing them in Firestore for the background workers to process at a controlled rate.

### 3. Optimized Crawler Service

-   **Role:** A dedicated service for crawling websites, now optimized for performance and stability.
-   **Key Feature (Persistent Browser):** The service no longer launches a costly new browser for every request. Instead, it initializes a **single, persistent browser instance** on startup. New requests simply open a new page in the existing browser, which is dramatically faster and less resource-intensive.
-   **Benefits:**
    -   **Performance:** Crawl times are significantly reduced.
    -   **Stability:** Enhanced error handling and timeouts mean that one problematic website won't bring down the entire service.
    -   **Cost-Effectiveness:** Lower resource consumption translates to lower hosting costs.

## Revised Workflow: An Example

This is how the components work together to fulfill a user request:

1.  **User (Browser):** Clicks "Extract Prospects" for a URL. The request is sent to the Next.js API Gateway (`/api/prospect`), optionally including a `webhookUrl`.
2.  **API Gateway:** Logs the request, validates it, and securely calls the `prospect` Firebase Function.
3.  **`prospect` Function:** Creates a job document in Firestore (storing the `webhookUrl` if present) and immediately returns the `jobId` to the browser.
4.  **User (Browser):** Receives the `jobId` and starts listening to the corresponding Firestore document for real-time status updates, powering a live progress bar. (Alternatively, a client could periodically call `/api/job-status?jobId=<jobId>` with an API key to get updates).
5.  **`onProspectingJobCreated` Function:** The new document in Firestore automatically triggers this background worker.
6.  **Background Worker:**
    *   Checks if the rate limit has been exceeded.
    *   Updates the job status in Firestore to `processing`.
    *   Calls the `autonomousProspecting` AI flow, which uses its `crawlUrl` tool to invoke the **Optimized Crawler Service**.
    *   Once the AI analysis is complete, the worker saves the results and updates the job document's status to `complete`.
    *   If a `webhookUrl` exists, it sends a `POST` request to that URL with the job results.
7.  **User (Browser):** The listener sees the `complete` status and displays the final report.
8.  **External Service (e.g., WordPress):** Receives the webhook notification and processes the job result.

## Testing, Monitoring, and Tooling

A robust set of tools is recommended to ensure the application remains stable, performant, and easy to debug.

-   **API Route Testing (Postman / Insomnia):** For manually testing the API endpoints like `/api/prospect` and `/api/job-status`. This is useful for verifying request/response formats and authentication mechanisms.
-   **Local Development (Firebase Emulator Suite):** To run a local instance of Firestore and Firebase Functions. This allows for rapid, offline development and testing of the backend logic without incurring costs or affecting live data.
-   **Backend Observability (Firebase Logs):** For monitoring and tracing the execution of background jobs. Structured logs within the Firebase Functions provide detailed insights into the job lifecycle, helping to debug failures or performance issues. For more advanced use cases, integrating with services like Sentry or Datadog is recommended.
-   **Crawler Performance (Lighthouse):** To periodically audit the performance of the crawler service. While not a direct part of the application, ensuring the crawler is fast and efficient is crucial for the overall system's responsiveness.
-   **Automated API Testing (Jest + Supertest):** For creating automated tests for the Next.js API routes. This ensures that changes to the API Gateway do not introduce regressions and that the endpoints behave as expected under various conditions.
