import React from 'react';

export const StatusPanel = ({ title, items }) => (
    <div className="space-y-4 border-blue-500/30 px-4">
        <h2 className="text-cyan-400 text-lg font-mono">{title}</h2>
        <div className="space-y-2">
            {items.map(({ label, value, color = 'text-blue-400' }) => (
                <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className={color}>{value}</span>
                </div>
            ))}
        </div>
    </div>
);