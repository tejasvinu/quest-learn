import AdventureGame from './AdventureGame';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        <AdventureGame />
      </main>
    </div>
  );
}
