import React, { useState, useEffect } from 'react';

export default function ProgressAdjuster({ initialProgress = 0, onProgressChange }) {
    const [progress, setProgress] = useState(initialProgress);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(initialProgress.toString());

    useEffect(() => {
        setProgress(initialProgress);
        setInputValue(initialProgress.toString());
    }, [initialProgress]);

    const handleSliderChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setProgress(value);
        setInputValue(value.toString());
        if (onProgressChange) onProgressChange(value);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        let value = parseInt(inputValue, 10);
        if (isNaN(value)) value = 0;
        if (value < 0) value = 0;
        if (value > 100) value = 100;

        setProgress(value);
        setInputValue(value.toString());
        setIsEditing(false);
        if (onProgressChange) onProgressChange(value);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-background-dark/50 rounded-lg p-3 border border-dashed border-slate-200 dark:border-border-dark mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 dark:text-text-secondary font-medium">Atur Progres Fisik</span>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                autoFocus
                                className="w-16 px-1 py-0.5 text-right font-bold text-lg text-primary bg-white dark:bg-card-dark border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                min="0"
                                max="100"
                            />
                            <span className="font-bold text-lg text-primary">%</span>
                        </div>
                    ) : (
                        <span className="text-primary font-bold text-lg">{progress}%</span>
                    )}

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-slate-400 hover:text-primary transition-colors"
                            title="Edit manually"
                        >
                            <span className="material-icons-outlined text-[14px]">edit</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative w-full h-6 flex items-center">
                <input
                    className="w-full z-20 relative focus:outline-none focus:ring-0 cursor-pointer accent-primary"
                    max="100"
                    min="0"
                    step="1"
                    type="range"
                    value={progress}
                    onChange={handleSliderChange}
                />
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-gray-700 rounded-full -translate-y-1/2 overflow-hidden pointer-events-none">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-75"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-border-dark/50">
                <span className="text-[10px] text-slate-500 dark:text-text-secondary">Dana Efektif ({progress}%)</span>
                {/* 
                    Note: The parent component should handle the effective budget calculation based on the new progress percentage. 
                    Adding a prop for this could be useful, or let the parent render this line.
                    For now, I'll remove this specific budget line from here to keep the component generic, 
                    OR I can accept a render prop or just emit the change and let parent re-render.
                    Given the existing layout, it might be better to keep it generic.
                    However, to match the exact design in ProjectDetails, maybe I should include children or a render prop?
                    Let's keep it simple first. I'll remove the specific budget line and let the parent handle it below the component if needed, 
                    BUT looking at the design, this component wraps the whole dashed box.
                    I will add a `renderFooter` prop or just `children` specifically for that footer area.
                */}
                {/* Placeholder for footer content if needed, but for now I'll just close the div and let the parent handle the "Dana Efektif" part outside 
                 OR I'll invoke a callback to get that value. 
                 Actually, the original design has the footer INSIDE the dashed box. 
                 So I will accept `children` to render inside the footer area.
                 */}
                {/* Wait, I should make it fully reusable. I'll add a `footer` prop. */}
            </div>
        </div>
    );
}
