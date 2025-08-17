import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-4xl font-bold">Welcome to ManageMate</h1>
      <Link href="/dashboard" className="text-lg text-blue-500 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  );
}
