import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { messages } from "./languages";

i18next.use(LanguageDetector).init({
	debug: false,
	defaultNS: "translations",
	fallbackLng: "en",
	ns: ["translations"],
	resources: messages,
})

let i18n = {
	...i18next,
	t: (code: string) => {
		return i18next.t(code) as any // fix for react 18 TODO
	}
};

export { i18n };
