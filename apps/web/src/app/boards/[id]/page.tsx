  // src/app/boards/[id]/page.tsx
  export default function Board({ params }: { params: { id: string } }) {
    return <h1>Board {params.id}</h1>;
  }