import { useState, useEffect } from "react";

export type PhonePosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export const usePhonePosition = () => {
  const [position, setPosition] = useState<PhonePosition>("bottom-right");

  useEffect(() => {
    const savedPosition = localStorage.getItem("phone-position") as PhonePosition;
    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

  const changePosition = (newPosition: PhonePosition) => {
    setPosition(newPosition);
    localStorage.setItem("phone-position", newPosition);
  };

  return { position, changePosition };
};