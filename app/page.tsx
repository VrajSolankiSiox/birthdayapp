"use client";

import { useEffect, useState } from "react";
import { BirthdayForm } from "./components/BirthdayForm";
import { BirthdayList } from "./components/BirthdayList";

export default function Home() {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBirthdays = async () => {
    try {
      const res = await fetch("/api/birthdays");
      const json = await res.json();
      if (json.success) {
        setBirthdays(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans selection:bg-[#FF3737] selection:text-white pb-24">
      {/* Navbar area */}
      <nav className="w-full bg-white border-b border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] py-5 px-6 mb-12">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          {/* <div className="w-10 h-10 bg-[#FF3737] rounded-xl shadow-lg shadow-[#FF3737]/20 flex items-center justify-center text-white font-bold text-xl">
            B
          </div> */}

          <svg xmlns='http://www.w3.org/2000/svg' height={40} width={40} viewBox='0 0 200 200'>
            <rect x='40' y='90' width='120' height='60' rx='12' fill='#FF3737' />
            <rect x='55' y='60' width='90' height='40' rx='10' fill='#ff6b6b' />
            <path d='M55 60 C60 80, 70 80, 75 60 C80 80, 90 80, 95 60 C100 80, 110 80, 115 60 C120 80, 130 80, 135 60' stroke='#FF3737' stroke-width='6' fill='none' />
            <rect x='95' y='30' width='10' height='30' rx='3' fill='#FF3737' />
            <path d='M100 20 C95 25, 95 35, 100 40 C105 35, 105 25, 100 20Z' fill='#fbbf24' />
            <circle cx='70' cy='120' r='4' fill='white' />
            <circle cx='100' cy='130' r='4' fill='white' />
            <circle cx='130' cy='120' r='4' fill='white' />
          </svg>

          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Birthday App
          </h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        <header className="mb-12 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-gray-900 leading-tight">
            Manage your team's <span className="text-[#FF3737]">special days</span> with ease.
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            Keep track of upcoming birthdays, age calculations, and totally automate your greeting emails.
          </p>
        </header>

        <div className="grid md:grid-cols-[1.1fr_1.3fr] gap-8 xl:gap-12 items-start">
          <div className="sticky top-6">
            <BirthdayForm onAdd={fetchBirthdays} />
          </div>
          <div className="h-full">
            {loading ? (
              <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center h-[500px] shadow-[0_20px_40px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-[#FF3737] rounded-full animate-spin"></div>
              </div>
            ) : (
              <BirthdayList birthdays={birthdays} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
