// Comprehensive Korean & Global Food Nutritional Knowledge Base
// Nutritional values: [Calories (kcal), Carbs (g), Protein (g), Fat (g), Fiber (g)] per baseline unit

export const FOOD_DATABASE = {
  // 한식 & 주식
  '제육볶음': { name: '제육볶음', unit: '1인분 (200g)', baseGram: 200, kcal: 460, carbs: 14, protein: 32, fat: 30, fiber: 2 },
  '제육': { name: '제육볶음', unit: '1인분 (200g)', baseGram: 200, kcal: 460, carbs: 14, protein: 32, fat: 30, fiber: 2 },
  '밥': { name: '흰쌀밥', unit: '1공기 (210g)', baseGram: 210, kcal: 300, carbs: 68, protein: 6, fat: 0.8, fiber: 1.2 },
  '공기밥': { name: '흰쌀밥', unit: '1공기 (210g)', baseGram: 210, kcal: 300, carbs: 68, protein: 6, fat: 0.8, fiber: 1.2 },
  '쌀밥': { name: '흰쌀밥', unit: '1공기 (210g)', baseGram: 210, kcal: 300, carbs: 68, protein: 6, fat: 0.8, fiber: 1.2 },
  '햇반': { name: '흰쌀밥(햇반)', unit: '1개 (210g)', baseGram: 210, kcal: 300, carbs: 68, protein: 6, fat: 0.8, fiber: 1.2 },
  '현미밥': { name: '현미밥', unit: '1공기 (210g)', baseGram: 210, kcal: 280, carbs: 62, protein: 6.5, fat: 1.5, fiber: 3.8 },
  '잡곡밥': { name: '잡곡밥', unit: '1공기 (210g)', baseGram: 210, kcal: 290, carbs: 64, protein: 7, fat: 1.2, fiber: 3.2 },
  '곤약밥': { name: '곤약 현미밥', unit: '1공기 (150g)', baseGram: 150, kcal: 160, carbs: 36, protein: 4, fat: 0.5, fiber: 5 },
  '김치찌개': { name: '돼지고기 김치찌개', unit: '1인분', baseGram: 300, kcal: 240, carbs: 10, protein: 18, fat: 14, fiber: 3 },
  '된장찌개': { name: '차돌/두부 된장찌개', unit: '1인분', baseGram: 300, kcal: 210, carbs: 12, protein: 14, fat: 11, fiber: 3.5 },
  '삼겹살': { name: '삼겹살 구이', unit: '1인분 (200g)', baseGram: 200, kcal: 660, carbs: 0, protein: 36, fat: 58, fiber: 0 },
  '목살': { name: '돼지 목살 구이', unit: '1인분 (200g)', baseGram: 200, kcal: 420, carbs: 0, protein: 42, fat: 28, fiber: 0 },
  '소고기': { name: '소고기 등심/안심/우둔살', unit: '200g', baseGram: 200, kcal: 440, carbs: 0, protein: 46, fat: 28, fiber: 0 },
  '우둔살': { name: '소고기 우둔살/홍두깨살', unit: '100g', baseGram: 100, kcal: 135, carbs: 0, protein: 29, fat: 2, fiber: 0 },
  '스테이크': { name: '비프 스테이크', unit: '200g', baseGram: 200, kcal: 480, carbs: 2, protein: 48, fat: 30, fiber: 0 },
  '닭가슴살': { name: '닭가슴살 (생/훈제)', unit: '1팩 (100g)', baseGram: 100, kcal: 120, carbs: 0.5, protein: 26, fat: 1.5, fiber: 0 },
  '닭안심': { name: '닭안심', unit: '100g', baseGram: 100, kcal: 110, carbs: 0, protein: 25, fat: 1.0, fiber: 0 },
  '닭다리살': { name: '닭다리살 (순살)', unit: '100g', baseGram: 100, kcal: 180, carbs: 0, protein: 20, fat: 11, fiber: 0 },
  '닭가슴살 샐러드': { name: '닭가슴살 샐러드', unit: '1그릇', baseGram: 250, kcal: 250, carbs: 12, protein: 30, fat: 8, fiber: 4.5 },
  '샐러드': { name: '그린 샐러드 (드레싱 포함)', unit: '1접시', baseGram: 150, kcal: 150, carbs: 14, protein: 3, fat: 9, fiber: 4 },
  '계란': { name: '계란 (달걀)', unit: '1개 (50g)', baseGram: 50, kcal: 75, carbs: 0.5, protein: 6.5, fat: 5, fiber: 0 },
  '계란후라이': { name: '계란후라이', unit: '1개 (55g)', baseGram: 55, kcal: 95, carbs: 0.6, protein: 6.5, fat: 7.2, fiber: 0 },
  '달걀후라이': { name: '계란후라이', unit: '1개 (55g)', baseGram: 55, kcal: 95, carbs: 0.6, protein: 6.5, fat: 7.2, fiber: 0 },
  '삶은계란': { name: '삶은 달걀', unit: '1개 (50g)', baseGram: 50, kcal: 75, carbs: 0.5, protein: 6.5, fat: 5, fiber: 0 },
  '두부': { name: '두부', unit: '반모 (150g)', baseGram: 150, kcal: 125, carbs: 3, protein: 13, fat: 7, fiber: 1.5 },
  '프로틴': { name: '단백질 보충제(웨이)', unit: '1스쿱 (30g)', baseGram: 30, kcal: 120, carbs: 2.5, protein: 24, fat: 1.5, fiber: 0.5 },
  '단백질보충제': { name: '단백질 보충제(웨이)', unit: '1스쿱 (30g)', baseGram: 30, kcal: 120, carbs: 2.5, protein: 24, fat: 1.5, fiber: 0.5 },
  '프로틴쉐이크': { name: '단백질 쉐이크', unit: '1잔 (300ml)', baseGram: 300, kcal: 160, carbs: 6, protein: 26, fat: 2.5, fiber: 1 },
  '단백질쉐이크': { name: '단백질 쉐이크', unit: '1잔 (300ml)', baseGram: 300, kcal: 160, carbs: 6, protein: 26, fat: 2.5, fiber: 1 },
  '바나나': { name: '바나나', unit: '1개 (120g)', baseGram: 120, kcal: 105, carbs: 27, protein: 1.3, fat: 0.3, fiber: 3.1 },
  '사과': { name: '사과', unit: '1개 (200g)', baseGram: 200, kcal: 95, carbs: 25, protein: 0.5, fat: 0.3, fiber: 4.4 },
  '아보카도': { name: '아보카도', unit: '반개 (100g)', baseGram: 100, kcal: 160, carbs: 8, protein: 2, fat: 15, fiber: 6 },
  '아메리카노': { name: '아메리카노', unit: '1잔', baseGram: 350, kcal: 10, carbs: 1, protein: 0.5, fat: 0, fiber: 0 },
  '라떼': { name: '카페 라떼', unit: '1잔', baseGram: 350, kcal: 150, carbs: 12, protein: 7, fat: 8, fiber: 0 },
  '그릭요거트': { name: '무가당 그릭 요거트', unit: '100g', baseGram: 100, kcal: 100, carbs: 4, protein: 10, fat: 4.5, fiber: 0 },
  '요거트': { name: '플레인 요거트', unit: '1개 (100g)', baseGram: 100, kcal: 90, carbs: 12, protein: 4, fat: 3, fiber: 0 },
  '견과류': { name: '하루견과/아몬드', unit: '1봉 (25g)', baseGram: 25, kcal: 150, carbs: 5, protein: 5, fat: 13, fiber: 3 },
  '아몬드': { name: '아몬드', unit: '25g', baseGram: 25, kcal: 150, carbs: 5, protein: 5, fat: 13, fiber: 3 },
  '라면': { name: '신라면/국물라면', unit: '1봉지 (120g)', baseGram: 120, kcal: 500, carbs: 80, protein: 10, fat: 16, fiber: 3 },
  '짜장면': { name: '짜장면', unit: '1그릇', baseGram: 600, kcal: 650, carbs: 98, protein: 18, fat: 20, fiber: 4 },
  '짬뽕': { name: '해물 짬뽕', unit: '1그릇', baseGram: 650, kcal: 550, carbs: 82, protein: 24, fat: 14, fiber: 5 },
  '돈까스': { name: '등심 돈까스', unit: '1인분 (200g)', baseGram: 200, kcal: 620, carbs: 48, protein: 28, fat: 36, fiber: 2 },
  '샌드위치': { name: '닭가슴살/에그 샌드위치', unit: '1개 (180g)', baseGram: 180, kcal: 360, carbs: 38, protein: 18, fat: 12, fiber: 3.5 },
  '버거': { name: '비프 버거', unit: '1개 (200g)', baseGram: 200, kcal: 520, carbs: 42, protein: 26, fat: 28, fiber: 2 },
  '피자': { name: '콤비네이션 피자', unit: '2조각 (200g)', baseGram: 200, kcal: 540, carbs: 56, protein: 22, fat: 24, fiber: 3 },
  '치킨': { name: '후라이드 치킨', unit: '3조각 (200g)', baseGram: 200, kcal: 630, carbs: 24, protein: 39, fat: 42, fiber: 1.5 },
  '연어': { name: '구운 연어/생연어', unit: '150g', baseGram: 150, kcal: 310, carbs: 0, protein: 34, fat: 18, fiber: 0 },
  '고구마': { name: '군고구마/찐고구마', unit: '1개 (150g)', baseGram: 150, kcal: 190, carbs: 45, protein: 2.5, fat: 0.3, fiber: 3.8 },
  '감자': { name: '찐감자/구운감자', unit: '1개 (130g)', baseGram: 130, kcal: 110, carbs: 25, protein: 2.5, fat: 0.1, fiber: 2.5 },
  '오트밀': { name: '오트밀', unit: '40g (1회)', baseGram: 40, kcal: 150, carbs: 27, protein: 5, fat: 2.5, fiber: 4 },
  '우유': { name: '저지방 우유', unit: '200ml', baseGram: 200, kcal: 100, carbs: 10, protein: 6.5, fat: 3.5, fiber: 0 },
  '두유': { name: '무가당 두유', unit: '1팩 (190ml)', baseGram: 190, kcal: 80, carbs: 4, protein: 7, fat: 3.5, fiber: 1.2 }
};

// Natural language food & macro parser
export function parseFoodNaturalLanguage(input, defaultGrams = null) {
  if (!input || typeof input !== 'string') return null;

  const raw = input.trim();
  const items = raw.split(/[,+\n&]|\s+그리고\s+|\s+및\s+/).map(s => s.trim()).filter(Boolean);

  const parsedItems = [];
  let totalKcal = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const item of items) {
    let matchedKey = null;
    let multiplier = 1.0;
    let portionLabel = '1회';
    let explicitGram = null;

    // 1. Gram extraction: e.g. "130g", "200g", "100 g", "300그램"
    const gramMatch = item.match(/(\d+)\s*(g|그램)/i);
    if (gramMatch && gramMatch[1]) {
      explicitGram = parseFloat(gramMatch[1]);
      portionLabel = `${explicitGram}g`;
    } else if (defaultGrams && typeof defaultGrams === 'number') {
      explicitGram = defaultGrams;
      portionLabel = `${explicitGram}g`;
    } else {
      // Fraction extraction (e.g. "2/3공기", "1/2")
      const fracMatch = item.match(/(\d+)\/(\d+)/);
      if (fracMatch) {
        multiplier = parseFloat(fracMatch[1]) / parseFloat(fracMatch[2]);
        portionLabel = `${fracMatch[1]}/${fracMatch[2]}`;
      } else if (item.includes('반공기') || item.includes('반 개') || item.includes('반개') || item.includes('절반')) {
        multiplier = 0.5;
        portionLabel = '0.5';
      } else {
        const numMatch = item.match(/(\d+(\.\d+)?)\s*(인분|공기|개|조각|팩|잔|스쿱|접시|그릇|봉지|줄)?/);
        if (numMatch && numMatch[1]) {
          multiplier = parseFloat(numMatch[1]);
          portionLabel = `${multiplier}${numMatch[3] || ''}`;
        }
      }
    }

    // 2. Database Key Match (Longest match first)
    const sortedKeys = Object.keys(FOOD_DATABASE).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (item.toLowerCase().includes(key.toLowerCase())) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      const food = FOOD_DATABASE[matchedKey];
      
      // If explicit gram is provided, scale proportionally against baseGram
      if (explicitGram !== null) {
        const base = food.baseGram || 100;
        multiplier = explicitGram / base;
      }

      const itemKcal = Math.round(food.kcal * multiplier);
      const itemCarbs = parseFloat((food.carbs * multiplier).toFixed(1));
      const itemProtein = parseFloat((food.protein * multiplier).toFixed(1));
      const itemFat = parseFloat((food.fat * multiplier).toFixed(1));
      const itemFiber = parseFloat((food.fiber * multiplier).toFixed(1));

      parsedItems.push({
        raw: item,
        name: food.name,
        multiplier,
        portionLabel,
        kcal: itemKcal,
        carbs: itemCarbs,
        protein: itemProtein,
        fat: itemFat,
        fiber: itemFiber
      });

      totalKcal += itemKcal;
      totalCarbs += itemCarbs;
      totalProtein += itemProtein;
      totalFat += itemFat;
      totalFiber += itemFiber;
    } else {
      // Fallback heuristic for unrecognized food items
      if (explicitGram !== null) {
        multiplier = explicitGram / 100;
      }
      const fallbackKcal = Math.round(180 * multiplier);
      const fallbackCarbs = Math.round(20 * multiplier);
      const fallbackProtein = Math.round(14 * multiplier);
      const fallbackFat = Math.round(6 * multiplier);

      parsedItems.push({
        raw: item,
        name: item.replace(/\d+(\.\d+)?\s*(인분|공기|개|조각|팩|잔|스쿱|g|그램)?/g, '').trim() || item,
        multiplier,
        portionLabel,
        kcal: fallbackKcal,
        carbs: fallbackCarbs,
        protein: fallbackProtein,
        fat: fallbackFat,
        fiber: 2,
        isEstimated: true
      });

      totalKcal += fallbackKcal;
      totalCarbs += fallbackCarbs;
      totalProtein += fallbackProtein;
      totalFat += fallbackFat;
      totalFiber += 2;
    }
  }

  return {
    rawInput: input,
    items: parsedItems,
    totals: {
      kcal: Math.round(totalKcal),
      carbs: parseFloat(totalCarbs.toFixed(1)),
      protein: parseFloat(totalProtein.toFixed(1)),
      fat: parseFloat(totalFat.toFixed(1)),
      fiber: parseFloat(totalFiber.toFixed(1))
    }
  };
}
