export class ErrUnknownEventType extends Error {
  rawData: Uint8Array;

  constructor(rawData: Uint8Array) {
    super("event type has not registered");
    this.rawData = rawData;
    Object.setPrototypeOf(this, ErrUnknownEventType.prototype);
  }

  public getErrorMessage(): string {
    const showLen = Math.min(this.rawData.length, 32);
    const rawDataPreview = new TextDecoder().decode(this.rawData.slice(0, showLen));
    return `${this.message}, raw data: ${rawDataPreview}...`;
  }
}
