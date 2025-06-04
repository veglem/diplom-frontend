import { createContext, useContext, useState } from "react";
import { translations } from "../utils/translate";

interface LanguageContextType {
    lang: { [key: string]: string };
    langCode: string;
    setLang: (code: string) => void;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [langCode, setLangCode] = useState<string>(localStorage.getItem("lang") ?? "ru")
    const lang = translations[langCode]

    const setLang = (code: string) => {
        localStorage.setItem("lang", code);
        setLangCode(code);
    }

    return <LanguageContext.Provider value={{lang, setLang, langCode}}>
        {children}
    </LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};