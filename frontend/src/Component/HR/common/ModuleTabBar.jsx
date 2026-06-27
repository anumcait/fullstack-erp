import React from "react";

/**
 * Reusable enterprise tab-nav for all HR module dashboards.
 * Replaces the legacy ☰ hamburger dropdown pattern.
 *
 * Props:
 *   title   : string  – module title shown top-left
 *   tabs    : Array<{ label, value, icon? }>
 *   active  : string  – currently active tab value
 *   onChange: fn(value) – called when a tab is clicked
 */
const ModuleTabBar = ({ title, tabs, active, onChange }) => (
    <div className="bg-white border-b border-gray-100 px-8 pt-6 pb-0 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
        <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200 border-b-2 whitespace-nowrap focus:outline-none
            ${active === tab.value
                            ? "text-blue-600 border-blue-600 bg-blue-50"
                            : "text-gray-500 border-transparent hover:text-blue-500 hover:bg-gray-50"
                        }`}
                >
                    {tab.icon && (
                        <span className={`text-base transition-colors ${active === tab.value ? "text-blue-600" : "text-gray-400"}`}>
                            {tab.icon}
                        </span>
                    )}
                    {tab.label}
                </button>
            ))}
        </div>
    </div>
);

export default ModuleTabBar;
