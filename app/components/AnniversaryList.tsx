import { FolderHeart, Briefcase } from "lucide-react";

interface Anniversary {
  id: string;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  department: string;
  month: number;
  day: number;
  year?: number;
}

export function AnniversaryList({
  anniversaries,
}: {
  anniversaries: Anniversary[];
}) {
  const getDaysUntil = (month: number, day: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let anniversary = new Date(currentYear, month - 1, day);

    // Normalize times
    today.setHours(0, 0, 0, 0);
    anniversary.setHours(0, 0, 0, 0);

    if (anniversary < today) {
      anniversary = new Date(currentYear + 1, month - 1, day);
    }

    const diffTime = Math.abs(anniversary.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString("default", {
      month: "short",
    });
  };

  // Sort by upcoming
  const sortedAnniversaries = [...anniversaries].sort((a, b) => {
    return getDaysUntil(a.month, a.day) - getDaysUntil(b.month, b.day);
  });

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.04)] h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
        <div className="bg-[#4f46e5]/10 text-[#4f46e5] p-3 rounded-2xl">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">
            Work Anniversaries
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {anniversaries.length} entries tracked
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        {sortedAnniversaries.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <p className="font-semibold">No work anniversaries yet.</p>
          </div>
        ) : (
          sortedAnniversaries.map((a) => {
            const daysUntil = getDaysUntil(a.month, a.day);
            const isToday = daysUntil === 0;
            const years = a.year ? new Date().getFullYear() - a.year : null;
            const yearsLabel = years
              ? `${years} year${years > 1 ? "s" : ""}`
              : null;

            return (
              <div
                key={a.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl transition-all border ${
                  isToday
                    ? "border-[#4f46e5]/20 bg-[#4f46e5]/[0.03] shadow-sm shadow-[#4f46e5]/5"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm hover:shadow-gray-100/50 bg-white"
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm ${
                      isToday
                        ? "bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/30"
                        : "bg-gray-50 text-gray-900 border border-gray-100"
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-80 leading-none mb-1 tracking-wider">
                      {getMonthName(a.month)}
                    </span>
                    <span className="text-xl leading-none">{a.day}</span>
                  </div>

                  <div>
                    <div className="text-[12px] text-gray-500 font-medium mb-2">
                      Joining Date
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="inline-flex items-center gap-2 text-[15px] font-bold text-gray-900">
                        <span>{a.name}</span>
                      </div>
                      <div className="text-[13px] text-[#4f46e5] font-semibold">
                        {a.jobTitle}
                      </div>
                      <div className="text-[12px] text-gray-500 font-medium">
                        {a.department}
                      </div>
                      {yearsLabel && (
                        <div className="text-[12px] text-[#4f46e5] font-semibold">
                          {yearsLabel} anniversary
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 text-right shrink-0">
                  {!isToday ? (
                    <span
                      className="text-[13px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
                      style={{
                        backgroundColor: daysUntil < 3 ? "#4f46e5" : "",
                        color: daysUntil < 3 ? "white" : "",
                      }}
                    >
                      In {daysUntil} days
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-[#4f46e5]">
                      🎊 Time to celebrate
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
