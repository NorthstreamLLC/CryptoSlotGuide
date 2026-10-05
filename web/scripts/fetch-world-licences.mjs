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

  CO() {
    // Coljuegos' "Operadores de Juegos Online Autorizados" page: one table row
    // per concession contract, with the company, the site (link text and
    // href), the contract and the customer-service contacts.
    const url = "https://www.coljuegos.gov.co/publicaciones/301841/juegosonline/";
    const html = get(url);
    const table = (html.match(/<table[\s\S]*?<\/table>/) || [])[0];
    if (!table) throw new Error("CO: no table");
    const ops = [];
    for (const tr of table.match(/<tr[\s\S]*?<\/tr>/g)) {
      const td = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
      if (td.length < 4 || !/^\s*\d+\.?\s*$/.test(clean(td[0]))) continue;
      // The company cell is split across several <strong> tags mid-word
      // ("<strong>K</strong><strong>aizen ..."), so drop tags without adding a space.
      const company = clean(td[1].replace(/<[^>]+>/g, ""));
      const site = clean(td[2]);
      const href = (td[2].match(/href="([^"]+)"/) || [])[1];
      // The link text is the site's address where it reads as one (Wplay.co,
      // Sportium.com.co); where it is a bare brand (Bwin, Stake), use the link.
      const domain = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(site) ? site : href;
      ops.push(op(site, company, domain ? [domain] : []));
    }
    return {
      regulator: "Coljuegos (Empresa Industrial y Comercial del Estado Administradora del Monopolio Rentístico de los Juegos de Suerte y Azar)",
      operators: list(ops, url, "Coljuegos' list of online gaming operators, one row per concession contract, with the company and the site the list gives. A Coljuegos online contract covers games of chance operated over the internet, betting and casino games alike, and the list does not split them, so the operators are shown in one list."),
      why: "Colombia's gambling monopoly law (Law 643 of 2001), as amended by Article 93 of Law 1753 of 2015, classes sports betting and all games operated over the internet as 'novel games' run by Coljuegos, which authorises private operators through concession contracts and blocks unauthorised sites.",
    };
  },

  PE() {
    // MINCETUR's remote-gaming site embeds its "Titulares de Autorización de
    // Explotación" register as a grid that the page fills by POSTing to a
    // public JSON web service (opr=3). get() only does GET, so this one call
    // goes through curl directly, cached the same way.
    const page = "https://apuestasdeportivas.mincetur.gob.pe/Titulares_autorizacion.html";
    const ws = "https://consultasenlinea.mincetur.gob.pe/webCasinos/sistema/ws/wsConsultaWeb.asmx/listarConsultasRegistros_AD";
    const file = path.join(CACHE, "PE_titulares_opr3.json");
    if (!fs.existsSync(file) || Date.now() - fs.statSync(file).mtimeMs > 6 * 3600 * 1000) {
      const body = JSON.stringify({ objEnCon: { OPR: "3", CRITERIO: "", DES_CRITERIO: "" } }).replace(/"/g, '\\"');
      execSync(`curl -sL -A "${UA}" -m 90 -X POST -H "Content-Type: application/json; charset=utf-8" -d "${body}" -o "${file}" "${ws}"`, { stdio: "pipe" });
    }
    const rows = JSON.parse(fs.readFileSync(file, "utf8")).d;
    if (!rows?.length) throw new Error("PE: empty register");
    // Columns as the page labels them: NOMBRE_COMERCIAL = Empresa, WEB = Dominio,
    // SERVTECN = Autorización (JUEGOS or APUESTAS DEPORTIVAS), NUM_EXPEDIENTE = Estado.
    // The register names no brand, so each row is its domain, as for Germany.
    const casinos = [], sportsbooks = [];
    for (const r of rows) {
      if (!r.WEB || !/^VIGENTE$/i.test((r.NUM_EXPEDIENTE || "").trim())) continue;
      const row = op(host(r.WEB), r.NOMBRE_COMERCIAL, [r.WEB]);
      if (/^JUEGOS$/i.test(r.SERVTECN.trim())) casinos.push(row);
      else if (/APUESTAS DEPORTIVAS/i.test(r.SERVTECN)) sportsbooks.push(row);
    }
    return {
      regulator: "Ministerio de Comercio Exterior y Turismo (MINCETUR), Dirección General de Juegos de Casino y Máquinas Tragamonedas",
      casinos: list(casinos, page, "Holders of a MINCETUR authorisation for remote games ('Juegos'), with status 'Vigente', from the register of authorisation holders on MINCETUR's remote gaming site. Each row is the domain the register lists, with the company it names. Authorisations the register shows as temporarily suspended are left out."),
      sportsbooks: list(sportsbooks, page, "Holders of a MINCETUR authorisation for remote sports betting ('Apuestas Deportivas'), with status 'Vigente', from the same register, one row per listed domain."),
      why: "Peru regulates online casino games and sports betting under Law 31557, which regulates remote games and remote sports betting, and its regulation (Supreme Decree 005-2023-MINCETUR). MINCETUR's Dirección General de Juegos de Casino y Máquinas Tragamonedas authorises each operator and platform, publishes the register of authorisation holders, and blocks unauthorised platforms.",
    };
  },

  "AR-C"() {
    // LOTBA's responsible-gaming site lists the online agencies authorised in
    // the City of Buenos Aires as a row of logos, each linking to the site and
    // captioned with the authorising disposition. Commented-out entries (a
    // withdrawn licence, and company names the page does not display) are
    // dropped before reading.
    const url = "https://juegosegurolegal.gob.ar/?page=agencias-juego-en-linea";
    const html = get(url).replace(/<!--[\s\S]*?-->/g, "");
    const block = (html.match(/<ul id="logosConvenios">([\s\S]*?)<\/ul>/) || [])[1];
    if (!block) throw new Error("AR-C: no list");
    const ops = [];
    for (const [, li] of block.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
      const href = (li.match(/href="\s*([^"]+?)\s*"/) || [])[1];
      // The logo's alt text is the brand; the link title is wrong on one entry.
      const brand = (li.match(/alt="([^"]+)"/) || [])[1];
      if (!href || !brand) continue;
      ops.push(op(brand, null, [href]));
    }
    return {
      regulator: "Lotería de la Ciudad de Buenos Aires (LOTBA S.E.)",
      operators: list(ops, url, "The online gaming agencies Lotería de la Ciudad lists as the only ones authorised to sell online gambling in the City of Buenos Aires, with the site it links for each. The list does not say which products each agency offers, so they are shown in one list, and it names no licence holders. This covers the City of Buenos Aires only; the Province of Buenos Aires and the other provinces keep their own lists."),
      why: "Argentina licenses gambling province by province. In the City of Buenos Aires, Lotería de la Ciudad, created by City Law 5785 of 2016, is the enforcement authority of Law 538 on gambling and authorises each online agency by disposition or resolution.",
    };
  },

  EE() {
    const url = "https://www.emta.ee/en/business-client/registration-business/gambling-operators/list-legal-gambling-operators";
    const html = get(url);
    // The page is an accordion, one table per subtype of gambling, each under
    // a collapse button naming the subtype. A holder with several brands is one
    // row with rowspan on the holder and website cells, plus one single-cell
    // row per further brand.
    const section = (title) => {
      const at = html.search(new RegExp(`data-toggle="collapse"[^>]*>\\s*${title}\\s*<`));
      if (at < 0) throw new Error(`EE: no '${title}' section`);
      const start = html.indexOf("<table", at);
      const table = html.slice(start, html.indexOf("</table>", start));
      const rows = [];
      for (const [tr] of table.matchAll(/<tr[\s\S]*?<\/tr>/g)) {
        const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
        if (cells.length === 1 && rows.length) {
          const b = clean(cells[0]);
          if (b) rows.at(-1).brands.push(b);
          continue;
        }
        if (cells.length < 3) continue;
        const holder = clean(cells[0]);
        if (!holder || /^Gambling operator$/i.test(holder)) continue;
        const brand = clean(cells[1]);
        // Website cells are everything between the brand and the MTR link.
        const domains = cells.slice(2, -1).flatMap((c) => clean(c.replace(/<br\s*\/?>/g, " ")).split(/\s+/)).filter((s) => /^[\w.-]+\.[a-z]{2,}\/?$/i.test(s));
        rows.push({ holder, brands: brand ? [brand] : [], domains });
      }
      return rows.map((r) => op(r.brands.length ? r.brands.join(" / ") : r.holder, r.holder, r.domains));
    };
    return {
      regulator: "Estonian Tax and Customs Board (Maksu- ja Tolliamet, EMTA)",
      casinos: list(section("Games of chance online"), url, "Operators listed under 'Games of chance online' on the Tax and Customs Board's list of legal gambling operators, with the brands and websites the list gives. Where the list names no brand, the row carries the licence holder's name."),
      sportsbooks: list(section("Organisers of toto"), url, "Operators listed under 'Organisers of toto' — betting, in the Estonian Gambling Act's term — on the same list, with the brands and websites it gives."),
      why: "Under Estonia's Gambling Act (Hasartmänguseadus) the right to organise gambling, online included, comes from an operating permit issued by the Tax and Customs Board and entered in the Register of Economic Activities (MTR); EMTA publishes the legal operators and a list of blocked gambling websites.",
    };
  },

  SK() {
    // Two ÚRHH files: the list of granted individual licences (CSV, kept
    // current, one row per licence with its game codes) says who may run what;
    // the list of legal websites (XLSX) gives each operator's approved site.
    const licUrl = "https://www.urhh.sk/licencie-2/registre-zoznamy-a-ciselniky/zoznam-udelenych-individualnych-licencii/";
    const webUrl = "https://www.urhh.sk/licencie-2/legalne-webove-stranky/";
    const csvHref = (get(licUrl).match(/href="([^"]*individu[^"]*\.CSV)"/i) || [])[1];
    const xlsxHref = (get(webUrl).match(/href="([^"]*Zoznam_legalnych_webovych_sidiel[^"]*\.xlsx)"/i) || [])[1];
    if (!csvHref || !xlsxHref) throw new Error("SK: licence CSV or website XLSX link missing");
    // Names differ in punctuation and legal form between the two files ("ASCOMP, s.r.o." / "ASCOMP spol.s r.o."), so compare without them.
    const key = (s) => String(s).toLowerCase().replace(/[^a-z0-9áäčďéíĺľňóôŕšťúýž]/g, "").replace(/(spolsro|sro|as)$/, "");

    const sites = new Map(); // company key -> { casino: Set, bet: Set }
    for (const r of readXlsx(get(xlsxHref, { binary: true }))) {
      if (!r.A || !r.B || !r.C || /^Prevádzkovateľ$/i.test(r.A.trim())) continue;
      const s = sites.get(key(r.A)) ?? { casino: new Set(), bet: new Set() };
      if (/internetových hier v internetovom kasíne/i.test(r.C)) s.casino.add(r.B.trim());
      if (/kurzových stávok/i.test(r.C) && /internetovej herni/i.test(r.C)) s.bet.add(r.B.trim());
      sites.set(key(r.A), s);
    }

    const csvRows = (text) => text.replace(/^﻿/, "").split(/\r?\n/).map((line) => {
      const cells = []; let cur = "", q = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
        else if (ch === "," && !q) { cells.push(cur); cur = ""; } else cur += ch;
      }
      cells.push(cur);
      return cells.map((c) => c.trim());
    });
    const asDate = (s) => { const [d, m, y] = String(s).split(" ")[0].split("."); return new Date(+y, +m - 1, +d).getTime(); };
    const now = Date.now();
    const companies = new Map(); // key -> { name, casino, bet }
    for (const [no, name, , , until, , codes, kinds] of csvRows(get(encodeURI(decodeURI(csvHref))))) {
      if (!/^\d+$/.test(no ?? "") || !name || asDate(until) < now) continue;
      const c = companies.get(key(name)) ?? { name, casino: false, bet: false };
      // Codes 91–98 are the internet-casino game types ("... v i-kasíne");
      // 43 is fixed-odds betting in betting rooms, outlets and internet betting rooms.
      if (/v i-\s?kasíne/i.test(kinds)) c.casino = true;
      if (String(codes).split(/\s*,\s*/).includes("43")) c.bet = true;
      companies.set(key(name), c);
    }

    const casinos = [], sportsbooks = [];
    for (const [k, c] of companies) {
      const s = sites.get(k) ?? { casino: new Set(), bet: new Set() };
      if (c.casino) {
        if (s.casino.size) for (const d of s.casino) casinos.push(op(host(d), c.name, [d]));
        else casinos.push(op(c.name, c.name));
      }
      // A betting licence covers shops as well as the internet; only holders
      // with an approved betting website are online sportsbooks.
      if (c.bet) for (const d of s.bet) sportsbooks.push(op(host(d), c.name, [d]));
    }
    return {
      regulator: "Úrad pre reguláciu hazardných hier (Gambling Regulatory Authority, ÚRHH)",
      casinos: list(casinos, licUrl, "Holders of a current ÚRHH individual licence for internet-casino games ('Internetové hry ... v i-kasíne'), from the authority's list of granted individual licences, with the approved website from its list of legal websites ('Zoznam legálnych webových sídiel – Internet'). A holder with no website on that list carries its company name."),
      sportsbooks: list(sportsbooks, webUrl, "Holders of a current fixed-odds betting licence whose approved internet betting website is on ÚRHH's list of legal websites, one row per website."),
      why: "Slovakia's Gambling Act (Act No. 30/2019 Coll.) licenses internet casinos and online fixed-odds betting through individual licences granted by the Gambling Regulatory Authority (ÚRHH), which took over gambling supervision from the Ministry of Finance in 2019 and publishes the licences and the approved websites.",
    };
  },

  HU() {
    const url = "https://sztfh.hu/nyilvantartasok/engedelyek-kozhiteles/";
    const html = get(url);
    // The authentic licence register is one page of tabbed tables; the two
    // online ones are found by their first column header. Each row: approved
    // website, organiser "name, address", licence valid until, suspended?, PDF.
    const table = (header) => {
      const at = html.indexOf(header);
      if (at < 0) throw new Error(`HU: no table '${header}'`);
      const t = html.slice(html.lastIndexOf("<table", at), html.indexOf("</table>", at));
      const rows = [];
      for (const [tr] of t.matchAll(/<tr id="table_\d+_row_\d+"[\s\S]*?<\/tr>/g)) {
        const [site, org, until, suspended] = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => clean(m[1]));
        if (!site || /^IGEN/i.test(suspended ?? "")) continue;
        if (until && new Date(until.replace(/\./g, "-").replace(/-$/, "")) < new Date()) continue;
        const holder = org.split(/,\s*\d{4}\s/)[0];
        rows.push(op(host(site), holder, [site]));
      }
      return rows;
    };
    return {
      regulator: "Szabályozott Tevékenységek Felügyeleti Hatósága (Supervisory Authority for Regulated Activities, SZTFH)",
      casinos: list(table("Online kaszinó engedélyezett honlapjának címe"), url, "The 'Online kaszinók' table of SZTFH's authentic licence register: each approved online casino website and the organiser holding the licence. Only a company holding a Hungarian land-based casino concession may run an online casino."),
      sportsbooks: list(table("Távszerencsejáték engedélyezett honlapjának címe"), url, "The 'Távszerencsejátékok' table of the same register: remote betting licences, each approved website and its organiser."),
      why: "Hungary's Gambling Act (Act XXXIV of 1991, Szjtv.) lets only a casino concession company run online casino games, and since 1 January 2023 opens remote betting (távszerencsejáték) to licensed companies from Hungary and the EEA; the Supervisory Authority for Regulated Activities (SZTFH) grants the licences and keeps the authentic register.",
    };
  },

  HR() {
    const url = "https://porezna-uprava.gov.hr/hr/nedozvoljeno-obavljanje-gospodarske-aktivnosti-putem-interneta/3984";
    // The page is SharePoint output littered with zero-width spaces.
    const html = get(url).replace(/​/g, "");
    const at = html.indexOf("NAZIV PRIREĐIVAČA");
    if (at < 0) throw new Error("HR: no approved-operators table");
    const table = html.slice(html.lastIndexOf("<table", at), html.indexOf("</table>", at));
    const casinos = [], sportsbooks = [];
    // Columns: operator, (empty), game types, web address.
    for (const [tr] of table.matchAll(/<tr[\s\S]*?<\/tr>/g)) {
      const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
      if (cells.length < 4) continue;
      const holder = clean(cells[0]);
      const kinds = clean(cells[2]);
      const site = (cells[3].match(/href="([^"]+)"/) || [])[1] || clean(cells[3]);
      if (!holder || !site) continue;
      const row = op(host(site), holder, [site]);
      if (/CASINO IGRE/i.test(kinds)) casinos.push(row);
      if (/IGRE KLAĐENJA/i.test(kinds)) sportsbooks.push(row);
    }
    return {
      regulator: "Ministry of Finance, Tax Administration (Ministarstvo financija, Porezna uprava)",
      casinos: list(casinos, url, "From the Tax Administration's list of operators the Ministry of Finance has approved to run games of chance over the internet: those approved for casino games ('CASINO IGRE'), with the web address the list gives."),
      sportsbooks: list(sportsbooks, url, "Operators on the same list approved for betting games ('IGRE KLAĐENJA'), with their web address."),
      why: "Under Croatia's Games of Chance Act (Zakon o igrama na sreću, NN 87/09 as amended) the right to organise games of chance belongs to the state and passes to Hrvatska Lutrija, while other companies may run casino games and betting on a Government decision and Ministry of Finance approval, online included; the Tax Administration blocks unlicensed gambling sites.",
    };
  },

  SI() {
    const page = "https://www.gov.si/teme/igre-na-sreco/";
    const html = get(page);
    // The Ministry of Finance publishes each concession register as a one-page
    // PDF extract; the online one is "... spletnih iger na srečo v igralnici".
    const href = (html.match(/href="([^"]*Izvlecek-iz-registra-koncesionarjev-za-prirejanje-spletnih-iger[^"]*\.pdf)"/i) || [])[1];
    if (!href) throw new Error("SI: no online-casino register extract");
    const pdfUrl = new URL(href, page).href;
    const file = path.join(CACHE, "si-online-register.pdf");
    fs.writeFileSync(file, get(pdfUrl, { binary: true }));
    // pdftotext ships with Git for Windows; -raw keeps each cell on its own line.
    const bin = process.platform === "win32" && fs.existsSync("C:/Program Files/Git/mingw64/bin/pdftotext.exe") ? '"C:/Program Files/Git/mingw64/bin/pdftotext.exe"' : "pdftotext";
    const text = execSync(`${bin} -enc UTF-8 -raw "${file}" -`, { encoding: "utf8" });
    const casinos = [];
    // One numbered entry per online casino: holder, street, postcode+town, then the casino's name.
    for (const block of text.split(/^\d+\.\s*$/m).slice(1)) {
      const lines = block.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      const post = lines.findIndex((l) => /^\d{4}\s/.test(l));
      if (post < 1) continue;
      const holder = lines[0].replace(/,?\s*d\.d\.?$/i, ", d.d.");
      const name = lines.slice(post + 1).join(" ");
      if (!name) continue;
      const brand = name.split(/\s+[–-]\s+/)[0];
      const domain = (brand.match(/^[\w-]+(\.[\w-]+)*\.si$/i) || [])[0];
      casinos.push(op(brand, holder, domain ? [domain] : []));
    }
    return {
      regulator: "Ministry of Finance (Ministrstvo za finance); supervision by the Financial Administration (FURS)",
      casinos: list(casinos, pdfUrl, "The Ministry of Finance's extract from the register of concessionaires for online games of chance in a casino ('spletne igre na srečo v igralnici'): each online casino and the casino concessionaire running it. The register names the online casino by its .si address."),
      why: "Under Slovenia's Gaming Act (Zakon o igrah na srečo, ZIS) organising games of chance is the exclusive right of the Republic of Slovenia, granted only by permit or concession; the Ministry of Finance keeps the concession registers, including one for online casino games, while the Financial Administration (FURS) supervises and can have unlicensed gambling sites blocked by court order.",
    };
  },

  PL() {
    const url = "https://www.gov.pl/web/finanse/legalny-hazard";
    const html = get(url);
    // Two tables under "Legalne podmioty w Internecie": Tabela numer 1 is the
    // state monopoly (Totalizator Sportowy) with the activity per domain,
    // Tabela numer 2 the bookmakers holding an internet betting permit.
    const table = (label) => {
      const at = html.indexOf(label);
      if (at < 0) throw new Error(`PL: no '${label}'`);
      const t = html.slice(html.indexOf("<table", at), html.indexOf("</table>", at));
      return [...t.matchAll(/<tr[\s\S]*?<\/tr>/g)]
        .map(([tr]) => [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]))
        .filter((cells) => /^\d+$/.test(clean(cells[0])));
    };
    // "Totalizator Sportowy Sp. z o.o., KRS 0000007411" -> drop the KRS number;
    // a foreign operator is named with its Polish representative, kept as written.
    const holder = (cell) => clean(cell).replace(/,\s*KRS\s*\d+$/i, "");
    // Domain cells can hold several domains on separate lines, or a domain plus a remark.
    const domains = (cell) => clean(cell.replace(/<\/p>|<br\s*\/?>/g, " ")).split(/\s+/).filter((s) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(s));

    const casinos = [], remarks = [];
    for (const [, who, scope, dom] of table("Tabela numer 1")) {
      // The monopoly's online casino ('kasyno online') and online slot games
      // ('gry na automatach'); number games and lotteries are not casinos.
      if (!/kasyno online|gry na automatach/i.test(clean(scope))) continue;
      for (const d of domains(dom)) casinos.push(op(d, holder(who), [d]));
      // The list sometimes adds a remark after a domain, e.g. that a site is in a test phase.
      const remark = (clean(dom).match(/\(([^)]+)\)/) || [])[1];
      if (remark) remarks.push(`${domains(dom)[0]}: '${remark}'`);
    }
    const sportsbooks = [];
    for (const [, who, dom] of table("Tabela numer 2")) for (const d of domains(dom)) sportsbooks.push(op(d, holder(who), [d]));
    return {
      regulator: "Ministry of Finance (Ministerstwo Finansów)",
      casinos: list(casinos, url, "Online casino in Poland is a state monopoly: the Ministry of Finance's list of legal internet operators names Totalizator Sportowy's domains for 'kasyno online' and online slot games ('gry na automatach')." + (remarks.length ? ` Remarks on the list: ${remarks.join("; ")}.` : "")),
      sportsbooks: list(sportsbooks, url, "Bookmakers the Ministry of Finance lists as legal on the internet betting market ('Legalne podmioty na rynku zakładów wzajemnych'), one row per domain, with the permit holder as named (KRS number dropped)."),
      why: "Poland's Gambling Act of 19 November 2009 (ustawa o grach hazardowych) makes online gambling other than betting and promotional lotteries a state monopoly run by Totalizator Sportowy, while online betting needs a Ministry of Finance permit; unlicensed domains are entered in the Ministry's register of blocked domains.",
    };
  },

  GR() {
    // hgc.gov.gr links its "Μητρώο Κατόχων Άδειας" (register of licence holders)
    // to a SharePoint list view on the HGC's certifications site. One row per
    // licence: company, licence no., country, type (Betting (Type 1), Other
    // Online Games (Type 2), Land Based Casino), website(s), valid until,
    // IsValid. 30 rows a page. SharePoint serves the view either as a JSON blob
    // (var WPQnListData = {...}) or as a server-rendered table, so both are read.
    const base = "https://certifications.gamingcommission.gov.gr";
    const url = `${base}/publicRecordsOnline/SitePages/KatoxoiAdeiasOnline.aspx`;
    const licences = new Map(); // licence no. -> { company, type, sites, valid }
    let next = url, first = 1;
    for (let guard = 0; next && guard < 20; guard++) {
      const html = get(next);
      let nextHref = null;
      const data = html.match(/var WPQ\d+ListData = (\{[\s\S]*?\});\s*var /);
      if (data) {
        const j = JSON.parse(data[1]);
        for (const r of j.Row) {
          licences.set(r.EniaiosKodikosAdeias, { company: r.Title, type: r.LicenseType, sites: (r.Website || []).map((w) => w.lookupValue), valid: r.IsValid });
        }
        nextHref = j.NextHref || null;
      } else {
        for (const [tr] of html.matchAll(/<tr class="(?:ms-alternating )?ms-itmhover"[\s\S]*?<\/tr>/g)) {
          const [company, licence, , , type, site, , valid] = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].slice(1).map((m) => clean(m[1]));
          if (licence) licences.set(licence, { company, type, sites: site.split(/\s*;\s*/), valid });
        }
        const pages = [...html.matchAll(/RefreshPageTo\(event, &quot;[^&]*SitePages\/KatoxoiAdeiasOnline\.aspx(\?[^"]*?PageFirstRow=(\d+)[^"]*?)&quot;/g)]
          .map((m) => ({ href: m[1].replace(/&amp;/g, "&"), row: +m[2] }))
          .filter((p) => p.row > first)
          .sort((a, b) => a.row - b.row);
        if (pages.length) nextHref = pages[0].href;
      }
      if (!nextHref) break;
      const row = +((nextHref.match(/PageFirstRow=(\d+)/) || [])[1] || 0);
      if (row <= first) break;
      first = row;
      // curl treats {} as a glob, so a braced View GUID is percent-encoded.
      next = url + nextHref.replace(/&&/g, "&").replace(/\{/g, "%7B").replace(/\}/g, "%7D");
    }
    if (!licences.size) throw new Error("GR: no rows read from the HGC register");
    const casinos = [], sportsbooks = [];
    for (const { company, type, sites, valid } of licences.values()) {
      if (!/^Ναι$/i.test(valid)) continue; // IsValid "Όχι": lapsed or revoked
      const rows = sites.filter((d) => /\./.test(d)).map((d) => op(host(d), company, [d]));
      if (/Type 1/i.test(type)) sportsbooks.push(...rows);
      else if (/Type 2/i.test(type)) casinos.push(...rows);
      // "Land Based Casino" licences carry no website and are not online.
    }
    return {
      regulator: "Hellenic Gaming Commission (Επιτροπή Εποπτείας και Ελέγχου Παιγνίων, HGC)",
      casinos: list(casinos, url, "Holders of a valid HGC Type 2 licence ('Other Online Games': casino, live casino and poker), from the Commission's register of licence holders, one row per website the register lists."),
      sportsbooks: list(sportsbooks, url, "Holders of a valid HGC Type 1 licence ('Online Betting'), from the same register, one row per website."),
      why: "Greece licenses online gambling under Law 4002/2011 and Ministerial Decision 79835 ΕΞ 2020: the Hellenic Gaming Commission grants Type 1 licences for online betting and Type 2 for other online games, and possession of an HGC licence is a prerequisite for offering online gambling to players in Greece.",
    };
  },

  "AU-NT"() {
    // The NT Wagering Commission's list: one table row per trading name, with
    // the licensed company, the website and a comments column. Rows marked
    // "Not currently trading" have no website and are left out.
    const url = "https://dth.nt.gov.au/boards-and-committees/wagering-commission/licensed-wagering-operators";
    const html = get(url).replace(/\s+/g, " ");
    const table = (html.match(/<table id="bookmakers"[\s\S]*?<\/table>/) || [])[0];
    if (!table || !/Trading as/.test(table)) throw new Error("NT Wagering Commission: licensed operators table not found");
    const sportsbooks = [];
    for (const tr of table.split(/<tr[\s>]/).slice(1)) {
      const td = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
      if (td.length < 4) continue;
      const [, company, brand, site, comment = ""] = td;
      const href = (site.match(/href="([^"]+)"/) || [])[1];
      if (!href || /not currently trading/i.test(clean(comment))) continue;
      sportsbooks.push(op(brand, company, [href]));
    }
    if (sportsbooks.length < 20) throw new Error(`NT Wagering Commission: only ${sportsbooks.length} trading operators read`);
    // Online casino: the Interactive Gambling Act 2001 on the Federal Register of Legislation.
    const igaUrl = "https://www.legislation.gov.au/C2004A00851/latest/text";
    const iga = clean(get(igaUrl));
    if (!/Interactive Gambling Act 2001/.test(iga) || !/Prohibited interactive gambling services not to be provided to customers in Australia/.test(iga))
      throw new Error("Interactive Gambling Act page did not show the s 15 prohibition");
    return {
      regulator: "Northern Territory Wagering Commission",
      sportsbooks: list(sportsbooks, url, "The NT Wagering Commission's list of licensed wagering operators (sports bookmakers, betting exchanges and the NT totalisator), one row per trading name with the licensed company and the website the list gives. Trading names the list marks 'Not currently trading' are left out. Most Australian online bookmakers hold their licence in the Northern Territory; the TAB row is Ubet NT, licensed by the Director of Totalisator Licensing and Regulation."),
      why: "Under the Interactive Gambling Act 2001, online casino games are prohibited interactive gambling services that may not be provided to customers in Australia, and the ACMA investigates breaches, so there are no licensed online casinos. Online sports and race betting is legal only through wagering operators licensed in an Australian state or territory; the Northern Territory licenses most of them under its Racing and Wagering Act 2024.",
    };
  },

  "CA-BC"() {
    // B.C. government's "Gambling in B.C." page names PlayNow.com as the only
    // legal online gambling site and BCLC as the operator. bclc.com itself
    // answers scripts with an Akamai "Access Denied" page, so it is not used.
    const url = "https://www2.gov.bc.ca/gov/content/sports-culture/gambling-fundraising/gambling-in-bc";
    const html = get(url);
    const text = clean(html);
    for (const re of [/PlayNow\.com\s+is the only legal online gambling site in B\.C\./, /BC Lottery Corporation \(BCLC\) manages all commercial gambling, including casinos and online gambling/])
      if (!re.test(text)) throw new Error(`gov.bc.ca: expected wording not found (${re})`);
    const href = (html.match(/href="(https?:\/\/(?:www\.)?playnow\.com[^"]*)"/) || [])[1];
    if (!href) throw new Error("gov.bc.ca: no link to playnow.com");
    return {
      regulator: "Independent Gambling Control Office (IGCO), with BCLC as operator",
      operators: list([op("PlayNow.com", "BC Lottery Corporation (BCLC)", [href])], url, "The Government of British Columbia names PlayNow.com, run by the BC Lottery Corporation, as the only legal online gambling site in B.C."),
      why: "In B.C., gambling is legal only when it is run by the provincial government: the BC Lottery Corporation manages all commercial gambling, including online gambling, and PlayNow.com is the only legal online gambling site. The Independent Gambling Control Office regulates gambling in the province.",
    };
  },

  "CA-AB"() {
    // AGLC's Gaming Registrants list filtered to class "iGaming - Operator"
    // (class id 315), ten registrants a page. Each registrant shows its
    // registered name and, one paragraph each, the sites or brands it is
    // registered for.
    const base = "https://aglc.ca/gaming-registrants?class_of_registration=315";
    const operators = [];
    let registrants = 0;
    for (let page = 0; page < 20; page++) {
      const html = get(`${base}&page=${page}`).replace(/\s+/g, " ");
      if (!/Gaming Registrants/.test(html)) throw new Error("AGLC: registrants page did not load");
      let found = 0;
      for (const a of html.split(/<article data-history-node-id/).slice(1)) {
        const name = clean((a.match(/<h2>\s*<span>([^<]+)<\/span>/) || [])[1]);
        if (!name || !/iGaming - Operator/.test(a)) continue;
        found++;
        const box = (a.match(/<div>([\s\S]*?)<\/div>\s*<p class="stream"/) || [])[1] || "";
        const items = [...box.matchAll(/<p>([\s\S]*?)<\/p>/g)].flatMap((m) => {
          const t = clean(m[1]);
          // A bold line is either one brand name or one or more web addresses.
          return /^[\w.-]+\.[a-z]{2,}(\s+[\w.-]+\.[a-z]{2,})*$/i.test(t) ? t.split(/\s+/) : [t];
        }).filter(Boolean);
        if (!items.length) operators.push(op(name.replace(/^.* o\/a /, ""), name));
        for (const it of items) operators.push(op(it, name, /\./.test(it) && !/\s/.test(it) ? [it] : []));
      }
      registrants += found;
      if (!found) break;
    }
    if (registrants < 20) throw new Error(`AGLC: only ${registrants} iGaming operators read`);
    // Legal basis: AGLC's iGaming page.
    const why = "https://aglc.ca/igaming";
    const w = clean(get(why));
    if (!/registered with AGLC/.test(w) || !/Alberta iGaming Corporat/.test(w)) throw new Error("AGLC iGaming page wording changed");
    return {
      regulator: "Alberta Gaming, Liquor and Cannabis (AGLC), with the Alberta iGaming Corporation",
      operators: list(operators, base, `AGLC's Gaming Registrants list, filtered to 'iGaming - Operator' (${registrants} registrants). One row per site or brand AGLC shows under each registrant, with the registrant's name as AGLC gives it; a registrant listed without a site appears once under its own name. The list does not say which registrants run casino and which run sports betting, so they are in one list. Play Alberta (playalberta.ca) is the province's own site, run by AGLC.`),
      why: "Alberta opened its online gambling market in 2026: since 13 July every iGaming operator must be registered with AGLC, the regulator, and hold a commercial agreement with the Alberta iGaming Corporation (AiGC). Play Alberta, the AGLC-run site that was previously the only regulated option, continues alongside the registered private operators.",
    };
  },

  "CA-QC"() {
    // Loto-Québec's own "Online gaming" page: lotoquebec.com is the only legal
    // gaming website in Québec and carries casino games and sports betting.
    const url = "https://societe.lotoquebec.com/en/offering/online-gaming";
    const html = get(url);
    const text = clean(html);
    for (const re of [/lotoquebec\.com, is the only legal gaming website in Québec/, /Casino games/, /Sports betting/])
      if (!re.test(text)) throw new Error(`Loto-Québec: expected wording not found (${re})`);
    if (!/Loto-Québec was introduced in 1969 to regulate gambling/.test(clean(get("https://societe.lotoquebec.com/en/corporation/about-us"))))
      throw new Error("Loto-Québec: about page wording changed");
    const row = op("lotoquebec.com", "Loto-Québec", ["lotoquebec.com"]);
    const note = "Loto-Québec states that its gaming website, lotoquebec.com, is the only legal gaming website in Québec. The site carries casino games (slots, table and live games), poker and bingo, and sports betting (Mise-o-jeu), lotteries and instant games.";
    return {
      regulator: "Loto-Québec (government corporation)",
      casinos: list([row], url, note),
      sportsbooks: list([row], url, note),
      why: "Loto-Québec, the Québec government corporation set up in 1969 to run gambling in the province, operates the province's only legal gaming website, lotoquebec.com, which offers both online casino games and sports betting.",
    };
  },

  "CA-MB"() {
    // Know My Limits is the public-education arm of the Liquor, Gaming and
    // Cannabis Authority of Manitoba (LGCA); its sports-betting page names
    // PlayNow.com as the only gambling site licensed in Manitoba, and its
    // online-gambling page names Manitoba Liquor and Lotteries as PlayNow's operator.
    const url = "https://cml-kml.ca/en/gambling/sports-betting/";
    const url2 = "https://cml-kml.ca/en/gambling/online-gambling/";
    const a = clean(get(url)), b = clean(get(url2));
    if (!/The only gambling site licensed in Manitoba is PlayNow\.com/.test(a)) throw new Error("LGCA Know My Limits: sports-betting wording changed");
    if (!/Manitoba Liquor and Lotteries.{0,3}\s*PlayNow is the only regulated site in Manitoba/.test(b)) throw new Error("LGCA Know My Limits: online-gambling wording changed");
    if (!/public education arm of the Liquor, Gaming and Cannabis Authority of Manitoba/.test(clean(get("https://cml-kml.ca/en/")))) throw new Error("Know My Limits no longer identifies itself as the LGCA's");
    return {
      regulator: "Liquor, Gaming and Cannabis Authority of Manitoba (LGCA)",
      operators: list([op("PlayNow.com", "Manitoba Liquor and Lotteries", ["playnow.com"])], url, `The LGCA's public-education site states that the only gambling site licensed in Manitoba is PlayNow.com, and (${url2}) that Manitoba Liquor and Lotteries' PlayNow is the only regulated site in the province.`),
      why: "Manitoba's only licensed online gambling site is PlayNow.com, operated by the Crown corporation Manitoba Liquor and Lotteries and regulated by the Liquor, Gaming and Cannabis Authority of Manitoba; other sites offering gambling to Manitobans are not regulated in the province.",
    };
  },

  "CA-SK"() {
    // SLGA's FAQ names PlayNow.com as Saskatchewan's only legal online gaming
    // website, operated by SIGA and managed by Lotteries and Gaming Saskatchewan.
    const url = "https://www.slga.com/faqs";
    const text = clean(get(url));
    if (!/PlayNow\.com, Saskatchewan's only legal online gaming website \(operated by SIGA\)/.test(text)) throw new Error("SLGA FAQ: PlayNow wording changed");
    if (!/Lotteries and Gaming Saskatchewan \(LGS\)/.test(text)) throw new Error("SLGA FAQ: LGS not named");
    return {
      regulator: "Saskatchewan Liquor and Gaming Authority (SLGA)",
      operators: list([op("PlayNow.com", "Saskatchewan Indian Gaming Authority (SIGA)", ["playnow.com"])], url, "SLGA's FAQ: PlayNow.com is Saskatchewan's only legal online gaming website, operated by the Saskatchewan Indian Gaming Authority (SIGA) and managed by Lotteries and Gaming Saskatchewan (LGS), the commercial Crown corporation."),
      why: "Saskatchewan has one legal online gaming website, PlayNow.com, operated by SIGA and managed by the Crown corporation Lotteries and Gaming Saskatchewan; the Saskatchewan Liquor and Gaming Authority regulates gaming in the province.",
    };
  },

  "CA-NB"() {
    // Atlantic Lottery (alc.ca) is the Crown corporation owned by the four
    // Atlantic provincial governments. Its own pages give the company name,
    // the provinces it serves and its online casino; the Government of
    // Newfoundland and Labrador's release on online gaming states that it is
    // the only regulated provider in the region.
    const terms = "https://www.alc.ca/content/alc/en/legal/terms-and-conditions.html";
    const about = "https://www.alc.ca/content/alc/en/corporate/about-atlantic-lottery.html";
    const casino = "https://www.alc.ca/content/alc/en/our-games/casino.html";
    const release = "https://www.gov.nl.ca/releases/2023/fin/0612n03/";
    const checks = [
      [terms, /Atlantic Lottery Corporation Inc\./],
      [terms, /resident of either Newfoundland and Labrador, Nova Scotia, New Brunswick or Prince Edward Island/],
      [about, /owned by the four regional provincial governments/],
      [casino, /secure and regulated online Casino/],
      [casino, /available in Nova Scotia, Newfoundland and Labrador, and Prince Edward Island/],
      [release, /As the only regulated provider in the region, Atlantic Lottery/],
      [release, /following New Brunswick in 2020 and Nova Scotia in 2022/],
    ];
    for (const [u, re] of checks) if (!re.test(clean(get(u)))) throw new Error(`Atlantic Lottery: expected wording not found on ${u} (${re})`);
    const url = terms;
    return {
      regulator: "Atlantic Lottery Corporation (owned by the governments of New Brunswick, Nova Scotia, Prince Edward Island and Newfoundland and Labrador)",
      operators: list([op("alc.ca", "Atlantic Lottery Corporation Inc.", ["alc.ca"])], url, "Atlantic Lottery's terms of service: alc.ca is offered by Atlantic Lottery Corporation Inc. to residents of the four Atlantic provinces, New Brunswick among them. The Government of Newfoundland and Labrador (https://www.gov.nl.ca/releases/2023/fin/0612n03/) describes Atlantic Lottery as the only regulated provider in the region. alc.ca carries lottery, instant-win, casino and PRO•LINE sports betting games."),
      why: "Online gambling in New Brunswick is offered only through Atlantic Lottery's alc.ca: Atlantic Lottery is owned by the four Atlantic provincial governments, and the Government of Newfoundland and Labrador describes it as the only regulated provider in the region. New Brunswick was the first Atlantic province to make online games available, in 2020.",
    };
  },

  "CA-NS"() {
    // Atlantic Lottery (alc.ca) is the Crown corporation owned by the four
    // Atlantic provincial governments. Its own pages give the company name,
    // the provinces it serves and its online casino; the Government of
    // Newfoundland and Labrador's release on online gaming states that it is
    // the only regulated provider in the region.
    const terms = "https://www.alc.ca/content/alc/en/legal/terms-and-conditions.html";
    const about = "https://www.alc.ca/content/alc/en/corporate/about-atlantic-lottery.html";
    const casino = "https://www.alc.ca/content/alc/en/our-games/casino.html";
    const release = "https://www.gov.nl.ca/releases/2023/fin/0612n03/";
    const checks = [
      [terms, /Atlantic Lottery Corporation Inc\./],
      [terms, /resident of either Newfoundland and Labrador, Nova Scotia, New Brunswick or Prince Edward Island/],
      [about, /owned by the four regional provincial governments/],
      [casino, /secure and regulated online Casino/],
      [casino, /available in Nova Scotia, Newfoundland and Labrador, and Prince Edward Island/],
      [release, /As the only regulated provider in the region, Atlantic Lottery/],
      [release, /following New Brunswick in 2020 and Nova Scotia in 2022/],
    ];
    for (const [u, re] of checks) if (!re.test(clean(get(u)))) throw new Error(`Atlantic Lottery: expected wording not found on ${u} (${re})`);
    const url = terms;
    return {
      regulator: "Atlantic Lottery Corporation (owned by the governments of New Brunswick, Nova Scotia, Prince Edward Island and Newfoundland and Labrador)",
      operators: list([op("alc.ca", "Atlantic Lottery Corporation Inc.", ["alc.ca"])], url, "Atlantic Lottery's terms of service: alc.ca is offered by Atlantic Lottery Corporation Inc. to residents of the four Atlantic provinces, Nova Scotia among them. The Government of Newfoundland and Labrador (https://www.gov.nl.ca/releases/2023/fin/0612n03/) describes Atlantic Lottery as the only regulated provider in the region. alc.ca carries lottery, instant-win, casino and PRO•LINE sports betting games."),
      why: "Online gambling in Nova Scotia is offered only through Atlantic Lottery's alc.ca: Atlantic Lottery is owned by the four Atlantic provincial governments, and the Government of Newfoundland and Labrador describes it as the only regulated provider in the region. Nova Scotia made online games available in 2022.",
    };
  },

  "CA-PE"() {
    // Atlantic Lottery (alc.ca) is the Crown corporation owned by the four
    // Atlantic provincial governments. Its own pages give the company name,
    // the provinces it serves and its online casino; the Government of
    // Newfoundland and Labrador's release on online gaming states that it is
    // the only regulated provider in the region.
    // princeedwardisland.ca answers scripts with a Radware bot check, so no PEI
    // government page is read.
    const terms = "https://www.alc.ca/content/alc/en/legal/terms-and-conditions.html";
    const about = "https://www.alc.ca/content/alc/en/corporate/about-atlantic-lottery.html";
    const casino = "https://www.alc.ca/content/alc/en/our-games/casino.html";
    const release = "https://www.gov.nl.ca/releases/2023/fin/0612n03/";
    const checks = [
      [terms, /Atlantic Lottery Corporation Inc\./],
      [terms, /resident of either Newfoundland and Labrador, Nova Scotia, New Brunswick or Prince Edward Island/],
      [about, /owned by the four regional provincial governments/],
      [casino, /secure and regulated online Casino/],
      [casino, /available in Nova Scotia, Newfoundland and Labrador, and Prince Edward Island/],
      [release, /As the only regulated provider in the region, Atlantic Lottery/],
      [release, /following New Brunswick in 2020 and Nova Scotia in 2022/],
    ];
    for (const [u, re] of checks) if (!re.test(clean(get(u)))) throw new Error(`Atlantic Lottery: expected wording not found on ${u} (${re})`);
    const url = terms;
    return {
      regulator: "Atlantic Lottery Corporation (owned by the governments of New Brunswick, Nova Scotia, Prince Edward Island and Newfoundland and Labrador)",
      operators: list([op("alc.ca", "Atlantic Lottery Corporation Inc.", ["alc.ca"])], url, "Atlantic Lottery's terms of service: alc.ca is offered by Atlantic Lottery Corporation Inc. to residents of the four Atlantic provinces, Prince Edward Island among them. The Government of Newfoundland and Labrador (https://www.gov.nl.ca/releases/2023/fin/0612n03/) describes Atlantic Lottery as the only regulated provider in the region. alc.ca carries lottery, instant-win, casino and PRO•LINE sports betting games."),
      why: "Online gambling in Prince Edward Island is offered only through Atlantic Lottery's alc.ca: Atlantic Lottery is owned by the four Atlantic provincial governments, and the Government of Newfoundland and Labrador describes it as the only regulated provider in the region. Atlantic Lottery's casino page lists Prince Edward Island among the provinces where its live online casino games are available.",
    };
  },

  "CA-NL"() {
    // Atlantic Lottery (alc.ca) is the Crown corporation owned by the four
    // Atlantic provincial governments. Its own pages give the company name,
    // the provinces it serves and its online casino; the Government of
    // Newfoundland and Labrador's release on online gaming states that it is
    // the only regulated provider in the region.
    const terms = "https://www.alc.ca/content/alc/en/legal/terms-and-conditions.html";
    const about = "https://www.alc.ca/content/alc/en/corporate/about-atlantic-lottery.html";
    const casino = "https://www.alc.ca/content/alc/en/our-games/casino.html";
    const release = "https://www.gov.nl.ca/releases/2023/fin/0612n03/";
    const checks = [
      [terms, /Atlantic Lottery Corporation Inc\./],
      [terms, /resident of either Newfoundland and Labrador, Nova Scotia, New Brunswick or Prince Edward Island/],
      [about, /owned by the four regional provincial governments/],
      [casino, /secure and regulated online Casino/],
      [casino, /available in Nova Scotia, Newfoundland and Labrador, and Prince Edward Island/],
      [release, /As the only regulated provider in the region, Atlantic Lottery/],
      [release, /following New Brunswick in 2020 and Nova Scotia in 2022/],
    ];
    for (const [u, re] of checks) if (!re.test(clean(get(u)))) throw new Error(`Atlantic Lottery: expected wording not found on ${u} (${re})`);
    const url = release;
    return {
      regulator: "Atlantic Lottery Corporation (owned by the governments of New Brunswick, Nova Scotia, Prince Edward Island and Newfoundland and Labrador)",
      operators: list([op("alc.ca", "Atlantic Lottery Corporation Inc.", ["alc.ca"])], url, "The Government of Newfoundland and Labrador's release on online gaming: an online gaming platform is available in the province through Atlantic Lottery (alc.ca), the only regulated provider in the region. alc.ca carries lottery, instant-win, casino and PRO•LINE sports betting games."),
      why: "Online gambling in Newfoundland and Labrador is offered only through Atlantic Lottery's alc.ca: Atlantic Lottery is owned by the four Atlantic provincial governments, and the Government of Newfoundland and Labrador describes it as the only regulated provider in the region. Newfoundland and Labrador made online games available through Atlantic Lottery in June 2023.",
    };
  },

  AT() {
    // BMF's list of federal concession holders: Österreichische Lotterien GmbH
    // holds the lottery concession, which covers electronic lotteries (online
    // gambling) on win2day.at.
    const url = "https://www.bmf.gv.at/themen/gluecksspiel-spielerschutz/gesetzliche-grundlagen-gluecksspiel/konzessionaere-ausspielbewilligte.html";
    const html = get(url);
    const text = clean(html);
    for (const re of [/Österreichische Lotterien GmbH/, /Elektronische Lotterien \( ?Online ?-Glücksspiel\) auf www\.win2day\.at/, /bis 30\. September 2027 berechtigt/])
      if (!re.test(text)) throw new Error(`BMF: expected wording not found (${re})`);
    if (!/href="https:\/\/www\.win2day\.at\/?"/.test(html)) throw new Error("BMF: no link to win2day.at");
    // The BMF's monopoly FAQ, for the legal basis in `why`.
    const faq = clean(get("https://www.bmf.gv.at/themen/gluecksspiel-spielerschutz/gesetzliche-grundlagen-gluecksspiel/faq-gluecksspielmonopol.html"));
    for (const re of [/dürfen weder real noch online im Internet ohne Konzession nach dem Glücksspielgesetz entgeltlich angeboten werden/, /Die Annahme von Sportwetten bedarf einer landesgesetzlichen Bewilligung/])
      if (!re.test(faq)) throw new Error(`BMF FAQ: expected wording not found (${re})`);
    return {
      regulator: "Federal Ministry of Finance (BMF); supervision by the Finanzamt Österreich",
      casinos: list([op("win2day", "Österreichische Lotterien GmbH", ["https://www.win2day.at/"])], url, "The BMF lists Österreichische Lotterien GmbH as the federal lottery concession holder (until 30 September 2027); its concession includes electronic lotteries — online gambling — on www.win2day.at. It is the only online casino concession in Austria."),
      why: "Under Austria's Gambling Act (GSpG), casino games may not be offered online without a federal concession, and a licence from another EU country does not count; the only concession covering online gambling is the lottery concession held by Österreichische Lotterien, used on win2day.at. Sports betting needs a licence from the federal state instead. A new Gambling Act, sent to the EU for notification in August 2026, would open online gambling to an open concession procedure.",
    };
  },

  CH() {
    // Casinos: the ESBK's "Online-Spielbanken" page lists the land-based
    // casinos with an online platform in a table (casino, web address, start
    // of online business). The site is a Nuxt app, so the table is read from
    // the page's own embedded __NUXT_DATA__ payload, which the server sends
    // with the HTML.
    const url = "https://www.esbk.admin.ch/de/online-spielbanken";
    const html = get(url);
    if (!/Konzessionserweiterung, die vom Bundesrat erteilt wird/.test(clean(html))) throw new Error("ESBK: online casino page wording changed");
    const data = JSON.parse((html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/) || [])[1] || "null");
    if (!Array.isArray(data)) throw new Error("ESBK: page data not found");
    const txt = (i) => (typeof data[i] === "string" ? data[i] : "");
    const table = data.find((v) => v && typeof v === "object" && !Array.isArray(v) && "bodyRows" in v && "headerColumns" in v
      && data[v.headerColumns].some((h) => txt(data[h].text) === "Web-Adresse"));
    if (!table) throw new Error("ESBK: online casino table not found");
    const casinos = [];
    for (const r of data[table.bodyRows]) {
      const cells = data[r].map((c) => data[data[c].cellContent].map((x) => txt(data[x].text)).join(" "));
      const [casino, site] = cells;
      const href = (site.match(/href="([^"]+)"/) || [])[1];
      if (!casino || !href) continue;
      casinos.push(op(host(href), clean(casino), [href]));
    }
    if (casinos.length < 5) throw new Error(`ESBK: only ${casinos.length} online casinos read`);
    // Betting: Gespa's sports-betting page names the two lottery companies and links their sites.
    const betUrl = "https://www.gespa.ch/en/types-of-gambling/sports-betting";
    const bet = get(betUrl);
    const b = clean(bet);
    for (const re of [/Sports betting with Loterie Romande and Swisslos/, /“Jouez Sport” and “Sporttip”/, /playable on the internet/])
      if (!re.test(b)) throw new Error(`Gespa: expected wording not found (${re})`);
    const sw = (bet.match(/href="(https:\/\/www\.swisslos\.ch[^"]*)"/) || [])[1];
    const lr = (bet.match(/href="(https:\/\/jeux\.loro\.ch[^"]*)"/) || [])[1];
    if (!sw || !lr) throw new Error("Gespa: lottery company links not found");
    return {
      regulator: "Federal Gaming Board (ESBK) for casinos; Gespa for lotteries and sports betting",
      casinos: list(casinos, url, "The ESBK's list of Swiss casinos with an online platform: each row is the web address the ESBK gives and the land-based casino whose concession, extended by the Federal Council, covers it."),
      sportsbooks: list([op("Swisslos", "Swisslos", [sw]), op("Loterie Romande", "Loterie Romande", [lr])], betUrl, "Gespa: the two lottery companies offer sports betting online and in retail under the brands 'Jouez Sport' (Loterie Romande, French-speaking cantons) and 'Sporttip' (Swisslos, German- and Italian-speaking cantons); Gespa links each company's site."),
      why: "Under the Money Gaming Act in force since 1 January 2019, online casino games may only be offered by Swiss land-based casinos whose concession the Federal Council has extended to online play, with each game approved by the ESBK; large-scale lotteries are reserved to Swisslos and Loterie Romande, which also run the licensed online sports betting, under Gespa's supervision. Sites without Swiss authorisation are blocked.",
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
  MT: { regulator: "Malta Gaming Authority (MGA)", sourceUrl: "https://www.mga.org.mt/licensee-hub/licensee-register/", note: "The MGA's licensee register is a search tool rather than a published list, and it licenses operators for other markets rather than for Maltese players." },
  RO: { regulator: "Oficiul Național pentru Jocuri de Noroc (ONJN)", sourceUrl: "https://onjn.gov.ro/", note: "ONJN's site sits behind a browser-verification wall that a reader can pass and a script cannot." },
  NO: { regulator: "Lotteritilsynet", sourceUrl: "https://lottstift.no/for-spillere/", note: "Norway's exclusive-rights model gives Norsk Tipping and Norsk Rikstoto the only legal online offers; there is no register of licensed operators." },
  FI: { regulator: "Finnish Licensing and Supervisory Authority (Lupa- ja valvontavirasto)", sourceUrl: "https://lvv.fi/", note: "Veikkaus holds the exclusive right until the licensing market opens in 2027; the new authority has published no licensees yet." },
  IE: { regulator: "Gambling Regulatory Authority of Ireland (GRAI)", sourceUrl: "https://www.grai.ie/licensing-regulation/business-to-consumer-licenses/licensing-phasing", note: "GRAI is phasing in business-to-consumer licensing under the Gambling Regulation Act 2024 and has not yet published a register of online licensees." },
  BR: { regulator: "Secretaria de Prêmios e Apostas (SPA), Ministério da Fazenda", sourceUrl: "https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/medida-provisoria-ndeg-1-394-2026-entenda-as-novas-regras-para-as-apostas-de-quota-fixa", note: "Provisional Measure (Medida Provisória) nº 1.394 of 25 September 2026 prohibits fixed-odds betting and online games nationwide, and the previously authorised sites had to go offline from 6 October 2026. The SPA keeps its list of the companies authorised before the measure, but none may operate." },
  MX: { regulator: "Secretaría de Gobernación (SEGOB), Dirección General de Juegos y Sorteos", sourceUrl: "http://www.juegosysorteos.gob.mx/", note: "The Dirección General de Juegos y Sorteos publishes its permit holders and their authorised websites on juegosysorteos.gob.mx, which does not answer automated reads, and SEGOB's pages on gob.mx sit behind a browser-verification wall that a reader can pass and a script cannot." },
  LT: { regulator: "Lošimų priežiūros tarnyba (Gaming Control Authority under the Ministry of Finance)", sourceUrl: "https://lpt.lrv.lt/lt/losimu-organizatoriai/leidimu-zurnalas/nuotoliniai-losimai/", note: "The Gaming Control Authority's permit journal for remote gaming sits behind a Cloudflare browser check that a reader can pass and a script cannot, and the copies it publishes on the national open-data portal (data.gov.lt) are behind a firewall block page; check the journal on the Authority's site." },
  BG: { regulator: "National Revenue Agency (НАП / NRA)", sourceUrl: "https://nra.bg/wps/portal/nra/registers-i-spisuci/registers/page.registers-po-zakona-za-hazarta", note: "The National Revenue Agency keeps the registers under the Gambling Act, including the list of websites licensed organisers run games through, on nra.bg; the site does not accept a script's connections and the national open-data portal (data.egov.bg) refuses them too, so check the registers on the NRA site." },
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
