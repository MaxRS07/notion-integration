export enum NotionType {
    Title = "title",
    Text = "text",
    RichText = "rich_text",
    Number = "number",
    Status = "status",
    Select = "select",
    Multiselect = "multi_select",
    Date = "date",
    Checkbox = "checkbox",
    Url = "url",
    Email = "email",
    Phone = "phone",
    Boolean = "boolean",
    Any = "any"
}

export interface DatabaseColumn {
    id: string;
    name: string;
    description: string;
    type: NotionType
    select?: any;
    status?: any;
}

export interface Group {
    color: string;
    name: string;
    id: string;
    option_ids: string[];
}

export interface Option {
    color: string;
    id: string;
    name: string;
    description?: string;
}