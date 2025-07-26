import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This will cause all frontend AI flows to fail for testing purposes.
throw new Error('Simulated AI Service Failure for Frontend Testing');

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  model: 'googleai/gemini-2.0-flash',
});
