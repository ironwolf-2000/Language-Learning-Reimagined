import type { QueueItem } from '../lib/helpQueue'

export type HelpItem = QueueItem & {
  author: { name: string; seed: number; firstLanguage: string }
  /** What the author asked correctors to look at, if anything. */
  request?: string
  seconds?: number
}

/** English entries from learners who want a native speaker's eye. The demo learner helps with English. */
export const HELP_QUEUE: HelpItem[] = [
  {
    id: 'kenji-lab',
    author: { name: 'Kenji', seed: 9, firstLanguage: 'Japanese' },
    title: 'My first week in the lab',
    kind: 'written',
    request: 'Please check if it sounds natural.',
    waitingHours: 50,
    corrections: 0,
    text: 'Last week I have started my new job in a biology lab. Everyone is very kind with me, but I am still not used to speak English all day. Yesterday my supervisor asked me to explain my results in the meeting, and I was so nervous that I forgot half of the words. After the meeting a colleague told me that my explanation was clear, so maybe it was not so bad.',
  },
  {
    id: 'giulia-design',
    author: { name: 'Giulia', seed: 1, firstLanguage: 'Italian' },
    title: 'How I got into design',
    kind: 'written',
    waitingHours: 3,
    corrections: 0,
    text: 'When I was a child I used to draw on everything, also on the walls of my grandmother’s house. She was never angry, she said that one day I would make it my job. Now I am a product designer in Bologna and I still think about her every time I start a new project.',
  },
  {
    id: 'lucia-thesis',
    author: { name: 'Lucía', seed: 4, firstLanguage: 'Spanish' },
    title: 'Explaining my thesis in two minutes',
    kind: 'recording',
    seconds: 112,
    request: 'I have a presentation next month.',
    waitingHours: 26,
    corrections: 0,
    text: 'My thesis is about how the cities are adapting to the heat waves. In the last years the summers in Seville are more and more hot, and the people cannot sleep at night. I study which solutions works better: more trees, white roofs or shadows in the streets.',
  },
  {
    id: 'marta-pharmacy',
    author: { name: 'Marta', seed: 12, firstLanguage: 'Italian' },
    title: 'At the pharmacy',
    kind: 'phrases',
    waitingHours: 20,
    corrections: 0,
    text: 'I need something for the headache.\nDo you have it without recipe?\nHow many times in a day I must take it?',
  },
  {
    id: 'ahmed-job',
    author: { name: 'Ahmed', seed: 3, firstLanguage: 'Arabic' },
    title: 'Why I left my old job',
    kind: 'written',
    waitingHours: 70,
    corrections: 1,
    text: 'It was not easy decision, but after five years I felt that I am not growing anymore. My manager was nice person, but every day was the same. Now I work in a smaller company and I learn something new every week.',
  },
  {
    id: 'yuna-weekend',
    author: { name: 'Yuna', seed: 7, firstLanguage: 'Korean' },
    title: 'My weekend',
    kind: 'phrases',
    waitingHours: 9,
    corrections: 0,
    text: 'On Saturday I went to hiking with my friends.\nThe weather was very good.\nIn the evening we ate a lot of meat and I was very tired.',
  },
  {
    id: 'pierre-restaurant',
    author: { name: 'Pierre', seed: 10, firstLanguage: 'French' },
    title: 'Ordering at a restaurant',
    kind: 'recording',
    seconds: 40,
    waitingHours: 40,
    corrections: 1,
    text: 'Hello, I would like to have the steak, but well cooked please. And for my wife the fish of the day. Can we have also some water without gas?',
  },
  {
    id: 'olga-book',
    author: { name: 'Olga', seed: 13, firstLanguage: 'Russian' },
    title: 'A book that changed my mind',
    kind: 'written',
    waitingHours: 5,
    corrections: 0,
    text: 'I read this book two years ago and since then I look different on the money. The author explains that rich people are not people who earn much, but people who spend less than they earn. It sounds simple, but for me it was a discover.',
  },
  {
    id: 'thiago-feature',
    author: { name: 'Thiago', seed: 2, firstLanguage: 'Portuguese' },
    title: 'Presenting our new feature',
    kind: 'recording',
    seconds: 190,
    waitingHours: 30,
    corrections: 2,
    text: 'Today I want to present you the feature that we developed during the last sprint. It permits to the users to export their data in one click. We received many feedbacks from the clients and this was the most asked.',
  },
  {
    id: 'mei-neighbours',
    author: { name: 'Mei', seed: 11, firstLanguage: 'Chinese' },
    title: 'Small talk with neighbours',
    kind: 'phrases',
    waitingHours: 1,
    corrections: 0,
    text: 'How is your dog?\nThe weather is so hot today, isn’t?\nSee you later, have a good day.',
  },
]

/** The demo learner's record as a helper. */
export const HELPER_HISTORY = { sent: 25, approved: 23 }
