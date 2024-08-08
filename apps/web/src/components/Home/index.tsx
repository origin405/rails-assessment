'use client';

import { trpc } from '@/utils/trpc';

export default function Home() {
  const helloQuery = trpc.hello.useQuery('John');

  if (helloQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (helloQuery.error) {
    return <div>Error: {helloQuery.error.message}</div>;
  }

  return (
    <div className="p-4 bg-black text-white w-full h-full">
      <div>{helloQuery.data}</div>
    </div>
  );
}
