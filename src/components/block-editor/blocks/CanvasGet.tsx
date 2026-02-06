// CanvasGetBlocks.tsx
import React, { useEffect, useState } from 'react';
import { BlockEditorContext, BlockDefinition, BlockRenderProps, BlockType, BlockRuntimeContext } from './types';
import canvas from '../../../assets/icons/canvas.svg';
import './BlockStyles.css';
import { checkCanvasStatus, getAllAssignments, getUserCourses } from '../../../utils/canvas';
import { storage } from '../../../utils/storage';
import { RuntimeVariable } from '../../../models/shared/mapvar';
import { Course } from '../../../models/canvas/course';
import { camelToTitleCase } from '../../../utils/extensions';
import { LoadingStatusIndicator } from '../../AppSettings';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface CanvasTriggerData {
  token?: string;
  domain?: string;
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

  const [connected, setConnected] = useState<string | null>(null);

  useEffect(() => {
    if (data.token && data.domain) {
      setConnected(null);
      checkCanvasStatus(data.token, data.domain).then(isConnected => {
        if (!isConnected) {
          setConnected("Connection failed. Please check your token and domain.");
        } else {
          setConnected('');
        }
      });
    }
  }, [data])

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
            {data.token && data.domain && <LoadingStatusIndicator connected={connected} />}
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
    if (!data.token || !data.domain) return;
    const courses = await getUserCourses(data.token, data.domain)
    const id = crypto.randomUUID();
    const rv: RuntimeVariable<Course[]> = { id, value: courses };
    context.setRuntimeVars(prev => ({ ...prev, [id]: rv }));
  },
  onAdd: (data: CanvasTriggerData, context: BlockEditorContext) => {
    const courseProps = [
      'id', 'sisCourseId', 'uuid', 'integrationId', 'sisImportId', 'name', 'courseCode', 'originalName', 'workflowState', 'accountId', 'rootAccountId', 'enrollmentTermId', 'gradingPeriods', 'gradingStandardId', 'gradePassbackSetting', 'createdAt', 'startAt', 'endAt', 'locale', 'enrollments', 'totalStudents', 'calendar', 'defaultView', 'syllabusBody', 'needsGradingCount', 'term', 'courseProgress', 'applyAssignmentGroupWeights', 'permissions', 'isPublic', 'isPublicToAuthUsers', 'publicSyllabus', 'publicSyllabusToAuth', 'publicDescription', 'storageQuotaMb', 'storageQuotaUsedMb', 'hideFinalGrades', 'license', 'allowStudentAssignmentEdits', 'allowWikiComments', 'allowStudentForumAttachments', 'openEnrollment', 'selfEnrollment', 'restrictEnrollmentsToCourseDates', 'courseFormat', 'accessRestrictedByDate', 'timeZone', 'blueprint', 'blueprintRestrictions', 'blueprintRestrictionsByObjectType', 'template'
    ];

    const options = courseProps.map(prop => ({
      id: `courses.${prop}`,
      img: canvas,
      name: camelToTitleCase(prop),
      value: `courses.${prop}`,
      sourceBlockIndex: context.blockIndex,
    }));

    context.setDisplayVariableGroups(prev => [
      ...prev,
      {
        label: 'Canvas Courses',
        options,
      },
    ]);
  }
});

export const GetCanvasAssignments = createCanvasGetBlock({
  label: 'Get Assignments from Canvas',
  description: 'Sync assignments and due dates',
  onRun: async (data: CanvasTriggerData, context: BlockRuntimeContext) => {
    if (!data.token || !data.domain) return;
    getAllAssignments(data.token, data.domain).then(assignments => {
      const id = crypto.randomUUID();
      const rv: RuntimeVariable<any[]> = { id, value: assignments };
      context.setRuntimeVars(prev => ({ ...prev, [id]: rv }));
    });
  },
});

export const GetCanvasAnnouncements = createCanvasGetBlock({
  label: 'Get Announcements from Canvas',
  description: 'Get course announcements',
  onRun: async (data: CanvasTriggerData, context: BlockRuntimeContext) => { }
});

export const GetCanvasGrades = createCanvasGetBlock({
  label: 'Get Grades from Canvas',
  description: 'Track your grades and scores',
  onRun: async (data: CanvasTriggerData, context: BlockRuntimeContext) => { }
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
