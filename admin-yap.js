const db = require('better-sqlite3')('./data/kpss.db');
const username = process.argv[2];

if (!username) {
  console.log("Kullanım: node admin-yap.js <kullanici_adi>");
  console.log("Örnek: node admin-yap.js deniz");
  process.exit(1);
}

try {
  const result = db.prepare("UPDATE users SET role = 'admin' WHERE username = ?").run(username);
  if (result.changes > 0) {
    console.log(`\n✅ Başarılı! "${username}" adlı kullanıcı artık Admin!`);
    console.log("Lütfen kullanıcının yetkilerini görebilmesi için siteden çıkış yapıp tekrar giriş yapmasını sağlayın.\n");
  } else {
    console.log(`\n❌ Hata: "${username}" adında bir kullanıcı bulunamadı. İsmi doğru yazdığınızdan emin olun.\n`);
  }
} catch (err) {
  console.error("Bir hata oluştu:", err.message);
}
