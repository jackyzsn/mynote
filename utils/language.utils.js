import { I18n } from 'i18n-js'; // You can import i18n-js as well if you don't want the app to set default locale from the device locale.
import en from '../resources/i18n/locale_en.json';
import zh_CN from '../resources/i18n/locale_zh_CN.json';
import * as RNLocalize from 'react-native-localize';
// import { Platform, NativeModules } from 'react-native';

// const deviceLanguage =
//   Platform.OS === 'ios'
//     ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
//     : NativeModules.I18nManager.localeIdentifier;

const i18n = new I18n({
  zh_CN: zh_CN,
  en: en,
});

const locales = RNLocalize.getLocales();

if (Array.isArray(locales)) {
  i18n.locale = locales[0].languageTag.startsWith('zh_CN') ? 'zh_CN' : 'en';
} else {
  i18n.locale = 'en';
}

i18n.fallbacks = true; // If an english translation is not available in en.js, it will look inside hi.js
i18n.missingBehaviour = 'guess'; // It will convert HOME_noteTitle to "HOME note title" if the value of HOME_noteTitle doesn't exist in any of the translation files.
i18n.defaultLocale = 'en'; // If the current locale in device is not en or hi

export const setLocale = locale => {
  i18n.locale = locale;
};

export const getCurrentLocale = () => i18n.locale; // It will be used to define intial language state in reducer.

/* translateHeaderText:
 screenProps => coming from react-navigation(defined in app.container.js)
 langKey => will be passed from the routes file depending on the screen
*/
export const translateHeaderText =
  langKey =>
  ({ screenProps }) => {
    const title = i18n.translate(langKey, screenProps.language);
    return { title };
  };

export default i18n.translate.bind(i18n);
