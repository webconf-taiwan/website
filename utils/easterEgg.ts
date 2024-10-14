export function showEasterEgg() {
  if (import.meta.client) {
    const styles = [
      'font-size: 18px',
      'font-family: "Noto Sans TC", sans-serif',
      'font-weight: bold',
      'line-height: 1.5',
      'color: hsla(168, 100%, 50%, 1)',
      'background-color: #1a1a1a',
      'padding: 0.5rem 1rem',
      'border-radius: 5px',
      'text-shadow: 2px 2px 4px rgba(0,0,0,0.5)',
    ].join(';')

    console.log('%c你這個小壞蛋，我就知道你會打開來看😏\n還不快去 ACCUPASS 買票 ! 🥳🤡🥳', styles)
  }
}
