import { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { ScrapingError } from "./errors";

interface Selector {
    selector: string,
    $: CheerioAPI
}

interface Attribute {
    attribute: string,
    $: CheerioAPI
}

interface Element {
    element: Cheerio<AnyNode>,
    $: CheerioAPI
}

interface Template {
    content: string,
    template: string[]
}

/* extractors */

export function getOnlyElement({ selector, $ }: Selector) {
    const elements = $(selector);
    if (elements.length === 0) {
        throw ScrapingError.NoElement(`No element found for selector "${selector}"`);
    }
    if (elements.length > 1) {
        throw ScrapingError.MultipleElements(`Multiple elements found for selector "${selector}"`);
    }
    return elements.first();
}

export function getOnlyElementAttribute({ selector, attribute, $ }: Selector & Attribute) {
    const element = getOnlyElement({selector, $});
    const result = element.attr(attribute);
    if (!result) {
        throw ScrapingError.NoAttribute(`No "${attribute}" attribute on element with selector "${selector}"`);
    }
    return result;
}

export function getFirstElement({ selector, $ }: Selector) {
    const elements = $(selector);
    if (elements.length === 0) {
        throw ScrapingError.NoElement('No element found');
    }
    return elements.first();
}

export function getLastElement({ selector, $ }: Selector) {
    const elements = $(selector);
    if (elements.length === 0) {
        throw ScrapingError.NoElement('No element found');
    }
    return elements.last();
}

export function getFirstElementText({ selector, $ }: Selector) {
    return getFirstElement({selector, $}).text();
}

export function getLastElementText({ selector, $ }: Selector) {
    return getLastElement({selector, $}).text();
}

export function getFirstChildren({ selector, element, $ }: Selector & Element) {
    const elements = element.children(selector);
    if (elements.length === 0) {
        throw ScrapingError.NoElement(`No children with selector "${selector}" found for node "${$.html(element)}"`);
    }
    return element.first();
}

export function getFirstChildrenText(input: Selector & Element) {
    return getFirstChildren(input).text()
}

export function template(strings: TemplateStringsArray, ...groups: string[]): string[] {
    const result = [];
    for (let i=0; i<groups.length; i++) {
        result.push(strings[i]);
        result.push(groups[i]);
    }
    result.push(strings[strings.length - 1]);
    return result;
  }

export function getValuesUsingTemplate({ content, template }: Template) {
    if (template.length % 2 == 0) {
        throw ScrapingError.InvalidTemplate('Incorrect count of parts, cannot create regex');
    }
    const regexContent = template.map((value, idx) => idx % 2 == 0 ? value : `(?<${value}>.*?)`).join('');
    const regex = new RegExp(regexContent);
    const match = content.match(regex);
    if (!match || !match.groups) {
        throw ScrapingError.NoTemplateMatchFound(`Cannot match content "${getFirst50Characters(content)}", with template "${getFirst50Characters(regexContent)}"`)
    }
    return match.groups;
}

/* converters */

export function numberFromDigits(value: string) {
    const onlyDigits = value.replace(/\D/g, '');
    if (onlyDigits.length === 0) {
        throw ScrapingError.NoDigits('Value without digits');
    }
    return Number(onlyDigits);
}

export function noWhiteSpace(value: string) {
    return value.replace(/\s+/g, '');
}

/* internal utils */

function getFirst50Characters(str: any) {
    return String(str).length <= 50 ? str : (String(str).substring(0, 50) + '...');
} 
