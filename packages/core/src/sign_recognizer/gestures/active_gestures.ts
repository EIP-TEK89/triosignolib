import { Gestures, FIELDS } from './gestures';

export class ActiveGestures extends Gestures<boolean> {
  constructor(init?: Partial<Gestures<boolean>>) {
    super(init);
  }

  /**
  * Creates an instance of `ActiveGestures` with a preset of gestures.
  * If multiple gestures are provided, they are combined.
  */
  static buildWithPreset(gesturesToSet: Gestures<boolean | null> | Gestures<boolean | null>[]): ActiveGestures {
    const tmp: ActiveGestures = new ActiveGestures();
    return tmp.setActiveGestures(gesturesToSet);
  }

  setActiveGestures(gesturesToSet: Partial<Gestures<boolean | null>> | Partial<Gestures<boolean | null>>[]): ActiveGestures {
    if (!Array.isArray(gesturesToSet)) {
      gesturesToSet = [gesturesToSet];
    }
    this.resetActiveGestures();
    gesturesToSet.forEach(gesture => {
      Object.keys(gesture).forEach(key => {
        const typedKey = key as keyof typeof gesture;
        if (gesture[typedKey] !== null) {
          (this as any)[key] = gesture[typedKey] as boolean;
        }
      });
    });
    return this;
  }

  resetActiveGestures(): void {
    this.setFieldsTo(null);
  }

  activateAllGestures(): void {
    this.setFieldsTo(true);
  }

  deactivateAllGestures(): void {
    this.setFieldsTo(false);
  }

  setFieldsTo(value: boolean | null, validFields: string[] = FIELDS): void {
    validFields.forEach(field => {
      (this as any)[field] = value;
    });
  }

  getActiveFields(): string[] {
    return FIELDS.filter(field => (this as any)[field]);
  }
}
