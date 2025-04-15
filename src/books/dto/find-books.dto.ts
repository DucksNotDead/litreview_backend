export class FindBooksDto {
  title?: string;
  categoryIds?: string;
  authorIds?: string;
}

export class InnerFindBookDto {
  title?: string;
  categoryIds?: number[];
  authorIds?: number[];
}
