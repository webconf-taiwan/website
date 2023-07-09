import sponsorsPicCollage from "@/assets/images/sponsors/picCollage.png";
import sponsorsKdanmobile from "@/assets/images/sponsors/kdanmobile.png";
import sponsorsTrafficInfo from "@/assets/images/sponsors/titansoft.png";
import sponsorsHexschool from "@/assets/images/sponsors/hexschool.png";
import facebook from "@/assets/images/linkIcon/facebook.png";
import instagram from "@/assets/images/linkIcon/instagram.png";
import linkedin from "@/assets/images/linkIcon/linkedin.png";
import medium from "@/assets/images/linkIcon/medium.png";
// import others from "@/assets/images/linkIcon/others.png";
// import twitter from "@/assets/images/linkIcon/twitter.png";
import youtube from "@/assets/images/linkIcon/youtube.png";

const sponsors = [
  {
    En_name: "diamond",
    Zh_name: "鑽石級贊助商",
    sponsors: [
      {
        id: "sponsor_titansoft",
        sponsor_name: "新加坡商鈦坦科技",
        image: sponsorsTrafficInfo,
        Introduction: [
          "新加坡商鈦坦科技是一間軟體開發公司，提供線上軟體平台客製開發與維護，以及代理 Atlassian 旗下產品 Jira Software & Confluence、線上視覺化白板 Miro ，以自身實際使用經驗提供一站式導入服務。身處快速變動的軟體產業，我們採用敏捷開發，同時將敏捷思維注入公司文化，目的是快速、靈活地應對客戶和市場需求的變化，在多年導入及迭代的經驗下，我們也開始提供企業客製化敏捷課程及顧問諮詢服務。",
          "憑藉著「超越自我 Never Stop Improving」的理念，我們不斷尋找新的解決方案來提高產品品質與生產力，採行重視透明度和開放性的扁平化組織，使團隊能透過持續改善來交付有商業價值的產品，此外，我們【實行彈性工時】、【採用自主申請升遷】、【不再實施個人績效評量】、【實踐薪資透明化】，我們認為這是敏捷管理和自組織工作環境的必要元素。",
        ],

        link: [
          {
            icon: facebook,
            url: "https://gotica.io/FBWebConf",
          },
          {
            icon: instagram,
            url: "https://gotica.io/IGWebConf",
          },
          {
            icon: youtube,
            url: "https://gotica.io/YTWebConf",
          },
          {
            icon: linkedin,
            url: "https://gotica.io/LinkedInWebConf",
          },
          {
            icon: medium,
            url: "https://gotica.io/MediumWebConf",
          },
        ],
      },
    ],
  },
  {
    En_name: "platinum",
    Zh_name: "白金級贊助商",
    sponsors: [
      {
        id: "sponsor_picCollage",
        sponsor_name: "PicCollage 拼貼趣",
        image: sponsorsPicCollage,
        Introduction: [],
      },
    ],
  },
  {
    En_name: "special",
    Zh_name: "特別贊助",
    sponsors: [
      {
        id: "sponsor_tenlong",
        sponsor_name: "天瓏網路書店",
        image: sponsorsHexschool,
        Introduction: [],
      },
    ],
  },
  {
    En_name: "silver",
    Zh_name: "銀牌贊助商",
    sponsors: [
      {
        id: "sponsor_kdanmobile",
        sponsor_name: "凱鈿行動科技",
        image: sponsorsKdanmobile,
        Introduction: [],
      },
    ],
  },
  {
    En_name: "organizer",
    Zh_name: "主辦廠商",
    sponsors: [
      {
        id: "sponsor_hexschool",
        sponsor_name: "六角學院",
        image: sponsorsHexschool,
        Introduction: [],
      },
      {
        id: "sponsor_5xruby",
        sponsor_name: "五倍紅寶石",
        image: sponsorsHexschool,
        Introduction: [],
      },
    ],
  },
];

export { sponsors };
