import React, { createContext, useContext, ReactNode } from 'react';
import { DeviceInfo, useDeviceDetection } from './deviceDetection';

// Создаем контекст для информации об устройстве
const DeviceContext = createContext<DeviceInfo | null>(null);

// Интерфейс для пропсов провайдера
interface DeviceProviderProps {
  children: ReactNode;
}

/**
 * Провайдер контекста устройства
 * Предоставляет информацию об устройстве всем дочерним компонентам
 */
export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  // Используем хук для отслеживания изменений устройства
  const deviceInfo = useDeviceDetection();
  
  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  );
};

/**
 * Хук для использования информации об устройстве в компонентах
 * @returns {DeviceInfo} Информация об устройстве
 */
export const useDevice = (): DeviceInfo => {
  const context = useContext(DeviceContext);
  
  if (!context) {
    throw new Error('useDevice должен использоваться внутри DeviceProvider');
  }
  
  return context;
};

/**
 * Компонент высшего порядка для условного рендеринга в зависимости от типа устройства
 * @param {ReactNode} DesktopComponent Компонент для десктопа
 * @param {ReactNode} MobileComponent Компонент для мобильных устройств
 * @returns {ReactNode} Компонент в зависимости от типа устройства
 */
export const DeviceRenderer: React.FC<{
  DesktopComponent: React.ComponentType<any>;
  MobileComponent: React.ComponentType<any>;
  [key: string]: any;
}> = ({ DesktopComponent, MobileComponent, ...props }) => {
  const { isMobile } = useDevice();
  
  return isMobile ? <MobileComponent {...props} /> : <DesktopComponent {...props} />;
};
