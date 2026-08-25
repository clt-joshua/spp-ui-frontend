export const SPEC_BASELINE = {
  verifiedAt: '2026-08-25',
  m3WebAuthority: 'https://m3.material.io/develop/web',
  materialWeb: {
    version: '2.5.0',
    commit: 'b4de401eb665ec63474f39319a4ba8f2145974cc',
    docsMain:
      'https://github.com/material-components/material-web/tree/main/docs',
    docsSnapshot:
      'https://github.com/material-components/material-web/tree/b4de401eb665ec63474f39319a4ba8f2145974cc/docs',
  },
  baseUiVersion: '1.7.0',
  materialColorUtilitiesVersion: '0.4.0',
  stableWebRequired: true,
  expressiveStatus: 'deferred',
} as const;

export type SpecBaseline = typeof SPEC_BASELINE;
