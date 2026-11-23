import { supabase } from '@/lib/supabase';
import { SupportedLanguage } from '@/types/database';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface AskL7ajResult {
  success: boolean;
  reply: string;
  rateLimited?: boolean;
  retryAfter?: number;
  error?: string;
}

/**
 * Sends a visitor query to the server-side L7aj AI concierge Edge Function.
 * Protects GEMINI_API_KEY by keeping it exclusively in the Edge Function environment.
 */
export async function askL7aj(
  query: string,
  lang: SupportedLanguage,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>
): Promise<AskL7ajResult> {
  try {
    const { data, error } = await supabase.functions.invoke('l7aj-chat', {
      body: {
        query: query.trim().slice(0, 400),
        lang,
        conversationHistory: conversationHistory?.slice(-6),
      },
    });

    if (error) {
      // Check for HTTP 429 rate limit error
      const status = (error as any)?.context?.status || (error as any)?.status;
      if (status === 429 || error.message?.includes('429') || error.message?.includes('rate_limit')) {
        return {
          success: false,
          reply: '',
          rateLimited: true,
          retryAfter: 60,
          error: 'Rate limit exceeded',
        };
      }

      console.warn('Edge Function invoke returned error, providing grounded fallback:', error.message);
      return getGroundedFallbackReply(query, lang);
    }

    if (data?.error === 'rate_limit_exceeded') {
      return {
        success: false,
        reply: '',
        rateLimited: true,
        retryAfter: data.retry_after || 60,
        error: data.message || 'Rate limit exceeded',
      };
    }

    if (data?.reply) {
      return {
        success: true,
        reply: data.reply,
      };
    }

    return getGroundedFallbackReply(query, lang);
  } catch (err: any) {
    console.warn('Edge function invoke exception, providing fallback guidance:', err);
    return getGroundedFallbackReply(query, lang);
  }
}

function getGroundedFallbackReply(query: string, lang: SupportedLanguage): AskL7ajResult {
  const q = query.toLowerCase();

  if (q.includes('kite') || q.includes('glisse') || q.includes('wind') || q.includes('كايت')) {
    const reply = lang === 'ar'
      ? 'بحيرة الداخلة ونقطة PK25 هما من أشهر بقاع العالم لممارسة رياضة الكايت سيرف، برياح ثابتة على مدار أكثر من 300 يوم سنوياً ومياه دافئة وضحلة مثالية للمبتدئين والمحترفين.'
      : lang === 'en'
      ? 'The Dakhla lagoon and the PK25 spot are globally acclaimed for kitesurfing and wingfoil, offering steady trade winds over 300 days a year and flat, shallow waters suitable for all skill levels.'
      : 'La lagune de Dakhla et le spot du PK25 sont mondialement réputés pour le kitesurf et le wingfoil, avec des alizés constants plus de 300 jours par an et un plan d\'eau calme et sécurisé.';
    return { success: true, reply };
  }

  if (q.includes('port') || q.includes('projet') || q.includes('ميناء') || q.includes('مشروع')) {
    const reply = lang === 'ar'
      ? 'مشروع ميناء الداخلة الأطلسي هو مشروع استراتيجي ملكي ضخم يقع شمال المدينة، وهو حالياً قيد الإنجاز بهدف تعزيز الربط البحري للمملكة المغربية مع عمقها الإفريقي والدولي.'
      : lang === 'en'
      ? 'The Dakhla Atlantic Port is a landmark strategic infrastructure project currently under construction north of the city, designed to enhance maritime connectivity between Morocco and international routes.'
      : 'Le Port Dakhla Atlantique est un mégaprojet stratégique actuellement en cours de réalisation au nord de Dakhla, destiné à renforcer la connectivité maritime atlantique et le rayonnement régional.';
    return { success: true, reply };
  }

  if (q.includes('dune') || q.includes('blanche') || q.includes('كثبان') || q.includes('بيضاء')) {
    const reply = lang === 'ar'
      ? 'الكثبان البيضاء (La Dune Blanche) هي ظاهرة طبيعية ساحرة حيث تلتقي الرمال الصحراوية البيضاء بمياه البحيرة الفيروزية، وتعتبر ملاذاً لطيور النحام الوردي ووجهة مفضلة لرحلات السفاري.'
      : lang === 'en'
      ? 'The White Dune (La Dune Blanche) is an iconic natural spectacle where pure desert sands slope directly into the turquoise lagoon, serving as a sanctuary for flamingos and safari excursions.'
      : 'La Dune Blanche est une merveille géologique unique où une haute dune de sable blanc immaculé plonge directement dans la lagune turquoise, abritant souvent des flamants roses.';
    return { success: true, reply };
  }

  const defaultReply = lang === 'ar'
    ? 'مرحباً بك في الداخلة! أنا الحاج، مستشارك السياحي. يسعدني إرشادك لأفضل المخيمات على البحيرة، ومطاعم المأكولات البحرية، والمواقع الطبيعية العذراء في لؤلؤة الصحراء المغربية.'
    : lang === 'en'
    ? 'Welcome to Dakhla! I am L7aj, your local travel concierge. I am here to assist you with the finest lagoon camps, fresh seafood dining, and pristine Saharan landscapes.'
    : 'Marhaban bikoum à Dakhla ! Je suis L7aj, votre concierge local. Je suis à votre service pour vous orienter vers les meilleurs camps éco-responsables, dégustations d\'huîtres et trésors de la lagune.';

  return { success: true, reply: defaultReply };
}
