// 覆盖 react-grid-layout 的类型定义
declare module 'react-grid-layout' {
  import * as React from 'react';

  export interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
  }

  export type Layout = LayoutItem[];

  export interface GridLayoutProps {
    className?: string;
    layout?: Layout;
    cols?: number;
    rowHeight?: number;
    width?: number;
    onLayoutChange?: (layout: Layout) => void;
    isDraggable?: boolean;
    isResizable?: boolean;
    draggableCancel?: string;
    draggableHandle?: string;
    margin?: [number, number];
    containerPadding?: [number, number];
    useCSSTransforms?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
    preventCollision?: boolean;
    isDroppable?: boolean;
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
    children?: React.ReactNode;
  }

  export default class GridLayout extends React.Component<GridLayoutProps> {}
}

