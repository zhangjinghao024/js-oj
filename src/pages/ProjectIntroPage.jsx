import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import Editor from '@monaco-editor/react';
import { fetchProjectIntroQa, saveProjectIntroQa } from '../api/judgeApi';
import './ProjectIntroPage.css';

class QaAnswerMarkdownBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.content !== this.props.content) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <p className="project-qa-answer-fallback">{this.props.content}</p>;
    }

    return this.props.children;
  }
}

const createQaItem = (actionIndex = 0) => ({
  id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  question: '',
  answer: '',
  code: '',
  actionIndex
});

const initialProjects = [
  {
    id: 'qunar-train-ticket',
    title: '去哪儿旅行 App（火车票业务）',
    techStack: ['React Native', 'Redux'],
    description:
      '面向铁路出行场景的跨平台移动应用，为用户提供完整的火车票购买、抢票及订单管理服务。支持 iOS / Android / 鸿蒙 / H5 多端运行，服务百万级用户。',
    actions: [
      '参与火车票抢票核心业务开发：针对填单页、详情页、列表页等 6 大核心页面代码重复率高的问题，抽离 RobbingCell、Modal、Card、Label 等通用组件至 Common 库，设计 UI 与业务特性分离的多态 Style 方案。',
      '参与火车 App 页面秒开率提升与性能优化：将页面启动链路拆解为跳转/数据/计算/渲染四阶段。优化 QP 包预加载策略（预加载占比提升至 94.4%）；制定三级接口优先级，延迟非核心请求，异步串行改并行；引入计算缓存与算法降阶，长任务分批执行；非可视组件延迟挂载，结合批量更新与 useMemo 优化首帧渲染。',
      '参与火车票业务针对鸿蒙单框架进行 RN 适配，对齐线上版本，实现火车部分原生桥接层：适配多项 RN/H5 与原生通信 SDK（含日历提醒、本地存储、语音助手），并完成折叠屏体验优化。'
    ],
    outcomes: [
      '抢票 UI 组件复用量均 >3，同类 UI 需求开发周期从 2 天缩短至 1 天。',
      '安卓用户秒开率提升 39.2 个百分点（43.6% -> 82.8%）；90% 用户在 1.35 秒内可操作页面，日均为总用户节省等待耗时约 339 小时。',
      '纯血鸿蒙渠道每周为业务贡献 4000+ 票量，折叠屏 L2T 转化率提升 2.3%。'
    ],
    references: [
      {
        id: 'ref-robbing-cell',
        type: 'file',
        title: 'RobbingCell（RobOrderCell.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/3/RobOrderCell.js',
        line: 113
      },
      {
        id: 'ref-modal-js',
        type: 'file',
        title: 'Modal（Modal.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/0/Modal.js',
        line: 29
      },
      {
        id: 'ref-card',
        type: 'file',
        title: 'Card（CombineAndCrossInfoCard.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/2/CombineAndCrossInfoCard.js',
        line: 17
      },
      {
        id: 'ref-label',
        type: 'file',
        title: 'Label（DiscountLabel.js）',
        path: '/Users/zhangjinghao/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_n6sjf4t319b622_fdf9/msg/attach/a847e4673e98bca2021d86abfce7acbf/2026-03/Rec/3b92d92f6113b566/F/4/DiscountLabel.js',
        line: 41
      }
    ],
    qa: []
  },
  {
    id: 'train-ai-node',
    title: 'train-ai-node：火车票AI工作助手',
    techStack: ['Node.js', 'Zod', 'MCP SDK'],
    description:
      '火车票AI工作助手通过标准化的 MCP 工具集和自动化任务调度，为 AI 智能体提供统一的企业内部系统集成能力，实现开发值班流程的智能化和自动化。',
    actions: [
      '搭建体系，统一咨询入口：基于飞书的生态基础搭建机器人，统一火车多个业务咨询入口（前端、国际火车、小汽船），基于 aily 智能体平台创建 10+ 技能工作流。',
      '高阶技能解决复杂咨询：基于 MCP 协议实现自动化查询 app 发布崩溃和错误堆栈、搜索代码库、WebSocket 实时查询用户请求轨迹、提出解决建议等技能。',
      '丰富标准文档知识库：实现业务配置和埋点实时同步到知识库功能。'
    ],
    outcomes: [
      '火车 AI 提效覆盖五一、国庆、春运三大高峰，机器人拦截 31% 工单量，年化节省 300+ pd。',
      '沉淀的多技能架构（Qtrace、代码搜索、Qconfig 等）已复用至多条业务线。'
    ],
    references: [],
    qa: []
  },
  {
    id: 'train-ticket-admin-system',
    title: '火车票业务管理后台系统',
    techStack: ['Next.js', 'Ant Design', 'Koa'],
    description:
      '火车票业务的 B 端后台管理系统，服务于内部运营、技术、产品等同学，包括订单查询、营销活动、代理商管理、用户请求轨迹查询等功能。',
    actions: [
      '参与开发项目的 BFF 层架构，实现前后端解耦和微服务路由聚合，解决 SSR 鉴权、多环境切换、接口统一管理等问题。',
      '参与搭建后台系统的组件化架构，实现 Layout、PageHeader、Content 等核心组件，落地统一布局和动态菜单，支撑 50+ 页面的快速开发。'
    ],
    outcomes: [
      '通过 BFF 层统一鉴权、路由与接口编排，提升后台系统在多环境与多服务场景下的稳定性和可维护性。',
      '通过组件化与统一布局方案沉淀后台基建，显著降低新页面接入成本，并支撑 50+ 页面规模化迭代。'
    ],
    references: [],
    qa: []
  }
];

const getSafeActionIndex = (actionIndex, fallbackIndex, actionCount) => {
  if (actionCount <= 0) return -1;
  if (Number.isInteger(actionIndex) && actionIndex >= 0 && actionIndex < actionCount) {
    return actionIndex;
  }
  return fallbackIndex % actionCount;
};

const normalizeQaList = (qaList = [], actionCount = 0) => qaList
  .filter((item) => item && typeof item === 'object')
  .map((item, index) => ({
    id: typeof item.id === 'string' ? item.id : `qa-restored-${Date.now()}-${index}`,
    question: typeof item.question === 'string' ? item.question : '',
    answer: typeof item.answer === 'string' ? item.answer : '',
    code: typeof item.code === 'string' ? item.code : '',
    actionIndex: getSafeActionIndex(item.actionIndex, index, actionCount)
  }));

const mergeQaMapToProjects = (projects, qaMap) => projects.map((project) => {
  const remoteQa = qaMap?.[project.id];
  if (!Array.isArray(remoteQa)) return project;
  return {
    ...project,
    qa: normalizeQaList(remoteQa, Array.isArray(project.actions) ? project.actions.length : 0)
  };
});

const buildQaGroups = (project) => {
  const actions = Array.isArray(project.actions) ? project.actions : [];
  if (actions.length === 0) {
    return [
      {
        actionIndex: -1,
        actionLabel: '未配置行动',
        items: project.qa.map((item, qaIndex) => ({ item, qaIndex }))
      }
    ];
  }

  const groups = actions.map((actionLabel, actionIndex) => ({
    actionIndex,
    actionLabel,
    items: []
  }));

  project.qa.forEach((item, qaIndex) => {
    const actionIndex = getSafeActionIndex(item.actionIndex, qaIndex, actions.length);
    groups[actionIndex].items.push({
      item: {
        ...item,
        actionIndex
      },
      qaIndex
    });
  });

  return groups;
};

const getQaGroupKey = (projectId, actionIndex) => `${projectId}:${actionIndex}`;
const getQaDropTargetKey = (projectId, actionIndex, qaId = '__end__') => (
  `${projectId}:${actionIndex}:${qaId}`
);

const reorderProjectQa = (project, dragMeta, dropMeta) => {
  if (!project || !dragMeta || !dropMeta) return project;
  const { qaId: draggedQaId } = dragMeta;
  const { targetActionIndex, targetQaId, position = 'before' } = dropMeta;
  if (typeof draggedQaId !== 'string' || draggedQaId.length === 0) return project;
  if (typeof targetQaId === 'string' && targetQaId === draggedQaId && position === 'before') {
    return project;
  }

  const actions = Array.isArray(project.actions) ? project.actions : [];
  const actionCount = actions.length;
  const groupOrder = actionCount > 0
    ? actions.map((_, actionIndex) => actionIndex)
    : [-1];

  if (!groupOrder.includes(targetActionIndex)) return project;

  const groups = groupOrder.reduce((result, actionIndex) => ({
    ...result,
    [actionIndex]: []
  }), {});
  const itemMap = new Map();

  project.qa.forEach((item, qaIndex) => {
    const actionIndex = actionCount > 0
      ? getSafeActionIndex(item.actionIndex, qaIndex, actionCount)
      : -1;
    groups[actionIndex].push(item.id);
    if (actionIndex === item.actionIndex) {
      itemMap.set(item.id, item);
      return;
    }
    itemMap.set(item.id, {
      ...item,
      actionIndex
    });
  });

  if (!itemMap.has(draggedQaId)) return project;

  groupOrder.forEach((actionIndex) => {
    groups[actionIndex] = groups[actionIndex].filter((itemId) => itemId !== draggedQaId);
  });

  const targetGroup = groups[targetActionIndex];
  if (!Array.isArray(targetGroup)) return project;

  let insertIndex = targetGroup.length;
  if (typeof targetQaId === 'string') {
    const targetIndex = targetGroup.findIndex((itemId) => itemId === targetQaId);
    if (targetIndex >= 0) {
      insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    }
  }
  targetGroup.splice(insertIndex, 0, draggedQaId);

  const draggedItem = itemMap.get(draggedQaId);
  itemMap.set(draggedQaId, {
    ...draggedItem,
    actionIndex: targetActionIndex
  });

  const reorderedQa = [];
  groupOrder.forEach((actionIndex) => {
    groups[actionIndex].forEach((itemId) => {
      const item = itemMap.get(itemId);
      if (item) reorderedQa.push(item);
    });
  });

  const hasSameQaOrder = reorderedQa.length === project.qa.length
    && reorderedQa.every((item, index) => (
      item.id === project.qa[index].id
      && item.actionIndex === project.qa[index].actionIndex
    ));
  if (hasSameQaOrder) return project;

  return {
    ...project,
    qa: reorderedQa
  };
};

const ProjectIntroPage = () => {
  const [projectList, setProjectList] = useState(initialProjects);
  const [expandedProjectId, setExpandedProjectId] = useState(() => {
    try {
      const saved = localStorage.getItem('projectIntro_expandedId');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialProjects[0].id;
  });
  const [editingProjectIds, setEditingProjectIds] = useState([]);
  const [savingProjectIds, setSavingProjectIds] = useState([]);
  const [draggingQaId, setDraggingQaId] = useState(null);
  const [dragOverTargetKey, setDragOverTargetKey] = useState(null);
  const [dragOverActionIndex, setDragOverActionIndex] = useState(null);
  const [qaAutoSaveErrorMap, setQaAutoSaveErrorMap] = useState({});
  const [activeQaEditorMap, setActiveQaEditorMap] = useState({});
  const [expandedQaGroupKey, setExpandedQaGroupKey] = useState(null);
  const [pendingQuestionFocus, setPendingQuestionFocus] = useState(null);
  const [openAnswerId, setOpenAnswerId] = useState(null);
  const [codeModalState, setCodeModalState] = useState(null);
  const [codeModalDraft, setCodeModalDraft] = useState('');
  const qaQuestionInputRefs = useRef({});
  const qaDragMetaRef = useRef(null);
  const qaAutoSaveQueueRef = useRef({});

  const openCodeModal = (projectId, qaId) => {
    const project = projectList.find((p) => p.id === projectId);
    const item = project?.qa.find((q) => q.id === qaId);
    setCodeModalDraft(item?.code || '');
    setCodeModalState({ projectId, qaId });
  };

  const closeCodeModal = () => {
    setCodeModalState(null);
    setCodeModalDraft('');
  };

  const saveCodeModal = () => {
    if (!codeModalState) return;
    const { projectId, qaId } = codeModalState;
    const draft = codeModalDraft;
    const updatedList = projectList.map((project) => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        qa: project.qa.map((item) => (item.id === qaId ? { ...item, code: draft } : item))
      };
    });
    setProjectList(updatedList);
    closeCodeModal();
    queueQaAutoSave(projectId, updatedList);
  };

  useEffect(() => {
    let isCancelled = false;
    const loadProjectQa = async () => {
      try {
        const response = await fetchProjectIntroQa();
        if (isCancelled) return;
        if (response?.success && response.qaMap) {
          setProjectList((prev) => mergeQaMapToProjects(prev, response.qaMap));
        }
      } catch (error) {
        console.warn('加载项目问答失败:', error);
      }
    };

    loadProjectQa();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pendingQuestionFocus) return;
    const key = `${pendingQuestionFocus.projectId}:${pendingQuestionFocus.qaId}`;
    const input = qaQuestionInputRefs.current[key];
    if (!input) return;
    input.focus();
    input.select();
    setPendingQuestionFocus(null);
  }, [pendingQuestionFocus, editingProjectIds, activeQaEditorMap, projectList]);

  const persistProjectQa = async (projectListSnapshot = projectList) => {
    const qaMap = projectListSnapshot.reduce((result, project) => {
      result[project.id] = project.qa;
      return result;
    }, {});
    const response = await saveProjectIntroQa(qaMap);
    return Boolean(response?.success);
  };

  const toggleProjectCard = (projectId) => {
    setExpandedProjectId((prev) => {
      const next = prev === projectId ? null : projectId;
      try { localStorage.setItem('projectIntro_expandedId', JSON.stringify(next)); } catch {}
      return next;
    });
    setExpandedQaGroupKey(null);
    setOpenAnswerId(null);
  };

  const isQaGroupExpanded = (projectId, actionIndex) => {
    const key = getQaGroupKey(projectId, actionIndex);
    return expandedQaGroupKey === key;
  };

  const toggleQaGroup = (projectId, actionIndex) => {
    const key = getQaGroupKey(projectId, actionIndex);
    setExpandedQaGroupKey((prev) => prev === key ? null : key);
    setOpenAnswerId(null);
  };

  const saveProjectQaForId = async (projectId, options = {}) => {
    const {
      silent = false,
      projectListSnapshot = projectList
    } = options;
    try {
      setSavingProjectIds((prev) => (
        prev.includes(projectId) ? prev : [...prev, projectId]
      ));
      const saved = await persistProjectQa(projectListSnapshot);
      if (!saved) {
        if (!silent) {
          alert('保存失败，请检查后端服务是否已启动。');
        }
        return false;
      }
      setQaAutoSaveErrorMap((prev) => {
        if (!prev[projectId]) return prev;
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      return true;
    } catch (error) {
      console.error('保存项目问答失败:', error);
      if (!silent) {
        alert('保存失败，请检查后端服务日志。');
      }
      return false;
    } finally {
      setSavingProjectIds((prev) => prev.filter((id) => id !== projectId));
    }
  };

  const clearQaDragState = () => {
    qaDragMetaRef.current = null;
    setDraggingQaId(null);
    setDragOverTargetKey(null);
    setDragOverActionIndex(null);
  };

  const queueQaAutoSave = async (projectId, projectListSnapshot) => {
    const queue = qaAutoSaveQueueRef.current[projectId] || {
      inFlight: false,
      pending: false,
      latestProjectList: null
    };
    queue.latestProjectList = projectListSnapshot;
    qaAutoSaveQueueRef.current[projectId] = queue;

    if (queue.inFlight) {
      queue.pending = true;
      return;
    }

    queue.inFlight = true;
    do {
      queue.pending = false;
      const saved = await saveProjectQaForId(projectId, {
        silent: true,
        projectListSnapshot: queue.latestProjectList || projectListSnapshot
      });
      if (!saved) {
        setQaAutoSaveErrorMap((prev) => ({
          ...prev,
          [projectId]: '自动保存失败，请重试'
        }));
      }
    } while (queue.pending);
    queue.inFlight = false;
  };

  const markQaDropTarget = (projectId, actionIndex, qaId = '__end__') => {
    const nextTargetKey = getQaDropTargetKey(projectId, actionIndex, qaId);
    setDragOverTargetKey((prev) => (prev === nextTargetKey ? prev : nextTargetKey));
    setDragOverActionIndex((prev) => (prev === actionIndex ? prev : actionIndex));
  };

  const handleQaDragStart = (event, project, item, qaIndex) => {
    const actionIndex = getSafeActionIndex(item.actionIndex, qaIndex, project.actions.length);
    qaDragMetaRef.current = {
      projectId: project.id,
      qaId: item.id,
      sourceActionIndex: actionIndex
    };
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id);
    setDraggingQaId(item.id);
    setDragOverTargetKey(null);
    setDragOverActionIndex(actionIndex);
  };

  const handleQaDragEnd = () => {
    clearQaDragState();
  };

  const handleQaItemDragEnter = (event, projectId, actionIndex, qaId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    markQaDropTarget(projectId, actionIndex, qaId);
  };

  const handleQaItemDragOver = (event, projectId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  };

  const applyQaDrop = (projectId, dropMeta) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) {
      clearQaDragState();
      return;
    }

    let nextProjectList = null;
    let hasChanged = false;
    setProjectList((prev) => {
      nextProjectList = prev.map((project) => {
        if (project.id !== projectId) return project;
        const reorderedProject = reorderProjectQa(project, dragMeta, dropMeta);
        if (reorderedProject !== project) {
          hasChanged = true;
        }
        return reorderedProject;
      });
      return hasChanged && nextProjectList ? nextProjectList : prev;
    });

    setExpandedQaGroupKey(getQaGroupKey(projectId, dropMeta.targetActionIndex));
    clearQaDragState();

    if (hasChanged && nextProjectList) {
      queueQaAutoSave(projectId, nextProjectList);
    }
  };

  const handleQaItemDrop = (event, projectId, actionIndex, qaId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    applyQaDrop(projectId, {
      targetActionIndex: actionIndex,
      targetQaId: qaId,
      position: 'before'
    });
  };

  const handleQaGroupTailDragEnter = (event, projectId, actionIndex) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    markQaDropTarget(projectId, actionIndex);
  };

  const handleQaGroupTailDragOver = (event, projectId) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleQaGroupTailDrop = (event, projectId, actionIndex) => {
    const dragMeta = qaDragMetaRef.current;
    if (!dragMeta || dragMeta.projectId !== projectId) return;
    event.preventDefault();
    event.stopPropagation();
    applyQaDrop(projectId, {
      targetActionIndex: actionIndex,
      targetQaId: null,
      position: 'end'
    });
  };

  const toggleQaManage = async (projectId) => {
    const isManaging = editingProjectIds.includes(projectId);
    if (isManaging) {
      const saved = await saveProjectQaForId(projectId);
      if (!saved) {
        return;
      }
    }

    setEditingProjectIds((prev) => (
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    ));

    if (isManaging) {
      setActiveQaEditorMap((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      clearQaDragState();
    }
  };

  const updateQaField = (projectId, qaId, field, value) => {
    setProjectList((prev) => prev.map((project) => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        qa: project.qa.map((item) => (
          item.id === qaId ? { ...item, [field]: value } : item
        ))
      };
    }));
  };

  const addQaItem = (projectId) => {
    let newItemId = '';
    setProjectList((prev) => prev.map((project) => {
      if (project.id !== projectId) return project;
      const newItem = createQaItem(project.actions.length > 0 ? 0 : -1);
      newItemId = newItem.id;
      return {
        ...project,
        qa: [...project.qa, newItem]
      };
    }));
    return newItemId;
  };

  const removeQaItem = (projectId, qaId) => {
    setProjectList((prev) => prev.map((project) => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        qa: project.qa.filter((item) => item.id !== qaId)
      };
    }));
    setActiveQaEditorMap((prev) => {
      if (prev[projectId] !== qaId) return prev;
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  };

  const addQaFromDisplay = (projectId) => {
    setEditingProjectIds((prev) => (
      prev.includes(projectId) ? prev : [...prev, projectId]
    ));
    const newQaId = addQaItem(projectId);
    const targetProject = projectList.find((project) => project.id === projectId);
    const defaultActionIndex = targetProject && targetProject.actions.length > 0 ? 0 : -1;
    setExpandedQaGroupKey(getQaGroupKey(projectId, defaultActionIndex));
    setActiveQaEditorMap((prev) => ({
      ...prev,
      [projectId]: newQaId
    }));
  };

  const addQaWhileManaging = (projectId) => {
    const newQaId = addQaItem(projectId);
    const targetProject = projectList.find((project) => project.id === projectId);
    const defaultActionIndex = targetProject && targetProject.actions.length > 0 ? 0 : -1;
    setExpandedQaGroupKey(getQaGroupKey(projectId, defaultActionIndex));
    setActiveQaEditorMap((prev) => ({
      ...prev,
      [projectId]: newQaId
    }));
  };

  const openQaInlineEditor = (projectId, qaId, focusQuestion = false) => {
    const targetProject = projectList.find((project) => project.id === projectId);
    if (targetProject) {
      const qaIndex = targetProject.qa.findIndex((qaItem) => qaItem.id === qaId);
      if (qaIndex >= 0) {
        const actionIndex = getSafeActionIndex(
          targetProject.qa[qaIndex]?.actionIndex,
          qaIndex,
          targetProject.actions.length
        );
        setExpandedQaGroupKey(getQaGroupKey(projectId, actionIndex));
      }
    }

    setEditingProjectIds((prev) => (
      prev.includes(projectId) ? prev : [...prev, projectId]
    ));
    setActiveQaEditorMap((prev) => ({
      ...prev,
      [projectId]: qaId
    }));
    if (focusQuestion) {
      setPendingQuestionFocus({ projectId, qaId });
    }
  };

  const saveQaItem = async (projectId) => {
    await toggleQaManage(projectId);
  };

  const openReference = (reference) => {
    if (reference.type === 'file' && reference.path) {
      const params = new URLSearchParams({ file: reference.path });
      if (reference.line) params.set('line', String(reference.line));
      window.location.href = `webstorm://open?${params.toString()}`;
      return;
    }

    if (reference.type === 'web' && reference.url) {
      window.open(reference.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="project-intro-page">
      <header className="project-intro-header">
        <div>
          <h2>📌 项目介绍</h2>
          <p>项目按卡片展示，点击卡片可展开或收起详情。</p>
        </div>
      </header>

      <section className="project-card-list">
        {projectList.map((project) => {
          const isExpanded = expandedProjectId === project.id;
          const isManagingQa = editingProjectIds.includes(project.id);
          const isSavingQa = savingProjectIds.includes(project.id);
          const qaGroups = buildQaGroups(project);
          return (
            <article key={project.id} className={`project-card ${isExpanded ? 'is-expanded' : ''}`}>
              <button
                type="button"
                className="project-card-trigger"
                onClick={() => toggleProjectCard(project.id)}
                aria-expanded={isExpanded}
              >
                <div className="project-card-header-main">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tech-stack">
                    {project.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>
                <span className="project-card-toggle-text">
                  {isExpanded ? '收起详情' : '展开详情'}
                </span>
              </button>

              {isExpanded && (
                <div className="project-card-detail">
                  <section className="project-detail-block">
                    <h4>行动</h4>
                    <ol>
                      {project.actions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="project-detail-block">
                    <h4>成果</h4>
                    <ol>
                      {project.outcomes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="project-detail-block project-qa-block">
                    <div className="project-qa-header">
                      <div>
                        <h4>项目问答</h4>
                        <p className="project-qa-tip">
                          {isManagingQa
                            ? '问答已按行动分组，可折叠展开；拖拽手柄可调整顺序，点击卡片可编辑单条问答。'
                            : '问答已按行动分组，可折叠展开；将光标移到问题卡片上可显示答案。'}
                        </p>
                        {qaAutoSaveErrorMap[project.id] && (
                          <p className="project-qa-save-error">{qaAutoSaveErrorMap[project.id]}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="project-qa-manage-btn"
                        onClick={() => toggleQaManage(project.id)}
                        disabled={isSavingQa}
                      >
                        {isSavingQa ? '保存中...' : isManagingQa ? '完成编辑' : '管理问答'}
                      </button>
                    </div>

                    {project.qa.length === 0 ? (
                      <p className="project-qa-empty">暂无问答。</p>
                    ) : (
                      <div className="project-qa-group-list">
                        {qaGroups.map((group) => {
                          const groupKey = getQaGroupKey(project.id, group.actionIndex);
                          const expanded = isQaGroupExpanded(project.id, group.actionIndex);
                          const groupTailDropKey = getQaDropTargetKey(project.id, group.actionIndex);
                          return (
                            <section key={groupKey} className="project-qa-group">
                              <button
                                type="button"
                                className="project-qa-group-toggle"
                                onClick={() => toggleQaGroup(project.id, group.actionIndex)}
                                aria-expanded={expanded}
                              >
                                <span className="project-qa-group-index">
                                  {group.actionIndex >= 0 ? `行动 ${group.actionIndex + 1}` : '未分组'}
                                </span>
                                <span className="project-qa-group-title">{group.actionLabel}</span>
                                <span className="project-qa-group-count">{group.items.length} 条</span>
                                <span className="project-qa-group-arrow">{expanded ? '收起' : '展开'}</span>
                              </button>

                              {expanded && (
                                <div className="project-qa-group-body">
                                  {group.items.length === 0 ? (
                                    isManagingQa ? (
                                      <div
                                        className={`project-qa-group-dropzone ${dragOverTargetKey === groupTailDropKey ? 'is-drag-over' : ''}`}
                                        onDragEnter={(event) => handleQaGroupTailDragEnter(
                                          event,
                                          project.id,
                                          group.actionIndex
                                        )}
                                        onDragOver={(event) => handleQaGroupTailDragOver(event, project.id)}
                                        onDrop={(event) => handleQaGroupTailDrop(
                                          event,
                                          project.id,
                                          group.actionIndex
                                        )}
                                      >
                                        拖到这里放到本行动末尾
                                      </div>
                                    ) : (
                                      <p className="project-qa-group-empty">暂无问答。</p>
                                    )
                                  ) : (
                                    <div
                                      className="project-qa-list"
                                      onDragEnter={(event) => handleQaGroupTailDragEnter(
                                        event,
                                        project.id,
                                        group.actionIndex
                                      )}
                                      onDragOver={(event) => handleQaGroupTailDragOver(event, project.id)}
                                    >
                                      {group.items.map(({ item, qaIndex }, groupItemIndex) => {
                                        const isInlineEditing = isManagingQa
                                          && activeQaEditorMap[project.id] === item.id;
                                        const qaActionIndex = getSafeActionIndex(
                                          item.actionIndex,
                                          qaIndex,
                                          project.actions.length
                                        );
                                        const itemDropKey = getQaDropTargetKey(
                                          project.id,
                                          qaActionIndex,
                                          item.id
                                        );
                                        return (
                                          <article
                                            key={item.id}
                                            className={`project-qa-item ${isInlineEditing ? 'is-inline-editing' : ''} ${draggingQaId === item.id ? 'is-dragging' : ''} ${dragOverTargetKey === itemDropKey ? 'is-drag-over' : ''} ${!isManagingQa && openAnswerId === item.id ? 'is-answer-open' : ''}`}
                                            tabIndex={0}
                                            onClick={() => {
                                              if (!isManagingQa) return;
                                              openQaInlineEditor(project.id, item.id);
                                            }}
                                            onDragEnter={(event) => {
                                              if (!isManagingQa) return;
                                              handleQaItemDragEnter(event, project.id, qaActionIndex, item.id);
                                            }}
                                            onDragOver={(event) => {
                                              if (!isManagingQa) return;
                                              handleQaItemDragOver(event, project.id);
                                            }}
                                            onDrop={(event) => {
                                              if (!isManagingQa) return;
                                              handleQaItemDrop(event, project.id, qaActionIndex, item.id);
                                            }}
                                          >
                                            {isInlineEditing ? (
                                              <div className="project-qa-inline-editor">
                                                <div className="project-qa-editor-item-header">
                                                  <span>问答 #{groupItemIndex + 1}</span>
                                                  <div className="project-qa-editor-item-actions">
                                                    <button
                                                      type="button"
                                                      className="project-qa-save-btn"
                                                      onClick={(event) => {
                                                        event.stopPropagation();
                                                        saveQaItem(project.id);
                                                      }}
                                                      disabled={isSavingQa}
                                                    >
                                                      {isSavingQa ? '保存中...' : '保存'}
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="project-qa-delete-btn"
                                                      onClick={(event) => {
                                                        event.stopPropagation();
                                                        removeQaItem(project.id, item.id);
                                                      }}
                                                      disabled={isSavingQa}
                                                    >
                                                      删除
                                                    </button>
                                                  </div>
                                                </div>
                                                {project.actions.length > 0 && (
                                                  <div className="project-qa-field-row">
                                                    <label htmlFor={`qa-action-${item.id}`}>所属行动</label>
                                                    <select
                                                      id={`qa-action-${item.id}`}
                                                      className="project-qa-select"
                                                      value={qaActionIndex}
                                                      onChange={(event) => updateQaField(
                                                        project.id,
                                                        item.id,
                                                        'actionIndex',
                                                        Number(event.target.value)
                                                      )}
                                                    >
                                                      {project.actions.map((_, actionIndex) => (
                                                        <option
                                                          key={`${item.id}-action-${actionIndex}`}
                                                          value={actionIndex}
                                                        >
                                                          行动 {actionIndex + 1}
                                                        </option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                )}
                                                <input
                                                  type="text"
                                                  className="project-qa-input"
                                                  placeholder="请输入问题"
                                                  value={item.question}
                                                  ref={(node) => {
                                                    const key = `${project.id}:${item.id}`;
                                                    if (node) {
                                                      qaQuestionInputRefs.current[key] = node;
                                                    } else {
                                                      delete qaQuestionInputRefs.current[key];
                                                    }
                                                  }}
                                                  onChange={(event) => updateQaField(
                                                    project.id,
                                                    item.id,
                                                    'question',
                                                    event.target.value
                                                  )}
                                                />
                                                <textarea
                                                  className="project-qa-textarea"
                                                  rows={6}
                                                  placeholder="请输入答案"
                                                  value={item.answer}
                                                  onChange={(event) => updateQaField(
                                                    project.id,
                                                    item.id,
                                                    'answer',
                                                    event.target.value
                                                  )}
                                                />
                                              </div>
                                            ) : (
                                              <>
                                                <div className="project-qa-item-head">
                                                  <h5
                                                    className="project-qa-question"
                                                    onClick={(event) => {
                                                      event.stopPropagation();
                                                      if (isManagingQa) {
                                                        openQaInlineEditor(project.id, item.id, true);
                                                      } else {
                                                        setOpenAnswerId((prev) => prev === item.id ? null : item.id);
                                                      }
                                                    }}
                                                  >
                                                    {groupItemIndex + 1}. {item.question || '（未填写问题）'}
                                                  </h5>
                                                  {!isManagingQa && (
                                                    <div className="project-qa-item-btns">
                                                      <button
                                                        type="button"
                                                        className="project-qa-code-btn"
                                                        onClick={(event) => {
                                                          event.stopPropagation();
                                                          openCodeModal(project.id, item.id);
                                                        }}
                                                        title="查看 / 编辑代码示例"
                                                      >
                                                        代码
                                                      </button>
                                                      <button
                                                        type="button"
                                                        className="project-qa-edit-btn"
                                                        onClick={(event) => {
                                                          event.stopPropagation();
                                                          openQaInlineEditor(project.id, item.id);
                                                        }}
                                                        title="编辑此问答"
                                                      >
                                                        编辑
                                                      </button>
                                                    </div>
                                                  )}
                                                  {isManagingQa && (
                                                    <button
                                                      type="button"
                                                      className="project-qa-drag-handle"
                                                      draggable
                                                      onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                      }}
                                                      onDragStart={(event) => handleQaDragStart(
                                                        event,
                                                        project,
                                                        item,
                                                        qaIndex
                                                      )}
                                                      onDragEnd={handleQaDragEnd}
                                                      aria-label="拖拽调整问答顺序"
                                                      title="拖拽调整问答顺序"
                                                    >
                                                      ⋮⋮
                                                    </button>
                                                  )}
                                                </div>
                                                <div className="project-qa-answer">
                                                  <span className="project-qa-answer-label">答：</span>
                                                  <div className="project-qa-answer-markdown">
                                                    <QaAnswerMarkdownBoundary
                                                      content={typeof item.answer === 'string' && item.answer
                                                        ? item.answer.trim()
                                                        : '（未填写回答）'}
                                                    >
                                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {typeof item.answer === 'string' && item.answer
                                                          ? item.answer.trim()
                                                          : '（未填写回答）'}
                                                      </ReactMarkdown>
                                                    </QaAnswerMarkdownBoundary>
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                          </article>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {isManagingQa && group.items.length > 0 && (
                                    <div
                                      className={`project-qa-group-dropzone ${dragOverTargetKey === groupTailDropKey ? 'is-drag-over' : ''} ${dragOverActionIndex === group.actionIndex ? 'is-drag-over-action' : ''}`}
                                      onDragEnter={(event) => handleQaGroupTailDragEnter(
                                        event,
                                        project.id,
                                        group.actionIndex
                                      )}
                                      onDragOver={(event) => handleQaGroupTailDragOver(event, project.id)}
                                      onDrop={(event) => handleQaGroupTailDrop(
                                        event,
                                        project.id,
                                        group.actionIndex
                                      )}
                                    >
                                      拖到这里放到本行动末尾
                                    </div>
                                  )}
                                </div>
                              )}
                            </section>
                          );
                        })}
                      </div>
                    )}

                    {!isManagingQa && (
                      <div className="project-qa-display-actions">
                        <button
                          type="button"
                          className="project-qa-add-btn"
                          onClick={() => addQaFromDisplay(project.id)}
                          disabled={isSavingQa}
                        >
                          + 新增
                        </button>
                      </div>
                    )}

                    {isManagingQa && (
                      <div className="project-qa-editor-actions">
                        <button
                          type="button"
                          className="project-qa-add-btn"
                          onClick={() => addQaWhileManaging(project.id)}
                          disabled={isSavingQa}
                        >
                          + 新增问答
                        </button>
                        <button
                          type="button"
                          className="project-qa-save-btn"
                          onClick={() => toggleQaManage(project.id)}
                          disabled={isSavingQa}
                        >
                          {isSavingQa ? '保存中...' : '保存'}
                        </button>
                      </div>
                    )}
                  </section>

                  {Array.isArray(project.references) && project.references.length > 0 && (
                    <section className="project-detail-block project-reference-block">
                      <ul className="project-reference-list compact">
                        {project.references.map((reference) => (
                          <li key={reference.id} className="project-reference-item compact">
                            <button
                              type="button"
                              className="project-reference-open-btn"
                              title={reference.type === 'file' ? reference.path : reference.url}
                              onClick={() => openReference(reference)}
                            >
                              <span className="project-reference-title">{reference.title}</span>
                              <span className="project-reference-open-text">
                                {reference.type === 'file' ? '打开' : '网页'}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
      {codeModalState && (() => {
        const modalProject = projectList.find((p) => p.id === codeModalState.projectId);
        const modalItem = modalProject?.qa.find((q) => q.id === codeModalState.qaId);
        return (
          <div
            className="qa-code-modal-overlay"
            onClick={closeCodeModal}
          >
            <div
              className="qa-code-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="qa-code-modal-header">
                <div className="qa-code-modal-title-wrap">
                  <span className="qa-code-modal-label">代码示例</span>
                  <p className="qa-code-modal-question">{modalItem?.question || '（未填写问题）'}</p>
                </div>
                <button
                  type="button"
                  className="qa-code-modal-close"
                  onClick={closeCodeModal}
                  title="关闭"
                >
                  ✕
                </button>
              </div>
              <div className="qa-code-modal-body">
                <div className="qa-code-editor-bar">
                  <span className="qa-code-editor-dot" />
                  <span className="qa-code-editor-dot" />
                  <span className="qa-code-editor-dot" />
                  <span className="qa-code-editor-lang">JavaScript</span>
                </div>
                <div className="qa-code-editor-wrap">
                  <Editor
                    language="javascript"
                    theme="vs-dark"
                    value={codeModalDraft}
                    onChange={(value) => setCodeModalDraft(value ?? '')}
                    options={{
                      fontSize: 13.5,
                      lineHeight: 22,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      tabSize: 2,
                      renderLineHighlight: 'line',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
              <div className="qa-code-modal-footer">
                <button
                  type="button"
                  className="qa-code-modal-cancel"
                  onClick={closeCodeModal}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="qa-code-modal-save"
                  onClick={saveCodeModal}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProjectIntroPage;
