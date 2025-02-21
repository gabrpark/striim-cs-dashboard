'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Product } from './product';
import { SelectProduct } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PageNumber({ pageNum, currentPage, onClick }: {
  pageNum: number,
  currentPage: number,
  onClick: (page: number) => void
}) {
  return (
    <Button
      variant={pageNum === currentPage ? "secondary" : "ghost"}
      size="sm"
      onClick={() => onClick(pageNum)}
      className="w-8 h-8 p-0"
    >
      {pageNum}
    </Button>
  );
}

export function ProductsTable({
  products,
  offset,
  totalProducts
}: {
  products: SelectProduct[];
  offset: number;
  totalProducts: number;
}) {
  let router = useRouter();
  let productsPerPage = 5;
  const currentPage = Math.floor(offset / productsPerPage) + 1;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  function goToPage(page: number) {
    const newOffset = (page - 1) * productsPerPage;
    router.push(`?offset=${newOffset}`, { scroll: false });
  }

  function prevPage(e: React.MouseEvent) {
    e.preventDefault();
    goToPage(currentPage - 1);
  }

  function nextPage(e: React.MouseEvent) {
    e.preventDefault();
    goToPage(currentPage + 1);
  }

  function getPageNumbers() {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Show 1 2 3 ... n-1 n for more pages
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      for (let i = Math.max(2, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          Manage your cutomers and view their summary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead> */}
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[100px]">Health</TableHead>
              <TableHead className="hidden md:table-cell w-[150px]">ARR (USD)</TableHead>
              <TableHead className="hidden md:table-cell w-[150px]">
                CSM Score
              </TableHead>
              <TableHead className="hidden md:table-cell w-[150px]">Created at</TableHead>
              <TableHead className="w-[100px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <Product key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {offset + 1}-{Math.min(offset + productsPerPage, totalProducts)}
            </strong>{' '}
            of <strong>{totalProducts}</strong> products
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((pageNum, idx) =>
              typeof pageNum === 'string' ? (
                <span key={`ellipsis-${idx}`} className="px-2">...</span>
              ) : (
                <PageNumber
                  key={pageNum}
                  pageNum={pageNum}
                  currentPage={currentPage}
                  onClick={goToPage}
                />
              )
            )}

            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
