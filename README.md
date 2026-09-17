# Mülk Defteri

Kira takibi için mobil ağırlıklı, Firebase tabanlı web uygulaması. 8 bina, 25 mülk ile başlamanız için örnek veri yükleme özelliği dahildir. GitHub Pages üzerinde ücretsiz barındırılabilir.

## Dosyalar

- `index.html` — uygulama iskeleti
- `style.css` — tasarım
- `app.js` — tüm uygulama mantığı (auth, Firestore CRUD, arayüz)
- `firebase-config.js` — **kendi Firebase bilgilerinizi buraya gireceksiniz**

## 1) Firebase projesi oluşturma

1. [console.firebase.google.com](https://console.firebase.google.com) adresine gidip **Proje ekle** ile yeni bir proje oluşturun (ücretsiz "Spark" plan yeterlidir).
2. Sol menüden **Build > Authentication** açın, **Get started** deyin, **Sign-in method** sekmesinden **E-posta/Şifre**'yi etkinleştirin.
3. Sol menüden **Build > Firestore Database** açın, **Create database**'e tıklayın, konum olarak size yakın bir bölge seçin (örn. `eur3`), **production mode** ile başlatın.
4. **Firestore > Rules** sekmesine gidip aşağıdaki kuralları yapıştırıp **Publish** deyin (sadece giriş yapmış kullanıcı kendi verisini okuyup yazabilir):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. Proje ayarları (dişli simgesi) **> Genel** sekmesine inin, "Uygulamalarınız" altında **Web** (`</>`) simgesine tıklayıp bir uygulama kaydedin. Size verilen `firebaseConfig` nesnesini kopyalayın.

## 2) Yapılandırma

`firebase-config.js` dosyasını açın ve `BURAYA_...` yer tutucularını Firebase'in verdiği gerçek değerlerle değiştirin:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

> Not: Bu anahtarlar gizli değildir — Firebase güvenliği Firestore kurallarıyla sağlanır (yukarıdaki adım 4). Kurallar doğru ayarlandığı sürece bu dosyanın herkese açık bir repoda olması güvenlidir.

## 3) Kullanıcı hesabınızı oluşturma

Uygulamayı ilk açtığınızda giriş ekranında **"Hesabınız yok mu? Hesap oluşturun"** bağlantısına tıklayıp kendi e-posta/şifrenizle bir hesap oluşturun. Bu, uygulamaya girebilecek tek kullanıcı olacaktır (isterseniz Firebase Authentication panelinden ek kullanıcı da ekleyebilirsiniz).

## 4) Yerelde deneme

Tarayıcılar `file://` üzerinden Firebase'e bağlanmaya izin vermeyebilir, bu yüzden basit bir yerel sunucu ile açın:

```bash
cd mulk-defteri
python3 -m http.server 8000
```

Sonra `http://localhost:8000` adresini açın.

## 5) GitHub Pages'e yayınlama

1. GitHub'da yeni bir repo oluşturun (örn. `mulk-defteri`), bu klasördeki tüm dosyaları push edin:

   ```bash
   cd mulk-defteri
   git init
   git add .
   git commit -m "İlk sürüm"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/mulk-defteri.git
   git push -u origin main
   ```

2. Repo sayfasında **Settings > Pages** açın. "Build and deployment" altında **Source: Deploy from a branch**, **Branch: main / (root)** seçip **Save** deyin.
3. Birkaç dakika sonra `https://KULLANICI_ADINIZ.github.io/mulk-defteri/` adresinde yayında olacaktır.
4. iPhone'da Safari'de bu adresi açıp **Paylaş > Ana Ekrana Ekle** ile uygulamayı bir simge olarak ana ekranınıza koyabilirsiniz; tam ekran açılır.

## 6) Bina ve mülk ekleme

Uygulamada bina/mülk ekleme veya silme yoktur — bunlar doğrudan Firebase konsolundaki Firestore Database arayüzünden yapılır (`buildings` ve `properties` koleksiyonlarına belge ekleyip silerek, alan adları aşağıdaki veri modeline göre). Uygulama içinden sadece mevcut bina ve mülklerin bilgileri düzenlenebilir.

## Veri modeli (Firestore)

**`buildings` koleksiyonu:**
`ad, il, ilce, mahalle, binaNo, adaParsel, yuzolcumu`

**`properties` koleksiyonu:**
`buildingId, kat, no, nitelik, durum (Kirada/Boş/Özel Kullanım), kiraci, kiraBedeli, sozlesme (YYYY-MM-DD)`

## Sonradan eklenebilecek geliştirmeler

- **Kira takibi**: her ay için ayrı tahsilat kaydı, ödendi/ödenmedi durumu (planlanıyor)
- Kira artış oranı / TÜFE hesaplayıcı ile otomatik yeni kira önerisi
- Sözleşme yenileme tarihi yaklaşınca bildirim
- Bina/mülk fotoğrafı (Firebase Storage ile)
- Gider takibi (aidat, vergi, tadilat) ve net getiri hesabı
