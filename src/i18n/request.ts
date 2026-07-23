import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
 
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value;

  if (!locale || !['en', 'ar'].includes(locale)) {
    locale = 'en';
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
