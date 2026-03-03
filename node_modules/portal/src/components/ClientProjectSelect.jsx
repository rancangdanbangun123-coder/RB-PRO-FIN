import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * ClientProjectSelect - A robust multi-select component for managing client projects.
 * Uses React Portal to render the dropdown on top of all other elements, preventing overflow clipping.
 */
export default function ClientProjectSelect({
    client,
    allProjects,
    onAddProject,
    onRemoveProject
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [isPositionCalculated, setIsPositionCalculated] = useState(false);
    const containerRef = useRef(null);

    // Filter projects
    const linkedProjects = allProjects.filter(p => p.clientId === client.id);
    const availableProjects = allProjects.filter(p => p.clientId !== client.id);
    const filteredAvailable = availableProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle dropdown opening and positioning
    React.useLayoutEffect(() => {
        if (isOpen && containerRef.current) {
            const updatePosition = () => {
                const rect = containerRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 4, // 4px gap
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
                setIsPositionCalculated(true);
            };

            updatePosition();
            // Update on scroll/resize
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
                setIsPositionCalculated(false);
            };
        } else {
            setIsPositionCalculated(false);
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target) &&
                !event.target.closest('.portal-dropdown-menu') // Check if click is inside portal
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Helper to check for dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div
            className="group/multiselect min-w-[220px]"
            ref={containerRef}
        >
            {/* Input Container */}
            <div
                className={`w-full min-h-[38px] px-2 py-1.5 border rounded-md bg-white dark:bg-slate-800 flex flex-wrap gap-1.5 items-center cursor-text transition-all ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    }`}
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                {/* Render Selected Tags */}
                {linkedProjects.map(p => (
                    <span
                        key={p.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-medium text-slate-700 dark:text-slate-300 animate-fadeIn"
                    >
                        {p.name}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveProject(p.id);
                            }}
                            className="text-slate-400 hover:text-red-500 rounded-full p-0.5 transition-colors"
                        >
                            <span className="material-icons-round text-[12px] leading-none">close</span>
                        </button>
                    </span>
                ))}

                {/* Input Field */}
                <div className="flex-1 flex items-center min-w-[60px]">
                    <input
                        type="text"
                        className="w-full bg-transparent border-none outline-none text-xs p-0 placeholder:text-slate-400"
                        placeholder={linkedProjects.length === 0 ? "Select projects..." : ""}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>

                <span className="material-icons-round text-slate-400 text-lg ml-auto cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}>
                    arrow_drop_down
                </span>
            </div>

            {/* Dropdown Menu Portal */}
            {isOpen && createPortal(
                <div
                    className={`${isDarkMode ? 'dark' : ''} font-sans`} // Ensure tailwind dark mode works inside portal if reliant on parent classes
                >
                    <div
                        className="portal-dropdown-menu absolute bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl max-h-56 overflow-y-auto z-[9999]"
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                            opacity: isPositionCalculated ? 1 : 0,
                            pointerEvents: isPositionCalculated ? 'auto' : 'none',
                            transform: isPositionCalculated ? 'scale(1)' : 'scale(0.95)',
                            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
                        }}
                    >
                        {filteredAvailable.length > 0 ? (
                            filteredAvailable.map(p => (
                                <div
                                    key={p.id}
                                    className="px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors border-b border-transparent last:border-0 hover:border-slate-100 dark:hover:border-gray-600"
                                    onClick={() => {
                                        onAddProject(p.id);
                                        setSearchTerm('');
                                        // Keep focus on input
                                        const input = containerRef.current?.querySelector('input');
                                        if (input) input.focus();
                                    }}
                                >
                                    <span className="material-icons-round text-slate-400 text-[14px]">add</span>
                                    <span>{p.name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-xs text-slate-400 italic text-center p-4">
                                {availableProjects.length === 0 ? "All projects selected" : "No matching projects"}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
