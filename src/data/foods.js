const seedFoods = [
  { name: "김치찌개", category: "한식" },
  { name: "된장찌개", category: "한식" },
  { name: "순두부찌개", category: "한식" },
  { name: "부대찌개", category: "한식" },
  { name: "제육볶음", category: "한식" },
  { name: "불고기", category: "한식" },
  { name: "비빔밥", category: "한식" },
  { name: "돌솥비빔밥", category: "한식" },
  { name: "김밥", category: "한식" },
  { name: "떡볶이", category: "분식" },
  { name: "라볶이", category: "분식" },
  { name: "칼국수", category: "면요리" },
  { name: "수제비", category: "한식" },
  { name: "냉면", category: "면요리" },
  { name: "국밥", category: "국밥/탕류" },
  { name: "설렁탕", category: "국밥/탕류" },
  { name: "갈비탕", category: "국밥/탕류" },
  { name: "육개장", category: "국밥/탕류" },
  { name: "삼계탕", category: "국밥/탕류" },
  { name: "보쌈", category: "한식" },
  { name: "짜장면", category: "중식" },
  { name: "짬뽕", category: "중식" },
  { name: "탕수육", category: "중식" },
  { name: "볶음밥", category: "중식" },
  { name: "마라탕", category: "중식" },
  { name: "마라샹궈", category: "중식" },
  { name: "유산슬밥", category: "중식" },
  { name: "잡채밥", category: "중식" },
  { name: "고추잡채밥", category: "중식" },
  { name: "양장피", category: "중식" },
  { name: "돈까스", category: "일식" },
  { name: "규동", category: "일식" },
  { name: "가츠동", category: "일식" },
  { name: "라멘", category: "면요리" },
  { name: "우동", category: "면요리" },
  { name: "소바", category: "면요리" },
  { name: "초밥", category: "일식" },
  { name: "사케동", category: "일식" },
  { name: "카레라이스", category: "일식" },
  { name: "오므라이스", category: "일식" },
  { name: "파스타", category: "양식" },
  { name: "피자", category: "양식" },
  { name: "리조또", category: "양식" },
  { name: "스테이크덮밥", category: "양식" },
  { name: "함박스테이크", category: "양식" },
  { name: "샌드위치", category: "양식" },
  { name: "햄버거", category: "패스트푸드" },
  { name: "치킨버거", category: "패스트푸드" },
  { name: "감자튀김 세트", category: "패스트푸드" },
  { name: "브런치 플레이트", category: "양식" },
  { name: "쌀국수", category: "아시안" },
  { name: "팟타이", category: "아시안" },
  { name: "분짜", category: "아시안" },
  { name: "나시고랭", category: "아시안" },
  { name: "카오팟", category: "아시안" },
  { name: "똠얌꿍", category: "아시안" },
  { name: "반미", category: "아시안" },
  { name: "커리", category: "아시안" },
  { name: "탄두리치킨", category: "아시안" },
  { name: "월남쌈", category: "아시안" },
  { name: "샐러드", category: "샐러드/건강식" },
  { name: "포케", category: "샐러드/건강식" },
  { name: "닭가슴살 도시락", category: "샐러드/건강식" },
  { name: "샌드위치 샐러드", category: "샐러드/건강식" },
  { name: "그릭요거트볼", category: "샐러드/건강식" },
  { name: "현미도시락", category: "샐러드/건강식" },
  { name: "두부면", category: "샐러드/건강식" },
  { name: "샐러드파스타", category: "샐러드/건강식" },
  { name: "저탄수 도시락", category: "샐러드/건강식" },
  { name: "연어샐러드", category: "샐러드/건강식" },
  { name: "라면", category: "분식" },
  { name: "컵밥", category: "분식" },
  { name: "토스트", category: "분식" },
  { name: "핫도그", category: "패스트푸드" },
  { name: "주먹밥", category: "분식" },
  { name: "편의점 도시락", category: "분식" },
  { name: "참치김밥", category: "분식" },
  { name: "치즈김밥", category: "분식" },
  { name: "튀김", category: "분식" },
  { name: "순대", category: "분식" },
  { name: "치킨", category: "패스트푸드" },
  { name: "찜닭", category: "한식" },
  { name: "닭갈비", category: "한식" },
  { name: "족발", category: "한식" },
  { name: "곱창", category: "한식" },
  { name: "막창", category: "한식" },
  { name: "샤브샤브", category: "한식" },
  { name: "월남쌈 샤브", category: "아시안" },
  { name: "고기국수", category: "면요리" },
  { name: "브리또", category: "양식" },
  { name: "타코", category: "양식" },
  { name: "부리또볼", category: "양식" },
  { name: "크로플 브런치", category: "양식" },
  { name: "만두전골", category: "국밥/탕류" },
  { name: "해장국", category: "국밥/탕류" },
  { name: "아구찜", category: "한식" },
  { name: "쭈꾸미볶음", category: "한식" },
  { name: "낙지덮밥", category: "한식" },
  { name: "오징어볶음", category: "한식" },
  { name: "생선구이", category: "한식" },
];

const getFoodIcon = (name, category) => {
  if (name.includes("피자")) return "🍕";
  if (name.includes("햄버거") || name.includes("치킨버거")) return "🍔";
  if (name.includes("핫도그")) return "🌭";
  if (name.includes("파스타") || name.includes("리조또")) return "🍝";
  if (name.includes("초밥") || name.includes("사케동")) return "🍣";
  if (name.includes("샐러드") || name.includes("포케")) return "🥗";
  if (name.includes("샌드위치") || name.includes("토스트") || name.includes("반미")) return "🥪";
  if (name.includes("떡볶이") || name.includes("라볶이")) return "🌶️";
  if (name.includes("김밥") || name.includes("주먹밥") || name.includes("컵밥")) return "🍙";
  if (name.includes("쌀국수") || name.includes("라멘") || name.includes("우동") || name.includes("소바") || name.includes("칼국수") || name.includes("냉면")) return "🍜";
  if (name.includes("찌개") || name.includes("탕") || name.includes("국밥") || name.includes("해장국") || name.includes("마라탕") || name.includes("전골")) return "🍲";
  if (name.includes("치킨") || name.includes("찜닭") || name.includes("닭갈비") || name.includes("탄두리")) return "🍗";
  if (name.includes("돈까스") || name.includes("가츠동") || name.includes("함박") || name.includes("스테이크")) return "🥩";
  if (name.includes("타코") || name.includes("브리또") || name.includes("부리또")) return "🌮";
  if (name.includes("커리") || name.includes("카레")) return "🍛";
  if (name.includes("만두")) return "🥟";
  if (name.includes("생선") || name.includes("아구") || name.includes("오징어") || name.includes("낙지") || name.includes("쭈꾸미")) return "🐟";
  if (name.includes("튀김") || name.includes("감자튀김")) return "🍟";
  if (name.includes("순대")) return "🍢";

  if (category === "한식") return "🍚";
  if (category === "중식") return "🥡";
  if (category === "일식") return "🍱";
  if (category === "면요리") return "🍜";
  if (category === "양식") return "🍽️";
  if (category === "패스트푸드") return "🍔";
  if (category === "아시안") return "🍜";
  if (category === "샐러드/건강식") return "🥗";
  if (category === "분식") return "🍢";
  if (category === "국밥/탕류") return "🍲";

  return "🍴";
};

export const foods = seedFoods.map((item, index) => ({
  id: index + 1,
  name: `${item.name} ${getFoodIcon(item.name, item.category)}`,
  category: item.category,
  selectedCount: 0,
  rejectedCount: 0,
  isActive: true,
}));
