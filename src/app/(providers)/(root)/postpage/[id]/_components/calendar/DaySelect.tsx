import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import React from 'react';
import toast from 'react-hot-toast';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface DaySelectProps {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
}

const DaySelect: React.FC<DaySelectProps> = ({
  selectedMonth,
  setSelectedMonth,
  startDate,
  endDate,
  setStartDate,
  setEndDate
}) => {
  const today = startOfDay(new Date());

  if (!(selectedMonth instanceof Date) || isNaN(selectedMonth.getTime())) {
    return <div>Invalid month selected</div>;
  }

  const startMonth = startOfMonth(selectedMonth);
  const endMonth = endOfMonth(selectedMonth);

  const startCalendar = startOfWeek(startMonth, { weekStartsOn: 0 }); // Start from Sunday
  const endCalendar = endOfWeek(endMonth, { weekStartsOn: 0 });

  const daysInCalendar = Array.from(
    { length: (endCalendar.getTime() - startCalendar.getTime()) / (1000 * 60 * 60 * 24) + 1 },
    (_, i) => new Date(startCalendar.getFullYear(), startCalendar.getMonth(), startCalendar.getDate() + i)
  );

  const isDateDisabled = (date: Date) => isBefore(startOfDay(date), today);

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (startDate && endDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate) {
      const newEndDate = isAfter(date, startDate) ? date : startDate;
      const newStartDate = isAfter(date, startDate) ? startDate : date;

      // 선택된 날짜가 7일을 초과하지 않도록 제한
      if ((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24) < 7) {
        setEndDate(newEndDate);
      } else {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          toast('You cannot select more than 7 days!', {
            duration: 3000,
            position: 'bottom-center',
            style: {
              background: '#333',
              color: '#fff',
              marginBottom: '100px',
              borderRadius: '70px',
              padding: '10px 20px'
            }
          });
        } else {
          alert('You cannot select more than 7 days!'); // Web 환경
        }
        setEndDate(null); // 7일을 초과하면 선택 해제
      }
    } else {
      setStartDate(date);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mx-auto mb-2 flex items-center font-bold">
        <button onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))} className="mr-3">
          <IoIosArrowBack className="size-7" />
        </button>
        {format(selectedMonth, 'MMMM yyyy')}
        <button onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))} className="ml-3">
          <IoIosArrowForward className="size-7" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="font-medium text-gray-400">
            {day}
          </div>
        ))}
        {daysInCalendar.map((day) => {
          const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();

          if (!isCurrentMonth) {
            return <div key={day.toDateString()} />; // 빈 div로 공간 유지
          }

          return (
            <button
              key={day.toDateString()}
              onClick={() => handleDateClick(day)}
              className={`ml-2 w-10 rounded-full py-2 font-medium ${
                isDateDisabled(day)
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : startDate && endDate && day >= startDate && day <= endDate
                    ? 'bg-primary-300 text-white'
                    : startDate && day.toDateString() === startDate.toDateString()
                      ? 'bg-primary-300 text-white'
                      : endDate && day.toDateString() === endDate.toDateString()
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-black'
              } ${isDateDisabled(day) ? 'cursor-not-allowed' : 'hover:bg-gray-100'}`}
              disabled={isDateDisabled(day)}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySelect;
