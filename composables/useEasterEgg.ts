export function useEasterEgg() {
  // 🎉 Console 彩蛋訊息
  onMounted(() => {
    console.clear()

    console.log(
      '%c我就知道你這個小壞蛋，今年又忍不住來偷看這裡了🐽',
      'color: #ec4899; font-size: 16px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
    )

    console.log(
      '%c今年的活動更加豐富精彩，快來看看吧👇',
      'color: #ec4899; font-size: 16px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
    )

    console.log(
      '%c' + `
╔════════════════════════════════════════════╗
║                                           ║
    🌐 WebConf Taiwan 2025                
║                                            ║
    ↪️ 售票連結：https://2025.webconf.tw/  
║                                           ║
╚════════════════════════════════════════════╝
    `,
      'color: #8b5cf6; font-family: monospace; font-size: 12px; line-height: 1.2; font-weight: bold;',
    )

    // 隱藏的互動彩蛋
    console.log(
      '%c🎮 Could you find the "easterEgg"? 🤔 Show me what you got, WEB MASTERS!',
      'color: #3b82f6; font-size: 12px;',
    )

    // 添加全域彩蛋函數
    if (typeof window !== 'undefined') {
      (window as any).easterEgg = () => {
        console.clear()
        console.log(
          '%c🎊 恭喜你發現了隱藏彩蛋！',
          'color: #ec4899; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
        )
        console.log(
          '%c你是一個真正的開發者！',
          'color: #10b981; font-size: 18px; font-weight: bold;',
        )
        console.log(
          '%c' + `
        ╔══════════════════════════════════════╗
        ║            🎉 彩蛋解鎖 🎉            ║
        ║                                      ║
        ║    你已經證明了你的開發者技能！        ║
        ║                                      ║
        ║    🏆 成就解鎖：                      ║
        ║    • Console 探索者                  ║
        ║    • 彩蛋獵人                        ║
        ║    • 真正的開發者                    ║
        ║                                      ║
        ║    感謝你對 WebConf Taiwan 的關注！   ║
        ╚══════════════════════════════════════╝
        `,
          'color: #8b5cf6; font-family: monospace; font-size: 12px; line-height: 1.2;',
        )

        return 'unlocked!'
      }
    }
  })
}
