
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This will cause all backend AI flows to fail for testing purposes.
throw new Error('Simulated AI Service Failure for Backend Testing');

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
