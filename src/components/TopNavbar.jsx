import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Menu } from "lucide-react";
import { Link } from 'react-router-dom';

export default function TopNavbar() {
  return (
    <div className="bg-[#2e0e17] text-white px-4 py-3 flex justify-start items-center border-b border-[#511628]">
      <h1 className="text-xl font-bold">Irongraad Project</h1>

      <Sheet>
        <SheetTrigger>
          <Menu className="w-8 h-8 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors" />
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
  );
}

