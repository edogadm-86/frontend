"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMealPlanBody = exports.normalizeNutritionRecordBody = void 0;
const toYMD = (v) => {
    if (!v)
        return new Date().toISOString().slice(0, 10);
    // "2025-09-14T00:00:00.000Z" -> "2025-09-14"
    if (typeof v === 'string')
        return v.slice(0, 10);
    if (v instanceof Date)
        return v.toISOString().slice(0, 10);
    return String(v).slice(0, 10);
};
const toTimeHMS = (v) => {
    if (!v)
        return '00:00:00';
    const s = String(v);
    // "HH:mm" -> "HH:mm:00"
    if (/^\d{2}:\d{2}$/.test(s))
        return s + ':00';
    // already "HH:mm:ss"
    if (/^\d{2}:\d{2}:\d{2}$/.test(s))
        return s;
    // try best-effort
    const parts = s.split(':');
    if (parts.length >= 2)
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${(parts[2] || '00').padStart(2, '0')}`;
    return '00:00:00';
};
const toNum = (v) => (v === '' || v == null ? 0 : Number(v));
const toArray = (v) => {
    if (Array.isArray(v))
        return v;
    if (typeof v === 'string') {
        if (!v.trim())
            return [];
        return v.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};
const normalizeNutritionRecordBody = (req, _res, next) => {
    const b = req.body || {};
    b.date = toYMD(b.date);
    b.food_brand = b.food_brand ?? null;
    b.food_type = b.food_type ?? null;
    b.daily_amount = toNum(b.daily_amount);
    b.calories_per_day = toNum(b.calories_per_day);
    b.protein_percentage = toNum(b.protein_percentage);
    b.fat_percentage = toNum(b.fat_percentage);
    b.carb_percentage = toNum(b.carb_percentage);
    b.weight_at_time = toNum(b.weight_at_time);
    b.supplements = toArray(b.supplements);
    b.notes = b.notes ?? null;
    req.body = b;
    next();
};
exports.normalizeNutritionRecordBody = normalizeNutritionRecordBody;
const normalizeMealPlanBody = (req, _res, next) => {
    const b = req.body || {};
    b.meal_time = toTimeHMS(b.meal_time);
    b.food_type = b.food_type ?? null;
    b.amount = toNum(b.amount);
    b.calories = toNum(b.calories);
    // default true when missing (your SQL uses is_active !== false)
    if (typeof b.is_active === 'undefined')
        b.is_active = true;
    // allow keeping existing record if none passed (controller already tolerates null)
    b.nutrition_record_id = b.nutrition_record_id || null;
    req.body = b;
    next();
};
exports.normalizeMealPlanBody = normalizeMealPlanBody;
//# sourceMappingURL=normalizers.js.map