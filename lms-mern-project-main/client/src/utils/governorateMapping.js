// Egyptian Governorates mapping from English to Arabic
export const governorateMapping = {
  "Cairo": "القاهرة",
  "Giza": "الجيزة", 
  "Alexandria": "الإسكندرية",
  "Dakahlia": "الدقهلية",
  "Red Sea": "البحر الأحمر",
  "Beheira": "البحيرة",
  "Fayoum": "الفيوم",
  "Gharbiya": "الغربية",
  "Ismailia": "الإسماعيلية",
  "Menofia": "المنوفية",
  "Minya": "المنيا",
  "Qaliubiya": "القليوبية",
  "New Valley": "الوادي الجديد",
  "Suez": "السويس",
  "Aswan": "أسوان",
  "Assiut": "أسيوط",
  "Beni Suef": "بني سويف",
  "Port Said": "بورسعيد",
  "Damietta": "دمياط",
  "Sharkia": "الشرقية",
  "South Sinai": "جنوب سيناء",
  "Kafr Al sheikh": "كفر الشيخ",
  "Matrouh": "مطروح",
  "Luxor": "الأقصر",
  "Qena": "قنا",
  "North Sinai": "شمال سيناء",
  "Sohag": "سوهاج",
  "Gharbia": "الغربية",
  "Monufia": "المنوفية",
  "Qalyubia": "القليوبية",
  "Sharqia": "الشرقية",
  "Kafr El Sheikh": "كفر الشيخ"
};

// Complete list of Egyptian governorates in Arabic with English keys
export const egyptianGovernorates = [
  { value: "Cairo", label: "القاهرة" },
  { value: "Giza", label: "الجيزة" },
  { value: "Alexandria", label: "الإسكندرية" },
  { value: "Dakahlia", label: "الدقهلية" },
  { value: "Red Sea", label: "البحر الأحمر" },
  { value: "Beheira", label: "البحيرة" },
  { value: "Fayoum", label: "الفيوم" },
  { value: "Gharbiya", label: "الغربية" },
  { value: "Ismailia", label: "الإسماعيلية" },
  { value: "Menofia", label: "المنوفية" },
  { value: "Minya", label: "المنيا" },
  { value: "Qaliubiya", label: "القليوبية" },
  { value: "New Valley", label: "الوادي الجديد" },
  { value: "Suez", label: "السويس" },
  { value: "Aswan", label: "أسوان" },
  { value: "Assiut", label: "أسيوط" },
  { value: "Beni Suef", label: "بني سويف" },
  { value: "Port Said", label: "بورسعيد" },
  { value: "Damietta", label: "دمياط" },
  { value: "Sharkia", label: "الشرقية" },
  { value: "South Sinai", label: "جنوب سيناء" },
  { value: "Kafr Al sheikh", label: "كفر الشيخ" },
  { value: "Matrouh", label: "مطروح" },
  { value: "Luxor", label: "الأقصر" },
  { value: "Qena", label: "قنا" },
  { value: "North Sinai", label: "شمال سيناء" },
  { value: "Sohag", label: "سوهاج" }
];

// Function to get Arabic name from English name
export const getArabicGovernorate = (englishName) => {
  return governorateMapping[englishName] || englishName;
};

// Function to get English name from Arabic name  
export const getEnglishGovernorate = (arabicName) => {
  const entry = Object.entries(governorateMapping).find(([eng, ar]) => ar === arabicName);
  return entry ? entry[0] : arabicName;
};
