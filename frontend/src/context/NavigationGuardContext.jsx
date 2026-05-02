import React, { createContext, useContext, useState, useCallback } from "react";

const NavigationGuardContext = createContext({
  isDirty: false,
  setIsDirty: () => {},
});

export const NavigationGuardProvider = ({ children }) => {
  const [isDirty, setIsDirtyState] = useState(false);

  const setIsDirty = useCallback((val) => {
    setIsDirtyState(val);
  }, []);

  return (
    <NavigationGuardContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </NavigationGuardContext.Provider>
  );
};

export const useNavigationGuard = () => useContext(NavigationGuardContext);
