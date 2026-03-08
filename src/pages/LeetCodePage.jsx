import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useJudgeStore } from '../store/judgeStore';
import { shallow } from 'zustand/shallow';
import './LeetCodePage.css';

const LEETCODE_SELECTED_PROBLEM_KEY = 'js-oj:leetcodeSelectedProblemId';

const readSelectedProblemId = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LEETCODE_SELECTED_PROBLEM_KEY);
  } catch (err) {
    console.warn('读取 LeetCode 上次选题失败:', err);
    return null;
  }
};

const writeSelectedProblemId = (problemId) => {
  if (typeof window === 'undefined' || !problemId) return;
  try {
    window.localStorage.setItem(LEETCODE_SELECTED_PROBLEM_KEY, problemId);
  } catch (err) {
    console.warn('保存 LeetCode 上次选题失败:', err);
  }
};

const SECTION_ICONS = {
  哈希: '🔢',
  双指针: '🧩',
  滑动窗口: '🪟',
  子串: '🧵',
  普通数组: '🧱',
  矩阵: '🧮',
  链表: '🔗',
  二叉树: '🌲',
  图论: '🌍',
  回溯: '🎯',
  二分查找: '🔍',
  栈: '🗂️',
  堆: '⛰️',
  贪心算法: '💰',
  动态规划: '🧠',
  多维动态规划: '🧠',
  技巧: '✨'
};

const LEETCODE_SECTIONS = [
  {
    "title": "哈希",
    "problems": [
      {
        "id": "two-sum",
        "title": "两数之和",
        "url": "https://leetcode.cn/problems/two-sum"
      },
      {
        "id": "group-anagrams",
        "title": "字母异位词分组",
        "url": "https://leetcode.cn/problems/group-anagrams"
      },
      {
        "id": "longest-consecutive-sequence",
        "title": "最长连续序列",
        "url": "https://leetcode.cn/problems/longest-consecutive-sequence"
      }
    ]
  },
  {
    "title": "双指针",
    "problems": [
      {
        "id": "move-zeroes",
        "title": "移动零",
        "url": "https://leetcode.cn/problems/move-zeroes"
      },
      {
        "id": "container-with-most-water",
        "title": "盛最多水的容器",
        "url": "https://leetcode.cn/problems/container-with-most-water"
      },
      {
        "id": "3sum",
        "title": "三数之和",
        "url": "https://leetcode.cn/problems/3sum"
      },
      {
        "id": "trapping-rain-water",
        "title": "接雨水",
        "url": "https://leetcode.cn/problems/trapping-rain-water"
      }
    ]
  },
  {
    "title": "滑动窗口",
    "problems": [
      {
        "id": "longest-substring-without-repeating-characters",
        "title": "无重复字符的最长子串",
        "url": "https://leetcode.cn/problems/longest-substring-without-repeating-characters"
      },
      {
        "id": "find-all-anagrams-in-a-string",
        "title": "找到字符串中所有字母异位词",
        "url": "https://leetcode.cn/problems/find-all-anagrams-in-a-string"
      }
    ]
  },
  {
    "title": "子串",
    "problems": [
      {
        "id": "subarray-sum-equals-k",
        "title": "和为 K 的子数组",
        "url": "https://leetcode.cn/problems/subarray-sum-equals-k"
      },
      {
        "id": "sliding-window-maximum",
        "title": "滑动窗口最大值",
        "url": "https://leetcode.cn/problems/sliding-window-maximum"
      },
      {
        "id": "minimum-window-substring",
        "title": "最小覆盖子串",
        "url": "https://leetcode.cn/problems/minimum-window-substring"
      }
    ]
  },
  {
    "title": "普通数组",
    "problems": [
      {
        "id": "maximum-subarray",
        "title": "最大子数组和",
        "url": "https://leetcode.cn/problems/maximum-subarray"
      },
      {
        "id": "merge-intervals",
        "title": "合并区间",
        "url": "https://leetcode.cn/problems/merge-intervals"
      },
      {
        "id": "rotate-array",
        "title": "轮转数组",
        "url": "https://leetcode.cn/problems/rotate-array"
      },
      {
        "id": "product-of-array-except-self",
        "title": "除了自身以外数组的乘积",
        "url": "https://leetcode.cn/problems/product-of-array-except-self"
      },
      {
        "id": "first-missing-positive",
        "title": "缺失的第一个正数",
        "url": "https://leetcode.cn/problems/first-missing-positive"
      }
    ]
  },
  {
    "title": "矩阵",
    "problems": [
      {
        "id": "set-matrix-zeroes",
        "title": "矩阵置零",
        "url": "https://leetcode.cn/problems/set-matrix-zeroes"
      },
      {
        "id": "spiral-matrix",
        "title": "螺旋矩阵",
        "url": "https://leetcode.cn/problems/spiral-matrix"
      },
      {
        "id": "rotate-image",
        "title": "旋转图像",
        "url": "https://leetcode.cn/problems/rotate-image"
      },
      {
        "id": "search-a-2d-matrix-ii",
        "title": "搜索二维矩阵 II",
        "url": "https://leetcode.cn/problems/search-a-2d-matrix-ii"
      }
    ]
  },
  {
    "title": "链表",
    "problems": [
      {
        "id": "intersection-of-two-linked-lists",
        "title": "相交链表",
        "url": "https://leetcode.cn/problems/intersection-of-two-linked-lists"
      },
      {
        "id": "reverse-linked-list",
        "title": "反转链表",
        "url": "https://leetcode.cn/problems/reverse-linked-list"
      },
      {
        "id": "palindrome-linked-list",
        "title": "回文链表",
        "url": "https://leetcode.cn/problems/palindrome-linked-list"
      },
      {
        "id": "linked-list-cycle",
        "title": "环形链表",
        "url": "https://leetcode.cn/problems/linked-list-cycle"
      },
      {
        "id": "linked-list-cycle-ii",
        "title": "环形链表 II",
        "url": "https://leetcode.cn/problems/linked-list-cycle-ii"
      },
      {
        "id": "merge-two-sorted-lists",
        "title": "合并两个有序链表",
        "url": "https://leetcode.cn/problems/merge-two-sorted-lists"
      },
      {
        "id": "add-two-numbers",
        "title": "两数相加",
        "url": "https://leetcode.cn/problems/add-two-numbers"
      },
      {
        "id": "remove-nth-node-from-end-of-list",
        "title": "删除链表的倒数第 N 个结点",
        "url": "https://leetcode.cn/problems/remove-nth-node-from-end-of-list"
      },
      {
        "id": "swap-nodes-in-pairs",
        "title": "两两交换链表中的节点",
        "url": "https://leetcode.cn/problems/swap-nodes-in-pairs"
      },
      {
        "id": "reverse-nodes-in-k-group",
        "title": "K 个一组翻转链表",
        "url": "https://leetcode.cn/problems/reverse-nodes-in-k-group"
      },
      {
        "id": "copy-list-with-random-pointer",
        "title": "随机链表的复制",
        "url": "https://leetcode.cn/problems/copy-list-with-random-pointer"
      },
      {
        "id": "sort-list",
        "title": "排序链表",
        "url": "https://leetcode.cn/problems/sort-list"
      },
      {
        "id": "merge-k-sorted-lists",
        "title": "合并 K 个升序链表",
        "url": "https://leetcode.cn/problems/merge-k-sorted-lists"
      },
      {
        "id": "lru-cache",
        "title": "LRU 缓存",
        "url": "https://leetcode.cn/problems/lru-cache"
      }
    ]
  },
  {
    "title": "二叉树",
    "problems": [
      {
        "id": "binary-tree-inorder-traversal",
        "title": "二叉树的中序遍历",
        "url": "https://leetcode.cn/problems/binary-tree-inorder-traversal"
      },
      {
        "id": "maximum-depth-of-binary-tree",
        "title": "二叉树的最大深度",
        "url": "https://leetcode.cn/problems/maximum-depth-of-binary-tree"
      },
      {
        "id": "invert-binary-tree",
        "title": "翻转二叉树",
        "url": "https://leetcode.cn/problems/invert-binary-tree"
      },
      {
        "id": "symmetric-tree",
        "title": "对称二叉树",
        "url": "https://leetcode.cn/problems/symmetric-tree"
      },
      {
        "id": "diameter-of-binary-tree",
        "title": "二叉树的直径",
        "url": "https://leetcode.cn/problems/diameter-of-binary-tree"
      },
      {
        "id": "binary-tree-level-order-traversal",
        "title": "二叉树的层序遍历",
        "url": "https://leetcode.cn/problems/binary-tree-level-order-traversal"
      },
      {
        "id": "convert-sorted-array-to-binary-search-tree",
        "title": "将有序数组转换为二叉搜索树",
        "url": "https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree"
      },
      {
        "id": "validate-binary-search-tree",
        "title": "验证二叉搜索树",
        "url": "https://leetcode.cn/problems/validate-binary-search-tree"
      },
      {
        "id": "kth-smallest-element-in-a-bst",
        "title": "二叉搜索树中第 K 小的元素",
        "url": "https://leetcode.cn/problems/kth-smallest-element-in-a-bst"
      },
      {
        "id": "binary-tree-right-side-view",
        "title": "二叉树的右视图",
        "url": "https://leetcode.cn/problems/binary-tree-right-side-view"
      },
      {
        "id": "flatten-binary-tree-to-linked-list",
        "title": "二叉树展开为链表",
        "url": "https://leetcode.cn/problems/flatten-binary-tree-to-linked-list"
      },
      {
        "id": "construct-binary-tree-from-preorder-and-inorder-traversal",
        "title": "从前序与中序遍历序列构造二叉树",
        "url": "https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal"
      },
      {
        "id": "path-sum-iii",
        "title": "路径总和 III",
        "url": "https://leetcode.cn/problems/path-sum-iii"
      },
      {
        "id": "lowest-common-ancestor-of-a-binary-tree",
        "title": "二叉树的最近公共祖先",
        "url": "https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree"
      },
      {
        "id": "binary-tree-maximum-path-sum",
        "title": "二叉树中的最大路径和",
        "url": "https://leetcode.cn/problems/binary-tree-maximum-path-sum"
      }
    ]
  },
  {
    "title": "图论",
    "problems": [
      {
        "id": "number-of-islands",
        "title": "岛屿数量",
        "url": "https://leetcode.cn/problems/number-of-islands"
      },
      {
        "id": "rotting-oranges",
        "title": "腐烂的橘子",
        "url": "https://leetcode.cn/problems/rotting-oranges"
      },
      {
        "id": "course-schedule",
        "title": "课程表",
        "url": "https://leetcode.cn/problems/course-schedule"
      },
      {
        "id": "implement-trie-prefix-tree",
        "title": "实现 Trie (前缀树)",
        "url": "https://leetcode.cn/problems/implement-trie-prefix-tree"
      }
    ]
  },
  {
    "title": "回溯",
    "problems": [
      {
        "id": "permutations",
        "title": "全排列",
        "url": "https://leetcode.cn/problems/permutations"
      },
      {
        "id": "subsets",
        "title": "子集",
        "url": "https://leetcode.cn/problems/subsets"
      },
      {
        "id": "letter-combinations-of-a-phone-number",
        "title": "电话号码的字母组合",
        "url": "https://leetcode.cn/problems/letter-combinations-of-a-phone-number"
      },
      {
        "id": "combination-sum",
        "title": "组合总和",
        "url": "https://leetcode.cn/problems/combination-sum"
      },
      {
        "id": "generate-parentheses",
        "title": "括号生成",
        "url": "https://leetcode.cn/problems/generate-parentheses"
      },
      {
        "id": "word-search",
        "title": "单词搜索",
        "url": "https://leetcode.cn/problems/word-search"
      },
      {
        "id": "palindrome-partitioning",
        "title": "分割回文串",
        "url": "https://leetcode.cn/problems/palindrome-partitioning"
      },
      {
        "id": "n-queens",
        "title": "N 皇后",
        "url": "https://leetcode.cn/problems/n-queens"
      }
    ]
  },
  {
    "title": "二分查找",
    "problems": [
      {
        "id": "search-insert-position",
        "title": "搜索插入位置",
        "url": "https://leetcode.cn/problems/search-insert-position"
      },
      {
        "id": "search-a-2d-matrix",
        "title": "搜索二维矩阵",
        "url": "https://leetcode.cn/problems/search-a-2d-matrix"
      },
      {
        "id": "find-first-and-last-position-of-element-in-sorted-array",
        "title": "在排序数组中查找元素的第一个和最后一个位置",
        "url": "https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array"
      },
      {
        "id": "search-in-rotated-sorted-array",
        "title": "搜索旋转排序数组",
        "url": "https://leetcode.cn/problems/search-in-rotated-sorted-array"
      },
      {
        "id": "find-minimum-in-rotated-sorted-array",
        "title": "寻找旋转排序数组中的最小值",
        "url": "https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array"
      },
      {
        "id": "median-of-two-sorted-arrays",
        "title": "寻找两个正序数组的中位数",
        "url": "https://leetcode.cn/problems/median-of-two-sorted-arrays"
      }
    ]
  },
  {
    "title": "栈",
    "problems": [
      {
        "id": "valid-parentheses",
        "title": "有效的括号",
        "url": "https://leetcode.cn/problems/valid-parentheses"
      },
      {
        "id": "min-stack",
        "title": "最小栈",
        "url": "https://leetcode.cn/problems/min-stack"
      },
      {
        "id": "decode-string",
        "title": "字符串解码",
        "url": "https://leetcode.cn/problems/decode-string"
      },
      {
        "id": "daily-temperatures",
        "title": "每日温度",
        "url": "https://leetcode.cn/problems/daily-temperatures"
      },
      {
        "id": "largest-rectangle-in-histogram",
        "title": "柱状图中最大的矩形",
        "url": "https://leetcode.cn/problems/largest-rectangle-in-histogram"
      }
    ]
  },
  {
    "title": "堆",
    "problems": [
      {
        "id": "kth-largest-element-in-an-array",
        "title": "数组中的第K个最大元素",
        "url": "https://leetcode.cn/problems/kth-largest-element-in-an-array"
      },
      {
        "id": "top-k-frequent-elements",
        "title": "前 K 个高频元素",
        "url": "https://leetcode.cn/problems/top-k-frequent-elements"
      },
      {
        "id": "find-median-from-data-stream",
        "title": "数据流的中位数",
        "url": "https://leetcode.cn/problems/find-median-from-data-stream"
      }
    ]
  },
  {
    "title": "贪心算法",
    "problems": [
      {
        "id": "best-time-to-buy-and-sell-stock",
        "title": "买卖股票的最佳时机",
        "url": "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock"
      },
      {
        "id": "jump-game",
        "title": "跳跃游戏",
        "url": "https://leetcode.cn/problems/jump-game"
      },
      {
        "id": "jump-game-ii",
        "title": "跳跃游戏 II",
        "url": "https://leetcode.cn/problems/jump-game-ii"
      },
      {
        "id": "partition-labels",
        "title": "划分字母区间",
        "url": "https://leetcode.cn/problems/partition-labels"
      }
    ]
  },
  {
    "title": "动态规划",
    "problems": [
      {
        "id": "climbing-stairs",
        "title": "爬楼梯",
        "url": "https://leetcode.cn/problems/climbing-stairs"
      },
      {
        "id": "pascals-triangle",
        "title": "杨辉三角",
        "url": "https://leetcode.cn/problems/pascals-triangle"
      },
      {
        "id": "house-robber",
        "title": "打家劫舍",
        "url": "https://leetcode.cn/problems/house-robber"
      },
      {
        "id": "perfect-squares",
        "title": "完全平方数",
        "url": "https://leetcode.cn/problems/perfect-squares"
      },
      {
        "id": "coin-change",
        "title": "零钱兑换",
        "url": "https://leetcode.cn/problems/coin-change"
      },
      {
        "id": "word-break",
        "title": "单词拆分",
        "url": "https://leetcode.cn/problems/word-break"
      },
      {
        "id": "longest-increasing-subsequence",
        "title": "最长递增子序列",
        "url": "https://leetcode.cn/problems/longest-increasing-subsequence"
      },
      {
        "id": "maximum-product-subarray",
        "title": "乘积最大子数组",
        "url": "https://leetcode.cn/problems/maximum-product-subarray"
      },
      {
        "id": "partition-equal-subset-sum",
        "title": "分割等和子集",
        "url": "https://leetcode.cn/problems/partition-equal-subset-sum"
      },
      {
        "id": "longest-valid-parentheses",
        "title": "最长有效括号",
        "url": "https://leetcode.cn/problems/longest-valid-parentheses"
      }
    ]
  },
  {
    "title": "多维动态规划",
    "problems": [
      {
        "id": "unique-paths",
        "title": "不同路径",
        "url": "https://leetcode.cn/problems/unique-paths"
      },
      {
        "id": "minimum-path-sum",
        "title": "最小路径和",
        "url": "https://leetcode.cn/problems/minimum-path-sum"
      },
      {
        "id": "longest-palindromic-substring",
        "title": "最长回文子串",
        "url": "https://leetcode.cn/problems/longest-palindromic-substring"
      },
      {
        "id": "longest-common-subsequence",
        "title": "最长公共子序列",
        "url": "https://leetcode.cn/problems/longest-common-subsequence"
      },
      {
        "id": "edit-distance",
        "title": "编辑距离",
        "url": "https://leetcode.cn/problems/edit-distance"
      }
    ]
  },
  {
    "title": "技巧",
    "problems": [
      {
        "id": "single-number",
        "title": "只出现一次的数字",
        "url": "https://leetcode.cn/problems/single-number"
      },
      {
        "id": "majority-element",
        "title": "多数元素",
        "url": "https://leetcode.cn/problems/majority-element"
      },
      {
        "id": "sort-colors",
        "title": "颜色分类",
        "url": "https://leetcode.cn/problems/sort-colors"
      },
      {
        "id": "next-permutation",
        "title": "下一个排列",
        "url": "https://leetcode.cn/problems/next-permutation"
      },
      {
        "id": "find-the-duplicate-number",
        "title": "寻找重复数",
        "url": "https://leetcode.cn/problems/find-the-duplicate-number"
      }
    ]
  }
];

const attachStatus = (problem, queue) => {
  const entry = queue[problem.id];
  return {
    ...problem,
    isDone: Boolean(entry),
    isReviewed: Boolean(entry && entry.lastReviewedAt),
    lastReviewedAt: entry && entry.lastReviewedAt ? entry.lastReviewedAt : 0
  };
};

const SECTION_PRIORITY = ['链表', '二叉树', '动态规划', '回溯'];

const sortSectionsByPriority = (sections) => {
  const rankMap = new Map(SECTION_PRIORITY.map((title, index) => [title, index]));

  return [...sections].sort((left, right) => {
    const leftRank = rankMap.has(left.title) ? rankMap.get(left.title) : SECTION_PRIORITY.length;
    const rightRank = rankMap.has(right.title) ? rankMap.get(right.title) : SECTION_PRIORITY.length;
    return leftRank - rightRank;
  });
};

const SECTION_GUIDE = {
  链表: {
    method: '双指针 + 虚拟头结点',
    complexity: '时间 O(n)，空间 O(1)（若用哈希表则 O(n)）',
    steps: [
      '先定义每个指针职责（slow/fast/pre/curr），保证循环语义清晰。',
      '优先考虑虚拟头结点，减少头节点被删除或交换时的分支判断。',
      '每次循环只做一件事：移动指针或重连边，最后再统一返回结果。'
    ]
  },
  二叉树: {
    method: 'DFS / BFS + 递归边界管理',
    complexity: '时间 O(n)，空间 O(h) 或 O(n)（取决于递归栈/队列）',
    steps: [
      '先确认遍历方式：前中后序 DFS 还是层序 BFS。',
      '明确递归终止条件（空节点）与返回值含义（高度、路径和、是否有效等）。',
      '遇到路径类问题时，优先定义“子问题状态”再合并，避免重复计算。'
    ]
  },
  动态规划: {
    method: '状态定义 + 状态转移',
    complexity: '通常时间 O(n)~O(n^2)，空间 O(n)（可滚动优化）',
    steps: [
      '先定义 dp[i] 或 dp[i][j] 代表什么，确保语义可解释。',
      '写出转移方程，再确定遍历顺序（正序/倒序）。',
      '补齐初始化与边界，必要时做空间压缩。'
    ]
  },
  回溯: {
    method: '决策树搜索 + 剪枝',
    complexity: '指数级，依赖剪枝效果',
    steps: [
      '把问题抽象成“路径、选择列表、结束条件”。',
      '每层做选择、递归、撤销选择，保证状态可回滚。',
      '通过排序、去重条件、上界判断做剪枝，提高效率。'
    ]
  },
  哈希: {
    method: '哈希表换时间',
    complexity: '时间 O(n)，空间 O(n)',
    steps: [
      '先找是否存在“快速查找某值/频次”的需求。',
      '设计 key 的含义（值、前缀和、规范化字符串等）。',
      '注意冲突场景下的更新顺序，避免漏计或重复计数。'
    ]
  },
  双指针: {
    method: '左右指针或快慢指针',
    complexity: '通常时间 O(n)，空间 O(1)',
    steps: [
      '先确认指针移动规则，保证每步都缩小搜索空间。',
      '维护不变量（如窗口合法、左右界单调）。',
      '边界条件放在循环入口统一处理，减少分支。'
    ]
  },
  滑动窗口: {
    method: '窗口扩张 + 收缩',
    complexity: '时间 O(n)，空间 O(字符集或哈希容量)',
    steps: [
      '先定义窗口合法条件，再决定何时收缩左边界。',
      '用计数器维护窗口状态，避免每次重新扫描。',
      '更新答案的位置要统一（扩张后或收缩后）。'
    ]
  },
  子串: {
    method: '前缀和 / 窗口 / 哈希映射',
    complexity: '时间 O(n) 或 O(n log n)，空间 O(n)',
    steps: [
      '先看是否能转化为前缀和差值问题。',
      '若是覆盖/匹配类题目，优先用滑动窗口统计频次。',
      '记录最优区间时统一保存左右边界，避免 off-by-one。'
    ]
  },
  普通数组: {
    method: '遍历 + 贪心/前缀技巧',
    complexity: '时间 O(n)~O(n log n)，空间 O(1)~O(n)',
    steps: [
      '先判断是否需要排序；需要的话优先说明排序目的。',
      '维护局部最优量（当前和、区间边界、最小前缀等）。',
      '针对边界（空数组、单元素、重复值）补充保护逻辑。'
    ]
  },
  矩阵: {
    method: '行列映射 + 边界控制',
    complexity: '时间 O(mn)，空间 O(1)~O(m+n)',
    steps: [
      '先把二维坐标访问顺序写清楚（行优先/列优先/螺旋）。',
      '用方向数组或上下左右边界统一控制遍历。',
      '修改原矩阵时，注意先记录标记再批量更新。'
    ]
  },
  图论: {
    method: 'DFS/BFS/拓扑排序',
    complexity: '时间 O(V+E)，空间 O(V)',
    steps: [
      '先抽象节点和边，明确是连通性、最短层数还是有向依赖。',
      '连通块问题用 DFS/BFS，课程依赖类问题用拓扑排序。',
      '用 visited/indegree 防止重复访问和环导致死循环。'
    ]
  },
  二分查找: {
    method: '有序性 + 单调性二分',
    complexity: '时间 O(log n)，空间 O(1)',
    steps: [
      '先确认单调区间，再定义二分目标（第一个/最后一个/最小满足）。',
      '统一区间写法（左闭右闭或左闭右开），避免边界错误。',
      '循环结束后再做一次答案合法性校验。'
    ]
  },
  栈: {
    method: '单调栈 / 辅助栈',
    complexity: '时间 O(n)，空间 O(n)',
    steps: [
      '确认栈中存的是索引还是值，通常索引更通用。',
      '维护栈的单调性（递增/递减）并在弹栈时结算答案。',
      '补一个哨兵元素可减少收尾边界分支。'
    ]
  },
  堆: {
    method: '优先队列维护 TopK',
    complexity: '时间 O(n log k) 或 O(log n) 每次操作',
    steps: [
      '先确定用大根堆还是小根堆，堆顶代表当前关键值。',
      '流式数据场景优先用堆保持固定规模。',
      '操作完成后再统一取结果，减少中间排序次数。'
    ]
  },
  贪心算法: {
    method: '局部最优推进全局最优',
    complexity: '时间 O(n)~O(n log n)，空间 O(1)~O(n)',
    steps: [
      '先给出“贪心选择性质”，说明为什么当前决策最优。',
      '常配合排序或区间边界更新来保证单调推进。',
      '准备一个反例解释为什么其他策略会失败，增强说服力。'
    ]
  },
  多维动态规划: {
    method: '二维状态转移',
    complexity: '时间 O(mn)，空间 O(mn) 或 O(n)',
    steps: [
      '明确二维状态含义（路径、子串区间、序列前缀）。',
      '根据转移依赖关系决定遍历方向（行、列、对角线）。',
      '尽量压缩空间并保留必要历史状态。'
    ]
  },
  技巧: {
    method: '位运算 / 原地交换 / 数学性质',
    complexity: '时间 O(n)，空间 O(1) 为主',
    steps: [
      '先识别题目是否有固定套路（异或、投票法、抽屉原理等）。',
      '说明核心不变量或数学结论，避免只给结论不解释。',
      '实现上尽量原地处理，突出工程可落地性。'
    ]
  }
};

const DEFAULT_GUIDE = {
  method: '先澄清约束，再选择最稳定的线性或对数复杂度方案',
  complexity: '优先时间 O(n) / O(log n)，空间按题目约束折中',
  steps: [
    '先定义核心状态与不变量。',
    '再写主流程，最后补边界与复杂度说明。',
    '对关键分支给出为什么这样做的解释。'
  ]
};

const PROBLEM_CONTENT_OVERRIDES = {
  'linked-list-cycle': {
    pitch: [
      '我这题会用打标记法，核心就是给遍历过的节点做访问标记。',
      '从头节点开始一路往前走，每经过一个节点就把它标记为已访问（flag = true）。',
      '如果走到某个节点时发现它已经有标记，说明出现回访，这个节点就是入口。',
      '这个方案实现很直观，讲解时我会先画一圈节点路径帮助面试官快速理解。'
    ],
    idea: [
      '💡 这题的思路：打标记法',
      '非常直观，就像在路上做记号：',
      '一路往前走，每经过一个节点就给它打个标记（flag = true）。',
      '如果走到某个节点发现它已经有标记了，说明你绕回来了，它就是入口。'
    ]
  },
  'swap-nodes-in-pairs': {
    pitch: [
      '这道题的代码用的是递归思路，每次只处理当前的前两个节点，把它们反转，然后把原来的头节点（交换后变成了尾）的 next 指向递归处理剩余部分的结果，最后返回新的头节点。'
    ]
  },
  'convert-sorted-array-to-binary-search-tree': {
    ideaText: `🌟 关键理解（灵魂）
❓ BST 的中序遍历是什么？

👉 是一个 升序数组

而现在题目反过来了：

已知中序结果 → 还原 BST

🔥 那根节点应该选谁？

为了平衡：

必须选「中间元素」当根节点

因为这样左右数量最接近。`
  },
  'flatten-binary-tree-to-linked-list': {
    pitch: [
      '我会用前序遍历来做，整体思路比较直观。',
      '对每个节点，先把它的右子树暂存起来，然后把左子树整体挪到右边，同时把左指针置空。',
      '接着沿着当前节点的右指针一路走到链的末尾，把刚才暂存的右子树接上。',
      '最后继续递归处理右子树，保证后续节点按同样规则展开。',
      '这样每个节点在被处理时都已经放到正确位置，整体顺序正好符合前序遍历「根 → 左 → 右」。'
    ],
    ideaText: `在遍历过程中，把每个节点的左子树插入到右子树的位置，然后把原来的右子树接到左子树的最右节点上。
核心思路

对每个节点：

1️⃣ 先展开左子树
2️⃣ 再展开右子树
3️⃣ 把左子树插到右边
4️⃣ 找左子树最右节点
5️⃣ 接上原来的右子树`
  },
  'construct-binary-tree-from-preorder-and-inorder-traversal': {
    ideaText: `核心思路
利用两个性质：

前序遍历：第一个元素一定是当前子树的根节点
中序遍历：根节点把数组分成左右两半，左边是左子树，右边是右子树`
  },
  'path-sum-iii': {
    pitch: [
      '我用前缀和加哈希表来做。',
      '从根节点到当前节点维护一个累积和 curr，用哈希表记录当前路径上每个前缀和出现的次数。对于每个节点，我查询哈希表里有多少个前缀和等于 curr - targetSum，每一个都对应一条以当前节点结尾的合法路径。',
      'map.set(0, 1) 是为了处理路径从根节点开始的情况。',
      '递归完左右子树后要回溯，把当前节点的前缀和从哈希表里减掉，因为它只在当前这条根到叶的路径上有效，不能影响其他分支。',
      '时间复杂度 O(n)，空间复杂度 O(h)，h 是树的高度。'
    ],
    ideaText: `思路：前缀和 + 哈希表

关键观察
如果从根到当前节点的前缀和为 curr，从根到某个祖先节点的前缀和为 prev，那么这段路径的和就是 curr - prev。

如果 curr - prev === targetSum，说明从那个祖先节点之后到当前节点，存在一条满足条件的路径。

所以问题变成：在当前路径上，有多少个祖先节点的前缀和等于 curr - targetSum。`
  },
  'binary-tree-maximum-path-sum': {
    pitch: [
      '我用后序遍历来做，递归函数的语义是：返回以当前节点为起点，往下走能获得的最大路径和。',
      '对于每个节点，先拿到左右子树的最大贡献，如果是负数就取 0，意思是这条路不要了。',
      '然后分两种情况：路径在当前节点拐弯，值是左 + 当前 + 右，用来更新全局最大值；路径不拐弯，返回给父节点的是当前节点加上左右中较大的一侧，让父节点决定怎么用。',
      '之所以要区分这两种情况，是因为拐弯之后就没法再往上延伸了，所以拐弯的结果只能作为答案候选，不能作为返回值。',
      '时间复杂度 O(n)，空间复杂度 O(h)。'
    ],
    ideaText: `思路
每个节点有两种角色：

1) 拐弯：左 + 当前 + 右，作为答案候选更新全局最大值
2) 不拐弯：当前 + 左或右其中一侧，返回给父节点继续延伸

如果某侧子树贡献是负数，直接舍弃（取 0）。`
  },
  'lowest-common-ancestor-of-a-binary-tree': {
    pitch: [
      '我用后序遍历来做，递归函数的语义是：在当前子树里寻找 p 和 q，找到了就返回找到的节点，没找到返回 null。',
      '有两个 base case：节点为空返回 null；当前节点就是 p 或 q，直接返回自身，不用再往下找了。',
      '然后先递归处理左右子树，拿到左右的返回值。',
      '如果左右都不为 null，说明 p 和 q 分别藏在左右两侧，那当前节点就是它们的最近公共祖先，返回当前节点。',
      '如果只有一侧不为 null，说明 p 和 q 都在那一侧，把那侧的结果继续往上传就行。',
      '时间复杂度 O(n)，空间复杂度 O(h)，h 是树的高度。'
    ],
    ideaText: `思路：后序遍历（让每个节点向上汇报）

递归语义
在当前子树里找 p 和 q：
找到就返回对应节点，没找到返回 null。

三种情况
1) 左右各找到一个 → 当前节点就是答案
2) 只有左边找到 → 把左边结果往上传
3) 只有右边找到 → 把右边结果往上传

为什么是后序遍历？
因为要先拿到左右子树的结果，当前节点才能判断自己是不是最近公共祖先。

参考代码
var lowestCommonAncestor = function(root, p, q) {
    if (!root) return null;
    if (root === p || root === q) return root;

    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);

    if (left && right) return root;
    return left || right;
};`
  },
  'longest-valid-parentheses': {
    ideaText: `情况一：s[i-1] === '('  →  直接配对

  ...( )
     j i
  dp[i] = dp[i-2] + 2
  （把 i-2 之前已有的合法长度也拼上）


情况二：s[i-1] === ')'  →  跳过一段已匹配的，找更远的 '('

  ...(  [已匹配段]  )
   j               i
  j = i - dp[i-1] - 1   ← 跳过 i-1 结尾的那段有效括号

  如果 s[j] === '('：
    dp[i] = dp[i-1] + 2 + dp[j-1]
                    ↑         ↑
               当前这对    j 左边可能还有合法段`
  },
  'partition-equal-subset-sum': {
    ideaText: `这题本质是一个 0/1 背包问题。

两个子集和相等，意味着每个子集的和都是总和的一半：target = sum / 2。

问题转化为：能否从数组中选出若干数，使它们的和恰好等于 target。

dp[j] 表示能否凑出和为 j，最终看 dp[target] 是否为 true。`
  }
};

const FEATURED_PROBLEM_IDS = new Set([
  'maximum-depth-of-binary-tree',
  'convert-sorted-array-to-binary-search-tree',
  'binary-tree-maximum-path-sum',
  'partition-equal-subset-sum'
]);
const FORGETFUL_PROBLEM_IDS = new Set([
  'symmetric-tree',
  'diameter-of-binary-tree',
  'lowest-common-ancestor-of-a-binary-tree',
  'pascals-triangle',
  'copy-list-with-random-pointer',
  'flatten-binary-tree-to-linked-list'
]);
const RECITE_PROBLEM_IDS = new Set([
  'partition-equal-subset-sum'
]);
const PREREQ_PROBLEM_IDS = new Set([
  'swap-nodes-in-pairs'
]);
const SORT_MERGE_HINT_PROBLEM_IDS = new Set([
  'sort-list'
]);
const VERY_FORGETFUL_PROBLEM_IDS = new Set([
  'path-sum-iii'
]);

const buildInterviewPitch = (problem) => {
  const customContent = PROBLEM_CONTENT_OVERRIDES[problem.id];
  if (customContent && customContent.pitch) {
    return customContent.pitch;
  }
  const guide = SECTION_GUIDE[problem.sectionTitle] || DEFAULT_GUIDE;
  return [
    `我会先复述题意：这题是「${problem.title}」，目标是把输入结构在约束内高效处理。`,
    `我的主方案会选择「${guide.method}」，先保证正确性，再考虑代码可维护性。`,
    `落地时我会先处理边界条件，再写主流程，最后补充复杂度说明：${guide.complexity}。`,
    '如果面试官追问，我会给一个备选方案并说明为什么主方案更稳定。'
  ];
};

const buildIdeaSteps = (problem) => {
  const customContent = PROBLEM_CONTENT_OVERRIDES[problem.id];
  if (customContent && customContent.idea) {
    return customContent.idea;
  }
  const guide = SECTION_GUIDE[problem.sectionTitle] || DEFAULT_GUIDE;
  return [
    `先确认输入约束与输出格式，明确这题属于「${problem.sectionTitle}」常见模型。`,
    ...guide.steps,
    '最后用 1~2 个极端用例（空输入、最小规模、重复值）做自测。'
  ];
};

const buildIdeaContent = (problem) => {
  const customContent = PROBLEM_CONTENT_OVERRIDES[problem.id];
  if (customContent && customContent.ideaText) {
    return {
      type: 'text',
      text: customContent.ideaText
    };
  }

  return {
    type: 'list',
    lines: buildIdeaSteps(problem)
  };
};

const ProblemListItem = memo(function ProblemListItem({
  displayIndex,
  title,
  isDone,
  isReviewed,
  isActive,
  isFeatured,
  isForgetful,
  isRecite,
  isPrereq,
  isSortMergeHint,
  isVeryForgetful,
  onSelect
}) {
  return (
    <button
      type="button"
      className={'leetcode-list-item ' + (isActive ? 'active' : '')}
      onClick={onSelect}
    >
      <div className="leetcode-list-item-top">
        <div className="leetcode-list-meta">
          <span className="leetcode-list-number">#{displayIndex}</span>
          {isFeatured && <span className="leetcode-list-focus-tag">重点</span>}
          {isForgetful && <span className="leetcode-list-forget-tag">易忘</span>}
          {isRecite && <span className="leetcode-list-recite-tag">背诵</span>}
          {isPrereq && <span className="leetcode-list-prereq-tag">注意前置</span>}
          {isSortMergeHint && <span className="leetcode-list-sort-merge-tag">重点，先sort后merge</span>}
          {isVeryForgetful && <span className="leetcode-list-very-forget-tag">特别容易忘记</span>}
        </div>
        <div className="leetcode-list-flags">
          <span className={'leetcode-mini-chip ' + (isDone ? 'done-yes' : 'done-no')}>
            做过{isDone ? '✓' : '✕'}
          </span>
          <span className={'leetcode-mini-chip ' + (isReviewed ? 'review-yes' : 'review-no')}>
            复习{isReviewed ? '✓' : '✕'}
          </span>
        </div>
      </div>
      <div className="leetcode-list-title">{title}</div>
    </button>
  );
});

const LeetCodePage = () => {
  const [mode, setMode] = useState('practice');
  const [activeDetailTab, setActiveDetailTab] = useState('link');
  const [selectedProblemId, setSelectedProblemId] = useState(() => readSelectedProblemId());
  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    SECTION_PRIORITY.forEach((title) => {
      initial[title] = true;
    });
    return initial;
  });

  const {
    reviewQueue,
    addToReviewQueue,
    markReviewed,
    resetReviewed,
    removeFromReviewQueue
  } = useJudgeStore((state) => ({
    reviewQueue: state.reviewQueue,
    addToReviewQueue: state.addToReviewQueue,
    markReviewed: state.markReviewed,
    resetReviewed: state.resetReviewed,
    removeFromReviewQueue: state.removeFromReviewQueue
  }), shallow);

  const leetcodeQueue = reviewQueue && reviewQueue.leetcode ? reviewQueue.leetcode : {};
  const orderedSections = useMemo(() => sortSectionsByPriority(LEETCODE_SECTIONS), []);

  const stats = useMemo(() => {
    let done = 0;
    let reviewed = 0;
    let total = 0;

    LEETCODE_SECTIONS.forEach((section) => {
      section.problems.forEach((problem) => {
        total += 1;
        const entry = leetcodeQueue[problem.id];
        if (!entry) return;
        done += 1;
        if (entry.lastReviewedAt) reviewed += 1;
      });
    });

    return {
      total,
      sectionCount: LEETCODE_SECTIONS.length,
      done,
      reviewed,
      pendingReview: Math.max(0, done - reviewed)
    };
  }, [leetcodeQueue]);

  const visibleSections = useMemo(() => {
    if (mode === 'practice') {
      return orderedSections.map((section) => ({
        ...section,
        problems: section.problems.map((problem) => attachStatus(problem, leetcodeQueue))
      }));
    }

    return orderedSections.map((section) => ({
      ...section,
      problems: section.problems
        .map((problem) => attachStatus(problem, leetcodeQueue))
        .filter((problem) => problem.isDone)
        .sort((left, right) => {
          if (left.isReviewed !== right.isReviewed) {
            return left.isReviewed ? 1 : -1;
          }
          return left.lastReviewedAt - right.lastReviewedAt;
        })
    })).filter((section) => section.problems.length > 0);
  }, [mode, leetcodeQueue, orderedSections]);

  const flatVisibleProblems = useMemo(() => {
    const flattened = [];
    visibleSections.forEach((section) => {
      section.problems.forEach((problem) => {
        flattened.push({
          ...problem,
          sectionTitle: section.title
        });
      });
    });
    return flattened;
  }, [visibleSections]);

  const visibleCount = flatVisibleProblems.length;

  useEffect(() => {
    if (!selectedProblemId) return;
    writeSelectedProblemId(selectedProblemId);
  }, [selectedProblemId]);

  useEffect(() => {
    if (flatVisibleProblems.length === 0) {
      setSelectedProblemId(null);
      return;
    }

    const exists = flatVisibleProblems.some((problem) => problem.id === selectedProblemId);
    if (!exists) {
      setSelectedProblemId(flatVisibleProblems[0].id);
    }
  }, [flatVisibleProblems, selectedProblemId]);

  const selectedIndex = useMemo(
    () => flatVisibleProblems.findIndex((problem) => problem.id === selectedProblemId),
    [flatVisibleProblems, selectedProblemId]
  );

  const selectedProblem = selectedIndex >= 0 ? flatVisibleProblems[selectedIndex] : null;
  const isSelectedFeatured = selectedProblem && FEATURED_PROBLEM_IDS.has(selectedProblem.id);
  const isSelectedForgetful = selectedProblem && FORGETFUL_PROBLEM_IDS.has(selectedProblem.id);
  const isSelectedRecite = selectedProblem && RECITE_PROBLEM_IDS.has(selectedProblem.id);
  const isSelectedPrereq = selectedProblem && PREREQ_PROBLEM_IDS.has(selectedProblem.id);
  const isSelectedSortMergeHint = selectedProblem && SORT_MERGE_HINT_PROBLEM_IDS.has(selectedProblem.id);
  const isSelectedVeryForgetful = selectedProblem && VERY_FORGETFUL_PROBLEM_IDS.has(selectedProblem.id);
  const selectedPitch = useMemo(
    () => (selectedProblem ? buildInterviewPitch(selectedProblem) : []),
    [selectedProblem]
  );
  const selectedIdeaContent = useMemo(
    () => (selectedProblem ? buildIdeaContent(selectedProblem) : { type: 'list', lines: [] }),
    [selectedProblem]
  );

  const handleMarkDone = useCallback((id, title, url) => {
    addToReviewQueue('leetcode', {
      id,
      title,
      link: url
    });
  }, [addToReviewQueue]);

  const handleToggleReviewed = useCallback((id, isDone, isReviewed, title, url) => {
    if (isReviewed) {
      resetReviewed('leetcode', id);
      return;
    }

    if (!isDone) {
      handleMarkDone(id, title, url);
    }
    markReviewed('leetcode', id);
  }, [handleMarkDone, markReviewed, resetReviewed]);

  const handleMarkUndone = useCallback((id) => {
    removeFromReviewQueue('leetcode', id);
  }, [removeFromReviewQueue]);

  const toggleSectionExpand = useCallback((title) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  }, []);

  const handlePrevProblem = useCallback(() => {
    if (selectedIndex <= 0) return;
    setSelectedProblemId(flatVisibleProblems[selectedIndex - 1].id);
  }, [flatVisibleProblems, selectedIndex]);

  const handleNextProblem = useCallback(() => {
    if (selectedIndex < 0 || selectedIndex >= flatVisibleProblems.length - 1) return;
    setSelectedProblemId(flatVisibleProblems[selectedIndex + 1].id);
  }, [flatVisibleProblems, selectedIndex]);

  return (
    <div className="leetcode-page">
      <header className="leetcode-header-card">
        <div className="leetcode-header-main">
          <p className="leetcode-kicker">LeetCode Study Plan</p>
          <h2>✅ LeetCode 记录（Top 100）</h2>
          <p>题目均可直接跳转到 LeetCode 官方网站刷题，状态会保存在本地。</p>

          <div className="leetcode-mode-switch">
            <button
              className={'leetcode-mode-btn ' + (mode === 'practice' ? 'active' : '')}
              onClick={() => setMode('practice')}
            >
              刷题模式
            </button>
            <button
              className={'leetcode-mode-btn ' + (mode === 'review' ? 'active' : '')}
              onClick={() => setMode('review')}
            >
              复习模式
            </button>
          </div>
        </div>

        <div className="leetcode-header-tools">
          <div className="leetcode-stats">
            <div>
              <span className="leetcode-stat-num">{stats.total}</span>
              <span className="leetcode-stat-label">总题数</span>
            </div>
            <div>
              <span className="leetcode-stat-num">{stats.done}</span>
              <span className="leetcode-stat-label">已做过</span>
            </div>
            <div>
              <span className="leetcode-stat-num">{stats.reviewed}</span>
              <span className="leetcode-stat-label">已复习</span>
            </div>
            <div>
              <span className="leetcode-stat-num">{stats.pendingReview}</span>
              <span className="leetcode-stat-label">待复习</span>
            </div>
            <div>
              <span className="leetcode-stat-num">{stats.sectionCount}</span>
              <span className="leetcode-stat-label">专题数</span>
            </div>
            <div>
              <span className="leetcode-stat-num">{visibleCount}</span>
              <span className="leetcode-stat-label">当前展示</span>
            </div>
          </div>

          <div className="leetcode-review-hint">
            {mode === 'practice'
              ? '刷题模式：展示全部 100 题，你可以逐题标记做题和复习状态。'
              : '复习模式：仅展示已做过题目，未复习题默认靠前，便于按批次复习。'}
          </div>

          <a href="https://leetcode.cn/studyplan/top-100-liked/" target="_blank" rel="noreferrer" className="leetcode-plan-link">
            打开官方题单
          </a>
        </div>
      </header>

      {visibleSections.length === 0 ? (
        <section className="leetcode-empty">
          <h3>{mode === 'review' ? '还没有可复习题目' : '暂无题目'}</h3>
          <p>
            {mode === 'review'
              ? '先在刷题模式把做过的题标记为「已做过」，这里就会自动出现。'
              : '题单数据加载异常，请刷新页面重试。'}
          </p>
        </section>
      ) : (
        <div className="leetcode-layout">
          <aside className="leetcode-sidebar">
            <div className="leetcode-sidebar-title">题目列表</div>
            <div className="leetcode-categories">
              {visibleSections.map((section) => (
                <section className="leetcode-category-section" key={section.title}>
                  <button
                    type="button"
                    className="leetcode-category-header"
                    onClick={() => toggleSectionExpand(section.title)}
                  >
                    <div className="leetcode-category-title">
                      <span>{SECTION_ICONS[section.title] || '📘'}</span>
                      <span>{section.title}</span>
                    </div>
                    <div className="leetcode-category-right">
                      <span>{section.problems.length} 题</span>
                      <span className={'leetcode-category-arrow ' + (expandedSections[section.title] ? 'expanded' : '')}>▼</span>
                    </div>
                  </button>

                  {expandedSections[section.title] && (
                    <div className="leetcode-items">
                      {section.problems.map((problem, index) => (
                        <ProblemListItem
                          key={problem.id}
                          displayIndex={index + 1}
                          title={problem.title}
                          isDone={problem.isDone}
                          isReviewed={problem.isReviewed}
                          isActive={problem.id === selectedProblemId}
                          isFeatured={FEATURED_PROBLEM_IDS.has(problem.id)}
                          isForgetful={FORGETFUL_PROBLEM_IDS.has(problem.id)}
                          isRecite={RECITE_PROBLEM_IDS.has(problem.id)}
                          isPrereq={PREREQ_PROBLEM_IDS.has(problem.id)}
                          isSortMergeHint={SORT_MERGE_HINT_PROBLEM_IDS.has(problem.id)}
                          isVeryForgetful={VERY_FORGETFUL_PROBLEM_IDS.has(problem.id)}
                          onSelect={() => setSelectedProblemId(problem.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </aside>

          <main className="leetcode-main">
            {selectedProblem && (
              <>
                <div className="leetcode-main-header">
                  <div>
                    <h3>{selectedProblem.title}</h3>
                    {isSelectedFeatured && <span className="leetcode-main-featured-tag">重点题</span>}
                    {isSelectedForgetful && <span className="leetcode-main-forgetful-tag">易忘题</span>}
                    {isSelectedRecite && <span className="leetcode-main-recite-tag">背诵题</span>}
                    {isSelectedPrereq && <span className="leetcode-main-prereq-tag">注意前置</span>}
                    {isSelectedSortMergeHint && <span className="leetcode-main-sort-merge-tag">重点，先sort后merge</span>}
                    {isSelectedVeryForgetful && <span className="leetcode-main-very-forgetful-tag">特别容易忘记</span>}
                  </div>
                  <span className="leetcode-main-category">
                    {SECTION_ICONS[selectedProblem.sectionTitle] || '📘'} {selectedProblem.sectionTitle}
                  </span>
                </div>

                <div className="leetcode-detail-tabs">
                  <button
                    type="button"
                    className={'leetcode-detail-tab ' + (activeDetailTab === 'link' ? 'active' : '')}
                    onClick={() => setActiveDetailTab('link')}
                  >
                    题目链接
                  </button>
                  <button
                    type="button"
                    className={'leetcode-detail-tab ' + (activeDetailTab === 'pitch' ? 'active' : '')}
                    onClick={() => setActiveDetailTab('pitch')}
                  >
                    面试话术
                  </button>
                  <button
                    type="button"
                    className={'leetcode-detail-tab ' + (activeDetailTab === 'idea' ? 'active' : '')}
                    onClick={() => setActiveDetailTab('idea')}
                  >
                    思路
                  </button>
                </div>

                <div className="leetcode-main-card">
                  {activeDetailTab === 'link' && (
                    <>
                      <div className="leetcode-main-label">题目链接</div>
                      <a
                        href={selectedProblem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="leetcode-problem-link"
                      >
                        {selectedProblem.url}
                      </a>
                    </>
                  )}

                  {activeDetailTab === 'pitch' && (
                    <>
                      <div className="leetcode-main-label">面试话术</div>
                      <ul className="leetcode-rich-list">
                        {selectedPitch.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {activeDetailTab === 'idea' && (
                    <>
                      <div className="leetcode-main-label">思路</div>
                      {selectedIdeaContent.type === 'text' ? (
                        <div className="leetcode-rich-text">{selectedIdeaContent.text}</div>
                      ) : (
                        <ol className="leetcode-rich-list ordered">
                          {selectedIdeaContent.lines.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ol>
                      )}
                    </>
                  )}
                </div>

                <div className="leetcode-main-card leetcode-status-panel">
                  <div className="leetcode-main-label">当前状态</div>
                  <div className="leetcode-status-grid">
                    <div className={'leetcode-status-item ' + (selectedProblem.isDone ? 'is-yes' : 'is-no')}>
                      <span className="leetcode-status-item-key">是否做过</span>
                      <span className="leetcode-status-item-value">{selectedProblem.isDone ? '已完成' : '未完成'}</span>
                    </div>
                    <div className={'leetcode-status-item ' + (selectedProblem.isReviewed ? 'is-reviewed' : 'is-unreviewed')}>
                      <span className="leetcode-status-item-key">是否复习过</span>
                      <span className="leetcode-status-item-value">{selectedProblem.isReviewed ? '已复习' : '待复习'}</span>
                    </div>
                  </div>

                  <div className="leetcode-main-actions leetcode-main-actions-inline">
                    {!selectedProblem.isDone ? (
                      <button
                        className="leetcode-op-btn primary"
                        onClick={() => handleMarkDone(selectedProblem.id, selectedProblem.title, selectedProblem.url)}
                      >
                        标记做过
                      </button>
                    ) : (
                      <>
                        <button
                          className={'leetcode-op-btn ' + (selectedProblem.isReviewed ? 'neutral' : 'success')}
                          onClick={() => handleToggleReviewed(
                            selectedProblem.id,
                            selectedProblem.isDone,
                            selectedProblem.isReviewed,
                            selectedProblem.title,
                            selectedProblem.url
                          )}
                        >
                          {selectedProblem.isReviewed ? '取消复习标记' : '标记已复习'}
                        </button>
                        <button
                          className="leetcode-op-btn danger"
                          onClick={() => handleMarkUndone(selectedProblem.id)}
                        >
                          标记未做
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="leetcode-main-nav">
                  <button
                    className="leetcode-op-btn"
                    onClick={handlePrevProblem}
                    disabled={selectedIndex <= 0}
                  >
                    ← 上一题
                  </button>
                  <span className="leetcode-main-progress">
                    {selectedIndex + 1} / {flatVisibleProblems.length}
                  </span>
                  <button
                    className="leetcode-op-btn"
                    onClick={handleNextProblem}
                    disabled={selectedIndex >= flatVisibleProblems.length - 1}
                  >
                    下一题 →
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default LeetCodePage;
