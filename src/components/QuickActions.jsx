import React, { useState } from 'react';
import { Plus, Search, Clock, Calendar as CalendarIcon, List, Tag, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export default function QuickActions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const quickTags = ['Urgent', 'Meeting', 'Follow-up', 'Ideas', 'Personal'];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Quick Search */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Quick Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search events, tasks, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-5 text-base"
          />
        </div>
      </div>

      {/* Quick Add */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Quick Add</label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start py-5 text-base">
                <Plus className="mr-2 h-5 w-5" />
                Add New Item
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-6">
              <div className="space-y-4">
                <h3 className="font-medium text-base text-gray-900">Quick Add Options</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start py-6 text-base">
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    New Event
                  </Button>
                  <Button variant="outline" className="justify-start py-6 text-base">
                    <Clock className="mr-3 h-5 w-5" />
                    Set Reminder
                  </Button>
                  <Button variant="outline" className="justify-start py-6 text-base">
                    <List className="mr-3 h-5 w-5" />
                    Create Task
                  </Button>
                  <Button variant="outline" className="justify-start py-6 text-base">
                    <Tag className="mr-3 h-5 w-5" />
                    New Project
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Quick Notes */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Quick Note</label>
        <textarea
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          placeholder="Type a quick note..."
          className="w-full h-32 px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-end">
          <Button size="lg" className="px-6">Save Note</Button>
        </div>
      </div>

      {/* Quick Tags */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Quick Tags</label>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="lg"
              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
              className="text-base"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Upcoming Reminders Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Upcoming</label>
          <Button variant="link" size="sm" className="text-blue-600">View All</Button>
        </div>
        <div className="min-h-[100px] flex items-center justify-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
          No upcoming events
        </div>
      </div>
    </div>
  );
} 