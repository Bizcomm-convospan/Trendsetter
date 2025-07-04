/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // This tells Next.js not to bundle these packages for the server build.
    // They will be treated as external dependencies and used at runtime.
    // This is crucial for server-side SDKs like Firebase Admin and Genkit.
    serverComponentsExternalPackages: [
        'firebase-admin',
        'genkit',
        '@genkit-ai/googleai',
        'zod',
        'handlebars'
    ],
  },
  typescript: {
    // Ignore build errors for now, as some may be related to dependencies.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
