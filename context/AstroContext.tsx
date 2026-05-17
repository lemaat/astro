"use client";
import React, { createContext, useContext, useState } from "react";

export type Language = "fr" | "ar";
export type Difficulty = "easy" | "medium" | "hard";

export interface ChildProfile {
  name: string;
  age: number;
  parentEmail: string;
  difficulty: Difficulty;
  language: Language;
  passions: string[];
}

export interface ActivityScore {
  activity: "drawing" | "logic" | "storytelling";
  ability: number;
  engagement: number;
  feedback: string;
  completed: boolean;
}

interface AstroContextType {
  profile: ChildProfile;
  scores: ActivityScore[];
  setProfile: (p: Partial<ChildProfile>) => void;
  setLanguage: (lang: Language) => void;
  setPassions: (passions: string[]) => void;
  completeActivity: (id: "drawing" | "logic" | "storytelling", ability: number, engagement: number, feedback: string) => void;
}

const AstroContext = createContext<AstroContextType | undefined>(undefined);

export const AstroProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfileState] = useState<ChildProfile>({
    name: "Explorer",
    age: 7,
    parentEmail: "",
    difficulty: "easy",
    language: "fr",
    passions: [],
  });

  const [scores, setScores] = useState<ActivityScore[]>([
    { activity: "drawing", ability: 0, engagement: 0, feedback: "", completed: false },
    { activity: "logic", ability: 0, engagement: 0, feedback: "", completed: false },
    { activity: "storytelling", ability: 0, engagement: 0, feedback: "", completed: false },
  ]);

  const setProfile = (p: Partial<ChildProfile>) => {
    setProfileState(prev => {
      const updated = { ...prev, ...p };
      // Auto-set difficulty from age
      if (p.age !== undefined) {
        if (p.age <= 7) updated.difficulty = "easy";
        else if (p.age <= 10) updated.difficulty = "medium";
        else updated.difficulty = "hard";
      }
      return updated;
    });
  };

  const setLanguage = (language: Language) => setProfileState(prev => ({ ...prev, language }));
  const setPassions = (passions: string[]) => setProfileState(prev => ({ ...prev, passions }));

  const completeActivity = (id: string, ability: number, engagement: number, feedback: string) => {
    setScores(prev => prev.map(s =>
      s.activity === id ? { ...s, ability, engagement, feedback, completed: true } : s
    ));
  };

  // Also expose useProfile alias for the storytelling page
  return (
    <AstroContext.Provider value={{ profile, scores, setProfile, setLanguage, setPassions, completeActivity }}>
      <div dir={profile.language === "ar" ? "rtl" : "ltr"}>{children}</div>
    </AstroContext.Provider>
  );
};

export const useAstro = () => {
  const context = useContext(AstroContext);
  if (!context) throw new Error("useAstro must be used within AstroProvider");
  return context;
};

// Alias for the storytelling page that uses useProfile
export const useProfile = () => {
  const ctx = useAstro();
  return { profile: ctx.profile };
};