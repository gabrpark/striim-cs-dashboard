import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  bigint,
  date,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';
import { count, eq, ilike } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

// Add connection timeout to prevent hanging
export const db = drizzle(neon(process.env.POSTGRES_URL!));

// export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

// export const products = pgTable('products', {
//   id: serial('id').primaryKey(),
//   imageUrl: text('image_url').notNull(),
//   name: text('name').notNull(),
//   health: integer('health').notNull(),
//   // status: statusEnum('status').notNull(),
//   price: numeric('price', { precision: 10, scale: 2 }).notNull(),
//   stock: integer('stock').notNull(),
//   availableAt: timestamp('available_at').notNull()
// });

// Clients table
export const clients = pgTable('clients', {
  id: varchar('id', { length: 50 }).primaryKey(),
  imageUrl: varchar('image_url', { length: 255 }),
  name: varchar('name', { length: 255 }),
  arr: decimal('arr', { precision: 10, scale: 2 }),
  csm: integer('csm'),
  availableAt: timestamp('available_at'),
  health: integer('health'),
  companyName: varchar('company_name', { length: 255 })
});

// Zendesk tickets table
export const zendesk_tickets = pgTable('zendesk_tickets', {
  zdTicketId: bigint('zd_ticket_id', { mode: 'number' }).primaryKey(),
  requesterName: varchar('requester_name', { length: 100 }),
  requesterEmail: varchar('requester_email', { length: 255 }),
  assigneeName: varchar('assignee_name', { length: 100 }),
  assigneeEmail: varchar('assignee_email', { length: 255 }),
  ticketSubject: varchar('ticket_subject', { length: 255 }),
  ticketType: varchar('ticket_type', { length: 50 }),
  priority: varchar('priority', { length: 50 }),
  status: varchar('status', { length: 50 }),
  productVersion: varchar('product_version', { length: 50 }),
  productComponent: varchar('product_component', { length: 100 }),
  nodeCount: integer('node_count'),
  environment: varchar('environment', { length: 50 }),
  linkedJiraIssues: varchar('linked_jira_issues', { length: 255 }),
  ticketDescription: text('ticket_description'),
  summary: text('summary'),
  sfAccountId: varchar('sf_account_id', { length: 50 }),
  clientId: varchar('client_id', { length: 50 }).references(() => clients.id),
  serviceId: varchar('service_id', { length: 50 }).references(() => services.serviceId),
  sourceCreatedAt: timestamp('source_created_at'),
  sourceUpdatedAt: timestamp('source_updated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Add these table definitions
export const services = pgTable('services', {
  serviceId: varchar('service_id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  description: varchar('description', { length: 255 }),
  serviceType: varchar('service_type', { length: 50 })
});

export const subscriptions = pgTable('subscriptions', {
  subscriptionId: varchar('subscription_id', { length: 50 }).primaryKey(),
  clientId: varchar('client_id', { length: 50 }).references(() => clients.id),
  serviceId: varchar('service_id', { length: 50 }).references(() => services.serviceId),
  status: varchar('status', { length: 50 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  amount: decimal('amount', { precision: 15, scale: 2 })
});

// Add notifications table definition
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  clientId: varchar('client_id', { length: 50 }).references(() => clients.id),
  subscriptionId: varchar('subscription_id', { length: 50 }).references(() => subscriptions.subscriptionId),
  type: varchar('type', { length: 50 }),
  priority: varchar('priority', { length: 20 }),
  title: varchar('title', { length: 255 }),
  message: text('message'),
  llmAnalysis: text('llm_analysis'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Add salesforce_accounts table definition
export const salesforce_accounts = pgTable('salesforce_accounts', {
  sfAccountId: varchar('sf_account_id', { length: 50 }).primaryKey(),
  accountOwnerName: varchar('account_owner_name', { length: 100 }),
  accountOwnerEmail: varchar('account_owner_email', { length: 255 }),
  dealRoomLink: varchar('deal_room_link', { length: 255 }),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  businessUseCase: text('business_use_case'),
  parentAccountId: varchar('parent_account_id', { length: 50 }),
  targetUpsellValue: decimal('target_upsell_value', { precision: 15, scale: 2 }),
  accountRecordType: varchar('account_record_type', { length: 50 }),
  type: varchar('type', { length: 50 }),
  isTargetAccount: boolean('is_target_account').default(false),
  isMigrationAccount: boolean('is_migration_account').default(false),
  territory: varchar('territory', { length: 100 }),
  sfLastUpdatedAt: timestamp('sf_last_updated_at'),
  description: text('description'),
  clientId: varchar('client_id', { length: 50 }).references(() => clients.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Add Jira issues table definition
export const jira_issues = pgTable('jira_issues', {
  jiraIssueId: varchar('jira_issue_id', { length: 50 }).primaryKey(),
  issueSummary: varchar('issue_summary', { length: 255 }),
  issueDescription: text('issue_description'),
  issueType: varchar('issue_type', { length: 50 }),
  issueStatus: varchar('issue_status', { length: 50 }),
  priority: varchar('priority', { length: 50 }),
  assigneeName: varchar('assignee_name', { length: 100 }),
  assigneeEmail: varchar('assignee_email', { length: 255 }),
  reporterName: varchar('reporter_name', { length: 100 }),
  comments: text('comments'),
  linkedZendeskTicket: bigint('linked_zendesk_ticket', { mode: 'number' }).references(() => zendesk_tickets.zdTicketId),
  sfAccountId: varchar('sf_account_id', { length: 50 }).references(() => salesforce_accounts.sfAccountId),
  clientId: varchar('client_id', { length: 50 }).references(() => clients.id),
  serviceId: varchar('service_id', { length: 50 }).references(() => services.serviceId),
  sourceCreatedAt: timestamp('source_created_at'),
  sourceUpdatedAt: timestamp('source_updated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Add users table definition
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  username: varchar('username', { length: 255 })
});

export type SelectClient = typeof clients.$inferSelect;
export type SelectTicket = typeof zendesk_tickets.$inferSelect;
export type SelectJiraIssue = typeof jira_issues.$inferSelect;
export type SelectSalesforceAccount = typeof salesforce_accounts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type User = typeof users.$inferSelect;

export const insertProductSchema = createInsertSchema(clients);

export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectClient[];
  newOffset: number | null;
  totalProducts: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db
        .select()
        .from(clients)
        .where(ilike(clients.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(clients);
  let moreProducts = await db
    .select()
    .from(clients)
    .limit(5)
    .offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: string) {
  await db.delete(clients).where(eq(clients.id, id));
}

// Update getCustomerData to include Jira issues
export async function getCustomerWithTickets(id: string) {
  try {
    console.log('Fetching customer data for ID:', id);

    const customer = await db.select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (!customer.length) {
      console.log('No customer found with ID:', id);
      return null;
    }

    console.log('Customer found, fetching related data');

    // Use Promise.all to fetch all data in parallel
    const [tickets, subscriptionData, jiraIssues, salesforceAccounts] = await Promise.all([
      db.select()
        .from(zendesk_tickets)
        .where(eq(zendesk_tickets.clientId, id))
        .catch(err => {
          console.error('Error fetching tickets:', err);
          return [];
        }),

      db.select({
        subscription: subscriptions,
        service: services
      })
        .from(subscriptions)
        .innerJoin(services, eq(subscriptions.serviceId, services.serviceId))
        .where(eq(subscriptions.clientId, id))
        .catch(err => {
          console.error('Error fetching subscriptions:', err);
          return [];
        }),

      db.select()
        .from(jira_issues)
        .where(eq(jira_issues.clientId, id))
        .catch(err => {
          console.error('Error fetching Jira issues:', err);
          return [];
        }),

      db.select()
        .from(salesforce_accounts)
        .where(eq(salesforce_accounts.clientId, id))
        .catch(err => {
          console.error('Error fetching Salesforce accounts:', err);
          return [];
        })
    ]);

    console.log('All data fetched successfully');

    // Transform Jira issues from snake_case to camelCase
    const transformedJiraIssues = jiraIssues.map(issue => {
      // Use type assertion to access snake_case properties
      const rawIssue = issue as any;
      return {
        jiraIssueId: rawIssue.jira_issue_id || rawIssue.jiraIssueId,
        issueSummary: rawIssue.issue_summary || rawIssue.issueSummary,
        issueDescription: rawIssue.issue_description || rawIssue.issueDescription,
        issueType: rawIssue.issue_type || rawIssue.issueType,
        issueStatus: rawIssue.issue_status || rawIssue.issueStatus,
        priority: rawIssue.priority,
        assigneeName: rawIssue.assignee_name || rawIssue.assigneeName,
        assigneeEmail: rawIssue.assignee_email || rawIssue.assigneeEmail,
        reporterName: rawIssue.reporter_name || rawIssue.reporterName,
        comments: rawIssue.comments,
        linkedZendeskTicket: rawIssue.linked_zendesk_ticket || rawIssue.linkedZendeskTicket,
        sfAccountId: rawIssue.sf_account_id || rawIssue.sfAccountId,
        clientId: rawIssue.client_id || rawIssue.clientId,
        serviceId: rawIssue.service_id || rawIssue.serviceId,
        sourceCreatedAt: rawIssue.source_created_at || rawIssue.sourceCreatedAt,
        sourceUpdatedAt: rawIssue.source_updated_at || rawIssue.sourceUpdatedAt,
        createdAt: rawIssue.created_at || rawIssue.createdAt,
        updatedAt: rawIssue.updated_at || rawIssue.updatedAt
      };
    });

    return {
      customer: customer[0],
      tickets,
      subscriptions: subscriptionData,
      jiraIssues: transformedJiraIssues,
      salesforceAccounts
    };
  } catch (error) {
    console.error('Error fetching customer data:', error);
    // Return a default structure instead of null to prevent UI crashes
    return {
      customer: null,
      tickets: [],
      subscriptions: [],
      jiraIssues: [],
      salesforceAccounts: []
    };
  }
}
