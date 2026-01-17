// blocks/registry.ts
import { GetCanvasAnnouncements, GetCanvasAssignments, GetCanvasCourses, GetCanvasGrades } from './CanvasGet';
import { NotionAddBlock, NotionAddChildPage, NotionAddDatabaseEntry, NotionEditPage, NotionMakeComment } from './NotionBlock';
import { LoggingBlock } from './ProgramBlock';
import { BlockDefinition } from './types';

export const BLOCKS: Record<string, Record<string, BlockDefinition>> = {
    "Canvas": {
        "Get Annoucements From Canvas": GetCanvasAnnouncements,
        "Get Assignments From Canvas": GetCanvasAssignments,
        "Get Courses From Canvas": GetCanvasCourses,
        "Get Grades From Canvas": GetCanvasGrades,
    },
    "Notion": {
        "Add Block To Notion": NotionAddBlock,
        "Edit Notion Page": NotionEditPage,
        "Make Comment In Notion": NotionMakeComment,
        "Add Child Page In Notion": NotionAddChildPage,
        "Add Database Entry In Notion": NotionAddDatabaseEntry,
    },
    "Function": {
        "Log Data To Console": LoggingBlock
    }
} as const;
