export class EntryNotFoundException extends Error {
  readonly entryId: string;

  constructor(entryId: string) {
    super(`Schedule entry with id "${entryId}" not found.`);
    this.name = 'EntryNotFoundException';
    this.entryId = entryId;
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, EntryNotFoundException.prototype);
  }
}
