# Revised Application Architecture

This document outlines the revised architecture of the Trendsetter Pro application, reflecting a series of improvements to enhance scalability, reliability, and security. The system follows a modern, decoupled, three-tier architecture.

## The Three-Tier Architecture

The application consists of three primary components that work together asynchronously.

### 1. Frontend & API Gateway (The Next.js Application)

-   **Role:** The primary user interface and the secure entry point for backend requests.
-   **Key Feature (API Gateway):** Instead of calling Firebase Functions directly, the frontend now sends requests to a local API route (`/api/prospect`). This route acts as a **secure proxy** or **API Gateway**. It validates the request on the server-side and then forwards it to the appropriate backend service.
-   **Benefits:**
    -   **Security:** The actual backend function URL is never exposed to the client's browser.
    -   **Centralization:** This proxy is the perfect place to add future cross-cutting concerns like user authentication checks, rate limiting, or advanced logging without modifying the frontend client or the backend function.
    -   **Observability:** The gateway implements structured, JSON-based logging with unique request IDs to trace operations end-to-end.

### 2. Asynchronous Backend (Firebase Functions & Firestore)

-   **Role:** An event-driven system for handling heavy, long-running background tasks.
-   **Key Feature (Decoupled Functions):** The original monolithic function has been split into two distinct, single-responsibility functions:
    1.  **`prospect` (The Job Creator):** A lightweight HTTP-triggered function that receives a request from the API Gateway, creates a "job" document in Firestore, and **immediately** returns a `jobId`. It does not wait for the long-running task to complete.
    2.  **`onProspectingJobCreated` (The Background Worker):** A Firestore-triggered function that activates whenever a new job document is created. This "worker" is responsible for executing the entire long-running prospecting flow in the background.
-   **Key Feature (Firestore as a Job Queue):** The `prospecting_jobs` collection acts as a simple but effective job queue. The worker function updates the job's status (`queued`, `processing`, `complete`, `failed`) directly in its Firestore document, providing real-time progress updates that the frontend can monitor.
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

1.  **User (Browser):** Clicks "Extract Prospects" for a URL. The request is sent to the Next.js API Gateway (`/api/prospect`).
2.  **API Gateway:** Logs the request, validates it, and securely calls the `prospect` Firebase Function.
3.  **`prospect` Function:** Creates a job document in Firestore and immediately returns the `jobId` to the browser.
4.  **User (Browser):** Receives the `jobId` and starts listening to the corresponding Firestore document for real-time status updates, powering a live progress bar.
5.  **`onProspectingJobCreated` Function:** The new document in Firestore automatically triggers this background worker.
6.  **Background Worker:**
    *   Checks if the rate limit has been exceeded.
    *   Updates the job status in Firestore to `processing`.
    *   Calls the `autonomousProspecting` AI flow, which uses its `crawlUrl` tool to invoke the **Optimized Crawler Service**.
    *   Once the AI analysis is complete, the worker saves the results and updates the job document's status to `complete`.
7.  **User (Browser):** The listener sees the `complete` status and displays the final report.
