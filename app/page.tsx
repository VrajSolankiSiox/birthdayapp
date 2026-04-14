"use client";

import { useEffect, useState } from "react";
import { BirthdayForm } from "./components/BirthdayForm";
import { BirthdayList } from "./components/BirthdayList";
import { AnniversaryForm } from "./components/AnniversaryForm";
import { AnniversaryList } from "./components/AnniversaryList";
import CalenderSVG from "./CalenderSVG";
export default function Home() {
  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("birthdays");

  const fetchBirthdays = async () => {
    try {
      const res = await fetch("/api/birthdays");
      const json = await res.json();
      if (json.success) {
        setBirthdays(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnniversaries = async () => {
    try {
      const res = await fetch("/api/anniversaries");
      const json = await res.json();
      if (json.success) {
        setAnniversaries(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchBirthdays(), fetchAnniversaries()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans selection:bg-[#FF3737] selection:text-white pb-24">
      {/* Navbar area */}
      <nav className="w-full bg-white border-b border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] py-5 px-6 mb-12">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          {/* <div className="w-10 h-10 bg-[#FF3737] rounded-xl shadow-lg shadow-[#FF3737]/20 flex items-center justify-center text-white font-bold text-xl">
            B
          </div> */}

          <CalenderSVG />

          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Birthday & Anniversary App
          </h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        <header className="mb-8 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-gray-900 leading-tight">
            Manage your team&apos;s{" "}
            <span className="text-[#FF3737]">special </span>
            <span className="text-[#4F46E5]">days</span> with ease.
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            Keep track of upcoming birthdays, work anniversaries, and totally
            automate your greeting emails.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("birthdays")}
            className={`px-6 flex items-center py-3 cursor-pointer font-semibold text-lg transition-all duration-200 border-b-2 ${
              activeTab === "birthdays"
                ? "border-[#FF3737] text-[#FF3737]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height={40}
                width={40}
                viewBox="0 0 200 200"
              >
                <rect
                  x="40"
                  y="90"
                  width="120"
                  height="60"
                  rx="12"
                  fill="#FF3737"
                />
                <rect
                  x="55"
                  y="60"
                  width="90"
                  height="40"
                  rx="10"
                  fill="#ff6b6b"
                />
                <path
                  d="M55 60 C60 80, 70 80, 75 60 C80 80, 90 80, 95 60 C100 80, 110 80, 115 60 C120 80, 130 80, 135 60"
                  stroke="#FF3737"
                  strokeWidth="6"
                  fill="none"
                />
                <rect
                  x="95"
                  y="30"
                  width="10"
                  height="30"
                  rx="3"
                  fill="#FF3737"
                />
                <path
                  d="M100 20 C95 25, 95 35, 100 40 C105 35, 105 25, 100 20Z"
                  fill="#fbbf24"
                />
                <circle cx="70" cy="120" r="4" fill="white" />
                <circle cx="100" cy="130" r="4" fill="white" />
                <circle cx="130" cy="120" r="4" fill="white" />
              </svg>
            </span>{" "}
            Birthdays
          </button>
          <button
            onClick={() => setActiveTab("anniversaries")}
            className={`px-6 py-3 flex items-center cursor-pointer font-semibold text-lg transition-all duration-200 border-b-2 ${
              activeTab === "anniversaries"
                ? "border-[#4f46e5] text-[#4f46e5]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 600 512"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <g id="SVGRepo_iconCarrier">
                  <title>work-case-filled</title>
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth={1}
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="work-case"
                      fill="#4F46E5"
                      transform="translate(42.666667, 64.000000)"
                    >
                      <path
                        d="M1.20792265e-13,197.76 C54.5835501,218.995667 112.186031,231.452204 170.666667,234.666667 L170.666667,277.333333 L256,277.333333 L256,234.666667 C314.339546,231.013 371.833936,218.86731 426.666667,198.613333 L426.666667,362.666667 L1.20792265e-13,362.666667 L1.20792265e-13,197.76 Z M277.333333,-1.42108547e-14 L298.666667,21.3333333 L298.666667,64 L426.666667,64 L426.666667,175.146667 C361.254942,199.569074 292.110481,212.488551 222.293333,213.333333 L222.293333,213.333333 L206.933333,213.333333 C136.179047,212.568604 66.119345,199.278929 7.10542736e-15,174.08 L7.10542736e-15,174.08 L7.10542736e-15,64 L128,64 L128,21.3333333 L149.333333,-1.42108547e-14 L277.333333,-1.42108547e-14 Z M256,42.6666667 L170.666667,42.6666667 L170.666667,64 L256,64 L256,42.6666667 Z"
                        id="Combined-Shape-Copy"
                      ></path>
                    </g>
                  </g>
                </g>
              </svg>
            </span>
            {"  "}
            Work Anniversaries
          </button>
        </div>

        {/* Birthdays Section */}
        {activeTab === "birthdays" && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 items-center flex  ">
                <span>
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height={40}
                    width={40}
                    viewBox="0 0 200 200"
                  >
                    <rect
                      x="40"
                      y="90"
                      width="120"
                      height="60"
                      rx="12"
                      fill="#FF3737"
                    />
                    <rect
                      x="55"
                      y="60"
                      width="90"
                      height="40"
                      rx="10"
                      fill="#ff6b6b"
                    />
                    <path
                      d="M55 60 C60 80, 70 80, 75 60 C80 80, 90 80, 95 60 C100 80, 110 80, 115 60 C120 80, 130 80, 135 60"
                      stroke="#FF3737"
                      strokeWidth="6"
                      fill="none"
                    />
                    <rect
                      x="95"
                      y="30"
                      width="10"
                      height="30"
                      rx="3"
                      fill="#FF3737"
                    />
                    <path
                      d="M100 20 C95 25, 95 35, 100 40 C105 35, 105 25, 100 20Z"
                      fill="#fbbf24"
                    />
                    <circle cx="70" cy="120" r="4" fill="white" />
                    <circle cx="100" cy="130" r="4" fill="white" />
                    <circle cx="130" cy="120" r="4" fill="white" />
                  </svg>
                </span>{" "}
                Birthdays
              </h3>
              {/* <span className="bg-[#FF3737]/10 text-[#FF3737] text-xs font-bold px-3 py-1 rounded-full">
                Personal
              </span> */}
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-[34rem] lg:max-w-[34rem] lg:flex-shrink-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:self-start">
                <BirthdayForm onAdd={fetchBirthdays} />
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center h-[500px] shadow-[0_20px_40px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-[#FF3737] rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <BirthdayList birthdays={birthdays} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Anniversaries Section */}
        {activeTab === "anniversaries" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <span>
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 512 512"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    fill="#000000"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <title>work-case-filled</title>
                      <g
                        id="Page-1"
                        stroke="none"
                        strokeWidth={1}
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g
                          id="work-case"
                          fill="#4F46E5"
                          transform="translate(42.666667, 64.000000)"
                        >
                          <path
                            d="M1.20792265e-13,197.76 C54.5835501,218.995667 112.186031,231.452204 170.666667,234.666667 L170.666667,277.333333 L256,277.333333 L256,234.666667 C314.339546,231.013 371.833936,218.86731 426.666667,198.613333 L426.666667,362.666667 L1.20792265e-13,362.666667 L1.20792265e-13,197.76 Z M277.333333,-1.42108547e-14 L298.666667,21.3333333 L298.666667,64 L426.666667,64 L426.666667,175.146667 C361.254942,199.569074 292.110481,212.488551 222.293333,213.333333 L222.293333,213.333333 L206.933333,213.333333 C136.179047,212.568604 66.119345,199.278929 7.10542736e-15,174.08 L7.10542736e-15,174.08 L7.10542736e-15,64 L128,64 L128,21.3333333 L149.333333,-1.42108547e-14 L277.333333,-1.42108547e-14 Z M256,42.6666667 L170.666667,42.6666667 L170.666667,64 L256,64 L256,42.6666667 Z"
                            id="Combined-Shape-Copy"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                </span>
                Work Anniversaries
              </h3>
              {/* <span className="bg-[#4f46e5]/10 text-[#4f46e5] text-xs font-bold px-3 py-1 rounded-full">
                Professional
              </span> */}
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-[34rem] lg:max-w-[34rem] lg:flex-shrink-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:self-start">
                <AnniversaryForm onAdd={fetchAnniversaries} />
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center h-[500px] shadow-[0_20px_40px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-[#4f46e5] rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <AnniversaryList anniversaries={anniversaries} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
