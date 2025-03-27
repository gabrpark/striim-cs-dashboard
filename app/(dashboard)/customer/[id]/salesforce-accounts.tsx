import { SelectSalesforceAccount } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

function formatCurrency(amount: number | null) {
	if (!amount) return 'N/A';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

export default function SalesforceAccounts({ accounts }: { accounts: SelectSalesforceAccount[] }) {
	if (!accounts.length) {
		return (
			<div className="text-sm text-muted-foreground">
				No Salesforce accounts found for this customer.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{accounts.map((account) => (
				<div
					key={account.sfAccountId}
					className="flex items-center justify-between border-b pb-4 last:border-0"
				>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-medium">{account.accountName}</span>
							<Badge variant="outline" className="text-xs">
								{account.type}
							</Badge>
						</div>
						<div className="text-sm text-muted-foreground">
							{account.businessUseCase}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span>Owner: {account.accountOwnerName || 'Unassigned'}</span>
							<span>•</span>
							<span>Territory: {account.territory || 'N/A'}</span>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right">
							<div className="text-sm font-medium">
								Target Upsell: {formatCurrency(account.targetUpsellValue)}
							</div>
							<div className="text-xs text-muted-foreground">
								Last Updated: {account.sfLastUpdatedAt?.toLocaleDateString()}
							</div>
						</div>
						{account.dealRoomLink && (
							<Button
								variant="ghost"
								size="icon"
								asChild
								className="h-8 w-8"
							>
								<a href={account.dealRoomLink} target="_blank" rel="noopener noreferrer">
									<ExternalLink className="h-4 w-4" />
								</a>
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	);
} 