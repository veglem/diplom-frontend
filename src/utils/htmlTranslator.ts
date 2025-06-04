import { translationService } from "./translate";
import { parse, HTMLElement } from 'node-html-parser';

class HtmlTranslator {


  /**
   * Извлекает все текстовые узлы из HTML элемента
   */
  private extractTextNodes(element: HTMLElement): Array<{ node: any, text: string }> {
    const textNodes: Array<{ node: any, text: string }> = [];

    const traverse = (node: any) => {
      if (node.nodeType === 3) { // TEXT_NODE
        const text = node.textContent;
        if (text) {
          textNodes.push({ node, text });
        }
      } else if (node.childNodes) {
        for (const child of node.childNodes) {
          traverse(child);
        }
      }
    };

    traverse(element);
    return textNodes;
  }

  /**
   * Переводит HTML разметку, сохраняя структуру
   */
  async translateHtml(html: string, targetLang: string): Promise<string> {
    // Парсим HTML
    const root = parse(html, {
      lowerCaseTagName: false,
      comment: true,
      blockTextElements: {
        script: true,
        noscript: true,
        style: true,
        pre: true
      }
    });

    // Извлекаем все текстовые узлы
    const textNodes = this.extractTextNodes(root);
    
    if (textNodes.length === 0) {
      return html;
    }

    // Собираем тексты для перевода
    const textsToTranslate = textNodes.map(item => item.text);

    try {
      // Переводим все тексты одним запросом
      const translations = await translationService.autoTranslate(
        targetLang, 
        ...textsToTranslate
      );

      // Заменяем тексты в узлах на переведенные
      textNodes.forEach((item, index) => {
        item.node.textContent = translations[index];
      });

      // Возвращаем модифицированный HTML
      return root.toString();
    } catch (error) {
      console.error('Error translating HTML:', error);
      throw error;
    }
  }

  /**
   * Переводит HTML с поддержкой атрибутов (например, alt, title)
   */
  async translateHtmlWithAttributes(
    html: string, 
    targetLang: string, 
    translateAttributes: string[] = ['alt', 'title', 'placeholder']
  ): Promise<string> {
    const root = parse(html, {
      lowerCaseTagName: false,
      comment: true,
      blockTextElements: {
        script: true,
        noscript: true,
        style: true,
        pre: true
      }
    });

    const textsToTranslate: string[] = [];
    const translationMap: Array<{ type: 'text' | 'attribute', node: any, attribute?: string }> = [];

    // Извлекаем текстовые узлы
    const textNodes = this.extractTextNodes(root);
    textNodes.forEach(item => {
      textsToTranslate.push(item.text);
      translationMap.push({ type: 'text', node: item.node });
    });

    // Извлекаем атрибуты для перевода
    const elements = root.querySelectorAll('*');
    elements.forEach(element => {
      translateAttributes.forEach(attr => {
        const value = element.getAttribute(attr);
        if (value) {
          textsToTranslate.push(value);
          translationMap.push({ type: 'attribute', node: element, attribute: attr });
        }
      });
    });

    if (textsToTranslate.length === 0) {
      return html;
    }

    try {
      // Переводим все тексты
      const translations = await translationService.autoTranslate(
        targetLang,
        ...textsToTranslate
      );

      // Применяем переводы
      translationMap.forEach((item, index) => {
        if (item.type === 'text') {
          item.node.textContent = translations[index];
        } else if (item.type === 'attribute' && item.attribute) {
          item.node.setAttribute(item.attribute, translations[index]);
        }
      });

      return root.toString();
    } catch (error) {
      console.error('Error translating HTML with attributes:', error);
      throw error;
    }
  }
}

export const htmlTranslator = new HtmlTranslator();