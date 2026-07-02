import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface CommonPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// Build a compact page list: first & last pages always shown, a window of
// `siblings` pages around the current page, and "ellipsis" gaps in between.
function getPageItems(
  currentPage: number,
  totalPages: number,
  siblings = 1,
): (number | "ellipsis")[] {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - siblings && i <= currentPage + siblings)
    ) {
      pages.push(i);
    }
  }

  const items: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const page of pages) {
    if (page - prev > 1) items.push("ellipsis");
    items.push(page);
    prev = page;
  }
  return items;
}

export function CommonPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: CommonPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Don't show if data is less than or equal to the value per page show
  if (totalItems <= itemsPerPage || totalPages <= 1) {
    return null;
  }

  // Ensure current page is within safe bounds
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (safeCurrentPage > 1) {
                onPageChange(safeCurrentPage - 1);
              }
            }}
            className={
              safeCurrentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {getPageItems(safeCurrentPage, totalPages).map((item, i) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === safeCurrentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(item);
                }}
                className={cn(
                  "cursor-pointer",
                  item === safeCurrentPage &&
                    "bg-[#F0F0F3]! dark:bg-[#1A1919]! border-transparent! text-foreground! font-semibold shadow-none",
                )}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (safeCurrentPage < totalPages) {
                onPageChange(safeCurrentPage + 1);
              }
            }}
            className={
              safeCurrentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
