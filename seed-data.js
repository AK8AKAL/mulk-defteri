// Bu dosya yalnızca ilk kurulumda "Örnek verileri yükle" butonuyla
// Firestore'a bir defaya mahsus yazılan başlangıç verisidir.
// İçeriği dilediğiniz gibi değiştirebilir veya app.js'i hiç etkilemeden silebilirsiniz.

const SEED_BUILDINGS = [
  { ad: "Kompleks",        il: "İstanbul", ilce: "Maltepe", mahalle: "İdealtepe", binaNo: "115", adaParsel: "16843/30", yuzolcumu: 763 },
  { ad: "Konak",           il: "İstanbul", ilce: "Adalar",  mahalle: "Nizam",     binaNo: "13",  adaParsel: "173/15",   yuzolcumu: 2798 },
  { ad: "Ayışığı",         il: "İstanbul", ilce: "Maltepe", mahalle: "Yalı",      binaNo: "2",   adaParsel: "16537/9",  yuzolcumu: 589 },
  { ad: "Plaza",           il: "İstanbul", ilce: "Kadıköy", mahalle: "Kozyatağı", binaNo: "10",  adaParsel: "644/12",   yuzolcumu: 886 },
  { ad: "Orçun",           il: "İstanbul", ilce: "Kadıköy", mahalle: "Göztepe",   binaNo: "259", adaParsel: "295/23",   yuzolcumu: 838 },
  { ad: "Güneş",           il: "İstanbul", ilce: "Kadıköy", mahalle: "Göztepe",   binaNo: "13",  adaParsel: "400/31",   yuzolcumu: 823 },
  { ad: "Ortakent Evleri", il: "Muğla",    ilce: "Bodrum",  mahalle: "Ortakent",  binaNo: "15",  adaParsel: "358/5",    yuzolcumu: 3924 },
  { ad: "Gözde",           il: "İstanbul", ilce: "Kadıköy", mahalle: "Göztepe",   binaNo: "47",  adaParsel: "398/35",   yuzolcumu: 664 }
];

// buildingAd alanı, yükleme sırasında gerçek Firestore buildingId ile eşlenir.
const SEED_PROPERTIES = [
  { buildingAd: "Kompleks",        kat: "Zemin", no: "1",   nitelik: "Market",     durum: "Kirada",        kiraci: "Carrefour",        kiraBedeli: 200000, sozlesme: "2021-01-01" },
  { buildingAd: "Kompleks",        kat: "Zemin", no: "2",   nitelik: "Kafe",       durum: "Kirada",        kiraci: "Artist Pub",       kiraBedeli: 100000, sozlesme: "2021-01-01" },
  { buildingAd: "Kompleks",        kat: "1",     no: "3",   nitelik: "Restoran",   durum: "Kirada",        kiraci: "İkaria Balık",     kiraBedeli: 170000, sozlesme: "2025-03-15" },
  { buildingAd: "Kompleks",        kat: "1",     no: "4",   nitelik: "Bar",        durum: "Kirada",        kiraci: "Angel Karaoke",    kiraBedeli: 130000, sozlesme: "2025-07-01" },
  { buildingAd: "Kompleks",        kat: "2",     no: "5",   nitelik: "Restoran",   durum: "Kirada",        kiraci: "Pişşti",           kiraBedeli: 300000, sozlesme: "2010-01-01" },

  { buildingAd: "Konak",           kat: "",      no: "",    nitelik: "Villa",      durum: "Özel Kullanım", kiraci: "Abdullah Aksakal", kiraBedeli: null,   sozlesme: null },

  { buildingAd: "Ayışığı",         kat: "Zemin", no: "1",   nitelik: "Konut",      durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Ayışığı",         kat: "1",     no: "2",   nitelik: "Konut",      durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Ayışığı",         kat: "2",     no: "3",   nitelik: "Konut",      durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Ayışığı",         kat: "3",     no: "4",   nitelik: "Konut",      durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Ayışığı",         kat: "4",     no: "5",   nitelik: "Konut",      durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },

  { buildingAd: "Plaza",           kat: "Bodrum",no: "",    nitelik: "Oto Servis", durum: "Kirada",        kiraci: "Mas Oto",          kiraBedeli: 160000, sozlesme: "2025-06-01" },
  { buildingAd: "Plaza",           kat: "Zemin", no: "1",   nitelik: "Restoran",   durum: "Kirada",        kiraci: "HemDem Ocakbaşı",  kiraBedeli: 110000, sozlesme: "2025-03-01" },
  { buildingAd: "Plaza",           kat: "4",     no: "6-A", nitelik: "Büro",       durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Plaza",           kat: "4",     no: "6-B", nitelik: "Büro",       durum: "Kirada",        kiraci: "ProFay İnşaat",    kiraBedeli: 60000,  sozlesme: "2024-12-01" },
  { buildingAd: "Plaza",           kat: "5",     no: "7",   nitelik: "Büro",       durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Plaza",           kat: "6",     no: "8",   nitelik: "Büro",       durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Plaza",           kat: "7",     no: "9",   nitelik: "Büro",       durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },
  { buildingAd: "Plaza",           kat: "8",     no: "10",  nitelik: "Büro",       durum: "Boş",           kiraci: "",                 kiraBedeli: null,   sozlesme: null },

  { buildingAd: "Orçun",           kat: "1",     no: "1",   nitelik: "Büro",       durum: "Özel Kullanım", kiraci: "Aksakal İnşaat",   kiraBedeli: null,   sozlesme: null },

  { buildingAd: "Güneş",           kat: "7",     no: "13",  nitelik: "Dubleks",    durum: "Özel Kullanım", kiraci: "Fırat Aksakal",    kiraBedeli: null,   sozlesme: null },

  { buildingAd: "Ortakent Evleri", kat: "Zemin", no: "1",   nitelik: "Konut",      durum: "Özel Kullanım", kiraci: "Aksakal İnşaat",   kiraBedeli: null,   sozlesme: null },

  { buildingAd: "Gözde",           kat: "7",     no: "13",  nitelik: "Konut",      durum: "Kirada",        kiraci: "Ayşe Yılmaz",      kiraBedeli: 106000, sozlesme: "2024-01-01" },
  { buildingAd: "Gözde",           kat: "7",     no: "14",  nitelik: "Konut",      durum: "Kirada",        kiraci: "Anıl Şahin",       kiraBedeli: 100000, sozlesme: "2024-03-01" },
  { buildingAd: "Gözde",           kat: "8",     no: "16",  nitelik: "Dubleks",    durum: "Özel Kullanım", kiraci: "Dicle Aksakal",    kiraBedeli: null,   sozlesme: null }
];
