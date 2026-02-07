import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { Button, Modal } from './ui'

const THEME_STORAGE_KEY = 'cursor-fit:theme'

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ToggleSwitch({
  enabled,
  onChange,
  labelEnabled,
  labelDisabled,
}: {
  enabled: boolean
  onChange: (enabled: boolean) => void
  labelEnabled: string
  labelDisabled: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        enabled
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
      }`}
    >
      {enabled ? labelEnabled : labelDisabled}
    </button>
  )
}

export function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const soundEnabled = useStore((s) => s.soundEnabled)
  const timerEnabled = useStore((s) => s.timerEnabled)
  const stopwatchEnabled = useStore((s) => s.stopwatchEnabled)
  const setSoundEnabled = useStore((s) => s.setSoundEnabled)
  const setTimerEnabled = useStore((s) => s.setTimerEnabled)
  const setStopwatchEnabled = useStore((s) => s.setStopwatchEnabled)
  const clearAllData = useStore((s) => s.clearAllData)

  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const setTheme = (dark: boolean) => {
    const value = dark ? 'dark' : 'light'
    localStorage.setItem(THEME_STORAGE_KEY, value)
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    setIsDark(dark)
  }

  const lng = i18n.language?.startsWith('ru') ? 'ru' : 'en'

  const handleClearConfirm = () => {
    clearAllData()
    setShowClearConfirm(false)
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>

      <div className="flex flex-col gap-4">
        {/* Theme */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300">{t('settings.theme')}</span>
          <ToggleGroup
            options={[
              { label: t('common.themeLight'), value: 'light' },
              { label: t('common.themeDark'), value: 'dark' },
            ]}
            value={isDark ? 'dark' : 'light'}
            onChange={(v) => setTheme(v === 'dark')}
          />
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300">{t('settings.language')}</span>
          <ToggleGroup
            options={[
              { label: 'En', value: 'en' },
              { label: 'Ru', value: 'ru' },
            ]}
            value={lng}
            onChange={(v) => i18n.changeLanguage(v)}
          />
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300">{t('settings.sound')}</span>
          <ToggleSwitch
            enabled={soundEnabled}
            onChange={setSoundEnabled}
            labelEnabled={t('settings.enabled')}
            labelDisabled={t('settings.disabled')}
          />
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300">{t('settings.timer')}</span>
          <ToggleSwitch
            enabled={timerEnabled}
            onChange={setTimerEnabled}
            labelEnabled={t('settings.enabled')}
            labelDisabled={t('settings.disabled')}
          />
        </div>

        {/* Stopwatch */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300">{t('settings.stopwatch')}</span>
          <ToggleSwitch
            enabled={stopwatchEnabled}
            onChange={setStopwatchEnabled}
            labelEnabled={t('settings.enabled')}
            labelDisabled={t('settings.disabled')}
          />
        </div>
      </div>

      {/* Clear all data */}
      <div className="mt-4">
        <Button variant="danger" fullWidth onClick={() => setShowClearConfirm(true)}>
          {t('settings.clearAllData')}
        </Button>
      </div>

      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title={t('settings.clearAllDataTitle')}
        titleId="clear-all-data-modal-title"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('settings.clearAllDataMessage')}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowClearConfirm(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="dangerFilled" fullWidth onClick={handleClearConfirm}>
            {t('settings.clearAllData')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
