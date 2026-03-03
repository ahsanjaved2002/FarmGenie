import React, { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

const CustomTimePicker = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Generate hours (01-12)
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // Generate minutes (00, 15, 30, 45)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // AM/PM
  const periods = ["AM", "PM"];

  const [selectedHour, setSelectedHour] = useState("01");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  // Parse existing value if provided
  React.useEffect(() => {
    if (value) {
      const [time, period] = value.split(" ");
      const [hour, minute] = time.split(":");
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period || "AM");
    }
  }, [value]);

  const handleSelect = (hour, minute, period) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);

    // Convert to 24-hour format for form submission
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    const timeString = `${String(hour24).padStart(2, "0")}:${minute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return "";
    // If value is in 24hr format (from time input), convert to 12hr
    const [hour24, minute] = value.split(":");
    let hour = parseInt(hour24);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
  };

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={formatDisplayTime()}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder="Select time"
          className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all bg-white cursor-pointer font-medium text-gray-700 ${
            error
              ? "border-red-300"
              : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
          }`}
        />
        <Clock className="absolute left-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none" />
        <ChevronDown
          className={`absolute right-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Time Picker Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl w-full">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-t-xl border-b-2 border-emerald-200">
              <div className="text-center font-bold text-emerald-700">
                Select Time
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Hours Column */}
                <div>
                  <div className="text-xs font-semibold text-emerald-600 mb-2 text-center">
                    Hour
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                    {hours.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() =>
                          handleSelect(hour, selectedMinute, selectedPeriod)
                        }
                        className={`w-full py-2 px-3 rounded-lg font-medium transition-all text-center ${
                          selectedHour === hour
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold"
                            : "text-gray-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700"
                        }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minutes Column */}
                <div>
                  <div className="text-xs font-semibold text-emerald-600 mb-2 text-center">
                    Minute
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                    {minutes.map((minute) => (
                      <button
                        key={minute}
                        type="button"
                        onClick={() =>
                          handleSelect(selectedHour, minute, selectedPeriod)
                        }
                        className={`w-full py-2 px-3 rounded-lg font-medium transition-all text-center ${
                          selectedMinute === minute
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold"
                            : "text-gray-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700"
                        }`}
                      >
                        {minute}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AM/PM Column */}
                <div>
                  <div className="text-xs font-semibold text-emerald-600 mb-2 text-center">
                    Period
                  </div>
                  <div className="space-y-1">
                    {periods.map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() =>
                          handleSelect(selectedHour, selectedMinute, period)
                        }
                        className={`w-full py-2 px-3 rounded-lg font-medium transition-all text-center ${
                          selectedPeriod === period
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold"
                            : "text-gray-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomTimePicker;
