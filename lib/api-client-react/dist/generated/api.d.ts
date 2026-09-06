import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityEvent, AppNotification, AuthUser, HealthStatus, KnowledgeArticle, ListKnowledgeArticlesParams, ListNotificationsParams, ListSimilarTicketsParams, ListTicketsParams, LoginInput, SimilarTicket, SupportOverview, Ticket, TicketAttachment, TicketAttachmentDetail, TicketAttachmentInput, TicketComment, TicketCommentInput, TicketInput, TicketUpdate, TroubleshootAdvanceInput, TroubleshootInput, TroubleshootSession } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSupportOverviewUrl: () => string;
/**
 * @summary Get support workspace overview
 */
export declare const getSupportOverview: (options?: Parameters<typeof customFetch>[1]) => Promise<SupportOverview>;
export declare const getGetSupportOverviewQueryKey: () => readonly ["/api/support/overview"];
export declare const getGetSupportOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getSupportOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupportOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSupportOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSupportOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getSupportOverview>>>;
export type GetSupportOverviewQueryError = ErrorType<unknown>;
/**
 * @summary Get support workspace overview
 */
export declare function useGetSupportOverview<TData = Awaited<ReturnType<typeof getSupportOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupportOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getStartTroubleshootingUrl: () => string;
/**
 * @summary Start an AI-guided troubleshooting session
 */
export declare const startTroubleshooting: (troubleshootInput: TroubleshootInput, options?: Parameters<typeof customFetch>[1]) => Promise<TroubleshootSession>;
export declare const getStartTroubleshootingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startTroubleshooting>>, TError, {
        data: BodyType<TroubleshootInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startTroubleshooting>>, TError, {
    data: BodyType<TroubleshootInput>;
}, TContext>;
export type StartTroubleshootingMutationResult = NonNullable<Awaited<ReturnType<typeof startTroubleshooting>>>;
export type StartTroubleshootingMutationBody = BodyType<TroubleshootInput>;
export type StartTroubleshootingMutationError = ErrorType<unknown>;
/**
* @summary Start an AI-guided troubleshooting session
*/
export declare const useStartTroubleshooting: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startTroubleshooting>>, TError, {
        data: BodyType<TroubleshootInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startTroubleshooting>>, TError, {
    data: BodyType<TroubleshootInput>;
}, TContext>;
export declare const getAdvanceTroubleshootingUrl: (id: number) => string;
/**
 * @summary Advance an AI-guided troubleshooting session
 */
export declare const advanceTroubleshooting: (id: number, troubleshootAdvanceInput: TroubleshootAdvanceInput, options?: Parameters<typeof customFetch>[1]) => Promise<TroubleshootSession>;
export declare const getAdvanceTroubleshootingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof advanceTroubleshooting>>, TError, {
        id: number;
        data: BodyType<TroubleshootAdvanceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof advanceTroubleshooting>>, TError, {
    id: number;
    data: BodyType<TroubleshootAdvanceInput>;
}, TContext>;
export type AdvanceTroubleshootingMutationResult = NonNullable<Awaited<ReturnType<typeof advanceTroubleshooting>>>;
export type AdvanceTroubleshootingMutationBody = BodyType<TroubleshootAdvanceInput>;
export type AdvanceTroubleshootingMutationError = ErrorType<void>;
/**
* @summary Advance an AI-guided troubleshooting session
*/
export declare const useAdvanceTroubleshooting: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof advanceTroubleshooting>>, TError, {
        id: number;
        data: BodyType<TroubleshootAdvanceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof advanceTroubleshooting>>, TError, {
    id: number;
    data: BodyType<TroubleshootAdvanceInput>;
}, TContext>;
export declare const getListSimilarTicketsUrl: (params: ListSimilarTicketsParams) => string;
/**
 * @summary Find past tickets that look like this issue
 */
export declare const listSimilarTickets: (params: ListSimilarTicketsParams, options?: Parameters<typeof customFetch>[1]) => Promise<SimilarTicket[]>;
export declare const getListSimilarTicketsQueryKey: (params?: ListSimilarTicketsParams) => readonly ["/api/tickets/similar", ...ListSimilarTicketsParams[]];
export declare const getListSimilarTicketsQueryOptions: <TData = Awaited<ReturnType<typeof listSimilarTickets>>, TError = ErrorType<unknown>>(params: ListSimilarTicketsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSimilarTickets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSimilarTickets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSimilarTicketsQueryResult = NonNullable<Awaited<ReturnType<typeof listSimilarTickets>>>;
export type ListSimilarTicketsQueryError = ErrorType<unknown>;
/**
 * @summary Find past tickets that look like this issue
 */
export declare function useListSimilarTickets<TData = Awaited<ReturnType<typeof listSimilarTickets>>, TError = ErrorType<unknown>>(params: ListSimilarTicketsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSimilarTickets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTicketsUrl: (params?: ListTicketsParams) => string;
/**
 * @summary List service desk tickets
 */
export declare const listTickets: (params?: ListTicketsParams, options?: Parameters<typeof customFetch>[1]) => Promise<Ticket[]>;
export declare const getListTicketsQueryKey: (params?: ListTicketsParams) => readonly ["/api/tickets", ...ListTicketsParams[]];
export declare const getListTicketsQueryOptions: <TData = Awaited<ReturnType<typeof listTickets>>, TError = ErrorType<unknown>>(params?: ListTicketsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTickets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTickets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTicketsQueryResult = NonNullable<Awaited<ReturnType<typeof listTickets>>>;
export type ListTicketsQueryError = ErrorType<unknown>;
/**
 * @summary List service desk tickets
 */
export declare function useListTickets<TData = Awaited<ReturnType<typeof listTickets>>, TError = ErrorType<unknown>>(params?: ListTicketsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTickets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTicketUrl: () => string;
/**
 * @summary Create a service desk ticket
 */
export declare const createTicket: (ticketInput: TicketInput, options?: Parameters<typeof customFetch>[1]) => Promise<Ticket>;
export declare const getCreateTicketMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTicket>>, TError, {
        data: BodyType<TicketInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTicket>>, TError, {
    data: BodyType<TicketInput>;
}, TContext>;
export type CreateTicketMutationResult = NonNullable<Awaited<ReturnType<typeof createTicket>>>;
export type CreateTicketMutationBody = BodyType<TicketInput>;
export type CreateTicketMutationError = ErrorType<unknown>;
/**
* @summary Create a service desk ticket
*/
export declare const useCreateTicket: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTicket>>, TError, {
        data: BodyType<TicketInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTicket>>, TError, {
    data: BodyType<TicketInput>;
}, TContext>;
export declare const getGetTicketUrl: (id: number) => string;
/**
 * @summary Get a service desk ticket
 */
export declare const getTicket: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<Ticket>;
export declare const getGetTicketQueryKey: (id: number) => readonly [`/api/tickets/${number}`];
export declare const getGetTicketQueryOptions: <TData = Awaited<ReturnType<typeof getTicket>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTicket>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTicket>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTicketQueryResult = NonNullable<Awaited<ReturnType<typeof getTicket>>>;
export type GetTicketQueryError = ErrorType<void>;
/**
 * @summary Get a service desk ticket
 */
export declare function useGetTicket<TData = Awaited<ReturnType<typeof getTicket>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTicket>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateTicketUrl: (id: number) => string;
/**
 * @summary Update a service desk ticket
 */
export declare const updateTicket: (id: number, ticketUpdate: TicketUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Ticket>;
export declare const getUpdateTicketMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTicket>>, TError, {
        id: number;
        data: BodyType<TicketUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTicket>>, TError, {
    id: number;
    data: BodyType<TicketUpdate>;
}, TContext>;
export type UpdateTicketMutationResult = NonNullable<Awaited<ReturnType<typeof updateTicket>>>;
export type UpdateTicketMutationBody = BodyType<TicketUpdate>;
export type UpdateTicketMutationError = ErrorType<void>;
/**
* @summary Update a service desk ticket
*/
export declare const useUpdateTicket: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTicket>>, TError, {
        id: number;
        data: BodyType<TicketUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTicket>>, TError, {
    id: number;
    data: BodyType<TicketUpdate>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Sign in with a demo workplace account
 */
export declare const login: (loginInput: LoginInput, options?: Parameters<typeof customFetch>[1]) => Promise<AuthUser>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Sign in with a demo workplace account
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getListDemoAccountsUrl: () => string;
/**
 * @summary List the demo workplace accounts available for sign-in
 */
export declare const listDemoAccounts: (options?: Parameters<typeof customFetch>[1]) => Promise<AuthUser[]>;
export declare const getListDemoAccountsQueryKey: () => readonly ["/api/auth/accounts"];
export declare const getListDemoAccountsQueryOptions: <TData = Awaited<ReturnType<typeof listDemoAccounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDemoAccounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDemoAccounts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDemoAccountsQueryResult = NonNullable<Awaited<ReturnType<typeof listDemoAccounts>>>;
export type ListDemoAccountsQueryError = ErrorType<unknown>;
/**
 * @summary List the demo workplace accounts available for sign-in
 */
export declare function useListDemoAccounts<TData = Awaited<ReturnType<typeof listDemoAccounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDemoAccounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListKnowledgeArticlesUrl: (params?: ListKnowledgeArticlesParams) => string;
/**
 * @summary Search knowledge base articles
 */
export declare const listKnowledgeArticles: (params?: ListKnowledgeArticlesParams, options?: Parameters<typeof customFetch>[1]) => Promise<KnowledgeArticle[]>;
export declare const getListKnowledgeArticlesQueryKey: (params?: ListKnowledgeArticlesParams) => readonly ["/api/kb/articles", ...ListKnowledgeArticlesParams[]];
export declare const getListKnowledgeArticlesQueryOptions: <TData = Awaited<ReturnType<typeof listKnowledgeArticles>>, TError = ErrorType<unknown>>(params?: ListKnowledgeArticlesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listKnowledgeArticles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listKnowledgeArticles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListKnowledgeArticlesQueryResult = NonNullable<Awaited<ReturnType<typeof listKnowledgeArticles>>>;
export type ListKnowledgeArticlesQueryError = ErrorType<unknown>;
/**
 * @summary Search knowledge base articles
 */
export declare function useListKnowledgeArticles<TData = Awaited<ReturnType<typeof listKnowledgeArticles>>, TError = ErrorType<unknown>>(params?: ListKnowledgeArticlesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listKnowledgeArticles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTicketCommentsUrl: (id: number) => string;
/**
 * @summary List comments on a ticket
 */
export declare const listTicketComments: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<TicketComment[]>;
export declare const getListTicketCommentsQueryKey: (id: number) => readonly [`/api/tickets/${number}/comments`];
export declare const getListTicketCommentsQueryOptions: <TData = Awaited<ReturnType<typeof listTicketComments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTicketComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTicketComments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTicketCommentsQueryResult = NonNullable<Awaited<ReturnType<typeof listTicketComments>>>;
export type ListTicketCommentsQueryError = ErrorType<unknown>;
/**
 * @summary List comments on a ticket
 */
export declare function useListTicketComments<TData = Awaited<ReturnType<typeof listTicketComments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTicketComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTicketCommentUrl: (id: number) => string;
/**
 * @summary Add a comment to a ticket
 */
export declare const createTicketComment: (id: number, ticketCommentInput: TicketCommentInput, options?: Parameters<typeof customFetch>[1]) => Promise<TicketComment>;
export declare const getCreateTicketCommentMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTicketComment>>, TError, {
        id: number;
        data: BodyType<TicketCommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTicketComment>>, TError, {
    id: number;
    data: BodyType<TicketCommentInput>;
}, TContext>;
export type CreateTicketCommentMutationResult = NonNullable<Awaited<ReturnType<typeof createTicketComment>>>;
export type CreateTicketCommentMutationBody = BodyType<TicketCommentInput>;
export type CreateTicketCommentMutationError = ErrorType<void>;
/**
* @summary Add a comment to a ticket
*/
export declare const useCreateTicketComment: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTicketComment>>, TError, {
        id: number;
        data: BodyType<TicketCommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTicketComment>>, TError, {
    id: number;
    data: BodyType<TicketCommentInput>;
}, TContext>;
export declare const getListTicketActivityUrl: (id: number) => string;
/**
 * @summary List activity on a ticket
 */
export declare const listTicketActivity: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<ActivityEvent[]>;
export declare const getListTicketActivityQueryKey: (id: number) => readonly [`/api/tickets/${number}/activity`];
export declare const getListTicketActivityQueryOptions: <TData = Awaited<ReturnType<typeof listTicketActivity>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTicketActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTicketActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTicketActivityQueryResult = NonNullable<Awaited<ReturnType<typeof listTicketActivity>>>;
export type ListTicketActivityQueryError = ErrorType<unknown>;
/**
 * @summary List activity on a ticket
 */
export declare function useListTicketActivity<TData = Awaited<ReturnType<typeof listTicketActivity>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTicketActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTicketAttachmentsUrl: (id: number) => string;
/**
 * @summary List ticket attachments
 */
export declare const listTicketAttachments: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<TicketAttachment[]>;
export declare const getListTicketAttachmentsQueryKey: (id: number) => readonly [`/api/tickets/${number}/attachments`];
export declare const getListTicketAttachmentsQueryOptions: <TData = Awaited<ReturnType<typeof listTicketAttachments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTicketAttachments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTicketAttachments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTicketAttachmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listTicketAttachments>>>;
export type ListTicketAttachmentsQueryError = ErrorType<unknown>;
/**
 * @summary List ticket attachments
 */
export declare function useListTicketAttachments<TData = Awaited<ReturnType<typeof listTicketAttachments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTicketAttachments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTicketAttachmentUrl: (id: number) => string;
/**
 * @summary Attach a screenshot or log
 */
export declare const createTicketAttachment: (id: number, ticketAttachmentInput: TicketAttachmentInput, options?: Parameters<typeof customFetch>[1]) => Promise<TicketAttachment>;
export declare const getCreateTicketAttachmentMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTicketAttachment>>, TError, {
        id: number;
        data: BodyType<TicketAttachmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTicketAttachment>>, TError, {
    id: number;
    data: BodyType<TicketAttachmentInput>;
}, TContext>;
export type CreateTicketAttachmentMutationResult = NonNullable<Awaited<ReturnType<typeof createTicketAttachment>>>;
export type CreateTicketAttachmentMutationBody = BodyType<TicketAttachmentInput>;
export type CreateTicketAttachmentMutationError = ErrorType<void>;
/**
* @summary Attach a screenshot or log
*/
export declare const useCreateTicketAttachment: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTicketAttachment>>, TError, {
        id: number;
        data: BodyType<TicketAttachmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTicketAttachment>>, TError, {
    id: number;
    data: BodyType<TicketAttachmentInput>;
}, TContext>;
export declare const getGetTicketAttachmentUrl: (id: number, attachmentId: number) => string;
/**
 * @summary Get an attachment including file data
 */
export declare const getTicketAttachment: (id: number, attachmentId: number, options?: Parameters<typeof customFetch>[1]) => Promise<TicketAttachmentDetail>;
export declare const getGetTicketAttachmentQueryKey: (id: number, attachmentId: number) => readonly [`/api/tickets/${number}/attachments/${number}`];
export declare const getGetTicketAttachmentQueryOptions: <TData = Awaited<ReturnType<typeof getTicketAttachment>>, TError = ErrorType<void>>(id: number, attachmentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTicketAttachment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTicketAttachment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTicketAttachmentQueryResult = NonNullable<Awaited<ReturnType<typeof getTicketAttachment>>>;
export type GetTicketAttachmentQueryError = ErrorType<void>;
/**
 * @summary Get an attachment including file data
 */
export declare function useGetTicketAttachment<TData = Awaited<ReturnType<typeof getTicketAttachment>>, TError = ErrorType<void>>(id: number, attachmentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTicketAttachment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListNotificationsUrl: (params: ListNotificationsParams) => string;
/**
 * @summary List in-app notifications for a user
 */
export declare const listNotifications: (params: ListNotificationsParams, options?: Parameters<typeof customFetch>[1]) => Promise<AppNotification[]>;
export declare const getListNotificationsQueryKey: (params?: ListNotificationsParams) => readonly ["/api/notifications", ...ListNotificationsParams[]];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List in-app notifications for a user
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkNotificationReadUrl: (id: number) => string;
/**
 * @summary Mark a notification as read
 */
export declare const markNotificationRead: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<AppNotification>;
export declare const getMarkNotificationReadMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export type MarkNotificationReadMutationResult = NonNullable<Awaited<ReturnType<typeof markNotificationRead>>>;
export type MarkNotificationReadMutationError = ErrorType<void>;
/**
* @summary Mark a notification as read
*/
export declare const useMarkNotificationRead: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map