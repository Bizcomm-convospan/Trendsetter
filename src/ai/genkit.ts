import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openai} from '@genkit-ai/openai';

// Intentionally throwing an error to test failure modes for all AI agents.
throw new Error('TEST_FAILURE: AI Service initialization failed.');

export const ai = genkit({
  plugins: [
    googleAI(),
    // The OpenAI plugin is initialized with the OPENAI_API_KEY environment variable.
    // Ensure this key is set in your .env file for it to work.
    openai(),
  ],
  logLevel: 'debug',
  model: 'googleai/gemini-2.0-flash',
});
