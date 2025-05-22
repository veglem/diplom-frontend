import React, { useState } from 'react';
import { DeviceProvider, DeviceRenderer } from './utils/DeviceContext';
import DesktopLayout from './layouts/DesktopLayout';
import MobileLayout from './layouts/MobileLayout';
import HomePage from './pages/HomePage';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import themes from './theme';
import { BrowserRouter, Route, Routes, useOutletContext } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import UserSettingsPage from './pages/UserSettingsPage';
import { UserSettingsTabProps } from './components/UserSettings/UserSettingsTab';
import { CustomizationSettings, NotificationSettings, ProfileSettings } from './components/UserSettings';
import WriterProfilePage from './pages/WriterProfilePage';

export const ThemePaletteModeContext = React.createContext({
  setThemeMode: (mode: string) => { }
});

/**
 * Главный компонент приложения
 * Использует DeviceProvider для определения устройства
 * и DeviceRenderer для рендеринга соответствующего макета
 */
const App: React.FC = () => {
  const [themeColor, setTheme] = useState(localStorage.getItem("theme") ?? "lb")

  const themePaletteModeContextProvider = React.useMemo(
    () => ({
      setThemeMode: (mode: string) => {
        localStorage.setItem("theme", mode)
        setTheme(mode)
      }
    }),
    []
  );

  const themeProvider = React.useMemo(
    () =>
      {
        console.log("Theme color changed")
        if (themeColor == 'lb') {
          return themes.lb
        } else {
          return themes.db
        }
      },
    [themeColor]
  );

  (document.getElementsByTagName('body')[0] as HTMLBodyElement).style.backgroundColor = themeProvider.palette.background.default

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemePaletteModeContext.Provider value={themePaletteModeContextProvider}>
        <ThemeProvider theme={themeProvider}>
          <DeviceProvider>
            <DeviceRenderer
              DesktopComponent={({ children }) => (
                <DesktopLayout title="Адаптивный интерфейс - Десктоп">
                  {children}
                </DesktopLayout>
              )}
              MobileComponent={({ children }) => (
                <MobileLayout title="Адаптивный интерфейс - Мобильный">
                  {children}
                </MobileLayout>
              )}
            >
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='subscribtions' element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path='writer-profile' element={
                  <ProtectedRoute>
                    <WriterProfilePage />
                  </ProtectedRoute>
                } />
                <Route path='/author/:author_id' element={
                  <ProtectedRoute>
                    <WriterProfilePage />
                  </ProtectedRoute>
                } />
                <Route path='settings' element={
                  <ProtectedRoute>
                    <UserSettingsPage />
                  </ProtectedRoute>
                }>
                  <Route path='profile' element={
                    React.createElement(
                      () => {
                        const context = useOutletContext() as UserSettingsTabProps;
                        return (
                          <>
                            <ProfileSettings 
                              onChangePassword={context.onChangePassword}
                              onUpdateAvatar={context.onUpdateAvatar}
                              onUpdateProfile={context.onUpdateProfile}
                              userData={context.userData}
                            />
                          </>
                        )
                      }
                    )
                  } />
                  <Route path='notifications' element={
                    React.createElement(
                      () => {
                        const context = useOutletContext() as UserSettingsTabProps;
                        return <>
                          <NotificationSettings 
                            userData={context.userData}
                            onUpdateProfile={context.onUpdateProfile}
                          />
                        </>
                      }
                    )
                  } />
                  <Route path='customization' element={
                    React.createElement(
                      () => {
                        const context = useOutletContext() as UserSettingsTabProps;
                        return <>
                          <CustomizationSettings 
                          
                          />
                        </>
                      }
                    )
                  } />
                </Route>
              </Routes>
            </DeviceRenderer>
          </DeviceProvider>
        </ThemeProvider>
        </ThemePaletteModeContext.Provider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
