# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

### 1. Environment Setup

**This step is mandatory.** Before running the application, you need to set up your environment variables. These are essential for connecting to Firebase and other services. The application will not start without them.

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Open the newly created `.env` file and fill in the values for your specific Firebase project and services. You can find detailed instructions on where to get these values inside the `.env.example` file.

### 2. Install Dependencies

This project has a monorepo-style setup with separate packages for the main Next.js app, the Firebase Functions, and the crawler service. You need to install dependencies for each.

```bash
# From the root directory
npm install

# For Firebase Functions
cd functions
npm install
cd ..

# For the Crawler service
cd crawler
npm install
cd ..
```

### 3. Run the Development Server

To run the Next.js development server, use the following command from the root directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`.
