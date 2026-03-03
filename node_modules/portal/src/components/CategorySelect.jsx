import React, { useEffect, useState } from 'react';

export default function CategorySelect({ value, onChange }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("categories")) || [];
        setCategories(data);
    }, []);

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-surface-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 appearance-none pl-3 pr-10"
        >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>
    );
}
