"use client";
import { Link, NavLink } from "react-router-dom";
import { Disclosure } from "@headlessui/react";

import "primereact/resources/themes/soho-light/theme.css";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Data", href: "/quotes" },
  { name: "Configure", href: "/config" },
];

export default function AppHeader() {
  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-between h-16 w-full">
            <div className="flex justify-between w-full">
              <div className="flex flex-shrink-0 items-center tracking-wider font-bold text-lg">
                <Link to="/">
                  <span className="text-slate-500">UW</span>
                  <span className="text-primary-500">Toolkit</span>
                </Link>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      (isActive
                        ? "border-primary-500 text-slate-900"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700") +
                      " inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Disclosure>
    </div>
  );
}
