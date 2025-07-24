// API Types for Gerrit Backend

export interface AccountInfo {
  _account_id: number;
  name?: string;
  display_name?: string;
  email?: string;
  secondary_emails?: string[];
  username?: string;
  avatars?: AvatarInfo[];
  _more_accounts?: boolean;
  status?: string;
  inactive?: boolean;
  tags?: string[];
}

export interface AccountDetailInfo {
  accountId: number;
  name?: string;
  displayName?: string;
  email?: string;
  secondaryEmails?: string[];
  username?: string;
  avatars?: AvatarInfo[];
  status?: string;
  inactive?: boolean;
  tags?: string[];
  registeredOn?: string;
  moreAccounts?: boolean;
}

export interface AvatarInfo {
  url: string;
  height?: number;
  width?: number;
}

export interface AccountInput {
  name?: string;
  email?: string;
  username?: string;
  displayName?: string;
  status?: string;
  active?: boolean;
  sshKey?: string;
  httpPassword?: string;
}

export interface ProjectInfo {
  id?: string;
  name: string;
  parent?: string;
  description?: string;
  state?: ProjectState;
  branches?: Record<string, string>;
  labels?: Record<string, LabelTypeInfo>;
  webLinks?: WebLinkInfo[];
  configVisible?: boolean;
}

export enum ProjectState {
  ACTIVE = 'ACTIVE',
  READ_ONLY = 'READ_ONLY',
  HIDDEN = 'HIDDEN'
}

export interface LabelTypeInfo {
  values?: Record<string, string>;
  defaultValue?: number;
  function?: string;
  copyCondition?: string;
  copyMinScore?: boolean;
  copyMaxScore?: boolean;
  copyAllScoresIfNoChange?: boolean;
  copyAllScoresIfNoCodeChange?: boolean;
  copyAllScoresOnTrivialRebase?: boolean;
  copyAllScoresOnMergeFirstParentUpdate?: boolean;
  copyValues?: number[];
  allowPostSubmit?: boolean;
  ignoreSelfApproval?: boolean;
}

export interface WebLinkInfo {
  name: string;
  url: string;
  imageUrl?: string;
}

export interface ProjectInput {
  name: string;
  parent?: string;
  description?: string;
  createEmptyCommit?: boolean;
  branches?: string[];
  owners?: string[];
  useContributorAgreements?: InheritableBoolean;
  useSignedOffBy?: InheritableBoolean;
  useContentMerge?: InheritableBoolean;
  requireChangeId?: InheritableBoolean;
  rejectImplicitMerges?: InheritableBoolean;
  enableSignedPush?: InheritableBoolean;
  requireSignedPush?: InheritableBoolean;
  maxObjectSizeLimit?: string;
  submitType?: SubmitType;
  state?: ProjectState;
  config?: ConfigInput;
}

export enum InheritableBoolean {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  INHERIT = 'INHERIT'
}

export enum SubmitType {
  MERGE_IF_NECESSARY = 'MERGE_IF_NECESSARY',
  FAST_FORWARD_ONLY = 'FAST_FORWARD_ONLY',
  REBASE_IF_NECESSARY = 'REBASE_IF_NECESSARY',
  REBASE_ALWAYS = 'REBASE_ALWAYS',
  MERGE_ALWAYS = 'MERGE_ALWAYS',
  CHERRY_PICK = 'CHERRY_PICK'
}

export interface ConfigInput {
  description?: string;
  useContributorAgreements?: InheritableBoolean;
  useSignedOffBy?: InheritableBoolean;
  useContentMerge?: InheritableBoolean;
  requireChangeId?: InheritableBoolean;
  rejectImplicitMerges?: InheritableBoolean;
  enableSignedPush?: InheritableBoolean;
  requireSignedPush?: InheritableBoolean;
  maxObjectSizeLimit?: string;
  submitType?: SubmitType;
  state?: ProjectState;
}

export interface ChangeInfo {
  id: string;
  project: string;
  branch: string;
  topic?: string;
  assignee?: AccountInfo;
  hashtags: string[];
  changeId: string;
  subject: string;
  status: ChangeStatus;
  created: string;
  updated: string;
  submitted?: string;
  submitter?: AccountInfo;
  starred: boolean;
  stars: string[];
  reviewed: boolean;
  submit_type?: SubmitType;
  mergeable?: boolean;
  submittable?: boolean;
  insertions: number;
  deletions: number;
  total_comment_count: number;
  unresolved_comment_count: number;
  has_review_started: boolean;
  meta_rev_id?: string;
  number: number;
  owner: AccountInfo;
  actions: Record<string, ActionInfo>;
  labels: Record<string, LabelInfo>;
  permitted_labels: Record<string, string[]>;
  removable_reviewers: AccountInfo[];
  reviewers: ReviewerInfo;
  pending_reviewers: ReviewerInfo;
  reviewer_updates: ReviewerUpdateInfo[];
  messages: ChangeMessageInfo[];
  current_revision?: string;
  revisions: Record<string, RevisionInfo>;
  tracking_ids: TrackingIdInfo[];
  _number: number;
  more_changes?: boolean;
  problems: ProblemInfo[];
  is_private: boolean;
  work_in_progress: boolean;
  has_review_started_: boolean;
  revert_of?: number;
  submission_id?: string;
  cherry_pick_of_change?: number;
  cherry_pick_of_patch_set?: number;
  contains_git_conflicts?: boolean;
}

export enum ChangeStatus {
  NEW = 'NEW',
  MERGED = 'MERGED',
  ABANDONED = 'ABANDONED'
}

export interface ActionInfo {
  method?: string;
  label?: string;
  title?: string;
  enabled?: boolean;
}

export interface LabelInfo {
  optional?: boolean;
  approved?: AccountInfo;
  rejected?: AccountInfo;
  recommended?: AccountInfo;
  disliked?: AccountInfo;
  blocking?: boolean;
  value?: number;
  default_value?: number;
  values: Record<string, string>;
  all: ApprovalInfo[];
}

export interface ApprovalInfo {
  value: number;
  permitted_voting_range?: VotingRangeInfo;
  date?: string;
  tag?: string;
  post_submit?: boolean;
  _account_id: number;
  name?: string;
  display_name?: string;
  email?: string;
  secondary_emails: string[];
  username?: string;
  avatars: AvatarInfo[];
  _more_accounts?: boolean;
  status?: string;
  inactive?: boolean;
  tags: string[];
}

export interface VotingRangeInfo {
  min: number;
  max: number;
}

export interface ReviewerInfo {
  REVIEWER: AccountInfo[];
  CC: AccountInfo[];
  REMOVED: AccountInfo[];
}

export interface ReviewerUpdateInfo {
  updated: string;
  updated_by: AccountInfo;
  reviewer: AccountInfo;
  state: ReviewerState;
}

export enum ReviewerState {
  REVIEWER = 'REVIEWER',
  CC = 'CC',
  REMOVED = 'REMOVED'
}

export interface ChangeMessageInfo {
  id: string;
  author?: AccountInfo;
  real_author?: AccountInfo;
  date: string;
  message: string;
  tag?: string;
  _revision_number?: number;
}

export interface RevisionInfo {
  kind: string;
  _number: number;
  created: string;
  uploader: AccountInfo;
  ref: string;
  fetch: Record<string, FetchInfo>;
  commit?: CommitInfo;
  actions: Record<string, ActionInfo>;
  reviewed?: boolean;
  commit_with_footers?: boolean;
  push_certificate?: PushCertificateInfo;
  description?: string;
}

export interface FetchInfo {
  url: string;
  ref: string;
  commands: Record<string, string>;
}

export interface CommitInfo {
  commit: string;
  parents: CommitInfo[];
  author: GitPersonInfo;
  committer: GitPersonInfo;
  subject: string;
  message: string;
}

export interface GitPersonInfo {
  name: string;
  email: string;
  date: string;
  tz: number;
}

export interface PushCertificateInfo {
  certificate: string;
  key: GpgKeyInfo;
}

export interface GpgKeyInfo {
  status: string;
  problems: string[];
}

export interface TrackingIdInfo {
  system: string;
  id: string;
}

export interface ProblemInfo {
  message: string;
  status?: string;
  outcome?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface SuccessResponse {
  message: string;
} 