import { Link } from "react-router-dom";
import logo from "./assets/logo.png";
import {
  PlusSquare,
  FolderKanban,
  Bell,
  CalendarDays,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#5a2a36] to-[#2e1a20] p-0 text-white">
      
      {/* 🔷 Header */}
      <div className="flex justify-between items-start px-8 pt-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mt-[50px]">
            Irongraad Project Hub
          </h1>
        </div>
        <img 
          src={logo} 
          alt="Irongraad Logo" 
          className="h-[550px] w-auto object-contain -mt-[160px]"
        />
      </div>

      {/* 🔳 Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-12 -mt-[200px]">
        <NavTile 
          label="New Project" 
          link="/newproject" 
          icon={PlusSquare} 
          className="h-[250px]"
        />
        <NavTile 
          label="Active Projects" 
          link="/activeprojects" 
          icon={FolderKanban} 
          className="h-[250px]"
        />
        <Widget 
          title="SMS/Email Notifications" 
          link="/inbox" 
          icon={Bell} 
          className="h-[250px]"
        />
        <Widget 
          title="Calendar" 
          link="/calendar" 
          icon={CalendarDays} 
          className="h-[250px]"
        />
      </div>

      {/* 📦 Footer */}
      <footer className="mt-10 text-center text-sm text-white/60 py-4">
        Jilian King
      </footer>
    </div>
  );
}

// 🔹 NavTile with glossy look + hover lighten
function NavTile({ label, link, icon: Icon, className }) {
  return (
    <Link to={link} className="group">
      <div 
        className={`bg-gradient-to-br from-[#3b1f27]/70 to-[#1f0f14]/60 
        group-hover:from-[#4a2630]/80 group-hover:to-[#29161c]/70
        border border-white/10 rounded-xl p-8 
        shadow-md group-hover:shadow-xl transition-all duration-300 
        text-2xl font-semibold text-white
        flex flex-col items-center justify-center text-center gap-3 backdrop-blur-sm
        ${className}`}
      >
        {Icon && <Icon className="w-8 h-8 text-white text-center" />}
        <span className="text-center">{label}</span>
      </div>
    </Link>
  );
}

// 🔹 Widget with same hover lighten + depth
function Widget({ title, link, icon: Icon, className }) {
  return (
    <Link to={link} className="group">
      <div 
        className={`bg-gradient-to-br from-[#3b1f27]/70 to-[#1f0f14]/60 
        group-hover:from-[#4a2630]/80 group-hover:to-[#29161c]/70
        border border-white/10 rounded-xl p-8 
        shadow-md group-hover:shadow-xl transition-all duration-300 
        flex flex-col items-center justify-center text-center backdrop-blur-sm
        ${className}`}
      >
        {Icon && <Icon className="w-8 h-8 mb-3 text-white text-center" />}
        <p className="text-2xl font-bold text-white text-center">{title}</p>
        <p className="text-sm text-gray-300 mt-2 text-center">Click to view details</p>
      </div>
    </Link>
  );
}
