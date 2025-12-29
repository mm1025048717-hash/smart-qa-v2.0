/**
 * 推荐区域组件
 * 支持折叠/展开、隐藏功能
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, EyeOff } from 'lucide-react';
import { RecommendationItem } from '../services/recommendationEngine';

interface RecommendationSectionProps {
  recommendations: RecommendationItem[];
  onActionSelect?: (query: string) => void;
  defaultExpanded?: boolean;
}

// 用户偏好管理
const getUserPreference = (key: string, defaultValue: any = null): any => {
  try {
    const preferences = JSON.parse(
      localStorage.getItem('smart-qa-user-preferences') || '{}'
    );
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const saveUserPreference = (key: string, value: any): void => {
  try {
    const preferences = JSON.parse(
      localStorage.getItem('smart-qa-user-preferences') || '{}'
    );
    preferences[key] = value;
    localStorage.setItem('smart-qa-user-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save user preference:', error);
  }
};

export const RecommendationSection = ({ 
  recommendations,
  onActionSelect,
  defaultExpanded = false
}: RecommendationSectionProps) => {
  // 从用户偏好读取显示状态
  const [isVisible, setIsVisible] = useState(() => {
    return getUserPreference('showRecommendations', true);
  });
  
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isPersisted, setIsPersisted] = useState(() => {
    return getUserPreference('showRecommendationsPersisted', false);
  });
  
  // 如果用户永久隐藏，不显示
  if (!isVisible && isPersisted) {
    return null;
  }
  
  // 如果推荐数量少于2个，直接显示，不折叠
  if (recommendations.length <= 2 && isVisible) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA] p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-[#007AFF] rounded-full"></span>
            <span className="text-[13px] font-medium text-[#1d1d1f]">推荐问题</span>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setIsPersisted(true);
              saveUserPreference('showRecommendations', false);
              saveUserPreference('showRecommendationsPersisted', true);
            }}
            className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors flex items-center gap-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>不再显示</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => onActionSelect?.(rec.query)}
              className="px-4 py-2 text-[13px] text-[#007AFF] bg-white rounded-lg border border-[#E5E5EA] hover:border-[#007AFF] hover:bg-[#F5F9FF] transition-all"
            >
              {rec.label}
            </button>
          ))}
        </div>
      </motion.div>
    );
  }
  
  // 如果不可见，显示展开按钮
  if (!isVisible && !isPersisted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4"
      >
        <button
          onClick={() => {
            setIsVisible(true);
            setIsExpanded(true);
            saveUserPreference('showRecommendations', true);
          }}
          className="w-full px-4 py-3 text-[13px] text-[#007AFF] bg-[#F5F5F7] rounded-lg border border-dashed border-[#E5E5EA] hover:border-[#007AFF] hover:bg-[#F5F9FF] transition-all flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          <span>显示推荐问题</span>
        </button>
      </motion.div>
    );
  }
  
  // 推荐数量较多时，默认折叠
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA] overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer hover:bg-[#EBEBED] transition-colors flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-[#007AFF] rounded-full"></span>
          <span className="text-[13px] font-medium text-[#1d1d1f]">
            推荐问题 ({recommendations.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              saveUserPreference('showRecommendations', false);
            }}
            className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            隐藏
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setIsPersisted(true);
              saveUserPreference('showRecommendations', false);
              saveUserPreference('showRecommendationsPersisted', true);
            }}
            className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors flex items-center gap-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>不再显示</span>
          </button>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[#86868b]" />
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {recommendations.map((rec, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onActionSelect?.(rec.query)}
                  className="px-4 py-2 text-[13px] text-[#007AFF] bg-white rounded-lg border border-[#E5E5EA] hover:border-[#007AFF] hover:bg-[#F5F9FF] transition-all"
                >
                  {rec.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

