export default interface Root {
    object: string
    results: Result[]
    next_cursor: any
    has_more: boolean
    type: string
    user: User
    request_id: string
}

export interface Result {
    object: string
    id: string
    name: string
    avatar_url: any
    type: string
    person?: Person
    bot?: Bot
}

export interface Person {
    email: string
}

export interface Bot {
    owner: Owner
    workspace_name: string
    workspace_id: string
    workspace_limits: WorkspaceLimits
}

export interface Owner {
    type: string
    workspace: boolean
}

export interface WorkspaceLimits {
    max_file_upload_size_in_bytes: number
}

export interface User { }
