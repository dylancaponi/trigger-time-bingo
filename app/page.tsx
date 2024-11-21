"use client";
import { BingoBoard } from '@/components/bingo-board';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <BingoBoard />
    </main>
  );
}