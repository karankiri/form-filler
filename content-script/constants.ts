// Profile schema. Keys are the stored profile fields (and the onboarding form
// fields); values are aliases matched against each form field's descriptor.
export const FieldIds = {
  firstName: ["first_name", "firstname", "first name", "given name", "given_name", "forename"],
  lastName: ["last_name", "lastname", "last name", "surname", "family name", "family_name"],
  email: ["email", "e-mail"],
  phone: ["phone", "mobile", "telephone", "tel"],
  linkedIn: ["linkedin"],
  github: ["github"],
  website: ["portfolio", "personal website", "personal site", "website", "homepage", "url"],
  twitter: ["twitter", "x.com"],
  company: ["current company", "current employer", "employer", "organization", "organisation", "company", "org"],
};

export type ProfileKey = keyof typeof FieldIds;
export type ProfileData = Partial<Record<ProfileKey, string>>;

// HTML autocomplete tokens map directly to profile keys when present.
const AUTOCOMPLETE_MAP: Record<string, ProfileKey | "fullName"> = {
  "given-name": "firstName",
  "family-name": "lastName",
  name: "fullName",
  email: "email",
  tel: "phone",
  "tel-national": "phone",
  organization: "company",
  url: "website",
};

const FULL_NAME_ALIASES = ["full name", "full_name", "fullname", "your name", "legal name"];

// Aliases that commonly appear in field labels but must not match a key.
const NEGATIVE: Partial<Record<ProfileKey, string[]>> = {
  phone: ["phone type", "country code", "extension"],
  website: ["linkedin", "github", "twitter", "x.com", "company website", "employer website"],
  company: ["company website", "company url", "company size"],
  email: ["confirm email", "verify email", "re-enter email", "email again"],
};

const INPUT_TYPES = new Set(["text", "email", "tel", "url", "search", ""]);

export type FillableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface FieldDescriptor {
  element: FillableElement;
  autocomplete: string;
  /** Normalized text from name, id, placeholder, aria-label, labels, etc. */
  text: string;
}

export interface FillResult {
  filled: number;
  candidates: number;
}

const normalize = (s: string | null | undefined) =>
  (s || "").toLowerCase().replace(/[\s_\-\[\]().:*]+/g, " ").trim();

const isVisible = (el: HTMLElement) => {
  if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return el.getClientRects().length > 0;
};

const isFillable = (el: Element): el is FillableElement => {
  if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly;
  if (el instanceof HTMLSelectElement) return !el.disabled;
  if (el instanceof HTMLInputElement) {
    return INPUT_TYPES.has(el.type) && !el.disabled && !el.readOnly;
  }
  return false;
};

const labelTextFor = (el: FillableElement): string[] => {
  const parts: string[] = [];
  el.labels?.forEach((l) => parts.push(l.textContent || ""));
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    labelledBy.split(/\s+/).forEach((id) => {
      const node = document.getElementById(id);
      if (node) parts.push(node.textContent || "");
    });
  }
  const describedBy = el.getAttribute("aria-describedby");
  if (describedBy) {
    describedBy.split(/\s+/).forEach((id) => {
      const node = document.getElementById(id);
      if (node) parts.push(node.textContent || "");
    });
  }
  // Wrapping label or a nearby label-ish element (common in custom form libs).
  const wrapper = el.closest("label");
  if (wrapper) parts.push(wrapper.textContent || "");
  if (!parts.some((p) => p.trim())) {
    // Bare <label> immediately before the field (no `for`, no wrapper).
    const prev = el.previousElementSibling;
    if (prev && /^(LABEL|SPAN|P|DIV)$/.test(prev.tagName) && (prev.textContent || "").trim().length < 80) {
      parts.push(prev.textContent || "");
    }
  }
  if (!parts.some((p) => p.trim())) {
    const container = el.closest("div, li, fieldset, section");
    const nearby = container?.querySelector("label, legend, [class*='label' i], [data-automation-id*='label' i]");
    if (nearby) parts.push(nearby.textContent || "");
  }
  return parts;
};

export const describeField = (el: FillableElement): FieldDescriptor => {
  const bits = [
    el.getAttribute("name"),
    el.id,
    el.getAttribute("placeholder"),
    el.getAttribute("aria-label"),
    el.getAttribute("data-automation-id"), // Workday
    el.getAttribute("data-qa"),
    el.getAttribute("title"),
    ...labelTextFor(el),
  ];
  return {
    element: el,
    autocomplete: (el.getAttribute("autocomplete") || "").toLowerCase().trim(),
    text: bits.map(normalize).filter(Boolean).join(" | "),
  };
};

export const collectFields = (root: ParentNode = document): FieldDescriptor[] => {
  const out: FieldDescriptor[] = [];
  root.querySelectorAll("input, textarea, select").forEach((el) => {
    if (isFillable(el) && isVisible(el)) out.push(describeField(el));
  });
  // Same-origin iframes (e.g. embedded Greenhouse boards).
  root.querySelectorAll("iframe").forEach((frame) => {
    try {
      const doc = (frame as HTMLIFrameElement).contentDocument;
      if (doc) out.push(...collectFields(doc));
    } catch {
      /* cross-origin, skip */
    }
  });
  return out;
};

const containsAlias = (text: string, alias: string) => {
  const a = normalize(alias);
  if (!a) return false;
  // Whole-word match so "org" does not hit "george" and "tel" does not hit "hotel".
  const re = new RegExp(`(^|[^a-z0-9])${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
  return re.test(text);
};

/** Decide which profile key (or fullName) a field maps to, if any. */
export const classifyField = (field: FieldDescriptor): ProfileKey | "fullName" | null => {
  const auto = field.autocomplete.split(/\s+/).pop() || "";
  if (AUTOCOMPLETE_MAP[auto]) return AUTOCOMPLETE_MAP[auto];

  const { text } = field;
  if (FULL_NAME_ALIASES.some((a) => containsAlias(text, a))) return "fullName";

  // First and last name must be checked before the generic "name" fallback.
  const ordered: ProfileKey[] = ["firstName", "lastName", "email", "phone", "linkedIn", "github", "twitter", "website", "company"];
  for (const key of ordered) {
    if (NEGATIVE[key]?.some((n) => containsAlias(text, n))) continue;
    if (FieldIds[key].some((a) => containsAlias(text, a))) return key;
  }

  // Bare "name" field with nothing more specific.
  const firstBit = text.split(" | ")[0];
  if (firstBit === "name") return "fullName";
  return null;
};

// React (and other frameworks) track the input value through the prototype
// setter; assigning el.value directly is swallowed. Use the native setter and
// fire the events frameworks listen to.
const setNativeValue = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  el.focus();
  if (setter) setter.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
};

const setSelectValue = (el: HTMLSelectElement, value: string): boolean => {
  const want = normalize(value);
  if (!want) return false;
  const options = Array.from(el.options);
  const match =
    options.find((o) => normalize(o.value) === want || normalize(o.text) === want) ||
    options.find((o) => normalize(o.text).includes(want) || want.includes(normalize(o.text)));
  if (!match) return false;
  el.value = match.value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
};

const valueFor = (key: ProfileKey | "fullName", data: ProfileData): string => {
  if (key === "fullName") return [data.firstName, data.lastName].filter(Boolean).join(" ");
  return data[key] || "";
};

/**
 * Fill every recognised field on the page from the stored profile.
 * Leaves fields the user already typed into alone unless `overwrite` is set.
 */
export const formFiller = (
  fields: FieldDescriptor[] | ArrayLike<Element>,
  data: ProfileData,
  { overwrite = false } = {}
): FillResult => {
  const descriptors: FieldDescriptor[] =
    fields.length && !("element" in (fields as any)[0])
      ? Array.from(fields as ArrayLike<Element>).filter(isFillable).map(describeField)
      : (fields as FieldDescriptor[]);

  let filled = 0;
  for (const field of descriptors) {
    const key = classifyField(field);
    if (!key) continue;
    const value = valueFor(key, data).trim();
    if (!value) continue;

    const el = field.element;
    if (el instanceof HTMLSelectElement) {
      if (setSelectValue(el, value)) filled++;
      continue;
    }
    if (!overwrite && el.value.trim()) continue;
    setNativeValue(el, value);
    filled++;
  }
  return { filled, candidates: descriptors.length };
};
