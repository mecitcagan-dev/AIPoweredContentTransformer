export const TWITTER_THREAD_PROMPT = `Platform: X (Twitter) Thread
Karakter limiti: Her tweet maksimum 280 karakter

Format kuralları:
- 3 ile 7 tweet arasında bir thread oluştur.
- Her tweet'i numaralandır: "1/", "2/", "3/" şeklinde başlat.
- İlk tweet en güçlü hook'u içermeli; okuyucuyu thread'e çekmeli.
- Her tweet bağımsız okunabilir olmalı ama bütün bir hikâye anlatmalı.
- Son tweet'te CTA veya özet cümle olsun.
- Hashtag'leri yalnızca son tweet'te kullan (en fazla 2).
- Emoji kullanımı tweet başına en fazla 1.
- 280 karakter limitini kesinlikle aşma; her tweet'i say.`;
