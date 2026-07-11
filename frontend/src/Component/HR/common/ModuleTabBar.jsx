import React from "react";

/**
 * High-Density Tab Navigation for Enterprise ERP.
 * Optimized for maximum vertical data visibility.
 */
const ModuleTabBar = ({ title, tabs, active, onChange }) => (
    <div className="bg-white border-b border-gray-200/50 px-4 pt-2 pb-0 shadow-sm">
        <div className="flex items-center justify-between mb-1">
            <h1 className="text-sm font-black text-black uppercase tracking-wider">{title}</h1>
            {/* Optional: Add a small status or breadcrumb here */}
        </div>
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all duration-150 border-b-2 whitespace-nowrap focus:outline-none
                        ${active === tab.value
                            ? "text-blue-600 border-blue-600 bg-blue-50/50"
                            : "text-black border-transparent hover:text-blue-500 hover:bg-gray-50"
                        }`}
                >
                    {tab.icon && (
                        <span className={`text-xs transition-colors ${active === tab.value ? "text-blue-600" : "text-gray-400"}`}>
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
