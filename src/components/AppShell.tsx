import { Outlet } from 'react-router'
import { DevStageSwitch } from '../app/DevStageSwitch'
import styles from './AppShell.module.css'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <main className={styles.main}>
        <div className={styles.inner}>
          <Outlet />
        </div>
      </main>
      {import.meta.env.DEV && <DevStageSwitch />}
    </div>
  )
}
