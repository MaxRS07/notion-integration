import { DatabaseColumn } from '../../models/notion/types';
import _, { Result } from "../../models/notion/page_query"

export class NotionDestination {
  data: Result;

  constructor(result: Result) {
    this.data = result;
  }

  getId(): string {
    return this.data.id ?? '';
  }

  getParentId(): string {
    return this.data.parent?.data_source_id ?? this.data.parent?.database_id ?? ""
  }

  isDatasource(): boolean {
    return !this.isPage();
  }

  isPage(): boolean {
    return this.data.object === 'page';
  }

  getName(): string {
    return this.isPage()
      ? this.data.properties.title?.title?.[0]?.plain_text ?? '(no title)'
      : this.data.title?.map(t => t.plain_text).join('') ?? '_';
  }

  getDisplayType(): string {
    return this.isPage() ? 'Page' : 'Data Source';
  }

  getColumns(): DatabaseColumn[] {
    if (!this.isDatasource()) return [];
    return Object.entries(this.data.properties).map(([k, v]) => {
      const o = v as DatabaseColumn;
      o.name = k;
      return o;
    });
  }
}

export interface DropdownOption {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}