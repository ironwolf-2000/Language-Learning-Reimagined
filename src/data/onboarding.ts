export const LEARNABLE = [
  { code: 'it', name: 'Italian', available: true },
  { code: 'es', name: 'Spanish', available: false },
  { code: 'fr', name: 'French', available: false },
  { code: 'de', name: 'German', available: false },
  { code: 'ja', name: 'Japanese', available: false },
]

export const NATIVE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Arabic']

export const GOALS = [
  { key: 'career', label: 'Work & career', hint: 'Meetings, emails, your field' },
  { key: 'everyday', label: 'Living there', hint: 'Errands, neighbours, paperwork' },
  { key: 'people', label: 'Family & friends', hint: 'Real conversations with people you love' },
  { key: 'books', label: 'Books, film & culture', hint: 'Enjoy things in the original' },
  { key: 'travel', label: 'Travel', hint: 'Getting around and beyond the basics' },
  { key: 'joy', label: 'Just because', hint: 'No reason needed' },
]

export const TOPIC_OPTIONS = [
  { key: 'tech', label: 'Software & technology' },
  { key: 'design', label: 'Design' },
  { key: 'science', label: 'Science' },
  { key: 'food', label: 'Food & cooking' },
  { key: 'football', label: 'Football' },
  { key: 'history', label: 'History' },
  { key: 'music', label: 'Music' },
  { key: 'politics', label: 'Politics & society' },
  { key: 'finance', label: 'Economy & finance' },
  { key: 'cinema', label: 'Cinema' },
  { key: 'nature', label: 'Nature & climate' },
  { key: 'philosophy', label: 'Philosophy' },
  { key: 'health', label: 'Health & medicine' },
  { key: 'art', label: 'Art' },
]

/** Graded texts for placement: phrases → sentences → paragraphs → real-world prose. */
export const PLACEMENT_TEXTS = [
  { level: 'easy', text: 'Mi chiamo Luca. Abito a Torino con mia sorella e lavoro in un ufficio in centro.' },
  {
    level: 'everyday',
    text: 'Ogni mattina Luca prende il tram per andare in ufficio. Di solito legge le notizie sul telefono, ma oggi il tram è pieno e deve stare in piedi. Quando arriva, si accorge di aver dimenticato il badge a casa.',
  },
  {
    level: 'a bit more',
    text: 'Il collega che lo accoglie all’ingresso non sembra sorpreso: a quanto pare, succede almeno una volta al mese. Gli presta il suo badge di riserva, a patto che Luca gli offra un caffè durante la pausa.',
  },
  {
    level: 'real-world',
    text: 'Durante la riunione, il responsabile del progetto annuncia che la scadenza è stata anticipata di due settimane. Nessuno osa protestare apertamente, ma dai loro sguardi si capisce che la notizia non è stata accolta con entusiasmo.',
  },
  {
    level: 'demanding',
    text: 'A fine giornata, Luca si sofferma a riflettere su quanto sia cambiato il suo modo di lavorare: se un tempo si sarebbe lasciato sopraffare dall’ansia, ora affronta gli imprevisti con una calma che lui stesso fatica a spiegarsi.',
  },
]
