// PhoneVerse — Phone Database Generator (500+ phones)
const BRAND_COLORS = {
  Samsung: 'linear-gradient(135deg, #1428a0, #439bf7)',
  Apple: 'linear-gradient(135deg, #555555, #a2aaad)',
  Xiaomi: 'linear-gradient(135deg, #ff6900, #ff9e22)',
  Redmi: 'linear-gradient(135deg, #e02020, #ff5252)',
  POCO: 'linear-gradient(135deg, #f5c518, #e8a300)',
  OnePlus: 'linear-gradient(135deg, #eb0029, #ff4d4d)',
  Google: 'linear-gradient(135deg, #4285f4, #34a853)',
  Huawei: 'linear-gradient(135deg, #cf0a2c, #ff4444)',
  Oppo: 'linear-gradient(135deg, #1a8450, #4caf50)',
  Vivo: 'linear-gradient(135deg, #415fff, #6b8aff)',
  Realme: 'linear-gradient(135deg, #f5c518, #e8a300)',
  Nothing: 'linear-gradient(135deg, #333333, #666666)',
  Motorola: 'linear-gradient(135deg, #5c2d91, #8e44ad)',
  Honor: 'linear-gradient(135deg, #0ab4ff, #007bff)',
  Sony: 'linear-gradient(135deg, #000000, #434343)',
  Nokia: 'linear-gradient(135deg, #124191, #3366cc)',
  ASUS: 'linear-gradient(135deg, #00529b, #0088cc)',
  Tecno: 'linear-gradient(135deg, #0066cc, #4da6ff)',
  Infinix: 'linear-gradient(135deg, #00a651, #33cc77)',
  iQOO: 'linear-gradient(135deg, #ff6600, #ff9933)',
  ZTE: 'linear-gradient(135deg, #0056a8, #3388cc)',
};

const BRAND_DATA = {
  Samsung: {
    emoji: '📱', series: [
      {name:'Galaxy S26 Ultra',cat:'flagship',ram:[12,16],storage:[256,512,1024],cam:200,bat:5500,screen:6.9,proc:'Snapdragon 8 Elite 2',price:1399,os:'Android 16'},
      {name:'Galaxy S26+',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5100,screen:6.7,proc:'Snapdragon 8 Elite 2',price:1099,os:'Android 16'},
      {name:'Galaxy S26',cat:'flagship',ram:[8,12],storage:[128,256],cam:50,bat:4200,screen:6.2,proc:'Snapdragon 8 Elite 2',price:899,os:'Android 16'},
      {name:'Galaxy S25 FE',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:4500,screen:6.6,proc:'Exynos 2500',price:599,os:'Android 15'},
      {name:'Galaxy Z Fold 7',cat:'flagship',ram:[12],storage:[256,512,1024],cam:50,bat:4800,screen:7.6,proc:'Snapdragon 8 Elite 2',price:1899,os:'Android 16',foldable:true},
      {name:'Galaxy Z Flip 7',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4200,screen:6.7,proc:'Snapdragon 8 Elite 2',price:1149,os:'Android 16',foldable:true},
      {name:'Galaxy A76',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Exynos 1580',price:479,os:'Android 16'},
      {name:'Galaxy A56',cat:'midrange',ram:[6,8,12],storage:[128,256],cam:50,bat:5000,screen:6.6,proc:'Exynos 1580',price:379,os:'Android 16'},
      {name:'Galaxy A36',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.6,proc:'Exynos 1480',price:309,os:'Android 16'},
      {name:'Galaxy A26',cat:'budget',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.5,proc:'Exynos 1380',price:239,os:'Android 16'},
      {name:'Galaxy S25 Ultra',cat:'flagship',ram:[12],storage:[256,512,1024],cam:200,bat:5000,screen:6.9,proc:'Snapdragon 8 Elite',price:1299,os:'Android 15'},
      {name:'Galaxy S25+',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4900,screen:6.7,proc:'Snapdragon 8 Elite',price:999,os:'Android 15'},
      {name:'Galaxy S25',cat:'flagship',ram:[8,12],storage:[128,256],cam:50,bat:4000,screen:6.2,proc:'Snapdragon 8 Elite',price:799,os:'Android 15'},
      {name:'Galaxy S24 Ultra',cat:'flagship',ram:[12],storage:[256,512,1024],cam:200,bat:5000,screen:6.8,proc:'Snapdragon 8 Gen 3',price:1199,os:'Android 14'},
      {name:'Galaxy S24+',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4900,screen:6.7,proc:'Exynos 2400',price:899,os:'Android 14'},
      {name:'Galaxy S24',cat:'flagship',ram:[8],storage:[128,256],cam:50,bat:4000,screen:6.2,proc:'Exynos 2400',price:699,os:'Android 14'},
      {name:'Galaxy S23 Ultra',cat:'flagship',ram:[8,12],storage:[256,512],cam:200,bat:5000,screen:6.8,proc:'Snapdragon 8 Gen 2',price:999,os:'Android 13'},
      {name:'Galaxy S23+',cat:'flagship',ram:[8],storage:[256,512],cam:50,bat:4700,screen:6.6,proc:'Snapdragon 8 Gen 2',price:799,os:'Android 13'},
      {name:'Galaxy S23',cat:'flagship',ram:[8],storage:[128,256],cam:50,bat:3900,screen:6.1,proc:'Snapdragon 8 Gen 2',price:649,os:'Android 13'},
      {name:'Galaxy Z Fold 6',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4400,screen:7.6,proc:'Snapdragon 8 Gen 3',price:1799,os:'Android 14',foldable:true},
      {name:'Galaxy Z Fold 5',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4400,screen:7.6,proc:'Snapdragon 8 Gen 2',price:1499,os:'Android 13',foldable:true},
      {name:'Galaxy Z Flip 6',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4000,screen:6.7,proc:'Snapdragon 8 Gen 3',price:1099,os:'Android 14',foldable:true},
      {name:'Galaxy Z Flip 5',cat:'flagship',ram:[8],storage:[256,512],cam:12,bat:3700,screen:6.7,proc:'Snapdragon 8 Gen 2',price:899,os:'Android 13',foldable:true},
      {name:'Galaxy A75',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Exynos 1480',price:449,os:'Android 15'},
      {name:'Galaxy A55',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.6,proc:'Exynos 1480',price:349,os:'Android 14'},
      {name:'Galaxy A54',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.4,proc:'Exynos 1380',price:299,os:'Android 13'},
      {name:'Galaxy A35',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.6,proc:'Exynos 1380',price:299,os:'Android 14'},
      {name:'Galaxy A34',cat:'midrange',ram:[6,8],storage:[128,256],cam:48,bat:5000,screen:6.6,proc:'Dimensity 1080',price:249,os:'Android 13'},
      {name:'Galaxy A25',cat:'budget',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.5,proc:'Exynos 1280',price:219,os:'Android 14'},
      {name:'Galaxy A16',cat:'budget',ram:[4,6],storage:[64,128],cam:50,bat:5000,screen:6.5,proc:'Exynos 1330',price:179,os:'Android 14'},
      {name:'Galaxy A15',cat:'budget',ram:[4,6],storage:[64,128],cam:50,bat:5000,screen:6.5,proc:'Helio G99',price:149,os:'Android 14'},
      {name:'Galaxy A06',cat:'budget',ram:[4],storage:[64,128],cam:50,bat:5000,screen:6.7,proc:'Helio G85',price:109,os:'Android 14'},
      {name:'Galaxy M55',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 7 Gen 1',price:349,os:'Android 14'},
      {name:'Galaxy M35',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:6000,screen:6.6,proc:'Exynos 1380',price:249,os:'Android 14'},
      {name:'Galaxy M15',cat:'budget',ram:[4,6],storage:[64,128],cam:50,bat:6000,screen:6.5,proc:'Dimensity 6100+',price:139,os:'Android 14'},
      {name:'Galaxy F55',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 7 Gen 1',price:299,os:'Android 14'},
      {name:'Galaxy F15',cat:'budget',ram:[4,6],storage:[128],cam:50,bat:6000,screen:6.5,proc:'Exynos 1330',price:129,os:'Android 14'},
    ]
  },
  Apple: {
    emoji: '🍎', series: [
      {name:'iPhone 17 Pro Max',cat:'flagship',ram:[12],storage:[256,512,1024],cam:48,bat:4900,screen:6.9,proc:'A19 Pro',price:1299,os:'iOS 19'},
      {name:'iPhone 17 Pro',cat:'flagship',ram:[12],storage:[128,256,512,1024],cam:48,bat:3800,screen:6.3,proc:'A19 Pro',price:1099,os:'iOS 19'},
      {name:'iPhone 17 Plus',cat:'flagship',ram:[8],storage:[128,256,512],cam:48,bat:4800,screen:6.7,proc:'A19',price:999,os:'iOS 19'},
      {name:'iPhone 17',cat:'flagship',ram:[8],storage:[128,256,512],cam:48,bat:3700,screen:6.1,proc:'A19',price:899,os:'iOS 19'},
      {name:'iPhone 17 Air',cat:'flagship',ram:[8],storage:[128,256],cam:48,bat:3200,screen:6.1,proc:'A19',price:799,os:'iOS 19'},
      {name:'iPhone 16 Pro Max',cat:'flagship',ram:[8],storage:[256,512,1024],cam:48,bat:4685,screen:6.9,proc:'A18 Pro',price:1199,os:'iOS 18'},
      {name:'iPhone 16 Pro',cat:'flagship',ram:[8],storage:[128,256,512,1024],cam:48,bat:3582,screen:6.3,proc:'A18 Pro',price:999,os:'iOS 18'},
      {name:'iPhone 16 Plus',cat:'flagship',ram:[8],storage:[128,256,512],cam:48,bat:4674,screen:6.7,proc:'A18',price:899,os:'iOS 18'},
      {name:'iPhone 16',cat:'flagship',ram:[8],storage:[128,256,512],cam:48,bat:3561,screen:6.1,proc:'A18',price:799,os:'iOS 18'},
      {name:'iPhone 16e',cat:'midrange',ram:[8],storage:[128,256],cam:48,bat:3561,screen:6.1,proc:'A18',price:599,os:'iOS 18'},
      {name:'iPhone 15 Pro Max',cat:'flagship',ram:[8],storage:[256,512,1024],cam:48,bat:4441,screen:6.7,proc:'A17 Pro',price:1099,os:'iOS 17'},
      {name:'iPhone 15 Pro',cat:'flagship',ram:[8],storage:[128,256,512,1024],cam:48,bat:3274,screen:6.1,proc:'A17 Pro',price:899,os:'iOS 17'},
      {name:'iPhone 15 Plus',cat:'midrange',ram:[6],storage:[128,256,512],cam:48,bat:4383,screen:6.7,proc:'A16',price:799,os:'iOS 17'},
      {name:'iPhone 15',cat:'midrange',ram:[6],storage:[128,256,512],cam:48,bat:3349,screen:6.1,proc:'A16',price:699,os:'iOS 17'},
      {name:'iPhone 14 Pro Max',cat:'flagship',ram:[6],storage:[128,256,512,1024],cam:48,bat:4323,screen:6.7,proc:'A16',price:899,os:'iOS 16'},
      {name:'iPhone 14 Pro',cat:'flagship',ram:[6],storage:[128,256,512,1024],cam:48,bat:3200,screen:6.1,proc:'A16',price:749,os:'iOS 16'},
      {name:'iPhone 14',cat:'midrange',ram:[6],storage:[128,256,512],cam:12,bat:3279,screen:6.1,proc:'A15',price:599,os:'iOS 16'},
      {name:'iPhone 13',cat:'midrange',ram:[4],storage:[128,256,512],cam:12,bat:3240,screen:6.1,proc:'A15',price:499,os:'iOS 15'},
      {name:'iPhone SE 2022',cat:'budget',ram:[4],storage:[64,128,256],cam:12,bat:2018,screen:4.7,proc:'A15',price:349,os:'iOS 15'},
    ]
  },
  Xiaomi: {
    emoji: '🟠', series: [
      {name:'Xiaomi 16 Ultra',cat:'flagship',ram:[16,24],storage:[256,512,1024],cam:200,bat:6000,screen:6.8,proc:'Snapdragon 8 Elite 2',price:1099,os:'Android 16'},
      {name:'Xiaomi 16 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5800,screen:6.7,proc:'Snapdragon 8 Elite 2',price:899,os:'Android 16'},
      {name:'Xiaomi 16',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5500,screen:6.4,proc:'Snapdragon 8 Elite 2',price:699,os:'Android 16'},
      {name:'Xiaomi 15S Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5600,screen:6.7,proc:'Snapdragon 8 Elite',price:849,os:'Android 15'},
      {name:'Xiaomi 14T Pro',cat:'midrange',ram:[12],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Dimensity 9300+',price:549,os:'Android 15'},
      {name:'Xiaomi 14T',cat:'midrange',ram:[8,12],storage:[256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 8300 Ultra',price:399,os:'Android 15'},
      {name:'Xiaomi 15 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:200,bat:5500,screen:6.7,proc:'Snapdragon 8 Elite',price:999,os:'Android 15'},
      {name:'Xiaomi 15 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5500,screen:6.7,proc:'Snapdragon 8 Elite',price:799,os:'Android 15'},
      {name:'Xiaomi 15',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5400,screen:6.4,proc:'Snapdragon 8 Elite',price:649,os:'Android 15'},
      {name:'Xiaomi 14 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5300,screen:6.7,proc:'Snapdragon 8 Gen 3',price:899,os:'Android 14'},
      {name:'Xiaomi 14 Pro',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4880,screen:6.7,proc:'Snapdragon 8 Gen 3',price:699,os:'Android 14'},
      {name:'Xiaomi 14',cat:'flagship',ram:[8,12],storage:[256,512],cam:50,bat:4610,screen:6.4,proc:'Snapdragon 8 Gen 3',price:599,os:'Android 14'},
      {name:'Xiaomi 13 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8 Gen 2',price:799,os:'Android 13'},
      {name:'Xiaomi 13 Pro',cat:'flagship',ram:[8,12],storage:[128,256],cam:50,bat:4820,screen:6.7,proc:'Snapdragon 8 Gen 2',price:649,os:'Android 13'},
      {name:'Xiaomi 13',cat:'flagship',ram:[8,12],storage:[128,256],cam:50,bat:4500,screen:6.4,proc:'Snapdragon 8 Gen 2',price:499,os:'Android 13'},
      {name:'Xiaomi 13T Pro',cat:'midrange',ram:[12],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Dimensity 9200+',price:549,os:'Android 13'},
      {name:'Xiaomi 13T',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 8200 Ultra',price:399,os:'Android 13'},
      {name:'Xiaomi Mix Fold 4',cat:'flagship',ram:[16],storage:[512,1024],cam:50,bat:5100,screen:7.9,proc:'Snapdragon 8 Gen 3',price:1399,os:'Android 14',foldable:true},
      {name:'Xiaomi Mix Flip',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4780,screen:6.9,proc:'Snapdragon 8 Gen 3',price:999,os:'Android 14',foldable:true},
    ]
  },
  Redmi: {
    emoji: '🔴', series: [
      {name:'Redmi Note 15 Pro+',cat:'midrange',ram:[8,12],storage:[128,256,512],cam:200,bat:5200,screen:6.8,proc:'Snapdragon 7s Gen 4',price:379,os:'Android 16'},
      {name:'Redmi Note 15 Pro',cat:'midrange',ram:[6,8,12],storage:[128,256],cam:50,bat:5200,screen:6.8,proc:'Dimensity 7400',price:299,os:'Android 16'},
      {name:'Redmi Note 15',cat:'midrange',ram:[6,8],storage:[128,256],cam:108,bat:5200,screen:6.8,proc:'Dimensity 7100 Ultra',price:219,os:'Android 16'},
      {name:'Redmi K80 Ultra',cat:'flagship',ram:[12,16,24],storage:[256,512,1024],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8 Elite 2',price:499,os:'Android 16'},
      {name:'Redmi K80 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5500,screen:6.7,proc:'Snapdragon 8 Elite',price:449,os:'Android 15'},
      {name:'Redmi K80',cat:'midrange',ram:[8,12],storage:[128,256,512],cam:50,bat:5500,screen:6.7,proc:'Snapdragon 8 Gen 3',price:329,os:'Android 15'},
      {name:'Redmi Turbo 4',cat:'midrange',ram:[8,12],storage:[256,512],cam:50,bat:6200,screen:6.7,proc:'Dimensity 8400',price:279,os:'Android 15'},
      {name:'Redmi 15C',cat:'budget',ram:[4,6,8],storage:[64,128,256],cam:50,bat:5200,screen:6.9,proc:'Helio G91 Ultra',price:119,os:'Android 15'},
      {name:'Redmi Note 14 Pro+',cat:'midrange',ram:[8,12],storage:[128,256,512],cam:200,bat:5110,screen:6.7,proc:'Snapdragon 7s Gen 3',price:349,os:'Android 14'},
      {name:'Redmi Note 14 Pro',cat:'midrange',ram:[6,8,12],storage:[128,256],cam:50,bat:5110,screen:6.7,proc:'Dimensity 7300 Ultra',price:279,os:'Android 14'},
      {name:'Redmi Note 14',cat:'midrange',ram:[6,8],storage:[128,256],cam:108,bat:5110,screen:6.7,proc:'Dimensity 7025 Ultra',price:199,os:'Android 14'},
      {name:'Redmi Note 13 Pro+',cat:'midrange',ram:[8,12],storage:[256,512],cam:200,bat:5000,screen:6.7,proc:'Dimensity 7200 Ultra',price:299,os:'Android 13'},
      {name:'Redmi Note 13 Pro',cat:'midrange',ram:[6,8,12],storage:[128,256],cam:200,bat:5000,screen:6.7,proc:'Snapdragon 7s Gen 2',price:249,os:'Android 13'},
      {name:'Redmi Note 13',cat:'midrange',ram:[6,8],storage:[128,256],cam:108,bat:5000,screen:6.7,proc:'Snapdragon 685',price:179,os:'Android 13'},
      {name:'Redmi Note 12 Pro+',cat:'midrange',ram:[6,8,12],storage:[128,256],cam:200,bat:5000,screen:6.7,proc:'Dimensity 1080',price:249,os:'Android 12'},
      {name:'Redmi Note 12 Pro',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 1080',price:219,os:'Android 12'},
      {name:'Redmi Note 12',cat:'budget',ram:[4,6,8],storage:[64,128],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 685',price:149,os:'Android 12'},
      {name:'Redmi 14C',cat:'budget',ram:[4,6,8],storage:[64,128,256],cam:50,bat:5160,screen:6.9,proc:'Helio G81 Ultra',price:109,os:'Android 14'},
      {name:'Redmi 13C',cat:'budget',ram:[4,6,8],storage:[64,128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 6100+',price:99,os:'Android 13'},
      {name:'Redmi 13',cat:'budget',ram:[6,8],storage:[128,256],cam:108,bat:5030,screen:6.8,proc:'Snapdragon 685',price:149,os:'Android 14'},
      {name:'Redmi A3',cat:'budget',ram:[3,4],storage:[64,128],cam:8,bat:5000,screen:6.7,proc:'Helio G36',price:79,os:'Android 14'},
      {name:'Redmi K70 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5500,screen:6.7,proc:'Dimensity 9300+',price:449,os:'Android 14'},
      {name:'Redmi K70 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8 Gen 3',price:399,os:'Android 14'},
      {name:'Redmi K70',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8 Gen 2',price:299,os:'Android 14'},
      {name:'Redmi K60 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Dimensity 9200+',price:399,os:'Android 13'},
      {name:'Redmi K60 Pro',cat:'flagship',ram:[8,12],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8 Gen 2',price:349,os:'Android 13'},
    ]
  },
  POCO: {
    emoji: '⚡', series: [
      {name:'POCO F7 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6000,screen:6.7,proc:'Snapdragon 8 Elite',price:549,os:'Android 15'},
      {name:'POCO F7 Pro',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5500,screen:6.7,proc:'Snapdragon 8 Gen 3',price:449,os:'Android 15'},
      {name:'POCO F7',cat:'midrange',ram:[8,12],storage:[256,512],cam:50,bat:5200,screen:6.7,proc:'Snapdragon 8s Gen 4',price:379,os:'Android 15'},
      {name:'POCO X7 Pro',cat:'midrange',ram:[8,12],storage:[256,512],cam:50,bat:5110,screen:6.7,proc:'Dimensity 8400 Ultra',price:329,os:'Android 15'},
      {name:'POCO X7',cat:'midrange',ram:[8],storage:[256],cam:50,bat:5110,screen:6.7,proc:'Dimensity 7300 Ultra',price:249,os:'Android 15'},
      {name:'POCO F6 Pro',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8 Gen 2',price:449,os:'Android 14'},
      {name:'POCO F6',cat:'midrange',ram:[8,12],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8s Gen 3',price:349,os:'Android 14'},
      {name:'POCO F5 Pro',cat:'flagship',ram:[8,12],storage:[256,512],cam:64,bat:5160,screen:6.7,proc:'Snapdragon 8+ Gen 1',price:379,os:'Android 13'},
      {name:'POCO F5',cat:'midrange',ram:[8,12],storage:[256],cam:64,bat:5000,screen:6.7,proc:'Snapdragon 7+ Gen 2',price:299,os:'Android 13'},
      {name:'POCO X6 Pro',cat:'midrange',ram:[8,12],storage:[256,512],cam:64,bat:5000,screen:6.7,proc:'Dimensity 8300 Ultra',price:299,os:'Android 14'},
      {name:'POCO X6',cat:'midrange',ram:[8,12],storage:[256],cam:64,bat:5100,screen:6.7,proc:'Snapdragon 7s Gen 2',price:249,os:'Android 14'},
      {name:'POCO X5 Pro',cat:'midrange',ram:[6,8],storage:[128,256],cam:108,bat:5000,screen:6.7,proc:'Snapdragon 778G',price:249,os:'Android 12'},
      {name:'POCO M6 Pro',cat:'budget',ram:[6,8],storage:[128,256],cam:64,bat:5000,screen:6.7,proc:'Helio G99 Ultra',price:199,os:'Android 14'},
      {name:'POCO M6',cat:'budget',ram:[6,8],storage:[128,256],cam:108,bat:5030,screen:6.8,proc:'Snapdragon 685',price:149,os:'Android 14'},
      {name:'POCO C65',cat:'budget',ram:[4,6,8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Helio G85',price:99,os:'Android 13'},
    ]
  },
  OnePlus: {
    emoji: '🔵', series: [
      {name:'OnePlus 14',cat:'flagship',ram:[12,16,24],storage:[256,512],cam:50,bat:6200,screen:6.8,proc:'Snapdragon 8 Elite 2',price:999,os:'Android 16'},
      {name:'OnePlus 13T',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8 Elite',price:799,os:'Android 15'},
      {name:'OnePlus Nord 5',cat:'midrange',ram:[8,12],storage:[128,256,512],cam:50,bat:6000,screen:6.7,proc:'Snapdragon 7+ Gen 4',price:429,os:'Android 15'},
      {name:'OnePlus Open 2',cat:'flagship',ram:[16,24],storage:[512,1024],cam:50,bat:5500,screen:8.0,proc:'Snapdragon 8 Elite 2',price:1799,os:'Android 16',foldable:true},
      {name:'OnePlus 13',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8 Elite',price:899,os:'Android 15'},
      {name:'OnePlus 12',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5400,screen:6.8,proc:'Snapdragon 8 Gen 3',price:749,os:'Android 14'},
      {name:'OnePlus 12R',cat:'midrange',ram:[8,16],storage:[128,256],cam:50,bat:5500,screen:6.8,proc:'Snapdragon 8 Gen 2',price:499,os:'Android 14'},
      {name:'OnePlus 11',cat:'flagship',ram:[8,16],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8 Gen 2',price:599,os:'Android 13'},
      {name:'OnePlus Nord 4',cat:'midrange',ram:[8,12,16],storage:[128,256,512],cam:50,bat:5500,screen:6.7,proc:'Snapdragon 7+ Gen 3',price:399,os:'Android 14'},
      {name:'OnePlus Nord 3',cat:'midrange',ram:[8,16],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 9000',price:349,os:'Android 13'},
      {name:'OnePlus Nord CE 4',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:5500,screen:6.7,proc:'Snapdragon 7 Gen 3',price:299,os:'Android 14'},
      {name:'OnePlus Nord CE 3',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 782G',price:249,os:'Android 13'},
      {name:'OnePlus Open',cat:'flagship',ram:[16],storage:[512],cam:48,bat:4805,screen:7.8,proc:'Snapdragon 8 Gen 2',price:1699,os:'Android 14',foldable:true},
      {name:'OnePlus Nord N30',cat:'budget',ram:[8],storage:[128],cam:108,bat:5000,screen:6.7,proc:'Snapdragon 695',price:199,os:'Android 13'},
    ]
  },
  Google: {
    emoji: '🟢', series: [
      {name:'Pixel 10 Pro XL',cat:'flagship',ram:[16],storage:[128,256,512,1024],cam:50,bat:5400,screen:6.9,proc:'Tensor G5',price:1199,os:'Android 16'},
      {name:'Pixel 10 Pro',cat:'flagship',ram:[16],storage:[128,256,512],cam:50,bat:4900,screen:6.3,proc:'Tensor G5',price:1099,os:'Android 16'},
      {name:'Pixel 10',cat:'flagship',ram:[12],storage:[128,256],cam:50,bat:4900,screen:6.3,proc:'Tensor G5',price:899,os:'Android 16'},
      {name:'Pixel 10 Pro Fold',cat:'flagship',ram:[16],storage:[256,512],cam:50,bat:5000,screen:8.0,proc:'Tensor G5',price:1899,os:'Android 16',foldable:true},
      {name:'Pixel 9a',cat:'midrange',ram:[8],storage:[128,256],cam:48,bat:4500,screen:6.3,proc:'Tensor G4',price:399,os:'Android 15'},
      {name:'Pixel 9 Pro XL',cat:'flagship',ram:[16],storage:[128,256,512,1024],cam:50,bat:5060,screen:6.8,proc:'Tensor G4',price:1099,os:'Android 15'},
      {name:'Pixel 9 Pro',cat:'flagship',ram:[16],storage:[128,256,512,1024],cam:50,bat:4720,screen:6.3,proc:'Tensor G4',price:999,os:'Android 15'},
      {name:'Pixel 9',cat:'flagship',ram:[12],storage:[128,256],cam:50,bat:4700,screen:6.3,proc:'Tensor G4',price:799,os:'Android 15'},
      {name:'Pixel 9 Pro Fold',cat:'flagship',ram:[16],storage:[256,512],cam:48,bat:4650,screen:8.0,proc:'Tensor G4',price:1799,os:'Android 15',foldable:true},
      {name:'Pixel 8 Pro',cat:'flagship',ram:[12],storage:[128,256,512,1024],cam:50,bat:5050,screen:6.7,proc:'Tensor G3',price:799,os:'Android 14'},
      {name:'Pixel 8',cat:'flagship',ram:[8],storage:[128,256],cam:50,bat:4575,screen:6.2,proc:'Tensor G3',price:599,os:'Android 14'},
      {name:'Pixel 8a',cat:'midrange',ram:[8],storage:[128,256],cam:64,bat:4492,screen:6.1,proc:'Tensor G3',price:449,os:'Android 14'},
      {name:'Pixel 7 Pro',cat:'flagship',ram:[12],storage:[128,256,512],cam:50,bat:5000,screen:6.7,proc:'Tensor G2',price:649,os:'Android 13'},
      {name:'Pixel 7',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:4355,screen:6.3,proc:'Tensor G2',price:449,os:'Android 13'},
      {name:'Pixel 7a',cat:'midrange',ram:[8],storage:[128],cam:64,bat:4385,screen:6.1,proc:'Tensor G2',price:349,os:'Android 13'},
    ]
  },
  Huawei: {
    emoji: '🟡', series: [
      {name:'Huawei Mate 70 Pro+',cat:'flagship',ram:[16],storage:[512,1024],cam:50,bat:5600,screen:6.9,proc:'Kirin 9100',price:1299,os:'HarmonyOS 5'},
      {name:'Huawei Mate 70 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5400,screen:6.8,proc:'Kirin 9100',price:999,os:'HarmonyOS 5'},
      {name:'Huawei Mate 70',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5200,screen:6.7,proc:'Kirin 9100',price:849,os:'HarmonyOS 5'},
      {name:'Huawei Pura 70 Ultra',cat:'flagship',ram:[16],storage:[512,1024],cam:50,bat:5200,screen:6.8,proc:'Kirin 9010',price:1199,os:'HarmonyOS 4'},
      {name:'Huawei Pura 70 Pro',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5000,screen:6.8,proc:'Kirin 9010',price:899,os:'HarmonyOS 4'},
      {name:'Huawei Mate 60 Pro+',cat:'flagship',ram:[16],storage:[512,1024],cam:48,bat:5000,screen:6.8,proc:'Kirin 9000S',price:1099,os:'HarmonyOS 4'},
      {name:'Huawei Mate 60 Pro',cat:'flagship',ram:[12],storage:[256,512],cam:48,bat:5000,screen:6.8,proc:'Kirin 9000S',price:899,os:'HarmonyOS 4'},
      {name:'Huawei Mate 60',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:4750,screen:6.7,proc:'Kirin 9000S',price:749,os:'HarmonyOS 4'},
      {name:'Huawei Mate X5',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5060,screen:7.9,proc:'Kirin 9000S',price:1799,os:'HarmonyOS 4',foldable:true},
      {name:'Huawei P60 Pro',cat:'flagship',ram:[8,12],storage:[256,512],cam:48,bat:4815,screen:6.7,proc:'Snapdragon 8+ Gen 1',price:799,os:'HarmonyOS 3'},
      {name:'Huawei P60',cat:'flagship',ram:[8],storage:[128,256],cam:48,bat:4815,screen:6.7,proc:'Snapdragon 8+ Gen 1',price:649,os:'HarmonyOS 3'},
      {name:'Huawei Nova 12 Ultra',cat:'midrange',ram:[12],storage:[256,512],cam:50,bat:5000,screen:6.8,proc:'Kirin 9000SL',price:549,os:'HarmonyOS 4'},
      {name:'Huawei Nova 12 Pro',cat:'midrange',ram:[8,12],storage:[256],cam:50,bat:4700,screen:6.7,proc:'Kirin 830',price:449,os:'HarmonyOS 4'},
      {name:'Huawei Nova 12',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:4500,screen:6.7,proc:'Snapdragon 778G',price:349,os:'HarmonyOS 4'},
      {name:'Huawei Nova 11',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:4500,screen:6.7,proc:'Snapdragon 778G',price:299,os:'HarmonyOS 3'},
    ]
  },
  Oppo: {
    emoji: '💚', series: [
      {name:'Oppo Find X7 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5400,screen:6.8,proc:'Snapdragon 8 Gen 3',price:899,os:'Android 14'},
      {name:'Oppo Find X7',cat:'flagship',ram:[12,16],storage:[256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 9300',price:649,os:'Android 14'},
      {name:'Oppo Find N3',cat:'flagship',ram:[16],storage:[512],cam:48,bat:4805,screen:7.8,proc:'Snapdragon 8 Gen 2',price:1399,os:'Android 14',foldable:true},
      {name:'Oppo Reno 12 Pro',cat:'midrange',ram:[12],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Dimensity 9200+',price:449,os:'Android 14'},
      {name:'Oppo Reno 12',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7300',price:349,os:'Android 14'},
      {name:'Oppo Reno 11 Pro',cat:'midrange',ram:[12],storage:[256],cam:50,bat:4600,screen:6.7,proc:'Dimensity 8200',price:399,os:'Android 14'},
      {name:'Oppo Reno 11',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7050',price:299,os:'Android 14'},
      {name:'Oppo A79',cat:'budget',ram:[4,8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 6020',price:229,os:'Android 13'},
      {name:'Oppo A60',cat:'budget',ram:[4,8],storage:[64,128],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 680',price:169,os:'Android 14'},
      {name:'Oppo A38',cat:'budget',ram:[4,6],storage:[128],cam:50,bat:5000,screen:6.6,proc:'Helio G85',price:139,os:'Android 13'},
      {name:'Oppo A18',cat:'budget',ram:[4],storage:[64,128],cam:8,bat:5000,screen:6.6,proc:'Helio G85',price:109,os:'Android 13'},
    ]
  },
  Vivo: {
    emoji: '💙', series: [
      {name:'Vivo X300 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:200,bat:6200,screen:6.8,proc:'Dimensity 9500',price:899,os:'Android 16'},
      {name:'Vivo X300',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:6000,screen:6.7,proc:'Dimensity 9500',price:699,os:'Android 16'},
      {name:'Vivo X200 Ultra',cat:'flagship',ram:[16],storage:[256,512],cam:200,bat:6000,screen:6.8,proc:'Snapdragon 8 Elite',price:999,os:'Android 15'},
      {name:'Vivo X200 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:200,bat:6000,screen:6.8,proc:'Dimensity 9400',price:849,os:'Android 15'},
      {name:'Vivo X200',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5800,screen:6.7,proc:'Dimensity 9400',price:649,os:'Android 15'},
      {name:'Vivo X100 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:200,bat:5500,screen:6.8,proc:'Snapdragon 8 Gen 3',price:899,os:'Android 14'},
      {name:'Vivo X100 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5400,screen:6.8,proc:'Dimensity 9300',price:749,os:'Android 14'},
      {name:'Vivo X100',cat:'flagship',ram:[8,12],storage:[256,512],cam:50,bat:5000,screen:6.7,proc:'Dimensity 9300',price:599,os:'Android 14'},
      {name:'Vivo X Fold 3 Pro',cat:'flagship',ram:[16],storage:[512],cam:50,bat:5700,screen:8.0,proc:'Snapdragon 8 Gen 3',price:1499,os:'Android 14',foldable:true},
      {name:'Vivo V40 Pro',cat:'midrange',ram:[8,12],storage:[256,512],cam:50,bat:5500,screen:6.8,proc:'Dimensity 9200+',price:449,os:'Android 14'},
      {name:'Vivo V40',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5500,screen:6.8,proc:'Snapdragon 7 Gen 3',price:349,os:'Android 14'},
      {name:'Vivo V30 Pro',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.8,proc:'Snapdragon 7 Gen 3',price:399,os:'Android 14'},
      {name:'Vivo V30',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.8,proc:'Snapdragon 7 Gen 1',price:299,os:'Android 14'},
      {name:'Vivo Y200',cat:'budget',ram:[8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 4 Gen 2',price:229,os:'Android 14'},
      {name:'Vivo Y100',cat:'budget',ram:[8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 685',price:199,os:'Android 14'},
      {name:'Vivo Y36',cat:'budget',ram:[4,8],storage:[64,128],cam:50,bat:5000,screen:6.6,proc:'Snapdragon 680',price:149,os:'Android 13'},
      {name:'Vivo Y17s',cat:'budget',ram:[4,6],storage:[64,128],cam:50,bat:5000,screen:6.6,proc:'Helio G85',price:119,os:'Android 13'},
    ]
  },
  Realme: {
    emoji: '🟤', series: [
      {name:'Realme GT 7 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6500,screen:6.8,proc:'Snapdragon 8 Elite',price:549,os:'Android 15'},
      {name:'Realme GT 7',cat:'flagship',ram:[8,12],storage:[256,512],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8s Gen 4',price:449,os:'Android 15'},
      {name:'Realme 14 Pro+',cat:'midrange',ram:[8,12],storage:[128,256,512],cam:50,bat:6000,screen:6.7,proc:'Snapdragon 7s Gen 3',price:329,os:'Android 15'},
      {name:'Realme 14 Pro',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:5800,screen:6.7,proc:'Snapdragon 7s Gen 3',price:269,os:'Android 15'},
      {name:'Realme GT 6',cat:'flagship',ram:[8,12,16],storage:[256,512],cam:50,bat:5500,screen:6.8,proc:'Snapdragon 8s Gen 3',price:449,os:'Android 14'},
      {name:'Realme GT 5 Pro',cat:'flagship',ram:[8,12,16],storage:[128,256,512],cam:50,bat:5400,screen:6.8,proc:'Snapdragon 8 Gen 3',price:499,os:'Android 14'},
      {name:'Realme GT Neo 6',cat:'midrange',ram:[8,12],storage:[256,512],cam:50,bat:5500,screen:6.8,proc:'Snapdragon 8s Gen 3',price:349,os:'Android 14'},
      {name:'Realme GT Neo 5',cat:'midrange',ram:[8,12,16],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 8+ Gen 1',price:299,os:'Android 13'},
      {name:'Realme 13 Pro+',cat:'midrange',ram:[8,12],storage:[128,256,512],cam:50,bat:5200,screen:6.7,proc:'Snapdragon 7s Gen 2',price:299,os:'Android 14'},
      {name:'Realme 13 Pro',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5200,screen:6.7,proc:'Snapdragon 7s Gen 2',price:249,os:'Android 14'},
      {name:'Realme 12 Pro+',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 7s Gen 2',price:279,os:'Android 14'},
      {name:'Realme 12 Pro',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 6 Gen 1',price:229,os:'Android 14'},
      {name:'Realme C67',cat:'budget',ram:[6,8],storage:[128,256],cam:108,bat:5000,screen:6.7,proc:'Snapdragon 685',price:139,os:'Android 14'},
      {name:'Realme C55',cat:'budget',ram:[6,8],storage:[64,128,256],cam:64,bat:5000,screen:6.7,proc:'Helio G88',price:129,os:'Android 13'},
      {name:'Realme Narzo 70 Pro',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7050',price:219,os:'Android 14'},
      {name:'Realme Narzo 70',cat:'budget',ram:[6,8],storage:[128],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7025',price:169,os:'Android 14'},
    ]
  },
  Nothing: {
    emoji: '⚪', series: [
      {name:'Nothing Phone (2a) Plus',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7350 Pro',price:399,os:'Android 14'},
      {name:'Nothing Phone (2a)',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7200 Pro',price:329,os:'Android 14'},
      {name:'Nothing Phone (2)',cat:'flagship',ram:[8,12],storage:[128,256,512],cam:50,bat:4700,screen:6.7,proc:'Snapdragon 8+ Gen 1',price:549,os:'Android 14'},
      {name:'Nothing Phone (1)',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:4500,screen:6.6,proc:'Snapdragon 778G+',price:349,os:'Android 12'},
      {name:'Nothing CMF Phone 1',cat:'budget',ram:[6,8],storage:[128],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7300',price:199,os:'Android 14'},
    ]
  },
  Motorola: {
    emoji: '🔷', series: [
      {name:'Motorola Edge 50 Ultra',cat:'flagship',ram:[16],storage:[512,1024],cam:50,bat:4500,screen:6.7,proc:'Snapdragon 8s Gen 3',price:799,os:'Android 14'},
      {name:'Motorola Edge 50 Pro',cat:'midrange',ram:[12],storage:[256,512],cam:50,bat:4500,screen:6.7,proc:'Snapdragon 7 Gen 3',price:499,os:'Android 14'},
      {name:'Motorola Edge 50 Fusion',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 7s Gen 2',price:349,os:'Android 14'},
      {name:'Motorola Razr 50 Ultra',cat:'flagship',ram:[12],storage:[512],cam:50,bat:4000,screen:6.9,proc:'Snapdragon 8s Gen 3',price:999,os:'Android 14',foldable:true},
      {name:'Motorola Razr 50',cat:'midrange',ram:[8],storage:[256],cam:50,bat:4200,screen:6.9,proc:'Dimensity 7300X',price:699,os:'Android 14',foldable:true},
      {name:'Moto G85',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Snapdragon 6s Gen 3',price:249,os:'Android 14'},
      {name:'Moto G75',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:5000,screen:6.8,proc:'Snapdragon 6 Gen 3',price:229,os:'Android 14'},
      {name:'Moto G55',cat:'budget',ram:[4,8],storage:[64,128],cam:50,bat:5000,screen:6.5,proc:'Dimensity 7025',price:179,os:'Android 14'},
      {name:'Moto G35',cat:'budget',ram:[4,8],storage:[64,128],cam:50,bat:5000,screen:6.7,proc:'Unisoc T760',price:139,os:'Android 14'},
      {name:'Moto G24',cat:'budget',ram:[4,8],storage:[64,128],cam:50,bat:5000,screen:6.6,proc:'Helio G85',price:119,os:'Android 14'},
    ]
  },
  Honor: {
    emoji: '🔶', series: [
      {name:'Honor Magic 7 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5850,screen:6.8,proc:'Snapdragon 8 Elite',price:899,os:'Android 15'},
      {name:'Honor Magic 7',cat:'flagship',ram:[8,12],storage:[256,512],cam:50,bat:5550,screen:6.8,proc:'Snapdragon 8 Elite',price:699,os:'Android 15'},
      {name:'Honor Magic 7 Lite',cat:'midrange',ram:[8],storage:[128,256],cam:108,bat:6600,screen:6.8,proc:'Snapdragon 6 Gen 1',price:299,os:'Android 15'},
      {name:'Honor 300 Pro',cat:'midrange',ram:[12],storage:[256,512],cam:50,bat:5300,screen:6.8,proc:'Dimensity 8200',price:449,os:'Android 15'},
      {name:'Honor 300',cat:'midrange',ram:[8,12],storage:[256],cam:50,bat:5300,screen:6.7,proc:'Snapdragon 7 Gen 3',price:349,os:'Android 15'},
      {name:'Honor Magic 6 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5600,screen:6.8,proc:'Snapdragon 8 Gen 3',price:799,os:'Android 14'},
      {name:'Honor Magic 6',cat:'flagship',ram:[8,12],storage:[256,512],cam:50,bat:5100,screen:6.8,proc:'Snapdragon 8 Gen 3',price:599,os:'Android 14'},
      {name:'Honor Magic V3',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5150,screen:7.9,proc:'Snapdragon 8 Gen 3',price:1599,os:'Android 14',foldable:true},
      {name:'Honor Magic V2',cat:'flagship',ram:[16],storage:[256,512],cam:50,bat:5000,screen:7.9,proc:'Snapdragon 8 Gen 2',price:1299,os:'Android 13',foldable:true},
      {name:'Honor 200 Pro',cat:'midrange',ram:[12],storage:[256,512],cam:50,bat:5200,screen:6.8,proc:'Snapdragon 8s Gen 3',price:449,os:'Android 14'},
      {name:'Honor 200',cat:'midrange',ram:[8,12],storage:[256],cam:50,bat:5200,screen:6.7,proc:'Snapdragon 7 Gen 3',price:349,os:'Android 14'},
      {name:'Honor X9b',cat:'midrange',ram:[8,12],storage:[128,256],cam:108,bat:5800,screen:6.8,proc:'Snapdragon 6 Gen 1',price:249,os:'Android 13'},
      {name:'Honor X8b',cat:'budget',ram:[8],storage:[128,256],cam:108,bat:4500,screen:6.7,proc:'Snapdragon 680',price:199,os:'Android 14'},
      {name:'Honor X7b',cat:'budget',ram:[6,8],storage:[128],cam:108,bat:6000,screen:6.8,proc:'Snapdragon 680',price:169,os:'Android 13'},
      {name:'Honor X6b',cat:'budget',ram:[4,6],storage:[64,128],cam:50,bat:5200,screen:6.6,proc:'Helio G85',price:129,os:'Android 14'},
    ]
  },
  Sony: {
    emoji: '🎵', series: [
      {name:'Sony Xperia 1 VI',cat:'flagship',ram:[12],storage:[256,512],cam:48,bat:5000,screen:6.5,proc:'Snapdragon 8 Gen 3',price:1299,os:'Android 14'},
      {name:'Sony Xperia 1 V',cat:'flagship',ram:[12],storage:[256,512],cam:52,bat:5000,screen:6.5,proc:'Snapdragon 8 Gen 2',price:1099,os:'Android 13'},
      {name:'Sony Xperia 5 V',cat:'flagship',ram:[8],storage:[128,256],cam:48,bat:5000,screen:6.1,proc:'Snapdragon 8 Gen 2',price:799,os:'Android 13'},
      {name:'Sony Xperia 10 VI',cat:'midrange',ram:[6],storage:[128],cam:48,bat:5000,screen:6.1,proc:'Snapdragon 6 Gen 1',price:349,os:'Android 14'},
      {name:'Sony Xperia 10 V',cat:'midrange',ram:[6],storage:[128],cam:48,bat:5000,screen:6.1,proc:'Snapdragon 695',price:299,os:'Android 13'},
    ]
  },
  Nokia: {
    emoji: '🔵', series: [
      {name:'Nokia X30',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:4200,screen:6.4,proc:'Snapdragon 695',price:349,os:'Android 12'},
      {name:'Nokia G42',cat:'budget',ram:[4,6],storage:[128],cam:50,bat:5000,screen:6.6,proc:'Snapdragon 480+',price:179,os:'Android 13'},
      {name:'Nokia G22',cat:'budget',ram:[4,6],storage:[64,128],cam:50,bat:5050,screen:6.5,proc:'Unisoc T606',price:139,os:'Android 12'},
      {name:'Nokia C32',cat:'budget',ram:[3,4],storage:[64,128],cam:50,bat:5000,screen:6.5,proc:'Unisoc SC9863A',price:109,os:'Android 13'},
      {name:'Nokia C22',cat:'budget',ram:[2,4],storage:[32,64],cam:13,bat:5000,screen:6.5,proc:'Unisoc SC9863A',price:89,os:'Android 13'},
    ]
  },
  ASUS: {
    emoji: '🎮', series: [
      {name:'ASUS ROG Phone 8 Pro',cat:'flagship',ram:[16,24],storage:[512,1024],cam:50,bat:5500,screen:6.8,proc:'Snapdragon 8 Gen 3',price:1099,os:'Android 14'},
      {name:'ASUS ROG Phone 8',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5500,screen:6.8,proc:'Snapdragon 8 Gen 3',price:899,os:'Android 14'},
      {name:'ASUS ROG Phone 7 Ultimate',cat:'flagship',ram:[16],storage:[512],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8 Gen 2',price:999,os:'Android 13'},
      {name:'ASUS Zenfone 11 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5500,screen:6.8,proc:'Snapdragon 8 Gen 3',price:799,os:'Android 14'},
      {name:'ASUS Zenfone 10',cat:'flagship',ram:[8,16],storage:[128,256,512],cam:50,bat:4300,screen:5.9,proc:'Snapdragon 8 Gen 2',price:599,os:'Android 13'},
    ]
  },
  Tecno: {
    emoji: '🟦', series: [
      {name:'Tecno Phantom V Fold 2',cat:'flagship',ram:[12],storage:[256,512],cam:50,bat:5750,screen:7.9,proc:'Dimensity 9200+',price:999,os:'Android 14',foldable:true},
      {name:'Tecno Phantom V Flip 2',cat:'midrange',ram:[8],storage:[256],cam:50,bat:4000,screen:6.9,proc:'Dimensity 8050',price:599,os:'Android 14',foldable:true},
      {name:'Tecno Phantom X2 Pro',cat:'flagship',ram:[12],storage:[256],cam:64,bat:5000,screen:6.8,proc:'Dimensity 9000',price:549,os:'Android 13'},
      {name:'Tecno Camon 30 Pro',cat:'midrange',ram:[8,12],storage:[256,512],cam:50,bat:5000,screen:6.8,proc:'Dimensity 8200',price:349,os:'Android 14'},
      {name:'Tecno Camon 30',cat:'midrange',ram:[8],storage:[128,256],cam:50,bat:5000,screen:6.8,proc:'Dimensity 7020',price:249,os:'Android 14'},
      {name:'Tecno Camon 20 Pro',cat:'midrange',ram:[8],storage:[256],cam:64,bat:5000,screen:6.7,proc:'Dimensity 8050',price:279,os:'Android 13'},
      {name:'Tecno Spark 20 Pro+',cat:'budget',ram:[8],storage:[256],cam:108,bat:5000,screen:6.8,proc:'Helio G99',price:179,os:'Android 14'},
      {name:'Tecno Spark 20 Pro',cat:'budget',ram:[8],storage:[256],cam:50,bat:5000,screen:6.8,proc:'Helio G85',price:149,os:'Android 13'},
      {name:'Tecno Spark 20',cat:'budget',ram:[4,8],storage:[64,128],cam:50,bat:5000,screen:6.6,proc:'Helio G85',price:109,os:'Android 13'},
      {name:'Tecno Pova 6 Pro',cat:'midrange',ram:[8,12],storage:[256],cam:108,bat:6000,screen:6.8,proc:'Dimensity 6300',price:219,os:'Android 14'},
      {name:'Tecno Pova 5 Pro',cat:'budget',ram:[8],storage:[128,256],cam:108,bat:5000,screen:6.8,proc:'Dimensity 6080',price:179,os:'Android 13'},
    ]
  },
  Infinix: {
    emoji: '🟩', series: [
      {name:'Infinix Zero 40',cat:'midrange',ram:[12],storage:[256,512],cam:108,bat:5000,screen:6.8,proc:'Dimensity 8200',price:299,os:'Android 14'},
      {name:'Infinix Zero 30',cat:'midrange',ram:[8,12],storage:[128,256],cam:108,bat:5000,screen:6.8,proc:'Dimensity 8020',price:249,os:'Android 13'},
      {name:'Infinix GT 20 Pro',cat:'midrange',ram:[8,12],storage:[256],cam:108,bat:5000,screen:6.7,proc:'Dimensity 8200 Ultra',price:279,os:'Android 14'},
      {name:'Infinix Note 40 Pro',cat:'midrange',ram:[8],storage:[256],cam:108,bat:5000,screen:6.8,proc:'Dimensity 7020',price:219,os:'Android 14'},
      {name:'Infinix Note 40',cat:'midrange',ram:[8],storage:[128,256],cam:108,bat:5000,screen:6.8,proc:'Helio G99',price:179,os:'Android 14'},
      {name:'Infinix Note 30 Pro',cat:'midrange',ram:[8],storage:[128,256],cam:108,bat:5000,screen:6.7,proc:'Helio G99',price:199,os:'Android 13'},
      {name:'Infinix Hot 40 Pro',cat:'budget',ram:[8],storage:[256],cam:108,bat:5000,screen:6.8,proc:'Helio G99',price:149,os:'Android 14'},
      {name:'Infinix Hot 40',cat:'budget',ram:[8],storage:[128],cam:50,bat:5000,screen:6.8,proc:'Helio G88',price:119,os:'Android 14'},
      {name:'Infinix Hot 30',cat:'budget',ram:[4,8],storage:[64,128],cam:50,bat:5000,screen:6.8,proc:'Helio G88',price:99,os:'Android 13'},
      {name:'Infinix Smart 8',cat:'budget',ram:[3,4],storage:[64],cam:13,bat:5000,screen:6.6,proc:'Helio G36',price:79,os:'Android 13'},
    ]
  },
  iQOO: {
    emoji: '⚡', series: [
      {name:'iQOO 14',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6500,screen:6.8,proc:'Snapdragon 8 Elite 2',price:699,os:'Android 16'},
      {name:'iQOO 14 Pro',cat:'flagship',ram:[16],storage:[256,512],cam:50,bat:6200,screen:6.8,proc:'Snapdragon 8 Elite 2',price:799,os:'Android 16'},
      {name:'iQOO Neo 10 Pro',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:6100,screen:6.8,proc:'Snapdragon 8 Elite',price:449,os:'Android 15'},
      {name:'iQOO 13',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8 Elite',price:649,os:'Android 15'},
      {name:'iQOO 12',cat:'flagship',ram:[8,12,16],storage:[256,512],cam:50,bat:5000,screen:6.8,proc:'Snapdragon 8 Gen 3',price:549,os:'Android 14'},
      {name:'iQOO Neo 9 Pro',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5160,screen:6.8,proc:'Snapdragon 8 Gen 2',price:399,os:'Android 14'},
      {name:'iQOO Neo 9',cat:'midrange',ram:[8,12],storage:[128,256],cam:50,bat:5160,screen:6.8,proc:'Snapdragon 8s Gen 3',price:349,os:'Android 14'},
      {name:'iQOO Z9 Turbo',cat:'midrange',ram:[8,12],storage:[128,256,512],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8s Gen 3',price:249,os:'Android 14'},
      {name:'iQOO Z9',cat:'midrange',ram:[6,8],storage:[128,256],cam:50,bat:5000,screen:6.7,proc:'Dimensity 7200',price:199,os:'Android 14'},
    ]
  },
  ZTE: {
    emoji: '🔺', series: [
      {name:'ZTE Nubia Z60 Ultra',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6000,screen:6.8,proc:'Snapdragon 8 Gen 3',price:599,os:'Android 14'},
      {name:'ZTE Nubia Z60S Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:5100,screen:6.7,proc:'Snapdragon 8 Gen 3',price:499,os:'Android 14'},
      {name:'ZTE Nubia Red Magic 9 Pro',cat:'flagship',ram:[12,16],storage:[256,512],cam:50,bat:6500,screen:6.8,proc:'Snapdragon 8 Gen 3',price:649,os:'Android 14'},
      {name:'ZTE Blade V50',cat:'budget',ram:[4,8],storage:[128],cam:50,bat:5000,screen:6.7,proc:'Unisoc T606',price:149,os:'Android 14'},
    ]
  }
};

// Generate price history
function generatePriceHistory(basePrice) {
  const history = [];
  const now = new Date();
  let price = basePrice * (1 + (Math.random() * 0.15));
  for (let i = 180; i >= 0; i -= Math.floor(Math.random() * 5 + 3)) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * basePrice * 0.03;
    price = Math.max(basePrice * 0.75, Math.min(basePrice * 1.25, price + change));
    history.push({ date: date.toISOString().split('T')[0], price: Math.round(price) });
  }
  // Ensure last entry is close to current price
  history.push({ date: now.toISOString().split('T')[0], price: basePrice });
  return history;
}

// Generate all phones
const PHONES_DB = [];
let phoneId = 1;

Object.entries(BRAND_DATA).forEach(([brand, data]) => {
  data.series.forEach(model => {
    // Generate variant for first RAM/Storage combo
    const ram = model.ram[0];
    const storage = model.storage[0];
    const basePrice = model.price;
    const priceHistory = generatePriceHistory(basePrice);
    const prevPrice = priceHistory.length > 2 ? priceHistory[priceHistory.length - 3].price : basePrice;
    const priceChange = basePrice - prevPrice;
    const priceChangePercent = ((priceChange / prevPrice) * 100).toFixed(1);
    
    PHONES_DB.push({
      id: phoneId++,
      brand,
      model: model.name,
      brandColor: BRAND_COLORS[brand] || 'linear-gradient(135deg, #666, #999)',
      category: model.cat,
      price: basePrice,
      priceChange,
      priceChangePercent: parseFloat(priceChangePercent),
      priceHistory,
      specs: {
        ram,
        storage,
        camera: model.cam,
        battery: model.bat,
        screen: model.screen,
        processor: model.proc,
        os: model.os,
        foldable: model.foldable || false,
        fiveG: model.cat !== 'budget' || ram >= 6,
        nfc: model.cat !== 'budget',
        weight: Math.floor(160 + Math.random() * 60) + 'g',
        screenType: model.cat === 'flagship' ? 'AMOLED' : (model.cat === 'midrange' ? 'AMOLED' : 'IPS LCD'),
      },
      ramOptions: model.ram,
      storageOptions: model.storage,
      rating: model.cat === 'flagship' ? +(4 + Math.random() * 0.8).toFixed(1) : model.cat === 'midrange' ? +(3.5 + Math.random() * 1).toFixed(1) : +(3 + Math.random() * 1.2).toFixed(1),
    });

    // Generate additional variants for different RAM/storage combinations  
    if (model.ram.length > 1 || model.storage.length > 1) {
      for (let ri = 0; ri < model.ram.length; ri++) {
        for (let si = 0; si < model.storage.length; si++) {
          if (ri === 0 && si === 0) continue; // skip first combo already added
          const r = model.ram[ri];
          const s = model.storage[si];
          const priceMod = (ri * 30) + (si * 50);
          const vPrice = basePrice + priceMod;
          const vHistory = generatePriceHistory(vPrice);
          const vPrev = vHistory.length > 2 ? vHistory[vHistory.length - 3].price : vPrice;
          const vChange = vPrice - vPrev;
          const vPct = ((vChange / vPrev) * 100).toFixed(1);
          
          PHONES_DB.push({
            id: phoneId++,
            brand,
            model: model.name + ` (${r}GB/${s}GB)`,
            brandColor: BRAND_COLORS[brand] || 'linear-gradient(135deg, #666, #999)',
            category: model.cat,
            price: vPrice,
            priceChange: vChange,
            priceChangePercent: parseFloat(vPct),
            priceHistory: vHistory,
            specs: {
              ram: r,
              storage: s,
              camera: model.cam,
              battery: model.bat,
              screen: model.screen,
              processor: model.proc,
              os: model.os,
              foldable: model.foldable || false,
              fiveG: model.cat !== 'budget' || r >= 6,
              nfc: model.cat !== 'budget',
              weight: Math.floor(160 + Math.random() * 60) + 'g',
              screenType: model.cat === 'flagship' ? 'AMOLED' : (model.cat === 'midrange' ? 'AMOLED' : 'IPS LCD'),
            },
            ramOptions: model.ram,
            storageOptions: model.storage,
            rating: model.cat === 'flagship' ? +(4 + Math.random() * 0.8).toFixed(1) : model.cat === 'midrange' ? +(3.5 + Math.random() * 1).toFixed(1) : +(3 + Math.random() * 1.2).toFixed(1),
          });
        }
      }
    }
  });
});

console.log(`PhoneVerse DB loaded: ${PHONES_DB.length} phones from ${Object.keys(BRAND_DATA).length} brands`);
