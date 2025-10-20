export class SystemEvent {
  constructor(
    public readonly userId: number,
    public readonly scope: string,
    public readonly date: Date,
  ) {}

  get area(): string {
    return this.scope.split('.')[0];
  }

  get action(): string {
    return this.scope.split('.')[1];
  }

  isUserDelete(): boolean {
    return this.scope === 'user.delete';
  }

  isTopSecretRead(): boolean {
    return this.scope === 'top-secret.read';
  }

  isUserUpdate(): boolean {
    return this.scope === 'user.update';
  }
}
