import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "./ui/Card";
import { useTranslation } from "react-i18next";
import { Shield, Heart, Apple, Activity } from "lucide-react";
import { apiClient } from "../lib/api";   // 👈 import apiClient

type NutritionRecord = {
  id: string;
  dog_id: string;
  date: string;
  food_brand: string;
  food_type: string;
  daily_amount: number;
  calories_per_day: number;
  protein_percentage: number;
  fat_percentage: number;
  carb_percentage: number;
  supplements: string[];
  notes?: string;
  weight_at_time: number;
  created_at: string;
};

export const HealthOverview: React.FC = () => {
  const { currentDog, vaccinations, healthRecords } = useApp();
  const { t } = useTranslation();

  const [nutritionRecords, setNutritionRecords] = useState<NutritionRecord[]>([]);

  useEffect(() => {
    const loadNutrition = async () => {
      if (!currentDog) return;
      try {
        const { nutritionRecords } = await apiClient.getNutritionRecords(currentDog.id);
        setNutritionRecords(nutritionRecords);
      } catch (err) {
        console.error("Failed to load nutrition records:", err);
      }
    };
    loadNutrition();
  }, [currentDog?.id]);

  if (!currentDog) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-500">
          {t("Please select a dog to view health overview")}
        </p>
      </Card>
    );
  }

  // Filter data for current dog
  const dogVaccinations = useMemo(
    () => vaccinations.filter((v) => (v.dogId ?? v.dogId) === currentDog.id),
    [vaccinations, currentDog.id]
  );
  const dogHealthRecords = useMemo(
    () => healthRecords.filter((r) => (r.dogId ?? r.dogId) === currentDog.id),
    [healthRecords, currentDog.id]
  );
  const dogNutritionRecords = useMemo(
    () => nutritionRecords.filter((r) => r.dog_id === currentDog.id),
    [nutritionRecords, currentDog.id]
  );

  const healthStats = [
    {
      icon: Shield,
      label: t("Vaccinations"),
      value: dogVaccinations.length.toString(),
      status: dogVaccinations.length > 0 ? t("records") : t("No vaccination data"),
      color: "bg-blue-500",
    },
    {
      icon: Heart,
      label: t("Health Records"),
      value: dogHealthRecords.length.toString(),
      status: dogHealthRecords.length > 0 ? t("totalEntries") : t("No health data"),
      color: "bg-red-500",
    },
    {
      icon: Apple,
      label: t("Nutrition"),
      value: dogNutritionRecords.length.toString(),
      status: dogNutritionRecords.length > 0 ? t("tracked") : t("notTracked"),
      color: "bg-green-500",
    },
    {
      icon: Activity,
      label: t("Activity"),
      value: "–",
      status: t("Coming soon"),
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {healthStats.map((stat, idx) => (
        <Card
          key={idx}
          className="p-4 flex flex-col items-center justify-center text-center"
        >
          <div
            className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mb-2`}
          >
            <stat.icon size={18} className="text-white" />
          </div>
          <p className="text-lg font-bold">{stat.value}</p>
          <p className="text-xs text-gray-600">{stat.label}</p>
          {stat.status && (
            <p className="text-[11px] text-gray-400 mt-1">{stat.status}</p>
          )}
        </Card>
      ))}
    </div>
  );
};
