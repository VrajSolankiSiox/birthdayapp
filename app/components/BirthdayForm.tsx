"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, User, Loader2, Sparkles, UserRound, ChevronDown, Check } from "lucide-react";

// Helper for days in month
const getDaysInMonth = (monthStr: string, yearStr: string) => {
  if (!monthStr) return 31;
  const m = parseInt(monthStr);
  const y = yearStr ? parseInt(yearStr) : new Date().getFullYear(); // default to current year for leap year math if no year given
  return new Date(y, m, 0).getDate();
};

const CustomDropdown = ({ value, onChange, options, placeholder, icon, errorStatus }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10">{icon}</div>}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50/50 border ${errorStatus ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#FF3737] focus:ring-[#FF3737]/10'} rounded-2xl py-3.5 ${icon ? 'pl-12' : 'pl-4'} pr-10 text-gray-900 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium cursor-pointer flex items-center select-none shadow-sm shadow-gray-100/50`}
      >
        <span className={selectedOption ? "text-gray-900 block truncate" : "text-gray-400 truncate block"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] py-2 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          {options.map((opt: any) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="px-4 py-2.5 mx-2 rounded-xl text-sm font-medium hover:bg-[#FF3737]/5 hover:text-[#FF3737] cursor-pointer flex items-center justify-between text-gray-700 transition-colors"
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4 text-[#FF3737]" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function BirthdayForm({ onAdd }: { onAdd: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    month: "",
    day: "",
    year: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const MONTH_OPTIONS = Array.from({ length: 12 }).map((_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i).toLocaleString('default', { month: 'long' })
  }));

  const GENDER_OPTIONS = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.name || !formData.month || !formData.day) {
        throw new Error("Name, month, and day are required.");
      }

      // Date Validation
      const daysInSelectedMonth = getDaysInMonth(formData.month, formData.year);
      const chosenDay = parseInt(formData.day);
      if (chosenDay < 1 || chosenDay > daysInSelectedMonth) {
        throw new Error(`The day must be between 1 and ${daysInSelectedMonth} for the selected month!`);
      }

      const payload = {
        name: formData.name,
        month: formData.month,
        day: formData.day,
        year: formData.year || undefined,
        gender: formData.gender,
      };

      const res = await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save birthday");

      setSuccess(true);
      setFormData({ name: "", month: "", day: "", year: "", gender: "" });
      onAdd();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Live constraint for day input
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setFormData({ ...formData, day: '' });
      return;
    }
    const num = parseInt(val);
    const max = getDaysInMonth(formData.month, formData.year);
    if (num > max) {
      setFormData({ ...formData, day: String(max) });
    } else if (num < 1) {
      setFormData({ ...formData, day: "1" });
    } else {
      setFormData({ ...formData, day: val });
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.04)] relative z-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#FF3737]/10 text-[#FF3737] p-3 rounded-2xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Add Contact
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-[#FF3737]">*</span></label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              required
              type="text"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#FF3737] focus:ring-4 focus:ring-[#FF3737]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.name}
              placeholder="E.g. John Doe"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Month <span className="text-[#FF3737]">*</span></label>
            <CustomDropdown
              options={MONTH_OPTIONS}
              value={formData.month}
              onChange={(val: string) => {
                const newMax = getDaysInMonth(val, formData.year);
                const currentDay = parseInt(formData.day);
                setFormData(prev => ({
                  ...prev,
                  month: val,
                  day: currentDay > newMax ? String(newMax) : prev.day
                }));
              }}
              placeholder="Select Month"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Day <span className="text-[#FF3737]">*</span></label>
            <input
              required
              type="number"
              min="1"
              max={getDaysInMonth(formData.month, formData.year)}
              placeholder="DD"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#FF3737] focus:ring-4 focus:ring-[#FF3737]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.day}
              onChange={handleDayChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year <span className="text-gray-400 font-normal">(Opt)</span></label>
            <input
              type="number"
              placeholder="YYYY"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#FF3737] focus:ring-4 focus:ring-[#FF3737]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.year}
              onChange={(e) => {
                const val = e.target.value;
                const newMax = getDaysInMonth(formData.month, val);
                const currentDay = parseInt(formData.day);
                setFormData(prev => ({
                  ...prev,
                  year: val,
                  day: currentDay > newMax ? String(newMax) : prev.day
                }));
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gender <span className="text-gray-400 font-normal">(Opt)</span></label>
          <CustomDropdown
            icon={<UserRound />}
            options={GENDER_OPTIONS}
            value={formData.gender}
            onChange={(val: string) => setFormData({ ...formData, gender: val })}
            placeholder="Select Gender"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[#FF3737]/5 text-[#FF3737] text-sm font-semibold p-4 rounded-xl border border-[#FF3737]/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4" /> Contact successfully saved!
          </div>
        )}

        <div className="pt-2">
          <button
            disabled={loading}
            className="w-full bg-[#FF3737] hover:bg-[#db0d0d] text-white font-semibold rounded-2xl py-4 transition-all hover:shadow-[0_8px_20px_rgb(236,72,153,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative shadow-lg shadow-[#FF3737]/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Save Contact
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
