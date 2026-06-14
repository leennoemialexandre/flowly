import Chat from "@/app/components/Chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Chat />
      </div>
    </main>
  );
}
