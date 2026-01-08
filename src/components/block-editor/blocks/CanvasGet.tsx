// CanvasGetBlocks.tsx
import React from 'react';
import { BlockEditorContext, BlockDefinition, BlockRenderProps, BlockType, BlockRuntimeContext } from './types';
import canvas from '../../../assets/icons/canvas.svg';
import './BlockStyles.css';
import { getAllAssignments, getUserCourses } from '../../../utils/canvas';
import { storage } from '../../../utils/storage';
import { Variable, VariableGroup } from '../../../models/shared/mapvar';
import { NotionType } from '../../../models/notion/types';
import { Course } from '../../../models/canvas/course';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface CanvasTriggerData {
  token: string;
  domain: string;
}

/* ------------------------------------------------------------------ */
/* Shared Renderer */
/* ------------------------------------------------------------------ */

function CanvasGetRenderer(props: BlockRenderProps<CanvasTriggerData> & { title: string; description: string }) {
  const { data, onChange, title, description } = props;
  const [showCanvasToken, setShowCanvasToken] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const domain = data?.domain ?? '';
  const token = data?.token ?? '';

  return (
    <div>
      <div className="block-header">
        <img className="block-icon" src={canvas}></img>
        <div className="block-info">
          <h3 className="block-title">{title}</h3>
          <p className="block-description">{description}</p>
        </div>
      </div>
      <p className="field-hint">
        This block will fetch data automatically from your Canvas account.
      </p>
      <button
        className="toggle-advanced-btn"
        onClick={() => setShowAdvanced(!showAdvanced)}
        type="button"
      >
        {showAdvanced ? 'Hide Advanced Settings ▲' : 'Show Advanced Settings ▼'}
      </button>
      {showAdvanced &&
        <div className="block-fields">
          <div className="form-group" style={{ 'margin': '0px' }}>
            <label className="form-label">
              School Name
              <span className="label-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="northeastern"
              value={domain}
              onChange={(e) => onChange({ ...data, domain: e.target.value })}
            />
            <p className="form-help">
              Enter your school as it appears in your canvas domain <br></br>e.g. northeastern in https://northeastern.instructure.com/
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">
              Canvas Access Token
              <span className="label-required">*</span>
            </label>
            <div className="input-with-toggle">
              <input
                type={showCanvasToken ? 'text' : 'password'}
                className="form-input"
                value={token}
                onChange={(e) => onChange({ ...data, token: e.target.value })}
                placeholder="Enter your Canvas API token"
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowCanvasToken(!showCanvasToken)}
                type="button"
              >
                {showCanvasToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="form-help">
              Get your token from Canvas → Account → Settings → New Access Token
            </p>
          </div>
        </div>
      }
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Block Factory */
/* ------------------------------------------------------------------ */

function createCanvasGetBlock(config: {
  label: string;
  description: string;
  onRun: (data: CanvasTriggerData, context: BlockRuntimeContext) => Promise<any>;
  onAdd?: (data: CanvasTriggerData, context: BlockEditorContext) => void;
  onRemove?: (data: CanvasTriggerData, context: BlockEditorContext) => void;
}): BlockDefinition<CanvasTriggerData> {
  return {
    type: BlockType.GET,
    label: config.label,
    img: canvas,

    defaultData: {
      domain: storage.getSettings().canvasSchoolName,
      token: storage.getSettings().canvasToken
    },

    render: (props: BlockRenderProps<CanvasTriggerData>) => (
      <CanvasGetRenderer
        {...props}
        title={config.label}
        description={config.description}
      />
    ),

    onRun: config.onRun,

    onAdd: config.onAdd,

    onRemove: config.onRemove,

    summarize: () => config.label,

    validate: () => null,
  };
}

/* ------------------------------------------------------------------ */
/* Concrete Blocks */
/* ------------------------------------------------------------------ */

export const GetCanvasCourses = createCanvasGetBlock({
  label: 'Get Courses from Canvas',
  description: 'Import your enrolled courses from Canvas',
  onRun: async (data: CanvasTriggerData, context: BlockRuntimeContext) => {
    getUserCourses(data.token, data.domain).then(courses => {
      let courseVars: Variable<Course[]> = {
        name: 'Courses',
        value: courses,
        description: 'List of courses from Canvas'
      };
      context.setRuntimeVars(prev => {
        return { ...prev, 'courses': { "label": "Canvas Courses", "variables": { "courses": courseVars } } }
      });
    });
  },
  onAdd: (data: CanvasTriggerData, context: BlockEditorContext) => {
    let courseVars: Variable<Course[]> = {
      name: 'Courses',
      value: [],
      description: 'List of courses from Canvas'
    };
  });

export const GetCanvasAssignments = createCanvasGetBlock({
  label: 'Get Assignments from Canvas',
  description: 'Sync assignments and due dates',
  onRun: async (data: CanvasTriggerData, context: BlockRuntimeContext) => {
    getAllAssignments(data.token, data.domain).then(assignments => {
      context.setEnvironmentVars(prev => prev)
    });
  },
  onAdd: 
});

export const GetCanvasAnnouncements = createCanvasGetBlock({
  label: 'Get Announcements from Canvas',
  description: 'Get course announcements',
});

export const GetCanvasGrades = createCanvasGetBlock({
  label: 'Get Grades from Canvas',
  description: 'Track your grades and scores',
});

/* ------------------------------------------------------------------ */
/* Optional: convenience export */
/* ------------------------------------------------------------------ */

export const CanvasGetBlocks = [
  GetCanvasCourses,
  GetCanvasAssignments,
  GetCanvasAnnouncements,
  GetCanvasGrades,
];
