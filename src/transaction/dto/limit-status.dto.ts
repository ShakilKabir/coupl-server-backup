export class LimitStatusDto {
  hasLimit: boolean;
  currentLimit?: number;
  proposedLimit?: number = 0;
  userRole: 'Proposer' | 'Receiver' | 'None';
  isApproved: boolean;
}
