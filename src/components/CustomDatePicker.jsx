import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const CustomDatePicker = ({ selected, onChange, minDate, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("date"); // 'date', 'month', 'year'
  const [currentMonth, setCurrentMonth] = useState(
    selected ? new Date(selected) : new Date()
  );
  const [currentYear, setCurrentYear] = useState(
    selected ? selected.getFullYear() : new Date().getFullYear()
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateSelect = (date) => {
    if (minDate && date < minDate) return;
    onChange(date);
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    setCurrentMonth(newDate);
    setView("date");
  };

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    setView("month");
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selected) return false;
    return date.toDateString() === selected.toDateString();
  };

  const isDisabled = (date) => {
    if (!date || !minDate) return false;
    return date < minDate;
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  const days = getDaysInMonth(currentMonth);
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <label
          htmlFor="endDate"
          className="block text-gray-700 font-semibold mb-2"
        >
          End Date *
        </label>
        <input
          type="text"
          id="endDate"
          value={formatDate(selected)}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder="Select auction end date"
          className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all bg-white cursor-pointer ${
            error
              ? "border-red-300"
              : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
          }`}
        />
        <Calendar className="absolute left-4 top-12 h-5 w-5 text-emerald-600 pointer-events-none" />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar */}
          <div className="absolute z-20 mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl w-full max-w-sm">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-t-xl border-b-2 border-emerald-200">
              <div className="flex items-center justify-between">
                {view === "date" && (
                  <>
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-emerald-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("month")}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-100 rounded-lg transition-colors font-bold text-emerald-700"
                    >
                      {months[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-emerald-600" />
                    </button>
                  </>
                )}
                {view === "month" && (
                  <button
                    type="button"
                    onClick={() => setView("year")}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-100 rounded-lg transition-colors font-bold text-emerald-700 mx-auto"
                  >
                    {currentYear}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
                {view === "year" && (
                  <div className="font-bold text-emerald-700 mx-auto">
                    Select Year
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-1">
              {/* Date View */}
              {view === "date" && (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center text-emerald-600 font-semibold text-sm"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((date, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => date && handleDateSelect(date)}
                        disabled={!date || isDisabled(date)}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${!date ? "invisible" : ""}
                          ${
                            isDisabled(date)
                              ? "text-gray-300 cursor-not-allowed"
                              : "hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 cursor-pointer"
                          }
                          ${
                            isSelected(date)
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold"
                              : "text-gray-700"
                          }
                          ${
                            isToday(date) && !isSelected(date)
                              ? "bg-emerald-100 text-emerald-700 font-semibold"
                              : ""
                          }
                        `}
                      >
                        {date?.getDate()}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Month View */}
              {view === "month" && (
                <div className="grid grid-cols-3 gap-3">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`
                        py-3 rounded-lg font-medium transition-all
                        hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50
                        ${
                          currentMonth.getMonth() === index
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {/* Year View */}
              {view === "year" && (
                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-2">
                  {generateYears().map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`py-3 px-2 rounded-lg font-semibold transition-all text-center hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50
          ${
            currentYear === year
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold"
              : "text-gray-700 hover:text-emerald-700"
          }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDatePicker;
