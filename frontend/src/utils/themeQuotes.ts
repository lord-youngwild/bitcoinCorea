export type ThemeKey = 'bitcoin' | 'sea' | 'matrix';

export const THEME_QUOTES: Record<ThemeKey, string[]> = {
  bitcoin: [
    "If you don't believe it or don't get it, I don't have the time to try to convince you, sorry.",
    "It's very attractive to the libertarian viewpoint if we can explain it properly. I'm better with code than with words though.",
    'The root problem with conventional currency is all the trust that\'s required to make it work.',
    'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
    'It might make sense just to get some in case it catches on.',
    'As a thought experiment, imagine there was a base metal as scarce as gold but with one magical property: it can be transported over a communications channel.',
    'We have proposed a system for electronic transactions without relying on trust.',
    "I'm sure that in 20 years there will either be very large transaction volume or no volume.",
    'Running bitcoin.',
    'Bitcoin seems to be a very promising idea.',
    "Every day that goes by and Bitcoin hasn't collapsed due to legal or technical problems, that brings new information to the market.",
    'The computer can be used as a tool to liberate and protect people, rather than to control them.',
  ],
  sea: [
    '바다는 너무 넓어서 자신이 어떤 존재인지 알 수 없었다. 그래서 바다는 자신을 보기 위해 수많은 물방울로 나뉘었다.',
    '우리는 물방울처럼 보이지만, 근원 의식이 자신을 경험하는 한 조각의 신성입니다.',
    '한 물방울이 깨닫습니다: "나는 단순한 물방울이 아니라 바다의 일부였구나."',
    'Each drop believes itself separate — yet all return to the same sea.',
    '강이 되어 흐르고, 사람의 눈물이 되기도 했다. 그래도 결국 바다로 돌아온다.',
    'The sea did not divide. It multiplied itself to know itself.',
    '우리는 서로 다른 존재라고 생각하며 살아간다. 하지만 우리는 하나의 바다다.',
    'Not a drop is lost. Every one returns.',
    'Bitcoin is a drop. The ocean is the movement.',
    '바다는 파도가 아니라 바다다. 우리는 해시레이트가 아니라 네트워크다.',
    'One node. One drop. One sea.',
    'We mine not for ourselves alone — we mine for the whole ocean.',
  ],
  matrix: [
    'Welcome to the real world.',
    'There is no spoon.',
    'Follow the white rabbit.',
    'Unfortunately, no one can be told what the Matrix is. You have to see it for yourself.',
    "I can only show you the door. You're the one that has to walk through it.",
    'What is real? How do you define real?',
    'Choice is an illusion created between those with power and those without.',
    'Dodge this.',
    'Ignorance is bliss.',
    "The answer is out there, Neo, and it's looking for you.",
    "Never send a human to do a machine's job.",
    'Free your mind.',
    'I know kung fu.',
  ],
};

/**
 * Returns a random theme-appropriate quote.
 * @param theme - current app theme ('sea' | 'bitcoin' | 'matrix')
 */
export function getThemeQuote(theme: ThemeKey | string): string {
  const key: ThemeKey = (theme === 'sea' || theme === 'bitcoin' || theme === 'matrix')
    ? (theme as ThemeKey)
    : 'sea';
  const list = THEME_QUOTES[key];
  return list[Math.floor(Math.random() * list.length)];
}
