export function genNetlifyToml(): string {
  return `[build]
  command = "pnpm run build"
  publish = "apps/shell/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
`;
}

export function genModuleNetlifyToml(): string {
  return `[build]
  command = "pnpm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
`;
}