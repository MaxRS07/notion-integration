pub enum ParentType {
    Database,
    Page,
    Workspace,
}

impl std::fmt::Display for ParentType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ParentType::Database => write!(f, "database_id"),
            ParentType::Page => write!(f, "page_id"),
            ParentType::Workspace => write!(f, "workspace"),
        }
    }
}
