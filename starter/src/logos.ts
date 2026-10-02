// System logos — Glean-hosted assets, copied locally so the canvas stays readable (no cross-origin taint).
export const LOGO_URLS = {
  glean: '/logos/glean.svg',
  gleanText: '/logos/gleanText.svg',
  salesforce: '/logos/salesforce.svg',
  jira: '/logos/jira.svg',
  confluence: '/logos/confluence.svg',
  gdrive: '/logos/gdrive.svg',
  gmail: '/logos/gmail.svg',
  teams: '/logos/teams.svg',
  sharepoint: '/logos/sharepoint.svg',
  servicenow: '/logos/servicenow.svg',
  outlook: '/logos/outlook.svg',
  gong: '/logos/gong.svg',
  tableau: '/logos/tableau.svg',
  docx: '/logos/docx.svg',
  pptx: '/logos/pptx.svg',
  xlsx: '/logos/xlsx.svg',
  openai: '/logos/openai.svg',
  gemini: '/logos/gemini.svg',
  claude: '/logos/claude.svg',
  exampleco: '/logos/exampleco.svg',
  gainsight: '/logos/gainsight.svg',
  onedrive: '/logos/onedrive.svg',
  databricks: '/logos/databricks.svg',
  databricksIcon: '/logos/databricksIcon.svg',
  powerbi: '/logos/powerbi.svg',
  responsive: '/logos/responsive.svg',
  microsoft365: '/logos/microsoft365.svg',
} as const;

export type LogoKey = keyof typeof LOGO_URLS;

const images = new Map<LogoKey, HTMLImageElement>();
const ready = new Set<LogoKey>();

export function preloadLogos(timeoutMs = 10000): Promise<void> {
  const loads = (Object.keys(LOGO_URLS) as LogoKey[]).map(
    (key) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          ready.add(key);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = LOGO_URLS[key];
        images.set(key, img);
      }),
  );
  return Promise.race([Promise.all(loads).then(() => undefined), new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}

export function logo(key: LogoKey): HTMLImageElement | null {
  // Late loads still show up: the image fires onload after the timeout.
  return ready.has(key) ? images.get(key)! : null;
}

export const LOGO_INITIAL: Record<LogoKey, string> = {
  glean: 'G', gleanText: 'glean', salesforce: 'SF', jira: 'J', confluence: 'C', gdrive: 'D', gmail: 'M',
  teams: 'T', sharepoint: 'S', servicenow: 'SN', outlook: 'O', gong: 'G', tableau: 'Tb', docx: 'W', pptx: 'P', xlsx: 'X', openai: 'AI', gemini: 'Ge', claude: 'Cl',
  exampleco: 'exampleco', gainsight: 'Gs', onedrive: 'OD', databricks: 'Db', databricksIcon: 'Db', powerbi: 'BI', responsive: 'R', microsoft365: 'M365',
};
