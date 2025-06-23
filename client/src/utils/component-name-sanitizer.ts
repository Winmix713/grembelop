
export class ComponentNameSanitizer {
  static sanitize(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase()) || 'Component';
  }
}
