import { Birthday } from "@prisma/client";
import { FolderHeart } from "lucide-react";

export function BirthdayList({ birthdays }: { birthdays: Birthday[] }) {
  const getDaysUntil = (month: number, day: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let bday = new Date(currentYear, month - 1, day);

    // Normalize times
    today.setHours(0, 0, 0, 0);
    bday.setHours(0, 0, 0, 0);

    if (bday < today) {
      bday = new Date(currentYear + 1, month - 1, day);
    }

    const diffTime = Math.abs(bday.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' });
  };

  // Sort by upcoming
  const sortedBirthdays = [...birthdays].sort((a, b) => {
    return getDaysUntil(a.month, a.day) - getDaysUntil(b.month, b.day);
  });

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.04)] h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
        <div className="bg-[#FF3737]/10 text-[#FF3737] p-3 rounded-2xl">
          <FolderHeart className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">
            Directory
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {birthdays.length} entries tracked
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        {sortedBirthdays.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <p className="font-semibold">No records found.</p>
          </div>
        ) : (
          sortedBirthdays.map((b) => {
            const daysUntil = getDaysUntil(b.month, b.day);
            const isToday = daysUntil === 0;

            return (
              <div
                key={b.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl transition-all border ${isToday
                  ? 'border-[#FF3737]/20 bg-[#FF3737]/[0.03] shadow-sm shadow-[#FF3737]/5'
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-sm hover:shadow-gray-100/50 bg-white'
                  }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm ${isToday ? 'bg-[#FF3737] text-white shadow-lg shadow-[#FF3737]/30' : 'bg-gray-50 text-gray-900 border border-gray-100'
                    }`}>
                    <span className="text-[10px] uppercase opacity-80 leading-none mb-1 tracking-wider">{getMonthName(b.month)}</span>
                    <span className="text-xl leading-none">{b.day}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-lg text-gray-900 leading-none">
                        {b.name}
                      </h3>
                      {isToday && (
                        <span className="text-[10px] font-black tracking-wider uppercase bg-[#FF3737]/10 text-[#FF3737] px-2 py-0.5 rounded-md">
                          TODAY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium tracking-wide">
                      {b.year && (
                        <>
                          <span>{new Date().getFullYear() - b.year} yrs</span>
                          <span className="text-gray-300">•</span>
                        </>
                      )}
                      {b.gender && (
                        <>
                          <span>{b.gender}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 text-right shrink-0">
                  {!isToday ? (
                    <span className="text-[13px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
                      style={{ backgroundColor: daysUntil == 3 ? "#cc273dff" : "", color: daysUntil == 3 ? "white" : "" }}
                    >
                      In {daysUntil} days
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-[#FF3737]">
                      🎉 Time to celebrate
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
