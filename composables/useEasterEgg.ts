import { EXTERNAL_LINKS } from '~/constants/external-links'

export function useEasterEgg() {
  // 🎉 Console 彩蛋訊息
  onMounted(() => {
    setTimeout(() => {
      console.clear()

      console.log(
        '%c我就知道你這個小壞蛋，今年又忍不住來偷看這裡了🐽',
        'color: #ec4899; font-size: 16px; font-weight: bold;',
      )

      console.log(
        '%c今年的活動更加豐富精彩，快來看看吧👇',
        'color: #ec4899; font-size: 16px; font-weight: bold;',
      )

      console.log(
        '%c' + `                                    
║ 🌐 WebConf Taiwan 2025
║ ↪️ 售票連結：
║ ${EXTERNAL_LINKS.CONF_TICKET_URL}                                           
      `,
        'color: #8b5cf6; font-family: monospace; font-size: 12px; line-height: 1.2; font-weight: bold;',
      )

      // 隱藏彩蛋
      console.log(
        '%c🎮 Could you find the "easterEgg"? 🤔 Show me what you got, WEB MASTERS!',
        'color: #3b82f6; font-size: 12px;',
      )

      if (typeof window !== 'undefined') {
        (window as any).easterEgg = () => {
          console.clear()

          console.log(
            '%c🎊 解鎖隱藏彩蛋！',
            'color: #10b981; font-size: 16px; font-weight: bold;',
          )

          console.log(
            '%c' + `                                     
║ 🏆 成就達成：                      
║  • Console 探索者    

║ 感謝你對 WebConf 的關注！                     
║ 期待今年的參與 🙌
                          
║ ↪️ 售票連結：
║ ${EXTERNAL_LINKS.CONF_TICKET_URL} 
          `,
            'color: #8b5cf6; font-family: monospace; font-size: 12px; line-height: 1.2; font-weight: bold;',
          )
        }
      }
    }, 300)
  })
}
