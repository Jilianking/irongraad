import { useState, useEffect } from 'react';
import { Menu, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import QuickActions from '../components/QuickActions';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  // Get the demo start time from localStorage
  const getDemoStartTime = () => {
    const stored = localStorage.getItem('demoStartTime');
    if (!stored) {
      const now = new Date().toISOString();
      localStorage.setItem('demoStartTime', now);
      return now;
    }
    return stored;
  };

  const demoStartTime = getDemoStartTime();

  // Fetch events for the current month
  useEffect(() => {
    const fetchEvents = async () => {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      try {
        // Fetch projects with start dates in this month
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(
          projectsRef,
          where('startDate', '>=', startOfMonth.toISOString()),
          where('startDate', '<=', endOfMonth.toISOString())
        );
        
        // Fetch calendar events for this month
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where('date', '>=', startOfMonth.toISOString()),
          where('date', '<=', endOfMonth.toISOString())
        );
        
        const [projectsSnapshot, eventsSnapshot] = await Promise.all([
          getDocs(projectsQuery),
          getDocs(eventsQuery)
        ]);

        const eventsByDate = {};
        
        // Process projects
        projectsSnapshot.forEach(doc => {
          const project = doc.data();
          if (project.startDate > demoStartTime) {
            const date = new Date(project.startDate).getDate();
            if (!eventsByDate[date]) {
              eventsByDate[date] = [];
            }
            eventsByDate[date].push({
              id: doc.id,
              title: `${project.name}`,
              type: 'project_start',
              projectType: project.projectType,
              description: `Project Start: ${project.projectType}`
            });
          }
        });

        // Process calendar events
        eventsSnapshot.forEach(doc => {
          const event = doc.data();
          if (event.date > demoStartTime) {
            const date = new Date(event.date).getDate();
            if (!eventsByDate[date]) {
              eventsByDate[date] = [];
            }
            eventsByDate[date].push({
              id: doc.id,
              title: event.title,
              type: event.type,
              description: event.description
            });
          }
        });
        
        setEvents(eventsByDate);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate, demoStartTime]);

  // Get current month's days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  };

  const handleQuickAddEvent = async (day) => {
    if (!newEventTitle.trim()) return;

    const eventDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        name: newEventTitle,
        createdAt: eventDate.toISOString(),
        projectType: 'quick-add'
      });

      // Update local state
      const newEvents = { ...events };
      if (!newEvents[day]) newEvents[day] = [];
      newEvents[day].push({
        id: docRef.id,
        title: newEventTitle,
        type: 'quick-add'
      });
      setEvents(newEvents);
      setNewEventTitle('');
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white flex">
        {/* Sidebar */}
        <div className="w-16 p-4 bg-white border-r border-gray-200">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white text-gray-900 w-64 p-6 h-full border-r border-gray-200">
              <DialogTitle className="sr-only">Main Navigation</DialogTitle>
              <DialogDescription className="sr-only">Primary navigation menu for the application.</DialogDescription>
              <ul className="space-y-4 text-2xl font-large">
                <li><Link to="/dashboard" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Dashboard</Link></li>
                <li><Link to="/activeprojects" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Active Projects</Link></li>
                <li><Link to="/newproject" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">New Project</Link></li>
                <li><Link to="/calendar" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Calendar</Link></li>
                <li><Link to="/inbox" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Inbox</Link></li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex gap-8">
              {/* Quick Actions Panel - Now on the left */}
              <div className="w-96 sticky top-8">
                <QuickActions />
              </div>

              {/* Calendar Section */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900">Calendar</h1>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDate(new Date());
                        setSelectedDay(new Date().getDate());
                      }}
                      className="flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Today
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigateMonth(-1)}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </Button>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h2>
                    <Button 
                      variant="outline"
                      onClick={() => navigateMonth(1)}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-semibold py-2 text-gray-600">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => (
                      <div
                        key={index}
                        className={`
                          aspect-square p-2 rounded-lg border transition-all
                          ${day ? 'hover:border-blue-500 cursor-pointer group' : ''}
                          ${isToday(day) ? 'bg-blue-50 border-blue-500' : 'border-gray-100'}
                          ${day === selectedDay ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        `}
                        onClick={() => day && setSelectedDay(day)}
                      >
                        {day && (
                          <div className="h-full flex flex-col">
                            <span className={`text-lg ${isToday(day) ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
                              {day}
                            </span>
                            {/* Events for this day */}
                            {events[day]?.map((event, i) => (
                              <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                  <div 
                                    className={`text-xs p-1 mt-1 rounded ${
                                      event.type === 'project_start' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    } truncate hover:bg-opacity-80 transition-colors cursor-pointer`}
                                  >
                                    {event.title}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="p-2">
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-gray-500">{event.description}</p>
                                    {event.projectType && (
                                      <p className="text-sm text-gray-500">Type: {event.projectType}</p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {day && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity w-full justify-start p-1"
                                  >
                                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4">
                                  <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900">Add Event</h3>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Event title"
                                        value={newEventTitle}
                                        onChange={(e) => setNewEventTitle(e.target.value)}
                                      />
                                      <Button 
                                        onClick={() => handleQuickAddEvent(day)}
                                        size="sm"
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
