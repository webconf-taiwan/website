/* eslint-disable */
const fs = require('node:fs')
const path = require('node:path')
const Papa = require('papaparse')

// 讀取 CSV
const csv = fs.readFileSync('form_responses.csv', 'utf8')
// 提取長內容要搭配 nuxt-content 模板使用
const contentColumn = [{
  label: '個人介紹',
  value: 'personalIntroduction',
  class: 'speaker-intro',
}, {
  label: '演講摘要',
  value: 'speechAbstract',
  class: 'speaker-summary',
}, {
  label: '目標會眾',
  value: 'targetAudience',
  class: 'speaker-audience',
}, {
  label: '預期收穫',
  value: 'expectedEarnings',
  class: 'speaker-earnings',
}]

const scheduleMap = {
  // Day 1~2025-12-12

  // Keynote Speaker
  '李昆謀': { id: '1', day: 'day1', date: '2025-12-12', time: '09:10~09:55', room: 'A2 棟 & M 棟 & F 棟', doc: '', slides: '', image: '/images/speakers/1_李昆謀.webp', ogImage: '/images/ogImage/1_李昆謀.png' },
  'Will 保哥': { id: '2', day: 'day1', date: '2025-12-12', time: '13:30~14:15', room: 'M 棟 & F 棟', doc: '', slides: '', image: '/images/speakers/2_Will_保哥.webp', ogImage: '/images/ogImage/2_Will_保哥.png' },

  // A2 棟
  '陳偉仁 Chris Chen': { id: '3', day: 'day1', date: '2025-12-12', time: '10:05~10:50', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/3_陳偉仁_Chris_Chen.webp', ogImage: '/images/ogImage/3_陳偉仁_Chris_Chen.png' },
  '黃庭亞': { id: '4', day: 'day1', date: '2025-12-12', time: '10:05~10:50', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/4_黃庭亞-Yaya.webp', ogImage: '/images/ogImage/4_黃庭亞-Yaya.png' },
  '姜乃文': { id: '5', day: 'day1', date: '2025-12-12', time: '11:00~11:45', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/5_姜乃文.webp', ogImage: '/images/ogImage/5_姜乃文.png' },
  '曾友志': { id: '6', day: 'day1', date: '2025-12-12', time: '11:55~12:40', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/6_曾友志.webp', ogImage: '/images/ogImage/6_曾友志.png' },
  '周明璇（Zizi Chou，小紫）': { id: '7', day: 'day1', date: '2025-12-12', time: '13:30~14:15', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/7_周明璇(Zizi Chou，小紫).webp', ogImage: '/images/ogImage/7_周明璇(Zizi Chou，小紫).png' },
  'Niki Liu': { id: '8', day: 'day1', date: '2025-12-12', time: '14:25~15:10', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/8_Niki_Liu.webp', ogImage: '/images/ogImage/8_Niki_Liu.png' },
  'Jenson Lee': { id: '9', day: 'day1', date: '2025-12-12', time: '16:15~17:00', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/9_Jenson_Lee.webp', ogImage: '/images/ogImage/9_Jenson_Lee.png' },
  '林星妤': { id: '33', day: 'day1', date: '2025-12-12', time: '15:20~16:05', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/33_林星妤.webp', ogImage: '/images/ogImage/33_林星妤.png' },
  '黃明硯': { id: '34', day: 'day1', date: '2025-12-12', time: '15:20~16:05', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/34_黃明硯.webp', ogImage: '/images/ogImage/34_黃明硯.png' },

  // M 棟
  'Max Chen': { id: '10', day: 'day1', date: '2025-12-12', time: '11:55~12:40', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/10_Max_Chen.webp', ogImage: '/images/ogImage/10_Max_Chen.png' },
  'Shirney Huang 黃琇琳': { id: '11', day: 'day1', date: '2025-12-12', time: '15:20~16:05', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/11_Shirney_Huang 黃琇琳.webp', ogImage: '/images/ogImage/11_Shirney_Huang 黃琇琳.png' },
  'Eric Lee': { id: '12', day: 'day1', date: '2025-12-12', time: '16:15~17:00', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/12_Eric_Lee.webp', ogImage: '/images/ogImage/12_Eric_Lee.png' },
  'Kuro Hsu': { id: '38', day: 'day1', date: '2025-12-12', time: '11:00~11:45', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/38_KURO.webp', ogImage: '/images/ogImage/38_KURO.png' },
  '馮元詰': { id: '40', day: 'day1', date: '2025-12-12', time: '14:25~15:10', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/40_fong.webp', ogImage: '/images/ogImage/40_fong.png' },

  // F 棟
  '顏勝豪 Otto': { id: '13', day: 'day1', date: '2025-12-12', time: '10:05~10:50', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/13_顏勝豪_Otto.webp', ogImage: '/images/ogImage/13_顏勝豪_Otto.png' },
  '蕭晊莛': { id: '14', day: 'day1', date: '2025-12-12', time: '14:25~15:10', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/14_蕭晊莛.webp', ogImage: '/images/ogImage/14_蕭晊莛.png' },
  'Kuma Syu': { id: '15', day: 'day1', date: '2025-12-12', time: '15:20~16:05', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/15_Kuma_Syu.webp', ogImage: '/images/ogImage/15_Kuma_Syu.png' },
  '陳正瑋（艦長）': { id: '16', day: 'day1', date: '2025-12-12', time: '16:15~17:00', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/16_陳正瑋(艦長).webp', ogImage: '/images/ogImage/16_陳正瑋(艦長).png' },
  '墨嗓 (陳佑竹)': { id: '39', day: 'day1', date: '2025-12-12', time: '11:55~12:40', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/39_Mouson.webp', ogImage: '/images/ogImage/39_Mouson.png' },

  // Day 2~2025-12-13

  // Keynote Speaker
  'Huli': { id: '17', day: 'day2', date: '2025-12-13', time: '09:00~09:45', room: 'M 棟 & F 棟', doc: '', slides: '', image: '/images/speakers/17_Huli.webp', ogImage: '/images/ogImage/17_Huli.png' },
  '游舒帆': { id: '18', day: 'day2', date: '2025-12-13', time: '16:15~17:00', room: 'A2 棟 & M 棟 & F 棟', doc: '', slides: '', image: '/images/speakers/18_游舒帆_Gipi.webp', ogImage: '/images/ogImage/18_游舒帆_Gipi.png' },
  '李智樺': { id: '44', day: 'day2', date: '2025-12-13', time: '16:15~16:30', room: 'A2 棟 & M 棟 & F 棟', doc: '', slides: '', image: '/images/speakers/44_ruddy.webp', ogImage: '/images/ogImage/44_ruddy.png' },

  // A2 棟
  'Joey': { id: '19', day: 'day2', date: '2025-12-13', time: '09:00~09:45', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/19_Joey.webp', ogImage: '/images/ogImage/19_Joey.png' },
  'Peter Su': { id: '20', day: 'day2', date: '2025-12-13', time: '10:00~10:45', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/20_Peter_Su.webp', ogImage: '/images/ogImage/20_Peter_Su.png' },
  '卓致遠': { id: '21', day: 'day2', date: '2025-12-13', time: '10:55~11:40', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/21_卓致遠.webp', ogImage: '/images/ogImage/21_卓致遠.png' },
  '郭心喻': { id: '22', day: 'day2', date: '2025-12-13', time: '11:50~12:35', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/22_郭心喻.webp', ogImage: '/images/ogImage/22_郭心喻.png' },
  '趙柏強': { id: '23', day: 'day2', date: '2025-12-13', time: '13:30~14:15', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/23_趙柏強.webp', ogImage : '/images/ogImage/23_趙柏強.png' },
  'Kaba Su': { id: '24', day: 'day2', date: '2025-12-13', time: '14:25~15:10', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/24_Kaba_Su.webp', ogImage: '/images/ogImage/24_Kaba_Su.png' },
  'Richard Tsai 蔡明哲': { id: '25', day: 'day2', date: '2025-12-13', time: '14:25~15:10', room: 'A2 棟', doc: '', slides: '', image: '/images/speakers/24_Kaba_Su.webp', ogImage: '/images/ogImage/24_Kaba_Su.png' },

  // M 棟
  '吳展瑋': { id: '26', day: 'day2', date: '2025-12-13', time: '10:55~11:40', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/26_吳展瑋 Howard.webp', ogImage: '/images/ogImage/26_吳展瑋 Howard.png' },
  '柯仁傑': { id: '27', day: 'day2', date: '2025-12-13', time: '11:50~12:35', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/27_柯仁傑.webp', ogImage: '/images/ogImage/27_柯仁傑.png' },
  'Hannah Lin': { id: '28', day: 'day2', date: '2025-12-13', time: '14:25~15:10', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/28_hannah.webp', ogImage: '/images/ogImage/28_hannah.png' },
  '奶綠茶': { id: '29', day: 'day2', date: '2025-12-13', time: '15:20~16:05', room: 'M 棟', doc: '', slides: '', image: '/images/speakers/29_奶綠.webp', ogImage: '/images/ogImage/29_奶綠.png' },

  // F 棟
  'Jocelin Ho': { id: '30', day: 'day2', date: '2025-12-13', time: '10:00~10:45', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/30_Jocelin_Ho.webp', ogImage: '/images/ogImage/30_Jocelin_Ho.png' },
  'MUKI': { id: '31', day: 'day2', date: '2025-12-13', time: '10:55~11:40', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/31_MUKI.webp', ogImage: '/images/ogImage/31_MUKI.png' },
  'ThisWeb (Kun)': { id: '32', day: 'day2', date: '2025-12-13', time: '11:50~12:35', room: 'F 棟', doc: '', slides: '', image: '/images/speakers/32_ThisWeb (Kun).webp', ogImage: '/images/ogImage/32_ThisWeb (Kun).png' },
}

// 解析 CSV
Papa.parse(csv, {
  header: true,
  complete: (results) => {
    // 建立輸出資料夾
    const outputDir = 'markdown_output'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    results.data.forEach((row, idx) => {
      // 取得欄位並去除空白
      const speakerName = row['講者名稱']?.trim() || '未命名'
      const slug = speakerName.replace(/\s+/g, '_')
      const jobTitle = row['職稱']?.trim() || '未知職稱'
      const company = row['公司 / 組織']?.trim() || ''
      const email = row['聯絡 Email']?.trim() || ''
      const facebook = row['Facebook 個人社交連結']?.trim() || ''
      const formateFacebook = facebook === 'fb.com/realhere' ? 'https://www.facebook.com/realhere' : facebook // 9_Jenson_Lee 特殊處理
      const x = row['X 個人社交連結']?.trim() || ''
      const ig = row['IG 個人社交連結']?.trim() || ''
      const formateIg = ig === 'Instagram.com/realhere' ? 'https://www.instagram.com/realhere' : ig // 9_Jenson_Lee 特殊處理
      const otherLink = row['其他連結 (ex: 個人網站 / 部落格)']?.trim() || ''
      let formateOtherLink = otherLink
      if (speakerName === 'ThisWeb (Kun)')
        formateOtherLink = 'https://thisweb.dev/' // ThisWeb (Kun) 特殊處理(存在兩個以上連結)
      if (speakerName === 'Jocelin Ho')
        formateOtherLink = 'https://www.linkedin.com/in/jocelinho/' // ThisWeb (Kun) 特殊處理(存在兩個以上連結)
      const topic = row['演講主題（35字內）']?.trim() || '未知主題'
      const tags = row['技術標籤']?.trim() || ''
      const speakerInfo = row['個人介紹']?.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ') || ''
      const summary = row['演講摘要']?.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ') || ''
      const description = summary || topic
      const scheduleInfo = scheduleMap[speakerName]

      // 建立 frontmatter 物件，只包含有值的欄位
      const frontmatter = {
        ...(scheduleInfo && { speakerId: `"${scheduleInfo.id}"` }),
        name: speakerName,
        slug,
        company: `"${company}"`,
        job_title: jobTitle,
        topic,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(t => t) : [],
        ...(speakerInfo && { speakerInfo }),
        ...(description && { description }),
        ...(email && { email }),
        ...(scheduleInfo?.image && { image: scheduleInfo.image }),
        ...(scheduleInfo?.ogImage && { ogImage: scheduleInfo.ogImage }),
        ...(formateFacebook && { fb:formateFacebook }),
        ...(x && { x }),
        ...(formateIg && { ig: formateIg }),
        ...(formateOtherLink && { other_link: formateOtherLink }),
        ...(scheduleInfo && { day: scheduleInfo.day }),
        ...(scheduleInfo && { date: scheduleInfo.date }),
        ...(scheduleInfo && { time: scheduleInfo.time }),
        ...(scheduleInfo && { room: scheduleInfo.room }),
        ...(scheduleInfo?.doc && { doc: scheduleInfo.doc }),
        ...(scheduleInfo?.slides && { slides: scheduleInfo.slides }),
      }

      // 建立檔案名稱
      const speakerId = scheduleInfo ? scheduleInfo.id : '000'
      const filename = `${speakerId}_${speakerName.replace(/\s+/g, '_')}.md`

      // 建立 Markdown 內容
      let markdown = `---\n`
      for (const [key, value] of Object.entries(frontmatter)) {
        if (key === 'tags') {
          if (value.length > 0) {
            markdown += `tags: [${value.map(t => `"${t}"`).join(', ')}]\n`
          }
          else {
            markdown += `tags: []\n`
          }
        }
        else if (key === 'description') {
          markdown += `description: "${description.replace(/"/g, '\\"')}"\n`
        }
        else if (key === 'speakerInfo') {
          markdown += `speakerInfo: "${speakerInfo.replace(/"/g, '\\"')}"\n`
        }
        else {
          markdown += `${key}: ${value}\n`
        }
      }
      markdown += `---\n\n`

      // 加入其他欄位
      for (const key of Object.keys(row)) {
        const findColumn = contentColumn.find(col => col.label === key)
        if (findColumn) {
          const value = row[key]?.trim()
          const { value: title, class: className } = findColumn
          if (value && value !== '') {
            markdown += `::${className}\n#${title}\n${value}\n::\n\n`
          }
        }
      }

      // 儲存檔案
      const filepath = path.join(outputDir, filename)
      fs.writeFileSync(filepath, markdown, 'utf8')
      console.log(`已建立: ${filename}`)
    })

    console.log(`\n完成！共產生 ${results.data.length} 個檔案於 ${outputDir} 資料夾`)
  },
})
