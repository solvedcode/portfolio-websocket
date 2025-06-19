export class CorsValidator {
  private allowedOrigins: Array<string | null> = [
    null,
    'null',
    'http://localhost:3000',
    'https://example.com'
  ]

  public isOriginAllowed(origin: string | null): boolean {
    return this.allowedOrigins.includes(origin)
  }
}
