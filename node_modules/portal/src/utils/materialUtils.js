export const getPrefix = (name) => {
    if (!name || name === '-') return 'UNK';
    let cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
    return cleanName.substring(0, 3).padEnd(3, 'X');
};

export const generateMaterialId = (category, subCategory, existingMaterials) => {
    const catPrefix = getPrefix(category);
    const subPrefix = getPrefix(subCategory);
    const prefix = `${catPrefix}-${subPrefix}-`;

    let maxSeq = 0;
    existingMaterials.forEach(m => {
        if (m.id && m.id.startsWith(prefix)) {
            const numPart = m.id.substring(prefix.length);
            const num = parseInt(numPart, 10);
            if (!isNaN(num) && num > maxSeq) {
                maxSeq = num;
            }
        }
    });

    return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
};

export const updateMaterialsWithNewPrefixes = (materials, newCategoryName = null, newSubCategoryName = null) => {
    let hasChanges = false;
    let oldToNewIdMap = {};

    // Group materials by whether they need an update
    const materialsToKeep = [];
    const materialsToUpdate = [];

    materials.forEach(m => {
        // Did category or subcategory name change for this item? (Used mainly by EditModal)
        // Or if it's called from CategoryEdit, the `m.category` is already the NEW name.
        // So we just check if its ID prefix matches its CURRENT category/subcategory.
        const catPrefix = getPrefix(m.category);
        const subPrefix = getPrefix(m.subCategory);
        const expectedPrefix = `${catPrefix}-${subPrefix}-`;

        if (!m.id || !m.id.startsWith(expectedPrefix)) {
            materialsToUpdate.push(m);
        } else {
            materialsToKeep.push(m);
        }
    });

    if (materialsToUpdate.length === 0) {
        return { updatedMaterials: materials, hasChanges: false, oldToNewIdMap: {} };
    }

    // Now securely assign new IDs to the ones that need updates
    const allMaterialsRunning = [...materialsToKeep];
    const updatedMaterialsList = [...materialsToKeep];

    materialsToUpdate.forEach(m => {
        const newId = generateMaterialId(m.category, m.subCategory, allMaterialsRunning);
        const updatedM = { ...m, id: newId };

        oldToNewIdMap[m.id] = newId;
        hasChanges = true;

        allMaterialsRunning.push(updatedM);
        updatedMaterialsList.push(updatedM);
    });

    return {
        updatedMaterials: updatedMaterialsList,
        hasChanges,
        oldToNewIdMap
    };
};

export const cascadeSubcontractorMaterialIds = (oldToNewIdMap) => {
    if (Object.keys(oldToNewIdMap).length === 0) return;

    const subconsJSON = localStorage.getItem('subcontractors');
    if (!subconsJSON) return;

    let subcons = JSON.parse(subconsJSON);
    let subconChanged = false;

    subcons = subcons.map(sub => {
        if (!sub.suppliedMaterials) return sub;
        let smChanged = false;
        const newSupplied = sub.suppliedMaterials.map(sm => {
            if (oldToNewIdMap[sm.materialId]) {
                smChanged = true;
                return { ...sm, materialId: oldToNewIdMap[sm.materialId] };
            }
            return sm;
        });
        if (smChanged) {
            subconChanged = true;
            return { ...sub, suppliedMaterials: newSupplied };
        }
        return sub;
    });

    if (subconChanged) {
        localStorage.setItem('subcontractors', JSON.stringify(subcons));
        window.dispatchEvent(new Event('storage'));
    }
};
