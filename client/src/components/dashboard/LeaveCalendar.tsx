import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LeaveRequest } from "@shared/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";

interface LeaveCalendarProps {
  leaves: LeaveRequest[];
}

export default function LeaveCalendar({ leaves }: LeaveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Function to check if a day has leave and get its type
  const getDayLeave = (day: Date) => {
    return leaves.find(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      return day >= start && day <= end;
    });
  };
  
  return (
    <Card className="border border-neutral-100">
      <CardHeader className="pb-3 border-b border-neutral-100">
        <CardTitle className="text-lg font-semibold flex items-center">
          <span className="material-icons text-primary mr-2">calendar_month</span>
          Leave Calendar
        </CardTitle>
      </CardHeader>
      
      {/* Calendar Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-neutral-100">
        <Button variant="ghost" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-base font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="ghost" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <CardContent className="p-4">
        {/* Days of Week */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-neutral-500">{day}</div>
          ))}
        </div>
        
        {/* Calendar Dates */}
        <div className="grid grid-cols-7 gap-1">
          {/* Gap for days of the week before the 1st of the month */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-16 p-1 text-center text-neutral-300 text-sm"></div>
          ))}
          
          {/* Days of the month */}
          {monthDays.map((day, i) => {
            const dayLeave = getDayLeave(day);
            return (
              <div
                key={i}
                className={cn(
                  "h-16 p-1 border border-neutral-100 rounded-lg hover:bg-neutral-50 cursor-pointer",
                  dayLeave && `bg-${dayLeave.type === 'sick' ? 'blue' : 
                              dayLeave.type === 'vacation' ? 'indigo' : 
                              dayLeave.type === 'personal' ? 'purple' : 'gray'}-50`,
                  isToday(day) && "border-primary"
                )}
              >
                <div className={cn(
                  "text-center text-sm mb-1",
                  isToday(day) && "font-bold text-primary"
                )}>
                  {format(day, 'd')}
                </div>
                
                {/* Leave indicator */}
                {dayLeave && (
                  <div className={cn(
                    "text-xs text-white rounded-full px-1 text-center",
                    `bg-${dayLeave.type === 'sick' ? 'blue' : 
                          dayLeave.type === 'vacation' ? 'indigo' : 
                          dayLeave.type === 'personal' ? 'purple' : 'gray'}-500`
                  )}>
                    {dayLeave.type.charAt(0).toUpperCase() + dayLeave.type.slice(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {/* Calendar Legend */}
      <CardFooter className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-start items-center flex-wrap gap-3">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-xs text-neutral-600">Sick Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
          <span className="text-xs text-neutral-600">Vacation</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-xs text-neutral-600">Personal</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-xs text-neutral-600">University Holiday</span>
        </div>
      </CardFooter>
    </Card>
  );
}
