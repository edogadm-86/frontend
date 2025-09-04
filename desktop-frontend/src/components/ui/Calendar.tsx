import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: string;
  color: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (date: Date) => void;
  selectedDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  onDateSelect,
  onEventClick,
  onAddEvent,
  selectedDate = new Date()
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonth.getDate() - i),
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false
    });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                view === 'month' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                view === 'week' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            icon={<ChevronLeft size={16} />}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            icon={<ChevronRight size={16} />}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 gap-1 ${view === 'week' ? 'min-h-[200px]' : ''}`}>
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg dark:bg-gray-700 dark:text-gray-300">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          
          return (
            <div
              key={index}
              onClick={() => {
                onDateSelect(day.date);
                if (dayEvents.length === 0) {
                  onAddEvent(day.date);
                }
              }}
              className={`
                ${view === 'week' ? 'min-h-[150px]' : 'min-h-[100px]'} p-2 border border-gray-100 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-md dark:border-gray-600 dark:hover:bg-blue-900/20
                ${!day.isCurrentMonth ? 'opacity-40' : ''}
                ${isToday(day.date) ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300 dark:from-blue-900/50 dark:to-cyan-900/50' : 'bg-white dark:bg-gray-800'}
                ${isSelected(day.date) ? 'ring-2 ring-primary-500' : ''}
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isToday(day.date) ? 'text-blue-700 dark:text-blue-300' : day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}
              `}>
                {day.date.getDate()}
              </div>
              
              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`
                      text-xs p-1 rounded text-white font-medium truncate cursor-pointer hover:opacity-80
                      ${event.color}
                    `}
                    title={`${event.title} at ${event.time}`}
                  >
                    {event.time} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium dark:text-gray-400">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
              
              {/* Add event button for empty days */}
              {dayEvents.length === 0 && day.isCurrentMonth && (
                <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Vet Appointments</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Grooming</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Training</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-300">Other</span>
        </div>
      </div>
    </Card>
  );
};