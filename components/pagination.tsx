"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  onPageChange?: (page: number) => void;
}

/**
 * Pagination component with smart ellipsis handling
 * Shows: First page, nearby pages, last page
 * @example
 * <Pagination currentPage={1} totalPages={10} basePath="/reports" />
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const delta = 2; // Number of pages to show around current page
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    // Always include first page
    range.push(1);

    // Add left ellipsis range
    const leftStart = Math.max(2, currentPage - delta);
    const leftEnd = Math.min(currentPage - 1, totalPages - 1);

    if (leftStart > 2) {
      rangeWithDots.push("...");
    }

    for (let i = leftStart; i <= leftEnd; i++) {
      rangeWithDots.push(i);
    }

    // Add current page and nearby
    if (currentPage !== 1 && currentPage !== totalPages) {
      rangeWithDots.push(currentPage);
    }

    // Add right ellipsis range
    const rightStart = Math.max(currentPage + 1, 2);
    const rightEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rightEnd < totalPages - 1) {
      rangeWithDots.push("...");
    }

    for (let i = rightStart; i <= rightEnd; i++) {
      rangeWithDots.push(i);
    }

    // Always include last page
    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((val, idx, arr) => arr.indexOf(val) === idx);
  };

  const handleClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pageNumbers = getPageNumbers();
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav
      className="flex items-center justify-center gap-1 py-8"
      role="navigation"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        asChild={currentPage > 1}
        onClick={() => handleClick(previousPage)}
        aria-label="Go to previous page"
      >
        {currentPage > 1 ? (
          <Link href={`${basePath}?page=${previousPage}`}>
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <>
            <ChevronLeft className="size-4" />
          </>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              asChild={currentPage !== page}
              onClick={() => handleClick(page as number)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {currentPage === page ? (
                <span>{page}</span>
              ) : (
                <Link href={`${basePath}?page=${page}`}>{page}</Link>
              )}
            </Button>
          )
        )}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        asChild={currentPage < totalPages}
        onClick={() => handleClick(nextPage)}
        aria-label="Go to next page"
      >
        {currentPage < totalPages ? (
          <Link href={`${basePath}?page=${nextPage}`}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <>
            <ChevronRight className="size-4" />
          </>
        )}
      </Button>
    </nav>
  );
}

/**
 * Compact pagination for mobile/tight spaces
 */
export function PaginationCompact({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={`${basePath}?page=${previousPage}`}>
            <ChevronLeft className="mr-1 size-4" />
            Sebelumnya
          </Link>
        ) : (
          <>
            <ChevronLeft className="mr-1 size-4" />
            Sebelumnya
          </>
        )}
      </Button>

      <div className="text-sm font-medium text-muted-foreground">
        Halaman <span className="font-bold text-foreground">{currentPage}</span> dari{" "}
        <span className="font-bold text-foreground">{totalPages}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={`${basePath}?page=${nextPage}`}>
            Selanjutnya
            <ChevronRight className="ml-1 size-4" />
          </Link>
        ) : (
          <>
            Selanjutnya
            <ChevronRight className="ml-1 size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
