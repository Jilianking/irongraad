import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Menu } from "lucide-react";

export default function TopNavbar() {
  return (
    <div className="bg-[#2e0e17] text-white px-4 py-3 flex justify-start items-center border-b border-[#511628]">
      <h1 className="text-xl font-bold">Irongraad Project</h1>

      <Sheet>
        <SheetTrigger>
          <Menu className="w-6 h-6" />
        </SheetTrigger>
        <SheetContent side="left" className="bg-[#3a0d0d] text-white w-64 p-6">
          <h2 className="text-lg font-bold mb-4">Navigation</h2>
          <ul className="space-y-2">
            <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
            <li><a href="/newproject" className="hover:underline">New Project</a></li>
            <li><a href="/activeprojects" className="hover:underline">Active Projects</a></li>
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}

