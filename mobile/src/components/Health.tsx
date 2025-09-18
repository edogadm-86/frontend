// src/components/Health.tsx
import React, {  useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "./ui/Card";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Heart,
  Apple,
  Target,
} from "lucide-react";
import { HealthRecords as HealthRecordsSection } from "./HealthRecords";
import { VaccinationTracker } from "./VaccinationTracker";  
import { NutritionTracker } from "./NutritionTracker";
import { HealthOverview } from "./HealthOverview";

// ---------- Main Health Screen ----------
export const Health: React.FC = () => {
  const { currentDog } = useApp();
  const { t } = useTranslation();
  const [tab, setTab] = useState<"overview" | "vaccinations" | "health" | "nutrition">("overview");

  if (!currentDog) {
    return (
      <div className="p-2">
        <Card className="text-center py-8">
          <p className="text-gray-500">{t("Please select a dog to view health data")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
       {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t('Health')} – {currentDog.name}
          </h2>
          
        </div>
      {/* Tab Buttons */}
      <div className="flex space-x-2 bg-white rounded-lg p-2">
        {[
          { id: "overview", icon: Target, label: t("overview") },
          { id: "vaccinations", icon: Shield, label: t("Vaccinations") },
          { id: "health", icon: Heart, label: t("Health") },
          { id: "nutrition", icon: Apple, label: t("nutrition") },
        ].map((tabDef) => (
          <button
            key={tabDef.id}
            onClick={() => setTab(tabDef.id as any)}
            className={`flex-1 flex items-center justify-center space-x-1 rounded-lg px-2 py-1 ${
              tab === tabDef.id ? "bg-blue-100 text-blue-700" : "text-gray-600"
            }`}
          >
            <tabDef.icon size={16} />
            <span className="text-sm">{tabDef.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && <HealthOverview />}
      {tab === "vaccinations" && ( <VaccinationTracker />)}
      {tab === "health" && <HealthRecordsSection />}
      {tab === "nutrition" &&  <NutritionTracker />}

    </div>
  );
};
