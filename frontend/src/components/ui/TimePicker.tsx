import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string; // format: "HH:mm" (24h) or empty
  onChange: (time: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  let initialHour = '12';
  let initialMinute = '00';
  let initialPeriod = 'PM';

  if (value) {
    const [h, m] = value.split(':');
    const hourNum = parseInt(h, 10);
    initialPeriod = hourNum >= 12 ? 'PM' : 'AM';
    initialHour = (hourNum % 12 || 12).toString().padStart(2, '0');
    initialMinute = m;
  }

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [period, setPeriod] = useState(initialPeriod);

  // Update parent when internal state changes
  useEffect(() => {
    if (!hour || !minute) return;
    let h24 = parseInt(hour, 10);
    if (period === 'PM' && h24 !== 12) h24 += 12;
    if (period === 'AM' && h24 === 12) h24 = 0;
    
    const formatted = `${h24.toString().padStart(2, '0')}:${minute}`;
    if (formatted !== value) {
      onChange(formatted);
    }
  }, [hour, minute, period]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Display */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 hover:border-[var(--color-accent-purple)] rounded-lg py-2.5 px-3 flex items-center justify-between cursor-pointer transition-colors"
      >
        <span className={value ? "text-white text-sm" : "text-white/40 text-sm"}>
          {value ? `${hour}:${minute} ${period}` : '--:--'}
        </span>
        <Clock size={16} className="text-white/50" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#0B0C10]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex gap-4 h-48">
            
            {/* Hours */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-white/40 mb-2 font-medium">Hour</span>
              <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {hours.map(h => (
                  <button
                    key={h}
                    onClick={() => setHour(h)}
                    className={`w-full py-2 text-sm rounded-lg transition-colors ${
                      hour === h 
                        ? 'bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)]/30' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-white/40 mb-2 font-medium">Min</span>
              <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {minutes.map(m => (
                  <button
                    key={m}
                    onClick={() => setMinute(m)}
                    className={`w-full py-2 text-sm rounded-lg transition-colors ${
                      minute === m 
                        ? 'bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)]/30' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-white/40 mb-2 font-medium">AM/PM</span>
              <div className="flex-1 w-full flex flex-col gap-2">
                <button
                  onClick={() => setPeriod('AM')}
                  className={`w-full py-3 text-sm rounded-lg transition-colors ${
                    period === 'AM' 
                      ? 'bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)]/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => setPeriod('PM')}
                  className={`w-full py-3 text-sm rounded-lg transition-colors ${
                    period === 'PM' 
                      ? 'bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)]/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
