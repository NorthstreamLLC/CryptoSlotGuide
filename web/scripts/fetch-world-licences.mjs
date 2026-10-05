/**
 * Reads each country's licensed online operators from its regulator's own
 * register into data/world-market.json.
 *
 * Same rule as the US and UK files: the regulator is the source, never a
 * review site and never the operators themselves. Every country entry keeps
 * the register URL it was read from and the date it was read, and the
 * operator rows are the register's own wording — the licence holder as the
 * regulator names it, the brand or domain as the regulator lists it.
 *
 * One adapter per regulator, because no two registers look alike: Germany
 * publishes an accordion of 800 tables, Spain a paginated table, France a
 * run of headings, Sweden a JSON API, Czechia a spreadsheet, Denmark a
 * search index. Where a register does not say which product a licence
 * covers (Spain, Italy, Latvia), the operators go in one list with a note
 * saying so rather than being guessed into casino or sportsbook.
 *
 * Registers this cannot read, and why, are listed in UNREADABLE at the
 * bottom so the page can say "we looked" instead of showing nothing.
 *
 * Usage, from web/:
 *   node scripts/fetch-world-licences.mjs            # all countries
 *   node scripts/fetch-world-licences.mjs SE DK      # some
 *   node scripts/fetch-world-licences.mjs --dry-run  # print, do not write
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

const OUT = path.join("data", "world-market.json");
const CACHE = path.join(".cache", "world-licences");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const ONLY = new Set(args.filter((a) => !a.startsWith("--")).map((a) => a.toUpperCase()));
const TODAY = new Date().toISOString().slice(0, 10);

fs.mkdirSync(CACHE, { recursive: true });

/** curl rather than fetch: several of these hosts reset Node's TLS handshake and accept curl's. */
function get(url, { binary = false, headers = [] } = {}) {
  // The readable prefix is cut short, so the hash of the whole URL keeps
  // paged URLs (which differ only at the end) from sharing one cache file.
  const key = url.replace(/[^a-z0-9]+/gi, "_").slice(0, 110) + "_" + createHash("sha1").update(url).digest("hex").slice(0, 12);
  const file = path.join(CACHE, key + (binary ? ".bin" : ".html"));
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < 6 * 3600 * 1000) {
    return binary ? fs.readFileSync(file) : fs.readFileSync(file, "utf8");
  }
  const h = headers.map((x) => `-H "${x}"`).join(" ");
  execSync(`curl -sL -A "${UA}" -m 90 ${h} -o "${file}" "${url}"`, { stdio: "pipe" });
  return binary ? fs.readFileSync(file) : fs.readFileSync(file, "utf8");
}

const clean = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8217;|&rsquo;|&#039;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&[a-z]+;|&#\d+;/g, (m) => {
      const map = { "&eacute;": "é", "&egrave;": "è", "&ccedil;": "ç", "&atilde;": "ã", "&otilde;": "õ", "&aacute;": "á", "&oacute;": "ó", "&uuml;": "ü", "&ouml;": "ö", "&auml;": "ä", "&aring;": "å" };
      return map[m] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();

const host = (u) => clean(u).replace(/^[:\s]+/, "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").toLowerCase();

const op = (brand, licenseHolder = null, domains = []) => ({
  brand: clean(brand),
  licenseHolder: licenseHolder ? clean(licenseHolder) : null,
  ...(domains.length ? { domains: [...new Set(domains.map(host).filter(Boolean))] } : {}),
});

const dedupe = (ops) => {
  const seen = new Map();
  for (const o of ops) {
    const k = (o.brand + "|" + (o.licenseHolder ?? "")).toLowerCase();
    if (seen.has(k)) {
      const prev = seen.get(k);
      if (o.domains) prev.domains = [...new Set([...(prev.domains ?? []), ...o.domains])];
    } else seen.set(k, { ...o });
  }
  return [...seen.values()].sort((a, b) => a.brand.localeCompare(b.brand));
};

const list = (operators, sourceUrl, note = null) => ({ operators: dedupe(operators), sourceUrl, asOf: TODAY, note });

// ---------------------------------------------------------------------------
// Adapters. Each returns { regulator, casinos, sportsbooks, operators?, why }.
// `operators` is the single list for registers that do not split by product.
// ---------------------------------------------------------------------------
const ADAPTERS = {
  DE() {
    const url = "https://www.gluecksspiel-behoerde.de/de/fuer-spielende/uebersicht-erlaubter-anbieter-whitelist";
    const html = get(url).replace(/\s+/g, " ");
    const casinos = [], sportsbooks = [];
    // One <li gglwhitelist-...> per permit holder; inside, one block per permit type.
    for (const li of html.split(/<li gglwhitelist-g-ids/).slice(1)) {
      const holder = clean((li.match(/uk-accordion-title[^>]*>\s*<span[^>]*>([^<]+)/) || [])[1]);
      if (!holder) continue;
      for (const block of li.split(/<h3 class="uk-text-bold">/).slice(1)) {
        const type = clean(block.slice(0, block.indexOf("</h3>")));
        const domains = [...block.matchAll(/el-title">\s*<span[^>]*>([^<]+)</g)].map((m) => m[1]);
        if (!domains.length) continue;
        const online = /Virtuelle Automatenspiele|Online-Poker|Online-Casinospiele/i.test(type) || (/Sportwetten/i.test(type) && /Vertriebsweg:[^<]*<\/th>\s*<td[^>]*>\s*(<span[^>]*>)?\s*online/i.test(block));
        if (!online) continue;
        for (const d of domains) {
          const row = op(host(d), holder, [d]);
          if (/Sportwetten/i.test(type)) sportsbooks.push(row);
          else casinos.push(row);
        }
      }
    }
    return {
      regulator: "Gemeinsame Glücksspielbehörde der Länder (GGL)",
      casinos: list(casinos, url, "The GGL whitelist, one row per permitted domain. 'Casino' here is what German law permits online nationally — virtual slot games and online poker under the 2021 Interstate Treaty — plus the state-licensed online table games where a state lists them. Each row names the domain and the company holding the permit."),
      sportsbooks: list(sportsbooks, url, "Sports betting permits marked 'online' on the GGL whitelist, one row per domain."),
      why: "Germany's 2021 Interstate Treaty on Gambling (GlüStV 2021) opened a national licence for online slots, online poker and sports betting, supervised by the GGL from 2023; online table games remain a state-by-state matter. The GGL publishes every permitted domain on its whitelist, which is the only authoritative list.",
    };
  },

  ES() {
    const base = "https://www.ordenacionjuego.es/en/operadores-juego/operadores-licencia/operadores";
    const ops = [];
    for (let p = 0; p < 12; p++) {
      const html = get(`${base}?page=${p}`).replace(/\s+/g, " ");
      const rows = [...html.matchAll(/views-field-title"><a [^>]*>([^<]+)<\/a>\s*<\/td>\s*<td[^>]*views-field-field-links">(.*?)<\/td>/g)];
      if (!rows.length) break;
      for (const [, company, cell] of rows) {
        const urls = [...cell.matchAll(/https?:\/\/[^\s"<]+/g)].map((m) => m[0]);
        if (!urls.length) continue; // "No posee un sitio web que ofrezca juego"
        for (const u of urls) ops.push(op(host(u), company, [u]));
      }
    }
    return {
      regulator: "Dirección General de Ordenación del Juego (DGOJ)",
      operators: list(ops, base, "The DGOJ's register of licensed operators lists each company and the domains it is licensed to run. The register does not say which licences (betting, casino, poker, bingo) sit behind each domain, so the operators are shown in one list rather than guessed into products."),
      why: "Spain's Gambling Act 13/2011 created a national licensing regime for online gambling, run by the DGOJ under the Ministry of Consumer Affairs. General licences cover betting, contests and 'other games' (casino, poker, bingo); a .es domain is a condition of the licence.",
    };
  },

  FR() {
    const url = "https://anj.fr/offre-de-jeu-et-marche/operateurs-agrees";
    const html = get(url).replace(/\s+/g, " ");
    const sportsbooks = [], poker = [];
    for (const block of html.split(/<h3>/).slice(1)) {
      const company = clean(block.slice(0, block.indexOf("</h3>")));
      const sites = clean((block.match(/Nom (?:du|des) sites?\s*:?\s*(?:<\/strong>)?\s*:?\s*(.*?)(?:<br|<\/p>)/i) || [])[1]);
      const cats = clean((block.match(/Catégories?\s*:?\s*(?:<\/strong>)?\s*:?\s*(.*?)<\/p>/i) || [])[1]);
      if (!company || !sites) continue;
      const domains = sites.split(/\s*-\s*/).map((s) => s.trim()).filter((s) => /\./.test(s));
      for (const d of domains) {
        if (/Paris sportifs/i.test(cats)) sportsbooks.push(op(host(d), company, [d]));
        if (/Jeux de cercle/i.test(cats)) poker.push(op(host(d), company, [d]));
      }
    }
    return {
      regulator: "Autorité nationale des jeux (ANJ)",
      sportsbooks: list(sportsbooks, url, "ANJ-approved operators whose categories include 'Paris sportifs' (sports betting), one row per approved .fr site. Horse-race betting and poker ('Jeux de cercle') are licensed on the same page; online casino games are not licensed in France at all."),
      casinos: list(poker, url, "France licenses no online casino. These are the ANJ's approved 'Jeux de cercle' (online poker) sites, listed here because poker is the only online 'game of chance' the ANJ approves."),
      why: "France's 2010 online gambling law opened sports betting, horse-race betting and poker to licensed operators under what is now the ANJ; online casino games remain prohibited and the ANJ blocks unlicensed sites.",
    };
  },

  PT() {
    const url = "https://www.srij.turismodeportugal.pt/pt/jogos-e-apostas-online/entidades-licenciadas";
    const html = get(url).replace(/\s+/g, " ");
    const casinos = [], sportsbooks = [];
    for (const block of html.split(/<div id="[a-z0-9-]+" class="block-wysiwyg">/).slice(1)) {
      // "Marca:</strong> X" on some blocks, "Marca: </strong>X" on others.
      const brand = clean((block.match(/Marca:\s*<\/strong>\s*([^<]+)/) || [])[1]);
      const site = clean((block.match(/Website:\s*<\/strong>\s*<a[^>]*>([^<]+)/) || [])[1]);
      const entity = clean((block.match(/Entidade exploradora:\s*<\/strong>\s*([^<]+)/) || [])[1]);
      if (!brand) continue;
      const games = clean(block.slice(0, block.indexOf("Licenças e averbamentos")));
      const row = op(brand, entity, site ? [site] : []);
      if (/Apostas desportivas/i.test(games)) sportsbooks.push(row);
      if (/Jogos de máquinas|Roleta|Blackjack|Banca francesa|Jogos de fortuna/i.test(games)) casinos.push(row);
    }
    return {
      regulator: "Serviço de Regulação e Inspeção de Jogos (SRIJ)",
      casinos: list(casinos, url, "SRIJ-licensed brands whose licences cover games of chance (slots, roulette, blackjack, French bank), with the operating entity the SRIJ names."),
      sportsbooks: list(sportsbooks, url, "SRIJ-licensed brands whose licences cover fixed-odds sports betting."),
      why: "Portugal's Decree-Law 66/2015 created the online gambling regime run by the SRIJ, part of Turismo de Portugal. Licences are granted per game type, which is why one brand can appear under both lists.",
    };
  },

  IT() {
    const base = "https://www.adm.gov.it/portale/monopoli/giochi/gioco_distanza/gioco_dist_concessionari";
    const ops = [];
    for (let p = 1; p <= 10; p++) {
      const html = get(`${base}?p_p_id=it_sogei_wda_web_portlet_WebDisplayAamsPortlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_pager=${p}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_sit=asc`).replace(/\s+/g, " ");
      const rows = [...html.matchAll(/<td headers='h1'[^>]*>(\d+)<\/td>\s*<td[^>]*>([^<]+)<\/td>.*?<td headers="h5">([^<]*)<\/td>/g)];
      if (!rows.length) break;
      for (const [, code, company, site] of rows) ops.push({ ...op(host(site) || clean(company), company, site ? [site] : []), concession: code });
    }
    return {
      regulator: "Agenzia delle Dogane e dei Monopoli (ADM)",
      operators: list(ops, base, "ADM's list of concession holders authorised for remote gaming ('gioco a distanza'), with the concession code and the internet site each one is authorised to run. The list does not split casino from betting — one concession covers remote gaming as a whole."),
      why: "Italy licenses remote gaming through concessions granted by the ADM (formerly AAMS); the 2024 reorganisation re-tendered the online concessions. Only sites on the ADM's list may offer online gambling to Italian players.",
    };
  },

  "CA-ON"() {
    const url = "https://igamingontario.ca/en/operator/operators";
    const html = get(url).replace(/\s+/g, " ");
    const casinos = [], sportsbooks = [];
    for (const block of html.split(/<h3>/).slice(1)) {
      const operator = clean(block.slice(0, block.indexOf("</h3>")));
      for (const item of block.split(/<li class="operator-item">/).slice(1)) {
        const brand = clean((item.match(/<a href="[^"]*" title="([^"]+)"/) || [])[1]);
        const href = (item.match(/<a href="([^"]+)"/) || [])[1];
        const offerings = [...item.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => clean(m[1]));
        if (!brand) continue;
        const row = op(brand, operator, href ? [href] : []);
        if (offerings.includes("Casino") || offerings.includes("Poker") || offerings.includes("Bingo")) casinos.push(row);
        if (offerings.includes("Sports Betting") || offerings.includes("Betting Exchange")) sportsbooks.push(row);
      }
    }
    return {
      regulator: "iGaming Ontario (with the AGCO as regulator)",
      casinos: list(casinos, url, "Sites iGaming Ontario lists with Casino, Poker or Bingo among their offerings, under the registered operator each belongs to."),
      sportsbooks: list(sportsbooks, url, "Sites iGaming Ontario lists with Sports Betting or Betting Exchange among their offerings."),
      why: "Ontario opened a regulated private igaming market on 4 April 2022: operators register with the AGCO and contract with iGaming Ontario, a subsidiary of the AGCO, to offer casino, poker and sports betting to Ontario players. Other provinces still run online gambling through their lottery corporations.",
    };
  },

  CY() {
    const url = "https://nba.gov.cy/en/regulated-entities/registers/class-b/";
    const html = get(url).replace(/\s+/g, " ");
    const sportsbooks = [];
    for (const li of html.split(/<li>\s*<strong>/).slice(1)) {
      const company = clean(li.slice(0, li.indexOf("<br")));
      const trade = clean((li.match(/Tradename:\s*<strong>([^<]+)/) || [])[1]);
      const domain = clean((li.match(/Domain:\s*<strong>\s*<a[^>]*>([^<]+)/) || [])[1]);
      const status = clean((li.match(/Current Status:\s*<strong>([^<]+)/) || [])[1]);
      if (!trade || !/Licensed/i.test(status)) continue;
      sportsbooks.push(op(trade, company, domain ? [domain] : []));
    }
    return {
      regulator: "National Betting Authority (NBA)",
      sportsbooks: list(sportsbooks, url, "Class B (online betting) licensees on the NBA's register, with the trade name, licence holder and .com.cy domain the register gives. Online casino games are not licensed in Cyprus."),
      why: "Cyprus's Betting Law of 2019 licenses online sports betting (Class B) through the National Betting Authority; online casino games, slots and poker are prohibited, and OPAP holds exclusive rights to lotteries and numerical games.",
    };
  },

  BE() {
    const casinoUrl = "https://data.gamingcommission.be/licenses/APLUS/latest/rows.json";
    const betUrl = "https://data.gamingcommission.be/licenses/FAPLUS/latest/rows.json";
    const read = (u) => JSON.parse(get(u)).data.map((r) => op(host(r.website), r.operator, [r.website]));
    return {
      regulator: "Gaming Commission (Kansspelcommissie / Commission des jeux de hasard)",
      casinos: list(read(casinoUrl), "https://www.gamingcommission.be/en/operators/licences/casinos-licence-a-a", "A+ licences — the online extension of a land-based casino licence — from the Gaming Commission's open-data table, one row per licensed .be site. Belgium ties every online casino to a licensed land-based casino."),
      sportsbooks: list(read(betUrl), "https://www.gamingcommission.be/en/operators/licences/betting-licence-f1-f2-f1", "F1+ licences — online betting — from the Gaming Commission's open-data table, one row per licensed .be site."),
      why: "Belgium's Gaming Act of 1999, as amended in 2010, allows online gambling only as a '+' extension of a land-based licence: A+ for casinos, B+ for arcades, F1+ for betting. The Gaming Commission publishes each licence class as an open-data table.",
    };
  },

  CZ() {
    const indexUrl = "https://mf.gov.cz/cs/kontrola-a-regulace/hazardni-hry/prehledy-a-statistiky/prehledy-legalnich-provozovatelu-whiteli";
    const idx = get(indexUrl);
    const latest = (idx.match(/href="([^"]*prehledy-legalnich-provozovatelu-whiteli\/20\d\d\/[^"]+)"[^>]*>[^<]*platný ke dni ([\d.]+)/) || [])[1];
    if (!latest) throw new Error("CZ: no current list link");
    const page = get("https://mf.gov.cz" + latest);
    const xlsx = (page.match(/href="([^"]*\.xlsx)"/) || [])[1];
    if (!xlsx) throw new Error("CZ: no xlsx");
    const buf = get("https://mf.gov.cz" + xlsx, { binary: true });
    const rows = readXlsx(buf);
    const casinos = [], sportsbooks = [];
    const dom = (cell) => (cell || "").split(/\n/).map((s) => s.trim()).filter((s) => /\.[a-z]{2,}$/i.test(s) && !/^(PM|Ú):/.test(s));
    for (const r of rows) {
      const name = r.A;
      if (!name || /^Seznam|^Provozovatel|^ |=/.test(name) || !r.B) continue;
      // Column letters from the sheet header: M = fixed-odds betting (internet),
      // S = technical games i.e. slots (internet), U = live games (internet).
      const bet = dom(r.M), tech = dom(r.S), live = dom(r.U);
      for (const d of bet) sportsbooks.push(op(host(d), name, [d]));
      for (const d of [...tech, ...live]) casinos.push(op(host(d), name, [d]));
    }
    return {
      regulator: "Ministry of Finance of the Czech Republic",
      casinos: list(casinos, "https://mf.gov.cz" + latest, "From the Ministry of Finance's current list of legal operators (the 'whitelist' spreadsheet): operators licensed for technical games (slots) or live games over the internet, one row per licensed domain."),
      sportsbooks: list(sportsbooks, "https://mf.gov.cz" + latest, "Operators licensed for fixed-odds betting over the internet, from the same spreadsheet."),
      why: "The Czech Gambling Act (186/2016 Sb.) licenses online casino games and betting through the Ministry of Finance, which publishes the list of legal operators and a separate blocklist of unlicensed sites.",
    };
  },

  LV() {
    const url = "https://www.vid.gov.lv/lv/licencetie-azartspelu-organizetaji";
    const html = get(url).replace(/\s+/g, " ");
    const ops = [];
    for (const [, company, , site] of html.matchAll(/<tr>\s*<td>\s*<h5><a[^>]*>([^<]+)<\/a><\/h5>\s*<\/td>\s*<td>\s*<h5>([^<]*)<\/h5>\s*<\/td>\s*<td>\s*<h5>(?:<a[^>]*>)?([^<]*)/g)) {
      if (!site || !/\./.test(site)) continue;
      ops.push(op(host(site), company, [site]));
    }
    return {
      regulator: "State Revenue Service (VID), Lotteries and Gambling Supervisory Inspection",
      operators: list(ops, url, "Licensed gambling organisers from the VID's register, one row per organiser with a website. The register lists the organiser's site, not which products the licence covers, so the operators are shown in one list."),
      why: "Latvia's Gambling and Lotteries Law licenses interactive gambling through the Lotteries and Gambling Supervisory Inspection, now part of the State Revenue Service (VID), which publishes the licensed organisers and blocks unlicensed domains.",
    };
  },

  SE() {
    // The register's search answer lists holders and web addresses as two
    // separate facets; GetLicensesForHolder (the call the register page makes
    // when a holder is opened) ties them together: each licence with its
    // type, status, dates and the web addresses it covers.
    const API = "https://www.spelinspektionen.se/api/licenseregistryapi/";
    const holders = new Map();
    for (const t of [20, 21]) for (const h of JSON.parse(get(`${API}?licenseTypes=${t}&page=1`)).holders) holders.set(h.id, h.name);
    const casinos = [], sportsbooks = [];
    for (const [id, name] of holders) {
      if (/Personuppgift/.test(name)) continue;
      for (const l of JSON.parse(get(`${API}GetLicensesForHolder?holderId=${id}`))) {
        if (l.licenseStatus?.licenseStatusName !== "Aktiv") continue;
        const t = l.licenseType?.licenseTypeId;
        if (t !== 20 && t !== 21) continue;
        const urls = (l.licenseUrls ?? []).map((u) => u.licenseUrl).filter(Boolean);
        const row = { ...op(name, name, urls), validTo: (l.licenseTo ?? "").slice(0, 10) || null };
        (t === 20 ? casinos : sportsbooks).push(row);
      }
    }
    const page = (t) => `https://www.spelinspektionen.se/licens-o-tillstand/licensregister/?licenseTypes=${t}`;
    return {
      regulator: "Spelinspektionen (Swedish Gambling Authority)",
      casinos: list(casinos, page(20), "Active commercial online gambling licences ('Kommersiellt online'), each holder with the web addresses the register lists under that licence."),
      sportsbooks: list(sportsbooks, page(21), "Active commercial betting licences ('Kommersiellt vadhållning'), each holder with the web addresses the register lists under that licence."),
      why: "Sweden's Gambling Act (2018:1138) re-regulated the market from 1 January 2019: commercial online gambling and betting require a Spelinspektionen licence, and unlicensed sites are subject to payment blocking and warnings.",
    };
  },

  NL() {
    const listUrl = "https://openovergokken.nl/wp-json/wp/v2/kansspelwijzer?categories=28&per_page=100";
    const items = JSON.parse(get(listUrl));
    const casinos = [], sportsbooks = [];
    for (const it of items) {
      const html = get(it.link).replace(/\s+/g, " ");
      const field = (label) => clean((html.match(new RegExp(label + "\\s*(?:<[^>]+>\\s*)+([^<]*(?:<(?!/?(?:dt|dd|h[1-6]|div))[^>]*>[^<]*)*)")) || [])[1]);
      const types = field("Vergunningtype");
      const brands = field("Merknamen").split(/,\s*/).map((s) => s.trim()).filter(Boolean);
      const sites = field("Websites").split(/,\s*/).map((s) => s.trim()).filter((s) => /\./.test(s));
      const holder = clean(it.title.rendered);
      const rows = brands.length ? brands.map((b) => op(b, holder, sites)) : [op(holder, null, sites)];
      if (/Online casinospel/i.test(types)) casinos.push(...rows);
      if (/Online sportweddenschap/i.test(types)) sportsbooks.push(...rows);
    }
    const src = "https://kansspelautoriteit.nl/kansspelwijzer";
    return {
      regulator: "Kansspelautoriteit (Ksa)",
      casinos: list(casinos, src, "Licence holders whose Kansspelwijzer entry lists 'Online casinospel' among the licence types, with the brand names and websites the Ksa records for them."),
      sportsbooks: list(sportsbooks, src, "Licence holders whose Kansspelwijzer entry lists 'Online sportweddenschap' (online sports betting)."),
      why: "The Remote Gambling Act (Wet kansspelen op afstand) opened the Dutch online market on 1 October 2021. The Kansspelautoriteit licenses operators and keeps the Kansspelwijzer, its public register of every permitted provider.",
    };
  },

  DK() {
    // The page fills its table from a search-index POST (/api/indexSearch)
    // that answers the browser and times out for everything else, so the
    // table is read in a browser and saved, tab-separated, with the page's
    // own columns and "Last updated" date, to data/sources/. Re-read it there
    // when the page changes; the file header records when it was read.
    const file = path.join("data", "sources", "spillemyndigheden-licensed-operators.txt");
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.split("\t").length >= 4);
    const casinos = [], sportsbooks = [];
    for (const line of lines) {
      const [name, , doms, licences] = line.split("\t");
      const domains = (doms ?? "").split(/\s+/).map((s) => s.trim()).filter(Boolean);
      const row = op(name, null, domains);
      if (/Online casino/i.test(licences)) casinos.push(row);
      if (/\bBetting\b/.test(licences)) sportsbooks.push(row);
    }
    const src = "https://spillemyndigheden.dk/en-us/licensed-gambling-operators";
    return {
      regulator: "Spillemyndigheden (Danish Gambling Authority)",
      casinos: list(casinos, src, "Operators the Danish Gambling Authority lists with an online casino licence (including revenue-restricted licences), with the domains it records for each."),
      sportsbooks: list(sportsbooks, src, "Operators listed with a betting licence, with their recorded domains."),
      why: "Denmark's Gambling Act of 2012 ended the state monopoly on online casino and betting and put licensing under Spillemyndigheden, which publishes every licence holder and the domains each may use.",
    };
  },

  GB() {
    // The Gambling Commission publishes its whole business register as CSV
    // files joined on account number: businesses (the licensee's name),
    // licences (type, activity, status) and domain names (with a status).
    const base = "https://www.gamblingcommission.gov.uk/downloads/business-licence-register-";
    const page = "https://www.gamblingcommission.gov.uk/public-register/businesses/download";
    const csv = (name) => {
      const text = get(`${base}${name}.csv`);
      const rows = [];
      for (const line of text.split(/\r?\n/).slice(1)) {
        if (!line.trim()) continue;
        const cells = [];
        let cur = "", q = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q;
          } else if (ch === "," && !q) { cells.push(cur); cur = ""; }
          else cur += ch;
        }
        cells.push(cur);
        rows.push(cells.map((c) => c.trim()));
      }
      return rows;
    };
    const names = new Map(csv("businesses").map(([acc, name]) => [acc, name]));
    // Consumer-facing online gambling only: an active Remote licence for
    // casino, or for betting. Software, B2B "host" licences, lotteries and
    // land-based licences are not the sites a player signs up to.
    const CASINO = /^Casino$/i;
    const BETTING = /^(General Betting Standard - (Real|Virtual) Event|Pool Betting|Betting Intermediary|General Betting Limited)$/i;
    const kinds = new Map();
    for (const [acc, , status, type, activity] of csv("licences")) {
      if (status !== "Active" || type !== "Remote") continue;
      const k = kinds.get(acc) ?? { casino: false, sports: false };
      if (CASINO.test(activity)) k.casino = true;
      if (BETTING.test(activity)) k.sports = true;
      kinds.set(acc, k);
    }
    const casinos = [], sportsbooks = [];
    for (const [acc, domain, status] of csv("domain-names")) {
      // "White Label" domains are consumer sites run under the account's
      // licence; "Inactive" ones no longer are.
      if (status !== "Active" && status !== "White Label") continue;
      const k = kinds.get(acc);
      if (!k || (!k.casino && !k.sports)) continue;
      const row = op(host(domain), names.get(acc) ?? null, [domain]);
      if (k.casino) casinos.push(row);
      if (k.sports) sportsbooks.push(row);
    }
    return {
      regulator: "Gambling Commission",
      casinos: list(casinos, page, "Every active or white-label domain on the Gambling Commission's register held by an account with an active Remote casino licence, with the licensee the register names. Read from the Commission's downloadable register files."),
      sportsbooks: list(sportsbooks, page, "Every active or white-label domain held by an account with an active Remote betting licence (real-event, virtual-event or pool betting, or betting intermediary)."),
      why: "Great Britain licenses online gambling under the Gambling Act 2005: any operator taking bets from British players needs a Gambling Commission remote licence, wherever it is based, and must list every domain it trades on. The Commission publishes the whole register, licensees, licences and domains, as open data.",
    };
  },

  AR() {
    const url = "https://loteria.gba.gob.ar/juego-online";
    const html = get(url).replace(/\s+/g, " ");
    const ops = [];
    for (const [, label, href] of html.matchAll(/<a class="juegoOnline generalDesktop"[^>]*aria-label="Ir al sitio de ([^"]+)" href="([^"]+)"/g)) ops.push(op(label, null, [href]));
    return {
      regulator: "Lotería de la Provincia de Buenos Aires (Instituto Provincial de Lotería y Casinos)",
      operators: list(ops, url, "The online gaming sites the Province of Buenos Aires lottery links from its own 'Juego Online' page, where it states that legal sites end in .bet.ar. Argentina licenses online gambling province by province, so this list covers the Province of Buenos Aires only; the City of Buenos Aires (LOTBA) and other provinces keep their own."),
      why: "Argentina has no national online gambling law; each province licenses its own market. The Province of Buenos Aires authorised online gaming under Law 15,079 (2018), and its lottery publishes the licensed sites, all on the .bet.ar domain.",
    };
  },
};

/** Minimal .xlsx reader: shared strings + the first worksheet, cells keyed by column letter. */
function readXlsx(buf) {
  const dir = fs.mkdtempSync(path.join(CACHE, "xlsx-"));
  // Expand-Archive only accepts .zip, and an xlsx is one.
  const file = path.join(dir, "book.zip");
  fs.writeFileSync(file, buf);
  execSync(`powershell -NoProfile -Command "Expand-Archive -Force -LiteralPath '${file}' -DestinationPath '${dir}'"`, { stdio: "pipe" });
  const ss = [...fs.readFileSync(path.join(dir, "xl", "sharedStrings.xml"), "utf8").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => m[1].replace(/<[^>]+>/g, ""));
  const x = fs.readFileSync(path.join(dir, "xl", "worksheets", "sheet1.xml"), "utf8");
  return [...x.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((r) => {
    const o = {};
    for (const c of r[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = (c[1].match(/r="([A-Z]+)/) || [])[1];
      const isS = /t="s"/.test(c[1]);
      const v = (c[2] || "").match(/<v>([^<]*)<\/v>/);
      o[col] = v ? (isS ? ss[+v[1]] : v[1]) : null;
    }
    return o;
  });
}

/** Registers we could not read into rows, so the page can say so and link the regulator instead. */
const UNREADABLE = {
  GR: { regulator: "Hellenic Gaming Commission (HGC)", sourceUrl: "https://hgc.gov.gr/en/supervision-and-control/licences/b2c-online-licences/", note: "The HGC publishes its B2C online licence holders only through its website legality checker, not as a list that can be read; use the checker to confirm a site." },
  MT: { regulator: "Malta Gaming Authority (MGA)", sourceUrl: "https://www.mga.org.mt/licensee-hub/licensee-register/", note: "The MGA's licensee register is a search tool rather than a published list, and it licenses operators for other markets rather than for Maltese players." },
  RO: { regulator: "Oficiul Național pentru Jocuri de Noroc (ONJN)", sourceUrl: "https://onjn.gov.ro/", note: "ONJN's site sits behind a browser-verification wall that a reader can pass and a script cannot." },
  AT: { regulator: "Federal Ministry of Finance (BMF)", sourceUrl: "https://www.bmf.gv.at/themen/gluecksspiel-spielerschutz/gluecksspiel-in-oesterreich.html", note: "Online casino games are a federal concession held by a single operator (win2day, Casinos Austria), so there is no register of competing online casinos; sports betting is licensed by each federal state." },
  NO: { regulator: "Lotteritilsynet", sourceUrl: "https://lottstift.no/for-spillere/", note: "Norway's exclusive-rights model gives Norsk Tipping and Norsk Rikstoto the only legal online offers; there is no register of licensed operators." },
  FI: { regulator: "Finnish Licensing and Supervisory Authority (Lupa- ja valvontavirasto)", sourceUrl: "https://lvv.fi/", note: "Veikkaus holds the exclusive right until the licensing market opens in 2027; the new authority has published no licensees yet." },
  PL: { regulator: "Ministry of Finance", sourceUrl: "https://www.gov.pl/web/finanse", note: "Online casino is a state monopoly (Totalizator Sportowy's Total Casino); licensed online bookmakers are listed by the Ministry of Finance in a register this script could not reach." },
  CH: { regulator: "Federal Gaming Board (ESBK) and Gespa", sourceUrl: "https://www.gespa.ch/en/regulation-and-licensing/operators", note: "Swiss online casino games may only be offered by land-based casinos holding an extended concession from the Federal Council; online betting is run by the two lottery companies under Gespa. The ESBK's site did not expose a readable list." },
  IE: { regulator: "Gambling Regulatory Authority of Ireland (GRAI)", sourceUrl: "https://www.grai.ie/licensing-regulation/business-to-consumer-licenses/licensing-phasing", note: "GRAI is phasing in business-to-consumer licensing under the Gambling Regulation Act 2024 and has not yet published a register of online licensees." },
  NZ: { regulator: "Department of Internal Affairs (DIA)", sourceUrl: "https://www.dia.govt.nz/online-casino-gambling", note: "The Online Casino Gambling Act 2026 creates licences for up to 15 online casino operators; the DIA has not yet published licensees." },
};

// ---------------------------------------------------------------------------
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { countries: {} };
const out = { note: "Licensed online operators per country, read from each regulator's own register by scripts/fetch-world-licences.mjs. Rows are the register's wording; sourceUrl is the register page; asOf is the read date. Countries under 'unreadable' are ones whose regulator publishes no list a script can read, with the page to check instead.", read: TODAY, countries: { ...prev.countries }, unreadable: UNREADABLE };

const codes = ONLY.size ? [...ONLY] : Object.keys(ADAPTERS);
for (const code of codes) {
  const fn = ADAPTERS[code];
  if (!fn) { console.error(`no adapter for ${code}`); continue; }
  try {
    const r = fn();
    const n = (l) => (l ? l.operators.length : 0);
    console.log(`${code.padEnd(5)} casinos=${n(r.casinos)} sportsbooks=${n(r.sportsbooks)} operators=${n(r.operators)}`);
    out.countries[code] = r;
  } catch (e) {
    console.error(`${code}: ${e.message}`);
  }
}
if (DRY) console.log(JSON.stringify(out, null, 1).slice(0, 4000));
else {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
  console.log(`wrote ${OUT}`);
}
