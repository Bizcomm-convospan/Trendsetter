import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // The redirect function throws an error to stop rendering,
  // so technically nothing below it will be executed.
  // However, to satisfy linters or type checkers that might not
  // understand this behavior, returning null or an empty fragment is common.
  return null;
}
