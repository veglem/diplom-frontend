import React from 'react';

/**
 * Утилита для определения типа устройства пользователя
 */

// Типы устройств
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

// Интерфейс для результата определения устройства
export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

// Пороговое значение ширины для определения мобильного устройства (в пикселях)
const MOBILE_BREAKPOINT = 768;

/**
 * Определяет тип устройства на основе User Agent и размера экрана
 * @returns {DeviceInfo} Информация об устройстве
 */
export const detectDevice = (): DeviceInfo => {
  // Получаем размеры окна
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Для тестирования мобильного интерфейса
  // Раскомментируйте следующую строку, чтобы всегда возвращать мобильное устройство
  // return { type: DeviceType.MOBILE, isMobile: true, isDesktop: false, width, height };
  
  // Проверяем User Agent на наличие мобильных ключевых слов
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 
    'opera mini', 'mobile', 'tablet'
  ];
  
  // Проверяем, содержит ли User Agent мобильные ключевые слова
  const hasMobileKeywords = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // Определяем тип устройства на основе ширины экрана и User Agent
  const isMobile = width < MOBILE_BREAKPOINT || hasMobileKeywords;
  const type = isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;
  
  return {
    type,
    isMobile,
    isDesktop: !isMobile,
    width,
    height,
  };
};

/**
 * Хук для отслеживания изменений размера окна и определения типа устройства
 * @returns {DeviceInfo} Информация об устройстве
 */
export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(detectDevice());
  
  React.useEffect(() => {
    // Функция для обновления информации об устройстве при изменении размера окна
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };
    
    // Добавляем слушатель события изменения размера окна
    window.addEventListener('resize', handleResize);
    
    // Удаляем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return deviceInfo;
};
