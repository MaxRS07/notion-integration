export default interface Root {
    object: string;
    results: Result[];
    next_cursor: string | null;
    has_more: boolean;
    type: string;
    page_or_data_source: any; // same as serde_json::Value
    request_id: string;
}

export interface Result {
    object: string;
    id?: string;
    created_time?: string;
    last_edited_time?: string;
    created_by?: CreatedBy;
    last_edited_by?: LastEditedBy;
    cover?: any;
    title?: RichText[];
    icon?: Icon;
    parent?: Parent;
    archived?: boolean;
    in_trash?: boolean;
    properties: any;
    url?: string;
    public_url?: string;
}

export interface CreatedBy {
    object?: string;
    id?: string;
}

export interface LastEditedBy {
    object?: string;
    id?: string;
}

export interface Icon {
    type?: string;
    emoji?: string;
}

export interface Parent {
    type?: string;
    data_source_id?: string;
}

export interface RichText {
    plain_text: string;
    href: string | null;
    text: {
        content: string;
        link: string | null;
    };
    annotations: any;
    type: string;
}