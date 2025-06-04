import { mutexManager } from "./mutexUtil";
import { translateTable } from "./translateTable";


export const translations: { [code: string]: { [key: string]: string } } = translateTable

interface Translation {
  text: string;
  detectedLanguageCode: string;
}

interface TranslateResponse {
  translations: Translation[];
}


class TranslationService {
  private cache: Map<string, string> = new Map();
  private readonly API_KEY = ''; // Замените на ваш API ключ
  private readonly FOLDER_ID = ''; // Замените на ваш идентификатор каталога
  private readonly API_URL = '/translate/v2/translate';

  /**
   * Создает ключ для кэша на основе языка и текста
   */
  private getCacheKey(targetLang: string, text: string): string {
    return `${targetLang}:${text}`;
  }

  /**
   * Выполняет API запрос для перевода текстов
   */
  private async performTranslation(targetLang: string, texts: string[]): Promise<TranslateResponse> {
    const requestBody = {
      folderId: this.FOLDER_ID,
      texts: texts,
      targetLanguageCode: targetLang
    };

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${this.API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Переводит тексты на указанный язык с использованием кэша
   */
  async translate(targetLang: string, ...values: string[]): Promise<string[]> {
    const results: string[] = [];
    const textsToTranslate: string[] = [];
    const indicesToTranslate: number[] = [];

    // Проверяем кэш для каждого значения
    for (let i = 0; i < values.length; i++) {
      const cacheKey = this.getCacheKey(targetLang, values[i]);
      const cachedTranslation = this.cache.get(cacheKey);

      if (cachedTranslation !== undefined) {
        console.log("found in cache")
        results[i] = cachedTranslation;
      } else {
        textsToTranslate.push(values[i]);
        indicesToTranslate.push(i);
      }
    }

    // Если все найдено в кэше, возвращаем результат
    if (textsToTranslate.length === 0) {
      return results;
    }

    try {
      // Переводим только те тексты, которых нет в кэше
      const response = await this.performTranslation(targetLang, textsToTranslate);

      // Сохраняем переводы в кэш и формируем результат
      for (let i = 0; i < response.translations.length; i++) {
        const translation = response.translations[i];
        const originalIndex = indicesToTranslate[i];
        const originalText = textsToTranslate[i];

        // Сохраняем в кэш
        const cacheKey = this.getCacheKey(targetLang, originalText);
        this.cache.set(cacheKey, translation.text);

        // Добавляем в результат
        results[originalIndex] = translation.text;
      }

      return results;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Очищает кэш переводов
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Возвращает размер кэша
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Удаляет конкретный перевод из кэша
   */
  removeCacheEntry(targetLang: string, text: string): boolean {
    const cacheKey = this.getCacheKey(targetLang, text);
    return this.cache.delete(cacheKey);
  }
}



interface DetectLanguageRequest {
  text: string;
  languageCodeHints?: string[];
}

interface DetectLanguageResponse {
  languageCode: string;
}

interface DetectCacheEntry {
  languageCode: string;
  timestamp: number;
}

class LanguageDetectionService {
  private cache: Map<string, DetectCacheEntry> = new Map();
  private readonly API_KEY = ''; // Замените на ваш API ключ
  private readonly API_URL = '/translate/v2/detect';
  private readonly CACHE_TTL = 3600000; // 1 час в миллисекундах
  private readonly MAX_CACHE_SIZE = 1000; // Максимальное количество записей в кэше

  /**
   * Создает ключ для кэша на основе текста и подсказок языка
   */
  private getCacheKey(text: string, languageCodeHints?: string[]): string {
    const hintsKey = languageCodeHints ? languageCodeHints.sort().join(',') : '';
    // Используем только первые 100 символов текста для ключа, чтобы избежать слишком длинных ключей
    const truncatedText = text.substring(0, 100);
    return `${truncatedText}:${hintsKey}`;
  }

  /**
   * Проверяет, не истек ли срок действия записи в кэше
   */
  private isEntryExpired(entry: DetectCacheEntry): boolean {
    return Date.now() - entry.timestamp > this.CACHE_TTL;
  }

  /**
   * Получает язык из кэша, если он там есть и не устарел
   */
  private getCachedLanguage(text: string, languageCodeHints?: string[]): string | null {
    const cacheKey = this.getCacheKey(text, languageCodeHints);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    if (this.isEntryExpired(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.languageCode;
  }

  /**
   * Сохраняет определенный язык в кэш
   */
  private setCachedLanguage(text: string, languageCode: string, languageCodeHints?: string[]): void {
    // Проверяем размер кэша
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Удаляем самую старую запись
      let oldestKey: string | null = null;
      let oldestTimestamp = Date.now();

      for (const [key, entry] of this.cache.entries()) {
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const cacheKey = this.getCacheKey(text, languageCodeHints);
    this.cache.set(cacheKey, {
      languageCode,
      timestamp: Date.now()
    });
  }

  /**
   * Выполняет API запрос для определения языка
   */
  private async performDetection(text: string, languageCodeHints?: string[]): Promise<DetectLanguageResponse> {
    const requestBody: DetectLanguageRequest = {
      text: text.substring(0, 100)
    };

    if (languageCodeHints && languageCodeHints.length > 0) {
      requestBody.languageCodeHints = languageCodeHints;
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${this.API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Определяет язык текста
   */
  async detectLanguage(text: string, languageCodeHints?: string[]): Promise<string> {
    // Проверяем кэш
    const cachedLanguage = this.getCachedLanguage(text, languageCodeHints);
    if (cachedLanguage !== null) {
      return cachedLanguage;
    }

    try {
      // Выполняем запрос к API
      const response = await this.performDetection(text, languageCodeHints);
      
      // Сохраняем в кэш
      this.setCachedLanguage(text, response.languageCode, languageCodeHints);
      
      return response.languageCode;
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  /**
   * Определяет языки для нескольких текстов
   * Возвращает массив языковых кодов в том же порядке, что и входные тексты
   */
  async detectLanguages(texts: string[], languageCodeHints?: string[]): Promise<string[]> {
    const results: string[] = [];
    const textsToDetect: string[] = [];
    const indicesToDetect: number[] = [];

    // Проверяем кэш для каждого текста
    for (let i = 0; i < texts.length; i++) {
      const cachedLanguage = this.getCachedLanguage(texts[i], languageCodeHints);
      
      if (cachedLanguage !== null) {
        results[i] = cachedLanguage;
      } else {
        textsToDetect.push(texts[i]);
        indicesToDetect.push(i);
      }
    }

    // Если все найдено в кэше, возвращаем результат
    if (textsToDetect.length === 0) {
      return results;
    }

    // Для оставшихся текстов делаем запросы к API
    // К сожалению, API не поддерживает batch-запросы, поэтому делаем параллельные запросы
    try {
      const detectionPromises = textsToDetect.map(text => 
        this.performDetection(text, languageCodeHints)
      );
      
      const detectionResults = await Promise.all(detectionPromises);

      // Сохраняем результаты в кэш и формируем финальный массив
      for (let i = 0; i < detectionResults.length; i++) {
        const languageCode = detectionResults[i].languageCode;
        const originalIndex = indicesToDetect[i];
        const originalText = textsToDetect[i];

        // Сохраняем в кэш
        this.setCachedLanguage(originalText, languageCode, languageCodeHints);

        // Добавляем в результат
        results[originalIndex] = languageCode;
      }

      return results;
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  /**
   * Очищает весь кэш
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Возвращает текущий размер кэша
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Удаляет конкретную запись из кэша
   */
  removeCacheEntry(text: string, languageCodeHints?: string[]): boolean {
    const cacheKey = this.getCacheKey(text, languageCodeHints);
    return this.cache.delete(cacheKey);
  }

  /**
   * Очищает устаревшие записи из кэша
   */
  cleanExpiredEntries(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isEntryExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Возвращает статистику кэша
   */
  getCacheStats(): { size: number; oldestEntry: number | null; newestEntry: number | null } {
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;

    for (const entry of this.cache.values()) {
      if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      if (newestTimestamp === null || entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp
    };
  }
}

// Пример интеграции с TranslationService
class SmartTranslationService extends TranslationService {
  private languageDetector: LanguageDetectionService;

  constructor() {
    super();
    this.languageDetector = new LanguageDetectionService();
  }

  /**
   * Переводит текст с автоматическим определением исходного языка
   */
  async autoTranslate(targetLang: string, ...texts: string[]): Promise<string[]> {
    return mutexManager.runWithMutex('autoTranslate', [targetLang, ...texts], async () => {
        // Определяем языки всех текстов
    const sourceLanguages = await this.languageDetector.detectLanguages(texts);
    
    let nativeLangSymbolsCount = 0;
    let forignLangSymbolsCount = 0;

    // Группируем тексты по исходному языку
    const textsByLanguage = new Map<string, { text: string; index: number }[]>();
    
    texts.forEach((text, index) => {
      const lang = sourceLanguages[index];
      if (!textsByLanguage.has(lang)) {
        textsByLanguage.set(lang, []);
      }
      textsByLanguage.get(lang)!.push({ text, index });
    });

    textsByLanguage.forEach((txt, key) => {
        if (key == targetLang) {
            txt.forEach(val => {
                nativeLangSymbolsCount += val.text.length
            })
        } else {
            txt.forEach(val => {
                forignLangSymbolsCount += val.text.length
            })
        }
    })

    if (nativeLangSymbolsCount > forignLangSymbolsCount) {
        return texts
    }

    // Результирующий массив
    const results: string[] = new Array(texts.length);

    // Переводим тексты, сгруппированные по языку
    for (const [sourceLang, items] of textsByLanguage.entries()) {
      // Не переводим, если исходный язык совпадает с целевым
      if (sourceLang === targetLang) {
        items.forEach(item => {
          results[item.index] = item.text;
        });
        continue;
      }

      // Переводим группу текстов
      const textsToTranslate = items.map(item => item.text);
      const translations = await this.translate(targetLang, ...textsToTranslate);
      
      // Размещаем переводы в правильных позициях
      items.forEach((item, i) => {
        results[item.index] = translations[i];
      });
    }

    return results;
    })
  }
}

export const translationService = new SmartTranslationService()