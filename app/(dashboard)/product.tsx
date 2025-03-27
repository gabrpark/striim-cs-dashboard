import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectClient } from '@/lib/db';
import { deleteProduct } from './actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function HealthCircle({ value }: { value: number }) {
  // Ensure value is between 1 and 10
  const score = Math.max(1, Math.min(10, value));

  // Calculate color based on score
  const color = score <= 3
    ? "text-red-500"
    : score <= 6
      ? "text-orange-500"
      : "text-green-500";

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = ((score / 10) * circumference);

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg className="absolute w-full h-full -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          strokeWidth="4"
          fill="none"
          className="stroke-gray-200"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          strokeWidth="4"
          fill="none"
          stroke="currentColor"
          className={cn("transition-all duration-300 ease-in-out", color)}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - fillPercentage,
            strokeLinecap: "round"
          }}
        />
      </svg>
      <span className={cn("relative z-10 font-medium text-sm", color)}>
        {score}
      </span>
    </div>
  );
}

function ScoreDots({ value }: { value: number }) {
  // Ensure value is between 1 and 5
  const score = Math.max(1, Math.min(5, value));

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={cn(
            "w-3 h-3 rounded-full",
            dot <= score
              ? score <= 2
                ? "bg-red-500"
                : score === 3
                  ? "bg-orange-500"
                  : "bg-green-500"
              : "bg-gray-200"
          )}
        />
      ))}
    </div>
  );
}

function formatCurrency(amount: string | number) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

export function Product({ product }: { product: SelectClient }) {
  return (
    <TableRow>
      {/* <TableCell className="hidden sm:table-cell">
        <Image
          alt="Product image"
          className="aspect-square rounded-md object-cover"
          height="64"
          src={product.imageUrl}
          width="64"
        />
      </TableCell> */}
      <TableCell className="font-medium">
        <Link
          href={`/customer/${product.id}`}
          className="hover:underline text-primary cursor-pointer"
        >
          {product.companyName || 'Not Specified'}
        </Link>
      </TableCell>
      <TableCell className="font-medium">
        {product.name || 'Not Specified'}
      </TableCell>
      <TableCell>
        <HealthCircle value={product.health ?? 0} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {product.arr ? formatCurrency(product.arr) : '$0'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <ScoreDots value={product.csm ?? 0} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {product.availableAt?.toLocaleDateString("en-US")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              <form action={deleteProduct}>
                <button type="submit">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
