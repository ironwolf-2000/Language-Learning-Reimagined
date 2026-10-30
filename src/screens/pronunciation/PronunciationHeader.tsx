import type { ReactNode } from 'react'
import { PronunciationTabs } from './PronunciationTabs'
import styles from './Pronunciation.module.css'

export function PronunciationHeader({ title, intro, aside }: { title: string; intro: string; aside?: ReactNode }) {
  return (
    <>
      <PronunciationTabs />
      <header className={styles.header}>
        <div className={styles.intro}>
          <h1 className="page-title">{title}</h1>
          <p>{intro}</p>
        </div>
        {aside}
      </header>
    </>
  )
}
