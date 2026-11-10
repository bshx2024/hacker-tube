import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/core/auth';

const handler = toNextJsHandler(auth.handler);

export const { GET, POST } = handler;
