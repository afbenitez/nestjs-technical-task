export enum LimitType {
  THREE_USER_DELETIONS = '3_USER_DELETIONS',
  TOP_SECRET_READ = 'TOP_SECRET_READ',
  TWO_USER_UPDATED_IN_1MINUTE = '2_USER_UPDATED_IN_1MINUTE',
}

export class Notification {

  constructor(

    public readonly userId: number,

    public readonly limitType: LimitType,

    public readonly date: Date,

    public readonly id?: string,
    
  ) {}
}
