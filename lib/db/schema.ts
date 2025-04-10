import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const summaries = pgTable('summaries', {
	id: serial('id').primaryKey(),
	summaryType: text('summary_type').notNull(),
	summary: text('summary').notNull(),
	sourceIds: jsonb('source_ids').notNull(),
	metadata: jsonb('metadata'),
	lastGeneratedAt: timestamp('last_generated_at').notNull().defaultNow(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const zendeskTickets = pgTable('zendesk_tickets', {
	zdTicketId: text('zd_ticket_id').primaryKey(),
	subject: text('subject').notNull(),
	description: text('description'),
	status: text('status').notNull(),
	priority: text('priority').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	jiraIssueCount: serial('jira_issue_count').notNull().default(0)
}); 