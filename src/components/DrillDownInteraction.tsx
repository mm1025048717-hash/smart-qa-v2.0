/**
 * 下钻交互组件 - 丝滑动画，顶级UI/UX
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

interface DrillDownProps {
  title: string;
  data: any;
  onDrillDown?: (item: any) => void;
  onBack?: () => void;
  level?: number;
}

/**
 * 表格行下钻交互
 */
export const TableRowDrillDown = ({ 
  rowData, 
  onDrillDown 
}: { 
  rowData: any; 
  onDrillDown?: (data: any) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.tr
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
      onClick={() => onDrillDown?.(rowData)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-0 bottom-0 flex items-center px-2"
          >
            <div className="w-1 h-8 bg-[#007AFF] rounded-r-full" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.td
        className="relative"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <span>{rowData.content}</span>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-[#007AFF]" />
          </motion.div>
        </div>
      </motion.td>
    </motion.tr>
  );
};

/**
 * 图表数据点下钻交互
 */
export const ChartPointDrillDown = ({
  x,
  y,
  payload,
  onDrillDown,
}: {
  x?: number;
  y?: number;
  payload?: any;
  onDrillDown?: (data: any) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!x || !y) return null;

  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={isHovered ? 6 : 4}
        fill="#007AFF"
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onDrillDown?.(payload)}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      />
      <AnimatePresence>
        {isHovered && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.circle
              cx={x}
              cy={y}
              r={8}
              fill="#007AFF"
              opacity={0.2}
              animate={{ r: [8, 12, 8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
};

/**
 * 下钻面板 - 丝滑动画
 */
export const DrillDownPanel = ({
  title,
  data,
  onBack,
  level = 0,
}: DrillDownProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="mt-4 bg-white rounded-xl border border-[#E5E5EA] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#007AFF]" />
            </motion.button>
          )}
          <h4 className="font-semibold text-[#1d1d1f] text-[15px]">{title}</h4>
        </div>
        {level > 0 && (
          <span className="text-[12px] text-[#86868b]">层级 {level + 1}</span>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {data}
      </motion.div>
    </motion.div>
  );
};

/**
 * 下钻按钮 - 优雅的交互提示
 */
export const DrillDownButton = ({
  label,
  onClick,
  variant = 'default',
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'subtle';
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all",
        variant === 'default'
          ? "bg-[#007AFF] text-white hover:bg-[#0051D5]"
          : "bg-[#F5F5F7] text-[#007AFF] hover:bg-[#E5E5EA]"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>{label}</span>
      <motion.div
        animate={{ x: isHovered ? 4 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight className="w-4 h-4" />
      </motion.div>
    </motion.button>
  );
};








