export class Clock {
    private _clockSpeed: number;
    private _lastTime: number | null;
    private _timeSinceLastTickCount: number | null;
    private _tickCounted: number;

    constructor(clock_speed: number) {
        this._clockSpeed = clock_speed;
        this._lastTime = null

        this._timeSinceLastTickCount = null;
        this._tickCounted = 0;
    }

    isTimeToRun(): boolean {
        const currentTime = Date.now();
        if (!this._lastTime) {
            this._lastTime = currentTime;
            return true;
        }
        if (currentTime - this._lastTime >= 1 / this._clockSpeed) {
            this._lastTime += (1 / this._clockSpeed);
            this._tickCounted += 1;
            return true;
        }
        return false;
    }

    getClockSpeed(): number {
        return this._clockSpeed;
    }

    setClockSpeed(clock_speed: number): void {
        this._clockSpeed = clock_speed;
    }

    reset(): void {
        this._lastTime = null;
        this._timeSinceLastTickCount = null;
    }

    getRealClockSpeed(): number {
        const time_now = Date.now();
        if (!this._timeSinceLastTickCount) {
            this._timeSinceLastTickCount = time_now;
        }
        const diff = time_now - this._timeSinceLastTickCount;
        this._timeSinceLastTickCount = time_now;
        if (diff === 0) {
            return 0;
        }
        const avg = this._tickCounted / diff;
        this._tickCounted = 0;
        return avg;
    }
}
