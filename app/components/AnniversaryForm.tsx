"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  User,
  Loader2,
  Sparkles,
  ChevronDown,
  Check,
  Briefcase,
  Mail,
  Building2,
} from "lucide-react";

// Helper for days in month
const getDaysInMonth = (monthStr: string, yearStr: string) => {
  if (!monthStr) return 31;
  const m = parseInt(monthStr);
  const y = yearStr ? parseInt(yearStr) : new Date().getFullYear();
  return new Date(y, m, 0).getDate();
};

const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  errorStatus,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10">
          {icon}
        </div>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50/50 border ${errorStatus ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-[#4f46e5] focus:ring-[#4f46e5]/10"} rounded-2xl py-3.5 ${icon ? "pl-12" : "pl-4"} pr-10 text-gray-900 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium cursor-pointer flex items-center select-none shadow-sm shadow-gray-100/50`}
      >
        <span
          className={
            selectedOption
              ? "text-gray-900 block truncate"
              : "text-gray-400 truncate block"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
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
              className="px-4 py-2.5 mx-2 rounded-xl text-sm font-medium hover:bg-[#4f46e5]/5 hover:text-[#4f46e5] cursor-pointer flex items-center justify-between text-gray-700 transition-colors"
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && (
                <Check className="w-4 h-4 text-[#4f46e5]" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function AnniversaryForm({ onAdd }: { onAdd: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    department: "",
    month: "",
    day: "",
    year: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const MONTH_OPTIONS = Array.from({ length: 12 }).map((_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i).toLocaleString("default", { month: "long" }),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (
        !formData.jobTitle ||
        !formData.department ||
        !formData.month ||
        !formData.day
      ) {
        throw new Error("Job Title, Department, Month, and Day are required.");
      }

      // Date Validation
      const daysInSelectedMonth = getDaysInMonth(formData.month, formData.year);
      const chosenDay = parseInt(formData.day);
      if (chosenDay < 1 || chosenDay > daysInSelectedMonth) {
        throw new Error(
          `The day must be between 1 and ${daysInSelectedMonth} for the selected month!`,
        );
      }

      const payload = {
        name: formData.name || "N/A",
        email: formData.email || "N/A",
        company: formData.company || "N/A",
        jobTitle: formData.jobTitle,
        department: formData.department,
        month: formData.month,
        day: formData.day,
        year: formData.year || undefined,
      };

      const res = await fetch("/api/anniversaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save anniversary");

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        jobTitle: "",
        department: "",
        month: "",
        day: "",
        year: "",
      });
      onAdd();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setFormData({ ...formData, day: "" });
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
        <div className="bg-[#4f46e5]/10 text-[#4f46e5] p-3 rounded-2xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Add Work Anniversary
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name <span className="text-gray-400 font-normal">(Opt)</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.name}
              placeholder="E.g. John Doe"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email <span className="text-gray-400 font-normal">(Opt)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.email}
              placeholder="john@company.com"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company <span className="text-gray-400 font-normal">(Opt)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.company}
              placeholder="E.g. Tech Corp"
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title <span className="text-[#4f46e5]">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              required
              type="text"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.jobTitle}
              placeholder="E.g. Senior Developer"
              onChange={(e) =>
                setFormData({ ...formData, jobTitle: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Department <span className="text-[#4f46e5]">*</span>
          </label>
          <input
            required
            type="text"
            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
            value={formData.department}
            placeholder="E.g. Technology, Healthcare"
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Month <span className="text-[#4f46e5]">*</span>
            </label>
            <CustomDropdown
              options={MONTH_OPTIONS}
              value={formData.month}
              onChange={(val: string) => {
                const newMax = getDaysInMonth(val, formData.year);
                const currentDay = parseInt(formData.day);
                setFormData((prev) => ({
                  ...prev,
                  month: val,
                  day: currentDay > newMax ? String(newMax) : prev.day,
                }));
              }}
              placeholder="Select Month"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Day <span className="text-[#4f46e5]">*</span>
            </label>
            <input
              required
              type="number"
              min="1"
              max={getDaysInMonth(formData.month, formData.year)}
              placeholder="DD"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.day}
              onChange={handleDayChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Year <span className="text-gray-400 font-normal">(Opt)</span>
            </label>
            <input
              type="number"
              placeholder="YYYY"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 transition-all font-medium shadow-sm shadow-gray-100/50"
              value={formData.year}
              onChange={(e) => {
                const val = e.target.value;
                const newMax = getDaysInMonth(formData.month, val);
                const currentDay = parseInt(formData.day);
                setFormData((prev) => ({
                  ...prev,
                  year: val,
                  day: currentDay > newMax ? String(newMax) : prev.day,
                }));
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[#4f46e5]/5 text-[#4f46e5] text-sm font-semibold p-4 rounded-xl border border-[#4f46e5]/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4" /> Anniversary successfully saved!
          </div>
        )}

        <div className="pt-2">
          <button
            disabled={loading}
            className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold rounded-2xl py-4 transition-all hover:shadow-[0_8px_20px_rgb(79,70,229,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative shadow-lg shadow-[#4f46e5]/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Save Anniversary</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
