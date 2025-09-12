// src/components/Health.tsx
import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { FileUpload } from "./ui/FileUpload";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Heart,
  Apple,
  Target,
  PlusCircle,
  Trash2,
  Edit,
  Calendar,
  User,
  Paperclip,
} from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "../lib/api";
import { HealthRecords as HealthRecordsSection } from "./HealthRecords";
import { VaccinationTracker } from "./VaccinationTracker";  
import { NutritionTracker } from "./NutritionTracker";

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
      {/* Tab Buttons */}
      <div className="flex space-x-2 bg-white rounded-lg p-2">
        {[
          { id: "overview", icon: Target, label: t("Overview") },
          { id: "vaccinations", icon: Shield, label: t("Vaccinations") },
          { id: "health", icon: Heart, label: t("Health") },
          { id: "nutrition", icon: Apple, label: t("Nutrition") },
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
      {tab === "overview" && (
        <Card className="p-4">
          <p>{t("Health overview coming soon...")}</p>
        </Card>
      )}
      {tab === "vaccinations" && (
          <VaccinationTracker />
      )}
      {tab === "health" && <HealthRecordsSection />}
      {tab === "nutrition" &&  <NutritionTracker />}

    </div>
  );
};
