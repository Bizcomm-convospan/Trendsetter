import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Intentionally throwing an error to test failure modes for backend AI agents.
throw new Error('TEST_FAILURE: Backend AI Service initialization failed.');

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
