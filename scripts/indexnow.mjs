// Pings IndexNow (Bing, Yandex, and the engines that read their index — which is
// what ChatGPT search and Copilot surface) with the site's URLs. Run after a deploy:
//   npm run indexnow
// The key must stay reachable at https://bongholeo.com/${KEY}.txt or submissions
// are rejected.
const KEY = '4d6d7acc34a50eb0820183c55fb4b321'
const HOST = 'bongholeo.com'
const urlList = ['https://bongholeo.com/', 'https://bongholeo.com/cranford-july-7-2026']

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})
console.log(`indexnow: ${res.status} ${res.statusText} — submitted ${urlList.length} URLs`)
if (!res.ok) console.log(await res.text())
