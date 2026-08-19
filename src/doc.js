// Entry for the document pages: fonts + the reduced Public Record stylesheet.
// No React here — the pages are static HTML so crawlers get every word.
import '@fontsource/bricolage-grotesque/latin-700.css'
import '@fontsource/bricolage-grotesque/latin-800.css'
import '@fontsource/archivo/latin-400.css'
import '@fontsource/archivo/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import './doc.css'
import { inject } from '@vercel/analytics'

inject()
